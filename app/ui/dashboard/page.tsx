'use client'

import VesselTable from './widgets/vessel-table';

export default function Page() {
  return (
    <div className="grid grid-cols-1 gap-6 mt-[17px]">
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex flex-col items-start mb-6 md:justify-between md:flex-row md:items-center">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight font-mono">
            Fleet_Overview <span className="text-slate-500 text-sm ml-2">- (Active Vessels)</span>
          </h2>
          <div className="px-1 my-3 py-2 bg-blue-900/30 border border-blue-500/20 rounded text-[10px] text-blue-400 font-bold uppercase md:px-3 md:my-0">
            Telemetry_Sync: Online
          </div>
        </div>
        
        {/* Notice we don't pass handleVesselSelect or selectedMmsi here anymore! 
           The VesselTable will now pull those directly from the useVessels() context.
        */}
        <VesselTable />
      </div>
    </div>
  );
}