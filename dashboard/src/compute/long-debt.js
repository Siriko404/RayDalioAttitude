/* 1.3 Long-Term Debt Cycle — research/03 §5-§6.
 * Four pressure indicators I1-I4. Stage classifier by I1_rev + I2_rev edges.
 *
 * Per Set 3.5 D8 lock: emit PEAK not TOP (to avoid 1.6 empire-stage collision).
 */

export function computeLongDebt(payload) {
  const fred = payload?.sources?.fred || {};
  const wb = payload?.sources?.wb_wdi || {};

  // I1 = Debt / Revenue; convert from /GDP basis: I1_rev = (D/GDP) / (Rev/GDP)
  const D_GDP = lastValue(fred.GFDEGDQ188S);  // total fed debt / GDP (decimal)
  const Rev_GDP = lastValue(fred.FYFRGDA188S);
  const I1_rev = (D_GDP != null && Rev_GDP != null && Rev_GDP > 0) ? D_GDP / Rev_GDP : null;
  const I1_rev_pct = I1_rev != null ? I1_rev * 100 : null;

  // I2 = (Interest + Principal_due) / Revenue. v1 uses interest only.
  const Int_GDP = lastValue(fred.FYOIGDA188S);
  const I2_rev_pct = (Int_GDP != null && Rev_GDP != null) ? (Int_GDP / Rev_GDP) * 100 : null;

  // I3 = r_nom − g_nom (decade-scale nominal rate vs nominal growth)
  const r_nom = lastValue(fred.GS10) || 0;
  const gdp_now = lastValue(fred.GDP);
  const gdp_4q_ago = valueAtOffset(fred.GDP, 4);
  const g_nom = (gdp_now != null && gdp_4q_ago) ? ((gdp_now / gdp_4q_ago) - 1) * 100 : 0;
  const I3 = r_nom - g_nom;

  // I4 = Debt / (Reserves + Savings) — proxy via FX reserves from WB
  const reserves = lastValue(wb.FI_RES_TOTL_CD);
  const I4 = (D_GDP != null && reserves) ? D_GDP * 1e12 / reserves : null;

  // Stage classifier per research/03 §6:
  //   SOUND        I1<200%   I2<5%
  //   BUBBLE       200-400%  5-10%
  //   PEAK         400-550%  10-15%   (emitted name; "TOP" in research file)
  //   DELEVERAGING 550-900%  15-40%
  const stage = classifyStage(I1_rev_pct, I2_rev_pct);

  // MP phase classifier (research/03 §5.6); v1 returns 'MP3' default — wire to
  // CB_Assets surge detection in v1.1.
  const mp_phase = 'MP3';

  return {
    stage,
    emitsLabel: stage === 'PEAK' ? 'PEAK' : titleCase(stage),
    I1_rev_pct, I2_rev_pct, I3, I4, r_nom, g_nom, mp_phase,
    emits: ['stage', 'mp_phase', 'I3_sign', '10yr_projection']
  };
}

function classifyStage(I1, I2) {
  if (I1 == null || I2 == null) return 'UNKNOWN';
  if (I1 < 200 && I2 < 5) return 'SOUND';
  if (I1 >= 200 && I1 < 400 && I2 >= 5 && I2 < 10) return 'BUBBLE';
  if (I1 >= 400 && I1 < 550 && I2 >= 10 && I2 < 15) return 'PEAK';
  if (I1 >= 550 && I1 < 900 && I2 >= 15 && I2 < 40) return 'DELEVERAGING';
  // Fallthrough: classify by I1 alone if I2 is out of band
  if (I1 >= 400 && I1 < 550) return 'PEAK';
  if (I1 >= 550) return 'DELEVERAGING';
  if (I1 >= 200) return 'BUBBLE';
  return 'SOUND';
}
function titleCase(s) { return s[0] + s.slice(1).toLowerCase(); }
function lastValue(series) {
  if (!Array.isArray(series)) return null;
  for (let i = series.length - 1; i >= 0; i--) if (series[i]?.value != null) return Number(series[i].value);
  return null;
}
function valueAtOffset(series, off) {
  if (!Array.isArray(series)) return null;
  const i = series.length - 1 - off;
  return i < 0 ? null : (series[i]?.value ?? null);
}
