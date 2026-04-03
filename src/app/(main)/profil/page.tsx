import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function ProfileDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('b2c_session')?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      _count: {
        select: { orders: true }
      }
    }
  });

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Kullanıcı Bilgileri</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Ad Soyad</label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">
              {user.name}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">E-posta Adresi</label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800">
              {user.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Telefon Numarası</label>
            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 cursor-not-allowed">
              {user.phone || "Belirtilmemiş"}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-2xl text-white shadow-lg shadow-primary/20">
            <h3 className="text-lg font-semibold mb-2">Hadi Umreye Gidelim</h3>
            <p className="text-primary-50 text-sm mb-6 leading-relaxed">
              Mekke ve Medine'deki tüm ziyaretlerinizi tamamen size özel oluşturduğunuz bireysel konfigürasyonunuz ile yönetin. 
            </p>
            <div className="flex items-center justify-between bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="font-medium text-sm">Toplam Sipariş</span>
              <span className="text-2xl font-bold">{user._count.orders}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
