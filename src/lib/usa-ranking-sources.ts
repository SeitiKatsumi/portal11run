export const usaRankingSources = [
  {
    key: "usatf-national-jo-2026",
    shortName: "USATF",
    name: "USATF National Junior Olympics 2026",
    organization: "USA Track & Field",
    coverage: "56 associações locais",
    status: "connected",
    statusLabel: "Integrada ao ranking",
    sourceUrl: "https://www.usatf.org/events/2026/2026-usatf-national-junior-olympic-track-field-cha",
    description: "Resultados, fases e marcas de entrada da competição nacional juvenil."
  },
  {
    key: "aau-club-2026",
    shortName: "AAU",
    name: "AAU National Club Championships 2026",
    organization: "Amateur Athletic Union",
    coverage: "26 regiões competitivas",
    status: "connected",
    statusLabel: "Integrada ao ranking",
    sourceUrl: "https://image.aausports.org/sports/athletics/results/2026/club/clubcompleteresults.htm",
    description: "Resultados oficiais consolidados do campeonato nacional de clubes."
  },
  {
    key: "aau-junior-olympics-2026",
    shortName: "AAU JO",
    name: "AAU Junior Olympic Games 2026",
    organization: "Amateur Athletic Union",
    coverage: "Publicação prevista em agosto",
    status: "monitoring",
    statusLabel: "Publicação monitorada",
    sourceUrl: "https://www.aausports.org/track-and-field/resultsrankings/",
    description: "Entrará na unificação quando a AAU publicar os resultados oficiais da edição."
  },
  {
    key: "nfhs-state-associations",
    shortName: "NFHS",
    name: "NFHS e associações estaduais",
    organization: "National Federation of State High School Associations",
    coverage: "51 associações estaduais",
    status: "directory",
    statusLabel: "Diretório oficial",
    sourceUrl: "https://www.nfhs.org/about",
    description: "Governança escolar descentralizada; resultados são publicados por cada associação estadual."
  },
  {
    key: "athletic-net-aau",
    shortName: "Athletic.net",
    name: "Athletic.net — divisão AAU",
    organization: "Plataforma técnica vinculada pela AAU",
    coverage: "Ranking público com acesso limitado",
    status: "reference",
    statusLabel: "Referência complementar",
    sourceUrl: "https://www.athletic.net/track-and-field-outdoor/usa/club/aau",
    description: "Usada como conferência externa; o acesso público não libera 100 linhas para integração."
  }
] as const;

export type UsaRankingSourceKey = (typeof usaRankingSources)[number]["key"];

export function usaRankingSourceByKey(key: string) {
  return usaRankingSources.find((source) => source.key === key);
}

export function connectedUsaRankingSources() {
  return usaRankingSources.filter((source) => source.status === "connected");
}
