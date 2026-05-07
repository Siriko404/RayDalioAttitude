/* 1.6 Big Cycle / World Order — research/06 §5-§6.
 * Country Power Index = mean of 8 z-scores, normalized to [0,1] via fixed
 * panel-extreme anchors max≈+1.9, min≈−1.5. Stage by CPI level + 20yr slope.
 *
 * Per Set 3.5 D8: 1.6 keeps `TOP` (Dalio canonical wording); 1.3 emits `PEAK`.
 */

const MEASURES = ['Edu', 'Innov', 'Cost', 'Mil', 'Trade', 'Output', 'Fin', 'Reserve'];

export function computeWorldOrder(input) {
  const { panel = {}, anchors = { max: 1.9, min: -1.5 }, cofer_resDelta10pp = 0,
          s20_USA = 0, s20_CHN = 0, s20 = {} } = input;

  // Per-country z-mean → CPI ∈ [0,1] via min-max normalize
  const zSpan = anchors.max - anchors.min;
  const CPI = {};
  for (const country of Object.keys(panel)) {
    const zMean = MEASURES.reduce((s, m) => s + (panel[country][m] ?? 0), 0) / MEASURES.length;
    CPI[country] = (zMean - anchors.min) / zSpan;
  }

  // 20-yr slope: prefer per-country s20 input if provided; else defaults
  const s20Map = { USA: s20_USA, CHN: s20_CHN, ...s20 };

  // Stage classifier (research/06 §6 L113-127):
  //   RISE       CPI 0.25-0.80 + s20 > +0.05 + flat/rising reserve
  //   TOP        CPI > 0.80 + |s20| ≤ 0.05
  //   DECLINE    CPI > 0.60 + s20 < −0.05
  //   NEW_ORDER  CPI < 0.30 after prior > 0.80 (history-aware; v1 stub)
  const StageTag = {};
  for (const country of Object.keys(CPI)) {
    StageTag[country] = classifyStage(CPI[country], s20Map[country] ?? 0);
  }

  // HegemonyRisk: USA-vs-CHN measure-by-measure
  let cntNeg = 0;
  if (panel.USA && panel.CHN) {
    for (const m of MEASURES) {
      if ((panel.USA[m] ?? 0) - (panel.CHN[m] ?? 0) <= 0) cntNeg++;
    }
  }
  const HegemonyRisk = classifyHegemonyRisk(cntNeg, cofer_resDelta10pp);

  return {
    CPI, StageTag, HegemonyRisk, cntNeg, cofer_resDelta10pp,
    zScores: panel,    // exposed for radar visualization (slide-1-6)
    emits: ['CountryPowerIndex', 'StageTag', 'HegemonyRisk']
  };
}

function classifyStage(CPI, s20) {
  if (CPI >= 0.25 && CPI <= 0.80 && s20 > +0.05) return 'RISE';
  if (CPI > 0.80 && Math.abs(s20) <= 0.05)        return 'TOP';
  if (CPI > 0.60 && s20 < -0.05)                  return 'DECLINE';
  if (CPI < 0.30)                                  return 'NEW_ORDER';
  return 'TRANSITIONAL';
}

export function classifyHegemonyRisk(cntNeg, resDelta10pp) {
  if (cntNeg <= 1 && resDelta10pp >= 0)                        return 'LOW';
  if (cntNeg >= 2 && cntNeg <= 3 && resDelta10pp >= -10)        return 'ELEVATED';
  if (cntNeg >= 4 && resDelta10pp < -10)                        return 'HIGH';
  return 'ELEVATED';   // fallback band
}
