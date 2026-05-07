/* Slide 1.4 Deleveragings — Spec §4.3 + §4.5 FR-5.3.
 * Conditional: gate fires when R^{D/M} > 17 instantaneous OR
 * (debt_money_regime=HIGH AND gap_regime=BELOW_TREND) sustained ≥2Q.
 * Gate OFF → "Not Triggered ✓" card per Spec §4.3 FR-3.5.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { barSeries } from '../charts/series-builder.js';
import { computeDeleveragings, isGateOpen } from '../compute/deleveragings.js';
import { computeEconMachine } from '../compute/econ-machine.js';

registerSlide({
  id: '1.4',
  title: 'Deleveragings',
  render(section, { payload }) {
    const econ = payload?.computedRegimes ?? computeEconMachine(payload);
    // History for hysteresis would come from a derived rolling window in a future
    // version; v1 treats current-quarter snapshot as the sole input.
    const gateOpen = isGateOpen({ R_dm: econ.R_dm_narrow ?? 0, history: payload?.regimeHistory ?? [] });

    if (!gateOpen) {
      renderSlideShell(section, {
        step: '04', section: '1.4 Deleveragings',
        onePoint: 'Conditional step — <em>not triggered</em> in this regime.',
        caption: `R<sup>D/M</sup> at <em>${(econ.R_dm_narrow ?? 0).toFixed(1)}</em> below the 17 threshold; debt/money regime <em>${econ.debt_money_regime ?? 'unknown'}</em>.`,
        chartHtml: subCell(0, gateOffCard(econ)),
        notesHtml: subCell(1, NOTES_HTML),
        sourcesHtml: subCell(2, SOURCES_HTML)
      });
      addAnchor(section, 3);
      return;
    }

    // Gate OPEN — render lever-mix chart
    const out = computeDeleveragings(buildDeleveragingsInput(payload, econ), true);
    const onePoint = phraseRegime(out);
    const caption = `Growth − rate gap <em>G = ${out.G.toFixed(1)} pp</em>; print rate <em>π = ${(out.pi * 100).toFixed(1)}%</em>; lever mix print/austerity/default/redist.`;

    renderSlideShell(section, {
      step: '04', section: '1.4 Deleveragings',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:480px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildLeverMixOption(out));
  }
});

function gateOffCard(econ) {
  return `
    <div class="gate-off-card" style="border:1px solid var(--ink);padding:32px;text-align:center;font-family:var(--font-serif);font-style:italic">
      <div class="eyebrow" style="margin:0 auto 16px">Conditional · Not Triggered ✓</div>
      <p style="font-size:18px;margin:0 0 12px">The deleveragings playbook only activates when debt has run far enough and demand has fallen far enough that the standard short-term cycle no longer applies.</p>
      <p style="font-size:13px;color:var(--fg-soft);margin:0">Current state: R<sup>D/M</sup> = ${(econ.R_dm_narrow ?? 0).toFixed(1)} (threshold 17.0); regime ${econ.debt_money_regime ?? 'unknown'}.</p>
    </div>`;
}

function phraseRegime(out) {
  switch (out.regime) {
    case 'UGLY_DEFLATIONARY':  return 'A <em>deflationary deleveraging</em> is in progress — debt rising while income falls.';
    case 'BEAUTIFUL':          return 'A <em>beautiful deleveraging</em> is in progress — debt receding while growth holds.';
    case 'UGLY_INFLATIONARY':  return 'An <em>inflationary deleveraging</em> is in progress — currency debasing as debt erodes in real terms.';
    default:                   return 'The deleveraging is in <em>transition</em> between phases.';
  }
}

function buildDeleveragingsInput(payload, econ) {
  // Compose research/04 inputs from FRED. v1: derive what we can from FRED + econ;
  // remaining fields default to 0 in the compute module (regime classifier degrades
  // gracefully to TRANSITIONAL when input data are sparse).
  const fred = payload?.sources?.fred || {};
  const lastValue = (s) => Array.isArray(s) && s.length ? Number(s[s.length - 1]?.value ?? 0) : 0;
  const valueAtOffset = (s, off) => {
    if (!Array.isArray(s) || s.length === 0) return 0;
    const i = s.length - 1 - off;
    return i < 0 ? 0 : Number(s[i]?.value ?? 0);
  };
  // NGDP_yoy from GDP series
  const gdpNow = lastValue(fred.GDP);
  const gdpPrev = valueAtOffset(fred.GDP, 4);
  const NGDP_yoy = (gdpNow && gdpPrev) ? ((gdpNow / gdpPrev) - 1) * 100 : 0;
  return {
    NGDP_yoy,
    LT_Rate: lastValue(fred.GS10),
    DebtGDP_now: lastValue(fred.GFDEGDQ188S),
    DebtGDP_4Qago: valueAtOffset(fred.GFDEGDQ188S, 4),
    M0_GDP_now: 0, M0_GDP_4Qago: 0,    // BOGMBASE/GDP — derive in v1.1
    CB_Assets_now: 0, CB_Assets_4Qago: 0,
    CPI_yoy: 0, FX_Gold_yoy: 0
  };
}

function buildLeverMixOption(out) {
  const mix = out.lever_mix || { print: 0, austerity: 0, default_: 0, redistribution: 0 };
  return {
    grid: { left: 120, right: 24, top: 24, bottom: 48 },
    xAxis: { type: 'value', axisLabel: { formatter: v => `${(v * 100).toFixed(0)}%` } },
    yAxis: { type: 'category', data: ['Print', 'Austerity', 'Default', 'Redistribution'] },
    series: [{
      ...barSeries({ name: 'Lever share', data: [mix.print, mix.austerity, mix.default_, mix.redistribution], fillPattern: 'HATCH-D' }),
      itemStyle: { borderColor: '#000', borderWidth: 1 }
    }]
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Deleveragings only happen when debt-service costs grow faster than the
  income to service them. They split into three flavors based on policy choices:
  deflationary (austerity-heavy, painful, prolonged), beautiful (balanced
  print/cut/redistribute, growth holds), and inflationary (print-heavy,
  currency debases).</p>
  <p>The <em>beautiful</em> outcome is rare and requires the four levers
  (austerity / default / print / redistribute) to be applied in roughly correct
  proportions. Most actual deleveragings are ugly in one direction or the other.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>FRED <code>QUSCAM770A</code>, <code>BOGMBASE</code>, <code>WALCL</code>, <code>QBPLNTLNNTCGOFFR</code></li>
    <li>WID <code>gdiinc992j</code> (net Gini)</li>
    <li>research/04_deleveragings.md §5-§7</li>
    <li>Dalio, <em>Principles for Navigating Big Debt Crises</em></li>
  </ul>`;
