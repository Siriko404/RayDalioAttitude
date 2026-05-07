/* Global state store — single source of truth for slide registry +
 * fetched payload + user wizard inputs.
 */
const _slides = [];
let _payload = null;
let _wizard = {};

export function registerSlide(slide) {
  if (!slide.id || !slide.render) throw new Error('slide missing id or render');
  _slides.push(slide);
}
export function getSlides() { return _slides.slice(); }
export function clearSlides() { _slides.length = 0; }
export function setPayload(p) { _payload = p; }
export function getPayload() { return _payload; }
export function setWizard(w) { _wizard = { ..._wizard, ...w }; }
export function getWizard() { return _wizard; }
