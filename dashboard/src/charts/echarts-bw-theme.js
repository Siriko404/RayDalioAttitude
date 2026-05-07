/* ECharts BW theme — Spec §0 #1 + §4.5 FR-5.1.
 * Differentiation via patterns (see ./patterns.js), NOT color.
 */
import * as echarts from 'echarts';

export const THEME_NAME = 'dalio-bw';

export const bwTheme = {
  color: ['#000', '#000', '#000', '#000', '#000', '#000', '#000'],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: '"Source Serif 4", Georgia, serif',
    fontWeight: 300,
    color: '#000'
  },
  title: {
    textStyle: {
      fontFamily: '"DM Mono", monospace',
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: 4,
      color: '#000',
      textTransform: 'uppercase'
    }
  },
  line: {
    itemStyle: { borderWidth: 1.2, color: '#000' },
    lineStyle: { width: 1.2, color: '#000' },
    symbolSize: 0,
    symbol: 'none',
    smooth: false
  },
  categoryAxis: {
    axisLine: { show: true, lineStyle: { color: '#000', width: 1 } },
    axisTick: { show: false },
    axisLabel: { color: '#000', fontSize: 11, fontFamily: '"DM Mono", monospace' },
    splitLine: { show: false }
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#000', fontSize: 11, fontFamily: '"DM Mono", monospace' },
    splitLine: { show: true, lineStyle: { color: '#000', opacity: 0.08, type: [1, 2] } }
  },
  legend: {
    textStyle: { fontFamily: '"DM Mono", monospace', fontSize: 11, color: '#000' },
    icon: 'rect'
  },
  tooltip: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    textStyle: { color: '#000', fontFamily: '"Source Serif 4", serif', fontStyle: 'italic' }
  }
};

let registered = false;
export function ensureBwThemeRegistered() {
  if (registered) return;
  echarts.registerTheme(THEME_NAME, bwTheme);
  registered = true;
}

export function bwInit(el) {
  ensureBwThemeRegistered();
  return echarts.init(el, THEME_NAME, { renderer: 'svg' });
}
