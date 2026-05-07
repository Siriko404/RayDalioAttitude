export async function fetchWorldBank(env) {
  if (env.__TEST) return { Edu_tert: [{ year: 2023, value: 88.4 }] };
  // WB API: https://api.worldbank.org/v2/country/USA/indicator/SE.TER.CUAT.BA.ZS?format=json
  const url = 'https://api.worldbank.org/v2/country/USA/indicator/SE.TER.CUAT.BA.ZS?format=json&per_page=100';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`WB HTTP ${r.status}`);
  const j = await r.json();
  const series = (j[1] || []).map(o => ({ year: o.date, value: o.value })).filter(p => p.value != null);
  return { Edu_tert: series };
}
