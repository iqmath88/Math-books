/* السادس العلمي · الفصل الرابع · التكامل — مشاهد الرسم */
const sq=Math.sqrt, PI=Math.PI, abs=Math.abs;
const fr=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
const T=(A,x,y,s,col='ink2',o={})=>A.lab(x,y,s,{fill:A.col[col]||col,w:o.w??700,size:o.size||13,anchor:o.anchor,halo:1});
const piF=v=>{ const n=Math.round(v/(PI/4)); if(abs(v-n*PI/4)>1e-6) return fr(v); const t={0:'0',1:'π/4',2:'π/2',3:'3π/4',4:'π',5:'5π/4',6:'3π/2',7:'7π/4',8:'2π'}; return n<0?'−'+t[-n]:t[n]; };
const S={};

/* ---------- helpers ---------- */
/* smallest / largest value of f on [a,b] (sampled; endpoints + interior) */
function mM(f,a,b){ let m=Infinity,M=-Infinity; for(let i=0;i<=400;i++){ const y=f(a+(b-a)*i/400); if(y<m) m=y; if(y>M) M=y; } return [m,M]; }
function bar(A,x0,x1,y,col,op,st=1){ const X0=A.X(x0), X1=A.X(x1), Y0=A.Y(0), Y1=A.Y(y);
  A.el('rect',{x:Math.min(X0,X1),y:Math.min(Y0,Y1),width:abs(X1-X0),height:abs(Y1-Y0),fill:A.col[col],'fill-opacity':op,stroke:A.col[col],'stroke-width':st,'stroke-opacity':.9},A.G); }
/* lower (inside) and upper (outside) rectangles for the partition P */
function rects(A,f,P,o={}){ let L=0,U=0; const ms=[];
  for(let i=0;i+1<P.length;i++){ const [m,M]=mM(f,P[i],P[i+1]), h=P[i+1]-P[i]; L+=h*m; U+=h*M; ms.push([m,M]);
    if(o.up!==false) bar(A,P[i],P[i+1],M,'chord',.13,1.6);
    if(o.lo!==false) bar(A,P[i],P[i+1],m,'tan',.32,1.6); }
  if(o.marks!==false) P.forEach(x=>{ A.el('path',{d:`M${A.X(x)} ${A.Y(0)-5}V${A.Y(0)+5}`,stroke:A.col.int,'stroke-width':2.4},A.G); });
  if(o.mlab&&P.length<7) ms.forEach(([m,M],i)=>{ const xc=(P[i]+P[i+1])/2; if(o.lo!==false) T(A,A.X(xc),A.Y(m/2)-(m<0?-2:0),'m'+'₁₂₃₄₅₆'[i],'tan',{size:12}); if(o.up!==false&&o.lo===false) T(A,A.X(xc),A.Y(M/2),'M'+'₁₂₃₄₅₆'[i],'chord',{size:12}); });
  if(o.lo!==false) A.chips.push(['tan','L(σ , f)',fr(L,3)]); if(o.up!==false) A.chips.push(['chord','U(σ , f)',fr(U,3)]);
  if(o.lo!==false&&o.up!==false) A.chips.push(['f','(L + U) ÷ 2',fr((L+U)/2,3)]);
  return {L,U}; }
/* signed area shading between f and g (g = 0 by default) on [a,b] */
function shade(A,f,a,b,g=x=>0,o={}){ const n=300, pos=[], neg=[]; let d1='',d2='';
  for(let i=0;i<n;i++){ const x0=a+(b-a)*i/n, x1=a+(b-a)*(i+1)/n, xm=(x0+x1)/2, s=f(xm)-g(xm);
    const seg=`M${A.X(x0)} ${A.Y(g(x0))}L${A.X(x0)} ${A.Y(f(x0))}L${A.X(x1)} ${A.Y(f(x1))}L${A.X(x1)} ${A.Y(g(x1))}Z`; if(s>=0) d1+=seg; else d2+=seg; }
  A.el('path',{d:d1,fill:A.col[o.pc||'f'],'fill-opacity':o.op||.28,stroke:'none'},A.G); A.el('path',{d:d2,fill:A.col[o.nc||'bad'],'fill-opacity':o.op||.28,stroke:'none'},A.G); }
const vline=(A,x,col='muted')=>A.el('path',{d:`M${A.X(x)} ${A.V.pad.t}V${A.H-A.V.pad.b}`,stroke:A.col[col],'stroke-width':1.3,'stroke-dasharray':'5 5'},A.G);
/* numeric integral */
const integ=(f,a,b,n=2000)=>{ let s=0; const h=(b-a)/n; for(let i=0;i<n;i++) s+=f(a+(i+.5)*h); return s*h; };
/* area scene: signed shading of f on [a,b] with the integral and the area in chips */
function AR(o){ return Object.assign({f:o.f,v:o.v,title:o.title,hint:o.hint||'',noAB:1,
  under(A){ shade(A,o.f,o.a,o.b,o.g,o); (o.cut||[]).forEach(x=>vline(A,x,'c')); },
  draw(A){ const I=integ(o.g?(x=>o.f(x)-o.g(x)):o.f,o.a,o.b), Ab=(()=>{ const cuts=[o.a,...(o.cut||[]),o.b]; let s=0; for(let i=0;i+1<cuts.length;i++) s+=abs(integ(o.g?(x=>o.f(x)-o.g(x)):o.f,cuts[i],cuts[i+1])); return s; })();
    if(o.g) A.el('path',{d:A.path(o.g,A.V.x0,A.V.x1),stroke:A.col[o.gc||'chord'],'stroke-width':2.6,fill:'none'},A.G);
    (o.labs||[]).forEach(([x,y,s,c])=>T(A,A.X(x),A.Y(y),s,c||'ink2'));
    if(o.chips) o.chips(A,I,Ab); else { A.chips.push(['f','التكامل',fr(I,3)]); if(o.cut||o.area) A.chips.push(['tan','المساحة',fr(Ab,3)]); } }},
  o.extra||{}); }
/* Riemann scene factory */
function RS(o){ return Object.assign({f:o.f,v:o.v,title:o.title,hint:o.hint||'',a:o.P[0],b:o.P.at(-1),interval:o.iv?1:0,noAB:1,
  draw(A){ if(o.show!==false) rects(A,o.f,o.P,o); (o.pts||[]).forEach(([x,y,s,c])=>{ A.el('circle',{cx:A.X(x),cy:A.Y(y),r:5.5,fill:A.col[c||'c'],stroke:A.col.surf,'stroke-width':2},A.G); if(s) T(A,A.X(x),A.Y(y)-15,s,c||'c',{size:12}); });
    if(o.extraChips) A.chips.push(...o.extraChips); }},o.extra||{}); }

/* ---------- 4−1 regions ---------- */
S.reg={v:[-.6,6.2,-.6,4.6],f:x=>1+.9*Math.sin(x*.9)+.08*x*x,title:'المنطقة تحت المنحني',hint:'محصورة بين المنحني والمستقيمين x = a , x = b ومحور السينات',noAB:1,
 under(A){ shade(A,A.f||(x=>1+.9*Math.sin(x*.9)+.08*x*x),1,5); vline(A,1,'int'); vline(A,5,'int'); },
 draw(A){ T(A,A.X(3),A.Y(.8),'A','f',{size:20}); T(A,A.X(1),A.Y(0)+14,'a','int'); T(A,A.X(5),A.Y(0)+14,'b','int'); }};
S.shapes={title:'مناطق مألوفة مساحاتها معروفة',hint:'مستطيل ، مثلث ، شبه منحرف ، دائرة',
 draw(A){ const c=A.col, W=A.W, H=A.H, s=Math.min(W/5,H/3);
  A.el('rect',{x:W*.06,y:H*.2,width:s*.9,height:s*.6,fill:c.f,'fill-opacity':.2,stroke:c.f,'stroke-width':2}); T(A,W*.06+s*.45,H*.2+s*.3,'A₁','f');
  A.el('path',{d:`M${W*.3} ${H*.2+s*.6}L${W*.3+s*.9} ${H*.2+s*.6}L${W*.3+s*.3} ${H*.2}Z`,fill:c.tan,'fill-opacity':.2,stroke:c.tan,'stroke-width':2}); T(A,W*.3+s*.4,H*.2+s*.4,'A₂','tan');
  A.el('path',{d:`M${W*.55} ${H*.2+s*.6}L${W*.55+s*.95} ${H*.2+s*.6}L${W*.55+s*.7} ${H*.2}L${W*.55+s*.2} ${H*.2}Z`,fill:c.chord,'fill-opacity':.2,stroke:c.chord,'stroke-width':2}); T(A,W*.55+s*.47,H*.2+s*.32,'A₃','chord');
  A.el('circle',{cx:W*.86,cy:H*.2+s*.3,r:s*.34,fill:c.int,'fill-opacity':.2,stroke:c.int,'stroke-width':2}); T(A,W*.86,H*.2+s*.3,'A₄','int');
  const y0=H*.62, pts=[[W*.15,y0+s*.7],[W*.3,y0],[W*.55,y0-s*.08],[W*.75,y0+s*.3],[W*.6,y0+s*.85]];
  A.el('path',{d:'M'+pts.map(p=>p.join(' ')).join('L')+'Z',fill:c.f,'fill-opacity':.12,stroke:c.f,'stroke-width':2.2});
  [2,3].forEach(i=>A.el('path',{d:`M${pts[0][0]} ${pts[0][1]}L${pts[i][0]} ${pts[i][1]}`,stroke:c.f,'stroke-width':1.4,'stroke-dasharray':'5 4'})); T(A,W*.87,y0+s*.35,'منطقة مضلعة','f',{size:12}); }};
S.e1={...RS({f:x=>sq(Math.max(0,x-1)),v:[-.4,6,-.6,3],P:[2,5],title:'f(x) = √(x − 1) على [2 , 5]',hint:'المستطيل الداخلي ارتفاعه m = 1 والخارجي M = 2',pts:[[2,1,'d(2 , 1)','tan'],[5,2,"c′(5 , 2)",'chord']]}),dom:[1,7]};
S.e1.draw=(old=>A=>{ old(A); A.chips.length=0; A.chips.push(['tan','A₁','3'],['chord',"A₁′",'6'],['f','التقريب','4½']); })(S.e1.draw);
S.e2={...RS({f:x=>x*x+1,v:[-.3,2.7,-.6,6.2],P:[1,2],title:'f(x) = x² + 1 على [1 , 2]',hint:'m = 2 و M = 5',pts:[[1,2,'(1 , 2)','tan'],[2,5,'(2 , 5)','chord']]})};
S.e2.draw=(old=>A=>{ old(A); A.chips.length=0; A.chips.push(['tan','A₁','2'],['chord',"A₁′",'5'],['f','التقريب','3½']); })(S.e2.draw);
S.money={title:'تقدير المبلغ بين حدّين',hint:'كلما ضاق الفرق بين الحدّين صار التقدير أدق',
 draw(A){ const c=A.col, W=A.W, H=A.H, X=v=>W*.08+(v-8000)/(22000-8000)*W*.84;
  [[10000,20000,15000,'المحاولة الأولى',H*.3,'chord'],[15000,20000,17500,'المحاولة الثانية',H*.62,'tan']].forEach(([lo,hi,g,l,y,col])=>{
   A.el('path',{d:`M${X(lo)} ${y}H${X(hi)}`,stroke:c[col],'stroke-width':10,'stroke-linecap':'round','stroke-opacity':.35});
   A.el('circle',{cx:X(g),cy:y,r:7,fill:c[col]}); T(A,X(g),y-18,fr(g,0),col,{size:12}); T(A,X(lo),y+20,fr(lo,0),'muted',{size:11}); T(A,X(hi),y+20,fr(hi,0),'muted',{size:11});
   T(A,W*.5,y-42,l,col,{size:13}); A.el('path',{d:`M${X(19000)} ${y-12}V${y+12}`,stroke:c.c,'stroke-width':3}); });
  T(A,X(19000),H*.86,'المبلغ الصحيح 19000','c',{size:12}); A.chips.push(['chord','الخطأ الأول','4000'],['tan','الخطأ الثاني','1500']); }};
const q1=x=>x*x+1;
S.e3a=RS({f:q1,v:[1.2,5.6,-2,28],P:[2,3,5],title:'σ₁ = (2 , 3 , 5)',hint:'25 ≤ A ≤ 62',pts:[[2,5,'(2 , 5)','tan'],[3,10,'(3 , 10)','f'],[5,26,'(5 , 26)','chord']]});
S.e3b=RS({f:q1,v:[1.2,5.6,-2,28],P:[2,3,4,5],title:'σ₂ = (2 , 3 , 4 , 5)',hint:'32 ≤ A ≤ 53 : الفرق أصغر',pts:[[4,17,'(4 , 17)','f']]});
S.e3b.draw=(old=>A=>{ old(A); A.chips.push(['int','U − L','21']); })(S.e3b.draw);
S.e3a.draw=(old=>A=>{ old(A); A.chips.push(['int','U − L','37']); })(S.e3a.draw);
S.sigN={f:q1,v:[1.2,5.6,-2,28],a:2,b:5,noAB:1,title:'كلما زادت نقاط التجزئة قلّ الفرق',hint:'المساحة الحقيقية 42 (ستتعلم حسابها لاحقاً)',sl:{min:1,max:40,v:1,step:1,play:1,speed:.12,lab:'عدد الفترات n',fmt:v=>String(Math.round(v))},
 draw(A){ const n=Math.max(1,Math.round(A.p)), P=[...Array(n+1)].map((_,i)=>2+3*i/n); const r=rects(A,q1,P,{marks:n<=12}); A.chips.push(['int','U − L',fr(r.U-r.L,3)]); }};

/* ---------- 4−2 upper & lower sums ---------- */
const gq=x=>.9+.55*x-.06*x*x+.1*Math.sin(2*x);
S.lo4=RS({f:gq,v:[-.4,6.4,-.5,3.4],P:[1,2,3,4,5],title:'L(σ , f) : مستطيلات داخل A',hint:'ارتفاع كل مستطيل = mᵢ أصغر قيمة للدالة في الفترة',up:false,mlab:1,iv:0});
S.up4=RS({f:gq,v:[-.4,6.4,-.5,3.4],P:[1,2,3,4,5],title:'U(σ , f) : مستطيلات خارج A',hint:'ارتفاع كل مستطيل = Mᵢ أكبر قيمة للدالة في الفترة',lo:false,mlab:1});
S.lu4=RS({f:gq,v:[-.4,6.4,-.5,3.4],P:[1,2,3,4,5],title:'مساحة A محصورة بين L و U',hint:'المساحة الحقيقية بين المجموعين'});
S.lu4.draw=(old=>A=>{ old(A); A.chips.push(['ink2','مساحة A',fr(integ(gq,1,5),3)]); })(S.lu4.draw);
S.neg={f:x=>.5*(x-1)*(x-4)*(x-5.2)/3,v:[-.3,6,-2.6,2.2],title:'f تأخذ قيماً سالبة',hint:'mᵢ قد تكون سالبة فيصبح L(σ , f) عدداً سالباً',noAB:1,
 draw(A){ rects(A,A.f||(x=>0),[.5,1.5,2.5,3.5,4.5,5.5]); }};
S.neg.draw=A=>{ rects(A,S.neg.f,[.5,1.5,2.5,3.5,4.5,5.5]); };
S.e4=RS({f:x=>5+2*x,v:[-.3,4.8,-1,15],P:[1,2,3,4],title:'f(x) = 5 + 2x ، σ = (1 , 2 , 3 , 4)',hint:'الدالة متزايدة: mᵢ عند الطرف الأيسر و Mᵢ عند الطرف الأيمن'});
const e5f=x=>3*x-x*x;
S.e5=RS({f:e5f,v:[-.4,4.6,-4.6,3],P:[0,1,2,3,4],title:'f(x) = 3x − x² ، σ = (0 , 1 , 2 , 3 , 4)',hint:'العدد الحرج 3/2 داخل [1 , 2] : هناك M₂ = 9/4',pts:[[1.5,2.25,'(3/2 , 9/4)','c'],[4,-4,'(4 , −4)','f']]});
S.e5f={f:e5f,v:[-.4,4.6,-4.6,3],title:'f′(x) = 3 − 2x',hint:'f متزايدة قبل 3/2 ومتناقصة بعدها',mono:1,pts:[[1.5,2.25,'(3/2 , 9/4)','c']]};
const X41=[['x1a',x=>3-x,[-2,0,1],[-2.6,1.6,-.6,5.6]],['x1b',x=>3-x,[-2,-1,0,1],[-2.6,1.6,-.6,5.6]],['x2',x=>4*x-x*x,[0,1,2,3,4],[-.4,4.4,-.6,4.6]],['x3a',x=>3*x*x+2*x,[1,2,4],[.4,4.4,-4,60]],['x3b',x=>3*x*x+2*x,[1,2,3,4],[.4,4.4,-4,60]]];
X41.forEach(([k,f,P,v])=>{ S['t1'+k]={f,v,a:P[0],b:P.at(-1),interval:1,noAB:1,title:'تمرين: '+'σ = ('+P.join(' , ')+')',hint:'جد mᵢ و Mᵢ لكل فترة'};
  S['t1'+k+'Ok']=RS({f,v,P,title:'σ = ('+P.join(' , ')+')',hint:'✓ قارن مع جدولك'}); });

/* ---------- 4−3 definition ---------- */
S.conv={f:x=>x*x,v:[.6,3.3,-.8,10],a:1,b:3,noAB:1,title:'L و U يقتربان من عدد وحيد k',hint:'k = ∫₁³ x² dx',sl:{min:1,max:48,v:2,step:1,play:1,speed:.12,lab:'عدد الفترات n',fmt:v=>String(Math.round(v))},
 draw(A){ const n=Math.max(1,Math.round(A.p)), P=[...Array(n+1)].map((_,i)=>1+2*i/n); rects(A,A.f,P,{marks:n<=12}); A.chips.push(['ink2','k','26/3 ≈ 8.667']); }};
S.conv.draw=A=>{ const n=Math.max(1,Math.round(A.p)), P=[...Array(n+1)].map((_,i)=>1+2*i/n); rects(A,x=>x*x,P,{marks:n<=12}); A.chips.push(['ink2','k','26/3 ≈ 8.667']); };
S.pos3=AR({f:x=>1+.6*Math.sin(x)+.15*x,v:[-.4,6,-.6,3.2],a:1,b:5,title:'f(x) ≥ 0 : التكامل = المساحة',hint:'∫ₐᵇ f(x) dx ≥ 0',labs:[[3,.7,'A','f'],[1,-.3,'a','int'],[5,-.3,'b','int']],area:1});
S.neg3=AR({f:x=>-.45*(x-1)*(5-x),v:[-.4,6,-2.6,1.2],a:1,b:5,title:'f(x) ≤ 0 : التكامل سالب',hint:'المساحة = −∫ₐᵇ f(x) dx = |∫ₐᵇ f(x) dx|',labs:[[3,-.7,'A','bad'],[1,.3,'a','int'],[5,.3,'b','int']],area:1});
S.d1=RS({f:x=>x*x,v:[.4,3.4,-.8,10],P:[1,2,3],title:'∫₁³ x² dx بتجزئتين',hint:'L = 5 ، U = 13 ⇒ ≈ 9',pts:[[1,1,'','tan'],[2,4,'(2 , 4)','f'],[3,9,'(3 , 9)','chord']]});
S.d2=AR({f:x=>2*x-3,v:[-.3,5.8,-.8,7.6],a:2,b:5,title:'f(x) = 2x − 3 : شبه منحرف',hint:'A = ½(1 + 7)(3) = 12',labs:[[3.6,2.5,'A','f']],extra:{pts:[[2,1,'(2 , 1)','c'],[5,7,'(5 , 7)','c']]}});
S.d2p=RS({f:x=>2*x-3,v:[-.3,5.8,-.8,7.6],P:[2,3,5],title:'الطريقة السابقة: σ = (2 , 3 , 5)',hint:'L = 7 ، U = 17 ⇒ (7 + 17) ÷ 2 = 12'});
S.d3=AR({f:x=>3,v:[-.3,6,-.6,4.2],a:1,b:5,title:'f(x) = 3 : منطقة مستطيلة',hint:'A = 4 × 3 = 12',labs:[[3,1.5,'A','f']],extra:{pts:[[1,3,'(1 , 3)','c'],[5,3,'(5 , 3)','c']]}});
S.d3p=RS({f:x=>3,v:[-.3,6,-.6,4.2],P:[1,3,5],title:'طريقة ثانية: σ = (1 , 3 , 5)',hint:'L = U = 12'});
[['t3x1',x=>3/x,[1,2,3],[.4,3.4,-.4,3.4]],['t3x2',x=>3*x-3,[1,2,3,4],[.4,4.6,-1,10]],['t3x3',x=>3*x*x-3,[2,3,4],[1.4,4.5,-4,48]],['t3x5',x=>x**3,[1,2,3,4,5],[.4,5.5,-10,130]]].forEach(([k,f,P,v])=>{
  S[k]={f,v,a:P[0],b:P.at(-1),interval:1,noAB:1,title:'تمرين: σ = ('+P.join(' , ')+')',hint:'حدّد mᵢ و Mᵢ'}; S[k+'Ok']=RS({f,v,P,title:'σ = ('+P.join(' , ')+')',hint:'✓ قارن مع جدولك'}); });
S.t3x2Ok.draw=(old=>A=>{ old(A); A.el('path',{d:`M${A.X(1)} ${A.Y(0)}L${A.X(4)} ${A.Y(9)}L${A.X(4)} ${A.Y(0)}Z`,fill:'none',stroke:A.col.c,'stroke-width':2,'stroke-dasharray':'6 4'},A.G); A.chips.push(['c','مساحة المثلث','½ · 3 · 9 = 13.5']); })(S.t3x2Ok.draw);
S.t3x4=AR({f:x=>-4,v:[-3.6,2.6,-5,1],a:-3,b:2,title:'f(x) = −4 على [−3 , 2]',hint:'منطقة مستطيلة تحت محور السينات'});

/* ---------- 4−4 fundamental theorem ---------- */
S.ftc={title:'∫₁ᵇ 2x dx = F(b) − F(1)',hint:'المساحة تحت f تساوي الارتفاع الذي يصعده F',sl:{min:1,max:2,v:2,step:.01,play:1,speed:.3,lab:'الحد الأعلى b',fmt:v=>fr(v,2)},
 draw(A){ const b=A.p, c=A.col, W=A.W, H=A.H, gap=12, h=(H-gap)/2;
  const p1=A.subplot([36,8,W-50,h-14],[-.2,2.3,-.5,5]); p1.axes('x','f');
  const X=p1.X, Y=p1.Y; let d=`M${X(1)} ${Y(0)}`; for(let i=0;i<=60;i++){ const x=1+(b-1)*i/60; d+=`L${X(x)} ${Y(2*x)}`; } d+=`L${X(b)} ${Y(0)}Z`; A.el('path',{d,fill:c.f,'fill-opacity':.28});
  p1.curve(x=>2*x,'f',-.2,2.3,2.6); A.lab(X(1.9),Y(4.5),'f(x) = 2x',{fill:c.f,w:700,size:12,halo:1});
  const p2=A.subplot([36,h+gap,W-50,h-14],[-.2,2.3,-.5,5]); p2.axes('x','F'); p2.curve(x=>x*x,'tan',-.2,2.3,2.6); A.lab(p2.X(1.7),p2.Y(4.4),'F(x) = x²',{fill:c.tan,w:700,size:12,halo:1});
  p2.seg(1,1,b,1,'muted',{dash:'4 4'}); p2.seg(b,1,b,b*b,'c',{w:4}); p2.pt(1,1,'tan','F(1)'); p2.pt(b,b*b,'tan','F(b)');
  A.chips.push(['f','المساحة',fr(b*b-1,3)],['c','F(b) − F(1)',fr(b*b-1,3)]); A.ok=abs(b-2)<.01; if(A.ok) A.hint='✓ عند b = 2 : 4 − 1 = 3'; }};
S.k1=AR({f:x=>6*x,v:[.4,5.6,-3,34],a:1,b:5,title:'F(x) = 3x² ⇒ f(x) = 6x',hint:'∫₁⁵ f(x) dx = 75 − 3 = 72'});
S.k2=AR({f:Math.cos,v:[-.2,1.8,-.3,1.3],a:0,b:PI/2,title:'F(x) = sin x ⇒ f(x) = cos x',hint:'sin(π/2) − sin 0 = 1',extra:{xfmt:piF,sx:PI/4}});
S.k4=AR({f:x=>Math.cos(2*x),v:[-.2,1.2,-.4,1.3],a:0,b:PI/4,title:'∫₀^(π/4) cos 2x dx',hint:'= ½',extra:{xfmt:piF,sx:PI/4}});
S.k5=AR({f:x=>1/Math.cos(x)**2,v:[-.1,1,-.3,2.4],a:0,b:PI/4,title:'∫₀^(π/4) sec² x dx',hint:'tan(π/4) − tan 0 = 1',extra:{xfmt:piF,sx:PI/4}});
S.k6=AR({f:x=>1/Math.sin(x)**2,v:[.4,1.8,-.3,2.4],a:PI/4,b:PI/2,title:'∫ من π/4 إلى π/2 لـ csc² x',hint:'= 1',extra:{xfmt:piF,sx:PI/4}});
S.k7=AR({f:x=>Math.sin(x)/Math.cos(x)**2,v:[-.1,1.3,-.3,3.8],a:0,b:PI/3,title:'∫₀^(π/3) sec x tan x dx',hint:'sec(π/3) − sec 0 = 2 − 1 = 1',extra:{xfmt:v=>{ const n=Math.round(v/(PI/6)); return abs(v-n*PI/6)<1e-6?['0','π/6','π/3','π/2'][n]||fr(v):fr(v); },sx:PI/6}});
S.k8=AR({f:x=>x**3,v:[.4,3.4,-2,30],a:1,b:3,title:'∫₁³ x³ dx',hint:'81/4 − 1/4 = 20'});

/* ---------- 4−5 properties ---------- */
S.p1=AR({f:x=>x*x,v:[-1.6,2.5,-.6,4.6],a:-1,b:2,title:'f(x) = x² ≥ 0 ⇒ ∫ ≥ 0',hint:'∫₋₁² x² dx = 3'});
S.p2=AR({f:x=>x,v:[-2.6,.6,-2.4,.6],a:-2,b:-1,title:'f(x) = x < 0 على [−2 , −1]',hint:'∫₋₂⁻¹ x dx = −3/2 < 0'});
const p3f=x=>16*x/21;
S.p3={v:[1.4,5.6,-1.5,20],f:p3f,title:'∫ c·f(x) dx = c ∫ f(x) dx',hint:'تكبير الارتفاع c مرة يكبّر المساحة c مرة',noAB:1,sl:{min:1,max:5,v:5,step:1,lab:'c',fmt:v=>String(Math.round(v))},
 under(A){ const c=Math.round(A.p); shade(A,x=>c*p3f(x),2,5,x=>0,{op:.18}); shade(A,p3f,2,5); },
 draw(A){ const c=Math.round(A.p); A.el('path',{d:A.path(x=>c*p3f(x),A.V.x0,A.V.x1),stroke:A.col.chord,'stroke-width':2.6,fill:'none'},A.G); T(A,A.X(4.6),A.Y(c*p3f(4.6))-14,c+'f(x)','chord',{size:12});
  A.chips.push(['f','∫₂⁵ f(x) dx','8'],['chord','∫₂⁵ '+c+'f(x) dx',String(8*c)]); A.ok=c===5; if(A.ok) A.hint='✓ c = 5 : 5 × 8 = 40'; }};
S.p4=AR({f:x=>3*x*x+2*x,v:[.6,2.4,-2,18],a:1,b:2,title:'∫₁² (3x² + 2x) dx',hint:'7 + 3 = 10'});
S.p5={f:x=>1.2+.5*Math.sin(x),v:[0,8,-.6,2.4],noAB:1,title:'∫₁⁷ = ∫₁³ + ∫₃⁷',hint:'تقسيم المنطقة عند c لا يغيّر مجموع المساحة',
 under(A){ shade(A,S.p5.f,1,3,x=>0,{pc:'f'}); shade(A,S.p5.f,3,7,x=>0,{pc:'tan'}); vline(A,3,'c'); }, draw(A){ T(A,A.X(2),A.Y(.6),'5','f',{size:16}); T(A,A.X(5),A.Y(.6),'8','tan',{size:16}); T(A,A.X(3),A.Y(0)+14,'c = 3','c',{size:12}); A.chips.push(['f','∫₁³','5'],['tan','∫₃⁷','8'],['c','∫₁⁷','13']); }};
S.p6=AR({f:abs,v:[-3.6,4.6,-.6,4.6],a:-3,b:4,cut:[0],title:'f(x) = |x| على [−3 , 4]',hint:'9/2 + 16/2 = 25/2',labs:[[-2,.7,'9/2','f'],[2.7,.9,'8','f']]});
S.p7=AR({f:x=>x>=1?2*x+1:3,v:[-.4,5.6,-1,12],a:0,b:5,cut:[1],title:'دالة متعددة القاعدة على [0 , 5]',hint:'مستمرة عند x = 1 : ∫ = 3 + 28 = 31',labs:[[.5,1.5,'3','f'],[3.2,3,'28','f']]});
S.p7.pts=[[1,3,'(1 , 3)','c']];
S.p8={f:x=>x,v:[-.5,4.5,-.5,4.5],title:'∫ₐᵃ f(x) dx = 0',hint:'عندما يتطابق الحدّان تختفي المنطقة',sl:{min:0,max:1.5,v:1.5,step:.01,play:1,speed:.3,lab:'b − a',fmt:v=>fr(v,2)},noAB:1,
 under(A){ shade(A,x=>x,3-A.p,3); }, draw(A){ A.chips.push(['f','∫',fr((9-(3-A.p)**2)/2,3)]); A.ok=A.p<.02; if(A.ok) A.hint='✓ ∫₃³ x dx = 0'; }};
S.t5={f:x=>3*x-2,v:[-2.6,2.6,-9,5.6],title:'تمارين (4−5)',hint:'حلّ في دفترك ثم تحقّق'};
S.t5x1a=AR({f:x=>3*x-2,v:[-2.6,2.6,-9,5.6],a:-2,b:2,title:'∫₋₂² (3x − 2) dx',hint:'= −8'});
S.t5x1d=AR({f:x=>abs(x-1),v:[-.4,2.6,-.4,1.6],a:0,b:2,cut:[1],title:'∫₀² |x − 1| dx',hint:'مثلثان مساحة كل منهما ½'});
S.t5x3b=AR({f:x=>abs(x+1),v:[-1.6,1.6,-.4,2.4],a:-1,b:1,title:'∫₋₁¹ |x + 1| dx',hint:'مثلث: ½ · 2 · 2 = 2'});
S.t5x4=AR({f:x=>x>=3?2*x:6,v:[.4,4.6,-1,9],a:1,b:4,cut:[3],title:'f متعددة القاعدة على [1 , 4]',hint:'12 + 7 = 19'});
S.t5x5=AR({f:x=>x>=0?3*x*x:2*x,v:[-1.4,3.4,-3,28],a:-1,b:3,cut:[0],title:'f متعددة القاعدة على [−1 , 3]',hint:'−1 + 27 = 26'});

/* ---------- 4−6 indefinite integral ---------- */
S.fam={v:[-.2,3.6,-6,12],title:'F(x) + C : عائلة من الدوال المقابلة',hint:'كلها لها المشتقة نفسها 2x : مماساتها متوازية',sl:{min:-5,max:4,v:1,step:.01,lab:'C',fmt:v=>fr(v,2)},
 curves:[{f:x=>x*x+1,col:'muted',w:1.4,op:.6},{f:x=>x*x+.5,col:'muted',w:1.4,op:.6},{f:x=>x*x-sq(2),col:'muted',w:1.4,op:.6},{f:x=>x*x-5,col:'muted',w:1.4,op:.6}],
 draw(A){ const C=A.p, c=A.col; A.el('path',{d:A.path(x=>x*x+C,A.V.x0,A.V.x1),stroke:c.f,'stroke-width':3,fill:'none'},A.G);
  [1,2,3].forEach(x0=>{ A.line(x0,x0*x0+C,2*x0,c.tan,{w:1.6,op:.75}); A.el('circle',{cx:A.X(x0),cy:A.Y(x0*x0+C),r:5,fill:c.c},A.G); });
  vline(A,1,'int'); vline(A,3,'int'); A.chips.push(['f','F(x) = x² + C','C = '+fr(C,2)],['tan',"F′(x)",'2x'],['int','F(3) − F(1)','8']); }};
S.sub={v:[-2.2,2.2,-1,36],f:x=>(x*x+3)**2*2*x,title:'∫ [f(x)]ⁿ f′(x) dx',hint:'مشتقة ⅓(x² + 3)³ هي (x² + 3)²(2x)',curves:[{f:x=>(x*x+3)**3/3,col:'tan',w:2.2,dash:'6 5'}],
 draw(A){ T(A,A.X(1.5),A.Y(30),'⅓(x² + 3)³','tan',{size:12}); A.chips.push(['f','الدالة','(x² + 3)²(2x)'],['tan','المقابلة','⅓(x² + 3)³ + c']); }};
S.sin2={v:[-.3,6.6,-.6,1.4],f:x=>Math.sin(x)**2,title:'sin² θ = (1 − cos 2θ) ÷ 2',hint:'المنحنيان متطابقان: نكامل الصيغة الثانية',curves:[{f:x=>(1-Math.cos(2*x))/2,col:'chord',w:2,dash:'7 6'}],xfmt:piF,sx:PI/2,
 draw(A){ A.chips.push(['f','sin² θ','—'],['chord','½ − ½ cos 2θ','—']); }};
S.sin2.draw=A=>{ const x=A.V.x0; A.chips.push(['f','sin² θ','منحني متصل'],['chord','(1 − cos 2θ)/2','متقطع']); };
S.xs6={title:'تمارين (4−6)',hint:'حلّ في دفترك ثم أظهر الحل',draw(A){ T(A,A.W/2,A.H/2,'∫ … dx = F(x) + c','f',{size:Math.min(28,A.W/14)}); T(A,A.W/2,A.H/2+40,'تحقّق: اشتقّ جوابك فتحصل على الدالة','muted',{size:13}); }};

/* ---------- 4−7 natural log ---------- */
S.ln={v:[-.2,6.4,-2,3.4],f:t=>1/t,dom:[.05,7],title:'ln x = ∫₁ˣ (1/t) dt',hint:'x > 1 : مساحة موجبة ، 0 < x < 1 : القيمة سالبة',axl:['t','y'],sl:{min:.2,max:6,v:3,step:.01,play:1,speed:.25,lab:'x',fmt:v=>fr(v,2)},noAB:1,
 curves:[{f:Math.log,dom:[.05,7],col:'tan',w:2,dash:'6 5',lab:[5.6,2.1,'ln x']}],
 under(A){ const x=A.p; if(x>=1) shade(A,t=>1/t,1,x); else shade(A,t=>1/t,x,1,t=>0,{pc:'bad'}); vline(A,1,'int'); },
 draw(A){ const x=A.p; A.el('circle',{cx:A.X(x),cy:A.Y(Math.log(x)),r:6.5,fill:A.col.tan,stroke:A.col.surf,'stroke-width':2},A.G); T(A,A.X(1),A.Y(0)+14,'1','int');
  A.chips.push(['f','x',fr(x,2)],['tan','ln x',fr(Math.log(x),4)]); A.ok=abs(x-1)<.01; if(A.ok) A.hint='✓ x = 1 : المساحة صفر ⇒ ln 1 = 0'; }};
S.ex={v:[-2.6,4,-2.6,4],eq:1,f:Math.exp,title:'y = eˣ و y = ln x : دالتان عكسيتان',hint:'كل منهما انعكاس للأخرى في المستقيم y = x',curves:[{f:Math.log,dom:[.02,8],col:'tan'},{f:x=>x,col:'muted',w:1.4,dash:'6 5'}],sl:{min:-2,max:1.35,v:1,step:.01,lab:'x',fmt:v=>fr(v,2)},
 draw(A){ const x=A.p, y=Math.exp(x), c=A.col; A.el('path',{d:`M${A.X(x)} ${A.Y(y)}L${A.X(y)} ${A.Y(x)}`,stroke:c.c,'stroke-width':1.4,'stroke-dasharray':'4 4'},A.G);
  A.el('circle',{cx:A.X(x),cy:A.Y(y),r:6,fill:c.f},A.G); A.el('circle',{cx:A.X(y),cy:A.Y(x),r:6,fill:c.tan},A.G); A.line(x,y,y,c.f,{w:1.6,op:.7});
  T(A,A.X(1.2),A.Y(3.6),'y = eˣ','f',{size:12}); T(A,A.X(3.4),A.Y(.9),'y = ln x','tan',{size:12});
  A.chips.push(['f','(x , eˣ)',`(${fr(x)} , ${fr(y)})`],['tan','(eˣ , x)',`(${fr(y)} , ${fr(x)})`],['f','ميل eˣ = eˣ',fr(y,3)]); }};
[['t7a',x=>1/(x+1),0,3,[-.4,3.4,-.2,1.2]],['t7c',x=>Math.exp(2*x),Math.log(3),Math.log(5),[.8,1.8,-2,27]],['t7d',x=>Math.exp(-x),0,Math.log(2),[-.2,1,-.1,1.2]],['t7k',x=>Math.exp(Math.cos(x))*Math.sin(x),0,PI/2,[-.1,1.8,-.2,1.6]],['t7l',x=>1,1,2,[.4,2.4,-.2,1.4]]].forEach(([k,f,a,b,v])=>{ S[k]=AR({f,v,a,b,title:'التكامل المحدد = مساحة',hint:'قارن قيمة التكامل مع جوابك'}); });

/* ---------- 4−8 plane areas ---------- */
const cubA=x=>x**3-4*x;
S.a0=AR({f:x=>Math.sin(x*1.3)*1.2+.2,v:[-.3,5.6,-1.6,1.8],a:.3,b:4.8,cut:[2.264,4.68].filter(x=>x<4.8),title:'f تغيّر إشارتها داخل [a , b]',hint:'A = A₁ + A₂ : نجمع القيم المطلقة',chips:(A,I,Ab)=>A.chips.push(['f','التكامل (جبري)',fr(I,3)],['tan','المساحة',fr(Ab,3)])});
S.a1=AR({f:cubA,v:[-2.8,2.8,-3.8,3.8],a:-2,b:2,cut:[0],title:'f(x) = x³ − 4x على [−2 , 2]',hint:'التكامل الكلي يساوي صفراً لكن المساحة تساوي 8',labs:[[-1,1.2,'A₁','f'],[1,-1.2,'A₂','bad']],chips:(A,I,Ab)=>A.chips.push(['f','A₁','4'],['bad','A₂','−4'],['tan','A = |A₁| + |A₂|','8'])});
S.a2=AR({f:x=>x*x,v:[-1.6,3.6,-.8,10],a:1,b:3,title:'y = x² ، x = 1 , x = 3',hint:'لا تجزئة: 0 ∉ [1 , 3]',chips:(A,I)=>A.chips.push(['tan','A','26/3 = 8⅔'])});
S.a3=AR({f:x=>x**3-3*x*x+2*x,v:[-.4,2.4,-.6,.6],a:0,b:2,cut:[1],title:'f(x) = x³ − 3x² + 2x',hint:'¼ + ¼ = ½',chips:(A,I,Ab)=>A.chips.push(['f','A₁','¼'],['bad','A₂','−¼'],['tan','A','½'])});
S.a4=AR({f:x=>x*x-1,v:[-2.6,3.6,-1.6,8.6],a:-2,b:3,cut:[-1,1],title:'f(x) = x² − 1 على [−2 , 3]',hint:'4/3 + 4/3 + 20/3 = 28/3',chips:(A,I,Ab)=>A.chips.push(['f','A₁','4/3'],['bad','A₂','−4/3'],['f','A₃','20/3'],['tan','A','9⅓'])});
S.a5=AR({f:Math.sin,v:[-2,3.6,-1.4,1.4],a:-PI/2,b:PI,cut:[0],title:'y = sin x على [−π/2 , π]',hint:'1 + 2 = 3',extra:{xfmt:piF,sx:PI/2},chips:(A,I,Ab)=>A.chips.push(['bad','A₁','−1'],['f','A₂','2'],['tan','A','3'])});
S.a6=AR({f:Math.cos,v:[-3.6,3.6,-1.4,1.4],a:-PI,b:PI,cut:[-PI/2,PI/2],title:'y = cos x على [−π , π]',hint:'1 + 2 + 1 = 4',extra:{xfmt:piF,sx:PI/2},chips:(A,I,Ab)=>A.chips.push(['bad','A₁','−1'],['f','A₂','2'],['bad','A₃','−1'],['tan','A','4'])});
S.b0={v:[-.4,6.4,-.4,4.6],title:'المساحة بين منحنيين',hint:'A = ∫ [f(x) − g(x)] dx حيث f فوق g',noAB:1,
 under(A){ const f=x=>3+.5*Math.sin(x), g=x=>1+.3*Math.cos(1.3*x); shade(A,f,1,5,g); },
 draw(A){ const f=x=>3+.5*Math.sin(x), g=x=>1+.3*Math.cos(1.3*x); A.el('path',{d:A.path(f,A.V.x0,A.V.x1),stroke:A.col.f,'stroke-width':2.6,fill:'none'},A.G); A.el('path',{d:A.path(g,A.V.x0,A.V.x1),stroke:A.col.chord,'stroke-width':2.6,fill:'none'},A.G);
  T(A,A.X(5.6),A.Y(f(5.6))-14,'y = f(x)','f',{size:12}); T(A,A.X(5.6),A.Y(g(5.6))+16,'y = g(x)','chord',{size:12}); vline(A,1,'int'); vline(A,5,'int'); }};
S.b1=AR({f:sq,g:x=>x,v:[-.2,1.4,-.2,1.3],a:0,b:1,title:'y = √x و y = x',hint:'A = |∫₀¹ (√x − x) dx| = 1/6',extra:{dom:[0,2]},chips:(A,I)=>A.chips.push(['tan','A','1/6'])});
S.b2=AR({f:x=>x**3,g:x=>x,v:[-1.5,1.5,-1.3,1.3],a:-1,b:1,cut:[0],title:'y = x³ و y = x',hint:'¼ + ¼ = ½',chips:(A,I,Ab)=>A.chips.push(['tan','A','½'])});
S.b3=AR({f:Math.cos,g:Math.sin,v:[-1.9,1.9,-1.3,1.3],a:-PI/2,b:PI/2,cut:[PI/4],title:'f(x) = cos x و g(x) = sin x',hint:'(√2 + 1) + (√2 − 1) = 2√2',extra:{xfmt:piF,sx:PI/4},chips:(A,I,Ab)=>A.chips.push(['f','A₁','√2 + 1'],['bad','A₂','|1 − √2|'],['tan','A','2√2 ≈ '+fr(2*sq(2),3)])});
S.vel=AR({f:t=>2*t-4,v:[-.3,5.6,-4.6,6.6],a:1,b:3,cut:[2],title:'V(t) = 2t − 4',hint:'المسافة = مجموع القيم المطلقة ، الإزاحة = التكامل الجبري',extra:{axl:['t','V']},chips:(A,I,Ab)=>A.chips.push(['f','الإزاحة',fr(I,3)],['tan','المسافة',fr(Ab,3)])});
S.vel5=AR({f:t=>2*t-4,v:[-.3,5.6,-4.6,6.6],a:4,b:5,title:'الثانية الخامسة: [4 , 5]',hint:'d = 5 m',extra:{axl:['t','V']},chips:(A,I)=>A.chips.push(['tan','المسافة','5 m'])});
S.vel4=AR({f:t=>2*t-4,v:[-.3,5.6,-4.6,6.6],a:0,b:4,cut:[2],title:'بعده بعد 4 ثوانٍ',hint:'الجسم عاد إلى نقطة البدء: s = 0',extra:{axl:['t','V']},chips:(A,I,Ab)=>A.chips.push(['f','الإزاحة','0'],['tan','المسافة المقطوعة','8 m'])});
S.v18=AR({f:t=>18*t+10,v:[-.3,4.4,-5,90],a:2,b:3,title:'V = 18t + 10',hint:'الثانية الثالثة: [2 , 3]',extra:{axl:['t','V'],pts:[[4,82,'(4 , 82)','c']]},chips:(A,I)=>A.chips.push(['tan','d','55 m'])});
S.v18b=AR({f:t=>18*t+10,v:[-.3,4.4,-5,90],a:0,b:3,title:'بعده بعد 3 ثوانٍ',hint:'S = 111 m',extra:{axl:['t','V']},chips:(A,I)=>A.chips.push(['f','S','111 m'])});
const X8=[['t8x1',x=>x**4-x,null,-1,1,[-1.4,1.4,-.6,2.4],[0]],['t8x2',x=>x**4-3*x*x-4,null,-2,3,[-2.4,3.4,-8,52],[2]],['t8x3',x=>x**4-x*x,null,-1,1,[-1.4,1.4,-.4,.4],[0]],['t8x4',x=>Math.sin(3*x),null,0,PI/2,[-.2,1.8,-1.3,1.3],[PI/3]],
 ['t8x5',x=>2*Math.cos(x)**2-1,null,0,PI/2,[-.2,1.8,-1.3,1.3],[PI/4]],['t8x6',x=>x/2,x=>sq(x-1),2,5,[.6,5.6,-.2,2.8],[]],['t8x7',x=>x*x,x=>x**4-12,-2,2,[-2.6,2.6,-13,6],[]],['t8x8',Math.sin,x=>Math.sin(x)*Math.cos(x),0,2*PI,[-.3,6.6,-1.3,1.3],[PI]],
 ['t8x9',x=>2*Math.sin(x)+1,Math.sin,0,3*PI/2,[-.3,5,-1.4,3.2],[]],['t8x10',x=>x**3+4*x*x+3*x,null,-3,0,[-3.4,.4,-1.2,2.6],[-1]]];
X8.forEach(([k,f,g,a,b,v,cut])=>{ S[k]=AR({f,g:g||undefined,v,a,b,cut,title:'تمرين: ارسم وحدّد الفترات',hint:'المساحة = مجموع القيم المطلقة للتكاملات',extra:{xfmt:['t8x4','t8x5','t8x8','t8x9'].includes(k)?piF:undefined,sx:['t8x4','t8x5'].includes(k)?PI/4:['t8x8','t8x9'].includes(k)?PI/2:undefined}}); });
S.t8x11=AR({f:t=>3*t*t-6*t+3,v:[-.3,5.4,-3,52],a:2,b:4,title:'v(t) = 3t² − 6t + 3 = 3(t − 1)²',hint:'v ≥ 0 دائماً: لا يغيّر الجسم اتجاهه',extra:{axl:['t','v']}});
S.t8x12=AR({f:t=>2*t*t+12*t+10,v:[-.3,4.4,-10,90],a:1,b:2,title:'v(t) = 2t² + 12t + 10',hint:'v(4) = 90',extra:{axl:['t','v'],pts:[[4,90,'(4 , 90)','c']]}});
S.t8x13={v:[-1,30,-1600,5600],f:t=>50*t*t-2*t**3,title:'s(t) = 50t² − 2t³',hint:'تعود النقطة إلى موضعها عندما s = 0',axl:['t','s'],pts:[[25,0,'t = 25','c']],curves:[{f:t=>100*t-6*t*t,col:'tan',w:1.8,dash:'6 5',lab:[8,1300,'v']}]};

/* ---------- 4−9 volumes ---------- */
/* solid of revolution: axis 'x' (r = R(x), x∈[a,b]) or 'y' (r = R(y), y∈[a,b]) */
function SOL(o){ return {v:o.v,eq:1,title:o.title,hint:o.hint||'',noAB:1,pick:(A,px,py)=>A.X_inv?(o.ax==='y'?A.Y_inv(py):A.X_inv(px)):null,sl:{min:o.a,max:o.b,v:(o.a+o.b)/2,step:(o.b-o.a)/200,play:1,speed:.3,lab:o.ax==='y'?'y':'x',fmt:v=>fr(v,2)},
 draw(A){ const c=A.col, R=o.R, a=o.a, b=o.b, n=120, k=.28, ax=o.ax||'x';
  const P=(u,r)=>ax==='x'?[A.X(u),A.Y(r)]:[A.X(r),A.Y(u)];
  const tp=[], bp=[]; for(let i=0;i<=n;i++){ const u=a+(b-a)*i/n, r=R(u); tp.push(P(u,r).join(' ')); bp.push(P(u,-r).join(' ')); }
  const top='M'+tp.join('L'), bot='L'+bp.reverse().join('L');
  A.el('path',{d:top+bot+'Z',fill:c.int,'fill-opacity':.14,stroke:'none'},A.G);
  for(let i=0;i<=6;i++){ const u=a+(b-a)*i/6, r=abs(R(u)); if(r<1e-6) continue; const ctr=P(u,0), rp=ax==='x'?abs(A.Y(r)-A.Y(0)):abs(A.X(r)-A.X(0));
    A.el('ellipse',{cx:ctr[0],cy:ctr[1],rx:ax==='x'?rp*k:rp,ry:ax==='x'?rp:rp*k,fill:'none',stroke:c.int,'stroke-width':1,opacity:.55},A.G); }
  A.el('path',{d:top,stroke:c.f,'stroke-width':3,fill:'none'},A.G); A.el('path',{d:'M'+bot.slice(1),stroke:c.f,'stroke-width':1.6,'stroke-dasharray':'5 4',fill:'none',opacity:.7},A.G);
  const u=A.p, r=abs(R(u)), ctr=P(u,0), rp=ax==='x'?abs(A.Y(r)-A.Y(0)):abs(A.X(r)-A.X(0));
  A.el('ellipse',{cx:ctr[0],cy:ctr[1],rx:ax==='x'?rp*k:rp,ry:ax==='x'?rp:rp*k,fill:c.chord,'fill-opacity':.35,stroke:c.chord,'stroke-width':2.2},A.G);
  const e=P(u,r); A.el('path',{d:`M${ctr[0]} ${ctr[1]}L${e[0]} ${e[1]}`,stroke:c.c,'stroke-width':2.6},A.G); T(A,(ctr[0]+e[0])/2+(ax==='x'?14:0),(ctr[1]+e[1])/2-(ax==='y'?12:0),'r','c');
  if(o.lab) T(A,A.X(o.lab[0]),A.Y(o.lab[1]),o.lab[2],'f',{size:12.5});
  T(A,ax==='x'?A.W-30:A.X(0)+26,ax==='x'?A.Y(0)-16:28,'↻','int',{size:20});
  A.chips.push(['c','r = '+(o.rl||(ax==='x'?'y':'x')),fr(r,3)],['chord','مساحة المقطع πr²',fr(PI*r*r,3)],['int','الحجم',o.V]); }}; }
S.r1=SOL({R:sq,a:0,b:4,v:[-.6,5,-2.6,2.6],title:'دوران y = √x حول محور السينات',hint:'كل مقطع قرص مساحته πy²',V:'8π',lab:[2.2,1.9,'y = √x']});
S.r2=SOL({ax:'y',R:y=>1/sq(y),a:1,b:4,v:[-1.6,1.6,-.4,4.6],title:'دوران x = 1/√y حول محور الصادات',hint:'كل مقطع قرص مساحته πx²',V:'2π ln 2',lab:[1.1,1.5,'x = 1/√y']});
S.r3=SOL({R:x=>sq(8*x),a:0,b:2,v:[-.8,3,-4.6,4.6],title:'y² = 8x ، 0 ≤ x ≤ 2',hint:'πy² = 8πx',V:'16π',lab:[1.2,3.6,'y² = 8x']});
S.r4=SOL({R:x=>2*x*x,a:0,b:5,v:[-1,6.5,-52,52],title:'y = 2x² ، 0 ≤ x ≤ 5',hint:'πy² = 4πx⁴',V:'2500π',lab:[3,30,'y = 2x²']});
S.r4.eq=0;
S.r5=SOL({ax:'y',R:y=>sq(y/4),a:0,b:16,v:[-3,3,-1,17.5],title:'y = 4x² حول محور الصادات',hint:'x² = y/4',V:'32π',lab:[2.5,12,'y = 4x²']}); S.r5.eq=0;
S.r6=SOL({ax:'y',R:y=>3/y,a:1,b:3,v:[-3.6,3.6,-.4,3.6],title:'y = 3/x ، 1 ≤ y ≤ 3 حول محور الصادات',hint:'x = 3/y ⇒ πx² = 9π/y²',V:'6π',lab:[2.6,1.5,'x = 3/y']});
S.t9x1=SOL({R:x=>x*x,a:1,b:2,v:[-.4,2.6,-4.6,4.6],title:'تمرين 1: y = x² ، 1 ≤ x ≤ 2',hint:'V = π∫ y² dx',V:'؟',lab:[1.6,3.4,'y = x²']}); S.t9x1.eq=0;
S.t9x2=SOL({ax:'y',R:y=>sq(Math.max(0,y-1)),a:1,b:4,v:[-2.4,2.4,-.4,4.6],title:'تمرين 2: y = x² + 1 و y = 4',hint:'x² = y − 1 ، 1 ≤ y ≤ 4',V:'؟'});
S.t9x3=SOL({ax:'y',R:y=>1-y*y,a:-1,b:1,v:[-1.4,1.4,-1.3,1.3],title:'تمرين 3: x = 1 − y² حول محور الصادات',hint:'التقاطع مع x = 0 : y = ±1',V:'؟'});
S.t9x4=SOL({R:x=>x**1.5,a:0,b:2,v:[-.4,2.6,-3.2,3.2],title:'تمرين 4: y² = x³ ، 0 ≤ x ≤ 2',hint:'y² = x³ مباشرة',V:'؟'});
[['t9x1Ok','31π/5'],['t9x2Ok','9π/2'],['t9x3Ok','16π/15'],['t9x4Ok','4π']].forEach(([k,V])=>{ const base=S[k.slice(0,-2)]; S[k]={...base,draw:A=>{ base.draw(A); const i=A.chips.findIndex(c=>c[0]==='int'); A.chips[i]=['int','الحجم',V]; A.ok=1; A.hint='✓ V = '+V; }}; });
/* per-exercise area pictures */
[['t5b',x=>x**-2+2*x+1,1,2,[.6,2.4,-1,9],'∫₁² (x⁻² + 2x + 1) dx'],['t5c',x=>x**4+4*x,1,3,[.6,3.3,-6,100],'∫₁³ (x⁴ + 4x) dx'],['t5e',x=>x+Math.cos(x),-PI/2,0,[-1.9,.5,-1.8,1.4],'∫ (x + cos x) dx على [−π/2 , 0]'],
 ['t5f',x=>x*x+x+1,2,3,[1.4,3.4,-1,15],'(x³ − 1)/(x − 1) = x² + x + 1'],['t5g',x=>2*x-4+5/(x*x),1,3,[.6,3.4,-1,4],'(2x³ − 4x² + 5)/x²'],['t52',x=>1+Math.cos(x),0,PI/6,[-.2,1,-.2,2.3],'f(x) = 1 + cos x'],
 ['t53a',x=>x**3-3*x-2,1,4,[.6,4.4,-6,52],'(x − 2)(x + 1)² = x³ − 3x − 2'],['t53c',x=>x**3+x*x+x+1,2,3,[1.4,3.4,-4,44],'(x⁴ − 1)/(x − 1)'],['t53d',x=>sq(x)*(sq(x)+2)**2,0,1,[-.2,1.3,-1,10],'√x(√x + 2)²'],
 ['t7b',x=>2*x/(x*x+9),0,4,[-.4,4.6,-.1,.42],'2x/(x² + 9)'],['t7e',x=>(1+Math.exp(x))**2*Math.exp(x),0,1,[-.2,1.3,-3,40],'(1 + eˣ)² eˣ'],['t7f',x=>(3*x*x+4)/(x**3+4*x+1),0,1,[-.2,1.3,-.5,4.6],'(3x² + 4)/(x³ + 4x + 1)'],
 ['t7g',x=>Math.exp(sq(x))/(2*sq(x)),1,4,[.4,4.4,-.3,2],'e^√x / (2√x)'],['t7h',x=>1/Math.cos(x)**2/(2+Math.tan(x)),-PI/4,PI/4,[-1,1,-.2,1.1],'sec² x / (2 + tan x)'],['t7i',x=>Math.cos(x)/sq(Math.sin(x)),PI/6,PI/2,[.2,1.8,-.2,1.6],'cos x / √(sin x)']
].forEach(([k,f,a,b,v,t])=>{ S[k]=AR({f,v,a,b,title:t,hint:'قارن قيمة التكامل مع جوابك',extra:/t5e|t52|t7h|t7i/.test(k)?{xfmt:piF,sx:PI/4}:{}}); S[k].f=f; });
['t5b','t5c','t5e','t5f','t5g','t52','t53a','t53c','t53d','t7b','t7e','t7f','t7g','t7h','t7i'].forEach(k=>{ if(/t5e|t52|t7h|t7i/.test(k)) S[k].xfmt=v=>{ const n=Math.round(v/(PI/12)); return abs(v-n*PI/12)<1e-6?({0:'0',2:'π/6',3:'π/4',6:'π/2',[-3]:'−π/4',[-6]:'−π/2'}[n]??''):fr(v); }; if(/t5e|t52|t7h|t7i/.test(k)) S[k].sx=PI/12; });

/* ---------- «تمرين مشابه» generators ---------- */
const GEN={};
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1)), pick=a=>a[Math.floor(Math.random()*a.length)];
const gcd=(a,b)=>{ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; };
const Q=(n,d=1)=>{ if(d<0){ n=-n; d=-d; } const g=gcd(n,d); return {n:n/g,d:d/g}; };
const qa=(x,y)=>Q(x.n*y.d+y.n*x.d,x.d*y.d), qs=(x,y)=>qa(x,{n:-y.n,d:y.d}), qabs=x=>({n:Math.abs(x.n),d:x.d});
const qs2=x=>x.d===1?String(x.n):x.n+'/'+x.d;                       /* answer key */
const qt=x=>x.d===1?String(x.n):(x.n<0?'-':'')+'\\tfrac{'+Math.abs(x.n)+'}{'+x.d+'}';   /* TeX */
const sg=(c,first)=>c<0?'-'+(Math.abs(c)):(first?'':'+')+c;
const poly=(a2,a1,a0)=>{ let t=[]; if(a2) t.push((a2===1?'':a2===-1?'-':a2)+'x^2'); if(a1) t.push((t.length&&a1>0?'+':'')+(a1===1?'':a1===-1?'-':a1)+'x'); if(a0||!t.length) t.push((t.length&&a0>0?'+':'')+a0); return t.join(''); };
/* L and U for a monotone function with h = 1 */
GEN.gLU=()=>{ const kind=pick(['lin','dec','sq']); let f,tx,a=ri(-1,2),n=ri(2,3);
  if(kind==='lin'){ const p=ri(2,4),q=ri(-2,5); f=x=>p*x+q; tx=poly(0,p,q); }
  else if(kind==='dec'){ const q=ri(4,8); f=x=>q-x; tx=poly(0,-1,q); }
  else { a=ri(0,2); const q=ri(1,4); f=x=>x*x+q; tx=poly(1,0,q); }
  const P=[...Array(n+1)].map((_,i)=>a+i), v=P.map(f); let L=0,U=0; const rows=[];
  for(let i=0;i<n;i++){ const m=Math.min(v[i],v[i+1]), M=Math.max(v[i],v[i+1]); L+=m; U+=M; rows.push(`[${P[i]},${P[i+1]}]: m=${m}, M=${M}`); }
  return {q:`جد $L(\\sigma,f)$ و $U(\\sigma,f)$ للدالة $f(x)=${tx}$ على $[${a},${a+n}]$ بتجزئة منتظمة طول كل فترة 1.`,ans:L+' , '+U,ph:'L , U',
   sol:['» $f$ '+(kind==='dec'?'متناقصة':'متزايدة')+' على الفترة ، فالقيم الصغرى والكبرى عند أطراف الفترات.','$'+P.map((x,i)=>`f(${x})=${v[i]}`).join('\\,,\\ ')+'$',...rows.map(r=>'$'+r.replace(/: /,':\\ ')+'$'),`$L=${L}\\,,\\quad U=${U}$`],
   sc:RS({f,v:[a-.6,a+n+.6,Math.min(0,...v)-1,Math.max(...v)*1.15+1],P,title:'f(x) = '+tx.replace(/\^2/g,'²'),hint:'تمرين مشابه'})}; };
/* approximate value (L+U)/2 */
GEN.gApprox=()=>{ const E=GEN.gLU(); const [L,U]=E.ans.split(',').map(Number); const r=Q(L+U,2);
  return {...E,q:E.q.replace('جد $L(\\sigma,f)$ و $U(\\sigma,f)$ للدالة','جد قيمة تقريبية لتكامل الدالة'),ans:qs2(r),ph:'القيمة التقريبية',sol:[...E.sol,`$\\dfrac{L+U}{2}=\\dfrac{${L}+${U}}{2}=${qt(r)}$`],
   miss:[[String(L),'هذا $L$ فقط؛ المطلوب $\\dfrac{L+U}{2}$.'],[String(U),'هذا $U$ فقط؛ المطلوب $\\dfrac{L+U}{2}$.']]}; };
/* definite integral of a quadratic */
GEN.gPoly=()=>{ const a2=ri(-2,3)||1, a1=ri(-4,4), a0=ri(-5,5), a=ri(-2,1), b=a+ri(1,3);
  const F6=x=>2*a2*x**3+3*a1*x*x+6*a0*x, r=Q(F6(b)-F6(a),6), Ft=`${a2===1?'':a2+'\\cdot'}\\tfrac{x^3}{3}${a1?'+'+(a1===1?'':a1+'\\cdot')+'\\tfrac{x^2}{2}':''}${a0?'+'+a0+'x':''}`.replace(/\+-/g,'-');
  return {q:`احسب $\\displaystyle\\int_{${a}}^{${b}}(${poly(a2,a1,a0)})\\,dx$`,ans:qs2(r),ph:'قيمة التكامل',
   sol:[`» الدالة المقابلة: $F(x)=${Ft}$`,`$F(${b})-F(${a})=${qt(Q(F6(b),6))}-(${qt(Q(F6(a),6))})=${qt(r)}$`],
   sc:AR({f:x=>a2*x*x+a1*x+a0,v:[a-1,b+1,Math.min(-1,...[a,b,(a+b)/2].map(x=>a2*x*x+a1*x+a0))-1,Math.max(1,...[a,b,(a+b)/2].map(x=>a2*x*x+a1*x+a0))+1],a,b,title:'تمرين مشابه',hint:'المساحة الموجبة ناقص السالبة'})}; };
/* ∫ |x − r| */
GEN.gAbs=()=>{ const r=ri(-1,3), a=r-ri(1,3), b=r+ri(1,3), A1=Q((r-a)**2,2), A2=Q((b-r)**2,2), s=qa(A1,A2);
  return {q:`احسب $\\displaystyle\\int_{${a}}^{${b}}|x${sg(-r)}|\\,dx$`.replace('x0','x').replace('|x+0|','|x|').replace('|x-0|','|x|'),ans:qs2(s),ph:'قيمة التكامل',
   sol:[`» نقسم عند $x=${r}$ حيث $x${sg(-r)}=0$`.replace('x+0','x').replace('x-0','x'),`$\\int_{${a}}^{${r}}(${r}-x)\\,dx=${qt(A1)}\\,,\\quad\\int_{${r}}^{${b}}(x-${r})\\,dx=${qt(A2)}$`.replace(/-\(?-/g,'+').replace('(0-x)','(-x)').replace('(x-0)','x'),`المجموع $=${qt(s)}$`],
   miss:[[qs2(qs(A2,A1)),'لا يمكن أن يكون التكامل لقيمة مطلقة بهذه الطريقة: قسّم عند الصفر الداخلي واجعل كل جزء موجباً.']],
   sc:AR({f:x=>abs(x-r),v:[a-1,b+1,-.6,Math.max(r-a,b-r)+1],a,b,cut:[r],title:'|x − '+r+'|',hint:'مثلثان'})}; };
/* area between a parabola (x − p)(x − q) and the x-axis on [a , b] */
GEN.gArea=()=>{ const p=ri(-2,1), q=p+ri(1,3), a=p-ri(0,1), b=q+ri(0,2), s=p+q, t=p*q, f=x=>x*x-s*x+t;
  const F6=x=>2*x**3-3*s*x*x+6*t*x, cuts=[a,...[p,q].filter(z=>z>a&&z<b),b]; let tot=Q(0), signed=Q(0); const parts=[];
  for(let i=0;i+1<cuts.length;i++){ const I=Q(F6(cuts[i+1])-F6(cuts[i]),6); parts.push(`\\int_{${cuts[i]}}^{${cuts[i+1]}}=${qt(I)}`); tot=qa(tot,qabs(I)); signed=qa(signed,I); }
  return {q:`جد مساحة المنطقة المحددة بالمنحني $y=${poly(1,-s,t)}$ ومحور السينات على الفترة $[${a},${b}]$`,ans:qs2(tot),ph:'المساحة',
   sol:[`» الأصفار: $(x${sg(-p)})(x${sg(-q)})=0\\Rightarrow x=${p}\\,,\\ x=${q}$`.replace(/x\+0|x-0/g,'x'),`» الفترات: ${cuts.slice(0,-1).map((c,i)=>`$[${c},${cuts[i+1]}]$`).join(' ، ')}`,'$'+parts.join('\\,,\\quad ')+'$',`$A=${qt(tot)}$`],
   miss:signed.n!==tot.n||signed.d!==tot.d?[[qs2(signed),'هذا التكامل الجبري؛ المساحة مجموع **القيم المطلقة** لكل جزء.']]:[],
   sc:AR({f,v:[a-1,b+1,Math.min(f(a),f(b),f(s/2))-1,Math.max(f(a),f(b),1)+1],a,b,cut:[p,q].filter(z=>z>a&&z<b),title:'تمرين مشابه',hint:'قسّم عند الأصفار'})}; };
/* area between y = x² and y = kx */
GEN.gBetween=()=>{ const k=ri(1,5), r=Q(k**3,6);
  return {q:`جد مساحة المنطقة المحصورة بين $y=x^2$ و $y=${k===1?'':k}x$`,ans:qs2(r),ph:'المساحة',
   sol:[`» التقاطع: $x^2=${k===1?'':k}x\\Rightarrow x(x-${k})=0\\Rightarrow x=0\\,,\\ x=${k}$`,`» على $[0,${k}]$ المستقيم فوق القطع: $\\int_0^{${k}}(${k===1?'':k}x-x^2)\\,dx=\\left[\\tfrac{${k}x^2}{2}-\\tfrac{x^3}{3}\\right]_0^{${k}}$`,`$=\\tfrac{${k**3}}{2}-\\tfrac{${k**3}}{3}=${qt(r)}$`],
   sc:AR({f:x=>k*x,g:x=>x*x,v:[-1,k+1,-1,k*k+2],a:0,b:k,title:'y = x² و y = '+k+'x',hint:'المستقيم فوق القطع'})}; };
/* distance for v = c(t − r) */
GEN.gDist=()=>{ const c=ri(1,3)*2, r=ri(1,3), T2=r+ri(1,3), d=Q(c*(r*r+(T2-r)**2),2), s=Q(c*((T2-r)**2-r*r),2);
  return {q:`جسم يتحرك بسرعة $v(t)=${c}t-${c*r}$ m/s . جد المسافة المقطوعة في الفترة $[0,${T2}]$`,ans:qs2(d),ph:'المسافة (m)',
   sol:[`» يتغير الاتجاه عندما $v=0\\Rightarrow t=${r}$`,`$\\left|\\int_0^{${r}}v\\,dt\\right|+\\left|\\int_{${r}}^{${T2}}v\\,dt\\right|=${qt(Q(c*r*r,2))}+${qt(Q(c*(T2-r)**2,2))}=${qt(d)}$ m`],
   miss:[[qs2(s),'هذه الإزاحة؛ المسافة مجموع القيم المطلقة قبل تغيّر الاتجاه وبعده.']],
   sc:AR({f:t=>c*(t-r),v:[-.3,T2+.6,-c*r-1,c*(T2-r)+1],a:0,b:T2,cut:[r],title:'v(t) = '+c+'t − '+c*r,hint:'المسافة = مجموع القيم المطلقة',extra:{axl:['t','v']}})}; };
/* ∫ 2x/(x² + k) */
GEN.gLn=()=>{ const k=pick([1,2,3,4,5,9]), b=ri(1,4), N=b*b+k, g=gcd(N,k);
  return {q:`احسب $\\displaystyle\\int_0^{${b}}\\frac{2x}{x^2+${k}}\\,dx$`,ans:`ln(${N/g}/${k/g})`,ph:'القيمة (يمكنك كتابة ln)',
   sol:['» البسط $2x$ مشتقة المقام $x^2+'+k+'$',`$\\left[\\ln(x^2+${k})\\right]_0^{${b}}=\\ln${N}-\\ln${k}=\\ln\\tfrac{${N/g}}{${k/g}}$`],
   sc:AR({f:x=>2*x/(x*x+k),v:[-.4,b+.6,-.1,1.2/sq(k)+.2],a:0,b,title:'2x/(x² + '+k+')',hint:'التكامل = ln'})}; };
/* ∫ e^{nx} from 0 to ln k */
GEN.gExp=()=>{ const n=ri(1,3), k=ri(2,4), r=Q(k**n-1,n);
  return {q:`احسب $\\displaystyle\\int_0^{\\ln${k}}e^{${n===1?'':n}x}\\,dx$`,ans:qs2(r),ph:'القيمة',
   sol:[`$\\int e^{${n===1?'':n}x}dx=${n===1?'':'\\tfrac1'+n}e^{${n===1?'':n}x}$`,`» $e^{${n===1?'':n}\\ln${k}}=e^{\\ln${k**n}}=${k**n}$`,`$${n===1?'':'\\tfrac1'+n+'('}${k**n}-1${n===1?'':')'}=${qt(r)}$`],
   miss:n>1?[[String(k**n-1),'نسيت المعامل $\\tfrac1'+n+'$.']]:[]}; };
/* volume about the x-axis of y = c·xⁿ (n = 1, 2) or y = c√x */
GEN.gVol=()=>{ const kind=pick(['sqrt','lin','sq']), b=ri(1,3), c=ri(1,3); let R,num,den,tx,y2;
  if(kind==='sqrt'){ R=x=>c*sq(x); num=c*c*b*b; den=2; tx=(c===1?'':c)+'\\sqrt x'; y2=`${c*c===1?'':c*c}x`; }
  else if(kind==='lin'){ R=x=>c*x; num=c*c*b**3; den=3; tx=(c===1?'':c)+'x'; y2=`${c*c===1?'':c*c}x^2`; }
  else { R=x=>c*x*x; num=c*c*b**5; den=5; tx=(c===1?'':c)+'x^2'; y2=`${c*c===1?'':c*c}x^4`; }
  const r=Q(num,den);
  return {q:`جد حجم المجسم الناتج من دوران المنطقة تحت $y=${tx}$ ، $0\\le x\\le${b}$ حول محور السينات.`,ans:(r.d===1?r.n+'π':r.n+'π/'+r.d),ph:'الحجم (اكتب π)',
   sol:[`$V=\\pi\\int_0^{${b}}y^2\\,dx=\\pi\\int_0^{${b}}${y2}\\,dx$`,`$=${r.d===1?r.n+'\\pi':'\\tfrac{'+r.n+'\\pi}{'+r.d+'}'}$`],
   miss:[[qs2(r),'نسيت $\\pi$.']],
   sc:SOL({R,a:0,b,v:[-.6,b+.8,-R(b)-.8,R(b)+.8],title:'y = '+tx.replace('\\sqrt x','√x').replace('x^2','x²'),hint:'قرص مساحته πy²',V:r.d===1?r.n+'π':r.n+'π/'+r.d})}; };

/* arrow helper */
function arrow(A,x1,y1,x2,y2,col,w=2.6){ const c=A.col[col]||col, a=Math.atan2(y2-y1,x2-x1), L=Math.hypot(x2-x1,y2-y1); if(L<2) return;
  A.el('path',{d:`M${x1} ${y1}L${x2} ${y2}`,stroke:c,'stroke-width':w,'stroke-linecap':'round'});
  A.el('path',{d:`M${x2} ${y2}L${x2-10*Math.cos(a-.45)} ${y2-10*Math.sin(a-.45)}L${x2-10*Math.cos(a+.45)} ${y2-10*Math.sin(a+.45)}Z`,fill:c}); }

/* ---------- moving body on a road + velocity graph (4−8−3) ---------- */
function car(A,x,y,dir,col){ const c=A.col, s=dir<0?-1:1; A.el('g',{});
  A.el('path',{d:`M${x-22*s} ${y-6}h${44*s}v-10l${-10*s} -10h${-22*s}l${-8*s} 10h${-4*s}z`,fill:c[col],stroke:c.ink2,'stroke-width':1.4});
  A.el('rect',{x:Math.min(x-6*s,x+6*s)-5,y:y-24,width:12,height:8,rx:2,fill:'#dff1ff'});
  [[-12],[12]].forEach(([k])=>A.el('circle',{cx:x+k*s,cy:y-4,r:6,fill:'#222',stroke:'#888','stroke-width':2})); }
function ROAD(o){ const V=o.f, a=o.a, b=o.b, S0=t=>integ(V,a,t,300), N=160, ss=[...Array(N+1)].map((_,i)=>S0(a+(b-a)*i/N)), smin=Math.min(0,...ss), smax=Math.max(0,...ss);
 return {title:o.title,hint:o.hint||'',anim:1,sl:{min:a,max:b,v:o.v0??a,step:(b-a)/400,play:1,speed:.32,lab:'الزمن t (ثانية)',fmt:v=>fr(v,2)+' s'},
 pick(A,px){ const g=A._rg; return g?a+(px-g.x0)/g.w*(b-a):null; },
 draw(A){ const t=A.p, c=A.col, W=A.W, H=A.H, ry=Math.min(130,H*.28), x0=40, w=W-80, PX=s=>x0+(s-smin)/((smax-smin)||1)*w;
  /* road */
  A.el('rect',{x:10,y:ry-30,width:W-20,height:44,rx:6,fill:'#5b6270'}); A.el('path',{d:`M14 ${ry-8}H${W-14}`,stroke:'#fff','stroke-width':2,'stroke-dasharray':'14 12',opacity:.7});
  A.el('path',{d:`M${PX(0)} ${ry-34}V${ry+18}`,stroke:c.int,'stroke-width':2.4}); T(A,PX(0),ry-42,'نقطة البدء','int',{size:11.5});
  /* trail: forward above, backward below */
  const k=Math.round((t-a)/(b-a)*N); let d1='',d2=''; for(let i=1;i<=k;i++){ const fwd=ss[i]>=ss[i-1], seg=`M${PX(ss[i-1])} ${ry+(fwd?-20:4)}L${PX(ss[i])} ${ry+(fwd?-20:4)}`; if(fwd) d1+=seg; else d2+=seg; }
  A.el('path',{d:d1,stroke:c.f,'stroke-width':4,opacity:.8}); A.el('path',{d:d2,stroke:c.bad,'stroke-width':4,opacity:.8});
  const s=S0(t), v=V(t); car(A,PX(s),ry+12,v,'chord');
  if(abs(v)>1e-6) arrow(A,PX(s)+(v>0?28:-28),ry-40,PX(s)+(v>0?62:-62),ry-40,v>0?'f':'bad');
  /* v−t graph */
  const P=A.subplot([38,ry+40,W-56,H-ry-60],o.v); P.axes('t','v');
  const n=120; let pd='',nd=''; for(let i=0;i<n;i++){ const u0=a+(t-a)*i/n, u1=a+(t-a)*(i+1)/n, um=(u0+u1)/2, seg=`M${P.X(u0)} ${P.Y(0)}L${P.X(u0)} ${P.Y(V(u0))}L${P.X(u1)} ${P.Y(V(u1))}L${P.X(u1)} ${P.Y(0)}Z`; if(V(um)>=0) pd+=seg; else nd+=seg; }
  A.el('path',{d:pd,fill:c.f,opacity:.28}); A.el('path',{d:nd,fill:c.bad,opacity:.28}); P.curve(V,'f',o.v[0],o.v[1],2.6); P.pt(t,v,'c');
  A._rg={x0:P.X(a),w:P.X(b)-P.X(a)};
  let dist=0; for(let i=1;i<=k;i++) dist+=abs(ss[i]-ss[i-1]);
  A.chips.push(['c','t',fr(t,2)],['chord','v',fr(v,2)],['f','الإزاحة',fr(s,2)],['tan','المسافة',fr(dist,2)]);
  if(o.end&&abs(t-b)<(b-a)/300){ A.ok=1; A.hint=o.end; } else A.hint=o.hint||'اسحب على الرسم البياني لتحريك الزمن'; }}; }
S.vel=ROAD({f:t=>2*t-4,a:1,b:3,v:[-.3,5.6,-4.6,6.6],title:'V(t) = 2t − 4 على [1 , 3]',hint:'السيارة ترجع حتى t = 2 ثم تتقدم: المسافة = مجموع ما قطعته',end:'✓ الإزاحة 0 ، المسافة 2 m'});
S.vel5=ROAD({f:t=>2*t-4,a:4,b:5,v:[-.3,5.6,-4.6,6.6],title:'الثانية الخامسة: [4 , 5]',hint:'v > 0 : لا رجوع',end:'✓ d = 5 m'});
S.vel4=ROAD({f:t=>2*t-4,a:0,b:4,v:[-.3,5.6,-4.6,6.6],title:'بعده بعد 4 ثوانٍ',hint:'ترجع 4 m ثم تتقدم 4 m',end:'✓ عاد الجسم إلى نقطة البدء: s = 0 ، المسافة 8 m'});
S.v18=ROAD({f:t=>18*t+10,a:2,b:3,v:[-.3,4.4,-5,90],title:'V = 18t + 10 : الثانية الثالثة',hint:'v > 0 دائماً',end:'✓ d = 55 m'});
S.v18b=ROAD({f:t=>18*t+10,a:0,b:3,v:[-.3,4.4,-5,90],title:'بعده بعد 3 ثوانٍ',hint:'S = ∫₀³ (18t + 10) dt',end:'✓ S = 111 m'});
S.t8x11=ROAD({f:t=>3*t*t-6*t+3,a:0,b:5,v:[-.3,5.4,-3,52],title:'v(t) = 3(t − 1)²',hint:'تتوقف لحظياً عند t = 1 ولا ترجع'});
S.t8x12=ROAD({f:t=>2*t*t+12*t+10,a:0,b:4,v:[-.3,4.4,-10,90],title:'v(t) = 2t² + 12t + 10',hint:'v(4) = 90'});
S.t8x13=ROAD({f:t=>100*t-6*t*t,a:0,b:26,v:[-1,27,-1100,500],title:'v = 100t − 6t² : متى تعود؟',hint:'تتقدم حتى t = 50/3 ثم ترجع',end:'✓ عند t = 25 تعود إلى موضعها الأول'});
/* solids of revolution: drag the disc */
