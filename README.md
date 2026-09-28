# Raasta — Delhi Metro Route Planner

Raasta is a client-side Delhi Metro route planner packaged as a Vite PWA and Capacitor Android app.

## What it does

- Finds the fastest route between two stations.
- Finds a route with the fewest interchanges.
- Shows travel time, distance, stations, fares, transfers, directions, and exit gates.
- Saves routes in browser `localStorage`.
- Includes station search, station details, theme switching, offline support, and a pan-and-zoom metro map.
- Provides a floating, scroll-aware navigation bar with quick destination search.

## Project layout

- `app/src/main.js` — application entry point and shell setup.
- `app/src/core/router.js` — hash-based screen navigation.
- `app/src/core/state.js` — selected stations and current route state.
- `app/src/core/route-planner.js` — application-level route planning.
- `app/src/data/metro-data.js` — canonical network data and derived graph implementation.
- `app/src/data/metro-network.js` — narrow interface used by callers that need metro data.
- `app/src/algorithms/` — fastest-route (Dijkstra) and least-interchange (BFS) implementations.
- `app/src/algorithms/route-result.js` — shared route-result construction.
- `app/src/screens/` — screen renderers.
- `app/src/components/` — reusable DOM renderers and interaction modules.
- `app/public/sw.js` — service worker for offline caching.

## Development

From `app/`:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run build:android
```

### Map regression checks

Run `npm run test:map` from `app/`. Playwright starts and stops a local Vite server and checks route emphasis, label overlaps, proportional station spacing, theme contrast, responsive sizing, and map controls. Tests use installed Microsoft Edge on Windows; on other platforms, install Chromium first with `npx playwright install chromium`. Override the browser with `PLAYWRIGHT_CHANNEL` if needed.

The map uses one theme-aware label layer from `app/src/assets/delhi-metro-map.svg`. Selected routes have a contrasting border over muted background lines; labels are never dimmed or prioritized by route membership. Station spacing is expanded uniformly by 1.6× while label and marker sizes are retained, preserving the source schematic's distance ratios and directions (not measured geographic distances). Long names wrap, and crowded labels receive bounded vertical adjustments.

The map opens at a readable scale; pan to explore longer routes, use **Fit** for the whole-route overview, or reset to restore readable text.

## Updating metro data

Edit the ordered station sequences in `app/src/data/metro-data.js` (`LINE_STATIONS`) and the display names in `stationNames`. The station registry and graph are derived automatically. Update transfer times, fares, average distances, and exit gates in their respective sections when those policies or data change.

## Route assumptions

- Travel between adjacent stations is estimated at two minutes.
- Transfer times use station-specific values where available and four minutes otherwise.
- Distance uses an average distance per line, not track geometry.
- “Fastest” minimizes estimated travel time.
- “Least Changes” minimizes interchanges; when both route types have the same number of interchanges, the faster route is shown for both tabs.

The estimates are intended for planning, not official operational guidance.
