// İYS (İleti Yönetim Sistemi) toplu izin dosyası (Profil 2, 14 Ekim): ileti izni veren üyeler. E-posta izni EPOSTA,
// WhatsApp izni telefon numarasıyla MESAJ türünde yazılır; kaynak HS_WEB (web sitesi), alıcı türü BİREYSEL.
// Sütun adları İYS'nin toplu yükleme şablonuna göre; yüklemeden önce İYS panelindeki güncel şablonla karşılaştırın.
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { listMembersForAdmin } from "@/lib/members";

export const dynamic = "force-dynamic";

const hucre = (v: string) => `"${v.replace(/"/g, '""')}"`;
const tarih = (d: Date | null) => {
  const t = new Date((d ? new Date(d) : new Date()).getTime() + 3 * 3600e3).toISOString();
  return `${t.slice(0, 10)} ${t.slice(11, 19)}`;
};
const tel = (p: string) => {
  let d = p.replace(/\D/g, "");
  if (d.startsWith("0")) d = d.slice(1);
  if (!d.startsWith("90")) d = `90${d}`;
  return `+${d}`;
};

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const uyeler = await listMembersForAdmin();
  const rows = [["ALICI", "IZIN_TURU", "KAYNAK", "DURUM", "IZIN_TARIHI", "ALICI_TURU"]];
  for (const u of uyeler) {
    if (u.izinEposta) rows.push([u.email, "EPOSTA", "HS_WEB", "ONAY", tarih(u.izinTarihi), "BIREYSEL"]);
    if (u.izinWhatsapp && u.phone) rows.push([tel(u.phone), "MESAJ", "HS_WEB", "ONAY", tarih(u.izinTarihi), "BIREYSEL"]);
  }
  const csv = "﻿" + rows.map((r) => r.map(hucre).join(";")).join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="iys-izinler-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
