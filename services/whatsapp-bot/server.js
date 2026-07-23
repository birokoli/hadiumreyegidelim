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

const state = { status: "BAŞLATILIYOR", qr: null, phone: null, error: null, lastEventAt: new Date().toISOString() };
const update = (patch) => Object.assign(state, patch, { lastEventAt: new Date().toISOString() });
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

client.on("message", async (message) => {
  if (message.fromMe || message.isStatus || message.from === "status@broadcast" || message.from.endsWith("@g.us") || !message.body?.trim()) return;
  try {
    const contact = await message.getContact();
    const externalId = message.id?._serialized || message.id?.id || `${message.from}-${message.timestamp}`;
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
    if (result.reply) await message.reply(result.reply);
  } catch (error) {
    console.error("[message]", error);
    update({ error: String(error) });
  }
});

client.initialize().catch((error) => update({ status: "HATA", error: String(error) }));
setInterval(syncStatus, 30_000);
setInterval(reconcileConnection, 10_000);
syncStatus();
app.listen(PORT, () => console.log(`WhatsApp QR bot ${PORT} portunda çalışıyor`));
