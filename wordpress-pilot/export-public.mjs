import { mkdir, readdir, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const origin = "https://11run.com.br";
const app = fileURLToPath(new URL("../src/app/", import.meta.url));
const out = resolve(process.argv[2] || fileURLToPath(new URL("./generated/", import.meta.url)));
const linked = /^(?:\/referencias\/(?:ranking-|calculadoras\/|resultados\/)|\/cadastro\/|\/cronometro\/|\/membros(?:\/|$)|\/admin(?:\/|$)|\/(?:app-11run|login|meu-painel|sorteio|obrigado|transparencia)$|\/apoie\/(?:doacao|patrocine|voluntariado)$|\/apoie-o-projeto(?:\/sucesso)?$|\/projetos\/circuito-virtual-11run(?:\/|$)|\/circuito-cross-country-ivcl-11run$)/;
const hidden = /^(?:\/admin(?:\/|$)|\/membros\/|\/cronometro\/|\/(?:11-regional|obrigado|transparencia)$|\/apoie-o-projeto\/sucesso$)/;
const routes = (await readdir(app, { recursive: true }))
  .map((path) => path.split(sep).join("/"))
  .filter((path) => path.endsWith("/page.tsx") && !path.includes("["))
  .map((path) => "/" + path.slice(0, -"/page.tsx".length))
  .filter((path) => !hidden.test(path))
  .sort();

const localPages = new Set(["/", ...routes.filter((path) => !linked.test(path))]);
const cssUrls = new Set();
const pages = [];
function absolute(value, base) {
  try {
    const url = new URL(value, base);
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

async function read(url) {
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(18000) });
  if (!response.ok) throw new Error(url + ": " + response.status);
  return response.text();
}

function linkTarget(value, base) {
  if (value.startsWith("#")) return value;
  const url = absolute(value, base);
  if (!url) return null;
  const path = url.pathname.replace(/\/$/, "") || "/";
  if (url.origin === origin && localPages.has(path)) {
    return "/global" + (path === "/" ? "/" : path + "/") + url.search + url.hash;
  }
  return url.href;
}

for (let i = 0; i < routes.length; i += 5) {
  const batch = await Promise.all(routes.slice(i, i + 5).map(async (path) => {
    const base = origin + path;
    // Snapshot editorial HTML only; live workflows keep the official portal as source of truth.
    if (linked.test(path)) return { path, external: base };
    const $ = load(await read(base));
    const main = $("body > main").first();
    if (!main.length) throw new Error("Conteúdo principal ausente: " + path);
    const title = main.find("h1").first().text().trim() || $("title").text().split(" | 11RUN")[0].trim();
    $('link[rel="stylesheet"]').each((_, element) => {
      const url = absolute($(element).attr("href") || "", base);
      if (url?.origin === origin && url.pathname.startsWith("/_next/static/")) cssUrls.add(url.href);
    });

    main.find("script,style,link,meta,template,noscript,iframe,object,embed").remove();
    main.find("form, [role=dialog], dialog").remove();
    main.find("a[href]").each((_, element) => {
      const node = $(element);
      const href = linkTarget(node.attr("href"), base);
      if (href) node.attr("href", href);
      else node.removeAttr("href");
    });
    main.find("button").each((_, element) => {
      const node = $(element);
      if (node.attr("aria-label") && !node.text().trim()) return node.remove();
      node.replaceWith($("<a>").attr({ href: base, class: node.attr("class") || "", "aria-label": node.text().trim() + " no portal atual" }).text(node.text().trim()));
    });
    main.find("*").each((_, element) => {
      const node = $(element);
      for (const [name, value] of Object.entries(element.attribs || {})) {
        if (/^on/i.test(name) || ["srcset", "sizes", "srcdoc", "formaction", "action"].includes(name)) node.removeAttr(name);
        if (["src", "poster"].includes(name)) {
          const url = absolute(value, base);
          if (url && ["http:", "https:"].includes(url.protocol)) node.attr(name, url.href);
          else node.removeAttr(name);
        }
        if (name === "style") {
          const style = value.replace(/(?:^|;)\s*(?:opacity:0(?:;|$)|transform:translate[^;]*(?:;|$))/g, ";");
          node.attr(name, style);
        }
      }
    });
    main.find("img:not([loading])").attr("loading", "lazy");
    const children = main.children();
    const blocks = children.length > 1 && children.toArray().every((el) => el.name === "section")
      ? children.toArray().map((el) => $.html(el))
      : [main.html()];
    if (!title || !blocks.some((block) => block?.trim())) throw new Error("Página sem título ou conteúdo: " + path);
    return { path, title, blocks };
  }));
  pages.push(...batch);
}

const css = (await Promise.all([...cssUrls].map(async (url) => {
  const stylesheet = await read(url);
  return stylesheet
    .replace(/:root\b/g, ":scope")
    .replace(/url\((["']?)(\/[^"')]+)\1\)/g, (_, quote, path) => "url(" + quote + new URL(path, origin).href + quote + ")");
}))).join("\n");

await mkdir(out, { recursive: true });
await writeFile(resolve(out, "content.json"), JSON.stringify(pages));
await writeFile(resolve(out, "legacy.css"), "@scope (.onze-import) {\n" + css + "\n}\n");
console.log(JSON.stringify({ copied: pages.filter((page) => page.blocks).length, linked: pages.filter((page) => page.external).length, stylesheets: cssUrls.size }));
