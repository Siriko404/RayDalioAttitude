/* Slide entry/exit AF reveals — Spec §4.9 FR-9.4.
 * On scroll-into-view, run airForceReveal on each .reveal-target child;
 * on scroll-out, run airForceRevealOut.
 */
import { airForceReveal, airForceRevealOut } from './af-reveal.js';

export function bindSlideReveals(scrollContainer) {
  const sections = Array.from(scrollContainer.querySelectorAll('section[data-slide-id]'));
  const armed = new WeakSet();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const slide = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
        if (armed.has(slide)) return;
        armed.add(slide);
        slide.dataset.armed = 'true';
        slide.querySelectorAll('.reveal-target').forEach(el => airForceReveal(el));
      } else if (!entry.isIntersecting) {
        if (!armed.has(slide)) return;
        armed.delete(slide);
        slide.dataset.armed = 'false';
        slide.querySelectorAll('.reveal-target').forEach(el => airForceRevealOut(el));
      }
    });
  }, { threshold: [0.3] });

  sections.forEach(s => observer.observe(s));
  return () => observer.disconnect();
}
