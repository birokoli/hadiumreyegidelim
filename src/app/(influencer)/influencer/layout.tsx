import { redirect } from 'next/navigation';
import { getInfluencerSession } from '@/lib/influencer-auth';
import InfluencerSidebar from '@/components/influencer/InfluencerSidebar';
import InfluencerTopBar from '@/components/influencer/InfluencerTopBar';

export default async function InfluencerLayout({ children }: { children: React.ReactNode }) {
  const session = await getInfluencerSession();
  if (!session) redirect('/influencer/login');

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">
      <InfluencerSidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <InfluencerTopBar session={session} />
        <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
