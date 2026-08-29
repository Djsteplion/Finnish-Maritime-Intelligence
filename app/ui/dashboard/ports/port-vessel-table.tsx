/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Input } from '@/components/ui/input'

import {
  Search,
  Anchor,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface Props {
  filterPort: string | null
}

const STATUS_MAP: Record<
  number,
  string
> = {
  0: 'UNDER WAY',
  1: 'AT ANCHOR',
  2: 'NOT UNDER COMMAND',
  3: 'RESTRICTED',
  4: 'CONSTRAINED BY DRAUGHT',
  5: 'MOORED',
  6: 'AGROUND',
  7: 'FISHING',
  8: 'SAILING',
  9: 'HAZARDOUS CARGO',
  10: 'HAZARDOUS CARGO',
  11: 'TOWING',
  12: 'PUSHING',
  14: 'AIS-SART',
  15: 'UNKNOWN',
}

export default function PortVesselTable({
  filterPort,
}: Props) {
  const [
    selectedPortVessels,
    setSelectedPortVessels,
  ] = useState<any[]>([])

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const itemsPerPage = 10

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)

        const response =
          await fetch(
            '/api/port-presence',
            {
              cache: 'no-store',
            }
          )

        if (!response.ok) {
          throw new Error(
            `Failed to load port vessels: ${response.status}`
          )
        }

        const data =
          await response.json()

        if (!cancelled) {
          setSelectedPortVessels(
            Array.isArray(
              data?.vessels
                ?.features
            )
              ? data.vessels.features
              : []
          )
        }
      } catch (error) {
        console.error(
          'Port vessel sync failed:',
          error
        )

        if (!cancelled) {
          setSelectedPortVessels(
            []
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    filterPort,
    search,
  ])

  const filteredData =
    useMemo(() => {
      let data =
        selectedPortVessels

      if (filterPort) {
        const normalizedFilter =
          filterPort
            .trim()
            .toLowerCase()

        data =
          data.filter(
            (vessel: any) => {
              const properties =
                vessel?.properties ??
                {}

              return (
                String(
                  properties?.portName ??
                    ''
                )
                  .trim()
                  .toLowerCase() ===
                normalizedFilter
              )
            }
          )
      }

      if (search.trim()) {
        const query =
          search
            .trim()
            .toLowerCase()

        data =
          data.filter(
            (vessel: any) => {
              const properties =
                vessel?.properties ??
                {}

              const vesselName =
                properties?.name ??
                properties?.shipName ??
                properties?.vesselName ??
                ''

              const mmsi =
                properties?.mmsi ??
                ''

              return (
                String(
                  vesselName
                )
                  .toLowerCase()
                  .includes(
                    query
                  ) ||
                String(
                  mmsi
                ).includes(
                  search.trim()
                )
              )
            }
          )
      }

      return data
    }, [
      selectedPortVessels,
      filterPort,
      search,
    ])

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredData.length /
          itemsPerPage
      )
    )

  const paginatedData =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        itemsPerPage

      return filteredData.slice(
        start,
        start + itemsPerPage
      )
    }, [
      filteredData,
      currentPage,
    ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

          <Input
            placeholder="Search by vessel or MMSI..."
            className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-red-500 text-sm h-10"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            VESSELS_IN_PORT
          </span>

          <span className="text-xl font-mono font-black text-red-600">
            {filteredData.length
              .toString()
              .padStart(3, '0')}
          </span>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="border-slate-200">
              <TableHead className="font-mono text-[11px] uppercase font-bold text-slate-600 py-4 pl-6">
                Vessel_Name
              </TableHead>

              <TableHead className="font-mono text-[11px] uppercase font-bold text-slate-600">
                MMSI
              </TableHead>

              <TableHead className="font-mono text-[11px] uppercase font-bold text-slate-600">
                Status
              </TableHead>

              <TableHead className="text-right font-mono text-[11px] uppercase font-bold text-slate-600 pr-6">
                Location
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />

                    <p className="font-mono text-xs uppercase italic">
                      Synchronizing_Manifest...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length >
              0 ? (
              paginatedData.map(
                (
                  vessel: any,
                  index: number
                ) => {
                  const properties =
                    vessel?.properties ??
                    {}

                  const vesselName =
                    properties?.name ??
                    properties?.shipName ??
                    properties?.vesselName ??
                    'UNKNOWN VESSEL'

                  const mmsi =
                    properties?.mmsi ??
                    '—'

                  const navStat =
                    Number(
                      properties?.navStat
                    )

                  const status =
                    STATUS_MAP[
                      navStat
                    ] ??
                    'UNKNOWN'

                  const portName =
                    properties?.portName ??
                    filterPort ??
                    'PORT'

                  return (
                    <TableRow
                      key={
                        mmsi !== '—'
                          ? mmsi
                          : index
                      }
                      className="border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <TableCell className="font-bold text-slate-900 py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <Anchor className="h-4 w-4 text-red-600 shrink-0" />

                          <span className="truncate max-w-[240px]">
                            {String(
                              vesselName
                            ).toUpperCase()}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-slate-500">
                        {mmsi}
                      </TableCell>

                      <TableCell>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase">
                          {status}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-mono text-[10px] text-slate-400 uppercase pr-6">
                        {portName}
                      </TableCell>
                    </TableRow>
                  )
                }
              )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-40 text-center"
                >
                  <p className="font-mono text-xs uppercase italic text-slate-400">
                    No_Vessels_Currently_In_Port
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {filteredData.length >
          itemsPerPage && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 font-mono">
              Showing{' '}
              {(currentPage - 1) *
                itemsPerPage +
                1}{' '}
              to{' '}
              {Math.min(
                currentPage *
                  itemsPerPage,
                filteredData.length
              )}{' '}
              of{' '}
              {filteredData.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous page"
                onClick={() =>
                  setCurrentPage(
                    (previous) =>
                      Math.max(
                        previous - 1,
                        1
                      )
                  )
                }
                disabled={
                  currentPage === 1
                }
                className="p-1.5 rounded border border-slate-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-[11px] font-bold font-mono px-3">
                {currentPage} /{' '}
                {totalPages}
              </span>

              <button
                type="button"
                aria-label="Next page"
                onClick={() =>
                  setCurrentPage(
                    (previous) =>
                      Math.min(
                        previous + 1,
                        totalPages
                      )
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                className="p-1.5 rounded border border-slate-200 bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}