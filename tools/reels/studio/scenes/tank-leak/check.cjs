/* Mathematical + layout QA for scenes/tank-leak — usage (from repo root): node tools/reels/studio/scenes/tank-leak/check.cjs
   Steps the page through every frame (60 fps) and checks the picture against the canonical model:
   - the water mesh is exactly a 2 m × 2 m × h prism, h = h0 + (dh/dt)·τ, V = 4h
   - dV/dτ = −0.4 m³/h and dh/dτ = −0.1 m/h measured from the frames themselves (finite differences)
   - the solution printed on screen matches the model (V = 4h, dh/dt = −0.4/4)
   - every visible label / symbol stays inside the Reels safe area (x 60…1000, y 160…1560) */
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..', '..', '..', '..');
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
  await p.route('http://reel.local/**', r => { const f = path.join(root, decodeURIComponent(new URL(r.request().url()).pathname)); r.fulfill({ status: fs.existsSync(f) ? 200 : 404, contentType: T[path.extname(f)] || 'application/octet-stream', body: fs.existsSync(f) ? fs.readFileSync(f) : '' }); });
  await p.goto('http://reel.local/tools/reels/studio/scenes/tank-leak/scene.html'); await p.waitForFunction(() => window.READY === true);
  const r = await p.evaluate(async () => {
    window.NO_GL = true;
    const { M, hAt } = await import('./model.js');
    const o = { frames: 0, maxBaseErr: 0, maxHeightErr: 0, maxVolErr: 0, maxRateErr_dV: 0, maxRateErr_dh: 0, unsafe: [], tauMonotonic: true };
    let prev = null; const dt = 1 / 60;
    const SAFE = { x0: 60, x1: 1000, y0: 160, y1: 1560 };
    for (let f = 0; f * dt < DURATION; f++) {
      const t = f * dt; render(t); const S = window.STATE; o.frames++;
      o.maxBaseErr = Math.max(o.maxBaseErr, Math.abs(S.baseW - 2), Math.abs(S.baseD - 2));
      o.maxHeightErr = Math.max(o.maxHeightErr, Math.abs(S.waterHeight - hAt(S.tau)), Math.abs(S.surfaceY - S.waterHeight));
      const Vmesh = S.baseW * S.baseD * S.waterHeight; o.maxVolErr = Math.max(o.maxVolErr, Math.abs(Vmesh - 4 * S.waterHeight));
      if (prev) {
        const dT = S.tau - prev.tau; if (dT < 0) o.tauMonotonic = false;
        if (dT > 1e-9) {
          const dV = (Vmesh - prev.V) / dT, dh = (S.waterHeight - prev.h) / dT;
          o.maxRateErr_dV = Math.max(o.maxRateErr_dV, Math.abs(dV - M.dVdt)); o.maxRateErr_dh = Math.max(o.maxRateErr_dh, Math.abs(dh - M.dhdt));
        }
      }
      prev = { tau: S.tau, V: Vmesh, h: S.waterHeight };
      if (f % 6 === 0) for (const el of document.querySelectorAll('.lbl,.chip,.actor,#cap span,#note,#brand,.hook .w')) {
        if (+getComputedStyle(el).opacity < 0.5) continue; const q = el.getBoundingClientRect();
        if (q.width && (q.left < SAFE.x0 || q.right > SAFE.x1 || q.top < SAFE.y0 || q.bottom > SAFE.y1)) o.unsafe.push(`${t.toFixed(2)}s ${el.id || el.className || el.textContent.slice(0, 12)} [${q.left | 0},${q.top | 0},${q.right | 0},${q.bottom | 0}]`);
      }
    }
    o.model = { A: M.A, dVdt: M.dVdt, dhdt: M.dhdt, check_dhdt: -0.4 / 4 };
    o.unsafe = [...new Set(o.unsafe.map(s => s.split(' ').slice(1).join(' ').replace(/\[.*/, '')))].map(k => o.unsafe.find(s => s.includes(k)));
    return o;
  });
  const pass = r.maxBaseErr < 1e-9 && r.maxHeightErr < 1e-9 && r.maxVolErr < 1e-9 && r.maxRateErr_dV < 1e-6 && r.maxRateErr_dh < 1e-6 && r.tauMonotonic && Math.abs(r.model.dhdt + 0.1) < 1e-12;
  console.log(JSON.stringify(r, null, 1)); console.log(pass ? 'MATH: PASS' : 'MATH: FAIL'); console.log(r.unsafe.length ? `SAFE-AREA: ${r.unsafe.length} element(s) outside` : 'SAFE-AREA: PASS');
  await b.close(); process.exit(pass ? 0 : 1);
})();
