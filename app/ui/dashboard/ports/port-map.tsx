/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useRef, memo, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface PortMapProps {
  onPortSelect: (portName: string) => void;
}

const BALTIC_PORTS = [
  { name: 'Helsinki', coords: [24.94, 60.16] as [number, number], count: 28 },
  { name: 'Turku', coords: [22.26, 60.45] as [number, number], count: 12 },
  { name: 'Kotka', coords: [26.94, 60.46] as [number, number], count: 19 },
  { name: 'Oulu', coords: [25.46, 65.01] as [number, number], count: 7 },
  { name: 'Tallinn', coords: [24.75, 59.43] as [number, number], count: 22 },
  { name: 'Stockholm', coords: [18.06, 59.32] as [number, number], count: 15 },
  { name: 'Gdansk', coords: [18.66, 54.35] as [number, number], count: 31 },
  { name: 'Riga', coords: [24.10, 56.94] as [number, number], count: 14 },
];

let globalPortDiv: HTMLDivElement | null = null;
let globalPortMap: maplibregl.Map | null = null;

function PortCongestionMap({ onPortSelect }: PortMapProps) {
  const mountPoint = useRef<HTMLDivElement>(null);
  const onPortSelectRef = useRef(onPortSelect);

  useEffect(() => { onPortSelectRef.current = onPortSelect; }, [onPortSelect]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (!globalPortDiv) {
      globalPortDiv = document.createElement('div');
      globalPortDiv.style.width = '100%';
      globalPortDiv.style.height = '100%';

      globalPortMap = new maplibregl.Map({
        container: globalPortDiv,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [22.0, 60.0],
        zoom: 4.5,
        attributionControl: false,
      });

      globalPortMap.on('load', () => {
        globalPortMap?.addSource('vessels-data', { type: 'geojson', data: '/api/vessels' });

        globalPortMap?.addLayer({
          id: 'vessel-points',
          type: 'circle',
          source: 'vessels-data',
          paint: {
            'circle-radius': 6,
            'circle-color': '#00ffff', // FIXED CYAN VESSELS
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
          }
        });

        BALTIC_PORTS.forEach(port => {
          const el = document.createElement('div');
          el.className = 'group relative flex flex-col items-center cursor-pointer';
          
          const statusColor = port.count > 25 ? 'bg-red-600' : port.count > 12 ? 'bg-yellow-500' : 'bg-emerald-500';
          const shadowColor = port.count > 25 ? 'shadow-red-500/50' : port.count > 12 ? 'shadow-yellow-500/50' : 'shadow-emerald-500/50';
          
          el.innerHTML = `
            <div class="${statusColor} p-2 rounded-full border-2 border-white/20 shadow-xl ${shadowColor} transition-all duration-300 group-hover:scale-150">
              <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M12 22v-5m0-7V5m0 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 12a10 10 0 0 1-10-10H2m20 0h-2a10 10 0 0 1-10 10Z"/>
              </svg>
              <div class="absolute -top-1 -right-1 bg-white text-[8px] font-bold text-black px-1 min-w-[14px] text-center rounded-full">
                ${port.count}
              </div>
            </div>
            <span class="text-[9px] mt-1 font-mono text-white bg-black/60 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              ${port.name.toUpperCase()}
            </span>
          `;

          new maplibregl.Marker(el)
            .setLngLat(port.coords)
            .addTo(globalPortMap!)
            .getElement()
            .addEventListener('click', () => {
              onPortSelectRef.current(port.name);
              globalPortMap?.flyTo({ center: port.coords, zoom: 8, duration: 1500 });
            });
        });
      });
    }

    if (mountPoint.current && globalPortDiv) mountPoint.current.appendChild(globalPortDiv);
    
    const resizer = new ResizeObserver(() => globalPortMap?.resize());
    if (mountPoint.current) resizer.observe(mountPoint.current);

    return () => {
      if (globalPortDiv?.parentNode) globalPortDiv.parentNode.removeChild(globalPortDiv);
      resizer.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[450px] relative overflow-hidden bg-slate-900">
      <div ref={mountPoint} className="absolute inset-0 w-full h-full" />
      
      {/* COMMAND UI REINSTATED */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 bg-slate-900/95 px-3 py-1.5 rounded-full border border-slate-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-[10px] font-bold text-slate-200 tracking-widest uppercase">Live_Congestion</span>
        </div>
      </div>

      {/* ZOOM CONTROLS REINSTATED */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button 
          onClick={() => globalPortMap?.zoomIn()} 
          className="w-10 h-10 bg-slate-900/90 text-white rounded-md border border-slate-700 hover:text-red-600 shadow-lg font-bold"
        >＋</button>
        <button 
          onClick={() => globalPortMap?.zoomOut()} 
          className="w-10 h-10 bg-slate-900/90 text-white rounded-md border border-slate-700 hover:text-red-600 shadow-lg font-bold"
        >－</button>
      </div>

      {/* LEGEND REINSTATED */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 p-3 rounded-xl border border-white/10 text-[10px] text-white font-mono flex flex-col gap-2 shadow-2xl">
        <div className="text-red-500 font-bold border-b border-white/10 pb-1 uppercase">Density_Index</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-600" /> <span>CONGESTED</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /> <span>MODERATE</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> <span>FLUID</span></div>
      </div>
    </div>
  );
}

export default memo(PortCongestionMap);