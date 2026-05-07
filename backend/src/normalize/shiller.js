/* Robert Shiller ie_data.xls — monthly P/E, CAPE, prices.
 * Source: http://www.econ.yale.edu/~shiller/data/ie_data.xls
 */
import * as XLSX from 'xlsx';

export async function fetchShiller(env) {
  if (env.__TEST) {
    return { ie_data: [{ date: '2024.12', sp500: 5800, cape: 36.2, longRate: 4.5 }] };
  }
  // CF Workers reject plain http; Yale's server serves over https
  const url = 'https://www.econ.yale.edu/~shiller/data/ie_data.xls';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Shiller HTTP ${r.status}`);
  const buf = await r.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames.find(n => /data/i.test(n)) || wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  // Headers typically at row 7 (Shiller's standard layout)
  const headerRow = rows.findIndex(r => String(r[0]).match(/^Date$/));
  const data = rows.slice(headerRow + 1)
    .filter(r => r[0] != null && /^\d/.test(String(r[0])))
    .map(r => ({
      date: String(r[0]),
      sp500: Number(r[1]),
      cape: Number(r[10]),
      longRate: Number(r[6])
    }));
  return { ie_data: data };
}
