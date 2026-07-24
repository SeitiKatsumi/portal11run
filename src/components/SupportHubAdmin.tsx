"use client";

import { Download, FileText, HeartHandshake, Save, Search, Settings, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
  donationStatuses,
  sponsorshipStatuses,
  volunteerStatuses
} from "@/lib/support-hub-options";
import type {
  DonationRecord,
  SponsorshipLead,
  SupportHubSettings,
  SupportRecordType,
  VolunteerRecord
} from "@/lib/support-hub";
import styles from "@/app/admin/apoios/support-admin.module.css";

type Records = {
  sponsorships: SponsorshipLead[];
  donations: DonationRecord[];
  volunteers: VolunteerRecord[];
};

type Dashboard = {
  totalInterested: number;
  newThisMonth: number;
  negotiating: number;
  activeSponsors: number;
  estimatedNegotiatingCents: number;
  confirmedDonationCents: number;
  volunteerCount: number;
  averageDonationCents: number;
};

type Tab = SupportRecordType;
type AnyRecord = SponsorshipLead | DonationRecord | VolunteerRecord;

const tabConfig = {
  sponsorship: { label: "Patrocínios", source: "sponsorships", statuses: sponsorshipStatuses, icon: HeartHandshake },
  donation: { label: "Doações", source: "donations", statuses: donationStatuses, icon: FileText },
  volunteer: { label: "Voluntários", source: "volunteers", statuses: volunteerStatuses, icon: Users }
} as const;

function currency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mainName(record: AnyRecord) {
  if ("donor_name" in record) return record.donor_name;
  return record.name;
}

function searchable(record: AnyRecord) {
  return Object.values(record).join(" ").toLocaleLowerCase("pt-BR");
}

function secondary(record: AnyRecord) {
  if ("company" in record && record.company) return record.company;
  if ("project" in record) return record.project;
  if ("profession" in record) return record.profession;
  return record.email;
}

function recordFile(record: AnyRecord) {
  if ("receipt_file_id" in record) return record.receipt_file_id;
  if ("attachment_file_id" in record) return record.attachment_file_id;
  return null;
}

export function SupportHubAdmin({
  initialRecords,
  dashboard,
  initialSettings
}: {
  initialRecords: Records;
  dashboard: Dashboard;
  initialSettings: SupportHubSettings;
}) {
  const [records, setRecords] = useState(initialRecords);
  const [tab, setTab] = useState<Tab>("sponsorship");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<AnyRecord | null>(null);
  const [settings, setSettings] = useState(initialSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const config = tabConfig[tab];
  const rows = records[config.source] as AnyRecord[];
  const filtered = useMemo(
    () => rows.filter((record) => (!statusFilter || record.status === statusFilter) && (!query || searchable(record).includes(query.toLocaleLowerCase("pt-BR")))),
    [rows, statusFilter, query]
  );

  async function update(record: AnyRecord, payload: { status?: string; owner?: string; adminNotes?: string; note?: string }) {
    const response = await fetch("/api/admin/support-hub", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: tab, id: record.id, ...payload })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) return setMessage(result.error || "Falha ao atualizar.");
    setRecords((current) => ({
      ...current,
      [config.source]: (current[config.source] as AnyRecord[]).map((item) => item.id === record.id ? result.record : item)
    }));
    setSelected(result.record);
    setMessage("Registro atualizado.");
  }

  async function saveSettings() {
    const response = await fetch("/api/admin/support-hub/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    const result = await response.json();
    setMessage(result.ok ? "Configurações salvas." : result.error || "Falha ao salvar.");
  }

  function switchTab(next: Tab) {
    setTab(next);
    setStatusFilter("");
    setQuery("");
    setSelected(null);
  }

  return (
    <section className={styles.admin}>
      <header className={styles.hero}>
        <div><span>Patrocínios e apoios</span><h1>Relacionamentos que movem o projeto.</h1><p>Leads, doações e voluntários em um fluxo administrativo único.</p></div>
        <button type="button" onClick={() => setSettingsOpen((value) => !value)}><Settings size={17} /> Configurações</button>
      </header>

      <div className={styles.kpis}>
        <article><span>Interessados</span><strong>{dashboard.totalInterested}</strong></article>
        <article><span>Novos no mês</span><strong>{dashboard.newThisMonth}</strong></article>
        <article><span>Em negociação</span><strong>{dashboard.negotiating}</strong></article>
        <article><span>Apoios ativos</span><strong>{dashboard.activeSponsors}</strong></article>
        <article><span>Doações confirmadas</span><strong>{currency(dashboard.confirmedDonationCents)}</strong></article>
        <article><span>Voluntários</span><strong>{dashboard.volunteerCount}</strong></article>
      </div>

      {settingsOpen ? (
        <section className={styles.settings}>
          <div><span>Configuração administrável</span><h2>PIX, projetos e notificações</h2></div>
          <div className={styles.settingsGrid}>
            <label>Chave PIX<input value={settings.pixKey} onChange={(event) => setSettings({ ...settings, pixKey: event.target.value })} /></label>
            <label>Nome do recebedor<input value={settings.pixMerchantName} onChange={(event) => setSettings({ ...settings, pixMerchantName: event.target.value })} /></label>
            <label>Cidade do recebedor<input value={settings.pixMerchantCity} onChange={(event) => setSettings({ ...settings, pixMerchantCity: event.target.value })} /></label>
            <label>E-mail de notificação<input type="email" value={settings.notificationEmail} onChange={(event) => setSettings({ ...settings, notificationEmail: event.target.value })} /></label>
            <label className={styles.wide}>Valores sugeridos em reais<textarea value={settings.donationValues.map((value) => value / 100).join(", ")} onChange={(event) => setSettings({ ...settings, donationValues: event.target.value.split(",").map((value) => Math.round(Number(value.trim()) * 100)).filter((value) => value >= 100) })} /></label>
            <label className={styles.wide}>Projetos de destino (um por linha)<textarea value={settings.donationProjects.join("\n")} onChange={(event) => setSettings({ ...settings, donationProjects: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean) })} /></label>
          </div>
          <button type="button" onClick={saveSettings}><Save size={16} /> Salvar configurações</button>
        </section>
      ) : null}

      <div className={styles.tabs} role="tablist">
        {(Object.keys(tabConfig) as Tab[]).map((key) => {
          const Icon = tabConfig[key].icon;
          return <button role="tab" aria-selected={tab === key} className={tab === key ? styles.active : ""} onClick={() => switchTab(key)} key={key}><Icon size={17} />{tabConfig[key].label}<span>{records[tabConfig[key].source].length}</span></button>;
        })}
      </div>

      <div className={styles.toolbar}>
        <label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nome, empresa, cidade ou contato" /></label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Todos os status</option>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select>
        <a href={`/api/admin/support-hub/export?type=${tab}`}><Download size={16} /> Exportar CSV</a>
      </div>

      {message ? <p className={styles.message}>{message}</p> : null}

      <div className={styles.workspace}>
        <div className={styles.list}>
          {filtered.length ? filtered.map((record) => (
            <button className={selected?.id === record.id ? styles.selected : ""} onClick={() => setSelected(record)} key={record.id}>
              <span>{record.protocol}<time>{new Date(record.created_at).toLocaleDateString("pt-BR")}</time></span>
              <strong>{mainName(record)}</strong>
              <small>{secondary(record)}</small>
              <em>{record.status}</em>
            </button>
          )) : <p>Nenhum registro encontrado.</p>}
        </div>

        <div className={styles.detail}>
          {selected ? (
            <>
              <header><span>{selected.protocol}</span><h2>{mainName(selected)}</h2><p>{selected.email} · {selected.city}/{selected.state}</p></header>
              <dl>
                {Object.entries(selected).filter(([key, value]) => value !== null && !["id", "admin_notes", "pix_payload", "deleted_at"].includes(key)).map(([key, value]) => <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{String(value)}</dd></div>)}
              </dl>
              {recordFile(selected) ? <a className={styles.file} href={`/api/admin/support-hub/files/${recordFile(selected)}`} target="_blank"><FileText size={16} /> Abrir anexo privado</a> : null}
              <div className={styles.edit}>
                <label>Status<select value={selected.status} onChange={(event) => update(selected, { status: event.target.value })}>{config.statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
                <label>Responsável interno<input defaultValue={selected.owner ?? ""} onBlur={(event) => update(selected, { owner: event.target.value })} /></label>
                <label>Observações<textarea defaultValue={selected.admin_notes ?? ""} onBlur={(event) => update(selected, { adminNotes: event.target.value })} rows={4} /></label>
                <label>Nova nota de histórico<textarea id="support-new-note" rows={3} /></label>
                <button type="button" onClick={() => {
                  const element = document.getElementById("support-new-note") as HTMLTextAreaElement | null;
                  update(selected, { note: element?.value || "" });
                  if (element) element.value = "";
                }}><Save size={16} /> Registrar nota</button>
              </div>
            </>
          ) : <div className={styles.empty}><HeartHandshake /><strong>Selecione um registro</strong><span>Os dados e ações administrativas aparecerão aqui.</span></div>}
        </div>
      </div>
    </section>
  );
}
