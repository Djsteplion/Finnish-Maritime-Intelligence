// app/ui/dashboard/vessels/[mmsi]/page.tsx
import Link from 'next/link';
import SingleVesselMap from './single-vessel-map';

export default async function VesselLogPage({ 
  params 
}: { 
  params: Promise<{ mmsi: string }> 
}) {
  const { mmsi } = await params;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="block md:flex justify-between items-center mb-8">
          <div>
            
            <Link 
            href="/ui/dashboard" // MUST match the route where your persistent layout is
            className="text-blue-500 hover:text-blue-400 text-sm font-mono transition"
            >
            [←] BACK_TO_FLEET_OPERATIONS
            </Link>
            <h1 className="text-3xl font-mono font-bold mt-2 uppercase tracking-tight">Vessel_Log: {mmsi}</h1>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-md">
            <span className="text-slate-500 text-[10px] uppercase block mb-1">Data Stream</span>
            <span className="text-emerald-400 font-mono font-bold">STABLE_CONNECTED</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <p className="text-slate-500 text-[10px] uppercase font-bold mb-2 tracking-widest text-blue-400/70">Registry</p>
            <p className="text-2xl font-mono">MMSI-{mmsi}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <p className="text-slate-500 text-[10px] uppercase font-bold mb-2 tracking-widest">Zone</p>
            <p className="text-2xl font-mono">Baltic Sector</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <p className="text-slate-500 text-[10px] uppercase font-bold mb-2 tracking-widest">Last Update</p>
            <p className="text-2xl font-mono">Live</p>
          </div>
        </div>

        {/* Secondary Map & Table Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* FOCUSED MAP */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-[400px] lg:h-auto shadow-xl">
            <div className="p-3 border-b border-slate-800 bg-slate-950/50">
               <p className="text-[10px] font-bold uppercase text-slate-500">Live_Position_Lock</p>
            </div>
            <SingleVesselMap mmsi={mmsi} />
          </div>

          {/* Log Table */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-tight text-slate-300">Telemetry History</h3>
              <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-1 rounded">24H RANGE</span>
            </div>
            <table className="w-full text-left text-sm font-mono">
              <thead className="text-slate-500 border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <th className="p-4 font-semibold uppercase text-[10px]">Timestamp</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Event</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Lat / Lon</th>
                  <th className="p-4 font-semibold uppercase text-[10px]">Knots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="hover:bg-blue-900/10 transition-colors">
                  <td className="p-4 text-slate-400">03-03 14:45</td>
                  <td className="p-4 text-blue-400">Position Ping</td>
                  <td className="p-4">60.16° / 24.93°</td>
                  <td className="p-4">12.2</td>
                </tr>
                <tr className="hover:bg-blue-900/10 transition-colors">
                  <td className="p-4 text-slate-400">03-03 14:15</td>
                  <td className="p-4 text-amber-500">Speed Change</td>
                  <td className="p-4">60.12° / 24.85°</td>
                  <td className="p-4">14.8</td>
                </tr>
                <tr className="hover:bg-blue-900/10 transition-colors">
                  <td className="p-4 text-slate-400">03-03 13:50</td>
                  <td className="p-4 text-slate-300">Course Correction</td>
                  <td className="p-4">59.88° / 24.12°</td>
                  <td className="p-4">13.1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}