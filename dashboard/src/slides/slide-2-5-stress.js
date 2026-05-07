/* Slide 2.5 Stress Testing — Spec §4.3 + §4.5 FR-5.3.
 * Chart: 4-archetype outcome bars (Defl / Infl / Stag / Refl) each pattern-distinct.
 * Tail panel uses asymmetry_ratio status (Set 3.5 D5 lock).
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { bwInit } from '../charts/echarts-bw-theme.js';
import { barSeries } from '../charts/series-builder.js';
import { computeStress } from '../compute/stress.js';
import { applyTilts } from '../compute/all-weather.js';

const ARCH_PATTERNS = {
  deflationary: 'CROSSHATCH', inflationary: 'HATCH-D', stagflation: 'DOTS', reflation: 'HATCH-S'
};

registerSlide({
  id: '2.5',
  title: 'Stress Testing',
  render(section, { payload }) {
    const out = payload?.computedStress ?? computeStress({ weights: applyTilts({}) });
    const tail = out.dominant_tail;
    const onePoint = `The dominant tail is <em>${tail?.regime || 'inflationary'}</em>; tail asymmetry <em>${(out.asymmetry_ratio ?? 0).toFixed(1)}×</em>.`;
    const caption = `Defl <em>${out.R_port_pct.deflationary.toFixed(1)}%</em>; Infl <em>${out.R_port_pct.inflationary.toFixed(1)}%</em>; Stag <em>${out.R_port_pct.stagflation.toFixed(1)}%</em>; Refl <em>+${out.R_port_pct.reflation.toFixed(1)}%</em>. Asymmetry <em>${out.asymmetry_ratio.toFixed(2)}×</em> → <em>${out.tail_band}</em>.`;

    renderSlideShell(section, {
      step: '09', section: '2.5 Stress Testing',
      onePoint, caption,
      chartHtml: subCell(0, '<div class="chart-mount" style="height:520px"></div>'),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addAnchor(section, 3);

    const chart = bwInit(section.querySelector('.chart-mount'));
    chart.setOption(buildOption(out));
  }
});

function buildOption(out) {
  const archs = ['deflationary', 'inflationary', 'stagflation', 'reflation'];
  return {
    grid: { left: 80, right: 24, top: 24, bottom: 64 },
    xAxis: { type: 'category', data: archs.map(a => a.toUpperCase()) },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: archs.map(a => barSeries({
      name: a, data: archs.map(b => b === a ? out.R_port_pct[a] : null), fillPattern: ARCH_PATTERNS[a]
    }))
  };
}

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }
function addAnchor(section, idx) { const a = document.createElement('div'); a.dataset.cellIndex = String(idx); a.style.height = '1px'; section.appendChild(a); }

const NOTES_HTML = `
  <p>Stress testing applies four archetypal economic shock patterns
  (deflationary depression, inflationary depression, stagflation, reflation)
  to the recommended portfolio. Each archetype is calibrated against historical
  episodes: 1929-33 deflation, Weimar/1973-74 stagflation, 2009/2020 reflations.</p>
  <p>The <em>asymmetry ratio</em> measures how lopsided the tail outcomes are.
  When the ratio exceeds about 8x, the dominant tail is structural to the
  portfolio's design — Dalio's recommended canonical AW lands here, with
  inflationary depression as the dominant tail.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7">
    <li>Damodaran <code>histretSP.html</code> (annual returns reconciliation)</li>
    <li>Shiller <code>ie_data.xls</code> (CAPE)</li>
    <li>Maddison Project 2020 (long-run GDP)</li>
    <li>research/12_stress_testing.md §5-§7 — shock matrix verbatim Table 7.1</li>
    <li>Set 3.5 D5 lock: asymmetry bands 5×/10× (raised from 8×)</li>
  </ul>`;
