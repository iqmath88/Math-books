'use strict';
/* =====================================================================================
   فيديو يوتيوب (1920×1080): تطبيقات عملية على القيم العظمى أو الصغرى — الحلقة الأولى
   الدرس [3−8] ص 140–147: الفكرة ← خطوات الحل ← مثال 1 (عدد ومربعه) ← مثال 2 (أكبر صندوق) ← مثال 4 (أكبر مستطيل داخل مثلث) ← الخلاصة
   يُرسم بمحرك السبورة المشترك (v2/reels/chalk.js بعد ضبط CHALK_W/H)؛ الإطار عند الزمن t لا يعتمد إلا على t.
   ===================================================================================== */
window.EPISODE=(function(){
const CREAM='#f3e6c8', SOFT='#cfd8d2', COPPER='rgba(232,150,92,', GREEN='#a8e6a1';
const lerp=(a,b,k)=>a+(b-a)*k;

/* ---------- text helpers ---------- */
function wrapAr(text,sz,max,w=500){ const font=`${w} ${sz}px Body, ${LT}`, out=[]; let cur='';
  for(const word of text.split(' ')){ const nx=cur?cur+' '+word:word; if(textW(nx,font)>max&&cur){ out.push(cur); cur=word; } else cur=nx; } if(cur) out.push(cur); return out; }
/* lines written one after another from u0, `per` seconds each */
function para(u,lines,cx,y0,gap,sz,u0,per,o={}){ lines.forEach((ln,i)=>{ const a=u0+i*per; write(ln,cx,y0+i*gap,sz,{p:prog(u,a,a+per*1.05),a:o.a??1,col:o.col,f:'b',w:o.w||500}); }); }
function title(u,d,s,col=WHITE,sz=64){ write(s,960,150,sz,{p:prog(u,.1,1.1),a:vis(u,0,d),col}); stroke([[960-textW(s,`700 ${sz}px Ruqaa`)/2,178],[960+textW(s,`700 ${sz}px Ruqaa`)/2,176]],prog(u,.9,1.5),ORANGE,3,{a:.55*vis(u,0,d)}); }
function note(u,list,cx,y,sz=44,a=1){ for(const [a0,a1,txt] of list){ const lv=vis(u,a0,a1,.25,.3); if(lv>0) write(txt,cx,y,sz,{a:a*lv,col:SOFT,f:'b'}); } }
function warnBox(u,s,a,b,cx,y,sz=46){ const v=vis(u,a,b,.3,.4); if(v<=0) return; const w=textW(s,`500 ${sz}px Body`)+70;
  stroke([[cx-w/2,y-sz-6],[cx+w/2,y-sz-9],[cx+w/2+4,y+20],[cx-w/2-3,y+22],[cx-w/2,y-sz-6]],prog(u,a,a+.6),ORANGE,4,{a:v,glow:10});
  write(s,cx,y,sz,{p:prog(u,a+.15,a+.9),a:v,col:ORANGE,f:'b'}); }
function badge(n,x,y,r,a,p=1){ stroke(ellipseP(x,y,r,r),p,ORANGE,4,{a}); math(String(n),x,y+r*.42,r*1.15,{a:a*clamp(p*2),col:ORANGE}); }
/* a rough chalk rectangle */
function frameBox(x0,y0,x1,y1,p,a,col=WHITE,w=4){ stroke([[x0+10,y0+3],[x1-6,y0],[x1+2,y1-10],[x0+5,y1+2],[x0-2,y0+12],[x0+10,y0+3]],p,col,w,{a}); }
function panel(x0,y0,x1,y1,a){ L.save(); L.globalAlpha=.9*a; L.fillStyle='#1d2827'; L.beginPath(); L.roundRect(x0,y0,x1-x0,y1-y0,24); L.fill(); L.restore(); frameBox(x0,y0,x1,y1,1,.75*a); }

/* derivation board: lines stack downward and scroll up once `n` are shown; the newest is bright, older ones dimmer */
function derive(u,items,o){ let k=-1; items.forEach((it,i)=>{ if(u>=it.at) k=i; }); if(k<0) return {k:-1};
  const f=Math.max(0,(k-1+ease((u-items[k].at)/.55))-(o.n-1)); const out={k,ys:[]};
  for(let i=0;i<=k;i++){ const pos=i-f, y=o.top+pos*o.gap; let a=(i===k?1:.66)*(o.a??1); if(pos<0) a*=clamp(1+pos*1.6); out.ys[i]=y; if(a<=0.01) continue;
    const it=items[i], p=i===k?prog(u,it.at+.15,it.at+.15+(it.d||1.1)):1, sz=it.sz||o.sz;
    if(it.e) math(it.e,o.cx,y,sz,{p,a,col:it.col,glow:it.col?8:0,max:o.w});
    else write(it.s,o.cx,y,sz*.78,{p,a,col:it.col||WHITE,f:'b',w:500}); }
  return out; }

/* ---------- graphs ---------- */
function G(ox,oy,sx,sy){ return {ox,oy,sx,sy,X:x=>ox+x*sx,Y:y=>oy-y*sy}; }
function axes(g,x0,x1,y0,y1,p,a,lx='x',ly='y'){ arrow(g.X(x0),g.oy,g.X(x1),g.oy,p,WHITE,4); arrow(g.ox,g.Y(y0),g.ox,g.Y(y1),p,WHITE,4);
  math(lx,g.X(x1)+26,g.oy+14,44,{a:a*p}); math(ly,g.ox,g.Y(y1)-26,44,{a:a*p}); }
function plot(g,f,x0,x1,p,col,a,w=6,n=160){ const P=[]; for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n; P.push([g.X(x),g.Y(f(x))]); } stroke(P,p,col,w,{a,glow:10}); }
function dot(x,y,r,col,a){ L.save(); L.globalAlpha=a; L.fillStyle=col; L.shadowColor=col; L.shadowBlur=16; L.beginPath(); L.arc(x,y,r,0,2*PI); L.fill(); L.restore(); }
function tick(g,x,lab,a,below=true){ stroke([[g.X(x),g.oy-9],[g.X(x),g.oy+9]],1,WHITE,3,{a}); if(lab!=null) math(String(lab),g.X(x),g.oy+(below?52:-22),36,{a,col:DIM}); }

/* ---------- 3-D box (the book's p.141 figure): sheet 12 cm, corners x cut, flaps folded ---------- */
const SIDE=12, vol=x=>x*(SIDE-2*x)**2;
let CAM={cx:480,cy:600,S:40,az:0,el:PI/2};
function P3(X,Y,Z){ const {cx,cy,S,az,el}=CAM, u=X*Math.cos(az)-Y*Math.sin(az), w=X*Math.sin(az)+Y*Math.cos(az);
  return [cx+u*S, cy+w*Math.sin(el)*S-Z*Math.cos(el)*S, w*Math.cos(el)+Z*Math.sin(el)]; }
function face(pts,o={}){ const Q=pts.map(p=>P3(...p)), a=o.a??1;
  if(o.fill){ L.save(); L.globalAlpha=a; L.fillStyle=o.fill; L.beginPath(); Q.forEach(([x,y],i)=>i?L.lineTo(x,y):L.moveTo(x,y)); L.closePath(); L.fill(); L.restore(); }
  stroke([...Q,Q[0]].map(q=>[q[0],q[1]]),o.p??1,o.col||WHITE,o.w||5,{a,dash:o.dash,glow:o.glow}); }
function box3(x,al,a=1,o={}){ const h=SIDE/2-x, c=Math.cos(al)*x, s=Math.sin(al)*x, F=[];
  F.push([[-h,-h,0],[h,-h,0],[h,h,0],[-h,h,0]]);
  F.push([[h,-h,0],[h,h,0],[h+c,h,s],[h+c,-h,s]]); F.push([[-h,-h,0],[-h,h,0],[-h-c,h,s],[-h-c,-h,s]]);
  F.push([[-h,h,0],[h,h,0],[h,h+c,s],[-h,h+c,s]]); F.push([[-h,-h,0],[h,-h,0],[h,-h-c,s],[-h,-h-c,s]]);
  const depth=f=>f.reduce((m,p)=>m+P3(...p)[2],0)/f.length;
  F.map((f,i)=>[f,i,depth(f)]).sort((u,v)=>u[2]-v[2]).forEach(([f,i])=>face(f,{a,p:o.p,fill:COPPER+(i?(o.glow?.30:.20):(o.glow?.22:.14))+')',col:o.col||WHITE,w:5,glow:o.glow})); }
function corners3(x,a=1,o={}){ const h=SIDE/2-x, fly=o.fly||0;
  for(const [sx,sy] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const d=fly*3.2, z=fly*2.5, X0=sx*h+sx*d, Y0=sy*h+sy*d, X1=sx*SIDE/2+sx*d, Y1=sy*SIDE/2+sy*d;
    face([[X0,Y0,z],[X1,Y0,z],[X1,Y1,z],[X0,Y1,z]],{a:a*(1-fly),fill:COPPER+(o.hi?.32:.14)+')',col:o.hi?ORANGE:WHITE,w:o.hi?5:4,dash:o.hi?[14,10]:null}); } }
function dims3(x,lw,lh,a,sz){ const h=SIDE/2-x, C=[[h,h],[h,-h],[-h,h],[-h,-h]], [cx,cy]=P3(0,0,x/2);
  const near=C.reduce((b,c)=>P3(c[0],c[1],0)[2]>P3(b[0],b[1],0)[2]?c:b), right=C.reduce((b,c)=>P3(c[0],c[1],0)[0]>P3(b[0],b[1],0)[0]?c:b);
  for(const o of [[-near[0],near[1]],[near[0],-near[1]]]){ const [x1,y1]=P3(near[0],near[1],0),[x2,y2]=P3(o[0],o[1],0), mx=(x1+x2)/2, my=(y1+y2)/2, d=Math.hypot(mx-cx,my-cy)||1;
    math(lw,mx+(mx-cx)/d*70,my+(my-cy)/d*70+sz*.35,sz,{a,col:BLUE}); }
  const [rx,ry]=P3(right[0],right[1],x/2); math(lh,rx+46,ry+sz*.35,sz,{a,col:ORANGE}); }
const TILT={az:-.52,el:.56};
function cam(k,cx,cy,S){ CAM={cx,cy,S,az:TILT.az*k,el:PI/2+(TILT.el-PI/2)*k}; }

/* =========================== the segments =========================== */
const SEG=[];
const add=(name,d,draw,chapter)=>SEG.push({name,d,draw,chapter});

/* ---- 0: opening ---- */
add('المقدمة',25,(u,d)=>{
  const c=vis(u,-1,8.6,.3,.6);
  if(c>0){ write('تطبيقات عملية',960,380,128,{p:prog(u,.2,1.6),a:c,glow:10});
    write('على القيم العظمى أو الصغرى',960,520,84,{p:prog(u,1,2.4),a:c,col:ORANGE,glow:10});
    write('الحلقة الأولى: الفكرة · خطوات الحل · ثلاثة أمثلة',960,650,48,{p:prog(u,2.2,3.4),a:c,f:'b'});
    write('الأستاذ فائز الحمداني',960,790,58,{p:prog(u,3.4,4.4),a:c,col:CREAM});
    write('السادس العلمي · الفصل الثالث · الدرس ⁦3−8⁩ · ص ⁦140–147⁩',960,870,40,{p:prog(u,4,5),a:c,col:DIM,f:'b',w:500}); }
  const s=vis(u,8.8,d,.4,.5); if(s<=0) return;
  write('ثلاث مسائل… وسؤال واحد',960,170,64,{p:prog(u,9,10),a:s});
  /* three sketches: largest box, largest rectangle in a triangle, smallest value of a curve */
  cam(1,1520,520,24); box3(2,PI/2,s*clamp((u-9.6)/.6));
  write('أكبر حجم',1520,760,52,{p:prog(u,10,10.8),a:s,col:ORANGE,f:'b'});
  { const a=s*clamp((u-11)/.6), bx0=780,bx1=1140,by=640,ax=960,ay=380; stroke([[bx0,by],[bx1,by],[ax,ay],[bx0,by]],prog(u,11,12.2),WHITE,5,{a});
    const hx=lerp(70,160,.5+.5*Math.sin(u*.9)), w=(bx1-bx0)*(1-hx/(by-ay)); L.save(); L.globalAlpha=.28*a; L.fillStyle=BLUE; L.fillRect(ax-w/2,by-hx,w,hx); L.restore();
    stroke([[ax-w/2,by],[ax-w/2,by-hx],[ax+w/2,by-hx],[ax+w/2,by]],1,BLUE,5,{a}); write('أكبر مساحة',960,760,52,{p:prog(u,12,12.8),a:s,col:ORANGE,f:'b'}); }
  { const g=G(400,560,90,70), a=s*clamp((u-13)/.6); plot(g,x=>(x+.4)**2-2.2+.3,-2.3,1.5,prog(u,13,14.4),BLUE,a); dot(g.X(-.4),g.Y(-1.9),11,ORANGE,a*clamp((u-14.4)/.4));
    write('أصغر قيمة',400,760,52,{p:prog(u,14.4,15.2),a:s,col:ORANGE,f:'b'}); }
  write('ما الذي يجمعها؟',960,890,58,{p:prog(u,16,17),a:s*(1-ease((u-19.6)/.4))});
  write('كلها تبحث عن أفضل قيمة: عظمى أو صغرى',960,890,60,{p:prog(u,20,21.4),a:s,col:ORANGE,glow:8,f:'b'});
},true);

/* ---- 1: the idea — where these problems come from (book p.140, verbatim) ---- */
const BOOK140='ظهرت في القرن السابع عشر الكثير من الاسئلة دفعت الى تطور حساب التفاضل والتكامل ومن امثلة ذلك المسائل التي وردت في بحوث الفيزياء مثل اقصى ارتفاع تصله قذيفة اطلقت بزوايا مختلفة، او اقصى ارتفاع يصله جسم مقذوف شاقولياً الى اعلى اواقل زمن وأقل كلفة ومسائل من الصناعات مثل أقل مساحة وأكبر حجم وأقل محيط، ... الخ.';
let L140=null;
add('الفكرة: من أين جاءت هذه المسائل؟',40,(u,d)=>{ const v=vis(u,0,d);
  title(u,d,'الفكرة: من أين جاءت هذه المسائل؟');
  /* left: projectiles at three angles; the highest point of each is marked */
  const g=G(130,860,26,26); axes(g,0,26,0,17,prog(u,.6,1.6),v,'x','y');
  [[24,6,'#9fd8e0'],[21,10.5,BLUE],[15,14.5,'#d5ecff']].forEach(([R,Hm,col],i)=>{ const F=x=>4*Hm*x*(R-x)/(R*R), xm=R/2;
    plot(g,F,0,R,prog(u,1.6+i*1.3,3+i*1.3),col,v*.9,5);
    const tp=vis(u,4.6+i*.4,d,.3,.4); if(tp>0){ dot(g.X(xm),g.Y(F(xm)),9,ORANGE,v*tp); stroke([[g.X(xm)-50,g.Y(F(xm))],[g.X(xm)+50,g.Y(F(xm))]],1,ORANGE,3,{a:v*tp,dash:[8,8]}); } });
  write('أقصى ارتفاع',g.X(9),g.Y(16.6),44,{p:prog(u,5.6,6.4),a:v,col:ORANGE,f:'b'});
  /* right: the book's paragraph */
  if(!L140) L140=wrapAr(BOOK140,40,820);
  write('من الكتاب · ص 140',1400,250,38,{p:prog(u,1.2,2),a:v*.8,col:DIM,f:'b',w:500});
  para(u,L140,1400,320,60,40,2,1.9,{a:v});
  const kw=[['أقصى ارتفاع',1],['أقل زمن',0],['أقل كلفة',0],['أقل مساحة',0],['أكبر حجم',1],['أقل محيط',0]];
  kw.forEach(([s,mx],i)=>{ const x=1700-(i%3)*300, y=860+Math.floor(i/3)*76, at=25+i*1.4, p=prog(u,at,at+.8);
    write(s,x,y,46,{p,a:v,col:mx?ORANGE:BLUE,f:'b',glow:6}); });
  write('البرتقالي: أكبر قيمة (عظمى) · الأزرق: أصغر قيمة (صغرى)',1400,1010,36,{p:prog(u,33.5,35),a:v*.9,col:SOFT,f:'b',w:500});
});

/* ---- 2: experiment — the largest box (lesson's discovery, p.140) ---- */
add('تجربة: أكبر صندوق ممكن',50,(u,d)=>{ const v=vis(u,0,d);
  title(u,d,'تجربة: أكبر صندوق ممكن');
  const x=u<8?2.5:u<30?(u<19?lerp(2.5,.3,ease((u-8)/11)):lerp(.3,5.7,ease((u-19)/11))):lerp(5.7,2,ease((u-30)/3));
  cam(1,470,560,36); box3(x,PI/2,v);
  math(['x = '+x.toFixed(2)+'     V = '+vol(x).toFixed(1)],470,880,52,{a:v,col:BLUE});
  write('نقصّ من الأركان مربعات ضلعها ⁦x⁩ ونثني الحواف',470,960,36,{p:prog(u,1,2.2),a:v*.9,col:SOFT,f:'b',w:500});
  /* the question and its options (lesson p.140) */
  const qa=v*(1-ease((u-35)/.5));
  write('كلما كبر المربع المقطوع ⁦x⁩ ، فإن حجم الصندوق:',1400,280,46,{p:prog(u,1.4,2.6),a:qa,f:'b'});
  [['أ) يكبر دائماً',0],['ب) يصغر دائماً',0],['ج) يكبر ثم يصغر، فله قيمة عظمى',1]].forEach(([s,ok],i)=>{ const y=360+i*62; write(s,1400,y,42,{p:prog(u,2.6+i*.8,3.4+i*.8),a:qa*(u>33&&!ok?.45:1),col:u>33&&ok?ORANGE:WHITE,f:'b',w:500});
    if(ok&&u>33) ring(1400,y-14,330,40,prog(u,33,33.9),ORANGE,qa); });
  note(u,[[5.2,8,'توقّف لحظة وفكّر قبل أن نجرّب']],1400,560,40,qa);
  /* the curve V(x) traced by the moving x */
  const g=G(1060,940,118,2.6);
  if(u>8){ const ga=v*clamp((u-8)/.5); axes(g,0,6.4,0,150,1,ga,'x','V'); tick(g,2,2,ga); tick(g,6,6,ga);
    const xmax=u<19?2.5:Math.max(.3,Math.min(5.7,x)), xmin=u<19?Math.min(2.5,x):.3;
    plot(g,vol,xmin,Math.max(xmin+.001,u<19?2.5:xmax),1,BLUE,ga,6,90); dot(g.X(x),g.Y(vol(x)),12,ORANGE,ga); }
  const wa=vis(u,35.6,d,.4,.5);
  if(wa>0){ para(u,['المربع الصغير يعطي صندوقاً واسعاً ضحلاً،','والكبير يعطي صندوقاً عميقاً ضيقاً؛','وبينهما أفضل قيمة… وهي ما نبحث عنه بالمشتقة'],1400,300,66,44,35.8,2.6,{a:wa});
    const [mx,my]=[g.X(2),g.Y(128)]; stroke([[mx-70,my],[mx+70,my]],prog(u,43,43.7),ORANGE,4,{a:wa,glow:10}); write('القمة',mx,my-40,42,{p:prog(u,43.4,44.2),a:wa,col:ORANGE,f:'b'}); }
});

/* ---- 3: the key idea — at a peak or a valley the tangent is horizontal ---- */
add('الفكرة الأساسية',25,(u,d)=>{ const v=vis(u,0,d);
  title(u,d,'الفكرة الأساسية');
  const g=G(470,600,150,80), f=x=>x*x*x-3*x; axes(g,-2.6,2.6,-3.3,3.4,prog(u,.4,1.2),v);
  plot(g,f,-2.15,2.15,prog(u,1,3),BLUE,v);
  for(const [x0,lab,col,at] of [[-1,'نهاية عظمى',ORANGE,3.2],[1,'نهاية صغرى',GREEN,4.6]]){ const a=v*clamp((u-at)/.5), X=g.X(x0), Y=g.Y(f(x0));
    dot(X,Y,11,col,a); stroke([[X-110,Y],[X+110,Y]],prog(u,at,at+.7),col,4,{a,dash:[10,8]}); write(lab,X,Y+(x0<0?-48:84),44,{p:prog(u,at+.3,at+1),a,col,f:'b'}); }
  write('المماس أفقي عند القمة والقاع:',1400,300,44,{p:prog(u,5.4,6.3),a:v,col:SOFT,f:'b',w:500}); math(["f′(x) = 0"],1400,400,64,{p:prog(u,6,7),a:v,col:ORANGE,glow:6});
  para(u,['١) نكتب الكمية المطلوبة دالةً في متغير واحد','٢) نجد الأعداد التي تنعدم عندها المشتقة','٣) نتحقق: هل هي عظمى أم صغرى؟'],1400,560,110,46,8,4,{a:v});
});

/* ---- 4: the book's three steps (p.140, verbatim) ---- */
const STEPS=['نرسم مخططاً للمسألة (إن امكن) ونعين عليه الأجزاء المهمة في المسألة.',
  'نكوّن الدالة المراد ايجاد قيمتها العظمى او الصغرى ونحدد مجالها على ان تكون في متغير واحد.',
  'اذا كان المجال فترة مغلقة نجد الاعداد الحرجة وقيم الدالة في اطراف الفترة وفي الاعداد الحرجة. فأيّها اكبر هي القيمة العظمى وأيّها أصغر هي القيمة الصغرى.'];
let LST=null;
add('خطوات الحل (من الكتاب)',45,(u,d)=>{ const v=vis(u,0,d);
  title(u,d,'خطوات الحل · من الكتاب ص 140');
  if(!LST) LST=STEPS.map(s=>wrapAr(s,46,1420));
  let y=300; const at=[2,12,24];
  LST.forEach((lines,i)=>{ const a=v*clamp((u-at[i])/.4), cur=u>=at[i]&&(i===2||u<at[i+1]);
    if(a>0){ badge(i+1,1780,y-16,34,a,prog(u,at[i],at[i]+.6)); para(u,lines,960,y,66,46,at[i]+.3,lines.length>1?2.6:3,{a:a*(cur||u>40?1:.62)}); }
    y+=lines.length*66+70; });
  note(u,[[38,d,'الخطوة الأولى رسم… والثانية دالة في متغير واحد… والثالثة أين القيم الكبرى والصغرى']],960,990,40,v);
},true);

/* ---- 5: the working method used in every example (lesson's summary) ---- */
const METHOD=[['نفرض','المتغيرات على الرسم'],['الدالة الرئيسية','الكمية المطلوب تعظيمها أو تصغيرها'],['العلاقة المساعدة','قبل الاشتقاق: متغير واحد ومجاله'],['نشتق ونساوي بالصفر','ثم نتحقق ونهمل غير المعقول'],['الجواب بوحدته','cm , cm² , cm³ …']];
const MT=[['نفرض'],['الدالة','الرئيسية'],['العلاقة','المساعدة'],['نشتق ونساوي','بالصفر'],['الجواب','بوحدته']];
add('طريقة العمل في كل مثال',55,(u,d)=>{ const v=vis(u,0,d);
  title(u,d,'طريقة العمل في كل مثال');
  const at=[3,11,19,31,42], W0=330, G0=42, y0=300, y1=640;
  METHOD.forEach(([h,s],i)=>{ const x1=1840-i*(W0+G0), x0=x1-W0, cx=(x0+x1)/2, a=v*clamp((u-at[i])/.4); if(a<=0) return;
    const cur=u>=at[i]&&(i===4||u<at[i+1]);
    L.save(); L.globalAlpha=(cur?.95:.7)*a; L.fillStyle=cur?'#2a3634':'#1d2827'; L.beginPath(); L.roundRect(x0,y0,W0,y1-y0,22); L.fill(); L.restore();
    frameBox(x0,y0,x1,y1,prog(u,at[i],at[i]+.8),a,cur?ORANGE:WHITE,cur?5:3);
    badge(i+1,cx,y0+62,30,a,prog(u,at[i],at[i]+.6));
    MT[i].forEach((ln,j)=>write(ln,cx,y0+150+j*56,48,{p:prog(u,at[i]+.3,at[i]+1),a,col:cur?ORANGE:WHITE}));
    const lines=/[؀-ۿ]/.test(s)?wrapAr(s,32,290):[s]; lines.forEach((ln,j)=>{ if(/[؀-ۿ]/.test(ln)) write(ln,cx,y0+272+j*44,32,{p:prog(u,at[i]+.7,at[i]+1.5),a:a*.9,col:SOFT,f:'b',w:500}); else math(ln,cx,y0+280,34,{p:prog(u,at[i]+.7,at[i]+1.5),a:a*.9,col:SOFT}); });
    if(i<4){ const ax=x0-6; arrow(ax,(y0+y1)/2,ax-G0+12,(y0+y1)/2,prog(u,at[i+1]-.4,at[i+1]),WHITE,4); } });
  note(u,[[20,30.6,'مثل: فيثاغورس، التشابه، محيط أو مساحة معلومة، معادلة منحنٍ'],[31.6,41.6,'بإشارة المشتقة الثانية، ونهمل القيم غير المعقولة (طول سالب، قاعدة صفرية…)'],[43,d,'كما في المعدلات المرتبطة (الدرس ⁦3−1⁩): هناك نشتق بالنسبة إلى الزمن، وهنا بالنسبة إلى متغير الدالة']],960,760+20,42,v);
  write('أهم خطوة: العلاقة المساعدة قبل الاشتقاق',960,880,52,{p:prog(u,48,49.4),a:v,col:ORANGE,glow:8,f:'b'});
});

/* ---- 6: maximum or minimum? the second-derivative test ---- */
add('عظمى أم صغرى؟',25,(u,d)=>{ const v=vis(u,0,d);
  title(u,d,'عظمى أم صغرى؟ اختبار المشتقة الثانية');
  const gL=G(1400,620,120,60), gR=G(520,620,120,60);
  plot(gL,x=>4-x*x,-2.1,2.1,prog(u,1,2.4),ORANGE,v); dot(gL.X(0),gL.Y(4),11,ORANGE,v*clamp((u-2.4)/.4));
  math(["f″ < 0"],1400,770,64,{p:prog(u,3,4),a:v,col:ORANGE,glow:6}); write('مقعّر للأسفل ⇐ نهاية عظمى',1400,860,46,{p:prog(u,4,5.2),a:v,f:'b'});
  plot(gR,x=>x*x-.5,-2.1,2.1,prog(u,6.5,7.9),GREEN,v); dot(gR.X(0),gR.Y(-.5),11,GREEN,v*clamp((u-7.9)/.4));
  math(["f″ > 0"],520,770,64,{p:prog(u,8.5,9.5),a:v,col:GREEN,glow:6}); write('مقعّر للأعلى ⇐ نهاية صغرى',520,860,46,{p:prog(u,9.5,10.7),a:v,f:'b'});
  write('وإذا كانت الفترة مغلقة نقارن أيضاً قيم الدالة عند طرفيها',960,985,42,{p:prog(u,14,15.6),a:v,col:SOFT,f:'b',w:500});
});

/* ---- examples: a title card, then the book's statement (verbatim), then the solution ---- */
function card(u,num,page,name,d=3.2){ const c=vis(u,-1,d,.3,.5); if(c<=0) return;
  write('مثال '+num,960,440,120,{p:prog(u,.1,1),a:c,col:ORANGE,glow:12}); write(name,960,580,70,{p:prog(u,.6,1.6),a:c}); write('ص '+page,960,680,44,{p:prog(u,1,1.8),a:c,col:DIM,f:'b',w:500}); }
function statement(u,text,a0,a1,num){ const v=vis(u,a0,a1,.4,.5); if(v<=0) return; const lines=wrapAr(text,52,1420);
  panel(180,250,1740,330+lines.length*82+40,v); write('مثال '+num+' · نص الكتاب',960,320,46,{p:prog(u,a0,a0+.8),a:v,col:ORANGE,f:'b'});
  para(u,lines,960,410,82,52,a0+.6,Math.min(2.2,(a1-a0-3)/lines.length),{a:v}); }

/* ---- 7: example 1 p.140 ---- */
add('مثال 1: عدد ومربعه',95,(u,d)=>{
  card(u,1,140,'عدد ومربعه');
  statement(u,'جد العدد الذي اذا اضيف الى مربعه يكون الناتج اصغر ما يمكن.',3.4,13,1);
  if(u<12.6) return; const v=vis(u,12.6,d);
  title(u-12.6,d-12.6,'مثال 1 · عدد ومربعه');
  const f=x=>x+x*x, g=G(560,760,230,180);
  axes(g,-2.1,1.25,-.6,2.5,prog(u,16,17),v);
  for(const k of [-2,-1,1]) tick(g,k,k,v*clamp((u-16.6)/.4));
  plot(g,f,-1.95,1.05,prog(u,18,20.5),BLUE,v);
  math(['f(x) = x + ',{s:['x','2']}],g.X(-1.7),g.Y(2.35),44,{a:v*clamp((u-20.5)/.5),col:BLUE});
  if(u>40){ const a=v*clamp((u-40)/.5), X=g.X(-.5), Y=g.Y(-.25); dot(X,Y,12,ORANGE,a); stroke([[X-120,Y],[X+120,Y]],prog(u,41,41.8),ORANGE,4,{a,dash:[10,8]});
    stroke([[X,Y],[X,g.oy]],prog(u,41.4,42),ORANGE,3,{a:a*.7,dash:[8,8]}); math([{f:['−1','2']}],X,g.oy+70,42,{a,col:ORANGE}); }
  if(u>74){ const a=v*clamp((u-74)/.5); dot(g.X(0),g.Y(0),10,GREEN,a); dot(g.X(-1),g.Y(0),10,GREEN,a);
    math(['−',{f:['1','4']}],g.X(-.5)-90,g.Y(-.25)+20,40,{a,col:ORANGE}); }
  const r=derive(u,[
    {at:14.2,s:'ليكن العدد ⁦x⁩ ، فمربعه ⁦x²⁩'},
    {at:21,e:['f(x) = x + ',{s:['x','2']}],col:ORANGE},
    {at:30,e:["f′(x) = 1 + 2x"]},
    {at:36,e:['1 + 2x = 0   ⇒   x = −',{f:['1','2']}]},
    {at:46,e:["f″(x) = 2 > 0"]},
    {at:54,s:'⇐ نهاية صغرى محلية عند ⁦x = −½⁩'},
    {at:62,e:['(−',{f:['1','2']},')'],col:ORANGE},
    {at:72,e:['f(−',{f:['1','2']},') = −',{f:['1','2']},' + ',{f:['1','4']},' = −',{f:['1','4']}]},
    {at:80,e:['f(0) = 0 ,  f(−1) = 0'],col:GREEN}],{cx:1400,top:290,gap:112,n:6,sz:58,w:820,a:v});
  if(r.k===6&&u<71.5){ ring(1400,r.ys[6]-18,150,64,prog(u,63.4,64.4),ORANGE,v); write('العدد',1650,r.ys[6]-2,46,{a:v*clamp((u-62.4)/.5),col:ORANGE,f:'b'}); }
  note(u,[[21,29.6,'الدالة الرئيسية — في متغير واحد مباشرة، فلا نحتاج علاقة مساعدة'],[30,35.6,'نشتق'],[36,45.6,'نساوي المشتقة بالصفر'],[46,53.6,'نتحقق بالمشتقة الثانية'],[72,86,'فحص: نقارن بقيم مجاورة'],[86,d,'⁦−¼⁩ أصغر من ⁦0⁩ ✓']],1400,990,42,v);
},true);

/* ---- 8: example 2 p.141 — the largest box ---- */
add('مثال 2: أكبر صندوق',165,(u,d)=>{
  card(u,2,141,'أكبر صندوق');
  statement(u,'صنع صندوق مفتوح من قطعة من النحاس مربعة الشكل طول ضلعها ⁦12 cm⁩ وذلك بقص أربعة مربعات متساوية الأبعاد من أركانها الأربعة ثم ثني الأجزاء البارزة منها. ما هو الحجم الأعظم لهذة العلبة؟',3.4,18,2);
  if(u<17.6) return; const v=vis(u,17.6,d);
  title(u-17.6,d-17.6,'مثال 2 · أكبر صندوق');
  /* figure: flat from above (like the book), cut at 31, folded and turned by 36 */
  const k=u<32.5?0:ease((u-32.5)/2.6), al=u<32?0:PI/2*ease((u-32.2)/2.4);
  const x=u<108?2.5:u<113?lerp(2.5,5.85,ease((u-108)/3)):u<119?lerp(5.85,2,ease((u-114.5)/3)):2;
  cam(k,480,600,lerp(40,38,k)); const gl=u>128?vis(u,128,d,.5,.5)*14:0;
  box3(x,al,v,{glow:gl,col:gl>7?'#fff3dc':WHITE});
  const fly=clamp((u-31)/1.3); if(fly<1) corners3(x,v,{fly:ease(fly),hi:u>21.5&&u<31});
  if(u<31.5){ const a=v*clamp((u-19)/.5), h=6-x; const [ax,ay]=P3(-6,-6,0),[bx]=P3(6,-6,0); stroke([[ax,ay-30],[bx,ay-30]],a,BLUE,4,{a}); math('12 cm',(ax+bx)/2,ay-50,48,{a,col:BLUE});
    const ab=v*clamp((u-22)/.5); const [qx,qy]=P3(6,6,0),[rx]=P3(h,6,0); stroke([[rx,qy+28],[qx,qy+28]],ab,ORANGE,4,{a:ab}); math('x',(rx+qx)/2,qy+82,52,{a:ab,col:ORANGE});
    const ac=v*clamp((u-26)/.5); const [lx,ly]=P3(-h,h,0),[mx]=P3(h,h,0); stroke([[lx,ly-28],[mx,ly-28]],ac,BLUE,4,{a:ac,dash:[12,10]}); math(['12 − 2x'],(lx+mx)/2,ly-46,46,{a:ac,col:BLUE}); }
  else if(u>36){ const a=v*clamp((u-36)/.6)*(u>107&&u<121?1-vis(u,107,121,.4,.6):1); if(u<114) dims3(x,['12 − 2x'],'x',a,48); else dims3(2,'8','2',a,56); }
  const r=derive(u,[
    {at:19.4,s:'نفرض ضلع المربع المقطوع ⁦x cm⁩'},
    {at:25.6,e:['0 < x < 6'],col:ORANGE},
    {at:37,s:'الأبعاد: ⁦12 − 2x⁩ ، ⁦12 − 2x⁩ ، ⁦x⁩'},
    {at:45,e:['V = (12 − 2x)(12 − 2x)(x)']},
    {at:54,e:['V = x(144 − 48x + 4',{s:['x','2']},')']},
    {at:62,e:['V = f(x) = 144x − 48',{s:['x','2']},' + 4',{s:['x','3']}],col:ORANGE},
    {at:74,e:[{f:['dV','dx']},' = 144 − 96x + 12',{s:['x','2']}]},
    {at:84,e:['12(12 − 8x + ',{s:['x','2']},') = 0']},
    {at:93,e:['12(6 − x)(2 − x) = 0']},
    {at:101,e:['x = 6    ,    x = 2'],col:ORANGE},
    {at:121,e:['V = f(2) = 2',{s:['(12 − 4)','2']},' = 2(64)']},
    {at:129,e:['V = 128 ',{s:['cm','3']}],col:ORANGE},
    {at:139,e:["f″(x) = −96 + 24x"]},
    {at:146,e:["f″(2) = −48 < 0"],col:GREEN}],{cx:1400,top:290,gap:110,n:6,sz:58,w:840,a:v});
  if(r.k===9&&u>106){ const W9=mW(['x = 6    ,    x = 2'],58), w6=mW(['x = 6'],58), x0=1400-W9/2; stroke([[x0-8,r.ys[9]-4],[x0+w6+8,r.ys[9]-30]],prog(u,106,106.7),ORANGE,6,{a:v,glow:10}); }
  if(r.k===11&&u<138){ ring(1400,r.ys[11]-18,200,66,prog(u,130.6,131.6),ORANGE,v); }
  note(u,[[25.6,36.6,'لأن المقطوع من الضلع ⁦2x⁩ أقل من ⁦12⁩'],[45,53.6,'الدالة الرئيسية: الحجم = حاصل ضرب الأبعاد الثلاثة'],[54,61.6,'نفكّ القوس'],[62,73.6,'في متغير واحد مباشرة ✓'],[74,83.6,'نشتق بالنسبة إلى ⁦x⁩'],[84,92.6,'نساوي بالصفر ونُخرج ⁦12⁩ عاملاً مشتركاً'],[93,100.6,'نحلل'],[121,128.6,'نعوّض ⁦x = 2⁩'],[139,145.6,'نتحقق بالمشتقة الثانية'],[146,154,'سالبة ⇐ نهاية عظمى ✓']],1400,990,42,v);
  warnBox(u,'نهمل ⁦x = 6⁩ : القاعدة ⁦12 − 12 = 0⁩ فلا صندوق',107,120.4,1400,995,42);
  write('الحجم الأعظم ⁦128 cm³⁩ عندما ⁦x = 2 cm⁩',960,995,50,{p:prog(u,155,156.6),a:v*vis(u,155,d,.4,.5),col:ORANGE,glow:8,f:'b'});
},true);

/* ---- 9: example 4 p.143 — the largest rectangle inside a triangle ---- */
const TB=24, TH=18, TS=24, TX=480, TY=900;          // base 24 cm, height 18 cm; 1 cm = 24 px; base centre (TX, TY)
const yOf=x=>4/3*(TH-x), area=x=>x*yOf(x);
function tri(a,p=1){ stroke([[TX-TB/2*TS,TY],[TX+TB/2*TS,TY],[TX,TY-TH*TS],[TX-TB/2*TS,TY]],p,WHITE,5,{a}); }
function rect(x,a,o={}){ const w=yOf(x)*TS, h=x*TS; L.save(); L.globalAlpha=(o.fa??.26)*a; L.fillStyle=o.fill||BLUE; L.fillRect(TX-w/2,TY-h,w,h); L.restore();
  stroke([[TX-w/2,TY],[TX-w/2,TY-h],[TX+w/2,TY-h],[TX+w/2,TY]],1,o.col||BLUE,5,{a,glow:o.glow}); }
add('مثال 4: أكبر مستطيل داخل مثلث',165,(u,d)=>{
  card(u,4,143,'أكبر مستطيل داخل مثلث');
  statement(u,'جد بعدي أكبر مستطيل يمكن أن يوضع داخل مثلث طول قاعدته ⁦24 cm⁩ وارتفاعه ⁦18 cm⁩ بحيث أن رأسين متجاورين من رؤوسه تقعان على القاعدة والرأسين الباقيين تقعان على ساقيه.',3.4,19,4);
  if(u<18.6) return; const v=vis(u,18.6,d);
  title(u-18.6,d-18.6,'مثال 4 · أكبر مستطيل داخل مثلث');
  const x=u<22?6:u<36?(u<28?lerp(6,15.5,ease((u-22)/6)):lerp(15.5,2.5,ease((u-28)/6))):u<38?lerp(2.5,6,ease((u-36)/2)):u<96?6:u<100?lerp(6,9,ease((u-96)/3)):9;
  tri(v,prog(u,19,20.4));
  math('24 cm',TX,TY+62,46,{a:v*clamp((u-20)/.5),col:WHITE});
  { const a=v*clamp((u-20.4)/.5); stroke([[TX+TB/2*TS+40,TY],[TX+TB/2*TS+40,TY-TH*TS]],a,WHITE,3,{a:a*.7}); math('18',TX+TB/2*TS+80,TY-TH*TS/2,44,{a}); }
  const gl=u>118?vis(u,118,d,.5,.4)*14:0;
  rect(x,v*clamp((u-21)/.6),{glow:gl,col:gl>7?'#dff3ff':BLUE});
  if(u>22&&u<36) math(['A = '+area(x).toFixed(1)],TX,TY-TH*TS-40,48,{a:v,col:BLUE});
  if(u>38){ const a=v*clamp((u-38)/.6)*(1-clamp((u-117.6)/.4)), w=yOf(x)*TS, h=x*TS; math('x',TX+w/2+34,TY-h/2+16,52,{a,col:ORANGE}); math('y',TX,TY-h-22,52,{a,col:ORANGE});
    if(u>118){ const b=v*clamp((u-118)/.5); math('9 cm',TX+w/2+70,TY-h/2+16,46,{a:b,col:ORANGE}); math('12 cm',TX,TY-h-22,46,{a:b,col:ORANGE}); } }
  /* similarity: the small triangle on top of the rectangle is similar to the whole triangle */
  const sv=vis(u,48,74,.4,.5);
  if(sv>0){ const w=yOf(x)*TS, h=x*TS, pul=.6+.4*Math.sin(u*5)**2; stroke([[TX-w/2,TY-h],[TX+w/2,TY-h],[TX,TY-TH*TS],[TX-w/2,TY-h]],1,ORANGE,9,{a:v*sv*pul,glow:18});
    stroke([[TX,TY-TH*TS],[TX,TY-h]],1,ORANGE,3,{a:v*sv,dash:[8,8]}); math(['18 − x'],TX-82,TY-h-(TH*TS-h)/2+14,38,{a:v*sv,col:ORANGE}); }
  if(u>140){ const a=v*vis(u,140,d,.5,.4); L.save(); L.globalAlpha=.16*a; L.fillStyle=ORANGE; L.beginPath(); L.moveTo(TX-TB/2*TS,TY); L.lineTo(TX+TB/2*TS,TY); L.lineTo(TX,TY-TH*TS); L.closePath(); L.fill(); L.restore(); }
  const r=derive(u,[
    {at:21,s:'نفرض بعدي المستطيل: الارتفاع ⁦x⁩ والقاعدة ⁦y⁩'},
    {at:39,e:['A = xy']},
    {at:48,s:'العلاقة المساعدة: تشابه المثلثين'},
    {at:55,e:[{f:['y','24']},' = ',{f:['18 − x','18']}]},
    {at:64,e:['y = ',{f:['24','18']},'(18 − x) = ',{f:['4','3']},'(18 − x)']},
    {at:75,e:['A = x · ',{f:['4','3']},'(18 − x)']},
    {at:83,e:['f(x) = A = ',{f:['4','3']},'(18x − ',{s:['x','2']},')'],col:ORANGE},
    {at:92,e:['f′(x) = ',{f:['4','3']},'(18 − 2x) = 0']},
    {at:100,e:['x = 9 cm'],col:ORANGE},
    {at:107,e:['f″(x) = ',{f:['4','3']},'(−2) = ',{f:['−8','3']},' < 0'],col:GREEN},
    {at:117,e:['y = ',{f:['4','3']},'(18 − 9) = 12 cm'],col:ORANGE},
    {at:132,e:['A = 9 × 12 = 108 ',{s:['cm','2']}]},
    {at:141,e:[{f:['1','2']},'(24)(18) = 216 ',{s:['cm','2']}],col:DIM}],{cx:1400,top:290,gap:112,n:6,sz:58,w:840,a:v});
  if(r.k===10&&u<131){ ring(1400,r.ys[10]-18,290,70,prog(u,118.6,119.6),ORANGE,v); }
  note(u,[[22,37.6,'كلما تغيّر الارتفاع تغيّرت القاعدة… والمساحة'],[39,47.6,'الدالة الرئيسية: المساحة — لكنها في متغيرين!'],[55,63.6,'المثلث الصغير فوق المستطيل يشبه المثلث الكبير'],[64,74.6,'نعبّر عن ⁦y⁩ بدلالة ⁦x⁩'],[75,82.6,'نعوّض قبل الاشتقاق'],[83,91.6,'متغير واحد ✓ ومجاله ⁦0 < x < 18⁩'],[92,99.6,'نشتق ونساوي بالصفر'],[107,116.6,'سالبة ⇐ نهاية عظمى ✓'],[117,131.6,'البعد الآخر'],[132,140.6,'المساحة العظمى'],[141,152,'وهي نصف مساحة المثلث!']],1400,990,42,v);
  write('البعدان: ⁦9 cm⁩ و ⁦12 cm⁩ ، والمساحة العظمى نصف مساحة المثلث',1400,1030,42,{p:prog(u,153,154.6),a:v*vis(u,153,d,.4,.5),col:ORANGE,glow:8,f:'b'});
},true);

/* ---- 10: summary and next episode ---- */
add('الخلاصة',55,(u,d)=>{ const v=vis(u,0,d,.45,.01);
  title(u,d,'الخلاصة');
  METHOD.forEach(([h,s],i)=>{ const y=300+i*92, a=v*clamp((u-1-i*1.4)/.4); if(a<=0) return; badge(i+1,1800,y-14,28,a); write(h+'  —  '+s,1750,y,42,{p:prog(u,1+i*1.4,2.2+i*1.4),a,f:'b',w:500,align:'end'}); write('✓',1872,y,46,{a:a*clamp((u-2-i*1.4)/.5),col:GREEN}); });
  const R=[['مثال 1','العدد ⁦−½⁩ ، نهاية صغرى'],['مثال 2','الحجم الأعظم ⁦128 cm³⁩ عند ⁦x = 2⁩'],['مثال 4','البعدان ⁦9 cm⁩ و ⁦12 cm⁩']];
  R.forEach(([n,s],i)=>{ const y=330+i*120, a=v*vis(u,9+i*1.6,30,.4,.5); write(n,480,y,46,{p:prog(u,9+i*1.6,9.8+i*1.6),a,col:ORANGE}); write(s,480,y+56,40,{p:prog(u,9.4+i*1.6,10.6+i*1.6),a,f:'b',w:500}); });
  const nx=vis(u,30,d,.5,.01);
  if(nx>0){ write('في الحلقة القادمة',480,330,56,{p:prog(u,30,31),a:nx,col:ORANGE}); para(u,['أكبر مثلث داخل دائرة','دائرة ومربع','أقرب نقطة على منحنٍ'],480,420,70,44,31,1.2,{a:nx}); }
  if(u>38){ const a=v*clamp((u-38)/.5); panel(200,780,1720,1030,a);
    write('تمرين من الكتاب (ص 147): جد أقل محيط ممكن للمستطيل الذي مساحته ⁦16 cm²⁩',960,860,44,{p:prog(u,38.4,40.4),a,f:'b'});
    write('اكتب جوابك في التعليقات · الأستاذ فائز الحمداني',960,960,44,{p:prog(u,41,42.6),a,col:CREAM,f:'b'}); }
},true);

/* =========================== timeline =========================== */
let acc=0; for(const s of SEG){ s.t0=acc; acc+=s.d; } const D=acc;
function frame(t){
  g.clearRect(0,0,W,H); g.drawImage(board,0,0); L.clearRect(0,0,W,H); TIPS=[];
  const s=SEG.find(z=>t>=z.t0&&t<z.t0+z.d)||SEG[SEG.length-1], u=t-s.t0;
  if(s!==SEG[0]||u>8.8) write('الأستاذ فائز الحمداني · تطبيقات عملية على القيم العظمى أو الصغرى · الحلقة الأولى',960,58,30,{a:.75,col:DIM,f:'b',w:500});
  s.draw(u,s.d);
  write('NIBOR  /  MOTION',1760,1050,30,{a:.75*vis(t,.8,D,.6,.01),col:'#9fd8e0'});
  const r=rng(Math.floor(t*30)+3);
  for(const [x0,y0,col] of TIPS){ L.save(); L.fillStyle=col; for(let i=0;i<9;i++){ L.globalAlpha=.25+r()*.5; L.beginPath(); L.arc(x0+(r()-.5)*26,y0+(r()-.5)*26,1+r()*2.6,0,2*PI); L.fill(); } L.globalAlpha=.9; L.shadowColor=col; L.shadowBlur=16; L.beginPath(); L.arc(x0,y0,4,0,2*PI); L.fill(); L.restore(); }
  L.save(); L.globalCompositeOperation='destination-in'; L.drawImage(grain,0,0); L.restore();
  g.save(); g.filter='blur(7px)'; g.globalAlpha=.35; g.drawImage(layer,0,0); g.restore();
  g.drawImage(layer,0,0);
  const fb=(t-(D-.8))/.8; if(fb>0){ g.fillStyle=`rgba(0,0,0,${clamp(fb)})`; g.fillRect(0,0,W,H); }
  const fi=1-t/.6; if(fi>0){ g.fillStyle=`rgba(0,0,0,${clamp(fi)})`; g.fillRect(0,0,W,H); }
}
return {render:frame,D,chapters:SEG.map(s=>({t:s.t0,l:s.name}))};
})();
