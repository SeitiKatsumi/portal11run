import type { Metadata } from "next";
import Link from "next/link";
import {
  Apple,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  GlassWater,
  Pill,
  SearchCheck,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  XCircle,
} from "lucide-react";
import styles from "./page.module.css";

const title = "Alimentação e Suplementação";
const description =
  "Como orientar jovens atletas sobre alimentação, hidratação, suplementos e esporte limpo sem antecipar pressão nem transformar performance em prioridade.";
const path = "/referencias/reflexoes/alimentacao-e-suplementacao";

export const metadata: Metadata = {
  title: `${title} | Reflexões 11RUN`,
  description,
  keywords: [
    "alimentação infantil no esporte",
    "suplementação para jovens atletas",
    "whey e creatina para adolescentes",
    "hidratação no esporte infantil",
    "esporte limpo",
    "Onze Futuro",
  ],
  alternates: { canonical: path },
  openGraph: { title, description, type: "article", url: path },
  twitter: { card: "summary_large_image", title, description },
};

const sources = [
  {
    institution: "Sociedade Brasileira de Pediatria",
    title: "Uso de whey protein e creatina por crianças e adolescentes",
    note: "Nota do Departamento Científico de Nutrologia sobre alimentação, riscos e indicações clínicas.",
    href: "https://www.sbp.com.br/pediatras-alertam-sobre-perigos-do-uso-de-suplementos-proteicos-de-whey-protein-e-creatina-por-criancas-e-adolescentes/",
  },
  {
    institution: "Canadian Paediatric Society",
    title: "Energy and sports drinks in children and adolescents",
    note: "Posicionamento reafirmado em 2026 sobre água, bebidas esportivas e energéticos.",
    href: "https://cps.ca/en/documents/position/energy-and-sports-drinks",
  },
  {
    institution: "British Journal of Sports Medicine",
    title: "Youth running consensus statement",
    note: "Consenso sobre saúde, crescimento, recuperação e treinamento de jovens corredores.",
    href: "https://bjsm.bmj.com/content/55/6/305",
  },
  {
    institution: "World Anti-Doping Agency",
    title: "Anti-doping education",
    note: "Educação baseada em valores como primeiro contato com o esporte limpo.",
    href: "https://www.wada-ama.org/en/athletes-support-personnel/anti-doping-education",
  },
  {
    institution: "Autoridade Brasileira de Controle de Dopagem",
    title: "Substâncias e métodos proibidos no esporte",
    note: "Lista vigente, responsabilidades e materiais oficiais para atletas e equipes de apoio.",
    href: "https://www.gov.br/abcd/pt-br/composicao/atletas/substancias-e-metodos-proibidos",
  },
  {
    institution: "Frontiers in Sports and Active Living",
    title: "Preventing doping in youth sport",
    note: "Revisão sistemática sobre programas preventivos e aprendizagem ativa com jovens.",
    href: "https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2021.673452/full",
  },
];

export default function NutritionAndSupplementationReflectionPage() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://11run.com.br";
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": ["Article", "WebPage"],
      headline: title,
      description,
      datePublished: "2026-08-10",
      dateModified: "2026-08-10",
      author: { "@type": "Person", name: "Seiti Katsumi" },
      publisher: { "@type": "Organization", name: "11RUN", url: origin },
      mainEntityOfPage: `${origin}${path}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: origin },
        { "@type": "ListItem", position: 2, name: "Referências", item: `${origin}/referencias/ranking-brasil` },
        { "@type": "ListItem", position: 3, name: "Reflexões" },
        { "@type": "ListItem", position: 4, name: title, item: `${origin}${path}` },
      ],
    },
  ];

  return (
    <article className={styles.page}>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      ))}

      <nav className={styles.breadcrumb} aria-label="Trilha de navegação">
        <Link href="/">Início</Link><span>/</span>
        <Link href="/referencias/ranking-brasil">Referências</Link><span>/</span>
        <strong>Reflexões</strong><span>/</span><b>{title}</b>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Reflexões 11RUN · Infância, saúde e esporte limpo</span>
          <h1>Alimentação <em>e Suplementação</em></h1>
          <p>Na formação de jovens atletas, crescimento vem antes da performance — e nenhuma promessa de resultado substitui comida, cuidado e orientação profissional.</p>
          <div className={styles.actions}>
            <a href="#ponto-de-partida">Começar a leitura <ArrowDown /></a>
            <Link href="/onze-futuro">Conhecer o Onze Futuro <ArrowRight /></Link>
          </div>
          <small>Leitura para famílias, treinadores e jovens atletas · Base científica atualizada em agosto de 2026</small>
        </div>
        <aside className={styles.heroManifesto} aria-label="Três compromissos para uma formação segura">
          <Apple /><span>Comer para crescer.</span>
          <SearchCheck /><span>Perguntar antes de usar.</span>
          <ShieldCheck /><span>Competir sem atalhos.</span>
        </aside>
      </header>

      <nav className={styles.jumpNav} aria-label="Nesta reflexão">
        {[
          ["Ponto de partida", "ponto-de-partida"],
          ["Alimentação", "alimentacao"],
          ["Suplementação", "suplementacao"],
          ["Hidratação", "hidratacao"],
          ["Protocolo", "protocolo"],
          ["Por idade", "por-idade"],
          ["Adultos", "adultos"],
          ["Fontes", "fontes"],
        ].map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <section className={styles.verdict} id="ponto-de-partida">
        <div>
          <span className={styles.eyebrow}>Ponto de partida</span>
          <h2>Educar cedo não é prescrever cedo.</h2>
        </div>
        <div>
          <p>Existe base suficiente para iniciar, entre 9 e 13 anos, uma educação sobre alimentação, escolhas seguras e esporte limpo. O objetivo não é formar pequenos especialistas em nutrição ou antidopagem, mas desenvolver autonomia progressiva, pensamento crítico e coragem para pedir ajuda.</p>
          <blockquote>Uma aula isolada não protege uma carreira inteira. O que protege é uma cultura contínua, repetida e praticada por crianças, famílias, treinadores e profissionais.</blockquote>
        </div>
      </section>

      <section className={styles.section} id="alimentacao">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>01 · Alimentação</span>
          <h2>Comida sustenta uma infância inteira — não apenas o treino.</h2>
          <p>Para o jovem corredor, alimentação precisa apoiar crescimento, escola, desenvolvimento cerebral, saúde óssea, imunidade, recuperação, convivência e prazer pelo esporte.</p>
        </div>
        <div className={styles.foodGrid}>
          <article className={styles.foodFirst}>
            <Apple />
            <span>Base cotidiana</span>
            <h3>Variedade e regularidade valem mais do que perfeição.</h3>
            <p>Arroz, feijão, ovos, carnes, leite e derivados, cereais, tubérculos, frutas e hortaliças podem compor uma alimentação familiar diversa, baseada principalmente em alimentos in natura ou minimamente processados.</p>
          </article>
          <article>
            <CheckCircle2 />
            <h3>O que aprender</h3>
            <ul>
              <li>Comida fornece energia para crescer, estudar, brincar e treinar.</li>
              <li>Fome não é fraqueza; recuperação também acontece no prato.</li>
              <li>O corpo muda durante o crescimento e não precisa ser comparado.</li>
            </ul>
          </article>
          <article>
            <XCircle />
            <h3>O que evitar</h3>
            <ul>
              <li>Contar calorias, pesar comida ou perseguir percentual de gordura.</li>
              <li>Associar magreza a talento ou sentir culpa por comer.</li>
              <li>Eliminar grupos alimentares sem avaliação profissional.</li>
            </ul>
          </article>
        </div>
        <p className={styles.languageNote}><strong>Uma escolha de linguagem importa:</strong> falamos em “esporte limpo”, mas evitamos classificar alimentos como “limpos” ou “sujos”. Comida não deve carregar culpa.</p>
      </section>

      <section className={styles.darkSection} id="suplementacao">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>02 · Suplementação</span>
          <h2>Necessidade clínica e promessa de performance não são a mesma coisa.</h2>
        </div>
        <div className={styles.supplementCompare}>
          <article>
            <Stethoscope />
            <span>Cuidado de saúde</span>
            <h3>Suplementação clínica</h3>
            <p>Pode ser indicada diante de deficiência nutricional, condição clínica, má absorção ou demanda específica. Há avaliação individual, motivo, dose, duração e acompanhamento profissional.</p>
          </article>
          <article>
            <Pill />
            <span>Promessa comercial</span>
            <h3>Suplementação para performance</h3>
            <p>Produtos que prometem força, energia, emagrecimento, ganho muscular ou recuperação não devem entrar automaticamente na rotina de crianças e adolescentes.</p>
          </article>
        </div>
        <div className={styles.positioning}>
          <CircleAlert />
          <div><strong>Posicionamento para jovens saudáveis</strong><p>A Sociedade Brasileira de Pediatria afirma que não há indicação para o uso rotineiro de whey protein e creatina. Isso não transforma todo suplemento em “veneno”: quando existe uma necessidade verdadeira, ele é cuidado de saúde — nunca brinquedo, prêmio, símbolo de atleta ou atalho.</p></div>
        </div>
        <div className={styles.notRoutine}>
          <span>Não fazem parte da estratégia pedagógica de performance infantil:</span>
          <div>{["Whey protein", "Creatina", "Pré-treinos", "Termogênicos", "Produtos para emagrecer", "Cafeína para performance", "Aminoácidos isolados", "Vitaminas sem indicação"].map((item) => <small key={item}>{item}</small>)}</div>
        </div>
      </section>

      <section className={styles.section} id="hidratacao">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>03 · Hidratação</span>
          <h2>Água, isotônico e energético cumprem papéis muito diferentes.</h2>
        </div>
        <div className={styles.drinkGrid}>
          <article><GlassWater /><span>Escolha habitual</span><h3>Água</h3><p>É a primeira escolha antes, durante e depois da atividade física rotineira.</p></article>
          <article><span>Uso contextual</span><h3>Isotônico</h3><p>Pode ter função em exercícios prolongados e vigorosos ou sob calor extremo, com orientação adulta. Não é necessário depois de qualquer treino.</p></article>
          <article><CircleAlert /><span>Não recomendado</span><h3>Energético</h3><p>Contém cafeína e outros estimulantes. Não é bebida de hidratação e não faz parte do esporte infantil.</p></article>
        </div>
      </section>

      <section className={styles.protocol} id="protocolo">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>04 · Um comportamento para memorizar</span>
          <h2>Para, pergunta e confere.</h2>
          <p>Crianças não precisam decorar nomes químicos. Precisam saber o que fazer diante de um comprimido, pó, goma, chá concentrado, bebida “energética”, medicamento ou produto desconhecido.</p>
        </div>
        <ol>
          <li><b>01</b><strong>Para</strong><p>Não ingira imediatamente e não aceite produtos escondido ou de qualquer pessoa.</p></li>
          <li><b>02</b><strong>Pergunta</strong><p>Converse com responsáveis, treinador e profissional de saúde. Perguntar é atitude de atleta.</p></li>
          <li><b>03</b><strong>Confere</strong><p>Um adulto verifica o produto, motivo, indicação, dose, riscos, procedência e regras esportivas aplicáveis.</p></li>
        </ol>
        <p className={styles.protocolNote}><ShieldCheck /> Esporte limpo não significa recusar tratamento médico. Saúde vem primeiro; os adultos e profissionais verificam os procedimentos adequados quando um medicamento é necessário.</p>
      </section>

      <section className={styles.section} id="por-idade">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>05 · Educação progressiva</span>
          <h2>A conversa amadurece junto com a criança.</h2>
        </div>
        <div className={styles.ageGrid}>
          <article>
            <span>9–10 anos</span>
            <h3>Concreto, lúdico e cotidiano</h3>
            <ul><li>Comer para crescer e brincar.</li><li>Água como companheira do treino.</li><li>Diferença entre comida, remédio e suplemento.</li><li>Não aceitar produtos sem perguntar.</li><li>Propagandas não contam toda a história.</li></ul>
          </article>
          <article>
            <span>11–13 anos</span>
            <h3>Pensamento crítico e escolhas</h3>
            <ul><li>Leitura crítica de rótulos e promessas.</li><li>Influenciadores, patrocínio e evidência.</li><li>“Natural” não significa automaticamente seguro.</li><li>Pressão de colegas e imagem corporal.</li><li>Noções iniciais de responsabilidade esportiva.</li></ul>
          </article>
        </div>
      </section>

      <section className={styles.adults} id="adultos">
        <div>
          <UsersRound />
          <span className={styles.eyebrow}>06 · Responsabilidade compartilhada</span>
          <h2>A criança aprende a perguntar. Os adultos assumem a verificação.</h2>
          <p>Famílias, treinadores, pediatras e nutricionistas formam a rede que protege a saúde, a relação com a comida e a integridade esportiva.</p>
        </div>
        <ul>
          <li>Não oferecer suplemento por rotina, moda ou comparação.</li>
          <li>Não usar peso e composição corporal como cobrança de performance.</li>
          <li>Observar fadiga persistente, perda de peso, dor recorrente ou queda de rendimento.</li>
          <li>Levar a sério medo de comer, culpa, compulsão ou preocupação excessiva com o corpo.</li>
          <li>Buscar avaliação profissional diante de sintomas, restrições ou dúvidas.</li>
        </ul>
      </section>

      <aside className={styles.disclaimer}>
        <CircleAlert />
        <p><strong>Informação educativa, não prescrição.</strong> Esta matéria não substitui avaliação de pediatra ou nutricionista. Necessidades variam conforme crescimento, saúde, alimentação e rotina de treinamento.</p>
      </aside>

      <section className={styles.sources} id="fontes">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>Fontes e leitura complementar</span>
          <h2>O que sustenta esta reflexão.</h2>
          <p>Prioridade para entidades pediátricas, autoridades antidopagem e literatura científica revisada por pares.</p>
        </div>
        <div className={styles.sourceGrid}>
          {sources.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
              <span>{source.institution}</span><ExternalLink />
              <h3>{source.title}</h3><p>{source.note}</p>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.related}>
        <span className={styles.eyebrow}>Continue em Reflexões</span>
        <h2>Formação é uma conversa contínua.</h2>
        <div>
          <Link href="/institucional/opiniao/mesma-idade-desenvolvimentos-diferentes"><strong>Desenvolvimento</strong><span>Mesma idade. Desenvolvimentos diferentes.</span><ArrowRight /></Link>
          <Link href="/referencias/analises/formacao-integral-do-atleta"><strong>Autonomia</strong><span>Formação Integral do Atleta</span><ArrowRight /></Link>
          <Link href="/referencias/analises/o-fundo-comeca-na-infancia"><strong>Infância</strong><span>O Fundo Começa na Infância?</span><ArrowRight /></Link>
        </div>
      </section>

      <section className={styles.signature}>
        <div><span className={styles.eyebrow}>Reflexões 11RUN</span><h2>Antes de formar um atleta que conhece proibições, formamos uma criança que sabe cuidar de si.</h2></div>
        <div><strong>Seiti Katsumi</strong><span>Fundador da 11RUN</span></div>
      </section>
    </article>
  );
}
