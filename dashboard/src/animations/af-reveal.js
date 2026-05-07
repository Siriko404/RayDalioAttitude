/* AF reveal — port from pilot/dalio_dashboard.html:1789-1886 (slideshow).
 * Real GSAP, instant block flashes via gsap.set, true random delays.
 * Per spec §4.9 FR-9.1: do NOT replace with CSS scaleY — loses cyberpunk feel.
 */
import { gsap } from 'gsap';

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function airForceReveal(el, opts = {}) {
  const minDelay = opts.minDelay ?? 0.25;
  const maxDelay = opts.maxDelay ?? 0.42;
  const holdDuration = opts.holdDuration ?? 0.09;

  const parentColor = getComputedStyle(el).color;

  const raw = el.dataset.text || el.innerHTML;
  el.dataset.text = raw;

  // Parse raw HTML directly into a div — preserves nested elements (em, br, etc).
  // The slideshow used a textarea round-trip for entity decoding, but textarea's
  // text-only content model stripped element wrappers. Setting innerHTML on a
  // div parses HTML correctly AND decodes entities in text nodes.
  const temp = document.createElement('div');
  temp.innerHTML = raw;

  let html = '';
  function processNode(node, italic) {
    if (node.nodeType === 3) {
      const text = node.nodeValue;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === ' ') {
          html += '&nbsp;';
        } else {
          const styleAttr = ` style="color:transparent${italic ? ';font-style:italic' : ''}"`;
          html += `<span class="reveal-ch"${styleAttr}>${escapeHtml(c)}</span>`;
        }
      }
    } else if (node.nodeType === 1) {
      const tag = node.tagName.toLowerCase();
      if (tag === 'br') { html += '<br>'; return; }
      const isEm = tag === 'em' || tag === 'i';
      const newItalic = italic || isEm;
      let openTag = '<' + tag;
      if (node.className) openTag += ` class="${node.className}"`;
      openTag += '>';
      html += openTag;
      Array.from(node.childNodes).forEach(n => processNode(n, newItalic));
      html += '</' + tag + '>';
    }
  }
  Array.from(temp.childNodes).forEach(n => processNode(n, false));
  el.innerHTML = html;

  const spans = el.querySelectorAll('.reveal-ch');
  const tl = gsap.timeline();
  spans.forEach(span => {
    const local = gsap.timeline();
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    local.set(span, { background: parentColor }, delay);
    local.set(span, { background: 'transparent', clearProps: 'color,background' }, delay + holdDuration);
    tl.add(local, 0);
  });
  return tl;
}

export function airForceRevealOut(el, opts = {}) {
  const minDelay = opts.minDelay ?? 0.0;
  const maxDelay = opts.maxDelay ?? 0.14;
  const holdDuration = opts.holdDuration ?? 0.07;

  const spans = el.querySelectorAll('.reveal-ch');
  if (!spans.length) return null;

  const parentColor = getComputedStyle(el).color;
  const tl = gsap.timeline();
  spans.forEach(span => {
    const local = gsap.timeline();
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    local.set(span, { background: parentColor, color: 'transparent' }, delay);
    local.set(span, { background: 'transparent' }, delay + holdDuration);
    tl.add(local, 0);
  });
  return tl;
}
