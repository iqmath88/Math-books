/* ريلز: مثال 2 ص 141 — أكبر صندوق — مسجّل في REELS.box */
window.REELS.box=function(){
const D=71;
/* ---------- the book figure: a 12 cm copper square, four corner squares of side x cut away, the flaps folded up ----------
   3-D in cm: the sheet lies in z = 0 with its centre at the origin; base half-side h = 6 − x.
   Camera: turn az about the vertical, tilt el (π/2 = straight from above, like the book's flat figure). */
const SIDE=12, COPPER='rgba(232,150,92,', vol=x=>x*(SIDE-2*x)**2;
let CAM={cx:540,cy:800,S:54,az:0,el:PI/2};
function P(X,Y,Z){ const {cx,cy,S,az,el}=CAM, u=X*Math.cos(az)-Y*Math.sin(az), w=X*Math.sin(az)+Y*Math.cos(az);
  return [cx+u*S, cy+w*Math.sin(el)*S-Z*Math.cos(el)*S, w*Math.cos(el)+Z*Math.sin(el)]; }
function face(pts,o={}){ const Q=pts.map(p=>P(...p)), a=o.a??1;
  if(o.fill){ L.save(); L.globalAlpha=a; L.fillStyle=o.fill; L.beginPath(); Q.forEach(([x,y],i)=>i?L.lineTo(x,y):L.moveTo(x,y)); L.closePath(); L.fill(); L.restore(); }
  stroke([...Q,Q[0]].map(q=>[q[0],q[1]]),o.p??1,o.col||WHITE,o.w||5,{a,dash:o.dash,glow:o.glow}); return Q; }
/* the box (or the flat sheet when al = 0): base + four flaps, painted far to near */
function box(x,al,a=1,o={}){ const h=SIDE/2-x, c=Math.cos(al)*x, s=Math.sin(al)*x, F=[];
  F.push([[-h,-h,0],[h,-h,0],[h,h,0],[-h,h,0]]);
  F.push([[h,-h,0],[h,h,0],[h+c,h,s],[h+c,-h,s]]); F.push([[-h,-h,0],[-h,h,0],[-h-c,h,s],[-h-c,-h,s]]);
  F.push([[-h,h,0],[h,h,0],[h,h+c,s],[-h,h+c,s]]); F.push([[-h,-h,0],[h,-h,0],[h,-h-c,s],[-h,-h-c,s]]);
  const depth=f=>f.reduce((m,p)=>m+P(...p)[2],0)/f.length;
  F.map((f,i)=>[f,i,depth(f)]).sort((u,v)=>u[2]-v[2]).forEach(([f,i])=>face(f,{a,p:o.p,fill:COPPER+(i?(o.glow?.30:.20):(o.glow?.22:.14))+')',col:o.col||WHITE,w:5,glow:o.glow})); }
/* the four corner squares (still part of the sheet, or flying away when cut) */
function corners(x,a=1,o={}){ const h=SIDE/2-x, fly=o.fly||0;
  for(const [sx,sy] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const d=fly*3.2, z=fly*2.5, X0=sx*h+sx*d, Y0=sy*h+sy*d, X1=sx*SIDE/2+sx*d, Y1=sy*SIDE/2+sy*d;
    face([[X0,Y0,z],[X1,Y0,z],[X1,Y1,z],[X0,Y1,z]],{a:a*(1-fly),p:o.p,fill:COPPER+(o.hi?.32:.14)+')',col:o.hi?ORANGE:WHITE,w:o.hi?5:4,dash:o.dash}); } }
/* a label beside a 3-D point */
function tag(e,X,Y,Z,dx,dy,o={}){ const [x,y]=P(X,Y,Z); math(e,x+dx,y+dy,o.sz||54,{p:o.p,a:o.a,col:o.col,glow:o.glow}); }

/* dimension labels: the two base edges nearest the viewer, and the height at the right-most corner */
function dims(x,lw,lh,a,sz){ const h=SIDE/2-x, C=[[h,h],[h,-h],[-h,h],[-h,-h]], [cx,cy]=P(0,0,x/2);
  const near=C.reduce((b,c)=>P(c[0],c[1],0)[2]>P(b[0],b[1],0)[2]?c:b), right=C.reduce((b,c)=>P(c[0],c[1],0)[0]>P(b[0],b[1],0)[0]?c:b);
  for(const o of [[-near[0],near[1]],[near[0],-near[1]]]){ const [x1,y1]=P(near[0],near[1],0),[x2,y2]=P(o[0],o[1],0), mx=(x1+x2)/2, my=(y1+y2)/2, d=Math.hypot(mx-cx,my-cy)||1;
    math(lw,mx+(mx-cx)/d*70,my+(my-cy)/d*70+sz*.35,sz,{a,col:BLUE}); }
  const [rx,ry]=P(right[0],right[1],x/2); math(lh,rx+48,ry+sz*.35,sz,{a,col:ORANGE}); }
/* ---------- scenes ---------- */
const SC=[[0,4.6],[4.6,13.8],[13.8,25.8],[25.8,39.4],[39.4,51.4],[51.4,71]];
const IN=(t,i)=>t>=SC[i][0]-.5&&t<SC[i][1]+.5;
function title(s,t,i,col=WHITE,sz=74){ const [a,b]=SC[i]; write(s,540,282,sz,{p:prog(t,a+.1,a+1.1),a:vis(t,a,b),col}); }
function warn(s,t,a,b,y){ const v=vis(t,a,b,.3,.4); if(v<=0) return; const w=textW(s,`500 52px Body`)+80;
  const Pp=[[540-w/2,y-56],[540+w/2,y-59],[540+w/2+4,y+22],[540-w/2-3,y+24],[540-w/2,y-56]]; stroke(Pp,prog(t,a,a+.6),ORANGE,4,{a:v,glow:10});
  write(s,540,y,52,{p:prog(t,a+.15,a+.9),a:v,col:ORANGE,f:'b'}); }
function steps(t,list,y1,y2,sz,a=1){ let k=-1; list.forEach((st,i)=>{ if(t>=st.at) k=i; }); if(k<0) return;
  const pk=ease((t-list[k].at)/.45);
  for(let i=Math.max(0,k-2);i<=k;i++){ const age=k-i, st=list[i]; let y,al,p=1;
    if(age===0){ y=y2; al=1; p=prog(t,st.at+(k?.4:0),st.at+(k?.4:0)+(st.d||1)); }
    else if(age===1){ y=y2+(y1-y2)*pk; al=1-.45*pk; }
    else { y=y1-70*pk; al=.55*(1-pk); }
    if(al>0) math(st.e,540,y,sz*(age?1-.12*Math.min(1,age===1?pk:1):1),{p,a:a*al,col:st.col,glow:st.col?8:0}); }
  return {k}; }
function notes(t,list,y,a=1){ for(const [a0,a1,txt] of list){ const lv=vis(t,a0,a1,.25,.3); if(lv>0) write(txt,540,y,52,{a:a*lv,col:'#cfd8d2',f:'b'}); } }
const dV={f:['dV','dx']}, sq=s=>({s:[s,'2']}), cb=s=>({s:[s,'3']});

/* camera and x as functions of time (all from t alone) */
const TILT={az:-.52,el:.56};
function camAt(t){ const s1=SC[1][0], s2=SC[2][0], s5=SC[5][0];
  let k;                                             // 1 = tilted 3-D view, 0 = straight from above
  if(t<s1) k=1; else if(t<s2+2.2) k=1-ease((t-s1)/1.2); else k=ease((t-(s2+2.2))/2.2);
  const m=ease((t-s5)/1.1);                          // the payoff: the box moves up and shrinks to make room for the graph
  return {cx:540, cy:800-185*m, S:54-26*m, az:TILT.az*k, el:PI/2+(TILT.el-PI/2)*k}; }
const XG=2.5;                                        // a general x for the givens and the function (not the answer)
function xAt(t){ const s1=SC[1][0], s3=SC[3][0], s4=SC[4][0], s5=SC[5][0];
  if(t<s1) return 3+2.4*Math.sin(t*1.5-1.2);                              // hook: x wanders from flat to thin
  if(t<s3+9) return t<s1+1.2? lerp(xAt(s1-1e-3),XG,ease((t-s1)/1.2)) : XG;
  if(t<s3+11.4) return lerp(XG,5.85,ease((t-(s3+9.1))/1.6));              // x → 6: the base vanishes
  if(t<s4) return lerp(5.85,2,ease((t-(s3+11.6))/1.4));
  if(t<s5+2.6) return 2;
  if(t<s5+11) return PATH(t-(s5+2.6));                                     // the payoff sweep
  return 2; }
const lerp=(a,b,k)=>a+(b-a)*k;
/* payoff sweep: 2 → 0.35 → 5.6 → 2 (8.4 s) */
function PATH(u){ if(u<1.8) return lerp(2,.35,ease(u/1.8)); if(u<5.6) return lerp(.35,5.6,ease((u-1.8)/3.8)); return lerp(5.6,2,ease((u-5.6)/2.8)); }
function alAt(t){ const s2=SC[2][0]; if(t<SC[1][0]) return PI/2; if(t<s2+1.6) return PI/2*(1-ease((t-SC[1][0])/1.1)); return PI/2*ease((t-(s2+1.9))/2.4); }

/* ---------- the graph of V(x) on 0 < x < 6 ---------- */
const GX0=170, GY0=1395, GSX=118, GSY=3.25;          // origin, px per cm, px per cm³
const gp=(x,v)=>[GX0+x*GSX, GY0-v*GSY];
function graph(t,s,a,x){ const ap=prog(t,s+.3,s+1.2);
  arrow(GX0-20,GY0,GX0+6.55*GSX,GY0,ap,WHITE,4); arrow(GX0,GY0+20,GX0,GY0-148*GSY,ap,WHITE,4);
  math('x',GX0+6.75*GSX,GY0+14,48,{a:a*ap}); math('V',GX0-10,GY0-152*GSY,48,{a:a*ap});
  for(const k of [2,6]){ const [px]=gp(k,0); stroke([[px,GY0-10],[px,GY0+10]],ap,WHITE,3,{a}); math(String(k),px,GY0+58,42,{a:a*ap,col:DIM}); }
  const C=Array.from({length:121},(_,i)=>gp(i*6/120,vol(i*6/120)));
  stroke(C,prog(t,s+.9,s+2.4),BLUE,6,{a,glow:10});
  if(t>s+2.4){ const [px,py]=gp(x,vol(x)); L.save(); L.globalAlpha=a; L.fillStyle=ORANGE; L.shadowColor=ORANGE; L.shadowBlur=18; L.beginPath(); L.arc(px,py,13,0,2*PI); L.fill(); L.restore();
    stroke([[px,py],[px,GY0]],1,ORANGE,3,{a:a*.7,dash:[10,10]}); }
  const mk=vis(t,s+11.2,D+1,.4,.01);
  if(mk>0){ const [mx,my]=gp(2,128); stroke([[GX0,my],[mx,my]],prog(t,s+11.2,s+11.8),ORANGE,3,{a:a*mk,dash:[10,10]});
    math('128',GX0-70,my+16,44,{a:a*mk,col:ORANGE}); write('أعظم',mx,my-46,46,{a:a*mk,col:ORANGE,f:'b',glow:8}); } }

function frame(t,extra){
  g.clearRect(0,0,W,H); g.drawImage(board,0,0); L.clearRect(0,0,W,H); TIPS=[];
  write('الأستاذ فائز الحمداني',540,128,48,{p:1,a:.95*vis(t,-1,D,.4,.6),col:'#f3e6c8'});
  write('مثال 2 · ص 141 · السادس العلمي',540,190,38,{p:1,a:.8*vis(t,-1,D,.4,.6),col:DIM,w:400});
  CAM=camAt(t); const x=xAt(t), al=alAt(t);

  /* the figure: before the cut the sheet still has its corners; after the cut the box folds */
  const cutAt=SC[2][0]+.4, fly=clamp((t-cutAt)/1.3);
  const atMax=t>=SC[4][0]&&t<SC[5][0]+.4, gl=atMax?vis(t,SC[4][0]+.3,SC[5][0]+.4,.5,.4):0;
  box(x,al,1,{glow:gl>.05?gl*14:0,col:gl>.5?'#fff3dc':WHITE});
  if(fly<1&&t>=SC[1][0]){ const hi=t>=SC[1][0]+3.2&&t<cutAt; corners(x,1,{fly:ease(fly),hi,dash:hi?[14,10]:null}); }

  /* ---- 1: the question (full from the first frame) — the box changes as x changes ---- */
  if(IN(t,0)){ const v=vis(t,-1,4.6,.3,.5);
    write('نقصّ مربعات من الأركان ونثني الحواف…',540,300,62,{a:v});
    write('متى يكون حجم الصندوق أعظم؟',540,402,80,{a:v,col:ORANGE,glow:10+8*Math.sin(t*3)**2});
    math(['x = '+x.toFixed(1)+'   V = '+vol(x).toFixed(0)],540,1330,64,{a:v,col:BLUE}); }

  /* ---- 2: givens — the flat sheet seen from above, like the book's figure ---- */
  if(IN(t,1)){ const [s,e]=SC[1], v=vis(t,s,e), h=SIDE/2-x;
    title('المعطيات',t,1);
    const [ax,ay]=P(-6,-6,0), [bx]=P(6,-6,0); stroke([[ax,ay-34],[bx,ay-34]],prog(t,s+1.3,s+2),BLUE,4,{a:v});
    math('12 cm',540,ay-58,56,{p:prog(t,s+1.8,s+2.4),a:v,col:BLUE});
    if(t>s+3.2){ const [qx,qy]=P(6,6,0), [rx]=P(h,6,0); stroke([[rx,qy+30],[qx,qy+30]],prog(t,s+3.4,s+3.9),ORANGE,4,{a:v}); math('x',(rx+qx)/2,qy+88,58,{p:prog(t,s+3.8,s+4.2),a:v,col:ORANGE});
      const [px,py]=P(6,h,0); stroke([[px+30,py],[px+30,qy]],prog(t,s+3.6,s+4.1),ORANGE,4,{a:v}); math('x',px+66,(py+qy)/2+18,58,{p:prog(t,s+4,s+4.4),a:v,col:ORANGE}); }
    if(t>s+4.6){ const [lx,ly]=P(-h,h,0), [mx]=P(h,h,0); stroke([[lx,ly-30],[mx,ly-30]],prog(t,s+4.6,s+5.2),BLUE,4,{a:v,dash:[12,10]});
      math(['12 − 2x'],(lx+mx)/2,ly-50,54,{p:prog(t,s+5,s+5.7),a:v,col:BLUE}); }
    write('نفرض ضلع المربع المقطوع ⁦x cm⁩',540,1370,54,{p:prog(t,s+3.2,s+4.2),a:v,f:'b'});
    math(['0 < x < 6'],540,1490,84,{p:prog(t,s+6,s+6.8),a:v,col:ORANGE,glow:6});
    write('لأن المقطوع من الضلع ⁦2x⁩ أقل من ⁦12⁩',540,1600,48,{p:prog(t,s+6.9,s+7.8),a:v*.95,col:DIM,f:'b'});
  }

  /* ---- 3: the function — cut, fold, then V = product of the three dimensions ---- */
  if(IN(t,2)){ const [s,e]=SC[2], v=vis(t,s,e), h=SIDE/2-x, lv=v*clamp((t-(s+4.4))/.5);
    title('الدالة المطلوب تعظيمها',t,2,WHITE,68);
    if(lv>0){ dims(x,['12 − 2x'],'x',lv,56); }
    write('الحجم = حاصل ضرب أبعاده الثلاثة',540,1270,54,{p:prog(t,s+4.8,s+5.8),a:v*(1-ease((t-(s+7.1))/.4)),f:'b'});
    steps(t,[{e:['V = (12 − 2x)(12 − 2x)(x)'],at:s+5.6,d:1.3},
             {e:['V = x(144 − 48x + 4',sq('x'),')'],at:s+7.6,d:1.3},
             {e:['V = f(x) = 144x − 48',sq('x'),' + 4',cb('x')],at:s+9.6,d:1.3,col:ORANGE}],1340,1500,76,v);
    notes(t,[[s+7.6,s+9.5,'نفكّ القوس ⁦(12 − 2x)²⁩']],1630,v);
  }

  /* ---- 4: critical points — derivative = 0, factor, reject x = 6 ---- */
  if(IN(t,3)){ const [s,e]=SC[3], v=vis(t,s,e);
    title('النقط الحرجة',t,3);
    const r=steps(t,[{e:[dV,' = 144 − 96x + 12',sq('x')],at:s+.6},
             {e:['144 − 96x + 12',sq('x'),' = 0'],at:s+2.3},
             {e:['12(12 − 8x + ',sq('x'),') = 0'],at:s+3.9},
             {e:['12(6 − x)(2 − x) = 0'],at:s+5.5,d:1.2},
             {e:['x = 6   ,   x = 2'],at:s+7.2,col:ORANGE}],1290,1460,82,v);
    notes(t,[[s+.6,s+2.2,'نشتق ⁦V⁩ بالنسبة إلى ⁦x⁩'],[s+2.3,s+3.8,'نساوي المشتقة بالصفر'],[s+3.9,s+5.4,'نُخرج ⁦12⁩ عاملاً مشتركاً'],[s+5.5,s+7.1,'نحلل']],1600,v);
    if(r&&r.k===4&&t>s+9){ const [ux]=[540-mW(['x = 6   ,   x = 2'],82)/2+mW(['x = 6'],82)/2], k=prog(t,s+9,s+9.6);
      stroke([[ux-mW(['x = 6'],82)/2-10,1440],[ux+mW(['x = 6'],82)/2+10,1424]],k,ORANGE,6,{a:v,glow:10}); }
    warn('نهمل ⁦x = 6⁩ : القاعدة ⁦12 − 12 = 0⁩ فلا صندوق',t,s+9.2,e,1600);
  }

  /* ---- 5: the maximum volume and its check ---- */
  if(IN(t,4)){ const [s,e]=SC[4], v=vis(t,s,e), lv=v*clamp((t-(s+.4))/.5);
    title('الحجم الأعظم',t,4,ORANGE);
    if(lv>0){ dims(2,'8','2',lv,64); }
    const sv=1-ease((t-(s+6.1))/.45);
    const r=steps(t,[{e:['V = f(2) = 2',{s:['(12 − 4)','2']}],at:s+.8},
             {e:['V = 2',{s:['(8)','2']},' = 2(64)'],at:s+2.6},
             {e:['V = 128 ',cb('cm')],at:s+4.3,col:ORANGE}],1290,1460,86,v*sv);
    if(r&&r.k===2&&t<s+6.6){ const w=mW(['V = 128 ',cb('cm')],86); ring(540,1435,w/2+50,92,prog(t,s+5,s+5.9),ORANGE,v*(1-ease((t-(s+6.2))/.4))); }
    const cv2=vis(t,s+6.6,e,.4,.4);
    if(cv2>0){ math(["f''(x) = −96 + 24x"],540,1300,70,{p:prog(t,s+6.6,s+7.6),a:v*cv2});
      math(["f''(2) = −48 < 0"],540,1420,78,{p:prog(t,s+7.8,s+8.8),a:v*cv2,col:ORANGE,glow:6});
      write('سالبة ⇐ نهاية عظمى ✓',540,1530,56,{p:prog(t,s+9,s+9.8),a:v*cv2,f:'b'}); }
    notes(t,[[s+.8,s+2.5,'نعوّض ⁦x = 2⁩ في دالة الحجم'],[s+4.4,s+6.1,'الحجم الأعظم'],[s+6.6,s+8.6,'التحقق بالمشتقة الثانية']],1640,v);
  }

  /* ---- 6: the payoff — the volume curve rises and falls; the box follows x ---- */
  if(IN(t,5)){ const [s,e]=SC[5], v=vis(t,s,e,.45,.01);
    title('لماذا يوجد أعظم؟',t,5,ORANGE,70);
    graph(t,s,v*(1-.7*ease((t-(s+14.6))/.5)),x);
    if(t>s+2.4&&t<s+12.6){ const a=v*vis(t,s+2.4,s+12.6,.3,.4); math(['x = '+x.toFixed(2)+'    V = '+vol(x).toFixed(1)],540,1500,58,{a,col:BLUE}); }
    if(t>s+3.4&&t<s+11.4){ const a=v*vis(t,s+3.4,s+11.4,.3,.3); write(x<1.2?'المربع صغير: الصندوق مسطّح':x>4.2?'المربع كبير: الصندوق نحيف':'بينهما يكبر الحجم',540,1610,52,{a,col:'#cfd8d2',f:'b'}); }
    if(t>=s+12.6&&t<s+14.8){ const a=v*vis(t,s+12.6,s+14.8,.3,.4); write('الحجم الأعظم ⁦128 cm³⁩ عند ⁦x = 2 cm⁩',540,1560,56,{p:prog(t,s+12.6,s+13.5),a,col:ORANGE,glow:8,f:'b'}); }
    if(t>=s+15){ const a=v*clamp((t-s-15)/.4);
      L.save(); L.globalAlpha=.9*a; L.fillStyle='#1d2827'; L.beginPath(); L.roundRect(70,1190,940,500,26); L.fill(); L.restore();
      write('جرّب بنفسك',540,1290,70,{p:prog(t,s+15,s+15.6),a,col:ORANGE,glow:10});
      write('لو كان ضلع الصفيحة ⁦18 cm⁩',540,1400,58,{p:prog(t,s+15.4,s+16.2),a,f:'b'});
      write('فكم يكون ضلع المربع المقطوع؟',540,1490,58,{p:prog(t,s+15.9,s+16.7),a,f:'b'});
      write('اكتب جوابك في التعليقات',540,1590,52,{p:prog(t,s+16.5,s+17.3),a,col:DIM,f:'b'}); }
  }

  if(extra) extra();
  write('NIBOR  /  MOTION',540,1760,40,{a:.85*vis(t,.8,D,.6,.01),col:'#9fd8e0'});
  const r=rng(Math.floor(t*30)+3);
  for(const [x0,y0,col] of TIPS){ L.save(); L.fillStyle=col; for(let i=0;i<9;i++){ L.globalAlpha=.25+r()*.5; L.beginPath(); L.arc(x0+(r()-.5)*26,y0+(r()-.5)*26,1+r()*2.6,0,2*PI); L.fill(); } L.globalAlpha=.9; L.shadowColor=col; L.shadowBlur=16; L.beginPath(); L.arc(x0,y0,4,0,2*PI); L.fill(); L.restore(); }
  L.save(); L.globalCompositeOperation='destination-in'; L.drawImage(grain,0,0); L.restore();
  g.save(); g.filter='blur(7px)'; g.globalAlpha=.35; g.drawImage(layer,0,0); g.restore();
  g.drawImage(layer,0,0);
  const fb=(t-(D-.5))/.5; if(fb>0){ g.fillStyle=`rgba(0,0,0,${clamp(fb)})`; g.fillRect(0,0,W,H); }
}

/* ---- the example as written in the book (p. 141), after the brainstorm question ---- */
const Q0=4.55, SH=11;
const BOOK=['صنع صندوق مفتوح من قطعة من النحاس مربعة الشكل طول ضلعها ⁦12 cm⁩ وذلك بقص أربعة مربعات متساوية الأبعاد من أركانها الأربعة ثم ثني الأجزاء البارزة منها. ما هو الحجم الأعظم لهذة العلبة؟'];
let LINES=null;
function wrapBook(){ const sz=50, font=`500 ${sz}px Body, ${LT}`, max=860, out=[['مثال 2',ORANGE,60,'r']];
  for(const part of BOOK){ let cur=''; for(const w of part.split(' ')){ const nx=cur?cur+' '+w:w; if(textW(nx,font)>max&&cur){ out.push([cur,WHITE,sz,'b']); cur=w; } else cur=nx; } if(cur) out.push([cur,WHITE,sz,'b']); }
  return out; }
function statement(u){ const v=Math.min(ease(u/.5),1-ease((u-(SH-.6))/.6)); if(v<=0) return;
  const x0=60,x1=1020,y0=440,y1=1200;
  L.save(); L.globalAlpha=.93*v; L.fillStyle='#1d2827'; L.beginPath(); L.roundRect(x0,y0,x1-x0,y1-y0,26); L.fill(); L.restore();
  const Pp=[[x0+14,y0+4],[x1-8,y0],[x1+2,y1-12],[x0+6,y1+2],[x0-2,y0+16],[x0+14,y0+4]]; stroke(Pp,prog(u,.1,1.1),WHITE,4,{a:.8*v});
  if(!LINES) LINES=wrapBook(); const n=LINES.length-1, gap=Math.min(88,(y1-y0-150)/n), dt=Math.min(.8,6/n);
  let y=y0+100; LINES.forEach(([txt,col,sz,f],i)=>{ const a=.5+i*dt, p=prog(u,a,a+.9);
    write(txt,540,y,sz,{p,a:v,col,glow:i?0:8,f,w:i?500:700}); y+=i?gap:(gap+22); });
  stroke([[430,y0+120],[650,y0+118]],prog(u,.9,1.4),ORANGE,3,{a:.6*v}); }
const render=t=>{ if(t<Q0) frame(t); else if(t<Q0+SH) frame(Q0,()=>statement(t-Q0)); else frame(t-SH); };

const real=u=>u+SH, NAMES=['الدالة','النقط الحرجة','الحجم الأعظم','لماذا يوجد أعظم؟'];
  const cues=[{t:0,l:'السؤال'},{t:Q0,l:'نص المثال'},{t:Q0+SH,l:'المعطيات'}].concat(SC.slice(2).map((s,i)=>({t:real(s[0]),l:NAMES[i]})));
  return {render,D:D+SH,cues};
};
