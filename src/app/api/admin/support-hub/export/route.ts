import { exportSupportRecords, type SupportRecordType } from "@/lib/support-hub";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type") as SupportRecordType;
  if (!["sponsorship", "donation", "volunteer"].includes(type)) {
    return new Response("Tipo inválido.", { status: 400 });
  }
  return new Response(`\uFEFF${exportSupportRecords(type)}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="11run-${type}.csv"`
    }
  });
}
