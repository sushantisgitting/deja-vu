import { NextResponse } from "next/server";
import { reflectPatterns } from "@/lib/hindsight";

export async function POST() {
  try {
    const query =
      "What recurring failure patterns exist across our incidents, and what systemic fixes would prevent them?";
    const { answer, latencyMs } = await reflectPatterns(query);

    return NextResponse.json({
      answer,
      latencyMs,
      query,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
