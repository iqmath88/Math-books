/* السادس العلمي · الفصل الأول · الأعداد المركبة — مشاهد الرسم */
const sq=Math.sqrt, PI=Math.PI, abs=Math.abs;
const fr=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
const T=(A,x,y,s,col='ink2',o={})=>A.lab(x,y,s,{fill:A.col[col]||col,w:o.w??700,size:o.size||13,anchor:o.anchor,halo:1});
const S={};

/* ---------- helpers ---------- */
const dot=(A,x,y,col='c',r=6)=>A.el('circle',{cx:A.X(x),cy:A.Y(y),r,fill:A.col[col],stroke:A.col.surf,'stroke-width':2},A.G);
const seg=(A,x0,y0,x1,y1,col='muted',w=2,dash)=>A.el('path',{d:`M${A.X(x0)} ${A.Y(y0)}L${A.X(x1)} ${A.Y(y1)}`,stroke:A.col[col]||col,'stroke-width':w,'stroke-dasharray':dash,fill:'none'},A.G);
function circ(A,r,col='muted',w=1.6,dash='6 5'){ let d=''; for(let i=0;i<=120;i++){ const t=2*PI*i/120; d+=(i?'L':'M')+A.X(r*Math.cos(t))+' '+A.Y(r*Math.sin(t)); }
  A.el('path',{d,stroke:A.col[col]||col,'stroke-width':w,fill:'none','stroke-dasharray':dash},A.G); }
/* a complex number a+bi drawn as the point (a,b) with dashed guides to both axes */
function cpt(A,a,b,lab,col='c'){ seg(A,a,0,a,b,'muted',1.3,'4 4'); seg(A,0,b,a,b,'muted',1.3,'4 4'); dot(A,a,b,col,6.5);
  T(A,A.X(a)+(a<0?-10:10),A.Y(b)-12,lab,col,{size:12.5,anchor:a<0?'end':'start'}); }

/* ---------- 1−1 ---------- */
/* powers of i: every power lands on one of 1, i, −1, −i ; the remainder of n ÷ 4 decides which */
const IP=[[1,0,'1'],[0,1,'i'],[-1,0,'−1'],[0,-1,'−i']];
S.ipow={v:[-1.9,1.9,-1.6,1.6],eq:1,title:'قوى i تدور على أربع قيم فقط',hint:'باقي قسمة الأس على 4 يحدد القيمة',
 sl:{min:-13,max:27,v:0,step:1,play:1,speed:.6,lab:'الأس n',fmt:v=>String(Math.round(v))},
 draw(A){ const n=Math.round(A.p), r=((n%4)+4)%4;
  circ(A,1);
  IP.forEach(([x,y,l],k)=>{ dot(A,x,y,k===r?'f':'muted',k===r?9:5); T(A,A.X(x*1.28),A.Y(y*1.28)+5,l,k===r?'f':'muted',{size:k===r?16:13,anchor:'middle'}); });
  const [x,y]=IP[r]; seg(A,0,0,x,y,'f',3);
  /* the quarter turns travelled so far */
  for(let k=0;k<Math.min(Math.abs(n),8);k++){ const a0=Math.sign(n)*k*PI/2, a1=Math.sign(n)*(k+1)*PI/2, rr=.32+.05*k; let d='';
    for(let j=0;j<=16;j++){ const t=a0+(a1-a0)*j/16; d+=(j?'L':'M')+A.X(rr*Math.cos(t))+' '+A.Y(rr*Math.sin(t)); }
    A.el('path',{d,stroke:A.col.tan,'stroke-width':1.6,fill:'none',opacity:.7},A.G); }
  A.chips.push(['c','n',String(n)],['tan','الباقي من ÷ 4',String(r)],['f','i^n',IP[r][2]]); }};

/* a + bi is the ordered pair (a , b) : the four numbers of example 2 */
const C2=[[-5,0,'−5 + 0i'],[0,10,'0 + 10i'],[-1,-sq(3),'−1 − √3 i'],[.25,1.25,'¼ + ⁵⁄₄ i']];
S.cform={v:[-7,4,-3.2,11],title:'كل عدد مركب a + bi نقطة (a , b)',hint:'المحور الأفقي للجزء الحقيقي، والعمودي للجزء التخيلي',
 sl:{min:0,max:3,v:0,step:1,play:1,speed:.5,lab:'العدد',fmt:v=>C2[Math.round(v)][2]},
 draw(A){ const k=Math.round(A.p);
  C2.forEach(([a,b,l],j)=>{ if(j!==k) dot(A,a,b,'muted',4.5); });
  const [a,b,l]=C2[k]; cpt(A,a,b,l,'f');
  A.chips.push(['f','الحقيقي a',fr(a,3)],['c','التخيلي b',fr(b,3)]); }};

/* equality: two complex numbers are equal only when both coordinates agree */
S.ceq={v:[-3,3,-3,3],eq:1,title:'التساوي: النقطتان تنطبقان',hint:'a₁ = a₂ و b₁ = b₂ معاً',
 sl:{min:-2,max:2,v:-1,step:.01,play:1,speed:.25,lab:'x',fmt:v=>fr(v,2)},
 draw(A){ const x=A.p, y=1;
  /* example 3 a : (2x − 1) + 2i  and  1 + (y + 1)i  with y = 1 */
  const L=[2*x-1,2], R=[1,y+1], ok=abs(L[0]-R[0])<.02;
  cpt(A,R[0],R[1],'1 + (y+1)i','c'); cpt(A,L[0],L[1],'(2x−1) + 2i','f');
  A.chips.push(['f','2x − 1',fr(L[0],2)],['c','الجزء الحقيقي الآخر','1']);
  A.hint=ok?'انطبقت النقطتان ✓ : x = 1 و y = 1':'حرّك x حتى يتساوى الجزءان الحقيقيان'; }};

/* ---------- 1−2 ---------- */
/* c1 + c2 : add the parts, i.e. the parallelogram rule for the points */
const C4=[[[3,4*sq(2)],[5,-2*sq(2)],'(3+4√2 i)+(5−2√2 i)'],[[3,0],[2,-5],'(3)+(2−5i)'],[[1,-1],[0,3],'(1−i)+3i']];
const arrow=(A,a,b,col,w=2.6)=>{ seg(A,0,0,a,b,col,w); dot(A,a,b,col,5); };
S.cadd={v:[-2,9,-6,6.5],eq:1,title:'الجمع: نجمع الحقيقي مع الحقيقي والتخيلي مع التخيلي',hint:'المجموع هو الرأس الرابع لمتوازي الأضلاع',
 sl:{min:0,max:2,v:0,step:1,play:1,speed:.45,lab:'الفقرة',fmt:v=>C4[Math.round(v)][2]},
 draw(A){ const [[a1,b1],[a2,b2]]=C4[Math.round(A.p)], a=a1+a2, b=b1+b2;
  seg(A,a1,b1,a,b,'muted',1.4,'5 4'); seg(A,a2,b2,a,b,'muted',1.4,'5 4');
  arrow(A,a1,b1,'c'); arrow(A,a2,b2,'tan'); arrow(A,a,b,'f',3.4);
  A.chips.push(['c','c₁',fr(a1,2)+(b1<0?' − ':' + ')+fr(abs(b1),2)+'i'],['tan','c₂',fr(a2,2)+(b2<0?' − ':' + ')+fr(abs(b2),2)+'i'],['f','c₁ + c₂',fr(a,2)+(b<0?' − ':' + ')+fr(abs(b),2)+'i']); }};
/* subtraction = adding the additive inverse (examples 5 and 6) */
const C5=[[[7,-13],[-9,-4],'مثال 5: (7−13i) + (−9−4i)'],[[-5,1],[-2,4],'مثال 6: x = (−5+i) + (−2+4i)']];
S.csub={v:[-11,9,-19,7],eq:1,title:'الطرح: نجمع مع النظير الجمعي',hint:'النظير الجمعي لـ a + bi هو −a − bi : نقطة مقابلة عبر الأصل',
 sl:{min:0,max:1,v:0,step:1,play:1,speed:.4,lab:'المثال',fmt:v=>C5[Math.round(v)][2]},
 draw(A){ const [[a1,b1],[a2,b2]]=C5[Math.round(A.p)], a=a1+a2, b=b1+b2;
  seg(A,0,0,-a2,-b2,'muted',1.6,'5 4'); dot(A,-a2,-b2,'muted',4.5);
  seg(A,a1,b1,a,b,'muted',1.4,'5 4'); seg(A,a2,b2,a,b,'muted',1.4,'5 4');
  arrow(A,a1,b1,'c'); arrow(A,a2,b2,'tan'); arrow(A,a,b,'f',3.4);
  A.chips.push(['tan','النظير الجمعي',fr(a2,2)+(b2<0?' − ':' + ')+fr(abs(b2),2)+'i'],['f','الناتج',fr(a,2)+(b<0?' − ':' + ')+fr(abs(b),2)+'i']); }};
/* c1 · c2 : (a1a2 − b1b2) + (a1b2 + a2b1) i */
const C7=[[[2,-3],[3,-5],'(2−3i)(3−5i)'],[[3,4],[3,4],'(3+4i)²'],[[0,1],[1,1],'i(1+i)'],[[-2.5,0],[4,3],'−5/2 (4+3i)']];
S.cmul={v:[-12,6,-21,26],eq:1,title:'الضرب: (a₁a₂ − b₁b₂) + (a₁b₂ + a₂b₁) i',hint:'i² = −1 هو الذي يجعل −b₁b₂ في الجزء الحقيقي',
 sl:{min:0,max:3,v:0,step:1,play:1,speed:.45,lab:'الفقرة',fmt:v=>C7[Math.round(v)][2]},
 draw(A){ const [[a1,b1],[a2,b2]]=C7[Math.round(A.p)], a=a1*a2-b1*b2, b=a1*b2+a2*b1;
  arrow(A,a1,b1,'c'); arrow(A,a2,b2,'tan'); arrow(A,a,b,'f',3.4);
  A.chips.push(['f','الحقيقي a₁a₂ − b₁b₂',fr(a,2)],['f','التخيلي a₁b₂ + a₂b₁',fr(b,2)]); }};

/* ---------- 1−3 ---------- */
/* the conjugate a − bi is the mirror image of a + bi in the real axis; c · c̄ = a² + b² */
S.conj={v:[-4.5,4.5,-3.6,3.6],eq:1,title:'المرافق انعكاس في المحور الحقيقي',hint:'c × c̄ = a² + b² عدد حقيقي دائماً',
 sl:{min:0,max:6.283,v:.9,step:.01,play:1,speed:.12,lab:'حرّك العدد c',fmt:v=>''},
 draw(A){ const t=A.p, a=Math.round((2.2*Math.cos(t)+.6)*10)/10, b=Math.round((2.4*Math.sin(t))*10)/10;
  seg(A,a,b,a,-b,'muted',1.4,'5 4');
  cpt(A,a,b,'c = a + bi','c'); cpt(A,a,-b,'c̄ = a − bi','tan');
  A.chips.push(['c','c',fr(a,1)+(b<0?' − ':' + ')+fr(abs(b),1)+'i'],['tan','c̄',fr(a,1)+(b<0?' + ':' − ')+fr(abs(b),1)+'i'],['f','c × c̄ = a² + b²',fr(a*a+b*b,2)]); }};

/* ---------- 1−4 ---------- */
/* square roots: the two roots are opposite points; squaring doubles the angle and squares the length */
const C14=[[8,6,'8 + 6i'],[-25,0,'−25'],[-17,0,'−17'],[0,-1,'−i'],[0,8,'8i']];
S.csqrt={v:[-6,6,-5.4,5.4],eq:1,title:'للعدد المركب جذران تربيعيان متعاكسان',hint:'الخط المتقطع اتجاه العدد c ؛ كل جذر نصف زاويته وجذر طوله',
 sl:{min:0,max:4,v:0,step:1,play:1,speed:.35,lab:'العدد c',fmt:v=>C14[Math.round(v)][2]},
 draw(A){ const [a,b,l]=C14[Math.round(A.p)], m=Math.hypot(a,b), t=Math.atan2(b,a), r=sq(m), x=r*Math.cos(t/2), y=r*Math.sin(t/2);
  circ(A,r,'muted',1.2,'3 5');
  seg(A,0,0,5.2*a/m,5.2*b/m,'c',1.8,'7 5'); T(A,A.X(5.2*a/m),A.Y(5.2*b/m)-10,'c = '+l,'c',{size:12.5,anchor:'middle'});
  seg(A,-x,-y,x,y,'f',1.2,'2 4'); dot(A,x,y,'f',7); dot(A,-x,-y,'f',7);
  A.chips.push(['c','c',l],['f','الجذران ±',fr(x,3)+(y<0?' − ':' + ')+fr(abs(y),3)+'i'],['muted','|c|',fr(m,2)]); }};

/* ---------- 1−5 ---------- */
/* roots of x² + 4x + c : real while the discriminant is ≥ 0, then a conjugate pair */
S.quad={v:[-5,1,-2.6,2.6],eq:1,title:'جذرا x² + 4x + c',hint:'المميز سالب ⇐ جذران مركبان مترافقان',
 sl:{min:0,max:8,v:5,step:.05,play:1,speed:.18,lab:'c',fmt:v=>fr(v,2)},
 draw(A){ const c=A.p, D=16-4*c;
  let r1,r2; if(D>=0){ r1=[(-4+sq(D))/2,0]; r2=[(-4-sq(D))/2,0]; } else { r1=[-2,sq(-D)/2]; r2=[-2,-sq(-D)/2]; }
  seg(A,r1[0],r1[1],r2[0],r2[1],'muted',1.2,'4 4');
  dot(A,r1[0],r1[1],'f',7); dot(A,r2[0],r2[1],'tan',7);
  A.chips.push(['c','المميز b² − 4ac',fr(D,2)],['f','x₁',fr(r1[0],2)+(r1[1]?(' + '+fr(r1[1],2)+'i'):'')],['tan','x₂',fr(r2[0],2)+(r2[1]?(' − '+fr(-r2[1],2)+'i'):'')],['muted','x₁ + x₂','−4'],['muted','x₁ · x₂',fr(c,2)]);
  A.hint=D<0?'المميز سالب: الجذران مترافقان، مجموعهما −4 وحاصل ضربهما c':'المميز غير سالب: جذران حقيقيان'; }};

/* ---------- 1−6 ---------- */
/* cube roots of unity: 1, ω, ω² form an equilateral triangle; powers of ω cycle every 3 */
const OM=[[1,0,'1'],[-.5,sq(3)/2,'ω'],[-.5,-sq(3)/2,'ω²']];
S.omega={v:[-1.9,1.9,-1.6,1.6],eq:1,title:'الجذور التكعيبية للواحد: مثلث متساوي الأضلاع',hint:'ω³ = 1 و 1 + ω + ω² = 0',
 sl:{min:-8,max:33,v:0,step:1,play:1,speed:.6,lab:'الأس n',fmt:v=>String(Math.round(v))},
 draw(A){ const n=Math.round(A.p), r=((n%3)+3)%3;
  circ(A,1);
  A.el('path',{d:OM.map((p,k)=>(k?'L':'M')+A.X(p[0])+' '+A.Y(p[1])).join('')+'Z',stroke:A.col.muted,'stroke-width':1.4,fill:A.col.f,'fill-opacity':.06},A.G);
  OM.forEach(([x,y,l],k)=>{ dot(A,x,y,k===r?'f':'muted',k===r?9:5); T(A,A.X(x*1.3),A.Y(y*1.3)+5,l,k===r?'f':'muted',{size:k===r?16:13,anchor:'middle'}); });
  seg(A,0,0,OM[r][0],OM[r][1],'f',3);
  A.chips.push(['c','n',String(n)],['tan','الباقي من ÷ 3',String(r)],['f','ωⁿ',OM[r][2]],['muted','ω','−½ + (√3/2) i']); }};

/* ---------- 1−7 ---------- */
/* example 22 on the Argand diagram: (a) a sum, (b) a difference as a sum with −z₂ */
const C22=[[[3,4],[5,2],'a) (3+4i) + (5+2i)'],[[6,-2],[-2,5],'b) (6−2i) + (−2+5i)']];
S.argand={v:[-4,10,-4,8],eq:1,title:'التمثيل الهندسي: الجمع متوازي أضلاع قطره op₃',hint:'الطرح جمع مع −z₂ : نصف دورة حول 0',
 sl:{min:0,max:1,v:0,step:1,play:1,speed:.4,lab:'الفقرة',fmt:v=>C22[Math.round(v)][2]},
 draw(A){ const [[a1,b1],[a2,b2]]=C22[Math.round(A.p)], a=a1+a2, b=b1+b2;
  seg(A,a1,b1,a,b,'muted',1.4,'5 4'); seg(A,a2,b2,a,b,'muted',1.4,'5 4');
  arrow(A,a1,b1,'c'); arrow(A,a2,b2,'tan'); arrow(A,a,b,'f',3.4);
  T(A,A.X(a1)+8,A.Y(b1)-10,'p₁','c',{anchor:'start'}); T(A,A.X(a2)+8,A.Y(b2)-10,'p₂','tan',{anchor:'start'}); T(A,A.X(a)+8,A.Y(b)-10,'p₃ ('+a+' , '+b+')','f',{anchor:'start'});
  A.chips.push(['c','p₁',`(${a1} , ${b1})`],['tan','p₂',`(${a2} , ${b2})`],['f','p₃',`(${a} , ${b})`]); }};
/* exercise 4: z₁ = 4 − 2i , z₂ = 1 + 2i and the four requested points */
const X74=[[-3,-6,'−3z₂'],[8,-4,'2z₁'],[3,-4,'z₁ − z₂'],[5,0,'z₁ + z₂']];
S.ex74={v:[-5,9,-7,4],eq:1,title:'z₁ = 4 − 2i , z₂ = 1 + 2i',hint:'kz تكبير مركزه 0 ، و −z نصف دورة',
 sl:{min:0,max:3,v:0,step:1,play:1,speed:.4,lab:'النقطة',fmt:v=>X74[Math.round(v)][2]},
 draw(A){ const k=Math.round(A.p); arrow(A,4,-2,'c',2); arrow(A,1,2,'tan',2);
  X74.forEach(([a,b,l],j)=>{ if(j!==k) dot(A,a,b,'muted',4.5); });
  const [a,b,l]=X74[k]; cpt(A,a,b,l+' = '+a+(b<0?' − ':' + ')+abs(b)+'i','f');
  A.chips.push(['c','z₁','4 − 2i'],['tan','z₂','1 + 2i'],['f',l,`(${a} , ${b})`]); }};

/* ---------- 1−8 ---------- */
/* polar form: r = ‖z‖ and θ = arg z measured anticlockwise from the positive real axis, θ ∈ [0 , 2π) */
const C23=[[1,sq(3),'1 + √3 i','π/3'],[-1,-1,'−1 − i','5π/4'],[-2,2,'−2 + 2i','3π/4'],[2*sq(3),-2,'2√3 − 2i','11π/6'],[1,0,'1','0'],[0,1,'i','π/2'],[-1,0,'−1','π'],[0,-1,'−i','3π/2']];
S.polar={v:[-4.2,4.2,-3.4,3.4],eq:1,title:'الصيغة القطبية: z = r (cos θ + i sin θ)',hint:'θ تُقاس من المحور الحقيقي الموجب عكس عقارب الساعة',
 sl:{min:0,max:7,v:0,step:1,play:1,speed:.35,lab:'العدد',fmt:v=>C23[Math.round(v)][2]},
 draw(A){ const [x,y,l,tl]=C23[Math.round(A.p)], r=Math.hypot(x,y); let t=Math.atan2(y,x); if(t<0) t+=2*PI;
  const rr=Math.min(.7,r*.5); let d=''; for(let j=0;j<=40;j++){ const a=t*j/40; d+=(j?'L':'M')+A.X(rr*Math.cos(a))+' '+A.Y(rr*Math.sin(a)); }
  if(t>0) A.el('path',{d,stroke:A.col.tan,'stroke-width':2.4,fill:'none'},A.G);
  seg(A,0,0,x,y,'f',3); cpt(A,x,y,l,'f');
  A.chips.push(['f','r = ‖z‖',fr(r,3)],['tan','θ = arg z',tl],['c','الربع',x>0&&y>=0?(y?'الأول':'على المحور'):x<=0&&y>0?(x?'الثاني':'على المحور'):x<0&&y<=0?(y?'الثالث':'على المحور'):(x?'الرابع':'على المحور')]); }};

/* ---------- 1−9 ---------- */
/* De Moivre: raising to the n-th power multiplies the angle by n (and raises the modulus to the n-th power) */
S.moivre={v:[-1.7,1.7,-1.45,1.45],eq:1,title:'(cos θ + i sin θ)ⁿ = cos nθ + i sin nθ',hint:'الرفع للقوة n يضرب الزاوية في n',
 sl:{min:1,max:11,v:1,step:1,play:1,speed:.5,lab:'n في (1 + i)ⁿ',fmt:v=>String(Math.round(v))},
 draw(A){ const n=Math.round(A.p), t=PI/4;
  circ(A,1);
  for(let k=1;k<=n;k++){ const a=k*t; dot(A,Math.cos(a),Math.sin(a),k===n?'f':'muted',k===n?8:3.5); }
  const a=n*t; seg(A,0,0,Math.cos(a),Math.sin(a),'f',3);
  let d=''; for(let j=0;j<=60;j++){ const b=a*j/60, rr=.18+.02*b; d+=(j?'L':'M')+A.X(rr*Math.cos(b))+' '+A.Y(rr*Math.sin(b)); }
  A.el('path',{d,stroke:A.col.tan,'stroke-width':1.8,fill:'none'},A.G);
  const m=((n%8)+8)%8, nm=['0','π/4','π/2','3π/4','π','5π/4','3π/2','7π/4'][m];
  A.chips.push(['c','المقياس (√2)ⁿ',fr(Math.pow(2,n/2),3)],['tan','السعة n·π/4',n+'π/4'],['f','القيمة الأساسية',nm]); }};
/* n-th roots: the n roots are equally spaced (a regular polygon) on a circle of radius r^(1/n) */
const NR=[[-1,0,3,'جذور x³ = −1 (مثال 30)'],[2,2*sq(3),5,'الجذور الخمسة لـ z² = 4 cis(π/3) (مثال 31)'],[-16,0,4,'الجذور الأربعة لـ −16 (تمرين 6)'],[0,-64,6,'الجذور الستة لـ −64i (تمرين 7)'],[0,27,3,'الجذور التكعيبية لـ 27i (تمرين 5)']];
S.nroot={v:[-3.4,3.4,-2.8,2.8],eq:1,title:'الجذور النونية: رؤوس مضلع منتظم',hint:'k = 0 , 1 , … , n − 1 ؛ الفرق بين جذرين متتاليين 2π/n',
 sl:{min:0,max:4,v:0,step:1,play:1,speed:.35,lab:'السؤال',fmt:v=>NR[Math.round(v)][3]},
 draw(A){ const [a,b,n]=NR[Math.round(A.p)], r=Math.hypot(a,b), t=Math.atan2(b,a), R=Math.pow(r,1/n), pts=[];
  circ(A,R);
  for(let k=0;k<n;k++){ const g=(t+2*PI*k)/n; pts.push([R*Math.cos(g),R*Math.sin(g)]); }
  A.el('path',{d:pts.map((p,k)=>(k?'L':'M')+A.X(p[0])+' '+A.Y(p[1])).join('')+'Z',stroke:A.col.muted,'stroke-width':1.4,fill:A.col.f,'fill-opacity':.07},A.G);
  pts.forEach((p,k)=>{ dot(A,p[0],p[1],k?'tan':'f',k?6:8); T(A,A.X(p[0]*1.18),A.Y(p[1]*1.18)+5,'k='+k,k?'tan':'f',{size:11.5,anchor:'middle'}); });
  A.chips.push(['c','n',String(n)],['f','نصف القطر r^(1/n)',fr(R,3)],['tan','الفرق 2π/n',fr(360/n,1)+'°']); }};
