import { NextResponse } from "next/server";
import { getHindsightClient } from "@/lib/hindsight";

export async function GET() {
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY);
  const hasHindsightKey = Boolean(process.env.HINDSIGHT_API_KEY);
  const hindsightBaseUrl = process.env.HINDSIGHT_BASE_URL || "https://api.hindsight.vectorize.io";
  const hindsightBankId = process.env.HINDSIGHT_BANK_ID || "dejavu-oncall";

  let hindsightReachable = false;
  let errorMsg = "";

  if (hasHindsightKey) {
    try {
      const { client } = getHindsightClient();
      await client.getVersion();
      hindsightReachable = true;
    } catch (err) {
      hindsightReachable = false;
      errorMsg = err instanceof Error ? err.message : String(err);
    }
  } else {
    errorMsg = "HINDSIGHT_API_KEY missing";
  }

  const healthy = hasGroqKey && hasHindsightKey && hindsightReachable;

  return NextResponse.json({
    status: healthy ? "healthy" : "degraded",
    hasGroqKey,
    hasHindsightKey,
    hindsightBaseUrl,
    hindsightBankId,
    hindsightReachable,
    error: errorMsg || null,
  });
}
