// ============================================
// Interactive SVG Map Component
// ============================================

import { STATIONS, LINES, LINE_STATIONS } from '../data/metro-data.js';

export function renderMetroMap(activeRoute = null) {
  const width = 2000;
  const height = 2000;
  
  // Create container and SVG
  const container = document.createElement('div');
  container.className = 'metro-map-container';
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'map-svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  // Simple layout calculation
  // To avoid complex geographic plotting, we'll draw lines in a schematic grid
  const nodePositions = new Map();
  const gridSize = 120;
  
  // Hardcode a few key interchange coordinates (relative to center 1000,1000)
  const hubs = {
    'kashmere-gate': { x: 1000, y: 700 },
    'rajiv-chowk': { x: 1000, y: 1000 },
    'central-secretariat': { x: 1000, y: 1150 },
    'mandi-house': { x: 1150, y: 1000 },
    'inderlok': { x: 700, y: 700 },
    'kirti-nagar': { x: 600, y: 1000 },
    'hauz-khas': { x: 1000, y: 1400 },
    'botanical-garden': { x: 1600, y: 1400 },
    'kalkaji-mandir': { x: 1300, y: 1400 },
    'janakpuri-west': { x: 400, y: 1000 },
    'yamuna-bank': { x: 1300, y: 1000 },
    'new-delhi': { x: 1000, y: 850 },
    'dwarka-sector-21': { x: 100, y: 1100 },
    'dwarka': { x: 200, y: 1000 },
    'netaji-subhash-place': { x: 700, y: 500 },
    'azadpur': { x: 900, y: 500 },
    'dilli-haat-ina': { x: 1000, y: 1300 },
    'anand-vihar': { x: 1600, y: 800 },
    'lajpat-nagar': { x: 1200, y: 1300 },
    'rajouri-garden': { x: 500, y: 1000 },
  };

  // Populate node positions
  // Assign positions to hubs
  Object.keys(hubs).forEach(id => {
    if (STATIONS[id]) nodePositions.set(id, hubs[id]);
  });

  // Simple interpolation for the rest
  // This is a highly simplified approach to render something passable without a full GIS database
  Object.keys(LINE_STATIONS).forEach(lineId => {
    const sequence = LINE_STATIONS[lineId];
    
    // Find anchors in this line
    let lastAnchorIdx = -1;
    for (let i = 0; i < sequence.length; i++) {
      if (nodePositions.has(sequence[i])) {
        if (lastAnchorIdx !== -1) {
          // Interpolate between lastAnchor and i
          const start = nodePositions.get(sequence[lastAnchorIdx]);
          const end = nodePositions.get(sequence[i]);
          const steps = i - lastAnchorIdx;
          const dx = (end.x - start.x) / steps;
          const dy = (end.y - start.y) / steps;
          
          for (let j = lastAnchorIdx + 1; j < i; j++) {
            nodePositions.set(sequence[j], {
              x: start.x + dx * (j - lastAnchorIdx),
              y: start.y + dy * (j - lastAnchorIdx)
            });
          }
        }
        lastAnchorIdx = i;
      }
    }
    
    // Extrapolate the ends
    // If no anchors, just put it in a circle (fallback)
    if (lastAnchorIdx === -1) {
      sequence.forEach((s, i) => {
        nodePositions.set(s, {
          x: 1000 + 800 * Math.cos(2 * Math.PI * i / sequence.length),
          y: 1000 + 800 * Math.sin(2 * Math.PI * i / sequence.length)
        });
      });
    } else {
      // Extrapolate start
      const firstAnchor = sequence[lastAnchorIdx]; // Just use the first found anchor
      // This is a naive extrapolation, just pushing outward
      const lineAngle = (Object.keys(LINE_STATIONS).indexOf(lineId) / Object.keys(LINE_STATIONS).length) * Math.PI * 2;
      for (let i = 0; i < sequence.length; i++) {
        if (!nodePositions.has(sequence[i])) {
          nodePositions.set(sequence[i], {
             x: nodePositions.get(firstAnchor).x + gridSize * (i - sequence.indexOf(firstAnchor)) * Math.cos(lineAngle),
             y: nodePositions.get(firstAnchor).y + gridSize * (i - sequence.indexOf(firstAnchor)) * Math.sin(lineAngle)
          });
        }
      }
    }
  });

  // Highlight route logic
  const routeStations = new Set();
  const routeSegments = new Map(); // stationId -> nextStationId

  if (activeRoute) {
    activeRoute.segments.forEach(seg => {
      seg.stations.forEach((s, i) => {
        routeStations.add(s);
        if (i < seg.stations.length - 1) {
          const key1 = `${s}-${seg.stations[i+1]}`;
          const key2 = `${seg.stations[i+1]}-${s}`;
          routeSegments.set(key1, seg.lineColor);
          routeSegments.set(key2, seg.lineColor);
        }
      });
    });
  }

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const glowFilter = `
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  `;
  defs.innerHTML = glowFilter;
  svg.appendChild(defs);

  // Group for lines
  const linesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  linesGroup.setAttribute('class', 'map-lines');
  
  Object.keys(LINE_STATIONS).forEach(lineId => {
    const sequence = LINE_STATIONS[lineId];
    const color = LINES[lineId].color;
    
    // Draw paths between adjacent stations
    for (let i = 0; i < sequence.length - 1; i++) {
      const s1 = sequence[i];
      const s2 = sequence[i+1];
      const p1 = nodePositions.get(s1);
      const p2 = nodePositions.get(s2);
      
      if (!p1 || !p2) continue;

      const key1 = `${s1}-${s2}`;
      const key2 = `${s2}-${s1}`;
      
      const isRouteHighlight = activeRoute && (routeSegments.has(key1) || routeSegments.has(key2));
      const opacity = activeRoute ? (isRouteHighlight ? 1 : 0.15) : 0.6;
      const strokeWidth = activeRoute && isRouteHighlight ? 16 : 8;
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', strokeWidth);
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('opacity', opacity);
      
      if (isRouteHighlight) {
        line.setAttribute('filter', 'url(#glow)');
      }
      
      linesGroup.appendChild(line);
    }
  });
  
  svg.appendChild(linesGroup);

  // Group for stations
  const stationsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  stationsGroup.setAttribute('class', 'map-stations');

  // Group for labels
  const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelsGroup.setAttribute('class', 'map-labels');

  nodePositions.forEach((pos, id) => {
    const station = STATIONS[id];
    if (!station) return;

    const isInterchange = station.lines.length > 1;
    const isRouteStation = activeRoute && routeStations.has(id);
    const isStartOrEnd = activeRoute && (id === activeRoute.source || id === activeRoute.dest);
    
    const opacity = activeRoute ? (isRouteStation ? 1 : 0.2) : 1;
    const radius = isInterchange ? 14 : 8;
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pos.x);
    circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', isStartOrEnd ? 20 : radius);
    circle.setAttribute('fill', isInterchange ? '#fff' : '#000');
    circle.setAttribute('stroke', isStartOrEnd ? '#10b981' : '#333');
    circle.setAttribute('stroke-width', isStartOrEnd ? 6 : 4);
    circle.setAttribute('opacity', opacity);
    
    if (isRouteStation) {
      circle.setAttribute('filter', 'url(#glow)');
    }
    
    circle.setAttribute('data-id', id);
    circle.classList.add('map-station-dot');
    
    stationsGroup.appendChild(circle);

    // Only add labels for hubs or if it's on the route to prevent clutter
    if (isInterchange || isRouteStation) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x + radius + 10);
      text.setAttribute('y', pos.y + 5);
      text.setAttribute('font-family', 'sans-serif');
      text.setAttribute('font-size', isStartOrEnd ? '32px' : '20px');
      text.setAttribute('font-weight', isStartOrEnd || isRouteStation ? 'bold' : 'normal');
      text.setAttribute('fill', 'var(--text-primary)');
      text.setAttribute('opacity', opacity);
      text.textContent = station.name;
      // Shadow for readability
      text.style.textShadow = '0 1px 4px var(--bg-primary), 0 -1px 4px var(--bg-primary), 1px 0 4px var(--bg-primary), -1px 0 4px var(--bg-primary)';
      labelsGroup.appendChild(text);
    }
  });

  svg.appendChild(stationsGroup);
  svg.appendChild(labelsGroup);
  container.appendChild(svg);

  // Implement Pan & Zoom
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let scale = 1;
  
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.appendChild(defs);
  g.appendChild(linesGroup);
  g.appendChild(stationsGroup);
  g.appendChild(labelsGroup);
  
  svg.innerHTML = '';
  svg.appendChild(g);

  const updateTransform = () => {
    g.setAttribute('transform', `translate(${currentX}, ${currentY}) scale(${scale})`);
  };

  container.addEventListener('mousedown', (e) => {
    isPanning = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    container.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    updateTransform();
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoomFactor = Math.exp(wheel * zoomIntensity);
    
    // Calculate zoom relative to mouse position
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    currentX = mouseX - (mouseX - currentX) * zoomFactor;
    currentY = mouseY - (mouseY - currentY) * zoomFactor;
    scale *= zoomFactor;
    
    // Clamp scale
    scale = Math.min(Math.max(scale, 0.2), 5);
    updateTransform();
  });

  // Touch support for panning
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isPanning = true;
      startX = e.touches[0].clientX - currentX;
      startY = e.touches[0].clientY - currentY;
    }
  });

  container.addEventListener('touchmove', (e) => {
    if (!isPanning) return;
    if (e.touches.length === 1) {
      e.preventDefault(); // Prevent scrolling
      currentX = e.touches[0].clientX - startX;
      currentY = e.touches[0].clientY - startY;
      updateTransform();
    }
  });

  container.addEventListener('touchend', () => {
    isPanning = false;
  });

  // Center route if provided
  if (activeRoute) {
    // Basic centering logic could be added here, but for now we just rely on the user zooming
  } else {
    // Initial center adjustment
    currentX = -500;
    currentY = -500;
    scale = 0.6;
    updateTransform();
  }

  return container;
}
