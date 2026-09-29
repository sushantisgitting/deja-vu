# 3-Minute Video Demo Script: Déjà Vu (dejavu-oncall)

## 5 YouTube Title Options
1. Stop Debugging Outages From Scratch: On-Call Agent with Hindsight Memory
2. Building an AI Incident Response Agent with Hindsight Agent Memory
3. Why Generic LLMs Fail at On-Call Triage (And How Memory Fixes It)
4. Déjà Vu: The On-Call Agent That Remembers Every Past Production Outage
5. Grounding AI Incident Response using Hindsight & Groq LLMs

---

## Video Script

### [0:00 - 0:30] INTRO: THE VISION
**[ON-SCREEN CUE]**: Show `/` (Landing Page) in browser (`app/page.tsx`). Cursor hovers over headline *"It's happened before. Now your on-call knows."*

**NARRATOR ([MY NAME])**:
"Hey everyone, I'm [MY NAME]. When production breaks at 2 AM, the on-call engineer starts from zero. The fix for this exact database failure or cache storm usually exists in a postmortem from three weeks ago that nobody remembers. Generic LLMs give generic advice—they tell you to 'restart the service' or 'check logs', without knowing your stack or history.

This is **Déjà Vu**, an incident response agent powered by Hindsight agent memory. It retains every past outage and operational preference, recalling them in real-time when new alerts fire."

---

### [0:30 - 1:00] THE PROBLEM: GENERIC LLM TRIAGE
**[ON-SCREEN CUE]**: Click *"OPEN THE CONSOLE"* to navigate to `/console` (`app/console/page.tsx`). Click Demo Scenario 1: *"1. Recurring Outage (pgbouncer pool)"*. Click *"RUN TRIAGE"*.

**NARRATOR**:
"Let's look at the console. Here's a live `pgbouncer` connection pool exhaustion alert on `ledger-db`.

Look at the left pane—*WITHOUT MEMORY*. The generic LLM tells us to restart the `payments-worker` pods. But in our infrastructure, pod restarts only clear connections for about ten minutes before the pool fills up again. The generic model doesn't know that because it has zero memory of our history."

---

### [1:00 - 2:30] LIVE DEMO: HINDSIGHT RECALL & RESOLVE
**[ON-SCREEN CUE]**: Focus on Right Pane (*WITH HINDSIGHT MEMORY*). Highlight recalled memory cards animating in (`INC-2104`, `INC-2148`), recall latency (~140ms), and verdict badge `SEEN BEFORE`.

**NARRATOR**:
"Now look at the right pane—*WITH HINDSIGHT MEMORY*. In 140 milliseconds, Hindsight recalled `INC-2104` and `INC-2148`.

It nailed the exact root cause: `payments-worker` raised concurrency without adjusting `pgbouncer default_pool_size`. It cites the exact postmortem, tells us to lower concurrency to 16, and specifically warns us *NOT* to restart pods because it failed in prior incidents!

Now let's test a brand new issue. Click Demo Scenario 3: *"3. Novel Incident (S3 Signature Mismatch)"*.

Notice the verdict badge turns orange—`NOVEL INCIDENT (NO RECALL)`. The agent honestly admits it has no prior memory of this.

I'll fill in the root cause: *'S3 Node time drift caused AWS SigV4 signature mismatch'*, fix: *'Resynced chrony NTP daemon'*, and click *'COMMIT TO HINDSIGHT BANK'*.

Now, watch this: I hit *'RUN TRIAGE'* on the exact same alert again... and boom! Hindsight instantly recalls our newly resolved incident as `SEEN BEFORE`. It learned in real time!"

---

### [2:30 - 3:00] TAKEAWAY & REFLECT
**[ON-SCREEN CUE]**: Navigate to `/memory` (`app/memory/page.tsx`). Click *"FIND PATTERNS (REFLECT)"*. Show synthesized pattern answer.

**NARRATOR**:
"Over in the Memory Bank at `/memory`, we can also run Hindsight `reflect`. It scans across all 18 historical incidents to find systemic patterns—like catching that database pool exhaustion keeps recurring after worker scaling releases.

Memory is the star of this product. By combining Hindsight's agent memory with Groq's high-speed LLM inference, on-call engineers never have to debug the same outage twice.

Check out the full code repository linked below. Thanks for watching!"
