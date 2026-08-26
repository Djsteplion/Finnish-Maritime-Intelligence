'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import PortVesselTable from '@/app/ui/dashboard/ports/port-vessel-table'

const PortCongestionMap = dynamic(() => import('@/app/ui/dashboard/ports/port-map'), { 
  ssr: false,
  loading: () => <div className="h-[450px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
})

const IncomingVesselsChart = dynamic(() => import('@/app/ui/dashboard/ports/incoming-chart'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
})

export default function PortsPage() {
  const [selectedPort, setSelectedPort] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 1. Map (70%) */}
        <Card className="lg:w-[70%] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono uppercase tracking-tighter text-slate-800 dark:text-slate-200">
              Baltic_Congestion_Live
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[450px] relative">
            <PortCongestionMap onPortSelect={setSelectedPort} />
          </CardContent>
        </Card>

        {/* 2. Chart (30%) - RESTORED */}
        <Card className="lg:w-[30%] border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <IncomingVesselsChart />
        </Card>
      </div>

      {/* 3. Table - RESTORED TO LIGHT MODE STYLE */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <div className="space-y-1">
            <CardTitle className="text-lg font-mono uppercase text-slate-900 dark:text-white">
              Anchored_Vessels
            </CardTitle>
            <CardDescription className="text-sm italic text-slate-500">
              Real-time manifest for {selectedPort || 'All Ports'}
            </CardDescription>
          </div>
          
          {selectedPort && (
            <button 
              onClick={() => setSelectedPort(null)}
              className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-600 hover:text-white transition-all text-xs font-bold uppercase"
            >
              {selectedPort} ✕
            </button>
          )}
        </CardHeader>
        <CardContent>
          <PortVesselTable filterPort={selectedPort} />
        </CardContent>
      </Card>
    </div>
  )
}