// Chest reveal and reward card.

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

export function createChest({ root, onRewardShown }) {
  const button = root.querySelector('#chest');
  const lid = root.querySelector('#chest-lid');
  const host = root.querySelector('[data-reward]');
  const vault = root.querySelector('.vault');
  let opened = false;
  let resolveOpen = null;

  function open() {
    if (opened) return Promise.resolve();
    opened = true;
    button.disabled = true;
    root.classList.add('open');
    requestAnimationFrame(() => lid.classList.add('lift'));
    return new Promise((resolve) => {
      resolveOpen = resolve;
      setTimeout(() => {
        host.hidden = false;
        host.classList.add('shown');
        root.classList.add('revealed');
        if (onRewardShown) onRewardShown(host.firstElementChild);
        if (resolveOpen) resolveOpen();
        resolveOpen = null;
      }, 700);
    });
  }

  function close() {
    opened = false;
    resolveOpen = null;
    root.hidden = true;
    root.classList.remove('open');
    root.classList.remove('revealed');
    lid.classList.remove('lift');
    host.hidden = true;
    host.classList.remove('shown');
    host.replaceChildren();
    if (vault) {
      vault.hidden = true;
      vault.removeAttribute('src');
    }
    button.disabled = false;
  }

  if (button) button.addEventListener('click', () => open());

  return { open, close };
}
