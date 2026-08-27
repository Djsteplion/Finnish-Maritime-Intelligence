# 🚢 Finnish Marine Intelligence (F.M.I.)

A real-time maritime traffic intelligence dashboard built on **official Finnish government AIS data** (Fintraffic / Digitraffic). Tracks live vessel positions, icebreaker operations, port activity, and fleet analytics across Finnish waters.

> Live demo: https://fmi-dashboard.netlify.app/ui/dashboard

> Pitch: 
https://fmi-board.netlify.app/

> Screenshots: 
<img src="assets\Screenshot 2026-08-26 224729.png" alt="image showing half of the dashboard page" width="500">
<img src="assets\Screenshot 2026-08-26 224832.png" alt="image showing the location of a selected vessel on the map" width="500">
<img src="assets\Screenshot 2026-08-26 224905.png" alt="image showing more details abiout the selected vessel" width="500">
<img src="assets\Screenshot 2026-08-26 224940.png" alt="image showing the top half of the analytics page" width="500">


---

## What this is

Most portfolio "dashboards" ship with mock JSON. This one doesn't — it pulls **live AIS (Automatic Identification System) vessel data** from [Digitraffic's Marine Traffic API](https://meri.digitraffic.fi/), a real, public, production API operated by the Finnish Transport Infrastructure Agency. Ship positions, headings, speeds, and destinations on the map are real vessels in the Baltic Sea at the time you load the page.

The dashboard covers:

- **Live fleet map** — every AIS-reporting vessel in Finnish waters, rendered as a custom-drawn 3D-style sprite (not a stock pin icon), rotated to true heading, colored/sized by zoom level.
- **Vessel detail panel** — click a ship on the map (or a row in the table) to fly the camera to it and load its metadata (name, destination, MMSI).
- **Ports module** — inbound vessel tracking per port with its own map + table.
- **Icebreaker operations** — a dedicated view for Arctic escort vessels, with an activity chart and fleet status table.
- **Analytics** — aggregated speed-by-vessel-type and utilization-frequency charts computed client-side from the raw AIS + port-call feeds.
- **PDF export** — vessel/report data can be exported via `jspdf` + `jspdf-autotable`.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Data fetching / caching | TanStack Query, Next.js server-side `fetch` with `revalidate` |
| Mapping | MapLibre GL JS (open-source, no Mapbox token required) |
| UI | shadcn/ui (Radix primitives) + Tailwind CSS v4 |
| Charts | Recharts |
| Tables | TanStack Table |
| Data source | [Digitraffic Marine Traffic API](https://www.digitraffic.fi/en/marine-traffic/) — official Finnish gov't AIS feed (no API key required) |

## Architecture notes

**Server-side data aggregation.** `app/api/vessels/route.ts` is a Next.js Route Handler that fans out two parallel requests to Digitraffic — one for live AIS *positions* (revalidated every 30s) and one for vessel *metadata* (revalidated every hour, since ship names/destinations barely change) — then merges them by MMSI into a single GeoJSON `FeatureCollection`. It keeps the metadata request cheap and cached while positions stay fresh, and it means the client never has to do the join itself.

**One shared MapLibre instance, not React-Leaflet-per-marker.** Rather than rendering thousands of DOM marker elements (which chokes with dense AIS traffic), `VesselMap.tsx` draws a single reusable ship sprite onto an off-screen canvas once, registers it as a MapLibre image, and renders every vessel as a single symbol layer bound directly to the `/api/vessels` GeoJSON source. Icon size and rotation are driven by MapLibre style expressions (`interpolate`/`coalesce`) rather than per-marker JS, and the map keeps a light/dark instance pair alive globally instead of re-mounting on theme toggle.

**Context-driven cross-page state.** A `VesselProvider` context holds the selected vessel and a `mapRef` so that clicking a row in the vessel table (a sibling component, not a parent) can fly the shared map to that ship and populate the detail panel — without prop drilling through the dashboard layout.


## Getting started

```bash
git clone https://github.com/Djsteplion/Finnish-Maritime-Intelligence.git
cd Finnish-Maritime-Intelligence
npm install
npm run dev
```

No API key or `.env` file is required — Digitraffic's marine traffic endpoints are public and unauthenticated. Open [http://localhost:3000/ui/dashboard](http://localhost:3000/ui/dashboard).

## Project structure

```
app/
  api/vessels/route.ts        # Server-side AIS aggregation endpoint
  ui/dashboard/
    layout.tsx                 # Shell: sidenav + conditional map/totals
    page.tsx                   # Fleet overview table
    analytics/                 # Speed & utilization analytics
    icebreakers/                # Icebreaker map, chart, table
    ports/                      # Port-level vessel tracking
    vessels/[mmsi]/             # Single-vessel detail route
    vessels_location/           # All-vessel location view
components/ui/
  VesselMap.tsx                 # Custom MapLibre map + sprite renderer
  VesselDetailPanel.tsx
```

## Data source & attribution

Vessel and port-call data © [Fintraffic / Digitraffic](https://www.digitraffic.fi/en/marine-traffic/), licensed for reuse. This is a personal/portfolio project and is not affiliated with Fintraffic.
