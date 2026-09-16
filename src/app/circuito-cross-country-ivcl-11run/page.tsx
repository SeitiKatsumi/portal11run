import Image from "next/image";
import type { Metadata } from "next";
import { Camera, Clock3, Flag, Radio, Timer, MapPin, Medal, Route, Trees, Users } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import { circuitCategories, crossCountryTerm } from "@/lib/circuit-categories";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "CIRCUITO DE CROSS COUNTRY IVCL 11RUN · Primeira edição",
  description: "15 de novembro de 2026, no IVCL em Campinas. CROSS COUNTRY para atletas Sub 10 a Sub 18, com provas de 800 a 3.000 m. Programação e inscrições.",
  alternates: { canonical: "/circuito-cross-country-ivcl-11run" },
  openGraph: { images: ["/assets/cross-country-trofeu.webp"] }
};

const project = "circuito-cross-country-ivcl-11run";
const sessions = [
  { title: "Manhã", range: "08h às 11h20", events: [
    ["08:00", "2.000 m / 3.000 m", "Feminino", "Sub 16 (2.000 m) + Sub 17 e Sub 18 (3.000 m)"], ["08:30", "2.000 m / 3.000 m", "Masculino", "Sub 16 (2.000 m) + Sub 17 e Sub 18 (3.000 m)"],
    ["09:00", "1.500 m / 2.000 m", "Feminino", "Sub 14 (1.500 m) + Sub 15 (2.000 m)"], ["09:20", "1.500 m / 2.000 m", "Masculino", "Sub 14 (1.500 m) + Sub 15 (2.000 m)"],
    ["09:40", "1.000 m", "Feminino", "Sub 12 e Sub 13"], ["10:00", "1.000 m", "Masculino", "Sub 12 e Sub 13"],
    ["10:20", "800 m", "Feminino", "Sub 10 e Sub 11"], ["10:40", "800 m", "Masculino", "Sub 10 e Sub 11"],
    ["11:00", "Premiações", "", ""], ["11:20", "Foto geral e encerramento", "", ""]
  ] },
  { title: "Tarde", range: "17h às 20h20", events: [
    ["17:00", "800 m", "Feminino", "Sub 10 e Sub 11"], ["17:20", "800 m", "Masculino", "Sub 10 e Sub 11"],
    ["17:40", "1.000 m", "Feminino", "Sub 12 e Sub 13"], ["18:00", "1.000 m", "Masculino", "Sub 12 e Sub 13"],
    ["18:20", "1.500 m / 2.000 m", "Feminino", "Sub 14 (1.500 m) + Sub 15 (2.000 m)"], ["18:40", "1.500 m / 2.000 m", "Masculino", "Sub 14 (1.500 m) + Sub 15 (2.000 m)"],
    ["19:00", "2.000 m / 3.000 m", "Feminino", "Sub 16 (2.000 m) + Sub 17 e Sub 18 (3.000 m)"], ["19:30", "2.000 m / 3.000 m", "Masculino", "Sub 16 (2.000 m) + Sub 17 e Sub 18 (3.000 m)"],
    ["20:00", "Premiações", "", ""], ["20:20", "Foto geral e encerramento", "", ""]
  ] }
];

export default function CrossCountryPage() {
  return <div className={styles.page}>
    <HeroSection eyebrow="Primeira edição · 15 de novembro de 2026" title={<Image src="/assets/cross-country-ivcl-logo.webp" alt="CIRCUITO DE CROSS COUNTRY IVCL 11RUN" width={1200} height={625} className={styles.logo} priority unoptimized />}
      subtitle="Uma nova largada. Um novo terreno. A corrida de base encontra a natureza em um percurso preparado especialmente para o CROSS COUNTRY no IVCL, em Campinas. Inscrições gratuitas até 12 de novembro."
      primaryCtaSlot={<ProjectFormModal project={project} />} secondaryCta={{ label: "Ver programação", href: "#programacao" }}
      imageSrc="/assets/cross-country-trofeu.webp" imageAlt="Troféu do CIRCUITO DE CROSS COUNTRY IVCL 11RUN com grama e terra em seu interior"
      metrics={[{ value: "15 NOV", label: "Primeira edição · 2026" }, { value: "Campinas", label: "IVCL · Circuito de grama e terra com chegada na pista de atletismo" }, { value: "9 a 17", label: "Idade completada em 2026" }, { value: "800–3.000 m", label: "Distâncias por categoria" }]} />

    <section className={`section ${styles.panel}`} id="diferenciais">
      <div className={styles.heading}><span className="eyebrow">Diferenciais</span><h2>Cada conquista, de perto.</h2><p>Uma experiência para quem corre, para a família e para quem acompanha de longe.</p></div>
      <div className={styles.rules}>
        <article><Radio aria-hidden="true" /><h3>Transmissão ao vivo pelo YouTube</h3><p>Acompanhe as provas e torça pelos atletas durante a transmissão do evento.</p></article>
        <article><Camera aria-hidden="true" /><h3>Fotos gratuitas</h3><p>Registros feitos por fotógrafo profissional, disponibilizados gratuitamente após o evento.</p></article>
        <article><Timer aria-hidden="true" /><h3>Ranking em tempo real</h3><p>Pontuação para o ranking atualizada em tempo real no site, para acompanhar a classificação dos atletas.</p></article>
      </div>
    </section>

    <section className={`section ${styles.panel}`} id="categorias">
      <div className={styles.heading}><span className="eyebrow">Uma distância para cada fase</span><h2>Nove categorias. A mesma vontade de correr.</h2><p>A categoria considera a idade que o atleta completa em 2026. Todas as provas têm classificação feminina e masculina.</p></div>
      <div className={styles.categories}>
        {circuitCategories.map((item) => <article key={item.category}><span>{item.category}</span><strong>{item.distance}</strong><p>{item.age} anos em 2026</p><small>Nascidos em {2026 - item.age}</small></article>)}
      </div>
      <p className={styles.note}><Users size={18} aria-hidden="true" />18 classificações por categoria e gênero. Largadas conjuntas: Sub 10 + Sub 11; Sub 12 + Sub 13; Sub 14 + Sub 15; Sub 16 + Sub 17 + Sub 18. Feminino e masculino largam separadamente.</p>
    </section>

    <section className={`section ${styles.panel}`} id="programacao">
      <div className={styles.heading}><span className="eyebrow">15 de novembro · programação prevista</span><h2>Do aquecimento à foto final.</h2><p>Confira os dois períodos previstos, organizados em quatro grupos de categorias, com largadas femininas e masculinas separadas. Cada atleta percorre a distância da sua categoria, mesmo largando junto com outra faixa etária.</p></div>
      <div className={styles.schedule}>
        {sessions.map((session) => <article key={session.title}><header><h3>{session.title}</h3><span><Clock3 size={16} aria-hidden="true" />{session.range}</span></header>
          <ol>{session.events.map(([time, distance, gender, categories]) => <li key={time}><time>{time}</time><div><strong>{distance}{gender ? ` · ${gender}` : ""}</strong>{categories ? <small>{categories}</small> : null}</div></li>)}</ol>
        </article>)}
      </div>
      <p className={styles.note}><Flag size={18} aria-hidden="true" />Largada conjunta, resultado individual: classificação, pontuação e pódio continuam separados por categoria e gênero.</p>
    </section>

    <section className={`section ${styles.panel}`}>
      <div className={styles.heading}><span className="eyebrow">Cada edição conta</span><h2>Premiação e classificação.</h2></div>
      <div className={styles.rules}>
        <article><Medal aria-hidden="true" /><h3>Três no pódio</h3><p>Troféus e brindes 11Run para os três primeiros de cada categoria, no feminino e no masculino.</p></article>
        <article><Flag aria-hidden="true" /><h3>Do 1º ao 10º</h3><p>10 pontos para o primeiro, 9 para o segundo e assim por diante, até 1 ponto para o décimo colocado.</p></article>
        <article><Route aria-hidden="true" /><h3>A soma da jornada</h3><p>A classificação geral soma os pontos das edições. A terceira edição, a final, vale o dobro.</p></article>
      </div>
      <details className={styles.regulations}><summary>Participação e regulamento</summary><ol>{crossCountryTerm.clauses.map((clause) => <li key={clause}>{clause}</li>)}</ol><p>A operação prevista reúne sete profissionais: coordenação, largada, cronometragem, filmagem, premiação e secretaria, além de duas pessoas na apuração dos resultados.</p></details>
    </section>

    <section className={`section ${styles.registration}`} id="inscricao">
      <div><span className="eyebrow">O próximo passo é seu</span><h2>Inscrições gratuitas até 12 de novembro.</h2><p>Envie a inscrição do atleta com a autorização do responsável. A equipe fará a conferência e entrará em contato para confirmar a participação.</p><small>Encerramento em 12/11/2026, às 23h59, no horário de São Paulo. As orientações de acesso serão enviadas pela organização.</small></div>
      <ProjectFormModal project={project} />
    </section>

    <section className={`section ${styles.about}`} id="o-que-e-cross-country">
      <div><span className="eyebrow">Conheça a modalidade</span><h2>O que é CROSS COUNTRY?</h2><p>É a corrida em terreno natural, em um percurso demarcado ao ar livre. Grama, terra, curvas e variações do terreno fazem parte da experiência: o atleta aprende a ajustar o ritmo, escolher a trajetória e se adaptar ao caminho.</p><p>No IVCL, em Campinas, o percurso será montado especialmente para esta modalidade, com distâncias adequadas às categorias do circuito. Uma oportunidade de viver a corrida perto da natureza e desenvolver resistência, coordenação e confiança.</p>
      <div className={styles.aboutFacts}><Trees size={40} aria-hidden="true" /><h3>Um cenário novo para evoluir.</h3><p><MapPin size={18} aria-hidden="true" />IVCL · Campinas, São Paulo</p><p><Route size={18} aria-hidden="true" />Percurso preparado para o CROSS COUNTRY</p><p><Users size={18} aria-hidden="true" />Da base, com orientação e descoberta</p></div></div>
      <figure className={styles.coursePhoto}><Image src="/assets/cross-country-sinalizacao.webp" alt="Percurso de grama demarcado com faixas e bandeiras do CIRCUITO DE CROSS COUNTRY IVCL 11RUN" width={941} height={1672} sizes="(max-width: 900px) calc(100vw - 28px), 560px" unoptimized /><figcaption>CROSS COUNTRY · o percurso ganha forma entre a grama e a natureza.</figcaption></figure>
    </section>
  </div>;
}
