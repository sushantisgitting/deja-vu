"use client";

import Link from "next/link";
import { ArrowRight, Database, Brain, Zap, RefreshCw, ShieldAlert, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center py-12 md:py-16">
        <div className="max-w-4xl">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-surface border border-border text-xs font-mono mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
            <span className="text-muted uppercase tracking-micro">TAGLINE</span>
            <span className="text-text font-semibold">The on-call agent that has seen this outage before.</span>
          </motion.div>

          {/* Huge Editorial Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-sans tracking-tight leading-[1.05] font-bold text-text mb-6"
          >
            It&apos;s happened before. <br />
            <span className="font-serif italic font-normal text-accent">Now your on-call knows.</span>
          </motion.h1>

          {/* One line subhead */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted font-sans font-normal max-w-2xl leading-relaxed mb-10"
          >
            When production breaks at 2am, generic LLMs give generic advice. Déjà Vu uses Hindsight agent memory to retain every past incident root cause, recall exact previous fixes, and reflect on systemic failure patterns.
          </motion.p>

          {/* CTA & Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <Link
              href="/console"
              className="inline-flex items-center space-x-3 px-6 py-3.5 bg-accent hover:bg-accent/90 text-white font-mono font-semibold text-sm rounded shadow-lg transition-all group"
            >
              <span>OPEN THE CONSOLE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/memory"
              className="inline-flex items-center space-x-2 px-5 py-3.5 bg-surface hover:bg-surface-hover border border-border text-text font-mono text-sm rounded transition-colors"
            >
              <Database className="w-4 h-4 text-accent" />
              <span>EXPLORE MEMORY BANK</span>
            </Link>
          </motion.div>

          {/* Small Live Stat Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs"
          >
            <div>
              <div className="text-muted micro-label mb-1">MEMORIES RETAINED</div>
              <div className="text-2xl font-bold text-text">18 Incidents</div>
              <div className="text-[11px] text-muted mt-0.5">+ 6 Operational Rules</div>
            </div>
            <div>
              <div className="text-muted micro-label mb-1">RECALL LATENCY</div>
              <div className="text-2xl font-bold text-accent">~140 ms</div>
              <div className="text-[11px] text-muted mt-0.5">Semantic search</div>
            </div>
            <div>
              <div className="text-muted micro-label mb-1">RECURRING OUTAGES</div>
              <div className="text-2xl font-bold text-green">100% Recognized</div>
              <div className="text-[11px] text-muted mt-0.5">pgbouncer / Redis storms</div>
            </div>
            <div>
              <div className="text-muted micro-label mb-1">MEMORY ENGINE</div>
              <div className="text-2xl font-bold text-text">Hindsight API</div>
              <div className="text-[11px] text-muted mt-0.5">Vectorize Agent Memory</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Memory Loop Section: 01 Retain / 02 Recall / 03 Reflect */}
      <section className="pt-12 border-t border-border">
        <div className="micro-label text-muted mb-6">ARCHITECTURE // THE AGENT MEMORY LOOP</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 01 Retain */}
          <div className="p-6 bg-surface border border-border rounded flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-accent font-bold">01 // RETAIN</span>
                <Brain className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-sans font-bold text-lg text-text mb-2">
                Ingest &amp; Consolidate Postmortems
              </h3>
              <p className="text-sm text-muted leading-relaxed font-sans">
                Every resolved outage is stored with rich context—symptoms, stack traces, precise root causes, step-by-step fixes, and what failed. Memory gets strictly smarter with every ticket.
              </p>
            </div>
            <div className="font-mono text-[11px] text-muted pt-4 border-t border-border/60">
              <code>client.retain(bankId, content, options)</code>
            </div>
          </div>

          {/* 02 Recall */}
          <div className="p-6 bg-surface border border-border rounded flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-accent font-bold">02 // RECALL</span>
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-sans font-bold text-lg text-text mb-2">
                Grounded Triage at 2 AM
              </h3>
              <p className="text-sm text-muted leading-relaxed font-sans">
                When a raw alert fires, Hindsight instantly retrieves relevant historical incidents and operational rules before the LLM synthesizes actions—avoiding generic trial-and-error.
              </p>
            </div>
            <div className="font-mono text-[11px] text-muted pt-4 border-t border-border/60">
              <code>client.recall(bankId, alertText)</code>
            </div>
          </div>

          {/* 03 Reflect */}
          <div className="p-6 bg-surface border border-border rounded flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-accent font-bold">03 // REFLECT</span>
                <RefreshCw className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-sans font-bold text-lg text-text mb-2">
                Systemic Pattern Analysis
              </h3>
              <p className="text-sm text-muted leading-relaxed font-sans">
                Reflect scans across memory history to synthesize recurring failure loops—like repeated pgbouncer connection chokes or Redis eviction storms—recommending permanent architectural fixes.
              </p>
            </div>
            <div className="font-mono text-[11px] text-muted pt-4 border-t border-border/60">
              <code>client.reflect(bankId, query)</code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
