# Halloween pack (started 2026-10-17)

## Status (2026-10-17)
- h1 method, from the tutorial Mercedes sent (instagram.com/p/Dcb54SQxv_z, @marcela.deutsch; files and 2 fps sheet in OneDrive Scrolly Media/videos/style-references/smoke-tutorial/): (1) buyer films themselves (or the product) in frame and snaps their fingers; (2) without moving the phone, films the SAME shot empty; (3) the cut from clip 1 to clip 2 lands on the snap, and the smoke starts right on the cut, on a layer above both clips, sized to cover where they stood, blend mode Screen so the black disappears; (4) the smoke clears and they're gone. Her hook text sits behind the smoke so the smoke rolls over the words too. For the template: 2 clip slots ("with you", "without you"), our smoke.mp4 on Screen (or smoke.mov), shot guide stresses tripod / phone propped and still.
- h1 smoke (2026-10-20): Mercedes supplied Pexels video 6894947 (smoke on black). Processed into `assets/props/source/halloween/smoke.mov` (1080x1920, 5.5 s, rotated so it rises from the bottom, background removed: white smoke with real transparency, ProRes 4444, 188 MB) and `smoke.mp4` (same on black, 4 MB, use CapCut's Screen blend for a light template). Original kept as smoke-pexels-6894947-original.mp4. Not in git. Licence: Pexels allows modified use; we ship it modified (rotated, cropped, keyed, composited), not as a stand-alone clip. Next: build h1 when the video queue is free.
- **h6 Once in a blood moon: APPROVED and checked in CapCut.** Motion test `build/motion_h6.py`, CapCut template
  `build/templates/th6.py` (`python build/make.py h6`, `python build/install_test.py h6`). Test copy in her CapCut:
  "Scrolly h6 Once in a blood moon".
- **Lesson:** still storyboards (rounds 1 to 4) missed the point; the reference Reels are video-first with fun edits.
  Go straight to a 10 to 15 s motion test per template (see motion_h6.py), then the CapCut build. Rules: FRAMEWORK.md.
- **h3 Caught in our web: APPROVED and checked in CapCut** (bubbles round). `build/motion_h3.py`, `build/templates/th3.py`.
  Engine now supports `mask='circle'` on clips (CapCut Rectangle mask, corners fully rounded).
- **Upload zips:** `halloween/for-upload/` (h6, h3, h2, h5), buyer folder + shot list + phone kit, made by `python build/zip_upload.py h2 h3 h5 h6`; not in git. h6 rebuilt 2026-10-18 with Bodoni Moda shipped inside the project.
  Still missing before selling: sound picks per template, Mac support, the product listing (Mercedes does that).
- h2 bats, h5 trick or treat: concepts and round 4 notes in `halloween/notes-round4.md`; next as motion tests.
- **h5 Trick or treat: APPROVED 2026-10-18 (motion test v10) and built.** `build/motion_h5.py`, `build/templates/th5.py`;
  test copy in her CapCut ("Scrolly h5 Trick or treat"); zip in `halloween/for-upload/`. Clips are real layers (door 1's
  glass, hallway, door 2's arch, doorbell view); graphics are flipbooks rendered from the motion test. Not yet checked in CapCut.
- **h2 Things I'm batty about: APPROVED 2026-10-18 and built.** `build/motion_h2.py` (v5), `build/templates/th2.py`;
  test copy in her CapCut ("Scrolly h2 Things I'm batty about"); zip in `halloween/for-upload/`. The bat-shaped window is
  a big dotted-night sheet with a bat-shaped hole, scaled with keyframes (CapCut has no bat mask). Not yet checked in CapCut.
- **h1 Now you see it: APPROVED 2026-10-20 (motion test v4) and built fully editable.** `build/motion_h1.py`, `build/templates/th1.py`, `build/tower_h1.py` (her clock tower with its painted hands taken off the dial; real brass hands sweep to midnight). Her smoke ships in the project (`Resources/smoke/smoke-h1.mov`, made from smoke.mov: from 0.8 s, 4.6 s, 720x1280 ProRes 4444 with alpha, not in git) on its own track above the text, so it rolls over the hook. Test copy "h1 Now you see it" in her CapCut; zip in `halloween/for-upload/`. Not yet checked in CapCut: that the smoke's transparency and its place above the text hold there.
- h4 pumpkin: parked ("maybe scratch"). The pack is 5 templates: h6, h3, h5, h2, h1.
- **h4 What's inside? is back as the FREE bonus template** for the SPOOKY comment keyword (Mercedes 2026-10-23: a
  bonus made only for the freebie, never added to the paid pack). Video-first rewrite: the carved face is a window on
  the buyer's clip, the camera flies in through the mouth and then an eye; nothing flies at the lens. Motion test v1:
  `build/motion_h4.py` -> `halloween/h4-whats-inside/preview/motion-test.mp4` (stills: `python build/motion_h4.py 0.6 4.6`).

Buyers are online business owners and influencers, so every template is a whole Reel with a business job and a CTA,
not just a Halloween look. Cute, not scary. Real photographed objects; only the playful layer (washi tape, white
sticker edges, handwritten words, words on tape) is drawn. Build ids `h1` to `h5` (`python build/make.py h1`).

Round 1 (2026-10-17) rejected: candy bowl ("boring"), floating candles (too close to a Reel she already made), and
concepts that were Halloween looks with no selling job. Candy and blown-out candles can still appear as props.

**Round 2, approved 2026-10-17** (h1 "love"; the rest "will work"):

| Id | Template | Business job | Step by step | CTA |
|---|---|---|---|---|
| h1 | Now you see it | Scarcity: limited drop, last chance, sale ending | Buyer's clip with the product; a snap or clap; real smoke rolls in and the product (or the person) is gone; "gone at midnight" | Get it before it disappears |
| h2 | Things I'm batty about | Favourites: best-sellers, gift guide, tools I use | Real cute bats fly in one at a time, each carrying a clip window with one favourite and a word on tape | Shop my faves / which one's yours? |
| h3 | Caught in our web | What you get: features, what's included, why people get hooked | 1 a friendly spider drops in on its thread; 2 the web forms; 3 each point (clip + word) gets caught in it; 4 zoom out to a half-circle web holding all of them | Get caught: link in bio |
| h4 | What's inside? | Reveal: new product, launch, behind the scenes | A real carved pumpkin; the lid lifts, the clip glows through the face, then fills the frame | New drop + date |
| h5 | Trick or treat | Offer: myth vs fix, then a discount or freebie | Knock; door 1 opens on the TRICK (a common mistake); door 2 opens on the TREAT (your product or offer) | Comment TREAT for the code |
| h6 | Once in a blood moon (added 2026-10-17) | A rare, once-a-year sale opening | A huge full moon; clouds drift over; it turns blood red; the moon becomes the clip; haunted house, bats, wolf and tree pop up with the deal | Once-a-year sale: link in bio |

Candy: Mercedes kept only candy corn and gummy worms from the ChatGPT candy sheets. Storyboards (round 1) are in
`halloween/hN-*/storyboard/`, made by `python build/storyboard_halloween.py`. h1 waits on the smoke video.

## Images needed (Mercedes to make in ChatGPT or find royalty-free)

All: photorealistic product photo, pure white background (unless noted), soft even light, no cast shadow, object
whole and not cropped, at least 2000 px, no brand names or logos anywhere. Save to `assets/props/source/`.
Make the poses of one object in the same ChatGPT chat ("the same bat, now with wings up") so they match.

Prompt: *"Photorealistic studio product photo of [object], [angle], isolated on a pure white background, soft even
lighting, no shadow, whole object in frame, no text or logos."*

**h1 Now you see it**
1. A smoke puff video on a black background, 3 to 5 seconds, rolling outward from the centre. It ships inside the
   template, so it must be one we own (filmed by Mercedes, or AI-made in Sora/Veo), not a stock clip.
2. Three still smoke puffs on black (small, medium, big), for the storyboard and the edge wisps.

**h2 Things I'm batty about**
3. A cute bat (felt or plush look, friendly face), front view, wings spread wide.
4. The same bat, wings folded up (the second flap pose).
5. The same bat hanging upside down, wings wrapped.
6. A bare dark twig or branch, side view, for the bats to hang from at the end.

**h3 Caught in our web**
7. A cute fuzzy toy spider (googly eyes welcome) hanging from one thread, straight on.
8. A full round orb cobweb filling the frame, front on, on a **black** background (spokes and spiral clear).
9. A corner cobweb (a quarter or half circle spanning a corner), front on, on black. For the zoom-out ending.

**h4 What's inside?**
10. A carved pumpkin, straight on, lid already off, classic face (triangle eyes and nose, toothy smile), dark and
    unlit inside, clean cut edges (the holes become video windows).
11. That pumpkin's lid with its stem, alone, same angle.
12. The same pumpkin lit from inside, warm glow through the face, same angle.

**h5 Trick or treat**
13. Door 1 (TRICK): a front door with its frame, straight on, closed, black or plum.
14. Door 1 again, wide open, dark inside, same angle.
15. Door 2 (TREAT): a different front door, straight on, closed, warm orange or dark green.
16. Door 2 again, wide open, warm light inside, same angle.
17. 6 wrapped candies from above in plain orange, purple, gold wrappers, spread out so none touch.
18. 5 candy corn pieces, spread out so none touch.
19. Two or three small pumpkins in a cluster for the doorstep, front view.

## Sounds (to recommend, not bundle)

To pick after the storyboards. Business-safe means CapCut's own library (licensed for use inside CapCut, check the
"commercial use" tag) or tracks the buyer licenses themselves.
