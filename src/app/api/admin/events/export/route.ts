import { listEventRegistrations, registrationEvents } from "@/lib/event-registrations";

export const runtime = "nodejs";

function cell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const eventId = new URL(request.url).searchParams.get("event_id");
  if (eventId && !Object.hasOwn(registrationEvents, eventId)) return new Response("Evento inválido.", { status: 400 });
  const registrations = listEventRegistrations().filter((registration) => !eventId || registration.event_id === eventId);
  const rows = [
    ["Evento", "Tipo", "Responsável", "E-mail", "Telefone", "Cidade", "UF", "Escola", "Participante", "Nascimento", "Gênero", "Categoria", "Protocolo", "Recebida em"],
    ...registrations.flatMap((registration) => registration.participants.map((participant) => [
      registrationEvents[registration.event_id].title,
      registration.registration_type === "school" ? "Grupo escolar" : "Individual",
      registration.name,
      registration.email,
      registration.phone,
      registration.city,
      registration.state,
      registration.school_name,
      participant.name,
      participant.birth_date,
      participant.gender,
      participant.school_year ? `${participant.school_year}º Ano` : "Grupo escolar",
      registration.id,
      registration.created_at
    ]))
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(cell).join(";")).join("\r\n")}`;
  const suffix = eventId || "todos-eventos";
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="inscricoes-${suffix}-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "private, no-store" } });
}
