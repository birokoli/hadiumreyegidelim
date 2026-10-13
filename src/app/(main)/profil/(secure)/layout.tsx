// Üye alanı koruması (13 Ekim): oturum yoksa girişe. Middleware çerezi, burası oturumun geçerliliğini kontrol eder.
import { redirect } from "next/navigation";
import { getMember } from "@/lib/members";

export const dynamic = "force-dynamic";

export default async function SecureLayout({ children }: { children: React.ReactNode }) {
  if (!(await getMember())) redirect("/profil/giris");
  return children;
}
