/* SVG patterns — Spec §4.5 FR-5.2.
 * ECharts accepts pattern brush via {image, repeat}. We render an
 * <svg> data URL for each pattern.
 */

function svgDataUrl(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function makeImage(svgString) {
  // happy-dom doesn't have HTMLImageElement constructor reliably; we return
  // a duck-typed shim that ECharts accepts in canvas/svg renderer.
  if (typeof Image === 'undefined') {
    return { src: svgDataUrl(svgString), width: 12, height: 12 };
  }
  const img = new Image();
  img.src = svgDataUrl(svgString);
  img.width = 12;
  img.height = 12;
  return img;
}

const TILE = 12;

export const FILL_PATTERNS = {
  'SOLID': () => null,  // ECharts default fill
  'HATCH-D': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <line x1="0" y1="${TILE}" x2="${TILE}" y2="0" stroke="#000" stroke-width="1.5"/>
    <line x1="-${TILE/2}" y1="${TILE/2}" x2="${TILE/2}" y2="-${TILE/2}" stroke="#000" stroke-width="1.5"/>
    <line x1="${TILE/2}" y1="${TILE*1.5}" x2="${TILE*1.5}" y2="${TILE/2}" stroke="#000" stroke-width="1.5"/>
  </svg>`),
  'HATCH-S': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE*2}" height="${TILE*2}">
    <line x1="0" y1="${TILE*2}" x2="${TILE*2}" y2="0" stroke="#000" stroke-width="1"/>
  </svg>`),
  'HATCH-R': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <line x1="0" y1="0" x2="${TILE}" y2="${TILE}" stroke="#000" stroke-width="1.5"/>
  </svg>`),
  'CROSSHATCH': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <line x1="0" y1="${TILE}" x2="${TILE}" y2="0" stroke="#000" stroke-width="1"/>
    <line x1="0" y1="0" x2="${TILE}" y2="${TILE}" stroke="#000" stroke-width="1"/>
  </svg>`),
  'DOTS': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <circle cx="${TILE/2}" cy="${TILE/2}" r="1.4" fill="#000"/>
  </svg>`),
  'VERT': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <line x1="${TILE/2}" y1="0" x2="${TILE/2}" y2="${TILE}" stroke="#000" stroke-width="1"/>
  </svg>`),
  'HORIZ': () => makeImage(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}">
    <line x1="0" y1="${TILE/2}" x2="${TILE}" y2="${TILE/2}" stroke="#000" stroke-width="1"/>
  </svg>`)
};

export const STROKE_PATTERNS = {
  'SOLID': 'solid',
  'DASH-LONG': [6, 3],
  'DASH-SHORT': [3, 2],
  'DOTTED': [1, 2],
  'DASH-DOT': [5, 2, 1, 2]
};

export function makePatternFill(name) {
  const factory = FILL_PATTERNS[name];
  if (!factory) throw new Error(`Unknown fill pattern: ${name}`);
  const image = factory();
  if (!image) return { color: '#000' };  // SOLID
  return {
    image,
    repeat: 'repeat'
  };
}

export function makeStrokePattern(name) {
  const p = STROKE_PATTERNS[name];
  if (!p) throw new Error(`Unknown stroke pattern: ${name}`);
  return p;
}
