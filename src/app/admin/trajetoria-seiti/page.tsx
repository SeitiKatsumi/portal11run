import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Trajetória do Seiti e Orcampi",
  description: "Linha do tempo temporária para apresentação da trajetória esportiva de Seiti Katsumi."
};

type TimelineItem = {
  year: string;
  label: string;
  title: string;
  image: string | null;
  imageAlt: string;
  caption: string;
  text: string[];
  metrics: Array<{ value: string; label: string }>;
};

const timeline: TimelineItem[] = [
  {
    year: "1992",
    label: "Jogos Regionais",
    title: "O início na pista",
    image: null,
    imageAlt: "",
    caption: "",
    text: [
      "Em 1992, Seiti correu os primeiros Jogos Regionais e também a primeira prova de pista, em Valinhos.",
      "Mesmo sem treinamento específico, marcou 4min06s nos 1.500 metros e 15min55s nos 5.000 metros.",
      "Depois dessa competição, não seguiu imediatamente no atletismo, pois ainda estava ligado ao futebol de salão."
    ],
    metrics: [
      { value: "4min06s", label: "1.500 m" },
      { value: "15min55s", label: "5.000 m" }
    ]
  },
  {
    year: "1994",
    label: "Retorno",
    title: "A prova que reabriu o caminho",
    image: "/assets/trajetoria-seiti/primeiros-5000m.jpg",
    imageAlt: "Registro dos 5.000 metros em que Seiti correu atrás de Vanderlei Cordeiro de Lima",
    caption: "A prova em que Seiti correu atrás de Vanderlei Cordeiro de Lima e abriu o caminho para a Eletropaulo.",
    text: [
      "Em 1994, a Prefeitura convidou Seiti para voltar aos Jogos Regionais. Na ocasião, José Américo, de Atibaia, orientou que ele seguisse um atleta baixo: Vanderlei Cordeiro de Lima.",
      "Vanderlei voltava de lesão e faria a prova em ritmo próximo de 3min05s por quilômetro. Seiti foi atrás dele; essa prova foi o ponto que abriu a porta para sua entrada na Eletropaulo.",
      "Pouco depois, Elias Bastos sugeriu um teste na Funilense, na pista da Unicamp."
    ],
    metrics: [
      { value: "14min56s", label: "5.000 m na primeira competição pela Eletropaulo" }
    ]
  },
  {
    year: "Funilense",
    label: "Unicamp",
    title: "O teste com Ricardo D'Angelo",
    image: null,
    imageAlt: "",
    caption: "",
    text: [
      "Ryo e Edson, que trabalhavam na Unicamp, agendaram o teste com o professor Ricardo D'Angelo.",
      "Ricardo pediu um teste de 12 minutos. Naquele dia, Elias Bastos e Rômulo treinavam tiros de 1.000 metros e passaram a primeira volta perto de 1min09s. Seiti tentou acompanhar, quebrou, mas ainda completou aproximadamente 3.750 metros.",
      "A orientação foi simples e decisiva: seguir treinando e voltar depois de três meses, pois ainda não havia vaga na casa dos atletas."
    ],
    metrics: [
      { value: "3.750 m", label: "aprox. em 12 minutos" }
    ]
  },
  {
    year: "1995-2002",
    label: "Japão",
    title: "Bolsa, formação e consistência internacional",
    image: "/assets/trajetoria-seiti/desempenho-japao.jpg",
    imageAlt: "Matéria sobre vitória de Seiti Katsumi em prova no Japão",
    caption: "A experiência no Japão ampliou o repertório esportivo e competitivo.",
    text: [
      "Pouco tempo depois, surgiu a oportunidade de ir para o Japão. O maior incentivador foi o professor Humberto Garcia, que mostrou a realidade do atleta adulto no Brasil e empurrou Seiti para aceitar a oportunidade.",
      "Em 1995, veio a bolsa integral como atleta no Japão. Para conquistar a vaga, fez um teste de 5.000 metros em 14min52s.",
      "Entre 1996 e 2002, venceu provas de rua, competiu no ambiente universitário japonês e correu os 5.000 metros 22 vezes abaixo de 14min21s."
    ],
    metrics: [
      { value: "14min52s", label: "teste de 5.000 m" },
      { value: "22x", label: "abaixo de 14min21s" }
    ]
  },
  {
    year: "2003",
    label: "Auge",
    title: "13min57s nos 5.000 metros",
    image: "/assets/trajetoria-seiti/melhor-marca-5000m.jpg",
    imageAlt: "Registro da melhor marca nos 5.000 metros",
    caption: "Marca de referência na trajetória de alto rendimento.",
    text: [
      "O auge nos 5.000 metros veio em 2003, com 13min57s.",
      "Com o tempo, Seiti percebeu que talvez sua prova mais natural fosse o 1.500 metros. Chegou a correr a milha em 3min59s, mas no Japão precisava competir principalmente nos 5.000 e 10.000 metros.",
      "A experiência mostrou a diferença entre talento, contexto competitivo, orientação e estrutura."
    ],
    metrics: [
      { value: "13min57s", label: "5.000 m" },
      { value: "3min59s", label: "milha" }
    ]
  },
  {
    year: "2022-2026",
    label: "Orcampi",
    title: "A história volta para a base",
    image: "/assets/trajetoria-seiti/treinamentos-planilha.jpg",
    imageAlt: "Planilha histórica de treinamentos",
    caption: "Planilhas e sessões que representam método, memória e continuidade.",
    text: [
      "A relação com a Funilense começou no início da trajetória, com Elias Bastos, Ryo, Edson, a pista da Unicamp e o teste com Ricardo D'Angelo.",
      "Mesmo seguindo depois para a Eletropaulo e para o Japão, aquela passagem foi importante para mostrar que havia potencial real de evolução.",
      "Em 2022, Seiti levou seu filho Luhan para o projeto de base da Orcampi e para treinar com o professor Alex Lopes. Luhan acabou indo para o Japão no ano seguinte.",
      "Agora, em 2026, Seiti vive uma nova etapa com Aimê, sua filha de 9 anos, sendo direcionada e acompanhada também na Orcampi. Essa continuidade transforma a própria história esportiva em ponte para a próxima geração."
    ],
    metrics: [
      { value: "2022", label: "Luhan na base da Orcampi" },
      { value: "2026", label: "Aimê acompanhada na Orcampi" }
    ]
  }
];

const personalBests = [
  ["400 m", "50s"],
  ["800 m", "1min51s em treinamento"],
  ["1.500 m", "3min42s"],
  ["Milha", "3min59s"],
  ["5.000 m", "13min57s"],
  ["10.000 m", "29min24s"],
  ["Meia maratona", "1h04min"]
];

export default function AdminTrajetoriaSeitiPage() {
  return (
    <main className="admin-panel seiti-story-page">
      <section className="seiti-story-hero">
        <div>
          <span className="eyebrow">Área temporária para apresentação</span>
          <h1>Trajetória do Seiti e relação com a Orcampi</h1>
          <p>
            Uma linha do tempo objetiva para apresentar ao Ricardo a conexão entre Jogos Regionais, Funilense, Unicamp,
            Eletropaulo, Japão e a retomada dessa história junto à Orcampi.
          </p>
        </div>
        <aside className="seiti-story-path" aria-label="Sequência da trajetória">
          <span>1992</span>
          <span>1994</span>
          <span>Funilense</span>
          <span>Eletropaulo</span>
          <span>Japão</span>
          <span>Orcampi</span>
        </aside>
      </section>

      <section className="seiti-story-timeline" aria-label="Linha do tempo da trajetória">
        {timeline.map((item, index) => (
          <article className={`seiti-story-item${item.image ? "" : " no-media"}`} key={`${item.year}-${item.title}`}>
            <div className="seiti-story-copy">
              <span className="seiti-story-year">{item.year}</span>
              <span className="eyebrow">{item.label}</span>
              <h2>{item.title}</h2>
              {item.text.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="seiti-story-metrics">
                {item.metrics.map((metric) => (
                  <div key={`${item.year}-${metric.value}`}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {item.image ? (
              <figure className={index % 2 === 0 ? "seiti-story-media" : "seiti-story-media alternate"}>
                <img src={item.image} alt={item.imageAlt} />
                <figcaption>{item.caption}</figcaption>
              </figure>
            ) : null}
          </article>
        ))}
      </section>

      <section className="seiti-story-records">
        <span className="eyebrow">Principais marcas</span>
        <h2>Uma trajetória construída entre oportunidade, método e coragem.</h2>
        <div className="seiti-record-grid">
          {personalBests.map(([event, mark]) => (
            <article key={event}>
              <span>{event}</span>
              <strong>{mark}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
