export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  content: string;
}

export const posts: BlogPost[] = [
  {
    slug: "how-to-stop-chasing-clients-over-email",
    title: "How to Stop Chasing Clients Over Email (And Actually Get Feedback Fast)",
    description: "Chasing clients over email for feedback is a time sink every freelancer knows. Here's why it happens and how to fix it for good.",
    date: "2025-03-10",
    readTime: "7 min read",
    content: `
<p>You finish a design. You send it over. You wait.</p>

<p>Three days pass. Nothing. So you send a follow-up. "Just checking in — did you get a chance to look at this?" Another day. Still nothing. You send another. Then their reply arrives: "Oh sorry, I missed this — can you resend it?"</p>

<p>If you've been freelancing for more than five minutes, you know this loop intimately. And yet, somehow, most freelancers keep running it — project after project, client after client — hoping this time will be different.</p>

<p>It won't be different. Not until you change the system.</p>

<h2>Why email is structurally broken for client feedback</h2>

<p>The problem isn't your clients. Most of them genuinely intend to respond. The problem is that email is a terrible medium for asynchronous creative collaboration, and it was never designed to be one.</p>

<p>Here's what happens in a typical inbox: your client receives 80-150 emails a day. Your project update competes with invoices, team messages, newsletters, meeting requests, and their own clients chasing them. Your carefully worded email gets skimmed, mentally flagged for "later," and then buried under 30 new messages by the end of the afternoon.</p>

<p>It's not laziness. It's inbox physics.</p>

<p>There's also no clear call to action. You send a file — but what exactly do you want? Approval? Written feedback? A decision on option A or B? Email collapses all of that into a grey area where the client doesn't know what "done" looks like, so they put it off until they have more time (which never comes).</p>

<p>And then there's the thread problem. By the time you're three weeks into a project, your feedback thread has 40 replies, attachments scattered across 12 different messages, and nobody can remember which version is current. The client has to go archaeological just to give you a simple "yes, I like it."</p>

<h2>What freelancers actually need from a feedback system</h2>

<p>When you strip it down, you need three things:</p>

<ul>
  <li><strong>A single place to send files</strong> — not Google Drive, not WeTransfer, not email. One link that always has the latest version.</li>
  <li><strong>A clear action for the client to take</strong> — "Review this and click Approve or Request Changes." Not "let me know what you think."</li>
  <li><strong>A notification the client actually sees</strong> — not another email in their inbox, but an email that links directly to the thing that needs attention, with minimal friction to respond.</li>
</ul>

<p>When all three of these are in place, feedback cycles collapse from days to hours. Not because your clients suddenly got more organised — but because you've removed every reason they had to procrastinate.</p>

<h2>Practical steps to get faster feedback starting today</h2>

<h3>1. Stop asking open-ended questions</h3>

<p>The single most effective change you can make is to stop asking "what do you think?" and start asking "can you approve this, or should I make changes?" Open questions require mental energy. Binary questions require a decision.</p>

<p>Instead of: "I've attached the first homepage concept — let me know your thoughts!"</p>

<p>Try: "Concept one is attached. I need a yes/no on the direction before I can move to mobile. Can you take a look today and either approve it or flag what needs to change?"</p>

<p>The second version tells the client exactly what's needed, why it matters, and when. It's much harder to file away for later.</p>

<h3>2. Set a response expectation upfront</h3>

<p>During your onboarding call or in your first project email, tell the client how feedback works. "I'll send work for review every Tuesday and Thursday. I'll need your response within 48 hours to stay on schedule." This isn't aggressive — it's professional. Clients who know what to expect are far less likely to ghost you.</p>

<h3>3. Send a reminder that helps, not hounds</h3>

<p>If you haven't heard back in 48 hours, send one reminder — but frame it as helpful, not chasing. "Quick note: I'm ready to move to phase 2 as soon as I hear back from you on the homepage direction. Happy to jump on a 10-minute call if it's easier than written feedback." This reframes the delay as a blocker for them, not just for you.</p>

<h3>4. Use a dedicated project link instead of email attachments</h3>

<p>Attachments in email are where feedback goes to die. The client downloads the file, saves it somewhere, forgets where, and now there's friction every time they need to find it again.</p>

<p>A tool like Handoff gives every project a single shareable link. You post your update there — with the file attached — and the client gets one email with one click to see everything. All versions, all history, all conversation. No excavating email threads. The client can approve directly from the portal, and you get notified immediately.</p>

<h3>5. Make the approval step feel small</h3>

<p>The more effort a task feels like, the longer people put it off. If reviewing your work feels like a 30-minute commitment, your client will wait until they have a free afternoon — which is never. Make it feel like 3 minutes.</p>

<p>"Takes 2 minutes to review — just one screen and an approve/feedback button." That framing is accurate and it removes the mental barrier that makes people delay.</p>

<h3>6. Default to async, offer sync as the escape hatch</h3>

<p>Some clients will always prefer a call over written feedback. That's fine — but don't make calls the default. Make written async approval the default, and offer a call when they get stuck. "If it's easier to talk through it, I'm free Thursday at 2pm." Most of the time, the written option is fine and they'll use it.</p>

<h2>The underlying shift</h2>

<p>Chasing clients over email feels like a communication problem. But it's really a systems problem. When there's no clear home for project files, no defined feedback process, and no specific action the client needs to take, delay is the natural outcome.</p>

<p>The freelancers who rarely chase clients aren't more charming or more persistent. They've just built a system that makes it easy for clients to respond — and slightly awkward not to. One link, one action, one click to give feedback. The friction is so low that "I'll do it later" never gets a foothold.</p>

<p>Start with the quick wins: clearer asks, upfront expectations, and a single place to share work. Your inbox — and your sanity — will thank you.</p>
    `.trim(),
  },
  {
    slug: "how-to-organise-freelance-projects",
    title: "How to Organise Your Freelance Projects So Nothing Falls Through the Cracks",
    description: "Scattered files, missed deadlines, and lost feedback are signs of a broken system. Here's how to organise freelance projects properly.",
    date: "2025-03-03",
    readTime: "8 min read",
    content: `
<p>Ask any freelancer how they organise their client work, and you'll get one of two answers: a carefully described system they haven't actually used in three months, or a slightly defensive "it works for me" followed by a vague wave at their desktop.</p>

<p>The chaos of freelance project management isn't a character flaw. It's what happens when you take a job that usually requires a project manager, a coordinator, and an account manager, and hand it to one person who also has to do the actual work.</p>

<p>But here's the thing: you don't need a complicated system. You need a consistent one.</p>

<h2>The most common ways freelance projects fall apart</h2>

<p>Before you can build a better system, it's worth understanding where the cracks appear.</p>

<h3>No single source of truth</h3>

<p>This is the big one. Files live in three different Google Drive folders. The brief is in an email from six weeks ago. The client's feedback is split across a Slack thread, two email replies, and a voice note. Nobody — including you — knows where the "real" version of anything is.</p>

<p>When information is scattered, mistakes happen. You act on outdated feedback. You miss a detail the client mentioned once in passing. You send a version you thought was the latest but wasn't.</p>

<h3>No status visibility</h3>

<p>What's the current status of each project? If you can't answer that in ten seconds without opening multiple tabs, your system has a problem. When you can't see at a glance what's in progress, what's waiting for client feedback, and what's overdue, things fall through the cracks simply because they're out of sight.</p>

<h3>No project handover process</h3>

<p>You finish a project and… move on. The files stay in a folder somewhere. A month later the client comes back with a question and you spend 20 minutes finding the right version of the right file to answer them. A good system accounts for the end of a project as much as the beginning.</p>

<h3>Keeping too much in your head</h3>

<p>Freelance brains are busy. Between client communication, actual work, invoicing, finding new clients, and admin, there's a constant low-level cognitive load. When your project management system is "I'll remember that," every task and deadline is one distraction away from being forgotten.</p>

<h2>A simple system for organising freelance projects</h2>

<p>The best system is one you'll actually use. Here's one built around that constraint.</p>

<h3>One folder per client, one folder per project</h3>

<p>This sounds obvious, but many freelancers have their file management devolve over time. The rule: every client gets a top-level folder. Every project gets a subfolder inside it. Inside each project folder:</p>

<ul>
  <li><strong>Brief</strong> — the original brief, any onboarding notes, scope of work</li>
  <li><strong>Assets</strong> — client-supplied logos, photos, brand assets</li>
  <li><strong>Working files</strong> — your editable source files</li>
  <li><strong>Deliverables</strong> — exported, client-ready files, numbered by version (v1, v2, v3)</li>
  <li><strong>Feedback</strong> — a running document where you paste written feedback as it arrives</li>
</ul>

<p>The discipline is keeping this structure consistent across every project, not just new ones.</p>

<h3>A weekly project review (takes 15 minutes)</h3>

<p>Every Monday morning, spend 15 minutes reviewing your active projects. For each one, ask:</p>

<ul>
  <li>What's the status? (Waiting for feedback, in progress, blocked?)</li>
  <li>What's the next action, and when does it need to happen?</li>
  <li>Is anything overdue or at risk of going overdue?</li>
</ul>

<p>This weekly review is the single highest-leverage habit you can build as a freelancer. It takes everything out of your head and puts it on paper (or a screen), which means you can trust the system instead of trying to mentally track everything.</p>

<h3>A project card or status tracker</h3>

<p>You don't need Jira. You don't need Asana. You need a simple list of your active projects with a current status for each. This could be a Notion table, a spreadsheet, or a sticky note on your monitor. The format matters less than the habit of keeping it updated.</p>

<p>Useful status categories: Brief received, In progress, Waiting for client feedback, Revisions in progress, Final delivery, Completed.</p>

<h3>A single link for client communication</h3>

<p>One of the biggest time sinks in freelance project management is context-switching between communication channels. Email, Slack, WhatsApp, Google Docs comments — each one adds friction and increases the chance of missing something.</p>

<p>Giving each project a dedicated home — like a Handoff portal — means every update, file, and piece of feedback has one place to live. When your client wants to know the status, they check the portal. When you want to find a piece of feedback from three weeks ago, it's there. No digging through email threads or Slack history.</p>

<h3>Version your files religiously</h3>

<p>Never save over a previous version. Ever. The minute you do, you lose the ability to go back — and clients will ask you to go back. Add a version number to every deliverable: logo_v1.pdf, logo_v2.pdf, logo_v3_approved.pdf. It takes two seconds and has saved countless projects from disaster.</p>

<h2>The tools that help (and the ones that don't)</h2>

<p>The freelance tools market is crowded with software promising to fix your project management problems. Most of it is overkill. Here's a simple stack:</p>

<ul>
  <li><strong>File storage</strong>: Google Drive or Dropbox for working files. Pick one and stick to it.</li>
  <li><strong>Tasks and deadlines</strong>: A simple tool like Todoist, Notion, or even a text file. The point is to have a single list of what needs to happen next across all projects.</li>
  <li><strong>Client communication</strong>: A dedicated project portal (rather than email) keeps all client-facing communication in one place and makes it easy to reference later.</li>
  <li><strong>Time tracking</strong>: If you bill hourly, Toggl or Harvest. If you don't, skip it.</li>
</ul>

<p>The temptation is to add more tools when things feel chaotic. Resist it. More tools usually means more things to maintain, more context-switching, and more ways for things to fall out of sync. Fewer tools used consistently beats more tools used occasionally every time.</p>

<h2>The habits that make the system stick</h2>

<p>Systems only work if you use them. These three habits keep the whole thing running:</p>

<p><strong>Process everything immediately.</strong> When a client sends feedback, paste it into your feedback doc immediately — don't leave it in your inbox to "deal with later." When you deliver a file, add it to the project portal immediately. The cost of doing it now is 30 seconds. The cost of doing it later is 10 minutes of archaeology.</p>

<p><strong>Close out projects properly.</strong> When a project ends, spend 10 minutes archiving everything: move files to an archive folder, mark the project complete in your tracker, save any templates or assets you might reuse. This closing ritual makes future-you much happier when a client comes back six months later.</p>

<p><strong>Do the weekly review without fail.</strong> This is the one non-negotiable. Everything else in the system is designed to feed this 15-minute check-in. Skip it for a few weeks and the whole thing starts to unravel.</p>

<p>The goal isn't perfection. The goal is a system consistent enough that nothing important gets missed — and simple enough that you'll actually keep using it when things get busy.</p>
    `.trim(),
  },
  {
    slug: "how-to-create-a-client-portal",
    title: "How to Create a Client Portal for Your Freelance Business",
    description: "A client portal keeps your projects organised and your clients informed. Here's what one is, why you need it, and how to set one up fast.",
    date: "2025-02-24",
    readTime: "6 min read",
    content: `
<p>At some point in every freelancer's career, the email-and-Google-Drive approach starts to collapse under its own weight. Files in ten different places. Feedback buried in email threads. Clients texting you to ask for "the latest version." You spend as much time managing the communication around your work as you do doing the actual work.</p>

<p>This is exactly the problem a client portal solves.</p>

<h2>What is a client portal?</h2>

<p>A client portal is a dedicated space — typically a web page with a unique link — where a client can access everything related to their project: the current status, files you've shared, updates you've posted, and actions they need to take (like approving a deliverable or requesting changes).</p>

<p>The key difference between a client portal and just sending an email with an attachment is centralisation. Instead of project information being scattered across inboxes, Slack threads, and shared drives, it lives in one place that both you and the client can always find.</p>

<p>A good client portal gives your client visibility into what's happening without them having to ask you. Which means fewer "just checking in" messages, fewer status update calls, and more time for you to do the work.</p>

<h2>Why freelancers need one</h2>

<p>You might be thinking: "I've managed fine without one so far." And maybe you have. But consider what "fine" actually looks like in practice:</p>

<ul>
  <li>You spend time every week chasing clients for feedback that's already overdue</li>
  <li>Clients ask you "where's the latest file?" more than once per project</li>
  <li>You've lost feedback because a client's message got buried in your inbox</li>
  <li>You feel slightly disorganised even when you're actually doing great work</li>
</ul>

<p>If any of those sound familiar, you're already paying the cost of not having a client portal — you're just paying it in time and stress rather than money.</p>

<p>Beyond the operational benefits, there's a perception benefit too. A freelancer who sends a client a clean, professional project link looks different from one who shares a Google Drive folder and asks for replies by email. The first one looks like a studio. The second one looks like an individual. Both might do equally good work — but the first one commands higher rates and gets more referrals.</p>

<h2>What to look for in a client portal tool</h2>

<p>Not all client portals are built for freelancers. Some are enterprise-focused, with complex setup, team features you don't need, and pricing designed for agencies. Here's what actually matters for a solo freelancer:</p>

<h3>No client login required</h3>

<p>This is the most important thing. If your client has to create an account to see their project, half of them won't. The friction of signing up for yet another platform is enough to make the whole system fall apart. Look for a portal that works with a shareable link — the client clicks, they see everything, no login needed.</p>

<h3>File sharing and versioning</h3>

<p>Your portal should be able to hold the files you're delivering, with clear versioning so clients always know which is the latest. The ability to mark a file as "approved" is a bonus that saves a lot of back-and-forth.</p>

<h3>Project updates</h3>

<p>You should be able to post updates — milestones, notes, progress reports — directly in the portal. This creates a running record of the project that both parties can reference, and it means you don't have to compose a full email every time you want to tell a client what you've been working on.</p>

<h3>Simple setup</h3>

<p>The portal should take minutes to set up, not hours. You're a freelancer, not a web developer. If the tool requires complex configuration, custom domains, or technical knowledge to get started, it's designed for someone else.</p>

<h3>Affordable pricing</h3>

<p>You don't need to pay $29/month for a client portal. That's agency pricing. Look for something built specifically for solo freelancers — you can expect to pay somewhere in the $8-15/month range for a tool that covers everything you need.</p>

<h2>How to set up a client portal with Handoff</h2>

<p>Handoff is a client portal tool built specifically for freelancers. Here's how setting one up actually works:</p>

<p><strong>Step 1: Create a project.</strong> Sign up (free for 14 days, no card required), click "New Project," add the project name and your client's details. Takes about 30 seconds.</p>

<p><strong>Step 2: Get your project link.</strong> Every project automatically gets a unique shareable link — something like gethandoff.co/p/abc123. This is the URL you'll give your client. It never changes, and they can bookmark it.</p>

<p><strong>Step 3: Post your first update.</strong> Write a quick intro — "Welcome to your project portal. You'll find all files and updates here. I'll post progress as we go." Hit post. Your client gets an email with a link directly to the portal.</p>

<p><strong>Step 4: Share files and request approvals.</strong> When you have work to review, upload the file and create an approval request. Your client gets notified, reviews the file, and clicks Approve or Request Changes — all without ever leaving the portal.</p>

<p>That's it. No onboarding call needed. No setup wizard. The whole thing runs through a single link that your client visits when they need to.</p>

<h2>Making your portal work for you</h2>

<p>Once you have a portal set up, a few habits will make it genuinely useful rather than just another tool you maintain:</p>

<p><strong>Post updates consistently.</strong> Even a short "worked on X today, uploading the draft tomorrow" keeps clients informed and reduces check-in messages. Clients who feel kept in the loop are easier to work with and more likely to refer you.</p>

<p><strong>Use it as your single source of truth.</strong> Resist the temptation to also share files by email "just to be safe." The value of the portal comes from everything being in one place. Every time you send a file over email as well, you're undermining that.</p>

<p><strong>Send the link early.</strong> Share the portal link in your first message after a project is confirmed, before you've even started working. It signals professionalism immediately and sets the expectation that this is how the project will be managed.</p>

<p>Building a client portal into your workflow is one of the highest-ROI changes you can make as a freelancer. The setup time is measured in minutes; the ongoing benefit is measured in hours saved per project. If you're still running on email and shared drives, now is the time to change that.</p>
    `.trim(),
  },
  {
    slug: "how-to-share-project-updates-with-clients",
    title: "How to Share Project Updates with Clients Without the Back-and-Forth",
    description: "Clients ask 'what's the status?' when they feel out of the loop. Here's how to share project updates proactively and cut the back-and-forth.",
    date: "2025-02-17",
    readTime: "7 min read",
    content: `
<p>Every freelancer has been on the receiving end of the "just checking in" email. You're deep in work, making good progress, and then: "Hi — just wanted to check in and see where things are at?" You stop, compose a reply, lose your flow, and add five minutes of admin to your day.</p>

<p>Multiply that by three clients, twice a week, across a full project, and you're looking at a significant chunk of time spent on status updates that could have been avoided entirely.</p>

<p>The clients who send those check-ins aren't being difficult. They're filling an information vacuum. When they don't know what's happening, they have two options: assume everything's fine (which feels irresponsible when they're paying someone) or ask. Most will ask.</p>

<p>The solution isn't to ask clients to trust you more. It's to give them less reason to worry in the first place.</p>

<h2>Why clients ask "what's the status?"</h2>

<p>Before fixing the problem, it's worth understanding why it happens. Client check-ins almost always come from one of three places:</p>

<p><strong>Silence anxiety.</strong> You haven't communicated in a while. From your side, this is because you're heads-down making progress. From the client's side, silence feels like a void. Are you stuck? Did you forget? Is there a problem they need to know about?</p>

<p><strong>No visibility into the process.</strong> The client doesn't know what your work actually involves day-to-day. They approved a brief, they're waiting for a deliverable, and the period in between is a black box. When people can't see into a process, they fill the gap with anxiety.</p>

<p><strong>No clear next milestone.</strong> If a client doesn't know when they're next supposed to hear from you, every day that passes without contact becomes a question mark. "Was I supposed to hear from them today? Is this late?"</p>

<p>Address these three causes and the check-in emails almost stop entirely.</p>

<h2>The case for proactive updates</h2>

<p>Proactive updates — sharing progress before you're asked about it — change the dynamic of a client relationship fundamentally. Instead of the client pulling information from you, you're pushing it to them.</p>

<p>This does more than just reduce check-in emails. It builds trust. A client who receives regular updates, even brief ones, feels like they're working with someone who has the project under control. They're less likely to second-guess your decisions, less likely to micromanage, and more likely to approve work quickly because they've been along for the ride.</p>

<p>There's also a practical benefit: proactive updates create a project record. When a client says "I thought we agreed on X," you can point to the update from three weeks ago that documented the decision. That kind of paper trail protects you.</p>

<h2>What a good project update looks like</h2>

<p>The format matters almost as much as the frequency. A good update is short, specific, and actionable. It tells the client what happened, what's happening next, and — if relevant — what you need from them.</p>

<p>Here's a structure that works:</p>

<ul>
  <li><strong>What I've done since the last update</strong> — specific, not vague ("completed homepage layout" not "been working on the design")</li>
  <li><strong>What I'm working on next</strong> — sets expectations for when they'll hear from you again</li>
  <li><strong>Any decisions or approvals needed</strong> — this is the most important part; don't bury it</li>
</ul>

<p>An update following this structure can be written in under five minutes and reads in under a minute. That's the target. Longer isn't better — clients won't read it, and writing it takes time you don't have.</p>

<h2>How often should you update clients?</h2>

<p>This depends on the project length and the client, but a useful default is twice a week for active projects — once mid-week, once at the end of the week. The end-of-week update is particularly valuable because it closes the mental loop for the client over the weekend. They're not spending Saturday wondering where things are.</p>

<p>For longer, lower-intensity projects, weekly updates are usually sufficient. For fast-moving projects with hard deadlines, daily or even twice-daily updates might make sense.</p>

<p>Whatever cadence you choose, communicate it to the client upfront: "I'll post updates to the project portal every Tuesday and Friday. You'll get a notification each time." Now the silence between updates is expected and comfortable rather than anxiety-inducing.</p>

<h2>Where to share your updates</h2>

<p>Email is the instinctive answer, but it's not the best one. Here's why: email updates get buried. A client reads your Thursday update, thinks "great," and closes the email. Two weeks later, they can't find it. Next month, when there's a question about what was agreed, you're both digging through email threads looking for a message from six weeks ago.</p>

<p>A better approach is to post updates to a central project space — a portal that holds the full history of the project. This way, every update is permanently accessible, the client can review the timeline at any time, and you have a complete record of every communication.</p>

<p>Tools like Handoff are built exactly for this. You post an update once, the client gets an email notification, and the update lives permanently in the project portal. Six months later, if anyone needs to know what happened when, it's all there — no email archaeology required.</p>

<h2>Templates for common project updates</h2>

<h3>End-of-week update (no deliverable ready)</h3>

<p>"This week I completed the initial wireframes for all five pages and started on the homepage visual design. Next week I'll have the first visual concepts ready for your review — expecting to send those through by Wednesday. No action needed from you right now."</p>

<h3>Deliverable ready for review</h3>

<p>"The first homepage concept is ready. I've uploaded it to the project portal — you should be able to see it by clicking the link above. I'd love your approval or feedback on the direction before I move to the other pages. If you have 10 minutes this week to take a look, that would keep us on track for the Friday deadline."</p>

<h3>Waiting on client input</h3>

<p>"Quick note: I'm at the stage where I need your final brand colours and the approved copy before I can continue. I've attached what I have so far so you can see where things stand. Once I have those two things, I can complete the design in two days."</p>

<h3>Project milestone completed</h3>

<p>"Phase 1 is wrapped — all five page designs are complete and in the deliverables folder. Phase 2 (mobile layouts) starts Monday. I'll have the first batch ready for review by Wednesday."</p>

<h2>The mindset shift that makes this easy</h2>

<p>Many freelancers feel reluctant to send frequent updates because it feels like reporting to a boss. But that framing misses the point. You're not reporting — you're managing. Project updates are a tool for keeping things on track, getting faster approvals, and building the kind of client relationship that leads to repeat work and referrals.</p>

<p>Think of it like this: the clients who pay on time, approve quickly, and come back for more work are the same clients who feel informed and in control throughout the project. That's not a coincidence. Regular updates are how you create that feeling.</p>

<p>Build the habit, set up the system, and the back-and-forth disappears. Not because clients stopped caring — but because there's nothing left to wonder about.</p>
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
