import { getWhatsAppAIConfig } from "@/lib/whatsapp-ai";

/**
 * Yeni talep gelince yöneticiye WhatsApp bildirimi (WhatsApp AI → Yönetici telefonu).
 * Sitenin WhatsApp bot servisi üzerinden gider; servis ya da telefon tanımlı değilse sessizce atlanır.
 * Talep her durumda admin → İletişim ve CRM'de görünür; bildirim yalnızca ek haber verme.
 */
export async function notifyNewLead(lead: { name: string; phone: string; package?: string | null; message?: string | null }) {
  const botUrl = process.env.WHATSAPP_BOT_URL;
  const botToken = process.env.WHATSAPP_BOT_TOKEN;
  if (!botUrl || !botToken) return;

  const config = await getWhatsAppAIConfig().catch(() => null);
  const managerPhone = config?.managerPhone?.replace(/\D/g, "");
  if (!managerPhone) return;

  const lines = [
    `Yeni talep: ${lead.package || "İletişim formu"}`,
    `Ad: ${lead.name}`,
    `Telefon: ${lead.phone}`,
    lead.message ? `\n${lead.message.slice(0, 800)}` : "",
    "\nAdmin → WhatsApp & İletişim",
  ].filter(Boolean);

  await fetch(`${botUrl}/send-message`, {
    method: "POST",
    headers: { Authorization: `Bearer ${botToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ phone: managerPhone, message: lines.join("\n") }),
    signal: AbortSignal.timeout(8000),
  })
    .then((r) => { if (!r.ok) console.warn("[lead-notify] bot yanıtı:", r.status); })
    .catch((e) => console.warn("[lead-notify] bildirim gönderilemedi:", e?.message));
}
