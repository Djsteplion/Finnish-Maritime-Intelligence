'use client'

import { usePathname } from 'next/navigation';
import SideNav from '@/app/ui/dashboard/sidenav/SideNav';
import { VesselProvider, useVessels } from '@/app/ui/dashboard/vessel-context';
import VesselMap from '@/components/ui/VesselMap';
import VesselDetailPanel from '@/components/ui/VesselDetailPanel';
import Totals from '@/app/ui/dashboard/widgets/totals';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { selected, isPanelLoading, mapRef, handleVesselSelect } = useVessels();
  const pathname = usePathname();

  // 1. Define where the "Home" dashboard elements should show
  // This ensures they DON'T show on /ports, /customers, etc.
  const isDashboardHome = pathname === '/ui/dashboard';
  const isDetailPage = pathname.includes('/vessels/');

  return (
    <div className="flex h-screen flex-row overflow-hidden bg-[#f3f4f6] dark:bg-[rgba(15,15,15,0.95)]">
      
      {/* Sidebar - Stays constant */}
      <div className="flex-none w-fit md:w-64 border-r border-slate-200 dark:border-slate-800 z-30">
        <SideNav />
      </div>
      
      <div className="grow overflow-y-auto bg-[rgba(0,0,0,0.04)] scroll-smooth">
        <div className="p-4 md:p-8 lg:p-12 w-full max-w-[1600px] mx-auto">
          
          {/* 2. ONLY show Map/Totals if we are on the main Dashboard page */}
          {isDashboardHome && !isDetailPage && (
            <div className="block space-y-6 mb-8">
              <Totals />
              
              <main className="flex flex-col lg:flex-row h-auto lg:h-[600px] w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex-1 relative h-[400px] lg:h-full border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
                  <VesselMap ref={mapRef} onSelect={handleVesselSelect} />
                  
                  {/* Live Feed Tag */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 dark:bg-slate-950/95 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm pointer-events-none">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 tracking-widest uppercase">Live_Feed</span>
                  </div>
                </div>

                <aside className="w-full lg:w-96 bg-slate-50 dark:bg-slate-900/50 overflow-y-auto">
                  <VesselDetailPanel vessel={selected} isLoading={isPanelLoading} />
                </aside>
              </main>
            </div>
          )}

          {/* 3. The Page Content (This will be the ONLY thing visible on /ports) */}
          <div className="mt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <VesselProvider>
      <DashboardContent>{children}</DashboardContent>
    </VesselProvider>
  );
}