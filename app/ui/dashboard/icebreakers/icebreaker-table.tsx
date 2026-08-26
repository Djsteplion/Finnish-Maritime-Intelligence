/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ChevronLeft, ChevronRight, Search, Ship } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function IcebreakerTable({ filterName }: { filterName: string | null }) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    async function getAccurateData() {
      try {
        const vRes = await fetch('https://meri.digitraffic.fi/api/winter-navigation/v2/vessels')
        const vData = await vRes.json()
        const vesselList = vData.vessels || []

        const processed = vesselList.map((v: any) => {
          const currentActivity = v.activities && v.activities.length > 0 
            ? v.activities[0] 
            : null

          return {
            name: v.name,
            mmsi: v.mmsi,
            type: v.type,
            status: currentActivity ? currentActivity.type : 'STANDBY',
            assisting: currentActivity?.assistingVessel?.name || '---',
            imo: v.imo
          }
        })
        
        setRows(processed)
      } catch (e) {
        console.error("Table Error:", e)
      } finally {
        setLoading(false)
      }
    }
    getAccurateData()
  }, [])

  // Combine parent filterName and local searchTerm
  const filteredRows = rows.filter((r: any) => {
    const matchesGlobal = filterName ? r.name.toLowerCase().includes(filterName.toLowerCase()) : true
    const matchesLocal = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.assisting.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesGlobal && matchesLocal
  })

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage)

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-sky-500" /></div>

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search for icebreaker or assisted_vessel..." 
            className="pl-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-sky-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        
        <div className="flex gap-2">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 border border-cyan-100 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[9px] font-bold text-cyan-700 uppercase tracking-tight md:text-[10px]">
                Active LED: {rows.filter(r => r.status === 'LED').length}
              </span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[9px] font-bold text-blue-700 uppercase tracking-tight md:text-[10px]">
                Active TOW: {rows.filter(r => r.status === 'TOW').length}
              </span>
           </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-mono text-[10px] uppercase py-4 pl-6 text-slate-500">ICE-BREAKER</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-slate-500">Ice_Breaker_Id</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-slate-500">Vessel_Assisted</TableHead>
              <TableHead className="text-right font-mono text-[10px] uppercase pr-6 text-slate-500">Operational_Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? currentItems.map((r, i) => (
              <TableRow key={i} className="group hover:bg-slate-50/80 transition-colors">
                <TableCell className="pl-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 uppercase leading-none">{r.name}</span>
                    <span className="text-[9px] text-slate-400 mt-1">{r.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <div className="font-mono text-[10px] text-slate-500">
                    MMSI: {r.mmsi}<br/>
                    IMO: {r.imo || '---'}
                   </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    {r.assisting !== '---' && <Ship className="h-3 w-3 text-slate-300" />}
                    <span className={r.assisting === '---' ? 'text-slate-300' : 'font-medium'}>{r.assisting}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black border uppercase transition-all ${
                    r.status === 'LED' ? 'bg-cyan-100 text-cyan-700 border-cyan-200 shadow-sm shadow-cyan-100' :
                    r.status === 'TOW' ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm shadow-blue-100' :
                    'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {r.status}
                  </span>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Search className="h-8 w-8 stroke-1" />
                    <p className="font-mono text-xs italic">QUERY_RETURNED_ZERO_RESULTS</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-[11px] font-mono text-slate-500 uppercase tracking-tighter">
          Displaying_Index: <span className="text-slate-900 font-bold">{indexOfFirstItem + 1}</span> - <span className="text-slate-900 font-bold">{Math.min(indexOfLastItem, filteredRows.length)}</span> / Total_Fleet: {filteredRows.length}
        </p>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <span className="text-[10px] font-black text-slate-900 uppercase">Page {currentPage} of {totalPages}</span>
          <div className="h-6 w-px bg-slate-200" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>
    </div>
  )
}