"""One review page for the physical pack's batch 2 storyboards (#07, #11, #15, #20): each template's frames side by
side, a note box under each frame and one per template. Images are embedded so the page opens anywhere. Served by
build/review_server.py; notes save to batch2-notes.json (POST /notes?to=...) (same pattern as halloween/review.html).
Usage: python build/review_b2.py  ->  batch2-review.html
       python build/review_server.py 8951   then open http://localhost:8951/batch2-review.html
"""
import base64, html, io, os
from pathlib import Path
from PIL import Image

PACK = Path(__file__).resolve().parent.parent
T = [('07-how-big-is-it', '#07 How big is it really?', 'The measuring table: banana for scale, a real ruler, a mug, playing cards. Comment SIZE.'),
     ('11-a-day-with-it', '#11 A day with it', 'The clock of the day: a brass clock as a wheel of 4 clips, the sky changes from morning to night.'),
     ('15-new-drop-reveal', '#15 New drop reveal', 'The stage: velvet curtains, spotlights, ticket stubs, a countdown in lights.'),
     ('20-what-buyers-said', '#20 What buyers said', 'The prize table: marble, gold stars, gold seals, postcards, trophies.')]

def data_uri(p):
    im = Image.open(p).convert('RGB'); im.thumbnail((640, 1140)); b = io.BytesIO(); im.save(b, 'JPEG', quality=82)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

rows = []
for d, title, world in T:
    sb = PACK / d / 'storyboard'
    fs = sorted(f for f in os.listdir(sb) if f.endswith('.jpg') and not f.startswith('storyboard-'))
    num = d[:2]
    cards = ''.join(f'<figure><img src="{data_uri(sb / f)}"><figcaption>{html.escape(f[:-4])}</figcaption>'
                    f'<textarea data-k="{num} frame {f.split(" ")[0]}" placeholder="Notes on this frame"></textarea></figure>' for f in fs)
    rows.append(f'<section><h2>{html.escape(title)}</h2><p class="w">{html.escape(world)}</p>'
                f'<textarea class="all" data-k="{num} overall" placeholder="Notes on this whole template"></textarea><div class="row">{cards}</div></section>')

page = '''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Physical pack storyboards</title><style>
body{margin:0;padding:16px 20px 90px;background:#f1ece4;font:15px Arial,sans-serif;color:#1b1a19}
h1{font-size:22px;margin:0 0 4px} h2{font-size:18px;margin:26px 0 2px} .w{margin:0 0 8px;color:#5a534b}
.row{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px}
figure{margin:0;flex:0 0 230px} img{width:230px;border-radius:6px;display:block;cursor:zoom-in}
figcaption{font-size:13px;margin:6px 0 4px;min-height:32px}
textarea{width:100%;box-sizing:border-box;height:84px;font:14px Arial;padding:6px;border:1px solid #c9bfb2;border-radius:6px}
textarea.all{height:48px;margin-bottom:10px;max-width:960px}
#bar{position:fixed;left:0;right:0;bottom:0;background:#1b1a19;color:#fff;padding:12px 20px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
button{font:bold 15px Arial;padding:10px 18px;border:0;border-radius:6px;background:#ec7824;color:#fff;cursor:pointer}
#big{position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center} #big img{max-height:94vh;width:auto}
</style></head><body><h1>Physical pack: #07, #11, #15, #20 storyboards</h1>
<p>Type notes under any frame (they save in this browser and reach Claude as you type). Click a frame to see it big.
The footage is a stand-in from your July clips; buyers drop in their own.</p>
ROWS<div id="bar"><button id="copy">Copy all notes</button><button id="save">Send notes to Claude</button><span id="msg"></span></div><div id="big"><img></div>
<script>
const tas=[...document.querySelectorAll('textarea')], msg=document.getElementById('msg');
tas.forEach(t=>{try{t.value=localStorage.getItem('b2:'+t.dataset.k)||''}catch(e){}; t.oninput=()=>{try{localStorage.setItem('b2:'+t.dataset.k,t.value)}catch(e){}; clearTimeout(window._s); window._s=setTimeout(send,600)}});
function send(){const o={};tas.forEach(t=>{if(t.value.trim())o[t.dataset.k]=t.value.trim()});
 fetch('/notes?to=batch2-notes.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)}).then(r=>{msg.textContent=r.ok?'Notes saved. Claude can read them.':'Could not save notes.'}).catch(()=>{msg.textContent='Could not save notes. Use Copy all notes.'})}
send();
document.getElementById('copy').onclick=async()=>{const s=tas.filter(t=>t.value.trim()).map(t=>t.dataset.k+': '+t.value.trim()).join('\\n');
 try{await navigator.clipboard.writeText(s);msg.textContent='Copied. Paste it in the chat.'}catch(e){msg.textContent='Copy failed. Select and copy this: '+s}};
document.getElementById('save').onclick=send;
const big=document.getElementById('big');document.querySelectorAll('figure img').forEach(i=>i.onclick=()=>{big.firstChild.src=i.src;big.style.display='flex'});big.onclick=()=>big.style.display='none';
</script></body></html>'''.replace('ROWS', ''.join(rows))
(PACK / 'batch2-review.html').write_text(page, encoding='utf-8')
print('saved', PACK / 'batch2-review.html', page.count('<figure>'), 'frames')
