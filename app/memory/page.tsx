"use client";

import { useState } from "react";
import {
  Database,
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  Tag,
  AlertTriangle,
  ChevronRight,
  Brain,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import incidentsData from "@/data/incidents.json";
import teamKnowledgeData from "@/data/team_knowledge.json";
import { RecalledMemoryItem } from "@/lib/hindsight";

export default function MemoryPage() {
  const [incidents] = useState(incidentsData);
  const [rules] = useState(teamKnowledgeData);

  // Seeding State
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedProgress, setSeedProgress] = useState<string | null>(null);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);

  // Live Recall Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<RecalledMemoryItem[] | null>(null);
  const [searchLatency, setSearchLatency] = useState<number>(0);

  // Reflect Patterns State
  const [isReflecting, setIsReflecting] = useState<boolean>(false);
  const [reflectAnswer, setReflectAnswer] = useState<string | null>(null);
  const [reflectLatency, setReflectLatency] = useState<number>(0);

  // Active Tab: Incidents / Operational Rules
  const [activeTab, setActiveTab] = useState<"incidents" | "rules">("incidents");

  const handleSeedMemory = async () => {
    setIsSeeding(true);
    setSeedProgress("Connecting to Hindsight Bank 'dejavu-oncall'...");
    setSeedSuccessMsg(null);

    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setSeedSuccessMsg(data.message || `Successfully retained ${data.successful} items into memory!`);
      } else {
        setSeedProgress(`Seeding failed: ${data.error}`);
      }
    } catch (err) {
      setSeedProgress(`Seeding error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSearchMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults(null);

    try {
      const res = await fetch("/api/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();

      if (res.ok) {
        setSearchResults(data.memories || []);
        setSearchLatency(data.latencyMs || 0);
      } else {
        alert(`Recall search error: ${data.error}`);
      }
    } catch (err) {
      alert(`Search error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReflectPatterns = async () => {
    setIsReflecting(true);
    setReflectAnswer(null);

    try {
      const res = await fetch("/api/patterns", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setReflectAnswer(data.answer);
        setReflectLatency(data.latencyMs || 0);
      } else {
        alert(`Reflect failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Reflect error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsReflecting(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 space-y-10">
      {/* Header Banner & Seed Control */}
      <div className="bg-surface border border-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-accent" />
            <h2 className="font-sans font-bold text-xl text-text">Hindsight Memory Ledger</h2>
          </div>
          <p className="text-sm text-muted font-sans max-w-xl">
            Retained incident memories and operational preferences for Kirana Cloud. Memory is updated live upon incident resolution.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleReflectPatterns}
            disabled={isReflecting}
            className="px-4 py-2.5 bg-surface hover:bg-surface-hover border border-accent/40 text-accent font-mono text-xs rounded transition-colors flex items-center space-x-2"
          >
            {isReflecting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span>REFLECTING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>FIND PATTERNS (REFLECT)</span>
              </>
            )}
          </button>

          <button
            onClick={handleSeedMemory}
            disabled={isSeeding}
            className="px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-mono font-bold text-xs rounded transition-colors flex items-center space-x-2 shadow"
          >
            {isSeeding ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>SEEDING BANK...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>SEED MEMORY BANK</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Seed Notifications */}
      {seedSuccessMsg && (
        <div className="p-4 bg-green/10 border border-green/40 rounded flex items-center justify-between font-mono text-xs text-green">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{seedSuccessMsg}</span>
          </div>
          <span className="text-[11px] text-muted">IDEMPOTENT RE-SEED WARNING: Seeding twice adds duplicate documents.</span>
        </div>
      )}

      {/* REFLECT SYNTHESIS ANSWER PANEL */}
      {reflectAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border-2 border-accent/50 rounded-lg p-6 space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-accent" />
              <span className="micro-label text-accent font-bold">HINDSIGHT REFLECT SYNTHESIS</span>
            </div>
            <span className="text-xs font-mono text-muted">LATENCY: {reflectLatency}ms</span>
          </div>

          <div className="prose prose-invert max-w-none text-xs font-mono text-text leading-relaxed whitespace-pre-wrap bg-bg p-4 border border-border rounded">
            {reflectAnswer}
          </div>
        </motion.div>
      )}

      {/* LIVE MEMORY SEARCH BOX */}
      <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="micro-label text-muted">SEARCH MEMORY BANK (HINDSIGHT RECALL)</span>
          {searchLatency > 0 && (
            <span className="text-xs font-mono text-accent">RECALL TIME: {searchLatency}ms</span>
          )}
        </div>

        <form onSubmit={handleSearchMemory} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query memory bank (e.g. 'pgbouncer connection pool' or 'Redis session eviction')..."
              className="w-full bg-bg border border-border rounded pl-9 pr-4 py-2.5 text-xs font-mono text-text focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-5 py-2.5 bg-surface hover:bg-surface-hover border border-border text-text font-mono text-xs rounded transition-colors font-bold"
          >
            {isSearching ? "SEARCHING..." : "SEARCH"}
          </button>
        </form>

        {/* Live Search Results */}
        {searchResults && (
          <div className="space-y-3 pt-2">
            <span className="micro-label text-accent">
              SEARCH RESULTS ({searchResults.length} FOUND)
            </span>
            {searchResults.length === 0 ? (
              <div className="text-xs font-mono text-muted py-4">No matching memories found in bank.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((res, i) => (
                  <div key={i} className="p-3 bg-bg border border-border rounded text-xs font-mono space-y-1">
                    <div className="text-accent font-bold">{res.document_id || `MEMORY #${i + 1}`}</div>
                    <p className="text-muted line-clamp-3 text-[11px] leading-tight">{res.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* INCIDENTS LEDGER TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab("incidents")}
              className={`text-xs font-mono pb-1 transition-colors border-b-2 ${
                activeTab === "incidents"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted hover:text-text"
              }`}
            >
              INCIDENTS LEDGER ({incidents.length})
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`text-xs font-mono pb-1 transition-colors border-b-2 ${
                activeTab === "rules"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted hover:text-text"
              }`}
            >
              OPERATIONAL RULES ({rules.length})
            </button>
          </div>

          <span className="text-xs font-mono text-muted">KIRANA CLOUD PROD</span>
        </div>

        {activeTab === "incidents" ? (
          <div className="grid grid-cols-1 gap-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="bg-surface border border-border rounded p-4 hover:border-border-light transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-accent">{inc.id}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono rounded font-bold ${
                        inc.severity === "SEV1"
                          ? "bg-accent/20 text-accent border border-accent/30"
                          : inc.severity === "SEV2"
                          ? "bg-amber/20 text-amber border border-amber/30"
                          : "bg-surface text-muted border border-border"
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-xs font-mono text-muted">{inc.service}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono text-muted">
                    <span>{new Date(inc.started_at).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>Duration: {inc.duration_minutes}m</span>
                    <span>·</span>
                    <span className="text-text">{inc.resolved_by}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-text text-sm mb-1">{inc.title}</h3>
                  <p className="font-mono text-xs text-muted/90 bg-bg p-2.5 border border-border/60 rounded">
                    <strong className="text-accent">ROOT CAUSE:</strong> {inc.root_cause}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted pt-1">
                  <div>
                    <strong className="text-green">FIX:</strong> {inc.resolution_steps[0]}
                  </div>
                  <a
                    href={inc.postmortem_link}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent transition-colors underline"
                  >
                    Postmortem Wiki ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-surface border border-border rounded p-5 space-y-2">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-mono text-xs font-bold text-accent">{rule.id}</span>
                  <span className="micro-label text-muted">OPERATIONAL PREFERENCE</span>
                </div>
                <h4 className="font-sans font-bold text-text text-sm">{rule.title}</h4>
                <p className="font-mono text-xs text-muted bg-bg p-3 border border-border rounded leading-relaxed">
                  {rule.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
