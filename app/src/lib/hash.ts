// Ported from Scout Hub.dc.html line 912.
export function hash(code: string): number {
  let h = 0;
  for (const ch of code) h += ch.charCodeAt(0);
  return h;
}
