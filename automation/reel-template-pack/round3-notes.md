# Mercedes's notes on round 3 (#09, #10, #12, 2026-10-18), to fix in one pass

Code: `build/story5.py` (timelines), `build/story4.py` (round-2 setups it reuses), `build/play.py` (helpers).
More notes are coming (she couldn't view all the videos yet); wait for them, then do one pass.

## #09 Who it's for
1. The butterfly is hidden behind the "if you [always run late]" pill at the start: keep the butterfly clear of the words.
2. The burst doodle on the notebook clock is the same colour as the clock's stripes (no contrast), and it should sit BEHIND the clock.
3. Doodle timing/placement: not two starbursts next to each other; bursts are background doodles behind a photo or element, and must never block the thing being shown (the burst over the product in the torn window).
4. Phone + butterfly layout (her Reel over her head) doesn't work. Options she gave: the phone just behind her head; or the phone at the bottom of the screen; or the butterfly sitting on the phone at the bottom.
5. COMMENT can't be read: the striped fill is too busy. Use a solid fill.

## #10 Three people to gift it to
1. It opens on a plain white background: the opposite of a visual hook. Open on something rich.
2. Give breathing room after the last gift is crossed out. The gifts are wrong: tea set and mug are the same thing, an alarm clock isn't a gift. Pick three different typical "usual" gifts that make sense.
3. The phone scene: remove the hand, remove the prices. It should be a 1:1 video slot of the buyer scrolling their own shop (e.g. Shopify products) on their phone. And give it a real background, not plain white.
4. The "3 people" scene: use either a family tree with cute characters, or a family gallery wall with Victorian frames and side-profile silhouettes.
5. "works for all 3" moves too fast to read: slow it down.
6. CTA: the COMMENT fill looks gross and she hates that font; the gift tags hanging on the balloons are two hanging things: remove the tags.

## #12 Your order just arrived
4. Doorbell: ONE starburst shape, centred BEHIND the doorbell and larger. Things happen too fast to see each point: make it ripple across the page, catching the eye one block at a time.
5. Her idea was the mailbox seen front-on, its door opening to reveal a video that zooms to full screen (not a card sliding up out of the top).
6. More notes coming.

## Carry-over rules (also her notes, round 2, still applying)
- Story words: she disliked the striped Bodoni fill on COMMENT (twice now): use solid fills on built-in words that must be read.
- Doodles only with a job, behind elements, never covering what's being shown, not doubled.
- Breathing room: slower moments so each beat can be read.

## State of the next batch (as of this note)
- #08 and #20 sent (commit 5f28bc5, `build/story6.py`).
- #23 rendered (`23-.../preview/motion-test.mp4`) but NOT yet checked on its 1 fps strip or sent. Its COMMENT also
  uses the striped fill: switch to solid before sending.
- #15 (fresh) and #11 (clock wheel) not started.

## More notes (2026-10-18, second message)

### #12 (continued)
- "the wait / is over": the olive-on-blue-tissue combination is ugly. Use a smaller, neutral font; "over" should come in
  letter by letter.
- Arrow placement on the unboxing clip is off (it points at nothing useful).
- The tag text "[every order comes gift-wrapped]" is not fun enough: write something FUN.
- End: instead of the doorbell on the CTA, maybe a package bow.
- "get yours" text: not loving it at all.

### #22 Put it to the test
- The first frame (magnifier on graph paper) won't stop the scroll for trendy IG women: needs a far stronger hook.
- The camera floating alone over the test clip looks low-grade: remove it or anchor it.
- Too fast to read.
- Hates the colours (brick red checkerboard + red). Two tick marks make no sense with one video and no points: remove.

### #08 A real customer question
- Unacceptable start: the first frame is an empty blue paper (nothing on it until things pop in). Frame 1 must already
  be full and moving.
- Elements come in too fast to read; the text is too spread out ("you all asked" across the top, cards scattered).

### Still to come
She says "continued": more notes on #08/#20 (and maybe #23) to follow. Collect all, then one pass.

## Cross-cutting takeaways (apply to everything)
- Frame 1 must be full, rich and moving: no empty or plain opening, ever.
- Slow down: each beat must be readable; fewer elements at once, grouped, not spread out.
- Colours: muted is right, but avoid clashing pairs (olive on periwinkle, brick + red); prefer neutrals with one accent.
- Built-in story words: she isn't loving the Bodoni italic captions. Try smaller, neutral, trendier type; letter-by-letter
  entry for key words. Show 3 to 4 type options before rebuilding.
- No lone floating props (camera); every prop sits on/interacts with something.

### #20 What buyers said (third message)
- LOVES the five gold stars sticking on at the start, and LOVES all the stars rushing in as the transition: keep both.
- The words ("what / buyers / said") are not good enough: two fonts at once, doesn't look like her inspo. She is
  very upset about the font situation overall.
- Too much gold: the five stars repeated on the review scene plus the gold foil seal. Don't duplicate the stars; drop
  the seal (or the extra stars).
- In general: too fast to read.

## THE FONT PROBLEM (top priority before any rebuild)
Rounds 1-3 kept inventing type (Coiny, Sigmar, DynaPuff, Alfa Slab, Anton+serif, Bodoni italic + Montserrat pills)
and she has rejected each. Next step: a type sheet built ONLY from her approved references, rendered on her real
clips, 3-4 options, ONE type system per option (not two fonts fighting). References she has approved: Lisa's Reels
(bold white sans word-by-word, one big serif key word, red pill labels, outlined numbers), #3's Corben letters filled
with polka dots in the hero prop's colour with a black edge, f2's Anton caps filled with a real textile photo with a
thick cream edge. She picks one; then rebuild all templates with it.

## Type options round 2 (her notes on type-options.jpg)
Rejected: 1 polka-dot fill (hates it), 2 plaid fill (fall-themed), 4 editorial serif (legible but boring, hates the
colour); 3 sans was "closer to trendy but unreadable". She asked to look at Lisa's videos. Lisa's system (from her
technique stills): ONE plain sans, lowercase, white + ONE colour from the shot, big size jumps word to word, placed
around the subject; the key word gets one treatment (glow, colour outline, photo fill, or a pill). Colour never sits on
a same-coloured area. New sheet: type-options-lisa.jpg (build/type_lisa.py), options A to D, all Segoe UI.

## Type, round 3 (her notes 2026-10-18)
- "we don't know the buyer's brand colours or what their clips look like": type must read on ANY clip in ANY brand
  colour. Colour picked from the shot is out.
- All-pills version: "looks like TikTok took over and sponsored a reel. NO". Pills only sparingly, as one point of emphasis.
- Current proposal: words on torn paper (type-paper-test.jpg, build/type_paper.py): the key word big on a torn strip in
  the brand colour (text auto white/ink), small words on torn white scraps, only the keyword on a pill. Placement in the
  real templates keeps words off the face (the test sheet uses one fixed layout).

## Type, round 4 (her notes on Lisa's frames, 2026-10-18)
Outlined = easy to read (use); highlight boxes = underused (use most); pill = overused (once at most); glow = end
emphasis only; video/transparent fill = very sparingly; tiny captions too small. Proposal: type-system-test.jpg
(build/type_system.py): small lines in sans on highlight boxes (white or brand), key words in a condensed serif
(Bodoni MT Condensed) white with a thick brand-colour outline, glow only on the CTA keyword.

- Round 4b: outline too thick and the static glow unreadable. Now a thin outline (px/55) and no static glow; glow is only an animation effect for emphasis (a brief flash on a key word).

## Her type and colour picks (2026-10-18)
Font pairings she likes (all fine together): Instrument Serif + DM Sans (headline Regular + Italic, body Medium);
Bodoni Moda + Manrope (headline Medium, body Medium); DM Serif Display + Manrope (headline Regular + Italic, body Medium).
Colours she likes (not limited to these): #F7E6A9 butter, #7A1732 wine, #F9C9DF pink.
On this computer: Bodoni Moda only (CapCut library font, id 7580184437816675601, so buyers have it). Instrument Serif,
DM Sans, Manrope, DM Serif Display are free Google Fonts (SIL OFL) that would need downloading, and checking that
CapCut's library has them for editable text.
- On type-pairings.jpg: "would maybe not do those [colours] all together, but don't HATE it". Palette now butter
  #F7E6A9, wine #7A1732, pink #F9C9DF + baby blue (~#BFD9F2). Each template uses ONE or TWO of them, never all at once.
