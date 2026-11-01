// Panel kullanıcıları (web: /admin/users): ekip hesapları, rol, yetkiler, pasife alma, şifre.
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { istek } from "@/api/istemci";
import { KayitEkrani } from "@/ui/form";
import { Cip, Yazi } from "@/ui/temel";
import { goreli } from "@/ui/bicim";

type Kullanici = { id: string; name: string; username: string; email: string; role: string; permissions: string[]; status: string; lastLoginAt: string | null; password?: string };
const ROL = [{ deger: "super_admin", etiket: "Süper yönetici" }, { deger: "admin", etiket: "Yönetici" }, { deger: "editor", etiket: "Editör" }, { deger: "viewer", etiket: "İzleyici" }];
export const YETKILER = [
  { deger: "dashboard", etiket: "Dashboard" }, { deger: "orders", etiket: "Satış" }, { deger: "operations", etiket: "Operasyon" },
  { deger: "content", etiket: "İçerik" }, { deger: "marketing", etiket: "Pazarlama" }, { deger: "settings", etiket: "Ayarlar" }, { deger: "users", etiket: "Kullanıcılar" },
];

export default function Kullanicilar() {
  const q = useQuery({ queryKey: ["kullanicilar"], queryFn: () => istek<{ users: Kullanici[]; currentAdminId: string }>("/api/admin/users") });
  return (
    <KayitEkrani<Kullanici>
      baslik="Kullanıcılar"
      q={q}
      anahtar={["kullanicilar"]}
      veri={q.data?.users ?? []}
      bos="Kullanıcı yok"
      ara={(u) => `${u.name} ${u.username} ${u.email}`}
      satir={(u) => ({ baslik: u.name, alt: `@${u.username} · ${ROL.find((r) => r.deger === u.role)?.etiket ?? u.role}${u.lastLoginAt ? ` · son giriş ${goreli(u.lastLoginAt)}` : ""}`, ikon: "kullanici", rozet: u.status === "passive" ? { metin: "Pasif", ton: "gri" } : u.id === q.data?.currentAdminId ? { metin: "Siz", ton: "mavi" } : undefined })}
      alanlar={[
        { k: "name", etiket: "Ad soyad" },
        { k: "username", etiket: "Kullanıcı adı" },
        { k: "email", etiket: "E-posta" },
        { k: "role", etiket: "Rol", tur: "secim", secenekler: ROL },
        { k: "status", etiket: "Durum", tur: "secim", secenekler: [{ deger: "active", etiket: "Aktif" }, { deger: "passive", etiket: "Pasif" }] },
        { k: "password", etiket: "Şifre (değiştirmek için yazın, en az 8 karakter)" },
      ]}
      formAlt={(u, degis) => (u.role === "super_admin" ? <Yazi tur="kucuk">Süper yönetici bütün yetkilere sahiptir.</Yazi> : <YetkiSecici secili={u.permissions} degisti={(l) => degis("permissions", l)} />)}
      yeni={() => ({ id: "", name: "", username: "", email: "", role: "editor", permissions: [], status: "active", lastLoginAt: null, password: "" })}
      kaydet={(u, yeni) => {
        const govde = { name: u.name, username: u.username, email: u.email, role: u.role, status: u.status, permissions: u.permissions, password: u.password ?? "" };
        return yeni ? istek("/api/admin/users", { govde }) : istek(`/api/admin/users/${u.id}`, { method: "PATCH", govde });
      }}
      sil={(u) => istek(`/api/admin/users/${u.id}`, { method: "DELETE" })}
      silUyari="Hesap kalıcı olarak silinir. Yalnızca erişimi kapatmak için durumu Pasif yapın."
    />
  );
}

function YetkiSecici({ secili, degisti }: { secili: string[]; degisti: (l: string[]) => void }) {
  return (
    <View style={{ gap: 6 }}>
      <Yazi tur="etiket">Yetkiler (dokunarak aç / kapat)</Yazi>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {YETKILER.map((y) => {
          const var_ = secili.includes(y.deger);
          return <Cip key={y.deger} metin={y.etiket} secili={var_} onPress={() => degisti(var_ ? secili.filter((x) => x !== y.deger) : [...secili, y.deger])} />;
        })}
      </View>
    </View>
  );
}
