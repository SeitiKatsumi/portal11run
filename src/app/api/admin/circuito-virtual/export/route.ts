import { listCircuitAdminSubmissions } from "@/lib/virtual-circuit";

export const runtime = "nodejs";

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const rows = listCircuitAdminSubmissions();
  const header = ["ID", "Atleta", "Nome público", "Categoria", "Gênero", "Data", "Marca", "Cidade", "UF", "Modalidade", "Status"];
  const csv = [
    header.map(csvCell).join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.athlete_name,
        row.public_name,
        row.category_age,
        row.gender,
        row.activity_date,
        row.formattedTime,
        row.city,
        row.state,
        row.submission_type,
        row.status
      ]
        .map(csvCell)
        .join(",")
    )
  ].join("\r\n");
  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="circuito-virtual-11run.csv"`,
      "Cache-Control": "private, no-store"
    }
  });
}
