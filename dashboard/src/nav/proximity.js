/* Cursor-proximity detection — Spec §4.6 FR-6.6.
 * On mousemove: find cell whose X-center is nearest cursor X. Mark data-near=true.
 * On mouseleave: clear all near markers.
 */

export function bindProximity(navBar) {
  const cells = Array.from(navBar.querySelectorAll('.nav-cell'));
  if (cells.length === 0) return;

  function clearNear() {
    cells.forEach(c => { delete c.dataset.near; });
  }

  navBar.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    let nearest = cells[0];
    let minDist = Infinity;
    for (const cell of cells) {
      const r = cell.getBoundingClientRect();
      const cx = (r.left + r.right) / 2;
      const dist = Math.abs(cx - x);
      if (dist < minDist) { minDist = dist; nearest = cell; }
    }
    clearNear();
    nearest.dataset.near = 'true';
  });

  navBar.addEventListener('mouseleave', clearNear);
}
