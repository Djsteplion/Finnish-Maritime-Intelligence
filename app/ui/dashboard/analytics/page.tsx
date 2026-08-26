/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Zap, Anchor, Ship } from "lucide-react"

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchProcessedData = useCallback(async () => {
    setLoading(true)
    try {
      const [locRes, vRes, pRes] = await Promise.all([
        fetch('https://meri.digitraffic.fi/api/ais/v1/locations'),
        fetch('https://meri.digitraffic.fi/api/ais/v1/vessels'),
        fetch('https://meri.digitraffic.fi/api/port-call/v1/port-calls')
      ]);

      const locData = await locRes.json();
      const vData = await vRes.json();
      const pData = await pRes.json();

      // Ensure vData is an array before processing
      const vesselMap = new Map();
      if (Array.isArray(vData)) {
        vData.forEach((v: any) => {
          if (v && v.mmsi) vesselMap.set(v.mmsi, v);
        });
      }

      // --- SPEED PROFILE LOGIC ---
      const typeLabels: any = {
        70: 'Cargo', 80: 'Tanker', 31: 'Icebreaker/Tug', 52: 'Pilot', 60: 'Passenger', 90: 'Other_Heavy'
      };

      const speedByGroup: any = {};
      const features = locData?.features || [];
      
      features.forEach((f: any) => {
        const mmsi = f.properties?.mmsi;
        const sog = f.properties?.sog ?? 0;
        const vInfo = vesselMap.get(mmsi);
        
        if (vInfo && sog > 0.1) {
          const type = vInfo.shipType;
          const label = typeLabels[type] || (type >= 70 && type < 80 ? 'Cargo' : type >= 80 && type < 90 ? 'Tanker' : 'Other');
          
          if (!speedByGroup[label]) speedByGroup[label] = { label, totalSog: 0, maxSog: 0, count: 0 };
          speedByGroup[label].totalSog += sog;
          speedByGroup[label].maxSog = Math.max(speedByGroup[label].maxSog, sog);
          speedByGroup[label].count += 1;
        }
      });

      // --- UTILIZATION FREQUENCY LOGIC ---
      const usageMap: any = {};
      const portCalls = pData?.portCalls || [];

      portCalls.forEach((pc: any) => {
        const mmsi = pc.mmsi;
        const vInfo = vesselMap.get(mmsi);
        const name = vInfo?.name || pc.vesselName || `MMSI: ${mmsi}`;
        
        if (!usageMap[mmsi]) usageMap[mmsi] = { name, mmsi, calls: 0 };
        usageMap[mmsi].calls += 1;
      });

      setData({
        efficiencyChart: Object.values(speedByGroup).map((s: any) => ({
          type: s.label,
          avg: parseFloat((s.totalSog / s.count).toFixed(1)),
          max: s.maxSog
        })).sort((a,b) => b.max - a.max),
        utilizationTable: Object.values(usageMap)
          .sort((a: any, b: any) => b.calls - a.calls)
          .slice(0, 15)
      });
    } catch (e) {
      console.error("DATA_SYNC_ERROR", e);
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProcessedData() }, [fetchProcessedData])

  // Safety: If loading or data structure is missing, show loader
  if (loading || !data?.efficiencyChart || !data?.utilizationTable) return (
    <div className="h-screen flex items-center justify-center bg-slate-950 font-mono text-cyan-500 uppercase tracking-widest animate-pulse">
      Initialising_Fleet_Intelligence...
    </div>
  )

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-slate-200">
      <header className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-[16px] font-black text-white uppercase italic tracking-tighter md:text-[26px]">FLEET_INTELLIGENCE</h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase">Speed_Analysis_Chart</p>
        </div>
        <Ship className="text-cyan-500 w-6 h-6" />
      </header>

      {/* Speed Matrix Line Chart */}
      <Card className="bg-slate-900 border-slate-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xs font-mono text-cyan-400 uppercase flex items-center gap-2">
            <Zap className="w-4 h-4" /> Speed_Comparison_By_Type (Knots)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.efficiencyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="type" tick={{fontSize: 10, fill: '#64748b'}} />
              <YAxis tick={{fontSize: 10, fill: '#64748b'}} />
              <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
              <Legend />
              <Line name="Avg Operational" type="monotone" dataKey="avg" stroke="#22d3ee" strokeWidth={3} dot={{r: 4}} />
              <Line name="Max Peak" type="monotone" dataKey="max" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Utilization Table */}
      <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
          <CardTitle className="text-xs font-mono text-slate-300 uppercase flex items-center gap-2">
            <Ship className="w-4 h-4" /> Port_Call_Frequency_Ranking
          </CardTitle>
        </div>
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-500 font-mono text-[10px] pl-8">VESSEL_NAME</TableHead>
              <TableHead className="text-slate-500 font-mono text-[10px]">MMSI</TableHead>
              <TableHead className="text-slate-500 font-mono text-[10px]">CALL_COUNT</TableHead>
              <TableHead className="text-slate-500 font-mono text-[10px] text-right pr-8">ACTIVITY_INDEX</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.utilizationTable.map((v: any, i: number) => (
              <TableRow key={i} className="border-slate-800 hover:bg-slate-800/60 transition-colors">
                <TableCell className="font-bold text-xs pl-8 uppercase text-slate-100">{v.name}</TableCell>
                <TableCell className="font-mono text-[10px] text-slate-500">{v.mmsi}</TableCell>
                <TableCell className="font-mono text-xs text-cyan-400 font-bold">{v.calls} CALLS</TableCell>
                <TableCell className="pr-8">
                  <div className="ml-auto w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full" 
                      style={{ width: `${Math.min(v.calls * 10, 100)}%` }} 
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}