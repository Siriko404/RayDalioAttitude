/* Sidebar 2.3 Alpha Generation — Spec §4.4 FR-4.4.
 * Educational ONLY. Manager-proprietary inputs (IC, N, ρ_avg, σ_α) — not for
 * general investor. Formula visualization, no live data.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { lineSeries } from '../charts/series-builder.js';

registerSlide({
  id: '2.3',
  title: 'Alpha (Portable)',
  kind: 'edu',
  render(section, { payload, wizard }) {
    const onePoint = `Skill compounds with breadth: <em>IR = IC · √n_dec</em>.`;
    const caption = `For <em>professional managers</em>: an Information Coefficient of 0.05 across 49 quarterly forecasts (~7 years) yields IR_slice ≈ 0.35. With 6 mostly-uncorrelated such streams (ρ = 0.25), portfolio IR ≈ 0.57.`;

    renderSlideShell(section, {
      step: 'EDU', section: '2.3 Alpha',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 2);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildIRGrid());
  }
});

function buildIRGrid() {
  // IR_port = IC · √n_dec · √N / √(1+(N-1)·ρ) — chart shows IR_port vs N for
  // three IC × ρ combinations.
  const Ns = Array.from({ length: 20 }, (_, i) => i + 1);
  const ir = (IC, n_dec, N, rho) => IC * Math.sqrt(n_dec) * Math.sqrt(N) / Math.sqrt(1 + (N - 1) * rho);
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'category', data: Ns, name: 'N streams' },
    yAxis: { type: 'value', name: 'Portfolio IR', max: 3 },
    series: [
      lineSeries({ name: 'IC=0.05, ρ=0.25', data: Ns.map(N => ir(0.05, 49, N, 0.25)), strokePattern: 'SOLID' }),
      lineSeries({ name: 'IC=0.05, ρ=0.10', data: Ns.map(N => ir(0.05, 49, N, 0.10)), strokePattern: 'DASH-LONG' }),
      lineSeries({ name: 'IC=0.10, ρ=0.25', data: Ns.map(N => ir(0.10, 49, N, 0.25)), strokePattern: 'DOTTED' })
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Active management seeks <em>alpha</em> — return uncorrelated to the
  market. The Fundamental Law of Active Management (Grinold 1989) decomposes
  alpha skill: <code>IR = IC · √breadth</code>. IC is forecast-skill;
  breadth is independent decisions per period.</p>
  <p>Most asset managers operate at IC ~ 0.05 and breadth ~ 49 (~7 years
  of quarterly forecasts), giving slice IR ~ 0.35. To raise portfolio IR
  to "very good" (~1.0), you need 6+ mostly-uncorrelated such streams
  (research/10 §5.3) — the same Holy Grail math, applied to skill.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>research/10_alpha.md §5-§7</li>
    <li>Grinold, R. (1989). The fundamental law of active management. <em>JPM</em> 15(3).</li>
    <li>Dalio, <em>Engineering Targeted Returns and Risks</em> Chart 5 (alpha decomposition)</li>
  </ul>`;
