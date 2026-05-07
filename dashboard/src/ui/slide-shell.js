/* Slide shell — Spec §4.3 FR-3.
 * Renders: eyebrow + ONE point + caption + 3 collapsible tabs.
 */

export function renderSlideShell(container, opts) {
  const { step, section, onePoint, caption, chartHtml = '', notesHtml = '', sourcesHtml = '' } = opts;
  container.classList.add('slide');
  container.innerHTML = `
    <div class="slide-inner">
      <div class="eyebrow reveal-target">DALIO · ${escape(section)} · STEP ${escape(step)} OF 10</div>
      <h2 class="one-point reveal-target">${onePoint}</h2>
      <p class="caption reveal-target">${caption}</p>
      <div class="tab-group">
        <div class="tab-bar">
          <button class="tab" data-tab="chart" aria-selected="true">▼ Chart</button>
          <button class="tab" data-tab="notes" aria-selected="false">▶ Notes</button>
          <button class="tab" data-tab="sources" aria-selected="false">▶ Sources</button>
        </div>
        <div class="tab-pane" data-pane="chart" data-open="true">${chartHtml}</div>
        <div class="tab-pane" data-pane="notes" data-open="false">${notesHtml}</div>
        <div class="tab-pane" data-pane="sources" data-open="false">${sourcesHtml}</div>
      </div>
    </div>
  `;
  bindTabs(container);
}

function bindTabs(root) {
  const tabs = root.querySelectorAll('.tab');
  const panes = root.querySelectorAll('.tab-pane');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      const target = t.dataset.tab;
      tabs.forEach(x => {
        x.setAttribute('aria-selected', x.dataset.tab === target ? 'true' : 'false');
        x.textContent = (x.dataset.tab === target ? '▼ ' : '▶ ') + capitalize(x.dataset.tab);
      });
      panes.forEach(p => {
        p.dataset.open = p.dataset.pane === target ? 'true' : 'false';
      });
    });
  });
}

function escape(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
