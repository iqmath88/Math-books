/* NIBOR Mathematical Motion Engine (DOM + KaTeX).
   Every symbol is an "actor" — a separately typeset KaTeX element that keeps its identity (and colour) while it moves.
   Equations are just layouts of actors; a transition interpolates each actor between layouts, so
   "A" can split into "(2)(2)", the two 2s can travel from the 3D model into the formula, and (2)(2) can fuse into 4.
   Symbols are never stretched: only translate / uniform scale / opacity / glow. Math stays LTR inside RTL pages. */
import { lerp } from './tl.js';

export function createEq(root, { size = 112 } = {}) {
  const A = {};
  function actor(id, tex, { color = '#f6efe4', scale = 1 } = {}) {
    const d = document.createElement('div'); d.className = 'actor'; d.dir = 'ltr';
    Object.assign(d.style, { position: 'absolute', left: 0, top: 0, fontSize: size * scale + 'px', color, whiteSpace: 'nowrap', opacity: 0, willChange: 'transform', transformOrigin: '50% 50%' });
    katex.render(tex, d, { throwOnError: false }); root.appendChild(d);
    A[id] = { el: d, w: 0, h: 0 }; return A[id];
  }
  /* measure once fonts are ready (layout is static → deterministic) */
  function measure() { for (const id in A) { const r = A[id].el.getBoundingClientRect(); A[id].w = r.width; A[id].h = r.height; } }
  /* centre positions of a row of actors around (cx, cy); gap in px; per-id extra spacing via {id:px} */
  function layout(ids, cx, cy, gap = 26, kern = {}) {
    const W = ids.reduce((s, id) => s + A[id].w, 0) + gap * (ids.length - 1) + ids.reduce((s, id) => s + (kern[id] || 0), 0);
    let x = cx - W / 2; const out = {};
    for (const id of ids) { x += kern[id] || 0; out[id] = { x: x + A[id].w / 2, y: cy }; x += A[id].w + gap; }
    return out;
  }
  /* place an actor: centre (x, y), uniform scale s, opacity o, glow 0..1 (colour of the glow = its own colour) */
  function put(id, { x, y, s = 1, o = 1, glow = 0, blur = 0 }) {
    const a = A[id], e = a.el;
    e.style.opacity = o; e.style.transform = `translate(${x - a.w / 2}px,${y - a.h / 2}px) scale(${s})`;
    e.style.filter = (glow > 0.01 ? `drop-shadow(0 0 ${8 + 26 * glow}px currentColor)` : '') + (blur > .05 ? ` blur(${blur}px)` : '') || 'none';
  }
  const mix = (P, Q, k) => ({ x: lerp(P.x, Q.x, k), y: lerp(P.y, Q.y, k) });
  /* arc path between two points (objects fly on a gentle curve, not a straight line) */
  const arc = (P, Q, k, lift = 120) => ({ x: lerp(P.x, Q.x, k), y: lerp(P.y, Q.y, k) - Math.sin(Math.PI * k) * lift });
  return { A, actor, measure, layout, put, mix, arc };
}
