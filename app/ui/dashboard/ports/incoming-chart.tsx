/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Static base data
const baseData = [
  { port: "Helsinki", incoming: 186 },
  { port: "Gdansk", incoming: 305 },
  { port: "Tallinn", incoming: 237 },
  { port: "Riga", incoming: 173 },
  { port: "Klaipeda", incoming: 209 },
]

const chartConfig = {
  incoming: {
    label: "Incoming Vessels",
    color: "hsl(var(--destructive))", 
  },
} satisfies ChartConfig

export default function IncomingVesselsChart() {
  const [period, setPeriod] = useState("30")

  // Reactively calculate data based on the selected period
  const activeData = useMemo(() => {
    const multiplier = period === "7" ? 0.25 : period === "90" ? 2.8 : 1;
    return baseData.map(item => ({
      ...item,
      // Rounding to keep the numbers clean
      incoming: Math.floor(item.incoming * multiplier)
    }));
  }, [period]);

  return (
    <>
      <CardHeader className="pb-2 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono uppercase">Incoming_Traffic</CardTitle>
          <Select defaultValue="30" onValueChange={setPeriod}>
            <SelectTrigger className="w-[80px] h-8 text-[10px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7D</SelectItem>
              <SelectItem value="30">30D</SelectItem>
              <SelectItem value="90">90D</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription className="text-[11px]">Ports with highest arrival volume</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={activeData}
            layout="vertical"
            margin={{ left: -20 }}
          >
            <XAxis type="number" dataKey="incoming" hide />
            <YAxis
              dataKey="port"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3).toUpperCase()}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="incoming"
              fill="var(--color-incoming)"
              radius={5}
              barSize={20}
              // Adding a subtle animation for visual feedback when data changes
              animationDuration={800}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </>
  )
}