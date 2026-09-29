"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Database,
  ArrowRight,
  Clock,
  User,
  RotateCcw,
  Sparkles,
  Search,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import demoAlerts from "@/data/demo_alerts.json";
import { TriageResult } from "@/lib/groq";
import { RecalledMemoryItem } from "@/lib/hindsight";

interface DemoAlert {
  id: string;
  label: string;
  type: string;
  service: string;
  alert_text: string;
}

export default function ConsolePage() {
  const [alertText, setAlertText] = useState<string>(demoAlerts[0].alert_text);
  const [selectedDemo, setSelectedDemo] = useState<string>(demoAlerts[0].id);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Left Pane: Without Memory
  const [leftTriage, setLeftTriage] = useState<TriageResult | null>(null);
  const [leftLoading, setLeftLoading] = useState<boolean>(false);

  // Right Pane: With Hindsight Memory
  const [rightTriage, setRightTriage] = useState<TriageResult | null>(null);
  const [rightMemories, setRightMemories] = useState<RecalledMemoryItem[]>([]);
  const [rightLatency, setRightLatency] = useState<number>(0);
  const [rightLoading, setRightLoading] = useState<boolean>(false);

  // Resolve & Retain Form State
  const [showResolveForm, setShowResolveForm] = useState<boolean>(false);
  const [resolveRootCause, setResolveRootCause] = useState<string>("");
  const [resolveFix, setResolveFix] = useState<string>("");
  const [resolvedBy, setResolvedBy] = useState<string>("Arjun Mehta");
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [resolveSuccessMsg, setResolveSuccessMsg] = useState<string | null>(null);

  const handleSelectDemo = (demo: DemoAlert) => {
    setSelectedDemo(demo.id);
    setAlertText(demo.alert_text);
    setLeftTriage(null);
    setRightTriage(null);
    setRightMemories([]);
    setErrorMsg(null);
    setResolveSuccessMsg(null);
  };

  const handleRunTriage = async () => {
    if (!alertText.trim()) return;

    setIsLoading(true);
    setLeftLoading(true);
    setRightLoading(true);
    setErrorMsg(null);
    setLeftTriage(null);
    setRightTriage(null);
    setRightMemories([]);
    setResolveSuccessMsg(null);

    // Parallel execution: left (no memory) and right (with memory)
    const runLeft = async () => {
      try {
        const res = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alert: alertText, useMemory: false }),
        });
        const data = await res.json();
        if (res.ok) {
          setLeftTriage(data.triage);
        } else {
          console.error("Left triage error:", data.error);
        }
      } catch (err) {
        console.error("Left triage network error:", err);
      } finally {
        setLeftLoading(false);
      }
    };

    const runRight = async () => {
      try {
        const res = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alert: alertText, useMemory: true }),
        });
        const data = await res.json();
        if (res.ok) {
          setRightTriage(data.triage);
          setRightMemories(data.recalled_memories || []);
          setRightLatency(data.recall_latency_ms || 0);

          // Pre-populate resolve form if verdict is novel
          if (data.triage?.verdict === "novel") {
            setResolveRootCause("S3 Node time drift caused AWS SigV4 signature mismatch.");
            setResolveFix("Resynced NTP daemon (chrony) on node worker and added monitoring for clock offset.");
          }
        } else {
          setErrorMsg(data.error || "Hindsight recall/triage failed.");
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : String(err));
      } finally {
        setRightLoading(false);
      }
    };

    await Promise.all([runLeft(), runRight()]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunTriage();
    }
  };

  const handleResolveAndRetain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveRootCause || !resolveFix || !resolvedBy) return;

    setIsResolving(true);
    setResolveSuccessMsg(null);

    try {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert: alertText,
          root_cause: resolveRootCause,
          fix: resolveFix,
          resolved_by: resolvedBy,
          service: "notifications-svc",
          severity: "SEV2",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResolveSuccessMsg(`Incident ${data.incident.id} committed to Hindsight memory bank in ${data.latencyMs}ms! Re-triage to test recall.`);
        setShowResolveForm(false);
      } else {
        setErrorMsg(data.error || "Failed to resolve incident");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 space-y-8">
      {/* Top Terminal Header & Input */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-2xl">
        {/* Terminal Bar */}
        <div className="bg-bg border-b border-border px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
            </div>
            <span className="micro-label text-muted">LIVE INCIDENT TRIAGE CONSOLE</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-muted">
            <span>SHORTCUT:</span>
            <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-[10px] text-text">⌘ + Enter</kbd>
          </div>
        </div>

        {/* Demo Alert Selection Bar */}
        <div className="p-4 bg-surface/50 border-b border-border flex flex-wrap items-center gap-3">
          <span className="micro-label text-muted">DEMO SCENARIOS:</span>
          {demoAlerts.map((demo) => (
            <button
              key={demo.id}
              onClick={() => handleSelectDemo(demo as DemoAlert)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center space-x-2 border ${
                selectedDemo === demo.id
                  ? "bg-accent/15 border-accent text-accent font-semibold"
                  : "bg-bg border-border text-muted hover:text-text hover:border-border-light"
              }`}
            >
              <span>{demo.label}</span>
            </button>
          ))}
        </div>

        {/* Monospace Alert Textarea */}
        <div className="p-4 relative">
          <textarea
            value={alertText}
            onChange={(e) => setAlertText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="Paste raw alert text, error stack trace, or log excerpt..."
            className="w-full bg-bg border border-border rounded p-3 text-sm font-mono text-text focus:outline-none focus:border-accent transition-colors resize-none placeholder:text-muted/60"
          />

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-mono text-muted">
              Kirana Cloud Production Telemetry Feed
            </span>

            <button
              onClick={handleRunTriage}
              disabled={isLoading || !alertText.trim()}
              className="px-6 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-mono font-bold text-xs rounded transition-all flex items-center space-x-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ANALYZING...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>RUN TRIAGE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message Display */}
      {errorMsg && (
        <div className="p-4 bg-accent/10 border border-accent/40 rounded flex items-start space-x-3 text-accent font-mono text-xs">
          <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold mb-1">HINDSIGHT MEMORY ERROR</div>
            <div>{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {resolveSuccessMsg && (
        <div className="p-4 bg-green/10 border border-green/40 rounded flex items-center space-x-3 text-green font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <div className="font-bold">{resolveSuccessMsg}</div>
        </div>
      )}

      {/* SPLIT VIEW: Left Pane (WITHOUT MEMORY) vs Right Pane (WITH HINDSIGHT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT PANE: WITHOUT MEMORY */}
        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-muted" />
                <span className="micro-label text-muted font-bold">WITHOUT MEMORY</span>
              </div>
              <span className="text-xs font-mono text-muted">GENERIC LLM ONLY</span>
            </div>

            {leftLoading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-muted">
                <div className="w-6 h-6 border-2 border-muted border-t-transparent rounded-full animate-spin" />
                <span>Generating generic response...</span>
              </div>
            ) : leftTriage ? (
              <div className="space-y-4 font-sans">
                <div>
                  <span className="micro-label text-muted block mb-1">VERDICT</span>
                  <span className="px-2.5 py-1 bg-bg border border-border text-muted font-mono text-xs rounded uppercase font-bold">
                    {leftTriage.verdict}
                  </span>
                </div>

                <div>
                  <span className="micro-label text-muted block mb-1">HEADLINE</span>
                  <h4 className="font-sans font-bold text-text text-base">{leftTriage.headline}</h4>
                </div>

                <div>
                  <span className="micro-label text-muted block mb-1">LIKELY ROOT CAUSE</span>
                  <p className="text-sm text-muted bg-bg p-3 border border-border rounded font-mono text-xs">
                    {leftTriage.likely_root_cause}
                  </p>
                </div>

                <div>
                  <span className="micro-label text-muted block mb-1">RECOMMENDED ACTIONS</span>
                  <ul className="space-y-1.5 text-xs text-muted font-mono">
                    {leftTriage.immediate_actions.map((act, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-accent">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-border/50 text-[11px] font-mono text-muted/70 italic">
                  Note: Notice generic advice ("check logs", "restart service") without specific Kirana Cloud parameters.
                </div>
              </div>
            ) : (
              <div className="py-16 text-center font-mono text-xs text-muted">
                Click &quot;RUN TRIAGE&quot; above to compare results.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: WITH HINDSIGHT MEMORY */}
        <div className="bg-surface border-2 border-accent/40 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden shadow-xl">
          {rightLoading && <div className="animate-scanline" />}

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse-dot" />
                <span className="micro-label text-accent font-bold">WITH HINDSIGHT MEMORY</span>
              </div>
              {rightLatency > 0 && (
                <div className="flex items-center space-x-1.5 text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                  <Clock className="w-3 h-3" />
                  <span>RECALL LATENCY: {rightLatency}ms</span>
                </div>
              )}
            </div>

            {/* RECALL TRACE: Animating Recalled Memories */}
            {rightLoading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-4 font-mono text-xs text-accent">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span>Recalling memories from Hindsight bank...</span>
              </div>
            ) : rightTriage ? (
              <div className="space-y-5 font-sans">
                {/* Recalled Memory Trace Cards */}
                {rightMemories.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="micro-label text-accent font-bold">
                        HINDSIGHT RECALL TRACE ({rightMemories.length} MEMORIES FOUND)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {rightMemories.map((mem, idx) => (
                        <motion.div
                          key={mem.id || idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                          className="p-3 bg-bg border border-accent/30 rounded text-xs font-mono text-text space-y-1 hover:border-accent transition-colors"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-accent font-bold">{mem.document_id || "MEMORY"}</span>
                            <span className="text-muted">{mem.context || "resolved incident"}</span>
                          </div>
                          <p className="line-clamp-2 text-muted text-[11px] leading-tight">
                            {mem.text.slice(0, 140)}...
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verdict Badge */}
                <div className="flex items-center space-x-3 pt-2">
                  <span className="micro-label text-muted">VERDICT:</span>
                  <span
                    className={`px-3 py-1 rounded font-mono text-xs uppercase font-bold border ${
                      rightTriage.verdict === "seen_before"
                        ? "bg-green/15 text-green border-green/40"
                        : rightTriage.verdict === "similar"
                        ? "bg-amber/15 text-amber border-amber/40"
                        : "bg-accent/15 text-accent border-accent/40"
                    }`}
                  >
                    {rightTriage.verdict === "seen_before"
                      ? "✓ SEEN BEFORE (EXACT MATCH)"
                      : rightTriage.verdict === "similar"
                      ? "~ SIMILAR PATTERN"
                      : "⚡ NOVEL INCIDENT (NO RECALL)"}
                  </span>
                  <span className="text-xs font-mono text-muted">
                    Confidence: {rightTriage.confidence}%
                  </span>
                </div>

                {/* Headline */}
                <div>
                  <span className="micro-label text-muted block mb-1">GROUNDED HEADLINE</span>
                  <h4 className="font-sans font-bold text-text text-base">{rightTriage.headline}</h4>
                </div>

                {/* Root Cause */}
                <div>
                  <span className="micro-label text-muted block mb-1">GROUNDED LIKELY ROOT CAUSE</span>
                  <div className="p-3 bg-bg border border-border rounded font-mono text-xs text-text leading-relaxed">
                    {rightTriage.likely_root_cause}
                  </div>
                </div>

                {/* Cited Incidents & Team Rules */}
                {(rightTriage.cited_incidents.length > 0 || rightTriage.team_rules_applied.length > 0) && (
                  <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                    {rightTriage.cited_incidents.length > 0 && (
                      <div className="p-2.5 bg-bg border border-border rounded">
                        <span className="micro-label text-accent block mb-1">CITED INCIDENTS</span>
                        <div className="flex flex-wrap gap-1">
                          {rightTriage.cited_incidents.map((inc, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-accent/10 border border-accent/30 text-accent rounded text-[11px] font-bold">
                              {inc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {rightTriage.team_rules_applied.length > 0 && (
                      <div className="p-2.5 bg-bg border border-border rounded">
                        <span className="micro-label text-green block mb-1">TEAM RULES APPLIED</span>
                        <div className="text-[11px] text-muted space-y-0.5">
                          {rightTriage.team_rules_applied.map((rule, i) => (
                            <div key={i}>• {rule}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Immediate Actions */}
                <div>
                  <span className="micro-label text-green block mb-1">IMMEDIATE ACTIONS (GROUNDED)</span>
                  <ul className="space-y-1.5 text-xs text-text font-mono">
                    {rightTriage.immediate_actions.map((act, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-green font-bold">✓</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Avoid */}
                {rightTriage.avoid.length > 0 && (
                  <div>
                    <span className="micro-label text-accent block mb-1">WHAT DID NOT WORK LAST TIME (AVOID)</span>
                    <ul className="space-y-1.5 text-xs text-muted font-mono bg-bg p-3 border border-border rounded">
                      {rightTriage.avoid.map((av, i) => (
                        <li key={i} className="flex items-start space-x-2 text-accent/90">
                          <span>✗</span>
                          <span>{av}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resolve & Retain Section for Novel Incidents */}
                <div className="pt-4 border-t border-border">
                  {!showResolveForm ? (
                    <button
                      onClick={() => setShowResolveForm(true)}
                      className="w-full py-2.5 bg-surface hover:bg-surface-hover border border-border text-text font-mono text-xs rounded transition-colors flex items-center justify-center space-x-2"
                    >
                      <Database className="w-3.5 h-3.5 text-accent" />
                      <span>RESOLVE &amp; RETAIN THIS INCIDENT</span>
                    </button>
                  ) : (
                    <form onSubmit={handleResolveAndRetain} className="space-y-3 bg-bg p-4 border border-border rounded">
                      <div className="flex items-center justify-between">
                        <span className="micro-label text-accent">COMMIT NEW INCIDENT TO HINDSIGHT</span>
                        <button
                          type="button"
                          onClick={() => setShowResolveForm(false)}
                          className="text-xs font-mono text-muted hover:text-text"
                        >
                          Cancel
                        </button>
                      </div>

                      <div>
                        <label className="micro-label text-muted block mb-1">ROOT CAUSE</label>
                        <input
                          type="text"
                          value={resolveRootCause}
                          onChange={(e) => setResolveRootCause(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-xs font-mono text-text focus:outline-none focus:border-accent"
                          placeholder="e.g. S3 presigned URL signature mismatch due to node NTP clock drift"
                        />
                      </div>

                      <div>
                        <label className="micro-label text-muted block mb-1">PERMANENT FIX</label>
                        <input
                          type="text"
                          value={resolveFix}
                          onChange={(e) => setResolveFix(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-xs font-mono text-text focus:outline-none focus:border-accent"
                          placeholder="e.g. Resynced chrony NTP daemon and increased skew tolerance"
                        />
                      </div>

                      <div>
                        <label className="micro-label text-muted block mb-1">RESOLVED BY</label>
                        <input
                          type="text"
                          value={resolvedBy}
                          onChange={(e) => setResolvedBy(e.target.value)}
                          className="w-full bg-surface border border-border rounded p-2 text-xs font-mono text-text focus:outline-none focus:border-accent"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isResolving}
                        className="w-full py-2 bg-accent hover:bg-accent/90 text-white font-mono font-bold text-xs rounded transition-colors flex items-center justify-center space-x-2"
                      >
                        {isResolving ? (
                          <span>COMMITTING TO MEMORY...</span>
                        ) : (
                          <>
                            <Database className="w-3.5 h-3.5" />
                            <span>COMMIT TO HINDSIGHT BANK</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center font-mono text-xs text-muted">
                Click &quot;RUN TRIAGE&quot; above to observe Hindsight memory recall.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
