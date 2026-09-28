import { test, expect } from '@playwright/test';

async function openMap(page, fromStation = 'rajiv-chowk', toStation = 'kashmere-gate') {
  await page.goto('/');
  await page.evaluate(async ({ fromStation, toStation }) => {
    const { setState } = await import('/src/core/state.js');
    const { navigate } = await import('/src/core/router.js');
    setState({ fromStation, toStation });
    navigate('results');
  }, { fromStation, toStation });
  await page.getByRole('button', { name: 'View Map' }).click();
  await expect(page.locator('.metro-map-container')).toBeVisible();
  await expect.poll(async () => Math.round((await page.locator('.map-sliding-panel').boundingBox()).y)).toBe(0);
}

test('station spacing grows uniformly and labels do not overlap', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openMap(page);
  const layout = await page.locator('.route-map-svg').evaluate(svg => {
    const camera = svg.querySelector('[data-map-viewport]').getCTM();
    const geometry = svg.querySelector('.network-map-reference .lines').getCTM();
    const labels = [...svg.querySelectorAll('.labels text')].map(node => ({ name: node.getAttribute('data-station-name') || node.textContent, box: node.getBoundingClientRect() }));
    const collisions = [];
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i].box;
        const b = labels[j].box;
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5) collisions.push([labels[i].name, labels[j].name]);
      }
    }
    return { scaleX: geometry.a / camera.a, scaleY: geometry.d / camera.d, collisions };
  });
  expect(layout.scaleX).toBeGreaterThanOrEqual(1.3);
  expect(layout.scaleX).toBeLessThanOrEqual(1.600001);
  expect(layout.scaleY).toBeCloseTo(layout.scaleX);
  expect(layout.collisions).toEqual([]);
});

test('selected route is visibly stronger than the network', async ({ page }) => {
  await openMap(page, 'rajiv-chowk', 'new-delhi');
  const emphasis = await page.locator('.route-map-svg').evaluate(svg => {
    const route = getComputedStyle(svg.querySelector('.route-segment'));
    const network = getComputedStyle(svg.querySelector('.network-map-reference .lines'));
    const context = getComputedStyle(svg.querySelector('.network-map-reference'));
    return { routeWidth: parseFloat(route.strokeWidth), networkWidth: parseFloat(network.strokeWidth), contextOpacity: Number(context.opacity) };
  });
  expect(emphasis.routeWidth / emphasis.networkWidth).toBeGreaterThanOrEqual(2);
  expect(emphasis.contextOpacity).toBeLessThanOrEqual(0.6);
});

for (const size of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  test(`station labels share one readable layer at ${size.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(size);
    await openMap(page);
    await expect(page.locator('.route-station .station-label')).toHaveCount(0);
    const label = page.locator('.route-map-svg .labels text').filter({ hasText: /^Rajiv Chowk$/ });
    await expect(label).toBeVisible();
    const metrics = await label.evaluate(node => {
      const matrix = node.getScreenCTM();
      return { fontSize: parseFloat(getComputedStyle(node).fontSize) * Math.hypot(matrix.a, matrix.b), fill: getComputedStyle(node).fill };
    });
    expect(metrics.fontSize).toBeGreaterThanOrEqual(12);
    expect(metrics.fill).not.toBe('rgb(0, 0, 0)');
    await expect(page.locator('.route-map-svg .labels text')).toHaveCount(241);
    expect(await page.locator('[data-map-geometry]').evaluate(node => node.lastElementChild.classList.contains('labels'))).toBe(true);
    const markersAligned = await page.locator('.route-map-svg').evaluate(svg => {
      const centers = [...svg.querySelectorAll('.stations path, .transferStations path, .interchanges rect')].map(node => {
        if (node.tagName === 'rect') return [Number(node.getAttribute('x')) + Number(node.getAttribute('width')) / 2, Number(node.getAttribute('y')) + Number(node.getAttribute('height')) / 2];
        return node.getAttribute('transform').match(/[-\d.]+/g).slice(0, 2).map(Number);
      });
      return [...svg.querySelectorAll('.route-station .station-node')].every(node => centers.some(([x, y]) => Math.hypot(x - node.cx.baseVal.value, y - node.cy.baseVal.value) < 0.01));
    });
    expect(markersAligned).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('map.png') });
  });
}

test('map uses desktop space and responds to resizing', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openMap(page);
  await expect.poll(async () => (await page.locator('.metro-map-container').boundingBox()).width).toBeGreaterThan(1200);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect.poll(async () => (await page.locator('.metro-map-container').boundingBox()).width).toBeGreaterThan(800);
  const dimensions = await page.locator('.route-map-svg').evaluate(svg => ({
    width: svg.viewBox.baseVal.width,
    height: svg.viewBox.baseVal.height,
    actualWidth: svg.getBoundingClientRect().width,
    actualHeight: svg.getBoundingClientRect().height,
  }));
  expect(dimensions.width).toBeCloseTo(dimensions.actualWidth);
  expect(dimensions.height).toBeCloseTo(dimensions.actualHeight);
});

for (const theme of ['mocha', 'latte']) {
  test(`route and other station labels have identical, contrasting styles in ${theme}`, async ({ page }) => {
    await openMap(page);
    await page.evaluate(async theme => (await import('/src/core/theme.js')).applyTheme(theme), theme);
    const styles = await page.locator('.route-map-svg .labels').evaluate(layer => {
      const read = name => {
        const node = [...layer.querySelectorAll('text')].find(node => node.textContent === name);
        const style = getComputedStyle(node);
        return { fill: style.fill, fontSize: style.fontSize, fontWeight: style.fontWeight, stroke: style.stroke };
      };
      return { route: read('Rajiv Chowk'), other: read('Patel Chowk'), background: getComputedStyle(document.querySelector('.metro-map-container')).backgroundColor };
    });
    expect(styles.route).toEqual(styles.other);
    const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const levels = [luminance(styles.route.fill), luminance(styles.background)].sort((a, b) => a - b);
    expect((levels[1] + 0.05) / (levels[0] + 0.05)).toBeGreaterThan(4.5);
  });
}

test('pan follows the pointer and zoom/reset/fit remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openMap(page, 'samaypur-badli', 'huda-city-centre');
  const viewport = page.locator('[data-map-viewport]');
  const matrix = () => viewport.evaluate(node => {
    const m = node.getScreenCTM();
    return { a: m.a, e: m.e, f: m.f };
  });
  const initial = await matrix();
  await page.mouse.move(160, 400);
  await page.mouse.down();
  await page.mouse.move(210, 430);
  await page.mouse.up();
  const dragged = await matrix();
  expect(dragged.e - initial.e).toBeCloseTo(50);
  expect(dragged.f - initial.f).toBeCloseTo(30);
  await page.mouse.wheel(0, -100);
  await expect.poll(async () => (await matrix()).a).toBeGreaterThan(initial.a);
  const wheeled = await matrix();
  expect((210 - wheeled.e) / wheeled.a).toBeCloseTo((210 - dragged.e) / dragged.a);
  expect((430 - wheeled.f) / wheeled.a).toBeCloseTo((430 - dragged.f) / dragged.a);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  expect((await matrix()).a).toBeGreaterThan(wheeled.a);
  await page.getByRole('button', { name: 'Rotate map', exact: true }).click();
  await page.getByRole('button', { name: 'Reset map view' }).click();
  expect(await matrix()).toEqual(initial);
  await page.getByRole('button', { name: 'Fit route', exact: true }).click();
  expect((await matrix()).a).toBeLessThan(initial.a);
  for (const selector of ['.route-start', '.route-end']) {
    const bounds = await page.locator(selector).boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(80);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(750);
  }
});
