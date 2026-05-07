/* Slide 1.7 Inflation & Currency Debasement — Spec §4.3 + §4.5 FR-5.3.
 * Chart: 4-quadrant matrix on (real rate × growth) plane, each quadrant
 * filled with distinct pattern, current point overlaid as dot.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { computeInflation } from '../compute/inflation.js';

const REGIME_PHRASE = {
  DEFLATIONARY: 'in a <em>deflationary</em> phase — falling prices, real rates positive',
  BEAUTIFUL:    'in a <em>beautiful</em> moderate-inflation regime — 1-3% prices, real rates positive',
  STAGFLATION:  'in a <em>stagflationary</em> regime — high prices alongside weak growth',
  INFLATIONARY: 'in an <em>inflationary debasement</em> regime — high prices and negative real rates'
};

registerSlide({
  id: '1.7',
  title: 'Inflation & Currency Debasement',
  render(section, { payload }) {
    const out = payload?.computedInflation ?? computeInflation(deriveInflationInput(payload));
    const onePoint = `Inflation is ${REGIME_PHRASE[out.regime] || `in <em>${(out.regime || '').toLowerCase()}</em>`}.`;
    const caption = `Headline CPI <em>${(out.pi_hdln ?? 0).toFixed(1)}%</em> yoy; real rate bucket <em>${out.RealRateBucket?.toLowerCase() ?? 'neutral'}</em>; monetary impulse μ <em>${(out.μ ?? 0).toFixed(1)}%</em>.`;

    renderSlideShell(section, {
      step: '05', section: '1.7 Inflation & Currency',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:520px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildQuadrantMatrix(out, payload));
  }
});

function deriveInflationInput(payload) {
  // v1 stub — wire to FRED CPI/CPILFESL/DFII10/DTWEXBGS/GOLDPMGBD228NLBM
  return { pi_hdln: 0, pi_core: 0, NGDP_yoy: 0, M2_yoy: 0, r_mkt: 0, ΔFX_12m: 0, ΔGold_12m: 0, reserve_currency: true };
}

function buildQuadrantMatrix(out, payload) {
  const realRate = out.r_mkt ?? 0;
  const growth = (payload?.computedShortCycle?.g) ?? 0;
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'value', name: 'Real rate %', nameLocation: 'middle', nameGap: 32, min: -3, max: 3 },
    yAxis: { type: 'value', name: 'Growth %', nameLocation: 'middle', nameGap: 40, min: -5, max: 5 },
    series: [
      // Current point dot
      { type: 'scatter', symbolSize: 14, itemStyle: { color: '#000' }, data: [[realRate, growth]] }
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Inflation is governed by the relative supply of money, credit, and goods.
  Dalio classifies four regimes: deflationary (falling prices, positive real
  rates), beautiful (moderate 1-3% inflation, positive real rates and growth),
  stagflation (high prices alongside weak growth), and inflationary debasement
  (high prices, negative real rates, currency falling).</p>
  <p>The "DebaseFlag" fires when broad USD falls > 7% AND gold rises > 15% over
  the trailing year (calibrated against 1971/2002/2008/2020 — all triggered;
  1995-99 / 2014-15 — neither). Reserve-currency status raises the inflation
  threshold from 3% to 4% before "INFLATIONARY" regime triggers.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>CPIAUCSL</code>, <code>CPILFESL</code>, <code>DFII10</code>, <code>DGS10</code>, <code>DTWEXBGS</code>, <code>GOLDPMGBD228NLBM</code>, <code>M2SL</code></li>
    <li>research/07_inflation_currency.md §5-§7</li>
    <li>Dalio, <em>Principles for Dealing With the Changing World Order</em> Ch.4</li>
  </ul>`;
