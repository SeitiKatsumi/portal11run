import { ExternalLink, Medal, Route, Trophy, UsersRound } from "lucide-react";
import { AlexLopesApplication } from "@/components/AlexLopesApplication";

const pillars = [
  ["Técnico da ORCAMPI", "Conexão direta com uma estrutura reconhecida na formação de atletas brasileiros."],
  ["Experiência de Seleção Brasileira", "Vivência em ambientes de alto rendimento, preparação e competição."],
  ["Especialista em fundismo", "Leitura prática para provas de meio-fundo, fundo, estrada e cross country."],
  ["Direção individual", "Planejamento construído a partir do histórico, rotina, prova-alvo e margem de evolução."],
];

export default function AlexSandroLopesPage() {
  return <main className="page-shell alex-page">
    <section className="alex-hero panel"><div className="alex-hero-copy"><p className="eyebrow">INSTITUCIONAL</p><h1>Alex Sandro Lopes</h1><p className="alex-lead">Direção técnica para quem quer transformar rotina em rendimento.</p><p>Professor Alex Lopes é técnico da ORCAMPI, com trajetória ligada ao alto rendimento e à formação de atletas fundistas no Brasil. O trabalho combina organização, leitura individual, calendário e consistência.</p><div className="alex-hero-actions"><AlexLopesApplication /><a className="button button-secondary" target="_blank" rel="noreferrer" href="https://www.instagram.com/treinador.corrida.alex.lopes/">Conhecer no Instagram <ExternalLink size={16} /></a></div></div><div className="alex-hero-quote"><p>“Performance não nasce do improviso. Nasce de direção.”</p><span>Professor Alex Lopes</span></div></section>
    <section className="content-section"><div className="section-heading"><div><p className="eyebrow">COMANDO TÉCNICO</p><h2>Alto rendimento com método e presença.</h2></div><p>Mais do que treinar, a proposta é direcionar atletas para competir melhor, com decisões claras e preparação consistente.</p></div><div className="alex-pillars">{pillars.map(([title, text], index) => { const Icon = [Medal, Trophy, Route, UsersRound][index]; return <article className="panel alex-pillar" key={title}><Icon size={22} /><h3>{title}</h3><p>{text}</p></article>; })}</div></section>
    <section className="alex-process panel"><div><p className="eyebrow">AVALIAÇÃO INICIAL</p><h2>O treino começa pela escuta.</h2></div><div><p>Antes de receber uma orientação, cada atleta apresenta sua rotina, histórico, objetivos, provas, disponibilidade e condições de saúde. Assim, o planejamento parte da realidade e respeita a evolução de cada pessoa.</p><AlexLopesApplication label="Preencher avaliação" /></div></section>
  </main>;
}
