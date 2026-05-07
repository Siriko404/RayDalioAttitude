/* Slide 2.4 Risk Parity & Leverage — Spec §4.3 + §4.5 FR-5.3.
 * Two-panel chart: vol-contribution bars (left) + leverage gauge (right) with
 * vertical-stripe pattern.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { barSeries } from '../charts/series-builder.js';
import { computeRiskParity } from '../compute/risk-parity.js';

registerSlide({
  id: '2.4',
  title: 'Risk Parity & Leverage',
  render(section, { payload, wizard }) {
    const out = payload?.computedRiskParity ?? computeRiskParity({
      vols: { equities: 0.16, treasury10: 0.06, gold: 0.15, commodities: 0.18 },
      σ_target: wizard?.sigma_target || 0.10,
      r_p: 0.07415, r_f: 0.04, funding_spread_bp: 0
    });
    const onePoint = `Risk-parity weights at this vol target lever to <em>L = ${(out.L ?? 0).toFixed(2)}×</em>.`;
    const caption = `Leverage <em>L = ${(out.L ?? 0).toFixed(2)}×</em>; portfolio vol <em>σ<sub>p</sub> = ${(out.σ_p_pct ?? 0).toFixed(1)}%</em>; levered Sharpe <em>${(out.SR_lev ?? 0).toFixed(2)}</em>; funding-spread band <em>${(out.funding_spread_band ?? 'GREEN').toLowerCase()}</em>.`;

    renderSlideShell(section, {
      step: '10', section: '2.4 Risk Parity & Leverage',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildOption(out));
  }
});

function buildOption(out) {
  const sleeves = Object.keys(out.weights || {});
  const vc = sleeves.map(k => (out.weights[k] || 0) * 100);
  return {
    grid: [
      { left: 60, right: '55%', top: 32, bottom: 64 },
      { left: '55%', right: 32, top: 32, bottom: 64 }
    ],
    xAxis: [
      { gridIndex: 0, type: 'category', data: sleeves },
      { gridIndex: 1, type: 'value', show: false, max: 3 }
    ],
    yAxis: [
      { gridIndex: 0, type: 'value', axisLabel: { formatter: '{value}%' } },
      { gridIndex: 1, type: 'category', show: false, data: ['L'] }
    ],
    series: [
      { ...barSeries({ name: 'Weight', data: vc, fillPattern: 'HATCH-D' }), xAxisIndex: 0, yAxisIndex: 0 },
      { ...barSeries({ name: 'Leverage', data: [out.L], fillPattern: 'VERT' }), xAxisIndex: 1, yAxisIndex: 1 }
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>The All-Weather portfolio at its baseline weights produces a portfolio vol
  well below the target vol most investors prefer. Risk parity scales the
  whole portfolio uniformly to hit the target — this is the leverage L.</p>
  <p>Every basis point of funding spread above the risk-free rate translates
  to a Sharpe-ratio drag of <code>(L−1)/L · s/σ_p</code>. With L ≈ 1.65×,
  funding spread of 100bp drags Sharpe by ~6.6 percentage points. Hard cap:
  L ≤ 3×; rebalance trigger: vol drift > 25% from target.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>SP500</code>, <code>DGS10</code>, <code>GOLDPMGBD228NLBM</code>, <code>FEDFUNDS</code>, <code>DFF</code>, <code>DTB3</code>, <code>VIXCLS</code></li>
    <li>research/11_risk_parity_leverage.md §5-§7</li>
    <li>Dalio, <em>Engineering Targeted Returns and Risks</em> (Bridgewater, 2012)</li>
  </ul>`;
