'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useVessels } from '../vessel-context' // Import the context hook

export default function VesselTable() {
  // 1. Grab global state from Context instead of Props
  const { handleVesselSelect, selected } = useVessels();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    async function fetchTableData() {
      try {
        const res = await fetch('/api/vessels')
        const json = await res.json()
        // Map GeoJSON features to their properties for the table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData(json.features.map((f: any) => ({
          ...f.properties,
          // Ensure coordinates are available if we select from the table
          longitude: f.geometry.coordinates[0],
          latitude: f.geometry.coordinates[1]
        })))
      } catch (err) {
        console.error("Table fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTableData()
  }, [])

  // Filter Logic
  const filteredData = data.filter(v => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.mmsi?.toString().includes(searchTerm)
  )

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  if (loading) return (
    <div className="p-10 text-center text-slate-500 animate-pulse font-mono text-xs italic tracking-widest">
      INITIALIZING_FLEET_DATA...
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <Input 
        placeholder="Filter by name...." 
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setCurrentPage(1) // Reset to page 1 on search
        }}
        className="max-w-sm bg-slate-900 border-slate-800 text-white placeholder:text-slate-400 focus:ring-blue-500"
      />

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
        <Table>
          <TableHeader className="bg-slate-800/50">
            <TableRow className="border-slate-800 hover:bg-transparent text-[10px] uppercase tracking-wider">
              <TableHead className="text-slate-400">Vessel Name</TableHead>
              <TableHead className="text-slate-400">MMSI</TableHead>
              <TableHead className="text-slate-400">Destination</TableHead>
              <TableHead className="text-slate-400 text-right">Speed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((vessel) => (
                <TableRow 
                    key={vessel.mmsi} 
                    onClick={() => handleVesselSelect(vessel)} 
                    className={`cursor-pointer border-slate-200 dark:border-slate-800 transition-all ${
                        selected?.mmsi === vessel.mmsi 
                        ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-600' // Red Accent
                        : 'hover:bg-white dark:hover:bg-slate-800'
                    }`}
                    >
                    <TableCell className="font-bold text-slate-400 dark:text-white">
                        {vessel.name || 'unknown' }
                    </TableCell>
                    <TableCell className="font-mono text-red-600 dark:text-red-400 font-semibold">
                        {vessel.mmsi}
                    </TableCell>
                  <TableCell className="text-slate-300 truncate max-w-[150px] italic">
                    {vessel.destination || '---'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-emerald-400">
                    {vessel.sog || '0.0'} kn
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500 font-mono text-xs">
                  NO_MATCHING_VESSELS_FOUND
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">
            PAGE {currentPage} OF {totalPages || 1}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 border-slate-700 bg-slate-800 text-white hover:bg-slate-700 text-xs transition-all"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 border-slate-700 bg-slate-800 text-white hover:bg-slate-700 text-xs transition-all"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}