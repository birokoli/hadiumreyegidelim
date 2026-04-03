import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('b2c_session')?.value;
  
  if (!token) {
    // If accessing layout without token, redirect to login
    redirect('/profil/giris');
  }

  const session = await verifyToken(token);
  if (!session) {
    redirect('/profil/giris');
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {session.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{session.name}</h3>
                  <p className="text-xs text-slate-500 truncate w-40">{session.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <Link href="/profil" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  <span className="font-medium text-sm">Profil Bilgilerim</span>
                </Link>
                <Link href="/profil/siparisler" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  <span className="font-medium text-sm">Siparişlerim</span>
                </Link>
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <LogoutButton />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[500px]">
              {children}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
