// Uydurma e-postaları kod göndermeden önce eler (13 Ekim, kullanıcı: "fake mail yazmasınlar").
// Sırayla: biçim, yazım hatası önerisi (gmial.com → gmail.com), geçici e-posta servisleri, açıkça uydurma adresler,
// alan adının e-posta alıp almadığı (MX kaydı). DNS geç cevap verirse adres engellenmez; asıl kanıt doğrulama kodudur.
import { resolveMx, resolve4 } from "node:dns/promises";

export type EmailCheck = { ok: true; email: string } | { ok: false; error: string; suggestion?: string };

const FORMAT = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

// Sık yapılan alan adı yazım hataları
const TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com", "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gmail.con": "gmail.com", "gmail.om": "gmail.com", "gmil.com": "gmail.com",
  "gnail.com": "gmail.com", "gmail.com.tr": "gmail.com", "gmali.com": "gmail.com", "gmaıl.com": "gmail.com",
  "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmail.co": "hotmail.com", "hotmail.con": "hotmail.com", "hotmai.com": "hotmail.com",
  "hotamil.com": "hotmail.com", "homail.com": "hotmail.com", "hotmil.com": "hotmail.com",
  "outlok.com": "outlook.com", "outlook.co": "outlook.com", "outllok.com": "outlook.com", "outlook.con": "outlook.com",
  "yaho.com": "yahoo.com", "yahoo.co": "yahoo.com", "yahooo.com": "yahoo.com", "yahoo.con": "yahoo.com",
  "icloud.co": "icloud.com", "iclod.com": "icloud.com", "icoud.com": "icloud.com", "icloud.con": "icloud.com",
  "yandex.con": "yandex.com", "yandex.co": "yandex.com",
};

// Geçici (tek kullanımlık) e-posta servisleri
const DISPOSABLE = new Set([
  "mailinator.com", "10minutemail.com", "10minutemail.net", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "sharklasers.com",
  "grr.la", "yopmail.com", "yopmail.net", "yopmail.fr", "temp-mail.org", "temp-mail.io", "tempmail.com", "tempmail.net", "tempmailo.com",
  "tempail.com", "tempr.email", "mytemp.email", "throwawaymail.com", "trashmail.com", "trashmail.de", "getnada.com", "nada.email",
  "dispostable.com", "maildrop.cc", "mailnesia.com", "fakeinbox.com", "emailondeck.com", "minuteinbox.com", "mohmal.com", "moakt.com",
  "mail.tm", "inboxkitten.com", "emailfake.com", "fakemail.net", "burnermail.io", "spamgourmet.com", "mintemail.com", "mailcatch.com",
  "33mail.com", "anonaddy.me", "tmpmail.org", "tmpmail.net", "1secmail.com", "1secmail.net", "1secmail.org", "dropmail.me", "emltmp.com",
  "linshiyouxiang.net", "byom.de", "spambox.us", "trbvm.com", "mailpoof.com", "tempinbox.com", "discard.email", "cuvox.de", "dayrep.com",
]);

// Açıkça uydurma alan adları ve kullanıcı adları
const FAKE_DOMAINS = new Set(["example.com", "example.org", "test.com", "test.net", "deneme.com", "asd.com", "asdf.com", "abc.com", "xyz.com", "mail.com.tr", "email.com", "sahte.com"]);
const FAKE_LOCALS = new Set(["test", "deneme", "asd", "asdf", "asdasd", "qwe", "qwerty", "abc", "abcd", "aaa", "xxx", "xyz", "fake", "sahte", "yok", "none", "noreply", "no-reply", "123", "1234", "12345", "123456", "admin", "mail", "email"]);

async function acceptsMail(domain: string): Promise<boolean | null> {
  const timeout = new Promise<null>((r) => setTimeout(() => r(null), 3000));
  const lookup = (async () => {
    try {
      const mx = await resolveMx(domain);
      return mx.some((m) => m.exchange && m.exchange !== ".");
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === "ENOTFOUND" || code === "ENODATA") {
        // MX yoksa e-posta A kaydına gidebilir (nadir); alan adı hiç yoksa uydurmadır
        try {
          return (await resolve4(domain)).length > 0;
        } catch {
          return false;
        }
      }
      return null; // DNS hatası: karar verme
    }
  })();
  return Promise.race([lookup, timeout]);
}

export async function checkEmail(raw: string): Promise<EmailCheck> {
  const email = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!FORMAT.test(email)) return { ok: false, error: "E-posta adresi geçersiz görünüyor; ad@ornek.com biçiminde yazın." };
  const at = email.lastIndexOf("@");
  const local = email.slice(0, at);
  let domain = email.slice(at + 1);
  if (domain.endsWith(".con") || domain.endsWith(".cmo") || domain.endsWith(".comm")) domain = domain.replace(/\.(con|cmo|comm)$/, ".com");
  const fixed = TYPOS[domain] ?? (domain !== email.slice(at + 1) ? domain : undefined);
  if (fixed) return { ok: false, error: `Bunu mu demek istediniz: ${local}@${fixed}?`, suggestion: `${local}@${fixed}` };
  if (DISPOSABLE.has(domain)) return { ok: false, error: "Geçici e-posta adresleri kabul edilmiyor; kendi e-posta adresinizi yazın." };
  if (FAKE_DOMAINS.has(domain) || FAKE_LOCALS.has(local) || /^(.)\1{3,}$/.test(local)) return { ok: false, error: "Lütfen gerçek e-posta adresinizi yazın; kitapçığın bağlantısı bu adrese gidecek." };
  const mail = await acceptsMail(domain);
  if (mail === false) return { ok: false, error: `"${domain}" adresine e-posta gönderilemiyor; e-posta adresinizi kontrol edin.` };
  return { ok: true, email };
}

/** Türkiye cep telefonu (5xx) ya da + ile başlayan uluslararası numara; 555 555 55 55 gibi dolgu numaraları elenir. */
export function checkPhone(raw: string): { ok: true; phone: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "" };
  let digits = trimmed.replace(/\D/g, "");
  const intl = trimmed.startsWith("+") || trimmed.startsWith("00");
  if (digits.startsWith("00")) digits = digits.slice(2);
  let phone: string;
  if (!intl || digits.startsWith("90")) {
    const tr = digits.replace(/^90/, "").replace(/^0/, "");
    if (!/^5\d{9}$/.test(tr)) return { ok: false, error: "Telefon numarası 05xx xxx xx xx biçiminde olmalı." };
    phone = `+90${tr}`;
  } else {
    if (digits.length < 9 || digits.length > 15) return { ok: false, error: "Telefon numarası geçersiz görünüyor." };
    phone = `+${digits}`;
  }
  const body = phone.slice(-7);
  if (/^(\d)\1{6}$/.test(body) || /1234567|7654321/.test(body)) return { ok: false, error: "Lütfen gerçek telefon numaranızı yazın." };
  return { ok: true, phone };
}
