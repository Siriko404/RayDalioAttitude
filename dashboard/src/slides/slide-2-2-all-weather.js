/* Slide 2.2 All-Weather — Spec §4.3 + §4.5 FR-5.3.
 * Chart: 5-sleeve stacked horizontal bar, each sleeve = distinct pattern.
 * Final tilted weights from FR-12 tilt arbiter overlay; baseline shown as
 * dashed outline reference.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { barSeries } from '../charts/series-builder.js';
import { AW_BASELINE_WEIGHTS, computeAllWeather, applyTilts } from '../compute/all-weather.js';
import { arbitrateTilts } from '../compute/tilt-arbiter.js';

const SLEEVE_PATTERNS = {
  equities: 'HATCH-D', int_treasury: 'HATCH-S', long_treasury: 'CROSSHATCH', gold: 'DOTS', commodities: 'VERT'
};

registerSlide({
  id: '2.2',
  title: 'All-Weather',
  render(section, { payload, wizard }) {
    const aw = payload?.computedAW ?? computeAllWeather({ vols: deriveVols(payload) });
    // Tilt arbitration uses upstream regime emits
    const arbitrated = arbitrateTilts({
      inflation: payload?.computedInflation ?? {},
      deleveragings: payload?.computedDelev ?? {},
      paradigms: payload?.computedParadigms ?? {}
    });
    const tilted = applyTilts(arbitrated.tilts);

    const onePoint = `The All-Weather portfolio for this regime tilts toward <em>${highlightMost(tilted)}</em>.`;
    const caption = `Portfolio vol <em>σ<sub>p</sub> = ${(aw.σ_p_pct ?? 0).toFixed(1)}%</em>; tilt rule <em>${arbitrated.binding_rule || 'BASE_AW'}</em>.`;

    renderSlideShell(section, {
      step: '08', section: '2.2 All-Weather',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildStackedBar(tilted, AW_BASELINE_WEIGHTS));
  }
});

function deriveVols(payload) {
  // v1 stub — compute 252-day rolling vol from FRED daily returns; default to
  // illustrative Apr-2026 values from research/09 §7 L132 if data missing.
  return { equities: 0.16, int_treasury: 0.06, long_treasury: 0.13, gold: 0.15, commodities: 0.18 };
}

function highlightMost(weights) {
  const baseline = AW_BASELINE_WEIGHTS;
  let maxDelta = 0; let maxKey = 'equities';
  for (const k of Object.keys(weights)) {
    const d = (weights[k] || 0) - (baseline[k] || 0);
    if (Math.abs(d) > Math.abs(maxDelta)) { maxDelta = d; maxKey = k; }
  }
  return maxKey.replace('_', ' ');
}

function buildStackedBar(tilted, baseline) {
  const sleeves = ['equities', 'int_treasury', 'long_treasury', 'gold', 'commodities'];
  return {
    grid: { left: 24, right: 24, top: 32, bottom: 64 },
    xAxis: { type: 'value', max: 1, axisLabel: { formatter: v => `${(v * 100).toFixed(0)}%` } },
    yAxis: { type: 'category', data: ['Recommended', 'Baseline'] },
    series: sleeves.map(k => barSeries({
      name: k, stack: 's', data: [tilted[k], baseline[k]], fillPattern: SLEEVE_PATTERNS[k]
    }))
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>The <em>All-Weather</em> portfolio is Dalio's structural answer to "I do not
  know which environment will arrive next, but each known environment requires
  different assets to do well." It allocates risk (not dollars) such that no
  single environmental shift can deal a knockout blow.</p>
  <p>The baseline weights (30/15/40/7.5/7.5) are calibrated for a balanced
  risk-parity profile. Tilts overlay regime-specific shifts from steps 1.4, 1.5,
  and 1.7 (per the FR-12 tilt arbiter), capped at ±10pt deviation per sleeve.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>SP500</code>, <code>DGS10</code>, <code>DGS20</code>, <code>GOLDPMGBD228NLBM</code>, <code>CPIAUCSL</code></li>
    <li>BCOM index (Stooq <code>^bcom</code>)</li>
    <li>research/09_all_weather.md §5-§7 + research/07 §6 L132 (±10pt cap)</li>
    <li>Robbins, <em>Money: Master the Game</em> Ch.7 (canonical Dalio weights)</li>
    <li>Dalio, <em>Engineering Targeted Returns and Risks</em></li>
  </ul>`;
