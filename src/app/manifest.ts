import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "11RUN Cronometragem",
    short_name: "11RUN Tempo",
    description: "Cronometragem e leitura de chegadas das competições 11RUN.",
    start_url: "/admin/cross-country",
    display: "standalone",
    background_color: "#f5f5f3",
    theme_color: "#292929",
    icons: [
      { src: "/assets/logos/onzerun-menu.png", sizes: "any", type: "image/png" }
    ]
  };
}
