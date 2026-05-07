/* Chip strip — Spec §4.7 + §4.8.
 * 4 regime chips: empire · debt · paradigm · inflation.
 * Status encoded via class (no color): green/amber/red.
 */

const CHIP_KINDS = [
  ['empire',    'Empire'],
  ['debt',      'Debt'],
  ['paradigm',  'Paradigm'],
  ['inflation', 'Inflation']
];

let _root = null;

export function renderChipStrip(container) {
  _root = container;
  container.classList.add('chip-strip');
  container.innerHTML = `
    <span class="chip-strip-eyebrow">REGIMES</span>
    ${CHIP_KINDS.map(([k, label]) => `
      <span class="chip" data-kind="${k}" data-filled="false" data-status="green">
        ${label}: <em>___</em>
      </span>
    `).join('')}
  `;
}

export function fillChip(kind, label, status = 'green') {
  if (!_root) return;
  const chip = _root.querySelector(`.chip[data-kind="${kind}"]`);
  if (!chip) return;
  chip.dataset.filled = 'true';
  chip.dataset.status = status;
  const labelMap = { empire: 'Empire', debt: 'Debt', paradigm: 'Paradigm', inflation: 'Inflation' };
  chip.innerHTML = `${labelMap[kind]}: <em>${escape(label)}${status === 'amber' ? ' ◆' : ''}</em>`;
}

function escape(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
