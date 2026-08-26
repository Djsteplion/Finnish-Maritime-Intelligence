/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useRef, memo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface IcebreakerMapProps {
  onSelect: (name: string) => void;
}

const ARCTIC_VIEW = {
  center: [23.5, 63.5] as [number, number],
  zoom: 5
};

function IcebreakerMap({ onSelect }: IcebreakerMapProps) {
  const mountPoint = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mountPoint.current) return;

    mapRef.current = new maplibregl.Map({
      container: mountPoint.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: ARCTIC_VIEW.center,
      zoom: ARCTIC_VIEW.zoom,
      attributionControl: false,
    });

    const map = mapRef.current;

    map.on('load', async () => {
      try {
        // 1. Get the Icebreaker Registry (metadata) so we know which MMSIs to look for
        const vRes = await fetch('https://meri.digitraffic.fi/api/winter-navigation/v2/vessels');
        const vGeo = await vRes.json();
        console.log(vGeo)
        const icebreakerRegistry = vGeo.vessels || [];
        const icebreakerMmsis = new Set(icebreakerRegistry.map((v: any) => v.mmsi));

        // 2. Fetch the massive AIS v1 Feed (Global Locations)
        const aisRes = await fetch('https://meri.digitraffic.fi/api/ais/v1/locations');
        const aisData = await aisRes.json(); // This is a FeatureCollection of ALL ships

        // 3. Filter AIS feed to ONLY include our Icebreakers
        const icebreakerFeatures = aisData.features.filter((f: any) => 
          icebreakerMmsis.has(f.properties.mmsi)
        ).map((f: any) => {
          // Find the matching metadata to get the name and status
          const meta = icebreakerRegistry.find((v: any) => v.mmsi === f.properties.mmsi);
          return {
            ...f,
            properties: {
              ...f.properties,
              name: meta?.name || `MMSI: ${f.properties.mmsi}`,
              status: meta?.activities?.[0]?.type || 'STANDBY',
              target: meta?.activities?.[0]?.assistingVessel?.name || '---'
            }
          };
        });

        // 4. Add the filtered data to the map
        map.addSource('icebreakers-src', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: icebreakerFeatures } as any
        });

        map.addLayer({
          id: 'icebreaker-layer',
          type: 'circle',
          source: 'icebreakers-src',
          paint: {
            'circle-radius': 10,
            'circle-color': [
              'match', ['get', 'status'],
              'LED', '#22d3ee', // Cyan
              'TOW', '#3b82f6', // Blue
              '#94a3b8'        // Gray (Standby)
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Popup logic
        map.on('click', 'icebreaker-layer', (e: any) => {
          const p = e.features[0].properties;
          onSelect(p.name);
          new maplibregl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML(`
              <div style="color:black; padding:5px; font-family:monospace; font-size:12px;">
                <b style="font-size:14px;">${p.name}</b><br/>
                STATUS: <span style="color:#0891b2">${p.status}</span><br/>
                ASSISTED_VESSEL: ${p.target}
              </div>
            `)
            .addTo(map);
        });

      } catch (err) {
        console.error("AIS Map Error:", err);
      }
    });

    return () => { if (mapRef.current) mapRef.current.remove(); };
  }, [onSelect]);

  return (
    <div className="w-full h-full relative min-h-[500px] bg-slate-900 rounded-xl overflow-hidden border border-slate-200">
      <div ref={mountPoint} className="absolute inset-0 w-full h-full" />
      
      {/* ZOOM CONTROLS */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button onClick={() => mapRef.current?.zoomIn()} className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-900 rounded shadow font-bold border border-slate-200 transition-transform active:scale-95">＋</button>
        <button onClick={() => mapRef.current?.zoomOut()} className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-900 rounded shadow font-bold border border-slate-200 transition-transform active:scale-95">－</button>
      </div>

      {/* LEGEND */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 p-3 rounded-md border border-slate-200 shadow-sm font-mono text-[10px]">
        <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-[#22d3ee]" /> LED</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> TOW</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#94a3b8]" /> STANDBY</div>
      </div>
    </div>
  );
}

export default memo(IcebreakerMap);