// Native share, clipboard fallback, toast fallback.
let hideTimer = 0;

export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('on');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.remove('on'), 3400);
}

export async function shareResult(title) {
  const text = `I got ${title} — VESTIGIA Walkathon! Tag @sjcinteractclub #VESTIGIA2627 to win.`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'VESTIGIA', text });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied! Paste it in your Story with a screenshot.');
  } catch {
    showToast('Screenshot this card and tag @sjcinteractclub');
  }
}
