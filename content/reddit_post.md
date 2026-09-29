# Reddit Post Submissions

## Main Title (for r/sideproject)
I built an incident response agent using Hindsight agent memory to stop on-call engineers from debugging recurring outages from scratch

## Alternate Titles
- **r/LLMDevs**: Why recall-before-generate matters for incident triage: building a memory-backed on-call agent with Hindsight and Groq
- **r/AI_Agents**: Déjà Vu: An incident response agent that retains postmortems and recalls past fixes using Hindsight agent memory
- **r/aimemory**: Using Hindsight agent memory to retain 18 production incidents and perform grounded 2 AM outage triage

---

## First Comment (for r/sideproject)

Hey everyone!

I built **Déjà Vu** (`dejavu-oncall`), an open-source incident response tool built to solve organizational amnesia during production outages.

When an outage hits at 2 AM, generic LLMs usually suggest generic fixes ("restart the pod", "check your logs"). The actual solution usually exists in an old postmortem from 3 weeks ago that nobody remembers.

Using **Hindsight** (Vectorize's agent memory engine), Déjà Vu retains past incident postmortems, symptoms, root causes, exact resolution steps, and what *didn't* work. When a new alert fires, it recalls similar past outages in ~140ms and grounds its triage in real history.

It also uses Hindsight's `reflect` feature to synthesize failure patterns across the entire incident history (e.g., catching that 3 separate outages were caused by pgbouncer connection pool exhaustion after concurrency changes).

Built with Next.js 15, TypeScript, Tailwind CSS, Groq (`openai/gpt-oss-120b`), and `@vectorize-io/hindsight-client`.

Would love to hear your feedback on the memory retrieval workflow and split-view console design!

GitHub repo: [REPO_LINK]
Article writeup: [ARTICLE_LINK]
