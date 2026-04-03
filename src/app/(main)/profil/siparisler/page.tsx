import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('b2c_session')?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Siparişlerim</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">inventory_2</span>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Henüz Siparişiniz Yok</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Hemen bir bireysel umre konfigürasyonu yapın ve hayalinizdeki geziyi planlamaya başlayın.
          </p>
          <a href="/bireysel-umre" className="inline-flex bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-container transition-colors">
            Yeni Umre Planla
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium tracking-wide mb-1">SİPARİŞ NO</p>
                  <p className="font-semibold text-slate-900">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium tracking-wide mb-1">TUTAR</p>
                    <p className="font-bold text-primary">${order.totalUSD.toLocaleString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 
                    order.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {order.status === 'PENDING' ? 'Hazırlanıyor' : 
                     order.status === 'APPROVED' ? 'Onaylandı' : order.status}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex-1">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-900 mr-2">Yolcu Sayısı:</span> {order.pax} Kişi
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="font-medium text-slate-900 mr-2">Tarih:</span> {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                    Sipariş Detayı <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
