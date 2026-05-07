/* NBER US Business Cycle Expansions and Contractions
 * Source: https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions
 * Static dataset — bake recent recession dates inline (refresh quarterly when committee declares).
 */
const RECESSION_DATES = [
  ['2020-02-01', '2020-04-01'],
  ['2007-12-01', '2009-06-01'],
  ['2001-03-01', '2001-11-01'],
  ['1990-07-01', '1991-03-01'],
  ['1981-07-01', '1982-11-01'],
  ['1980-01-01', '1980-07-01'],
  ['1973-11-01', '1975-03-01'],
  ['1969-12-01', '1970-11-01']
];

export async function fetchNber(env) {
  if (env.__TEST) return { recession_dates: [['2020-02-01', '2020-04-01']] };
  return { recession_dates: RECESSION_DATES };
}
