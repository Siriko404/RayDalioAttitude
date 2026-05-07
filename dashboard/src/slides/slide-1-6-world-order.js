/* Slide 1.6 Big Cycle / World Order — Spec §4.3 + §4.5 FR-5.3.
 * Chart: 8-axis radar — US = hatch-fill polygon, CHN = dashed-outline polygon.
 * Per Set 3.5 D8: 1.6 keeps "TOP" (Dalio canonical wording).
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { radarSeries } from '../charts/series-builder.js';
import { computeWorldOrder } from '../compute/world-order.js';

const STAGE_PHRASE = {
  RISE:      'rising — building strengths broadly',
  TOP:       'at the top of its arc',
  DECLINE:   'in measured decline',
  NEW_ORDER: 'past collapse, in early reformation'
};

registerSlide({
  id: '1.6',
  title: 'Big Cycle / World Order',
  render(section, { payload }) {
    const out = payload?.computedWorldOrder ?? computeWorldOrder(buildPanel(payload));
    const cpiUSA = (out.CPI?.USA ?? 0).toFixed(2);
    const cpiCHN = (out.CPI?.CHN ?? 0).toFixed(2);
    const stageUS = STAGE_PHRASE[out.StageTag?.USA] || (out.StageTag?.USA || '').toLowerCase();
    const onePoint = `The U.S. is <em>${stageUS}</em>; China is <em>rising</em>.`;
    const caption = `Country Power Index <em>USA = ${cpiUSA}</em>, <em>CHN = ${cpiCHN}</em>; hegemony-risk band <em>${(out.HegemonyRisk ?? '').toLowerCase()}</em>.`;

    renderSlideShell(section, {
      step: '07', section: '1.6 Big Cycle / World Order',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:560px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildRadarOption(out, payload));
  }
});

function buildPanel(payload) {
  // v1 stub — wire from World Bank (Edu_tert, Pat_res, Mil_xpnd, Exp_gnfs, GDP_cur),
  // BIS (Cost_comp from EER, Fin_ctr from LBS), IMF COFER (Res_shr).
  return { panel: { USA: {}, CHN: {} }, anchors: { max: 1.9, min: -1.5 } };
}

function buildRadarOption(out, payload) {
  const measures = ['Edu', 'Innov', 'Cost', 'Mil', 'Trade', 'Output', 'Fin', 'Reserve'];
  const usaPanel = payload?.computedWorldOrder?.zScores?.USA || {};
  const chnPanel = payload?.computedWorldOrder?.zScores?.CHN || {};
  return {
    radar: {
      indicator: measures.map(m => ({ name: m, max: 3, min: -2 })),
      shape: 'polygon',
      axisName: { color: '#000', fontFamily: '"DM Mono"', fontSize: 11 }
    },
    series: [
      radarSeries({ name: 'USA', data: measures.map(m => usaPanel[m] ?? 0), fillPattern: 'HATCH-D', strokePattern: 'SOLID' }),
      radarSeries({ name: 'CHN', data: measures.map(m => chnPanel[m] ?? 0), fillPattern: 'SOLID', strokePattern: 'DASH-LONG' })
    ]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Dalio's <em>Country Power Index</em> aggregates eight measures (education,
  innovation, cost competitiveness, military, trade share, output share, financial
  centrality, reserve currency status) into a single 0-1 score. Empires rise
  through these one by one; they decline in roughly the same order.</p>
  <p>The current US-CHN diff has narrowed to where 2-3 of the 8 measures show
  Chinese parity or lead — the "hegemony-risk band" (research/06 §6) classifies
  this as <em>elevated</em>.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>WB <code>SE.TER.ENRR</code>, <code>IP.PAT.RESD</code>, <code>MS.MIL.XPND.CD</code>, <code>NE.EXP.GNFS.CD</code>, <code>NY.GDP.MKTP.CD</code></li>
    <li>BIS <code>WS_EER</code> (effective exchange rates) + <code>WS_LBS_D_PUB</code> (financial centers)</li>
    <li>IMF COFER <code>RAXGFXARUSDRT_PT</code> (USD reserve share)</li>
    <li>research/06_changing_world_order.md §5-§7</li>
    <li>Dalio, <em>Principles for Dealing With the Changing World Order</em></li>
  </ul>`;
