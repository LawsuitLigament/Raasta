// Shared route-result construction for all route-search algorithms.

import { STATIONS, LINES, getTransferTime, AVG_DISTANCE_KM } from '../data/metro-network.js';

export function buildRouteResult(path, sourceId, destId, type) {
  if (path.length === 0) return null;

  const segments = [];
  let currentSegment = null;
  let totalTime = 0;
  const interchanges = [];

  for (const node of path) {
    if (node.isTransfer) {
      const transferTime = node.transferTime ?? getTransferTime(node.station, node.fromLine, node.toLine);
      totalTime += transferTime;
      interchanges.push({
        station: node.station,
        stationName: STATIONS[node.station]?.name,
        fromLine: node.fromLine,
        toLine: node.toLine,
        time: transferTime,
      });
      continue;
    }

    if (!currentSegment || currentSegment.line !== node.line) {
      if (currentSegment) segments.push(currentSegment);
      currentSegment = {
        line: node.line,
        lineName: LINES[node.line]?.name || node.line,
        lineColor: LINES[node.line]?.color || '#888',
        lineStatus: LINES[node.line]?.status || 'operational',
        stations: [node.station],
        times: [totalTime],
        stationCount: 1,
      };
    } else {
      currentSegment.stations.push(node.station);
      currentSegment.times.push(totalTime + 2);
      currentSegment.stationCount++;
      totalTime += 2;
    }
  }

  if (currentSegment) segments.push(currentSegment);

  const totalDistance = segments.reduce((distance, segment) => {
    const averageDistance = AVG_DISTANCE_KM[segment.line] || 1.3;
    return distance + (segment.stationCount - 1) * averageDistance;
  }, 0);

  const allStations = [...new Set(segments.flatMap(segment => segment.stations))];

  return {
    type,
    hasConstruction: segments.some(segment => segment.lineStatus === 'construction'),
    segments,
    interchanges,
    totalTime,
    totalStations: allStations.length,
    totalDistance: Math.round(totalDistance * 10) / 10,
    allStations,
    source: sourceId,
    dest: destId,
  };
}
