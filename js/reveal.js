// The ending: the card rises from below, the mirror of the cover sliding down.
// Nothing to click - the build-up starts on arrival at The Hoard.
import { slideIn } from './motion.js';

export function renderReward(result, config) {
  const card = document.createElement('div');
  card.className = 'reward parchment';
  card.innerHTML =
    '<div class="reward-body">' +
    '<div class="reward-head">' +
    `<div class="reward-badge">${result.emblem}</div>` +
    `<div><h2>${result.title}</h2><p>${result.desc}</p></div>` +
    '</div>' +
    '<div class="reward-media">' +
    `<img src="${result.img}" alt="${result.title} prize" decoding="async">` +
    `<span class="reward-emblem" aria-hidden="true">${result.emblem}</span>` +
    '</div>' +
    `<span class="prize">${result.prize}</span>` +
    '<div class="how">📸 <b>Screenshot this card</b> → Post to Stories → Tag ' +
    `<b>${config.handle}</b> + <b>${config.hashtag}</b><br>` +
    '3 winners (1 keychain / 1 slippers / 1 backpack). Free entry.</div>' +
    '<p class="enotice">Worried about your chances at the lucky draw?<br>' +
    'Donate via eNotice and get them as our gift for donors! $100 keychain · $300 slippers · $500 backpack<br>' +
    '<span class="muted">School Intranet &gt; eNotice &gt; Walkathon 26-27 · Limited leftover stock.</span></p>' +
    `<p class="winners">${config.winnersNote}</p>` +
    `<p class="tiny">VESTIGIA · GREEN &amp; WHITE WALKATHON · 7 NOV 2026<br>${config.handle}</p>` +
    '</div>' +
    '<div class="reward-actions">' +
    '<button class="btn" data-act="share">Share / Screenshot →</button>' +
    '<button class="btn ghost" data-act="again">Walk again</button>' +
    '</div>';

  // A missing photo degrades to the card emblem, never a broken icon.
  const media = card.querySelector('.reward-media');
  const img = card.querySelector('img');
  img.addEventListener('error', () => {
    img.remove();
    media.classList.add('failed');
  });
  return card;
}

export function createReveal({ root, onRewardShown }) {
  const host = root.querySelector('[data-reward]');
  const vault = root.querySelector('.vault');
  let shown = false;
  let timer = 0;

  function show() {
    if (shown) return;
    shown = true;
    root.hidden = false;
    root.classList.add('uncovering');
    host.hidden = false;

    timer = setTimeout(() => {
      host.classList.add('shown');
      slideIn(host.firstElementChild, '100%', 800, 'cubic-bezier(0.4, 0, 0.2, 1)');
      if (onRewardShown) onRewardShown(host.firstElementChild);
    }, 450);
  }

  function close() {
    clearTimeout(timer);
    shown = false;
    root.hidden = true;
    root.classList.remove('uncovering');
    host.hidden = true;
    host.classList.remove('shown');
    host.replaceChildren();
    if (vault) {
      vault.hidden = true;
      vault.removeAttribute('src');
    }
  }

  return { show, close };
}
