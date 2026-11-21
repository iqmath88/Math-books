'use strict';
/* =====================================================================================
   محرك «ريلز السبورة» المشترك: السبورة، الطباشير، الكتابة التدريجية، الرياضيات المكتوبة باليد، الخطوط والدوائر.
   كل ريلز في ملف خاص (cone.js, ladder.js) يسجّل نفسه في window.REELS ويرسم بهذه الأدوات.
   كل رقم ومستوى في الرسوم محسوب من معادلات الكتاب؛ الرسم حتمي: الإطار عند الزمن t لا يعتمد إلا على t.
   ===================================================================================== */
const W=1080,H=1920, PI=Math.PI;
const cv=document.getElementById('c'), g=cv.getContext('2d');
const layer=document.createElement('canvas'); layer.width=W; layer.height=H; const L=layer.getContext('2d');
const WHITE='#f3f1ea', ORANGE='#f6a259', BLUE='#8fd3ff', DIM='rgba(243,241,234,.55)';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), ease=x=>{x=clamp(x);return x*x*(3-2*x)}, easeOut=x=>1-Math.pow(1-clamp(x),3);
const prog=(t,a,b)=>clamp((t-a)/(b-a));
/* fade in at a, out at b */
const vis=(t,a,b,fi=.45,fo=.45)=>Math.min(ease((t-a)/fi),1-ease((t-(b-fo))/fo));
function rng(seed){ let s=seed>>>0||1; return ()=>{ s^=s<<13; s^=s>>>17; s^=s<<5; return ((s>>>0)%100000)/100000; }; }

/* ---------- the board: slate gradient, smudges, dust, vignette (baked once) ---------- */
const board=document.createElement('canvas'); board.width=W; board.height=H;
(()=>{ const b=board.getContext('2d'), r=rng(7);
  const gr=b.createLinearGradient(0,0,W,H); gr.addColorStop(0,'#24302f'); gr.addColorStop(.5,'#1c2726'); gr.addColorStop(1,'#151d1d'); b.fillStyle=gr; b.fillRect(0,0,W,H);
  for(let i=0;i<70;i++){ const x=r()*W,y=r()*H,rad=80+r()*260; const s=b.createRadialGradient(x,y,0,x,y,rad); s.addColorStop(0,`rgba(220,230,225,${.018+r()*.03})`); s.addColorStop(1,'rgba(220,230,225,0)'); b.fillStyle=s; b.fillRect(x-rad,y-rad,2*rad,2*rad); }
  b.strokeStyle='rgba(230,235,230,.035)'; b.lineCap='round';
  for(let i=0;i<26;i++){ b.lineWidth=30+r()*60; b.beginPath(); const x=r()*W,y=r()*H,a=(r()-.5)*.6; b.moveTo(x,y); b.bezierCurveTo(x+200,y+a*200,x+400,y-a*120,x+520+r()*300,y+a*90); b.stroke(); }
  const id=b.getImageData(0,0,W,H), d=id.data; for(let i=0;i<d.length;i+=4){ const n=(r()-.5)*14; d[i]+=n; d[i+1]+=n; d[i+2]+=n; } b.putImageData(id,0,0);
  for(let i=0;i<2600;i++){ b.fillStyle=`rgba(235,235,225,${r()*.12})`; b.fillRect(r()*W,r()*H,1+r()*2,1+r()*2); }
  const v=b.createRadialGradient(W/2,H*.45,H*.25,W/2,H*.5,H*.75); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,.55)'); b.fillStyle=v; b.fillRect(0,0,W,H); })();
/* chalk grain: alpha 0.55–1 with tiny holes, applied to everything drawn in chalk */
const grain=document.createElement('canvas'); grain.width=W; grain.height=H;
(()=>{ const c=grain.getContext('2d'), id=c.createImageData(W,H), d=id.data, r=rng(99);
  for(let i=0;i<d.length;i+=4){ const v=r(); d[i]=d[i+1]=d[i+2]=255; d[i+3]=v<.06?40:150+Math.floor(r()*105); } c.putImageData(id,0,0); })();

/* ---------- chalk text ---------- */
const AR='Ruqaa', LT='Chalk';
function textW(s,font){ L.font=font; return L.measureText(s).width; }
/* write-on: the text appears from its start (right for Arabic, left for Latin) */
function write(s,x,y,size,o={}){ const p=o.p??1; if(p<=0) return; const ar=/[؀-ۿ]/.test(s), font=`${o.w||700} ${size}px ${ar?(o.f==='b'?'Body':AR)+", "+LT:LT}`;
  L.save(); L.font=font; L.textAlign='center'; L.textBaseline='alphabetic'; L.direction=ar?'rtl':'ltr'; const w=L.measureText(s).width; if(o.align==='end') x-=w/2; if(o.align==='start') x+=w/2;
  const x0=x-w/2-20, x1=x+w/2+20, cut=(x1-x0)*easeOut(p);
  L.beginPath(); if(ar) L.rect(x1-cut,y-size*1.4,cut,size*2.2); else L.rect(x0,y-size*1.4,cut,size*2.2); L.clip();
  L.globalAlpha=o.a??1; L.fillStyle=o.col||WHITE; if(o.glow){ L.shadowColor=o.col||WHITE; L.shadowBlur=o.glow; }
  L.fillText(s,x,y); L.restore();
  if(p<1&&p>0) tip(ar?x1-cut:x0+cut,y-size*.35,o.col||WHITE); return w; }
let TIPS=[]; function tip(x,y,col){ TIPS.push([x,y,col]); }

/* ---------- hand-written math: strings, fractions {f:[a,b]}, powers {s:[a,b]}, colour {c,e}; π ≈ ⇒ drawn by hand ---------- */
function mW(e,sz){ if(typeof e==='string'){ let w=0; for(const ch of e) w+= ch==='π'?sz*.62: ch==='≈'?sz*.7: ch==='⇒'?sz*.95: ch==='θ'?sz*.5: textW(ch,`700 ${sz}px ${LT}`); return w; }
  if(Array.isArray(e)) return e.reduce((a,x)=>a+mW(x,sz),0);
  if(e.f) return Math.max(mW(e.f[0],sz*.82),mW(e.f[1],sz*.82))+sz*.36;
  if(e.s) return mW(e.s[0],sz)+mW(e.s[1],sz*.6)+sz*.04;
  if(e.c) return mW(e.e,sz); if(e.sp) return sz*e.sp; return 0; }
function mDraw(e,x,y,sz,col){ if(typeof e==='string'){ for(const ch of e){ if(ch==='π'){ glyphPi(x,y,sz,col); x+=sz*.62; } else if(ch==='≈'){ glyphApprox(x,y,sz,col); x+=sz*.7; } else if(ch==='⇒'){ glyphImp(x,y,sz,col); x+=sz*.95; } else if(ch==='θ'){ glyphTheta(x,y,sz,col); x+=sz*.5; }
      else { L.font=`700 ${sz}px ${LT}`; L.fillStyle=col; L.textAlign='left'; L.direction='ltr'; L.fillText(ch,x,y); x+=textW(ch,L.font); } } return x; }
  if(Array.isArray(e)){ for(const it of e) x=mDraw(it,x,y,sz,col); return x; }
  if(e.f){ const s2=sz*.82, w=mW(e,sz), a=mW(e.f[0],s2), b=mW(e.f[1],s2), bar=y-sz*.3;
    mDraw(e.f[0],x+(w-a)/2,bar-sz*.14,s2,col); mDraw(e.f[1],x+(w-b)/2,bar+sz*.66,s2,col);
    L.strokeStyle=col; L.lineWidth=Math.max(3,sz*.055); L.lineCap='round'; L.beginPath(); L.moveTo(x+sz*.08,bar+1); L.quadraticCurveTo(x+w/2,bar-2,x+w-sz*.08,bar+1.5); L.stroke(); return x+w; }
  if(e.s){ x=mDraw(e.s[0],x,y,sz,col); return mDraw(e.s[1],x+sz*.02,y-sz*.42,sz*.6,col); }
  if(e.c) return mDraw(e.e,x,y,sz,e.c); if(e.sp) return x+sz*e.sp; return x; }
function glyphPi(x,y,sz,col){ L.strokeStyle=col; L.lineWidth=sz*.075; L.lineCap='round'; L.beginPath();
  L.moveTo(x+sz*.04,y-sz*.48); L.quadraticCurveTo(x+sz*.3,y-sz*.56,x+sz*.58,y-sz*.5);
  L.moveTo(x+sz*.2,y-sz*.5); L.quadraticCurveTo(x+sz*.2,y-sz*.18,x+sz*.1,y); L.moveTo(x+sz*.42,y-sz*.5); L.quadraticCurveTo(x+sz*.38,y-sz*.1,x+sz*.52,y-sz*.02); L.stroke(); }
function glyphTheta(x,y,sz,col){ L.strokeStyle=col; L.lineWidth=sz*.065; L.lineCap='round'; L.beginPath();
  L.ellipse(x+sz*.25,y-sz*.34,sz*.15,sz*.33,.08,0,2*PI); L.moveTo(x+sz*.12,y-sz*.36); L.lineTo(x+sz*.38,y-sz*.32); L.stroke(); }
function glyphApprox(x,y,sz,col){ L.strokeStyle=col; L.lineWidth=sz*.06; L.lineCap='round'; L.beginPath();
  for(const dy of [-.42,-.22]){ L.moveTo(x+sz*.08,y+sz*dy); L.bezierCurveTo(x+sz*.25,y+sz*(dy-.12),x+sz*.42,y+sz*(dy+.12),x+sz*.6,y+sz*dy); } L.stroke(); }
function glyphImp(x,y,sz,col){ L.strokeStyle=col; L.lineWidth=sz*.06; L.lineCap='round'; L.lineJoin='round'; L.beginPath();
  L.moveTo(x+sz*.1,y-sz*.42); L.lineTo(x+sz*.72,y-sz*.42); L.moveTo(x+sz*.1,y-sz*.22); L.lineTo(x+sz*.72,y-sz*.22); L.moveTo(x+sz*.55,y-sz*.58); L.lineTo(x+sz*.86,y-sz*.32); L.lineTo(x+sz*.55,y-sz*.06); L.stroke(); }
/* write-on for math: left to right */
function math(e,cx,y,sz,o={}){ const p=o.p??1; if(p<=0) return; { const w0=mW(e,sz); if(w0>o.max||w0>980) sz*=Math.min(o.max||980,980)/w0; } const w=mW(e,sz), x0=cx-w/2; L.save(); L.globalAlpha=o.a??1;
  const cut=(w+40)*easeOut(p); L.beginPath(); L.rect(x0-20,y-sz*1.6,cut,sz*2.8); L.clip(); if(o.glow){ L.shadowColor=o.col||WHITE; L.shadowBlur=o.glow; }
  mDraw(e,x0,y,sz,o.col||WHITE); L.restore(); if(p<1) tip(x0-20+cut,y-sz*.3,o.col||WHITE); return {x0,w}; }

/* ---------- chalk strokes ---------- */
function polyLen(P){ let s=0; for(let i=1;i<P.length;i++) s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]); return s; }
function stroke(P,p,col=WHITE,w=5,o={}){ if(p<=0||P.length<2) return; const tot=polyLen(P), want=tot*clamp(p); let acc=0;
  L.save(); L.strokeStyle=col; L.lineWidth=w; L.lineCap='round'; L.lineJoin='round'; L.globalAlpha=o.a??1; if(o.dash) L.setLineDash(o.dash); if(o.glow){ L.shadowColor=col; L.shadowBlur=o.glow; }
  L.beginPath(); L.moveTo(P[0][0],P[0][1]); let end=P[0];
  for(let i=1;i<P.length;i++){ const s=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]); if(acc+s>=want){ const k=(want-acc)/s; end=[P[i-1][0]+(P[i][0]-P[i-1][0])*k,P[i-1][1]+(P[i][1]-P[i-1][1])*k]; L.lineTo(end[0],end[1]); break; } L.lineTo(P[i][0],P[i][1]); acc+=s; end=P[i]; }
  L.stroke(); L.restore(); if(p<1) tip(end[0],end[1],col); }
const ellipseP=(cx,cy,rx,ry,a0=0,a1=2*PI,n=72)=>Array.from({length:n+1},(_,i)=>{ const a=a0+(a1-a0)*i/n; return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)]; });
function arrow(x1,y1,x2,y2,p,col,w=5){ if(p<=0) return; const e=easeOut(p), xe=x1+(x2-x1)*e, ye=y1+(y2-y1)*e; stroke([[x1,y1],[xe,ye]],1,col,w);
  if(p>.85){ const a=Math.atan2(y2-y1,x2-x1), h=22; stroke([[xe-h*Math.cos(a-.5),ye-h*Math.sin(a-.5)],[xe,ye],[xe-h*Math.cos(a+.5),ye-h*Math.sin(a+.5)]],1,col,w); } }
/* hand-drawn circle around an answer */
function ring(cx,cy,rx,ry,p,col=ORANGE,al=1){ const P=ellipseP(cx,cy,rx,ry,-2.2,-2.2+2*PI*1.08,90).map(([x,y],i)=>[x+Math.sin(i*.7)*2.5,y+Math.cos(i*.5)*2]); stroke(P,p,col,5,{glow:12,a:al}); }
window.REELS=window.REELS||{};
