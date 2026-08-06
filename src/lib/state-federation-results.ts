export type FederationSource = {
  state: string;
  federation: string;
  acronym: string;
  url: string;
  status: "results" | "scheduled" | "not-found";
  note: string;
};

export type StateFederationResult = {
  id: string;
  state: string;
  event: 1000 | 2000;
  gender: "M" | "F";
  athlete: string;
  birthYear: number;
  team: string;
  performance: string;
  competition: string;
  location: string;
  date: string;
  federation: string;
  sourceUrl: string;
};

const directory = "https://competicoes.cbat.org.br/novo/federacoes/";

export const federationSources: FederationSource[] = [
  ["AC", "Federação Acreana de Atletismo", "FACAt", "https://www.atletismoacreano.org", "not-found", "Estadual Sub-16 realizado; boletim oficial não localizado em página pública."],
  ["AL", "Federação Alagoana de Atletismo", "FAAt", directory, "not-found", "Sem boletim Sub-16 público localizado."],
  ["AP", "Federação de Atletismo do Amapá", "FAAp", "http://www.atletismoamapa.org.br/", "not-found", "Sem boletim Sub-16 público localizado."],
  ["AM", "Federação Desportiva de Atletismo do Amazonas", "FEDAEAM", "https://www.fedaeam.com/", "not-found", "Evento Sub-16 identificado; resultados completos não localizados."],
  ["BA", "Federação Bahiana de Atletismo", "FBA", "https://www.fba.org.br/", "not-found", "Sem boletim Sub-16 público localizado."],
  ["CE", "Federação Cearense de Atletismo", "FCAt", "https://www.fcat.org.br/", "not-found", "Sem boletim Sub-16 público localizado."],
  ["DF", "Federação de Atletismo do Distrito Federal", "FAtDF", directory, "not-found", "Sem boletim Sub-16 público localizado."],
  ["ES", "Federação Capixaba de Atletismo", "FECAt", "https://atletismofecat.org.br/", "not-found", "Sem boletim Sub-16 público localizado."],
  ["GO", "Federação Goiana de Atletismo", "FGAt", "https://atletismogoias.com.br/resultados-campenato-goiano-sub-16/", "not-found", "Resultado Sub-16 de 2025 localizado; edição 2026 ainda não localizada."],
  ["MA", "Federação Atlética Maranhense", "FAMA", directory, "not-found", "Sem boletim Sub-16 público localizado."],
  ["MT", "Federação de Atletismo de Mato Grosso", "FAMT", "https://www.famt.org.br/noticia/107176/famt-abre-calendario-2026-com-etapas-sub-16-e-sub-23", "not-found", "Estadual 2026 identificado; boletim oficial não localizado."],
  ["MS", "Federação de Atletismo de Mato Grosso do Sul", "FAMS", "https://www.atletismoms.org.br/", "not-found", "Sem boletim Sub-16 público localizado."],
  ["MG", "Federação Mineira de Atletismo", "FMA", "https://www.atletismomg.org.br/ranking-lista", "scheduled", "Campeonato Mineiro Sub-16 previsto para 19/09/2026."],
  ["PA", "Federação Paraense de Atletismo", "FPAt", directory, "not-found", "Sem boletim Sub-16 público localizado."],
  ["PB", "Federação Paraibana de Atletismo", "FPBA", "https://www.fpba.org.br/", "not-found", "Sem boletim Sub-16 público localizado."],
  ["PR", "Federação de Atletismo do Paraná", "FAP", "https://www.atletismofap.org/", "not-found", "Sem boletim Sub-16 de 2026 localizado."],
  ["PE", "Federação Pernambucana de Atletismo", "FEPA", "https://atletismope.com.br/resultados/ranking", "not-found", "Arquivo histórico disponível; edição Sub-16 de 2026 ainda não localizada."],
  ["PI", "Federação de Atletismo do Piauí", "FPI", "https://www.fpiatletismopiaui.org.br/", "not-found", "Campeonato estadual identificado; boletim oficial não localizado."],
  ["RJ", "Federação Estadual Rio de Atletismo", "FERAt", "https://www.feratrio.org.br/_files/ugd/76a0f7_d34bc140ac7746ccb64c23d06a61aefc.pdf", "results", "Boletim oficial de fundo e meio-fundo publicado em 21/02/2026."],
  ["RN", "Federação Norte-Rio-Grandense de Atletismo", "FNA", "https://www.fnatletismo.com.br/", "not-found", "Sem boletim Sub-16 público localizado."],
  ["RS", "Federação de Atletismo do Estado do Rio Grande do Sul", "FAERGS", "https://faergs.com.br/index2.php", "scheduled", "Campeonato Gaúcho Sub-16 previsto para 12/09/2026."],
  ["RO", "Federação de Atletismo de Rondônia", "FARO", directory, "not-found", "Sem boletim Sub-16 público localizado."],
  ["RR", "Federação Roraimense de Atletismo", "FERA", "https://www.feraatletismo.org.br/", "not-found", "Sem boletim Sub-16 público localizado."],
  ["SC", "Federação Catarinense de Atletismo", "FCA", "https://fcatletismo.org.br/gestor/app/fca/repositorio/evento/result_id1288.pdf", "results", "Boletim oficial do V Meeting FCA / Festival Sub-16 publicado em 28/03/2026."],
  ["SP", "Federação Paulista de Atletismo", "FPA", "https://atletismopaulista.com.br/", "not-found", "Resultados Sub-16 encontrados em eventos; ranking completo de 2026 ainda não localizado."],
  ["SE", "Federação Sergipana de Atletismo", "FSAt", directory, "not-found", "Sem boletim Sub-16 público localizado."],
  ["TO", "Federação de Atletismo do Estado do Tocantins", "FATO", directory, "not-found", "Sem boletim Sub-16 público localizado."]
].map(([state, federation, acronym, url, status, note]) => ({ state, federation, acronym, url, status, note })) as FederationSource[];

const rioSource = federationSources.find((item) => item.state === "RJ")!.url;
const santaCatarinaSource = federationSources.find((item) => item.state === "SC")!.url;

export const stateFederationResults: StateFederationResult[] = [
  ["rj-1000-m-1", "RJ", 1000, "M", "Nycollas Andrew Ganda Por", 2011, "Associação Esportiva e Cultural", "3:27.07"],
  ["rj-1000-m-2", "RJ", 1000, "M", "Davi Azeredo Barreto", 2011, "Associação Esportiva Cidadania", "3:27.21"],
  ["rj-1000-m-3", "RJ", 1000, "M", "Davi Manoel Batista Mata", 2011, "Associação Esportiva Cidadania", "3:31.96"],
  ["rj-1000-m-4", "RJ", 1000, "M", "Henry Ramos de Assis", 2012, "Prefeitura Municipal de Nova Iguaçu", "3:32.32"],
  ["rj-1000-m-5", "RJ", 1000, "M", "Samuel Henrique Gomes Rom", 2011, "Associação Esportiva Cidadania", "3:38.28"],
  ["rj-1000-m-6", "RJ", 1000, "M", "Pedro Meira Sant’Ana", 2012, "Instituto Mangueira do Futuro", "3:39.18"],
  ["rj-1000-f-1", "RJ", 1000, "F", "Ludmila Cirino de Vasconcellos Rez", 2012, "Futuro Olímpico Arnaldo Oliveira", "3:36.58"],
  ["rj-1000-f-2", "RJ", 1000, "F", "Anna Beatriz dos Santos No", 2011, "Associação Esportiva e Cultural", "3:40.98"],
  ["rj-1000-f-3", "RJ", 1000, "F", "Ana Julia Rodrigues Gonçalves", 2011, "Prefeitura Municipal de Duque de Caxias", "3:55.18"],
  ["rj-1000-f-4", "RJ", 1000, "F", "Anna Beatriz da Silva", 2011, "Instituto Mangueira do Futuro", "4:09.55"],
  ["rj-1000-f-5", "RJ", 1000, "F", "Fernanda Raquel Vasconcellos", 2011, "Instituto Mangueira do Futuro", "4:17.83"],
  ["rj-1000-f-6", "RJ", 1000, "F", "Eliza França da Silva", 2011, "Associação Esportiva Cidadania", "4:21.72"],
  ["rj-1000-f-7", "RJ", 1000, "F", "Raquel Rocha Aguiar", 2012, "Instituto Mangueira do Futuro", "4:24.29"],
  ["rj-1000-f-8", "RJ", 1000, "F", "Thais Luna Medeiros Miguel", 2012, "Associação Esportiva e Cultural", "6:13.46"]
].map(([id, state, event, gender, athlete, birthYear, team, performance]) => ({
  id, state, event, gender, athlete, birthYear, team, performance,
  competition: "II Torneio Rio de Fundo e Meio-Fundo",
  location: "Niterói/RJ",
  date: "2026-02-21",
  federation: "FERAt",
  sourceUrl: rioSource
})) as StateFederationResult[];

stateFederationResults.push(
  ...([
    ["sc-2000-m-1", "M", "Nicolas Pietro Sipp Machado", 2011, "Caçador", "6:17.97"],
    ["sc-2000-m-2", "M", "Miguel Land Zardinello", 2011, "Noroeste Runners", "6:37.63"],
    ["sc-2000-m-3", "M", "Igor Schmidt de Azevedo", 2012, "ASCOA/SEDEC", "6:38.33"],
    ["sc-2000-m-4", "M", "Ketson Cauã Hanauer", 2011, "Noroeste Runners", "7:15.04"],
    ["sc-2000-m-5", "M", "Jean Lazzarotti", 2012, "Chapecó", "7:15.45"],
    ["sc-2000-m-6", "M", "Bernardo Daniel Hubner", 2011, "Princesa", "7:36.63"],
    ["sc-2000-m-7", "M", "Gabriel Amaral dos Santos", 2011, "AACN", "7:37.41"],
    ["sc-2000-f-1", "F", "Maria Vitória Dickel", 2012, "Chapecó", "8:43.18"],
    ["sc-2000-f-2", "F", "Valentina Machado Amalcaburio", 2012, "AACN", "8:53.26"]
  ] as const).map(([id, gender, athlete, birthYear, team, performance]) => ({
    id, state: "SC", event: 2000 as const, gender, athlete, birthYear, team, performance,
    competition: "V Meeting FCA / Festival Sub-16",
    location: "Chapecó/SC",
    date: "2026-03-28",
    federation: "FCA",
    sourceUrl: santaCatarinaSource
  }))
);
