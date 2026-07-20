"use client";

import { useState, type FormEvent } from "react";
import { Handshake, PencilLine, Trash2, X } from "lucide-react";
import type { SponsorRecord } from "@/lib/sponsors";
import { sponsorCategories } from "@/lib/sponsor-categories";

type SponsorsAdminProps = {
  initialSponsors: SponsorRecord[];
};

export function SponsorsAdmin({ initialSponsors }: SponsorsAdminProps) {
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [editingSponsor, setEditingSponsor] = useState<SponsorRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    if (editingSponsor?.id) formData.set("id", editingSponsor.id);

    const response = await fetch("/api/admin/sponsors", {
      method: editingSponsor ? "PATCH" : "POST",
      body: formData
    });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? "Erro ao salvar patrocinador.");
      return;
    }

    setSponsors((current) => {
      if (editingSponsor) {
        return current
          .map((sponsor) => (sponsor.id === result.sponsor.id ? result.sponsor : sponsor))
          .sort((a, b) => a.category.localeCompare(b.category) || a.sort_order - b.sort_order || a.name.localeCompare(b.name));
      }

      return [result.sponsor, ...current];
    });
    setEditingSponsor(null);
    event.currentTarget.reset();
  }

  async function removeSponsor(id: string) {
    const response = await fetch(`/api/admin/sponsors?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setSponsors((current) => current.filter((sponsor) => sponsor.id !== id));
  }

  return (
    <section className="admin-panel admin-subpanel sponsors-admin">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">patrocinadores</span>
          <h1>Gestão de patrocinadores</h1>
          <p>Organize realização, apoio e patrocinadores para aparecerem no site e no módulo financeiro.</p>
        </div>
      </div>

      <form className="sponsor-admin-form" onSubmit={onSubmit} key={editingSponsor?.id ?? "new-sponsor"}>
        <label>
          <span>Nome</span>
          <input name="name" defaultValue={editingSponsor?.name ?? ""} placeholder="Nome da marca ou apoiador" required />
        </label>
        <label>
          <span>Grupo</span>
          <select name="category" defaultValue={editingSponsor?.category ?? "Patrocinadores"} required>
            {sponsorCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Ordem</span>
          <input name="sort_order" type="number" defaultValue={editingSponsor?.sort_order ?? 0} />
        </label>
        <label className="sponsor-active">
          <input name="active" type="checkbox" defaultChecked={editingSponsor ? editingSponsor.active === 1 : true} />
          <span>Exibir no site</span>
        </label>
        <label className="sponsor-wide">
          <span>Descrição</span>
          <textarea name="description" rows={3} defaultValue={editingSponsor?.description ?? ""} placeholder="Descrição institucional curta." />
        </label>
        <label className="sponsor-wide">
          <span>Logo</span>
          <input name="logo" type="file" accept="image/*" />
        </label>
        {editingSponsor?.logo_url ? (
          <div className="sponsor-current-logo">
            <img src={editingSponsor.logo_url} alt={editingSponsor.name} />
            <span>Logo atual</span>
          </div>
        ) : null}
        {error ? <p className="form-error sponsor-wide">{error}</p> : null}
        <div className="sponsor-form-actions">
          <button className="button primary" type="submit" disabled={loading}>
            <Handshake size={17} />
            {loading ? "Salvando..." : editingSponsor ? "Atualizar patrocinador" : "Salvar patrocinador"}
          </button>
          {editingSponsor ? (
            <button className="button ghost" type="button" onClick={() => setEditingSponsor(null)}>
              <X size={17} />
              Cancelar edição
            </button>
          ) : null}
        </div>
      </form>

      <div className="sponsor-admin-grid">
        {sponsors.map((sponsor) => (
          <article className={sponsor.active ? "sponsor-admin-card" : "sponsor-admin-card inactive"} key={sponsor.id}>
            <div className="sponsor-admin-logo">
              {sponsor.logo_url ? <img src={sponsor.logo_url} alt={sponsor.name} /> : <span>Sem logo</span>}
            </div>
            <div>
              <span className="sponsor-admin-meta">{sponsor.category}</span>
              <h2>{sponsor.name}</h2>
              {sponsor.description ? <p>{sponsor.description}</p> : null}
              <small>{sponsor.active ? "Ativo no site" : "Oculto no site"}</small>
            </div>
            <div className="sponsor-admin-actions">
              <button type="button" onClick={() => setEditingSponsor(sponsor)} aria-label={`Editar ${sponsor.name}`}>
                <PencilLine size={16} />
              </button>
              <button type="button" onClick={() => removeSponsor(sponsor.id)} aria-label={`Excluir ${sponsor.name}`}>
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
