/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
  memo,
} from 'react';
import maplibregl from 'maplibre-gl';

interface VesselMapProps {
  onSelect: (v: any) => void;
}

let globalLightDiv: HTMLDivElement | null = null;
let globalDarkDiv: HTMLDivElement | null = null;
let globalLightMap: maplibregl.Map | null = null;
let globalDarkMap: maplibregl.Map | null = null;

const SHIP_ICON_ID = '3d-vessel';

/**
 * Creates ONE shared 3D-looking vessel sprite.
 *
 * Canvas is rendered once and then reused by every vessel.
 * No DOM markers are created.
 */
const createShipSprite = (): ImageData => {
  const size = 64;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  // --------------------------------------------------
  // Vessel shadow / dark underside
  // --------------------------------------------------

  ctx.save();

  ctx.translate(32, 34);

  ctx.transform(
    1,
    0,
    -0.12,
    0.45,
    0,
    0
  );

  ctx.beginPath();
  ctx.moveTo(0, -27);
  ctx.bezierCurveTo(7, -20, 12, -8, 14, 10);
  ctx.bezierCurveTo(11, 22, 5, 28, 0, 31);
  ctx.bezierCurveTo(-5, 28, -11, 22, -14, 10);
  ctx.bezierCurveTo(-12, -8, -7, -20, 0, -27);
  ctx.closePath();

  const shadow = ctx.createLinearGradient(0, -20, 0, 30);
  shadow.addColorStop(0, '#123b45');
  shadow.addColorStop(0.55, '#08252d');
  shadow.addColorStop(1, '#020b10');

  ctx.fillStyle = shadow;
  ctx.fill();

  ctx.restore();

  // --------------------------------------------------
  // Main hull
  // --------------------------------------------------

  ctx.save();

  ctx.translate(32, 29);

  ctx.beginPath();

  ctx.moveTo(0, -27);

  ctx.bezierCurveTo(
    6,
    -20,
    10,
    -8,
    12,
    8
  );

  ctx.bezierCurveTo(
    11,
    18,
    6,
    25,
    0,
    29
  );

  ctx.bezierCurveTo(
    -6,
    25,
    -11,
    18,
    -12,
    8
  );

  ctx.bezierCurveTo(
    -10,
    -8,
    -6,
    -20,
    0,
    -27
  );

  ctx.closePath();

  const hullGradient = ctx.createLinearGradient(
    -12,
    0,
    12,
    0
  );

  hullGradient.addColorStop(0, '#087f8c');
  hullGradient.addColorStop(0.42, '#11cbd2');
  hullGradient.addColorStop(0.62, '#08aab4');
  hullGradient.addColorStop(1, '#064c58');

  ctx.fillStyle = hullGradient;
  ctx.fill();

  // --------------------------------------------------
  // Red stern / navigation accent
  // --------------------------------------------------

  ctx.beginPath();

  ctx.moveTo(-9, 13);
  ctx.lineTo(9, 13);
  ctx.lineTo(7, 21);
  ctx.bezierCurveTo(4, 25, 2, 27, 0, 29);
  ctx.bezierCurveTo(-2, 27, -4, 25, -7, 21);
  ctx.closePath();

  ctx.fillStyle = '#ef4444';
  ctx.fill();

  // --------------------------------------------------
  // White central highlight
  // --------------------------------------------------

  ctx.beginPath();

  ctx.moveTo(0, -22);
  ctx.bezierCurveTo(
    2,
    -16,
    3,
    -7,
    3,
    4
  );

  ctx.bezierCurveTo(
    3,
    10,
    2,
    14,
    0,
    19
  );

  ctx.bezierCurveTo(
    -1,
    14,
    -1,
    9,
    -1,
    3
  );

  ctx.bezierCurveTo(
    -1,
    -7,
    -1,
    -15,
    0,
    -22
  );

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.fill();

  // --------------------------------------------------
  // Superstructure
  // --------------------------------------------------

  ctx.beginPath();

  ctx.moveTo(-6, -4);
  ctx.lineTo(6, -4);
  ctx.lineTo(5, 8);
  ctx.lineTo(-5, 8);
  ctx.closePath();

  const structureGradient = ctx.createLinearGradient(
    -6,
    -4,
    6,
    8
  );

  structureGradient.addColorStop(0, '#dffcff');
  structureGradient.addColorStop(0.35, '#8de9ed');
  structureGradient.addColorStop(1, '#16727b');

  ctx.fillStyle = structureGradient;
  ctx.fill();

  // --------------------------------------------------
  // Bridge / dark windows
  // --------------------------------------------------

  ctx.fillStyle = '#062a32';

  ctx.fillRect(-4, -2, 8, 4);

  ctx.fillStyle = '#b9ffff';

  ctx.fillRect(-3, -1, 2, 1);
  ctx.fillRect(1, -1, 2, 1);

  // --------------------------------------------------
  // Mast
  // --------------------------------------------------

  ctx.strokeStyle = '#e8ffff';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, -23);
  ctx.stroke();

  // Radar bar

  ctx.beginPath();
  ctx.moveTo(-4, -18);
  ctx.lineTo(4, -18);
  ctx.stroke();

  // --------------------------------------------------
  // Bow highlight
  // --------------------------------------------------

  ctx.beginPath();

  ctx.moveTo(0, -27);
  ctx.lineTo(-3, -19);
  ctx.lineTo(0, -22);
  ctx.lineTo(3, -19);
  ctx.closePath();

  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.7;
  ctx.fill();

  ctx.restore();

  return ctx.getImageData(0, 0, size, size);
};

const addShipIcon = (m: maplibregl.Map) => {
  if (m.hasImage(SHIP_ICON_ID)) return;

  const image = createShipSprite();

  m.addImage(SHIP_ICON_ID, image, {
    pixelRatio: 2,
  });
};

const VesselMap = forwardRef(({ onSelect }: VesselMapProps, ref) => {
  const mountPointLight = useRef<HTMLDivElement>(null);
  const mountPointDark = useRef<HTMLDivElement>(null);

  const [isDark, setIsDark] = useState(false);

  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const setupVessels = (m: maplibregl.Map) => {
    m.on('load', () => {
      if (m.getSource('vessels-data')) return;

      // ONE sprite for ALL vessels.
      addShipIcon(m);

      m.addSource('vessels-data', {
        type: 'geojson',
        data: '/api/vessels',
      });

      m.addLayer({
        id: 'vessel-points',
        type: 'symbol',
        source: 'vessels-data',

        layout: {
          'icon-image': SHIP_ICON_ID,

          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],

            3,
            0.42,

            5,
            0.56,

            8,
            0.72,

            12,
            0.92,
          ],

          // Vessel heading controls rotation.
          'icon-rotate': [
            'coalesce',
            ['get', 'heading'],
            0,
          ],

          'icon-rotation-alignment': 'map',

          // Important for dense maritime traffic.
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,

          // Prevent unnecessary icon clipping.
          'icon-padding': 2,
        },
      });

      m.on('click', 'vessel-points', (e) => {
        if (!e.features?.[0]) return;

        const feature = e.features[0];

        const coords = (
          feature.geometry as any
        ).coordinates;

        onSelectRef.current({
          ...feature.properties,
          longitude: coords[0],
          latitude: coords[1],
        });
      });

      m.on('mouseenter', 'vessel-points', () => {
        m.getCanvas().style.cursor = 'pointer';
      });

      m.on('mouseleave', 'vessel-points', () => {
        m.getCanvas().style.cursor = '';
      });
    });
  };

  useImperativeHandle(ref, () => ({
    flyToVessel: (lng: number, lat: number) => {
      [globalLightMap, globalDarkMap].forEach((m) => {
        m?.flyTo({
          center: [lng, lat],
          zoom: 12,
          essential: true,
          duration: 2500,
          padding: {
            right: 320,
          },
        });
      });
    },
  }));

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // --------------------------------------------------
    // LIGHT MAP
    // --------------------------------------------------

    if (!globalLightDiv) {
      globalLightDiv = document.createElement('div');

      globalLightDiv.style.width = '100%';
      globalLightDiv.style.height = '100%';

      globalLightMap = new maplibregl.Map({
        container: globalLightDiv,

        style:
          'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',

        center: [24.94, 60.16],
        zoom: 5,

        attributionControl: false,
      });

      setupVessels(globalLightMap);
    }

    // --------------------------------------------------
    // DARK MAP
    // --------------------------------------------------

    if (!globalDarkDiv) {
      globalDarkDiv = document.createElement('div');

      globalDarkDiv.style.width = '100%';
      globalDarkDiv.style.height = '100%';

      globalDarkMap = new maplibregl.Map({
        container: globalDarkDiv,

        style:
          'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',

        center: [24.94, 60.16],
        zoom: 5,

        attributionControl: false,
      });

      setupVessels(globalDarkMap);
    }

    // --------------------------------------------------
    // MOUNT MAPS
    // --------------------------------------------------

    if (mountPointLight.current && globalLightDiv) {
      mountPointLight.current.appendChild(globalLightDiv);
      globalLightMap?.resize();
    }

    if (mountPointDark.current && globalDarkDiv) {
      mountPointDark.current.appendChild(globalDarkDiv);
      globalDarkMap?.resize();
    }

    const resizer = new ResizeObserver(() => {
      globalLightMap?.resize();
      globalDarkMap?.resize();
    });

    if (mountPointLight.current) {
      resizer.observe(mountPointLight.current);
    }

    if (mountPointDark.current) {
      resizer.observe(mountPointDark.current);
    }

    return () => {
      if (globalLightDiv?.parentNode) {
        globalLightDiv.parentNode.removeChild(globalLightDiv);
      }

      if (globalDarkDiv?.parentNode) {
        globalDarkDiv.parentNode.removeChild(globalDarkDiv);
      }

      resizer.disconnect();
    };
  }, []);

  const handleZoom = (type: 'in' | 'out') => {
    [globalLightMap, globalDarkMap].forEach((m) => {
      if (type === 'in') {
        m?.zoomIn();
      } else {
        m?.zoomOut();
      }
    });
  };

  return (
    <div className="relative w-full min-h-[400px] md:h-full bg-slate-900 overflow-hidden rounded-lg">

      {/* LIGHT MAP */}
      <div
        ref={mountPointLight}
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
          isDark
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100 z-0'
        }`}
      />

      {/* DARK MAP */}
      <div
        ref={mountPointDark}
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
          !isDark
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100 z-0'
        }`}
      />

      {/* MAP CONTROLS */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">

        {/* LIVE */}
        <div className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>

          <span className="text-[10px] font-bold uppercase tracking-widest">
            Live
          </span>
        </div>

        {/* MAP TOGGLE */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all active:scale-95"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isDark
                ? 'bg-red-600 shadow-[0_0_5px_red]'
                : 'bg-slate-400'
            }`}
          />

          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-100">
            {isDark ? 'Light_Map' : 'Dark_Map'}
          </span>
        </button>
      </div>

      {/* ZOOM CONTROLS */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">

        <button
          onClick={() => handleZoom('in')}
          className="w-10 h-10 bg-white/90 dark:bg-slate-900/90 rounded-md border border-slate-200 dark:border-slate-700 hover:text-red-600 shadow-lg font-bold text-slate-800 dark:text-slate-100"
          aria-label="Zoom in"
        >
          ＋
        </button>

        <button
          onClick={() => handleZoom('out')}
          className="w-10 h-10 bg-white/90 dark:bg-slate-900/90 rounded-md border border-slate-200 dark:border-slate-700 hover:text-red-600 shadow-lg font-bold text-slate-800 dark:text-slate-100"
          aria-label="Zoom out"
        >
          －
        </button>

      </div>
    </div>
  );
});

VesselMap.displayName = 'VesselMap';

export default memo(VesselMap);