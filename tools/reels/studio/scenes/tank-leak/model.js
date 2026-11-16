/* Canonical model — book example 1, p. 92 (G12 math, ch. 3, lesson 3−1, idea 1 «قانون شكل هندسي»).
   Book data:   square base, side 2 m (constant); leak dV/dt = −0.4 m³/h; asked: dh/dt "at any time t".
   Relation:    V = A·h = (2)(2)h = 4h            (prism volume = base area × height)
   Derivative:  dV/dt = 4 dh/dt  ⇒  dh/dt = −0.4/4 = −0.1 m/h   (constant: independent of t and of h)
   Book erratum: the book prints the unit as m/s; it is m/h because the leak is given per hour.
   VISUAL ASSUMPTIONS (not in the book, never shown as data): tank height 2.2 m, initial water depth 1.85 m.
   Story time τ (hours) runs on a labelled clock; the water depth on screen is ALWAYS h(τ) = h0 + (dh/dt)·τ. */
export const M = {
  side: 2, A: 4, dVdt: -0.4, dhdt: -0.4 / 4,
  H: 2.2, h0: 1.85,
};
/* video time t (s) → story time τ (h). Piecewise-constant time-lapse (×1800 then ×720): the clock on screen shows τ. */
export const LAPSE = [[0, 0.5], [9.5, 0.2]];
export function tau(t) {
  let T = 0;
  for (let i = 0; i < LAPSE.length; i++) {
    const [a, k] = LAPSE[i], b = i + 1 < LAPSE.length ? LAPSE[i + 1][0] : Infinity;
    if (t <= a) break; T += (Math.min(t, b) - a) * k;
  }
  return T;
}
export const hAt = T => M.h0 + M.dhdt * T;      // m
export const VAt = T => M.A * hAt(T);            // m³
