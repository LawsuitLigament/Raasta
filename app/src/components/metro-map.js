// ============================================
// ============================================
// Native Delhi Metro route map
// ============================================
// The supplied SVG is the authoritative network geometry. This module only
// adds the selected route overlay and interaction behaviour at the seam.

import { STATIONS, LINE_STATIONS } from '../data/metro-network.js';
import { MAP_WIDTH, MAP_HEIGHT, STATION_MAP_POSITIONS } from '../data/map-station-positions.js';

const VIEWBOX_WIDTH = MAP_WIDTH;
const VIEWBOX_HEIGHT = MAP_HEIGHT;
const MIN_SCALE = 0.55;
const MAX_SCALE = 3.5;


export function renderMetroMap(activeRoute = null) {
  const container = document.createElement('div');
  container.className = 'metro-map-container';
  container.setAttribute('aria-label', 'Delhi Metro map showing the selected route');

  if (!activeRoute) {
    container.innerHTML = '<div class="map-empty-state">No route available to map.</div>';
    return container;
  }

  const route = createRouteGeometry(activeRoute);
  const svg = createSvg(route);
  const viewport = svg.querySelector('[data-map-viewport]');
  const controls = createControls();
  const summary = document.createElement('div');
  summary.className = 'map-route-summary';
  summary.innerHTML = `<strong>${escapeHtml(route.points[0]?.name || 'Origin')}</strong><span aria-hidden="true">→</span><strong>${escapeHtml(route.points.at(-1)?.name || 'Destination')}</strong><small>${route.totalStations} stations · ${route.interchanges.length} ${route.interchanges.length === 1 ? 'change' : 'changes'}</small>`;
  const hint = document.createElement('div');
  hint.className = 'map-interaction-hint';
  hint.textContent = 'Drag to pan · Pinch or scroll to zoom';

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
    const position = { ...knownPosition, color: lineColor };
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
  const viewport = element('g', { 'data-map-viewport': 'true' });
  viewport.appendChild(element('rect', { x: 0, y: 0, width: VIEWBOX_WIDTH, height: VIEWBOX_HEIGHT, class: 'map-canvas' }));
  const baseMap = element('image', {
    href: '/delhi-metro-map.svg',
    x: 0,
    y: 0,
    width: VIEWBOX_WIDTH,
    height: VIEWBOX_HEIGHT,
    preserveAspectRatio: 'xMidYMid meet',
    class: 'network-map-reference',
  });
  baseMap.addEventListener('error', () => {
    baseMap.remove();
    viewport.classList.add('map-asset-unavailable');
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
    group.appendChild(element('circle', { cx: point.x, cy: point.y, r: isStart || isEnd ? 15 : 9, class: 'station-halo' }));
    group.appendChild(element('circle', { cx: point.x, cy: point.y, r: isStart || isEnd ? 9 : 5, class: 'station-node', fill: point.color }));
    const isInterchange = route.interchanges.some(interchange => interchange.station === point.id);
    const labelPosition = getLabelPosition(route.points, index);
    group.appendChild(element('line', {
      x1: 0,
      y1: 0,
      x2: labelPosition.x - point.x,
      y2: labelPosition.y - point.y,
      class: 'station-label-connector',
    }));
    group.appendChild(createStationLabel(point.name, labelPosition));
    if (isStart || isEnd) {
      group.appendChild(element('text', { x: point.x, y: point.y + (point.y < 300 ? -25 : 28), class: 'station-badge', 'text-anchor': 'middle' }, isStart ? 'START' : 'DESTINATION'));
    }
    viewport.appendChild(group);
  });

  const legend = element('g', { class: 'map-legend' });
  route.segments.forEach((segment, index) => {
    const x = 58 + (index % 2) * 250;
    const y = 570 + Math.floor(index / 2) * 34;
    legend.appendChild(element('line', { x1: x, y1: y, x2: x + 28, y2: y, stroke: segment.lineColor, class: 'legend-line' }));
    legend.appendChild(element('text', { x: x + 40, y: y + 5, class: 'legend-label' }, segment.lineName));
  });
  viewport.appendChild(legend);

  svg.append(title, description, viewport);
  return svg;
}

function createControls() {
  const controls = document.createElement('div');
  controls.className = 'map-controls';
  controls.innerHTML = `
    <button type="button" data-map-action="zoom-in" aria-label="Zoom in" title="Zoom in">+</button>
    <button type="button" data-map-action="zoom-out" aria-label="Zoom out" title="Zoom out">−</button>
    <button type="button" data-map-action="rotate" aria-label="Rotate map" title="Rotate map">⟳</button>
    <button type="button" data-map-action="reset" aria-label="Reset map view" title="Reset map view">↺</button>
  `;
  return controls;
}

function setupInteractions(container, viewport, controls, route) {
  const routeBounds = getRouteBounds(route.points);
  const initialView = getInitialView(routeBounds);
  let scale = initialView.scale;
  let x = initialView.x;
  let y = initialView.y;
  let rotation = 0;
  let dragging = false;
  let pointerStart = null;
  const pointers = new Map();
  let pinchDistance = null;
  let pinchScale = 1;

  const update = () => {
    viewport.setAttribute('transform', `translate(${x} ${y}) rotate(${rotation} ${VIEWBOX_WIDTH / 2} ${VIEWBOX_HEIGHT / 2}) scale(${scale})`);
  };
  const zoom = (factor, centerX = VIEWBOX_WIDTH / 2, centerY = VIEWBOX_HEIGHT / 2) => {
    const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
    const ratio = nextScale / scale;
    x = centerX - (centerX - x) * ratio;
    y = centerY - (centerY - y) * ratio;
    scale = nextScale;
    update();
  };
  const reset = () => {
    const resetView = getInitialView(routeBounds);
    scale = resetView.scale;
    x = resetView.x;
    y = resetView.y;
    rotation = 0;
    update();
  };

  controls.querySelector('[data-map-action="zoom-in"]').addEventListener('click', () => zoom(1.25));
  controls.querySelector('[data-map-action="zoom-out"]').addEventListener('click', () => zoom(0.8));
  controls.querySelector('[data-map-action="rotate"]').addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    update();
  });
  controls.querySelector('[data-map-action="reset"]').addEventListener('click', reset);
  container.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = container.getBoundingClientRect();
    const pointX = ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH;
    const pointY = ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT;
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
    }
  });
  container.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, event);
    if (pointers.size === 2 && pinchDistance) {
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchScale * distance([...pointers.values()]) / pinchDistance));
      update();
    } else if (dragging && pointerStart) {
      x = pointerStart.x + (event.clientX - pointerStart.clientX) * 1.5;
      y = pointerStart.y + (event.clientY - pointerStart.clientY) * 1.5;
      update();
    }
  });
  const release = (event) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchDistance = null;
    if (pointers.size === 0) { dragging = false; pointerStart = null; }
  };
  container.addEventListener('pointerup', release);
  container.addEventListener('pointercancel', release);
  update();
}

function getLabelPosition(points, index) {
  const point = points[index];
  const previous = points[index - 1] || point;
  const next = points[index + 1] || point;
  const tangentX = next.x - previous.x;
  const tangentY = next.y - previous.y;
  const tangentLength = Math.hypot(tangentX, tangentY) || 1;
  const normalX = -tangentY / tangentLength;
  const normalY = tangentX / tangentLength;
  const side = index % 2 === 0 ? 1 : -1;
  const offset = 44;

  return {
    x: Math.min(VIEWBOX_WIDTH - 100, Math.max(100, point.x + normalX * offset * side)),
    y: Math.min(VIEWBOX_HEIGHT - 70, Math.max(70, point.y + normalY * offset * side)),
  };
}

function createStationLabel(name, position) {
  const lines = wrapLabel(name);
  const lineHeight = 19;
  const width = Math.min(270, Math.max(72, Math.max(...lines.map(line => line.length)) * 9 + 22));
  const height = lines.length * lineHeight + 12;
  const group = element('g', {
    class: 'station-label',
    transform: `translate(${position.x} ${position.y})`,
    'aria-label': name,
  });
  group.appendChild(element('rect', {
    x: -width / 2,
    y: -height / 2,
    width,
    height,
    rx: 7,
    class: 'station-label-bg',
  }));
  const text = element('text', {
    x: 0,
    y: -((lines.length - 1) * lineHeight) / 2 + 5,
    class: 'station-label-text',
    'text-anchor': 'middle',
  });
  lines.forEach((line, lineIndex) => {
    text.appendChild(element('tspan', { x: 0, dy: lineIndex === 0 ? 0 : lineHeight }, line));
  });
  group.appendChild(text);
  return group;
}

function wrapLabel(name, maxCharacters = 22) {
  const words = name.split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    if (line && `${line} ${word}`.length > maxCharacters) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [name];
}

function getInitialView(routeBounds) {
  const scale = Math.min(2, Math.max(1, 780 / Math.max(routeBounds.width, routeBounds.height)));
  return {
    scale,
    x: VIEWBOX_WIDTH / 2 - routeBounds.centerX * scale,
    y: VIEWBOX_HEIGHT / 2 - routeBounds.centerY * scale,
  };
}

function getRouteBounds(points) {
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
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
