export async function fetchFred(env) {
  if (env.__TEST) return { GDP: [], TCMDO: [] };
  throw new Error('not implemented');
}
