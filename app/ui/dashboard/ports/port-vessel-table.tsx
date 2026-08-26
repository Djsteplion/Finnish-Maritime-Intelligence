/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useMemo, useEffect } from 'react';
import { useVessels } from '@/app/ui/dashboard/vessel-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Anchor, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const BALTIC_PORTS = [
  { name: 'Helsinki', coords: [24.94, 60.16] },
  { name: 'Turku', coords: [22.26, 60.45] },
  { name: 'Kotka', coords: [26.94, 60.46] },
  { name: 'Oulu', coords: [25.46, 65.01] },
  { name: 'Tallinn', coords: [24.75, 59.43] },
  { name: 'Stockholm', coords: [18.06, 59.32] },
  { name: 'Gdansk', coords: [18.66, 54.35] },
  { name: 'Riga', coords: [24.10, 56.94] },
];

export default function PortVesselTable({ filterPort }: { filterPort: string | null }) {
  const { vessels: contextVessels } = useVessels(); 
  const [localVessels, setLocalVessels] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const hasContextData = (contextVessels as any)?.features?.length > 0;
    if (!hasContextData) {
      const fetchData = async () => {
        try {
          const res = await fetch('/api/vessels');
          const data = await res.json();
          setLocalVessels(data.features || []);
        } catch (err) {
          console.error("Failed to sync vessels", err);
        }
      };
      fetchData();
    }
  }, [contextVessels]);

  // Reset page when filter or search changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [filterPort, search]);

  const filteredData = useMemo(() => {
    const features = (contextVessels as any)?.features || localVessels;
    const portData = BALTIC_PORTS.find(p => p.name === filterPort);

    if (!features || !Array.isArray(features)) return [];

    return features.filter((f: any) => {
      const p = f.properties || f;
      const name = (p.name || "").toLowerCase();
      const mmsi = (p.mmsi || "").toString();
      const matchesSearch = name.includes(search.toLowerCase()) || mmsi.includes(search);
      
      if (!filterPort || !portData) return matchesSearch;

      const coords = f.geometry?.coordinates || [0,0];
      const dist = Math.sqrt(Math.pow(coords[0] - portData.coords[0], 2) + Math.pow(coords[1] - portData.coords[1], 2));
      
      return matchesSearch && dist < 0.4;
    });
  }, [contextVessels, localVessels, filterPort, search]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by vessel or MMSI..."
            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-red-500 text-sm h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TOTAL COUNT INDICATOR - TOP RIGHT */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">TOTAL_NUMBER</span>
          <span className="text-xl font-mono font-black text-red-600">
            {filteredData.length.toString().padStart(3, '0')}
          </span>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="border-slate-200">
              <TableHead className="font-mono text-[11px] uppercase font-bold text-slate-600 py-4 pl-6">Vessel_Name</TableHead>
              <TableHead className="font-mono text-[11px] uppercase font-bold text-slate-600">MMSI</TableHead>
              <TableHead className="font-mono text-[11px] uppercase font-bold text-slate-600">Status</TableHead>
              <TableHead className="text-right font-mono text-[11px] uppercase font-bold text-slate-600 pr-6">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((v: any, i: number) => (
                <TableRow key={i} className="border-slate-100 hover:bg-slate-50 transition-colors group">
                  <TableCell className="font-bold text-slate-900 py-4 pl-6 flex items-center gap-3">
                    <Anchor className="h-4 w-4 text-red-600" />
                    {v.properties?.name || 'VESSEL_DATA'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{v.properties?.mmsi}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">
                      ANCHORED
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-[10px] text-slate-400 uppercase pr-6">
                    {filterPort || 'TRANSIT'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    <p className="font-mono text-xs uppercase italic">Synchronizing_Manifest...</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION CONTROLS */}
        {filteredData.length > itemsPerPage && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 font-mono">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-slate-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <span className="text-[11px] font-bold font-mono px-3">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}