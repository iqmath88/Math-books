/* NIBOR timeline helpers — pure functions of t (seconds). Deterministic: the same t always gives the same frame,
   so the browser preview and the exported MP4 are identical. */
export const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const eio = u => (u = cl(u), u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);   // ease in-out cubic
export const eo = u => 1 - Math.pow(1 - cl(u), 3);                                              // ease out cubic
export const ei = u => Math.pow(cl(u), 3);
export const back = u => { u = cl(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };   // overshoot
export const ramp = (t, a, d) => cl((t - a) / d);
export const win = (t, a, b, fi = .4, fo = .4) => cl((t - a) / fi) * cl((b - t) / fo);
/* seeded PRNG (mulberry32) — particles etc. must not use Math.random() */
export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
/* keyframe track: keys = [[t, {a:..,b:..}], ...]; eased (in-out) between keys, held outside */
export function track(keys, t, ease = eio) {
  if (t <= keys[0][0]) return { ...keys[0][1] };
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, A] = keys[i], [t1, B] = keys[i + 1];
    if (t <= t1) { const k = ease((t - t0) / Math.max(t1 - t0, 1e-6)), o = {}; for (const n in A) o[n] = lerp(A[n], B[n] ?? A[n], k); return o; }
  }
  return { ...keys[keys.length - 1][1] };
}
