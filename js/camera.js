// Keeps the player point centered and inside the world edges.
import { WORLD } from './data.js';

const EASE_MS = 700;

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const reduced = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createCamera({ svg, world }) {
  let vw = 1;
  let vh = 1;
  let s = 1;
  let tx = 0;
  let ty = 0;
  let cx = WORLD.w / 2;
  let cy = WORLD.h / 2;
  // where the focused point sits vertically: high enough that the point and its
  // plate stay clear of the bottom sheet
  let anchorY = 0.36;
  let raf = 0;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  function measure() {
    const rect = svg.getBoundingClientRect();
    vw = Math.max(1, rect.width);
    vh = Math.max(1, rect.height);
  }

  function computeScale() {
    // vw/1500 and vh/1000 decide how much world is visible around the player;
    // the WORLD terms guarantee the sea never shows past the map edge.
    s = Math.min(1.6, Math.max(vw / 1500, vh / 1000, vw / WORLD.w, vh / WORLD.h));
    return s;
  }

  function targetFor(x, y) {
    const loX = Math.min(0, vw - WORLD.w * s);
    const loY = Math.min(0, vh - WORLD.h * s);
    return {
      tx: clamp(vw / 2 - s * x, loX, 0),
      ty: clamp(vh * anchorY - s * y, loY, 0),
    };
  }

  function setAnchorY(ratio) {
    anchorY = Math.min(0.7, Math.max(0.2, ratio));
    place(cx, cy);
  }

  let last = '';
  function apply() {
    // Skip redundant style writes: each one is a full repaint of the map layer.
    const value = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
    if (value === last) return;
    last = value;
    world.style.transform = value;
    // strokes are declared in px and divided by the zoom, so they stay constant
    world.style.setProperty('--s', s.toFixed(4));
  }

  function focus(x, y, { animate = true } = {}) {
    cx = x;
    cy = y;
    const target = targetFor(x, y);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (!animate || reduced()) {
      tx = target.tx;
      ty = target.ty;
      apply();
      return;
    }
    const fromX = tx;
    const fromY = ty;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / EASE_MS);
      const e = easeInOut(t);
      tx = fromX + (target.tx - fromX) * e;
      ty = fromY + (target.ty - fromY) * e;
      apply();
      raf = t < 1 ? requestAnimationFrame(step) : 0;
    };
    raf = requestAnimationFrame(step);
  }

  function place(x, y) {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    cx = x;
    cy = y;
    const target = targetFor(x, y);
    tx = target.tx;
    ty = target.ty;
    apply();
  }

  // Called once per travel frame: snaps to the point, never starts a new tween.
  function follow(x, y) {
    cx = x;
    cy = y;
    const target = targetFor(x, y);
    tx = target.tx;
    ty = target.ty;
    apply();
  }

  function resize() {
    measure();
    computeScale();
    place(cx, cy);
  }

  measure();
  computeScale();
  place(cx, cy);

  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  return { focus, place, follow, resize, setAnchorY, scale: () => s, shot: () => ({ vw, vh, s, tx, ty, cx, cy }) };
}
