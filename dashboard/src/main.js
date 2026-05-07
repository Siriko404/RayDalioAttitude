import './styles/design-system.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/reveal.css';
import './styles/slide-shell.css';
import './styles/wizard.css';

import { fetchAll } from './core/fetch.js';
import { setPayload, setWizard } from './core/state.js';
import { renderAll } from './core/render.js';
import { startLoadingLoop, stopLoadingLoop } from './animations/loading-loop.js';
import { renderWelcome } from './wizard/welcome.js';
import { renderTier1 } from './wizard/tier-1.js';
import { renderTier23 } from './wizard/tier-2-3.js';
import { saveWizard, loadWizard } from './wizard/persistence.js';

async function bootstrap() {
  const app = document.getElementById('app');
  const saved = loadWizard();
  if (saved) {
    setWizard(saved);
    return runDashboard();  // skip wizard if already set
  }
  app.innerHTML = '<div id="wiz"></div>';
  const wiz = document.getElementById('wiz');
  renderWelcome(wiz, {
    onBegin: () => renderTier1(wiz, {
      onSubmit: (t1) => {
        setWizard(t1);
        renderTier23(wiz, {
          onSubmit: (t23) => { setWizard(t23); saveWizard({ ...t1, ...t23 }); runDashboard(); },
          onSkip:   ()    => { saveWizard(t1); runDashboard(); }
        });
      }
    })
  });
}

async function runDashboard() {
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
