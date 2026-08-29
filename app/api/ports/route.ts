import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API =
  'https://meri.digitraffic.fi/api/port-call/v1/ports'

export async function GET() {
  try {
    const response = await fetch(API, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Digitraffic-User':
          'Finnish-Maritime-Intelligence/1.0',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            'Failed to fetch Digitraffic ports',
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      type: 'FeatureCollection',
      features:
        data?.ssnLocations?.features || [],
      portAreas:
        data?.portAreas?.features || [],
      berths:
        data?.berths?.berths || [],
      dataUpdatedTime:
        data?.dataUpdatedTime || null,
    })
  } catch (error) {
    console.error(
      'Digitraffic ports error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unable to fetch port data',
      },
      { status: 500 }
    )
  }
}