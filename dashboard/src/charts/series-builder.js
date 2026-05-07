/* Pattern-aware series builder — wraps ECharts series config with
 * pattern-based differentiation per Spec §4.5 FR-5.2.
 */
import { makePatternFill, makeStrokePattern } from './patterns.js';

export function lineSeries({ name, data, strokePattern = 'SOLID', width = 1.2 }) {
  return {
    name,
    type: 'line',
    data,
    smooth: false,
    symbol: 'none',
    lineStyle: {
      color: '#000',
      width,
      type: makeStrokePattern(strokePattern)
    },
    itemStyle: { color: '#000' }
  };
}

export function barSeries({ name, data, fillPattern = 'SOLID', stack }) {
  return {
    name,
    type: 'bar',
    data,
    stack,
    itemStyle: {
      color: makePatternFill(fillPattern),
      borderColor: '#000',
      borderWidth: 1
    }
  };
}

export function radarSeries({ name, data, fillPattern = 'HATCH-D', strokePattern = 'SOLID' }) {
  return {
    name,
    type: 'radar',
    data: [{ value: data, name }],
    areaStyle: {
      color: makePatternFill(fillPattern)
    },
    lineStyle: {
      color: '#000',
      width: 1.2,
      type: makeStrokePattern(strokePattern)
    },
    symbolSize: 4,
    itemStyle: { color: '#000' }
  };
}
