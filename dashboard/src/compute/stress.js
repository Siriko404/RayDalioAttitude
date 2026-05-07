/* 2.5 Stress Testing — research/12 §5-§6.
 * Shock matrix S (5 sleeves × 4 archetypes), cumulative percentages.
 * R^{port}_e = Σ_i w_i · S_{i,e}
 *
 * Verbatim from research/12 §7 L103-148.
 */

const SLEEVES = ['equities', 'long_treasury', 'int_treasury', 'gold', 'commodities'];
const ARCHETYPES = ['deflationary', 'inflationary', 'stagflation', 'reflation'];

// Shock matrix (cumulative %) — verbatim research/12 §7 L120-130
const SHOCK_MATRIX = {
  equities:      { deflationary: -50, inflationary: -30, stagflation: -37, reflation: +25 },
  long_treasury: { deflationary: +20, inflationary: -50, stagflation:  -5, reflation:  +5 },
  int_treasury:  { deflationary: +10, inflationary: -40, stagflation:  +2, reflation:  +3 },
  gold:          { deflationary:   0, inflationary: +80, stagflation: +100, reflation: +10 },
  commodities:   { deflationary: -35, inflationary: +40, stagflation: +30, reflation: +15 }
};

export function computeStress(input) {
  const { weights } = input;

  const R_port_pct = {};
  const C_per_archetype = {};
  for (const arch of ARCHETYPES) {
    let R = 0;
    const contributions = {};
    for (const sleeve of SLEEVES) {
      const c = (weights[sleeve] ?? 0) * SHOCK_MATRIX[sleeve][arch];
      contributions[sleeve] = c;
      R += c;
    }
    R_port_pct[arch] = R;
    C_per_archetype[arch] = contributions;
  }

  // Dominant driver per archetype = sleeve with max |contribution|
  const dominant_per_archetype = {};
  for (const arch of ARCHETYPES) {
    let max = -Infinity, maxSleeve = null;
    for (const sleeve of SLEEVES) {
      const abs = Math.abs(C_per_archetype[arch][sleeve]);
      if (abs > max) { max = abs; maxSleeve = sleeve; }
    }
    dominant_per_archetype[arch] = maxSleeve;
  }

  // Asymmetry ratio = max |R| / min |R|
  const absR = ARCHETYPES.map(a => Math.abs(R_port_pct[a]));
  const asymmetry_ratio = Math.max(...absR) / Math.min(...absR.filter(x => x > 0));

  // Dominant tail = archetype with max |R|
  const tailIdx = absR.indexOf(Math.max(...absR));
  const dominant_tail = { regime: ARCHETYPES[tailIdx], R_pct: R_port_pct[ARCHETYPES[tailIdx]] };

  return {
    R_port_pct, C_per_archetype, dominant_per_archetype,
    asymmetry_ratio, dominant_tail,
    tail_band: tailBand(asymmetry_ratio),
    SHOCK_MATRIX,
    emits: ['R_port_e', 'asymmetry_ratio', 'dominant_sleeve_per_archetype']
  };
}

/** Per Set 3.5 D5 lock: GREEN <5×, AMBER 5-9.99×, RED ≥10×. */
export function tailBand(ratio) {
  if (ratio < 5)  return 'GREEN';
  if (ratio < 10) return 'AMBER';
  return 'RED';
}
