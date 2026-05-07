/* Single fetch on load — Spec §0 #5 + §2.4 contract.
 * No retry, no timeout (Worker handles); browser surfaces error to user.
 */
const ENDPOINT = '/api/fetch-all';

export async function fetchAll() {
  const r = await fetch(ENDPOINT, { method: 'GET' });
  if (!r.ok) throw new Error(`fetch-all HTTP ${r.status}`);
  return r.json();
}
