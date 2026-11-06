// Wires map, camera, quiz, the uncover and the stop cards.
import { CONFIG } from './config.js';
import { WORLD, NODES, LEGS, QUESTIONS, RESULTS, PLATES, COVER } from './data.js';
import { buildWorld } from './map.js';
import { createCamera } from './camera.js';
import { createQuiz } from './quiz.js';
import { createReveal, renderReward } from './reveal.js';
import { shareResult } from './share.js';

const stage = document.getElementById('stage');
const svg = document.getElementById('map');
const panel = document.getElementById('panel');
const intro = document.getElementById('intro');
const revealLayer = document.getElementById('reveal-layer');
const rewardHost = revealLayer.querySelector('[data-reward]');

const map = buildWorld({ svg, world: WORLD, nodes: NODES, legs: LEGS, plates: PLATES });
const camera = createCamera({ svg, world: map.group });

let currentResult = null;

// Decode the next still before it is needed: arrival then costs nothing.
const warmed = new Set();
function warmImage(src) {
  if (!src || warmed.has(src)) return;
  warmed.add(src);
  const img = new Image();
  img.src = src;
  if (img.decode) img.decode().catch(() => {});
}

function paint(node) {
  panel.classList.remove('away');
  panel.replaceChildren(node);
}

function renderCover() {
  const sheet = document.createElement('section');
  sheet.className = 'sheet parchment';
  sheet.innerHTML =
    `<p class="eyebrow">${CONFIG.eyebrow}</p>` +
    '<h1>WHAT <em>TRACE</em><br>DID YOU LEAVE?</h1>' +
    '<p class="sub">Walk the route in 30 seconds. 4 decisions. Get your walker type. ' +
    'Screenshot to win one of 3 souvenirs.</p>' +
    '<div class="trail"><div class="dot">👣</div>' +
    '<div class="trail-line"><i style="transform:scaleX(.05)"></i></div>' +
    '<div class="dot">🏁</div></div>' +
    `<div class="meta"><span>${CONFIG.date}</span><span>${CONFIG.handle.toUpperCase()}</span></div>` +
    '<div style="height:14px"></div>' +
    '<button class="btn" id="start-btn" type="button">Start the walk →</button>' +
    '<p class="tiny">Free entry · 3 winners · Tag @sjcinteractclub + #VESTIGIA2627</p>';
  panel.classList.remove('stop');
  stage.classList.remove('stop-open');
  paint(sheet);
  map.showPlate('start', COVER.img);
  sheet.querySelector('#start-btn').addEventListener('click', () => startWalk());
}

// The poster holds the stage until the walk starts; then it and the cover card
// slide down together and the map is what is left behind.
const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// matches the 0.75s transform transition on #intro and #panel
const SLIDE_MS = 780;
// the map alone, with nothing over it, before the first card covers it
const MAP_BEAT_MS = 320;

function startWalk() {
  if (intro.classList.contains('leaving')) return;
  intro.classList.add('leaving');
  panel.classList.add('sliding');
  if (reducedMotion()) {
    showMapThenWalk();
    return;
  }
  setTimeout(showMapThenWalk, SLIDE_MS);
}

function showMapThenWalk() {
  intro.classList.add('gone');
  panel.classList.remove('sliding');
  panel.classList.add('away');
  // two frames: one to drop the intro, one to paint the map that was behind
  // it, so the card never lands on a half-revealed stage
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => quiz.start(), reducedMotion() ? 0 : MAP_BEAT_MS);
    });
  });
}

function renderQuestion(index) {
  const question = QUESTIONS[index];
  const place = NODES[LEGS[index].from].label;

  const card = document.createElement('article');
  card.className = 'stop-card parchment';
  card.innerHTML =
    `<p class="stop-num">Stop ${index + 1} / ${QUESTIONS.length}</p>` +
    '<figure class="stop-plate">' +
    `<div class="stop-media"><img src="${question.img}" alt="${place} — VESTIGIA film still" decoding="async"></div>` +
    `<figcaption tabindex="-1">${question.title}</figcaption>` +
    '</figure>' +
    `<p class="stop-hint">${question.hint}</p>` +
    '<div class="signs"></div>';

  const signs = card.querySelector('.signs');
  for (const option of question.options) {
    const sign = document.createElement('button');
    sign.type = 'button';
    sign.className = 'sign';
    const label = document.createElement('span');
    label.textContent = option.label;
    const note = document.createElement('small');
    note.textContent = option.note;
    sign.append(label, note);
    sign.addEventListener('click', () => {
      panel.classList.add('away');
      stage.classList.remove('stop-open');
      map.hidePlates();
      quiz.choose(option.axis);
    });
    signs.append(sign);
  }

  panel.classList.add('stop');
  paint(card);
  stage.classList.add('stop-open');
  map.showPlate(LEGS[index].from, question.img);

  const caption = card.querySelector('figcaption');
  caption.focus({ preventScroll: true });

  const next = QUESTIONS[index + 1];
  warmImage(next ? next.img : QUESTIONS[QUESTIONS.length - 1].img);
  if (index === QUESTIONS.length - 1) {
    for (const result of Object.values(RESULTS)) warmImage(result.img);
  }
}

function finish(axis) {
  currentResult = RESULTS[axis];
  map.hidePlates();
  stage.classList.remove('stop-open');
  const vault = document.getElementById('vault-plate');
  if (vault) {
    vault.src = QUESTIONS[QUESTIONS.length - 1].img;
    vault.hidden = false;
  }
  rewardHost.replaceChildren(renderReward(currentResult, CONFIG));
  // the ground gives the card up on its own; nothing to click
  reveal.show();
}

const reveal = createReveal({
  root: revealLayer,
  onRewardShown: (card) => {
    const share = card && card.querySelector('[data-act="share"]');
    if (share) share.focus({ preventScroll: true });
  },
});

function restart() {
  reveal.close();
  currentResult = null;
  // snap the poster back rather than sliding it up over the map
  intro.classList.add('instant');
  intro.classList.remove('leaving', 'gone');
  requestAnimationFrame(() => intro.classList.remove('instant'));
  renderCover();
  quiz.reset();
  const start = document.getElementById('start-btn');
  if (start) start.focus({ preventScroll: true });
}

const quiz = createQuiz({
  legs: LEGS,
  nodes: NODES,
  routes: map.routes,
  prints: map.prints,
  labels: map.labels,
  camera,
  marker: map.marker,
  onQuestion: renderQuestion,
  onArrive: null,
  onFinish: finish,
});

rewardHost.addEventListener('click', (event) => {
  const button = event.target.closest('[data-act]');
  if (!button) return;
  if (button.dataset.act === 'share' && currentResult) shareResult(currentResult.title);
  if (button.dataset.act === 'again') restart();
});

quiz.reset();
renderCover();
window.__vestigiaBooted = true;
