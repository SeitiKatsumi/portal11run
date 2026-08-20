import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarCheck2, Camera, Eye, Flag, ShieldAlert, Timer, WalletCards } from "lucide-react";
import { MemberLogoutButton } from "@/components/MemberLogoutButton";
import { MemberChallenges } from "@/components/MemberChallenges";
import { MemberMarkForm } from "@/components/MemberMarkForm";
import { MemberMedicalCertificate } from "@/components/MemberMedicalCertificate";
import { MemberProfilePhoto } from "@/components/MemberProfilePhoto";
import { MemberProfileUpdateLink } from "@/components/MemberProfileUpdateLink";
import { MemberRegistrationEditor } from "@/components/MemberRegistrationEditor";
import { MemberTermAcceptance } from "@/components/MemberTermAcceptance";
import { parseMemberMarkTime } from "@/lib/member-mark-chart";
import { getMemberChallengesDashboard } from "@/lib/member-challenges";
import { getMemberBySessionToken, getMemberDashboard, getMemberDashboardByLeadId, hasCurrentOnzeFuturoTerm, memberRoleLabels } from "@/lib/members";

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
const executedStatuses = new Set([
  "confirmada",
  "confirmado",
  "concluida",
  "concluido",
  "entregue",
  "executada",
  "executado",
  "paga",
  "pago",
  "realizada",
  "realizado",
  "recebida",
  "recebido",
]);

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

function formatDate(value?: string | null) {
  if (!value) return "Data a confirmar";
  const dateValue = value.includes("T") ? value : `${value}T12:00:00`;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

function financialDate(record: { paid_date: string | null; due_date: string | null; created_at: string }) {
  return record.paid_date || record.due_date || record.created_at;
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

function nextEvenMonthLabel(from = new Date()) {
  const date = new Date(from);
  do {
    date.setMonth(date.getMonth() + 1, 1);
  } while ((date.getMonth() + 1) % 2 !== 0);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

function currentDateInSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function MemberDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const previewLeadId = (await searchParams).preview?.trim();
  const previewMode = Boolean(previewLeadId);
  const account = previewMode ? null : getMemberBySessionToken((await cookies()).get("member_session")?.value);
  if (!previewMode && !account) redirect("/login");
  if (!previewMode && account && !hasCurrentOnzeFuturoTerm(account.id)) return <MemberTermAcceptance />;

  const dashboard = previewLeadId
    ? getMemberDashboardByLeadId(previewLeadId)
    : account
      ? getMemberDashboard(account.id)
      : null;
  if (!dashboard) redirect(previewMode ? "/admin/cadastros" : "/login");
  const challenges = getMemberChallengesDashboard(dashboard.account.id);

  const payload = parseJson<Record<string, string | boolean | string[]>>(dashboard.lead.payload_json, {});
  const receipts = parseJson<Record<string, boolean>>(dashboard.lead.receipts_json, {});
  const athleteName = dashboard.lead.athlete_name || dashboard.lead.name;
  const executedRecords = dashboard.financialRecords.filter((record) =>
    executedStatuses.has(normalizeStatus(record.status)),
  );
  const plannedRecords = dashboard.financialRecords.filter(
    (record) => !executedStatuses.has(normalizeStatus(record.status)),
  );
  const receivedTotal = executedRecords.reduce((total, record) => total + record.amount_cents, 0);
  const bestMark = [...dashboard.performanceMarks].sort(
    (a, b) =>
      (parseMemberMarkTime(a.time) ?? Number.POSITIVE_INFINITY) -
      (parseMemberMarkTime(b.time) ?? Number.POSITIVE_INFINITY)
  )[0];
  const today = currentDateInSaoPaulo();
  const eventsByDate = [...dashboard.events].sort((a, b) => a.event_date.localeCompare(b.event_date));
  const upcomingEvents = eventsByDate.filter((event) => event.event_date >= today);
  const finalizedEvents = eventsByDate.filter((event) => event.event_date < today).reverse();
  const nextRace =
    upcomingEvents.find((event) => event.event_type === "prova") ??
    upcomingEvents.find((event) => event.event_type !== "teste");
  const nextTest = upcomingEvents.find((event) => event.event_type === "teste");

  const renderFinancialRecord = (record: (typeof dashboard.financialRecords)[number]) => (
    <div className="member-finance-item" key={record.id}>
      {record.image_url ? (
        <img className="member-finance-thumb" src={record.image_url} alt={`Imagem de ${record.type}`} />
      ) : (
        <span className="member-finance-thumb placeholder">Sem foto</span>
      )}
      <section className="member-finance-content">
        <span>{record.type}</span>
        <strong>{formatMoney(record.amount_cents)}</strong>
        <small>
          {formatDate(financialDate(record))} &middot; {record.status}
        </small>
        {record.description ? <p>{record.description}</p> : null}
      </section>
    </div>
  );

  const renderEvent = (event: (typeof dashboard.events)[number]) => (
    <div key={event.id}>
      <strong>{event.title}</strong>
      <span>{formatEventDate(event.event_date, event.event_time)}</span>
      <span>{event.location || "Local a confirmar"}</span>
      <em>{event.description || "Orientações em breve."}</em>
    </div>
  );

  return (
    <main className="members-dashboard">
      {previewMode ? (
        <aside className="member-admin-preview-bar">
          <div>
            <Eye size={19} />
            <span>
              <strong>Prévia administrativa</strong>
              Visão do atleta em modo somente leitura
            </span>
          </div>
          <Link className="button ghost" href="/admin/cadastros">
            <ArrowLeft size={17} />
            Voltar aos cadastros
          </Link>
        </aside>
      ) : null}
      <section className="member-top-panel">
        <div className="member-identity">
          {previewMode ? (
            <div className="member-profile-photo member-profile-photo-preview" aria-label={`Foto de perfil de ${athleteName}`}>
              <div>
                {dashboard.account.profile_photo_url ? (
                  <img src={dashboard.account.profile_photo_url} alt={`Foto de perfil de ${athleteName}`} />
                ) : (
                  <Camera size={28} />
                )}
                <span><Camera size={16} /> Foto de perfil</span>
              </div>
            </div>
          ) : (
            <MemberProfilePhoto initialUrl={dashboard.account.profile_photo_url} athleteName={athleteName} />
          )}
          <div>
            <span className="eyebrow">{memberRoleLabels[dashboard.account.role]}</span>
            <h1>{athleteName}</h1>
          </div>
        </div>
        {previewMode ? (
          <span className="member-preview-readonly">Somente leitura</span>
        ) : (
          <MemberLogoutButton />
        )}
      </section>

      {!dashboard.account.medical_certificate_file_id ? (
        <aside className="member-medical-alert">
          <ShieldAlert size={22} />
          <div>
            <strong>Atestado médico pendente</strong>
            <span>Envie o atestado de aptidão no bloco “Informações do cadastro” para manter a documentação em dia.</span>
          </div>
          {!previewMode ? <MemberProfileUpdateLink /> : null}
        </aside>
      ) : null}

      {dashboard.termAcceptances[0] ? <details className="member-term-receipt">
        <summary><ShieldAlert size={20}/><div><strong>Termo do Onze Futuro aceito</strong>
        <span>Versão {dashboard.termAcceptances[0].document_version} · {formatDate(dashboard.termAcceptances[0].accepted_at)} · comprovante {dashboard.termAcceptances[0].document_hash.slice(0, 12).toUpperCase()}</span></div></summary>
        <div className="member-term-history">
          <strong>Histórico de aceites</strong>
          {dashboard.termAcceptances.map((acceptance) => <article key={acceptance.id}>
            <span>Versão {acceptance.document_version}</span><span>{formatDate(acceptance.accepted_at)}</span><code>{acceptance.document_hash.toUpperCase()}</code>
          </article>)}
        </div>
      </details> : null}

      <section className="member-highlight-grid" aria-label="Destaques do atleta">
        <article>
          <Timer size={22} />
          <span>Melhor marca nos 1.000 m</span>
          <strong>{bestMark?.time ?? "Sem marca"}</strong>
          <small>{bestMark ? `${formatDate(bestMark.date)} · ${bestMark.location}` : "Registre a primeira marca"}</small>
        </article>
        <article>
          <WalletCards size={22} />
          <span>Benefícios já recebidos</span>
          <strong>{formatMoney(receivedTotal)}</strong>
          <small>{executedRecords.length} lançamento(s) confirmado(s)</small>
        </article>
        <article>
          <Flag size={22} />
          <span>Próxima prova ou desafio</span>
          <strong>{nextRace?.title ?? "A programar"}</strong>
          <small>{nextRace ? formatEventDate(nextRace.event_date, nextRace.event_time) : "Nenhuma prova futura vinculada"}</small>
        </article>
        <article>
          <CalendarCheck2 size={22} />
          <span>Próximo teste de 1.000 m</span>
          <strong>{nextTest?.title ?? nextEvenMonthLabel()}</strong>
          <small>{nextTest ? formatEventDate(nextTest.event_date, nextTest.event_time) : "Teste obrigatório nos meses pares"}</small>
        </article>
      </section>

      <MemberChallenges
        initialData={JSON.parse(JSON.stringify(challenges))}
        readOnly={previewMode}
      />

      <section className="member-card wide">
        <span className="eyebrow">ranking e marcas</span>
        <h2>Evolução e marcas de 1.000 m</h2>
        <MemberMarkForm
          initialMarks={dashboard.performanceMarks.map((mark) => ({
            id: mark.id,
            event: mark.event,
            time: mark.time,
            date: mark.date,
            location: mark.location,
            editable: mark.editable,
            source: mark.source,
          }))}
          lockedTo1000m
          readOnly={previewMode}
        />
      </section>

      <section className="member-grid">
        <article className="member-card wide">
          <span className="eyebrow">agenda</span>
          <h2>Eventos</h2>
          <div className="member-event-groups">
            <section className="member-event-group" aria-labelledby="eventos-proximos">
              <header>
                <h3 id="eventos-proximos">Próximos</h3>
                <span className="member-event-count">{upcomingEvents.length}</span>
              </header>
              <div className="member-table member-events-table">
                {upcomingEvents.length === 0 ? <p>Nenhum próximo evento vinculado.</p> : null}
                {upcomingEvents.map(renderEvent)}
              </div>
            </section>

            <section className="member-event-group" aria-labelledby="eventos-finalizados">
              <header>
                <h3 id="eventos-finalizados">Finalizados</h3>
                <span className="member-event-count">{finalizedEvents.length}</span>
              </header>
              <div className="member-table member-events-table">
                {finalizedEvents.length === 0 ? <p>Nenhum evento finalizado.</p> : null}
                {finalizedEvents.map(renderEvent)}
              </div>
            </section>
          </div>
        </article>

        <article className="member-card wide">
          <span className="eyebrow">financeiro</span>
          <h2>Benefícios Recebidos</h2>
          <div className="member-finance-columns">
            <section className="member-finance-column">
              <header className="member-finance-column-head">
                <div>
                  <span className="eyebrow">pendentes e previstos</span>
                  <h3>Planejados</h3>
                </div>
                <span
                  className="member-finance-count"
                  aria-label={`${plannedRecords.length} lançamentos planejados`}
                >
                  {plannedRecords.length}
                </span>
              </header>
              <div className="member-list">
                {plannedRecords.length === 0 ? (
                  <p className="member-finance-empty">Nenhum lançamento planejado.</p>
                ) : null}
                {plannedRecords.map(renderFinancialRecord)}
              </div>
            </section>

            <section className="member-finance-column">
              <header className="member-finance-column-head">
                <div>
                  <span className="eyebrow">pagos e entregues</span>
                  <h3>Executados</h3>
                </div>
                <span
                  className="member-finance-count"
                  aria-label={`${executedRecords.length} lançamentos executados`}
                >
                  {executedRecords.length}
                </span>
              </header>
              <div className="member-list">
                {executedRecords.length === 0 ? (
                  <p className="member-finance-empty">Nenhum lançamento executado.</p>
                ) : null}
                {executedRecords.map(renderFinancialRecord)}
                <div className="member-finance-total">
                  <span>Total já recebido</span>
                  <strong>{formatMoney(receivedTotal)}</strong>
                </div>
              </div>
            </section>
          </div>
        </article>

        <article className="member-card wide member-collapsible-card">
          <details className="member-details-panel" id="informacoes-cadastro">
            <summary>
              <span>
                <span className="eyebrow">dados cadastrais</span>
                <strong>Informações do cadastro</strong>
              </span>
              <em>Abrir painel</em>
            </summary>
            {!previewMode ? <MemberMedicalCertificate initialName={dashboard.account.medical_certificate_name} /> : null}
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
            {!previewMode ? <MemberRegistrationEditor payload={payload} /> : null}
            <section className="member-benefits-panel" aria-labelledby="member-benefits-title">
              <span className="eyebrow">materiais e benefícios</span>
              <h2 id="member-benefits-title">Direitos do projeto</h2>
              <div className="member-list">
                {Object.keys(receipts).length === 0 ? <p>Nenhum direito cadastrado ainda.</p> : null}
                {Object.entries(receipts).map(([item, hasRight]) => (
                  <div key={item}>
                    <span>{item}</span>
                    <strong>{hasRight ? "Tem direito" : "Não tem direito"}</strong>
                  </div>
                ))}
              </div>
            </section>
          </details>
        </article>

        <article className="member-card wide member-faq">
          <span className="eyebrow">perguntas frequentes</span>
          <h2>FAQ do 11 Futuro</h2>
          <div>
            <details>
              <summary>Por quanto tempo o projeto acontece?</summary>
              <p>O ciclo institucional do piloto está previsto para 2026 a 2029. A permanência individual é acompanhada e pode ser encerrada antes desse prazo pela família ou pela 11RUN, sempre com atenção ao melhor interesse do atleta.</p>
            </details>
            <details>
              <summary>O atestado de aptidão médica é obrigatório?</summary>
              <p>Sim. O responsável deve manter um atestado válido e atualizado, informando qualquer mudança relevante na saúde do atleta antes de treinos, testes, eventos ou provas.</p>
            </details>
            <details>
              <summary>Quem responde pela participação do menor?</summary>
              <p>Os pais ou responsáveis legais assumem integral responsabilidade pela autorização, condições de saúde, deslocamento, acompanhamento e ocorrências antes, durante e depois de qualquer treino, teste, evento ou prova relacionada ao projeto.</p>
            </details>
            <details>
              <summary>Quando são realizados os testes de 1.000 m?</summary>
              <p>O acompanhamento prevê um teste de 1.000 m nos meses pares. Datas e locais são comunicados no painel conforme disponibilidade e planejamento técnico.</p>
            </details>
            <details>
              <summary>Como funcionam os Desafios 11RUN?</summary>
              <p>Escolar, Assiduidade, Minha Evolução e Ideias para o Projeto registram compromisso e progresso. Score, badges e projeções não são ranking de talento nem aprovação financeira automática; documentos e benefícios passam por validação humana.</p>
            </details>
            <details>
              <summary>Onde encontro todas as regras do painel e do projeto?</summary>
              <p>A <Link href="/onze-futuro#faq">Super FAQ do Onze Futuro</Link> explica cadastro, responsabilidades, módulos gamificados, benefícios, privacidade, permanência e desligamento para atletas, famílias, treinadores e profissionais.</p>
            </details>
          </div>
          <Link className="member-super-faq-link" href="/onze-futuro#faq">Acessar a Super FAQ do Onze Futuro →</Link>
        </article>
      </section>
    </main>
  );
}
