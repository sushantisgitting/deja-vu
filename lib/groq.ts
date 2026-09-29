import Groq from "groq-sdk";
import { z } from "zod";

export const TriageResultSchema = z.object({
  verdict: z.enum(["seen_before", "similar", "novel"]),
  headline: z.string(),
  likely_root_cause: z.string(),
  confidence: z.number().min(0).max(100),
  immediate_actions: z.array(z.string()),
  avoid: z.array(z.string()),
  cited_incidents: z.array(z.string()),
  team_rules_applied: z.array(z.string()),
});

export type TriageResult = z.infer<typeof TriageResultSchema>;

const PRIMARY_MODEL = "openai/gpt-oss-120b";
const FALLBACK_MODEL = "qwen/qwen3-32b";
const TIMEOUT_MS = 25000;

function cleanResponseText(raw: string): string {
  // Strip <think>...</think> blocks from reasoning models
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Strip ```json markdown code fences
  cleaned = cleaned.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
  return cleaned;
}

export function parseTriageResult(rawText: string): TriageResult {
  const cleaned = cleanResponseText(rawText);

  try {
    const jsonParsed = JSON.parse(cleaned);
    const validated = TriageResultSchema.safeParse(jsonParsed);
    if (validated.success) {
      return validated.data;
    }
  } catch {
    // If JSON parsing fails, fall back gracefully
  }

  // Fallback structure if JSON parse or Zod validation fails
  return {
    verdict: "novel",
    headline: "Incident Triage (Raw Output)",
    likely_root_cause: cleaned.slice(0, 300) || "Unable to extract structured root cause.",
    confidence: 50,
    immediate_actions: ["Review alert logs in detail", "Check primary dashboard metrics"],
    avoid: ["Do not deploy untested changes"],
    cited_incidents: [],
    team_rules_applied: [],
  };
}

async function callGroqWithTimeout(
  groq: Groq,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await groq.chat.completions.create(
      {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      },
      { signal: controller.signal }
    );
    clearTimeout(timer);
    return response.choices[0]?.message?.content || "";
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export async function runTriageLLM(
  alertText: string,
  recalledMemoriesText?: string
): Promise<TriageResult> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }

  const groq = new Groq({ apiKey });

  const systemPrompt = `You are Déjà Vu, a senior on-call incident response agent for Kirana Cloud.
Your task is to analyze production alert text and triage the incident.

You MUST respond strictly with a single JSON object matching this schema:
{
  "verdict": "seen_before" | "similar" | "novel",
  "headline": "Short, clear 1-line summary of the issue",
  "likely_root_cause": "Detailed, grounded explanation of the root cause",
  "confidence": <integer between 0 and 100>,
  "immediate_actions": ["Action step 1", "Action step 2", ...],
  "avoid": ["Thing that failed before / what not to do", ...],
  "cited_incidents": ["INC-XXXX", ...],
  "team_rules_applied": ["Rule title or snippet applied", ...]
}

Verdict Criteria:
- "seen_before": The recalled memories contain an exact match or repeated pattern of this specific failure mode.
- "similar": The recalled memories show a related service or error component, but not the exact same trigger.
- "novel": There are NO relevant past memories or matching failure patterns. In this case, acknowledge you have no memory of this, give careful general triage, and invite the engineer to resolve and retain it.

CRITICAL INSTRUCTIONS:
${
  recalledMemoriesText
    ? `You have been provided with RECALLED MEMORIES from Hindsight memory bank:
----------------------------------------
${recalledMemoriesText}
----------------------------------------
Ground your triage strictly in these recalled memories when available. Cite incident IDs (e.g. INC-2104) in cited_incidents when referencing them.`
    : `You DO NOT have access to memory context for this run (Memory disabled mode). Rely only on general knowledge.`
}`;

  const userPrompt = `RAW ALERT TEXT TO TRIAGE:\n${alertText}`;

  // Try primary model first, fallback on error
  try {
    const rawOutput = await callGroqWithTimeout(groq, PRIMARY_MODEL, systemPrompt, userPrompt);
    return parseTriageResult(rawOutput);
  } catch (primaryError) {
    console.warn(`[Groq LLM] Primary model (${PRIMARY_MODEL}) failed, trying fallback model (${FALLBACK_MODEL}):`, primaryError);
    try {
      const fallbackOutput = await callGroqWithTimeout(groq, FALLBACK_MODEL, systemPrompt, userPrompt);
      return parseTriageResult(fallbackOutput);
    } catch (fallbackError) {
      console.error("[Groq LLM] Fallback model also failed:", fallbackError);
      throw new Error(`LLM triage request failed on both primary and fallback models: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
    }
  }
}
