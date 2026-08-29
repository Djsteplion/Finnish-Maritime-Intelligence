/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DIGITRAFFIC = 'https://meri.digitraffic.fi'

const HEADERS = {
  Accept: 'application/json',
  'Accept-Encoding': 'gzip',
  'Digitraffic-User':
    'Finnish-Maritime-Intelligence/1.0',
}

function normalize(value: unknown) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
}

function latestByPortCallId(calls: any[]) {
  const map = new Map<number, any>()

  for (const call of calls) {
    const id = Number(call?.portCallId)

    if (!id) continue

    const existing = map.get(id)

    if (
      !existing ||
      new Date(
        call?.portCallTimestamp ?? 0
      ).getTime() >
        new Date(
          existing?.portCallTimestamp ?? 0
        ).getTime()
    ) {
      map.set(id, call)
    }
  }

  return [...map.values()]
}

function extractFeatures(data: any) {
  if (Array.isArray(data?.features)) {
    return data.features
  }

  if (
    Array.isArray(
      data?.ssnLocations?.features
    )
  ) {
    return data.ssnLocations.features
  }

  if (Array.isArray(data)) {
    return data
  }

  return []
}

export async function GET() {
  try {
    const now = new Date()

    const from = new Date(
      now.getTime() -
        48 * 60 * 60 * 1000
    )

    const [
      portsResponse,
      callsResponse,
      locationsResponse,
      metadataResponse,
    ] = await Promise.all([
      fetch(
        `${DIGITRAFFIC}/api/port-call/v1/ports`,
        {
          cache: 'no-store',
          headers: HEADERS,
        }
      ),

      fetch(
        `${DIGITRAFFIC}/api/port-call/v1/port-calls?from=${encodeURIComponent(
          from.toISOString()
        )}&to=${encodeURIComponent(
          now.toISOString()
        )}`,
        {
          cache: 'no-store',
          headers: HEADERS,
        }
      ),

      fetch(
        `${DIGITRAFFIC}/api/ais/v1/locations`,
        {
          cache: 'no-store',
          headers: HEADERS,
        }
      ),

      fetch(
        `${DIGITRAFFIC}/api/ais/v1/vessels`,
        {
          cache: 'no-store',
          headers: HEADERS,
        }
      ),
    ])

    if (!portsResponse.ok) {
      throw new Error(
        `Ports API failed: ${portsResponse.status}`
      )
    }

    if (!callsResponse.ok) {
      throw new Error(
        `Port calls API failed: ${callsResponse.status}`
      )
    }

    if (!locationsResponse.ok) {
      throw new Error(
        `AIS locations API failed: ${locationsResponse.status}`
      )
    }

    if (!metadataResponse.ok) {
      throw new Error(
        `AIS vessels API failed: ${metadataResponse.status}`
      )
    }

    const [
      portsData,
      callsData,
      locationsData,
      metadataData,
    ] = await Promise.all([
      portsResponse.json(),
      callsResponse.json(),
      locationsResponse.json(),
      metadataResponse.json(),
    ])

    // --------------------------------------------------
    // FINNISH PORTS ONLY
    // --------------------------------------------------

    const portFeatures =
      extractFeatures(portsData)

    const portMap =
      new Map<string, any>()

    for (const feature of portFeatures) {
      const properties =
        feature?.properties ?? {}

      const locode = normalize(
        properties?.locode ??
          properties?.UNLOCODE ??
          properties?.unlocode ??
          feature?.locode
      )

      // Only Finnish UN/LOCODEs.
      // Finnish locations use the FI country prefix.
      if (!locode.startsWith('FI')) {
        continue
      }

      const coordinates =
        feature?.geometry?.coordinates ??
        properties?.coordinates ??
        null

      if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2
      ) {
        continue
      }

      const longitude = Number(coordinates[0])
      const latitude = Number(coordinates[1])

      if (
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude)
      ) {
        continue
      }

      // Additional geographic safety check:
      // roughly Finland's maritime area.
      if (
        longitude < 19 ||
        longitude > 32 ||
        latitude < 59 ||
        latitude > 70
      ) {
        continue
      }

      portMap.set(locode, {
        locode,
        name:
          properties?.locationName ??
          properties?.name ??
          locode,
        coordinates: [
          longitude,
          latitude,
        ],
      })
    }

    // --------------------------------------------------
    // PORT CALLS
    // --------------------------------------------------

    const calls =
      latestByPortCallId(
        Array.isArray(callsData)
          ? callsData
          : callsData?.portCalls ?? []
      )

    // --------------------------------------------------
    // AIS LOCATIONS
    // --------------------------------------------------

    const locationFeatures =
      extractFeatures(locationsData)

    const vesselMap =
      new Map<number, any>()

    for (const vessel of locationFeatures) {
      const properties =
        vessel?.properties ?? {}

      const mmsi = Number(
        vessel?.mmsi ??
          properties?.mmsi
      )

      if (mmsi) {
        vesselMap.set(
          mmsi,
          vessel
        )
      }
    }

    // --------------------------------------------------
    // AIS VESSEL METADATA
    // --------------------------------------------------

    const metadataMap =
      new Map<number, any>()

    const metadataFeatures =
      extractFeatures(metadataData)

    for (
      const item of metadataFeatures
    ) {
      const properties =
        item?.properties ?? item

      const mmsi = Number(
        item?.mmsi ??
          properties?.mmsi
      )

      if (!mmsi) continue

      metadataMap.set(
        mmsi,
        properties
      )
    }

    // --------------------------------------------------
    // ACTIVE FINNISH PORT VESSELS
    // --------------------------------------------------

    const activePortVessels: any[] = []

    for (const call of calls) {
      const areas =
        Array.isArray(
          call?.portAreaDetails
        )
          ? call.portAreaDetails
          : []

      if (!areas.length) continue

      const activeArea =
        [...areas]
          .reverse()
          .find(
            (area: any) =>
              Boolean(area?.ata) &&
              !area?.atd
          )

      if (!activeArea) continue

      const locode = normalize(
        call?.portToVisit
      )

      if (!locode) continue

      // Because portMap contains only FI ports,
      // this automatically rejects non-Finnish ports.
      const port =
        portMap.get(locode)

      if (!port) continue

      const mmsi = Number(
        call?.mmsi
      )

      if (!mmsi) continue

      const vessel =
        vesselMap.get(mmsi)

      if (!vessel) continue

      const metadata =
        metadataMap.get(mmsi) ?? {}

      const vesselProperties =
        vessel?.properties ?? {}

      const vesselName =
        metadata?.name ??
        metadata?.shipName ??
        metadata?.vesselName ??
        vesselProperties?.name ??
        vesselProperties?.shipName ??
        vesselProperties?.vesselName ??
        'UNKNOWN VESSEL'

      activePortVessels.push({
        ...vessel,

        properties: {
          ...vesselProperties,

          mmsi,

          name: vesselName,

          shipName: vesselName,

          vesselName,

          imo:
            metadata?.imo ??
            vesselProperties?.imo ??
            null,

          callSign:
            metadata?.callSign ??
            vesselProperties?.callSign ??
            null,

          destination:
            metadata?.destination ??
            vesselProperties?.destination ??
            null,

          portName:
            port.name,

          portLocode:
            locode,

          portCallId:
            call?.portCallId ??
            null,

          portAreaName:
            activeArea?.portAreaName ??
            null,

          berthName:
            activeArea?.berthName ??
            null,

          portCallArrival:
            activeArea?.ata ??
            null,
        },
      })
    }

    // --------------------------------------------------
    // REMOVE DUPLICATE MMSIs
    // --------------------------------------------------

    const uniqueVessels =
      new Map<number, any>()

    for (
      const vessel of activePortVessels
    ) {
      const mmsi = Number(
        vessel?.properties?.mmsi
      )

      if (mmsi) {
        uniqueVessels.set(
          mmsi,
          vessel
        )
      }
    }

    const vesselsAtPorts = [
      ...uniqueVessels.values(),
    ]

    // --------------------------------------------------
    // COUNT VESSELS PER PORT
    // --------------------------------------------------

    const counts =
      new Map<string, number>()

    for (
      const vessel of vesselsAtPorts
    ) {
      const locode =
        vessel?.properties
          ?.portLocode

      if (!locode) continue

      counts.set(
        locode,
        (counts.get(locode) ?? 0) + 1
      )
    }

    // --------------------------------------------------
    // FINNISH PORTS ONLY
    // --------------------------------------------------

    const ports =
      [...portMap.values()]
        .map((port) => ({
          ...port,

          vesselCount:
            counts.get(
              port.locode
            ) ?? 0,
        }))
        .sort(
          (a, b) =>
            b.vesselCount -
            a.vesselCount
        )

    return NextResponse.json({
      updatedAt:
        new Date().toISOString(),

      totalVessels:
        vesselsAtPorts.length,

      totalPorts:
        ports.length,

      activePorts:
        ports.filter(
          (port) =>
            port.vesselCount > 0
        ).length,

      ports,

      vessels: {
        type: 'FeatureCollection',

        features:
          vesselsAtPorts,
      },
    })
  } catch (error) {
    console.error(
      'Port presence error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Failed to calculate live port presence',
      },
      {
        status: 500,
      }
    )
  }
}