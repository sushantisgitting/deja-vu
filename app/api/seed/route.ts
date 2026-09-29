import { NextResponse } from "next/server";
import { retainIncident, retainNote, IncidentMemoryInput } from "@/lib/hindsight";
import incidentsData from "@/data/incidents.json";
import teamKnowledgeData from "@/data/team_knowledge.json";

export async function POST() {
  try {
    const incidents: IncidentMemoryInput[] = incidentsData as IncidentMemoryInput[];
    const rules = teamKnowledgeData as Array<{ id: string; title: string; content: string }>;

    const results: Array<{ id: string; type: string; success: boolean; latencyMs: number }> = [];

    // Retain incidents
    for (const incident of incidents) {
      try {
        const { success, latencyMs } = await retainIncident(incident);
        results.push({ id: incident.id, type: "incident", success, latencyMs });
      } catch (err) {
        console.error(`Failed to retain incident ${incident.id}:`, err);
        results.push({ id: incident.id, type: "incident", success: false, latencyMs: 0 });
      }
    }

    // Retain team operational preferences
    for (const rule of rules) {
      try {
        const { success, latencyMs } = await retainNote(rule.id, rule.title, rule.content);
        results.push({ id: rule.id, type: "rule", success, latencyMs });
      } catch (err) {
        console.error(`Failed to retain rule ${rule.id}:`, err);
        results.push({ id: rule.id, type: "rule", success: false, latencyMs: 0 });
      }
    }

    const totalSuccess = results.filter((r) => r.success).length;

    return NextResponse.json({
      message: `Seeding completed. Retained ${totalSuccess}/${results.length} items.`,
      total: results.length,
      successful: totalSuccess,
      results,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
