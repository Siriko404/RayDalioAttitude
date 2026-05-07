/* Slide 1.1 Economic Machine — Spec §4.3 FR-3 + §4.5 FR-5.3.
 * Chart: two-line (productivity solid + cycle dashed) over 50yr.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { lineSeries } from '../charts/series-builder.js';
import { computeEconMachine } from '../compute/econ-machine.js';

registerSlide({
  id: '1.1',
  title: 'Economic Machine',
  render(section, { payload }) {
    const out = computeEconMachine(payload);
    const onePoint = phraseGapRegime(out);
    const caption = `Productivity trend at <em>${out.trend_growth_pct.toFixed(1)}%</em> p.a.; output gap at <em>${out.gap_pct.toFixed(1)}%</em>; <em>R<sup>D/M</sup> ≈ ${out.R_dm_narrow.toFixed(1)}</em> (narrow-money basis).`;

    renderSlideShell(section, {
      step: '01',
      section: '1.1 Economic Machine',
      onePoint, caption,
      chartHtml: subCellMarkup(0, '<div class="chart-mount" style="height:520px;width:100%"></div>'),
      notesHtml: subCellMarkup(1, NOTES_HTML),
      sourcesHtml: subCellMarkup(2, SOURCES_HTML)
    });
    addSubCellAnchor(section, 3);  // synthesis cell anchor for nav

    const mount = section.querySelector('.chart-mount');
    const chart = bwInit(mount);
    chart.setOption(buildChartOption(payload, out));
  }
});

function phraseGapRegime(out) {
  switch (out.gap_regime) {
    case 'ABOVE_TREND': return 'The economy is running <em>above its long-run trend</em>.';
    case 'BELOW_TREND': return 'The economy is running <em>below its long-run trend</em>.';
    default:            return 'The economy is sitting <em>on its long-run trend</em>.';
  }
}

function buildChartOption(payload, out) {
  const fred = payload?.sources?.fred || {};
  const ophSeries = (fred.OPHNFB || []).slice(-200);  // 50yr quarterly
  const realPcSeries = (fred.A939RX0Q048SBEA || []).slice(-200);
  return {
    grid: { left: 60, right: 32, top: 32, bottom: 48 },
    xAxis: { type: 'category', data: ophSeries.map(p => p.date) },
    yAxis: { type: 'value', name: '' },
    series: [
      lineSeries({ name: 'Productivity', data: ophSeries.map(p => p.value), strokePattern: 'SOLID' }),
      lineSeries({ name: 'Real GDP/cap (cycle)', data: realPcSeries.map(p => p.value), strokePattern: 'DASH-LONG' })
    ]
  };
}

function subCellMarkup(idx, inner) {
  return `<div data-cell-index="${idx}">${inner}</div>`;
}
function addSubCellAnchor(section, idx) {
  const a = document.createElement('div');
  a.dataset.cellIndex = String(idx);
  a.style.height = '1px';
  section.appendChild(a);
}

const NOTES_HTML = `
  <p>Dalio's <em>Economic Machine</em> reduces a complex economy to a single identity:
  <code>Total $ = Money + Credit</code>. Money is what governments and central banks
  print or destroy directly; credit is the much larger economy of mutual promises
  between actors. Productivity rises slowly through better tools and methods. The
  short-term cycle wobbles around it as credit expands and contracts.</p>
  <p>The output gap measures how far the real economy sits above or below that
  productivity trend. The credit/money ratio measures how much of "money in
  circulation" is actually IOUs that depend on continued faith.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7;letter-spacing:1px">
    <li>FRED <code>GDP</code>, <code>GDPC1</code>, <code>GDPDEF</code></li>
    <li>FRED <code>A939RX0Q048SBEA</code> (Real GDP per capita)</li>
    <li>FRED <code>M2SL</code>, <code>TCMDO</code>, <code>OPHNFB</code></li>
    <li>research/01_economic_machine.md §4 L29-41</li>
    <li>Dalio, <em>How the Economic Machine Works</em> (2008)</li>
  </ul>`;
