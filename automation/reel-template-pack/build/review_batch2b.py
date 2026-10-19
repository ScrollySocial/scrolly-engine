"""One review page for the 12 motion tests waiting on Mercedes (2026-10-19): #04 #05 #06 #07 #13 #14 #16 #17 #18 #21
#24 #25, in number order. Each card: the latest motion-test MP4, its name and one line on what it is, an Approve tick,
a Needs-changes tick and a notes box. Ticks and notes save automatically to batch2b-review.json through the review
server (same mechanism as batch2-motion.html), with a localStorage copy and a Copy-all fallback.
Open through the server: python build/review_server.py  ->  http://localhost:8950/batch2b-review.html
Usage: python build/review_batch2b.py  ->  batch2b-review.html
"""
import html
from pathlib import Path

PACK = Path(__file__).resolve().parent.parent
T = [('04-a-or-b', '#04 A or B?', 'Two versions as video overlays, a brass scale tipping A then B, a story poll on a standing phone, A and B strips sorting into a split.'),
     ('05-details', "#05 Details you'd miss in a photo", 'The flat shop photo on a phone, a contact sheet that zooms into each detail, a kraft tag, then pull back to the whole product.'),
     ('06-start-to-finish', '#06 Start to finish', 'A loading bar fills 0 to 100% across the make, an hourglass for the wait, the shop scroll on a standing phone.'),
     ('07-how-big-is-it', '#07 How big is it really?', 'The window jumps size ("this big?"), a measuring grid with a phone and mug for scale, marker arrows, the size stamped under a ruler.'),
     ('13-how-to-use-it', '#13 How to use it in 3 steps', 'Number cubes tumble in one per step, an instruction card written and crossed off, a recap of all 3 steps.'),
     ('14-the-annoying-moment', '#14 The annoying moment', 'The annoyance in black and white on a vintage TV, the channel flips to the fix in colour, paper balls swept away.'),
     ('16-what-it-feels-like', '#16 What it feels like', 'Fast cuts of the touch shots under a big hook, feeling words on boxes, "sound on" with a standing phone, 3-word recap.'),
     ('17-everything-that-goes-into-one', '#17 Everything that goes into one', "The buyer's material photos land on a walnut tray one by one with labels, then the finished one drops into the middle."),
     ('18-check-this-before-you-buy', '#18 Check this before you buy', "The clipboard's sheet is the clip, a checklist ticked check by check, number stickers on video, a 3/3 seal, laptop CTA."),
     ('21-small-batch', '#21 Small batch', 'The batch flips in 24 tiles (the count), a stamp, footage turning into a pencil drawing, a batch-number tag, a shipping box.'),
     ('24-make-it-last', '#24 Make it last', 'An open card with the tip written on one side and the clip on the other, the result on a smartwatch.'),
     ('25-mine-vs-the-usual-kind', '#25 Mine vs. the usual kind', 'Three rounds, each rung in by a boxing bell, a different split each round, a gold [MINE] trophy at the end.')]

cards = []
for d, title, line in T:
    n = d[:2]
    cards.append(f'''<section data-k="{n}"><video src="{d}/preview/motion-test.mp4" controls loop muted playsinline preload="metadata"></video>
<div class="side"><h2>{html.escape(title)}</h2><p class="w">{html.escape(line)}</p>
<div class="ticks"><label class="ok"><input type="radio" name="s{n}" value="approve"> Approve</label>
<label class="no"><input type="radio" name="s{n}" value="changes"> Needs changes</label></div>
<textarea placeholder="Notes on #{n} (say the second, e.g. 4s: ...)"></textarea></div></section>''')

page = '''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Template review</title><style>
:root{--bg:#f1ece4;--ink:#1b1a19;--mut:#5a534b;--line:#c9bfb2;--card:#fbf8f3;--ok:#2f7d4f;--no:#b23a2a;--acc:#7a1732}
body{margin:0;padding:16px 16px 96px;background:var(--bg);font:15px Arial,sans-serif;color:var(--ink)}
h1{font-size:22px;margin:0 0 4px} h2{font-size:18px;margin:0 0 4px} .w{margin:0 0 10px;color:var(--mut)}
section{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px;margin:16px 0}
section.approve{border-color:var(--ok);box-shadow:0 0 0 2px var(--ok) inset} section.changes{border-color:var(--no);box-shadow:0 0 0 2px var(--no) inset}
video{width:280px;max-width:100%;border-radius:8px;background:#000}
.side{flex:1;min-width:240px;max-width:640px}
.ticks{display:flex;gap:12px;margin:0 0 10px;flex-wrap:wrap} .ticks label{display:flex;gap:6px;align-items:center;padding:8px 12px;border:1px solid var(--line);border-radius:8px;cursor:pointer;font-weight:bold}
.ok{color:var(--ok)} .no{color:var(--no)}
textarea{width:100%;box-sizing:border-box;height:110px;font:14px Arial;padding:8px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--ink)}
#bar{position:fixed;left:0;right:0;bottom:0;background:var(--ink);color:#fff;padding:12px 16px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
button{font:bold 15px Arial;padding:10px 18px;border:0;border-radius:6px;background:var(--acc);color:#fff;cursor:pointer}
#count{font-weight:bold}
</style></head><body><h1>Physical pack: 12 templates to review</h1>
<p class="w">Latest motion test of each, in number order. Tick Approve or Needs changes and add notes; everything saves to Claude as you go.
Footage is a stand-in; buyers drop in their own clips.</p>
CARDS<div id="bar"><button id="copy">Copy all</button><span id="count"></span><span id="msg"></span></div>
<script>
const secs=[...document.querySelectorAll('section')], msg=document.getElementById('msg'), cnt=document.getElementById('count');
function state(){const o={};secs.forEach(s=>{const k=s.dataset.k, r=s.querySelector('input:checked'), n=s.querySelector('textarea').value.trim();
 if(r||n)o[k]={status:r?r.value:'',notes:n}; s.className=r?r.value:''});
 const a=Object.values(o).filter(v=>v.status=='approve').length, c=Object.values(o).filter(v=>v.status=='changes').length;
 cnt.textContent=a+' approved, '+c+' need changes, '+(12-a-c)+' to go'; return o}
function save(){const o=state(); try{localStorage.setItem('b2b-review',JSON.stringify(o))}catch(e){}
 fetch('/notes?to=batch2b-review.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)})
 .then(r=>{msg.textContent=r.ok?'Saved. Claude can read it.':'Could not save. Use Copy all.'}).catch(()=>{msg.textContent='Could not save. Use Copy all.'})}
let saved={}; try{saved=JSON.parse(localStorage.getItem('b2b-review')||'{}')}catch(e){}
secs.forEach(s=>{const v=saved[s.dataset.k]; if(v){ if(v.status){const r=s.querySelector('input[value="'+v.status+'"]'); if(r)r.checked=true}
 s.querySelector('textarea').value=v.notes||''}
 s.querySelectorAll('input').forEach(i=>i.onchange=save);
 s.querySelector('textarea').oninput=()=>{clearTimeout(window._t);window._t=setTimeout(save,600)}});
state();
document.getElementById('copy').onclick=async()=>{const o=state(); const t=Object.keys(o).map(k=>'#'+k+' '+(o[k].status=='approve'?'APPROVE':o[k].status=='changes'?'NEEDS CHANGES':'')+(o[k].notes?': '+o[k].notes:'')).join('\\n');
 try{await navigator.clipboard.writeText(t);msg.textContent='Copied. Paste it in the chat.'}catch(e){msg.textContent=t}};
</script></body></html>'''.replace('CARDS', ''.join(cards))
(PACK / 'batch2b-review.html').write_text(page, encoding='utf-8')
print('saved', PACK / 'batch2b-review.html')
