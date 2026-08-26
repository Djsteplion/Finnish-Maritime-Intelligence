'use client'

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
//import 'maplibre-gl/dist/maplibre-gl.css';

export default function SingleVesselMap({ mmsi }: { mmsi: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [24.94, 60.16], // Default fallback
      zoom: 11,
      interactive: true
    });

    map.current.on('load', () => {
      fetch('/api/vessels')
        .then(res => res.json())
        .then(data => {
          // Find the specific vessel in the GeoJSON features
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const feature = data.features.find((f: any) => 
            f.properties.mmsi?.toString() === mmsi || 
            f.properties.MMSI?.toString() === mmsi
          );

          if (feature && map.current) {
            const coords = feature.geometry.coordinates;

            map.current.addSource('selected-vessel', {
              type: 'geojson',
              data: { type: 'FeatureCollection', features: [feature] }
            });

            // Add the same 3D vessel sprite
if (!map.current.hasImage('3d-vessel')) {
  map.current.addImage(
    '3d-vessel',
    createShipSprite(),
    {
      pixelRatio: 2,
    }
  );
}

map.current.addLayer({
  id: 'vessel-point',
  type: 'symbol',
  source: 'selected-vessel',

  layout: {
    'icon-image': '3d-vessel',

    'icon-size': [
      'interpolate',
      ['linear'],
      ['zoom'],
      8,
      0.65,
      10,
      0.8,
      12,
      1,
      15,
      1.2,
    ],

    'icon-rotate': [
      'coalesce',
      ['get', 'heading'],
      ['get', 'Heading'],
      ['get', 'cog'],
      ['get', 'COG'],
      0,
    ],

    'icon-rotation-alignment': 'map',

    'icon-allow-overlap': true,
    'icon-ignore-placement': true,

    'icon-padding': 2,
  },
});

            map.current.addLayer({
              id: 'vessel-point',
              type: 'circle',
              source: 'selected-vessel',
              paint: {
                'circle-radius': 6,
                'circle-color': '#60a5fa',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
              }
            });

            // Center and jump to the vessel
            map.current.jumpTo({ center: coords, zoom: 12 });
          }
        });
    });

    return () => map.current?.remove();
  }, [mmsi]);

  return <div ref={mapContainer} className="w-full h-full min-h-[300px]" />;
}

function createShipSprite(): HTMLImageElement | ImageBitmap | ImageData | { width: number; height: number; data: Uint8Array | Uint8ClampedArray; } | maplibregl.StyleImageInterface {
  throw new Error('Function not implemented.');
}
