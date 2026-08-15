import type { MetadataRoute } from "next";

const routes = [
  "",
  "/app-11run",
  "/onze-futuro",
  "/11-master",
  "/circuito-futuro-11",
  "/projetos/circuito-virtual-11run",
  "/bolsas",
  "/referencias/ranking-brasil",
  "/referencias/ranking-japao",
  "/referencias/ranking-noruega",
  "/referencias/ranking-eua",
  "/referencias/ranking-quenia",
  "/referencias/ranking-uganda",
  "/referencias/ranking-mundial",
  "/referencias/calculadoras/pace",
  "/referencias/calculadoras/formulas",
  "/referencias/calculadoras/chance-olimpica",
  "/institucional/missao-visao-valores",
  "/institucional/seiti-katsumi",
  "/institucional/alex-sandro-lopes",
  "/institucional/diretrizes-aos-atletas",
  "/referencias/reflexoes/alimentacao-e-suplementacao",
  "/institucional/opiniao/mesma-idade-desenvolvimentos-diferentes",
  "/apoie",
  "/apoie-o-projeto",
  "/apoie-o-projeto/solucoes-de-marketing",
  "/apoie/patrocine",
  "/apoie/doacao",
  "/apoie/voluntariado",
  "/politica-de-privacidade"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://11run.com.br";
  return routes.map((route) => ({
    url: `${origin}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/apoie") ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/apoie" ? 0.9 : 0.7
  }));
}
