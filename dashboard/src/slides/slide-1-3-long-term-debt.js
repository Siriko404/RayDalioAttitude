/* Slide 1.3 Long-Term Debt Cycle — Spec §4.3 + §4.5 FR-5.3.
 * Chart: total debt / GDP line + 4 stage-shading bands w/ distinct patterns.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { lineSeries } from '../charts/series-builder.js';
import { makePatternFill } from '../charts/patterns.js';
import { computeLongDebt } from '../compute/long-debt.js';

const STAGE_PHRASE = {
  SOUND:        'sound (low debt, low debt service)',
  BUBBLE:       'in a bubble (rising debt, rising service)',
  PEAK:         'at the peak of its 70-year cycle',
  DELEVERAGING: 'deleveraging (falling debt, painful adjustment)',
  RECEDES:      'past the worst (debt receding from peaks)'
};

registerSlide({
  id: '1.3',
  title: 'Long-Term Debt Cycle',
  render(section, { payload }) {
    const out = computeLongDebt(payload);
    const onePoint = `U.S. debt is <em>${STAGE_PHRASE[out.stage] || out.stage.toLowerCase()}</em>.`;
    const caption = `Total debt / revenue at <em>${(out.I1_rev_pct ?? 0).toFixed(0)}%</em>; interest / revenue at <em>${(out.I2_rev_pct ?? 0).toFixed(0)}%</em>; <em>r − g = ${out.I3.toFixed(1)} pp</em>.`;

    renderSlideShell(section, {
      step: '03', section: '1.3 Long-Term Debt Cycle',
      onePoint, caption,
      chartHtml: subCellMarkup(0, '<div class="chart-mount" style="height:520px"></div>'),
      notesHtml: subCellMarkup(1, NOTES_HTML),
      sourcesHtml: subCellMarkup(2, SOURCES_HTML)
    });
    addSubCellAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildOption(payload, out));
  }
});

function buildOption(payload, out) {
  const fred = payload?.sources?.fred || {};
  const series = (fred.GFDEGDQ188S || []).slice(-400);  // 100yr quarterly
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'category', data: series.map(p => p.date) },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [
      // Stage-shading bands rendered via markArea with per-band patterns
      {
        ...lineSeries({ name: 'Debt / GDP', data: series.map(p => p.value * 100), strokePattern: 'SOLID' }),
        markArea: { silent: true, data: stageBands() }
      }
    ]
  };
}

function stageBands() {
  // 4 historical band ranges (illustrative): SOUND 1947-1980, BUBBLE 1980-2007,
  // PEAK 2007-2020, DELEVERAGING/RECEDES 2020+. Each gets distinct pattern.
  return [
    [{ xAxis: '1947-01-01', itemStyle: { color: makePatternFill('DOTS') } }, { xAxis: '1980-01-01' }],
    [{ xAxis: '1980-01-01', itemStyle: { color: makePatternFill('HATCH-S') } }, { xAxis: '2007-01-01' }],
    [{ xAxis: '2007-01-01', itemStyle: { color: makePatternFill('CROSSHATCH') } }, { xAxis: '2020-01-01' }],
    [{ xAxis: '2020-01-01', itemStyle: { color: makePatternFill('HATCH-D') } }, { xAxis: '2030-01-01' }]
  ];
}

function subCellMarkup(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addSubCellAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Debt cycles operate on roughly 70-year frequency — about a generation longer
  than the short-term cycle. Dalio's four pressure indicators (debt/revenue,
  interest/revenue, r minus g, debt/savings) measure how far the cycle has run.</p>
  <p>The <em>peak</em> stage (renamed from "TOP" to avoid collision with the 1.6
  empire-cycle "TOP" stage) is when debt-service costs eat through enough revenue
  to require monetary or fiscal extraordinary measures — a deleveraging looms.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>GFDEGDQ188S</code>, <code>FYGFGDQ188S</code>, <code>FYOIGDA188S</code>, <code>GS10</code>, <code>FYFSGDA188S</code>, <code>FYFRGDA188S</code></li>
    <li>BIS <code>QUSCAM770A</code> (private credit / GDP)</li>
    <li>research/03_long_term_debt_cycle.md §5-§7</li>
    <li>Dalio, <em>How Countries Go Broke</em> Ch.3</li>
  </ul>`;
