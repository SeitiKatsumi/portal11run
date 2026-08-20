import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Handshake,
  Landmark,
  Network,
  Scale,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Madson Delgado — Voluntário e responsável pela frente jurídica",
  description:
    "Conheça Madson Delgado, advogado empresarial, estrategista de negócios e voluntário responsável pela frente jurídica e legal da 11RUN.",
  alternates: { canonical: "/institucional/voluntarios/madson-delgado" },
  openGraph: {
    title: "Madson Delgado | Voluntários 11RUN",
    description: "Direito, governança e conexões para proteger o presente e sustentar o futuro da 11RUN.",
    url: "/institucional/voluntarios/madson-delgado",
    type: "profile",
  },
};

const credentials = [
  { icon: Scale, title: "Advocacia empresarial", text: "Mais de 14 anos de atuação, com foco no ambiente empresarial, prevenção de riscos e soluções juridicamente sustentáveis." },
  { icon: Network, title: "Liderança no BNI", text: "Diretor Executivo das regionais Alagoas, Sergipe e Agreste, conectando pessoas, oportunidades e negócios em ambientes estruturados." },
  { icon: BriefcaseBusiness, title: "Estratégia de negócios", text: "Uma visão que integra técnica jurídica, capacidade relacional e arquitetura de negócios sem reduzir sua atuação a um único rótulo." },
  { icon: ShieldCheck, title: "Governança para a 11RUN", text: "Responsável voluntário pela condução e supervisão da frente jurídica e legal do projeto daqui em diante." },
];

const education = [
  "Graduação em Direito pelo Centro Universitário CESMAC",
  "Pós-graduação em Direito Processual Civil",
  "Pós-graduação em Direito Civil e MBA em Direito Empresarial",
  "Formação em Mediação Empresarial pela CBMAE",
  "Mestrando em Direito Empresarial pela Universidade de Coimbra",
  "Formação anterior em tecnologia, programação e redes",
];

const timeline = [
  ["2011–2012", "Aprovação na OAB ainda durante a graduação e início da atuação advocatícia."],
  ["2012–2021", "Construção de sociedades de advocacia e consolidação da prática empresarial."],
  ["2014–2017", "Docência em Direito Civil, Processo Civil e Direito Empresarial, na graduação e na pós-graduação."],
  ["2021", "Estruturação da Delgado & Sampaio Sociedade de Advogados, dedicada ao ambiente empresarial e ao compliance preventivo."],
  ["2023–2026", "Ingresso no ecossistema BNI e expansão da liderança para Alagoas, Sergipe e Agreste."],
  ["Agora", "Chegada à 11RUN para liderar voluntariamente a frente jurídica e apoiar uma governança segura, responsável e de longo prazo."],
];

export default function MadsonDelgadoPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Madson Delgado",
    jobTitle: "Advogado empresarial e voluntário responsável pela frente jurídica da 11RUN",
    affiliation: [
      { "@type": "Organization", name: "11RUN" },
      { "@type": "Organization", name: "Delgado & Sampaio Sociedade de Advogados" },
      { "@type": "Organization", name: "BNI Alagoas, Sergipe e Agreste" },
    ],
    knowsAbout: ["Direito Empresarial", "Compliance", "Mediação", "Governança", "Estratégia de negócios"],
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Voluntários 11RUN · Jurídico e governança</span>
          <h1>Madson<br /><span>Delgado.</span></h1>
          <p className={styles.role}>Advogado empresarial · Diretor Executivo BNI · Estrategista de negócios</p>
          <h2>Conexões criam oportunidades. Estrutura jurídica faz com que elas avancem com segurança.</h2>
          <p>Madson chega à 11RUN para cuidar, de forma voluntária, da frente jurídica e legal do projeto, fortalecendo políticas, relações, contratos e decisões que protegem atletas, famílias, parceiros e a própria organização.</p>
          <a href="#parceria" className={styles.primaryButton}>Entenda essa parceria <ArrowRight size={18} /></a>
        </div>
        <div className={styles.heroMark} aria-label="Madson Delgado, jurídico e governança 11RUN">
          <div className={styles.monogram}>MD</div>
          <div><ShieldCheck size={24} /><span>Jurídico<br />Governança<br />Confiança</span></div>
        </div>
      </section>

      <nav className={styles.anchorNav} aria-label="Navegação desta página">
        <a href="#atuacao">Atuação</a><a href="#parceria">Parceria</a><a href="#trajetoria">Trajetória</a><a href="#formacao">Formação</a><a href="#projeto">11RUN</a>
      </nav>

      <section className={styles.intro} id="atuacao">
        <div>
          <span className={styles.eyebrow}>Um profissional, três frentes integradas</span>
          <h2>Direito, negócios e relações em uma mesma arquitetura.</h2>
          <p>Sua trajetória combina conhecimento técnico, leitura empresarial e capacidade de conectar pessoas. Na 11RUN, essa experiência se transforma em uma camada permanente de prevenção, organização e responsabilidade.</p>
        </div>
        <div className={styles.cards}>
          {credentials.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={28} /><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className={styles.partnership} id="parceria">
        <div className={styles.partnershipIcon}><Handshake size={58} /></div>
        <div>
          <span className={styles.eyebrow}>Uma parceria construída antes do convite</span>
          <h2>Confiança e admiração que se transformaram em compromisso.</h2>
          <p>Madson Delgado, a Delgado & Sampaio e suas frentes empresariais são parceiros da Elevenmind e de Seiti Katsumi. A relação foi construída com confiança, respeito profissional e admiração recíproca.</p>
          <p>Foi essa proximidade — e a convergência entre propósito, competência e visão de longo prazo — que originou o convite para Madson assumir a frente jurídica e legal da 11RUN como voluntário.</p>
          <div className={styles.partnershipTags}><span>Elevenmind</span><span>Seiti Katsumi</span><span>Madson Delgado</span><span>11RUN</span></div>
        </div>
      </section>

      <section className={styles.trajectory} id="trajetoria">
        <div className={styles.sectionLead}>
          <span className={styles.eyebrow}>Trajetória</span>
          <h2>Da técnica jurídica à construção de ecossistemas.</h2>
          <p>Uma carreira que começou no Direito, ganhou escala nas relações empresariais e passou a integrar governança, mediação, tecnologia e desenvolvimento regional.</p>
        </div>
        <ol>{timeline.map(([year, text]) => <li key={year}><span>{year}</span><p>{text}</p></li>)}</ol>
      </section>

      <section className={styles.education} id="formacao">
        <div>
          <GraduationCap size={30} />
          <span className={styles.eyebrow}>Formação</span>
          <h2>Profundidade técnica para decisões responsáveis.</h2>
        </div>
        <ul>{education.map((item) => <li key={item}><BookOpen size={18} /><span>{item}</span></li>)}</ul>
      </section>

      <section className={styles.impact}>
        <article><Building2 size={28} /><strong>2.500+</strong><span>clientes atendidos pela estrutura jurídica</span></article>
        <article><Landmark size={28} /><strong>2.000+</strong><span>processos conduzidos e resolvidos</span></article>
        <article><UsersRound size={28} /><strong>300</strong><span>membros nas regionais BNI lideradas</span></article>
        <article><Network size={28} /><strong>3</strong><span>regionais sob direção executiva</span></article>
      </section>

      <section className={styles.project} id="projeto">
        <div>
          <span className={styles.eyebrow}>Madson + 11RUN</span>
          <h2>Proteção jurídica para um projeto que cuida de pessoas.</h2>
          <p>Sua atuação ajudará a transformar princípios em documentos, processos e decisões consistentes: proteção da infância, governança, privacidade, relações com atletas e responsáveis, parcerias, voluntariado, patrocínios e conformidade institucional.</p>
          <p>A responsabilidade jurídica não substitui o cuidado humano; ela cria as bases para que esse cuidado seja contínuo, claro e sustentável.</p>
          <div className={styles.actions}><Link href="/institucional/diretrizes-aos-atletas" className={styles.primaryButton}>Conheça as diretrizes <ArrowRight size={18} /></Link><Link href="/onze-futuro">Conheça o Onze Futuro</Link></div>
        </div>
        <div className={styles.projectSeal}><Scale size={46} /><strong>Direito a serviço do propósito.</strong><span>Prevenir · estruturar · proteger</span></div>
      </section>
    </main>
  );
}
