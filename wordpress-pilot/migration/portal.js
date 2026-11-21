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
