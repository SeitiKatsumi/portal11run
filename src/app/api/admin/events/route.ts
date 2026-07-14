import { NextResponse } from "next/server";
import { createMemberEvent, deleteMemberEvent, listMemberEvents } from "@/lib/events";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, events: listMemberEvents() });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      project_type?: string;
      event_date?: string;
      event_time?: string;
      location?: string;
      description?: string;
      participants?: string[];
    };

    const event = createMemberEvent({
      title: body.title ?? "",
      project_type: body.project_type ?? "todos",
      event_date: body.event_date ?? "",
      event_time: body.event_time,
      location: body.location,
      description: body.description,
      participants: body.participants
    });

    return NextResponse.json({ ok: true, event });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erro ao salvar evento." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "ID ausente." }, { status: 400 });
  deleteMemberEvent(id);
  return NextResponse.json({ ok: true });
}
