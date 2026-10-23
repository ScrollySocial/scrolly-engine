# Halloween Reel Template Pack: sales page draft

Draft only, updated 2026-10-19 after Mercedes's notes (more fun, 5 Reels, $9.99 crossed out to $4.99, room for her
how-to video). Nothing published, no product, price or checkout created. HTML layout preview:
`halloween-sales-preview.html`, built by `node build-previews.mjs` (images inlined from `img/`).

## No audio (2026-10-20)

A bold line under the price (hero and buy section): "No audio included: add a sound in Instagram." The FAQ says "no
music and no sound effects" (we can't license them to bundle).

## Reel + carousel (2026-10-20)

A compact section after "Every template comes with": "Reel + carousel / Post the Reel, then its matching carousel."
with Once in a blood moon beside its carousel slides 2, 4 and 6. Only slides with graphics or Mercedes's own footage are shown; the other slides carry stand-in footage of
other brands' products. FAQ: "Do I need Canva Pro? No, the carousels open in free Canva." A template only ships once
its Canva link is ready, since "Every template comes with" lists the carousel.

## Names on the page (2026-10-20)

Plain words instead of internal names: "A recipe card" is "Words to type" (the one-page card: every line to type over
the [brackets]); "A phone kit" is "A phone version" (shot guide video, shot list and every graphic, for CapCut on a
phone). The carousel stands apart after a big orange "+" (orange pill on the physical page, an orange note on
Halloween). FAQ: [SOUND PICKS] removed; "Do I need CapCut Pro or Canva Pro? No" waits on the CapCut test of all 25
to confirm no Pro features.

## Round 2026-10-20 (her notes)

- "Every template comes with": The CapCut project, A shot list, A sample caption (the caption in the carousel's last
  slide notes), + A matching carousel. Installer and phone version removed from the list.
- New "Make it yours" band (peach): Every word, Fonts, Text colours, Doodle colours, Background, Your clips, Your
  audio. Line: "Change it all in CapCut, on your phone or computer." [CONFIRM phone editing from the CapCut test.]
  Only true once the editable rebuilds (build/editable.py) are in the shipped zips.
- How it works: Download, Film, Edit, Post.
- No-audio wording: never by the price or in the hero (Mercedes: it hurts conversions). It shows as "Your audio" in
  Make it yours, and plainly in the FAQ.
- FAQ: "Can I do it all on my phone?" waits on the CapCut test; the phone-kit answer is gone.

## Round 2026-10-20 b

- Comes with: A CapCut Reel template, A shot list, A caption template, + A matching carousel (new two-slide icon).
- Reel + carousel: phone + 3 slides side by side (no overlap, nothing cropped), Instagram dots, handwritten "swipe".
- Make it yours: one phone with handwritten labels and arrows around it (Every word, Fonts, Text colours | Doodle
  colours, Background, Your clips, Your audio); on a phone the labels wrap under it.
- How it works: "Download → Film → Edit → Post" as one line above the monitor; handwritten "see it in action" on it.

## Round 2026-10-20 c

- How it works: shorter band and a smaller monitor; the handwritten "see it in action" sits beside the screen with an
  arrow pointing at it (above the screen on narrower windows).
- Make it yours: real icons (T for Every word, Aa for Fonts, an artist's palette for Text colours). Every line starts at
  the phone's centre (hidden behind it) and runs out to its label, evenly spaced on each side.
- Hero (physical): a static Instagram-style feed of Reel frames behind the tripod, fading to the left so it never sits
  behind the words. The designed covers replace these frames once approved.

## Round 2026-10-20 d (physical page's layout, Halloween props kept)

- Hero: headline left with "that sell" in sky-blue italic (no marker on a hero headline, brand rule), price and
  button; a faded feed of the five covers behind the moon, bats and spider. The five-phone row moved out of the hero.
- All 5 Reels: one aligned row on the polka dots, "1 of 5" above each phone, names only (job lines dropped).
- Who it's for: compact two columns under the bat branch: words and tickets left, three covers fanned on an orange
  burst right.
- Questions: two columns on night, the wolf and blood moon beside the heading.
- Buy: the physical page's blue-mist card with the burst and heart doodles.
- Site palette of 2026-10-20 (vault brand/visual-system.md): sky-blue markers and lines, blue mist instead of lavender
  and baby pink, hot pink kept for Mercedes only.

## Round 2026-10-20 e

- All 5 Reels: calmer polka dots (a purple wash over them) and no doodles.
- Every template comes with: the physical page's icon list instead of sticky notes.
- Who it's for: the bats hang in front of the orange burst. Buy card: no doodles.

## Live pack: 5 Reels, buttons linked (2026-10-20)

The Halloween pack is live in WooCommerce as product 1498 ($4.99, $9.99 crossed out). Mercedes: it is 5 Reels; Now you
see it (h1) is being built with her smoke video and added to the product today. Both buy buttons go to
https://scrollyseo.com/?add-to-cart=1498 (her OK, 2026-10-20). The page itself is not published.

## Page LIVE (2026-10-21)

Published at https://scrollyseo.com/halloween-reels/ (WP page 1570) on Mercedes's go: `node build-previews.mjs --live`
then `node publish-live.mjs halloween` (re-run both to update; images in WP media, ids in `live-media.json`). The live
build leaves out the draft banner, review notes and the how-to video screen (not filmed yet: add it back when it is).
Product 1498 now serves the zips with covers (media 1519-1521, 1523, 1533) and its description lists all five.

## Open decisions (Mercedes)

| Decision | State |
|---|---|
| **Price** | Decided 2026-10-19: **$4.99**, shown with **$9.99** crossed out |
| **How it's sold** | Instant download (2026-10-19), so Now you see it must be built and zipped before launch |
| **Now you see it (h1)** | Motion test only (with smoke). Needs the CapCut build and zip before the page goes live |
| **Sound picks** | None chosen for Halloween yet |
| **Mac** | Mercedes is testing. The page names no platform until then |
| **Reel Editor upsell** | No name, link or launch yet: one placeholder line |

## Check before this page goes live

- **Every zip holds a shot list and a phone kit** (`python build/zip_upload.py <ids>`, every future zip too): *Shot
  list - what to film.txt* at the top, and a *Phone kit* folder (phone READ ME, shot list, shot guide video, recipe
  card, every graphic as a PNG).
- **h6 font fixed 2026-10-18:** Bodoni Moda now ships inside the project.
- **h2 and h5 are not yet checked in CapCut**, and the text highlight boxes need their CapCut check.
- **One install on a second computer** before selling: the only real proof that a zip works away from this PC.
- **Mac:** the installer is a Windows script (`.cmd` + PowerShell) that copies into CapCut's Windows projects folder.
  Mercedes's Mac test will show what works there; if the installer won't run, a Mac version can be written.
- **Previews:** the phone frames on the page are real frames from each template (graphics only, no stand-in
  footage). Swap in the demo videos once they're filmed. Never use the `after.mp4` files (other brands' products).

---

## 1. Headline options

1. **Cute Halloween Reels that sell** (in the preview)
2. Halloween Reels with a selling job
3. Five Halloween Reels. Your clips, your words, posted before the 31st.
4. Bats, webs and a blood moon, all working for your sales
5. Spooky-cute Reels for your October sale

Sub-line:
> Five ready-made Reels for October. Film a few clips on your phone, drop them in, and each one opens in CapCut
> with your clips already in place.

Price line: ~~$9.99~~ **$4.99**. 5 CapCut templates, with a shot list and a phone kit for each. Instant download.

## 2. What you get

Template cards show the name and its job only (Mercedes 2026-10-19: the clip and length line was too much; it stays in the table below for reference).

Each template is a whole Reel with a business job and an ending that tells people where to buy. Cute and playful,
with real photographed props.

| Template | Its job | You film | Length |
|---|---|---|---|
| **Once in a blood moon** | Open a rare, once-a-year sale. A full moon turns blood red, becomes your video, and the deal arrives with bats and a haunted house. | 3 clips: your product, you or your shop, your product again | 14 s |
| **Caught in our web** | Show what's included or why people love it. A friendly spider drops in, the web forms, and each point gets caught in it. | 5 clips: your product held up, then four points | 15 s |
| **Things I'm batty about** | Share your favourites: best-sellers, a gift guide, the tools you use. Real cute bats carry each one in. | 4 clips: an opening, then three favourites | 15 s |
| **Trick or treat** | Fix a common mistake, then make your offer. Door 1 opens on the trick, door 2 on the treat. | 3 clips: the mistake, your product, the proof | 17.5 s |
| **Now you see it** | Last chance: a limited drop or a sale ending. A snap, real smoke rolls in, and the product is gone. | You with your product, the same shot without it, then your product (final list when built) | 14 s (motion test) |

Every template comes with (shown as six pinned yellow sticky notes from Trick or treat, one short line each: The CapCut project / A shot list / An installer / A recipe card / A phone kit / A matching carousel):
- The CapCut project, with real photographed props and the playful layer (washi tape, sticker edges, handwritten words)
- A shot list: every clip to film, in order, and how long it is
- An installer that puts the template on CapCut's home screen with your clips already in it
- A recipe card with the words to type, and a one-page How to use guide
- A phone kit for CapCut on your phone: the shot guide video, the shot list and every graphic as a PNG
- A matching carousel: the same story as Instagram slides (1080 x 1440), opened from a Canva template link (free
  account): swap the photos, change the words and colours. Slides 1 and 2 both work as covers, and the last slide is your Comment [KEYWORD] call to action

## 3. How it works

**[Mercedes's how-to video goes here]**, shown on a desktop screen: film the clips, drop them in, double-click the installer, open CapCut.

Shown as five icons with one short line each, under the desktop screen, on a film-strip band:

| Icon | Step | Line |
|---|---|---|
| phone | **Film** | Follow the shot list on your phone. |
| folder | **Drop in** | Put your clips in the folder. |
| cursor | **Double-click** | The installer adds your clips. |
| text | **Type** | Your words over the [brackets]. |
| send | **Post** | Add a sound in Instagram. |

## Page look (2026-10-19, after "boring")

Hero on night with the moon, bats and spider. Five Reels on the purple polka-dot night from Things I'm batty about,
with lilac crown, burst and heart doodles. Sticky notes for what's included. How it works on a film strip. Who it's
for on peach under the bat branch, with ticket stubs: Product shops, Digital products, Services, Creators. Questions
on night with the wolf howling at the blood moon. Buy section on the polka dots. Review notes fold away at the bottom.

## 4. Who it's for

On a peach band (#FFC9A8, the brand peach from the Reel covers) to break up the page.

Online business owners and creators who want a Halloween Reel that sells something: a product, a sale, a freebie
or an offer. It works for physical products, digital products and services, since every clip is your own footage.

## 5. FAQ

**Do I need CapCut on a computer?**
For the full template, yes: it opens in CapCut for computer (the free download). Install it and open it once before you run the installer.

**Can I use it on my phone?**
Yes. Every template comes with a phone kit: the shot guide video, the shot list and the graphics as PNG images. In
the CapCut phone app you add your clips and words, then place the graphics as overlays. The full animation is built
for you in the computer version.

**Is music included?**
No sound files are included, so your Reel never gets muted for a song you don't have the rights to. Each template
suggests a sound [SOUND PICKS]. Add it in Instagram after you upload: on a business account, Instagram only shows
sounds cleared for business use.

**Do I need to install any fonts?**
No. The big Halloween lettering is part of the artwork. The words you edit use Arial or Bodoni Moda, and Bodoni Moda
comes inside the template.

**How do I change the words?**
Double-click a text box in CapCut and type over the [brackets]. Keep it to a few words so people can read it in time.

**My computer warns me about the installer. Is that normal?**
Yes, Windows shows this for installers it hasn't seen before. Choose More info, then Run anyway.

**What if I want a different clip in one shot?**
Right-click the clip on CapCut's timeline, choose Replace, and pick another.

## 6. CTA

> **Post your Halloween Reel before the 31st**
> ~~$9.99~~ $4.99 **[BUTTON: Get all 5 Reels]**
> 5 templates, shot lists and phone kits. Instant download.
> [REEL EDITOR UPSELL: one line once it has a name, link and launch date.]

## 7. Listing description (short)

> Five cute Halloween Reel templates for CapCut, each with a selling job: open a once-a-year sale, show what's
> included, share your favourites, turn a common mistake into your offer, or announce a last chance. Film a few clips
> on your phone, drop them in a folder and double-click the installer: the template opens in CapCut with your clips in
> place. Type your words over the brackets and export. Each template comes with a shot list, a recipe card, a one-page
> guide and a phone kit. Each one suggests a sound to add in Instagram (no sound files included).

---

## Demo footage to film

One finished demo Reel per template, made from your own clips run through the real installer, using your own product
(for example a Scrolly tee, or the Business Brain on your laptop screen). Also film the how-to video for section 3.

| Template | Clips to film | You'll also need |
|---|---|---|
| Once in a blood moon | Your product close up (4 s+), you or your workspace (5 s+), your product again (3 s+) | Your sale |
| Caught in our web | Your product held up (15 s+), then four things it includes or does (12, 10, 8, 6 s+) | Four features |
| Things I'm batty about | An opening shot (3 s+), then three favourite products or tools (4 s+ each) | Three favourites |
| Trick or treat | The trick: a common mistake acted out (5 s+), the treat: your product (6 s+), the proof: it working (6 s+) | A mistake and your offer |
| Now you see it | From its shot list once built: you with your product, the same shot without it, your product | Your last-chance offer |

## Zips re-attached (2026-10-21, recipe card fix)
Product 1498 downloads now point at media 1625-1629 (h1 h6 h3 h2 h5; same download ids, so past buyers get the new
files). Re-upload any time with `node website/scrolly-site/reel-pack-zips.mjs 1498` (run from website/scrolly-site).
Old zip media 1519-1521, 1523, 1533 are still in the WP library, unused.

## Shot list PDF download (2026-10-23)
Each product has a first download, "Shot list (all templates)": every clip for every template in one PDF
(automation/reel-template-pack/guide/shot-list-<pack>.pdf, built by `python build/shot_list_pdf.py`). Re-upload after a
rebuild with `node reel-pack-shot-lists.mjs <product id>` from website/scrolly-site (same download id; media 1683 Halloween,
1682 Product; 1681 is an unused first Halloween copy). reel-pack-zips.mjs leaves that download alone.
