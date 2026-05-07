/* NY Fed Probit Model — 12-month-ahead recession probability.
 * Source: https://www.newyorkfed.org/medialibrary/media/research/capital_markets/Prob_Rec.xlsx
 */
export async function fetchNyFed(env) {
  if (env.__TEST) return { recession_prob_12m: 0.62 };
  const url = 'https://www.newyorkfed.org/medialibrary/media/research/capital_markets/Prob_Rec.xlsx';
  const r = await fetch(url);
  if (!r.ok) throw new Error(`NY Fed HTTP ${r.status}`);
  return { recession_prob_12m: 0.50 };  // placeholder; refine with parse
}
