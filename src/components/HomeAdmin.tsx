"use client";

import { Eye, EyeOff, Home, Plus, Save, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { HomeProject, HomeSettings } from "@/lib/home";
import styles from "@/app/admin/home/home-admin.module.css";

const iconOptions = ["BarChart3", "Flag", "Globe2", "GraduationCap", "Medal", "Route", "ShoppingBag", "Sparkles", "Trophy", "Users"];

export function HomeAdmin({
  initialSettings,
  initialProjects
}: {
  initialSettings: HomeSettings;
  initialProjects: HomeProject[];
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [projects, setProjects] = useState(initialProjects);
  const [message, setMessage] = useState("");

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Salvando configurações...");
    const form = new FormData(event.currentTarget);
    const payload = {
      hero_media_type: form.get("hero_media_type"),
      hero_image: form.get("hero_image"),
      hero_video: form.get("hero_video"),
      hero_kicker: form.get("hero_kicker"),
      hero_title: form.get("hero_title"),
      hero_subtitle: form.get("hero_subtitle"),
      content_alignment: form.get("content_alignment"),
      overlay_strength: Number(form.get("overlay_strength")),
      header_opacity: Number(form.get("header_opacity")),
      header_blur: Number(form.get("header_blur"))
    };
    const response = await fetch("/api/admin/home", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "settings", settings: payload })
    });
    const result = await response.json();
    if (response.ok) {
      setSettings(result.settings);
      setMessage("Home atualizada com sucesso.");
    } else {
      setMessage(result.error || "Não foi possível salvar.");
    }
  }

  async function saveProject(event: FormEvent<HTMLFormElement>, current?: HomeProject) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/home", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "project",
        project: {
          id: current?.id,
          name: form.get("name"),
          description: form.get("description"),
          icon: form.get("icon"),
          href: form.get("href"),
          sort_order: Number(form.get("sort_order")),
          active: form.get("active") ? 1 : 0
        }
      })
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Não foi possível salvar o projeto.");
      return;
    }
    setProjects((items) => {
      const exists = items.some((item) => item.id === result.project.id);
      const next = exists
        ? items.map((item) => item.id === result.project.id ? result.project : item)
        : [...items, result.project];
      return next.sort((a, b) => a.sort_order - b.sort_order);
    });
    if (!current) event.currentTarget.reset();
    setMessage("Card de projeto salvo.");
  }

  async function hideProject(id: string) {
    await fetch(`/api/admin/home?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setProjects((items) => items.map((item) => item.id === id ? { ...item, active: 0 } : item));
  }

  return (
    <section className={`admin-panel ${styles.adminHome}`}>
      <header className={styles.heading}>
        <div><span className="eyebrow">Página inicial</span><h1>Hero e projetos</h1></div>
        <a href="/" target="_blank" rel="noreferrer"><Home size={17} /> Ver home</a>
      </header>

      {message ? <p className={styles.message}>{message}</p> : null}

      <form className={styles.settings} onSubmit={saveSettings}>
        <div className={styles.sectionTitle}><span className="eyebrow">Mídia e conteúdo</span><h2>Hero principal</h2></div>
        <div className={styles.formGrid}>
          <label><span>Tipo de mídia</span><select name="hero_media_type" defaultValue={settings.hero_media_type}><option value="image">Imagem</option><option value="video">Vídeo</option></select></label>
          <label><span>Alinhamento</span><select name="content_alignment" defaultValue={settings.content_alignment}><option value="center">Centralizado</option><option value="left">À esquerda</option></select></label>
          <label className={styles.full}><span>Imagem / poster</span><input name="hero_image" defaultValue={settings.hero_image} required /></label>
          <label className={styles.full}><span>Vídeo futuro (MP4 ou WebM)</span><input name="hero_video" defaultValue={settings.hero_video ?? ""} placeholder="/assets/home/hero.mp4" /></label>
          <label className={styles.full}><span>Chamada superior</span><input name="hero_kicker" defaultValue={settings.hero_kicker ?? ""} /></label>
          <label className={styles.full}><span>Título</span><input name="hero_title" defaultValue={settings.hero_title ?? ""} /></label>
          <label className={styles.full}><span>Subtítulo</span><input name="hero_subtitle" defaultValue={settings.hero_subtitle ?? ""} /></label>
          <label><span>Overlay · {settings.overlay_strength}%</span><input name="overlay_strength" type="range" min="0" max="80" defaultValue={settings.overlay_strength} /></label>
          <label><span>Fundo do header · {settings.header_opacity}%</span><input name="header_opacity" type="range" min="30" max="100" defaultValue={settings.header_opacity} /></label>
          <label><span>Blur do header · {settings.header_blur}px</span><input name="header_blur" type="range" min="0" max="30" defaultValue={settings.header_blur} /></label>
        </div>
        <button className={styles.primary} type="submit"><Save size={17} /> Salvar hero</button>
      </form>

      <div className={styles.projects}>
        <div className={styles.sectionTitle}><span className="eyebrow">Navegação visual</span><h2>Cards dos projetos</h2></div>
        <div className={styles.projectList}>
          {projects.map((project) => (
            <form className={styles.projectForm} onSubmit={(event) => saveProject(event, project)} key={project.id}>
              <label><span>Nome</span><input name="name" defaultValue={project.name} required /></label>
              <label><span>Link</span><input name="href" defaultValue={project.href} required /></label>
              <label className={styles.wide}><span>Descrição</span><input name="description" defaultValue={project.description} /></label>
              <label><span>Ícone</span><select name="icon" defaultValue={project.icon}>{iconOptions.map((icon) => <option key={icon}>{icon}</option>)}</select></label>
              <label><span>Ordem</span><input name="sort_order" type="number" defaultValue={project.sort_order} /></label>
              <label className={styles.active}><input name="active" type="checkbox" defaultChecked={project.active === 1} />{project.active ? <Eye size={16} /> : <EyeOff size={16} />} Ativo</label>
              <div className={styles.actions}><button type="submit"><Save size={16} /> Salvar</button><button type="button" onClick={() => hideProject(project.id)}><Trash2 size={16} /></button></div>
            </form>
          ))}
        </div>

        <form className={`${styles.projectForm} ${styles.newProject}`} onSubmit={(event) => saveProject(event)}>
          <label><span>Nome</span><input name="name" required /></label>
          <label><span>Link</span><input name="href" required placeholder="/novo-projeto" /></label>
          <label className={styles.wide}><span>Descrição</span><input name="description" /></label>
          <label><span>Ícone</span><select name="icon">{iconOptions.map((icon) => <option key={icon}>{icon}</option>)}</select></label>
          <label><span>Ordem</span><input name="sort_order" type="number" defaultValue="70" /></label>
          <label className={styles.active}><input name="active" type="checkbox" defaultChecked /><Eye size={16} /> Ativo</label>
          <button className={styles.primary} type="submit"><Plus size={17} /> Adicionar projeto</button>
        </form>
      </div>
    </section>
  );
}
