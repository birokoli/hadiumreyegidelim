// Mobil yönetim uygulaması bildirimleri (28 Ekim; plan: docs/MOBIL-ADMIN-PLANI.md).
// bildirArkada(olay, {...}) yanıtı bekletmeden (next/server after) çalışır: olayın yetkisine sahip, uygulamada oturumu açık
// her yöneticiye MobilBildirim kaydı yazılır (uygulamadaki Bildirimler listesi) ve cihazlarına FCM ile anlık bildirim gider.
// FCM: Google hizmet hesabı FIREBASE_SERVICE_ACCOUNT ortam değişkeninde (JSON ya da base64 JSON). Yoksa yalnızca kayıt yazılır.
// Bildirim metninde ödeme tutarı, pasaport gibi hassas veri olmaz; ayrıntı uygulamada açılır.
import crypto from "crypto";
import { after } from "next/server";
import { importPKCS8, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { LEGACY_ADMIN_ID, normalizePermissions } from "@/lib/admin-auth";
import { ensureMobilSchema } from "./oturum";

/** Olay türleri: ad (ayarlardaki etiket) ve görmek için gereken yetki */
export const OLAYLAR = {
  talep: { ad: "Yeni talepler", yetki: "orders" },
  teklif: { ad: "Teklif açıldı / onaylandı", yetki: "orders" },
  odeme: { ad: "Ödemeler", yetki: "orders" },
  ramazan: { ad: "Ramazan rezervasyonları", yetki: "orders" },
  hatirlatma: { ad: "Hatırlatmalar (teklif süresi, yolculuk)", yetki: "orders" },
  uye: { ad: "Yeni üyeler", yetki: "orders" },
  yorum: { ad: "Yorum onayı", yetki: "marketing" },
  icerik: { ad: "Influencer içerikleri", yetki: "marketing" },
  basvuru: { ad: "Influencer başvuruları", yetki: "marketing" },
  destek: { ad: "Destek mesajları", yetki: "marketing" },
  whatsapp: { ad: "WhatsApp devirleri", yetki: "marketing" },
} as const;
export type Olay = keyof typeof OLAYLAR;

export type BildirimIcerik = { baslik: string; govde?: string; yol?: string };

type Alici = { adminId: string; anahtarlar: string[] };

async function alicilar(olay: Olay): Promise<Alici[]> {
  const cihazlar = await prisma.$queryRawUnsafe<{ adminId: string; bildirimAnahtari: string | null }[]>(
    `SELECT "adminId", "bildirimAnahtari" FROM "MobilCihaz" WHERE NOT "iptal"`,
  );
  const adminIds = [...new Set(cihazlar.map((c) => c.adminId))];
  if (!adminIds.length) return [];
  const adminler = await prisma.adminUser.findMany({ where: { id: { in: adminIds }, status: "active" }, select: { id: true, role: true, permissions: true } });
  const tercihler = await prisma.$queryRawUnsafe<{ adminId: string; kapali: string; sessizBas: string | null; sessizSon: string | null }[]>(
    `SELECT * FROM "MobilTercih" WHERE "adminId" = ANY($1)`, adminIds,
  );
  const gerek = OLAYLAR[olay].yetki;
  return adminIds
    .filter((id) => {
      if (id === LEGACY_ADMIN_ID) return true;
      const a = adminler.find((x) => x.id === id);
      return !!a && (a.role === "super_admin" || normalizePermissions(a.permissions).includes(gerek));
    })
    .filter((id) => {
      const t = tercihler.find((x) => x.adminId === id);
      try {
        return !t || !(JSON.parse(t.kapali) as string[]).includes(olay);
      } catch {
        return true;
      }
    })
    .map((id) => {
      const t = tercihler.find((x) => x.adminId === id);
      const sessiz = t?.sessizBas && t?.sessizSon ? sessizMi(t.sessizBas, t.sessizSon) : false;
      return { adminId: id, anahtarlar: sessiz ? [] : cihazlar.filter((c) => c.adminId === id && c.bildirimAnahtari).map((c) => c.bildirimAnahtari!) };
    });
}

/** "23:00"–"08:00" gibi Türkiye saatine göre sessiz aralık (gece yarısını aşabilir) */
export function sessizMi(bas: string, son: string, simdi = new Date()) {
  const hm = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const tr = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", hour12: false }).format(simdi);
  const n = hm(tr), a = hm(bas), b = hm(son);
  return a <= b ? n >= a && n < b : n >= a || n < b;
}

// ── FCM HTTP v1 ──────────────────────────────────────────────────────────
type Hesap = { project_id: string; client_email: string; private_key: string };
let hesapOnbellek: Hesap | null | undefined;
function hizmetHesabi(): Hesap | null {
  if (hesapOnbellek !== undefined) return hesapOnbellek;
  const ham = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!ham) return (hesapOnbellek = null);
  try {
    const json = ham.startsWith("{") ? ham : Buffer.from(ham, "base64").toString("utf8");
    const h = JSON.parse(json) as Hesap;
    return (hesapOnbellek = h.project_id && h.client_email && h.private_key ? h : null);
  } catch {
    console.error("[bildir] FIREBASE_SERVICE_ACCOUNT okunamadı");
    return (hesapOnbellek = null);
  }
}

let erisim: { anahtar: string; bitis: number } | null = null;
async function googleErisim(h: Hesap) {
  if (erisim && erisim.bitis > Date.now() + 60_000) return erisim.anahtar;
  const key = await importPKCS8(h.private_key, "RS256");
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(h.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const j = (await r.json()) as { access_token?: string; expires_in?: number };
  if (!j.access_token) throw new Error(`Google erişim anahtarı alınamadı (${r.status})`);
  erisim = { anahtar: j.access_token, bitis: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return erisim.anahtar;
}

/** Tek cihaza gönderim; anahtar artık geçersizse (uygulama silinmiş) cihazın anahtarı temizlenir */
async function fcmGonder(h: Hesap, token: string, icerik: BildirimIcerik, olay: Olay, okunmamis: number) {
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${h.project_id}/messages:send`, {
    method: "POST",
    headers: { authorization: `Bearer ${await googleErisim(h)}`, "content-type": "application/json" },
    body: JSON.stringify({
      message: {
        token,
        notification: { title: icerik.baslik, body: icerik.govde ?? "" },
        data: { olay, yol: icerik.yol ?? "" },
        android: { priority: "high", notification: { channel_id: olay, notification_count: okunmamis, color: "#203C76", icon: "bildirim_ikonu" } },
      },
    }),
  });
  if (r.status === 404 || r.status === 400) {
    const j = (await r.json().catch(() => ({}))) as { error?: { details?: { errorCode?: string }[] } };
    if (j.error?.details?.some((d) => d.errorCode === "UNREGISTERED" || d.errorCode === "INVALID_ARGUMENT")) {
      await prisma.$executeRawUnsafe(`UPDATE "MobilCihaz" SET "bildirimAnahtari" = NULL WHERE "bildirimAnahtari" = $1`, token);
    }
  }
}

/** yalniz: yalnızca bu yöneticiye (test bildirimi) */
export async function bildir(olay: Olay, icerik: BildirimIcerik, yalniz?: string) {
  await ensureMobilSchema();
  const liste = (await alicilar(olay)).filter((a) => !yalniz || a.adminId === yalniz);
  if (!liste.length) return;
  const h = hizmetHesabi();
  for (const a of liste) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "MobilBildirim" ("id","adminId","olay","baslik","govde","yol") VALUES ($1,$2,$3,$4,$5,$6)`,
      crypto.randomUUID(), a.adminId, olay, icerik.baslik.slice(0, 140), (icerik.govde ?? "").slice(0, 400), icerik.yol ?? null,
    );
    if (!h || !a.anahtarlar.length) continue;
    const [{ n }] = await prisma.$queryRawUnsafe<{ n: number }[]>(`SELECT COUNT(*)::int AS n FROM "MobilBildirim" WHERE "adminId" = $1 AND NOT "okundu"`, a.adminId);
    await Promise.all(a.anahtarlar.map((t) => fcmGonder(h, t, icerik, olay, n).catch((e) => console.error("[bildir] FCM", e))));
  }
}

/** Route içinden: yanıtı bekletmez, hata isteği bozmaz */
export function bildirArkada(olay: Olay, icerik: BildirimIcerik) {
  try {
    after(() => bildir(olay, icerik).catch((e) => console.error("[bildir]", olay, e)));
  } catch {
    // after() istek dışında (betik, test) çağrılırsa doğrudan çalıştır
    void bildir(olay, icerik).catch((e) => console.error("[bildir]", olay, e));
  }
}

/** Bildirimde ad: "Neriman Yılmaz" → "Neriman Y." (kilit ekranında tam ad görünmesin) */
export function kisaAd(ad: string | null | undefined) {
  const p = String(ad ?? "").trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "Müşteri";
  return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1][0].toLocaleUpperCase("tr-TR")}.`;
}
