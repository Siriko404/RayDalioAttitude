import './styles/design-system.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/reveal.css';
import './styles/slide-shell.css';
import './styles/wizard.css';

import './nav/nav-bar.css';
import './chips/chip-strip.css';

import { fetchAll } from './core/fetch.js';
import { setPayload, setWizard } from './core/state.js';
import { renderAll } from './core/render.js';
import { startLoadingLoop, stopLoadingLoop } from './animations/loading-loop.js';
import { renderWelcome } from './wizard/welcome.js';
import { renderTier1 } from './wizard/tier-1.js';
import { renderTier23 } from './wizard/tier-2-3.js';
import { saveWizard, loadWizard } from './wizard/persistence.js';
import { renderChipStrip } from './chips/chip-strip.js';
import { renderNavBar } from './nav/nav-bar.js';
import { bindProximity } from './nav/proximity.js';
import { bindScrollspy } from './nav/scrollspy.js';
import { bindClickScroll } from './nav/click-scroll.js';

const NAV_GROUPS = [
  { id: '1.1', label: 'Economic Machine', cells: 4, kind: 'live' },
  { id: '1.2', label: 'Short Cycle',      cells: 4, kind: 'live' },
  { id: '1.3', label: 'Long Debt',        cells: 4, kind: 'live' },
  { id: '1.4', label: 'Deleveragings',    cells: 4, kind: 'live' },
  { id: '1.7', label: 'Inflation',        cells: 4, kind: 'live' },
  { id: '1.5', label: 'Paradigms',        cells: 3, kind: 'live' },
  { id: '1.6', label: 'World Order',      cells: 4, kind: 'live' },
  { id: '2.2', label: 'All-Weather',      cells: 4, kind: 'live' },
  { id: '2.5', label: 'Stress',           cells: 4, kind: 'live' },
  { id: '2.4', label: 'Risk Parity',      cells: 4, kind: 'live' },
  { id: '2.1', label: 'Holy Grail',       cells: 3, kind: 'edu' },
  { id: '2.3', label: 'Alpha',            cells: 3, kind: 'edu' }
];

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
  const header = document.getElementById('chip-strip');
  renderChipStrip(header);
  const loader = document.createElement('span');
  loader.id = 'loading-text';
  loader.className = 'eyebrow';
  loader.textContent = 'LOADING';
  header.appendChild(loader);
  startLoadingLoop(loader);

  try {
    const data = await fetchAll();
    setPayload(data);
    stopLoadingLoop(loader);
    loader.textContent = `DATA · ${formatTs(data.fetched_at_utc)}`;
    renderAll(document.getElementById('slides'));

    const navBar = document.getElementById('nav-bar');
    renderNavBar(navBar, NAV_GROUPS);
    bindProximity(navBar);
    bindScrollspy(navBar, document.getElementById('slides'));
    bindClickScroll(navBar);
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
