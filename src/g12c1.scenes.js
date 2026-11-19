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
