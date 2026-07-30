import { NextRequest, NextResponse } from "next/server";
import {
  getJapanRankingAdminData,
  restoreJapanRankingImport,
  saveJapanRankingCorrection,
  saveJapanRankingSeason,
  updateJapanRankingConfig
} from "@/lib/japan-rankings";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getJapanRankingAdminData());
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === "config") {
      updateJapanRankingConfig(body);
    } else if (body.action === "correction") {
      saveJapanRankingCorrection(body);
    } else if (body.action === "season") {
      saveJapanRankingSeason(body);
    } else if (body.action === "restore") {
      restoreJapanRankingImport(String(body.importId ?? ""));
    } else {
      return NextResponse.json({ error: "Ação administrativa inválida." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, data: getJapanRankingAdminData() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível salvar." }, { status: 400 });
  }
}
