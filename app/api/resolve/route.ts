import { NextRequest, NextResponse } from "next/server";
import { retainIncident, IncidentMemoryInput } from "@/lib/hindsight";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alert, root_cause, fix, resolved_by, service, severity } = body;

    if (!alert || !root_cause || !fix || !resolved_by) {
      return NextResponse.json(
        { error: "Missing required fields: alert, root_cause, fix, and resolved_by are required." },
        { status: 400 }
      );
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const incidentId = `INC-LIVE-${randomNum}`;
    const timestamp = new Date().toISOString();

    const incident: IncidentMemoryInput = {
      id: incidentId,
      title: `Resolved Incident: ${alert.slice(0, 50)}...`,
      service: service || "unknown-service",
      severity: severity || "SEV2",
      started_at: timestamp,
      duration_minutes: 15,
      alert_text: alert,
      symptoms: alert,
      root_cause,
      resolution_steps: Array.isArray(fix) ? fix : [fix],
      what_did_not_work: "N/A - Resolved during live triage session",
      resolved_by,
      postmortem_link: `https://wiki.kirana.internal/incidents/${incidentId}`,
    };

    const { success, latencyMs } = await retainIncident(incident);

    return NextResponse.json({
      success,
      incident,
      latencyMs,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
