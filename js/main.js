// Wires map, camera, quiz, chest and the stop cards.
import { CONFIG } from './config.js';
import { WORLD, NODES, LEGS, QUESTIONS, RESULTS, PLATES, COVER } from './data.js';
import { buildWorld } from './map.js';
import { createCamera } from './camera.js';
import { createQuiz } from './quiz.js';
import { createChest, renderReward } from './chest.js';
import { shareResult } from './share.js';

const stage = document.getElementById('stage');
const svg = document.getElementById('map');
const panel = document.getElementById('panel');
const chestLayer = document.getElementById('chest-layer');
const rewardHost = chestLayer.querySelector('[data-reward]');

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
    '<h1>WHAT<br><em>TRACE</em><br>DID YOU<br>LEAVE?</h1>' +
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
  sheet.querySelector('#start-btn').addEventListener('click', () => quiz.start());
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
  chestLayer.hidden = false;
  const chestButton = chestLayer.querySelector('#chest');
  if (chestButton) chestButton.focus({ preventScroll: true });
}

const chest = createChest({
  root: chestLayer,
  onRewardShown: (card) => {
    const share = card && card.querySelector('[data-act="share"]');
    if (share) share.focus({ preventScroll: true });
  },
});

function restart() {
  chest.close();
  currentResult = null;
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
