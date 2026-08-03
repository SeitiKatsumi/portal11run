import { getChallengeAdminData } from "@/lib/member-challenges";

export const runtime = "nodejs";

function cell(value: unknown) {
  const normalized = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

export async function GET() {
  const data = getChallengeAdminData();
  const rows = [
    ["tipo", "atleta", "periodo", "status", "valor", "beneficio_sugerido", "confianca_ia", "data"],
    ...data.submissions.map((row) => {
      const item = row as Record<string, unknown>;
      const submitted = (item.submitted_data ?? {}) as Record<string, unknown>;
      const normalized = (item.normalized_data ?? {}) as Record<string, unknown>;
      return [item.type, item.athlete_name, item.period_reference, item.status, normalized.average ?? submitted.attendance, item.suggested_benefit_percent, item.confidence_score, item.submitted_at];
    }),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(cell).join(";")).join("\r\n")}`;
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="desafios-11run-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
}
