import type { Metadata } from "next";
import { CalendarDays, Clock3, Flag, MapPin, Medal, Route, Trees, Users } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import { circuitCategories, crossCountryTerm } from "@/lib/circuit-categories";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Circuito de Cross Country IVCL 11Run · Primeira edição",
  description: "15 de novembro de 2026, no IVCL em Campinas. Cross country para atletas Sub 10 a Sub 18, com provas de 800 a 3.000 m. Programação e inscrições.",
  alternates: { canonical: "/circuito-cross-country-ivcl-11run" },
  openGraph: { images: ["/assets/circuito-futuro-11-hero.webp"] }
};

const project = "circuito-cross-country-ivcl-11run";
const sessions = [
  { title: "Manhã", range: "08h às 11h20", events: [
    ["08:00", "3.000 m", "Feminino", "Sub 17 e Sub 18"], ["08:30", "3.000 m", "Masculino", "Sub 17 e Sub 18"],
    ["09:00", "2.000 m", "Feminino", "Sub 15 e Sub 16"], ["09:20", "2.000 m", "Masculino", "Sub 15 e Sub 16"],
    ["09:40", "1.000 m", "Feminino", "Sub 12 e Sub 13"], ["10:00", "1.000 m", "Masculino", "Sub 12 e Sub 13"],
    ["10:20", "800 m", "Feminino", "Sub 10 e Sub 11"], ["10:40", "800 m", "Masculino", "Sub 10 e Sub 11"],
    ["11:00", "Premiações", "", ""], ["11:20", "Foto geral e encerramento", "", ""]
  ] },
  { title: "Tarde", range: "17h às 20h20", events: [
    ["17:00", "800 m", "Feminino", "Sub 10 e Sub 11"], ["17:20", "800 m", "Masculino", "Sub 10 e Sub 11"],
    ["17:40", "1.000 m", "Feminino", "Sub 12 e Sub 13"], ["18:00", "1.000 m", "Masculino", "Sub 12 e Sub 13"],
    ["18:20", "2.000 m", "Feminino", "Sub 15 e Sub 16"], ["18:40", "2.000 m", "Masculino", "Sub 15 e Sub 16"],
    ["19:00", "3.000 m", "Feminino", "Sub 17 e Sub 18"], ["19:30", "3.000 m", "Masculino", "Sub 17 e Sub 18"],
    ["20:00", "Premiações", "", ""], ["20:20", "Foto geral e encerramento", "", ""]
  ] }
];

export default function CrossCountryPage() {
  return <div className={styles.page}>
    <HeroSection eyebrow="Primeira edição · 15 de novembro de 2026" title="Circuito de Cross Country IVCL 11Run"
      subtitle="Uma nova largada. Um novo terreno. A corrida de base encontra a natureza em um percurso preparado especialmente para o cross country no IVCL, em Campinas."
      primaryCtaSlot={<ProjectFormModal project={project} />} secondaryCta={{ label: "Ver programação", href: "#programacao" }}
      imageSrc="/assets/circuito-futuro-11-hero.webp" imageAlt="Atleta 11RUN — imagem do Circuito Futuro 11"
      metrics={[{ value: "15 NOV", label: "Primeira edição · 2026" }, { value: "Campinas", label: "IVCL · percurso preparado" }, { value: "9 a 17", label: "Idade completada em 2026" }, { value: "800–3.000 m", label: "Distâncias por categoria" }]} />

    <section className={`section ${styles.editions}`} aria-label="Edições do circuito">
      {["Primeira edição", "Segunda edição", "Terceira edição"].map((title, index) => <article key={title} className={index === 0 ? styles.current : ""}>
        <span className="eyebrow">0{index + 1} · {index === 0 ? "Prepare-se para a estreia" : "Próximas largadas"}</span>
        <h2>{title}</h2><p><CalendarDays size={18} aria-hidden="true" />{index === 0 ? "15 de novembro de 2026" : "Data a confirmar"}</p>
        <small>{index === 0 ? "IVCL · Campinas, SP" : index === 2 ? "Final · pontuação dobrada" : "Acompanhe as próximas informações"}</small>
      </article>)}
    </section>

    <section className={`section ${styles.panel}`} id="categorias">
      <div className={styles.heading}><span className="eyebrow">Uma distância para cada fase</span><h2>Nove categorias. A mesma vontade de correr.</h2><p>A categoria considera a idade que o atleta completa em 2026. Todas as provas têm classificação feminina e masculina.</p></div>
      <div className={styles.categories}>
        {circuitCategories.map((item) => <article key={item.category}><span>{item.category}</span><strong>{item.distance}</strong><p>{item.age} anos em 2026</p><small>Nascidos em {2026 - item.age}</small></article>)}
      </div>
      <p className={styles.note}><Users size={18} aria-hidden="true" />18 disputas por categoria e gênero. A organização poderá agrupar largadas, mantendo as classificações de cada categoria.</p>
    </section>

    <section className={`section ${styles.panel}`} id="programacao">
      <div className={styles.heading}><span className="eyebrow">15 de novembro · programação prevista</span><h2>Do aquecimento à foto final.</h2><p>Confira os dois períodos previstos na programação. A organização confirmará as baterias e as orientações de participação antes do evento.</p></div>
      <div className={styles.schedule}>
        {sessions.map((session) => <article key={session.title}><header><h3>{session.title}</h3><span><Clock3 size={16} aria-hidden="true" />{session.range}</span></header>
          <ol>{session.events.map(([time, distance, gender, categories]) => <li key={time}><time>{time}</time><div><strong>{distance}{gender ? ` · ${gender}` : ""}</strong>{categories ? <small>{categories}</small> : null}</div></li>)}</ol>
        </article>)}
      </div>
      <div className={styles.pending}><Clock3 size={20} aria-hidden="true" /><div><strong>Sub 14 · 1.500 m · Feminino e masculino</strong><p>Horário a confirmar. A categoria está incluída nas inscrições; o horário da largada será divulgado pela organização.</p></div></div>
    </section>

    <section className={`section ${styles.panel}`}>
      <div className={styles.heading}><span className="eyebrow">Cada edição conta</span><h2>Premiação e classificação.</h2></div>
      <div className={styles.rules}>
        <article><Medal aria-hidden="true" /><h3>Cinco no pódio</h3><p>Medalhas para os cinco primeiros de cada categoria, no feminino e no masculino: 90 medalhas previstas por edição.</p></article>
        <article><Flag aria-hidden="true" /><h3>Do 1º ao 10º</h3><p>10 pontos para o primeiro, 9 para o segundo e assim por diante, até 1 ponto para o décimo colocado.</p></article>
        <article><Route aria-hidden="true" /><h3>A soma da jornada</h3><p>A classificação geral soma os pontos das edições. A terceira edição, a final, vale o dobro.</p></article>
      </div>
      <details className={styles.regulations}><summary>Participação e regulamento</summary><ol>{crossCountryTerm.clauses.map((clause) => <li key={clause}>{clause}</li>)}</ol><p>A operação prevista reúne sete profissionais: coordenação, largada, cronometragem, filmagem, premiação e secretaria, além de duas pessoas na apuração dos resultados.</p></details>
    </section>

    <section className={`section ${styles.registration}`} id="inscricao">
      <div><span className="eyebrow">O próximo passo é seu</span><h2>Garanta o primeiro passo para a largada.</h2><p>Envie a inscrição do atleta com a autorização do responsável. A equipe fará a conferência e entrará em contato para confirmar a participação.</p><small>Informações sobre valores e acesso ao local serão confirmadas pela organização.</small></div>
      <ProjectFormModal project={project} />
    </section>

    <section className={`section ${styles.about}`} id="o-que-e-cross-country">
      <div><span className="eyebrow">Conheça a modalidade</span><h2>O que é cross country?</h2><p>É a corrida em terreno natural, em um percurso demarcado ao ar livre. Grama, terra, curvas e variações do terreno fazem parte da experiência: o atleta aprende a ajustar o ritmo, escolher a trajetória e se adaptar ao caminho.</p><p>No IVCL, em Campinas, o percurso será montado especialmente para esta modalidade, com distâncias adequadas às categorias do circuito. Uma oportunidade de viver a corrida perto da natureza e desenvolver resistência, coordenação e confiança.</p></div>
      <div className={styles.aboutFacts}><Trees size={40} aria-hidden="true" /><h3>Um cenário novo para evoluir.</h3><p><MapPin size={18} aria-hidden="true" />IVCL · Campinas, São Paulo</p><p><Route size={18} aria-hidden="true" />Percurso preparado para o cross country</p><p><Users size={18} aria-hidden="true" />Da base, com orientação e descoberta</p></div>
    </section>
  </div>;
}
