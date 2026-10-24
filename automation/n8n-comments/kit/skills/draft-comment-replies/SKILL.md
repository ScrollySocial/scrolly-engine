---
name: draft-comment-replies
description: Writes reply drafts in the owner's voice for the comments and DMs waiting in their Chat Manager dashboard (status Needs draft), on their Claude plan instead of the paid API. Nothing is sent: they approve each reply in the dashboard. Use when they say "draft my comment replies", "answer my comments", "draft my DMs", or in a scheduled morning run.
---

# Draft comment replies

Chat Manager puts each comment and DM worth answering in the dashboard with status **Needs draft**, already sorted by
free word rules. This skill writes the drafts. Nothing is posted until the owner taps **Approve & post**.

Run from the Chat Manager folder (the one with `docker-compose.yml`), Bash sandbox off.

## Before drafting

- Who they are and what they sell: `config/profile.json` → `owner`, `brand`, `about`. If a comment asks about a
  product, price or date that isn't there, don't guess: write an honest short answer and flag it (step 3).
- Their own voice notes, if they keep any (ask once where; remember the answer in their CLAUDE.md).

## Steps

The dashboard address and secret come from the kit's files; read them into shell variables and never print them:

```bash
H=$(node -e "import('./setup/lib.mjs').then(m=>process.stdout.write(m.readServer().host||''))")
S=$(node -e "import('./setup/lib.mjs').then(m=>process.stdout.write(m.readKeys().INBOX_API_SECRET||''))")
```

1. Read the waiting rows once:
   `curl -s -H "x-inbox-secret: $S" "https://$H/inbox/api/rows?status=Needs%20draft"`
2. For each row read `text`, `kind` (comment or dm), `platform`, `type` and `author`. Correct the type if the word
   rules guessed wrong (Question, Lead, Praise, Other; `priority` true for Question and Lead). Real spam: status
   **Skip**, no draft. A `dm` row is a private message or Story reply; the same rules apply.
3. Write the draft (rules below) and set the status:
   - Instagram or YouTube: **New** (ready for them to review).
   - TikTok: **Reply by hand** (TikTok has no reply API; they paste it).
   - A draft that needs a fact you couldn't confirm: `note` = "Check the facts in this draft before approving."
4. Save each row (build the JSON with `node -e` so quotes are escaped):
   `curl -s -X PATCH -H "x-inbox-secret: $S" -H "Content-Type: application/json" -d '<json>' "https://$H/inbox/api/rows/<id>"`
   with `{"draft": "...", "status": "New", "type": "Question", "priority": true}`. Never set Approved.
5. Finish with one line: drafts written, questions and leads waiting, TikTok replies to paste, and the dashboard link.

## Reply rules

- Warm, clear and short: 1 or 2 sentences that answer what they actually said.
- Questions: a useful answer or one concrete tip when general know-how answers it. Mention "the link in my bio" only
  when they ask about price, joining or getting a product.
- Someone stuck or frustrated: one specific, kind tip first.
- Never state prices, results, timelines or product features that aren't in `about`.
- No filler openers ("Great question"). Don't call people by name: the author is a username.
- Never pitch to someone who only said thanks; never promise results.
- No hashtags. At most one emoji.

## Don't

- Approve or post anything, or reply on the platforms yourself.
- Print or paste the dashboard secret anywhere.
- Draft rows that aren't at Needs draft (they may be editing the others).
