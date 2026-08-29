/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { memo, useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface PortMapProps {
  onPortSelect: (portName: string) => void
}

interface Port {
  locode: string
  name: string
  coordinates: [number, number]
  vesselCount: number
}

function getStatus(count: number) {
  if (count >= 20) {
    return {
      color: '#dc2626',
      glow: 'rgba(239,68,68,0.55)',
    }
  }

  if (count >= 10) {
    return {
      color: '#eab308',
      glow: 'rgba(234,179,8,0.55)',
    }
  }

  return {
    color: '#10b981',
    glow: 'rgba(16,185,129,0.55)',
  }
}

function PortCongestionMap({
  onPortSelect,
}: PortMapProps) {
  const mountPoint = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const onPortSelectRef = useRef(onPortSelect)

  useEffect(() => {
    onPortSelectRef.current = onPortSelect
  }, [onPortSelect])

  useEffect(() => {
    if (!mountPoint.current) return

    let cancelled = false
    const container = mountPoint.current

    const map = new maplibregl.Map({
      container,
      style:
        'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [22, 60],
      zoom: 4.5,
      attributionControl: false,
    })

    mapRef.current = map

    const portMarkers: maplibregl.Marker[] = []

    map.on('load', async () => {
      if (cancelled) return

      try {
        const response = await fetch(
          '/api/port-presence',
          {
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(
            `Port presence API failed: ${response.status}`
          )
        }

        const data = await response.json()

        if (cancelled) return

        /*
         * ------------------------------------------------
         * VESSEL CIRCLES
         * ------------------------------------------------
         */

        const vessels =
          data?.vessels

        if (
          vessels &&
          vessels.type === 'FeatureCollection' &&
          Array.isArray(vessels.features)
        ) {
          const validVessels = {
            type: 'FeatureCollection',
            features: vessels.features.filter(
              (vessel: any) => {
                const coordinates =
                  vessel?.geometry?.coordinates

                return (
                  Array.isArray(coordinates) &&
                  coordinates.length >= 2 &&
                  Number.isFinite(
                    Number(coordinates[0])
                  ) &&
                  Number.isFinite(
                    Number(coordinates[1])
                  )
                )
              }
            ),
          }

          map.addSource('port-vessels', {
            type: 'geojson',
            data: validVessels,
          })

          map.addLayer({
            id: 'port-vessel-glow',
            type: 'circle',
            source: 'port-vessels',
            paint: {
              'circle-radius': 11,
              'circle-color': '#00ffff',
              'circle-opacity': 0.18,
              'circle-blur': 0.8,
            },
          })

          map.addLayer({
            id: 'port-vessels',
            type: 'circle',
            source: 'port-vessels',
            paint: {
              'circle-radius': 5,
              'circle-color': '#00ffff',
              'circle-opacity': 1,
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#ffffff',
            },
          })
        }

        /*
         * ------------------------------------------------
         * PORT MARKERS
         * ------------------------------------------------
         */

        const ports: Port[] = Array.isArray(
          data?.ports
        )
          ? data.ports
          : []

        ports.forEach((port) => {
          if (
            !Array.isArray(port.coordinates) ||
            port.coordinates.length < 2
          ) {
            return
          }

          const lng = Number(
            port.coordinates[0]
          )

          const lat = Number(
            port.coordinates[1]
          )

          /*
           * GeoJSON / MapLibre uses:
           * [longitude, latitude]
           */
          if (
            !Number.isFinite(lng) ||
            !Number.isFinite(lat) ||
            lng < -180 ||
            lng > 180 ||
            lat < -90 ||
            lat > 90
          ) {
            console.warn(
              'Invalid port coordinates:',
              port
            )
            return
          }

          const status = getStatus(
            port.vesselCount
          )

          const el =
            document.createElement('button')

          el.type = 'button'
          el.setAttribute(
            'aria-label',
            `${port.name}, ${port.vesselCount} vessels`
          )

          el.style.cssText = `
            position: relative;
            width: 34px;
            height: 34px;
            padding: 0;
            border: 2px solid rgba(255,255,255,0.9);
            border-radius: 50%;
            background: ${status.color};
            box-shadow:
              0 0 0 5px ${status.glow},
              0 0 20px ${status.glow};
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translate(-50%, -50%);
            transition: transform 0.2s ease;
            z-index: 10;
          `

          el.innerHTML = `
            <span
              style="
                width: 10px;
                height: 10px;
                border: 2px solid white;
                border-radius: 50%;
                display: block;
                background: transparent;
              "
            ></span>

            <span
              style="
                position: absolute;
                top: -9px;
                right: -9px;
                min-width: 19px;
                height: 19px;
                padding: 0 4px;
                border-radius: 999px;
                background: white;
                color: #0f172a;
                font: 700 10px/19px monospace;
                text-align: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              "
            >
              ${port.vesselCount}
            </span>
          `

          el.addEventListener(
            'mouseenter',
            () => {
              el.style.transform =
                'translate(-50%, -50%) scale(1.3)'
            }
          )

          el.addEventListener(
            'mouseleave',
            () => {
              el.style.transform =
                'translate(-50%, -50%) scale(1)'
            }
          )

          el.addEventListener(
            'click',
            () => {
              onPortSelectRef.current(
                port.name
              )

              map.flyTo({
                center: [lng, lat],
                zoom: 9,
                duration: 1500,
              })
            }
          )

          const marker =
            new maplibregl.Marker({
              element: el,
              anchor: 'center',
            })
              .setLngLat([lng, lat])
              .addTo(map)

          portMarkers.push(marker)

          /*
           * Port name label
           */
          const label =
            document.createElement('div')

          label.style.cssText = `
            margin-top: 43px;
            padding: 3px 6px;
            border-radius: 4px;
            background: rgba(2,6,23,0.9);
            border: 1px solid rgba(255,255,255,0.12);
            color: white;
            font: 700 9px monospace;
            text-transform: uppercase;
            white-space: nowrap;
            pointer-events: none;
            text-align: center;
          `

          label.textContent =
            `${port.name} (${port.vesselCount})`

          el.appendChild(label)
        })

        /*
         * Force MapLibre to recalculate its dimensions.
         */
        setTimeout(() => {
          if (!cancelled) {
            map.resize()
          }
        }, 100)
      } catch (error) {
        console.error(
          'Port map error:',
          error
        )
      }
    })

    const resizeObserver =
      new ResizeObserver(() => {
        map.resize()
      })

    resizeObserver.observe(container)

    return () => {
      cancelled = true

      resizeObserver.disconnect()

      portMarkers.forEach((marker) =>
        marker.remove()
      )

      map.remove()

      mapRef.current = null
    }
  }, [])

  return (
    <div className="relative h-full min-h-[450px] w-full overflow-hidden bg-slate-900">
      <div
        ref={mountPoint}
        className="absolute inset-0 h-full w-full"
      />

      {/* LIVE STATUS */}
      <div className="absolute left-4 top-4 z-20">
        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/95 px-3 py-1.5 shadow-sm backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
          </span>

          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-200">
            Live_Congestion
          </span>
        </div>
      </div>

      {/* ZOOM */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() =>
            mapRef.current?.zoomIn()
          }
          className="h-10 w-10 rounded-md border border-slate-700 bg-slate-900/90 text-xl font-bold text-white shadow-lg hover:text-red-500"
        >
          +
        </button>

        <button
          type="button"
          aria-label="Zoom out"
          onClick={() =>
            mapRef.current?.zoomOut()
          }
          className="h-10 w-10 rounded-md border border-slate-700 bg-slate-900/90 text-xl font-bold text-white shadow-lg hover:text-red-500"
        >
          −
        </button>
      </div>

      {/* LEGEND */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-950/90 p-3 font-mono text-[10px] text-white shadow-2xl backdrop-blur">
        <div className="border-b border-white/10 pb-1 font-bold uppercase text-red-500">
          Live_Density
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-600" />
          <span>HIGH</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <span>MODERATE</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>LOW</span>
        </div>

        <div className="mt-1 flex items-center gap-2 border-t border-white/10 pt-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00ffff]" />
          <span>VESSEL</span>
        </div>
      </div>
    </div>
  )
}

export default memo(
  PortCongestionMap
)
