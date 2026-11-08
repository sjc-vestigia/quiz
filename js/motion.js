// Cards arrive by CSS animation. If that animation is not going to run — the
// reduced-motion rule in base.css collapsing its duration, a user stylesheet,
// an extension — the same move is played from JS instead, so the card slides
// in rather than popping into place.

const reduced = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function slideIn(el, fromY, ms, easing) {
  if (!el || typeof el.animate !== 'function') return;
  const style = getComputedStyle(el);
  const duration = parseFloat(style.animationDuration) || 0;
  if (style.animationName !== 'none' && duration > 0.01) return;
  el.animate(
    [{ transform: `translateY(${fromY})` }, { transform: 'none' }],
    { duration: reduced() ? ms * 0.7 : ms, easing, fill: 'backwards' }
  );
}
