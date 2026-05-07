// Yardeni IBES forecast PDF; PDF parsing not in v1 — fall back to null.
export async function fetchYardeni(env) {
  if (env.__TEST) return null;
  return null;
}
