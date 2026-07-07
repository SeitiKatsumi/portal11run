"use client";

import { useMemo, useState } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { supportStatuses } from "@/lib/support-options";
import type { SupportInterestRecord } from "@/lib/support";

type Props = {
  initialInterests: SupportInterestRecord[];
};

function parseList(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function SupportAdminBoard({ initialInterests }: Props) {
  const [interests, setInterests] = useState(initialInterests);

  const grouped = useMemo(
    () =>
      supportStatuses.map((status) => ({
        status,
        items: interests.filter((interest) => interest.status === status)
      })),
    [interests]
  );

  async function updateStatus(id: string, status: string) {
    const response = await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    const result = (await response.json()) as { ok?: boolean; interest?: SupportInterestRecord };
    if (result.ok && result.interest) {
      setInterests((current) => current.map((item) => (item.id === id ? result.interest! : item)));
    }
  }

  return (
    <div className="pipeline-board support-board">
      {grouped.map((column) => (
        <section className="pipeline-column" key={column.status}>
          <div className="pipeline-column-head">
            <strong>{column.status}</strong>
            <span>{column.items.length}</span>
          </div>

          {column.items.length === 0 ? <p className="empty-column">Sem interessados nesta etapa.</p> : null}

          {column.items.map((interest) => {
            const interestTypes = parseList(interest.interest_types_json);
            const projects = parseList(interest.sponsored_projects_json);

            return (
              <article className="admin-card support-card" key={interest.id}>
                <div className="admin-card-head">
                  <span>{interestTypes.join(" + ")}</span>
                  <span>{formatDate(interest.created_at)}</span>
                </div>
                <h2>{interest.name}</h2>
                <p className="support-contact">
                  <Phone size={14} /> {interest.whatsapp}
                </p>
                <p className="support-contact">
                  <Mail size={14} /> {interest.email}
                </p>

                {interest.interest_plan ? (
                  <div className="support-plan-admin">
                    <span>Plano de interesse</span>
                    <strong>{interest.interest_plan}</strong>
                  </div>
                ) : null}

                {projects.length > 0 ? (
                  <div className="support-tags">
                    {projects.map((project) => (
                      <span key={project}>{project}</span>
                    ))}
                  </div>
                ) : null}

                {interest.message ? (
                  <p className="support-message-preview">
                    <MessageCircle size={14} />
                    {interest.message}
                  </p>
                ) : null}

                <label className="admin-status">
                  <span>Etapa</span>
                  <select value={interest.status} onChange={(event) => updateStatus(interest.id, event.target.value)}>
                    {supportStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
