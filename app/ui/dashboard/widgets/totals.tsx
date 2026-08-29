/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useState, useEffect } from 'react'

import { Card, CardContent } from "@/components/ui/card"

import {
  Ship,
  Snowflake,
  Anchor,
  Wind,
  Thermometer,
  Gauge
} from "lucide-react"

type Stats = {
  vessels: number
  icebreakers: number
  ports: number
  avgSpeed: number
  temp: string
  weather: string
}

export default function FleetTotals() {
  const [stats, setStats] = useState<Stats>({
    vessels: 0,
    icebreakers: 0,
    ports: 0,
    avgSpeed: 0,
    temp: '--',
    weather: 'Loading...'
  })

  useEffect(() => {
    let cancelled = false

    async function getDashboardData() {
      try {
        const [
          locationsResponse,
          winterVesselsResponse,
          portsResponse,
          weatherResponse
        ] = await Promise.all([
          fetch(
            'https://meri.digitraffic.fi/api/ais/v1/locations',
            {
              cache: 'no-store',
              headers: {
                'Accept': 'application/json'
              }
            }
          ),

          fetch(
            'https://meri.digitraffic.fi/api/winter-navigation/v2/vessels',
            {
              cache: 'no-store',
              headers: {
                'Accept': 'application/json'
              }
            }
          ),

          fetch(
            'https://meri.digitraffic.fi/api/port-call/v1/ports',
            {
              cache: 'no-store',
              headers: {
                'Accept': 'application/json'
              }
            }
          ),

          fetch(
            'https://opendata.fmi.fi/wfs?' +
              'service=WFS&' +
              'version=2.0.0&' +
              'request=getFeature&' +
              'storedquery_id=fmi::observations::weather::simple&' +
              'place=Helsinki&' +
              'parameters=t2m,wawa',
            {
              cache: 'no-store'
            }
          )
        ])

        if (
          !locationsResponse.ok ||
          !winterVesselsResponse.ok ||
          !portsResponse.ok ||
          !weatherResponse.ok
        ) {
          throw new Error('One or more data sources failed')
        }

        const locations = await locationsResponse.json()
        const winterData = await winterVesselsResponse.json()
        const ports = await portsResponse.json()
        const weatherXml = await weatherResponse.text()
        

        /*
         * -------------------------------------------------------
         * TOTAL VESSELS
         * -------------------------------------------------------
         *
         * Current AIS vessel locations.
         *
         * Digitraffic describes /locations as the latest vessel
         * locations received from AIS.
         */
        const totalVessels =
          Array.isArray(locations?.features)
            ? locations.features.length
            : 0

        /*
         * -------------------------------------------------------
         * AVERAGE SOG
         * -------------------------------------------------------
         *
         * Average speed over ground for vessels actually moving.
         *
         * SOG is already expressed in knots by the AIS API.
         */
        const speeds = (
          locations?.features ?? []
        )
          .map((feature: any) =>
            Number(feature?.properties?.sog)
          )
          .filter(
            (speed: number) =>
              Number.isFinite(speed) &&
              speed > 0.5
          )

        const avgSog =
          speeds.length > 0
            ? speeds.reduce(
                (sum: number, speed: number) =>
                  sum + speed,
                0
              ) / speeds.length
            : 0

        /*
         * -------------------------------------------------------
         * ACTIVE PORTS
         * -------------------------------------------------------
         *
         * /ports is the official Digitraffic port metadata
         * endpoint.
         *
         * It represents actual ports, rather than counting
         * temporary port-call records.
         */
        const portList = Array.isArray(ports)
          ? ports
          : ports?.ports ??
            ports?.features ??
            []

        const availablePorts =
        Array.isArray(ports?.ssnLocations?.features)
          ? new Set(
              ports.ssnLocations.features
                .filter(
                  (port: any) =>
                    port?.properties?.country === "Finland"
                )
                .map((port: any) => port?.locode)
                .filter(Boolean)
            ).size
          : 0

        const uniquePorts = new Set<string>()

        for (const port of portList) {
          const locode =
            port?.locode ??
            port?.portCode ??
            port?.locationCode ??
            port?.properties?.locode

          if (locode) {
            uniquePorts.add(String(locode))
          }
        }

        /*
         * -------------------------------------------------------
         * ICEBREAKERS
         * -------------------------------------------------------
         *
         * IMPORTANT:
         *
         * Do NOT use AIS shipType === 31.
         *
         * Digitraffic's Winter Navigation API explicitly provides
         * a vessel "type" field whose supported values include
         * "Icebreaker".
         */
        const winterVessels =
          winterData?.vessels ??
          winterData?.features ??
          winterData?.data ??
          (Array.isArray(winterData) ? winterData : [])

        const icebreakers = winterVessels.filter((vessel: any) =>
          String(
            vessel?.type ??
            vessel?.properties?.type ??
            vessel?.vesselType ??
            vessel?.properties?.vesselType ??
            ''
          ).toLowerCase().includes('icebreaker')
        )

        /*
         * -------------------------------------------------------
         * FMI WEATHER
         * -------------------------------------------------------
         *
         * FMI returns the observation as XML.
         *
         * We request:
         *
         * t2m  = air temperature
         * wawa = present weather / weather symbol
         */
        const parser = new DOMParser()

          const weatherDocument = parser.parseFromString(
            weatherXml,
            'application/xml'
          )

          const weatherElements = Array.from(
            weatherDocument.getElementsByTagNameNS(
              'http://xml.fmi.fi/schema/wfs/2.0',
              'BsWfsElement'
            )
          )

          const weatherData: Record<string, string> = {}
          let observationTime = ''

          for (const element of weatherElements) {
            const parameterName =
              element
                .getElementsByTagNameNS(
                  'http://xml.fmi.fi/schema/wfs/2.0',
                  'ParameterName'
                )[0]
                ?.textContent
                ?.trim()

            const parameterValue =
              element
                .getElementsByTagNameNS(
                  'http://xml.fmi.fi/schema/wfs/2.0',
                  'ParameterValue'
                )[0]
                ?.textContent
                ?.trim()

            const time =
              element
                .getElementsByTagNameNS(
                  'http://xml.fmi.fi/schema/wfs/2.0',
                  'Time'
                )[0]
                ?.textContent
                ?.trim()

            if (parameterName && parameterValue) {
              weatherData[parameterName] = parameterValue
            }

            if (time) {
              observationTime = time
            }
          }

          const temperatureValue = Number(weatherData.t2m)

          const temperature = Number.isFinite(temperatureValue)
            ? temperatureValue.toFixed(1)
            : '--'

          const weatherCode = Number(weatherData.wawa)

          const weatherCondition = getWeatherCondition(weatherCode)

        if (!cancelled) {
          setStats({
           vessels: totalVessels,
            icebreakers: icebreakers.length,
            ports: availablePorts,
            avgSpeed: Number(avgSog.toFixed(1)),
            temp: temperature,
            weather: weatherCondition
          })
        }

        console.info(
          'Marine dashboard updated:',
          {
            vessels: totalVessels,
            icebreakers: icebreakers.length,
            ports: uniquePorts.size,
            avgSog: Number(
              avgSog.toFixed(1)
            ),
            temperature,
            weather: weatherCondition,
            weatherCode,
            observationTime
          }
        )
      } catch (error) {
        console.error(
          'Dashboard Stats Error:',
          error
        )
      }
    }

    getDashboardData()

    /*
     * Digitraffic APIs are commonly cached around one minute,
     * so refreshing once per minute is appropriate.
     */
    const interval = window.setInterval(
      getDashboardData,
      60_000
    )

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [])

  const topCards = [
    {
      label: "Total Vessels",
      value: stats.vessels,
      icon: Ship,
      trend: "Vessels In Area"
    },
    {
      label: "Icebreakers",
      value: stats.icebreakers,
      icon: Snowflake,
      trend: "Winter Navigation"
    },
    {
      //label: "Active Ports",
      label: 'Available Ports',
      value: stats.ports,
      icon: Anchor,
      trend: "Registered"
    }
  ]

  return (
    <>
      <h2 className="text-[14px] md:-mt-7 font-black uppercase tracking-[0.05em] text-slate-800 mb-1 md:text-3xl md:mb-8">
        Finnish Marine Intelligence (FMI) Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-8">

        {topCards.map((card, i) => (
          <Card
            key={i}
            className="overflow-hidden border-none bg-white shadow-2xl transition-transform hover:scale-[1.02]"
          >
            <div className="flex h-full">

              <div className="w-2 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />

              <CardContent className="p-4 flex flex-col justify-between w-full">

                <div className="flex justify-between items-start">

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                      {card.label}
                    </p>

                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                      {card.value}
                    </h2>
                  </div>

                  <div className="bg-red-50 p-2 rounded-lg">
                    <card.icon className="w-5 h-5 text-red-600" />
                  </div>

                </div>

                <div className="mt-4 flex items-center gap-2">

                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />

                  <span className="text-[9px] font-mono font-bold text-red-600 uppercase">
                    {card.trend}
                  </span>

                </div>

              </CardContent>
            </div>
          </Card>
        ))}

        {/* Finland Sea Metrics */}

        <Card className="bg-red-600 border-none shadow-2xl lg:col-span-1 overflow-hidden">

          <CardContent className="p-4 text-white h-full">

            <div className="flex items-center gap-2 mb-3">

              <div className="h-px flex-1 bg-white/30" />

              <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/80">
                FIN_SEA_METRICS
              </p>

            </div>

            <div className="grid grid-cols-2 gap-y-4">

              <div className="flex items-center gap-2">

                <Thermometer className="w-4 h-4 text-white/70" />

                <div>
                  <p className="text-[8px] uppercase text-white/60">
                    Air Temp
                  </p>

                  <p className="text-sm font-bold">
                    {stats.temp}°C
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2">

                <Gauge className="w-4 h-4 text-white/70" />

                <div>
                  <p className="text-[8px] uppercase text-white/60">
                    Avg SOG
                  </p>

                  <p className="text-sm font-bold">
                    {stats.avgSpeed} kn
                  </p>
                </div>

              </div>

              <div className="col-span-2 flex items-center gap-2 pt-2 border-t border-white/10">

                <Wind className="w-4 h-4 text-white/70" />

                <div>

                  <p className="text-[8px] uppercase text-white/60">
                    Condition
                  </p>

                  <p className="text-[11px] font-black uppercase italic">
                    {stats.weather}
                  </p>

                </div>

              </div>

            </div>

          </CardContent>
        </Card>

      </div>
    </>
  )
}

/*
 * -----------------------------------------------------------
 * FMI WEATHER SYMBOL TRANSLATION
 * -----------------------------------------------------------
 *
 * FMI's wawa observation is a numeric present-weather code.
 *
 * These are WMO present-weather codes.
 */
function getWeatherCondition(code: number): string {
  if (!Number.isFinite(code)) {
    return 'Unavailable'
  }

  if (code === 0) return 'Clear'
  if (code === 1) return 'Mainly Clear'
  if (code === 2) return 'Partly Cloudy'
  if (code === 3) return 'Overcast'

  if (code >= 4 && code <= 9) {
    return 'Hazy'
  }

  if (code >= 10 && code <= 19) {
    return 'Fog'
  }

  if (code >= 20 && code <= 29) {
    return 'Recent Weather'
  }

  if (code >= 30 && code <= 39) {
    return 'Dust / Haze'
  }

  if (code >= 40 && code <= 49) {
    return 'Fog'
  }

  if (code >= 50 && code <= 59) {
    return 'Drizzle'
  }

  if (code >= 60 && code <= 69) {
    return 'Rain'
  }

  if (code >= 70 && code <= 79) {
    return 'Snow'
  }

  if (code >= 80 && code <= 84) {
    return 'Rain Showers'
  }

  if (code >= 85 && code <= 86) {
    return 'Snow Showers'
  }

  if (code >= 87 && code <= 90) {
    return 'Showers'
  }

  if (code >= 91 && code <= 94) {
    return 'Thunderstorm'
  }

  if (code >= 95 && code <= 99) {
    return 'Thunderstorm'

  }

  return 'Unknown'
}