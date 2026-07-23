require("dotenv").config({ path: process.env.WHATSAPP_BOT_ENV || ".env.local" });
const express = require("express");
const QRCode = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");

const PORT = Number(process.env.PORT || 3001);
const BOT_TOKEN = process.env.WHATSAPP_BOT_TOKEN;
const WEBSITE_URL = (process.env.WEBSITE_URL || "https://www.hadiumreyegidelim.com").replace(/\/$/, "");
const ADMIN_URL = (process.env.ADMIN_URL || "https://admin.hadiumreyegidelim.com").replace(/\/$/, "");
const SESSION_PATH = process.env.WHATSAPP_SESSION_PATH || "/data/.wwebjs_auth";

if (!BOT_TOKEN) throw new Error("WHATSAPP_BOT_TOKEN tanımlı değil");

const state = {
  status: "BAŞLATILIYOR",
  qr: null,
  phone: null,
  error: null,
  lastInboundAt: null,
  lastInboundFrom: null,
  lastEventAt: new Date().toISOString(),
};
const update = (patch) => Object.assign(state, patch, { lastEventAt: new Date().toISOString() });
const handledMessages = new Map();
const app = express();
app.use(express.json());

function authorized(req, res, next) {
  if (req.headers.authorization !== `Bearer ${BOT_TOKEN}`) return res.status(401).json({ error: "Yetkisiz" });
  next();
}

app.get("/health", (_req, res) => res.json({ ok: true, status: state.status }));
app.get("/status", authorized, (_req, res) => res.json(state));
app.post("/reset", authorized, async (_req, res) => {
  update({ status: "SIFIRLANIYOR", qr: null, error: null });
  try { await client.logout(); } catch {}
  res.json({ success: true });
});

async function syncStatus() {
  await Promise.allSettled([...new Set([WEBSITE_URL, ADMIN_URL])].map(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/whatsapp/worker/status`, {
      method: "POST",
      headers: { Authorization: `Bearer ${BOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (!response.ok) throw new Error(`${baseUrl} durum yanıtı ${response.status}`);
  })).then((results) => results.forEach((result) => {
    if (result.status === "rejected") console.error("[status]", result.reason);
  }));
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: SESSION_PATH, clientId: "hadi-umreye" }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"],
  },
});

client.on("qr", async (qr) => { update({ status: "QR_BEKLİYOR", qr: await QRCode.toDataURL(qr), phone: null, error: null }); await syncStatus(); });
client.on("authenticated", async () => { update({ status: "DOĞRULANDI", qr: null, error: null }); await syncStatus(); });
client.on("ready", async () => { update({ status: "BAĞLI", qr: null, phone: client.info?.wid?.user || null, error: null }); await syncStatus(); });
client.on("auth_failure", async (error) => { update({ status: "DOĞRULAMA_HATASI", qr: null, error: String(error) }); await syncStatus(); });
client.on("disconnected", async (reason) => { update({ status: "BAĞLANTI_KESİLDİ", qr: null, phone: null, error: String(reason) }); await syncStatus(); });

async function reconcileConnection() {
  try {
    const connectionState = await client.getState();
    if (connectionState === "CONNECTED" && state.status !== "BAĞLI") {
      update({ status: "BAĞLI", qr: null, phone: client.info?.wid?.user || state.phone, error: null });
      await syncStatus();
    }
  } catch {}
}

async function handleIncomingMessage(message, eventName) {
  if (message.fromMe || message.isStatus || message.from === "status@broadcast" || message.from.endsWith("@g.us") || !message.body?.trim()) return;
  const externalId = message.id?._serialized || message.id?.id || `${message.from}-${message.timestamp}`;
  if (handledMessages.has(externalId)) return;
  handledMessages.set(externalId, Date.now());
  for (const [id, handledAt] of handledMessages) {
    if (Date.now() - handledAt > 10 * 60_000) handledMessages.delete(id);
  }
  update({ lastInboundAt: new Date().toISOString(), lastInboundFrom: message.from, error: null });
  console.log(`[${eventName}] Gelen mesaj: ${message.from} (${externalId})`);
  try {
    const contact = await message.getContact();
    const customerPhone = contact.number || message.from.replace(/@(c|lid)\.us$/, "");
    const response = await fetch(`${ADMIN_URL}/api/whatsapp/worker/message`, {
      method: "POST",
      headers: { Authorization: `Bearer ${BOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: externalId,
        phone: customerPhone,
        name: contact.pushname || contact.name || null,
        text: message.body.trim(),
      }),
    });
    if (!response.ok) throw new Error(`Site yanıtı ${response.status}: ${(await response.text()).slice(0, 300)}`);
    const result = await response.json();
    if (result.reply) {
      await message.reply(result.reply);
      console.log(`[${eventName}] Yanıt gönderildi: ${customerPhone}`);
    } else {
      console.log(`[${eventName}] AI yanıt üretmedi: ${result.reason || "neden belirtilmedi"}`);
    }
  } catch (error) {
    console.error("[message]", error);
    update({ error: String(error) });
  }
}

// Bazı güncel WhatsApp Web sürümlerinde yalnızca message_create olayı
// güvenilir biçimde tetiklenebiliyor. Tekilleştirme iki olayın aynı mesaja
// iki defa yanıt vermesini engeller.
client.on("message", (message) => handleIncomingMessage(message, "message"));
client.on("message_create", (message) => handleIncomingMessage(message, "message_create"));

client.initialize().catch((error) => update({ status: "HATA", error: String(error) }));
setInterval(syncStatus, 30_000);
setInterval(reconcileConnection, 10_000);
syncStatus();
app.listen(PORT, () => console.log(`WhatsApp QR bot ${PORT} portunda çalışıyor`));
