import { NextRequest, NextResponse } from 'next/server';

// 1. Define the interfaces so TypeScript stops complaining
interface AISLocationFeature {
  type: string;
  mmsi: number;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: any;
}

interface VesselMetadata {
  mmsi: number;
  name?: string;
  destination?: string;
  shipType?: string;
}

export async function GET(request: NextRequest) {
  try {
    // 2. Fetching from Digitraffic (Server-side)
    const [locRes, metaRes] = await Promise.all([
      fetch('https://meri.digitraffic.fi/api/ais/v1/locations', { next: { revalidate: 30 } }),
      fetch('https://meri.digitraffic.fi/api/ais/v1/vessels', { next: { revalidate: 3600 } })
    ]);

    const locations = await locRes.json();
    const metadata: VesselMetadata[] = await metaRes.json();

    // 3. The "Middleware" Logic: Merging data by MMSI
    const metaMap = new Map<number, VesselMetadata>(
      metadata.map((m) => [m.mmsi, m])
    );

    const mergedFeatures = (locations.features || locations).map((feat: AISLocationFeature) => {
      const meta = metaMap.get(feat.mmsi);
      return {
        ...feat,
        properties: {
          ...feat.properties,
          name: meta?.name || `MMSI: ${feat.mmsi}`,
          destination: meta?.destination || 'Unknown',
          mmsi: feat.mmsi // Ensure mmsi is in properties for MapLibre click events
        }
      };
    });

    // 4. Return as a standard GeoJSON FeatureCollection
    return NextResponse.json({
      type: 'FeatureCollection',
      features: mergedFeatures
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to aggregate maritime data' }, { status: 500 });
  }
}