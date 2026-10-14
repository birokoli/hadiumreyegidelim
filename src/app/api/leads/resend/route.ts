// Resend teslim olayları (14 Ekim): kitapçık kodu e-postası teslim edildi mi, geri mi döndü, şikâyet mi edildi;
// üye duyuru ve kampanya e-postalarında ayrıca açılma ve tıklama (Resend'de açılma/tıklama izleme açıksa).
// Resend → Webhooks'ta bu adres eklenir; imza anahtarı Vercel'e RESEND_WEBHOOK_SECRET olarak girilir. Anahtar yoksa uç nokta
// hiçbir olayı kabul etmez (sahte "geri döndü" olayıyla kayıt bozulmasın). İmza Svix biçiminde: HMAC-SHA256(id.zaman.gövde).
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { markEmailEvent, type EmailStatus } from "@/lib/leads";
import { gonderimOlayi } from "@/lib/uye-kampanya/gonderim";

export const dynamic = "force-dynamic";

const TOLERANS_SN = 5 * 60;

function imzaGecerli(govde: string, id: string | null, zaman: string | null, imza: string | null, sir: string): boolean {
  if (!id || !zaman || !imza) return false;
  const t = Number(zaman);
  if (!Number.isFinite(t) || Math.abs(Date.now() / 1000 - t) > TOLERANS_SN) return false;
  const anahtar = Buffer.from(sir.replace(/^whsec_/, ""), "base64");
  const beklenen = createHmac("sha256", anahtar).update(`${id}.${zaman}.${govde}`).digest();
  return imza.split(" ").some((parca) => {
    const [surum, deger] = parca.split(",");
    if (surum !== "v1" || !deger) return false;
    const gelen = Buffer.from(deger, "base64");
    return gelen.length === beklenen.length && timingSafeEqual(gelen, beklenen);
  });
}

type Olay = {
  type?: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
    bounce?: { type?: string; subType?: string; message?: string };
    suppressed?: { message?: string };
  };
};

/** Resend olayını kayıt durumuna çevirir; ilgilenmediğimiz olaylar (açıldı, tıklandı, gönderildi) null döner. */
function durum(o: Olay): { status: EmailStatus; note: string | null } | null {
  const kisa = (s?: string) => (s ? s.slice(0, 300) : null);
  switch (o.type) {
    case "email.delivered":
      return { status: "delivered", note: null };
    case "email.bounced": {
      const b = o.data?.bounce;
      // Kalıcı geri dönüş adresin geçersiz olduğunu gösterir; geçici olan (kutu dolu, sunucu meşgul) yalnızca gecikmedir
      if (b?.type && b.type !== "Permanent") return { status: "delayed", note: kisa(`Geçici: ${b.message ?? b.type}`) };
      return { status: "bounced", note: kisa(b?.message ?? b?.subType) };
    }
    case "email.suppressed":
      return { status: "bounced", note: kisa(o.data?.suppressed?.message ?? "Adres Resend engel listesinde") };
    case "email.complained":
      return { status: "complained", note: "Alıcı e-postayı spam olarak işaretledi" };
    case "email.delivery_delayed":
      return { status: "delayed", note: null };
    default:
      return null;
  }
}

export async function POST(req: Request) {
  const sir = process.env.RESEND_WEBHOOK_SECRET;
  if (!sir) return NextResponse.json({ error: "Webhook yapılandırılmamış." }, { status: 503 });
  const govde = await req.text();
  if (!imzaGecerli(govde, req.headers.get("svix-id"), req.headers.get("svix-timestamp"), req.headers.get("svix-signature"), sir)) {
    return NextResponse.json({ error: "İmza geçersiz." }, { status: 401 });
  }
  let olay: Olay;
  try {
    olay = JSON.parse(govde) as Olay;
  } catch {
    return NextResponse.json({ error: "Geçersiz gövde." }, { status: 400 });
  }
  // Profil 2: üyelere giden duyuru/kampanya e-postalarının teslim, açılma ve tıklama kayıtları
  const uye = olay.data?.email_id && olay.type ? await gonderimOlayi(olay.data.email_id, olay.type).catch(() => 0) : 0;
  const d = durum(olay);
  if (!d) return NextResponse.json({ ok: true, ignored: olay.type ?? null, uye });
  const alicilar = Array.isArray(olay.data?.to) ? olay.data.to : olay.data?.to ? [olay.data.to] : [];
  let guncellenen = 0;
  for (const adres of alicilar) {
    const temiz = adres.match(/<([^>]+)>/)?.[1] ?? adres;
    guncellenen += await markEmailEvent(temiz, d.status, d.note);
  }
  return NextResponse.json({ ok: true, status: d.status, updated: guncellenen, uye });
}
