"""Review page for the batch 2 motion tests (#11, #20; #07 and #15 dropped after her notes): each rough MP4 with a notes box under it.
The videos play from the pack folder (MP4s are not in git; rebuild with build/motion_b2.py NN), so open the page
through the review server: http://localhost:8950/batch2-motion.html. Notes save to batch2-motion-notes.json.
Usage: python build/review_b2_motion.py  ->  batch2-motion.html
"""
import html
from pathlib import Path

PACK = Path(__file__).resolve().parent.parent
T = [('11-a-day-with-it', '#11 A day with it', False,
      ['morning, full frame: A DAY WITH MY [PRODUCT] pops in; accents: the small brass clock at 7, the time, a burst',
       'the clock hand sweeps round and wipes to a full-screen word (no video): NOON on concrete',
       'the camera dives through the O of NOON into the midday clip; accents: clock at 12, time, sparkle',
       'zoom out to the clock wheel of four clips (the one collage moment); the hand moves to 4; dive into that slice',
       'afternoon, full frame + accents; the hand wipes to a full-screen NIGHT on dark concrete',
       'night, full frame + accents', 'CTA: the resting product fills the clock face, COMMENT "[KEYWORD]"']),
     ('20-what-buyers-said', '#20 What buyers said', True,
      ['full frame: five gold stars stick on, WHAT BUYERS SAID, a gold seal rolls into the corner',
       "review one: the buyer's screenshot in a real phone slides in beside the clip",
       'a few big stars sweep across to a full-screen word beat (no video): IN THEIR WORDS on marble, gold paint under it',
       'a stroke of gold paint wipes to review two, full frame, the phone on the other side',
       'the camera dives into the phone screen: it becomes the third clip; a hand brings the third phone',
       'the CTA is the collage moment: the clip becomes a tile, the tiles slide in; a trophy, a gem, a gold seal']),
     ('10-three-people-to-gift-it-to', '#10 Three people to gift it to (new)', False,
      ['gift-ready, full frame: "gift this to 3 PEOPLE" (Anton filled with real kraft paper); a kraft gift and twine as accents',
       '"1" pops onto a real gift tag and the camera dives into the tag: it becomes person one',
       "person one, full frame + accents: the big 1, FOR YOUR [friend who's always cold], a blush tag",
       'collage moment: the clip shrinks to a tile, tiles slide in, one flips to person two and swaps big',
       'person two + accents; then full-screen words (no video): "and one more" / a huge 3 on oak',
       'a real kraft paper roll sweeps across to person three', 'CTA collage: the gift wrap clip, three different gifts across the seam, COMMENT, the keyword on a tag']),
     ('23-every-option-in-10-seconds', '#23 Every option in 10 seconds (new)', False,
      ['full-screen words (no video): the real paint-chip fan deck fans open, "every [colour] in 10 SECONDS"',
       'the fan opening is the wipe into option 1', 'eight options, one second each, full frame: its own real chip, [OPTION N], 1/8',
       'the changes alternate: a giant real paint chip sweeps across / the fan opens', 'CTA collage: all eight playing together as tiles, chips across the seams, the oak shelf, COMMENT, ALL [8] AT [SHOP]']),
     ('22-put-it-to-the-test', '#22 Put it to the test (new)', False,
      ['the setup, full frame: "does it really [STAY DRY]?"; a real stopwatch and test tubes as accents',
       "full-screen words (no video): let's TEST IT over a real water splash; the splash sweeps across to the test",
       'the test in ONE uncut take (the pack rule), the stopwatch ticking, the seconds counting, [THE CLAIM]',
       'full-screen words: and the RESULT; a clock-hand wipe to the result', 'the result + accents: a big tick, [WHAT HAPPENED]',
       'CTA collage: the product in use, splash + blue tiles, test tubes, beaker, stopwatch across the seam'])]

cards = []
for d, title, fonts, beats in T:
    num = d[:2]; li = ''.join(f'<li>{html.escape(b)}</li>' for b in beats)
    opts = (f'<p class="w">Lettering options (the video uses option 1). Pick a number:</p><img class="fo" src="{d}/preview/font-options.jpg">' if fonts else '')
    cards.append(f'<section><h2>{html.escape(title)}</h2><div class="pair"><video src="{d}/preview/motion-test.mp4" controls loop muted playsinline preload="metadata"></video>'
                 f'<div class="side"><p class="w">What happens, in order:</p><ol>{li}</ol>{opts}'
                 f'<textarea data-k="{num}" placeholder="Notes on #{num} (say the second, e.g. 4s: ...)"></textarea></div></div></section>')

page = '''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Starter pack motion tests</title><style>
body{margin:0;padding:16px 20px 90px;background:#f1ece4;font:15px Arial,sans-serif;color:#1b1a19}
h1{font-size:22px;margin:0 0 4px} h2{font-size:18px;margin:28px 0 8px} .w{margin:0 0 4px;color:#5a534b}
.pair{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start}
video{width:300px;max-width:100%;border-radius:8px;background:#000} img.fo{width:100%;max-width:420px;border-radius:6px;display:block;margin:4px 0 10px}
.side{flex:1;min-width:260px;max-width:620px} ol{margin:4px 0 10px;padding-left:22px} li{margin:2px 0}
textarea{width:100%;box-sizing:border-box;height:120px;font:14px Arial;padding:8px;border:1px solid #c9bfb2;border-radius:6px}
#bar{position:fixed;left:0;right:0;bottom:0;background:#1b1a19;color:#fff;padding:12px 20px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
button{font:bold 15px Arial;padding:10px 18px;border:0;border-radius:6px;background:#ec7824;color:#fff;cursor:pointer}
</style></head><body><h1>Physical starter pack: motion tests (#11, #20 round 3; #10, #22, #23 new)</h1>
<p>Rough renders to show the motion as a living collage: tiles that slide, flip, peel and swap, real cut-outs across the seams, every transition, the doodles drawing on. The footage is
a stand-in from your July clips; buyers drop in their own. Notes reach Claude as you type. #11 is now modern and not seasonal (no fall images, no washes or dotted letters, no outlines); both mix full-frame video with accents, full-screen words and one collage moment.</p>
CARDS<div id="bar"><button id="copy">Copy all notes</button><button id="save">Send notes to Claude</button><span id="msg"></span></div>
<script>
const tas=[...document.querySelectorAll('textarea')], msg=document.getElementById('msg');
tas.forEach(t=>{try{t.value=localStorage.getItem('b2m:'+t.dataset.k)||''}catch(e){}; t.oninput=()=>{try{localStorage.setItem('b2m:'+t.dataset.k,t.value)}catch(e){}; clearTimeout(window._s); window._s=setTimeout(send,600)}});
function send(){const o={};tas.forEach(t=>{if(t.value.trim())o[t.dataset.k]=t.value.trim()});
 fetch('/notes?to=batch2-motion-notes.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)}).then(r=>{msg.textContent=r.ok?'Notes saved. Claude can read them.':'Could not save notes.'}).catch(()=>{msg.textContent='Could not save notes. Use Copy all notes.'})}
send();
document.getElementById('copy').onclick=async()=>{const s=tas.filter(t=>t.value.trim()).map(t=>'#'+t.dataset.k+': '+t.value.trim()).join('\\n');
 try{await navigator.clipboard.writeText(s);msg.textContent='Copied. Paste it in the chat.'}catch(e){msg.textContent='Copy failed. Select and copy this: '+s}};
document.getElementById('save').onclick=send;
</script></body></html>'''.replace('CARDS', ''.join(cards))
(PACK / 'batch2-motion.html').write_text(page, encoding='utf-8')
print('saved', PACK / 'batch2-motion.html')
