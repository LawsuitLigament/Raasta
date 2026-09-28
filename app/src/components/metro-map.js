// ============================================
// ============================================
// Native Delhi Metro route map
// ============================================
// The supplied SVG is the authoritative network geometry. This module only
// adds the selected route overlay and interaction behaviour at the seam.

import { STATIONS, LINE_STATIONS } from '../data/metro-network.js';
import { MAP_WIDTH, MAP_HEIGHT, STATION_MAP_POSITIONS } from '../data/map-station-positions.js';
import networkSvg from '../assets/delhi-metro-map.svg?raw';
import { layoutMapLabels } from './map-label-layout.js';

const VIEWBOX_WIDTH = MAP_WIDTH;
const VIEWBOX_HEIGHT = MAP_HEIGHT;
const MIN_SCALE = 0.15;
const MAX_SCALE = 6;
// The source labels are 9 map units tall; scale geometry and text together.
const READABLE_SCALE = 12 / 9;
// Expand every corridor equally, preserving the schematic's distance ratios.
const NETWORK_SPACING = 1.6;
let networkSource;
let nativeStationCenters;

function getNetworkSource() {
  if (!networkSource) {
    const source = new DOMParser().parseFromString(networkSvg, 'image/svg+xml');
    networkSource = source.documentElement.querySelector('g');
    nativeStationCenters = [...networkSource.querySelectorAll('.stations path, .transferStations path, .interchanges rect')].map(node => {
      if (node.tagName === 'rect') {
        return { x: Number(node.getAttribute('x')) + Number(node.getAttribute('width')) / 2, y: Number(node.getAttribute('y')) + Number(node.getAttribute('height')) / 2 };
      }
      const [, x, y] = node.getAttribute('transform').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);
      return { x: Number(x), y: Number(y) };
    });
  }
  return networkSource;
}

export function renderMetroMap(activeRoute = null) {
  const container = document.createElement('div');
  container.className = 'metro-map-container';
  container.setAttribute('aria-label', 'Delhi Metro map showing the selected route');

  if (!activeRoute) {
    container.innerHTML = '<div class="map-empty-state">No route available to map.</div>';
    return container;
  }

  getNetworkSource();
  const route = createRouteGeometry(activeRoute);
  const svg = createSvg(route);
  const viewport = svg.querySelector('[data-map-viewport]');
  const controls = createControls();
  const summary = document.createElement('div');
  summary.className = 'map-route-summary';
  summary.innerHTML = `<strong>${escapeHtml(route.points[0]?.name || 'Origin')}</strong><span aria-hidden="true">→</span><strong>${escapeHtml(route.points.at(-1)?.name || 'Destination')}</strong><small>${route.totalStations} stations · ${route.interchanges.length} ${route.interchanges.length === 1 ? 'change' : 'changes'}</small>`;
  const hint = document.createElement('div');
  hint.className = 'map-interaction-hint';
  hint.textContent = 'Drag to pan · Pinch or scroll to zoom · Fit for overview';

  container.append(svg, summary, controls, hint);
  setupInteractions(container, viewport, controls, route);
  return container;
}

function createRouteGeometry(route) {
  const stations = [];
  route.segments.forEach((segment, segmentIndex) => {
    segment.stations.forEach((stationId, stationIndex) => {
      // A transfer station is shared by two segments; keep one visual node.
      if (stations.at(-1)?.id === stationId) return;
      stations.push({
        id: stationId,
        name: STATIONS[stationId]?.name || stationId,
        segmentIndex,
        segmentStationIndex: stationIndex,
        color: segment.lineColor,
      });
    });
  });

  const positionCache = new Map();
  const points = stations.map((station) => {
    const position = getStationPosition(station.id, station.color, positionCache);
    return { ...station, ...position };
  });

  return { ...route, points };
}

function getStationPosition(stationId, lineColor, positionCache) {
  if (positionCache.has(stationId)) return positionCache.get(stationId);

  const knownPosition = STATION_MAP_POSITIONS[stationId];
  if (knownPosition) {
    // The legacy registry contains label anchors, not marker centers. Snap
    // nearby anchors back to the source markers so highlights don't hit text.
    const center = nativeStationCenters.reduce((closest, candidate) =>
      Math.hypot(candidate.x - knownPosition.x, candidate.y - knownPosition.y) < Math.hypot(closest.x - knownPosition.x, closest.y - knownPosition.y) ? candidate : closest
    );
    const position = {
      ...(Math.hypot(center.x - knownPosition.x, center.y - knownPosition.y) <= 12 ? center : knownPosition),
      color: lineColor,
    };
    positionCache.set(stationId, position);
    return position;
  }

  const lineId = Object.entries(LINE_STATIONS).find(([, stationIds]) => stationIds.includes(stationId))?.[0];
  const stationIds = LINE_STATIONS[lineId] || [];
  const index = Math.max(0, stationIds.indexOf(stationId));
  let previousIndex = -1;
  let nextIndex = -1;
  for (let i = index - 1; i >= 0 && previousIndex < 0; i--) {
    if (STATION_MAP_POSITIONS[stationIds[i]]) previousIndex = i;
  }
  for (let i = index + 1; i < stationIds.length && nextIndex < 0; i++) {
    if (STATION_MAP_POSITIONS[stationIds[i]]) nextIndex = i;
  }
  const previous = previousIndex >= 0 ? STATION_MAP_POSITIONS[stationIds[previousIndex]] : null;
  const next = nextIndex >= 0 ? STATION_MAP_POSITIONS[stationIds[nextIndex]] : null;
  let position;
  if (previous && next) {
    const progress = (index - previousIndex) / (nextIndex - previousIndex);
    position = {
      x: previous.x + (next.x - previous.x) * progress,
      y: previous.y + (next.y - previous.y) * progress,
      color: lineColor,
    };
  } else if (previous) {
    position = { x: previous.x, y: previous.y, color: lineColor };
  } else if (next) {
    position = { x: next.x, y: next.y, color: lineColor };
  } else {
    // Keep an unknown station visible without inventing a corridor.
    position = { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2, color: lineColor };
  }
  positionCache.set(stationId, position);
  return position;
}

function createSvg(route) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-labelledby', 'route-map-title route-map-description');
  svg.classList.add('route-map-svg');

  const title = element('title', { id: 'route-map-title' }, 'Selected metro route');
  const description = element('desc', { id: 'route-map-description' }, 'An interactive Delhi Metro network map with the selected route highlighted.');
  const camera = element('g', { 'data-map-viewport': 'true' });
  const viewport = element('g', { 'data-map-geometry': 'true', transform: `scale(${NETWORK_SPACING})` });
  camera.appendChild(viewport);
  viewport.appendChild(element('rect', { x: 0, y: 0, width: VIEWBOX_WIDTH, height: VIEWBOX_HEIGHT, class: 'map-canvas' }));
  // Inline the trusted, vendored geometry so labels inherit the app theme and
  // aren't clipped at the source image's edges. Keep one shared label layer.
  const baseMap = element('g', { class: 'network-map-reference' });
  const network = getNetworkSource();
  const labels = document.importNode(network.querySelector('.labels'), true);
  for (const selector of ['.river', '.lines', '.transferStations', '.stations', '.interchanges']) {
    baseMap.appendChild(document.importNode(network.querySelector(selector), true));
  }
  // Increase station spacing, not marker size or track thickness.
  baseMap.querySelectorAll('.stations path, .transferStations path').forEach(marker => {
    marker.setAttribute('transform', `${marker.getAttribute('transform')} scale(${1 / NETWORK_SPACING})`);
  });
  baseMap.querySelectorAll('.interchanges rect').forEach(marker => {
    for (const [position, size] of [['x', 'width'], ['y', 'height']]) {
      const originalSize = Number(marker.getAttribute(size));
      marker.setAttribute(position, Number(marker.getAttribute(position)) + originalSize * (1 - 1 / NETWORK_SPACING) / 2);
      marker.setAttribute(size, originalSize / NETWORK_SPACING);
    }
    marker.setAttribute('rx', Number(marker.getAttribute('rx')) / NETWORK_SPACING);
  });
  viewport.appendChild(baseMap);

  route.segments.forEach((segment) => {
    const segmentPoints = segment.stations
      .map(stationId => route.points.find(point => point.id === stationId))
      .filter(Boolean);
    if (segmentPoints.length < 2) return;
    const d = segmentPoints.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
    viewport.appendChild(element('path', { d, class: 'route-halo' }));
    viewport.appendChild(element('path', { d, class: 'route-segment', stroke: segment.lineColor }));
  });

  route.points.forEach((point, index) => {
    const isStart = index === 0;
    const isEnd = index === route.points.length - 1;
    const group = element('g', { class: `route-station ${isStart ? 'route-start' : ''} ${isEnd ? 'route-end' : ''}` });
    group.appendChild(element('title', {}, `${point.name}${isStart ? ' — Start' : isEnd ? ' — Destination' : ''}`));
    group.appendChild(element('circle', { cx: point.x, cy: point.y, r: (isStart || isEnd ? 7 : 4) / NETWORK_SPACING, class: 'station-halo' }));
    group.appendChild(element('circle', { cx: point.x, cy: point.y, r: (isStart || isEnd ? 4 : 2) / NETWORK_SPACING, class: 'station-node', fill: point.color }));
    viewport.appendChild(group);
  });

  viewport.appendChild(labels);
  svg.append(title, description, camera);
  return svg;
}

function createControls() {
  const controls = document.createElement('div');
  controls.className = 'map-controls';
  controls.innerHTML = `
    <button type="button" data-map-action="zoom-in" aria-label="Zoom in" title="Zoom in">+</button>
    <button type="button" data-map-action="zoom-out" aria-label="Zoom out" title="Zoom out">−</button>
    <button type="button" data-map-action="rotate" aria-label="Rotate map" title="Rotate map">⟳</button>
    <button type="button" data-map-action="reset" aria-label="Reset map view" title="Reset readable map view">↺</button>
    <button type="button" data-map-action="fit" aria-label="Fit route" title="Fit entire route">Fit</button>
  `;
  return controls;
}

function setupInteractions(container, viewport, controls, route) {
  const routeBounds = getRouteBounds(route.points);
  const svg = container.querySelector('svg');
  let width = 0;
  let height = 0;
  let scale = READABLE_SCALE;
  let x = 0;
  let y = 0;
  let rotation = 0;
  let dragging = false;
  let pointerStart = null;
  const pointers = new Map();
  let pinchDistance = null;
  let pinchScale = 1;
  let pinchCenter = null;
  let pinchOrigin = null;

  const update = () => {
    viewport.setAttribute('transform', `translate(${x} ${y}) scale(${scale}) rotate(${rotation} ${routeBounds.centerX} ${routeBounds.centerY})`);
  };
  const zoom = (factor, centerX = width / 2, centerY = height / 2) => {
    const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
    const ratio = nextScale / scale;
    x = centerX - (centerX - x) * ratio;
    y = centerY - (centerY - y) * ratio;
    scale = nextScale;
    update();
  };
  const reset = (fit = false) => {
    const resetView = getInitialView(routeBounds, width, height, fit);
    scale = resetView.scale;
    x = resetView.x;
    y = resetView.y;
    rotation = 0;
    update();
  };

  controls.addEventListener('pointerdown', event => event.stopPropagation());
  controls.querySelector('[data-map-action="zoom-in"]').addEventListener('click', () => zoom(1.25));
  controls.querySelector('[data-map-action="zoom-out"]').addEventListener('click', () => zoom(0.8));
  controls.querySelector('[data-map-action="rotate"]').addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    update();
  });
  controls.querySelector('[data-map-action="reset"]').addEventListener('click', () => reset());
  controls.querySelector('[data-map-action="fit"]').addEventListener('click', () => reset(true));
  container.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = container.getBoundingClientRect();
    const pointX = event.clientX - rect.left;
    const pointY = event.clientY - rect.top;
    zoom(event.deltaY < 0 ? 1.12 : 0.89, pointX, pointY);
  }, { passive: false });
  container.addEventListener('pointerdown', (event) => {
    pointers.set(event.pointerId, event);
    container.setPointerCapture(event.pointerId);
    if (pointers.size === 1) {
      dragging = true;
      pointerStart = { clientX: event.clientX, clientY: event.clientY, x, y };
    } else if (pointers.size === 2) {
      dragging = false;
      pinchDistance = distance([...pointers.values()]);
      pinchScale = scale;
      const rect = container.getBoundingClientRect();
      const [first, second] = [...pointers.values()];
      pinchCenter = { x: (first.clientX + second.clientX) / 2 - rect.left, y: (first.clientY + second.clientY) / 2 - rect.top };
      pinchOrigin = { x, y };
    }
  });
  container.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, event);
    if (pointers.size === 2 && pinchDistance) {
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchScale * distance([...pointers.values()]) / pinchDistance));
      const rect = container.getBoundingClientRect();
      const [first, second] = [...pointers.values()];
      const ratio = scale / pinchScale;
      x = (first.clientX + second.clientX) / 2 - rect.left - (pinchCenter.x - pinchOrigin.x) * ratio;
      y = (first.clientY + second.clientY) / 2 - rect.top - (pinchCenter.y - pinchOrigin.y) * ratio;
      update();
    } else if (dragging && pointerStart) {
      x = pointerStart.x + event.clientX - pointerStart.clientX;
      y = pointerStart.y + event.clientY - pointerStart.clientY;
      update();
    }
  });
  const release = (event) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchDistance = null;
    dragging = pointers.size === 1;
    const remaining = [...pointers.values()][0];
    pointerStart = remaining ? { clientX: remaining.clientX, clientY: remaining.clientY, x, y } : null;
  };
  container.addEventListener('pointerup', release);
  container.addEventListener('pointercancel', release);
  container.addEventListener('lostpointercapture', release);
  const resizeObserver = new ResizeObserver(() => {
    if (!container.isConnected) {
      resizeObserver.disconnect();
      return;
    }
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const firstLayout = !width || !height;
    x += (rect.width - width) / 2;
    y += (rect.height - height) / 2;
    width = rect.width;
    height = rect.height;
    // SVG units match CSS pixels: no square-map letterboxing on tall screens.
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    if (firstLayout) {
      layoutMapLabels(svg.querySelector('.labels'), NETWORK_SPACING);
      reset();
    } else update();
  });
  resizeObserver.observe(container);
}


function getInitialView(routeBounds, width, height, fit = false) {
  const availableWidth = Math.max(1, width - 100);
  const availableHeight = Math.max(1, height - 180);
  const fittedScale = Math.min(availableWidth / (routeBounds.width + 160), availableHeight / (routeBounds.height + 80));
  const scale = fit
    ? Math.min(MAX_SCALE, Math.max(MIN_SCALE, fittedScale))
    : Math.min(2, Math.max(READABLE_SCALE, fittedScale));
  return {
    scale,
    x: (width - 48) / 2 - routeBounds.centerX * scale,
    y: height / 2 + 28 - routeBounds.centerY * scale,
  };
}

function getRouteBounds(points) {
  const xs = points.map(point => point.x * NETWORK_SPACING);
  const ys = points.map(point => point.y * NETWORK_SPACING);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function distance(points) {
  if (points.length < 2) return 0;
  return Math.hypot(points[0].clientX - points[1].clientX, points[0].clientY - points[1].clientY);
}

function element(tag, attributes = {}, text = '') {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  if (text) node.textContent = text;
  return node;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[character]));
}
