/* Sidebar 2.1 Holy Grail — Spec §4.4 FR-4.3 + §4.5 FR-5.3.
 * Educational ONLY — not in numbered live sequence. Reachable via dashed
 * nav-bar entry only. Math infographic + N_eff curves for ρ ∈ {0.05, 0.20, 0.40}.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { lineSeries } from '../charts/series-builder.js';

registerSlide({
  id: '2.1',
  title: 'Holy Grail',
  kind: 'edu',
  render(section, { payload }) {
    const onePoint = `<em>15+ uncorrelated streams</em> can reduce portfolio vol by up to <em>80%</em>.`;
    const caption = `<em>σ<sub>p</sub>/σ = 1/√N<sub>eff</sub></em> where <em>N<sub>eff</sub> = N / (1 + (N−1)·ρ̄)</em>. The math is brutal: any meaningful correlation collapses N<sub>eff</sub> regardless of how many streams you add.`;

    renderSlideShell(section, {
      step: 'EDU', section: '2.1 Holy Grail',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 2);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildNeffCurves());
  }
});

function buildNeffCurves() {
  const Ns = Array.from({ length: 30 }, (_, i) => i + 1);
  const sigP = (N, rho) => Math.sqrt((1 + (N - 1) * rho) / N);
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'category', data: Ns, name: 'N streams' },
    yAxis: { type: 'value', name: 'σ_p / σ', max: 1, min: 0.1 },
    series: [
      lineSeries({ name: 'ρ = 0.05', data: Ns.map(N => sigP(N, 0.05)), strokePattern: 'SOLID' }),
      lineSeries({ name: 'ρ = 0.20', data: Ns.map(N => sigP(N, 0.20)), strokePattern: 'DASH-LONG' }),
      lineSeries({ name: 'ρ = 0.40', data: Ns.map(N => sigP(N, 0.40)), strokePattern: 'DOTTED' })
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Dalio's "Holy Grail of investing" — 15 or more genuinely uncorrelated
  return streams — is mathematics, not magic. The portfolio vol reduction is
  bounded by <code>1/√N<sub>eff</sub></code> where N<sub>eff</sub> collapses
  toward 1 as average correlation rises.</p>
  <p>At ρ = 0.05 (very low), 15 streams cuts vol by ~70%. At ρ = 0.20
  (typical fund-of-funds), the floor jumps to ~50% regardless of N. At
  ρ ≥ 0.40, you're stuck above 70% of the single-stream vol no matter what.
  The "uncorrelated" bar is much higher than it sounds.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>research/08_template_for_investing.md §5-§7</li>
    <li>Dalio, <em>Engineering Targeted Returns and Risks</em> Chart 5 (p.8)</li>
  </ul>`;
