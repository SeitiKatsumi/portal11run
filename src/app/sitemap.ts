import type { MetadataRoute } from "next";

const routes = [
  "",
  "/app-11run",
  "/onze-futuro",
  "/11-master",
  "/circuito-futuro-11",
  "/projetos/circuito-virtual-11run",
  "/bolsas",
  "/institucional/seiti-katsumi",
  "/institucional/alex-sandro-lopes",
  "/apoie",
  "/apoie-o-projeto",
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
