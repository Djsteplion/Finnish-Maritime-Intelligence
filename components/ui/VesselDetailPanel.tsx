// components/ui/VesselDetailPanel.tsx

import Link from "next/link";

interface VesselProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vessel: any;
  isLoading?: boolean; // We can pass this from the parent
}

// Industry Standard AIS Navigation Status Mapping
const NAV_STATUS: Record<number, string> = {
  0: "Under Way (Engine)",
  1: "At Anchor",
  2: "Not Under Command",
  3: "Restricted Manoeuvrability",
  4: "Constrained by Draught",
  5: "Moored",
  6: "Aground",
  7: "Engaged in Fishing",
  8: "Under Way (Sailing)",
  9: "Reserved",
  10: "Reserved",
  11: "Power-driven vessel towing astern",
  12: "Power-driven vessel pushing ahead or towing alongside",
  13: "Reserved",
  14: "AIS-SART",
  15: "Undefined"
};

export default function VesselDetailPanel({ vessel, isLoading }: VesselProps) {
  // 1. If no vessel is selected at all
  if (!vessel && !isLoading) {
    return (
      <div className="p-6 text-slate-500 italic text-center mt-20">
        Select a vessel on the map to view live logistics data.
      </div>
    );
  }

  // 2. The Skeleton Loader (While switching or loading)
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-3/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-2/3"></div>
        </div>
        <div className="h-20 bg-slate-800 rounded w-full mt-4"></div>
      </div>
    );
  }

  // Translate the status number to a word, fallback to the raw value or "Active"
  const humanReadableStatus = NAV_STATUS[vessel.navStat] || (vessel.navStat !== undefined ? `Status ${vessel.navStat}` : "Active");

  // 3. The Actual Data
  return (
    <div className="p-6 text-white overflow-y-auto h-full bg-slate-900">
      <div className="mb-6">
        <span className="text-blue-500 text-[10px] font-bold uppercase tracking-widest leading-none">Live Vessel</span>
        <h2 className="text-2xl font-mono font-bold truncate mt-1">{vessel.name}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <DetailItem label="Destination" value={vessel.destination} color="text-emerald-400" />
        
        <div className="flex gap-4">
          <DetailItem label="Speed" value={`${vessel.sog} kn`} />
          <DetailItem label="Course" value={`${vessel.cog}°`} />
        </div>

        <DetailItem label="MMSI" value={vessel.mmsi} />
        
        {/* Updated with human-readable maritime status */}
        <DetailItem 
          label="Status" 
          value={humanReadableStatus} 
          color={vessel.navStat === 0 ? "text-blue-400" : "text-amber-400"} 
        />
      </div>

      <Link 
        href={`/ui/dashboard/vessels/${vessel.mmsi}`}
        className="block w-full mt-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm text-center transition-all shadow-lg active:scale-95 text-white"
        >
        View Detailed Log
      </Link>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DetailItem({ label, value, color = "text-white" }: { label: string, value: any, color?: string }) {
  return (
    <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
      <p className="text-slate-400 text-[10px] uppercase font-semibold mb-1">{label}</p>
      <p className={`font-mono text-sm ${color}`}>{value || '---'}</p>
    </div>
  );
}