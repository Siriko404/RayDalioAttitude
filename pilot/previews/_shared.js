// =============================================================================
// Shared JS for all 4 preview pages.
// - Initializes ECharts charts with byte-exact research/04 + research/12 values
// - Auto-runs halo refresh every 5 min (sped to 30s in preview for visibility)
// - Resolves emerald accent from CSS var --accent
// =============================================================================

(function () {
  'use strict';

  // Read the page's emerald accent from CSS so each page's charts auto-match
  const ROOT = getComputedStyle(document.documentElement);
  const ACCENT = ROOT.getPropertyValue('--accent').trim() || '#10B981';
  const ACCENT_LOW = ROOT.getPropertyValue('--accent-low').trim() || '#1a3d2c';
  const ACCENT_GLOW = ROOT.getPropertyValue('--accent-glow').trim() || ACCENT;
  const TEXT_1 = ROOT.getPropertyValue('--text-1').trim() || '#e8e6df';
  const TEXT_2 = ROOT.getPropertyValue('--text-2').trim() || '#8a8a82';
  const TEXT_3 = ROOT.getPropertyValue('--text-3').trim() || '#5a5a52';
  const BG_PANEL = ROOT.getPropertyValue('--bg-panel').trim() || '#0e0e0e';
  const BORDER = ROOT.getPropertyValue('--border').trim() || '#1a1a1a';
  const BAD = ROOT.getPropertyValue('--bad').trim() || '#8b2e2e';
  const WARN = ROOT.getPropertyValue('--warn').trim() || '#a87a3d';

  // ---- Chart 1: research/04 four-lever decomposition (3 cases) ---------------
  const opt04 = {
    backgroundColor: 'transparent',
    textStyle: { color: TEXT_1, fontFamily: 'inherit' },
    legend: {
      textStyle: { color: TEXT_2, fontFamily: 'DM Mono, monospace', fontSize: 10 },
      top: 0,
      itemWidth: 14, itemHeight: 8,
      data: ['austerity', 'defaults', 'printing', 'redistribution'],
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0a0a0a',
      borderColor: BORDER,
      textStyle: { color: TEXT_1 },
    },
    grid: { left: 60, right: 30, top: 36, bottom: 28 },
    xAxis: {
      type: 'category',
      data: ['US 1930–32', 'US 1933–37', 'Japan 1990+'],
      axisLine: { lineStyle: { color: BORDER } },
      axisLabel: { color: TEXT_2, fontFamily: 'DM Mono, monospace', fontSize: 10 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value', max: 100,
      axisLine: { lineStyle: { color: BORDER } },
      axisLabel: { color: TEXT_3, fontFamily: 'DM Mono, monospace', fontSize: 9, formatter: '{value}%' },
      splitLine: { lineStyle: { color: BORDER } },
    },
    series: [
      { name: 'austerity',      type: 'bar', stack: 'levers', data: [35, 15, 30], itemStyle: { color: TEXT_3 } },
      { name: 'defaults',       type: 'bar', stack: 'levers', data: [55, 40, 55], itemStyle: { color: BAD } },
      { name: 'printing',       type: 'bar', stack: 'levers', data: [10, 40, 10], itemStyle: { color: ACCENT } },
      { name: 'redistribution', type: 'bar', stack: 'levers', data: [ 0,  5,  5], itemStyle: { color: WARN } },
    ],
  };

  // ---- Chart 2: research/12 archetype portfolio impact -----------------------
  const opt12 = {
    backgroundColor: 'transparent',
    textStyle: { color: TEXT_1, fontFamily: 'inherit' },
    grid: { left: 170, right: 70, top: 16, bottom: 36 },
    xAxis: {
      type: 'value', min: -30, max: 15,
      axisLine: { lineStyle: { color: BORDER } },
      axisLabel: { color: TEXT_3, fontFamily: 'DM Mono, monospace', fontSize: 9, formatter: '{value}%' },
      splitLine: { lineStyle: { color: BORDER } },
    },
    yAxis: {
      type: 'category',
      data: ['Deflationary', 'Inflationary', 'Stagflation', 'Reflation'],
      axisLine: { lineStyle: { color: BORDER } },
      axisLabel: { color: TEXT_1, fontFamily: 'inherit', fontSize: 12 },
      axisTick: { show: false },
    },
    series: [{
      type: 'bar',
      data: [-8.13, -26.00, -3.05, 11.83],
      itemStyle: {
        color: function (p) {
          if (p.value >= 0) return ACCENT;
          if (p.value > -10) return ACCENT_LOW;
          if (p.value > -20) return WARN;
          return BAD;
        },
      },
      label: {
        show: true, color: TEXT_1, position: 'right',
        fontFamily: 'DM Mono, monospace', fontSize: 11,
        formatter: function (p) { return p.value.toFixed(2) + '%'; },
      },
      barWidth: 22,
      markLine: {
        symbol: 'none',
        lineStyle: { color: BAD, type: 'dashed', width: 1 },
        data: [{ xAxis: -20, label: { show: false } }],
      },
    }],
    tooltip: {
      backgroundColor: '#0a0a0a', borderColor: BORDER,
      textStyle: { color: TEXT_1 },
      valueFormatter: function (v) { return v.toFixed(2) + '%'; },
    },
  };

  // ---- Init both charts -----------------------------------------------------
  const charts = {};
  function initAll() {
    const e1 = document.getElementById('chart-1-4');
    const e2 = document.getElementById('chart-2-5');
    if (e1) { charts.c1 = echarts.init(e1, null, { renderer: 'canvas' }); charts.c1.setOption(opt04); }
    if (e2) { charts.c2 = echarts.init(e2, null, { renderer: 'canvas' }); charts.c2.setOption(opt12); }
  }
  window.addEventListener('DOMContentLoaded', initAll);
  window.addEventListener('resize', function () {
    Object.values(charts).forEach(function (c) { if (c) c.resize(); });
  });

  // ---- Halo refresh demo: pulse every 30s in preview (5min in prod) ----------
  function tickHalo() {
    document.querySelectorAll('.chart-card').forEach(function (el) {
      el.classList.remove('halo');
      // force reflow so animation restarts
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight;
      el.classList.add('halo');
    });
    // Update "refreshed X ago" pills to "0:00" then count up
    document.querySelectorAll('.refresh-pill').forEach(function (el) {
      el.dataset.ts = Date.now();
    });
  }
  // Update timer pills every second
  function updatePills() {
    const now = Date.now();
    document.querySelectorAll('.refresh-pill').forEach(function (el) {
      const ts = parseInt(el.dataset.ts || now, 10);
      const sec = Math.floor((now - ts) / 1000);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      const txt = (m > 0 ? m + 'm ' : '') + s + 's ago';
      // preserve inline icon — span structure
      const labelEl = el.querySelector('.label') || el;
      labelEl.textContent = 'live · refreshed ' + txt;
    });
  }
  setInterval(updatePills, 1000);
  setInterval(tickHalo, 30000); // 30s in preview
  // Initial pulse so user sees it within first 30s
  setTimeout(tickHalo, 5000);
  // Initialize timestamps
  setTimeout(function () {
    document.querySelectorAll('.refresh-pill').forEach(function (el) {
      el.dataset.ts = Date.now();
    });
    updatePills();
  }, 100);

  // ---- Mini-map active section tracking -------------------------------------
  function updateActive() {
    const sections = document.querySelectorAll('section[id^="sec-"]');
    let active = null;
    const fromTop = window.scrollY + 150;
    sections.forEach(function (s) {
      if (s.offsetTop <= fromTop) active = s.id;
    });
    document.querySelectorAll('.minimap a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + active);
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('DOMContentLoaded', updateActive);

  // ---- KaTeX auto-render on load --------------------------------------------
  window.addEventListener('DOMContentLoaded', function () {
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
        ],
        throwOnError: false,
      });
    }
  });

})();
