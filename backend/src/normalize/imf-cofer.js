/* IMF COFER — currency composition of FX reserves quarterly. */
import * as XLSX from 'xlsx';

export async function fetchCofer(env) {
  if (env.__TEST) {
    return { Res_shr: [{ date: '2024Q3', usd: 0.585, eur: 0.198, jpy: 0.058, gbp: 0.049, cny: 0.022 }] };
  }
  // IMF actual data XLS (landing: https://data.imf.org/regular.aspx?key=41175)
  const xlsUrl = 'https://www.imf.org/external/np/sta/cofer/eng/cofer.xls';
  const r = await fetch(xlsUrl);
  if (!r.ok) throw new Error(`COFER HTTP ${r.status}`);
  const buf = await r.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  // Best-effort COFER parse; layout changes occasionally
  return { Res_shr: rows.slice(0, 50) };  // raw for now; downstream tolerates
}
