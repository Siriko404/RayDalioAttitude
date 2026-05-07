/* Slide 11 Final Recommendation — Spec §3 + §4.3 FR-3.5 + §6 FR-12.
 * Inverted (white-on-black) recipe block + tail panel + binding rule label + disclaimer.
 */
import { registerSlide } from '../core/state.js';
import { renderSlideShell } from '../ui/slide-shell.js';
import { applyTilts } from '../compute/all-weather.js';
import { arbitrateTilts } from '../compute/tilt-arbiter.js';

const SLEEVE_LABELS = {
  equities: 'Equities', int_treasury: 'Int Treasury', long_treasury: 'Long Treasury',
  gold: 'Gold', commodities: 'Commodities'
};

registerSlide({
  id: 'final',
  title: 'Final Recommendation',
  render(section, { payload, wizard }) {
    section.dataset.theme = 'dark';

    const arbitrated = arbitrateTilts({
      inflation:    payload?.computedInflation ?? {},
      deleveragings: payload?.computedDelev ?? {},
      paradigms:    payload?.computedParadigms ?? {}
    });
    const tilted = applyTilts(arbitrated.tilts);

    const stress = payload?.computedStress ?? {};
    const rp = payload?.computedRiskParity ?? {};

    const onePoint = `Per Dalio's frameworks, <em>tilt toward ${highlightMost(tilted)}</em>.`;
    const caption = `Dominant tail: ${stress.dominant_tail?.regime ?? 'inflationary'} at <em>${(stress.dominant_tail?.R_pct ?? 0).toFixed(1)}%</em> portfolio drawdown. Tail asymmetry <em>${(stress.asymmetry_ratio ?? 0).toFixed(2)}×</em> (${stress.tail_band ?? 'AMBER'}); structural — not a flaw of this recipe.`;

    renderSlideShell(section, {
      step: '11', section: 'Final Recommendation',
      onePoint, caption,
      chartHtml: subCell(0, recipeBlockHTML(tilted, arbitrated.binding_label)),
      notesHtml: subCell(1, NOTES_HTML),
      sourcesHtml: subCell(2, SOURCES_HTML)
    });
    addTailPanel(section, stress);
    addLeverageNote(section, rp);
    addDisclaimerFooter(section, payload?.fetched_at_utc);
  }
});

function highlightMost(tilted) {
  const baseline = { equities: 0.30, int_treasury: 0.15, long_treasury: 0.40, gold: 0.075, commodities: 0.075 };
  let maxDelta = 0; let maxKey = 'equities';
  for (const k of Object.keys(tilted)) {
    const d = (tilted[k] || 0) - (baseline[k] || 0);
    if (d > maxDelta) { maxDelta = d; maxKey = k; }
  }
  return SLEEVE_LABELS[maxKey].toLowerCase();
}

function recipeBlockHTML(weights, bindingLabel) {
  const rows = ['equities', 'int_treasury', 'long_treasury', 'gold', 'commodities'].map(k => `
    <div class="recipe-row" data-sleeve="${k}">
      <span class="recipe-sleeve">${SLEEVE_LABELS[k]}</span>
      <span class="recipe-weight"><em>${((weights[k] ?? 0) * 100).toFixed(1)}%</em></span>
    </div>
  `).join('');
  return `
    <div class="recipe-block" style="background:#000;color:#fff;padding:48px;border:1px solid #fff">
      <div class="eyebrow" style="color:#fff;margin-bottom:24px">RECIPE · 5-SLEEVE WEIGHTS</div>
      ${rows}
      <div class="binding-rule" style="margin-top:24px;padding-top:16px;border-top:1px solid #fff;font-family:var(--font-mono);font-size:11px;letter-spacing:1.5px;color:#aaa">
        ${bindingLabel}
      </div>
    </div>`;
}

function addTailPanel(section, stress) {
  const tail = section.appendChild(document.createElement('div'));
  tail.className = 'tail-panel';
  tail.style.cssText = 'padding:32px;border-top:1px solid #fff;color:#fff';
  tail.innerHTML = `
    <div class="eyebrow" style="color:#fff;margin-bottom:16px">TAIL PANEL</div>
    <p class="caption" style="color:#fff">Worst-case scenario: <em>${stress.dominant_tail?.regime ?? 'inflationary'} depression</em> at <em>${(stress.dominant_tail?.R_pct ?? 0).toFixed(1)}%</em> portfolio drawdown.
    Asymmetry ratio <em>${(stress.asymmetry_ratio ?? 0).toFixed(2)}×</em> · band <em>${stress.tail_band ?? 'AMBER'}</em>.</p>`;
}

function addLeverageNote(section, rp) {
  const note = section.appendChild(document.createElement('div'));
  note.className = 'leverage-note';
  note.style.cssText = 'padding:16px 32px;color:#aaa;font-family:var(--font-mono);font-size:11px;letter-spacing:1.5px';
  note.textContent = `LEVERAGE · ${(rp.L ?? 1).toFixed(2)}× · σ_p ${(rp.σ_p_pct ?? 0).toFixed(1)}% · Sharpe ${(rp.SR_lev ?? 0).toFixed(2)}`;
}

function addDisclaimerFooter(section, ts) {
  const f = section.appendChild(document.createElement('div'));
  f.className = 'disclaimer-footer';
  f.textContent = `Suggestive · Not prescriptive · Live data fetched ${formatTs(ts)} · Reload to refresh.`;
}

function formatTs(iso) { try { return new Date(iso).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'; } catch { return ''; } }

function subCell(idx, inner) { return `<div data-cell-index="${idx}">${inner}</div>`; }

const NOTES_HTML = `
  <p>This is the synthesis. Eleven steps of regime classification feed five
  numbers — the recommended sleeve weights for the current regime, given
  Dalio's published recipes.</p>
  <p>The recommendation is <em>suggestive, not prescriptive</em>. It is the
  best-fit translation of Dalio's frameworks to live data. It is not financial
  advice. The dominant tail risk listed above is structural to the All-Weather
  recipe — it does not reflect a flaw in the construction; it reflects what
  this kind of portfolio is built to withstand and what it cannot.</p>`;

const SOURCES_HTML = `
  <ul style="font-family:var(--font-mono);font-size:11px;line-height:1.7;color:inherit">
    <li>Composite of all upstream regimes (steps 1.1-1.6, 1.7, 2.2-2.5)</li>
    <li>Tilt arbitration: Spec §6 FR-12 (research/07 §6 L132 ±10pt cap)</li>
    <li>Dalio, <em>Principles for Navigating Big Debt Crises</em></li>
    <li>Dalio, <em>Principles for Dealing With the Changing World Order</em></li>
    <li>Dalio, <em>Engineering Targeted Returns and Risks</em> (Bridgewater, 2012)</li>
  </ul>`;
