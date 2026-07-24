import { NextResponse } from "next/server";
import {
  listSupportHistory,
  listSupportHubRecords,
  supportDashboard,
  updateSupportRecord,
  type SupportRecordType
} from "@/lib/support-hub";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") as SupportRecordType | null;
  const id = url.searchParams.get("id");
  if (type && id) return NextResponse.json({ ok: true, history: listSupportHistory(type, id) });
  return NextResponse.json({ ok: true, records: listSupportHubRecords(), dashboard: supportDashboard() });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      type?: SupportRecordType;
      id?: string;
      status?: string;
      owner?: string;
      adminNotes?: string;
      note?: string;
    };
    if (!body.type || !body.id || !["sponsorship", "donation", "volunteer"].includes(body.type)) {
      throw new Error("Tipo e ID são obrigatórios.");
    }
    const record = updateSupportRecord({
      type: body.type,
      id: body.id,
      status: body.status,
      owner: body.owner,
      adminNotes: body.adminNotes,
      note: body.note,
      actor: `admin:${process.env.ADMIN_USER || "admin"}`
    });
    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível atualizar." },
      { status: 400 }
    );
  }
}
