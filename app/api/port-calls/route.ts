/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  NextRequest,
  NextResponse,
} from 'next/server'

export const dynamic = 'force-dynamic'

const API =
  'https://meri.digitraffic.fi/api/port-call/v1/port-calls'

function normalize(value: unknown) {
  return String(value || '')
    .trim()
    .toUpperCase()
}

function latestById(calls: any[]) {
  const map = new Map<number, any>()

  for (const call of calls) {
    const id = Number(call?.portCallId)

    if (!id) continue

    const previous = map.get(id)

    if (
      !previous ||
      new Date(
        call.portCallTimestamp || 0
      ).getTime() >
        new Date(
          previous.portCallTimestamp || 0
        ).getTime()
    ) {
      map.set(id, call)
    }
  }

  return [...map.values()]
}

async function fetchChunk(
  from: Date,
  to: Date
) {
  const url =
    `${API}?ataFrom=${encodeURIComponent(
      from.toISOString()
    )}&ataTo=${encodeURIComponent(
      to.toISOString()
    )}`

  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Digitraffic-User':
        'Finnish-Maritime-Intelligence/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Port-call request failed: ${response.status}`
    )
  }

  const data = await response.json()

  return data?.portCalls || []
}

export async function GET(
  request: NextRequest
) {
  try {
    const requestedDays = Number(
      request.nextUrl.searchParams.get(
        'days'
      ) || '30'
    )

    const days = Math.min(
      Math.max(requestedDays, 7),
      90
    )

    const end = new Date()
    const start = new Date(end)

    start.setDate(
      start.getDate() - days
    )

    /*
     * Digitraffic limits large port-call
     * result sets. Fetch in 7-day chunks.
     */
    const chunks: Promise<any[]>[] = []

    let cursor = new Date(start)

    while (cursor < end) {
      const chunkEnd = new Date(cursor)

      chunkEnd.setDate(
        chunkEnd.getDate() + 7
      )

      if (chunkEnd > end) {
        chunkEnd.setTime(
          end.getTime()
        )
      }

      chunks.push(
        fetchChunk(
          new Date(cursor),
          new Date(chunkEnd)
        )
      )

      cursor = chunkEnd
    }

    const results =
      await Promise.all(chunks)

    const calls = latestById(
      results.flat()
    )

    const portsResponse =
      await fetch(
        'https://meri.digitraffic.fi/api/port-call/v1/ports',
        {
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
            'Digitraffic-User':
              'Finnish-Maritime-Intelligence/1.0',
          },
        }
      )

    if (!portsResponse.ok) {
      throw new Error(
        'Failed to fetch port metadata'
      )
    }

    const portsData =
      await portsResponse.json()

    const portFeatures =
      portsData?.ssnLocations?.features ||
      []

    const portMap = new Map<
      string,
      string
    >()

    for (const feature of portFeatures) {
      const locode = normalize(
        feature?.locode
      )

      const name =
        feature?.properties?.locationName

      if (locode && name) {
        portMap.set(
          locode,
          name
        )
      }
    }

    const counts = new Map<
      string,
      {
        port: string
        incoming: number
      }
    >()

    for (const call of calls) {
      const locode = normalize(
        call?.portToVisit
      )

      if (!locode) continue

      const port =
        portMap.get(locode)

      if (!port) continue

      const current =
        counts.get(locode) || {
          port,
          incoming: 0,
        }

      current.incoming += 1

      counts.set(
        locode,
        current
      )
    }

    const ports = [
      ...counts.values(),
    ]
      .sort(
        (a, b) =>
          b.incoming -
          a.incoming
      )
      .slice(0, 6)

    return NextResponse.json({
      days,
      totalPortCalls:
        calls.length,
      updatedAt:
        new Date().toISOString(),
      ports,
    })
  } catch (error) {
    console.error(
      'Port-call chart error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unable to calculate port-call traffic',
        ports: [],
      },
      { status: 500 }
    )
  }
}