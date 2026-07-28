"use client";

import Link from "next/link";
import {
  ArrowRight, BarChart3, Bot, BrainCircuit, Check, ChevronRight, CircleGauge, Code2,
  Film, Flag, Globe2, HeartHandshake, LineChart, MapPin, Medal, Megaphone, MousePointerClick,
  Network, Search, ShieldCheck, Sparkles, Target, Trophy, Users
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import styles from "@/app/apoie-o-projeto/solucoes-de-marketing/marketing.module.css";

const expertise = [
  [Target, "Marketing esportivo", "Ativações, campanhas, experiências, eventos e ações conectadas ao universo da corrida."],
  [Megaphone, "Publicidade e branding", "Conceitos, narrativas, identidade, peças publicitárias e posicionamento de marca."],
  [Film, "Conteúdo e audiovisual", "Fotos, vídeos, entrevistas, histórias de atletas, bastidores e materiais institucionais."],
  [BrainCircuit, "Inteligência Artificial", "Análise, automação, otimização e leitura executiva das oportunidades e resultados."],
  [MousePointerClick, "Performance e mídia", "Segmentação, tráfego pago, remarketing, captação de leads e conversões."],
  [Search, "SEO e posicionamento", "Conteúdo estratégico, autoridade digital, indexação e presença em mecanismos de busca."],
  [Code2, "Tecnologia", "Landing pages, sistemas, dashboards, integrações, formulários e experiências personalizadas."]
] as const;

const solutions = [
  "Patrocínio institucional", "Naming rights", "Conteúdo patrocinado", "Colaborações com atletas",
  "Campanhas em redes sociais", "Produção de vídeos", "Séries documentais", "Presença em uniformes",
  "Ativações em competições", "Eventos corporativos", "Experiências com colaboradores", "Desafios virtuais",
  "Responsabilidade social", "Landing pages", "Captação de leads", "Tráfego pago", "SEO e conteúdo",
  "Ações regionais", "Projetos nacionais e internacionais", "Dashboards personalizados"
];

const futureMetrics = [
  "Evolução esportiva e recordes pessoais", "Treinamentos e competições", "Equipamentos e experiências",
  "Viagens e oportunidades", "Conteúdos e alcance das histórias", "Engajamento e crescimento da comunidade"
];

const masterMetrics = [
  "Alcance, impressões e visualizações", "Cliques, leads e conversões", "Conteúdos e menções da marca",
  "Provas, resultados e pódios", "Participações em eventos", "Desempenho da mídia paga"
];

const steps = [
  ["01", "Diagnóstico", "Empresa, objetivos, público, região, produtos e posicionamento."],
  ["02", "Estratégia", "Projeto, frente da 11Run, formatos, canais, cronograma e indicadores."],
  ["03", "Produção", "Campanhas, conteúdos, páginas, vídeos, peças e ativações."],
  ["04", "Distribuição", "Publicação, impulsionamento, SEO, mídia e experiências."],
  ["05", "Mensuração", "Indicadores, relatórios, aprendizados e otimizações."]
];

const interests = [
  "11Run Futuro", "11Run Master", "Circuito Virtual", "Eventos", "Conteúdo e publicidade",
  "Marketing esportivo", "Campanhas digitais", "Projetos sociais", "Ainda não sei", "Quero uma solução personalizada"
];

const objectives = [
  "Fortalecimento de marca", "Alcance e visibilidade", "Responsabilidade social", "Conteúdo",
  "Captação de leads", "Vendas", "Relacionamento com colaboradores", "Ativação regional", "Ativação nacional", "Outro"
];

export function MarketingSolutions() {
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);
  const illustrativeBars = useMemo(() => [68, 84, 57, 76, 91, 72, 88], []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams(window.location.search);
    const payload = Object.fromEntries(form.entries()) as Record<string, string>;
    const details = [
      `Site/perfil: ${payload.site || "Não informado"}`,
      `Segmento: ${payload.segment}`,
      `Objetivo: ${payload.objective}`,
      `Frente de interesse: ${payload.interest}`,
      `Mensagem: ${payload.message}`,
      `UTM source: ${params.get("utm_source") || "direto"}`,
      `UTM medium: ${params.get("utm_medium") || "não informado"}`,
      `UTM campaign: ${params.get("utm_campaign") || "não informado"}`,
      `Página de origem: ${document.referrer || "acesso direto"}`
    ].join("\n");
    const response = await fetch("/api/support/sponsorship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        company: payload.company,
        role: payload.role,
        email: payload.email,
        phone: payload.phone,
        city: payload.city,
        state: payload.state,
        supporterType: "Empresa",
        supportTypes: ["Comunicação e mídia"],
        projectInterest: payload.interest,
        message: details,
        consent: payload.consent,
        website: payload.website,
        origin: `Landing Soluções de Marketing · ${params.get("utm_source") || "direto"}`
      })
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok || !result.ok) {
      setFeedback({ ok: false, text: result.error || "Não foi possível enviar. Revise os campos e tente novamente." });
      return;
    }
    setFeedback({ ok: true, text: `Recebemos sua mensagem. Protocolo ${result.protocol}. Nossa equipe entrará em contato.` });
    event.currentTarget.reset();
  }

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Trilha de navegação">
        <Link href="/">Início</Link><ChevronRight aria-hidden="true" />
        <Link href="/apoie">Apoie o Projeto</Link><ChevronRight aria-hidden="true" />
        <strong>Soluções de Marketing</strong>
      </nav>

      <section className={styles.hero}>
        <img src="/assets/home/ayla-trofeus-hero.webp" alt="Atleta 11Run com troféus representando performance e resultados" />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>11Run × Elevenmind</span>
          <h1>Sua marca dentro de um novo ecossistema de marketing esportivo</h1>
          <p>A 11Run conecta empresas ao público da corrida por meio de esporte, conteúdo, publicidade, tecnologia e Inteligência Artificial.</p>
          <div className={styles.heroActions}>
            <a href="#contato">Quero construir uma parceria <ArrowRight aria-hidden="true" /></a>
            <a href="#solucoes">Conhecer as soluções</a>
          </div>
          <div className={styles.badges} aria-label="Especialidades">
            {["Marketing esportivo", "Conteúdo", "IA aplicada", "SEO e mídia", "Dados", "Projetos globais"].map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </section>

      <section className={styles.statement}>
        <div>
          <span className={styles.eyebrow}>Muito além de um patrocínio</span>
          <h2>A marca não aparece apenas no projeto.</h2>
        </div>
        <div>
          <p>Ela passa a fazer parte de uma narrativa construída com estratégia, propósito e mensuração.</p>
          <p>Planejamento, conteúdo, ativações, mídia, SEO, páginas, captação de leads e acompanhamento de resultados podem integrar uma única parceria.</p>
        </div>
      </section>

      <section className={styles.expertise} id="solucoes">
        <header className={styles.sectionHeader}>
          <div><span className={styles.eyebrow}>Estrutura Elevenmind</span><h2>Inteligência de agência aplicada ao esporte</h2></div>
          <p>Especialidades integradas em uma operação preparada para construir ações completas e adequadas aos objetivos de cada empresa.</p>
        </header>
        <div className={styles.expertiseGrid}>
          {expertise.map(([Icon, title, text], index) => (
            <article key={title}>
              <div><Icon aria-hidden="true" /><span>{String(index + 1).padStart(2, "0")}</span></div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
        <a className={styles.inlineCta} href="#contato">Fale com nossa equipe <ArrowRight aria-hidden="true" /></a>
      </section>

      <section className={styles.solutions}>
        <header className={styles.sectionHeader}>
          <div><span className={styles.eyebrow}>Ecossistema de soluções</span><h2>Construído de acordo com cada parceiro</h2></div>
          <p>Objetivo, público, região, duração, canais, indicadores e orçamento definem a combinação certa — sem pacotes rígidos.</p>
        </header>
        <div className={styles.solutionGrid}>
          {solutions.map((item, index) => (
            <button type="button" aria-pressed={selectedSolution === item} className={selectedSolution === item ? styles.selectedSolution : ""} onClick={() => setSelectedSolution(item)} key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>{item}<ArrowRight aria-hidden="true" />
            </button>
          ))}
        </div>
        {selectedSolution && <p className={styles.selectionNote}><Check aria-hidden="true" /> {selectedSolution} pode ser combinada a outras entregas em uma proposta personalizada.</p>}
      </section>

      <section className={styles.paths}>
        <header className={styles.sectionHeader}>
          <div><span className={styles.eyebrow}>Duas frentes complementares</span><h2>Impacto de longo prazo e ativações de curto prazo</h2></div>
          <p>Uma mesma estratégia pode desenvolver jovens talentos e gerar entregas imediatas com atletas competitivos.</p>
        </header>
        <div className={styles.pathGrid}>
          <article className={styles.future}>
            <div className={styles.pathTop}><Medal aria-hidden="true" /><span>Construção de longo prazo</span></div>
            <h3>11Run Futuro: marcas que participam de toda a jornada</h3>
            <p>O valor está na evolução esportiva, humana e educacional. A marca ajuda a criar experiências, oportunidades e histórias — sem promessas de resultado ou exposição inadequada.</p>
            <ul>{futureMetrics.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>
            <blockquote>No 11Run Futuro, a marca não patrocina apenas um resultado. Ela ajuda a construir uma história.</blockquote>
            <div className={styles.safety}><ShieldCheck aria-hidden="true" /><span>Imagem de crianças e adolescentes sempre tratada com autorização, LGPD, privacidade e proteção integral.</span></div>
          </article>
          <article className={styles.master}>
            <div className={styles.pathTop}><Trophy aria-hidden="true" /><span>Entregas mensuráveis</span></div>
            <h3>11Run Master: ações rápidas, competitivas e mensuráveis</h3>
            <p>Competições, resultados, eventos e campanhas de duração definida conectam presença esportiva a objetivos de comunicação claros.</p>
            <ul>{masterMetrics.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>
            <blockquote>No 11Run Master, cada ativação possui objetivos, entregas e indicadores definidos desde o início.</blockquote>
          </article>
        </div>
        <div className={styles.pathCta}><span>Futuro + Master podem integrar a mesma estratégia.</span><a href="#contato">Crie uma ação personalizada <ArrowRight aria-hidden="true" /></a></div>
      </section>

      <section className={styles.dashboard}>
        <div className={styles.dashboardCopy}>
          <span className={styles.eyebrow}>Dashboard inteligente</span>
          <h2>Tudo acompanhado por dados</h2>
          <p>Campanhas, conteúdos, ativações e projetos apoiados podem ser visualizados em um painel desenvolvido pela Elevenmind.</p>
          <ul>
            {["Alcance e engajamento", "Tráfego, leads e conversões", "Desempenho por campanha e conteúdo", "Resultados por atleta e projeto", "SEO e posicionamento orgânico", "Histórico de entregas"].map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}
          </ul>
          <div className={styles.aiNote}><Bot aria-hidden="true" /><span><strong>IA aplicada à leitura.</strong> Identifica padrões, compara campanhas e apoia recomendações e relatórios executivos.</span></div>
          <a className={styles.inlineCta} href="#contato">Associe sua marca à 11Run <ArrowRight aria-hidden="true" /></a>
        </div>
        <div className={styles.dashboardMock} aria-label="Demonstração ilustrativa do painel de marketing">
          <div className={styles.mockTop}><span><CircleGauge aria-hidden="true" />11Run Intelligence</span><em>Demonstração do painel</em></div>
          <div className={styles.mockKpis}>
            {["Alcance", "Engajamento", "Conteúdos", "Evolução"].map((item, index) => <article key={item}><span>{item}</span><strong>{index === 2 ? "—" : "Dados"}</strong><small>visualização ilustrativa</small></article>)}
          </div>
          <div className={styles.mockChart}>
            <header><span>Desempenho por período</span><small>Dados ilustrativos</small></header>
            <div className={styles.bars}>{illustrativeBars.map((value, index) => <i key={index} style={{ height: `${value}%` }} />)}</div>
          </div>
          <div className={styles.mockBottom}>
            <article><Globe2 aria-hidden="true" /><span>Origem dos acessos</span><strong>Visão por canal</strong></article>
            <article><LineChart aria-hidden="true" /><span>Campanhas</span><strong>Comparação de entregas</strong></article>
          </div>
        </div>
      </section>

      <section className={styles.process}>
        <header className={styles.sectionHeader}>
          <div><span className={styles.eyebrow}>Como funciona</span><h2>Da conversa ao aprendizado</h2></div>
          <p>Cinco etapas conectam objetivo, execução e mensuração em um processo transparente.</p>
        </header>
        <ol>{steps.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
      </section>

      <section className={styles.positioning}>
        <div><MapPin aria-hidden="true" /><span className={styles.eyebrow}>O canal certo</span></div>
        <h2>Alcance quem vive a corrida com qualidade, autenticidade e precisão.</h2>
        <p>Atletas, competições, formação, conteúdo, tecnologia e agência reunidos para criar projetos relevantes para marcas e pessoas.</p>
        <div className={styles.positioningLines}><span>Esporte para gerar conexão.</span><span>Conteúdo para construir relevância.</span><span>Tecnologia para transformar tudo em resultado.</span></div>
        <a href="#contato">Construa uma parceria <ArrowRight aria-hidden="true" /></a>
      </section>

      <section className={styles.contact} id="contato">
        <div className={styles.contactIntro}>
          <span className={styles.eyebrow}>Próximo passo</span>
          <h2>Vamos construir uma solução para a sua marca</h2>
          <p>Conte sobre sua empresa e seus objetivos. A equipe 11Run e Elevenmind desenvolverá uma proposta personalizada.</p>
          <div>
            <span><HeartHandshake aria-hidden="true" />Estratégia sob medida</span>
            <span><BarChart3 aria-hidden="true" />Indicadores desde o início</span>
            <span><Network aria-hidden="true" />Operação integrada</span>
          </div>
        </div>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.formGrid}>
            <label>Nome<input name="name" autoComplete="name" required /></label>
            <label>Empresa<input name="company" autoComplete="organization" required /></label>
            <label>Cargo ou função<input name="role" autoComplete="organization-title" required /></label>
            <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
            <label>WhatsApp<input name="phone" type="tel" autoComplete="tel" required /></label>
            <label>Cidade<input name="city" autoComplete="address-level2" required /></label>
            <label>Estado<input name="state" maxLength={2} placeholder="SP" autoComplete="address-level1" required /></label>
            <label>Site ou perfil<input name="site" type="url" placeholder="https://" /></label>
            <label className={styles.full}>Segmento de atuação<input name="segment" required /></label>
            <label>Objetivo principal<select name="objective" required defaultValue=""><option value="" disabled>Selecione</option>{objectives.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Frente de interesse<select name="interest" required defaultValue=""><option value="" disabled>Selecione</option>{interests.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className={styles.full}>Mensagem<textarea name="message" rows={5} required /></label>
            <label className={styles.honeypot} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>
          <label className={styles.consent}><input name="consent" type="checkbox" required /><span>Li e aceito o tratamento dos dados conforme a <Link href="/politica-de-privacidade" target="_blank">Política de Privacidade</Link>.</span></label>
          {feedback && <p className={feedback.ok ? styles.success : styles.error} role="status">{feedback.text}</p>}
          <button className={styles.submit} type="submit" disabled={submitting}>{submitting ? "Enviando..." : "Quero falar com a 11Run"}<ArrowRight aria-hidden="true" /></button>
        </form>
      </section>
    </main>
  );
}
