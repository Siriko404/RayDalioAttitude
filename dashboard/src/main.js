import './styles/design-system.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/reveal.css';
import './styles/slide-shell.css';
import './styles/wizard.css';

import './nav/nav-bar.css';
import './chips/chip-strip.css';
import './styles/mobile-splash.css';

import { isMobileBlocked, renderMobileSplash } from './ui/mobile-splash.js';

// Slide modules — imports register them via side-effect (registerSlide in module body)
import './slides/slide-1-1-economic-machine.js';
import './slides/slide-1-2-short-term-cycle.js';
import './slides/slide-1-3-long-term-debt.js';
import './slides/slide-1-4-deleveragings.js';
import './slides/slide-1-7-inflation.js';
import './slides/slide-1-5-paradigms.js';
import './slides/slide-1-6-world-order.js';
import './slides/slide-2-2-all-weather.js';
import './slides/slide-2-5-stress.js';
import './slides/slide-2-4-risk-parity.js';
import './slides/slide-final-recommendation.js';
import './slides/sidebar-2-1-holy-grail.js';
import './slides/sidebar-2-3-alpha.js';

import { fetchAll } from './core/fetch.js';
import { setPayload, setWizard, getWizard } from './core/state.js';
import { renderAll } from './core/render.js';
import { runComputePipeline } from './core/compute-pipeline.js';
import { startLoadingLoop, stopLoadingLoop } from './animations/loading-loop.js';
import { renderWelcome } from './wizard/welcome.js';
import { renderTier1 } from './wizard/tier-1.js';
import { renderTier23 } from './wizard/tier-2-3.js';
import { saveWizard, loadWizard } from './wizard/persistence.js';
import { renderChipStrip } from './chips/chip-strip.js';
import { observeEmittingSlides } from './chips/observer.js';
import { renderSettingsLink } from './wizard/settings.js';
import { bindSlideReveals } from './animations/slide-reveals.js';
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
  if (isMobileBlocked()) {
    renderMobileSplash(app);
    return;
  }
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
  renderSettingsLink(header, () => window.location.reload());
  const loader = document.createElement('span');
  loader.id = 'loading-text';
  loader.className = 'eyebrow';
  loader.textContent = 'LOADING';
  header.appendChild(loader);
  startLoadingLoop(loader);

  try {
    const data = await fetchAll();
    setPayload(data);

    // CRITICAL: run compute pipeline ONCE here, before render. Slides + chips
    // both read from payload.computedXxx — without this, chip emit-fns get {}
    // and FR-7.5 silently fails.
    runComputePipeline(data, getWizard());

    stopLoadingLoop(loader);
    loader.textContent = `DATA · ${formatTs(data.fetched_at_utc)}`;
    renderAll(document.getElementById('slides'));

    const navBar = document.getElementById('nav-bar');
    renderNavBar(navBar, NAV_GROUPS);
    bindProximity(navBar);
    bindScrollspy(navBar, document.getElementById('slides'));
    bindClickScroll(navBar);

    // AF reveals on slide entry/exit (Spec §4.9 FR-9.4)
    bindSlideReveals(document.getElementById('slides'));

    // Chip-strip emit binding per Spec §4.7 FR-7.5:
    //   1.6 emits Empire   (StageTag.USA)
    //   1.3 emits Debt     (stage)
    //   1.5 emits Paradigm (paradigm_stage)
    //   1.7 emits Inflation (regime)
    observeEmittingSlides({
      '1.6': () => {
        const w = data?.computedWorldOrder ?? {};
        return { kind: 'empire', label: titleCase(w.StageTag?.USA || 'unknown'), status: bandFromHegemony(w.HegemonyRisk) };
      },
      '1.3': () => {
        const d = data?.computedLongDebt ?? {};
        return { kind: 'debt', label: titleCase(d.stage || 'unknown'), status: bandFromStage(d.stage) };
      },
      '1.5': () => {
        const p = data?.computedParadigms ?? {};
        return { kind: 'paradigm', label: titleCase(p.paradigm_stage || 'unknown'), status: p.paradigm_stage === 'LATE' ? 'amber' : 'green' };
      },
      '1.7': () => {
        const i = data?.computedInflation ?? {};
        return { kind: 'inflation', label: titleCase(i.regime || 'beautiful'), status: bandFromInflation(i.regime) };
      }
    });
  } catch (err) {
    stopLoadingLoop(loader);
    loader.textContent = `ERROR · ${err.message}`;
  }
}

function titleCase(s) { return s ? s[0] + s.slice(1).toLowerCase() : ''; }
function bandFromHegemony(h) { return h === 'HIGH' ? 'red' : h === 'ELEVATED' ? 'amber' : 'green'; }
function bandFromStage(s) { return s === 'PEAK' || s === 'DELEVERAGING' ? 'amber' : 'green'; }
function bandFromInflation(r) { return r === 'INFLATIONARY' ? 'red' : (r === 'STAGFLATION' ? 'amber' : 'green'); }

function formatTs(iso) {
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  } catch { return iso; }
}

document.addEventListener('DOMContentLoaded', bootstrap);
