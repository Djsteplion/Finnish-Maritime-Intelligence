/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect, useRef, memo, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { IceCreamBowl, Radio, ShieldCheck } from 'lucide-react'

interface IcebreakerMapProps {
  onSelect: (name: string) => void
}

const ARCTIC_VIEW = {
  center: [23.5, 63.5] as [number, number],
  zoom: 5,
}

function IcebreakerMap({ onSelect }: IcebreakerMapProps) {
  const mountPoint = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [empty, setEmpty] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!mountPoint.current) return

    const map = new maplibregl.Map({
      container: mountPoint.current,
      style:
        'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: ARCTIC_VIEW.center,
      zoom: ARCTIC_VIEW.zoom,
      attributionControl: false,
    })

    mapRef.current = map

    map.on('load', async () => {
      try {
        const vRes = await fetch(
          'https://meri.digitraffic.fi/api/winter-navigation/v2/vessels',
          { cache: 'no-store' }
        )

        if (!vRes.ok) throw new Error('Winter navigation request failed')

        const vGeo = await vRes.json()
        const icebreakerRegistry = vGeo.vessels || []

        if (icebreakerRegistry.length === 0) {
          setEmpty(true)
          return
        }

        const icebreakerMmsis = new Set(
          icebreakerRegistry.map((v: any) => v.mmsi)
        )

        const aisRes = await fetch(
          'https://meri.digitraffic.fi/api/ais/v1/locations',
          { cache: 'no-store' }
        )

        if (!aisRes.ok) throw new Error('AIS request failed')

        const aisData = await aisRes.json()

        const icebreakerFeatures = (aisData.features || [])
          .filter((f: any) =>
            icebreakerMmsis.has(f.properties?.mmsi)
          )
          .map((f: any) => {
            const meta = icebreakerRegistry.find(
              (v: any) => v.mmsi === f.properties?.mmsi
            )

            return {
              ...f,
              properties: {
                ...f.properties,
                name:
                  meta?.name ||
                  `MMSI: ${f.properties?.mmsi}`,
                status:
                  meta?.activities?.[0]?.type || 'STANDBY',
                target:
                  meta?.activities?.[0]?.assistingVessel?.name ||
                  '---',
              },
            }
          })

        if (icebreakerFeatures.length === 0) {
          setEmpty(true)
          return
        }

        map.addSource('icebreakers-src', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: icebreakerFeatures,
          } as any,
        })

        map.addLayer({
          id: 'icebreaker-layer',
          type: 'circle',
          source: 'icebreakers-src',
          paint: {
            'circle-radius': 10,
            'circle-color': [
              'match',
              ['get', 'status'],
              'LED',
              '#22d3ee',
              'TOW',
              '#3b82f6',
              '#94a3b8',
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        })

        map.on('click', 'icebreaker-layer', (e: any) => {
          const feature = e.features?.[0]
          if (!feature) return

          const p = feature.properties

          onSelect(p.name)

          new maplibregl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setHTML(`
              <div style="
                color:black;
                padding:5px;
                font-family:monospace;
                font-size:12px;
              ">
                <b style="font-size:14px;">${p.name}</b><br/>
                STATUS:
                <span style="color:#0891b2">${p.status}</span><br/>
                ASSISTED_VESSEL: ${p.target}
              </div>
            `)
            .addTo(map)
        })
      } catch (err) {
        console.error('AIS Map Error:', err)
        setError(true)
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [onSelect])

  return (
    <div className="w-full h-full relative min-h-125 bg-slate-950 rounded-xl overflow-hidden">

      <div ref={mountPoint} className="absolute inset-0 w-full h-full" />

      {/* Empty state */}
      {empty && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-[90%] max-w-sm rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-md shadow-2xl p-7 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/20">
              <IceCreamBowl className="h-7 w-7 text-cyan-400" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                Fleet Status
              </span>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              No Active Icebreakers
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              No icebreakers are currently operating 
              in the Winter Navigation area.
            </p>

            <div className="mt-5 flex items-center justify-center gap-2 text-[9px] font-mono uppercase text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Live Digitraffic Data
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="rounded-2xl border border-red-500/20 bg-slate-950/90 backdrop-blur-md p-6 text-center">
            <Radio className="mx-auto mb-3 h-7 w-7 text-red-400" />
            <p className="text-xs font-mono uppercase text-red-300">
              Data Feed Unavailable
            </p>
            <p className="mt-2 text-[10px] text-slate-500">
              Unable to retrieve live icebreaker data.
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
        <button
          aria-label="Zoom in"
          onClick={() => mapRef.current?.zoomIn()}
          className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-900 rounded-lg shadow font-bold border border-slate-200 transition-transform active:scale-95"
        >
          ＋
        </button>

        <button
          aria-label="Zoom out"
          onClick={() => mapRef.current?.zoomOut()}
          className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-900 rounded-lg shadow font-bold border border-slate-200 transition-transform active:scale-95"
        >
          －
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-slate-200 shadow-sm font-mono text-[10px]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#22d3ee]" />
          LED
        </div>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
          TOW
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#94a3b8]" />
          STANDBY
        </div>
      </div>
    </div>
  )
}

export default memo(IcebreakerMap)