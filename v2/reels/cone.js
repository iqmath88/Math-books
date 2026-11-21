/* ريلز: مثال 5 ص 95 — المرشح المخروطي — مسجّل في REELS.cone */
window.REELS.cone=function(){
const D=65.4;
/* ---------- the cone (book figure): apex at the bottom, height 24, diameter 16 ---------- */
const CX=540, APY=1060, S=20.5;                  // 1 cm = 20.5 px
const yAt=h=>APY-h*S, rAt=h=>h/3*S;               // r = h/3 (book)
const TOPY=yAt(24), TOPR=rAt(24);
function cone(p,o={}){ const a=o.a??1;
  stroke([[CX-TOPR,TOPY],[CX,APY],[CX+TOPR,TOPY]],p,WHITE,6,{a});
  stroke(ellipseP(CX,TOPY,TOPR,TOPR*.17),clamp((p-.35)/.65),WHITE,5,{a}); }
function liquid(h,a=1){ if(h<=0) return; const y=yAt(h), r=rAt(h);
  L.save(); L.globalAlpha=a; L.beginPath(); L.moveTo(CX,APY); L.lineTo(CX-r,y); L.ellipse(CX,y,r,r*.17,0,PI,0,true); L.lineTo(CX,APY); L.closePath();
  L.fillStyle='rgba(143,211,255,.22)'; L.fill(); L.clip();
  L.strokeStyle='rgba(143,211,255,.35)'; L.lineWidth=3; for(let k=-30;k<30;k++){ L.beginPath(); L.moveTo(CX-260+k*18,APY+40); L.lineTo(CX-260+k*18+300,APY-260); L.stroke(); }
  L.restore(); stroke(ellipseP(CX,y,r,r*.17),1,BLUE,4,{a,dash:[14,10]}); }
function drops(t,a=1){ for(let k=0;k<3;k++){ const ph=((t*1.1+k/3)%1), y=APY+18+ph*120; L.save(); L.globalAlpha=a*(1-ph*.8); L.fillStyle=BLUE; L.beginPath(); L.ellipse(CX,y,7,10,0,0,2*PI); L.fill(); L.restore(); } }
function pour(t,a=1){ L.save(); L.globalAlpha=a*.7; L.strokeStyle=BLUE; L.lineWidth=7; L.setLineDash([22,16]); L.lineDashOffset=-t*160; L.beginPath(); L.moveTo(CX+70,TOPY-170); L.quadraticCurveTo(CX+60,TOPY-60,CX+40,TOPY+40); L.stroke(); L.restore(); }

/* ---------- scenes ---------- */
const SC=[[0,4.6],[4.6,11.2],[11.2,17.4],[17.4,34.0],[34.0,48.5],[48.5,65.4]];
const IN=(t,i)=>t>=SC[i][0]-.5&&t<SC[i][1]+.5;
function title(s,t,i,col=WHITE){ const [a,b]=SC[i]; write(s,540,282,74,{p:prog(t,a+.1,a+1.1),a:vis(t,a,b),col}); }
function warn(s,t,a,b,y){ const v=vis(t,a,b,.3,.4); if(v<=0) return; const w=textW(s,`700 50px ${AR}`)+70;
  L.save(); L.globalAlpha=v; L.strokeStyle=ORANGE; L.lineWidth=4; L.setLineDash([]); L.shadowColor=ORANGE; L.shadowBlur=14;
  const P=[[540-w/2,y-52],[540+w/2,y-55],[540+w/2+4,y+20],[540-w/2-3,y+22],[540-w/2,y-52]]; L.restore(); stroke(P,prog(t,a,a+.6),ORANGE,4,{a:v,glow:10});
  write(s,540,y,50,{p:prog(t,a+.15,a+.9),a:v,col:ORANGE}); }

/* derivation steps: each step is written, then moves up (dimmed) when the next one comes */
function steps(t,list,y1,y2,sz,a=1){ let k=-1; list.forEach((st,i)=>{ if(t>=st.at) k=i; }); if(k<0) return;
  const pk=ease((t-list[k].at)/.45);
  for(let i=Math.max(0,k-2);i<=k;i++){ const age=k-i, st=list[i]; let y,al,p=1;
    if(age===0){ y=y2; al=1; p=prog(t,st.at,st.at+(st.d||1)); }
    else if(age===1){ y=y2+(y1-y2)*pk; al=1-.45*pk; }
    else { y=y1-110*pk; al=.55*(1-pk); }
    if(al>0) math(st.e,540,y,sz*(age?1-.12*Math.min(1,age===1?pk:1):1),{p,a:a*al,col:st.col,glow:st.col?8:0}); }
  return {k,y2}; }
/* paradox scene: h(τ) from the real law dh/dt = 36/(πh²), time sped up by K */
const S6=48.5, H0=12, H1=20, PT0=S6+1.6, PT1=S6+8.6, TPHYS=PI*(H1**3-H0**3)/108, K=TPHYS/(PT1-PT0);
const hParadox=t=>Math.cbrt(H0**3+108/PI*K*clamp(t-PT0,0,PT1-PT0));

function frame(t,extra){
  g.clearRect(0,0,W,H); g.drawImage(board,0,0); L.clearRect(0,0,W,H); TIPS=[];
  /* small tag */
  write('الأستاذ فائز الحمداني',540,128,48,{p:1,a:.95*vis(t,-1,D,.4,.6),col:'#f3e6c8'});
  write('مثال 5 · ص 95 · السادس العلمي',540,190,38,{p:1,a:.8*vis(t,-1,D,.4,.6),col:DIM,w:400});

  /* ---- 1: the question ---- */
  if(IN(t,0)){ const v=vis(t,-1,4.6,.3,.5);
    write('يُصبّ 5 ويتسرّب 1…',540,300,72,{a:v});
    write('بأي سرعة يرتفع السائل؟',540,402,80,{a:v,col:ORANGE,glow:10+8*Math.sin(t*3)**2});
  }

  /* cone stays from scene 2 on */
  cone(1);
  { /* hook: fills fast (sped up); then eases to the book's level h = 12; the paradox runs the real law */
    const hook=Math.cbrt(4**3+(12**3-4**3)*clamp(t/4.2));      /* fills from 4 cm to the book's 12 cm (sped up) */
    const hNow=t<PT0? hook : hParadox(t);
    const SNAP0=SC[1][0]+.8, snap=t>=SNAP0&&t<PT0, ta=snap?SNAP0:t;   /* the moment h = 12: the clock stops while we solve */
    liquid(hNow,1); pour(ta,1); drops(ta,1);
    const sv=vis(t,SNAP0,PT0,.4,.4); if(sv>0){ write('لحظة \u2066h = 12 cm\u2069',CX+rAt(12)+30,yAt(12)+14,44,{a:.9*sv,col:BLUE,f:'b',align:'start'}); } }

  /* ---- 2: givens ---- */
  if(IN(t,1)){ const [s,e]=SC[1], v=vis(t,s,e);
    title('المعطيات',t,1);
    stroke([[CX-TOPR,TOPY-58],[CX+TOPR,TOPY-58]],prog(t,s+.8,s+1.5),WHITE,4,{a:v}); stroke([[CX-TOPR,TOPY-72],[CX-TOPR,TOPY-44]],prog(t,s+.8,s+1),WHITE,4,{a:v}); stroke([[CX+TOPR,TOPY-72],[CX+TOPR,TOPY-44]],prog(t,s+1.3,s+1.5),WHITE,4,{a:v});
    math('16',CX,TOPY-78,54,{p:prog(t,s+1.2,s+1.8),a:v});
    stroke([[CX-TOPR-70,TOPY],[CX-TOPR-90,TOPY],[CX-TOPR-90,APY],[CX-TOPR-70,APY]],prog(t,s+1.4,s+2.3),WHITE,4,{a:v});
    math('24',CX-TOPR-128,(TOPY+APY)/2+16,54,{p:prog(t,s+2,s+2.6),a:v});
    math(['5 cm',{s:['','3']},'/s'],CX+235,TOPY-175,46,{p:prog(t,s+2.4,s+3.2),a:v,col:BLUE});
    math(['1 cm',{s:['','3']},'/s'],CX+130,APY+120,46,{p:prog(t,s+2.9,s+3.6),a:v,col:BLUE});
    math('h = 12 cm',540,1330,72,{p:prog(t,s+3.2,s+3.8),a:v,col:ORANGE,glow:6});
    write('المطلوب: معدل تغيّر العمق',540,1440,56,{p:prog(t,s+3.6,s+4.3),a:v,f:'b'});
  }

  /* ---- 3: net rate ---- */
  if(IN(t,2)){ const [s,e]=SC[2], v=vis(t,s,e);
    title('المعدل الصافي',t,2);
    math([{f:['dV','dt']},' = 5 − 1'],540,1270,96,{p:prog(t,s+.6,s+1.6),a:v});
    math(['= ',{c:ORANGE,e:['4 cm',{s:['','3']},'/s']}],540,1405,96,{p:prog(t,s+1.7,s+2.4),a:v,glow:6});
    warn('انتبه! السائل يتسرّب أيضاً',t,s+2.6,e,1555);
  }

  /* ---- 4: similar triangles, one pair of sides at a time ---- */
  if(IN(t,3)){ const [s,e]=SC[3], v=vis(t,s,e), h=12, yh=yAt(h), rh=rAt(h);
    title('تشابه المثلثين',t,3);
    stroke([[CX,APY],[CX,TOPY],[CX+TOPR,TOPY],[CX,APY]],prog(t,s+.6,s+1.8),ORANGE,6,{a:v,glow:12});
    stroke([[CX,APY],[CX,yh],[CX+rh,yh],[CX,APY]],prog(t,s+1.8,s+2.8),BLUE,6,{a:v,glow:10});
    /* pair 1: radii 8 ↔ r ; pair 2: heights 24 ↔ h (thick glowing chalk, then a link) */
    const p1=vis(t,s+3,s+5.9,.3,.4), p2=vis(t,s+4.4,s+5.9,.3,.4), pulse=.6+.4*Math.sin(t*6)**2;
    if(p1>0){ stroke([[CX,TOPY],[CX+TOPR,TOPY]],1,ORANGE,14,{a:v*p1*pulse,glow:24}); stroke([[CX,yh],[CX+rh,yh]],1,BLUE,14,{a:v*p1*pulse,glow:24});
      arrow(CX+TOPR+26,TOPY+14,CX+rh+30,yh-10,prog(t,s+3.3,s+3.9),WHITE,4); }
    if(p2>0){ stroke([[CX-12,TOPY],[CX-12,APY]],1,ORANGE,12,{a:v*p2*pulse,glow:22}); stroke([[CX+12,yh],[CX+12,APY]],1,BLUE,12,{a:v*p2*pulse,glow:22}); }
    math('8',CX+TOPR/2,TOPY-40,58,{p:prog(t,s+3,s+3.4),a:v,col:ORANGE,glow:6});
    math('24',CX-64,(TOPY+yh)/2+14,58,{p:prog(t,s+4.4,s+4.8),a:v,col:ORANGE,glow:6});
    math('r',CX+rh/2,yh-14,58,{p:prog(t,s+3.2,s+3.6),a:v,col:BLUE,glow:6}); math('h',CX-44,(yh+APY)/2+18,58,{p:prog(t,s+4.6,s+5),a:v,col:BLUE,glow:6});
    steps(t,[{e:[{f:['r','h']},' = ',{f:['8','24']}],at:s+6.1},
             {e:['r = ',{f:['h','3']}],at:s+7.6,col:ORANGE},
             {e:['V = ',{f:['1','3']},'π',{s:['r','2']},'h'],at:s+9.1},
             {e:['V = ',{f:['1','3']},'π',{s:[['(',{f:['h','3']},')'],'2']},'h'],at:s+10.6,d:1.3},
             {e:['V = ',{f:['π','27']},{s:['h','3']}],at:s+12.2,col:ORANGE}],1225,1385,86,v);
    { const a0=s+13.4, vv=vis(t,a0,e,.3,.4); if(vv>0){ const x0=110,x1=970,y0=1478,y1=1638;
      stroke([[x0,y0],[x1,y0-3],[x1+4,y1],[x0-3,y1+2],[x0,y0]],prog(t,a0,a0+.6),ORANGE,4,{a:vv,glow:10});
      write('عوّض العلاقة ⁦r = h/3⁩ قبل الاشتقاق',540,y0+64,50,{p:prog(t,a0+.15,a0+.9),a:vv,col:ORANGE,f:'b'});
      write('أما الأرقام فبعد الاشتقاق',540,y0+132,46,{p:prog(t,a0+1.1,a0+1.8),a:vv,f:'b'}); } }
  }

  /* ---- 5: differentiate, then substitute — one operation per step ---- */
  if(IN(t,4)){ const [s,e]=SC[4], v=vis(t,s,e);
    title('الاشتقاق والتعويض',t,4);
    const d=[{f:['dh','dt']}];
    const r=steps(t,[{e:['V = ',{f:['π','27']},{s:['h','3']}],at:s+.5},
             {e:[{f:['dV','dt']},' = ',{f:['π','27']},'·3',{s:['h','2']},'·',...d],at:s+2,d:1.2},
             {e:[{f:['dV','dt']},' = ',{f:['π','9']},{s:['h','2']},'·',...d],at:s+3.7},
             {e:[{c:ORANGE,e:['4']},' = ',{f:['π','9']},{s:[['(',{c:ORANGE,e:['12']},')'],'2']},'·',...d],at:s+5.3,d:1.2},
             {e:['4 = 16π·',...d],at:s+7},
             {e:[...d,' = ',{f:['4','16π']},' = ',{f:['1','4π']}],at:s+8.6,d:1.2},
             {e:[...d,' ≈ 0.08 cm/s'],at:s+10.3,col:ORANGE}],1235,1405,88,v);
    if(r&&r.k===6){ const w=mW([{f:['dh','dt']},' ≈ 0.08 cm/s'],88); ring(540,1385,Math.min(500,w/2+46),92,prog(t,s+11.2,s+12.1),ORANGE,v); }
    write('موجب: العمق يزداد',540,1560,52,{p:prog(t,s+12.2,s+12.9),a:v*.95,col:DIM,f:'b'});
    const lab=[[s+3.7,'تبسيط: ⁦π/27 · 3 = π/9⁩'],[s+5.3,'نعوّض: ⁦dV/dt = 4 , h = 12⁩'],[s+7,'⁦(π/9)·144 = 16π⁩']];
    for(const [a0,txt] of lab){ const lv=vis(t,a0,a0+1.6,.25,.3); if(lv>0) write(txt,540,1550,52,{a:v*lv,col:'#cfd8d2',f:'b'}); }
  }

  /* ---- 6: the paradox: volume grows steadily, height slows ---- */
  if(IN(t,5)){ const [s,e]=SC[5], v=vis(t,s,e,.45,.01), h=hParadox(t), dh=36/(PI*h*h), Vv=PI*h**3/27;
    title('المفارقة',t,5,ORANGE);
    const vf=v*(1-ease((t-(s+13.4))/.4));
    math([{f:['dV','dt']},' = 4'],460,1225,80,{p:prog(t,s+.4,s+1.2),a:vf});
    write('ثابت',700,1225,56,{p:prog(t,s+1,s+1.5),a:vf,col:DIM,f:'b'});
    math([{f:['dh','dt']},' = ',{f:['36',['π',{s:['h','2']}]]}],540,1375,80,{p:prog(t,s+1.2,s+2.2),a:vf});
    if(t>=PT0-.4){ const a=v*clamp((t-PT0+.4)/.4)*(1-ease((t-(s+9))/.5));
      math(['h = '+h.toFixed(1)],215,1520,54,{a,col:BLUE}); math(['V = '+Vv.toFixed(0)],540,1520,54,{a,col:WHITE}); math([{f:['dh','dt']},' = '+dh.toFixed(3)],860,1520,54,{a,col:ORANGE,glow:6});
      write('الزمن مُسرَّع ×'+Math.round(K),540,1610,46,{a:a*.9,col:DIM,f:'b'}); }
    if(t>=s+9.3){ const vc=v*(1-ease((t-(s+13.4))/.4));
      write('الحجم يزداد بمعدل ثابت…',540,1500,62,{p:prog(t,s+9.3,s+10.3),a:vc,f:'b'});
      write('أما الارتفاع فيتباطأ لأن المخروط يتّسع',540,1588,54,{p:prog(t,s+10.1,s+11.3),a:vc,col:ORANGE,glow:8,f:'b'}); }
    if(t>=s+13.7){
      write('جرّب بنفسك',540,1240,70,{p:prog(t,s+13.7,s+14.3),a:v,col:ORANGE,glow:10});
      write('ماذا لو كان التسرّب ⁦3 cm³/s⁩ ؟',540,1345,58,{p:prog(t,s+14.2,s+15.1),a:v,f:'b'});
      write('اكتب جوابك في التعليقات',540,1440,54,{p:prog(t,s+14.9,s+15.7),a:v,col:DIM,f:'b'}); }
  }
  if(extra) extra();
  /* brand */
  write('NIBOR  /  MOTION',540,1760,40,{a:.85*vis(t,.8,D,.6,.01),col:'#9fd8e0'});

  /* chalk tip dust */
  const r=rng(Math.floor(t*30)+3);
  for(const [x,y,col] of TIPS){ L.save(); L.fillStyle=col; for(let i=0;i<9;i++){ L.globalAlpha=.25+r()*.5; L.beginPath(); L.arc(x+(r()-.5)*26,y+(r()-.5)*26,1+r()*2.6,0,2*PI); L.fill(); } L.globalAlpha=.9; L.shadowColor=col; L.shadowBlur=16; L.beginPath(); L.arc(x,y,4,0,2*PI); L.fill(); L.restore(); }
  /* chalk texture, soft dust glow, then onto the board */
  L.save(); L.globalCompositeOperation='destination-in'; L.drawImage(grain,0,0); L.restore();
  g.save(); g.filter='blur(7px)'; g.globalAlpha=.35; g.drawImage(layer,0,0); g.restore();
  g.drawImage(layer,0,0);
  /* fade from / to black at the ends */
  const fb=(t-(D-.5))/.5; if(fb>0){ g.fillStyle=`rgba(0,0,0,${clamp(fb)})`; g.fillRect(0,0,W,H); }
}
/* ---- the example as written in the book (p. 95), after the brainstorm question ---- */
const Q0=4.55, SH=10;
/* the book's sentence, verbatim (p. 95); wrapped to the panel width */
const BOOKTXT='مرشح مخروطي قاعدته أُفقية ورأسه للأسفل، ارتفاعه يساوي \u206624cm\u2069 وطول قطر قاعدته \u206616cm\u2069 يصب فيه سائل بمعدل \u20665cm³/s\u2069 بينما يتسرب منه السائل بمعدل \u20661cm³/s\u2069، جد معدل تغير عمق السائل في اللحظة التي يكون فيها عمق السائل \u206612cm\u2069 .';
let LINES=null;
function wrapBook(){ const sz=50, font=`500 ${sz}px Body, ${LT}`, max=880, out=[['مثال 5',ORANGE,60,'r']]; let cur='';
  for(const w of BOOKTXT.split(' ')){ const nx=cur?cur+' '+w:w; if(textW(nx,font)>max&&cur){ out.push([cur,WHITE,sz,'b']); cur=w; } else cur=nx; }
  if(cur) out.push([cur,WHITE,sz,'b']); return out; }
function statement(u){ const v=Math.min(ease(u/.5),1-ease((u-(SH-.6))/.6)); if(v<=0) return;
  const x0=70,x1=1010,y0=470,y1=1150;
  L.save(); L.globalAlpha=.93*v; L.fillStyle='#1d2827'; L.beginPath(); L.roundRect(x0,y0,x1-x0,y1-y0,26); L.fill(); L.restore();
  const P=[[x0+14,y0+4],[x1-8,y0],[x1+2,y1-12],[x0+6,y1+2],[x0-2,y0+16],[x0+14,y0+4]]; stroke(P,prog(u,.1,1.1),WHITE,4,{a:.8*v});
  if(!LINES) LINES=wrapBook(); const n=LINES.length-1, gap=Math.min(84,(y1-y0-150)/n), dt=Math.min(.7,5/n);
  let y=y0+92; LINES.forEach(([txt,col,sz,f],i)=>{ const a=.5+i*dt; write(txt,540,y,sz,{p:prog(u,a,a+.8),a:v,col,glow:i?0:8,f,w:i?500:700}); y+=i?gap:(gap+18); });
  stroke([[430,y0+112],[650,y0+110]],prog(u,.9,1.4),ORANGE,3,{a:.6*v}); }
const CUT0=8.6, CUT=65/30;   /* givens: skip the idle 2.17 s once the numbers are on the drawing */
const render=t=>{ if(t<Q0) frame(t); else if(t<Q0+SH) frame(Q0,()=>statement(t-Q0)); else { let u=t-SH; if(u>=CUT0) u+=CUT; frame(u); } };
 

const real=u=>u<CUT0?u+SH:u+SH-CUT, NAMES=['المعدل الصافي', 'التشابه', 'الاشتقاق', 'المفارقة'];
  const cues=[{t:0,l:'السؤال'},{t:Q0,l:'نص المثال'},{t:Q0+SH,l:'المعطيات'}].concat(SC.slice(2).map((s,i)=>({t:real(s[0]),l:NAMES[i]})));
  return {render,D:D+SH-CUT,cues};
};
