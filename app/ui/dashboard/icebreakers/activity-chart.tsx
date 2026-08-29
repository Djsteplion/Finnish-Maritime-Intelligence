/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useState, useEffect } from 'react'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts'
import {
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, Activity } from 'lucide-react'

export default function IcebreakerActivityChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChartData() {
      try {
        const res = await fetch(
          'https://meri.digitraffic.fi/api/winter-navigation/v2/vessels',
          { cache: 'no-store' }
        )

        if (!res.ok) throw new Error('Request failed')

        const vData = await res.json()
        const vesselList = vData.vessels || []

        const formatted = vesselList
          .filter(
            (v: any) =>
              v.activities &&
              v.activities.length > 0
          )
          .map((v: any) => ({
            name: v.name.split(' ')[0].toUpperCase(),
            count: v.activities.length,
          }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 8)

        setData(formatted)
      } catch (e) {
        console.error('Chart Error:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <div className="w-full min-h-[350px] md:min-h-[400px] flex flex-col">
      <CardHeader className="pb-0 px-4 md:px-6">
        <CardTitle className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          Historical_Mission_Load
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 w-full pt-6 pb-2 px-4">

        {data.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 mb-4">
              <Activity className="h-7 w-7 text-sky-400" />
            </div>

            <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-700">
              No Mission Activity
            </p>

            <p className="mt-2 max-w-[220px] text-[10px] leading-relaxed text-slate-400">
              No icebreaker activity is currently available
              from the live Winter Navigation feed.
            </p>

            <span className="mt-4 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[9px] font-mono text-slate-400 uppercase">
              Activity_Count: 0
            </span>

          </div>
        ) : (
          <div className="h-[300px] md:h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: -25,
                  bottom: 40,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 9,
                    fontWeight: 800,
                    fill: '#64748b',
                  }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: '#94a3b8',
                  }}
                />

                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow:
                      '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                />

                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.count > 10
                          ? '#0284c7'
                          : '#38bdf8'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </CardContent>
    </div>
  )
}