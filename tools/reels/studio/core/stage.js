/* NIBOR 3D stage — renderer, studio lighting, image-based reflections, shadowed floor, depth particles,
   a spherical camera rig and 3D→screen anchoring for HTML labels. Reusable by every scene. */
import * as THREE from 'three';
import { rng, track } from './tl.js';

export const PAL = { navy: 0x06122b, blue: 0x3d9bff, cyan: 0x2ee6d6, gold: 0xd8b25a, white: 0xf6efe4 };
export const CSS = { navy: '#06122b', blue: '#3d9bff', cyan: '#2ee6d6', gold: '#d8b25a', white: '#f6efe4' };

export function createStage(canvas, W = 1080, H = 1920) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 400);

  /* image-based lighting: a procedural studio (soft boxes + cool rim) baked to a PMREM env map → controlled reflections */
  const studio = new THREE.Scene(); studio.background = new THREE.Color(0x0a1530);
  const box = (c, i, p, s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(...s), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); studio.add(m); };
  box(0xffffff, 5, [6, 9, 6], [8, 5]); box(0x9fd0ff, 2.5, [-9, 4, -3], [4, 10]); box(0x2ee6d6, 1.6, [0, 2, -10], [14, 3]); box(0xffe2b0, 1.5, [-4, -6, 8], [10, 2]);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(studio, 0.03).texture; scene.environmentIntensity = 0.9;

  /* soft studio key (shadows), fill, cyan rim */
  scene.add(new THREE.HemisphereLight(0x9fc4ff, 0x060c1c, 0.45));
  const key = new THREE.DirectionalLight(0xfff3e2, 2.3); key.position.set(5, 11, 7); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 }); scene.add(key);
  const rim = new THREE.DirectionalLight(0x2ee6d6, 1.4); rim.position.set(-7, 5, -8); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x6f8fff, 0.5); fill.position.set(-6, 3, 6); scene.add(fill);

  /* floor: dark satin with a fine measuring grid that fades with distance (depth without clutter) */
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d');
  const rad = g.createRadialGradient(512, 512, 40, 512, 512, 512); rad.addColorStop(0, 'rgba(255,255,255,1)'); rad.addColorStop(.7, 'rgba(255,255,255,.35)'); rad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = '#0b1834'; g.fillRect(0, 0, 1024, 1024);
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i <= 32; i++) { const p = i * 32, major = i % 4 === 0; g.strokeStyle = major ? 'rgba(46,230,214,.22)' : 'rgba(120,170,255,.08)'; g.lineWidth = major ? 2 : 1; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 1024); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(1024, p); g.stroke(); }
  g.globalCompositeOperation = 'destination-in'; g.fillStyle = rad; g.fillRect(0, 0, 1024, 1024);
  const ft = new THREE.CanvasTexture(c); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 8;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshLambertMaterial({ map: ft, transparent: true })   /* Lambert: the floor fills half the frame; PBR here cost ~0.4 s/frame in software GL */);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  /* depth particles: seeded, drifting slowly; parallax comes from the real camera move */
  const R = rng(7), N = 260, pos = new Float32Array(N * 3), seed = [];
  for (let i = 0; i < N; i++) { const p = [(R() - .5) * 26, R() * 12 - 1, (R() - .5) * 26 - 4]; seed.push([...p, R() * 6.28, .2 + R() * .5]); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = document.createElement('canvas'); dot.width = dot.height = 64; const dg = dot.getContext('2d'), gr = dg.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(160,220,255,.5)'); gr.addColorStop(1, 'rgba(160,220,255,0)'); dg.fillStyle = gr; dg.fillRect(0, 0, 64, 64);
  const parts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.09, map: new THREE.CanvasTexture(dot), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, color: 0x9fd8ff }));
  scene.add(parts);
  const drift = t => { for (let i = 0; i < N; i++) { const s = seed[i]; pos[i * 3] = s[0] + Math.sin(t * .11 * s[4] + s[3]) * .5; pos[i * 3 + 1] = s[1] + ((t * .05 * s[4]) % 1) * .8 + Math.sin(t * .2 + s[3]) * .15; pos[i * 3 + 2] = s[2] + Math.cos(t * .09 * s[4] + s[3]) * .5; } pg.attributes.position.needsUpdate = true; };

  /* volumetric key shaft (limited haze): additive cone from above, very faint */
  const shaft = new THREE.Mesh(new THREE.ConeGeometry(4.2, 12, 48, 1, true), new THREE.MeshBasicMaterial({ color: 0x7fb8ff, transparent: true, opacity: 0.035, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  shaft.position.set(1.2, 6, -1.5); shaft.rotation.z = 0.25; shaft.visible = false; scene.add(shaft);   /* off by default: in 9:16 it read as a flat disc */

  /* camera rig: keys = [[t, {r, el, az, tx, ty, tz, fov, sy}]]  el/az in degrees, sy = vertical framing shift (−1..1 of frame) */
  const tgt = new THREE.Vector3();
  function rig(keys, t) {
    const k = track(keys, t), el = k.el * Math.PI / 180, az = k.az * Math.PI / 180;
    tgt.set(k.tx || 0, k.ty || 0, k.tz || 0);
    cam.position.set(tgt.x + k.r * Math.cos(el) * Math.sin(az), tgt.y + k.r * Math.sin(el), tgt.z + k.r * Math.cos(el) * Math.cos(az));
    cam.fov = k.fov || 30; cam.lookAt(tgt);
    if (k.sy) cam.setViewOffset(W, H, 0, k.sy * H / 2, W, H); else cam.clearViewOffset();
    cam.updateProjectionMatrix(); cam.updateMatrixWorld(true); return k;   /* labels are projected before render(): matrices must be current */
  }
  const v = new THREE.Vector3();
  const project = p => { v.set(p.x, p.y, p.z).project(cam); return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, z: v.z }; };
  const render = () => { if (!window.NO_GL) renderer.render(scene, cam); };   /* NO_GL: math QA steps frames without rasterising */
  return { THREE, renderer, scene, cam, key, rim, floor, parts, shaft, drift, rig, project, render };
}

/* 3D helpers */
export function tube(THREE, col, r = 0.02, op = 1) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, toneMapped: false })); return m; }
export function setTube(THREE, m, a, b) { const d = new THREE.Vector3().subVectors(b, a), L = Math.max(d.length(), 1e-4); m.scale.set(1, L, 1); m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }
