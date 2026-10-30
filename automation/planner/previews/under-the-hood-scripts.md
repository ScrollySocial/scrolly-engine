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

## 2: The logo that can add 4 to 6 weeks to your Google app

**On-screen hook:** One logo can add 4 to 6 weeks to your Google app.

**Script**

> To reply to YouTube comments from my own tool, I had to make a Google app. On its branding page there's a spot for an app logo. It looks harmless.
>
> Upload one, and once your app is in production, Google makes you go through verification, which takes 4 to 6 weeks. Skip the logo and the app works right away on your own channel.
>
> At sign-in you'll see "Google hasn't verified this app." For your own channel that's expected: click Advanced, then Go to your app.
>
> Two more traps on that same setup: "Get started for free" is the $300 trial that asks for your card, so go to console.cloud.google.com instead. And never click Submit for verification.
>
> Comment TRAPS and I'll send you my free checklist of every setup trap.

**Show on screen:** Google Cloud Branding page with the App logo field (circle it, big X). The "hasn't verified this app" screen, Advanced → Go to.

**Ending:** Comment TRAPS

*Source: Her own setup 2026-10-23, vault comment-to-dm-n8n-plan.md "Customer kit: traps". Facts checked 2026-10-30; re-check prices and menus the day you film.*

---

## 3: ManyChat uses the same Instagram API you can use

**On-screen hook:** ManyChat uses the same Instagram API you can use yourself.

**Script**

> ManyChat is an official Meta Business Partner. It connects to Instagram through Meta's official API.
>
> That same API is open to you. If you make a Meta app and only use it on your own Instagram account, you don't need App Review or business verification. That's how my comment tool works.
>
> So what is ManyChat's $39 a month paying for? The drag-and-drop builder, the hosting, support, and never touching a setup screen. For plenty of people that's worth it.
>
> Mine runs on a $6 a month server. What I give up is setup time, and fixing it myself when something changes.
>
> Comment AUTODM and I'll send you my free Auto-DM Rulebook.

**Show on screen:** ManyChat pricing page (re-check the price the day you film). Meta app dashboard on your account. The $6 droplet.

**Ending:** Comment AUTODM

*Source: manychat.com blog "official Meta business partner"; Meta Instagram platform overview (Standard Access); ManyChat Pro price checked 2026-10-28, re-check before posting. Facts checked 2026-10-30; re-check prices and menus the day you film.*

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

## 10: The 7-day setting that silently breaks your automation

**On-screen hook:** The 7-day setting that silently breaks your automation.

**Script**

> My YouTube comment replies run through a Google app. A new Google app starts in Testing mode.
>
> In Testing, Google's sign-in tokens expire after 7 days. Nothing warns you. A week later, your replies just stop.
>
> The fix is one button: on the Audience page, click Publish app so it says In production. Google asks for a home page and a privacy policy link on the Branding page first.
>
> If you set it up in Testing, sign in again after publishing so you get a fresh token.
>
> And no logo, so you don't trigger the 4 to 6 week verification.
>
> Comment TRAPS and I'll send you my free checklist of every setup trap.

**Show on screen:** Google Cloud Audience page: Testing → Publish app → In production. Branding page links.

**Ending:** Comment TRAPS

*Source: Google OAuth docs (Testing refresh tokens expire in 7 days); her setup 2026-10-23. Facts checked 2026-10-30; re-check prices and menus the day you film.*
