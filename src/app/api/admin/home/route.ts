import { NextResponse } from "next/server";
import {
  deactivateHomeProject,
  getHomeConfig,
  updateHomeSettings,
  upsertHomeProject,
  type HomeProject,
  type HomeSettings
} from "@/lib/home";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getHomeConfig({ activeOnly: false }));
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as
      | { kind: "settings"; settings: Partial<HomeSettings> }
      | { kind: "project"; project: Partial<HomeProject> & Pick<HomeProject, "name" | "href"> };
    if (body.kind === "settings") {
      return NextResponse.json({ ok: true, settings: updateHomeSettings(body.settings) });
    }
    if (body.kind === "project") {
      return NextResponse.json({ ok: true, project: upsertHomeProject(body.project) });
    }
    return NextResponse.json({ ok: false, error: "Ação inválida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível salvar a home." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "ID ausente." }, { status: 400 });
  deactivateHomeProject(id);
  return NextResponse.json({ ok: true });
}
