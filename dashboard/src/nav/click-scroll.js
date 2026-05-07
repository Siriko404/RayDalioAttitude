/* Click-to-smooth-scroll — Spec §4.6 FR-6.10.
 * Cell click → scroll to that cell's slide.
 * Group empty-space click → scroll to first cell of that group.
 */

export function bindClickScroll(navBar) {
  navBar.addEventListener('click', (e) => {
    const cell = e.target.closest('.nav-cell');
    if (cell) {
      const group = cell.closest('.nav-group');
      const groupId = group?.dataset.groupId;
      const cellIndex = cell.dataset.cellIndex;
      if (!groupId) return;
      scrollTo(groupId, cellIndex);
      return;
    }
    const group = e.target.closest('.nav-group');
    if (group) {
      const groupId = group.dataset.groupId;
      scrollTo(groupId, '0');
    }
  });
}

function scrollTo(slideId, cellIndex) {
  const sel = `section[data-slide-id="${slideId}"][data-cell-index="${cellIndex}"]`;
  const target = document.querySelector(sel);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
