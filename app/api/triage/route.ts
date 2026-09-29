import { NextRequest, NextResponse } from "next/server";
import { recallSimilar, RecalledMemoryItem } from "@/lib/hindsight";
import { runTriageLLM } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alert, useMemory } = body;

    if (!alert || typeof alert !== "string" || alert.trim() === "") {
      return NextResponse.json({ error: "Alert text is required." }, { status: 400 });
    }

    let recalledMemories: RecalledMemoryItem[] = [];
    let recallLatencyMs = 0;
    let recalledContextText = "";

    if (useMemory) {
      try {
        const recallRes = await recallSimilar(alert.trim());
        recalledMemories = recallRes.memories;
        recallLatencyMs = recallRes.latencyMs;

        recalledContextText = recalledMemories
          .map((m, idx) => `[Memory #${idx + 1} | Doc: ${m.document_id || "N/A"}]\n${m.text}`)
          .join("\n\n---\n\n");
      } catch (hindsightErr) {
        const errorMsg = hindsightErr instanceof Error ? hindsightErr.message : String(hindsightErr);
        return NextResponse.json(
          {
            error: `Hindsight recall failed: ${errorMsg}`,
            isHindsightError: true,
          },
          { status: 502 }
        );
      }
    }

    // Call LLM for triage
    const triageResult = await runTriageLLM(alert.trim(), useMemory ? recalledContextText : undefined);

    return NextResponse.json({
      triage: triageResult,
      recalled_memories: recalledMemories,
      recall_latency_ms: recallLatencyMs,
      use_memory: Boolean(useMemory),
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
