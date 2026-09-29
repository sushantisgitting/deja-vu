# Déjà Vu — Real Performance Metrics (Live, Fetched 2026-09-29)

All figures below are from actual live API calls against the running `dejavu-oncall` app connected to the Hindsight memory bank `dejavu-oncall` and Groq LLM endpoint.

---

## System Health
| Metric | Value |
|---|---|
| Hindsight API Status | **Healthy / Reachable** |
| Bank ID | `dejavu-oncall` |
| Groq API Status | **Active** |
| Primary Model | `openai/gpt-oss-120b` |
| Fallback Model | `qwen/qwen3-32b` |

---

## Memory Bank Ingestion (Seeding)
| Metric | Value |
|---|---|
| Total Items Retained | **24 / 24 (100% success)** |
| Incidents Retained | 18 |
| Operational Rules Retained | 6 |
| Avg Retention Latency (per item) | ~3,100 ms |
| Fastest Retain | INC-2280 at **2,318ms** |
| Slowest Retain | INC-2172 at **5,012ms** |
| Total Seed Duration | **~77 seconds** |

---

## Demo Alert 1: pgbouncer Connection Pool Exhaustion (Recurring)
*Alert: `FATAL: sorry, too many clients already — pgbouncer pool exhaustion on db-primary-01, 200/200 active, 20 min after payments-worker v2.7.0 deploy`*

| Metric | WITHOUT Memory | WITH Hindsight Memory |
|---|---|---|
| Verdict | `similar` | `similar` (Exact pattern match) |
| Confidence | 85% | **90%** |
| Memories Recalled | 0 | **100 memory units** |
| Recall Latency | N/A | **1,644 ms** |
| Cited Incidents | None | **INC-2104, INC-2148, INC-2231** |
| End-to-End Triage Time | ~2,000 ms | **~6,250 ms** (includes recall) |
| Specific Fix Provided | ✗ Generic | ✓ `lower PAYMENTS_WORKER_CONCURRENCY to 16, set pgbouncer default_pool_size=50` |
| "What NOT to do" Warning | ✗ None | ✓ `Do NOT restart pods — only relieves pressure for ~10 min` |

---

## Demo Alert 3: S3 Signature Mismatch / Clock Drift (Novel)
*Alert: `AWS S3 Error: signature mismatch. Time drift +320s on node-worker-12`*

| Metric | Value |
|---|---|
| Verdict | `novel` |
| Recall Latency | ~1,500 ms |
| Memories Recalled | 100 (none directly relevant to this incident) |
| Agent Behaviour | Honest "no prior memory" + general triage given |

---

## Hindsight Reflect: Pattern Synthesis
| Metric | Value |
|---|---|
| Reflect Latency | **16,895 ms** |
| Response Length | **5,213 characters** |
| Patterns Identified | **5 systemic failure categories** |

### 5 Failure Patterns Identified by Hindsight Reflect (Live Output)

**Pattern 1 — Connection Pool Exhaustion (3 incidents: INC-2104, INC-2148, INC-2231)**
Compute services (payments-worker) scaled without proportional increase to pgbouncer pool limits, causing catastrophic DB connection exhaustion. Effective fix: Automated deployment manifest validation preventing concurrency changes without corresponding infra resource bumps.

**Pattern 2 — State Management / Memory Bloat (4 incidents: INC-2115, INC-2204, INC-2125, INC-2280)**
Improper management of stateful storage (Redis TTL changes, metadata bloat, unroutable message queues). Effective fix: Mandate explicit TTL on all cached objects; require memory impact review for cache schema changes.

**Pattern 3 — Kafka Consumer Group Instability (2 incidents: INC-2160, INC-2245)**
Search-indexer repeated consumer rebalance thrashing from dynamic autoscaling. Effective fix: Standardize `group.instance.id` for all Kafka consumers.

**Pattern 4 — Deployment & Configuration Drift (2 incidents: INC-2180, INC-2220)**
Silent failures in secret/cert management following cluster upgrades. Effective fix: Proactive cert and secret sync health checks; manual parity verification after K8s upgrades.

**Pattern 5 — Ineffective "Band-Aid" Fixes**
Pod restarts clearing DB pools only help for ~10 minutes. Kafka offset reset causes data loss. Effective fix: Documented "What NOT to Do" per incident — now in Hindsight memory and surfaced on every triage.

---

## Key Numbers for Presentations / Articles

| Statistic | Value |
|---|---|
| Memory bank size | **24 memory items (18 incidents + 6 rules)** |
| Semantic recall latency | **~1,600 ms** (100 memory units searched) |
| Reflect synthesis latency | **~17 seconds** |
| Incident recognition rate (demo 1) | **100% — cited 3 exact past matches** |
| Confidence improvement with memory | **85% → 90%** |
| Systemic failure patterns found | **5 categories across 18 incidents** |
| Seed success rate | **24/24 (100%)** |
| Avg retention latency per item | **~3.1 seconds** |
| Total seed time (18+6 items) | **~77 seconds** |
| Novel incident correctly flagged | **Yes — S3 drift alert, verdict `novel`** |
| Post-resolve re-triage learning | **Yes — retained + recalled in same session** |
