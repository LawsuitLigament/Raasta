// ============================================
// Route Display Component
// ============================================

import { STATIONS, LINES, LINE_STATIONS, calculateFare, EXIT_GATES } from '../data/metro-data.js';

export function renderRouteDisplay(route) {
  if (!route) {
    return `<div class="empty-state">
      <div class="empty-state-icon" style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border: 2px solid; border-radius: 50%; opacity: 0.5; margin: 0 auto; margin-bottom: var(--space-sm);">!</div>
      <div class="empty-state-title">No Route Found</div>
      <div class="empty-state-desc">Sorry, we couldn't find a route between these stations.</div>
    </div>`;
  }

  const fare = calculateFare(route.totalDistance);

  return `
    <div class="route-result" style="animation: fadeSlideIn var(--transition-base) ease-out">
      <!-- Summary Card -->
      <div class="route-summary">
        <div class="route-stat">
          <span class="route-stat-value animate-count">${route.totalTime}</span>
          <span class="route-stat-label">Minutes</span>
        </div>
        <div class="route-stat">
          <span class="route-stat-value animate-count">${route.totalStations}</span>
          <span class="route-stat-label">Stations</span>
        </div>
        <div class="route-stat">
          <span class="route-stat-value animate-count">${route.interchanges.length}</span>
          <span class="route-stat-label">Changes</span>
        </div>
      </div>

      <!-- Fare Display -->
      <div class="fare-compare" style="margin-top: var(--space-md);">
        <div class="fare-card">
          <span class="fare-type">Token</span>
          <span class="fare-amount"><span class="currency">₹</span>${fare.tokenFare}</span>
        </div>
        <div class="fare-card recommended">
          <span class="fare-type">DMRC Card</span>
          <span class="fare-amount"><span class="currency">₹</span>${fare.cardFare}</span>
          <span class="fare-savings">Save ₹${fare.savings}</span>
        </div>
      </div>

      <!-- Station List -->
      <div class="station-route-list" style="margin-top: var(--space-xl);">
        ${renderStationList(route)}
      </div>
    </div>
  `;
}

function getDirectionInfo(segment) {
  const lineSeq = LINE_STATIONS[segment.line];
  if (!lineSeq || segment.stations.length < 2) return '';
  const firstIdx = lineSeq.indexOf(segment.stations[0]);
  const lastIdx = lineSeq.indexOf(segment.stations[segment.stations.length - 1]);
  if (firstIdx === -1 || lastIdx === -1) return '';
  
  const isForward = lastIdx > firstIdx;
  const terminalStationId = isForward ? lineSeq[lineSeq.length - 1] : lineSeq[0];
  const terminalName = STATIONS[terminalStationId]?.name || terminalStationId;
  const platform = isForward ? '1' : '2';
  
  return `Platform ${platform} · Towards ${terminalName}`;
}

function renderStationList(route) {
  let html = '';
  let stationIndex = 0;
  let cumulativeTime = 0;

  route.segments.forEach((segment, segIdx) => {
    const dirInfo = getDirectionInfo(segment);

    segment.stations.forEach((stationId, sIdx) => {
      const station = STATIONS[stationId];
      const isFirst = segIdx === 0 && sIdx === 0;
      const isLast = segIdx === route.segments.length - 1 && sIdx === segment.stations.length - 1;
      const isInterchange = route.interchanges.some(ic => ic.station === stationId);
      const showInterchangeBanner = isInterchange && sIdx === segment.stations.length - 1 && segIdx < route.segments.length - 1;

      // Update time logic
      if (!isFirst && sIdx > 0) {
        cumulativeTime += 2; // Each station takes ~2 min
      }

      // Find the interchange info for this station
      const interchangeInfo = route.interchanges.find(ic => ic.station === stationId);

      let dotClass = 'station-dot';
      if (isFirst) dotClass += ' start';
      else if (isLast) dotClass += ' end';
      else if (isInterchange) dotClass += ' interchange';

      let exitGateHtml = '';
      if (isLast && EXIT_GATES[stationId]) {
        const gates = EXIT_GATES[stationId];
        exitGateHtml = `
          <div class="exit-gates-card" style="margin-top: var(--space-md); padding: var(--space-sm); background: rgba(0,0,0,0.02); border: 1px dashed var(--border-color); border-radius: var(--radius-sm);">
            <div style="font-size: var(--font-size-xs); font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-xs);">Exit Gates</div>
            ${gates.map(g => `
              <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); padding: 2px 0;">
                <span style="color: var(--text-primary); font-weight: 500;">Gate ${g.gates}</span>
                <span style="color: var(--text-muted); text-align: right;">${g.landmark}</span>
              </div>
            `).join('')}
          </div>
        `;
      }

      html += `
        <div class="station-route-item">
          <div class="station-line-track">
            <div class="${dotClass}" style="border-color: ${segment.lineColor}"></div>
            ${!isLast || segIdx < route.segments.length - 1 ? 
              `<div class="station-connector" style="background-color: ${segment.lineColor}"></div>` : ''}
          </div>
          <div class="station-info">
            <div class="station-name-route ${isFirst ? 'start-station' : ''} ${isLast ? 'end-station' : ''}">${station?.name || stationId}</div>
            ${isFirst ? `<div class="station-meta">Start · ${segment.lineName}<br/><span style="color: var(--text-primary); font-weight: 500;">${dirInfo}</span></div>` : ''}
            ${isLast && segIdx === route.segments.length - 1 ? `<div class="station-meta">Destination</div>${exitGateHtml}` : ''}
          </div>
          <div class="station-time" style="font-size: var(--font-size-xs); color: var(--text-muted); font-variant-numeric: tabular-nums; white-space: nowrap; padding-top: 1px; min-width: 40px; text-align: right;">
            ${cumulativeTime} min
          </div>
        </div>
      `;

      // Show interchange banner after the last station of a segment (if not the final segment)
      if (showInterchangeBanner && interchangeInfo) {
        cumulativeTime += interchangeInfo.time;
        const nextSegment = route.segments[segIdx + 1];
        const nextDirInfo = getDirectionInfo(nextSegment);
        html += `
          <div class="interchange-banner">
            <span>Change to <strong>${nextSegment.lineName}</strong><br/><span style="font-size: var(--font-size-xs); opacity: 0.9;">${nextDirInfo}</span> · ${interchangeInfo.time} min transfer</span>
          </div>
        `;
      }

      stationIndex++;
    });
  });

  return html;
}

function countTotalStations(route) {
  let count = 0;
  route.segments.forEach(seg => {
    count += seg.stations.length;
  });
  return count;
}
