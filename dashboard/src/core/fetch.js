/* Single fetch on load — Spec §0 #5 + §2.4 contract.
 * No retry, no timeout (Worker handles); browser surfaces error to user.
 *
 * Design-mode toggle:
 *   - Set VITE_DESIGN_MODE=1 (in .env.local or `npm run dev:design`) to bypass
 *     the network entirely and consume the static MOCK_PAYLOAD fixture.
 *     Lets UI/UX iterate without deploying the Cloudflare Worker / FRED key.
 *   - URL override `?mock=1` flips on the same path at runtime.
 */
import { MOCK_PAYLOAD } from '../fixtures/mock-payload.js';

const ENDPOINT = '/api/fetch-all';

function shouldUseMock() {
  // 1) Vite env flag at build time
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DESIGN_MODE === '1') return true;
  } catch (_) { /* non-vite contexts */ }
  // 2) URL override at runtime — useful for share-able design preview links
  if (typeof window !== 'undefined' && window.location?.search?.includes('mock=1')) return true;
  return false;
}

export async function fetchAll() {
  if (shouldUseMock()) {
    // Return a structural clone so consumers can mutate freely (pipeline writes
    // computedXxx onto the payload object).
    return JSON.parse(JSON.stringify(MOCK_PAYLOAD));
  }
  const r = await fetch(ENDPOINT, { method: 'GET' });
  if (!r.ok) throw new Error(`fetch-all HTTP ${r.status}`);
  return r.json();
}
