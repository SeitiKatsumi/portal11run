import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MemberLogoutButton } from "@/components/MemberLogoutButton";
import { MemberMarkForm } from "@/components/MemberMarkForm";
import { getMemberBySessionToken, getMemberDashboard, memberRoleLabels } from "@/lib/members";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard do atleta | 11RUN",
  description: "Área restrita de acompanhamento do atleta 11RUN."
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default async function MemberDashboardPage() {
  const account = getMemberBySessionToken((await cookies()).get("member_session")?.value);
  if (!account) redirect("/login");

  const dashboard = getMemberDashboard(account.id);
  if (!dashboard) redirect("/login");

  const payload = parseJson<Record<string, string | boolean | string[]>>(dashboard.lead.payload_json, {});
  const receipts = parseJson<Record<string, boolean>>(dashboard.lead.receipts_json, {});
  const athleteName = dashboard.lead.athlete_name || dashboard.lead.name;

  return (
    <main className="members-dashboard">
      <section className="member-top-panel">
        <div>
          <span className="eyebrow">{memberRoleLabels[dashboard.account.role]}</span>
          <h1>{athleteName}</h1>
          <p>
            Dashboard restrito com dados cadastrais, recebimentos, financeiro, criativos e marcas enviadas para
            acompanhamento do projeto.
          </p>
        </div>
        <MemberLogoutButton />
      </section>

      <section className="member-grid">
        <article className="member-card wide">
          <span className="eyebrow">dados cadastrais</span>
          <h2>Informações do cadastro</h2>
          <dl className="member-data-list">
            {Object.entries(payload)
              .filter(([key]) => !["photos"].includes(key))
              .map(([key, value]) => (
                <div key={key}>
                  <dt>{key.replaceAll("_", " ")}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
          </dl>
        </article>

        <article className="member-card">
          <span className="eyebrow">materiais e benefícios</span>
          <h2>Controle de recebimentos</h2>
          <div className="member-list">
            {Object.keys(receipts).length === 0 ? <p>Nenhum recebimento confirmado ainda.</p> : null}
            {Object.entries(receipts).map(([item, received]) => (
              <div key={item}>
                <span>{item}</span>
                <strong>{received ? "Recebido" : "Pendente"}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="member-card">
          <span className="eyebrow">financeiro</span>
          <h2>Valores vinculados</h2>
          <div className="member-list">
            {dashboard.financialRecords.length === 0 ? <p>Nenhum lançamento financeiro vinculado ainda.</p> : null}
            {dashboard.financialRecords.map((record) => (
              <div key={record.id}>
                <span>{record.description}</span>
                <strong>{formatMoney(record.amount_cents)}</strong>
                <small>{record.status}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="member-card wide">
          <span className="eyebrow">ranking e marcas</span>
          <h2>Inserir marca de teste ou prova</h2>
          <MemberMarkForm />
          <div className="member-table">
            {dashboard.marks.length === 0 ? <p>Nenhuma marca enviada ainda.</p> : null}
            {dashboard.marks.map((mark) => (
              <div key={mark.id}>
                <strong>{mark.event}</strong>
                <span>{mark.age_group}</span>
                <span>{mark.time}</span>
                <span>{mark.date}</span>
                <span>{mark.location}</span>
                <em>{mark.status}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="member-card">
          <span className="eyebrow">ranking publicado</span>
          <h2>Resultados aprovados</h2>
          <div className="member-list">
            {dashboard.rankings.length === 0 ? <p>Sem resultados publicados para este atleta.</p> : null}
            {dashboard.rankings.map((ranking) => (
              <div key={ranking.id}>
                <span>
                  {ranking.age_group} · {ranking.event}
                </span>
                <strong>{ranking.time}</strong>
                <small>
                  {ranking.date} · {ranking.location}
                </small>
              </div>
            ))}
          </div>
        </article>

        <article className="member-card">
          <span className="eyebrow">marketing</span>
          <h2>Banco de criativos</h2>
          <div className="member-list">
            {dashboard.creativeAssets.length === 0 ? <p>Nenhum criativo liberado ainda.</p> : null}
            {dashboard.creativeAssets.map((asset) => (
              <div key={asset.id}>
                <span>{asset.title}</span>
                {asset.description ? <small>{asset.description}</small> : null}
                {asset.file_url ? <a href={asset.file_url}>Abrir arquivo</a> : null}
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
