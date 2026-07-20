import { NextResponse } from "next/server";
import { listAlexLopesApplications, updateAlexLopesApplication } from "@/lib/alex-lopes";

export async function GET() {
  return NextResponse.json({ applications: listAlexLopesApplications() });
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !["Recebido", "Em análise", "Contato realizado", "Matriculado", "Arquivado"].includes(status)) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    const application = updateAlexLopesApplication(id, { status });
    if (!application) return NextResponse.json({ error: "Cadastro não encontrado." }, { status: 404 });
    return NextResponse.json(application);
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar o cadastro." }, { status: 500 });
  }
}
