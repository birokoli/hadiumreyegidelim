import { redirect } from "next/navigation";

/** Otomatik yazı ayarları ve kayıtları İçerik Stüdyosu → Blog motoru → Otomatik yazı sekmesinde */
export default function AiLogsRedirect() {
  redirect("/admin/content?panel=auto");
}
