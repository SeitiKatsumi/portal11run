import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  HeartPulse,
  Medal,
  MessageCircleMore,
  ShieldCheck,
  Shirt,
  Sparkles,
  Trophy,
  Users
} from "lucide-react";
import styles from "./page.module.css";
import { onzeFuturoPolicySections, onzeFuturoTerm } from "@/lib/onze-futuro-policy";

export const metadata: Metadata = {
  title: "Diretrizes aos Atletas | 11Run",
  description:
    "Conheça as orientações de participação, conduta, segurança, uso dos uniformes e representação oficial dos atletas da 11Run Master e 11Run Futuro.",
  alternates: { canonical: "/institucional/diretrizes-aos-atletas" },
  openGraph: {
    title: "Diretrizes aos Atletas | 11Run",
    description: "Responsabilidade, segurança, respeito e orgulho ao representar a 11Run.",
    type: "article"
  }
};

const topics = [
  {
    id: "representacao",
    icon: BadgeCheck,
    title: "Representação oficial",
    intro: "O atleta representa a 11Run ao usar o uniforme, competir pela equipe ou participar de ações oficiais.",
    items: [
      "Agir com respeito, ética, responsabilidade e espírito esportivo.",
      "Respeitar colegas, adversários, árbitros, voluntários e organizadores.",
      "Cumprir regras esportivas e preservar a imagem da equipe.",
      "Não falar oficialmente em nome da 11Run sem autorização."
    ]
  },
  {
    id: "uniformes",
    icon: Shirt,
    title: "Uniformes oficiais",
    intro: "O uniforme de competição identifica o atleta oficial e não pode ser transferido ou alterado.",
    items: [
      "É proibido vender, emprestar, doar, reproduzir, personalizar ou ceder o uniforme a terceiros.",
      "Materiais destinados às famílias têm identidade própria e não identificam atletas oficiais.",
      "No aquecimento e após a prova, utilize o agasalho completo conforme orientação da equipe.",
      "Durante a prova de alto rendimento, utilize o conjunto preto oficial com a marca 11Run branca.",
      "Em pódios e premiações, o agasalho oficial completo é obrigatório, salvo regra do evento ou orientação técnica."
    ],
    emphasis: "Uniforme oficial em competições e pódios: identidade preservada antes, durante e depois da prova."
  },
  {
    id: "conduta",
    icon: Users,
    title: "Conduta e convivência",
    intro: "Resultados nunca estão acima da saúde, do respeito e da formação humana.",
    items: [
      "Cumprir horários, apoiar colegas e cuidar dos espaços e materiais.",
      "Não são aceitos agressão, intimidação, discriminação, bullying, fraude ou exposição indevida.",
      "Respeitar diferenças de idade, experiência, ritmo e nível técnico.",
      "Conflitos devem ser levados à equipe, sem confrontos públicos ou em redes sociais."
    ]
  },
  {
    id: "saude",
    icon: HeartPulse,
    title: "Saúde e segurança",
    intro: "A saúde do atleta deve permanecer acima do desempenho esportivo.",
    items: [
      "Manter atestados e documentos solicitados atualizados.",
      "Comunicar lesões, sintomas, limitações e condições médicas relevantes.",
      "Respeitar orientações médicas, regras antidopagem e decisões preventivas da equipe.",
      "Em viagens, seguir o planejamento, portar documentos e não se afastar do grupo sem autorização."
    ]
  },
  {
    id: "comunicacao",
    icon: MessageCircleMore,
    title: "Comunicação, redes e marca",
    intro: "Compartilhe conquistas com orgulho, protegendo pessoas, informações e a identidade da 11Run.",
    items: [
      "Não divulgar documentos, estratégias, dados de crianças ou situações médicas sem autorização.",
      "Não criar produtos, rifas, eventos, perfis oficiais ou campanhas usando a marca.",
      "Patrocínios pessoais devem ser informados para evitar conflitos com parceiros oficiais.",
      "Grupos oficiais devem ser usados para assuntos do projeto, com respeito e proteção de dados."
    ]
  }
];

export default function AthleteGuidelinesPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Trilha de navegação">
        <Link href="/">Início</Link><span>/</span>
        <Link href="/institucional/missao-visao-valores">Institucional</Link><span>/</span>
        <strong>Diretrizes aos Atletas</strong>
      </nav>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Diretrizes oficiais · versão {onzeFuturoTerm.version}</span>
          <h1>Diretrizes aos Atletas 11Run</h1>
          <p>Orientações para representarmos nossa equipe com responsabilidade, segurança, respeito e orgulho.</p>
        </div>
        <div className={styles.heroSeal} aria-label="Compromisso 11Run">
          <ShieldCheck aria-hidden="true" />
          <strong>Um time.<br />Um compromisso.</strong>
          <span>Master · Futuro · Núcleos oficiais</span>
        </div>
      </section>

      <section className={styles.nuclei} aria-labelledby="onze-futuro-protecao">
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Política específica · Onze Futuro</span>
          <h2 id="onze-futuro-protecao">Complementar o ecossistema, proteger a infância.</h2>
          <p>Estas regras integram o termo de aceite do responsável e se aplicam à participação no Onze Futuro.</p>
        </div>
        <div className={styles.topicGrid}>
          {onzeFuturoPolicySections.map((section, index) => <details className={styles.topic} id={section.id} key={section.id} open={index === 0}>
            <summary><span className={styles.topicIcon}><ShieldCheck aria-hidden="true"/></span><span><small>Onze Futuro {String(index + 1).padStart(2,"0")}</small><strong>{section.title}</strong></span><span className={styles.expand}>Ver detalhes</span></summary>
            <div className={styles.topicBody}><p>{section.intro}</p><ul>{section.items.map((item)=><li key={item}>{item}</li>)}</ul></div>
          </details>)}
        </div>
        <p><small>{onzeFuturoTerm.legalNotice}</small></p>
      </section>

      <section className={styles.intro}>
        <Sparkles aria-hidden="true" />
        <div>
          <h2>Representar é cuidar do que construímos juntos.</h2>
          <p>Fazer parte da 11Run significa representar um projeto construído com cuidado, responsabilidade e propósito. Estas diretrizes orientam competições, eventos, treinamentos, viagens, premiações e ações institucionais, respeitando cada categoria e o cuidado especial com crianças e adolescentes.</p>
        </div>
      </section>

      <nav className={styles.jumpNav} aria-label="Navegação nesta página">
        {topics.map(({ id, title }) => <a key={id} href={`#${id}`}>{title}</a>)}
        <a href="#nucleos">Master e Futuro</a>
        <a href="#compromisso">Compromisso</a>
      </nav>

      <section className={styles.topicGrid} aria-label="Diretrizes principais">
        {topics.map(({ id, icon: Icon, title, intro, items, emphasis }, index) => (
          <details className={styles.topic} id={id} key={id} open={index < 2}>
            <summary>
              <span className={styles.topicIcon}><Icon aria-hidden="true" /></span>
              <span><small>Diretriz {String(index + 1).padStart(2, "0")}</small><strong>{title}</strong></span>
              <span className={styles.expand}>Ver detalhes</span>
            </summary>
            <div className={styles.topicBody}>
              <p>{intro}</p>
              {emphasis && <div className={styles.emphasis}>{emphasis}</div>}
              <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </details>
        ))}
      </section>

      <section className={styles.uniformCare}>
        <div>
          <span className={styles.eyebrow}>Cuidado com o patrimônio</span>
          <h2>Conservação e uso responsável</h2>
          <p>Mantenha as peças limpas, completas e conservadas. Não corte, tinja, modifique logos ou passe ferro diretamente sobre estampas. Danos, perdas ou necessidade de substituição devem ser comunicados rapidamente à equipe.</p>
        </div>
        <div>
          <strong>Marcas parceiras</strong>
          <p>Logos de patrocinadores não podem ser removidos, cobertos ou alterados. Ações comerciais e patrocínios individuais precisam de análise e autorização prévia.</p>
        </div>
      </section>

      <section className={styles.nuclei} id="nucleos">
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Responsabilidades por núcleo</span>
          <h2>O mesmo propósito, cuidados adequados a cada fase.</h2>
        </div>
        <div className={styles.nucleiGrid}>
          <article>
            <Medal aria-hidden="true" />
            <span>11Run Futuro</span>
            <h3>Proteção, educação e desenvolvimento saudável.</h3>
            <ul>
              <li>Responsáveis acompanham comunicações, documentos, saúde e autorizações.</li>
              <li>Sem cobranças excessivas ou pressão baseada em desempenho.</li>
              <li>Descanso, estudo, lazer e convivência familiar devem ser preservados.</li>
              <li>Orientações e medidas têm caráter educativo, protetivo e proporcional.</li>
            </ul>
          </article>
          <article>
            <Trophy aria-hidden="true" />
            <span>11Run Master</span>
            <h3>Autonomia, colaboração e responsabilidade direta.</h3>
            <ul>
              <li>Manter documentação, inscrições e informações médicas atualizadas.</li>
              <li>Cuidar de uniformes, viagens, horários e comunicação com a equipe.</li>
              <li>Respeitar regulamentos e atualizar resultados esportivos.</li>
              <li>Participar ativamente da organização das atividades coletivas.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={styles.consequences}>
        <div>
          <span className={styles.eyebrow}>Orientar antes de punir</span>
          <h2>Medidas proporcionais, educativas e sem exposição.</h2>
        </div>
        <p>Descumprimentos serão analisados considerando gravidade, intenção, reincidência, idade, riscos e impacto. As medidas podem evoluir de orientação e conversa até restrição temporária, suspensão específica ou desligamento em situações graves ou recorrentes. Nunca serão aplicadas de forma humilhante ou discriminatória.</p>
      </section>

      <section className={styles.commitment} id="compromisso">
        <ShieldCheck aria-hidden="true" />
        <span className={styles.eyebrow}>Nosso compromisso coletivo</span>
        <h2>Representar a 11Run é carregar uma história, um propósito e o sonho de muitas pessoas.</h2>
        <p>Cada uniforme, competição e atitude ajuda a construir a imagem do projeto. Mais do que resultados, queremos uma equipe reconhecida pelo respeito, responsabilidade, cuidado com as pessoas e amor ao esporte.</p>
        <div className={styles.actions}>
          <Link href="/meu-painel">Acessar área do atleta</Link>
          <span className={styles.printHint}>Use Ctrl + P para imprimir ou salvar em PDF</span>
        </div>
      </section>
    </main>
  );
}
