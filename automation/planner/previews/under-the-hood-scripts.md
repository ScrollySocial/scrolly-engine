# Under the Hood: 10 Reel scripts

Talking head, about 45 to 60 seconds each. Facts checked 2026-10-30; re-check prices and menu names the day you film. The cards in your Content Planner are the master copy.

---

## 1: Why your auto-DM sends only one message

**On-screen hook:** Your auto-DM tool can only send one message per comment. Here's why.

**Script**

> If you've set up comment-to-DM, you may have noticed it sends one message and then waits. That's Instagram's rule, and every tool follows it, ManyChat included.
>
> When someone comments your keyword, the tool sends what Meta calls a private reply. You get one per comment, and it has to go out within 7 days of the comment.
>
> After that, you can only keep talking if they reply. Their reply opens a 24-hour window where you can send more.
>
> So make that one message ask for a reply. Mine says: reply READY and I'll send your link. When they answer, my tool sends the signup link, plus one reminder an hour later if they haven't signed up.
>
> Comment AUTODM and I'll send you my free Auto-DM Rulebook.

**Show on screen:** Meta's Private Replies doc (Limitations: one message, 7 days). Your own DM thread: keyword comment, READY ask, link.

**Ending:** Comment AUTODM

*Source: developers.facebook.com Instagram Private Replies (updated 2026-07-02); vault comment-to-dm-n8n-plan.md. Facts checked 2026-10-30; re-check prices and menus the day you film.*

---

## 2: I asked Claude to build my own ManyChat

**On-screen hook:** I asked Claude to build my own ManyChat. It costs me $6 a month.

**Script**

> ManyChat Pro would have cost me $39 a month. So I asked Claude to build me my own version.
>
> Here's what it does now: when someone comments a word like MATH, they get a DM, sign up with their email, and land on my MailerLite list. YouTube comments get a reply with the link, and my TikTok comments show up in the same inbox.
>
> It runs on a $6 a month server. Claude did the technical parts, and I did the clicking.
>
> Two of those clicks almost cost me weeks. Adding a logo to the Google app starts a 4 to 6 week review. And leaving that app in test mode makes it stop working after 7 days.
>
> Comment TRAPS and I'll send you my free checklist of every setup trap.

**Show on screen:** A comment on your Reel, then the DM arriving on your phone. Your Chat Manager inbox. The $6 server line in DigitalOcean. The Google logo field (circled) and the Testing / In production switch.

**Ending:** Comment TRAPS

*Rewritten 2026-10-30 for business owners who use Claude and market online (old version was the Google-logo trap on its own). Facts: ManyChat Pro $39/month (manychat.com/pricing, checked 2026-10-28, re-check before filming); $6 server; traps from vault comment-to-dm-n8n-plan.md.*

---

## 3: Claude drafts my comment replies, I just approve

**On-screen hook:** Claude drafts every reply to my comments. I just tap approve.

**Script**

> Comments from Instagram, YouTube and TikTok all land in one inbox, and Claude drafts a reply to each one.
>
> It sounds like me because it reads my voice file first: how I talk, the words I never use, what I sell and what it costs.
>
> I could let it send replies on its own. I don't, because I'm responsible for what it says, and I've seen enough AI make things up.
>
> So every draft waits for me. I read it, fix anything that's off, and tap approve.
>
> Comment MEMORYKIT and I'll send you my free starter kit, with a voice file template inside.

**Show on screen:** Your Chat Manager inbox with a drafted reply, editing one word, tapping Approve. The voice file open on screen (no private details).

**Ending:** Comment MEMORYKIT

*Rewritten 2026-10-30 for business owners who use Claude and market online (old version: ManyChat uses the same API). Facts: draft-comment-replies skill writes drafts that wait for her OK; her reason for not auto-sending is from her own guide (replace-manychat-with-claude).*

---

## 4: Why a scheduled post can fail (Buffer keeps your file link)

**On-screen hook:** Your scheduled post can fail because of one link.

**Script**

> When Claude schedules my posts in Buffer, it can't upload a file. Buffer's API only takes a link to the image or video.
>
> And Buffer uses that original link when it's time to post. If the link has expired by then, there's nothing to publish.
>
> Notion file links expire, so they don't work. A Google Drive share page doesn't either, because it's a page with a preview, and Buffer needs the file itself.
>
> What works: a direct link that stays up. I upload to my own website's media library and give Buffer that link.
>
> The full auto-posting guide is in the $1K Challenge. Comment AUTOPOST and I'll send you my free link checklist.

**Show on screen:** A Buffer post made by Claude with the website media link. A Notion file link next to it.

**Ending:** Comment AUTOPOST

*Source: Her Buffer API test 2026-10-08 (memory: project_buffer_ai_posting_test); Buffer create_post docs (URL-only assets). Facts checked 2026-10-30; re-check prices and menus the day you film.*

---

## 5: TikTok won't give you your own comments

**On-screen hook:** TikTok won't hand you your own comments. Here's how I get them.

**Script**

> My tool reads Instagram and YouTube comments through their official APIs. TikTok gives creators no API to reply to comments, and no simple way to pull them in.
>
> So once a day my server runs an Apify scraper on my newest 3 videos, 30 comments each. I capped it at 10 cents a run, so it's $3 a month at most, and Apify's free plan includes $5 of credit a month.
>
> The comments land in my inbox with a suggested reply and a button that copies it and opens TikTok. I paste it in myself.
>
> I stay away from tools that control a browser to post on TikTok for you. It's against TikTok's rules and can put your account at risk.
>
> Comment AUTODM and I'll send you my free Auto-DM Rulebook.

**Show on screen:** Apify run page with the $0.10 cap. Your inbox at hooks.scrollyseo.com/inbox with a TikTok row and the Copy & open TikTok button.

**Ending:** Comment AUTODM

*Source: vault comment-to-dm-n8n-plan.md (How it works, TikTok section). Facts checked 2026-10-30; re-check prices and menus the day you film.*

---

## 6: How I make Claude remember my whole business

**On-screen hook:** How I make Claude remember my whole business.

**Script**

> Claude starts every chat fresh. So my business lives in files it reads at the start.
>
> In Claude Code, my project folder has a file called CLAUDE.md with the rules that apply every time, like which folder holds what, and save my work when a task is done.
>
> Then there's a memory folder. Each memory is one small file with one fact: my posting plan, my brand freeze, which tools I retired. A short index lists them all, one line each, and Claude opens a full file only when it matters.
>
> I have about 80 of these now. One fact per file means when something changes, Claude updates that one file, and nothing gets saved twice.
>
> Comment MEMORYKIT and I'll send you my free starter kit.

**Show on screen:** CLAUDE.md open in your project. The memory folder list. MEMORY.md index scrolling.

**Ending:** Comment MEMORYKIT

*Source: Her own setup (CLAUDE.md + memory folder, 80 files on 2026-10-30). Facts checked 2026-10-30; re-check prices and menus the day you film.*

---

## 7: Turn a task you repeat into a one-word Claude skill

**On-screen hook:** Turn a task you repeat into a one-word Claude skill.

**Script**

> Every time I asked Claude for a carousel, I re-explained my rules: sizes, fonts, how to check facts, where to save it.
>
> Now that's a skill. A skill is a folder with one file, SKILL.md, holding the steps and rules for one job. A short description at the top tells Claude when to use it.
>
> So I say "make a carousel" and Claude loads the carousel skill. Or I type its name as a slash command.
>
> I have skills for carousels, Reels, research, importing my Instagram saves and drafting comment replies.
>
> My rule: if I've explained the same thing to Claude three times, it becomes a skill.
>
> Comment MEMORYKIT and I'll send you my free starter kit, with a skill template inside.

**Show on screen:** The .claude/skills folder. scrolly-carousel/SKILL.md top lines. Typing the slash command.

**Ending:** Comment MEMORYKIT

*Source: Her own setup (.claude/skills: scrolly-carousel, scrolly-reels, scrolly-research, ig-saved-to-planner, reel-engine-setup; vault skills/draft-comment-replies). Facts checked 2026-10-30; re-check prices and menus the day you film.*

---

## 8: Claude edits my Reels while I sleep

**On-screen hook:** Claude edits my Reels while I sleep.

**Script**

> At 12:30 every night, a scheduled task starts Claude on my laptop. It runs the same steps each time.
>
> It queues the Reels I approved. It applies the choices I made on my review page. It renders the videos, drafts new Reels from footage waiting in my planner, and leaves me a morning note.
>
> In the morning I watch, approve or leave notes, and the next night picks those up.
>
> Two things I learned the hard way. The laptop has to stay awake: sleep on power is set to never, and the app stays open. And render one video at a time. I once ran five renders at once and my computer crashed.
>
> Comment MEMORYKIT and I'll send you my free starter kit, with a nightly task inside.

**Show on screen:** Scheduled task reels-overnight at 12:30am. The review hub at localhost:4320. A morning note.

**Ending:** Comment MEMORYKIT

*Source: vault reel-engine-handoff.md Session 4 (2026-10-13); memory feedback_one_render_at_a_time (2026-10-20). Facts checked 2026-10-30; re-check prices and menus the day you film.*

---

## 9: Why your AI chat "forgets"

**On-screen hook:** Why your AI chat "forgets" what you told it.

**Script**

> AI can only hold so much at once. That's called the context window, and everything counts: your messages, its replies, and every file it reads.
>
> In a long chat, the oldest parts get summarized or drop out, so details you gave at the start get fuzzy.
>
> My editing sessions read a lot of files, so they fill up fast. That's why I keep the important things outside the chat. Rules live in files Claude rereads every session, and decisions get saved the moment they're made.
>
> When a chat gets long and starts drifting, I start a new one. The files carry everything over.
>
> My rule: if it matters next week, it goes in a file.
>
> Comment MEMORYKIT and I'll send you my free starter kit.

**Show on screen:** A long Claude Code session. Then a fresh session that picks up from CLAUDE.md and memory.

**Ending:** Comment MEMORYKIT

*Source: How Claude Code context and summarizing work; her own setup. Facts checked 2026-10-30; re-check prices and menus the day you film.*

---

## 10: Claude's first answer to my $1,000 math was way off

**On-screen hook:** I asked Claude how many views it takes to make $1,000. Its first answer was way off.

**Script**

> A carousel Claude drafted for me said it takes about 10,000 views to make $1,000 selling a $50 product.
>
> That number assumed 7.5% of viewers would visit my page. Link-in-bio numbers are more like 1 to 3% of the people who visit your profile, and most viewers never visit at all. At a typical 0.3%, it's over 476,000 views.
>
> The math was right. The guess underneath it was way off, and nothing on the slides said so.
>
> So now I ask Claude one question every time it gives me a number: where does this come from, and what's typical?
>
> Comment MATH and I'll send you my free $1K Math worksheet with realistic numbers.

**Show on screen:** The old cover (10,667 views) next to the new one (476,334). The free calculator with Typical selected. You typing the question to Claude.

**Ending:** Comment MATH

*Rewritten 2026-10-30 for business owners who use Claude and market online (old version: Google Testing-mode token). True story from 2026-10-30: views-to-1k carousel used 7.5% (Playbook worked example), rebuilt on the calculator typical rates (1.4% buy, 0.3% visit = 476,334). Sources: Sked Social / Hopp link-in-bio benchmarks, Littledata 1.4%.*
