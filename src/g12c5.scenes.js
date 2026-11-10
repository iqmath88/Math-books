/* السادس العلمي · الفصل الخامس · المعادلات التفاضلية الاعتيادية — مشاهد الرسم */
const sq=Math.sqrt, PI=Math.PI, abs=Math.abs, E=Math.exp, ln=Math.log;
const fr=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
const T=(A,x,y,s,col='ink2',o={})=>A.lab(x,y,s,{fill:A.col[col]||col,w:o.w??700,size:o.size||13,anchor:o.anchor,halo:1});
const S={};

/* ---------- helpers ---------- */
/* slope field of dy/dx = F(x,y): a short dash with the right slope at every grid point */
function field(A,F,n=18){ const V=A.V, kx=A.X(1)-A.X(0), ky=A.Y(0)-A.Y(1), m=Math.round(n*(A.Y(V.y0)-A.Y(V.y1))/(A.X(V.x1)-A.X(V.x0)))||n; let d='';
  for(let i=0;i<=n;i++) for(let j=0;j<=m;j++){ const x=V.x0+(V.x1-V.x0)*(i+.5)/(n+1), y=V.y0+(V.y1-V.y0)*(j+.5)/(m+1), s=F(x,y); if(!isFinite(s)) continue;
    let vx=kx, vy=-s*ky; const L=Math.hypot(vx,vy)||1; vx*=7/L; vy*=7/L; const px=A.X(x), py=A.Y(y); d+=`M${px-vx} ${py-vy}L${px+vx} ${py+vy}`; }
  A.el('path',{d,stroke:A.col.muted,'stroke-width':1.4,'stroke-linecap':'round',opacity:.75},A.G); }
/* a curve y = f(x) drawn only where it is finite and inside a generous band */
function curve(A,f,col,o={}){ const V=A.V, a=o.a??V.x0, b=o.b??V.x1, n=400, lim=(V.y1-V.y0)*3; let d='', pen=false;
  for(let i=0;i<=n;i++){ const x=a+(b-a)*i/n, y=f(x); if(!isFinite(y)||y>V.y1+lim||y<V.y0-lim){ pen=false; continue; } d+=(pen?'L':'M')+A.X(x)+' '+A.Y(y); pen=true; }
  A.el('path',{d,stroke:A.col[col]||col,'stroke-width':o.w||3,fill:'none','stroke-dasharray':o.dash,opacity:o.op??1},A.G); }
const dot=(A,x,y,col='c',r=6)=>A.el('circle',{cx:A.X(x),cy:A.Y(y),r,fill:A.col[col],stroke:A.col.surf,'stroke-width':2},A.G);

/* a family of solutions over a slope field: the slider moves the arbitrary constant */
function famScene(o){ return {v:o.v,title:o.title,hint:o.hint,sl:{min:o.c[0],max:o.c[1],v:o.c[2],step:.01,play:o.play??0,speed:.25,lab:o.lab||'الثابت c',fmt:v=>fr(v,2)},
 draw(A){ const c=A.p; if(o.F) field(A,o.F,o.n||18);
  (o.ghost||[]).forEach(k=>(o.ys||[o.y]).forEach(y=>curve(A,x=>y(x,k),'muted',{w:1.3,op:.55,a:o.a,b:o.b})));
  (o.ys||[o.y]).forEach(y=>curve(A,x=>y(x,c),'f',{w:3.2,a:o.a,b:o.b}));
  if(o.part) curve(A,o.part,'tan',{w:3,dash:'8 6',a:o.pa,b:o.pb});
  if(o.pt){ dot(A,o.pt[0],o.pt[1],'c',7); T(A,A.X(o.pt[0])+10,A.Y(o.pt[1])-14,o.ptl||'','c',{size:12.5,anchor:'start'}); }
  if(o.extra) o.extra(A,c);
  A.chips.push(['f',o.chip||'c',fr(c,2)]); (o.chips||[]).forEach(ch=>A.chips.push(ch)); }}; }

/* checking a proposed solution: drag x, compare the two sides of the equation numerically */
function checkScene(o){ const h=1e-3, d1=x=>(o.y(x+h)-o.y(x-h))/(2*h), d2=x=>(o.y(x+h)-2*o.y(x)+o.y(x-h))/(h*h);
 return {v:o.v,title:o.title,hint:o.hint,sl:{min:o.x[0],max:o.x[1],v:o.x[2],step:.01,play:1,speed:.2,lab:'نقطة الاختبار x',fmt:v=>fr(v,2)},
 pick(A,px){ return A.W2X?A.W2X(px):null; },
 draw(A){ const x=A.p, y=o.y(x), p=d1(x), q=d2(x), L=o.lhs(x,y,p,q), R=o.rhs(x,y,p,q), ok=abs(L-R)<1e-3*(1+abs(R));
  if(o.F) field(A,o.F,16);
  curve(A,o.y,'f',{w:3.2});
  if(isFinite(y)){ const k=(A.V.x1-A.V.x0)*.12; A.el('path',{d:`M${A.X(x-k)} ${A.Y(y-p*k)}L${A.X(x+k)} ${A.Y(y+p*k)}`,stroke:A.col.tan,'stroke-width':2.4},A.G); dot(A,x,y); }
  A.chips.push(['c','x',fr(x,2)],['f','y',fr(y,3)],['tan',"y′",fr(p,3)]); if(o.second) A.chips.push(['int',"y″",fr(q,3)]);
  A.chips.push(['chord','الطرف الأيسر',fr(L,3)],['chord','الطرف الأيمن',fr(R,3)]);
  A.hint=ok?'الطرفان متساويان عند كل x ✓ : '+(o.okmsg||'العلاقة حل للمعادلة'):'الطرفان غير متساويين ✗ : '+(o.badmsg||'ليست حلاً'); }}; }

/* ---------- 5−1 ---------- */
S.odeHook=famScene({v:[-6.2,1.8,-9,7],title:'dy/dx = 2x + 5 : كل منحنٍ يسير مع الشرطات',hint:'y = x² + 5x + c : عائلة من الحلول',F:(x,y)=>2*x+5,y:(x,c)=>x*x+5*x+c,c:[-2,6,2,1],ghost:[-2,0,4,6],chip:'y = x² + 5x + c',play:1});
S.order=famScene({v:[-6.2,1.8,-9,7],title:'المعادلة من الرتبة الأولى: ثابت واحد',hint:'رتبة أعلى مشتقة = عدد الثوابت في الحل العام',F:(x,y)=>2*x+5,y:(x,c)=>x*x+5*x+c,c:[-2,6,2],ghost:[0,4],chip:'c'});

/* ---------- 5−2 / 5−3 ---------- */
S.chk1=checkScene({v:[-4.5,2,-3,10],title:'y = x² + 3x  و  xy′ = x² + y',hint:'',y:x=>x*x+3*x,lhs:(x,y,p)=>x*p,rhs:(x,y)=>x*x+y,x:[-4,1.8,1],okmsg:'y = x² + 3x حل'});
S.gen1=famScene({v:[-1.2,.5,-3,3],title:'dy/dx − 5y = 0 : الحل العام y = c e⁵ˣ',hint:'c = 1 يعطي الحل الخاص y = e⁵ˣ',F:(x,y)=>5*y,y:(x,c)=>c*E(5*x),c:[-1.5,1.5,1],ghost:[-1,-.5,.5,1.5],part:x=>E(5*x),chip:'c'});
S.gen2=famScene({v:[-PI,2*PI,-2.6,2.6],title:'y″ + y = 0 : y = A sin x + B cos x',hint:'رتبة ثانية ⇐ ثابتان A و B (هنا B = 1 والمنزلق يغيّر A)',y:(x,a)=>a*Math.sin(x)+Math.cos(x),c:[-2,2,1],lab:'الثابت A',chip:'A',
  extra(A){ curve(A,Math.sin,'tan',{w:1.6,dash:'6 5'}); curve(A,Math.cos,'chord',{w:1.6,dash:'6 5'}); },chips:[['tan','sin x','حل خاص'],['chord','cos x','حل خاص']]});
S.chk2=checkScene({v:[.05,3.2,-1.6,1.6],title:'y = x ln|x| − x  و  x y′ = x + y',hint:'',y:x=>x*ln(abs(x))-x,lhs:(x,y,p)=>x*p,rhs:(x,y)=>x+y,x:[.2,3,1.5]});
S.chk3=checkScene({v:[-3,3,-.2,5],title:'ln y² = x + a  و  2y′ − y = 0 (a = 0)',hint:'',y:x=>E(x/2),lhs:(x,y,p)=>2*p-y,rhs:()=>0,x:[-2.8,2.8,1]});
S.chk4=checkScene({v:[-2,2,-14,10],title:'y = x³ + x − 2  و  y″ = 6x',hint:'',second:1,y:x=>x**3+x-2,lhs:(x,y,p,q)=>q,rhs:x=>6*x,x:[-1.8,1.8,1]});
S.chk5=checkScene({v:[-PI,PI,-4,4],title:'y = 3cos2x + 2sin2x  و  y″ + 4y = 0',hint:'',second:1,y:x=>3*Math.cos(2*x)+2*Math.sin(2*x),lhs:(x,y,p,q)=>q+4*y,rhs:()=>0,x:[-3,3,.5]});
S.chk6=checkScene({v:[-2.9,2,-1,4.5],title:'y² = 3x² + x³  و  yy″ + (y′)² − 3x = 5',hint:'',second:1,y:x=>sq(3*x*x+x**3),lhs:(x,y,p,q)=>y*q+p*p-3*x,rhs:()=>5,x:[.3,1.9,1],badmsg:'الطرف الأيسر 3 دائماً ، لا 5 : ليست حلاً'});
S.chk7=checkScene({v:[-1,1.3,0,8],title:'y = e²ˣ + e⁻³ˣ  و  y″ + y′ − 6y = 0',hint:'',second:1,y:x=>E(2*x)+E(-3*x),lhs:(x,y,p,q)=>q+p-6*y,rhs:()=>0,x:[-.6,1.2,.3]});

/* exercises 2–9 (5−3) */
S.x2=checkScene({v:[-PI,PI,-1.5,1.5],title:'y = sin x  و  y″ + y = 0',hint:'',second:1,y:Math.sin,lhs:(x,y,p,q)=>q+y,rhs:()=>0,x:[-3,3,1]});
S.x4=checkScene({v:[-3,3,-2,6],title:'y = x + 2  و  y″ + 3y′ + y = x',hint:'',second:1,y:x=>x+2,lhs:(x,y,p,q)=>q+3*p+y,rhs:x=>x,x:[-2.5,2.5,1],badmsg:'الطرف الأيسر x + 5 لا x : ليست حلاً'});
S.x5=checkScene({v:[-1.4,1.4,-6,6],title:'y = tan x  و  y″ = 2y(1 + y²)',hint:'',second:1,y:Math.tan,lhs:(x,y,p,q)=>q,rhs:(x,y)=>2*y*(1+y*y),x:[-1.2,1.2,.6]});
S.x6=checkScene({v:[-.75,.75,0,1.3],title:'2x² + y² = 1  و  y³y″ = −2',hint:'',second:1,y:x=>sq(1-2*x*x),lhs:(x,y,p,q)=>y**3*q,rhs:()=>-2,x:[-.6,.6,.3]});
S.x7=checkScene({v:[.1,3,-3,6],title:'yx = sin 5x  و  xy″ + 2y′ + 25yx = 0',hint:'',second:1,y:x=>Math.sin(5*x)/x,lhs:(x,y,p,q)=>x*q+2*p+25*y*x,rhs:()=>0,x:[.3,2.8,1]});

/* ---------- 5−4 / 5−5 : separation of variables ---------- */
S.sep1=famScene({v:[-6.2,1.8,-9,7],title:'dy = (2x + 5) dx ⇒ y = x² + 5x + c',hint:'نكامل الطرفين: ∫dy = ∫(2x + 5)dx',F:(x,y)=>2*x+5,y:(x,c)=>x*x+5*x+c,c:[-2,6,0],ghost:[-2,2,4,6]});
S.sep2=famScene({v:[-3,5,-5,5],title:'y dy = (x − 1) dx ⇒ y = ±√(x² − 2x + c₁)',hint:'نصفان للمنحني: + و −',F:(x,y)=>abs(y)<.05?NaN:(x-1)/y,ys:[(x,c)=>sq(x*x-2*x+c),(x,c)=>-sq(x*x-2*x+c)],c:[-3,6,2],ghost:[-2,0,4],chip:'c₁'});
S.sep3=famScene({v:[-2*PI,2*PI,-1.6,1.6],title:'sec²y dy = sin x dx ⇒ tan y = −cos x + c',hint:'y = tan⁻¹(c − cos x)',F:(x,y)=>Math.sin(x)*Math.cos(y)**2,y:(x,c)=>Math.atan(c-Math.cos(x)),c:[-3,3,0],ghost:[-2,-1,1,2]});
S.sep4=famScene({v:[-4.2,4.2,-1,26],title:'y′ = x√y : الحل الخاص المار بـ (2 , 9)',hint:'2√y = ½x² + c ، والشرط يعطي c = 4',F:(x,y)=>y<0?NaN:x*sq(y),y:(x,c)=>(x*x/4+c/2)**2,c:[.5,8,2],ghost:[1,3,6],part:x=>(x*x/4+2)**2,pt:[2,9],ptl:'(2 , 9)',chip:'c'});
S.sep4ok=Object.assign({},S.sep4,{sl:Object.assign({},S.sep4.sl,{v:4}),title:'c = 4 : y = (¼x² + 2)²',hint:'المنحني الوحيد من العائلة الذي يمر بـ (2 , 9)'});
S.sep5=famScene({v:[-2.5,.8,-2,3],title:'dy/dx = e²ˣ⁺ʸ : الحل المار بنقطة الأصل',hint:'y = ln|2/(3 − e²ˣ)|',F:(x,y)=>E(2*x+y),y:(x,c)=>{ const u=-c-E(2*x)/2; return u>0?-ln(u):NaN; },c:[-4,-.8,-1.5],ghost:[-3,-2.5,-1],part:x=>{ const u=3-E(2*x); return u>0?ln(2/u):NaN; },pt:[0,0],ptl:'(0 , 0)',chip:'c'});
S.sep6=famScene({v:[-4,2,-6,8],title:'(x + 1) dy/dx = 2y ⇒ y = ±C₁(x + 1)²',hint:'كل قطع مكافئ رأسه (−1 , 0)',F:(x,y)=>abs(x+1)<.05?NaN:2*y/(x+1),y:(x,c)=>c*(x+1)**2,c:[-2,2,1],ghost:[-1.5,-.5,.5,1.5],chip:'C'});
S.sepForm=famScene({v:[-.2,3,-.2,3],title:'M dx + N dy = 0',hint:'dy/dx = 3xy/(x + y)',F:(x,y)=>abs(x+y)<.02?NaN:3*x*y/(x+y),y:()=>NaN,c:[0,1,0],chip:'—'});
S.x1b=famScene({v:[-3,3,-1,5],title:'dy/dx + xy = 3x ، y(1) = 2',hint:'y = 3 − e^{(1 − x²)/2}',F:(x,y)=>3*x-x*y,y:(x,c)=>3-c*E(-x*x/2),c:[-3,3,E(.5)],ghost:[-2,-1,1,2],part:x=>3-E((1-x*x)/2),pt:[1,2],ptl:'(1 , 2)',chip:'C'});
S.x1g=famScene({v:[-3,.6,0,1.2],title:'y′ = 2eˣy³ ، y(0) = ½',hint:'y = 1/√(8 − 4eˣ)',F:(x,y)=>2*E(x)*y**3,y:(x,c)=>{ const u=c-4*E(x); return u>0?1/sq(u):NaN; },c:[5,12,8],ghost:[6,10],part:x=>{ const u=8-4*E(x); return u>0?1/sq(u):NaN; },pt:[0,.5],ptl:'(0 , ½)',chip:'c'});

/* ---------- «تمرين مشابه» generators (enrichment, not from the book) ---------- */
const GEN={};
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1)), pick=a=>a[Math.floor(Math.random()*a.length)];
/* order and degree of a generated equation */
GEN.gOrd=()=>{ const o=ri(1,3), d=ri(1,4), lo=ri(1,Math.max(1,o-1)), pl=ri(2,5);
  const D=k=>k===1?"y'":k===2?"y''":"y'''", top=d===1?D(o):`(${D(o)})^{${d}}`, low=o>1?`(${D(lo)})^{${pl}}`:`x^{${pl}}`;
  const q=`$${top}+${o>1?'3':'2x'}${low}-${pick(['5y','xy','y^2'])}=${pick(['0','x','\\sin x'])}$`;
  return {q:`بيّن رتبة ودرجة المعادلة التفاضلية: ${q}`,ans:o+' , '+d,ph:'الرتبة ، الدرجة',
   sol:[`أعلى مشتقة هي $${D(o)}$ ⇐ الرتبة $${o}$`,`أسّها $${d}$ ⇐ الدرجة $${d}$`,o>1?`» الأس $${pl}$ على $${D(lo)}$ لا يُحسب لأنها ليست أعلى مشتقة.`:'» الأس على $x$ لا علاقة له بالدرجة.'],
   miss:o>1?[[o+' , '+pl,'هذا أسّ مشتقة أدنى؛ الدرجة أسّ **أعلى** مشتقة.']]:[]}; };
/* separable: dy/dx = k x^n y  (solution y = C e^{k x^{n+1}/(n+1)}) — ask for c from a point */
GEN.gSep=()=>{ const a=ri(1,3), b=ri(1,4), x0=ri(1,3), k=ri(1,3);
  /* y dy = (a x + b) dx with y(x0) = y0 : ½y² = ½a x² + b x + c */
  const y0=pick([2,4,6]), c=y0*y0/2-a*x0*x0/2-b*x0;
  return {q:`حل المعادلة $y\\dfrac{dy}{dx}=${a===1?'':a}x+${b}$ ، ثم جد قيمة الثابت $c$ (في $\\tfrac12y^2=\\tfrac{${a}}{2}x^2+${b}x+c$) إذا كان $y=${y0}$ عندما $x=${x0}$.`,ans:String(c),ph:'قيمة c',
   sol:[`» نفصل: $y\\,dy=(${a}x+${b})\\,dx$`,`نكامل: $\\tfrac12y^2=\\tfrac{${a}}{2}x^2+${b}x+c$`,`نعوّض $(${x0} , ${y0})$ : $\\tfrac{${y0*y0}}{2}=\\tfrac{${a*x0*x0}}{2}+${b*x0}+c\\Rightarrow c=${c}$`],
   miss:[[String(-c),'انتبه للإشارة عند نقل الحدود.']]}; };
