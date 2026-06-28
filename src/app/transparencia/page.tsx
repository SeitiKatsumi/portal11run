import type { Metadata } from "next";
import { listTransparencyRecords } from "@/lib/finance";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Central de Transparência | 11RUN",
  description: "Resumo público de entradas, saídas, apoios e benefícios registrados no ecossistema 11RUN."
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default function TransparenciaPage() {
  const records = listTransparencyRecords().filter((record) => ["Confirmada", "Pago", "Entregue"].includes(record.status));
  const entries = records.filter((record) => record.direction === "entrada");
  const expenses = records.filter((record) => record.direction === "saida");
  const totalEntries = entries.reduce((sum, record) => sum + record.amount_cents, 0);
  const totalExpenses = expenses.reduce((sum, record) => sum + record.amount_cents, 0);
  const athletes = new Set(expenses.map((record) => record.athlete_name).filter(Boolean));
  const sponsors = new Set(records.map((record) => record.sponsor_name).filter(Boolean));

  return (
    <main className="transparency-page">
      <section className="transparency-hero">
        <span className="eyebrow">central de transparência</span>
        <h1>Apoio recebido, recurso aplicado, impacto visível.</h1>
        <p>
          Esta página apresenta um resumo público dos lançamentos liberados para transparência, sem expor CPF, RG,
          endereço, telefone, dados familiares ou informações sensíveis dos atletas.
        </p>
      </section>

      <section className="finance-kpis transparency-kpis">
        <article>
          <span>Total de entradas confirmadas</span>
          <strong>{formatMoney(totalEntries)}</strong>
        </article>
        <article>
          <span>Total aplicado</span>
          <strong>{formatMoney(totalExpenses)}</strong>
        </article>
        <article>
          <span>Saldo demonstrado</span>
          <strong>{formatMoney(totalEntries - totalExpenses)}</strong>
        </article>
        <article>
          <span>Atletas beneficiados</span>
          <strong>{athletes.size}</strong>
        </article>
        <article>
          <span>Patrocinadores/apoiadores</span>
          <strong>{sponsors.size}</strong>
        </article>
      </section>

      <section className="transparency-list">
        {records.length === 0 ? <p>Nenhum lançamento liberado para transparência pública ainda.</p> : null}
        {records.map((record) => (
          <article key={record.id}>
            <span className={`finance-badge ${record.direction}`}>{record.direction}</span>
            <h2>{record.type}</h2>
            <p>{record.transparency_notes || record.description}</p>
            <dl>
              <div>
                <dt>Projeto</dt>
                <dd>{record.project_type || "Projeto 11RUN"}</dd>
              </div>
              <div>
                <dt>Patrocinador/apoiador</dt>
                <dd>{record.sponsor_name || "Não informado"}</dd>
              </div>
              <div>
                <dt>Valor</dt>
                <dd>{formatMoney(record.amount_cents)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{record.status}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </main>
  );
}
