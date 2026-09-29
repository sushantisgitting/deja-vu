"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, ShieldAlert, Cpu, Sparkles, Activity } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [health, setHealth] = useState<{
    status: string;
    hindsightReachable: boolean;
    hasGroqKey: boolean;
    hasHindsightKey: boolean;
    error?: string | null;
  } | null>(null);

  const [memoryCount, setMemoryCount] = useState<number>(18); // Default to seed count

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const data = await res.json();
          setHealth(data);
        }
      } catch {
        setHealth(null);
      }
    }
    checkHealth();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Brand logo */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-7 h-7 bg-surface border border-border flex items-center justify-center rounded">
              <span className="font-serif italic font-bold text-accent text-lg">D</span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-sm tracking-tight text-text group-hover:text-accent transition-colors">
                Déjà Vu
              </span>
              <span className="micro-label text-[10px] text-muted -mt-0.5">dejavu-oncall</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-border">
            <Link
              href="/"
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                pathname === "/"
                  ? "bg-surface text-text border border-border"
                  : "text-muted hover:text-text"
              }`}
            >
              00 // overview
            </Link>
            <Link
              href="/console"
              className={`px-3 py-1 rounded text-xs font-mono flex items-center space-x-1.5 transition-colors ${
                pathname === "/console"
                  ? "bg-accent/10 text-accent border border-accent/30 font-semibold"
                  : "text-muted hover:text-text"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>01 // console</span>
            </Link>
            <Link
              href="/memory"
              className={`px-3 py-1 rounded text-xs font-mono flex items-center space-x-1.5 transition-colors ${
                pathname === "/memory"
                  ? "bg-surface text-text border border-border"
                  : "text-muted hover:text-text"
              }`}
            >
              <Database className="w-3.5 h-3.5 text-accent" />
              <span>02 // memory bank</span>
            </Link>
          </nav>
        </div>

        {/* Right: Status and Memory Count */}
        <div className="flex items-center space-x-4">
          {/* Memory Counter */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-surface border border-border rounded text-xs font-mono">
            <Database className="w-3 h-3 text-accent" />
            <span className="text-muted">MEMORY:</span>
            <span className="text-text font-bold">{memoryCount} INCIDENTS</span>
          </div>
        </div>
      </div>
    </header>
  );
}
