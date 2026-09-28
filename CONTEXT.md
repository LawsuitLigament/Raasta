# Project context

## Product

**Raasta** is a mobile-first Delhi Metro route planner. The repository is named `Metro Route`; the app currently uses `Raasta` in metadata and `Delhi Metro` in parts of the interface. The app runs in the browser as a Vite PWA and can be packaged for Android with Capacitor.

## Core concepts

- **Station** — a metro stop identified by a stable string ID, with a display name and one or more line IDs.
- **Line** — an ordered sequence of stations. Branch lines are represented as separate line IDs.
- **Network graph** — an undirected graph derived from line sequences. Adjacent stations have an estimated two-minute travel edge.
- **Transfer** — changing lines at the same station. Transfer time is station- and line-pair-specific when known, otherwise four minutes.
- **Route** — a calculated journey containing line segments, stations, transfers, estimated time, estimated distance, and source/destination IDs.
- **Fastest route** — the route minimizing estimated travel time, calculated by Dijkstra’s algorithm.
- **Least-interchange route** — the route minimizing line changes, with travel time used as the secondary preference, calculated by modified BFS.
- **Saved route** — a source/destination pair stored in browser `localStorage`; route calculations are performed again when needed.
- **Quick destination search** — a bottom-sheet station search opened from the collapsed floating navigation. With an origin selected, choosing a station calculates a route immediately; without one, it fills the destination and focuses the origin field.

## Runtime flow

`index.html` loads `main.js`. The entry point initializes the theme, header, bottom navigation, screen routes, router, offline badge, and service worker. The router renders one screen into `.screen-container` based on the URL hash.

The home screen selects stations and stores them in `core/state.js`. The results screen asks `core/route-planner.js` for both route types, stores the results, and renders the selected route. `algorithms/route-result.js` is the shared seam that converts either algorithm’s path into the stable route object consumed by the UI.

## Data ownership

`data/metro-data.js` is the canonical data implementation: line sequences, station names, derived station registry, graph, transfer times, fares, average distances, and exit gates. Callers should prefer `data/metro-network.js`, which exposes the narrower network interface and keeps storage details behind one seam.

## Estimation rules

- Adjacent-station travel is estimated at two minutes.
- Unknown transfers default to four minutes.
- Distance is estimated from average kilometers per line.
- Fares use the distance slabs and current off-peak/card discount rules in the data implementation.

These are planning estimates and are not official live-service data.

## Important seams

- `core/route-planner.js` owns the application-level choice and tie behavior between route algorithms.
- `algorithms/route-result.js` owns route-result invariants and derived display values.
- `data/metro-network.js` is the caller-facing interface for network facts and policies.
- `core/router.js` owns navigation; header and bottom navigation receive navigation as a callback rather than importing the router.
- `components/header.js` owns the floating navigation state, scroll collapse, map-mode vertical rail, and quick-search entry point.

## Known limitations

- The route map is an interactive vector map with pan, zoom, and route overlays. It uses locally vendored Delhi Metro map geometry where station positions can be matched, with line-order fallbacks for stations absent from the source map.
- Route and fare estimates are static-model calculations and do not account for live delays, closures, or service changes.
- The service worker caches the app shell and network responses; the offline update strategy should be revisited when release assets change.
