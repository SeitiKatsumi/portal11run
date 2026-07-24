import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

type NotificationInput = {
  recordType: string;
  recordId: string;
  recipient: string;
  subject: string;
  html: string;
};

export async function sendSupportNotification(db: DatabaseSync, input: NotificationInput) {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO support_notifications
      (id, record_type, record_id, recipient, subject, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'Pendente', ?)`
  ).run(id, input.recordType, input.recordId, input.recipient, input.subject, createdAt);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL;
  if (!apiKey || !from || !input.recipient) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, to: [input.recipient], subject: input.subject, html: input.html })
    });
    const result = (await response.json()) as { id?: string; message?: string };
    if (!response.ok) throw new Error(result.message || "Falha no provedor de e-mail.");
    db.prepare(
      "UPDATE support_notifications SET status = 'Enviado', provider_message_id = ?, sent_at = ? WHERE id = ?"
    ).run(result.id ?? null, new Date().toISOString(), id);
  } catch (error) {
    db.prepare("UPDATE support_notifications SET status = 'Falhou', error_message = ? WHERE id = ?").run(
      error instanceof Error ? error.message.slice(0, 500) : "Falha desconhecida",
      id
    );
  }
}
