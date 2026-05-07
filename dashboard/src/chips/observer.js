/* IntersectionObserver wiring — Spec §4.7 FR-7.6.
 * When emitting slide is half in viewport, fill its chip via emit-fn.
 *
 * Map of slide id → emit fn returning { kind, label, status }.
 */
import { fillChip } from './chip-strip.js';

export function observeEmittingSlides(emitMap) {
  const filled = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.intersectionRatio < 0.5) return;
      const id = entry.target.dataset.slideId;
      if (!id || filled.has(id)) return;
      const fn = emitMap[id];
      if (!fn) return;
      const result = fn();
      if (result) {
        fillChip(result.kind, result.label, result.status);
        filled.add(id);
      }
    });
  }, { threshold: [0.5] });

  Object.keys(emitMap).forEach(id => {
    const el = document.querySelector(`section[data-slide-id="${id}"]`);
    if (el) observer.observe(el);
  });

  return () => observer.disconnect();
}
