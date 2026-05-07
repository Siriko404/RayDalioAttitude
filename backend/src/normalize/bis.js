/* BIS Effective Exchange Rates — .zip CSV format.
 * In production: fetch zip, unzip via fflate, parse CSV.
 * Test mode returns minimal fixture.
 */
import * as fflate from 'fflate';

export async function fetchBis(env) {
  if (env.__TEST) {
    return { EER: [{ date: '2024-12', value: 102.5 }] };
  }
  const url = 'https://data.bis.org/static/bulk/WS_EER_csv_col.zip';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`BIS HTTP ${r.status}`);
  const buf = new Uint8Array(await r.arrayBuffer());
  const decompressed = fflate.unzipSync(buf);
  const csvFile = Object.keys(decompressed).find(k => k.endsWith('.csv'));
  if (!csvFile) throw new Error('BIS zip missing csv');
  const csvText = new TextDecoder().decode(decompressed[csvFile]);
  // Parse CSV (broad EER USD column); minimal extraction:
  const lines = csvText.split('\n').slice(1);
  const eer = lines
    .map(l => l.split(','))
    .filter(c => c[0] === 'US' && c[1] === 'B')  // US broad EER
    .map(c => ({ date: c[2], value: Number(c[3]) }))
    .filter(p => Number.isFinite(p.value));
  return { EER: eer };
}
