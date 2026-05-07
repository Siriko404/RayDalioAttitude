/* Scrollspy — Spec §4.6 FR-6.7.
 * IntersectionObserver on each slide section; sets exactly one .nav-cell
 * data-current=true based on which slide's first half is in viewport.
 */

export function bindScrollspy(navBar, scrollContainer) {
  const sections = Array.from(scrollContainer.querySelectorAll('section[data-slide-id]'));
  if (sections.length === 0) return () => {};

  function setCurrent(slideId, cellIndex) {
    navBar.querySelectorAll('.nav-cell').forEach(c => { c.dataset.current = 'false'; });
    navBar.querySelectorAll('.nav-group').forEach(g => { g.dataset.current = 'false'; });
    const group = navBar.querySelector(`.nav-group[data-group-id="${slideId}"]`);
    if (!group) return;
    group.dataset.current = 'true';
    const cell = group.querySelector(`.nav-cell[data-cell-index="${cellIndex}"]`);
    if (cell) cell.dataset.current = 'true';
  }

  const observer = new IntersectionObserver((entries) => {
    // Pick the entry with highest intersectionRatio that's intersecting.
    let best = null;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
    }
    if (!best) return;
    const slideId = best.target.dataset.slideId;
    const cellIndex = best.target.dataset.cellIndex || '0';
    setCurrent(slideId, cellIndex);
  }, { threshold: [0.5] });

  sections.forEach(s => observer.observe(s));
  return () => observer.disconnect();
}
