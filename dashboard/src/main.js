import './styles/design-system.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/reveal.css';
import './styles/slide-shell.css';

import { fetchAll } from './core/fetch.js';
import { setPayload } from './core/state.js';
import { renderAll } from './core/render.js';
import { startLoadingLoop, stopLoadingLoop } from './animations/loading-loop.js';

async function bootstrap() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <header class="chip-strip" id="chip-strip">
      <span class="eyebrow" id="loading-text">LOADING</span>
    </header>
    <main id="slides"></main>
    <nav class="nav-bar" id="nav-bar"></nav>
  `;

  const loader = document.getElementById('loading-text');
  startLoadingLoop(loader);

  try {
    const data = await fetchAll();
    setPayload(data);
    stopLoadingLoop(loader);
    loader.textContent = `DATA · ${formatTs(data.fetched_at_utc)}`;
    renderAll(document.getElementById('slides'));
  } catch (err) {
    stopLoadingLoop(loader);
    loader.textContent = `ERROR · ${err.message}`;
  }
}

function formatTs(iso) {
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  } catch { return iso; }
}

document.addEventListener('DOMContentLoaded', bootstrap);
