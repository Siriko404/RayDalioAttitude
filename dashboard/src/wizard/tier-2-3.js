/* T2/T3 wizard — Spec §4.1 FR-1.3.
 * T2: portfolio weights (5 sleeves, default = 100% cash).
 * T3: advanced — collapsed by default; IC, N, rho_avg, sigma_alpha, broker_spread.
 */

const SLEEVES = [
  ['equities', 'Equities'],
  ['int_treasury', 'Int Treasury'],
  ['long_treasury', 'Long Treasury'],
  ['gold', 'Gold'],
  ['commodities', 'Commodities']
];

export function renderTier23(container, { onSubmit, onSkip }) {
  container.innerHTML = `
    <div class="wizard-step">
      <div class="eyebrow">OPTIONAL</div>
      <h2>Tell us <em>more about you</em>?</h2>
      <p class="caption">Skip and we'll use sensible defaults — the pipeline runs end-to-end either way.</p>

      <details class="t2-portfolio">
        <summary class="eyebrow">Current portfolio (T2)</summary>
        <p class="caption">Default: starting from cash. Adjust if you already hold positions.</p>
        ${SLEEVES.map(([k, label]) => `
          <div class="wizard-field">
            <label for="t2_${k}">${label} (%)</label>
            <input type="number" name="t2_${k}" id="t2_${k}" min="0" max="100" step="1" value="0">
          </div>
        `).join('')}
      </details>

      <details class="t3-advanced" data-expanded="false">
        <summary class="eyebrow">Advanced — for professional users (T3)</summary>
        <p class="caption">Manager-proprietary alpha inputs. Most users skip this.</p>
        <div class="wizard-field"><label for="t3_ic">Information Coefficient (IC)</label><input type="number" name="t3_ic" step="0.01"></div>
        <div class="wizard-field"><label for="t3_n">Number of bets (N)</label><input type="number" name="t3_n"></div>
        <div class="wizard-field"><label for="t3_rho">Avg correlation (ρ)</label><input type="number" name="t3_rho" step="0.01"></div>
        <div class="wizard-field"><label for="t3_sigma_alpha">σ alpha</label><input type="number" name="t3_sigma_alpha" step="0.01"></div>
        <div class="wizard-field"><label for="t3_spread">Broker financing spread (bp)</label><input type="number" name="t3_spread"></div>
      </details>

      <div style="display:flex;gap:var(--gap-md);margin-top:var(--gap-lg)">
        <button class="wizard-next">Save & continue →</button>
        <button class="wizard-skip">Skip · use defaults</button>
      </div>
    </div>
  `;

  container.querySelector('.t3-advanced').addEventListener('toggle', (e) => {
    e.target.dataset.expanded = e.target.open ? 'true' : 'false';
  });

  container.querySelector('.wizard-next').addEventListener('click', () => {
    const data = {};
    container.querySelectorAll('input[name^="t2_"], input[name^="t3_"]').forEach(el => {
      const v = el.value === '' ? null : Number(el.value);
      if (v !== null) data[el.name] = v;
    });
    onSubmit(data);
  });
  container.querySelector('.wizard-skip').addEventListener('click', () => onSkip());
}
