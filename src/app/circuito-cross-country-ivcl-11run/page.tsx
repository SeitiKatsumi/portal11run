import Image from "next/image";
import type { Metadata } from "next";
import { Camera, Clock3, Flag, Youtube, MapPin, Medal, Route, Trees, Users } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import { CrossCountryFaq } from "@/components/CrossCountryFaq";
import { crossCountryRaces, crossCountryTerm } from "@/lib/circuit-categories";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "CIRCUITO DE CROSS COUNTRY IVCL 11RUN · Primeira edição",
  description: "15 de novembro de 2026, no IVCL em Campinas. CROSS COUNTRY para atletas de até 17 anos, com provas de 1 a 4 km, em período único das 8h às 10h. Programação e inscrições.",
  alternates: { canonical: "/circuito-cross-country-ivcl-11run" },
  openGraph: { images: ["/assets/cross-country-capa.webp"] }
};

const project = "circuito-cross-country-ivcl-11run";
const schedule = [
  ...crossCountryRaces.map((race) => ({ time: race.time, title: race.label, detail: `${race.distance} · Masculino e Feminino` })),
  { time: "09:45", title: "Premiação geral", detail: "" },
  { time: "10:00", title: "Foto geral e encerramento", detail: "" }
];

export default function CrossCountryPage() {
  return <div className={styles.page}>
    <HeroSection eyebrow="Primeira edição · 15 de novembro de 2026" title={<span className={styles.logo} role="img" aria-label="CIRCUITO DE CROSS COUNTRY IVCL 11RUN"><Image src="/assets/cross-country-ivcl-logo.webp" alt="" width={1200} height={625} className={styles.logoBase} priority unoptimized /><Image src="/assets/ivcl-original-color.webp" alt="" width={640} height={389} className={styles.ivclLogo} priority unoptimized /></span>}
      subtitle="Uma nova largada. Um novo terreno. A corrida de base encontra a natureza em um percurso preparado especialmente para o CROSS COUNTRY no IVCL, em Campinas. Inscrições gratuitas até 12 de novembro."
      primaryCtaSlot={<ProjectFormModal project={project} />} secondaryCta={{ label: "Ver programação", href: "#programacao" }}
      imageSrc="/assets/cross-country-capa.webp" imageAlt="Percurso de grama do CIRCUITO DE CROSS COUNTRY IVCL 11RUN, com bandeiras de quilometragem e faixas de sinalização em Campinas"
      metrics={[{ value: "15 NOV", label: "Primeira edição · 2026" }, { value: "Campinas", label: "IVCL · Circuito de grama e terra com chegada na pista de atletismo" }, { value: "Até 17", label: "Idade completada em 2026" }, { value: "1–4 km", label: "Distâncias por categoria" }]} />

    <section className={`section ${styles.panel}`} id="diferenciais">
      <div className={styles.heading}><span className="eyebrow">Diferenciais</span><h2>Uma experiência imersiva e interativa</h2></div>
      <div className={`${styles.rules} ${styles.benefits}`}>
        <article><div className={styles.benefitPreview}>
          <Image src="/assets/cross-country-sinalizacao.webp" alt="Percurso sinalizado do CIRCUITO DE CROSS COUNTRY" fill sizes="(max-width: 600px) 90vw, 360px" className={styles.previewPhoto} />
          <span className={styles.previewLabel}>YouTube · transmissão</span><span className={styles.playMark} aria-hidden="true"><Youtube /></span>
        </div><h3>Transmissão ao vivo pelo YouTube</h3><p>Acompanhe as provas e torça pelos atletas durante a transmissão do evento.</p></article>
        <article><div className={`${styles.benefitPreview} ${styles.athletePreview}`}>
          <Image src="/assets/cross-country-atleta-trofeu.webp" alt="Atleta no percurso de CROSS COUNTRY" fill sizes="(max-width: 600px) 90vw, 360px" className={styles.previewPhoto} />
          <span className={styles.previewLabel}><Camera size={14} aria-hidden="true" />Galeria do evento</span>
        </div><h3>Fotos gratuitas</h3><p>Registros feitos por fotógrafo profissional, disponibilizados gratuitamente após o evento.</p></article>
        <article><div className={`${styles.benefitPreview} ${styles.rankingPreview}`} role="img" aria-label="Exemplo ilustrativo de ranking com três atletas e suas pontuações">
          <div className={styles.rankingPreviewHeader}><strong>Classificação</strong><span>EXEMPLO</span></div>
          <div className={styles.rankingPreviewColumns}><span>ATLETA</span><span>PTS</span></div>
          {[10, 9, 8].map((points, index) => <div className={styles.rankingPreviewRow} key={points}><b>{String(index + 1).padStart(2, "0")}</b><span>Atleta {String(index + 1).padStart(2, "0")}<i style={{ width: `${80 - index * 20}%` }} /></span><strong>{points}</strong></div>)}
        </div><h3>Ranking em tempo real</h3><p>Pontuação para o ranking atualizada em tempo real no site, para acompanhar a classificação dos atletas.</p></article>
      </div>
    </section>

    <section className={`section ${styles.panel}`} id="categorias">
      <div className={styles.heading}><span className="eyebrow">Uma distância para cada fase</span><h2>Cinco faixas etárias. A mesma vontade de correr.</h2><p>A categoria considera a idade que o atleta completa em 2026. Todas as provas têm classificação feminina e masculina.</p></div>
      <div className={styles.categories}>
        {crossCountryRaces.map((item) => <article key={item.label}><span>{item.label}</span><strong>{item.distance}</strong><p>Masculino e Feminino</p><small>Largada às {item.time}</small></article>)}
      </div>
      <p className={styles.note}><Users size={18} aria-hidden="true" />Masculino e feminino largam no mesmo horário em cada faixa etária. A categoria Sub 10 recebe atletas de 9 anos ou menos; as demais categorias individuais e as classificações por gênero são mantidas.</p>
    </section>

    <section className={`section ${styles.panel}`} id="programacao">
      <div className={styles.heading}><span className="eyebrow">15 de novembro · programação prevista</span><h2>Uma manhã de Cross Country.</h2><p>Toda a programação acontece em um único período, das 8h às 10h. São cinco largadas, com masculino e feminino no mesmo horário em cada faixa etária.</p></div>
      <div className={styles.schedule}>
        <article><header><h3>Período único · Manhã</h3><span><Clock3 size={16} aria-hidden="true" />08h às 10h</span></header>
          <ol>{schedule.map((event) => <li key={event.time}><time dateTime={event.time}>{event.time}</time><div><strong>{event.title}</strong>{event.detail ? <small>{event.detail}</small> : null}</div></li>)}</ol>
        </article>
      </div>
      <p className={styles.note}><Flag size={18} aria-hidden="true" />Largada conjunta, resultado individual: classificação, pontuação e pódio continuam separados por categoria e gênero.</p>
    </section>

    <section className={`section ${styles.panel}`}>
      <div className={styles.heading}><span className="eyebrow">Uma conquista que continua viva</span><h2>Premiação e classificação.</h2></div>
      <div className={styles.livingTrophy}>
        <Image src="/assets/cross-country-trofeu-vivo.webp" alt="Troféu de primeiro lugar do CIRCUITO DE CROSS COUNTRY IVCL 11RUN: placa transparente com terra e grama em seu interior" width={960} height={960} sizes="(max-width: 600px) 260px, 320px" />
        <div><span className="eyebrow">Da natureza para o pódio</span><h3>Troféu vivo</h3><p>Uma lembrança que carrega a essência do CROSS COUNTRY: terra e grama viva dentro de uma peça transparente, unindo a conquista do atleta ao terreno onde tudo acontece.</p><p>Mais do que guardar uma colocação, o troféu celebra crescimento, cuidado e a conexão com a natureza.</p><strong>Para os três primeiros de cada categoria e gênero, junto com brindes 11Run.</strong></div>
      </div>
      <div className={styles.rules}>
        <article><Medal aria-hidden="true" /><h3>Três no pódio</h3><p>Troféus e brindes 11Run para os três primeiros de cada categoria, no feminino e no masculino.</p></article>
        <article><Flag aria-hidden="true" /><h3>Do 1º ao 10º</h3><p>10 pontos para o primeiro, 9 para o segundo e assim por diante, até 1 ponto para o décimo colocado.</p></article>
        <article><Route aria-hidden="true" /><h3>A soma da jornada</h3><p>A classificação geral soma os pontos das edições. A terceira edição, a final, vale o dobro.</p></article>
      </div>
      <details className={styles.regulations} id="regulamento"><summary>Participação e regulamento</summary><ol>{crossCountryTerm.clauses.map((clause) => <li key={clause}>{clause}</li>)}</ol><p>A operação prevista reúne sete profissionais: coordenação, largada, cronometragem, filmagem, premiação e secretaria, além de duas pessoas na apuração dos resultados.</p></details>
    </section>

    <section className={`section ${styles.panel}`} id="faq"><CrossCountryFaq /></section>

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
