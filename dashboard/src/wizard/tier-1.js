/* T1 wizard — Spec §4.1 FR-1.2.
 * 3 required fields: home currency · focus country · risk profile.
 * sigma_target maps: conservative=6% · balanced=10% · aggressive=15%.
 */

const SIGMA_MAP = { conservative: 0.06, balanced: 0.10, aggressive: 0.15 };

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
const COUNTRIES = [
  ['US', 'United States'], ['UK', 'United Kingdom'], ['DE', 'Germany'],
  ['JP', 'Japan'], ['CN', 'China'], ['CA', 'Canada'], ['AU', 'Australia']
];

export function renderTier1(container, { onSubmit }) {
  container.innerHTML = `
    <div class="wizard-step">
      <div class="eyebrow">STEP 1 OF 1 · REQUIRED</div>
      <h2>Set your <em>frame of reference</em>.</h2>
      <div class="wizard-field">
        <label for="home_currency">Home currency</label>
        <select name="home_currency" id="home_currency">
          ${CURRENCIES.map(c => `<option value="${c}"${c==='USD'?' selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="wizard-field">
        <label for="focus_country">Focus country</label>
        <select name="focus_country" id="focus_country">
          ${COUNTRIES.map(([k,v]) => `<option value="${k}"${k==='US'?' selected':''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="wizard-field">
        <label>Risk profile</label>
        <div class="wizard-radio-group">
          <label><input type="radio" name="risk_profile" value="conservative"> Conservative · 6%</label>
          <label><input type="radio" name="risk_profile" value="balanced" checked> Balanced · 10%</label>
          <label><input type="radio" name="risk_profile" value="aggressive"> Aggressive · 15%</label>
        </div>
      </div>
      <button class="wizard-next">Continue →</button>
    </div>
  `;
  container.querySelector('.wizard-next').addEventListener('click', () => {
    const home_currency = container.querySelector('[name="home_currency"]').value;
    const focus_country = container.querySelector('[name="focus_country"]').value;
    const risk_profile = container.querySelector('[name="risk_profile"]:checked').value;
    onSubmit({ home_currency, focus_country, risk_profile, sigma_target: SIGMA_MAP[risk_profile] });
  });
}
