"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  Award,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Flag,
  GraduationCap,
  Medal,
  Mountain,
  Route,
  Target,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AlexLopesApplication } from "@/components/AlexLopesApplication";
import styles from "./AlexProfileExperience.module.css";

const milestones = [
  { year: "2008", title: "ORCAMPI e IVCL", text: "Início da atuação como treinador de meio-fundo, fundo e marcha atlética." },
  { year: "2010–2015", title: "Núcleo de Formação BM&FBOVESPA", text: "Trabalho na formação de atletas e consolidação da experiência no alto rendimento." },
  { year: "2012", title: "Seleções paulistas", text: "Passa a integrar comissões técnicas estaduais em diferentes categorias." },
  { year: "2015", title: "Primeiras missões mundiais", text: "Treinador do Brasil nos Mundiais de Menores e de Cross Country, além de competições pan e sul-americanas." },
  { year: "2017–2020", title: "Coordenação da Escola de Formação", text: "Liderança técnica no Instituto Vanderlei Cordeiro de Lima." },
  { year: "2018–2019", title: "Comitê técnico da CBAt", text: "Membro do comitê técnico de base nas áreas de meio-fundo e fundo." },
  { year: "2021–2026", title: "Ciclos olímpico e internacional", text: "Atletas convocados para Jogos Olímpicos, mundiais, parapan-americanos e campeonatos continentais." },
  { year: "2022–atual", title: "Coordenador de Performance", text: "Coordenação de performance da ORCAMPI Unimed e direção técnica conectada ao Projeto 11RUN." },
];

const records = [
  "Recorde mundial paralímpico nos 1.500 m",
  "Recorde mundial paralímpico nos 5.000 m",
  "Recorde do Sul-Americano Adulto nos 800 m",
  "Recorde parapan-americano adulto nos 5.000 m",
  "Recorde sul-americano Sub-20 nos 10.000 m",
  "Recordes sul-americanos Sub-18 nos 5.000 m e 2.000 m com obstáculos",
  "Recorde brasileiro Sub-18 nos 3.000 m",
];

const athletes = [
  "Daniel Ferreira do Nascimento",
  "Yeltin Jacques",
  "Thiago do Rosário André",
  "Eduardo Rodrigues de Deus",
  "Vinicius de Carvalho Alves",
  "Eder Uillian",
  "Wellerson Falcão Vivi",
];

const education = [
  { icon: GraduationCap, title: "Bacharel em Esporte", school: "Escola de Educação Física e Esporte da USP" },
  { icon: Trophy, title: "Esporte de Alto Rendimento", school: "Academia Brasileira de Treinadores do COB · 760 horas" },
  { icon: BookOpen, title: "Treinamento Desportivo", school: "Bases fisiológicas e metodológicas · Unifesp · 360 horas" },
  { icon: Award, title: "World Athletics", school: "Níveis II e III em meio-fundo, fundo, velocidade e barreiras" },
];

const gallery = [
  { src: "/assets/alex-lopes/pista-parceria.webp", alt: "Alex com parceiro técnico em uma pista de atletismo" },
  { src: "/assets/alex-lopes/selecao-pista.webp", alt: "Alex com atletas e comissão técnica ao lado da pista" },
  { src: "/assets/alex-lopes/medalha-jovem-atleta.webp", alt: "Alex celebrando a conquista de uma jovem atleta" },
  { src: "/assets/alex-lopes/medpucamp.webp", alt: "Alex com profissionais do atletismo em competição" },
  { src: "/assets/alex-lopes/pista-equipe.webp", alt: "Alex e equipe em uma pista de atletismo" },
  { src: "/assets/alex-lopes/pista-familia.webp", alt: "Alex em encontro esportivo na pista" },
];

const curriculum = [
  {
    title: "Formação acadêmica",
    content: "Bacharel em Esporte pela USP; pós-graduação em Esporte de Alto Rendimento pela Academia Brasileira de Treinadores do COB; pós-graduação em Bases Fisiológicas e Metodológicas do Treinamento Desportivo pela Unifesp; formação complementar em administração esportiva, gestão para treinadores, informática e gestão empresarial.",
  },
  {
    title: "Experiência profissional",
    content: "Coordenador de performance e treinador da ORCAMPI Unimed; treinador e ex-coordenador da Escola de Formação do IVCL; treinador do Núcleo de Formação BM&FBOVESPA; membro de comitês técnicos da CBAt e FPA; experiências anteriores na USP, Toyota, arbitragem e assessoria esportiva.",
  },
  {
    title: "Seleções e competições",
    content: "Treinador da Seleção Brasileira em Jogos Sul-Americanos da Juventude, Jogos Pan-Americanos Júnior, Mundiais Sub-20 e de Cross Country, além de campeonatos pan-americanos e sul-americanos. Também foi treinador-chefe e integrante de diversas seleções paulistas desde 2012.",
  },
  {
    title: "Certificações internacionais",
    content: "Formações World Athletics em meio-fundo e fundo, velocidade e barreiras; seminário sul-americano de alto rendimento em cross country; cursos CBAt e FPA; participação no ICCE Global Coaches House e em congressos de ciências do esporte, medicina esportiva e psicologia do esporte.",
  },
  {
    title: "Atletas e legado",
    content: "Orientação de atletas olímpicos, paralímpicos e de seleções brasileiras em categorias de base e adulto. Entre os nomes já orientados estão Daniel Ferreira do Nascimento, Yeltin Jacques, Thiago André, Eduardo de Deus, Vinicius Alves, Eder Uillian e Wellerson Falcão Vivi.",
  },
];

export function AlexProfileExperience() {
  const [progress, setProgress] = useState(0);
  const [activeImage, setActiveImage] = useState<(typeof gallery)[number] | null>(null);

  useEffect(() => {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  useEffect(() => {
    if (!activeImage) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setActiveImage(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [activeImage]);

  return (
    <main className={styles.page}>
      <div className={styles.progress} aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

      <section className={styles.hero} aria-labelledby="alex-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Perfil · Treinador conselheiro</span>
          <h1 id="alex-title"><span>Alex Sandro</span><br />Lopes</h1>
          <p className={styles.role}>Treinador Conselheiro do Projeto 11RUN</p>
          <h2>Método, presença e resultados que atravessam gerações.</h2>
          <p className={styles.intro}>Desde 2008, transforma ciência, experiência e escuta em caminhos consistentes para atletas de formação e alto rendimento.</p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="#trajetoria">Conheça a trajetória <ArrowRight size={17} /></a>
            <a className={styles.textButton} href="#curriculo">Ver currículo completo <ChevronRight size={17} /></a>
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image src="/assets/alex-lopes/pista-parceria.webp" alt="Alex Sandro Lopes em uma pista de atletismo" fill priority sizes="(max-width: 900px) 100vw, 50vw" />
          <span>Presença na pista.<br />Visão de longo prazo.</span>
        </div>
      </section>

      <nav className={styles.anchorNav} aria-label="Navegação desta página">
        <a href="#trajetoria">Trajetória</a><a href="#resultados">Resultados</a><a href="#atletas">Atletas</a><a href="#formacao">Formação</a><a href="#galeria">Galeria</a><a href="#curriculo">Currículo</a>
      </nav>

      <section className={styles.statement} id="trajetoria">
        <div className={styles.sectionLead}>
          <span className={styles.eyebrow}>Trajetória</span>
          <h2>Do conhecimento à prática que transforma.</h2>
          <p>Uma carreira construída ao lado de atletas, equipes e instituições que acreditam no potencial humano.</p>
          <ul className={styles.factList}>
            <li><Route size={19} /> ORCAMPI e IVCL desde 2008</li>
            <li><Trophy size={19} /> Coordenador de Performance desde 2022</li>
            <li><Flag size={19} /> Treinador de Seleções Brasileiras</li>
          </ul>
        </div>
        <ol className={styles.timeline}>
          {milestones.map((item) => <li key={`${item.year}-${item.title}`}><span>{item.year}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}
        </ol>
      </section>

      <section className={styles.results} id="resultados">
        <div className={styles.resultsIntro}>
          <span className={styles.eyebrow}>Resultados que inspiram</span>
          <h2>Performance que marca a história.</h2>
          <p>Resultados de atletas orientados por Alex em cenários nacionais, continentais e mundiais.</p>
        </div>
        <div className={styles.resultHighlights}>
          <article><Medal size={29} /><span>2</span><h3>Recordes mundiais paralímpicos</h3><p>Marcas nos 1.500 m e 5.000 m.</p></article>
          <article><Flag size={29} /><span>20+</span><h3>Missões como treinador do Brasil</h3><p>Competições de 2012 a 2026.</p></article>
          <article><Award size={29} /><span>9+</span><h3>Recordes de atletas orientados</h3><p>Marcas mundiais, continentais e brasileiras.</p></article>
        </div>
        <div className={styles.recordList}>
          {records.map((record, index) => <div key={record}><span>{String(index + 1).padStart(2, "0")}</span><p>{record}</p></div>)}
        </div>
      </section>

      <section className={styles.photoStory}>
        <Image src="/assets/alex-lopes/selecao-pista.webp" alt="Alex com atletas e comissão técnica junto à pista" fill sizes="100vw" />
        <div><span className={styles.eyebrow}>Impacto que fica</span><h2><span>Formar atletas.</span><br /><span>Transformar vidas.</span></h2><p>Desenvolvimento esportivo com direção clara, preparação consistente e respeito a cada história.</p></div>
      </section>

      <section className={styles.athletes} id="atletas">
        <div><span className={styles.eyebrow}>Atletas orientados</span><h2>Nomes que representam uma jornada coletiva.</h2><p>Atletas que chegaram a Jogos Olímpicos, Paralímpicos, mundiais e seleções brasileiras em diferentes categorias.</p></div>
        <div className={styles.athleteList}>{athletes.map((athlete) => <span key={athlete}>{athlete}<ArrowRight size={17} /></span>)}</div>
      </section>

      <section className={styles.education} id="formacao">
        <div className={styles.sectionHeader}><span className={styles.eyebrow}>Formação e certificações</span><h2>Conhecimento que sustenta decisões e eleva resultados.</h2></div>
        <div className={styles.educationGrid}>{education.map(({ icon: Icon, title, school }) => <article key={title}><Icon size={31} /><div><h3>{title}</h3><p>{school}</p></div></article>)}</div>
      </section>

      <section className={styles.philosophy}>
        <div><span className={styles.eyebrow}>Filosofia de treinamento</span><blockquote>“Performance não nasce do improviso. Nasce de direção.”</blockquote><p>Planejamento, controle e adaptação caminham ao lado da confiança, do diálogo e da leitura individual.</p></div>
        <Image src="/assets/alex-lopes/medalha-jovem-atleta.webp" alt="Alex celebrando uma conquista com jovem atleta" width={532} height={945} sizes="(max-width: 800px) 100vw, 40vw" />
      </section>

      <section className={styles.gallerySection} id="galeria">
        <div className={styles.sectionHeader}><span className={styles.eyebrow}>Galeria</span><h2>Momentos que constroem histórias.</h2></div>
        <div className={styles.gallery}>{gallery.map((image, index) => <button type="button" key={image.src} className={index === 1 || index === 5 ? styles.wide : ""} onClick={() => setActiveImage(image)} aria-label={`Ampliar: ${image.alt}`}><Image src={image.src} alt={image.alt} fill sizes="(max-width: 720px) 100vw, 33vw" /><span>Ampliar <ExternalLink size={14} /></span></button>)}</div>
      </section>

      <section className={styles.curriculum} id="curriculo">
        <div><span className={styles.eyebrow}>Currículo completo</span><h2>Uma abordagem completa para o alto rendimento.</h2><p>Formação contínua, vivência internacional e mais de uma década de trabalho em equipes de referência.</p></div>
        <div className={styles.accordions}>{curriculum.map((item, index) => <details key={item.title} open={index === 0}><summary><span>{String(index + 1).padStart(2, "0")}. {item.title}</span><ChevronRight size={18} /></summary><p>{item.content}</p></details>)}</div>
      </section>

      <section className={styles.project11Run}>
        <div><span className={styles.eyebrow}>Alex + Projeto 11RUN</span><h2>Direção técnica para construir o próximo capítulo.</h2><p>Como treinador conselheiro, Alex conecta método, formação de treinadores, métricas e planejamento de longo prazo à evolução dos projetos 11 Futuro e 11RUN Master.</p><div className={styles.actions}><Link className={styles.primaryButton} href="/onze-futuro">Conhecer o 11 Futuro <ArrowRight size={17} /></Link><Link className={styles.textButton} href="/11-master">Conhecer o 11 Master <ChevronRight size={17} /></Link></div></div>
        <Image src="/assets/alex-lopes/hero-parceria.webp" alt="Alex em encontro com parceiro do atletismo" width={709} height={945} sizes="(max-width: 800px) 100vw, 38vw" />
      </section>

      <section className={styles.finalCta}>
        <div><Target size={24} /><h2>Vamos construir o próximo capítulo da sua história no atletismo.</h2></div>
        <AlexLopesApplication label="Treine com o Alex" />
      </section>

      {progress > 20 ? <button type="button" className={styles.backToTop} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Voltar ao topo"><ArrowUp size={20} /></button> : null}

      {activeImage ? <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Visualização ampliada da galeria" onClick={() => setActiveImage(null)}><button type="button" onClick={() => setActiveImage(null)} aria-label="Fechar galeria"><X size={25} /></button><Image src={activeImage.src} alt={activeImage.alt} width={1680} height={1100} sizes="95vw" /></div> : null}
    </main>
  );
}
