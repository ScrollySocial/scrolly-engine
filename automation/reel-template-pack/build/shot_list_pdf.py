"""One shot list PDF per pack: every template's clips on a few pages, for buyers who film a whole pack in one go.
Usage (from automation/reel-template-pack): python build/shot_list_pdf.py halloween product
Reads each template's buyer-folder "1 Put your clips here/READ ME.txt" (made by engine.py), so rebuild after make.py.
Writes guide/shot-list-<pack>.html and .pdf (Edge headless print), in the How to use guide's style."""
import html, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EDGE = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

PACKS = {
    'halloween': dict(title='Halloween Reel Template Pack', ids=['h6', 'h3', 'h2', 'h5'],
                      lede='Every clip for all 4 templates on one list. Film the shots that repeat once, tick off each '
                           'template as you go, and post before the 31st.'),
    'product': dict(title='Product Reel Template Pack', ids=[f'{n:02d}' for n in range(1, 26)],
                    lede='Every clip for all 25 templates on one list. Film the shots that repeat once, then tick off '
                         'each template as you go.'),
}
ON_CAMERA = re.compile(r'^(you\b|with you|picking the order)', re.I)    # clips where someone else holds the phone


def template_dir(tid):
    hits = sorted((ROOT / 'halloween').glob(f'{tid}-*')) if tid.startswith('h') else sorted(ROOT.glob(f'{tid}-*'))
    return hits[0]


def read(tid):
    buyer = next((template_dir(tid) / 'buyer-folder').iterdir())
    name = buyer.name.split(' - ', 1)[-1]
    shots = []
    for l in (buyer / '1 Put your clips here' / 'READ ME.txt').read_text(encoding='utf-8').splitlines():
        m = re.match(r'(\d+): (.+) \(at least (\d+) seconds\)', l)
        if m: shots.append((m[2], int(m[3])))
    return name, shots


def build(pack):
    p = PACKS[pack]
    cards, reuse = [], {}
    for tid in p['ids']:
        name, shots = read(tid)
        rows = ''.join(f'<li><span>{html.escape(w)}{" <em>you on camera</em>" if ON_CAMERA.match(w) else ""}</span>'
                       f'<b>{s} s</b></li>' for w, s in shots)
        label = tid.upper() if tid.startswith('h') else tid
        cards.append(f'<section><h2><i class="box"></i>{label} {html.escape(name)}</h2><ol>{rows}</ol></section>')
        for w, _ in shots:
            key = ('Your product on its own' if w.lower().startswith(('your product', 'the whole product')) else
                   'Your product in use' if w.lower() == 'in use' else
                   'Your shop, scrolling on a screen' if 'scrolling' in w.lower() else
                   'You on camera' if ON_CAMERA.match(w) else None)
            if key: reuse.setdefault(key, []).append(label)
    reuse_li = ''.join(f'<li><b>{k}:</b> {", ".join(dict.fromkeys(v))}</li>' for k, v in reuse.items() if len(v) > 1)
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Shot list: {p['title']}</title>
<style>
  @page {{ size: Letter; margin: 0.5in 0.55in 0.45in; }}
  * {{ box-sizing: border-box; }}
  html, body {{ margin: 0; }}
  body {{ background: #fff; color: #0a0a0a; font: 10.8pt/1.36 Arial, Helvetica, sans-serif;
         -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
  h1 {{ font: 400 27pt/1.05 Georgia, serif; margin: 0 0 6pt; }}
  .lede {{ font: 400 13pt/1.35 Georgia, serif; margin: 0 0 12pt; }}
  .how {{ display: grid; grid-template-columns: 1fr 1fr; gap: 0 24pt; margin: 0 0 14pt; padding: 10pt 12pt;
          background: #f7f3ec; border-radius: 6pt; }}
  .how h3 {{ font: 400 13pt Georgia, serif; margin: 0 0 3pt; }}
  .how ol, .how ul {{ margin: 0; padding-left: 15pt; }}
  .how li {{ margin: 0 0 2pt; }}
  .grid {{ columns: 2; column-gap: 24pt; }}
  section {{ break-inside: avoid; margin: 0 0 12pt; }}
  h2 {{ font: 400 14pt/1.2 Georgia, serif; margin: 0 0 4pt; display: flex; align-items: center; gap: 7pt; }}
  .box {{ width: 11pt; height: 11pt; border: 1.3pt solid #0a0a0a; border-radius: 2pt; flex: none; }}
  section ol {{ margin: 0; padding-left: 17pt; }}
  section li {{ margin: 0 0 1.5pt; }}
  section li span {{ display: inline; }}
  section li b {{ float: right; font-weight: 400; color: #6b6762; }}
  em {{ font-style: normal; font-size: 9.5pt; background: #f7f3ec; border: 1px solid #d9d3ca; border-radius: 8pt;
        padding: 0 5pt; margin-left: 3pt; white-space: nowrap; }}
  .reuse {{ break-inside: avoid; margin-top: 4pt; padding: 10pt 12pt; background: #f7f3ec; border-radius: 6pt; }}
  .reuse h3 {{ font: 400 13pt Georgia, serif; margin: 0 0 3pt; }}
  .reuse ul {{ margin: 0; padding-left: 15pt; }}
  .foot {{ margin-top: 14pt; padding-top: 10pt; border-top: 1px solid #d9d3ca; display: flex;
           justify-content: space-between; color: #6b6762; font-size: 11pt; }}
  .foot b {{ font: 400 13pt Georgia, serif; color: #0a0a0a; letter-spacing: .08em; }}
</style></head>
<body>
  <h1>Shot list: {p['title']}</h1>
  <p class="lede">{p['lede']}</p>
  <div class="how">
    <div><h3>Filming</h3><ul>
      <li>Hold your phone upright (vertical), near a window, leaned on something.</li>
      <li>Start each clip right on the action. Film a few seconds longer than listed.</li>
      <li>Keep your product in the middle. Words go at the top and bottom.</li>
      <li>"You on camera" clips are easiest with a helper holding the phone.</li></ul></div>
    <div><h3>Then, for each template</h3><ol>
      <li>Name its clips 1, 2, 3, in the order listed.</li>
      <li>Put them in its folder <b>1 Put your clips here</b>.</li>
      <li>Double-click <b>2 Double-click to install</b>, then type over the [brackets] in CapCut.</li></ol></div>
  </div>
  <div class="grid">{''.join(cards)}</div>
  <div class="reuse"><h3>Film once, use in several</h3><ul>{reuse_li}</ul>
    <p style="margin:4pt 0 0" class="muted">Times are the shortest each clip can be. One long take can be trimmed for several templates.</p></div>
  <div class="foot"><b>SCROLLY</b><span>Go get 'em, Tiger.</span></div>
</body></html>"""
    out = ROOT / 'guide' / f'shot-list-{pack}.html'
    out.write_text(page, encoding='utf-8')
    pdf = out.with_suffix('.pdf')
    subprocess.run([EDGE, '--headless', '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={pdf}',
                    out.as_uri()], check=True, capture_output=True, timeout=90)
    print(pdf.relative_to(ROOT))


for pk in sys.argv[1:] or PACKS:
    build(pk)
