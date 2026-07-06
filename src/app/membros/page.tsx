import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MemberLoginForm } from "@/components/MemberLoginForm";
import { getMemberBySessionToken } from "@/lib/members";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ãrea de membros | 11RUN",
  description: "Acesso restrito para atletas 11RUN."
};

export default async function MembersPage() {
  const account = getMemberBySessionToken((await cookies()).get("member_session")?.value);
  if (account) redirect("/meu-painel");

  return (
    <main className="members-page">
      <section className="members-login-panel">
        <div>
          <span className="eyebrow">Ã¡rea restrita</span>
          <h1>Dashboard do atleta</h1>
          <p>
            Acesso liberado pela equipe 11RUN para atletas aceitos nos projetos 11 Futuro e 11 Master.
            Use o usuÃ¡rio e senha cadastrados no painel administrativo.
          </p>
        </div>
        <MemberLoginForm />
      </section>
    </main>
  );
}
