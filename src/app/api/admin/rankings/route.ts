import { NextResponse } from "next/server";
import { createRanking, deleteRanking, listRankings } from "@/lib/rankings";

export const runtime = "nodejs";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  return NextResponse.json({ rankings: listRankings() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const age_group = clean(body && typeof body === "object" ? (body as { age_group?: unknown }).age_group : "");
  const eventInput = clean(body && typeof body === "object" ? (body as { event?: unknown }).event : "");
  const athlete_name = clean(body && typeof body === "object" ? (body as { athlete_name?: unknown }).athlete_name : "");
  const time = clean(body && typeof body === "object" ? (body as { time?: unknown }).time : "");
  const date = clean(body && typeof body === "object" ? (body as { date?: unknown }).date : "");
  const location = clean(body && typeof body === "object" ? (body as { location?: unknown }).location : "");

  const event = eventInput || age_group.split("-").at(-1)?.trim() || age_group;

  if (!age_group || !event || !athlete_name || !time || !date || !location) {
    return NextResponse.json({ error: "Preencha atleta, idade, prova, tempo, data e local." }, { status: 400 });
  }

  return NextResponse.json({ ranking: createRanking({ age_group, event, athlete_name, time, date, location }) });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = clean(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID ausente." }, { status: 400 });
  deleteRanking(id);
  return NextResponse.json({ ok: true });
}
