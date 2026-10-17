"""A one-page review of the Halloween storyboards: each template's frames side by side, a note box under each frame,
and a Copy all notes button. Images are embedded so the page opens anywhere.
Usage: python build/review_halloween.py  ->  halloween/review.html
"""
import base64, html, io, os
from pathlib import Path
from PIL import Image

HW = Path(__file__).resolve().parent.parent / 'halloween'
T = [('h6-once-in-a-blood-moon', 'h6 Once in a blood moon'), ('h3-caught-in-our-web', 'h3 Caught in our web'),
     ('h2-batty-about', "h2 Things I'm batty about"), ('h4-whats-inside', "h4 What's inside?"), ('h5-trick-or-treat', 'h5 Trick or treat')]

def data_uri(p):
    im = Image.open(p).convert('RGB'); im.thumbnail((640, 1140)); b = io.BytesIO(); im.save(b, 'JPEG', quality=82)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

rows = []
for d, title in T:
    sb = HW / d / 'storyboard'
    if not sb.exists(): continue
    fs = sorted(f for f in os.listdir(sb) if f.endswith('.jpg') and not f.startswith('storyboard-') and '-notes' not in f)
    cards = ''.join(f'<figure><img src="{data_uri(sb / f)}"><figcaption>{html.escape(f[:-4])}</figcaption>'
                    f'<textarea data-k="{d[:2]} frame {f.split(" ")[0]}" placeholder="Notes on this frame"></textarea></figure>' for f in fs)
    rows.append(f'<section><h2>{html.escape(title)}</h2><textarea class="all" data-k="{d[:2]} overall" placeholder="Notes on this whole template"></textarea><div class="row">{cards}</div></section>')

page = '''<!doctype html><html><head><meta charset="utf-8"><title>Halloween storyboards</title><style>
body{margin:0;padding:16px 20px 90px;background:#f1ece4;font:15px Arial,sans-serif;color:#1b1a19}
h1{font-size:22px;margin:0 0 4px} h2{font-size:18px;margin:26px 0 8px}
.row{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px}
figure{margin:0;flex:0 0 230px} img{width:230px;border-radius:6px;display:block;cursor:zoom-in}
figcaption{font-size:13px;margin:6px 0 4px;min-height:32px}
textarea{width:100%;box-sizing:border-box;height:84px;font:14px Arial;padding:6px;border:1px solid #c9bfb2;border-radius:6px}
textarea.all{height:48px;margin-bottom:10px;max-width:960px}
#bar{position:fixed;left:0;right:0;bottom:0;background:#1b1a19;color:#fff;padding:12px 20px;display:flex;gap:14px;align-items:center}
button{font:bold 15px Arial;padding:10px 18px;border:0;border-radius:6px;background:#ec7824;color:#fff;cursor:pointer}
#big{position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center} #big img{max-height:94vh;width:auto}
</style></head><body><h1>Halloween storyboards, round 1</h1>
<p>Type notes under any frame (they save in this browser). Click a frame to see it big. When done, press <b>Copy all notes</b> and paste them in the chat.</p>
ROWS<div id="bar"><button id="copy">Copy all notes</button><span id="msg"></span></div><div id="big"><img></div>
<script>
const tas=[...document.querySelectorAll('textarea')], msg=document.getElementById('msg');
tas.forEach(t=>{try{t.value=localStorage.getItem('hw:'+t.dataset.k)||''}catch(e){}; t.oninput=()=>{try{localStorage.setItem('hw:'+t.dataset.k,t.value)}catch(e){}}});
document.getElementById('copy').onclick=async()=>{const s=tas.filter(t=>t.value.trim()).map(t=>t.dataset.k+': '+t.value.trim()).join('\n');
 try{await navigator.clipboard.writeText(s);msg.textContent='Copied. Paste it in the chat.'}catch(e){msg.textContent='Copy failed. Select and copy this: '+s}};
const big=document.getElementById('big');document.querySelectorAll('figure img').forEach(i=>i.onclick=()=>{big.firstChild.src=i.src;big.style.display='flex'});big.onclick=()=>big.style.display='none';
</script></body></html>'''.replace('ROWS', ''.join(rows))
(HW / 'review.html').write_text(page, encoding='utf-8')
print('saved', HW / 'review.html', page.count('<figure>'), 'frames')
