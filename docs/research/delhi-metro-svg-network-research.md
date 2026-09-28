# Delhi Metro SVG/network research

**Question researched:** how the map SVG/network geometry is created, where station coordinates, line paths, and labels come from, how route highlighting is computed, and how to reproduce or update the SVG.

**Sources inspected:**

- Live deployment: <https://metro.coolhead.in/?from=RI&to=AHNR>
- Application repository: <https://github.com/biomathcode/delhi-metro-react>
- Repository revision inspected: `main` at the GitHub tree returned on 2026-09-28, commit `60cfc9c8454d073330db3b4f757f437b870db8e1`.
- Local repository conventions: `README.md`, `CONTEXT.md`, and the otherwise-empty `docs/` directory in `E:\Vansh Coding\Metro Route`.

## Executive conclusion

The map is not generated at runtime from geographic coordinates, nor is it an SVG loaded from a separate `.svg` file. The main map is a large, hand-authored JSX/SVG component in `src/components/metromap.tsx`, with a fixed `viewBox="0 0 1500 1450"`. It contains hard-coded schematic coordinates and path data for the lines, station circles, interchange rectangles/circles, labels, and a decorative Yamuna path.

`src/data/edge.json` duplicates the network's adjacent-station geometry as records of `{ from, to, stroke, path }`. Its `path` values are simple two-point SVG fragments whose endpoints match the station positions in `metromap.tsx`; these fragments are the routing graph's line color and the source for a selected route's combined SVG path. `src/data/stations-lite.json` supplies stable IDs, display names, and geographic latitude/longitude. Those geographic coordinates are used for weighted routing and are also used indirectly to locate a route stop on the schematic SVG; they are **not** projected into the map's 1500×1450 coordinates.

For `?from=RI&to=AHNR`, the selected route is expected to use the red-line edge fragments from Rithala (`RI`) to the yellow-line station Adarsh Nagar (`AHNR`), with the route path assembled from the edge fragments and rendered as a dark highlight over the base map. The live site itself could not be inspected in this session because it returned a Vercel Security Checkpoint, so the exact deployed asset/version and the live DOM/CSS appearance remain unverified. The repository source does establish the implementation described below.

## 1. How the base SVG/map geometry was created

### The map is inline JSX, not a generated/imported SVG asset

`src/components/metromap.tsx` renders an inline `<svg>` with `viewBox='0 0 1500 1450'`, a transformable root `<g>`, and nested groups for the river, colored lines, transfer stations, stations, interchanges, and labels. The line geometry is explicitly written as SVG `path` elements. For example, the red line is one path made from many `M`/`L`-style segments, and the yellow/blue/etc. lines follow the same pattern.

Source: [`src/components/metromap.tsx`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/components/metromap.tsx) (look for `viewBox='0 0 1500 1450'`, `className='lines'`, and the colored `stroke` paths).

The coordinates are schematic: stations are laid out for readability and line topology, not as a latitude/longitude projection. Evidence includes regular visual spacing on long sections and deliberate branches/offsets. The geographic coordinates in `stations-lite.json` do not numerically correspond to the SVG coordinates in `metromap.tsx`.

### What is hard-coded in `metromap.tsx`

- **Base rail geometry:** colored SVG paths in the `g.lines` group, with colors such as `#c1282b` (red), `#f5d618` (yellow), `#3e77bc` (blue), `#52aa55` (green), `#8115ff` (violet), `#e692be` (pink), `#F0F` (magenta), `#eb8923` (orange), and `#015b97` (Rapid Metro/Airport Express naming in route code).
- **Station marks:** repeated white-filled circles with a line-color stroke in `g.stations`.
- **Transfer marks:** circles in `g.transferStations` and rounded rectangles in `g.interchanges`.
- **Text labels:** explicit `<text>`/`<tspan>` elements in `g.labels`, with manually chosen x/y positions, anchors, font sizes, and line breaks.
- **Decorative geography:** a stylized Yamuna path in `g.river`, transformed with `scale(.3) translate(230px)`.

The source has no reference to a map-making package, GIS projection, OpenStreetMap renderer, or an imported base SVG. The committed component itself is therefore the primary source of the base geometry.

## 2. Where station coordinates, line paths, and labels come from

### Station IDs, names, and geographic coordinates

`src/data/stations-lite.json` is an array containing records such as:

```json
{"id":"RI","text":"Rithala","Latitude":28.7208,"Longitude":77.1072}
```

The type definition in `src/types/station.ts` confirms that `Latitude` and `Longitude` are optional numeric fields (or empty strings), while `id` and `text` are required. The routing module imports this file as `rawStations`, filters to records with IDs and names, and builds a `stationById` map.

Sources:

- [`src/data/stations-lite.json`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/data/stations-lite.json)
- [`src/types/station.ts`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/types/station.ts)
- [`src/utils/routePlanner.ts`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/utils/routePlanner.ts), especially the `stations`, `stationById`, `isValidCoordinatePair`, and `distanceBetweenStationsKm` definitions.

The repository also includes `src/data/metro.json`, `src/data/distancemetro.json`, and the large `src/data/labels.json`. The committed update script explains the metadata lineage: `scripts/update-labels-metadata.mjs` reads `labels.json`, `distancemetro.json`, and `metro.json`; normalizes station names; applies aliases; prefers web-sourced overrides when present; otherwise takes valid coordinates from `distancemetro.json`, then `metro.json`; and writes the enriched result back to `src/data/labels.json`. `stations-lite.json` is the smaller runtime dataset used by routing/map interaction, so the script is relevant provenance for the broader station metadata but is not a generator for the schematic SVG coordinates.

Source: [`scripts/update-labels-metadata.mjs`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/scripts/update-labels-metadata.mjs), especially `normalizeStationName`, `aliases`, `webSourcedMetadata`, `distanceByStation`, `metroByStation`, and the `enrichedLabels` mapping.

### Line paths and edge topology

`src/data/edge.json` is the routing/network edge table. Every record identifies adjacent stations, a line color, and a two-endpoint SVG fragment. For example, the beginning of the file contains:

```json
{
  "from": "RI",
  "to": "RHW",
  "stroke": "#c1282b",
  "path": "M491.4630971493037 201.80500715928318 L475.10521976829955 185.47967197466048"
}
```

The endpoint coordinates match the station locations in the inline SVG. The path is not a geographic route calculation; it is the already-authored schematic segment used both as graph metadata and as route-rendering geometry.

Source: [`src/data/edge.json`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/data/edge.json).

`metromap.tsx` and `edge.json` are therefore parallel representations that must be kept consistent manually unless an external, uncommitted generation process exists. The inspected repository does not contain a script that regenerates `metromap.tsx` or `edge.json` from another geometry source.

### Labels

The visible English label text and its schematic placement are in `metromap.tsx`, not computed from latitude/longitude. Labels use classes such as `AHNR-JGPI AZU-AHNR` and explicit x/y coordinates. At runtime, `graphsvg.tsx` maps labels to station IDs so they can be clicked and localized:

1. It reads `data-station-id` if present.
2. Otherwise it tries known text aliases (`stationBySvgLabel`).
3. Otherwise it tries known SVG class aliases (`stationBySvgClass`).
4. Otherwise it matches the English label text against `stations-lite.json` (`stationByEnglishName`).
5. It replaces the first `<tspan>` text with the localized station name.

Source: [`src/components/graphsvg.tsx`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/components/graphsvg.tsx), the `stationByEnglishName`, `stationBySvgLabel`, `stationBySvgClass` maps and the `useLayoutEffect` that annotates/rewrites labels.

This means label changes have two concerns: edit the base label text/placement in `metromap.tsx`, and ensure the label can resolve to a station ID (prefer adding a stable `data-station-id` or updating the explicit alias maps if the existing text/class convention cannot match it).

## 3. How routing and route highlighting are computed

### Network route selection

`src/utils/routePlanner.ts` imports `edge.json` and `stations-lite.json`. It creates one graph node per station. For each edge it computes a geographic Haversine distance from the two station records. Invalid/missing geographic pairs fall back to weight `1`. Airport Express edges receive a reduced routing weight (`Math.max(0.5, distanceKm * 0.28)`). Most edges are bidirectional; selected Rapid Metro edges are directed according to `RAPID_METRO_DIRECTED_EDGES`.

`buildRoutes(from, to, language, limit)` calls either `findShortestPath` or `findShortestPaths`. The latter maintains a distance-sorted candidate queue, avoids repeated stations within a candidate path, returns up to the requested limit (normally three), and limits alternatives to a window after the first route. The route algorithm therefore uses geographic coordinates for weights, but it uses `edge.json` topology—not the visible SVG DOM—to find paths.

Source: [`src/utils/routePlanner.ts`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/utils/routePlanner.ts), the `WeightedGraph` class, `distanceBetweenStationsKm`, edge-loading loop, and `buildRoutes`.

### Route SVG path assembly

`buildRoutePlan` converts the chosen station ID sequence into one SVG `d` string:

- For each consecutive station pair, it first looks for a forward edge path.
- If only the reverse edge exists, it calls `SVGPathUtils.inversePath` to reverse the path direction.
- It filters empty segments.
- It reverses the collected fragments and joins them.
- It inverses the combined path once more, producing a path in route order.

The output is returned as `{ svgPath, route }` in the `RoutePlan` type. The reversal logic is needed because `edge.json` path fragments are commonly stored in the opposite endpoint order from the `from`/`to` route traversal. `src/utils/index.ts` contains the parser/generator used by `inversePath`; it supports the SVG command forms present in the edge fragments.

Sources:

- [`src/utils/routePlanner.ts`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/utils/routePlanner.ts), `buildRoutePlan`, `getRouteEdge`, and the `svgPath` construction.
- [`src/utils/index.ts`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/utils/index.ts), `parse`, `generate`, and `inversePath`.
- [`src/types/route.ts`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/types/route.ts), `RoutePlan` and `RouteSummary`.

### Visible highlight and animation

`graphsvg.tsx` passes the route path into the map as two overlaid paths:

```tsx
<path className="route-highlight-halo" stroke="white" ... d={path} />
<path className="route-highlight-line" stroke="#111827" ... d={path} />
```

The route is therefore highlighted by drawing the assembled route `d` string over the base colored lines. It is not computed by changing the base line's stroke color or by filtering map segments in the DOM.

The same route `d` string is used as a hidden/transparent measurement path. `makePathElement` creates a temporary SVG path, then `getTotalLength()` and `getPointAtLength()` provide animation geometry. `resolveStationCoordinates()` derives schematic station coordinates from the endpoints of `edge.json` fragments: it counts shared endpoint coordinates per station, chooses the most frequently shared point, and fills remaining endpoints from neighboring edges. `getRouteStops()` projects each route station onto the combined route path by coarse sampling followed by a 16-iteration ternary search (`findClosestProgressOnPath`). Stops are sorted by path progress and near-duplicates are removed.

Animation then uses GSAP to tween a proxy `{ progress }`. Each update converts normalized progress to a point on the SVG path, samples a point four units ahead for train rotation, positions the train with `translate(...) rotate(...)`, and applies a camera transform centered on that point. Smooth mode is one tween from first to last stop; step mode is one tween per station pair with station callbacks and a dwell.

Source: [`src/components/graphsvg.tsx`](https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/components/graphsvg.tsx), especially `extractEdgePoints`, `resolveStationCoordinates`, `findClosestProgressOnPath`, `getRouteStops`, `setCameraForProgress`, the GSAP route effect, and the two `route-highlight-*` paths.

## 4. How to reproduce/export the SVG

### Reproduce the current application SVG

1. Clone the application repository at the desired commit.
2. Install dependencies with `pnpm install`.
3. Run the development app with `pnpm run dev` or build with `pnpm run build`.
4. Open the app and select a route. The URL form in the question uses station IDs (`RI` and `AHNR`), but the current repository's route pages also expose slug-based route URLs; use the app's own search/navigation to avoid assuming a URL format.
5. The map component is rendered from `src/components/metromap.tsx`; routing data is loaded from `src/data/edge.json` and `src/data/stations-lite.json`.
6. Use the map's “Download full map SVG” control. `downloadFullMapSvg` clones the live SVG, adds the SVG namespace, dimensions, viewBox, preserveAspectRatio, export font CSS, resets the root map transform to the fit transform, serializes the clone, and downloads `delhi-metro-full-map.svg`.

The export is a snapshot of the inline JSX-rendered SVG, including the current labels and any route/train/marker elements that are present in the clone at export time. The exporter is in `graphsvg.tsx`; the base SVG component is `metromap.tsx`.

### Update the map/network safely

For a new station or line segment, update all of the following consistently:

- `src/components/metromap.tsx`: add/update the schematic line segment, station marker, interchange marker if applicable, label placement/text, and any special label alias needed for click/localization.
- `src/data/edge.json`: add/update the corresponding `{ from, to, stroke, path }` edge with endpoints matching the schematic coordinates. Ensure both route directions work; the planner can reverse a fragment with `inversePath`, but endpoint geometry must still be correct.
- `src/data/stations-lite.json`: add/update stable ID, English display text, and valid geographic coordinates. These coordinates affect routing weights and station-to-path matching only through the edge-derived schematic coordinate lookup.
- `src/data/labels.json` and its source inputs if broader station metadata is also being maintained. Run `pnpm run update:labels` after updating the metadata sources; inspect the script's normalization aliases and web overrides for naming mismatches.
- `src/i18n.tsx` or the relevant localization data if the new label needs translated display names.

Then run the repository's documented checks: `pnpm run lint` and `pnpm run build`. There is also `scripts/test-svg-path-utils.mjs` for validating path reversal behavior.

### Important limitation: no geometry generator found

The inspected repository contains generators/updaters for SEO pages, label metadata, station gates, and SVG path utility tests, but no committed generator that derives `metromap.tsx` or `edge.json` from a canonical GIS/CSV source. Consequently, the reproducible source of truth for the schematic geometry is the committed JSX plus edge table. A future maintainable update process should introduce a canonical station/edge geometry data file and generate both the base SVG component/data and route edge fragments from it, but that would be a new design—not behavior demonstrated by the current repository.

## 5. Uncertainty and live-site limitation

- The live URL returned a Vercel Security Checkpoint rather than the application, so this research could not verify the deployed DOM, downloaded SVG, CSS, deployment commit, or whether production differs from the inspected `main` revision.
- The repository README says the route planner uses `edge.json` SVG fragments and `stations-lite.json` coordinates, which agrees with the implementation. The README does not claim that the schematic coordinates were generated from geographic coordinates; the source instead shows hard-coded SVG geometry.
- The provenance of the original hand-authored coordinates and labels—e.g. the person/tool/source map used before they were committed—is not documented in the repository. It is possible the author originally traced or converted another map, but that cannot be established from these primary sources.

## Primary-source index

- Live app: <https://metro.coolhead.in/?from=RI&to=AHNR>
- Repository: <https://github.com/biomathcode/delhi-metro-react>
- README: <https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/README.md>
- Map SVG JSX: <https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/components/metromap.tsx>
- Route rendering/animation: <https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/components/graphsvg.tsx>
- Routing/path assembly: <https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/utils/routePlanner.ts>
- SVG path reversal: <https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/utils/index.ts>
- Edge geometry/network table: <https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/data/edge.json>
- Station IDs/names/coordinates: <https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/src/data/stations-lite.json>
- Label metadata updater: <https://github.com/biomathcode/delhi-metro-react/blob/60cfc9c8454d073330db3b4f757f437b870db8e/scripts/update-labels-metadata.mjs>
