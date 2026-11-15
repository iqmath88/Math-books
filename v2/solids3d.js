/* Math-books v1.29.0 — lightweight mathematical 3D solids.
   A pure Canvas 2D renderer of projected three-dimensional mesh geometry.
   No network/CDN/GPU dependency. Existing SVG lesson view remains the fallback. */
(()=>{'use strict';
const B=window.BOOK;
if(!B||B.id!=='g12c3'||!B.S)return;
const box=document.getElementById('box'), svg=document.getElementById('svg'), slider=document.getElementById('slI');
if(!box||!svg||!slider)return;
const scenes={rCone:{type:'cone'},rTank:{type:'tank'},rTankB:{type:'tank'},rTankB2:{type:'tank'}};
let current=null, sceneValue=0, yaw=-.57,elev=.38, mode3d=true, raf=0, dragging=null;
const style=document.createElement('style');
style.textContent=`#solid3d{position:absolute;inset:0;width:100%;height:100%;display:none;touch-action:pan-y;cursor:grab;z-index:1}#solid3d.active{display:block;visibility:visible}#solid3d:active{cursor:grabbing}#solidControls{display:none;gap:7px;align-items:center;flex-wrap:wrap;padding:7px 9px;border:1px solid var(--line);border-radius:10px;margin:6px 0;background:var(--surface2,#f7f8fa);color:var(--ink);font-size:12px}#solidControls.active{display:flex}#solidControls button{font:inherit;min-height:34px;border-radius:8px;border:1px solid var(--line);padding:5px 9px;background:var(--surface,#fff);color:var(--ink);cursor:pointer}#solidControls button[aria-pressed="true"]{background:#235b86;color:white}#solidDetails{flex-basis:100%;font-size:12px;line-height:1.7;color:var(--ink2,var(--ink))}#solidControls button:focus-visible{outline:2px solid #3477c1;outline-offset:2px}@media(prefers-reduced-motion:reduce){#solid3d{scroll-behavior:auto}}`;
document.head.append(style);
const canvas=document.createElement('canvas');canvas.id='solid3d';canvas.setAttribute('aria-label','مجسم تفاعلي يمكن تدويره بالسحب');canvas.setAttribute('role','img');
box.append(canvas);
const control=document.createElement('div');control.id='solidControls';control.innerHTML='<button type="button" id="solid3dMode" aria-pressed="true">◈ مجسم 3D</button><button type="button" id="solid2dMode" aria-pressed="false">▤ الرسم الأصلي 2D</button><button type="button" id="solidReset">↺ إعادة زاوية الرؤية</button><span id="solidInfo">اسحب المجسم لتدويره</span><div id="solidDetails" aria-live="off"></div>';
box.after(control);
const $=id=>document.getElementById(id), ctx=canvas.getContext('2d',{alpha:true});
if(!ctx)return;
function choose(m){mode3d=m;$('solid3dMode').setAttribute('aria-pressed',String(m));$('solid2dMode').setAttribute('aria-pressed',String(!m));updateVisibility();}
$('solid3dMode').addEventListener('click',()=>choose(true));$('solid2dMode').addEventListener('click',()=>choose(false));
$('solidReset').addEventListener('click',()=>{yaw=-.57;elev=.38;draw();});
function updateVisibility(){const on=!!current;control.classList.toggle('active',on);canvas.classList.toggle('active',on&&mode3d);svg.style.opacity=on&&mode3d?'0':''; if(on&&mode3d)draw();}
const f=(v,d=2)=>Number.isFinite(v)?v.toFixed(d).replace(/\.?0+$/,''):'—';
function geometry(type,val){const a=current?.scene?.tk?.a||2;
 if(type==='cone'){const h=Math.max(.1,Math.min(24,val)),r=h/3;return {kind:'cone',h,r,volume:Math.PI*h**3/27,dh:36/(Math.PI*h*h),unit:'cm',height:24,radius:8};}
 const h=Math.max(.05,Math.min(3,val)),q=current?.scene?.tk?.r??.4;return {kind:'tank',h,a,q,volume:a*a*h,dh:-q/(a*a),unit:'m',height:3};}
function renderText(G){if(G.kind==='cone'){
  $('solidDetails').textContent=`مخروط: h = ${f(G.h)} cm ، r = h/3 = ${f(G.r)} cm ، V = πh³/27 = ${f(G.volume)} cm³ ، dh/dt = 36/(πh²) = ${f(G.dh,4)} cm/s`;
  $('solidInfo').textContent='اسحب للدوران · حرّك منزلق ارتفاع الماء';
 }else{
  $('solidDetails').textContent=`خزان: ضلع القاعدة ${f(G.a)} m ، h = ${f(G.h)} m ، V = ${f(G.volume)} m³ ، dV/dt = −${f(G.q)} m³/h ، dh/dt = ${f(G.dh,3)} m/h`;
  $('solidInfo').textContent='اسحب للدوران · حرّك منزلق مستوى الماء';
 }}
function paint(){if(!current||!mode3d)return;
 const rect=box.getBoundingClientRect(),w=Math.max(1,Math.floor(rect.width)),h=Math.max(1,Math.floor(rect.height));if(w<30||h<30)return;
 const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const G=geometry(current.type,sceneValue);renderText(G);
 // Orthographic camera projection of true (x,y,z) mesh coordinates.
 const sc=Math.min(w/(G.kind==='cone'?24:8),h/(G.kind==='cone'?32:8))*.8;
 const cy=Math.cos(yaw),sy=Math.sin(yaw),ce=Math.cos(elev),se=Math.sin(elev);
 const centerY=G.kind==='cone'?12:1.5;
 const pr=p=>{const [x,y,z]=p;const dx=x*cy-z*sy,dz=x*sy+z*cy;return [w/2+dx*sc,h/2+(-(y-centerY)*ce+dz*se)*sc,dz*ce+(y-centerY)*se]};
 const faces=[];
 function face(pts,fill,stroke='#496779',width=1){const v=pts.map(pr);faces.push({v,dep:v.reduce((s,p)=>s+p[2],0)/v.length,fill,stroke,width});}
 function circle(radius,y,count=48){return Array.from({length:count},(_,i)=>[radius*Math.cos(2*Math.PI*i/count),y,radius*Math.sin(2*Math.PI*i/count)]);}
 const n=48;
 if(G.kind==='cone'){
  const top=circle(8,24,n),water=circle(G.r,G.h,n),tip=[0,0,0];
  for(let i=0;i<n;i++){const j=(i+1)%n;face([tip,water[i],water[j]],'rgba(33,158,211,.30)','rgba(24,119,167,.12)',.3);}
  face(water,'rgba(73,188,230,.68)','rgba(20,116,176,.7)',1.8);
  for(let i=0;i<n;i++){const j=(i+1)%n;face([tip,top[i],top[j]],'rgba(125,169,193,.085)','rgba(69,116,144,.13)',.35);}
 }else{
  const a=G.a/2, corners=y=>[[-a,y,-a],[a,y,-a],[a,y,a],[-a,y,a]];
  const b=corners(0),water=corners(G.h),top=corners(3);
  face(b,'rgba(155,190,205,.12)');
  for(let i=0;i<4;i++){let j=(i+1)%4;face([b[i],b[j],water[j],water[i]],'rgba(29,154,219,.34)','rgba(34,125,180,.4)');}
  face(water,'rgba(83,201,236,.58)','rgba(21,115,165,.9)',1.6);
  for(let i=0;i<4;i++){let j=(i+1)%4;face([b[i],b[j],top[j],top[i]],'rgba(170,199,214,.09)','rgba(62,104,123,.3)',.65);}
 }
 faces.sort((a,b)=>a.dep-b.dep);
 for(const item of faces){ctx.beginPath();item.v.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=item.fill;ctx.fill();ctx.strokeStyle=item.stroke;ctx.lineWidth=item.width;ctx.stroke();}
 // Draw important geometry edges as clear 3D wires.
 const line=(a,b,col='#31566b',width=2,dash=[])=>{const p=pr(a),q=pr(b);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.setLineDash(dash);ctx.strokeStyle=col;ctx.lineWidth=width;ctx.stroke();ctx.setLineDash([]);};
 if(G.kind==='cone'){
  const top=circle(8,24,n),tip=[0,0,0];for(const i of [0,12,24,36])line(tip,top[i],'rgba(49,85,110,.7)',1.3);
  const ring=circle(8,24,n),ringWater=circle(G.r,G.h,n);
  for(let i=0;i<n;i++){line(ring[i],ring[(i+1)%n],'rgba(30,80,112,.8)',1.2);line(ringWater[i],ringWater[(i+1)%n],'rgba(23,120,184,.8)',1.5);}
  line([0,0,0],[0,G.h,0],'#e09235',2,[5,4]);
 }else{
  const a=G.a/2,b=[[-a,0,-a],[a,0,-a],[a,0,a],[-a,0,a]],t=b.map(p=>[p[0],3,p[2]]);
  for(let i=0;i<4;i++){line(b[i],b[(i+1)%4],'rgba(42,92,119,.75)',1.5);line(t[i],t[(i+1)%4],'rgba(42,92,119,.75)',1.5);line(b[i],t[i],'rgba(42,92,119,.65)',1.5);}
  line([0,0,0],[0,G.h,0],'#e09235',2,[5,4]);
 }
 ctx.fillStyle='#35536b';ctx.font='600 13px system-ui';ctx.textAlign='center';ctx.fillText(G.kind==='cone'?'مخروط ثلاثي الأبعاد — ارتفاع 24 cm':'خزان ثلاثي الأبعاد — قاعدة مربعة',w/2,Math.min(25,h*.09));
 const pos=pr([0,G.h,0]);ctx.fillStyle='#0d729f';ctx.font='bold 13px system-ui';ctx.fillText('h = '+f(G.h)+' '+G.unit,Math.max(60,Math.min(w-60,pos[0]+42)),Math.max(42,Math.min(h-22,pos[1]-20)));
}
function draw(){if(raf)cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{raf=0;paint();});}
// Explicit event bridge from the V2 rendering engine; independent of scene function wrapping.
let lastScene='';
document.addEventListener('mathbooks:scene-update',e=>{
 const name=e.detail?.name||'', value=Number(e.detail?.value);
 const info=scenes[name];
 if(!info){if(current){current=null;lastScene='';updateVisibility();}return;}
 if(!current||lastScene!==name){current={name,type:info.type,scene:B.S[name]};lastScene=name;mode3d=true;updateVisibility();}
 sceneValue=Number.isFinite(value)?value:Number(slider.value);
 draw();
});
// Sync the scene already selected before this enhancement script was loaded.
const bootScene=window.MathBooksSceneState?.();
if(bootScene?.name)document.dispatchEvent(new CustomEvent('mathbooks:scene-update',{detail:bootScene}));
// Touch drag and mouse orbit, keeping the existing slider as the sole source of simulation state.
canvas.addEventListener('pointerdown',e=>{if(!current)return;dragging={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!dragging||dragging.id!==e.pointerId)return;const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;if(Math.abs(dx)+Math.abs(dy)>0){yaw+=dx*.009;elev=Math.max(.12,Math.min(1.2,elev+dy*.007));dragging.x=e.clientX;dragging.y=e.clientY;draw();}});
const stop=e=>{if(dragging&&e.pointerId===dragging.id)dragging=null;};canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
slider.addEventListener('input',()=>{if(current){sceneValue=Number(slider.value);draw();}});
if(window.ResizeObserver)new ResizeObserver(draw).observe(box);
window.addEventListener("resize",draw);
})();
