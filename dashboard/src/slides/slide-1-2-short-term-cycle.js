/* Slide 1.2 Short-Term Cycle — Spec §4.3 + §4.5 FR-5.3.
 * Chart: half-circle phase dial with 4 hatched zones (EARLY, MID, LATE, RECESSION) + pointer.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { computeShortCycle } from '../compute/short-cycle.js';

const PHASE_ANGLE = {
  EARLY: 22.5, MID: 67.5, LATE: 112.5, TIGHTENING: 135,
  RECESSION_EARLY: 157.5, RECESSION_LATE: 180, TRANSITIONAL: 90
};

registerSlide({
  id: '1.2',
  title: 'Short-Term Cycle',
  render(section, { payload }) {
    const out = computeShortCycle(payload);
    const recPct = (out.recession_prob_12m * 100).toFixed(0);
    const onePoint = `The U.S. business cycle is in the <em>${out.cycle_phase.toLowerCase()}</em> phase.`;
    const caption = `Real GDP at <em>${out.g.toFixed(1)}%</em> qoq SAAR; recession probability <em>${recPct}%</em> over 12m; yield curve <em>${out.yc_signal.toLowerCase()}</em>.`;

    renderSlideShell(section, {
      step: '02', section: '1.2 Short-Term Cycle',
      onePoint, caption,
      chartHtml: subCellMarkup(0, '<div class="chart-mount" style="height:480px;width:100%"></div>'),
      notesHtml: subCellMarkup(1, NOTES_HTML),
      sourcesHtml: subCellMarkup(2, SOURCES_HTML)
    });
    addSubCellAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildPhaseDial(out));
  }
});

function buildPhaseDial(out) {
  const angle = PHASE_ANGLE[out.cycle_phase] ?? 90;
  return {
    series: [{
      type: 'gauge', startAngle: 180, endAngle: 0, min: 0, max: 180, radius: '80%',
      axisLine: {
        lineStyle: { width: 30, color: [
          [0.25, '#000'], [0.50, '#000'], [0.75, '#000'], [1, '#000']
        ] }
      },
      pointer: { length: '70%', width: 4, itemStyle: { color: '#000' } },
      detail: { formatter: out.cycle_phase, fontSize: 18, fontFamily: '"DM Mono"', offsetCenter: [0, '60%'] },
      data: [{ value: angle }]
    }]
  };
}

function subCellMarkup(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addSubCellAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>The short-term cycle wobbles around the productivity trend on a roughly
  5-10 year frequency, driven by the central bank's setting of credit conditions
  (the Fed funds rate) and the resulting expansion or contraction of credit.</p>
  <p>Dalio's <em>Phase Boolean Flags</em> (research/02 §5.1) check growth rate,
  inflation direction, capacity utilization, and months since trough to tag
  the current phase. The Sahm Rule and the NY Fed yield-curve probit add
  recession-probability anchors.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>A191RL1Q225SBEA</code>, <code>UNRATE</code>, <code>TCU</code>, <code>FEDFUNDS</code>, <code>T10Y3M</code>, <code>SAHMREALTIME</code></li>
    <li>NY Fed recession-probability XLS</li>
    <li>research/02_short_term_debt_cycle.md §5.1 L47-68</li>
    <li>Dalio, <em>Principles for Navigating Big Debt Crises</em></li>
  </ul>`;
