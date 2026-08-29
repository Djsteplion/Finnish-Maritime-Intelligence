/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
} from 'recharts'

import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const chartConfig = {
  incoming: {
    label: 'Port Calls',
    color:
      'hsl(var(--destructive))',
  },
} satisfies ChartConfig

export default function IncomingVesselsChart() {
  const [period, setPeriod] =
    useState('30')

  const [data, setData] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)

        const response =
          await fetch(
            `/api/port-calls?days=${period}`,
            {
              cache: 'no-store',
            }
          )

        if (!response.ok) {
          throw new Error(
            'Failed to fetch port calls'
          )
        }

        const result =
          await response.json()

        if (!cancelled) {
          setData(
            result?.ports || []
          )
        }
      } catch (error) {
        console.error(
          'Incoming traffic error:',
          error
        )

        if (!cancelled) {
          setData([])
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
  }, [period])

  return (
    <>
      <CardHeader className="pb-2 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono uppercase">
            Incoming_Traffic
          </CardTitle>

          <Select
            value={period}
            onValueChange={setPeriod}
          >
            <SelectTrigger className="w-[80px] h-8 text-[10px] bg-slate-50 border-slate-200">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="7">
                7D
              </SelectItem>

              <SelectItem value="30">
                30D
              </SelectItem>

              <SelectItem value="90">
                90D
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CardDescription className="text-[11px]">
          Most frequented Finnish ports by actual port calls
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          <div className="h-[260px] flex items-center justify-center text-[10px] font-mono text-slate-400 uppercase">
            Loading_Port_Calls...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-[10px] font-mono text-slate-400 uppercase">
            No_Port_Call_Data
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{
                left: -20,
                right: 12,
              }}
            >
              <XAxis
                type="number"
                dataKey="incoming"
                hide
              />

              <YAxis
                dataKey="port"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={72}
                tickFormatter={(value) =>
                  String(value)
                    .slice(0, 9)
                    .toUpperCase()
                }
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                  />
                }
              />

              <Bar
                dataKey="incoming"
                fill="var(--color-incoming)"
                radius={5}
                barSize={20}
                animationDuration={500}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </>
  )
}