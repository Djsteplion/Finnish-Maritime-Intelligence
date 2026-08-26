/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function IcebreakerActivityChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChartData() {
      try {
        const res = await fetch('https://meri.digitraffic.fi/api/winter-navigation/v2/vessels')
        const vData = await res.json()
        const vesselList = vData.vessels || []
        
        const formatted = vesselList
          .filter((v: any) => v.activities && v.activities.length > 0)
          .map((v: any) => ({
            name: v.name.split(' ')[0].toUpperCase(),
            count: v.activities.length
          }))
          .sort((a: any, b: any) => b.count - a.count) // Sorting makes the histogram look better
          .slice(0, 8)

        setData(formatted)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchChartData()
  }, [])

  if (loading) return <div className="h-[350px] flex items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>

  return (
    // CHANGE 1: Defined min-heights for different screens so it never collapses
    <div className="w-full min-h-[350px] md:min-h-[400px] flex flex-col">
      <CardHeader className="pb-0 px-2 md:px-6">
        <CardTitle className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          Historical_Mission_Load
        </CardTitle>
      </CardHeader>
      
      {/* CHANGE 2: Using a div with a fixed aspect ratio or height for Recharts to grab onto */}
      <CardContent className="flex-1 w-full pt-6 pb-2 px-0 md:px-4">
        <div className="h-[300px] md:h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 40 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }}
                // CHANGE 3: Angle the labels on mobile so they don't vanish or overlap
                interval={0}
                angle={-30}
                textAnchor="end"
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                {data.map((entry, index) => (
                  // Gradient-like effect: Darker blue for higher activity
                  <Cell key={`cell-${index}`} fill={entry.count > 10 ? '#0284c7' : '#38bdf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </div>
  )
}