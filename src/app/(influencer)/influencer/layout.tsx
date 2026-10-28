import { redirect } from 'next/navigation';
import { getInfluencerSession } from '@/lib/influencer-auth';
import InfluencerSidebar from '@/components/influencer/InfluencerSidebar';
import InfluencerTopBar from '@/components/influencer/InfluencerTopBar';
import FullIconFont from "@/components/ui/FullIconFont";
import { cairo } from "@/components/home/fonts";
import "./marketing.css";

export default async function InfluencerLayout({ children }: { children: React.ReactNode }) {
  const session = await getInfluencerSession();
  if (!session) redirect('/influencer/login');

  return (
    <div className={`mk ${cairo.variable} min-h-screen`}>
      <FullIconFont />
      <InfluencerSidebar />
      <div className="flex flex-col min-h-screen lg:ml-[264px]">
        <InfluencerTopBar session={session} />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8 pb-28 lg:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
