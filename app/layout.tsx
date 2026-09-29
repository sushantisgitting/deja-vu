import type { Metadata } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const serifFont = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
  style: ["italic", "normal"],
  variable: "--font-serif",
});

const sansFont = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Déjà Vu — The On-Call Agent That Remembers Outages",
  description:
    "An incident-response agent powered by Hindsight agent memory. Retains resolved incidents, recalls past root causes, and reflects over operational history to break incident loops.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${serifFont.variable} ${sansFont.variable} ${monoFont.variable} bg-bg text-text min-h-screen flex flex-col font-sans selection:bg-accent selection:text-white`}
      >
        <div className="noise-bg" />
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-border py-6 bg-surface/50 text-xs font-mono text-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-text font-semibold">Déjà Vu</span> — Kirana Cloud On-Call Triage Agent
            </div>
            <div className="flex items-center space-x-4 text-[11px]">
              <a
                href="https://hindsight.vectorize.io"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors underline underline-offset-2"
              >
                Hindsight Docs
              </a>
              <span>·</span>
              <a
                href="https://github.com/vectorize-io/hindsight"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors underline underline-offset-2"
              >
                Vectorize Hindsight
              </a>
              <span>·</span>
              <a
                href="https://vectorize.io/what-is-agent-memory"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors underline underline-offset-2"
              >
                Agent Memory Guide
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
