/* Slide render orchestrator — iterates registry, calls render(slide-section, state).
 */
import { getSlides, getPayload, getWizard } from './state.js';

export function renderAll(container) {
  const slides = getSlides();
  container.innerHTML = '';
  slides.forEach((slide, idx) => {
    const section = document.createElement('section');
    section.className = 'slide';
    section.dataset.slideId = slide.id;
    section.dataset.theme = idx % 2 === 0 ? 'light' : 'dark';
    container.appendChild(section);
    try {
      slide.render(section, { payload: getPayload(), wizard: getWizard(), index: idx });
    } catch (err) {
      console.error(`[render] slide ${slide.id} failed`, err);
      section.innerHTML = `<div class="slide-inner"><p class="caption">Slide ${slide.id} failed to render.</p></div>`;
    }
  });
}
