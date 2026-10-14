// Üyeler (14 Ekim, kullanıcı: "üye listesini nasıl görebilirim"): siteye üye olanlar (User tablosu). Müşteri havuzundaki
// "Üyelik" satırları bu kişilerin kayıt anındaki iletişim izinleridir; burada hesabın kendisi, e-posta doğrulaması ve
// satış masasındaki umre dosyaları görünür. Sunucu bileşeni; arama ve filtre adres çubuğundaki parametrelerle.
import Link from "next/link";
import { redirect } from "next/navigation";
import HubTabs from "@/components/admin/HubTabs";
import { getAdminSession } from "@/lib/admin-auth";
import { listMembersForAdmin } from "@/lib/members";
import { asamaLabel } from "@/lib/satis/ortak";

export const dynamic = "force-dynamic";

const FILTRE = { tumu: "Tümü", dogrulanan: "E-postası doğrulanan", dogrulanmayan: "Doğrulanmayan", dosyali: "Umre dosyası olan", izinli: "İleti izni verenler" } as const;
type Filtre = keyof typeof FILTRE;

function waUrl(phone: string, name: string) {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("0")) p = "9" + p;
  if (!p.startsWith("90")) p = "90" + p;
  return `https://wa.me/${p}?text=${encodeURIComponent(`Merhaba ${name.split(" ")[0]}, Hadi Umreye Gidelim'den yazıyoruz.`)}`;
}

export default async function UyelerPage({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  if (!(await getAdminSession())) redirect("/admin/login");
  const { q = "", f = "tumu" } = await searchParams;
  const filtre: Filtre = f in FILTRE ? (f as Filtre) : "tumu";
  const uyeler = await listMembersForAdmin();

  const ara = q.trim().toLocaleLowerCase("tr-TR");
  const liste = uyeler.filter((u) => {
    if (filtre === "dogrulanan" && !u.emailVerifiedAt) return false;
    if (filtre === "dogrulanmayan" && u.emailVerifiedAt) return false;
    if (filtre === "dosyali" && u.dosyaSayisi === 0) return false;
    if (filtre === "izinli" && !u.marketingConsent) return false;
    return !ara || `${u.name} ${u.email} ${u.phone ?? ""}`.toLocaleLowerCase("tr-TR").includes(ara);
  });

  const dogrulanan = uyeler.filter((u) => u.emailVerifiedAt).length;
  const dosyali = uyeler.filter((u) => u.dosyaSayisi > 0).length;
  const son7 = uyeler.filter((u) => u.yeni).length;
  const kart = [
    { etiket: "Toplam üye", sayi: uyeler.length, alt: `Son 7 günde ${son7} yeni üye`, renk: "text-primary border-primary/20" },
    { etiket: "E-postası doğrulanan", sayi: dogrulanan, alt: "Umre dosyası otomatik bağlanır", renk: "text-secondary border-secondary/25" },
    { etiket: "Doğrulanmayan", sayi: uyeler.length - dogrulanan, alt: "Dosya admin'den bağlanır", renk: "text-[#b8862f] border-[#b8862f]/25" },
    { etiket: "Umre dosyası olan", sayi: dosyali, alt: "Satış masasında dosyası var", renk: "text-error border-error/20" },
  ];
  const href = (yeniF: Filtre) => `/admin/uyeler?f=${yeniF}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      <HubTabs hub="satis" />

      <div className="pb-6 border-b border-outline-variant/15">
        <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Satış & CRM</span>
        <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Üyeler</h1>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Siteye üye olanlar (profil, umrelerim, teklifler). Kitapçık indirenler{" "}
          <Link href="/admin/musteri-havuzu" className="font-bold text-primary hover:underline">Müşteri havuzu</Link>&apos;nda.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kart.map((k) => (
          <div key={k.etiket} className={`p-5 rounded-2xl border bg-surface-container-lowest ${k.renk.split(" ")[1]}`}>
            <span className={`text-[10px] font-bold tracking-widest uppercase ${k.renk.split(" ")[0]}`}>{k.etiket}</span>
            <p className="font-headline text-2xl font-bold text-on-surface mt-1">{k.sayi}</p>
            <p className="text-[11px] text-outline mt-0.5">{k.alt}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/15 pb-4">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(Object.keys(FILTRE) as Filtre[]).map((k) => (
            <Link
              key={k}
              href={href(k)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                filtre === k ? "bg-primary text-white border-primary shadow-sm" : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:border-primary/40"
              }`}
            >
              {FILTRE[k]}
            </Link>
          ))}
        </div>
        <form action="/admin/uyeler" className="relative w-full sm:w-72">
          <input type="hidden" name="f" value={filtre} />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="İsim, telefon veya e-posta"
            className="w-full bg-surface-container-lowest text-xs text-on-surface rounded-xl pl-9 pr-3 py-2 border border-outline-variant/25 focus:outline-none focus:border-primary/40"
          />
        </form>
      </div>

      <div className="border border-outline-variant/15 rounded-2xl overflow-x-auto bg-surface-container-lowest">
        {liste.length === 0 ? (
          <div className="py-16 text-center text-outline text-xs font-medium">{uyeler.length === 0 ? "Henüz üye yok." : "Aramanıza uygun üye bulunamadı."}</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3">Üye</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Üyelik tarihi</th>
                <th className="px-4 py-3">Umre dosyası</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {liste.map((u) => (
                <tr key={u.id} className="hover:bg-primary/[0.03] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 font-headline">
                        {u.name.charAt(0).toLocaleUpperCase("tr-TR")}
                      </div>
                      <div>
                        <div className="font-bold text-on-surface whitespace-nowrap">{u.name}</div>
                        {u.marketingConsent ? <span className="text-[10px] font-bold text-secondary">İleti izni var</span> : <span className="text-[10px] text-outline">İleti izni yok</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-on-surface-variant">
                    {u.phone && <div>{u.phone}</div>}
                    <div className="text-[11px]">
                      {u.email}{" "}
                      {u.emailVerifiedAt ? (
                        <span className="ml-1 inline-block whitespace-nowrap rounded-full bg-secondary/10 px-1.5 py-0.5 font-sans text-[10px] font-bold text-secondary">doğrulandı</span>
                      ) : (
                        <span className="ml-1 inline-block whitespace-nowrap rounded-full bg-outline-variant/20 px-1.5 py-0.5 font-sans text-[10px] text-outline">doğrulanmadı</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-outline font-mono whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    {u.sonDosyaNo ? (
                      <Link href={`/admin/satis/${encodeURIComponent(u.sonDosyaNo)}`} className="inline-flex flex-col">
                        <span className="font-mono font-bold text-primary hover:underline whitespace-nowrap">{u.sonDosyaNo}</span>
                        <span className="text-[10px] text-outline">
                          {asamaLabel(u.sonDosyaStatus ?? "")}
                          {u.dosyaSayisi > 1 ? ` · toplam ${u.dosyaSayisi} dosya` : ""}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-outline">Yok</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                    {u.phone && (
                      <a href={waUrl(u.phone, u.name)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-[#25D366] text-white hover:bg-[#1fb958] px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95">
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <a href={`mailto:${u.email}`} className="inline-flex items-center gap-1 border border-outline-variant/25 text-primary hover:border-primary px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95">
                      <span className="material-symbols-outlined text-[14px]">mail</span>
                      <span>E-posta</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-[11px] text-outline">
        E-postası doğrulanan üyeye aynı e-postayla açılan umre dosyası kendiliğinden bağlanır; doğrulanmayanın dosyası Satış Masası&apos;ndaki dosyadan &quot;bağla&quot; ile eklenir.
        Kampanya mesajı yalnızca ileti izni verenlere gönderilebilir.
      </p>
    </div>
  );
}
