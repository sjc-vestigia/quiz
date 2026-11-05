// Walks the marker leg by leg and decides the walker type.

const reduced = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const AXES = ['k', 's', 'p'];

export function createQuiz({
  legs,
  nodes,
  routes,
  prints,
  labels,
  camera,
  marker,
  onQuestion,
  onArrive,
  onFinish,
}) {
  const scores = { k: 0, s: 0, p: 0 };
  let leg = 0;
  let phase = 'cover';
  let busy = false;
  let gen = 0;
  let raf = 0;

  const setMarker = (p) => marker.setAttribute('transform', `translate(${p.x.toFixed(2)},${p.y.toFixed(2)})`);

  // Footprints drop in exactly where the marker has already walked.
  function stamp(set, travelled) {
    if (!set) return;
    while (set.cursor < set.items.length && set.items[set.cursor].at <= travelled) {
      set.items[set.cursor].el.classList.add('on');
      set.cursor += 1;
    }
  }

  function travel(path, dur, set, done) {
    const total = path.getTotalLength();
    if (set) set.cursor = 0;
    setMarker(path.getPointAtLength(0));
    if (reduced()) {
      const end = path.getPointAtLength(total);
      setMarker(end);
      camera.place(end.x, end.y);
      stamp(set, total);
      done();
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const travelled = total * t;
      const p = path.getPointAtLength(travelled);
      setMarker(p);
      camera.follow(p.x, p.y);
      stamp(set, travelled);
      if (t < 1) raf = requestAnimationFrame(step);
      else done();
    };
    raf = requestAnimationFrame(step);
  }

  function winner() {
    let w = 'k';
    for (const axis of AXES) if (scores[axis] >= scores[w]) w = axis;
    return w;
  }

  function start() {
    if (phase !== 'cover') return;
    phase = 'asking';
    leg = 0;
    camera.focus(nodes.start.x, nodes.start.y);
    onQuestion(0);
  }

  function choose(axis) {
    if (busy || phase !== 'asking') return;
    if (!AXES.includes(axis) || !legs[leg]) return;
    busy = true;
    phase = 'traveling';
    scores[axis] += 1;

    const myGen = gen;
    const path = routes[leg][axis];
    const set = prints[leg] ? prints[leg][axis] : null;
    const dur = Math.max(700, Math.min(1400, path.getTotalLength() / 900));

    travel(path, dur, set, () => {
      if (myGen !== gen) return;
      const arrived = leg;
      const node = nodes[legs[arrived].to];
      camera.focus(node.x, node.y);
      if (labels[arrived] && labels[arrived][axis]) labels[arrived][axis].classList.add('inked');
      if (onArrive) onArrive(arrived);
      setTimeout(() => {
        if (myGen !== gen) return;
        busy = false;
        leg = arrived + 1;
        if (leg < legs.length) {
          phase = 'asking';
          onQuestion(leg);
        } else {
          phase = 'done';
          onFinish(winner());
        }
      }, 150);
    });
  }

  function reset() {
    gen += 1;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    busy = false;
    phase = 'cover';
    leg = 0;
    for (const axis of AXES) scores[axis] = 0;
    for (const set of routes) {
      for (const axis of AXES) {
        const path = set[axis];
        if (!path) continue;
        path.classList.remove('inked');
        path.removeAttribute('style');
      }
    }
    for (const set of prints) {
      for (const axis of AXES) {
        const trail = set[axis];
        if (!trail) continue;
        trail.cursor = 0;
        for (const item of trail.items) item.el.classList.remove('on');
      }
    }
    for (const set of labels) {
      for (const axis of AXES) {
        const label = set[axis];
        if (label) label.classList.remove('inked');
      }
    }
    const startNode = nodes.start;
    setMarker(startNode);
    camera.place(startNode.x, startNode.y);
  }

  return {
    start,
    choose,
    reset,
    state: () => ({ scores: { ...scores }, leg, phase, busy }),
  };
}
