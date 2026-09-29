import { NextRequest, NextResponse } from "next/server";
import { recallSimilar } from "@/lib/hindsight";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    const { memories, latencyMs } = await recallSimilar(query.trim());

    return NextResponse.json({
      memories,
      latencyMs,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
