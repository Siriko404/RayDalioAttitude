/* Bottom navigation bar — Spec §4.6 FR-6.
 * 12 groups (10 live + 2 edu) in DAG order; idle = hairline; hover/current = dots.
 */

let _root = null;
let _groups = [];

export function renderNavBar(container, groups) {
  _root = container;
  _groups = groups;
  container.classList.add('nav-bar');
  container.innerHTML = groups.map(g => `
    <div class="nav-group" data-group-id="${g.id}" data-kind="${g.kind}" data-current="false">
      <span class="nav-group-label">${escape(g.label)}</span>
      <div class="nav-segment">
        ${Array.from({ length: g.cells }, (_, i) => `
          <button class="nav-cell" data-cell-index="${i}" aria-label="${g.label} step ${i+1}">
            <span class="nav-cell-dot" aria-hidden="true"></span>
            <span class="nav-cell-label">${escape(g.label)} · ${i+1}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

export function getGroups() { return _groups.slice(); }
export function getRoot() { return _root; }

function escape(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
