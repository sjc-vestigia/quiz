// Draws the ancient map once. All SVG here is static template text.
import { CONFIG } from './config.js';

const NS = 'http://www.w3.org/2000/svg';

const LAND =
  'M120,320 C260,180 520,140 760,220 C980,290 1120,180 1360,160 ' +
  'C1620,140 1760,300 1980,260 C2220,220 2400,120 2660,180 ' +
  'C2900,230 3080,380 3050,620 C3020,860 3140,980 3100,1200 ' +
  'C3060,1420 2900,1480 2960,1680 C3010,1840 2820,1900 2600,1860 ' +
  'C2360,1820 2180,1900 1960,1880 C1740,1860 1600,1760 1380,1800 ' +
  'C1160,1840 980,1900 760,1840 C540,1780 380,1860 220,1740 ' +
  'C60,1620 90,1600 90,1560 C210,1574 306,1550 336,1494 ' +
  'C300,1428 200,1396 92,1378 C60,1330 80,1280 140,1240 ' +
  'C200,1060 90,940 120,760 C150,580 40,420 120,320 Z';

// rolling grass hills rather than crags
function hills(x, y, count) {
  let out = '';
  for (let i = 0; i < count; i += 1) {
    const cx = x + i * 74;
    const h = 26 + (i % 2) * 9;
    const w = 66 + (i % 3) * 12;
    out +=
      `<path class="hill" d="M${cx - w},${y} C${cx - w * 0.5},${y - h * 1.25} ${cx + w * 0.5},${y - h * 1.25} ${cx + w},${y} Z"/><path class="hill-shade" d="M${cx + w * 0.1},${y - h * 0.62} C${cx + w * 0.5},${y - h * 0.7} ${cx + w * 0.8},${y - h * 0.35} ${cx + w},${y} L${cx + w * 0.1},${y} Z"/>` +
      `<path class="hill-light" d="M${cx - w * 0.5},${y - h * 0.62} C${cx - w * 0.18},${y - h * 1.02} ${cx + w * 0.14},${y - h * 1.04} ${cx + w * 0.4},${y - h * 0.74}"/>` +
      `<path class="hill-base" d="M${cx - w * 0.82},${y + 2} Q${cx},${y + 7} ${cx + w * 0.82},${y + 2}"/>`;
  }
  return out;
}

function forest(x, y, count) {
  let out = '';
  for (let i = 0; i < count; i += 1) {
    const cx = x + (i % 2) * 26 + Math.floor(i / 2) * 32;
    const base = y - Math.floor(i / 2) * 12;
    const h = 26 + ((i * 7) % 3) * 7;
    const r = 11 + (i % 3);
    out +=
      `<circle class="tree" cx="${cx}" cy="${base - 16}" r="${r}"/>` +
      `<circle class="tree" cx="${cx - r * 0.8}" cy="${base - 7}" r="${r * 0.8}"/>` +
      `<circle class="tree" cx="${cx + r * 0.8}" cy="${base - 7}" r="${r * 0.8}"/>` +
      `<path class="tree-trunk" d="M${cx},${base - 2} L${cx},${base + 8}"/>`;
  }
  return out;
}

function waves(x, y) {
  let out = '';
  for (let i = 0; i < 3; i += 1) {
    const wy = y + i * 15;
    out += `<path class="wave" d="M${x},${wy} q11,-7 22,0 t22,0 t22,0"/>`;
  }
  return out;
}

function islet(x, y, r) {
  return (
    `<path class="islet" d="M${x - r},${y} C${x - r * 0.6},${y - r * 0.72} ${x + r * 0.52},${y - r * 0.8} ${x + r},${y - r * 0.1} ` +
    `C${x + r * 0.68},${y + r * 0.62} ${x - r * 0.42},${y + r * 0.72} ${x - r},${y} Z"/>` +
    `<path class="islet-shore" d="M${x - r * 0.7},${y + 2} C${x - r * 0.2},${y + r * 0.5} ${x + r * 0.4},${y + r * 0.45} ${x + r * 0.8},${y}"/>`
  );
}

function compassRose(x, y, r) {
  return (
    `<g class="compass" transform="translate(${x},${y})">` +
    `<circle r="${r}" class="compass-ring"/>` +
    `<circle r="${r * 0.62}" class="compass-ring-inner"/>` +
    `<path class="compass-star" d="M0,${-r} L${r * 0.16},0 L0,${r} L${-r * 0.16},0 Z"/>` +
    `<path class="compass-star" d="M${-r},0 L0,${-r * 0.16} L${r},0 L0,${r * 0.16} Z"/>` +
    `<path class="compass-star-soft" d="M${-r * 0.7},${-r * 0.7} L0,0 L${r * 0.7},${r * 0.7} M${r * 0.7},${-r * 0.7} L0,0 L${-r * 0.7},${r * 0.7}"/>` +
    `<text class="compass-n" y="${-r - 12}">N</text>` +
    '</g>'
  );
}

function scaleBar(x, y) {
  return (
    `<g class="scale" transform="translate(${x},${y})">` +
    '<path d="M0,0 L200,0" class="scale-bar"/>' +
    '<path d="M0,-6 L0,6 M50,-3 L50,3 M100,-4 L100,4 M150,-3 L150,3 M200,-6 L200,6" class="scale-tick"/>' +
    '<text class="scale-text" x="0" y="24">0</text>' +
    '<text class="scale-text" x="200" y="24" text-anchor="end">200 PACES</text>' +
    '</g>'
  );
}

function cartouche(x, y) {
  return (
    `<g class="cartouche" transform="translate(${x},${y})">` +
    '<path class="cartouche-frame" d="M-230,-30 C-180,-44 -80,-22 0,-30 C80,-38 180,-46 230,-28 C242,-10 238,10 230,26 C180,38 80,20 0,28 C-80,36 -180,42 -230,24 C-240,8 -238,-12 -230,-30 Z"/>' +
    `<text class="cartouche-text" y="7">${CONFIG.cartouche}</text>` +
    '</g>'
  );
}

function flourishes() {
  const corner = (x, y, sx, sy) =>
    `<g class="flourish" transform="translate(${x},${y}) scale(${sx},${sy})">` +
    '<path d="M0,44 C0,18 18,0 44,0"/><path d="M8,52 C8,26 26,8 52,8"/>' +
    '<path d="M0,44 C14,44 22,36 22,22 C22,12 30,6 40,6"/>' +
    '<circle cx="46" cy="46" r="3"/>' +
    '</g>';
  return (
    corner(56, 56, 1, 1) +
    corner(3144, 56, -1, 1) +
    corner(56, 2244, 1, -1) +
    corner(3144, 2244, -1, -1)
  );
}

// A framed still pinned beside its node, drawn in world space so it pans with the map.
function nodePlate(id, node, plate, label) {
  const W = 168;
  const IH = 94;
  const CAP = 22;
  const H = IH + CAP;
  const x = node.x - W / 2;
  const bottom = node.y + (plate.dy || -56);
  const y = bottom - H;
  const ix = x + 4;
  const iy = y + 4;
  const iw = W - 8;
  const ih = IH - 8;
  const clip = `plate-clip-${id}`;
  return (
    `<g class="node-plate" data-plate="${id}">` +
    `<defs><clipPath id="${clip}"><rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="2"/></clipPath></defs>` +
    `<path class="plate-leader" d="M${node.x},${node.y - 26} L${node.x},${bottom}"/>` +
    `<circle class="plate-pin" cx="${node.x}" cy="${node.y - 26}" r="2.2"/>` +
    `<rect class="plate-paper" x="${x}" y="${y}" width="${W}" height="${H}" rx="3"/>` +
    `<rect class="plate-rule" x="${x + 3}" y="${y + 3}" width="${W - 6}" height="${IH - 6}" rx="2"/>` +
    `<image class="plate-photo" x="${ix}" y="${iy}" width="${iw}" height="${ih}" ` +
    `preserveAspectRatio="xMidYMid slice" clip-path="url(#${clip})"/>` +
    `<text class="plate-caption" x="${node.x}" y="${y + IH + 15}">${plate.plate} · ${label}</text>` +
    '</g>'
  );
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

function nodeGlyph(id, node, i) {
  if (id === 'chest') {
    return (
      `<g class="node node-hoard" data-node="${id}" transform="translate(${node.x},${node.y})">` +
      '<circle r="21" class="node-ring"/>' +
      '<g transform="scale(0.92)">' +
      '<path class="node-chest" d="M-13,0 L-13,-9 C-13,-16 13,-16 13,-9 L13,0 Z"/>' +
      '<path class="node-chest" d="M-15,0 L15,0 L15,7 L-15,7 Z"/>' +
      '<path class="node-keyhole" d="M0,1 L0,5"/>' +
      '</g>' +
      `<text class="node-label" y="38">${node.label}</text>` +
      '</g>'
    );
  }
  return (
    `<g class="node" data-node="${id}" transform="translate(${node.x},${node.y})">` +
    '<circle r="17" class="node-ring"/>' +
    '<circle r="11.5" class="node-ring-inner"/>' +
    '<circle r="3.6" class="node-dot"/>' +
    `<text class="node-numeral" y="-26">${ROMAN[i]}</text>` +
    `<text class="node-label" y="38">${node.label}</text>` +
    '</g>'
  );
}

// A single footprint stamp; mirrored left/right along the trail.
// one path for both shapes: half the elements in the map
const PRINT =
  'M-3.1,-2.6 a3.1,6.2 0 1,0 6.2,0 a3.1,6.2 0 1,0 -6.2,0 Z ' +
  'M-2.05,8.4 a2.05,2.7 0 1,0 4.1,0 a2.05,2.7 0 1,0 -4.1,0 Z';

function buildPrints(root, legs, routes) {
  const step = 58;
  return legs.map((leg, i) => {
    const set = {};
    for (const axis of Object.keys(leg.routes)) {
      const path = routes[i][axis];
      const host = root.querySelector(`.prints-set[data-leg="${i}"][data-axis="${axis}"]`);
      const total = path.getTotalLength();
      const items = [];
      let n = 0;
      for (let at = step * 0.6; at < total - 10; at += step) {
        const p = path.getPointAtLength(at);
        const a = path.getPointAtLength(Math.max(0, at - 2));
        const b = path.getPointAtLength(Math.min(total, at + 2));
        const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        const rad = ((deg + 90) * Math.PI) / 180;
        const side = n % 2 === 0 ? 1 : -1;
        const g = document.createElementNS(NS, 'path');
        g.setAttribute('class', 'print');
        g.setAttribute('d', PRINT);
        g.setAttribute(
          'transform',
          `translate(${(p.x + Math.cos(rad) * 10 * side).toFixed(1)},${(p.y + Math.sin(rad) * 10 * side).toFixed(1)}) ` +
            `rotate(${(deg + 90).toFixed(1)}) scale(${(side * 1.5).toFixed(2)} 1.5)`
        );
        host.appendChild(g);
        items.push({ el: g, at });
        n += 1;
      }
      set[axis] = { items, cursor: 0 };
      host.setAttribute('data-count', String(items.length));
    }
    return set;
  });
}

export function buildWorld({ svg, world, nodes, legs, plates }) {
  const parts = [];

  parts.push(
    '<defs>' +
      '<radialGradient id="sea-tint" cx="50%" cy="46%" r="72%">' +
      '<stop offset="0%" stop-color="#bcdad0"/>' +
      '<stop offset="62%" stop-color="#a2c7c2"/>' +
      '<stop offset="100%" stop-color="#7ea9a6"/>' +
      '</radialGradient>' +
      '<radialGradient id="land-tint" cx="46%" cy="40%" r="68%">' +
      '<stop offset="0%" stop-color="#f1f7de"/>' +
      '<stop offset="58%" stop-color="#d5e6ac"/>' +
      '<stop offset="100%" stop-color="#b5d48a"/>' +
      '</radialGradient>' +
      '<pattern id="sea-hatch" width="72" height="30" patternUnits="userSpaceOnUse">' +
      '<path d="M0,22 q18,-12 36,0 t36,0" class="sea-hatch-line"/>' +
      '<path d="M0,10 q18,-12 36,0 t36,0" class="sea-hatch-line"/>' +
      '</pattern>' +
      `<mask id="sea-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${world.w}" height="${world.h}">` +
      `<rect width="${world.w}" height="${world.h}" fill="#fff"/>` +
      `<path d="${LAND}" fill="#000"/>` +
      '</mask>' +
      '</defs>'
  );

  parts.push(`<rect class="sea" width="${world.w}" height="${world.h}"/>`);
  parts.push(`<rect class="sea-hatch" width="${world.w}" height="${world.h}" mask="url(#sea-mask)"/>`);
  parts.push(`<path class="coast" d="${LAND}"/>`);
  parts.push(
    `<path class="coast-stipple" d="${LAND}"/>` +
      islet(2740, 1712, 54) +
      islet(2620, 1810, 32) +
      islet(352, 470, 40) +
      islet(120, 1000, 24)
  );

  // rivers
  parts.push(
    '<path class="river" d="M1480,300 C1500,600 1560,900 1520,1200 C1480,1500 1300,1700 1080,1860"/>' +
    '<path class="river" d="M3060,760 C2820,820 2600,880 2380,1010"/>' +
    '<path class="river" d="M300,1000 C520,1080 700,1140 900,1120"/>'
  );

  // decorative terrain
  parts.push(
    '<g class="terrain">' +
      hills(700, 760, 3) +
      hills(1160, 470, 2) +
      hills(2480, 1450, 3) +
      hills(320, 1240, 2) +
      forest(1040, 720, 4) +
      forest(1960, 1580, 4) +
      forest(2620, 1160, 3) +
      forest(1080, 1700, 3) +
      hills(1180, 1560, 2) +
      forest(430, 1150, 3) +
      hills(620, 1100, 2) +
      forest(930, 1600, 3) +
      forest(640, 1240, 2) +
      hills(1040, 1500, 2) +
      forest(1500, 760, 2) +
      hills(2050, 1450, 2) +
      waves(1720, 1760) +
      waves(520, 400) +
      waves(2960, 960) +
      waves(240, 1700) +
      waves(150, 820) +
      waves(2300, 1780) +
      waves(760, 2060) +
      waves(1620, 2150) +
      waves(2700, 2090) +
      islet(1180, 2200, 44) +
      islet(2320, 2220, 34) +
      '</g>' +
      compassRose(1330, 1740, 58)
  );

  // routes, then the footprint trail that fills in behind the walker
  const routeMarkup = (leg, i) =>
    Object.entries(leg.routes)
      .map(
        ([axis, r]) =>
          `<path class="route" data-leg="${i}" data-axis="${axis}" d="${r.d}" vector-effect="non-scaling-stroke"/>`
      )
      .join('');
  parts.push(`<g class="routes">${legs.map(routeMarkup).join('')}</g>`);

  const printMarkup = (leg, i) =>
    Object.keys(leg.routes)
      .map((axis) => `<g class="prints-set" data-leg="${i}" data-axis="${axis}"></g>`)
      .join('');
  parts.push(`<g class="prints">${legs.map(printMarkup).join('')}</g>`);

  // nodes
  const ids = Object.keys(nodes);
  parts.push(
    `<g class="nodes">${ids
      .map((id, i) => nodeGlyph(id, nodes[id], i))
      .join('')}</g>`
  );

  // route names, placed after insertion where path measurement is available
  const labelMarkup = legs
    .map((leg, i) =>
      Object.entries(leg.routes)
        .map(
          ([axis, r]) =>
            `<text class="region-label" data-label-for="${i}-${axis}">${r.name}</text>`
        )
        .join('')
    )
    .join('');
  parts.push(`<g class="region-labels">${labelMarkup}</g>`);

  parts.push(
    compassRose(2860, 1700, 92) +
      scaleBar(2260, 1700) +
      cartouche(1560, 240) +
      flourishes()
  );

  // framed stills, one per point, pinned above their node
  parts.push(
    `<g class="node-plates">${Object.keys(plates || {})
      .map((id) => (nodes[id] ? nodePlate(id, nodes[id], plates[id], nodes[id].label) : ''))
      .join('')}</g>`
  );

  // player marker, anchored at its world point via transform
  parts.push(
    '<g id="marker" class="marker">' +
      '<g transform="scale(1.45)">' +
      '<circle class="marker-halo" r="19"/>' +
      '<ellipse class="marker-sole" cy="-2.6" rx="5" ry="9.4"/>' +
      '<ellipse class="marker-heel" cy="11" rx="3.2" ry="4"/>' +
      '<path class="marker-notch" d="M0,-16 L4.4,-22 -4.4,-22 Z"/>' +
      '</g>' +
      '</g>'
  );

  const group = document.createElementNS(NS, 'g');
  group.setAttribute('id', 'world');
  group.innerHTML = parts.join('');
  svg.replaceChildren(group);

  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.removeAttribute('viewBox');

  // measure and place route labels
  const labels = legs.map((leg, i) => {
    const set = {};
    for (const axis of Object.keys(leg.routes)) {
      const path = group.querySelector(`.route[data-leg="${i}"][data-axis="${axis}"]`);
      const label = group.querySelector(`[data-label-for="${i}-${axis}"]`);
      const len = path.getTotalLength();
      const p = path.getPointAtLength(len * 0.5);
      const a = path.getPointAtLength(Math.max(0, len * 0.5 - 2));
      const b = path.getPointAtLength(Math.min(len, len * 0.5 + 2));
      let deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
      if (deg > 90) deg -= 180;
      if (deg < -90) deg += 180;
      deg = Math.max(-60, Math.min(60, deg));
      // sit the name beside the trail, not on top of the footprints
      const rad = (deg * Math.PI) / 180;
      const lx = p.x + Math.sin(rad) * 28;
      const ly = p.y - Math.cos(rad) * 28;
      label.setAttribute('x', lx.toFixed(1));
      label.setAttribute('y', ly.toFixed(1));
      label.setAttribute('transform', `rotate(${deg.toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})`);
      set[axis] = label;
    }
    return set;
  });

  const routes = legs.map((leg, i) => {
    const set = {};
    for (const axis of Object.keys(leg.routes)) {
      set[axis] = group.querySelector(`.route[data-leg="${i}"][data-axis="${axis}"]`);
    }
    return set;
  });

  const prints = buildPrints(group, legs, routes);

  const nodeEls = {};
  for (const id of ids) nodeEls[id] = group.querySelector(`.node[data-node="${id}"]`);

  const marker = group.querySelector('#marker');
  marker.setAttribute('transform', `translate(${nodes.start.x},${nodes.start.y})`);

  const plateEls = {};
  for (const id of Object.keys(plates || {})) {
    const el = group.querySelector(`.node-plate[data-plate="${id}"]`);
    if (el) plateEls[id] = el;
  }

  // The still is fetched the first time its plate is shown, not at boot.
  function showPlate(id, img) {
    for (const [key, el] of Object.entries(plateEls)) {
      el.classList.toggle('on', key === id);
    }
    const el = plateEls[id];
    if (!el || !img) return;
    const photo = el.querySelector('.plate-photo');
    if (photo && photo.getAttribute('href') !== img) photo.setAttribute('href', img);
  }

  function hidePlates() {
    for (const el of Object.values(plateEls)) el.classList.remove('on');
  }

  return {
    routes,
    prints,
    labels,
    plates: plateEls,
    showPlate,
    hidePlates,
    nodes: nodeEls,
    chest: nodeEls.chest,
    marker,
    group,
  };
}
