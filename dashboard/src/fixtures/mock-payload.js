/* Mock payload fixture — Apr-2026 plausible snapshot for offline UI/UX dev.
 *
 * Replaces /api/fetch-all when VITE_DESIGN_MODE=1 is set during `npm run dev`.
 * Lets designers iterate on slides + animations + chart treatments without
 * deploying the Cloudflare Worker or holding a FRED API key.
 *
 * NOT REAL DATA. Numbers are research-anchored plausible values calibrated
 * to produce variety across the 13 framework outputs:
 *
 *   1.1 Economic Machine    → MIXED credit/money + ELEVATED debt/money + ON_TREND gap
 *   1.2 Short-Term Cycle    → mid-cycle, mildly inverted yield curve
 *   1.3 Long-Term Debt Cycle → late-cycle, debt/GDP rising, real-rate squeeze
 *   1.4 Deleveragings       → NOT_DELEVERAGING (gate closed; "Not Triggered ✓" card)
 *   1.5 Paradigm Shifts     → MID paradigm, S_tail≈2
 *   1.6 World Order         → USA DECLINE, CHN RISE, ELEVATED hegemony risk
 *   1.7 Inflation           → INFLATIONARY (π=5.6%, r_mkt=-0.5%, debase signal fired)
 *   2.1 Holy Grail          → educational sidebar (no live data)
 *   2.2 All-Weather         → 30/15/40/7.5/7.5 baseline → tilted by 1.7 INFLATIONARY
 *   2.3 Alpha               → wizard-only sidebar
 *   2.4 Risk Parity         → σ_target=10%, leverage from baseline σ
 *   2.5 Stress Testing      → archetype shocks per tilted weights
 *
 * Each FRED series carries enough samples for compute reads (lastValue +
 * valueLagged at QPY/MPY/WPY/DPY lags) plus OLS-trend on A939RX0Q048SBEA.
 */

function range(n, start, end) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 1 : i / (n - 1);
    out.push({ date: tag(i, n), value: start + (end - start) * t });
  }
  return out;
}

function expRange(n, start, end) {
  const out = [];
  const k = Math.log(end / start) / Math.max(1, n - 1);
  for (let i = 0; i < n; i++) out.push({ date: tag(i, n), value: start * Math.exp(k * i) });
  return out;
}

function tag(i, n) {
  // Decorative timestamps; compute modules read positionally, not by date.
  // Format chosen to look like real FRED dates for any visualizer that prints them.
  return `2026-${String(((i % 12) + 1)).padStart(2, '0')}-01`;
}

// ─── FRED 46 series ──────────────────────────────────────────────────────────

const FRED = {
  // 1.1 Economic Machine
  GDP:               expRange(20, 22000, 30200),    // Bn$ SAAR Q (NGDP yoy ≈ 6.9%)
  GDPC1:             expRange(20, 21000, 23500),    // Bn$ chained Q
  GDPDEF:            expRange(20, 105, 128),
  A939RX0Q048SBEA:   expRange(30, 60000, 68000),    // real GDP per capita; OLS trend driver
  CNP16OV:           expRange(60, 260000, 268000),
  M2SL:              expRange(60, 19500, 21500),    // M2 yoy ≈ 1.9%
  TCMDO:             expRange(20, 70000000, 78000000),
  HOANBS:            expRange(20, 320000, 340000),
  OPHNFB:            expRange(20, 116, 124),

  // 1.2 Short-Term Cycle
  A191RL1Q225SBEA:   range(20, 1.5, 2.0),
  GDPPOT:            expRange(20, 23000, 24000),
  UNRATE:            range(60, 3.5, 4.2),
  TCU:               range(60, 78, 77.5),
  CPIAUCSL:          expRange(60, 280, 340),        // CPI yoy ≈ 5.6%
  FEDFUNDS:          range(60, 0.10, 4.33),
  T10Y2Y:            range(252, -0.50, +0.40),
  T10Y3M:            range(252, -1.20, -0.20),
  BUSLOANS:          expRange(60, 2300, 2750),
  SAHMREALTIME:      range(60, 0.10, 0.45),

  // 1.3 Long-Term Debt Cycle
  GFDEGDQ188S:       range(20, 102, 122),           // 122% of GDP latest, 119.6% 4Q ago
  FYGFGDQ188S:       range(15, 78, 95),
  FYOIGDA188S:       range(15, 1.5, 3.5),
  GS10:              range(60, 1.50, 4.45),         // 4.45% latest, ~4.20% 12M ago → ΔGS10 ≈ +0.25
  FYFSGDA188S:       range(15, -3.0, -6.0),         // -6% deficit, prior -5.6 → FiscalBal_delta ≈ -0.4pp
  FYFRGDA188S:       range(15, 16.5, 17.0),

  // 1.4 Deleveragings extras
  QUSCAM770A:        range(20, 145, 155),
  DGS10:             range(252, 4.20, 4.45),
  BOGMBASE:          expRange(60, 5000, 5400),
  WALCL:             expRange(260, 7000000, 7000000), // post-QT plateau
  QBPLNTLNNTCGOFFR:  range(20, 0.30, 0.45),         // Writeoff rate 0.45% → decimal 0.0045

  // 1.5 Paradigm Shifts
  TB3MS:             range(60, 0.10, 4.20),
  PPIACO:            range(60, 240, 268),
  A463RC1Q027SBEA:   expRange(20, 2800, 3400),     // ProfitShare = 3400/30200 ≈ 11.3%
  DFII10:            range(252, 0.50, -0.50),       // crosses zero — 126 days negative → 6mo streak

  // 1.7 Inflation extras
  CPILFESL:          expRange(60, 295, 348),        // core yoy ≈ 4.5%
  REAINTRATREARAT10Y:range(60, 0.50, -0.40),
  GOLDPMGBD228NLBM:  range(252, 2800, 3300),       // ΔGold ≈ +17.86% (above +15% debase edge)
  DTWEXBGS:          range(252, 110, 102),         // ΔFX ≈ -7.27% (below -7% debase edge)

  // 2.1 Holy Grail
  SP500:             expRange(252, 4500, 5800),
  DTB3:              range(252, 4.10, 4.20),
  BAMLH0A0HYM2:      range(252, 280, 320),
  DCOILWTICO:        range(252, 78, 75),

  // 2.4 Risk Parity & Leverage
  DFF:               range(252, 4.33, 4.33),
  VIXCLS:            range(252, 14, 18),

  // 2.2 All-Weather
  DGS20:             range(252, 4.30, 4.55),

  // 2.3 Alpha
  DGS3MO:            range(252, 4.10, 4.20)
};

// ─── Bulk-file sources ──────────────────────────────────────────────────────

const BIS = { EER: range(60, 100, 102) };

const COFER = {
  Res_shr: [
    { date: '2016-Q1', usd: 0.620, eur: 0.198, jpy: 0.058, gbp: 0.049, cny: 0.012 },
    { date: '2018-Q1', usd: 0.615, eur: 0.198, jpy: 0.060, gbp: 0.049, cny: 0.018 },
    { date: '2020-Q1', usd: 0.610, eur: 0.200, jpy: 0.060, gbp: 0.045, cny: 0.020 },
    { date: '2022-Q1', usd: 0.598, eur: 0.198, jpy: 0.058, gbp: 0.048, cny: 0.022 },
    { date: '2024-Q1', usd: 0.585, eur: 0.198, jpy: 0.058, gbp: 0.049, cny: 0.022 },
    { date: '2026-Q1', usd: 0.585, eur: 0.198, jpy: 0.058, gbp: 0.049, cny: 0.022 }
  ]   // resDelta over 10 years ≈ -3.5pp → ELEVATED hegemony band
};

const WB_WDI = { Edu_tert: range(15, 78, 88) };

const DAMODARAN = (() => {
  // 50-year SP500 + tbond annual returns (1976-2025), realistic composite.
  const years = []; for (let y = 1976; y <= 2025; y++) years.push(y);
  const sp500 = [
    0.237, -0.072, 0.066, 0.187, 0.323,  -0.050, 0.211, 0.226, 0.062, 0.317,
    0.186, 0.052, 0.166, 0.317, -0.031,   0.305, 0.076, 0.100, 0.013, 0.376,
    0.230, 0.334, 0.286, 0.210, -0.091,  -0.119, -0.221, 0.287, 0.108, 0.049,
    0.158, 0.055, -0.370, 0.265, 0.151,   0.021, 0.160, 0.324, 0.137, 0.014,
    0.120, 0.218, -0.044, 0.314, 0.183,   0.286, -0.181, 0.262, 0.235, 0.143
  ];
  const tbond = [
    0.169, -0.007, -0.012, -0.013, -0.039, 0.018, 0.402, 0.001, 0.150, 0.310,
    0.245, -0.027, 0.097, 0.183, 0.061,    0.193, 0.080, 0.182, -0.077, 0.234,
    0.014, 0.099, 0.149, -0.082, 0.169,    0.057, 0.149, 0.020, 0.044, 0.029,
    0.020, 0.097, 0.249, -0.111, 0.084,    0.165, 0.034, -0.091, 0.106, 0.014,
    0.007, 0.024, 0.000, 0.087, 0.128,   -0.038, -0.179, 0.040, 0.010, 0.045
  ];
  return { histretSP: years.map((y, i) => ({ year: y, sp500: sp500[i], tbond: tbond[i] })) };
})();

const SHILLER = { ie_data: range(120, 1500, 5800) };

const NBER  = { recession_dates: [
  { peak: '2020-02', trough: '2020-04' },
  { peak: '2007-12', trough: '2009-06' }
]};

const NYFED = { recession_prob_12m: 0.18 };

// ─── Final mock payload ─────────────────────────────────────────────────────

export const MOCK_PAYLOAD = Object.freeze({
  fetched_at_utc: '2026-04-30T14:32:00Z',
  sources: {
    fred:      FRED,
    bis:       BIS,
    cofer:     COFER,
    wb_wdi:    WB_WDI,
    damodaran: DAMODARAN,
    shiller:   SHILLER,
    yardeni:   null,
    nber:      NBER,
    nyfed:     NYFED
  },
  errors: []
});
