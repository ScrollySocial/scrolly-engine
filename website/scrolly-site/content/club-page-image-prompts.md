# Club page images: what we need + prompts

For the $1K / $10K / $24K Club page template (`pages/offers.mjs`, 2026-10-05). Each image drops into a slot in `PRODUCTS[].img`, `HERO_IMG` or `VIDEO`.

## Sizes

| Slot | Shape | Export size | Format |
|---|---|---|---|
| Hero (right of headline) | 5:4 landscape | **1500 × 1200 px** | WebP or PNG |
| Product cards (11 on $1K) | 1:1 square | **1000 × 1000 px** | WebP or PNG, product centered with ~8% empty margin all round (the card crops nothing, it shrinks to fit) |
| Video | 16:9 | **1920 × 1080 px** MP4, plus a 1920 × 1080 still for the poster frame | MP4 + WebP |

## Honesty rule for these images

Covers and app screens must be the **real** ones. AI can make the scene (desk, phone, lighting); the cover or screen inside it should be your actual file pasted in afterwards, or the image becomes a fake product preview. So below, "screen" items are prompts for an **empty device mockup** you then drop a real screenshot into.

## Shared style (paste at the start of every prompt)

> Editorial product photography for a premium consumer brand. Warm cream background (#f7f3ec), soft natural daylight from the left, gentle realistic shadows, shallow depth of field. Black, white and cream palette with at most one small orange (#ff4b16) accent. Clean, restrained, fashion-magazine feel. No people, no hands, no text, no logos, no watermarks. Square 1:1 composition, product centered with empty margin on all sides.

(For the hero, swap the last sentence for: "Wide 5:4 composition, objects grouped right of center, empty cream space on the left.")

## Hero (1500 × 1200)

> [shared style, hero version] A flat-lay arrangement on a cream linen surface: a printed A4 workbook with a plain black-and-white cover, a second slimmer printed guide beside it, a smartphone with a blank screen, a laptop half in frame with a blank screen, a folded heavyweight cotton t-shirt with black and white stripes, a pen. Overhead angle, slightly tilted. Leave the covers and screens blank so real ones can be added.

Then paste in: the real Playbook cover, Quality Guide cover, a Reel idea on the phone, the My $1K Plan screen on the laptop, the real shirt.

## Product cards (1000 × 1000 each)

| # | Card | Label | Prompt (after the shared style) | Then add |
|---|---|---|---|---|
| 1 | $1K Club Playbook | Club | A printed A4 spiral-free workbook standing slightly angled, plain blank cover, thick matte paper, a second copy lying flat behind it. | Real Playbook cover |
| 2 | Social Media Quality Guide | Club | A slim printed guide, blank cover, fanned open to show a page with blank image boxes, lying at an angle. | Real guide cover (once the name is final) |
| 3 | Reel + carousel templates | Club | A smartphone standing upright with a blank screen next to three blank square cards fanned out like a carousel. | Real safe-zone guide on the phone, real carousel template on the cards |
| 4 | Checklist + worksheets | Club | Three printed worksheet pages, slightly overlapping, with a black pen resting on top; pages blank. | Real worksheet pages |
| 5 | $1K Math calculator | Club | A smartphone lying at a slight angle with a blank screen. | Screenshot of the real calculator |
| 6 | Your $1K Plan | Challenge only | A laptop, three-quarter view, blank screen. | Screenshot of My $1K Plan (My Account) |
| 7 | 25 Reel ideas a week | Challenge only | A smartphone standing upright, blank 9:16 screen, a small orange sticky note beside it. | A real Reel idea from the weekly list |
| 8 | Notion content tracker | Challenge only | A laptop, straight-on view, blank screen. | Screenshot of the real Notion tracker |
| 9 | Auto-posting setup | Challenge only | A laptop and a phone side by side, both screens blank. | Screenshot of the Buffer queue (laptop), a posted video (phone) |
| 10 | 60 Canva templates | Challenge only | A grid of nine blank portrait cards (4:5) laid out neatly in three rows of three. | Nine real carousel/Story templates |
| 11 | Stripe shirt | Challenge only | Already done: `shirt-1k-challenge-back-cut.webp` | |

## Video (1920 × 1080)

Not an image prompt: record landscape 16:9. Keep it short (60 to 90 seconds): what the Club is, what the Challenge adds, how the shirt is earned. No "guaranteed" or income claims; say "go after your first $1,000", not "make $1,000".

## $10K and $24K

No product images yet: their contents aren't decided. Hero slot only, same hero prompt, once those offers are real.
