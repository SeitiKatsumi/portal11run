/* Reusable frontend actions. Keep execution out of imported HTML widgets. */
document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.matches("[data-onze-registration]")) return;
  const submit = form.querySelector('button[type="submit"]');
  if (submit) {
    submit.disabled = true;
    submit.textContent = "Enviando…";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const menu = document.activeElement?.closest("details.pilot-nav-mobile[open]");
  if (menu) {
    menu.open = false;
    menu.querySelector("summary")?.focus();
  }
});

const faq = document.querySelector(".onze-import #faq");
if (faq) {
  const search = faq.querySelector('input[type="search"]');
  const categories = faq.querySelector('[aria-label="Filtrar perguntas por assunto"]');
  const groups = [...faq.querySelectorAll("article")].filter((group) => group.querySelector("details"));
  const status = faq.querySelector('[role="status"]');
  const normalize = (text) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
  const groupLabel = (group) => normalize(group.querySelector("header .eyebrow")?.textContent || "");
  let category = "todos";
  const apply = () => {
    const term = normalize(search?.value || "");
    let count = 0;
    for (const group of groups) {
      const visibleCategory = category === "todos" || groupLabel(group) === category;
      let groupCount = 0;
      for (const detail of group.querySelectorAll("details")) {
        const visible = visibleCategory && normalize(detail.textContent).includes(term);
        detail.style.display = visible ? "" : "none";
        if (visible) groupCount++;
      }
      group.style.display = groupCount ? "" : "none";
      count += groupCount;
    }
    if (status) status.textContent = count === 1 ? "1 resposta encontrada" : count + " respostas encontradas";
  };
  search?.addEventListener("input", apply);
  categories?.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const next = normalize(link.textContent);
    if (next !== "todos" && !groups.some((group) => groupLabel(group) === next)) return;
    event.preventDefault();
    category = next;
    for (const anchor of categories.querySelectorAll("a")) {
      if (anchor === link) anchor.setAttribute("aria-current", "true");
      else anchor.removeAttribute("aria-current");
    }
    apply();
  });
}
