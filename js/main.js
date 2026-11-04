// Wires map, camera, quiz, chest and the panel states.
import { CONFIG } from './config.js';
import { WORLD, NODES, LEGS, QUESTIONS, RESULTS, PLATES, COVER } from './data.js';
import { buildWorld } from './map.js';
import { createCamera } from './camera.js';
import { createQuiz } from './quiz.js';
import { createChest, renderReward } from './chest.js';
import { shareResult } from './share.js';

const svg = document.getElementById('map');
const panel = document.getElementById('panel');
const chestLayer = document.getElementById('chest-layer');
const rewardHost = chestLayer.querySelector('[data-reward]');
const hud = {
  eyebrow: document.getElementById('hud-eyebrow'),
  stop: document.getElementById('hud-stop'),
  pct: document.getElementById('hud-pct'),
  steps: document.getElementById('hud-steps'),
};

hud.eyebrow.textContent = CONFIG.eyebrow;
const stepEls = QUESTIONS.map(() => {
  const step = document.createElement('span');
  step.className = 'step';
  step.innerHTML =
    '<svg viewBox="0 0 18 28" aria-hidden="true" focusable="false">' +
    '<ellipse cx="9" cy="9.4" rx="4.5" ry="7"/>' +
    '<ellipse cx="9" cy="21.4" rx="2.9" ry="3.4"/>' +
    '</svg>';
  hud.steps.appendChild(step);
  return step;
});

const map = buildWorld({ svg, world: WORLD, nodes: NODES, legs: LEGS, plates: PLATES });
const camera = createCamera({ svg, world: map.group });

let currentResult = null;

function setHud(step) {
  hud.stop.textContent = step > 0 ? `STOP ${Math.min(step, QUESTIONS.length)} / ${QUESTIONS.length}` : 'TRAILHEAD';
  hud.pct.textContent = `${step * 25}%`;
  stepEls.forEach((el, i) => {
    el.classList.toggle('on', i < step);
    el.classList.toggle('current', i === step - 1);
  });
}

function paint(sheet) {
  panel.classList.remove('away');
  panel.replaceChildren(sheet);
}

// Put the focused point high enough that its plate clears both the HUD
// and the bottom sheet.
const PLATE_H = 116; // world units, mirrors js/map.js
const PLATE_GAP = 56;

function syncCameraAnchor() {
  const hudBottom = document.getElementById('hud').getBoundingClientRect().bottom;
  const sheet = panel.querySelector('.sheet');
  const sheetTop = sheet ? sheet.getBoundingClientRect().top : window.innerHeight;
  const s = camera.scale();
  const plateH = PLATE_H * s;
  const gap = PLATE_GAP * s;
  const groupH = plateH + gap + 14;
  const centre = (hudBottom + sheetTop) / 2;
  const top = Math.max(hudBottom + 8, Math.min(centre - groupH / 2, sheetTop - 12 - groupH));
  // keep the node's own label above the sheet too
  const inset = 38 * s + 14;
  const markerY = Math.min(top + plateH + gap, sheetTop - inset);
  camera.setAnchorY(markerY / window.innerHeight);
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
  paint(sheet);
  setHud(0);
  map.showPlate('start', COVER.img);
  syncCameraAnchor();
  sheet.querySelector('#start-btn').addEventListener('click', () => quiz.start());
}

function renderQuestion(index) {
  const question = QUESTIONS[index];
  const pct = Math.round(((index + 1) / QUESTIONS.length) * 100);
  const sheet = document.createElement('section');
  sheet.className = 'sheet parchment';
  sheet.innerHTML =
    `<div class="qnum">${question.num}</div>` +
    `<h2 class="qtitle" tabindex="-1">${question.title}</h2>` +
    `<p class="qhint">${question.hint}</p>` +
    '<div class="opts"></div>' +
    '<div class="trail"><div class="dot done">👣</div>' +
    `<div class="trail-line"><i style="transform:scaleX(${pct / 100})"></i></div>` +
    '<div class="dot">🏁</div></div>' +
    `<div class="meta"><span>STOP ${index + 1} / ${QUESTIONS.length}</span><span>${pct}%</span></div>`;

  const opts = sheet.querySelector('.opts');
  for (const option of question.options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'opt';
    const label = document.createElement('span');
    label.textContent = option.label;
    const note = document.createElement('small');
    note.textContent = option.note;
    button.append(label, note);
    button.addEventListener('click', () => {
      panel.classList.add('away');
      map.hidePlates();
      quiz.choose(option.axis);
    });
    opts.append(button);
  }

  paint(sheet);
  setHud(index + 1);
  map.showPlate(LEGS[index].from, question.img);
  syncCameraAnchor();
  sheet.querySelector('.qtitle').focus({ preventScroll: true });
}

function finish(axis) {
  currentResult = RESULTS[axis];
  map.hidePlates();
  const vault = document.getElementById('vault-plate');
  if (vault) {
    vault.src = QUESTIONS[QUESTIONS.length - 1].img;
    vault.hidden = false;
  }
  rewardHost.replaceChildren(renderReward(currentResult, CONFIG));
  setHud(QUESTIONS.length);
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

window.addEventListener('resize', syncCameraAnchor);

rewardHost.addEventListener('click', (event) => {
  const button = event.target.closest('[data-act]');
  if (!button) return;
  if (button.dataset.act === 'share' && currentResult) shareResult(currentResult.title);
  if (button.dataset.act === 'again') restart();
});

quiz.reset();
renderCover();
