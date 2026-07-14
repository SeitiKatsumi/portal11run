import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MemberLogoutButton } from "@/components/MemberLogoutButton";
import { MemberMarkForm } from "@/components/MemberMarkForm";
import { MemberRegistrationEditor } from "@/components/MemberRegistrationEditor";
import { getMemberBySessionToken, getMemberDashboard, memberRoleLabels } from "@/lib/members";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard do atleta | 11RUN",
  description: "Área restrita de acompanhamento do atleta 11RUN."
};

const fieldLabels: Record<string, string> = {
  name: "Nome do cadastrante",
  email: "E-mail",
  phone: "WhatsApp",
  city: "Cidade",
  state: "Estado",
  profile_type: "Perfil",
  project_interest: "Projeto de interesse",
  project_type: "Projeto",
  message: "Mensagem",
  athlete_name: "Nome do atleta",
  birth_date: "Data de nascimento",
  age: "Idade",
  category: "Categoria",
  school: "Escola",
  team: "Equipe",
  father_name: "Nome do pai",
  mother_name: "Nome da mãe",
  guardian_name: "Nome do responsável",
  guardian_rg: "RG do responsável",
  guardian_cpf: "CPF do responsável",
  guardian_pix: "PIX do responsável",
  athlete_rg: "RG do atleta",
  athlete_cpf: "CPF do atleta",
  address: "Endereço",
  shoe_size: "Tamanho do calçado",
  height_cm: "Altura (cm)",
  weight_kg: "Peso (kg)",
  coach_name: "Nome do treinador",
  coach_phone: "Contato do treinador",
  coach_cref: "CREF do treinador",
  athlete_dream: "Maior sonho do atleta",
  cpf: "CPF",
  rg: "RG",
  social_link: "Perfil em redes sociais",
  best_marks: "Melhores marcas",
  competitions: "Competições",
  within_itatiba_radius: "Raio de 40 km de Itatiba",
  race_event: "Prova",
  payment_plan: "Plano de pagamento",
  payment_receipt_url: "Comprovante de pagamento",
  accepted_contact: "Aceite de contato",
  accepted_terms: "Aceite do termo",
  term_acceptor_name: "Nome de quem aceitou",
  term_acceptor_cpf: "CPF de quem aceitou",
  created_at: "Criado em"
};

const hiddenFields = new Set(["photos", "id"]);
const receivedStatuses = new Set(["confirmada", "pago", "entregue", "recebido", "realizado"]);

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

function formatValue(value: string | boolean | string[]) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return value;
}

function normalizeStatus(status: string) {
  return status
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function formatEventDate(date: string, time?: string | null) {
  const [year, month, day] = date.split("-");
  const formatted = year && month && day ? `${day}/${month}/${year}` : date;
  return time ? `${formatted} às ${time}` : formatted;
}

export default async function MemberDashboardPage() {
  const account = getMemberBySessionToken((await cookies()).get("member_session")?.value);
  if (!account) redirect("/login");

  const dashboard = getMemberDashboard(account.id);
  if (!dashboard) redirect("/login");

  const payload = parseJson<Record<string, string | boolean | string[]>>(dashboard.lead.payload_json, {});
  const receipts = parseJson<Record<string, boolean>>(dashboard.lead.receipts_json, {});
  const athleteName = dashboard.lead.athlete_name || dashboard.lead.name;
  const receivedTotal = dashboard.financialRecords
    .filter((record) => receivedStatuses.has(normalizeStatus(record.status)))
    .reduce((total, record) => total + record.amount_cents, 0);

  return (
    <main className="members-dashboard">
      <section className="member-top-panel">
        <div>
          <span className="eyebrow">{memberRoleLabels[dashboard.account.role]}</span>
          <h1>{athleteName}</h1>
          <p>
            Dashboard restrito com dados cadastrais, direitos do projeto, financeiro, criativos, eventos e marcas enviadas
            para acompanhamento.
          </p>
        </div>
        <MemberLogoutButton />
      </section>

      <section className="member-grid">
        <article className="member-card wide member-collapsible-card">
          <details className="member-details-panel">
            <summary>
              <span>
                <span className="eyebrow">dados cadastrais</span>
                <strong>Informações do cadastro</strong>
              </span>
              <em>Abrir painel</em>
            </summary>
            <dl className="member-data-list">
              {Object.entries(payload)
                .filter(([key, value]) => !hiddenFields.has(key) && value !== undefined && value !== "")
                .map(([key, value]) => (
                  <div key={key}>
                    <dt>{fieldLabels[key] ?? key.replaceAll("_", " ")}</dt>
                    <dd>{formatValue(value)}</dd>
                  </div>
                ))}
            </dl>
            <MemberRegistrationEditor payload={payload} />
          </details>
        </article>

        <article className="member-card">
          <span className="eyebrow">materiais e benefícios</span>
          <h2>Direitos do projeto</h2>
          <div className="member-list">
            {Object.keys(receipts).length === 0 ? <p>Nenhum direito cadastrado ainda.</p> : null}
            {Object.entries(receipts).map(([item, hasRight]) => (
              <div key={item}>
                <span>{item}</span>
                <strong>{hasRight ? "Tem direito" : "Não tem direito"}</strong>
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
            <div className="member-finance-total">
              <span>Total já recebido</span>
              <strong>{formatMoney(receivedTotal)}</strong>
            </div>
          </div>
        </article>

        <article className="member-card wide">
          <span className="eyebrow">agenda</span>
          <h2>Próximos eventos</h2>
          <div className="member-table member-events-table">
            {dashboard.events.length === 0 ? <p>Nenhum evento vinculado a este atleta ainda.</p> : null}
            {dashboard.events.map((event) => (
              <div key={event.id}>
                <strong>{event.title}</strong>
                <span>{formatEventDate(event.event_date, event.event_time)}</span>
                <span>{event.location || "Local a confirmar"}</span>
                <em>{event.description || "Orientações em breve."}</em>
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
