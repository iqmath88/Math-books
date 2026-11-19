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
