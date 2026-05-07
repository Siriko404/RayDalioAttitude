/* Slide 1.5 Paradigm Shifts — Spec §4.3 + §4.5 FR-5.3.
 * Chart: 10yr returns line + 50yr-mean dash-dot reference.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { lineSeries } from '../charts/series-builder.js';
import { computeParadigms } from '../compute/paradigms.js';

const STAGE_PHRASE = {
  EARLY: 'in an <em>early</em> phase — old leaders still leading',
  MID:   'in <em>mid-paradigm</em> — tailwinds maxing out',
  LATE:  'in a <em>late</em> paradigm — peer leaders set to invert'
};

registerSlide({
  id: '1.5',
  title: 'Paradigm Shifts',
  render(section, { payload }) {
    const out = payload?.computedParadigms ?? computeParadigms(buildParadigmsInput(payload));
    const onePoint = `The current asset-return paradigm is ${STAGE_PHRASE[out.paradigm_stage] || out.paradigm_stage.toLowerCase()}.`;
    const caption = `Paradigm-Age composite <em>PA = ${(out.PA ?? 0).toFixed(2)}</em>; tailwinds <em>S_tail = ${out.S_tail}</em>; rank-inversion ρ <em>${(out.ρ ?? 0).toFixed(2)}</em>.`;

    renderSlideShell(section, {
      step: '06', section: '1.5 Paradigm Shifts',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildOption(payload));
  }
});

function buildParadigmsInput(payload) {
  // v1 stub — wire from Damodaran histretSP + FRED tailwind inputs
  return {
    decadeReturns: { SPX: { d2000s: 0, d2010s: 0 }, UST10: { d2000s: 0, d2010s: 0 }, Tbill: { d2000s: 0, d2010s: 0 }, Gold: { d2000s: 0, d2010s: 0 }, Cmdty: { d2000s: 0, d2010s: 0 } },
    RealRate10y: 0, FedFunds: 0, BuybackYield: 0, ProfitShare: 0, ProfitShareMean_plus_sigma: 0
  };
}

function buildOption(payload) {
  const damo = payload?.sources?.damodaran?.histretSP || [];
  const last50 = damo.slice(-50);
  const mean50 = last50.reduce((s, p) => s + (p.sp500 || 0), 0) / Math.max(1, last50.length);
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'category', data: last50.map(p => p.year) },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [
      lineSeries({ name: '10yr S&P returns', data: last50.map(p => (p.sp500 || 0) * 100), strokePattern: 'SOLID' }),
      {
        name: '50yr mean', type: 'line',
        data: last50.map(() => mean50 * 100),
        lineStyle: { color: '#000', width: 1, type: [5, 2, 1, 2] },  // DASH-DOT
        symbol: 'none', itemStyle: { color: '#000' }
      }
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>A "paradigm" is a sustained period — typically a decade — where one set of
  asset-return drivers dominates the others. Dalio's recurring observation:
  the leaders of one paradigm tend to <em>invert</em> in the next paradigm. The
  mechanism is structural — tailwinds get priced in, valuations stretch, the
  next paradigm starts as those tailwinds reverse.</p>
  <p>Paradigm-Age composite (research/05 §5.4) blends three signals: cross-decade
  rank inversion (Spearman ρ), count of currently-active tailwinds (4 binary
  flags), and consensus-vs-CAGR recency divergence (sigmoid).</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>Damodaran <code>histretSP.xls</code> (annual returns by asset class)</li>
    <li>FRED <code>FEDFUNDS</code>, <code>DFII10</code>, <code>PPIACO</code>, <code>A463RC1Q027SBEA</code></li>
    <li>S&P DJI <code>SP500BUYBACK</code>; OECD <code>TABLE_II1</code> (corp tax rates)</li>
    <li>Yardeni IBES forecast PDF</li>
    <li>research/05_paradigm_shifts.md §5-§7</li>
  </ul>`;
