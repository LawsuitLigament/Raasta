const originals = new WeakMap();
const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_CHARS = 16;
const MAX_OFFSET = 24;
const STEP = 3;
const GAP = 2;

function wrap(name) {
  const lines = [];
  for (const word of name.split(/\s+/).filter(Boolean)) {
    const last = lines.length - 1;
    if (last >= 0 && lines[last].length + word.length + 1 <= MAX_CHARS) {
      lines[last] += ` ${word}`;
    } else {
      lines.push(word);
    }
  }
  return lines;
}

// Boxes and offsets use post-spacing, pre-zoom units; never screen coordinates.
function overlap(a, offset, b) {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left) + GAP;
  const height = Math.min(a.bottom + offset, b.bottom + b.offset)
    - Math.max(a.top + offset, b.top + b.offset) + GAP;
  return width > 0 && height > 0 ? width * height : 0;
}

/**
 * Lay out an attached SVG g.labels beneath a uniform spacingScale transform.
 * Call after fonts load, not on zoom. Owns text transforms and tspan layout.
 * Returns { moved, overlaps }; overlaps counts unresolved padded bbox pairs.
 */
export function layoutMapLabels(labels, spacingScale = 1.6) {
  if (!Number.isFinite(spacingScale) || spacingScale <= 0) {
    throw new RangeError('spacingScale must be a finite positive number');
  }
  if (!labels?.isConnected || !labels.ownerSVGElement) {
    throw new Error('layoutMapLabels requires an attached SVG label group');
  }
  const view = labels.ownerDocument.defaultView;
  const items = [...labels.querySelectorAll('text')].map((text, index) => {
    let original = originals.get(text);
    if (!original) {
      const span = text.querySelector('tspan');
      original = {
        x: text.x.baseVal[0]?.value ?? 0,
        y: text.y.baseVal[0]?.value ?? 0,
        name: (text.getAttribute('data-station-name') || text.textContent)
          .replace(/\s+/g, ' ').trim(),
        baseline: span?.getAttribute('dominant-baseline'),
      };
      originals.set(text, original);
    }
    const { x, y, name, baseline } = original;
    const fontSize = parseFloat(view.getComputedStyle(text).fontSize) || 9;
    const lines = wrap(name);
    // Reuse existing tspans where possible, keeping their attributes intact.
    const spans = [...text.querySelectorAll('tspan')];
    text.replaceChildren(...lines.map((line, lineIndex) => {
      const span = spans[lineIndex] || text.ownerDocument.createElementNS(SVG_NS, 'tspan');
      span.textContent = line;
      span.setAttribute('x', x);
      span.setAttribute('y', y + lineIndex * fontSize * 1.15);
      span.setAttribute('dy', '0');
      if (baseline) span.setAttribute('dominant-baseline', baseline);
      return span;
    }));
    text.setAttribute('transform', `translate(${x} ${y}) scale(${1 / spacingScale}) translate(${-x} ${-y})`);
    const box = text.getBBox();
    return {
      text, x, y, index, offset: 0,
      left: x * spacingScale + box.x - x,
      right: x * spacingScale + box.x - x + box.width,
      top: y * spacingScale + box.y - y,
      bottom: y * spacingScale + box.y - y + box.height,
    };
  });
  items.sort((a, b) => a.y - b.y || a.x - b.x || a.index - b.index);
  const candidates = [0];
  for (let offset = STEP; offset <= MAX_OFFSET; offset += STEP) {
    candidates.push(-offset, offset);
  }
  // Revisit every label against every neighbour, not just previously placed ones.
  // Each accepted move reduces the global collision/displacement objective.
  for (let pass = 0; pass < 10; pass++) {
    let changed = false;
    const order = pass % 2 ? [...items].reverse() : items;
    for (const item of order) {
      const score = offset => {
        let count = 0;
        let area = 0;
        for (const other of items) {
          if (other === item) continue;
          const intersection = overlap(item, offset, other);
          if (intersection > 0) { count++; area += intersection; }
        }
        return [count, area, Math.abs(offset)];
      };
      let best = item.offset;
      let bestScore = score(best);
      for (const offset of candidates) {
        const next = score(offset);
        const difference = next.findIndex((value, i) => value !== bestScore[i]);
        if (difference >= 0 && next[difference] < bestScore[difference]) {
          best = offset;
          bestScore = next;
        }
      }
      if (best !== item.offset) { item.offset = best; changed = true; }
    }
    if (!changed) break;
  }
  let overlaps = 0;
  for (const [i, item] of items.entries()) {
    const { text, x, y, offset } = item;
    text.setAttribute('transform', `translate(0 ${offset / spacingScale}) translate(${x} ${y}) scale(${1 / spacingScale}) translate(${-x} ${-y})`);
    for (let j = i + 1; j < items.length; j++) {
      if (overlap(item, offset, items[j]) > 0) overlaps++;
    }
  }
  return { moved: items.filter(item => item.offset !== 0).length, overlaps };
}
