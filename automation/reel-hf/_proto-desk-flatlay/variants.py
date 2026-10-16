# Writes still-a/b/c.html: three "visual joke" options for the payoff under the hero line (2026-10-16).
# Everything above the payoff (paper, handwriting, hero) stays as in still.html.
import io, pathlib

here = pathlib.Path(__file__).parent
src = io.open(here / 'still.html', encoding='utf8').read()
start = src.index('  <!-- arrow down to the payoff')
end = src.index('</div>\n</body>')
head, tail = src[:start], src[end:]

ARROW = '''  <svg class="abs" style="left:230px;top:1000px" width="150" height="190" viewBox="0 0 150 190" fill="none" stroke="#161210" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 14 C 10 70, 40 130, 112 160"/><path d="M80 170 L 116 162 L 100 128"/>
  </svg>
'''
FOLDER = '''  <img class="abs stk" src="assets/stickers/file_folder_color.svg" style="left:380px;top:1080px;width:440px;rotate:6deg">
  <img class="abs stk" src="assets/stickers/brain_3d.png" style="left:460px;top:1110px;width:260px;rotate:-10deg">
'''
EXTRA_CSS = '''<style>
.label.cream{background:#FFF4DC;color:#161210;border:2px solid rgba(0,0,0,.08)}
.peel{position:relative}
.peel::after{content:'';position:absolute;right:-2px;top:-2px;width:34px;height:34px;background:linear-gradient(225deg,#F8DCE5 0 50%,#E9DCC6 50% 100%);box-shadow:-3px 3px 5px rgba(0,0,0,.18)}
.small{font-size:30px;letter-spacing:.16em;padding:12px 18px 10px 22px}
</style>
</head>'''

variants = {
    # A: the folder's old label "SOCKS" peeled off and hanging beside it; the new BRAIN label is on.
    'a': ARROW + FOLDER + '''  <div class="abs" style="left:420px;top:1380px;rotate:-4deg"><div class="label">BRAIN</div></div>
  <div class="tape" style="left:388px;top:1368px;width:70px;height:40px;rotate:-60deg"></div>
  <div class="abs" style="left:800px;top:1580px;rotate:20deg"><div class="label cream peel">SOCKS</div></div>
  <div class="abs hand" style="left:520px;top:1650px;font-size:52px;rotate:-4deg;color:#E05A33">relabeled.</div>
''',
    # B: the folder is drawn as a drawer organizer; each compartment is a part of the business, one still holds a sock.
    'b': ARROW + '''  <svg class="abs" style="left:380px;top:1060px;rotate:4deg;filter:drop-shadow(0 16px 18px rgba(80,30,20,.22))" width="620" height="470" viewBox="0 0 620 470" fill="none" stroke="#161210" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 18 C 200 10, 420 12, 604 16 L 606 452 C 400 458, 210 456, 12 452 Z" fill="#FFF4DC"/>
    <path d="M210 18 C 212 160, 208 300, 212 452 M408 16 C 406 160, 410 300, 406 452 M14 236 C 200 230, 420 240, 606 232"/>
  </svg>
  <div class="abs hand" style="left:430px;top:1180px;font-size:50px;rotate:4deg">offers</div>
  <div class="abs hand" style="left:630px;top:1190px;font-size:50px;rotate:4deg">prices</div>
  <div class="abs hand" style="left:812px;top:1200px;font-size:50px;rotate:4deg">my voice</div>
  <div class="abs hand" style="left:404px;top:1404px;font-size:40px;rotate:4deg">customers</div>
  <div class="abs hand" style="left:622px;top:1410px;font-size:50px;rotate:4deg">ideas</div>
  <img class="abs stk" src="assets/stickers/socks_3d.png" style="left:832px;top:1350px;width:130px;rotate:-12deg">
''',
    # C: BRAIN label is on; a second, smaller label underneath admits the socks are still waiting.
    'c': ARROW + FOLDER + '''  <div class="abs" style="left:420px;top:1380px;rotate:-4deg"><div class="label">BRAIN</div></div>
  <div class="tape" style="left:388px;top:1368px;width:70px;height:40px;rotate:-60deg"></div>
  <div class="abs" style="left:470px;top:1580px;rotate:-2deg"><div class="label small">SOCKS: NEXT WEEK</div></div>
  <img class="abs stk" src="assets/stickers/sparkles_3d.png" style="left:850px;top:1110px;width:120px;rotate:10deg">
''',
}
for k, block in variants.items():
    html = (head + block + tail).replace('</head>', EXTRA_CSS, 1)
    io.open(here / f'still-{k}.html', 'w', encoding='utf8').write(html)
print('wrote', ', '.join(f'still-{k}.html' for k in variants))
