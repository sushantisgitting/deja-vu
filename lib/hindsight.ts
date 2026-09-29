import { HindsightClient } from "@vectorize-io/hindsight-client";

export interface HindsightConfig {
  baseUrl: string;
  apiKey: string;
  bankId: string;
}

export function getHindsightConfig(): HindsightConfig {
  const baseUrl = process.env.HINDSIGHT_BASE_URL || "https://api.hindsight.vectorize.io";
  const apiKey = process.env.HINDSIGHT_API_KEY || "";
  const bankId = process.env.HINDSIGHT_BANK_ID || "dejavu-oncall";

  return { baseUrl, apiKey, bankId };
}

export function getHindsightClient(): { client: HindsightClient; bankId: string } {
  const { baseUrl, apiKey, bankId } = getHindsightConfig();

  if (!apiKey) {
    throw new Error("HINDSIGHT_API_KEY environment variable is not configured.");
  }

  const client = new HindsightClient({
    baseUrl,
    apiKey,
  });

  return { client, bankId };
}

export interface IncidentMemoryInput {
  id: string;
  title: string;
  service: string;
  severity: string;
  started_at: string;
  duration_minutes: number;
  alert_text: string;
  symptoms: string;
  root_cause: string;
  resolution_steps: string[];
  what_did_not_work: string;
  resolved_by: string;
  postmortem_link?: string;
}

export interface RecalledMemoryItem {
  id: string;
  text: string;
  context?: string;
  occurred_start?: string;
  document_id?: string;
  metadata?: Record<string, string>;
  tags?: string[];
}

export interface RecallResultWrapper {
  memories: RecalledMemoryItem[];
  latencyMs: number;
}

export interface ReflectResultWrapper {
  answer: string;
  latencyMs: number;
}

/**
 * Format an incident object into a rich natural-language memory document
 */
export function formatIncidentDocument(incident: IncidentMemoryInput): string {
  return `INCIDENT MEMORY: ${incident.id} - ${incident.title}
Service: ${incident.service} | Severity: ${incident.severity} | Resolved By: ${incident.resolved_by} | Duration: ${incident.duration_minutes}m
Started At: ${incident.started_at}

Alert / Log Excerpt:
${incident.alert_text}

Symptoms:
${incident.symptoms}

Root Cause:
${incident.root_cause}

Resolution Steps:
${incident.resolution_steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}

What Did NOT Work (Avoid doing this):
${incident.what_did_not_work}

Postmortem Reference: ${incident.postmortem_link || "N/A"}`;
}

/**
 * Retain an incident into Hindsight bank with timestamp and metadata
 */
export async function retainIncident(incident: IncidentMemoryInput): Promise<{ success: boolean; latencyMs: number }> {
  const startTime = Date.now();
  const { client, bankId } = getHindsightClient();
  const content = formatIncidentDocument(incident);

  await client.retain(bankId, content, {
    timestamp: new Date(incident.started_at),
    context: "resolved production incident",
    documentId: incident.id,
    tags: [incident.service, incident.severity, "incident"],
    metadata: {
      incident_id: incident.id,
      service: incident.service,
      severity: incident.severity,
      resolved_by: incident.resolved_by,
    },
  });

  const latencyMs = Date.now() - startTime;
  console.log(`[Hindsight Retain] Incident ${incident.id} retained in ${latencyMs}ms`);
  return { success: true, latencyMs };
}

/**
 * Retain a team knowledge/operational preference note into Hindsight bank
 */
export async function retainNote(ruleId: string, title: string, content: string): Promise<{ success: boolean; latencyMs: number }> {
  const startTime = Date.now();
  const { client, bankId } = getHindsightClient();

  const formattedContent = `OPERATIONAL RULE / TEAM PREFERENCE: [${ruleId}] ${title}\n${content}`;

  await client.retain(bankId, formattedContent, {
    context: "team operational preference and rule",
    documentId: ruleId,
    tags: ["team-rule", "operational-preference"],
    metadata: {
      rule_id: ruleId,
      title: title,
    },
  });

  const latencyMs = Date.now() - startTime;
  console.log(`[Hindsight Retain Note] Rule ${ruleId} retained in ${latencyMs}ms`);
  return { success: true, latencyMs };
}

/**
 * Recall memories relevant to an alert query
 */
export async function recallSimilar(query: string, maxTokens = 4096): Promise<RecallResultWrapper> {
  const startTime = Date.now();
  const { client, bankId } = getHindsightClient();

  const response = await client.recall(bankId, query, {
    maxTokens,
  });

  const latencyMs = Date.now() - startTime;
  console.log(`[Hindsight Recall] Recalled ${response.results?.length || 0} memories in ${latencyMs}ms`);

  const memories: RecalledMemoryItem[] = (response.results || []).map((r) => ({
    id: r.id,
    text: r.text,
    context: r.context || undefined,
    occurred_start: r.occurred_start || undefined,
    document_id: r.document_id || undefined,
  }));

  return { memories, latencyMs };
}

/**
 * Reflect over all bank memories to find recurring patterns and systemic solutions
 */
export async function reflectPatterns(query: string): Promise<ReflectResultWrapper> {
  const startTime = Date.now();
  const { client, bankId } = getHindsightClient();

  const response = await client.reflect(bankId, query, {
    context: "Analyzing incident postmortems and failure patterns for Kirana Cloud",
  });

  const latencyMs = Date.now() - startTime;
  console.log(`[Hindsight Reflect] Completed reflection query in ${latencyMs}ms`);

  return {
    answer: response.text || "No synthesis returned.",
    latencyMs,
  };
}
