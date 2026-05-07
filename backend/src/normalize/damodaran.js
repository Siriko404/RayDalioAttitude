/* Damodaran historical S&P returns — .xls direct download.
 * Sheet "Returns by year"; columns: Year, S&P 500 return, T.Bond return, ...
 */
import * as XLSX from 'xlsx';

export async function fetchDamodaran(env) {
  if (env.__TEST) {
    return { histretSP: [{ year: 2024, sp500: 0.234, tbond: 0.012 }] };
  }
  const url = 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.xls';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Damodaran HTTP ${r.status}`);
  const buf = await r.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheetName = wb.SheetNames.find(n => /returns/i.test(n)) || wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
  // Damodaran headers vary; pick year + S&P + T.Bond columns by header match:
  const headerRow = rows.findIndex(r => r.some(c => /year/i.test(String(c))));
  if (headerRow < 0) throw new Error('Damodaran header row not found');
  const headers = rows[headerRow].map(h => String(h));
  const yearIdx = headers.findIndex(h => /^year$/i.test(h));
  const spIdx = headers.findIndex(h => /S&P 500/i.test(h));
  const tbIdx = headers.findIndex(h => /T\.?\s*Bond/i.test(h));
  const data = rows.slice(headerRow + 1)
    .filter(r => r[yearIdx] != null && Number.isFinite(Number(r[yearIdx])))
    .map(r => ({
      year: Number(r[yearIdx]),
      sp500: Number(r[spIdx]),
      tbond: Number(r[tbIdx])
    }));
  return { histretSP: data };
}
