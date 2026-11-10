/* الخامس العلمي · الفصل الرابع · الدوال الدائرية */
const sq=Math.sqrt, PI=Math.PI, abs=Math.abs, D2R=PI/180;
const fr=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
const T=(A,x,y,s,col='ink2',o={})=>A.lab(x,y,s,{fill:A.col[col]||col,w:o.w??700,size:o.size||13,anchor:o.anchor,halo:1});
/* nice names for common angles */
const NICE=[[0,'0'],[PI/6,'π/6'],[PI/4,'π/4'],[PI/3,'π/3'],[PI/2,'π/2'],[2*PI/3,'2π/3'],[3*PI/4,'3π/4'],[5*PI/6,'5π/6'],[PI,'π'],[7*PI/6,'7π/6'],[5*PI/4,'5π/4'],[4*PI/3,'4π/3'],[3*PI/2,'3π/2'],[5*PI/3,'5π/3'],[7*PI/4,'7π/4'],[11*PI/6,'11π/6'],[2*PI,'2π']];
const rname=t=>{ for(const [v,n] of NICE) if(abs(t-v)<.02) return n; return fr(t,2); };
const VALS=[[0,'0'],[.5,'1/2'],[sq(2)/2,'√2/2'],[sq(3)/2,'√3/2'],[1,'1'],[sq(3),'√3'],[1/sq(3),'1/√3']];
const vname=v=>{ if(!isFinite(v)||abs(v)>1e6) return 'غير معرفة'; for(const [x,n] of VALS) if(abs(abs(v)-x)<.004) return (v<0&&x?'−':'')+n; return fr(v,3); };
const VU=[-1.7,1.7,-1.35,1.35];
function ucBase(A,o={}){ const c=A.col, G=A.G, X=A.X, Y=A.Y;
  A.el('circle',{cx:X(0),cy:Y(0),r:abs(X(1)-X(0)),fill:'none',stroke:c.f,'stroke-width':2.6},G);
  if(o.pts!==false){ [[1,0,'A'],[0,1,'D'],[-1,0,'L'],[0,-1,'M']].forEach(([x,y,l])=>{ A.el('circle',{cx:X(x),cy:Y(y),r:3.5,fill:c.ink2},G); T(A,X(x)+(x>0?12:x<0?-12:10),Y(y)+(y>0?-10:y<0?14:-10),l,'muted',{size:12}); }); } }
function ucPoint(A,t,o={}){ const c=A.col, G=A.G, X=A.X, Y=A.Y, x=Math.cos(t), y=Math.sin(t);
  A.el('path',{d:`M${X(0)} ${Y(0)}L${X(x)} ${Y(y)}`,stroke:c.ink2,'stroke-width':2},G);
  A.el('path',{d:`M${X(x)} ${Y(y)}V${Y(0)}`,stroke:c.tan,'stroke-width':3},G); A.el('path',{d:`M${X(0)} ${Y(0)}H${X(x)}`,stroke:c.chord,'stroke-width':3},G);
  const r=.22, big=((t%(2*PI))+2*PI)%(2*PI)>PI?1:0, tt=((t%(2*PI))+2*PI)%(2*PI);
  if(tt>.02) A.el('path',{d:`M${X(r)} ${Y(0)}A${abs(X(r)-X(0))} ${abs(X(r)-X(0))} 0 ${big} 0 ${X(r*Math.cos(tt))} ${Y(r*Math.sin(tt))}`,fill:'none',stroke:c.int,'stroke-width':2},G);
  A.el('circle',{cx:X(x),cy:Y(y),r:7,fill:c.c,stroke:c.surf,'stroke-width':2.4},G);
  T(A,X(x)+(x>=0?12:-12),Y(y)-14,o.lab||'N(x , y)','c',{size:12,anchor:x>=0?'start':'end'});
  return {x,y}; }
const S={};
S.wind={v:VU,eq:1,noaxes:0,title:'التطبيق اللاف: θ ↦ N(cos θ , sin θ)',hint:'خيط طوله θ يُلفّ على دائرة الوحدة بدءاً من A(1 , 0)',sl:{min:0,max:2*PI,v:PI/3,lab:'العدد θ',fmt:rname,step:.01},
 draw(A){ ucBase(A); const t=A.p, c=A.col, X=A.X, Y=A.Y, R=abs(X(1)-X(0));
  if(t>.01) A.el('path',{d:`M${X(1)} ${Y(0)}A${R} ${R} 0 ${t>PI?1:0} 0 ${X(Math.cos(t))} ${Y(Math.sin(t))}`,fill:'none',stroke:c.int,'stroke-width':6,opacity:.55,'stroke-linecap':'round'},A.G);
  const {x,y}=ucPoint(A,t); A.chips.push(['int','θ',rname(t)],['chord','cos θ = x',vname(x)],['tan','sin θ = y',vname(y)]); }};
S.princ={v:VU,eq:1,title:'القياس الرئيس: 0 ≤ θ < 2π',hint:'الزاوية = 2kπ + θ',sl:{min:-4*PI,max:6*PI,v:8.75*PI-6*PI,lab:'قياس الزاوية',fmt:v=>fr(v/PI,2)+'π',step:.01},
 draw(A){ ucBase(A); const a=A.p, k=Math.floor(a/(2*PI)), th=a-2*k*PI, c=A.col, X=A.X, Y=A.Y;
  const n=Math.max(40,Math.round(abs(a)*30)); let d=''; for(let i=0;i<=n;i++){ const u=a*i/n, rr=.3+.07*abs(u)/(2*PI); d+=(i?'L':'M')+X(rr*Math.cos(u))+' '+Y(rr*Math.sin(u)); }
  A.el('path',{d,fill:'none',stroke:c.int,'stroke-width':2},A.G); ucPoint(A,th,{lab:''});
  A.chips.push(['int','الزاوية',fr(a/PI,2)+'π'],['c','k',String(k)],['tan','القياس الرئيس θ',rname(th)]); }};
S.tanc={v:[-1.7,2.2,-1.9,1.9],eq:1,title:'الظل على المستقيم المماس عند A',hint:'tan θ = sin θ / cos θ',sl:{min:0,max:2*PI,v:PI/4,lab:'θ',fmt:v=>Math.round(v/D2R)+'°',step:.01},
 draw(A){ ucBase(A); const t=A.p, c=A.col, X=A.X, Y=A.Y, G=A.G, tn=Math.tan(t);
  A.el('path',{d:`M${X(1)} ${Y(-1.9)}V${Y(1.9)}`,stroke:c.muted,'stroke-width':1.6,'stroke-dasharray':'6 5'},G);
  [[.75,.75,'I'],[-.75,.75,'II'],[-.75,-.75,'III'],[.75,-.75,'IV']].forEach(([x,y,l])=>T(A,X(x),Y(y),l,'muted',{size:14}));
  const {x,y}=ucPoint(A,t,{lab:''});
  if(abs(Math.cos(t))>.05&&abs(tn)<1.85){ A.el('path',{d:`M${X(0)} ${Y(0)}L${X(1)} ${Y(tn)}`,stroke:c.int,'stroke-width':1.6,'stroke-dasharray':'4 4'},G); A.el('path',{d:`M${X(1)} ${Y(0)}V${Y(tn)}`,stroke:c.int,'stroke-width':4},G); A.el('circle',{cx:X(1),cy:Y(tn),r:5,fill:c.int},G); }
  const sg=v=>abs(v)<1e-3?'0':v>0?'+':'−'; A.chips.push(['chord','cos',sg(x)],['tan','sin',sg(y)],['int','tan',abs(Math.cos(t))<1e-3?'غير معرفة':sg(tn)+' '+vname(tn)]); }};
S.six={v:VU,eq:1,title:'الدوال الست',hint:'sin² θ + cos² θ = 1',sl:{min:0,max:2*PI,v:PI/6,lab:'θ',fmt:v=>Math.round(v/D2R)+'°',step:.01},
 draw(A){ ucBase(A); const t=A.p, {x,y}=ucPoint(A,t,{lab:''});
  A.chips.push(['tan','sin',vname(y)],['chord','cos',vname(x)],['int','tan',vname(y/x)],['int','cot',vname(x/y)],['f','sec',vname(1/x)],['f','csc',vname(1/y)]); }};
S.rel={v:VU,eq:1,title:'من أي زاوية إلى زاوية حادة',hint:'n فردي: تتغير الدالة ، n زوجي: لا تتغير ، ونراعي الإشارة',sl:{min:0,max:2*PI,v:2*PI/3,lab:'الزاوية',fmt:v=>Math.round(v/D2R)+'°',step:PI/36},
 draw(A){ ucBase(A); const t=A.p, c=A.col, X=A.X, Y=A.Y, G=A.G, deg=Math.round(t/D2R)%360, q=Math.floor(deg/90), acute=[deg,180-deg,deg-180,360-deg][Math.min(3,q)];
  const {x,y}=ucPoint(A,t,{lab:''}); const ref=Math.round(acute)*D2R, rx=Math.sign(x)||1, ry=Math.sign(y)||1;
  A.el('path',{d:`M${X(0)} ${Y(0)}L${X(rx)} ${Y(0)}`,stroke:c.int,'stroke-width':4,opacity:.4},G);
  T(A,X(.45*rx*Math.cos(ref/2)),Y(.45*ry*Math.sin(ref/2)),acute+'°','int',{size:12});
  A.chips.push(['int','الزاوية الحادة',acute+'°'],['tan','sin',vname(y)],['chord','cos',vname(x)]); }};
S.sum={v:VU,eq:1,title:'المتجهان op و oq على دائرة الوحدة',hint:'cos(x₁ − x₂) = cos x₁ cos x₂ + sin x₁ sin x₂',
 draw(A){ ucBase(A,{pts:false}); const c=A.col, X=A.X, Y=A.Y, G=A.G, a=1.1, b=.35;
  [[a,'p','c'],[b,'q','tan']].forEach(([t,l,col])=>{ A.el('path',{d:`M${X(0)} ${Y(0)}L${X(Math.cos(t))} ${Y(Math.sin(t))}`,stroke:c[col],'stroke-width':3},G); A.el('circle',{cx:X(Math.cos(t)),cy:Y(Math.sin(t)),r:6,fill:c[col]},G); T(A,X(1.13*Math.cos(t)),Y(1.13*Math.sin(t)),l,col); });
  T(A,X(.3),Y(.2),'x₁ − x₂','int',{size:12}); A.chips.push(['c','p','(cos x₁ , sin x₁)'],['tan','q','(cos x₂ , sin x₂)']); }};
S.eqs={v:VU,eq:1,title:'sin x = B : أين يقطع المستقيم الدائرة؟',hint:'الجيب موجب في الربعين الأول والثاني',sl:{min:-1,max:1,v:.5,lab:'B',fmt:v=>vname(v),step:.01},
 draw(A){ ucBase(A); const B=A.p, c=A.col, X=A.X, Y=A.Y, G=A.G, t=Math.asin(B), s1=((t/D2R)+360)%360, s2=(180-t/D2R+360)%360;
  A.el('path',{d:`M${X(-1.7)} ${Y(B)}H${X(1.7)}`,stroke:c.chord,'stroke-width':2,'stroke-dasharray':'6 5'},G);
  [t,PI-t].forEach(u=>{ A.el('path',{d:`M${X(0)} ${Y(0)}L${X(Math.cos(u))} ${Y(Math.sin(u))}`,stroke:c.ink2,'stroke-width':1.8},G); A.el('circle',{cx:X(Math.cos(u)),cy:Y(Math.sin(u)),r:7,fill:c.c,stroke:c.surf,'stroke-width':2},G); });
  A.chips.push(['chord','B',vname(B)],['c','x',abs(B)>.999?Math.round(s1)+'°':Math.round(s1)+'° ، '+Math.round(s2)+'°']); }};
S.gA={v:[-.3,2*PI+.3,-4.4,4.4],title:'السعة: y = a sin x',hint:'السعة = (أكبر قيمة − أقل قيمة) ÷ 2',sl:{min:-4,max:4,v:4,lab:'a',fmt:v=>fr(v,1),step:.5},f:(x,p)=>p*Math.sin(x),a:0,b:2*PI,xfmt:v=>rname(v),sx:PI/2,
 draw(A){ A.chips.push(['f','السعة',fr(abs(A.p),1)],['int','الدورة','2π']); }};
S.gB={v:[-.3,2*PI+.3,-1.6,1.6],title:'الدورة: y = sin bx',hint:'الدورة = 2π ÷ b ، والتردد = 1 ÷ الدورة',sl:{min:1,max:4,v:2,lab:'b',fmt:v=>fr(v,1),step:1},f:(x,p)=>Math.sin(p*x),xfmt:v=>rname(v),sx:PI/2,
 draw(A){ const b=A.p, P=2*PI/b, c=A.col; A.el('path',{d:`M${A.X(0)} ${A.Y(1.35)}H${A.X(P)}`,stroke:c.int,'stroke-width':3},A.G); A.chips.push(['int','الدورة',b===1?'2π':b===2?'π':'2π/'+b],['f','السعة','1']); }};
S.gT={v:[-.3,2*PI+.3,-4,4],title:'y = tan x : الدورة π',hint:'ليس لها سعة',f:x=>Math.tan(x),brk:[PI/2,3*PI/2],asy:{v:[PI/2,3*PI/2]},xfmt:v=>rname(v),sx:PI/2};
['A','B','C','D','E','F','G'].forEach(k=>{ S['xs-'+k]={v:VU,eq:1,title:'تمارين',hint:'حلّ في دفترك ثم أظهر الحل',draw(A){ ucBase(A); }}; });
S['xs-F']={v:[-.3,2*PI+.3,-3.4,3.4],title:'الرسم',hint:'الدورة والتردد والسعة',f:x=>3*Math.sin(2*x),xfmt:v=>rname(v),sx:PI/2};
//@WX
