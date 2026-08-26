'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const IcebreakerMap = dynamic(() => import('@/app/ui/dashboard/icebreakers/icebreaker-map'), { 
  ssr: false,
  loading: () => <div className="h-[450px] w-full bg-slate-100 animate-pulse rounded-2xl" />
})

const IcebreakerActivityChart = dynamic(() => import('@/app/ui/dashboard/icebreakers/activity-chart'), { 
  ssr: false 
})

const IcebreakerTable = dynamic(() => import('@/app/ui/dashboard/icebreakers/icebreaker-table'), { 
  ssr: false 
})

export default function IcebreakersPage() {
  const [selectedIcebreaker, setSelectedIcebreaker] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map - 70% */}
        <Card className="lg:w-[70%] border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-mono uppercase tracking-tighter flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              Arctic_Escort_Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[450px] relative">
            <IcebreakerMap onSelect={setSelectedIcebreaker} />
          </CardContent>
        </Card>

        {/* Activity Chart - 30% */}
        <Card className="lg:w-[30%] border-slate-200 shadow-sm bg-white">
          <IcebreakerActivityChart />
        </Card>
      </div>

      {/* Details Table - 100% */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="text-[11px] font-mono uppercase md:text-[22px]">Ice_breaker_Fleet_Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <IcebreakerTable filterName={selectedIcebreaker} />
        </CardContent>
      </Card>
    </div>
  )
}