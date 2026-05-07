export async function fetchCofer(env) {
  if (env.__TEST) return {};
  throw new Error('not implemented');
}
