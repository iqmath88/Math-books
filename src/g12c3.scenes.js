/* السادس العلمي · الفصل الثالث · مشاهد الرسم */
const sq=Math.sqrt, cb=Math.cbrt, PI=Math.PI, abs=Math.abs;
const fr=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
/* fit a geometry box [x0,x1]×[y0,y1] (units) into the svg, equal scale */
function fit(A,x0,x1,y0,y1,pad=24){ const T0=A.resTop||0, HH=A.H-T0, s=Math.min((A.W-2*pad)/(x1-x0),(HH-2*pad)/(y1-y0)), ox=(A.W-(x1-x0)*s)/2, oy=(HH-(y1-y0)*s)/2;
  return {s,X:x=>ox+(x-x0)*s,Y:y=>A.H-oy-(y-y0)*s}; }
function arrow(A,x1,y1,x2,y2,col,w=2.6){ const c=A.col[col]||col, a=Math.atan2(y2-y1,x2-x1), L=Math.hypot(x2-x1,y2-y1); if(L<2) return;
  A.el('path',{d:`M${x1} ${y1}L${x2} ${y2}`,stroke:c,'stroke-width':w,'stroke-linecap':'round'});
  A.el('path',{d:`M${x2} ${y2}L${x2-10*Math.cos(a-.45)} ${y2-10*Math.sin(a-.45)}L${x2-10*Math.cos(a+.45)} ${y2-10*Math.sin(a+.45)}Z`,fill:c}); }
const T=(A,x,y,s,col='ink2',o={})=>A.lab(x,y,s,{fill:A.col[col]||col,w:o.w??700,size:o.size||13,anchor:o.anchor,halo:1});
const poly=(A,pts,o)=>A.el('path',Object.assign({d:'M'+pts.map(p=>p.join(' ')).join('L')+'Z'},o));

const S={};
/* ---------- 3−1 related rates ---------- */
S.rIntro={v:[-7.5,1.5,-2.2,6.2],eq:1,title:'x و y تتغيران مع الزمن t',hint:'النقطة تتحرك على المنحني: معدلا تغير x و y مرتبطان',
 curves:[{f:x=>2+sq(13-(x+3)**2),dom:[-3-sq(13),-3+sq(13)]},{f:x=>2-sq(13-(x+3)**2),dom:[-3-sq(13),-3+sq(13)]}],
 sl:{min:0,max:6.283,v:1,play:1,speed:.5,lab:'الزمن t',fmt:v=>fr(v,1)},
 draw(A){ const th=A.p, x=-3+sq(13)*Math.cos(th), y=2+sq(13)*Math.sin(th), vx=-sq(13)*Math.sin(th), vy=sq(13)*Math.cos(th), k=.35;
  A.el('path',{d:`M${A.X(x)} ${A.Y(y)}V${A.Y(0)}M${A.X(x)} ${A.Y(y)}H${A.X(0)}`,stroke:A.col.muted,'stroke-width':1.2,'stroke-dasharray':'3 4'},A.G);
  arrow(A,A.X(x),A.Y(y),A.X(x+vx*k),A.Y(y),'chord'); arrow(A,A.X(x),A.Y(y),A.X(x),A.Y(y+vy*k),'tan');
  A.el('circle',{cx:A.X(x),cy:A.Y(y),r:7,fill:A.col.c,stroke:A.col.surf,'stroke-width':2.4});
  T(A,A.X(x+vx*k)+(vx>0?14:-14),A.Y(y)-10,'dx/dt','chord',{size:12}); T(A,A.X(x)+22,A.Y(y+vy*k),'dy/dt','tan',{size:12});
  A.chips.push(['c','x',fr(x)],['c','y',fr(y)],['chord','dx/dt',fr(vx)],['tan','dy/dt',fr(vy)]); }};
S.rTank={title:'خزان قاعدته مربعة ضلعها 2m',hint:'V = 4h ⇒ dV/dt = 4 dh/dt',sl:{min:.3,max:2.7,v:2.2,play:1,speed:.35,lab:'ارتفاع الماء h',fmt:v=>fr(v)+' m'},
 draw(A){ const g=fit(A,-1.2,4.2,-.6,3.8), h=A.p, dx=.9, dy=.6, X=g.X, Y=g.Y, f=A.col;
  const box=(y0,y1,fill,op,st)=>{ poly(A,[[X(0),Y(y0)],[X(2),Y(y0)],[X(2),Y(y1)],[X(0),Y(y1)]],{fill,opacity:op,stroke:st,'stroke-width':1.6});
    poly(A,[[X(2),Y(y0)],[X(2+dx),Y(y0+dy)],[X(2+dx),Y(y1+dy)],[X(2),Y(y1)]],{fill,opacity:op*.75,stroke:st,'stroke-width':1.6});
    poly(A,[[X(0),Y(y1)],[X(2),Y(y1)],[X(2+dx),Y(y1+dy)],[X(dx),Y(y1+dy)]],{fill,opacity:op*.55,stroke:st,'stroke-width':1.6}); };
  box(0,h,f.f,.32,'none'); box(0,3,'none',1,f.ink2);
  A.el('path',{d:`M${X(-.35)} ${Y(0)}V${Y(h)}`,stroke:f.c,'stroke-width':2.4}); T(A,X(-.6),Y(h/2),'h','c');
  T(A,X(1),Y(-.32),'2 m','muted'); T(A,X(2+dx/2+.35),Y(dy/2-.1),'2 m','muted');
  arrow(A,X(1),Y(h+.15),X(1),Y(h-.45),'tan');
  A.chips.push(['c','h',fr(h)+' m'],['f','V = 4h',fr(4*h)+' m³'],['chord','dV/dt','−0.4'],['tan','dh/dt','−0.1']); }};
S.rPlate={title:'صفيحة مساحتها 96 cm² ثابتة',hint:'A = xy ⇒ 0 = x dy/dt + y dx/dt',sl:{min:6,max:20,v:12,lab:'الطول x',fmt:v=>fr(v,1)+' cm'},
 draw(A){ const x=A.p, y=96/x, g=fit(A,-3,22,-3,18), X=g.X, Y=g.Y, f=A.col;
  A.el('rect',{x:X(0),y:Y(y),width:x*g.s,height:y*g.s,fill:f.f,opacity:.16,stroke:f.f,'stroke-width':2.4,rx:3});
  T(A,X(x/2),Y(0)+16,'x = '+fr(x,1),'chord'); T(A,X(0)-10,Y(y/2),'y = '+fr(y,2),'tan',{anchor:'end'});
  arrow(A,X(x)+4,Y(y/2),X(x)+40,Y(y/2),'chord'); arrow(A,X(x/2),Y(y)-4,X(x/2),Y(y)+30,'tan');
  T(A,X(x/2),Y(y/2),'96 cm²','f',{size:15});
  A.chips.push(['chord','dx/dt','2'],['tan','dy/dt',fr(-2*y/x,3)]); A.ok=abs(y-8)<.05; if(A.ok) A.hint='✓ عندما y = 8 يكون x = 12 و dy/dt = −4/3'; }};
S.rIce={title:'مكعب حرفه 8cm مغطى بالجليد',hint:'V = (8 + 2x)³ − 8³',sl:{min:0,max:3,v:1,lab:'سمك الجليد x',fmt:v=>fr(v)+' cm'},
 draw(A){ const x=A.p, g=fit(A,-4,14,-4,14), X=g.X, Y=g.Y, f=A.col, o=8+2*x, d=2.2;
  const cube=(x0,s,fill,op,st)=>{ poly(A,[[X(x0),Y(x0)],[X(x0+s),Y(x0)],[X(x0+s),Y(x0+s)],[X(x0),Y(x0+s)]],{fill,opacity:op,stroke:st,'stroke-width':1.6});
    poly(A,[[X(x0+s),Y(x0)],[X(x0+s+d),Y(x0+d)],[X(x0+s+d),Y(x0+s+d)],[X(x0+s),Y(x0+s)]],{fill,opacity:op*.7,stroke:st,'stroke-width':1.6});
    poly(A,[[X(x0),Y(x0+s)],[X(x0+s),Y(x0+s)],[X(x0+s+d),Y(x0+s+d)],[X(x0+d),Y(x0+s+d)]],{fill,opacity:op*.5,stroke:st,'stroke-width':1.6}); };
  cube(-x,o,f.tan,.18,f.tan); cube(0,8,f.f,.45,f.f);
  T(A,X(4),Y(4),'8','surf',{size:15}); if(x>.15){ A.el('path',{d:`M${X(-x)} ${Y(-x-0.6)}H${X(0)}`,stroke:f.c,'stroke-width':2.4}); T(A,X(-x/2),Y(-x-1.4),'x','c'); }
  const V=o**3-512, r=-6/(6*o*o); A.chips.push(['tan','V',fr(V,1)],['chord','dV/dt','−6'],['c','dx/dt',fr(r,4)]); }};
S.rLadder={title:'سلم طوله 10m',hint:'x² + y² = 100',sl:{min:1,max:9.6,v:8,play:0,lab:'بعد الطرف الأسفل x',fmt:v=>fr(v,1)+' m'},
 draw(A){ const x=A.p, y=sq(100-x*x), g=fit(A,-1.6,11.4,-1.6,11.2), X=g.X, Y=g.Y, f=A.col, th=Math.atan2(y,x);
  A.el('rect',{x:X(-1.2),y:Y(11),width:X(0)-X(-1.2),height:Y(0)-Y(11),fill:f.surf2,stroke:f.line});
  A.el('rect',{x:X(-1.2),y:Y(0),width:X(11.2)-X(-1.2),height:Y(-1.2)-Y(0),fill:f.surf2,stroke:f.line});
  A.el('path',{d:`M${X(x)} ${Y(0)}L${X(0)} ${Y(y)}`,stroke:f.f,'stroke-width':6,'stroke-linecap':'round'});
  A.el('path',{d:`M${X(x)-30} ${Y(0)}A30 30 0 0 1 ${X(x)-30*Math.cos(th)} ${Y(0)-30*Math.sin(th)}`,fill:'none',stroke:f.int,'stroke-width':2.2});
  T(A,X(x)-44,Y(0)-12,'θ','int'); T(A,X(x/2),Y(0)+16,'x','chord'); T(A,X(0)+14,Y(y/2),'y','tan'); T(A,(X(x)+X(0))/2+16,(Y(0)+Y(y))/2-6,'10','f');
  arrow(A,X(x),Y(0)-8,X(x)+46,Y(0)-8,'chord'); const vy=-2*x/y; arrow(A,X(0)+8,Y(y),X(0)+8,Y(y)-Math.max(-110,vy*14),'tan');
  A.chips.push(['chord','dx/dt','2'],['tan','y',fr(y,2)],['tan','dy/dt',fr(vy,3)],['int','dθ/dt',fr(vy/(10*Math.cos(th)),3)]);
  A.ok=abs(x-8)<.06; if(A.ok) A.hint='✓ عند x = 8 : y = 6 ، dy/dt = −8/3 ، dθ/dt = −1/3'; }};
S.rCone={title:'مرشح مخروطي ارتفاعه 24cm وقطر قاعدته 16cm',hint:'r/h = 8/24 ⇒ r = h/3',sl:{min:3,max:24,v:12,lab:'عمق السائل h',fmt:v=>fr(v,1)+' cm'},
 draw(A){ const h=A.p, r=h/3, g=fit(A,-13,13,-2,27), X=g.X, Y=g.Y, f=A.col;
  poly(A,[[X(0),Y(0)],[X(r),Y(h)],[X(-r),Y(h)]],{fill:f.f,opacity:.3});
  A.el('ellipse',{cx:X(0),cy:Y(h),rx:r*g.s,ry:r*g.s*.22,fill:f.f,opacity:.35});
  A.el('path',{d:`M${X(-8)} ${Y(24)}L${X(0)} ${Y(0)}L${X(8)} ${Y(24)}`,fill:'none',stroke:f.ink2,'stroke-width':2});
  A.el('ellipse',{cx:X(0),cy:Y(24),rx:8*g.s,ry:8*g.s*.22,fill:'none',stroke:f.ink2,'stroke-width':2});
  A.el('path',{d:`M${X(0)} ${Y(0)}V${Y(h)}H${X(r)}`,stroke:f.c,'stroke-width':2,'stroke-dasharray':'4 4',fill:'none'});
  T(A,X(0)-12,Y(h/2),'h','c'); T(A,X(r/2),Y(h)-10,'r','c'); T(A,X(9.5),Y(24),'8','muted'); T(A,X(-10.5),Y(12),'24','muted');
  arrow(A,X(-11),Y(29.5)+0,X(-4),Y(25.5),'tan'); T(A,X(-11),Y(26.8),'5 cm³/s','tan',{size:11});
  const dh=36/(PI*h*h); A.chips.push(['c','r = h/3',fr(r,2)],['f','V',fr(PI*h**3/27,1)],['tan','dV/dt','4'],['chord','dh/dt',fr(dh,4)]);
  A.ok=abs(h-12)<.1; if(A.ok) A.hint='✓ عند h = 12 : dh/dt = 1/(4π) ≈ 0.0796 cm/s'; }};
S.rPar={v:[-1,9,-6.5,6.5],eq:1,title:'M على القطع المكافئ y² = 4x',hint:'S = √(x² − 10x + 49)',
 curves:[{f:x=>2*sq(x),dom:[0,20]},{f:x=>-2*sq(x),dom:[0,20]}],sl:{min:.2,max:8.6,v:4,lab:'الإحداثي السيني x',fmt:v=>fr(v,2)},slx:1,
 draw(A){ const x=A.p, y=2*sq(x), S2=sq(x*x-10*x+49), G=A.G;
  A.el('path',{d:`M${A.X(x)} ${A.Y(y)}L${A.X(7)} ${A.Y(0)}`,stroke:A.col.chord,'stroke-width':3},G);
  A.el('circle',{cx:A.X(7),cy:A.Y(0),r:6,fill:A.col.int},G); T(A,A.X(7),A.Y(0)+16,'N(7 , 0)','int',{size:12});
  A.el('circle',{cx:A.X(x),cy:A.Y(y),r:8,fill:A.col.c,stroke:A.col.surf,'stroke-width':2.4,class:'handle'},G); T(A,A.X(x),A.Y(y)-16,'M','c');
  T(A,(A.X(x)+A.X(7))/2+12,(A.Y(y)+A.Y(0))/2-8,'S','chord');
  const k=(2*x-10)/(2*S2); A.chips.push(['chord','S',fr(S2,3)],['tan','dS/dx',fr(k,3)],['c','dx/dt = 0.2 ÷ dS/dx',fr(.2/k,3)]);
  A.ok=abs(x-4)<.05; if(A.ok) A.hint='✓ عند x = 4 : S = 5 ، dx/dt = −1'; }};
S.rShadow={title:'عمود 7.2m ورجل طوله 1.8m',hint:'تشابه المثلثين: (x + s)/7.2 = s/1.8 ⇒ s = x/3',sl:{min:1,max:16,v:6,play:1,speed:.4,lab:'بعد الرجل x',fmt:v=>fr(v,1)+' m'},
 draw(A){ const x=A.p, s=x/3, g=fit(A,-1.5,23,-1.2,8.4), X=g.X, Y=g.Y, f=A.col;
  A.el('path',{d:`M${X(-1.5)} ${Y(0)}H${X(23)}`,stroke:f.ink2,'stroke-width':2});
  A.el('path',{d:`M${X(0)} ${Y(0)}V${Y(7.2)}`,stroke:f.ink2,'stroke-width':5}); A.el('circle',{cx:X(0),cy:Y(7.2),r:8,fill:'#ffc94d'});
  poly(A,[[X(0),Y(7.2)],[X(x+s),Y(0)],[X(x),Y(0)]],{fill:f.chord,opacity:.08});
  A.el('path',{d:`M${X(0)} ${Y(7.2)}L${X(x+s)} ${Y(0)}`,stroke:'#e0a800','stroke-width':1.5,'stroke-dasharray':'5 5'});
  A.el('path',{d:`M${X(x)} ${Y(0)}V${Y(1.8)}`,stroke:f.f,'stroke-width':6,'stroke-linecap':'round'}); A.el('circle',{cx:X(x),cy:Y(1.8)-6,r:6,fill:f.f});
  A.el('path',{d:`M${X(x)} ${Y(0)}H${X(x+s)}`,stroke:f.chord,'stroke-width':6,'stroke-linecap':'round'});
  T(A,X(x/2),Y(0)+16,'x','c'); T(A,X(x+s/2),Y(0)+16,'s','chord'); T(A,X(0)-14,Y(3.6),'7.2','muted',{anchor:'end'}); T(A,X(x)+12,Y(1),'1.8','f',{anchor:'start'});
  A.chips.push(['c','dx/dt','30'],['chord','s = x/3',fr(s,2)],['chord','ds/dt','10 m/min']); }};
S.rBox={title:'متوازي سطوح قاعدته مربعة',hint:'V = x²h',sl:{min:2,max:6,v:4,lab:'ضلع القاعدة x',fmt:v=>fr(v,1)+' cm'},
 draw(A){ const x=A.p, h=3+(4-x)*(.5/.3), g=fit(A,-1,9.5,-1,9), X=g.X, Y=g.Y, f=A.col, dx=x*.45, dy=x*.3;
  const H2=Math.max(.3,h);
  poly(A,[[X(0),Y(0)],[X(x),Y(0)],[X(x),Y(H2)],[X(0),Y(H2)]],{fill:f.f,opacity:.25,stroke:f.f,'stroke-width':2});
  poly(A,[[X(x),Y(0)],[X(x+dx),Y(dy)],[X(x+dx),Y(H2+dy)],[X(x),Y(H2)]],{fill:f.f,opacity:.18,stroke:f.f,'stroke-width':2});
  poly(A,[[X(0),Y(H2)],[X(x),Y(H2)],[X(x+dx),Y(H2+dy)],[X(dx),Y(H2+dy)]],{fill:f.f,opacity:.1,stroke:f.f,'stroke-width':2});
  T(A,X(x/2),Y(0)+16,'x','chord'); T(A,X(0)-12,Y(H2/2),'h','tan');
  A.chips.push(['chord','dx/dt','0.3'],['tan','dh/dt','−0.5'],['f','dV/dt = 2xh·dx/dt + x²·dh/dt',fr(2*x*H2*.3-.5*x*x,2)]); }};
S.rCirc={v:[-15,11,-9,17],eq:1,title:'x² + y² + 4x − 8y = 108',hint:'2x + 4 = −(2y − 8) ⇒ x + y = 2',
 curves:[{f:x=>4+sq(128-(x+2)**2),dom:[-2-sq(128),-2+sq(128)]},{f:x=>4-sq(128-(x+2)**2),dom:[-2-sq(128),-2+sq(128)]},{f:x=>2-x,col:'chord',dash:'6 6',w:1.8}],
 pts:[[-2,4,'(−2 , 4)','muted']]};
S.rCircOk=Object.assign({},S.rCirc,{pts:[[-2,4,'(−2 , 4)','muted'],[6,-4,'(6 , −4)','c'],[-10,12,'(−10 , 12)','c']],hint:'النقطتان (6 , −4) و (−10 , 12)'});
S.rPx={v:[-3.2,3.2,-.6,4.8],eq:1,f:x=>x*x,title:'M على القطع المكافئ y = x²',hint:'S² = x² + (y − 3/2)² = y + (y − 3/2)²',pts:[[0,1.5,'(0 , 3/2)','int']]};
S.rPxOk=Object.assign({},S.rPx,{pts:[[0,1.5,'(0 , 3/2)','int'],[sq(2),2,'(√2 , 2)','c'],[-sq(2),2,'(−√2 , 2)','c']],segs:[[0,1.5,sq(2),2,'chord'],[0,1.5,-sq(2),2,'chord']]});
S.rLad60=Object.assign({},S.rLadder,{title:'سلم: الزاوية π/3',hint:'dy/dt = −(x/y)·dx/dt = −2 cot θ',sl:{min:1,max:9.6,v:5,lab:'x (السلم 10 للتوضيح)',fmt:v=>fr(v,1)}});

/* ---------- 3−2 Rolle & critical numbers ---------- */
S.ext={v:[-2.6,2.6,-3,3],f:x=>x**3-3*x,title:'قيمة عظمى وقيمة صغرى داخل الفترة',hint:'المماس أفقي عند القيمة العظمى والصغرى',a:-2,b:2,
 segs:[[-2,2,0,2,'tan',0,2.4],[0,-2,2,-2,'tan',0,2.4]],pts:[[-1,2,'f′(c) = 0','tan'],[1,-2,'f′(c) = 0','tan',{dy:16}]]};
S.abs={v:[-1.6,1.6,-.5,1.6],eq:1,f:x=>abs(x),a:-1,b:1,title:'f(x) = |x| على [−1 , 1]',hint:'أصغر قيمة عند x = 0 لكن f′(0) غير موجودة',
 pts:[[-1,1,'أعظم','chord'],[1,1,'أعظم','chord'],[0,0,'أصغر · زاوية','c',{dy:16}]]};
S.crit={...S.abs,title:'العدد الحرج',hint:'0 عدد حرج لأن f غير قابلة للاشتقاق عنده',pts:[[0,0,'(0 , f(0)) نقطة حرجة','c',{dy:16}]]};
S.rolle={v:[-.8,4.8,-.8,5],f:x=>(2-x)**2,a:0,b:4,chord:1,tan:1,c:3.2,drag:1,zero:1,title:'مبرهنة رول: f(a) = f(b)',hint:'اسحب c حتى يصبح المماس أفقياً'};
S.e2a={...S.rolle,drag:0,c:2,par:1,interval:1,title:'مثال 2 a : c = 2',hint:'f(0) = f(4) = 4 ، f′(2) = 0'};
S.e2b={v:[-1.6,1.6,-7,13],f:x=>9*x+3*x*x-x**3,a:-1,b:1,chord:1,interval:1,title:'مثال 2 b',hint:'f(−1) = −5 ≠ f(1) = 11 : الشرط الثالث لم يتحقق'};
S.e2c={v:[-4.6,2.6,-2,5.6],a:-4,b:2,title:'مثال 2 c : دالة متعددة القاعدة',hint:'الغايتان عند −1 غير متساويتين: الدالة غير مستمرة',
 curves:[{f:x=>x*x+1,dom:[-1,2],w:3.2},{f:x=>-1,dom:[-4,-1],w:3.2}],pts:[[-1,2,'L₁ = 2','f',{dx:22}],[-1,-1,'L₂ = −1','bad',{open:1,dy:16}],[-4,-1,'','f'],[2,5,'','f']]};
S.e2d={v:[-.5,5.5,-.5,4],a:1,b:4,f:x=>2.5,chord:1,tan:1,c:2.5,drag:1,zero:1,interval:1,title:'مثال 2 d : f(x) = k',hint:'كل c في (a , b) تحقق f′(c) = 0',Al:'',Bl:''};
S.q1a={v:[-3.8,3.8,-12,12],f:x=>x**3-9*x,a:-3,b:3,chord:1,interval:1,title:'تمرين 1 a',hint:'f(−3) = f(3) = 0'};
S.q1aOk={...S.q1a,pts:[[sq(3),-6*sq(3),'c = √3','c',{dy:16}],[-sq(3),6*sq(3),'c = −√3','c']],segs:[[-3,6*sq(3),0,6*sq(3),'tan'],[0,-6*sq(3),3,-6*sq(3),'tan']]};
S.q1b={v:[0,2.6,0,6],f:x=>2*x+2/x,a:.5,b:2,chord:1,interval:1,title:'تمرين 1 b',hint:'f(1/2) = f(2) = 5',dom:[.05,3]};
S.q1bOk={...S.q1b,tan:1,c:1,title:'تمرين 1 b : c = 1'};
S.q1c={v:[-2.2,2.2,-1,10],f:x=>(x*x-3)**2,a:-1,b:1,chord:1,interval:1,title:'تمرين 1 c',hint:'f(−1) = f(1) = 4'};
S.q1cOk={...S.q1c,tan:1,c:0,title:'تمرين 1 c : c = 0'};
S.q6a={v:[-1.6,3.6,-2,18],f:x=>(x-1)**4,a:-1,b:3,chord:1,interval:1,title:'تمرين 6 a'};
S.q6aOk={...S.q6a,tan:1,c:1};
S.q6b={v:[-1.6,1.6,-1,1],f:x=>x**3-x,a:-1,b:1,chord:1,interval:1,title:'تمرين 6 b'};
S.q6bOk={...S.q6b,segs:[[-1,2/(3*sq(3)),.2,2/(3*sq(3)),'tan'],[-.2,-2/(3*sq(3)),1,-2/(3*sq(3)),'tan']],pts:[[-1/sq(3),2/(3*sq(3)),'','c'],[1/sq(3),-2/(3*sq(3)),'','c']]};
S.q6c={v:[-1.6,4.6,-3,5],f:x=>x*x-3*x,a:-1,b:4,chord:1,interval:1,title:'تمرين 6 c'};
S.q6cOk={...S.q6c,tan:1,c:1.5};
S.q6d={v:[-.4,6.7,-2,3.6],f:x=>Math.cos(2*x)+2*Math.cos(x),a:0,b:2*PI,chord:1,interval:1,title:'تمرين 6 d',bl:'2π',xfmt:x=>fr(x,1)};
S.q6dOk={...S.q6d,pts:[[2*PI/3,-1.5,'2π/3','c',{dy:16}],[PI,-1,'π','c'],[4*PI/3,-1.5,'4π/3','c',{dy:16}]]};

/* ---------- 3−2−5 mean value theorem (from the approved prototype) ---------- */
const cubic={f:x=>x**3-4*x*x,d:x=>3*x*x-8*x}, quad={f:x=>x*x-6*x+4,d:x=>2*x-6}, semi={f:x=>sq(Math.max(0,25-x*x)),d:x=>-x/sq(25-x*x),dom:[-5,5]};
const MV=(fn,o)=>Object.assign({},fn,o), V1=[-.5,2.6,-9.2,1.6];
S.mHook=MV(cubic,{a:0,b:2,v:V1,chord:1,tan:1,c:1.6,drag:1,title:'اسحب c',hint:'اسحب النقطة c حتى يصبح المماس موازياً للوتر'});
S.mCond=MV(cubic,{a:0,b:2,v:V1,chord:1,tan:1,c:2/3,interval:1,title:'شروط المبرهنة',hint:'مستمرة على [a , b] وقابلة للاشتقاق على (a , b)',cfmt:c=>abs(c-2/3)<.004?'2/3':fr(c)});
S.mChord=MV(cubic,{a:0,b:2,v:V1,chord:1,tri:1,title:'الوتر AB',hint:'ميل الوتر = Δy ÷ Δx'});
S.mTan=MV(cubic,{a:0,b:2,v:V1,chord:.25,tan:1,c:1.25,drag:1,title:'المماس عند c',hint:'اسحب c وراقب ميل المماس f′(c)'});
S.mPar=MV(cubic,{a:0,b:2,v:V1,chord:1,tan:1,c:2/3,title:'متوازيان',hint:'عند c = 2/3 يتساوى الميلان: −4',cfmt:()=>'2/3'});
S.mRolle={v:[-.8,4.8,-.8,5],f:x=>(2-x)**2,a:0,b:4,chord:1,tan:1,c:2,title:'حالة رول: f(a) = f(b)',hint:'الوتر أفقي، فالمماس أفقي: f′(c) = 0'};
const VQ=[-2,8,-6.5,13];
S.e3a0=MV(quad,{a:-1,b:7,v:VQ,title:'مثال 3 a'});
S.e3a1=MV(quad,{a:-1,b:7,v:VQ,interval:1,title:'مثال 3 a · الشرطان',hint:'كثيرة حدود: مستمرة وقابلة للاشتقاق'});
S.e3a2=MV(quad,{a:-1,b:7,v:VQ,tan:1,c:5,drag:1,title:'مثال 3 a · ميل المماس',hint:'اسحب c: ميل المماس 2c − 6'});
S.e3a3=MV(quad,{a:-1,b:7,v:VQ,chord:1,tri:1,title:'مثال 3 a · ميل الوتر',hint:'f(−1) = f(7) = 11 ⇒ الوتر أفقي'});
S.e3a4=MV(quad,{a:-1,b:7,v:VQ,chord:1,tan:1,c:3,title:'مثال 3 a · c = 3',hint:'c = 3 ∈ (−1 , 7)'});
const VS=[-6,6,-.8,6.2], sc5=c=>abs(abs(c)-sq(5))<.004?(c<0?'−√5':'√5'):fr(c);
S.e3b0=MV(semi,{a:-4,b:0,v:VS,eq:1,title:'مثال 3 b'});
S.e3b1=MV(semi,{a:-4,b:0,v:VS,eq:1,interval:1,pts:[[-5,0,'−5','f',{dy:16}],[5,0,'5','f',{dy:16}]],title:'مثال 3 b · المجال',hint:'المجال [−5 , 5]، والفترة [−4 , 0] داخله'});
S.e3b2=MV(semi,{a:-4,b:0,v:VS,eq:1,tan:1,c:-2,drag:1,title:'مثال 3 b · f′(x)',hint:'اسحب c: ميل المماس −c ÷ √(25 − c²)'});
S.e3b3=MV(semi,{a:-4,b:0,v:VS,eq:1,chord:1,tri:1,title:'مثال 3 b · ميل الوتر',hint:'(5 − 3) ÷ 4 = 1/2'});
S.e3b4=MV(semi,{a:-4,b:0,v:VS,eq:1,chord:1,tan:1,c:-sq(5),cfmt:sc5,title:'مثال 3 b',hint:'c² = 5'});
S.e3b5=MV(semi,{a:-4,b:0,v:VS,eq:1,chord:1,tan:1,c:-sq(5),cfmt:sc5,reject:[sq(5),'c = √5 ✗'],title:'مثال 3 b · c = −√5',hint:'c = √5 خارج الفترة فتُرفض'});
const V4=[-.6,4.4,-10,10];
S.e40=MV(cubic,{a:0,b:3,v:V4,c:2/3,tan:1,cfmt:()=>'2/3',title:'مثال 4'});
S.e41=MV(cubic,{a:0,b:3,v:V4,tan:1,c:2/3,cfmt:()=>'2/3',title:'مثال 4 · f′(2/3) = −4',hint:'ميل المماس عند c = 2/3 هو −4'});
S.e42=MV(cubic,{a:0,b:3.4,v:V4,chord:1,tan:1,c:2/3,cfmt:()=>'2/3',sweep:[2,3.4],title:'مثال 4 · ميل الوتر = b² − 4b',hint:'b يتغير: متى يصبح ميل الوتر −4؟'});
S.e43=MV(cubic,{a:0,b:2,v:V4,chord:1,tan:1,c:2/3,cfmt:()=>'2/3',title:'مثال 4 · b = 2',hint:'b = 2 : الوتر يوازي المماس'});
S.p7a={f:x=>x**3-x-1,d:x=>3*x*x-1,a:-1,b:2,v:[-1.6,2.6,-2.6,6],chord:1,interval:1,title:'تمرين 7 a',hint:'جد c ثم تحقّق'};
S.p7aOk={...S.p7a,tan:1,c:1,reject:[-1,'c = −1 ✗'],hint:'c = 1 ، و c = −1 مرفوضة'};
S.p7b={f:x=>x*x-4*x+5,a:-1,b:5,v:[-2,6,-1,11],chord:1,interval:1,title:'تمرين 7 b',hint:'جد c ثم تحقّق'};
S.p7bOk={...S.p7b,tan:1,c:2};
S.p7c={f:x=>4/(x+2),dom:[-1.95,9],a:-1,b:2,v:[-1.6,2.6,-.5,4.6],chord:1,interval:1,title:'تمرين 7 c',hint:'جد c ثم تحقّق'};
S.p7cOk={...S.p7c,tan:1,c:0,hint:'c = 0 ، و c = −4 مرفوضة'};
S.p7d={f:x=>cb((x+1)**2),a:-2,b:7,v:[-2.6,7.6,-.6,4.4],chord:1,interval:1,cusp:-1,title:'تمرين 7 d',hint:'انتبه إلى النقطة x = −1'};

/* ---------- 3−2−6 approximation ---------- */
S.aIdea={v:[-.5,6,-.5,4],f:x=>sq(Math.max(0,x)),dom:[0,9],apx:[1,4],title:'f(a + h) ≈ f(a) + h f′(a)',hint:'كلما صغرت h اقترب المماس من المنحني',sl:{min:1.05,max:5.5,v:4,lab:'b = a + h',fmt:v=>fr(v,2)},
 draw(A){ } };
S.aIdea.apx=null; S.aIdea.draw=function(A){ const b=A.p, a=1, f=A.f, s=A.d1(a), yb=f(b), yt=f(a)+(b-a)*s, X=A.X, Y=A.Y, G=A.G, c=A.col;
  A.line(a,f(a),s,c.tan,{w:2.2}); A.el('path',{d:`M${X(a)} ${Y(f(a))}H${X(b)}`,stroke:c.chord,'stroke-width':1.6,'stroke-dasharray':'4 4'},G);
  A.el('path',{d:`M${X(b)} ${Y(f(a))}V${Y(yt)}`,stroke:c.tan,'stroke-width':3},G); A.el('path',{d:`M${X(b)} ${Y(yt)}V${Y(yb)}`,stroke:c.bad,'stroke-width':3},G);
  [[a,f(a),c.f],[b,yb,c.f],[b,yt,c.tan]].forEach(([x,y,col])=>A.el('circle',{cx:X(x),cy:Y(y),r:5.5,fill:col,stroke:c.surf,'stroke-width':2},G));
  T(A,X(a),Y(f(a))+16,'a','c'); T(A,(X(a)+X(b))/2,Y(f(a))+14,'h','chord'); T(A,X(b)+8,(Y(f(a))+Y(yt))/2,'h f′(a)','tan',{anchor:'start',size:12});
  A.chips.push(['f','f(a + h)',fr(yb,4)],['tan','f(a) + h f′(a)',fr(yt,4)],['bad','الخطأ',fr(abs(yb-yt),4)]); };
S.a5={v:[22,29,4.4,5.6],f:x=>sq(x),apx:[25,26],title:'مثال 5 · √26',hint:'a = 25 ، h = 1',sx:1,sy:.2};
S.a6={v:[.9,1.12,11,15.5],f:x=>x**3+3*x*x+4*x+5,apx:[1,1.08],title:'مثال 6 · f(1.001)',hint:'h = 0.001 صغيرة جداً (الرسم مكبّر بـ h = 0.08 للتوضيح)',sx:.05,sy:1};
S.a7={v:[9.6,10.2,880,1060],f:x=>x**3,apx:[10,9.8],title:'مثال 7 · (9.98)³',hint:'a = 10 ، h = −0.02 (مكبّر للتوضيح)',sx:.1,sy:25};
S.a8={v:[6,10.5,3,5],f:x=>cb(x*x),apx:[8,9.5],title:'مثال 8 · ∛(x²)',hint:'التغير التقريبي = h f′(8) (h مكبّرة للتوضيح)',sx:.5,sy:.5};
S.a9={title:'طلاء مكعب ضلعه 10cm بسمك 0.15cm',hint:'حرف المكعب بعد الطلاء = 10 + 2(0.15) = 10.3',
 draw(A){ const g=fit(A,-2,15,-2,15), X=g.X, Y=g.Y, f=A.col, d=2.6;
  const cube=(x0,s,fill,op,st)=>{ poly(A,[[X(x0),Y(x0)],[X(x0+s),Y(x0)],[X(x0+s),Y(x0+s)],[X(x0),Y(x0+s)]],{fill,opacity:op,stroke:st,'stroke-width':1.6});
    poly(A,[[X(x0+s),Y(x0)],[X(x0+s+d),Y(x0+d)],[X(x0+s+d),Y(x0+s+d)],[X(x0+s),Y(x0+s)]],{fill,opacity:op*.7,stroke:st,'stroke-width':1.6});
    poly(A,[[X(x0),Y(x0+s)],[X(x0+s),Y(x0+s)],[X(x0+s+d),Y(x0+s+d)],[X(x0+d),Y(x0+s+d)]],{fill,opacity:op*.5,stroke:st,'stroke-width':1.6}); };
  cube(-.6,11.2,f.chord,.25,f.chord); cube(0,10,f.f,.4,f.f); A.lab(X(5),Y(5),'10 cm',{fill:'#fff',w:700,size:14});
  A.chips.push(['f','a','10'],['chord','h','0.3'],['tan','h v′(10)','90 cm³']); }};
S.a10b={v:[6,10.5,1.7,2.3],f:x=>cb(x),apx:[8,6.6],title:'مثال 10 b · ∛7.8',hint:'a = 8 ، h = −0.2 (مكبّرة للتوضيح)',sx:.5,sy:.1};

/* ---------- 3−3 increasing / decreasing ---------- */
S.iHook={v:[-3,3,-1,6],f:x=>x*x,title:'متى تصعد الدالة ومتى تنزل؟',hint:'اسحب c وراقب إشارة ميل المماس',tan:1,c:1.2,drag:1,a:-2.6,b:2.6,tl:'f′(c)',cl:'x'};
S.i1={v:[-3,3,-1,6],f:x=>x*x,mono:1,sign:{lab:'y′',z:[0],s:'-+',w:['متناقصة','متزايدة']},title:'مثال 1 · y = x²',hint:'y′ = 2x : سالبة قبل 0 وموجبة بعده'};
S.i2a={v:[-2.6,5,-8,30],f:x=>9*x+3*x*x-x**3,mono:1,sign:{z:[-1,3],s:'-+-',w:['متناقصة','متزايدة','متناقصة']},pts:[[-1,-5,'','c'],[3,27,'','c']],title:'مثال 2 a',hint:'f′(x) = −3(x − 3)(x + 1)'};
S.i2b={v:[-4,4,-.5,3],f:x=>cb(x*x),mono:1,sign:{z:[0],u:[0],s:'-+',w:['متناقصة','متزايدة']},title:'مثال 2 b · ∛(x²)',hint:'f′(x) غير معرفة عند x = 0 : عدد حرج'};

/* ---------- 3−4 local extrema ---------- */
S.xIdea={v:[-.4,4.4,-1,4],f:x=>.5*(x-1)*(x-3)*(x-.2)+2,mono:1,title:'نهاية عظمى ونهاية صغرى محلية',hint:'عند c و d يكون المماس أفقياً'};
(()=>{ const f=x=>.5*(x-1)*(x-3)*(x-.2)+2; // f′ = .5(3x² − 8.4x + 3.8)
  const dd=sq(8.4**2-4*3*3.8), c=(8.4-dd)/6, d=(8.4+dd)/6; S.xIdea.pts=[[c,f(c),'(c , f(c))','tan'],[d,f(d),'(d , f(d))','bad',{dy:18}]];
  S.xIdea.segs=[[c-.6,f(c),c+.6,f(c),'ink2',1],[d-.6,f(d),d+.6,f(d),'ink2',1]]; S.xIdea.labs=[[0.05,-.6,'a','int'],[4.2,-.6,'b','int']]; })();
S.x3a={v:[-.6,4.6,-.5,5.6],f:x=>1+(x-2)**2,mono:1,sign:{z:[2],s:'-+'},pts:[[2,1,'(2 , 1) صغرى','bad',{dy:18}]],title:'مثال 3 a',hint:'f′ تتغير من − إلى + : نهاية صغرى محلية'};
S.x3b={v:[-.6,4.6,-4.6,1.6],f:x=>1-(x-2)**2,mono:1,sign:{z:[2],s:'+-'},pts:[[2,1,'(2 , 1) عظمى','ok']],title:'مثال 3 b',hint:'f′ تتغير من + إلى − : نهاية عظمى محلية'};
S.x3c={v:[-.4,5.6,-2,26],f:x=>x**3-9*x*x+24*x,mono:1,sign:{z:[2,4],s:'+-+'},pts:[[2,20,'(2 , 20) عظمى','ok'],[4,16,'(4 , 16) صغرى','bad',{dy:18}]],title:'مثال 3 c',hint:'f′(x) = 3(x − 4)(x − 2)'};
S.xNone={v:[-2,2,-3,3],f:x=>x**3,mono:1,sign:{z:[0],s:'++'},pts:[[0,0,'لا نهاية','muted',{dy:-16}]],title:'لا توجد نهايات',hint:'إشارة f′ لا تتغير قبل وبعد x₁'};

/* ---------- 3−5 concavity ---------- */
const tangents=(f,d,xs)=>A=>{ xs.forEach(x=>{ const y=f(x), m=d(x); A.el('path',{d:`M${A.X(x-1)} ${A.Y(y-m)}L${A.X(x+1)} ${A.Y(y+m)}`,stroke:A.col.tan,'stroke-width':1.8},A.G); A.el('circle',{cx:A.X(x),cy:A.Y(y),r:3.5,fill:A.col.tan},A.G); }); };
S.cUp={v:[-2.6,2.6,-1,5],f:x=>x*x,conc:1,title:'(A) منحني مقعر',hint:'المنحني فوق جميع مماساته ، والمشتقة f′ متزايدة',draw:tangents(x=>x*x,x=>2*x,[-1.6,-.8,0,.8,1.6])};
S.cDown={v:[-2.6,2.6,-5,1],f:x=>-x*x,conc:1,title:'(B) منحني محدب',hint:'المنحني تحت جميع مماساته ، والمشتقة f′ متناقصة',draw:tangents(x=>-x*x,x=>-2*x,[-1.6,-.8,0,.8,1.6])};
S.c1a={v:[-3,3,-1,6],f:x=>x*x,conc:1,title:'مثال 1 a · f(x) = x²',hint:'f″(x) = 2 > 0 لكل x : مقعرة على R',sign:{lab:'f″(x)',z:[],s:'+',w:['مقعرة']}};
S.c1b={v:[-2,2,-3,3],f:x=>x**3,conc:1,title:'مثال 1 b · f(x) = x³',hint:'تتغير إشارة f″ عند 0 : نقطة انقلاب',sign:{lab:'f″(x)',z:[0],s:'-+',w:['محدبة','مقعرة']},pts:[[0,0,'(0 , 0)','c',{dy:16,dx:22}]]};
S.c2={v:[-2.5,3.5,-22,12],f:x=>2*x**3-3*x*x-12*x+1,conc:1,sign:{lab:'f″(x)',z:[.5],zl:['1/2'],s:'-+',w:['محدبة','مقعرة']},pts:[[.5,-5.5,'(1/2 , −11/2)','c',{dx:52}]],title:'مثال 2',hint:'f″(x) = 12x − 6'};
S.c3a={v:[-1.6,4.4,-12,32],f:x=>4*x**3-x**4,conc:1,sign:{lab:'f″(x)',z:[0,2],s:'-+-',w:['محدبة','مقعرة','محدبة']},pts:[[0,0,'(0 , 0)','c',{dy:16}],[2,16,'(2 , 16)','c'],[3,27,'(3 , 27)','muted']],title:'مثال 3 a',hint:'f″(x) = 12x(2 − x)'};
S.c3b={v:[-4.5,4.5,-6,6],f:x=>x+1/x,brk:[0],conc:1,asy:{v:[0]},sign:{lab:'f″(x)',z:[0],u:[0],s:'-+',w:['محدبة','مقعرة']},title:'مثال 3 b',hint:'0 لا ينتمي لمجال الدالة: لا توجد نقطة انقلاب'};
S.c3c={v:[-4.6,.6,-6,5.4],f:x=>4-(x+2)**4,conc:1,sign:{lab:'h″(x)',z:[-2],s:'--',w:['محدبة','محدبة']},pts:[[-2,4,'(−2 , 4)','tan']],title:'مثال 3 c',hint:'محدبة على جهتي −2 : لا انقلاب'};
S.c3d={v:[-4.5,2.5,-6,5],f:x=>3-2*x-x*x,conc:1,sign:{lab:'f″(x)',z:[],s:'-',w:['محدبة']},title:'مثال 3 d',hint:'f″(x) = −2 < 0'};
S.c3e={v:[-2,2,-4,6],f:x=>x**4+3*x*x-3,conc:1,sign:{lab:'f″(x)',z:[],s:'+',w:['مقعرة']},title:'مثال 3 e',hint:'f″(x) = 12x² + 6 > 0'};

/* ---------- 3−6 second derivative test ---------- */
S.t1a={v:[-1.4,3.4,-6,3.4],f:x=>6*x-3*x*x-1,pts:[[1,2,'عظمى (1 , 2)','ok']],segs:[[0,2,2,2,'tan']],title:'مثال 1 a',hint:'f″(1) = −6 < 0 ⇒ عظمى محلية'};
S.t1b={v:[-6,4,-10,6],f:x=>x-4/(x*x),brk:[0],asy:{v:[0]},pts:[[-2,-3,'عظمى (−2 , −3)','ok']],title:'مثال 1 b',hint:'f″(−2) = −24/16 < 0'};
S.t1c={v:[-3,5.4,-32,12],f:x=>x**3-3*x*x-9*x,pts:[[-1,5,'عظمى (−1 , 5)','ok'],[3,-27,'صغرى (3 , −27)','bad',{dy:18}]],title:'مثال 1 c',hint:'f″(3) = 12 > 0 ، f″(−1) = −12 < 0'};
S.t1d={v:[-3.6,1.6,-6,5.4],f:x=>4-(x+1)**4,mono:1,sign:{z:[-1],s:'+-'},pts:[[-1,4,'عظمى (−1 , 4)','ok']],title:'مثال 1 d',hint:'f″(−1) = 0 : الاختبار لا يصح فنعود إلى f′'};
S.t2={v:[-3,3,-3,8],f:x=>x*x-1/x,brk:[0],asy:{v:[0]},pts:[[1,0,'انقلاب (1 , 0)','c',{dy:16,dx:26}],[-cb(.5),cb(.25)+cb(2),'صغرى','bad',{dy:18}]],title:'مثال 2 · f(x) = x² − 1/x',hint:'a = −1 ، والنقطة الحرجة الوحيدة صغرى محلية'};
S.t3={v:[-3,3.6,-12,6],f:x=>x**3-1.5*x*x-6*x,pts:[[-1,3.5,'عظمى','ok'],[2,-10,'صغرى','bad',{dy:18}],[.5,-3.25,'(1/2 , −13/4)','c',{dx:48}]],title:'مثال 3',hint:'a = −3/2 ، b = −6'};
S.t4={v:[-1.5,4,-4,9],f:x=>-(x**3)+3*x*x+1,curves:[{f:x=>28-9*x,col:'tan',w:2}],pts:[[3,1,'(3 , 1)','c',{dx:24}],[1,3,'انقلاب (1 , 3)','int']],title:'مثال 4',hint:'a = −1 ، b = 3 ، c = 1'};
S.t5={v:[-1.5,3.5,-1,10],f:x=>-(x**3)+3*x*x+4,mono:1,sign:{z:[0,2],s:'-+-'},pts:[[2,8,'عظمى (2 , 8)','ok'],[0,4,'صغرى (0 , 4)','bad',{dy:18}]],title:'مثال 5',hint:'a = −1 ، c = 4'};
S.q2={v:[-.5,4.5,-4,8],f:x=>6-(x-2)**4,mono:1,sign:{z:[2],s:'+-'},pts:[[2,6,'(2 , 6)','ok']],title:'تمرين 2'};
S.q3={v:[-2.5,4.5,-30,14],f:x=>x**3-3*x*x-9*x,curves:[{f:x=>1-12*x,col:'tan',w:2}],pts:[[1,-11,'(1 , −11)','c',{dx:30}]],title:'تمرين 3'};
S.q4={v:[-1.5,3.5,2,12],f:x=>3*x*x-x**3+6,curves:[{f:x=>3*x+5,col:'tan',w:2}],pts:[[0,6,'صغرى (0 , 6)','bad',{dy:18}],[1,8,'انقلاب (1 , 8)','c',{dx:-40}]],title:'تمرين 4'};
S.q5={v:[-2.5,4,-30,10],f:x=>x**3-3*x*x-9*x,conc:1,pts:[[-1,5,'(−1 , 5)','ok']],title:'تمرين 5'};
S.q7={v:[-2,3.5,-4.5,3],f:x=>x*x-x-3,curves:[{f:x=>3*x-7,col:'tan',w:2}],pts:[[2,-1,'(2 , −1)','c',{dx:30}],[.5,-3.25,'صغرى (1/2 , −13/4)','bad',{dy:18}]],title:'تمرين 7'};

/* ---------- 3−7 graphing ---------- */
const G=o=>Object.assign({mono:0},o);
S.g1={v:[-2.2,2.2,-34,34],f:x=>x**5,conc:1,pts:[[0,0,'(0 , 0)','c',{dx:26,dy:10}],[1,1,'','f'],[-1,-1,'','f'],[2,32,'(2 , 32)','f',{dx:-30}],[-2,-32,'(−2 , −32)','f',{dx:36}]],title:'مثال 1 · f(x) = x⁵',hint:'متناظر حول نقطة الأصل ، متزايدة دائماً ، انقلاب عند (0 , 0)',sign:{lab:'f″(x)',z:[0],s:'-+',w:['محدبة','مقعرة']}};
S.g2={v:[-1.6,3.6,-1,6],f:x=>x**3-3*x*x+4,pts:[[0,4,'عظمى (0 , 4)','ok'],[2,0,'صغرى (2 , 0)','bad',{dy:16}],[1,2,'انقلاب (1 , 2)','c',{dx:44}],[3,4,'','f'],[-1,0,'','f']],title:'مثال 2 · y = x³ − 3x² + 4',hint:'متزايدة ثم متناقصة ثم متزايدة'};
S.g2m={...S.g2,mono:1,sign:{z:[0,2],s:'+-+'},hint:'f′(x) = 3x² − 6x'};
S.g2c={...S.g2,conc:1,sign:{lab:'f″(x)',z:[1],s:'-+',w:['محدبة','مقعرة']},hint:'f″(x) = 6x − 6'};
S.g3={v:[-6,4,-6,10],f:x=>(3*x-1)/(x+1),brk:[-1],asy:{v:[-1],h:[3]},pts:[[0,-1,'(0 , −1)','c',{dx:30}],[1/3,0,'(1/3 , 0)','c',{dy:14,dx:28}]],title:'مثال 3 · f(x) = (3x − 1)/(x + 1)',hint:'محاذي عمودي x = −1 ، أفقي y = 3'};
S.g3m={...S.g3,mono:1,sign:{z:[-1],u:[0],s:'++'},hint:'f′(x) = 4/(x + 1)² > 0'};
S.g3c={...S.g3,conc:1,sign:{lab:'f″(x)',z:[-1],u:[0],s:'+-',w:['مقعرة','محدبة']},hint:'f″(x) = −8/(x + 1)³'};
S.g4={v:[-3.5,3.5,-.4,1.3],f:x=>x*x/(x*x+1),asy:{h:[1]},pts:[[0,0,'صغرى (0 , 0)','bad',{dy:16}],[1/sq(3),.25,'','c'],[-1/sq(3),.25,'','c']],title:'مثال 4 · f(x) = x²/(x² + 1)',hint:'متناظر حول محور الصادات ، محاذي أفقي y = 1'};
S.g4c={...S.g4,conc:1,sign:{lab:'f″(x)',z:[-1/sq(3),1/sq(3)],zl:['−1/√3','1/√3'],s:'-+-',w:['محدبة','مقعرة','محدبة']},hint:'نقطتا الانقلاب (±1/√3 , 1/4)'};
const blank=(v,t)=>({v,title:t,hint:'ارسم المنحني في دفترك ثم أظهر الحل'});
const GX=[
 [[-7,4,-4,16],x=>10-3*x-x*x,{pts:[[-1.5,12.25,'عظمى (−3/2 , 49/4)','ok'],[-5,0,'','c'],[2,0,'','c'],[0,10,'','c']]}],
 [[-5,1.5,-2,6],x=>x*x+4*x+3,{pts:[[-2,-1,'صغرى (−2 , −1)','bad',{dy:16}],[-1,0,'','c'],[-3,0,'','c'],[0,3,'','c']]}],
 [[-1,3,-4,9],x=>(1-x)**3+1,{pts:[[1,1,'انقلاب (1 , 1)','c',{dx:44}],[0,2,'','c'],[2,0,'','c']]}],
 [[-3.5,3.5,-9,9],x=>6*x-x**3,{pts:[[sq(2),4*sq(2),'عظمى (√2 , 4√2)','ok'],[-sq(2),-4*sq(2),'صغرى (−√2 , −4√2)','bad',{dy:16}],[0,0,'انقلاب','c',{dx:30}]]}],
 [[-5,5,-5,5],x=>1/x,{brk:[0],asy:{v:[0],h:[0]}}],
 [[-6,4,-6,8],x=>(x-1)/(x+1),{brk:[-1],asy:{v:[-1],h:[1]},pts:[[0,-1,'(0 , −1)','c',{dx:30}],[1,0,'(1 , 0)','c',{dy:14}]]}],
 [[-3,2.6,-2,6],x=>(x+2)*(x-1)**2,{pts:[[-1,4,'عظمى (−1 , 4)','ok'],[1,0,'صغرى (1 , 0)','bad',{dy:16}],[0,2,'انقلاب (0 , 2)','c',{dx:44}],[-2,0,'','c']]}],
 [[-4,4,-1.4,1.4],x=>(x*x-1)/(x*x+1),{asy:{h:[1]},pts:[[0,-1,'صغرى (0 , −1)','bad',{dy:16}],[1/sq(3),-.5,'','c'],[-1/sq(3),-.5,'','c'],[1,0,'','f'],[-1,0,'','f']]}],
 [[-2,2,-2.5,1.6],x=>2*x*x-x**4,{pts:[[1,1,'عظمى (1 , 1)','ok'],[-1,1,'عظمى (−1 , 1)','ok'],[0,0,'صغرى','bad',{dy:16}],[1/sq(3),5/9,'','c'],[-1/sq(3),5/9,'','c']]}],
 [[-5,5,-.5,2.6],x=>6/(x*x+3),{asy:{h:[0]},pts:[[0,2,'عظمى (0 , 2)','ok'],[1,1.5,'انقلاب','c',{dx:32}],[-1,1.5,'انقلاب','c',{dx:-32}]]}]];
GX.forEach(([v,f,o],i)=>{ S['gx'+(i+1)]=blank(v,'تمرين '+(i+1)); S['gx'+(i+1)+'ok']=Object.assign({v,f,title:'تمرين '+(i+1)+' · الحل',hint:'مقعرة باللون البنفسجي ، محدبة بالبرتقالي',conc:1},o); });

/* ---------- 3−8 optimisation ---------- */
S.o1={v:[-2,1.2,-.6,1.4],f:x=>x+x*x,pts:[[-.5,-.25,'العدد −1/2','bad',{dy:18}]],title:'مثال 1 · f(x) = x + x²',hint:'f″ = 2 > 0 : نهاية صغرى عند x = −1/2'};
const split=A=>A.W>520?{g:[0,0,A.W*.52,A.H],p:[A.W*.56,18,A.W*.42,A.H-48]}:{g:[0,0,A.W,A.H*.55],p:[38,A.H*.6,A.W-56,A.H*.36]};
function fitR(r,x0,x1,y0,y1,pad=14){ const [rx,ry,rw,rh]=r, s=Math.min((rw-2*pad)/(x1-x0),(rh-2*pad)/(y1-y0)), ox=rx+(rw-(x1-x0)*s)/2, oy=ry+(rh-(y1-y0)*s)/2; return {s,X:x=>ox+(x-x0)*s,Y:y=>ry+rh-(oy-ry)-(y-y0)*s}; }
S.o2={title:'صندوق من مربع ضلعه 12cm',hint:'V = x(12 − 2x)² ، 0 < x < 6',sl:{min:.2,max:5.8,v:1,play:1,speed:.35,lab:'ضلع المربع المقطوع x',fmt:v=>fr(v,2)+' cm'},
 draw(A){ const x=A.p, L=split(A), g=fitR(L.g,-.5,12.5,-.5,12.5), X=g.X, Y=g.Y, c=A.col;
  A.el('rect',{x:X(0),y:Y(12),width:12*g.s,height:12*g.s,fill:c.f,opacity:.12,stroke:c.f,'stroke-width':2});
  [[0,0],[12-x,0],[0,12-x],[12-x,12-x]].forEach(([a,b])=>A.el('rect',{x:X(a),y:Y(b+x),width:x*g.s,height:x*g.s,fill:c.bad,opacity:.25,stroke:c.bad,'stroke-dasharray':'4 3'}));
  A.el('rect',{x:X(x),y:Y(12-x),width:(12-2*x)*g.s,height:(12-2*x)*g.s,fill:'none',stroke:c.f,'stroke-width':1.4,'stroke-dasharray':'6 4'});
  T(A,X(x/2),Y(12)-10,'x','bad'); T(A,X(6),Y(6),'12 − 2x','f');
  const V=t=>t*(12-2*t)**2, P=subplot0(A,L.p,[0,6,0,140]); P.axes('x','V'); P.curve(V,'f',0,6); P.pt(x,V(x),'c'); P.pt(2,128,'tan','128',{r:4});
  A.chips.push(['c','x',fr(x,2)],['f','V',fr(V(x),1)+' cm³']); A.ok=abs(x-2)<.05; if(A.ok) A.hint='✓ عند x = 2 الحجم الأعظم 128 cm³'; }};
const subplot0=(A,r,v)=>A.subplot(r,v);
S.o3={title:'مثلث متساوي الساقين داخل دائرة نصف قطرها 12',hint:'A = h√(24h − h²) ، 0 ≤ h ≤ 24',sl:{min:1,max:23.5,v:10,play:1,speed:.3,lab:'الارتفاع h',fmt:v=>fr(v,1)},
 draw(A){ const h=A.p, x=sq(24*h-h*h), L=split(A), g=fitR(L.g,-13,13,-13,13), X=g.X, Y=g.Y, c=A.col;
  A.el('circle',{cx:X(0),cy:Y(0),r:12*g.s,fill:'none',stroke:c.ink2,'stroke-width':2}); A.el('circle',{cx:X(0),cy:Y(0),r:3,fill:c.ink2});
  poly(A,[[X(0),Y(12)],[X(-x),Y(12-h)],[X(x),Y(12-h)]],{fill:c.f,opacity:.18,stroke:c.f,'stroke-width':2.4});
  A.el('path',{d:`M${X(0)} ${Y(12)}V${Y(12-h)}`,stroke:c.c,'stroke-width':1.6,'stroke-dasharray':'4 4'}); T(A,X(0)+10,Y(12-h/2),'h','c',{anchor:'start'}); T(A,X(x/2),Y(12-h)+14,'x','chord');
  const Af=t=>t*sq(Math.max(0,24*t-t*t)), P=A.subplot(L.p,[0,24,0,200]); P.axes('h','A'); P.curve(Af,'f',0,24); P.pt(h,Af(h),'c'); P.pt(18,108*sq(3),'tan','108√3',{r:4});
  A.chips.push(['c','h',fr(h,1)],['f','A',fr(Af(h),1)]); A.ok=abs(h-18)<.15; if(A.ok) A.hint='✓ h = 18 ، القاعدة 12√3 ، المساحة 108√3'; }};
S.o4={title:'مستطيل داخل مثلث قاعدته 24 وارتفاعه 18',hint:'y = (4/3)(18 − x) ، A = xy',sl:{min:.5,max:17.5,v:5,play:1,speed:.3,lab:'ارتفاع المستطيل x',fmt:v=>fr(v,1)},
 draw(A){ const x=A.p, y=4/3*(18-x), L=split(A), g=fitR(L.g,-13,13,-1,19), X=g.X, Y=g.Y, c=A.col;
  poly(A,[[X(-12),Y(0)],[X(12),Y(0)],[X(0),Y(18)]],{fill:'none',stroke:c.ink2,'stroke-width':2});
  A.el('rect',{x:X(-y/2),y:Y(x),width:y*g.s,height:x*g.s,fill:c.f,opacity:.2,stroke:c.f,'stroke-width':2.4});
  T(A,X(y/2)+10,Y(x/2),'x','c',{anchor:'start'}); T(A,X(0),Y(x)-10,'y','chord');
  const Af=t=>4/3*(18*t-t*t), P=A.subplot(L.p,[0,18,0,120]); P.axes('x','A'); P.curve(Af,'f',0,18); P.pt(x,Af(x),'c'); P.pt(9,108,'tan','108',{r:4});
  A.chips.push(['c','x',fr(x,1)],['chord','y',fr(y,1)],['f','A',fr(Af(x),1)]); A.ok=abs(x-9)<.12; if(A.ok) A.hint='✓ x = 9 cm ، y = 12 cm'; }};
S.o5={title:'مجموع محيطي دائرة ومربع = 60',hint:'A = x² + (1/π)(30 − 2x)²',sl:{min:0,max:15,v:3,play:1,speed:.3,lab:'ضلع المربع x',fmt:v=>fr(v,2)},
 draw(A){ const x=A.p, r=(30-2*x)/PI, L=split(A), g=fitR(L.g,-1,26,-1,21), X=g.X, Y=g.Y, c=A.col;
  if(x>.05) A.el('rect',{x:X(0),y:Y(x+3),width:x*g.s,height:x*g.s,fill:c.f,opacity:.2,stroke:c.f,'stroke-width':2.2});
  if(r>.05) A.el('circle',{cx:X(16.5),cy:Y(10),r:r*g.s,fill:c.chord,opacity:.2,stroke:c.chord,'stroke-width':2.2});
  T(A,X(x/2),Y(3)+14,'x','f'); T(A,X(16.5),Y(10),'r','chord');
  const Af=t=>t*t+(30-2*t)**2/PI, P=A.subplot(L.p,[0,15,0,300]); P.axes('x','A'); P.curve(Af,'f',0,15); P.pt(x,Af(x),'c'); P.pt(60/(PI+4),Af(60/(PI+4)),'tan','',{r:4});
  A.chips.push(['f','x',fr(x,2)],['chord','2r',fr(2*r,2)],['c','A',fr(Af(x),1)]); A.ok=abs(x-2*r)<.08; if(A.ok) A.hint='✓ أصغر مساحة عندما x = 2r = 60/(π + 4)'; }};
S.o6={v:[-5,5,-.5,7],eq:1,title:'أقرب نقطة من القطع الزائد y² − x² = 3 إلى (0 , 4)',hint:'s = √(2y² − 8y + 13)',
 curves:[{f:x=>sq(x*x+3)},{f:x=>-sq(x*x+3),op:.4}],sl:{min:-4,max:4,v:2.6,lab:'الإحداثي السيني x',fmt:v=>fr(v,2)},slx:1,
 draw(A){ const x=A.p, y=sq(x*x+3), s=sq(x*x+(y-4)**2), G=A.G;
  A.el('path',{d:`M${A.X(x)} ${A.Y(y)}L${A.X(0)} ${A.Y(4)}`,stroke:A.col.chord,'stroke-width':3},G);
  A.el('circle',{cx:A.X(0),cy:A.Y(4),r:6,fill:A.col.int},G); T(A,A.X(0),A.Y(4)-16,'(0 , 4)','int',{size:12});
  A.el('circle',{cx:A.X(x),cy:A.Y(y),r:8,fill:A.col.c,stroke:A.col.surf,'stroke-width':2.4,class:'handle'},G); T(A,A.X(x),A.Y(y)+20,'p','c');
  A.chips.push(['c','p',`(${fr(x)} , ${fr(y)})`],['chord','s',fr(s,3)]); A.ok=abs(abs(x)-1)<.04; if(A.ok) A.hint='✓ أقرب نقطتين (1 , 2) و (−1 , 2) ، s = √5'; }};
S.oSteps={v:[0,6,0,140],title:'خطوات حل مسائل القيم العظمى والصغرى',hint:'نكوّن الدالة في متغير واحد ونحدد مجالها',f:x=>x*(12-2*x)**2,a:0,b:6,pts:[[2,128,'القيمة العظمى','tan']]};

/* ---------- reference lesson 3−1: ladder against time (discover / try) ---------- */

/* ---------- «تمرين مشابه» generators (enrichment, not from the book) ---------- */
const GEN={};
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1)), pick=a=>a[Math.floor(Math.random()*a.length)];
const gcd=(a,b)=>{ a=abs(a); b=abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; };
const fq=(n,d)=>{ if(d<0){ n=-n; d=-d; } const g=gcd(n,d); n/=g; d/=g; return {n,d,s:d===1?String(n):n+'/'+d,t:d===1?String(n):(n<0?'-':'')+'\\tfrac{'+abs(n)+'}{'+d+'}'}; };
GEN.gLad=()=>{ const [a,b,L]=pick([[3,4,5],[6,8,10],[5,12,13],[9,12,15],[8,15,17],[7,24,25],[15,20,25]]); const flip=Math.random()<.5, x=flip?b:a, y=flip?a:b, v=ri(1,4), r=fq(-x*v,y);
  return {q:`سلم طوله $${L}\\,m$ يستند على حائط رأسي. ينزلق طرفه الأسفل مبتعداً عن الحائط بمعدل $${v}\\,m/s$. جد معدل انزلاق الطرف العلوي عندما يكون الطرف الأسفل على بعد $${x}\\,m$ من الحائط.`,ans:r.s,ph:'dy/dt (m/s)',
   sol:[`$x^2+y^2=${L*L}$ ، وعندما $x=${x}$ : $y=\\sqrt{${L*L}-${x*x}}=${y}$`,'» نشتق بالنسبة للزمن **قبل** التعويض:',`$2x\\dfrac{dx}{dt}+2y\\dfrac{dy}{dt}=0\\Rightarrow\\dfrac{dy}{dt}=-\\dfrac{x}{y}\\cdot\\dfrac{dx}{dt}=-\\dfrac{${x}}{${y}}(${v})=${r.t}\\ m/s$`],
   miss:[['0','يبدو أنك عوّضت $x='+x+'$ و $y='+y+'$ قبل الاشتقاق فصارت كلها ثوابت مشتقتها صفر. اشتق أولاً ثم عوّض.'],[fq(x*v,y).s,'الطرف العلوي **ينزل**، فمعدل تغير $y$ سالب.']]}; };
GEN.gCone=()=>{ const k=pick([2,3]), h=pick([2,3,4,6]), q=ri(2,6), r=fq(k*k*q,h*h);
  return {q:`مخروط رأسه للأسفل، ارتفاعه $${k}$ أمثال نصف قطر قاعدته، يُصب فيه ماء بمعدل $${q}\\,cm^3/s$. جد معدل ارتفاع الماء عندما يكون عمقه $${h}\\,cm$.`,ans:r.d===1?`${r.n}/π`:`${r.n}/(${r.d}π)`,ph:'dh/dt (اكتب π)',
   sol:[`» من التشابه: $r=\\dfrac{h}{${k}}$`,`$V=\\tfrac13\\pi r^2h=\\dfrac{\\pi h^3}{${3*k*k}}\\Rightarrow\\dfrac{dV}{dt}=\\dfrac{\\pi h^2}{${k*k}}\\dfrac{dh}{dt}$`,`$${q}=\\dfrac{\\pi(${h})^2}{${k*k}}\\dfrac{dh}{dt}\\Rightarrow\\dfrac{dh}{dt}=\\dfrac{${r.n}}{${r.d===1?'':r.d}\\pi}\\ cm/s$`],
   miss:[[fq(q,h*h).s+'/π','نسيت ربط $r$ بـ $h$ (التشابه): $r=\\tfrac{h}{'+k+'}$ قبل الاشتقاق.']]}; };
GEN.gShadow=()=>{ const [P,m]=pick([[6,2],[7.2,1.8],[5,1.5],[8,2],[4.5,1.5]]), v=pick([1,2,3,30,45,60]), sp=v*m/(P-m), tip=v*P/(P-m);
  return {q:`عمود طوله $${P}\\,m$ في أعلاه مصباح، ويبتعد عنه رجل طوله $${m}\\,m$ بسرعة $${v}$ وحدة طول في وحدة الزمن. جد معدل تغير طول ظل الرجل.`,ans:String(+sp.toFixed(6)),ph:'ds/dt',
   sol:[`» من تشابه المثلثين: $\\dfrac{s}{${m}}=\\dfrac{x+s}{${P}}\\Rightarrow ${P}s=${m}x+${m}s\\Rightarrow s=\\dfrac{${m}}{${+(P-m).toFixed(2)}}x$`,`$\\dfrac{ds}{dt}=\\dfrac{${m}}{${+(P-m).toFixed(2)}}\\cdot${v}=${+sp.toFixed(4)}$`],
   miss:[[String(+tip.toFixed(6)),'هذه سرعة **رأس الظل** $\\dfrac{d(x+s)}{dt}$ ، والمطلوب معدل تغير **طول** الظل $\\dfrac{ds}{dt}$.']]}; };
GEN.gTank=()=>{ const a=pick([2,3,4,5]), k=pick([0.05,0.1,0.2,0.25,0.3]), r=+(k*a*a).toFixed(4), up=Math.random()<.3, A2=a*a;
  return {q:up?`خزان على شكل متوازي سطوح مستطيلة قاعدته مربعة طول ضلعها $${a}\\,m$ يُصب فيه الماء بمعدل $${r}\\,m^3/h$. جد معدل تغير ارتفاع الماء في الخزان عند أي زمن $t$.`
      :`خزان مملوء بالماء على شكل متوازي سطوح مستطيلة قاعدته مربعة طول ضلعها $${a}\\,m$ يتسرب منه الماء بمعدل $${r}\\,m^3/h$. جد معدل تغير انخفاض الماء في الخزان عند أي زمن $t$.`,
   ans:String(up?k:-k),ph:'dh/dt (m/h)',
   sol:[`» نفرض: $h$ ارتفاع الماء ، $\\dfrac{dV}{dt}=${up?'':'-'}${r}\\ m^3/h$ ${up?'(صبّ ⇒ موجب)':'(تسرب ⇒ سالب)'} ، القاعدة $${a}\\,m$ ثابتة`,
     `الحجم = مساحة القاعدة × الارتفاع: $V=(${a})(${a})h=${A2}h$`,`$\\dfrac{dV}{dt}=${A2}\\dfrac{dh}{dt}\\Rightarrow ${up?'':'-'}${r}=${A2}\\dfrac{dh}{dt}\\Rightarrow\\dfrac{dh}{dt}=${up?'':'-'}${k}\\ m/h$`,
     up?`» الإشارة موجبة: الماء **يرتفع** بمعدل $${k}\\ m/h$`:`» الإشارة سالبة: الماء **ينخفض**، ومعدل الانخفاض $${k}\\ m/h$`],
   miss:[[String(up?-k:k),up?'الماء يُصب، فالحجم والارتفاع يزدادان: الإشارة موجبة.':'الماء يتسرب: $\\dfrac{dV}{dt}$ سالبة، فـ $\\dfrac{dh}{dt}=-'+k+'$ (ومعدل **الانخفاض** يُكتب بعدها بلا إشارة).'],[String(+((up?1:-1)*r/a).toFixed(4)),'قسمت على طول الضلع $'+a+'$ ؛ اقسم على **مساحة** القاعدة $'+A2+'$.']]}; };
GEN.gPlate=()=>{ const y=pick([2,3,4,5,6,8]), x=pick([3,4,6,8,9,12]), A2=x*y, a=ri(1,4), r=fq(-y*a,x);
  return {q:`صفيحة مستطيلة مساحتها ثابتة $${A2}\\,cm^2$ ، يزداد طولها بمعدل $${a}\\,cm/s$. جد معدل تغير عرضها عندما يكون العرض $${y}\\,cm$.`,ans:r.s,ph:'dy/dt (cm/s)',
   sol:[`$xy=${A2}$ ، وعندما $y=${y}$ : $x=${x}$`,`$x\\dfrac{dy}{dt}+y\\dfrac{dx}{dt}=0\\Rightarrow ${x}\\dfrac{dy}{dt}+${y}(${a})=0\\Rightarrow\\dfrac{dy}{dt}=${r.t}\\ cm/s$`],
   miss:[[fq(y*a,x).s,'العرض **يتناقص** لأن المساحة ثابتة والطول يزداد، فالمعدل سالب.'],['0','اشتق أولاً ثم عوّض.']]}; };

/* ---------- 3−1: problem data card (المعطيات / المطلوب / العلاقة) built step by step ---------- */
/* rows: [stage, kind, formula, arabic tag]; kind: g given · r required · rel relation · d derivative · ans answer */
const KC={g:'chord',r:'c',rel:'f',d:'int',ans:'tan'};
function card(A,rows,stage){ const c=A.col, W=A.W, short=A.H<340, narrow=W<330||short, vis=rows.filter(r=>r[0]<=stage), cur=vis.filter(r=>r[0]===stage);
  /* on a short figure (phone) the card must not crush the drawing: only this step's rows, at most 2, or none */
  const show=narrow?(cur.length?cur:vis.filter(r=>r[1]==='r')).slice(-(short?2:3)):vis;
  if(!show.length) return 0; const lh=narrow?22:25, h=show.length*lh+14, x=12, w=W-24, y=8; if(A.H-h-14<170) return 0;
  A.el('rect',{x,y,width:w,height:h,rx:12,fill:c.surf,stroke:c.line,'stroke-width':1.2});
  const st1=stage===1&&!rows.some(q=>q[0]===1);
  show.forEach((r,i)=>{ const yy=y+10+lh*i+lh/2, on=r[0]===stage||(st1&&r[0]===0), col=c[KC[r[1]]];
    if(on) A.el('rect',{x:x+4,y:yy-lh/2+1,width:w-8,height:lh-2,rx:7,fill:col,opacity:.12});
    A.lab(x+w-12,yy,r[3],{fill:col,w:700,size:narrow?11.5:12.5,anchor:'end'});
    A.lab(x+12,yy,r[2],{fill:on?c.ink:c.ink2,w:on?700:500,size:narrow?12.5:14,anchor:'start'}); });
  return h+14; }
/* wrap a scene: base + its step variants  name, name1, name2 … */
function staged(name,rows,nst){ const base=S[name], dr=base.draw;
  const mk=k=>Object.assign({},base,{draw(A){ A.resTop=card(A,rows,k); dr.call(this,A); A.resTop=0; }});
  S[name]=mk(0); for(let k=1;k<=nst;k++) S[name+k]=mk(k); }

/* richer tank: tap + drops, dimension lines */
S.rTank.draw=function(A){ const tk=this.tk||{a:2,r:.4}, a=tk.a, g=fit(A,-1.4,4.6,-1.1,3.6), h=A.p, dx=.9, dy=.6, X=g.X, Y=g.Y, f=A.col, t=A.t;
  const box=(y0,y1,fill,op,st)=>{ poly(A,[[X(0),Y(y0)],[X(2),Y(y0)],[X(2),Y(y1)],[X(0),Y(y1)]],{fill,opacity:op,stroke:st,'stroke-width':1.8});
    poly(A,[[X(2),Y(y0)],[X(2+dx),Y(y0+dy)],[X(2+dx),Y(y1+dy)],[X(2),Y(y1)]],{fill,opacity:op*.75,stroke:st,'stroke-width':1.8});
    poly(A,[[X(0),Y(y1)],[X(2),Y(y1)],[X(2+dx),Y(y1+dy)],[X(dx),Y(y1+dy)]],{fill,opacity:op*.55,stroke:st,'stroke-width':1.8}); };
  box(0,h,f.f,.34,'none'); box(0,3,'none',1,f.ink2);
  /* water surface edge */
  A.el('path',{d:`M${X(0)} ${Y(h)}H${X(2)}L${X(2+dx)} ${Y(h+dy)}`,stroke:f.f,'stroke-width':2.4,fill:'none'});
  /* tap at the bottom right + falling drops */
  const tx=X(2+dx*.5), ty=Y(.15+dy*.5); A.el('path',{d:`M${tx} ${ty}h${g.s*.45}v${g.s*.12}`,stroke:f.ink2,'stroke-width':6,'stroke-linecap':'round',fill:'none'});
  for(let k=0;k<3;k++){ const ph=((t*1.2+k/3)%1); A.el('ellipse',{cx:tx+g.s*.45,cy:ty+g.s*.2+ph*g.s*.75,rx:3.2,ry:4.6,fill:f.f,opacity:1-ph*.7}); }
  T(A,tx+g.s*.45,ty+g.s*1.15,'تسرب '+tk.r+' m³/h','chord',{size:12.5});
  /* dimensions */
  A.el('path',{d:`M${X(0)} ${Y(-.35)}H${X(2)}M${X(0)} ${Y(-.25)}V${Y(-.45)}M${X(2)} ${Y(-.25)}V${Y(-.45)}`,stroke:f.muted,'stroke-width':1.4}); T(A,X(1),Y(-.62),a+' m','muted');
  A.el('path',{d:`M${X(2.15)} ${Y(3)}L${X(2.15+dx)} ${Y(3+dy)}`,stroke:f.muted,'stroke-width':1.4}); T(A,X(2.5+dx/2),Y(3+dy/2),a+' m','muted',{anchor:'start'});
  A.el('path',{d:`M${X(-.35)} ${Y(0)}V${Y(h)}M${X(-.47)} ${Y(0)}H${X(-.23)}M${X(-.47)} ${Y(h)}H${X(-.23)}`,stroke:f.c,'stroke-width':2.4}); T(A,X(-.7),Y(h/2),'h','c',{size:15});
  T(A,X(1),Y(h/2),'V = '+a*a+'h','f',{size:14});
  arrow(A,X(1),Y(h+.12),X(1),Y(h-.5),'tan'); T(A,X(1)+30,Y(h-.3),'dh/dt ?','tan',{size:12,anchor:'start'});
  A.chips.push(['c','h',fr(h)+' m'],['f','V = '+a*a+'h',fr(a*a*h)+' m³'],['chord','dV/dt','−'+tk.r],['tan','dh/dt',tk.q?'?':fr(-tk.r/(a*a))]); };

/* richer cone: inflow stream, outflow drip, similar triangles */
S.rCone.draw=function(A){ const h=A.p, r=h/3, g=fit(A,-14,14,-4.5,28.5), X=g.X, Y=g.Y, f=A.col, t=A.t;
  poly(A,[[X(0),Y(0)],[X(r),Y(h)],[X(-r),Y(h)]],{fill:f.f,opacity:.3});
  A.el('ellipse',{cx:X(0),cy:Y(h),rx:r*g.s,ry:r*g.s*.22,fill:f.f,opacity:.4,stroke:f.f,'stroke-width':1.6});
  A.el('path',{d:`M${X(-8)} ${Y(24)}L${X(0)} ${Y(0)}L${X(8)} ${Y(24)}`,fill:'none',stroke:f.ink2,'stroke-width':2.2});
  A.el('ellipse',{cx:X(0),cy:Y(24),rx:8*g.s,ry:8*g.s*.22,fill:'none',stroke:f.ink2,'stroke-width':2.2});
  /* similar triangles: big (8 , 24) and small (r , h) */
  A.el('path',{d:`M${X(0)} ${Y(0)}V${Y(24)}H${X(8)}`,stroke:f.muted,'stroke-width':1.4,'stroke-dasharray':'3 4',fill:'none'});
  A.el('path',{d:`M${X(0)} ${Y(0)}V${Y(h)}H${X(r)}`,stroke:f.c,'stroke-width':2.4,fill:'none'});
  T(A,X(4),Y(24)-12,'8','muted'); T(A,X(-.9),Y(19),'24','muted',{anchor:'end'});
  T(A,X(-.6),Y(h/2),'h','c',{anchor:'end',size:15}); T(A,X(r/2),Y(h)+14,'r','c',{size:15});
  /* inflow stream */
  const sx=X(-2.5); A.el('path',{d:`M${X(-9)} ${Y(28)}Q${sx} ${Y(28.3)} ${sx} ${Y(h)}`,stroke:f.tan,'stroke-width':4,fill:'none','stroke-dasharray':'8 6','stroke-dashoffset':-t*40});
  T(A,X(-9),Y(28)-12,'صب 5 cm³/s','tan',{size:12.5,anchor:'start'});
  /* outflow drip at the tip */
  for(let k=0;k<2;k++){ const ph=((t*1.1+k/2)%1); A.el('ellipse',{cx:X(0),cy:Y(0)+8+ph*g.s*3.2,rx:3,ry:4.4,fill:f.f,opacity:1-ph*.7}); }
  T(A,X(.8),Y(-2.6),'تسرب 1 cm³/s','chord',{size:12.5,anchor:'start'});
  T(A,X(9),Y(12),'r/h = 8/24','f',{size:13,anchor:'start'});
  const dh=36/(PI*h*h); A.chips.push(['c','r = h/3',fr(r,2)],['f','V',fr(PI*h**3/27,1)],['tan','dV/dt','5 − 1 = 4'],['chord','dh/dt',fr(dh,4)]);
  A.ok=abs(h-12)<.1; if(A.ok) A.hint='✓ عند h = 12 : dh/dt = 1/(4π) ≈ 0.0796 cm/s'; };

/* right angle mark + wall label on the ladder */
{ const d0=S.rLadder.draw; S.rLadder.draw=function(A){ d0.call(this,A); const g=fit(A,-1.6,11.4,-1.6,11.2), X=g.X, Y=g.Y, q=12;
  A.el('path',{d:`M${X(0)+q} ${Y(0)}V${Y(0)-q}H${X(0)}`,stroke:A.col.ink2,'stroke-width':1.6,fill:'none'}); T(A,X(-.6),Y(10.4),'حائط','muted',{size:12}); T(A,X(10),Y(-.6),'أرض','muted',{size:12}); }; }

/* ---------- realistic, draggable illustrations (3−1) ---------- */
const WOOD='#b7772f', WOOD2='#8a5520';
function bricks(A,x,y,w,h){ const c=A.col; A.el('rect',{x,y,width:w,height:h,fill:'#c8704a',opacity:.22,stroke:c.line});
  const bh=14, bw=30; let d=''; for(let r=0;y+r*bh<y+h;r++){ const yy=y+r*bh; d+=`M${x} ${yy}H${x+w}`; for(let k=(r%2?bw/2:0);k<w;k+=bw) d+=`M${x+k} ${yy}V${Math.min(y+h,yy+bh)}`; }
  A.el('path',{d,stroke:'#a5502f',opacity:.35,'stroke-width':1}); }
function ground(A,x0,x1,y,h=16){ const c=A.col; A.el('rect',{x:x0,y,width:x1-x0,height:h,fill:'#7a5b3a',opacity:.25});
  A.el('path',{d:`M${x0} ${y}H${x1}`,stroke:'#4f8a3c','stroke-width':4}); let d=''; for(let x=x0+4;x<x1;x+=9) d+=`M${x} ${y}l-2 -5M${x+3} ${y}l1 -6`; A.el('path',{d,stroke:'#4f8a3c','stroke-width':1.3,opacity:.8}); }
/* ladder from foot (x1,y1) to top (x2,y2) in pixels: two rails + rungs */
function ladderPx(A,x1,y1,x2,y2,wid=13){ const L=Math.hypot(x2-x1,y2-y1), ux=(x2-x1)/L, uy=(y2-y1)/L, nx=-uy*wid/2, ny=ux*wid/2;
  const n=Math.max(4,Math.round(L/26)); let d=''; for(let k=1;k<n;k++){ const px=x1+ux*L*k/n, py=y1+uy*L*k/n; d+=`M${px+nx} ${py+ny}L${px-nx} ${py-ny}`; }
  A.el('path',{d,stroke:WOOD,'stroke-width':4,'stroke-linecap':'round'});
  [[1],[-1]].forEach(([s])=>A.el('path',{d:`M${x1+s*nx} ${y1+s*ny}L${x2+s*nx} ${y2+s*ny}`,stroke:WOOD2,'stroke-width':5.5,'stroke-linecap':'round'})); }
/* walking person: feet at (x,y), height hp px, gait phase ph, facing +1 right */
function person(A,x,y,hp,ph,face=1){ const c=A.col, s=hp/1.8, col=c.ink2, sw=Math.sin(ph)*.32;
  const hip=[x,y-0.95*s], neck=[x+face*.04*s,y-1.5*s], head=[x+face*.06*s,y-1.66*s];
  const leg=a=>`M${hip[0]} ${hip[1]}L${hip[0]+Math.sin(a)*.5*s} ${hip[1]+Math.cos(a)*.48*s}L${hip[0]+Math.sin(a)*.95*s+face*.06*s} ${y}`;
  A.el('path',{d:leg(sw)+leg(-sw),stroke:col,'stroke-width':Math.max(3,s*.09),'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'});
  A.el('path',{d:`M${hip[0]} ${hip[1]}L${neck[0]} ${neck[1]}`,stroke:c.f,'stroke-width':Math.max(5,s*.2),'stroke-linecap':'round'});
  const arm=a=>`M${neck[0]} ${neck[1]+.05*s}L${neck[0]+Math.sin(a)*.32*s} ${neck[1]+.38*s}L${neck[0]+Math.sin(a)*.55*s} ${neck[1]+.68*s}`;
  A.el('path',{d:arm(-sw)+arm(sw),stroke:col,'stroke-width':Math.max(2.6,s*.075),'stroke-linecap':'round',fill:'none'});
  A.el('circle',{cx:head[0],cy:head[1],r:Math.max(5,s*.13),fill:'#e8b58c',stroke:col,'stroke-width':1.4}); }
function lamp(A,x,y,top){ const c=A.col; A.el('path',{d:`M${x} ${y}V${top}`,stroke:'#5b6475','stroke-width':7,'stroke-linecap':'round'});
  A.el('rect',{x:x-12,y:y-6,width:24,height:6,rx:2,fill:'#5b6475'});
  [44,30,18].forEach((r,i)=>A.el('circle',{cx:x,cy:top,r,fill:'#ffd34d',opacity:[.12,.2,.35][i]})); A.el('circle',{cx:x,cy:top,r:9,fill:'#ffc21a',stroke:'#c58f00'}); }

/* ladder vs time (discover / try): real ladder, wall, ground; drag the foot */
function ladderTime(o){ return {title:o.title,hint:o.hint,anim:0,sl:{min:0,max:4.6,v:o.v??0,step:.01,play:o.play?1:0,speed:.35,lab:'الزمن t (ثانية)',fmt:v=>fr(v,2)},
 pick(A,px,py){ const g=A._g; if(!g||px>A.W*.55) return null; return ((px-g.X0)/g.s-.5)/2; },
 draw(A){ const t=A.p, x=.5+2*t, y=sq(Math.max(0,100-x*x)), vy=y>1e-6?-2*x/y:-Infinity, c=A.col, W=A.W, H=A.H;
  const gw=W*.6, sc=Math.min((gw-40)/11,(H-70)/11), oy=(H-11*sc)/2+11*sc, X=u=>30+u*sc, Y=v=>oy-v*sc; A._g={s:sc,X0:30};
  bricks(A,X(-.9),Y(11.2),X(0)-X(-.9),Y(0)-Y(11.2)); ground(A,X(-.9),X(11),Y(0));
  ladderPx(A,X(x),Y(0),X(0)+4,Y(y));
  arrow(A,X(x),Y(0)+24,X(x)+40,Y(0)+24,'chord'); if(isFinite(vy)) arrow(A,X(0)+22,Y(y),X(0)+22,Y(y)+Math.min(110,-vy*12),'tan');
  A.el('circle',{cx:X(x),cy:Y(0),r:9,fill:c.chord,opacity:.25}); 
  T(A,X(x/2),Y(0)+40,'x = '+fr(x,2)+' m','chord',{size:12}); T(A,X(0)+30,Y(y/2),'y = '+fr(y,2),'tan',{anchor:'start',size:12}); T(A,X(6.5),Y(4),'سلّم 10 m','muted',{size:12}); T(A,X(6.5),Y(4)+16,'اسحب قدم السلم','muted',{size:11.5});
  const pr=A.subplot([gw+26,16,W-gw-42,H*.42],[0,4.6,0,10.5]); pr.axes('t','y'); pr.curve(u=>sq(Math.max(0,100-(.5+2*u)**2)),'tan',0,4.6,2.4); pr.pt(t,y,'tan');
  const pd=A.subplot([gw+26,H*.52+8,W-gw-42,H*.42-12],[0,4.6,-20,0]); pd.axes('t','dy/dt'); pd.curve(u=>{ const xx=.5+2*u, yy=sq(Math.max(1e-9,100-xx*xx)); return -2*xx/yy; },'c',0,4.45,2.4); if(isFinite(vy)&&vy>-20) pd.pt(t,vy,'c');
  A.chips.push(['chord','dx/dt','2 m/s'],['chord','x',fr(x,2)],['tan','y',fr(y,2)],['c','dy/dt',isFinite(vy)?fr(vy,3):'—']);
  if(o.target){ A.ok=abs(x-8)<.06; if(A.ok) A.hint='✓ عند x = 8 : y = 6 ، dy/dt = −8/3 ≈ −2.667'; } }}; }
S.rDisc=ladderTime({title:'سلّم ينزلق: الطرف الأسفل بسرعة ثابتة 2 m/s',hint:'راقب منحني dy/dt — أو اسحب قدم السلم بإصبعك',play:1,v:0});
S.rTry=ladderTime({title:'جرّب: اسحب قدم السلم حتى يصبح x = 8',hint:'السلم 10 m ، والطرف الأسفل يبتعد 2 m/s',v:.5,target:1});

/* example 4: real ladder + angle, drag the foot */
S.rLadder.pick=(A,px)=>{ const g=A._g; return g?(px-g.X(0))/g.s:null; };
S.rLadder.draw=function(A){ const x=A.p, y=sq(100-x*x), g=fit(A,-1.8,11.6,-2,11.2), X=g.X, Y=g.Y, f=A.col, th=Math.atan2(y,x); A._g=g;
  bricks(A,X(-1.4),Y(11),X(0)-X(-1.4),Y(0)-Y(11)); ground(A,X(-1.4),X(11.4),Y(0));
  ladderPx(A,X(x),Y(0),X(0)+4,Y(y),Math.max(10,g.s*.55));
  A.el('path',{d:`M${X(x)} ${Y(0)}L${X(0)} ${Y(y)}`,stroke:f.f,'stroke-width':1.4,'stroke-dasharray':'5 5',opacity:.7});
  A.el('path',{d:`M${X(x)-34} ${Y(0)}A34 34 0 0 1 ${X(x)-34*Math.cos(th)} ${Y(0)-34*Math.sin(th)}`,fill:'none',stroke:f.int,'stroke-width':2.4}); T(A,X(x)-50,Y(0)-14,'θ','int',{size:15});
  A.el('path',{d:`M${X(0)+12} ${Y(0)}V${Y(0)-12}H${X(0)}`,stroke:f.ink2,'stroke-width':1.6,fill:'none'});
  A.el('path',{d:`M${X(0)} ${Y(0)+28}H${X(x)}`,stroke:f.chord,'stroke-width':2}); T(A,X(x/2),Y(0)+42,'x = '+fr(x,1),'chord');
  A.el('path',{d:`M${X(0)-26} ${Y(0)}V${Y(y)}`,stroke:f.tan,'stroke-width':2}); T(A,X(0)-30,Y(y/2),'y = '+fr(y,2),'tan',{anchor:'end'});
  T(A,(X(x)+X(0))/2+22,(Y(0)+Y(y))/2-8,'10 m','f');
  arrow(A,X(x)+6,Y(0)-14,X(x)+52,Y(0)-14,'chord'); const vy=-2*x/y; arrow(A,X(0)+18,Y(y)+6,X(0)+18,Y(y)+Math.min(110,-vy*14),'tan');
  A.chips.push(['chord','dx/dt','2'],['tan','y',fr(y,2)],['tan','dy/dt',fr(vy,3)],['int','dθ/dt',fr(vy/(10*Math.cos(th)),3)]);
  A.ok=abs(x-8)<.06; A.hint=A.ok?'✓ عند x = 8 : y = 6 ، dy/dt = −8/3 ، dθ/dt = −1/3':'اسحب قدم السلم أو حرّك المنزلق إلى x = 8'; };

/* exercise 2: lamp post, walking man, light ray, shadow; drag the man */
S.rShadow.pick=(A,px)=>{ const g=A._g; return g?(px-g.X(0))/g.s:null; };
S.rShadow.draw=function(A){ const x=A.p, s=x/3, g=fit(A,-2,23,-1.6,8.6), X=g.X, Y=g.Y, f=A.col; A._g=g;
  /* night sky + ground */
  A.el('rect',{x:X(-2),y:Y(8.6),width:X(23)-X(-2),height:Y(0)-Y(8.6),fill:'#1b2a4d',opacity:.08});
  ground(A,X(-2),X(23),Y(0),Y(-1.6)-Y(0));
  /* lit region and shadow */
  poly(A,[[X(0),Y(7.2)],[X(-1.5),Y(0)],[X(x+s),Y(0)]],{fill:'#ffd34d',opacity:.16});
  A.el('ellipse',{cx:X(x+s/2),cy:Y(0)+3,rx:s*g.s/2,ry:5,fill:'#111',opacity:.45});
  A.el('path',{d:`M${X(0)} ${Y(7.2)}L${X(x+s)} ${Y(0)}`,stroke:'#e0a800','stroke-width':1.8,'stroke-dasharray':'6 5'});
  lamp(A,X(0),Y(0),Y(7.2)); person(A,X(x),Y(0),1.8*g.s,x*2.4,1);
  /* measurements */
  const yy=Y(0)+(Y(-1.6)-Y(0))*.55; A.el('path',{d:`M${X(0)} ${yy}H${X(x)}`,stroke:f.c,'stroke-width':2.2}); T(A,X(x/2),yy+14,'x = '+fr(x,1),'c');
  A.el('path',{d:`M${X(x)} ${yy}H${X(x+s)}`,stroke:f.chord,'stroke-width':4}); T(A,X(x+s/2),yy+14,'s = '+fr(s,2),'chord');
  T(A,X(0)-12,Y(3.6),'7.2 m','muted',{anchor:'end'}); T(A,X(x)+16,Y(1),'1.8 m','muted',{anchor:'start',size:12});
  arrow(A,X(x)+10,Y(2.3),X(x)+46,Y(2.3),'c'); T(A,X(x)+30,Y(2.3)-12,'30 m/min','c',{size:11.5});
  A.chips.push(['c','dx/dt','30'],['chord','s = x/3',fr(s,2)],['chord','ds/dt','10 m/min']); A.hint='اسحب الرجل بإصبعك أو شغّل الحركة: الظل يطول بثلث سرعته'; };

/* drag handles for the remaining figures */
S.rTank.pick=(A,px,py)=>{ const g=A._g; return g?(g.Y(0)-py)/g.s:null; };
{ const d=S.rTank.draw; S.rTank.draw=function(A){ A._g=fit(A,-1.4,4.6,-1.1,3.6); d.call(this,A); }; }
S.rCone.pick=(A,px,py)=>{ const g=A._g; return g?(g.Y(0)-py)/g.s:null; };
{ const d=S.rCone.draw; S.rCone.draw=function(A){ A._g=fit(A,-14,14,-4.5,28.5); d.call(this,A); }; }
S.rPlate.pick=(A,px)=>{ const g=A._g; return g?(px-g.X(0))/g.s:null; };
{ const d=S.rPlate.draw; S.rPlate.draw=function(A){ A._g=fit(A,-3,22,-3,18); d.call(this,A); }; }

/* ---------- more realistic, draggable illustrations ---------- */
/* generic iso-cube: front-bottom-left corner (x0,y0) in world, side s, depth vector (dx,dy) */
function isoBox(A,X,Y,x0,y0,w,h,dx,dy,o){ const F=[[X(x0),Y(y0)],[X(x0+w),Y(y0)],[X(x0+w),Y(y0+h)],[X(x0),Y(y0+h)]],
  R=[[X(x0+w),Y(y0)],[X(x0+w+dx),Y(y0+dy)],[X(x0+w+dx),Y(y0+h+dy)],[X(x0+w),Y(y0+h)]], Tp=[[X(x0),Y(y0+h)],[X(x0+w),Y(y0+h)],[X(x0+w+dx),Y(y0+h+dy)],[X(x0+dx),Y(y0+h+dy)]];
  poly(A,R,{fill:o.side||o.fill,opacity:o.op??1,stroke:o.st,'stroke-width':o.sw||1.6}); poly(A,Tp,{fill:o.top||o.fill,opacity:o.op??1,stroke:o.st,'stroke-width':o.sw||1.6}); poly(A,F,{fill:o.fill,opacity:o.op??1,stroke:o.st,'stroke-width':o.sw||1.6}); }
/* ice cube: dark metal cube inside a frosty translucent shell; melt drops + puddle; drag the shell edge */
S.rIce.anim=1;
S.rIce.pick=(A,px)=>{ const g=A._g; return g?Math.max(0,(g.X(0)-px)/g.s):null; };
S.rIce.draw=function(A){ const x=A.p, g=fit(A,-4.5,15,-5.5,14), X=g.X, Y=g.Y, f=A.col, o=8+2*x, d=2.4, t=A.t; A._g=g;
  /* puddle */
  A.el('ellipse',{cx:X(4+d/2),cy:Y(-x)+10,rx:(o/2+2.5)*g.s,ry:12,fill:'#7cc4f0',opacity:.22});
  isoBox(A,X,Y,0,0,8,8,d,d,{fill:'#596273',side:'#454d5c',top:'#727d90',st:'#2d333d'});
  isoBox(A,X,Y,-x,-x,o,o,d,d,{fill:'#bfe6ff',side:'#a3d6f7',top:'#e2f4ff',st:'#7ab8e0',op:.55});
  /* frost sparkles */
  let sp=''; for(let k=0;k<14;k++){ const u=(k*.618)%1, v=(k*.381)%1, cx=X(-x+u*o), cy=Y(-x+v*o); sp+=`M${cx-3} ${cy}h6M${cx} ${cy-3}v6`; } A.el('path',{d:sp,stroke:'#fff','stroke-width':1.4,opacity:.8});
  for(let k=0;k<3;k++){ const ph=(t*.8+k/3)%1, cx=X(-x+o*(k+.5)/3); A.el('ellipse',{cx,cy:Y(-x)+ph*14,rx:2.6,ry:3.8,fill:'#5aaee6',opacity:1-ph}); }
  A.lab(X(4),Y(4),'8 cm',{fill:'#fff',w:700,size:14});
  if(x>.1){ A.el('path',{d:`M${X(-x)} ${Y(4)}H${X(0)}`,stroke:f.c,'stroke-width':3}); T(A,X(-x/2),Y(4)-14,'x','c',{size:15}); }
  A.el('path',{d:`M${X(-x)} ${Y(-x)-0}M${X(-x)} ${Y(-x)+26}H${X(-x+o)}`,stroke:f.tan,'stroke-width':1.6}); T(A,X(4),Y(-x)+40,'8 + 2x = '+fr(o,2),'tan',{size:12.5});
  const V=o**3-512, r=-6/(6*o*o); A.chips.push(['tan','V',fr(V,1)],['chord','dV/dt','−6'],['c','dx/dt',fr(r,4)]);
  A.hint='اسحب حافة الجليد لتغيير سمكه x'; };
/* box with square base: glass-like, drag the right edge to change x */
S.rBox.pick=(A,px)=>{ const g=A._g; return g?(px-g.X(0))/g.s:null; };
S.rBox.draw=function(A){ const x=A.p, h=Math.max(.3,3+(4-x)*(.5/.3)), g=fit(A,-1.5,10,-1.6,9.5), X=g.X, Y=g.Y, f=A.col, dx=x*.45, dy=x*.3; A._g=g;
  ground(A,X(-1.5),X(10),Y(0),8);
  isoBox(A,X,Y,0,0,x,h,dx,dy,{fill:'#9ec5ff',side:'#7fb0f5',top:'#cfe2ff',st:f.f,op:.75,sw:2});
  arrow(A,X(x+dx)+8,Y(h/2),X(x+dx)+44,Y(h/2),'chord'); arrow(A,X(x/2),Y(h+dy)-34,X(x/2),Y(h+dy)-4,'tan');
  T(A,X(x/2),Y(0)+22,'x = '+fr(x,1),'chord'); T(A,X(0)-10,Y(h/2),'h = '+fr(h,2),'tan',{anchor:'end'});
  A.chips.push(['chord','dx/dt','0.3'],['tan','dh/dt','−0.5'],['f','dV/dt',fr(2*x*h*.3-.5*x*x,2)]); A.hint='اسحب الصندوق أفقياً: الضلع يزيد والارتفاع ينقص'; };

/* worksheet companion (وزاري 2018): same tank, side 3 m, leak 0.9 m³/h — enrichment, not from the book */
S.rTankB=Object.assign({},S.rTank,{title:'خزان قاعدته مربعة ضلعها 3m',hint:'V = 9h ⇒ dV/dt = 9 dh/dt',tk:{a:3,r:.9,q:1}});
S.rTankB2=Object.assign({},S.rTank,{title:'خزان قاعدته مربعة ضلعها 3m',hint:'V = 9h ⇒ dV/dt = 9 dh/dt',tk:{a:3,r:.9}});
S.rTank.anim=1; S.rCone.anim=1; S.rTankB.anim=1; S.rTankB2.anim=1;
staged('rTank',[[0,'g','side = 2 m','المعطيات'],[0,'g','dV/dt = −0.4 m³/h','تسرب ⇒ سالب'],[0,'r','dh/dt = ?','المطلوب'],
  [2,'rel','V = (2)(2)h = 4h','العلاقة'],[3,'d','dV/dt = 4·dh/dt','نشتق'],[4,'ans','dh/dt = −0.4/4 = −0.1 m/h','النتيجة']],4);
staged('rTankB',[[0,'g','side = 3 m','المعطيات'],[0,'g','dV/dt = −0.9 m³/h','تسرب ⇒ سالب'],[0,'r','dh/dt = ?','المطلوب']],0);
staged('rTankB2',[[0,'g','side = 3 m , dV/dt = −0.9 m³/h','المعطيات'],[0,'rel','V = (3)(3)h = 9h','العلاقة'],[0,'d','dV/dt = 9·dh/dt','نشتق'],[0,'ans','dh/dt = −0.9/9 = −0.1 m/h','النتيجة']],0);
staged('rPlate',[[0,'g','A = 96 cm²','المساحة ثابتة'],[0,'g','dx/dt = 2 cm/s ,  y = 8','المعطيات'],[0,'r','dy/dt = ?','المطلوب'],
  [1,'rel','xy = 96 ⇒ x = 12','العلاقة'],[2,'d','x·dy/dt + y·dx/dt = 0','نشتق'],[3,'ans','dy/dt = −16/12 = −4/3 cm/s','النتيجة']],3);
staged('rIce',[[0,'g','edge = 8 cm , dV/dt = −6 cm³/s','المعطيات'],[0,'g','x = 1 cm','لحظة السؤال'],[0,'r','dx/dt = ?','المطلوب'],
  [1,'rel','V = (8 + 2x)³ − 8³','العلاقة'],[2,'d','dV/dt = 6(8 + 2x)²·dx/dt','نشتق'],[3,'ans','dx/dt = −6/600 = −0.01 cm/s','النتيجة']],3);
staged('rLadder',[[0,'g','L = 10 m , dx/dt = 2 m/s , x = 8','المعطيات'],[0,'r','dy/dt = ? , dθ/dt = ?','المطلوب'],
  [1,'rel','x² + y² = 100 ⇒ y = 6','فيثاغورس'],[2,'d','2x·dx/dt + 2y·dy/dt = 0','نشتق'],[2,'ans','dy/dt = −8/3 m/s','النتيجة 1'],
  [3,'rel','sin θ = y/10 ⇒ cos θ·dθ/dt = (1/10)·dy/dt','الزاوية'],[3,'ans','dθ/dt = −1/3 rad/s','النتيجة 2']],3);
staged('rCone',[[0,'g','H = 24 , D = 16 ⇒ R = 8 cm','المعطيات'],[0,'g','in 5 , out 1 cm³/s ; h = 12','المعطيات'],[0,'r','dh/dt = ?','المطلوب'],
  [1,'rel','r/h = 8/24 ⇒ r = h/3','التشابه'],[2,'rel','V = (1/27)πh³','الحجم'],[2,'d','dV/dt = (1/9)πh²·dh/dt','نشتق'],[3,'g','dV/dt = 5 − 1 = 4','صب − تسرب'],[4,'ans','dh/dt = 4/(16π) = 1/(4π) cm/s','النتيجة']],4);
staged('rShadow',[[0,'g','pole 7.2 m , man 1.8 m , dx/dt = 30','المعطيات'],[0,'r','ds/dt = ?','المطلوب'],[0,'rel','s/1.8 = (x + s)/7.2 ⇒ s = x/3','التشابه'],[0,'ans','ds/dt = 30/3 = 10 m/min','النتيجة']],0);
staged('rBox',[[0,'g','dx/dt = 0.3 , dh/dt = −0.5','المعطيات'],[0,'g','x = 4 , h = 3','لحظة السؤال'],[0,'r','dV/dt = ?','المطلوب'],[0,'rel','V = x²h','العلاقة']],0);
S.rLad60=Object.assign({},S.rLadder,{title:'سلم: الزاوية π/3',hint:'dy/dt = −(x/y)·dx/dt = −2 cot θ',sl:{min:1,max:9.6,v:5,lab:'x (السلم 10 للتوضيح)',fmt:v=>fr(v,1)}});

/* box folded from a 12 cm sheet: flat sheet + 3D folded box; drag the corner square */
S.o2.pick=(A,px,py)=>{ const g=A._g; if(!g) return null; const u=(px-g.X(0))/g.s, v=(py-g.Y(12))/g.s; return Math.min(Math.abs(u),Math.abs(v),Math.abs(12-u),Math.abs(12-v))*0+Math.max(0,Math.min(u,v,12-u,12-v)); };
S.o2.draw=function(A){ const x=A.p, L=split(A), c=A.col, half=[L.g[0],L.g[1],L.g[2],L.g[3]*.55], low=[L.g[0],L.g[1]+L.g[3]*.55,L.g[2],L.g[3]*.45];
  const g=fitR(half,-.5,12.5,-.5,12.5), X=g.X, Y=g.Y; A._g=g;
  A.el('rect',{x:X(0),y:Y(12),width:12*g.s,height:12*g.s,fill:'#d9c7a3',stroke:'#9a7b45','stroke-width':2});
  [[0,0],[12-x,0],[0,12-x],[12-x,12-x]].forEach(([a,b])=>A.el('rect',{x:X(a),y:Y(b+x),width:x*g.s,height:x*g.s,fill:c.surf,stroke:c.bad,'stroke-width':1.6,'stroke-dasharray':'4 3'}));
  A.el('rect',{x:X(x),y:Y(12-x),width:(12-2*x)*g.s,height:(12-2*x)*g.s,fill:'none',stroke:'#9a7b45','stroke-width':1.4,'stroke-dasharray':'6 4'});
  T(A,X(x/2),Y(12)-10,'x','bad'); T(A,X(6),Y(6),'12 − 2x','f'); T(A,X(12)-4,Y(0)+14,'اسحب الزاوية','muted',{size:11,anchor:'end'});
  /* folded box */
  const b=12-2*x, gb=fitR(low,-1,13+6,-1,Math.max(7,x+6)), XB=gb.X, YB=gb.Y; isoBox(A,XB,YB,0,0,b,x,b*.45,b*.3,{fill:'#d9c7a3',side:'#c4ad80',top:'#efe3cc',st:'#9a7b45',sw:1.6});
  poly(A,[[XB(b*.45*.08),YB(x+b*.3*.08)],[XB(b+b*.45*.92),YB(x+b*.3*.08)],[XB(b+b*.45*.92),YB(x+b*.3*.92)],[XB(b*.45*.92),YB(x+b*.3*.92)]],{fill:'#a88b55',opacity:.35});
  T(A,XB(b/2),YB(0)+14,fr(b,1),'f',{size:12}); T(A,XB(0)-8,YB(x/2),fr(x,1),'bad',{size:12,anchor:'end'});
  const V=t=>t*(12-2*t)**2, P=A.subplot(L.p,[0,6,0,140]); P.axes('x','V'); P.curve(V,'f',0,6); P.pt(x,V(x),'c'); P.pt(2,128,'tan','128',{r:4});
  A.chips.push(['c','x',fr(x,2)],['f','V',fr(V(x),1)+' cm³']); A.ok=abs(x-2)<.05; if(A.ok) A.hint='✓ عند x = 2 الحجم الأعظم 128 cm³'; };
/* wire of 60 cm cut into a square and a circle: drag the cut point */
S.o5.pick=(A,px,py)=>{ const g=A._wg; if(!g||py<g.y-30||py>g.y+30) return null; return Math.max(0,Math.min(15,(px-g.x0)/g.w*60/4)); };
{ const d0=S.o5.draw; S.o5.draw=function(A){ const x=A.p, L=split(A), c=A.col, wy=L.g[1]+L.g[3]-26, x0=L.g[0]+16, w=L.g[2]-32, cut=x0+w*(4*x/60); A._wg={x0,w,y:wy};
  const g=L.g; A.H0=A.H; d0.call(this,A);
  A.el('path',{d:`M${x0} ${wy}H${cut}`,stroke:c.f,'stroke-width':5,'stroke-linecap':'round'}); A.el('path',{d:`M${cut} ${wy}H${x0+w}`,stroke:c.chord,'stroke-width':5,'stroke-linecap':'round'});
  A.el('circle',{cx:cut,cy:wy,r:9,fill:c.surf,stroke:c.c,'stroke-width':3}); A.el('path',{d:`M${cut-6} ${wy-14}l12 28`,stroke:c.c,'stroke-width':2});
  T(A,(x0+cut)/2,wy-14,'4x = '+fr(4*x,1),'f',{size:11.5}); T(A,(cut+x0+w)/2,wy-14,'2πr = '+fr(60-4*x,1),'chord',{size:11.5}); T(A,x0+w/2,wy+18,'سلك 60 cm · اسحب نقطة القطع','muted',{size:11}); }; }
/* inscribed shapes: drag the moving vertex */
S.o3.pick=(A,px,py)=>{ const L=split(A), g=fitR(L.g,-13,13,-13,13); return 12-(g.Y(0)-py)/g.s; };
S.o4.pick=(A,px,py)=>{ const L=split(A), g=fitR(L.g,-13,13,-1,19); return (g.Y(0)-py)/g.s; };


/* painted cube with brush */
{ const d0=S.a9.draw; S.a9.anim=1; S.a9.draw=function(A){ d0.call(this,A); const g=fit(A,-2,15,-2,15), X=g.X, Y=g.Y, t=A.t, bx=X(11.5+Math.sin(t*1.4)*1.2), by=Y(8+Math.cos(t*1.4)*2);
  A.el('path',{d:`M${bx} ${by}l26 -34`,stroke:'#8a5520','stroke-width':6,'stroke-linecap':'round'}); A.el('rect',{x:bx-9,y:by-4,width:18,height:12,rx:3,fill:A.col.chord,transform:`rotate(-37 ${bx} ${by})`});
  T(A,X(12),Y(-1.2),'طبقة طلاء 0.15 cm','chord',{size:12}); }; }

/* ---------- 3−1: ministerial questions from the teacher's worksheet (enrichment, not from the book) ---------- */
/* cylinder of constant volume 320π: drag the radius, the height follows h = 320/r² */
function cylScene(o){ return {title:o.title,hint:o.hint,anim:0,sl:{min:5,max:11.5,v:o.v??8,step:.01,play:o.play??1,speed:.3,lab:'نصف القطر r',fmt:v=>fr(v)+' cm'},
 pick(A,px){ const g=A._g; return g?Math.abs(px-g.X(0))/g.s:null; },
 draw(A){ const r=A.p, h=320/(r*r), g=fit(A,-13,13,-3.6,14.4), X=g.X, Y=g.Y, c=A.col, ry=r*.26*g.s; A._g=g;
  const body=`M${X(-r)} ${Y(0)}V${Y(h)}A${r*g.s} ${ry} 0 0 1 ${X(r)} ${Y(h)}V${Y(0)}A${r*g.s} ${ry} 0 0 1 ${X(-r)} ${Y(0)}Z`;
  A.el('path',{d:body,fill:'#3f8f55',opacity:.85,stroke:'#2c6a3e','stroke-width':2});
  A.el('path',{d:`M${X(-r*.55)} ${Y(h)+ry*.8}V${Y(0)+ry*.8}`,stroke:'#fff',opacity:.18,'stroke-width':r*g.s*.18});
  A.el('ellipse',{cx:X(0),cy:Y(h),rx:r*g.s,ry,fill:'#e8f3ea',stroke:'#2c6a3e','stroke-width':2});
  A.el('path',{d:`M${X(-r)} ${Y(0)}A${r*g.s} ${ry} 0 0 0 ${X(r)} ${Y(0)}`,fill:'none',stroke:'#2c6a3e','stroke-width':2,'stroke-dasharray':'5 4'});
  A.el('path',{d:`M${X(0)} ${Y(h)}H${X(r)}`,stroke:c.c,'stroke-width':2.6,'stroke-dasharray':'2 4'}); A.el('circle',{cx:X(0),cy:Y(h),r:3.5,fill:c.c});
  T(A,X(r/2),Y(h)-12,'r','c',{size:15});
  A.el('path',{d:`M${X(r+1.4)} ${Y(0)}V${Y(h)}M${X(r+1)} ${Y(0)}H${X(r+1.8)}M${X(r+1)} ${Y(h)}H${X(r+1.8)}`,stroke:c.tan,'stroke-width':2.4});
  T(A,X(r+2.3),Y(h/2),'h','tan',{size:15,anchor:'start'});
  /* arrows: r grows, h shrinks (or the reverse in the homework) */
  const up=o.mode==='h'; arrow(A,X(-r)-6,Y(h*.5),X(-r)-6+(up?26:-30),Y(h*.5),'c'); arrow(A,X(0),Y(h)-ry-6,X(0),Y(h)-ry-6+(up?-26:26),'tan');
  T(A,X(0),Y(-2.6),'V = πr²h = 320π','f',{size:13}); T(A,X(0),Y(-3.4)+8,'الحجم ثابت','muted',{size:11.5});
  const dh=o.mode==='h'?.5:-320/(r*r*r), dr=o.mode==='h'?-(r*r*r)/1280:.5;
  A.chips.push(['c','r',fr(r)+' cm'],['tan','h',fr(h)+' cm'],['c','dr/dt',o.q&&o.mode==='h'?'?':fr(dr,3)],['tan','dh/dt',o.q&&o.mode!=='h'?'?':fr(dh,3)]); }}; }
S.rCylQ=cylScene({title:'أسطوانة حجمها ثابت 320π cm³',hint:'r²h = 320 ⇒ r²·dh/dt + 2rh·dr/dt = 0',q:1});
S.rCylQok=cylScene({title:'عند h = 5 : r = 8 ، dh/dt = −5/8',hint:'64·dh/dt + 2(8)(5)(0.5) = 0',v:8,play:0});
S.rCylH=cylScene({title:'واجب: الارتفاع يزداد 0.5 cm/s',hint:'r²·dh/dt + 2rh·dr/dt = 0',q:1,mode:'h',v:9});
S.rCylHok=cylScene({title:'عند h = 5 : r = 8 ، dr/dt = −0.4',hint:'64(0.5) + 2(8)(5)·dr/dt = 0',mode:'h',v:8,play:0});

/* two cars leaving a crossroads on perpendicular roads */
function carPx(A,x,y,ang,col){ const g=A.el('g',{transform:`translate(${x} ${y}) rotate(${ang})`});
  const e=(t,a)=>{ const n=document.createElementNS('http://www.w3.org/2000/svg',t); for(const k in a) n.setAttribute(k,a[k]); g.appendChild(n); };
  e('rect',{x:-20,y:-10,width:40,height:20,rx:7,fill:col,stroke:'#1d2b3a','stroke-width':1.4});
  e('rect',{x:-3,y:-8,width:12,height:16,rx:3,fill:'#cfe6ff',stroke:'#1d2b3a','stroke-width':1});
  e('rect',{x:-14,y:-8,width:8,height:16,rx:2,fill:'#cfe6ff',opacity:.8});
  [[-12,-11],[10,-11],[-12,9],[10,9]].forEach(([a,b])=>e('rect',{x:a,y:b,width:7,height:3,rx:1,fill:'#222'})); }
function carsScene(o){ const vx=o.vx, vy=o.vy, v=sq(vx*vx+vy*vy), T1=o.tq*1.6;
 return {title:o.title,hint:o.hint,anim:0,sl:{min:0,max:T1,v:o.tq,step:.001,play:1,speed:.2*T1,lab:'الزمن t (ساعة)',fmt:t=>fr(t,3)+' h'},
 draw(A){ const t=A.p, x=vx*t, y=vy*t, z=sq(x*x+y*y), M=Math.max(vx,vy)*T1, g=fit(A,-.18*M,1.12*M,-.18*M,1.12*M), X=g.X, Y=g.Y, c=A.col;
  const rw=Math.max(16,g.s*M*.07);
  A.el('rect',{x:X(-.06*M),y:Y(0)-rw/2,width:X(1.12*M)-X(-.06*M),height:rw,fill:'#8b929c',opacity:.35});
  A.el('rect',{x:X(0)-rw/2,y:Y(1.12*M),width:rw,height:Y(-.06*M)-Y(1.12*M),fill:'#8b929c',opacity:.35});
  A.el('path',{d:`M${X(0)} ${Y(0)}H${X(1.1*M)}M${X(0)} ${Y(0)}V${Y(1.1*M)}`,stroke:'#fff','stroke-width':2,'stroke-dasharray':'10 8',opacity:.9});
  T(A,X(1.08*M),Y(0)+rw,'الشرق','muted',{size:12,anchor:'end'}); T(A,X(0)-rw,Y(1.08*M),'الشمال','muted',{size:12,anchor:'end'});
  A.el('path',{d:`M${X(x)} ${Y(0)}L${X(0)} ${Y(y)}`,stroke:c.f,'stroke-width':2.6}); T(A,X(x/2)+16,Y(y/2)-12,'Z = '+fr(z,1)+' km','f',{size:13,anchor:'start'});
  A.el('path',{d:`M${X(0)} ${Y(0)}H${X(x)}`,stroke:c.chord,'stroke-width':4,opacity:.8}); A.el('path',{d:`M${X(0)} ${Y(0)}V${Y(y)}`,stroke:c.tan,'stroke-width':4,opacity:.8});
  T(A,X(x/2),Y(0)+rw/2+14,'x = '+fr(x,1),'chord',{size:12.5}); T(A,X(0)-rw/2-8,Y(y/2),'y = '+fr(y,1),'tan',{size:12.5,anchor:'end'});
  carPx(A,X(x),Y(0),0,'#4cc38a'); carPx(A,X(0),Y(y),-90,'#38a3c7');
  A.chips.push(['chord','x',fr(x,2)+' km'],['tan','y',fr(y,2)+' km'],['f','Z',fr(z,2)+' km'],['f','dZ/dt',o.q?'?':fr(v)+' km/h']);
  A.hint=o.q?o.hint:'Z = '+fr(v)+'t ⇒ المعدل ثابت '+fr(v)+' km/h'; }}; }
S.rCars3=carsScene({title:'سيارتان: 40 شرقاً و 30 شمالاً',hint:'Z² = x² + y²',vx:40,vy:30,tq:.1,q:1});
S.rCars3ok=carsScene({title:'dZ/dt = 50 km/h',hint:'',vx:40,vy:30,tq:.1});
S.rCars4=carsScene({title:'طريقان متعامدان: 80 و 60',hint:'بعد ربع ساعة: x = 20 ، y = 15',vx:80,vy:60,tq:.25,q:1});
S.rCars4ok=carsScene({title:'dZ/dt = 100 km/h',hint:'',vx:80,vy:60,tq:.25});

/* lighthouse 20 m and a ship 5 m sailing away: shadow y = x/3 */
S.rLight={title:'فنار 20m وسفينة ارتفاعها 5m',hint:'y/(x + y) = 5/20 ⇒ x = 3y',anim:1,sl:{min:6,max:33,v:18,step:.1,play:1,speed:.3,lab:'بعد السفينة x (m)',fmt:v=>fr(v,1)+' m'},
 pick(A,px){ const g=A._g; return g?(px-g.X(0))/g.s:null; },
 draw(A){ const x=A.p, y=x/3, g=fit(A,-6,46,-6,25), X=g.X, Y=g.Y, c=A.col, t=A.t; A._g=g;
  A.el('rect',{x:X(-6),y:Y(25),width:X(46)-X(-6),height:Y(0)-Y(25),fill:'#1b2a4d',opacity:.1});
  let d=`M${X(-6)} ${Y(0)}`; for(let k=-6;k<=46;k+=1) d+=`L${X(k)} ${Y(0)+Math.sin(k*1.3+t*2)*2}`; d+=`L${X(46)} ${Y(-6)}L${X(-6)} ${Y(-6)}Z`;
  A.el('path',{d,fill:'#2f7fb8',opacity:.45});
  /* light cone over the water up to the shadow tip */
  poly(A,[[X(0),Y(20)],[X(-3),Y(0)],[X(x+y),Y(0)]],{fill:'#ffd34d',opacity:.14});
  A.el('path',{d:`M${X(0)} ${Y(20)}L${X(x+y)} ${Y(0)}`,stroke:'#e0a400','stroke-width':1.6,'stroke-dasharray':'6 4'});
  /* lighthouse: tapered striped tower */
  const tw=(hh)=>1.6-hh*.03; for(let k=0;k<5;k++){ const a=k*4, b=a+4; poly(A,[[X(-tw(a)),Y(a)],[X(tw(a)),Y(a)],[X(tw(b)),Y(b)],[X(-tw(b)),Y(b)]],{fill:k%2?'#fff':'#d64545',stroke:'#7a2a2a','stroke-width':1}); }
  A.el('rect',{x:X(-1.3),y:Y(21.6),width:X(1.3)-X(-1.3),height:Y(20)-Y(21.6),fill:'#333'});
  [26,16,9].forEach((r,i)=>A.el('circle',{cx:X(0),cy:Y(20.8),r,fill:'#ffd34d',opacity:[.15,.28,1][i]}));
  /* shadow on the water, then the ship */
  A.el('ellipse',{cx:X(x+y/2),cy:Y(0)+2,rx:y*g.s/2,ry:4,fill:'#0b1830',opacity:.5});
  poly(A,[[X(x-3.2),Y(1.6)],[X(x+3.2),Y(1.6)],[X(x+2.2),Y(-.4)],[X(x-2.6),Y(-.4)]],{fill:'#5b4636',stroke:'#2d241b','stroke-width':1.2});
  A.el('rect',{x:X(x-1.8),y:Y(3.4),width:X(x+.8)-X(x-1.8),height:Y(1.6)-Y(3.4),fill:'#eef2f6',stroke:'#2d241b','stroke-width':1});
  A.el('path',{d:`M${X(x)} ${Y(1.6)}V${Y(5)}`,stroke:'#2d241b','stroke-width':2.4});
  A.el('path',{d:`M${X(0)} ${Y(-2.2)}H${X(x)}M${X(x)} ${Y(-3.2)}H${X(x+y)}`,stroke:c.chord,'stroke-width':3}); 
  T(A,X(x/2),Y(-3.4),'x','chord',{size:14}); A.el('path',{d:`M${X(x)} ${Y(-3.2)}H${X(x+y)}`,stroke:c.tan,'stroke-width':3}); T(A,X(x+y/2),Y(-4.4),'y','tan',{size:14});
  T(A,X(-3),Y(10),'20 m','ink2',{size:12.5,anchor:'end'}); T(A,X(x+1.4),Y(5.4),'5 m','ink2',{size:12,anchor:'start'});
  arrow(A,X(x+3.4),Y(1),X(x+3.4)+30,Y(1),'chord');
  A.chips.push(['chord','x',fr(x,1)+' m'],['tan','y = x/3',fr(y,1)+' m'],['chord','dx/dt','50 km/h'],['tan','dy/dt',this.q?'?':'50/3 km/h']); }};
S.rLightOk=Object.assign({},S.rLight,{title:'dy/dt = 50/3 km/h',q:0}); S.rLight.q=1;

GEN.gCars=()=>{ const [a,b,cc]=pick([[3,4,5],[6,8,10],[5,12,13],[8,15,17],[4,3,5],[8,6,10]]), k=pick([5,10,20]), t=pick([.1,.2,.25,.5]);
  const vx=a*k, vy=b*k, v=cc*k, x=+(vx*t).toFixed(3), y=+(vy*t).toFixed(3), z=+(v*t).toFixed(3);
  return {q:`انطلقت سيارتان في اللحظة نفسها من تقاطع طريقين متعامدين: الأولى بسرعة $${vx}\\,km/h$ والثانية بسرعة $${vy}\\,km/h$. جد معدل تغير المسافة بينهما بعد $${t}$ ساعة.`,ans:String(v),ph:'dZ/dt (km/h)',
   sol:[`» نفرض: $x$ مسافة الأولى ، $y$ مسافة الثانية ، $Z$ المسافة بينهما`,`$x=${vx}(${t})=${x}$ ، $y=${vy}(${t})=${y}$ ، $Z=\\sqrt{${x}^2+${y}^2}=${z}$`,
     `العلاقة: $Z^2=x^2+y^2$ ⇐ نشتق: $Z\\dfrac{dZ}{dt}=x\\dfrac{dx}{dt}+y\\dfrac{dy}{dt}$`,`$${z}\\dfrac{dZ}{dt}=${x}(${vx})+${y}(${vy})\\Rightarrow\\dfrac{dZ}{dt}=${v}\\ km/h$`,`» لاحظ: الجواب $\\sqrt{${vx}^2+${vy}^2}=${v}$ لا يعتمد على الزمن.`],
   miss:[[String(vx+vy),'جمعت السرعتين؛ الطريقان متعامدان فنستعمل فيثاغورس: $Z^2=x^2+y^2$.']]}; };
GEN.gCyl=()=>{ const r=pick([2,3,4,5,6]), h=pick([2,3,4,5,6,8]), n=pick([1,2,3,4]), V=r*r*h, d=fq(n,2), ans=fq(-h*n,r);
  return {q:`أسطوانة دائرية قائمة حجمها ثابت $${V}\\pi\\,cm^3$ ، يزداد نصف قطرها بمعدل $${d.s}\\,cm/s$. جد معدل تغير ارتفاعها في اللحظة التي يكون فيها ارتفاعها $${h}\\,cm$.`,ans:ans.s,ph:'dh/dt (cm/s)',
   sol:[`» نفرض: $r$ نصف القطر ($\\dfrac{dr}{dt}=${d.t}$) ، $h$ الارتفاع ($\\dfrac{dh}{dt}=?$) ، الحجم ثابت`,`العلاقة: $\\pi r^2h=${V}\\pi\\Rightarrow r^2h=${V}$ ، وعندما $h=${h}$ : $r^2=${r*r}\\Rightarrow r=${r}$`,
     `نشتق (قاعدة الضرب): $r^2\\dfrac{dh}{dt}+2rh\\dfrac{dr}{dt}=0$`,`$${r*r}\\dfrac{dh}{dt}+2(${r})(${h})(${d.t})=0\\Rightarrow\\dfrac{dh}{dt}=${ans.t}\\ cm/s$`,'» الإشارة سالبة: الحجم ثابت ونصف القطر يزداد، فالارتفاع يتناقص.'],
   miss:[[fq(h*n,r).s,'الحجم ثابت ونصف القطر يزداد، فالارتفاع **يتناقص**: الإشارة سالبة.'],[fq(-h*n,2*r).s,'مشتقة $r^2$ هي $2r\\dfrac{dr}{dt}$ : لا تنسَ العدد 2.']]}; };

/* light on the ground 20 m from a wall; a 1.6 m road roller drives toward the wall; its shadow climbs the wall: y = 32/(20 − x) */
S.rWall={title:'ضوء على الأرض وحادلة 1.6m',hint:'(20 − x)/20 = 1.6/y ⇒ y = 32/(20 − x)',anim:1,sl:{min:1.5,max:16,v:12,step:.01,play:1,speed:.35,lab:'بعد الحادلة عن الحائط x (m)',fmt:v=>fr(v,1)+' m'},
 pick(A,px){ const g=A._g; return g?(px-g.X(0))/g.s:null; },
 draw(A){ const x=A.p, y=32/(20-x), g=fit(A,-3,23,-2.2,12.5), X=g.X, Y=g.Y, c=A.col, t=A.t, yc=Math.min(y,12.2); A._g=g;
  A.el('rect',{x:X(-3),y:Y(12.5),width:X(23)-X(-3),height:Y(0)-Y(12.5),fill:'#1b2a4d',opacity:.07});
  bricks(A,X(-1.2),Y(12.2),X(0)-X(-1.2),Y(0)-Y(12.2));
  ground(A,X(-3),X(23),Y(0),Y(-2.2)-Y(0));
  /* light beam from the ground lamp through the top of the roller to the wall */
  poly(A,[[X(20),Y(0)],[X(0),Y(0)],[X(0),Y(yc)]],{fill:'#ffd34d',opacity:.15});
  A.el('path',{d:`M${X(20)} ${Y(0)}L${X(0)} ${Y(y)}`,stroke:'#e0a400','stroke-width':1.6,'stroke-dasharray':'6 4'});
  /* shadow on the wall */
  A.el('rect',{x:X(0)-2,y:Y(yc),width:10,height:Y(0)-Y(yc),fill:'#111',opacity:.55,rx:2});
  /* road roller: front drum + body + cabin, height 1.6 */
  const w=1.5; A.el('circle',{cx:X(x),cy:Y(.55),r:.55*g.s,fill:'#6b6f76',stroke:'#2f3238','stroke-width':1.6});
  poly(A,[[X(x+.3),Y(.25)],[X(x+w+.9),Y(.25)],[X(x+w+.9),Y(1)],[X(x+.3),Y(1)]],{fill:'#f2b705',stroke:'#7a5c00','stroke-width':1.2});
  poly(A,[[X(x+w-.2),Y(1)],[X(x+w+.8),Y(1)],[X(x+w+.8),Y(1.6)],[X(x+w-.2),Y(1.6)]],{fill:'#cfe6ff',stroke:'#7a5c00','stroke-width':1.2});
  A.el('circle',{cx:X(x+w+.5),cy:Y(.3),r:.3*g.s,fill:'#2f3238'});
  A.el('path',{d:`M${X(x)} ${Y(1.6)}V${Y(0)}`,stroke:c.int,'stroke-width':1.6,'stroke-dasharray':'3 3'}); T(A,X(x)-6,Y(2.1),'1.6 m','int',{size:12,anchor:'end'});
  /* lamp on the ground */
  [22,13,7].forEach((r,i)=>A.el('circle',{cx:X(20),cy:Y(.2),r,fill:'#ffd34d',opacity:[.18,.32,1][i]})); T(A,X(20),Y(1.5),'الضوء','muted',{size:11.5});
  /* dimensions */
  A.el('path',{d:`M${X(0)} ${Y(-1.2)}H${X(x)}`,stroke:c.chord,'stroke-width':3}); T(A,X(x/2),Y(-1.9),'x','chord',{size:14});
  A.el('path',{d:`M${X(x)} ${Y(-1.2)}H${X(20)}`,stroke:c.muted,'stroke-width':1.6,'stroke-dasharray':'4 3'}); T(A,X((x+20)/2),Y(-1.9),'20 − x','muted',{size:12});
  A.el('path',{d:`M${X(-1.7)} ${Y(0)}V${Y(yc)}`,stroke:c.tan,'stroke-width':2.6}); T(A,X(-2.2),Y(yc/2),'y','tan',{size:15,anchor:'end'});
  arrow(A,X(x)-4,Y(2.9),X(x)-34,Y(2.9),'chord');
  A.chips.push(['chord','x',fr(x,1)+' m'],['tan','y = 32/(20 − x)',fr(y,2)+' m'],['chord','dx/dt','−2.5'],['tan','dy/dt',this.q?'?':fr(-80/((20-x)**2),3)]); }};
S.rWallOk=Object.assign({},S.rWall,{title:'عند x = 8 : dy/dt = −5/9 m/min',sl:Object.assign({},S.rWall.sl,{v:8,play:0}),q:0}); S.rWall.q=1;

GEN.gWall=()=>{ const [L,m10]=pick([[20,16],[12,15],[15,18],[10,20],[18,12]]), v2=pick([2,3,4,5,6]), d=pick([2,3,4,5,6].filter(k=>k<L-1)), x=L-d;
  const num=-m10*L*v2, den=20*d*d, r=fq(num,den), yv=fq(m10*L,10*d);
  return {q:`مصدر ضوئي على الأرض يبعد $${L}\\,m$ عن حائط، يسير شخص طوله $${m10/10}\\,m$ نحو الحائط بسرعة $${v2/2}\\,m/s$. جد معدل تغير طول ظله على الحائط عندما يكون على بعد $${x}\\,m$ من الحائط.`,ans:r.s,ph:'dy/dt (m/s)',
   sol:[`» نفرض: $x$ بعده عن الحائط ($\\dfrac{dx}{dt}=-${v2/2}$ لأنه يقترب) ، $y$ طول الظل على الحائط`,`التشابه: $\\dfrac{${L}-x}{${L}}=\\dfrac{${m10/10}}{y}\\Rightarrow y=\\dfrac{${+(m10*L/10).toFixed(2)}}{${L}-x}$`,
     `نشتق: $\\dfrac{dy}{dt}=\\dfrac{${+(m10*L/10).toFixed(2)}}{(${L}-x)^2}\\cdot\\dfrac{dx}{dt}$`,`نعوّض $${L}-x=${d}$ : $\\dfrac{dy}{dt}=\\dfrac{${+(m10*L/10).toFixed(2)}}{${d*d}}(-${v2/2})=${r.t}$`,'» سالب: كلما اقترب من الحائط ابتعد عن الضوء فقصر ظله.'],
   miss:[[fq(-num,den).s,'الشخص يقترب من الحائط فـ $x$ تتناقص: $\\dfrac{dx}{dt}$ سالبة.']]}; };

/* cone with vertex down (funnel / filter): H, R, inflow, outflow — worksheet questions (وزاري 2010 ، 2018) */
function funnel(o){ const H=o.H, R=o.R, k=R/H, net=(o.inn||0)-(o.out||0), u=o.u||'s';
 return {title:o.title,hint:`r/${R} = h/${H} ⇒ r = ${k===.5?'h/2':k===1/3?'h/3':fr(k,3)+'h'}`,anim:1,q:o.q,sl:{min:H*.1,max:H*.95,v:o.v??H*.7,step:.01,play:o.play??1,speed:.3,lab:'عمق السائل h',fmt:v=>fr(v,1)+' cm'},
 pick(A,px,py){ const g=A._g; return g?(g.Y(0)-py)/g.s:null; },
 draw(A){ const h=A.p, r=k*h, M=Math.max(H,2*R), g=fit(A,-R*1.4,R*1.7,-M*.22,H*1.17), X=g.X, Y=g.Y, f=A.col, t=A.t; A._g=g;
  poly(A,[[X(0),Y(0)],[X(r),Y(h)],[X(-r),Y(h)]],{fill:f.f,opacity:.3});
  A.el('ellipse',{cx:X(0),cy:Y(h),rx:r*g.s,ry:r*g.s*.22,fill:'#fde68a',opacity:.75,stroke:f.f,'stroke-width':1.6});
  A.el('path',{d:`M${X(-R)} ${Y(H)}L${X(0)} ${Y(0)}L${X(R)} ${Y(H)}`,fill:'none',stroke:'#2c6a3e','stroke-width':3});
  A.el('ellipse',{cx:X(0),cy:Y(H),rx:R*g.s,ry:R*g.s*.22,fill:'#3f8f55',opacity:.18,stroke:'#2c6a3e','stroke-width':2.6});
  A.el('path',{d:`M${X(0)} ${Y(0)}V${Y(H)}H${X(R)}`,stroke:f.muted,'stroke-width':1.4,'stroke-dasharray':'3 4',fill:'none'});
  A.el('path',{d:`M${X(0)} ${Y(0)}V${Y(h)}H${X(r)}`,stroke:f.c,'stroke-width':2.6,fill:'none'});
  T(A,X(R/2),Y(H)-14,String(R),'muted'); T(A,X(R*1.15),Y(H/2),String(H),'muted',{anchor:'start'});
  T(A,X(0)-6,Y(h/2),'h','c',{anchor:'end',size:15}); T(A,X(r/2),Y(h)+14,'r','c',{size:15});
  if(o.abc){ T(A,X(0)-4,Y(0)+4,'a','ink2',{anchor:'end',size:12}); T(A,X(0)-4,Y(H)-10,'b','ink2',{anchor:'end',size:12}); T(A,X(R)+6,Y(H)-8,'c','ink2',{anchor:'start',size:12});
   T(A,X(0)-4,Y(h)-10,'e','ink2',{anchor:'end',size:12}); T(A,X(r)+6,Y(h),'f','ink2',{anchor:'start',size:12}); }
  if(o.inn){ const sx=X(-R*.25); A.el('path',{d:`M${X(-R*1.1)} ${Y(H*1.15)}Q${sx} ${Y(H*1.16)} ${sx} ${Y(h)}`,stroke:f.tan,'stroke-width':4,fill:'none','stroke-dasharray':'8 6','stroke-dashoffset':-t*40});
   T(A,X(-R*1.1),Y(H*1.15)-12,`صب ${o.inn} cm³/${u}`,'tan',{size:12.5,anchor:'start'}); }
  if(o.out){ for(let q=0;q<2;q++){ const ph=((t*1.1+q/2)%1); A.el('ellipse',{cx:X(0),cy:Y(0)+8+ph*g.s*H*.15,rx:3,ry:4.4,fill:f.f,opacity:1-ph*.7}); }
   T(A,X(R*.08),Y(-H*.17),`تسرب ${o.out} cm³/${u}`,'chord',{size:12.5,anchor:'start'}); }
  arrow(A,X(-r)-10,Y(h)+(net<0?-4:22),X(-r)-10,Y(h)+(net<0?22:-4),'tan');
  const dh=net/(PI*k*k*h*h); A.chips.push(['c','r',fr(r,2)+' cm'],['f','V',fr(PI*k*k*h**3/3,1)+' cm³'],['chord','dV/dt',fr(net)],['tan','dh/dt',this.q?'?':fr(dh,4)]); }}; }
S.rFunnel=funnel({H:20,R:10,out:5,u:'min',abc:1,q:1,v:14,title:'قمع ارتفاعه 20cm وقطر قاعدته 20cm'});
S.rFunnelOk=funnel({H:20,R:10,out:5,u:'min',abc:1,v:6,play:0,title:'عند h = 6 : dh/dt = −5/(9π)'});
S.rFilter=funnel({H:12,R:4,inn:5,out:1,q:1,v:8,title:'مرشح ارتفاعه 12cm وقطر قاعدته 8cm'});
S.rFilterOk=funnel({H:12,R:4,inn:5,out:1,v:6,play:0,title:'عند h = 6 : dh/dt = 1/π'});

/* sand pouring from a tank into an upright cone whose height equals its diameter: h = 2r, V = 2πr³/3 */
S.rSand={title:'رمل يكوّن مخروطاً ارتفاعه = قطر قاعدته',hint:'h = 2r ⇒ V = ⅔πr³',anim:1,q:1,sl:{min:1,max:7,v:4,step:.01,play:1,speed:.3,lab:'نصف القطر r',fmt:v=>fr(v,2)+' cm'},
 pick(A,px){ const g=A._g; return g?Math.abs(px-g.X(0))/g.s:null; },
 draw(A){ const r=A.p, h=2*r, g=fit(A,-9,9,-2.5,20), X=g.X, Y=g.Y, c=A.col, t=A.t; A._g=g;
  ground(A,X(-9),X(9),Y(0),Y(-2.5)-Y(0));
  /* tank above with a nozzle */
  A.el('rect',{x:X(-2.2),y:Y(19.5),width:X(2.2)-X(-2.2),height:Y(17)-Y(19.5),rx:6,fill:'#cbd5e1',stroke:'#64748b','stroke-width':1.6});
  A.el('path',{d:`M${X(-.4)} ${Y(17)}L${X(0)} ${Y(16.2)}L${X(.4)} ${Y(17)}Z`,fill:'#64748b'});
  for(let q=0;q<9;q++){ const ph=((t*1.6+q/9)%1), yy=16.2-(16.2-h)*ph; A.el('circle',{cx:X(Math.sin(q*7)*.15),cy:Y(yy),r:2.2,fill:'#d4a14a',opacity:.9}); }
  /* sand cone */
  poly(A,[[X(-r),Y(0)],[X(r),Y(0)],[X(0),Y(h)]],{fill:'#e3b866',stroke:'#a8782c','stroke-width':1.8});
  A.el('ellipse',{cx:X(0),cy:Y(0),rx:r*g.s,ry:r*g.s*.22,fill:'#d4a14a',opacity:.6,stroke:'#a8782c','stroke-width':1.4});
  A.el('path',{d:`M${X(0)} ${Y(0)}H${X(r)}`,stroke:c.c,'stroke-width':2.6}); T(A,X(r/2),Y(0)+16,'r','c',{size:15});
  A.el('path',{d:`M${X(-r-1)} ${Y(0)}V${Y(h)}M${X(-r-1.3)} ${Y(0)}H${X(-r-.7)}M${X(-r-1.3)} ${Y(h)}H${X(-r-.7)}`,stroke:c.tan,'stroke-width':2.2}); T(A,X(-r-1.5),Y(h/2),'h = 2r','tan',{size:13,anchor:'end'});
  arrow(A,X(r)+4,Y(.6),X(r)+30,Y(.6),'c');
  T(A,X(2.6),Y(18.2),'25 cm³/s','chord',{size:12.5,anchor:'start'});
  A.chips.push(['c','r',fr(r,2)+' cm'],['tan','h = 2r',fr(h,2)+' cm'],['f','V = ⅔πr³',fr(2*PI*r**3/3,1)+' cm³'],['c','dr/dt',this.q?'?':fr(25/(2*PI*r*r),4)]); }};
S.rSandOk=Object.assign({},S.rSand,{title:'عند r = 5 : dr/dt = 1/(2π)',sl:Object.assign({},S.rSand.sl,{v:5,play:0}),q:0});
