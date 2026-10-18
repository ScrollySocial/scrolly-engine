"""Plan wireframes for the physical pack (2026-10-18): Mercedes asked to see every template that isn't done as a rough
plan, all on one page, so she can pick. Each template is a small spec in build/wireframe_specs.py (its world and 5 to 6
beats); this file renders each beat as a rough panel from her real images (cut-outs from the rembg model, her doodles,
her patterns, a footage still where the clip goes) and builds the review page with a notes box, Approve and Maybe.

A panel spec (all positions on the 1080 x 1920 frame):
  bg:     [('img', folder, file, box) | ('pat', doodle_file, dark, light, box) | ('fill', rgb, box)]
  open:   [('rect'|'circle'|'round'|'grey', box, clip) | ('screen', folder, file, center, width, clip)]   where the footage goes
  items:  [(folder, file, (x, y), width, rot)]                                                     real cut-outs
  lens:   [(box, clip[, 'rect'])]   a window drawn over an object (inside a loupe, a TV screen, a card page)
  doodles:[(kind, index, (x, y), width, rgb, rot)]                                                 her marker shapes
  text:   [(words, (x, y), px, 'E' editable | 'B' built-in, rgb)]
  label:  [background, opening, main action, doodles, carried into next beat, transition out]
Usage: python build/wireframes.py [04 05 ...]  ->  wireframes/NN.jpg strips + wireframes.html
"""
import html, json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import lettering_b2 as LB
from collage_kit import doodle

PACK = S.E.PACK; OUTD = PACK / 'wireframes'; OUTD.mkdir(exist_ok=True)
HQ = Path(__file__).resolve().parent / '.cache' / 'hq'
VENV = PACK.parent / 'carousels' / '.venv' / 'Scripts' / 'python.exe'
K = 0.5; PW, PH = int(1080 * K), int(1920 * K)                 # panels render at half size
ANTON = LB.FONT['anton']; INK, WHITE = (24, 23, 22), (255, 255, 255)
CLIPS = {'box': ('IMG_1454', 1.0), 'hand': ('IMG_1381', 1.0), 'smoothie': ('IMG_1391', 1.0), 'vacuum': ('IMG_1417', 0.5),
         'unbox': ('IMG_1456', 1.0), 'sofa': ('IMG_1403', 1.0), 'mop': ('IMG_1460', 2.0), 'lamp': ('IMG_1449', 1.0),
         'blender': ('IMG_1388', 0.5), 'brush': ('IMG_1377', 1.0), 'close': ('IMG_1414', 1.0), 'counter': ('IMG_1430', 1.0),
         'shelf': ('IMG_1422', 1.0), 'kitchen': ('IMG_1385', 1.0), 'bag': ('IMG_1436', 1.0), 'steam': ('IMG_1463', 1.0)}

def sc(v): return int(v * K)
def box_k(b): return tuple(sc(v) for v in b)

def ensure_cuts(specs):
    """Cut every object the specs use with the rembg model (once; cached in build/.cache/hq)."""
    need = {}
    for sp in specs:
        for p in sp['beats']:
            for it in p.get('items', []): need.setdefault(it[0], set()).add(it[1])
            for o in p.get('open', []):
                if o[0] == 'screen': need.setdefault(o[1], set()).add(o[2])
    for folder, files in need.items():
        missing = [f for f in files if not (HQ / (Path(f).stem + '.png')).exists()]
        if missing: subprocess.run([str(VENV), str(Path(__file__).resolve().parent / 'cutout_hq.py'), folder, *missing], check=True,
                                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def obj(folder, name, w):
    im = Image.open(HQ / (Path(name).stem + '.png')).convert('RGBA'); return S.fitw(im, max(4, sc(w)))

def still(clip, size): return S.footage(CLIPS[clip], size)

def place(img, it, c, rot=0): S.place(img, it, (sc(c[0]), sc(c[1])), rot)

def screen(folder, name, w, clip):
    """A real object with a green screen (phone, TV, window): the clip goes where the green is."""
    im = obj(folder, name, w); px = im.load(); m = Image.new('L', im.size, 0); mp = m.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and g > 120 and g > r + 40 and g > b + 40: mp[x, y] = 255
    bb = m.getbbox()
    if bb:
        v = ImageOps.fit(still(clip, (bb[2] - bb[0], bb[3] - bb[1])), (bb[2] - bb[0], bb[3] - bb[1]))
        lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); lay.paste(v, bb[:2]); im.paste(lay, (0, 0), m.filter(ImageFilter.GaussianBlur(0.8)))
    return im

def sticker_text(words, px, color, editable):
    f = S.F(ANTON, max(8, sc(px))); l, t, r, b = f.getbbox(words); w, h = r - l + 24, b - t + 24
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((12 - l, 12 - t), words, font=f, fill=255)
    edge = INK if sum(color) > 600 else WHITE                      # light words get a dark edge, or they vanish
    out = Image.new('RGBA', (w, h), edge + (0,)); out.putalpha(m.filter(ImageFilter.MaxFilter(9)))
    fill = Image.new('RGBA', (w, h), color + (255,)); fill.putalpha(m); out.alpha_composite(fill)
    if editable:                                   # a small pencil-blue dot marks words the buyer edits
        ImageDraw.Draw(out).ellipse((w - 14, 2, w - 2, 14), fill=(40, 110, 230, 255))
    return C.shadow(out, (2, 4), 4, 90)

def panel(p):
    im = Image.new('RGBA', (PW, PH), (236, 232, 224, 255))
    for b in p.get('bg', []):
        if b[0] == 'img': src = S.raw(b[1], b[2]); bx = box_k(b[3]); im.paste(ImageOps.fit(src, (bx[2] - bx[0], bx[3] - bx[1])).convert('RGBA'), bx[:2])
        elif b[0] == 'pat':
            bx = box_k(b[4]); g = ImageOps.grayscale(S.raw('doodles', b[1])).resize((300, 300))
            pat = ImageOps.colorize(g, b[2], b[3]).convert('RGBA'); tile = Image.new('RGBA', (bx[2] - bx[0], bx[3] - bx[1]))
            for yy in range(0, tile.height, 300):
                for xx in range(0, tile.width, 300): tile.paste(pat, (xx, yy))
            im.paste(tile, bx[:2])
        elif b[0] == 'fill': bx = box_k(b[2]); ImageDraw.Draw(im).rectangle(bx, fill=b[1])
    for o in p.get('open', []):
        if o[0] in ('rect', 'round', 'circle', 'grey'):
            bx = box_k(o[1]); w, h = bx[2] - bx[0], bx[3] - bx[1]; v = ImageOps.fit(still(o[2], (w, h)), (w, h))
            if o[0] == 'grey': v = ImageOps.grayscale(v).convert('RGBA')
            m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m)
            if o[0] == 'circle': d.ellipse((0, 0, w - 1, h - 1), fill=255)
            elif o[0] == 'round': d.rounded_rectangle((0, 0, w - 1, h - 1), 24, fill=255)
            else: d.rectangle((0, 0, w - 1, h - 1), fill=255)
            v.putalpha(m); im.alpha_composite(C.shadow(v, (4, 6), 6, 80) if w < PW - 4 else v, (bx[0] - (10 if w < PW - 4 else 0), bx[1] - (10 if w < PW - 4 else 0)))
        elif o[0] == 'screen': place(im, C.shadow(screen(o[1], o[2], o[4], o[5]), (4, 6), 6, 90), o[3])
    for it in p.get('items', []):
        place(im, C.shadow(obj(it[0], it[1], it[3]), (4, 6), 6, 90), it[2], it[4] if len(it) > 4 else 0)
    for o in p.get('lens', []):                       # a window drawn over an object (a loupe or lens): the clip in colour inside it
        bx = box_k(o[0]); w, h = bx[2] - bx[0], bx[3] - bx[1]; v = ImageOps.fit(still(o[1], (w, h)), (w, h))
        m = Image.new('L', (w, h), 0); dm = ImageDraw.Draw(m)
        if len(o) > 2 and o[2] == 'rect': dm.rounded_rectangle((0, 0, w - 1, h - 1), 10, fill=255)
        else: dm.ellipse((0, 0, w - 1, h - 1), fill=255)
        v.putalpha(m); im.alpha_composite(v, bx[:2])
    for d in p.get('doodles', []):
        place(im, doodle(d[0], d[1], sc(d[3]), d[4]), d[2], d[5] if len(d) > 5 else 0)
    for tx in p.get('text', []):
        place(im, sticker_text(tx[0], tx[2], tx[4] if len(tx) > 4 else INK, tx[3] == 'E'), tx[1], tx[5] if len(tx) > 5 else 0)
    return im.convert('RGB')

def render(sp):
    ims = [panel(p) for p in sp['beats']]
    strip = Image.new('RGB', (len(ims) * (PW + 12) - 12, PH), 'white')
    for i, im in enumerate(ims): strip.paste(im, (i * (PW + 12), 0))
    for i, im in enumerate(ims): im.save(OUTD / f"{sp['num']}-{i + 1}.jpg", quality=82)
    return [f"{sp['num']}-{i + 1}.jpg" for i in range(len(ims))]

LABELS = ('Background', 'Footage goes', 'Main action', 'Doodles', 'Carried on', 'Transition out')

def page(specs):
    secs = []
    for sp in specs:
        cards = ''
        for i, p in enumerate(sp['beats']):
            lb = ''.join(f'<li><b>{k}:</b> {html.escape(v)}</li>' for k, v in zip(LABELS, p['label']) if v)
            tx = '; '.join(f"{html.escape(t[0])} ({'editable' if t[3] == 'E' else 'built-in'})" for t in p.get('text', []))
            if tx: lb += f'<li><b>Text:</b> {tx}</li>'
            cards += (f'<figure><img src="wireframes/{sp["num"]}-{i + 1}.jpg"><figcaption><b>{html.escape(p["time"])} · {html.escape(p["name"])}</b>'
                      f'<ul>{lb}</ul></figcaption></figure>')
        n = sp['num']
        secs.append(f'<section id="t{n}"><h2>#{n} {html.escape(sp["title"])}</h2><p class="w"><b>Job:</b> {html.escape(sp["job"])} · '
                    f'<b>World:</b> {html.escape(sp["world"])} · <b>Moves:</b> {html.escape(sp["moves"])}</p><div class="row">{cards}</div>'
                    f'<div class="vote"><label><input type="checkbox" data-k="{n}" data-f="approve"> Approve</label>'
                    f'<label><input type="checkbox" data-k="{n}" data-f="maybe"> Maybe</label>'
                    f'<textarea data-k="{n}" data-f="notes" placeholder="Notes on #{n}"></textarea></div></section>')
    doc = '''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Physical pack plans</title><style>
body{margin:0;padding:16px 20px 90px;background:#f1ece4;font:15px Arial,sans-serif;color:#1b1a19} h1{font-size:22px;margin:0 0 6px} h2{font-size:19px;margin:30px 0 4px}
.w{margin:0 0 8px;color:#4c463f;max-width:1100px} .row{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px}
figure{margin:0;flex:0 0 250px} img{width:250px;border-radius:6px;display:block;cursor:zoom-in} figcaption{font-size:12.5px;line-height:1.35;margin-top:6px}
ul{margin:4px 0 0;padding-left:16px} .vote{display:flex;gap:16px;align-items:flex-start;margin-top:8px;flex-wrap:wrap} .vote label{font-weight:bold;padding-top:6px}
textarea{flex:1;min-width:280px;max-width:800px;height:70px;font:14px Arial;padding:6px;border:1px solid #c9bfb2;border-radius:6px}
#bar{position:fixed;left:0;right:0;bottom:0;background:#1b1a19;color:#fff;padding:12px 20px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
button{font:bold 15px Arial;padding:10px 18px;border:0;border-radius:6px;background:#ec7824;color:#fff;cursor:pointer}
#big{position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center} #big img{max-height:94vh;width:auto}
.key{font-size:13px;color:#4c463f} .dot{display:inline-block;width:11px;height:11px;border-radius:50%;background:#286ee6;vertical-align:middle}
</style></head><body><h1>Physical pack: plans for every template not done yet</h1>
<p class="key">Rough plans, not art: real images, a footage still where your clip goes, one panel per beat. <span class="dot"></span> marks words the buyer edits.
Tick Approve or Maybe and leave notes; they save as you type (or use Copy all notes). Click a panel to see it big.</p>
SECTIONS<div id="bar"><button id="copy">Copy all notes</button><span id="msg"></span></div><div id="big"><img></div>
<script>
const els=[...document.querySelectorAll('[data-k]')], msg=document.getElementById('msg');
function key(e){return 'wf:'+e.dataset.k+':'+e.dataset.f}
els.forEach(e=>{try{const v=localStorage.getItem(key(e)); if(v!==null){if(e.type==='checkbox')e.checked=v==='1';else e.value=v}}catch(x){}
 const h=()=>{try{localStorage.setItem(key(e),e.type==='checkbox'?(e.checked?'1':'0'):e.value)}catch(x){}; clearTimeout(window._s); window._s=setTimeout(send,500)};
 e.oninput=h; e.onchange=h;});
function collect(){const o={};els.forEach(e=>{const k=e.dataset.k;o[k]=o[k]||{};o[k][e.dataset.f]=e.type==='checkbox'?e.checked:e.value.trim()});
 for(const k in o){if(!o[k].approve&&!o[k].maybe&&!o[k].notes)delete o[k]} return o}
function send(){fetch('/notes?to=wireframe-notes.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(collect())}).then(r=>{msg.textContent=r.ok?'Saved. Claude can read your picks.':'Could not save. Use Copy all notes.'}).catch(()=>{msg.textContent='Could not save. Use Copy all notes.'})}
document.getElementById('copy').onclick=async()=>{const o=collect();const s=Object.keys(o).map(k=>'#'+k+(o[k].approve?' APPROVE':'')+(o[k].maybe?' MAYBE':'')+(o[k].notes?': '+o[k].notes:'')).join('\\n');
 try{await navigator.clipboard.writeText(s);msg.textContent='Copied. Paste it in the chat.'}catch(e){msg.textContent=s}};
const big=document.getElementById('big');document.querySelectorAll('figure img').forEach(i=>i.onclick=()=>{big.firstChild.src=i.src;big.style.display='flex'});big.onclick=()=>big.style.display='none';
</script></body></html>'''.replace('SECTIONS', ''.join(secs))
    (PACK / 'wireframes.html').write_text(doc, encoding='utf-8')

def main():
    import wireframe_specs as W
    specs = sorted(W.SPECS, key=lambda s: s['num'])
    want = sys.argv[1:]
    ensure_cuts([s for s in specs if not want or s['num'] in want])
    for sp in specs:
        if not want or sp['num'] in want: render(sp); print('rendered', sp['num'])
    page([s for s in specs if all((OUTD / f"{s['num']}-{i + 1}.jpg").exists() for i in range(len(s['beats'])))])
    print('page', PACK / 'wireframes.html')

if __name__ == '__main__':
    main()
