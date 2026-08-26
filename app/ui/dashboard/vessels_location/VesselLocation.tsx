'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Ship, ChevronLeft, ChevronRight, Search, FileText, Table as TableIcon } from "lucide-react"

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// --- 1. DEFINE STRICT TYPES FOR THE API ---
interface VesselInfo {
  mmsi: number;
  name?: string;
  shipType?: number;
  length?: number;
  width?: number;
  draught?: number;
}

interface AISFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    mmsi: number;
    sog: number;
  };
}

// This is the shape of the data AFTER we merge it
interface MergedVessel {
  mmsi: number;
  name: string;
  type: string | number;
  sog: number;
  lat: number;
  lng: number;
  draught: string;
  dimensions: string;
}

export default function VesselLocation() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 15;

  // --- 2. THE QUERY WITH EXPLICIT TYPES ---
  const { data: combinedData, isLoading, error } = useQuery<MergedVessel[]>({ 
    queryKey: ['ais-locations-full'],
    queryFn: async () => {
      const [locRes, vesRes] = await Promise.all([
        fetch('https://meri.digitraffic.fi/api/ais/v1/locations'),
        fetch('https://meri.digitraffic.fi/api/ais/v1/vessels')
      ]);
      
      const locData = await locRes.json();
      const vesData: VesselInfo[] = await vesRes.json();

      const vesselMap = new Map<number, VesselInfo>();
      vesData.forEach((v: VesselInfo) => vesselMap.set(v.mmsi, v));

      const features: AISFeature[] = locData.features || [];

      return features.map((f: AISFeature): MergedVessel => {
        const mmsi = f.properties.mmsi;
        const info = vesselMap.get(mmsi);
        return {
          mmsi,
          name: info?.name || `MMSI: ${mmsi}`,
          type: info?.shipType || 'Unknown',
          sog: f.properties.sog || 0,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          draught: info?.draught ? (info.draught / 10).toFixed(1) : '-',
          dimensions: `${info?.length || '-'}x${info?.width || '-'}`
        };
      });
    },
  });

  // --- 3. EXPORT LOGIC ---
  const exportToCSV = () => {
    if (!combinedData) return;
    const headers = ["Name,MMSI,Speed(kn),Lat,Lng,Draught(m),Dimensions(LxW)"];
    const rows = combinedData.map((v: MergedVessel) => 
      `"${v.name}",${v.mmsi},${v.sog},${v.lat},${v.lng},${v.draught},"${v.dimensions}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Fleet_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!combinedData) return;
    const doc = new jsPDF();
    doc.text("Live Fleet Registry Report", 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [['Vessel Name', 'MMSI', 'SOG', 'Lat/Lng', 'Draught']],
      body: combinedData.map((v: MergedVessel) => [
        v.name, v.mmsi, `${v.sog} kn`, `${v.lat.toFixed(2)}, ${v.lng.toFixed(2)}`, `${v.draught}m`
      ]),
      headStyles: { fillColor: [220, 38, 38] } 
    });
    doc.save(`Fleet_Report.pdf`);
  };

  // --- 4. FILTERING & PAGINATION ---
  const filteredData = combinedData?.filter((v: MergedVessel) => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.mmsi.toString().includes(searchTerm)
  ) || [];

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) return <div className="p-20 text-center text-cyan-500 font-mono">LOADING_FLEET_DATA...</div>;
  if (error) return <div className="p-20 text-center text-red-500 font-mono">CONNECTION_ERROR</div>;

  return (
    <div className="space-y-4 p-4 bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-900/50 p-4 rounded-t-lg border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded shadow-[0_0_10px_rgba(220,38,38,0.4)]">
            <Ship className="text-white w-5 h-5" />
          </div>
          <h2 className="text-white font-black italic uppercase tracking-tighter text-xl">Fleet_Registry</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 gap-1">
            <Button onClick={exportToCSV} variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-slate-400 hover:bg-slate-800">
              <TableIcon className="w-3 h-3 mr-2 text-green-500" /> CSV
            </Button>
            <Button onClick={exportToPDF} variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-slate-400 hover:bg-slate-800">
              <FileText className="w-3 h-3 mr-2 text-red-500" /> PDF
            </Button>
          </div>

          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="SEARCH FLEET..." 
              className="pl-10 bg-slate-950 border-slate-800 text-xs font-mono text-cyan-400 h-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-b-lg border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-slate-900/80">
            <TableRow className="border-slate-800">
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase">Identity</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase">MMSI</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase">Speed</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-500 uppercase text-right">Draught/Dimens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((v: MergedVessel) => (
              <TableRow key={v.mmsi} className="border-slate-900 hover:bg-slate-800/40 transition-colors">
                <TableCell className="font-bold text-white text-xs uppercase italic">{v.name}</TableCell>
                <TableCell className="font-mono text-[10px] text-slate-500">{v.mmsi}</TableCell>
                <TableCell className="font-mono text-xs text-cyan-400 font-bold">{v.sog} kn</TableCell>
                <TableCell className="text-right font-mono text-[10px] text-slate-500">
                  <div className="text-slate-300">{v.draught}m</div>
                  <div className="text-[8px] opacity-50 uppercase">{v.dimensions}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-2 py-4 border-t border-slate-900">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Page {currentPage} of {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 border-slate-800 bg-slate-900 text-white disabled:opacity-30"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 border-slate-800 bg-slate-900 text-white disabled:opacity-30"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}