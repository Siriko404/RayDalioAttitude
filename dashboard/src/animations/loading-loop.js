/* loadingLoop wrapper — Spec §4.9 FR-9.2
 * reveal-IN (loading-tuned 0.05/0.20/0.06) → 700ms hold visible
 * → reveal-OUT (0.0/0.18/0.06) → 200ms hold invisible → repeat
 */
import { airForceReveal, airForceRevealOut } from './af-reveal.js';

const LOADING_IN = { minDelay: 0.05, maxDelay: 0.20, holdDuration: 0.06 };
const LOADING_OUT = { minDelay: 0.0, maxDelay: 0.18, holdDuration: 0.06 };
const HOLD_VISIBLE_MS = 700;
const HOLD_INVISIBLE_MS = 200;

const tickHandles = new WeakMap();

export function startLoadingLoop(el) {
  if (!el) return;
  el.dataset.looping = 'true';
  const tick = () => {
    if (el.dataset.looping !== 'true') return;
    airForceReveal(el, LOADING_IN);
    const visTimer = setTimeout(() => {
      if (el.dataset.looping !== 'true') return;
      airForceRevealOut(el, LOADING_OUT);
      const invTimer = setTimeout(tick, HOLD_INVISIBLE_MS);
      tickHandles.set(el, invTimer);
    }, HOLD_VISIBLE_MS);
    tickHandles.set(el, visTimer);
  };
  tick();
}

export function stopLoadingLoop(el) {
  if (!el) return;
  el.dataset.looping = 'false';
  const handle = tickHandles.get(el);
  if (handle) clearTimeout(handle);
}
