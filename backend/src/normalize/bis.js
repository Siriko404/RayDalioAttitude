export async function fetchBis(env) {
  if (env.__TEST) return {};
  throw new Error('not implemented');
}
