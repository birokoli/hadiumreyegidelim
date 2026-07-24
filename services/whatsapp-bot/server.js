require("dotenv").config({ path: process.env.WHATSAPP_BOT_ENV || ".env.local" });
const express = require("express");
const QRCode = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");

const PORT = Number(process.env.PORT || 3001);
const BOT_TOKEN = process.env.WHATSAPP_BOT_TOKEN;
const WEBSITE_URL = (process.env.WEBSITE_URL || "https://www.hadiumreyegidelim.com").replace(/\/$/, "");
const ADMIN_URL = (process.env.ADMIN_URL || "https://admin.hadiumreyegidelim.com").replace(/\/$/, "");
const SESSION_PATH = process.env.WHATSAPP_SESSION_PATH || "/data/.wwebjs_auth";

function normalizeWhatsAppPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = `90${digits.slice(1)}`;
  if (digits.startsWith("5") && digits.length === 10) digits = `90${digits}`;
  return digits;
}

let managerPhone = normalizeWhatsAppPhone(process.env.WHATSAPP_MANAGER_PHONE);

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
const recentInboundFingerprints = new Map();
const pendingManagerQuestions = new Map();
const app = express();
app.use(express.json());

function authorized(req, res, next) {
  if (req.headers.authorization !== `Bearer ${BOT_TOKEN}`) return res.status(401).json({ error: "Yetkisiz" });
  next();
}

app.get("/health", async (_req, res) => {
  let connectionState = null;
  try { connectionState = await client.getState(); } catch {}
  const ok = state.status === "BAĞLI" && connectionState === "CONNECTED";
  res.status(ok ? 200 : 503).json({ ok, status: state.status, connectionState });
});
app.get("/status", authorized, (_req, res) => res.json(state));
app.get("/diagnostics", authorized, async (_req, res) => {
  try {
    const connectionState = await client.getState();
    let pageState = null;
    try {
      pageState = await client.pupPage.evaluate(() => ({
        title: document.title,
        href: location.href,
        webVersion: window.Debug?.VERSION || window.Store?.WebFeatures?.WEB_VERSION || null,
        hasStore: Boolean(window.Store),
        chatCollectionType: typeof window.Store?.Chat?.getModelsArray,
        chatModelCount: Number(window.Store?.Chat?.models?.length || 0),
        messageModelCount: Number(window.Store?.Msg?.models?.length || 0),
        appState: window.Store?.AppState?.state || null,
      }));
    } catch (error) {
      pageState = { error: String(error) };
    }
    let recentChats = [];
    let chatError = null;
    try {
      const chats = await client.getChats();
      recentChats = chats
        .filter((chat) => !chat.isGroup)
        .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0))
        .slice(0, 10)
        .map((chat) => ({
          idSuffix: String(chat.id?._serialized || "").slice(-10),
          timestamp: chat.timestamp || null,
          unreadCount: chat.unreadCount || 0,
          lastMessageId: chat.lastMessage?.id?._serialized || null,
          lastMessageFromMe: chat.lastMessage?.fromMe ?? null,
          lastMessageTimestamp: chat.lastMessage?.timestamp || null,
        }));
    } catch (error) {
      chatError = String(error);
    }
    res.json({
      processStartedAt: processStartedAt.toISOString(),
      connectionState,
      status: state,
      account: client.info?.wid?.user || null,
      pageState,
      eventListeners: {
        message: client.listenerCount("message"),
        messageCreate: client.listenerCount("message_create"),
        messageCiphertext: client.listenerCount("message_ciphertext"),
        unreadCount: client.listenerCount("unread_count"),
      },
      chatError,
      recentChats,
    });
  } catch (error) {
    res.status(500).json({ error: String(error), status: state });
  }
});
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

const processStartedAt = new Date();
let initializationCompleted = false;
let consecutivePollFailures = 0;
client.on("qr", async (qr) => { initializationCompleted = true; update({ status: "QR_BEKLİYOR", qr: await QRCode.toDataURL(qr), phone: null, error: null }); await syncStatus(); });
client.on("authenticated", async () => { initializationCompleted = true; update({ status: "DOĞRULANDI", qr: null, error: null }); await syncStatus(); });
client.on("ready", async () => { initializationCompleted = true; update({ status: "BAĞLI", qr: null, phone: client.info?.wid?.user || null, error: null }); await syncStatus(); });
client.on("auth_failure", async (error) => { update({ status: "DOĞRULAMA_HATASI", qr: null, error: String(error) }); await syncStatus(); });
client.on("disconnected", async (reason) => { update({ status: "BAĞLANTI_KESİLDİ", qr: null, phone: null, error: String(reason) }); await syncStatus(); });
client.on("change_state", (nextState) => console.log(`[state] WhatsApp durumu: ${nextState}`));
client.on("loading_screen", (percent, message) => console.log(`[loading] %${percent} ${message}`));

async function reconcileConnection() {
  try {
    const connectionState = await client.getState();
    if (connectionState === "CONNECTED" && state.status !== "BAĞLI") {
      update({ status: "BAĞLI", qr: null, phone: client.info?.wid?.user || state.phone, error: null });
      await syncStatus();
    }
  } catch {}
}

async function resolveManagerChatId(phone) {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!/^90\d{10}$/.test(normalized)) {
    throw new Error(`Yönetici numarası geçersiz: ${normalized || "boş"}. 905xxxxxxxxx biçiminde kaydedin.`);
  }
  const connectedPhone = normalizeWhatsAppPhone(client.info?.wid?.user);
  if (connectedPhone && connectedPhone === normalized) {
    throw new Error("Yönetici numarası botun bağlı olduğu WhatsApp hattıyla aynı olamaz. Farklı bir WhatsApp numarası kullanın.");
  }
  const numberId = await client.getNumberId(normalized);
  if (!numberId) {
    throw new Error(`Yönetici numarası WhatsApp'ta bulunamadı: +${normalized}`);
  }
  return numberId._serialized || `${normalized}@c.us`;
}

const chatQueues = new Map();

async function processIncomingMessage(message, eventName) {
  if (message.fromMe) {
    if (message.isStatus || message.from === "status@broadcast" || message.to?.endsWith("@g.us") || !message.body?.trim()) return;
    const recipientPhone = message.to?.replace(/@(c|lid)\.us$/, "");
    if (recipientPhone && !recipientPhone.includes("@")) {
      fetch(`${ADMIN_URL}/api/whatsapp/worker/human-message`, {
        method: "POST",
        headers: { Authorization: `Bearer ${BOT_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ phone: recipientPhone, text: message.body.trim() }),
      }).catch((err) => console.error("[human-message] Otomatik öğrenme hatası:", err));
    }
    return;
  }
  if (message.isStatus || message.from === "status@broadcast" || message.from.endsWith("@g.us") || !message.body?.trim()) return;
  const externalId = message.id?._serialized || message.id?.id || `${message.from}-${message.timestamp}`;
  if (handledMessages.has(externalId)) return;
  const normalizedBody = message.body.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");
  const fingerprint = `${message.from}:${normalizedBody}`;
  const previousFingerprintAt = recentInboundFingerprints.get(fingerprint);
  if (previousFingerprintAt && Date.now() - previousFingerprintAt < 90_000) {
    console.log(`[${eventName}] Tekrarlanan içerik atlandı: ${message.from}`);
    return;
  }
  handledMessages.set(externalId, Date.now());
  recentInboundFingerprints.set(fingerprint, Date.now());
  for (const [id, handledAt] of handledMessages) {
    if (Date.now() - handledAt > 10 * 60_000) handledMessages.delete(id);
  }
  for (const [key, handledAt] of recentInboundFingerprints) {
    if (Date.now() - handledAt > 10 * 60_000) recentInboundFingerprints.delete(key);
  }
  update({ lastInboundAt: new Date().toISOString(), lastInboundFrom: message.from, error: null });
  console.log(`[${eventName}] Gelen mesaj: ${message.from} (${externalId})`);
  try {
    const contact = await message.getContact();
    const customerPhone = contact.number || message.from.replace(/@(c|lid)\.us$/, "");
    const normalizedCustomerPhone = normalizeWhatsAppPhone(customerPhone);
    const managerAnswer = message.body.trim().match(/^#YANIT\s+([A-Z0-9]{6})\s+([\s\S]+)$/i);
    if (managerPhone && normalizedCustomerPhone === managerPhone && managerAnswer) {
      const reference = managerAnswer[1].toUpperCase();
      const answer = managerAnswer[2].trim();
      const pending = pendingManagerQuestions.get(reference);
      if (!pending) {
        await message.reply(`Bu referans bulunamadı veya süresi doldu: ${reference}`);
        return;
      }
      await client.sendMessage(pending.customerChatId, answer);
      await fetch(`${ADMIN_URL}/api/whatsapp/worker/manager-answer`, {
        method: "POST",
        headers: { Authorization: `Bearer ${BOT_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: pending.customerPhone,
          customerMessage: pending.customerMessage,
          answer,
        }),
      });
      pendingManagerQuestions.delete(reference);
      await message.reply(`Yanıt müşteriye gönderildi ve AI eğitimine eklendi. Referans: ${reference}`);
      console.log(`[manager] ${reference} yanıtı müşteriye gönderildi`);
      return;
    }
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
    if (result.askManager && result.managerPhone && result.managerQuestion) {
      managerPhone = normalizeWhatsAppPhone(result.managerPhone);
      const reference = Math.random().toString(36).slice(2, 8).toUpperCase();
      pendingManagerQuestions.set(reference, {
        customerChatId: message.from,
        customerPhone: normalizedCustomerPhone,
        customerMessage: message.body.trim(),
        createdAt: Date.now(),
      });
      for (const [code, pending] of pendingManagerQuestions) {
        if (Date.now() - pending.createdAt > 24 * 60 * 60_000) pendingManagerQuestions.delete(code);
      }
      try {
        const managerChatId = await resolveManagerChatId(managerPhone);
        await client.sendMessage(managerChatId, `${result.managerQuestion}\n\nYanıtlamak için şu biçimde yazın:\n#YANIT ${reference} Müşteriye gönderilecek cevabınız`);
        console.log(`[manager] ${reference} için +${managerPhone} numaralı yöneticiye soru gönderildi`);
      } catch (error) {
        pendingManagerQuestions.delete(reference);
        console.error(`[manager] ${reference} teslim edilemedi:`, error);
        throw error;
      }
    }
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

function handleIncomingMessage(message, eventName) {
  const chatId = message.from || "unknown";
  const previous = chatQueues.get(chatId) || Promise.resolve();
  const current = previous
    .catch(() => {})
    .then(() => processIncomingMessage(message, eventName));
  chatQueues.set(chatId, current);
  current.finally(() => {
    if (chatQueues.get(chatId) === current) chatQueues.delete(chatId);
  });
  return current;
}

// Bazı güncel WhatsApp Web sürümlerinde yalnızca message_create olayı
// güvenilir biçimde tetiklenebiliyor. Tekilleştirme iki olayın aynı mesaja
// iki defa yanıt vermesini engeller.
client.on("message", (message) => handleIncomingMessage(message, "message"));
client.on("message_create", (message) => handleIncomingMessage(message, "message_create"));
client.on("message_ciphertext", (message) => {
  const externalId = message.id?._serialized;
  console.log(`[message_ciphertext] Mesaj alındı: ${externalId || "kimlik yok"}`);
  if (!externalId) return;
  setTimeout(async () => {
    try {
      const decryptedMessage = await client.getMessageById(externalId);
      if (decryptedMessage) await handleIncomingMessage(decryptedMessage, "message_ciphertext");
    } catch (error) {
      console.error("[message_ciphertext]", error);
    }
  }, 2_000);
});
client.on("message_ciphertext_failed", (message) => {
  console.error(`[message_ciphertext_failed] Mesaj çözülemedi: ${message.id?._serialized || "kimlik yok"}`);
});
client.on("unread_count", async (chat) => {
  try {
    // Güncel WhatsApp Web sürümünde fetchMessages/getChats bazı LID
    // sohbetlerinde takılabiliyor. Tetikleyiciyle gelen son mesajı önce
    // doğrudan işle; geçmiş liste yalnızca yedek olarak kullanılsın.
    if (chat.lastMessage && !chat.lastMessage.fromMe) {
      await handleIncomingMessage(chat.lastMessage, "unread_count_last");
    }
    const unreadCount = Math.min(Math.max(Number(chat.unreadCount || 1), 1), 10);
    console.log(`[unread_count] ${unreadCount} okunmamış mesaj`);
    const messages = await Promise.race([
      chat.fetchMessages({ limit: unreadCount }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("fetchMessages zaman aşımı")), 5_000)),
    ]);
    for (const message of messages.filter((item) => !item.fromMe)) {
      await handleIncomingMessage(message, "unread_count");
    }
  } catch (error) {
    console.error("[unread_count]", error);
  }
});

async function pollRecentInboundMessages() {
  if (state.status !== "BAĞLI" || !client.pupPage) return;
  try {
    const minimumTimestamp = Math.floor(processStartedAt.getTime() / 1000) - 10;
    const messageIds = await client.pupPage.evaluate((since) => {
      const chats = window.Store?.Chat?.getModelsArray?.() || [];
      const found = [];
      for (const chat of chats) {
        const chatId = String(chat.id?._serialized || "");
        if (chatId.endsWith("@g.us") || chatId === "status@broadcast") continue;
        const messages = chat.msgs?.getModelsArray?.() || [];
        for (const message of messages) {
          const id = message.id?._serialized;
          const timestamp = Number(message.t || message.timestamp || 0);
          if (id && !message.id?.fromMe && timestamp >= since && typeof message.body === "string" && message.body.trim()) {
            found.push({ id, timestamp });
          }
        }
      }
      return found.sort((a, b) => a.timestamp - b.timestamp).slice(-30).map((item) => item.id);
    }, minimumTimestamp);
    for (const messageId of messageIds) {
      if (handledMessages.has(messageId)) continue;
      const message = await client.getMessageById(messageId);
      if (message) await handleIncomingMessage(message, "poll");
    }
    consecutivePollFailures = 0;
  } catch (error) {
    console.error("[poll]", error);
    consecutivePollFailures += 1;
    const detachedFrame = /detached Frame|Target closed|Session closed|Execution context was destroyed/i.test(String(error));
    if (detachedFrame && consecutivePollFailures >= 3) {
      update({ status: "OTOMATİK_YENİDEN_BAŞLATILIYOR", error: "WhatsApp Web sayfası uyku sonrasında koptu." });
      console.error("[watchdog] WhatsApp Web sayfası koptu; kayıtlı oturumla servis yeniden başlatılıyor");
      await syncStatus();
      try { await client.destroy(); } catch {}
      process.exit(1);
    }
  }
}

// Sağlık ve teşhis uçları WhatsApp Web başlatılırken de erişilebilir olmalı.
// Önceden initialize() takıldığında Express hiç ayağa kalkmıyor, launchd ise
// süreci çalışıyor sanıyordu.
app.listen(PORT, () => console.log(`WhatsApp QR bot ${PORT} portunda çalışıyor`));

client.initialize().catch(async (error) => {
  update({ status: "HATA", phone: null, error: String(error) });
  console.error("[initialize]", error);
  await syncStatus();
  try { await client.destroy(); } catch {}
  // launchd temiz bir tarayıcı süreciyle yeniden başlatsın.
  setTimeout(() => process.exit(1), 1_000);
});
setTimeout(async () => {
  if (initializationCompleted) return;
  update({ status: "BAŞLATMA_ZAMAN_AŞIMI", phone: null, error: "WhatsApp Web 120 saniye içinde başlatılamadı." });
  console.error("[initialize] 120 saniyelik başlatma zaman aşımı; servis yeniden başlatılıyor");
  await syncStatus();
  try { await client.destroy(); } catch {}
  process.exit(1);
}, 120_000).unref();
setInterval(syncStatus, 30_000);
setInterval(reconcileConnection, 10_000);
setInterval(pollRecentInboundMessages, 4_000);
syncStatus();

async function shutdown(signal) {
  console.log(`[shutdown] ${signal}`);
  try { await client.destroy(); } catch {}
  process.exit(0);
}
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
