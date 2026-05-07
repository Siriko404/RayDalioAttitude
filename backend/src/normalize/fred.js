/* FRED normalizer — Spec §2.4
 * Series IDs from research/01-12 §4 input tables (verified verbatim against
 * docs/superpowers/research-extracts/2026-05-06-research-extract.md).
 */
const FRED_SERIES = [
  // 1.1 Economic Machine (research/01 §4 L29-41)
  'GDP',                    // GDP_nom Q
  'GDPC1',                  // GDP_real Q
  'GDPDEF',                 // GDP deflator Q
  'A939RX0Q048SBEA',        // Real GDP per capita Q
  'CNP16OV',                // Civilian non-inst pop M
  'M2SL',                   // M2 money stock M
  'TCMDO',                  // Total Credit Domestic Nonfin Q (mn → bn ÷1000)
  'HOANBS',                 // Hours of all persons (HPAY) Q
  'OPHNFB',                 // Output per hour (OPH) Q

  // 1.2 Short-Term Cycle (research/02 §4 L28-43)
  'A191RL1Q225SBEA',        // Real GDP qoq SAAR Q
  'GDPPOT',                 // Potential GDP (CBO) Q
  'UNRATE',                 // Unemployment rate M
  'TCU',                    // Capacity utilization M
  'CPIAUCSL',               // CPI all items SA M
  'FEDFUNDS',               // Fed funds rate M
  'T10Y2Y',                 // 10Y-2Y spread D
  'T10Y3M',                 // 10Y-3M spread D
  'BUSLOANS',               // C&I loans M
  'SAHMREALTIME',           // Sahm rule M

  // 1.3 Long-Term Debt Cycle (research/03 §4 L30-47)
  'GFDEGDQ188S',            // Total fed debt / GDP Q
  'FYGFGDQ188S',            // Public debt / GDP Q
  'FYOIGDA188S',            // Net interest / GDP A
  'GS10',                   // 10Y nominal yield M
  'FYFSGDA188S',            // Fiscal balance / GDP A (HdlDef_GDP)
  'FYFRGDA188S',            // Federal revenue / GDP A

  // 1.4 Deleveragings (research/04 §4 L26-40)
  'QUSCAM770A',             // BIS US private credit / GDP Q
  'DGS10',                  // 10Y Treasury yield D
  'BOGMBASE',               // Monetary base M
  'WALCL',                  // Fed balance sheet (CB_Assets) W
  'QBPLNTLNNTCGOFFR',       // Loan write-offs Q

  // 1.5 Paradigm Shifts (research/05 §4 L29-46)
  'TB3MS',                  // T-bill 3M M (Tbill return proxy)
  'PPIACO',                 // PPI all commodities M (cmdty proxy)
  'A463RC1Q027SBEA',        // Corp profits (ProfitShare numerator) Q
  'DFII10',                 // 10Y TIPS / real rate D

  // 1.7 Inflation (research/07 §4 L37-48)
  'CPILFESL',               // CPI core M
  'REAINTRATREARAT10Y',     // Cleveland Fed 10Y real rate M
  'GOLDPMGBD228NLBM',       // Gold London PM fix D
  'DTWEXBGS',               // Broad USD index D

  // 2.1 Holy Grail (research/08 §4 L35-51)
  'SP500',                  // S&P 500 D
  'DTB3',                   // 3M T-bill (RF) D
  'BAMLH0A0HYM2',           // HY OAS spread D
  'DCOILWTICO',             // WTI crude D

  // 2.4 Risk Parity & Leverage (research/11 §4 L28-43)
  'DFF',                    // Fed funds effective D
  'VIXCLS',                 // VIX D

  // 2.3 Alpha (research/10 §4 L32-43)
  'DGS3MO'                  // Cash rate proxy D (alias for DTB3)
];
// Total: 47 distinct FRED series across all 12 frameworks. DGS3MO and DTB3 are
// both 3-month T-bill rates — kept both for citation traceability per
// research/10 §4 L34 (alpha) vs research/08 §4 L37 (holy grail).

export async function fetchFred(env) {
  if (env.__TEST) {
    // Test mode — minimal fixture
    const stub = { date: '2024-01-01', value: 100 };
    return Object.fromEntries(FRED_SERIES.map(s => [s, [stub]]));
  }
  if (!env.FRED_API_KEY) throw new Error('FRED_API_KEY missing');

  async function fetchSeries(seriesId) {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${env.FRED_API_KEY}&file_type=json&observation_start=1960-01-01`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`FRED ${seriesId} HTTP ${r.status}`);
    const j = await r.json();
    return j.observations.map(o => ({
      date: o.date,
      value: o.value === '.' ? null : Number(o.value)
    }));
  }

  const results = await Promise.all(FRED_SERIES.map(s => fetchSeries(s).then(d => [s, d])));
  return Object.fromEntries(results);
}
