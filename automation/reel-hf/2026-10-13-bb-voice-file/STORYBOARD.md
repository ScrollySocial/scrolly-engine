---
format: 1080x1920
duration: 86s
message: "AI doesn't sound like you because it doesn't know you yet: give it a voice file (it's in the Scrolly Business Brain)"
arc: Hook (the pain) → Why (it doesn't know you) → Analogy (you'd brief a human) → Fix (the voice file) → Offer (Business Brain)
audience: Small business owners and creators who use ChatGPT or Claude for captions
mode: collaborative
---

## Decisions

- **Format:** 9:16, ~86s, her voice on camera (the base layer almost the whole time), music in 3 sections + sound effects. Caption keep-out: nothing over her face (upper-middle of frame); relaxed captions sit in the lower third, BOLD key phrases sit above her head.
- **Spine:** the **voice file**: a cream notes-style document that gets written on screen (F10 to F12), is what the AI reads in the demo (F13), and is shown living inside the Business Brain (F14).
- **Captions:** relaxed by default (small cream pill tag, one short line, Figtree), main points BOLD (big Instrument Serif italic key phrase above her head, peach or white).
- **Brand:** cream #F6EEE5 / #FFF4DC, peach #FFC9A8, ink #161210 + black as neutrals, orange #E05A33 as a rare splash, blush #F8DCE5 and mist #E7EEF5 as extra panel colors. Display = Instrument Serif italic, sans = Figtree 700/800, occasional bold caps = Bricolage Grotesque 800 condensed. Stickers: 4-point sparkles, stars, starbursts, sticky notes.
- **Music:** section A (0 to 46s) light and curious, section B (46 to 79s) brighter and upbeat when the fix arrives, section C (79s to end) a short resolving button under the CTA. Bed carved under her voice. Royalty-free files, listed for approval before download.
- **Sound effects:** soft pops on stickers and cards, whoosh on transitions, a "nope" buzz on the bad AI caption, check ticks, keyboard typing under the voice file, a chime on the end card.
- **Held frame:** F04, the line "doesn't automatically know your personality" lands on a background swap and nothing else moves.
- **Bans:** no real chats or real Brain on screen (demo chats are made up and generic); no text over her face; no em dashes or "|"; no glow, no confetti, no generic AI imagery; no slideshow (her footage stays the base except the F04 swap); no static end card (the end card moves and she keeps talking under it).
- **Truthfulness:** the chats and captions in the demos are invented examples; the Business Brain mockup is the real product's design; the banned phrases in F12 come from her own Brain's "Words I never use" list.

## Changes from v1 (her notes, 2026-10-13)

- No italic serif words with color changes (looked Claude-made): statements are now bold condensed sans; emphasis is a peach marker swipe; asides are handwritten with drawn arrows.
- Bad AI caption uses a pattern banned in her voice file: "This isn’t just a candle. It’s an experience." The circle goes around it, never across the text.
- F1 popup moved above her head; graphics sit around her body, not over her face.
- F5: no eyebrow-label card; a HELLO name badge instead. F6: handwritten labels with arrows at her sides.
- F7 rebuilt with her real carousel covers; F8 rebuilt as "the new hire got" receipt vs "AI got" prompt bar.
- F10 to F12: the voice file is a real voice.md file being edited (added lines in green, banned lines in orange).
- F14: Business Brain is the background behind her (cut out), scrolling with a cursor.
- F15: no price; name + scrollyseo.com.

## Locked (2026-10-13)

- Storyboard v4 approved by Mercedes ("approve"). Layouts, copy and placement in storyboard.html are settled; the build dresses them with motion, audio and real assets and never redraws them.

## Frame 1 — Hook: ever asked AI?

- duration: 3.5s
- scene: Her talking; BOLD above her head "Ever asked AI to write for your business?"; a demo chat bubble pops in at top right: "write a caption for my candle shop"
- voiceover: "Have you ever asked AI to write something for your business?"
- transition_in: cut
- status: animated
- blueprint: kinetic-type-beats (Hook) + chat-message component
- audio: music A starts; soft pop on the bubble

Lands the pain in viewer language in beat one.

## Frame 2 — The bad caption

- duration: 3.8s
- scene: A generic AI caption card slides in ("✨ Unlock the magic of handcrafted candles! Elevate your space today 🚀 #SelfCare"); a hand-drawn red scribble strikes it; BOLD "I would literally never write that."
- voiceover: "Read what it gave you and thought, I would literally never write that."
- transition_in: cut
- status: animated
- rules: spring-pop-entrance, css-marker-patterns (scribble)
- audio: "nope" buzz on the scribble

Makes the pain concrete and funny; the made-up caption is the evidence.

## Frame 3 — Fine, but not you

- duration: 8.2s
- scene: A checklist builds beside her: "Grammar ✓", "Information ✓", then "Sounds like you ✗" (orange splash); BOLD "it just doesn't sound like you"
- voiceover: "And funny thing is, it might actually be well-written, like the grammar is fine, and the information's fine, it just doesn't sound like you."
- transition_in: cut
- status: animated
- rules: spring-pop-entrance (staggered), asr-keyword-glow on "sound like you"
- audio: two check ticks, one buzz

States the value gap by the second/third beat: correct isn't the problem, voice is.

## Frame 4 — Held: it doesn't know you

- duration: 4.6s
- scene: Cut at 17.5s to her cut out on a blush background (background removed), big serif "doesn't automatically know your personality" behind/around her; nothing else moves
- voiceover: "That's because AI doesn't automatically know your personality."
- transition_in: cut
- status: animated
- blueprint: titlecard-reveal (held beat), remove-background for the swap
- audio: music A dips; a soft whoosh in and out

The held frame: the diagnosis, given room to land.

## Frame 5 — Imagine a new hire

- duration: 7.4s
- scene: Back on her room (framing change at the 20.1s cut); a sticky note pops in: "New hire: Social media manager, Day 1"; relaxed captions run
- voiceover: "Think about it, if you hired someone to write all your social media content, you would probably spend some time explaining to them your business."
- transition_in: whip
- status: animated
- rules: spring-pop-entrance; whip-pan-cut component
- audio: whoosh on the whip, pop on the note

Opens the analogy: you'd brief a human.

## Frame 6 — Examples, likes, dislikes

- duration: 6.4s
- scene: Three sticky notes fan out one by one on the word: "examples", "what you like ♥", "what you don't like ✗"
- voiceover: "You would show them examples of your writing, tell them what you like, what you don't like,"
- transition_in: cut
- status: animated
- rules: spring-pop-entrance (staggered on the spoken words)
- audio: three pops

Each brief item becomes an object: these are what the voice file will hold later (callback F10 to F12).

## Frame 7 — They'd study your feed

- duration: 5.5s
- scene: A phone mockup slides up showing a scrolling Instagram-style grid (plain placeholder tiles in brand colors, no real accounts); captions name "your style" and "your captions"
- voiceover: "and they would actually go back and look at your feed and see what do you usually do, what's your style, what do your captions look like."
- transition_in: cut
- status: animated
- blueprint: device-surface-showcase (static tour)
- audio: a soft swipe

The human does homework; sets up the contrast.

## Frame 8 — AI gets one sentence

- duration: 6.5s
- scene: Framing change at the 34.1s cut; the whole brief collapses into one tiny prompt bubble: "write a caption." ; BOLD "a sentence or two"; punch-in zoom on her
- voiceover: "But for some reason, we just expect AI to figure all of that out from a sentence or two in a prompt."
- transition_in: cut
- status: animated
- rules: scale-swap-transition (notes shrink into the bubble), coordinate-target-zoom (punch-in)
- audio: a shrinking "fwip"; music A resolves

The contrast that justifies the fix.

## Frame 9 — The fix: a voice file

- duration: 5s
- scene: BOLD depth text "voice file" behind her head (her cut out over it), a sparkle pops
- voiceover: "So one of the things I recommend to fix this is to create your own voice file,"
- transition_in: whip
- status: animated
- blueprint: kinetic-type-beats; remove-background for the depth layer
- audio: music B starts (brighter); sparkle chime

The value claim, named. The spine object gets its name.

## Frame 10 — Writing the voice file

- duration: 7s
- scene: A cream notes-style document "My voice file" types in beside her: "How I talk: warm, clear, a little funny", "I love: short sentences, real examples", "I don't like: hype, big promises"
- voiceover: "and that's really just a document that explains how you talk, what you like, what you dislike,"
- transition_in: cut
- status: animated
- blueprint: typewriter-reveal via notes-typing component
- audio: keyboard typing, light

The spine object built on screen; answers F6's sticky notes (callback).

## Frame 11 — Real examples

- duration: 4s
- scene: The doc grows an "Examples" section: two short caption snippets in her voice slide in as mini cards
- voiceover: "and it gives your AI real examples of things that you've written."
- transition_in: cut
- status: animated
- rules: anchored-layout-expand (doc grows), spring-pop-entrance
- audio: two soft pops

Shows the most important ingredient.

## Frame 12 — Words you'd never use

- duration: 4s
- scene: The doc adds "Never say:" and three phrases get struck through one by one: "Let's dive in", "next level", "In today's fast-paced world"; BOLD "absolutely never use"
- voiceover: "You can also include a list of words or phrases that you would absolutely never use."
- transition_in: cut
- status: animated
- rules: css-marker-patterns (strikethrough), asr-keyword-glow
- audio: three "nope" ticks

Concrete, relatable, and true to her own Brain.

## Frame 13 — Now it sounds like you

- duration: 5.3s
- scene: Framing change at the 65.8s cut; demo chat again: the same "write a caption" prompt, the voice file chip attached, a new caption that sounds human, stamped "sounds like me ✓"
- voiceover: "And AI can reference that every time that it's writing information for you."
- transition_in: cut
- status: animated
- blueprint: prompt-type-submit-generate (instant result) via chat-thread component
- audio: send whoosh, check chime

Proof by callback: F1's question, answered.

## Frame 14 — It's in the Business Brain

- duration: 7.8s
- scene: The Business Brain mockup (real product design: sticky-note header, "Talk to my brain", "My content", "My business") slides in on the right; the voice file doc tucks into it
- voiceover: "This is something that I've included in my Scrolly Business Brain, along with other information that your AI needs to understand your business. So"
- transition_in: cut
- status: animated
- blueprint: device-surface-showcase; card-morph-anchor (doc into the Brain)
- audio: music B lifts; soft pop

The offer, grounded in the spine object.

## Frame 15 — CTA

- duration: 6.7s
- scene: Framing change at the 78.9s cut; she talks while a cream end card rises in the lower third: "Scrolly Business Brain" (serif) / "$47 at scrollyseo.com" (orange splash) + sparkles; captions hide under the card
- voiceover: "If you're tired of editing every single thing your AI writes, you should check out the Scrolly Business Brain on my website."
- transition_in: cut
- status: animated
- blueprint: titlecard-reveal (CTA) + logo-assemble-lockup finish
- audio: music C button; chime on the card

Clear next step; no "link in bio" (bio goes to the $1K Challenge checkout).
