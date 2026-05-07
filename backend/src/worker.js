/* Cloudflare Worker — Spec §2.4 contract.
 * GET /api/fetch-all → fan out to sources in parallel → single JSON.
 */
import { fetchFred } from './normalize/fred.js';
import { fetchBis } from './normalize/bis.js';
import { fetchCofer } from './normalize/imf-cofer.js';
import { fetchWorldBank } from './normalize/world-bank.js';
import { fetchDamodaran } from './normalize/damodaran.js';
import { fetchShiller } from './normalize/shiller.js';
import { fetchYardeni } from './normalize/yardeni.js';
import { fetchNber } from './normalize/nber.js';
import { fetchNyFed } from './normalize/ny-fed.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const SOURCES = [
  ['fred',       fetchFred],
  ['bis',        fetchBis],
  ['cofer',      fetchCofer],
  ['wb_wdi',     fetchWorldBank],
  ['damodaran',  fetchDamodaran],
  ['shiller',    fetchShiller],
  ['yardeni',    fetchYardeni],
  ['nber',       fetchNber],
  ['nyfed',      fetchNyFed]
];

async function safeRun(name, fn, env) {
  try {
    const data = await fn(env);
    return [name, { data, error: null }];
  } catch (err) {
    return [name, { data: null, error: String(err.message || err) }];
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }
    const url = new URL(request.url);
    if (url.pathname !== '/api/fetch-all') {
      return new Response('Not Found', { status: 404, headers: CORS });
    }

    const results = await Promise.all(SOURCES.map(([n, f]) => safeRun(n, f, env)));
    const sources = {};
    const errors = [];
    for (const [name, { data, error }] of results) {
      sources[name] = data;
      if (error) errors.push({ source: name, reason: error, fallback_used: false });
    }

    const body = {
      fetched_at_utc: new Date().toISOString(),
      sources,
      errors
    };
    return new Response(JSON.stringify(body), {
      headers: { 'Content-Type': 'application/json', ...CORS }
    });
  }
};
