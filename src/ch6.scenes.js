/* الخامس العلمي · الفصل السادس · المشتقات */
const sq=Math.sqrt, PI=Math.PI, abs=Math.abs;
const fr=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
const T=(A,x,y,s,col='ink2',o={})=>A.lab(x,y,s,{fill:A.col[col]||col,w:o.w??700,size:o.size||13,anchor:o.anchor,halo:1});
const S={};
/* secant a-b turning into the tangent at a */
const q=x=>x*x+5*x+3;
S.sec={v:[-1,4.5,-2,32],f:q,d:x=>2*x+5,title:'القاطع يدور حتى يصبح مماساً',hint:'كلما صغرت Δx اقترب ميل القاطع من f′(2) = 9',sl:{min:.01,max:2.2,v:1.8,lab:'Δx',fmt:v=>fr(v,2),step:.01},
 draw(A){ const a=2, h=A.p, b=a+h, c=A.col, G=A.G, m=(q(b)-q(a))/h;
  A.line(a,q(a),m,c.chord,{w:2.4}); A.line(a,q(a),9,c.tan,{w:1.6,dash:'6 5',op:.7});
  A.el('path',{d:`M${A.X(a)} ${A.Y(q(a))}H${A.X(b)}V${A.Y(q(b))}`,stroke:c.chord,'stroke-width':1.4,'stroke-dasharray':'4 4',fill:'none'},G);
  [[a,'a','c'],[b,'b','chord']].forEach(([x,l,col])=>{ A.el('circle',{cx:A.X(x),cy:A.Y(q(x)),r:6.5,fill:c[col],stroke:c.surf,'stroke-width':2},G); T(A,A.X(x)-12,A.Y(q(x))-12,l,col); });
  T(A,(A.X(a)+A.X(b))/2,A.Y(q(a))+14,'Δx','chord',{size:12});
  A.chips.push(['chord','ميل القاطع',fr(m,3)],['tan','f′(2)','9']); A.ok=h<.05; if(A.ok) A.hint='✓ القاطع أصبح تقريباً مماساً: الميل ≈ 9'; }};
S.motion={v:[0,5,-5,90],title:'الإزاحة S = 3t² + 5t + 8',hint:'V = dS/dt = 6t + 5 ، والتعجيل = 6',f:t=>3*t*t+5*t+8,a:0,b:5,sl:{min:0,max:5,v:1.5,play:1,speed:.4,lab:'الزمن t',fmt:v=>fr(v,2)+' ثا',step:.01},axl:['t','S'],
 draw(A){ const t=A.p, s=3*t*t+5*t+8, v=6*t+5, c=A.col; A.line(t,s,v,c.tan,{w:2}); A.el('circle',{cx:A.X(t),cy:A.Y(s),r:7,fill:c.c,stroke:c.surf,'stroke-width':2},A.G);
  A.chips.push(['f','S',fr(s,2)],['tan','V',fr(v,2)],['int','التعجيل','6']); }};
S.diff={v:[0,6,-.6,3.6],eq:1,f:x=>abs(x-3),title:'f(x) = |x − 3| : حافة حادة',hint:'من اليمين الميل 1 ومن اليسار −1 : لا مماس وحيد',sl:{min:.05,max:2,v:1,lab:'Δx',fmt:v=>fr(v,2),step:.01},
 draw(A){ const h=A.p, c=A.col, G=A.G; A.line(3,0,1,c.tan,{w:2,op:.85}); A.line(3,0,-1,c.chord,{w:2,op:.85});
  [[3+h,'tan'],[3-h,'chord']].forEach(([x,col])=>A.el('circle',{cx:A.X(x),cy:A.Y(abs(x-3)),r:6,fill:c[col]},G)); A.el('circle',{cx:A.X(3),cy:A.Y(0),r:6.5,fill:c.c},G);
  A.chips.push(['tan','L₁ (يمين)','1'],['chord','L₂ (يسار)','−1']); }};
const cub=x=>x*x*x/3-x;
S.dl={v:[-2.6,2.6,-2.2,3.2],f:cub,d:x=>x*x-1,title:'ميل المماس يرسم f′',hint:'حرّك النقطة: نقطة f′ تتبع ميل المماس',curves:[{f:x=>x*x-1,col:'tan',w:2,dash:'6 5',op:.7,lab:[2.1,3,"f′"]}],sl:{min:-2.3,max:2.3,v:-1.6,play:1,speed:.35,lab:'x',fmt:v=>fr(v,2),step:.01},
 draw(A){ const x=A.p, c=A.col, m=x*x-1; A.line(x,cub(x),m,c.chord,{w:2}); A.el('circle',{cx:A.X(x),cy:A.Y(cub(x)),r:6.5,fill:c.c},A.G); A.el('circle',{cx:A.X(x),cy:A.Y(m),r:6.5,fill:c.tan},A.G);
  A.chips.push(['c','f(x)',fr(cub(x))],['tan','f′(x) = ميل المماس',fr(m)]); }};
S.rules={v:[-2.2,2.2,-1.5,4.5],f:x=>x*x,d:x=>2*x,tan:1,c:1,drag:1,a:-2.2,b:2.2,cl:'x',tl:'f′(x) = 2x',title:'f(x) = xⁿ ⇒ f′(x) = nxⁿ⁻¹',hint:'اسحب النقطة: ميل المماس لـ x² هو 2x'};
S.chain={title:'قاعدة السلسلة: ثلاثة تروس',hint:'dy/dx = dy/dn × dn/dx',sl:{min:0,max:6.28,v:0,play:1,speed:.6,lab:'دوران x',fmt:v=>fr(v,1)},
 draw(A){ const c=A.col, W=A.W, H=A.H, r=Math.min(W,H)*.13, cy=H*.5, cx=[W*.78,W*.5,W*.22], ratio=[1,4,24], cols=['f','tan','chord'], labs=['x','n = 4x + 3','y = 3n² + 5'];
  cx.forEach((x,i)=>{ const rr=r*(i===1?.8:1); A.el('circle',{cx:x,cy,r:rr,fill:'none',stroke:c[cols[i]],'stroke-width':3});
    const a=A.p*ratio[i]*(i%2?-1:1)*.25; for(let k=0;k<8;k++){ const t=a+k*PI/4; A.el('path',{d:`M${x+rr*.7*Math.cos(t)} ${cy+rr*.7*Math.sin(t)}L${x+rr*1.12*Math.cos(t)} ${cy+rr*1.12*Math.sin(t)}`,stroke:c[cols[i]],'stroke-width':4}); }
    A.el('path',{d:`M${x} ${cy}L${x+rr*.6*Math.cos(a)} ${cy+rr*.6*Math.sin(a)}`,stroke:c[cols[i]],'stroke-width':3}); T(A,x,cy+rr*1.5,labs[i],cols[i],{size:13}); });
  T(A,(cx[0]+cx[1])/2,cy-r*1.5,'dn/dx = 4','tan'); T(A,(cx[1]+cx[2])/2,cy-r*1.5,'dy/dn = 6n','chord');
  A.chips.push(['chord','dy/dx','6n × 4 = 24n']); }};
const p5=x=>(2*x-1)**5;
S.tan6={v:[-.6,2,-1.6,3],eq:1,f:p5,d:x=>10*(2*x-1)**4,title:'المماس والعمود عليه',hint:'ميل العمود = −1 ÷ ميل المماس',sl:{min:.15,max:1.2,v:1,lab:'x₁',fmt:v=>fr(v,2),step:.01},
 draw(A){ const x=A.p, y=p5(x), m=10*(2*x-1)**4, c=A.col; A.line(x,y,m,c.tan,{w:2.4}); if(abs(m)>1e-6) A.line(x,y,-1/m,c.int,{w:2.2,dash:'6 5'});
  A.el('circle',{cx:A.X(x),cy:A.Y(y),r:6.5,fill:c.c},A.G); A.chips.push(['c','(x₁ , y₁)',`(${fr(x)} , ${fr(y)})`],['tan','ميل المماس',fr(m)],['int','ميل العمود',abs(m)<1e-6?'—':fr(-1/m,3)]); }};
S.imp={v:[-7,7,-6,6],eq:1,title:'x² + y² = 25 : دالتان ضمنيتان',hint:'dy/dx = −x / y',curves:[{f:x=>sq(Math.max(0,25-x*x)),dom:[-5,5]},{f:x=>-sq(Math.max(0,25-x*x)),dom:[-5,5],col:'int'}],sl:{min:.2,max:6.1,v:2.21,lab:'موضع النقطة',fmt:v=>fr(v,2),step:.01},
 draw(A){ const t=A.p, x=5*Math.cos(t), y=5*Math.sin(t), c=A.col; if(abs(y)>.05) A.line(x,y,-x/y,c.tan,{w:2.4}); A.el('circle',{cx:A.X(x),cy:A.Y(y),r:6.5,fill:c.c},A.G);
  A.chips.push(['c','(x , y)',`(${fr(x)} , ${fr(y)})`],['tan','dy/dx = −x/y',abs(y)<.05?'غير معرفة':fr(-x/y,3)]); }};
S.trig={v:[-.3,2*PI+.3,-1.5,1.5],f:Math.sin,d:Math.cos,title:'ميل المماس لـ sin x يرسم cos x',hint:'d/dx (sin x) = cos x',curves:[{f:Math.cos,col:'tan',w:2,dash:'6 5',op:.75}],sl:{min:0,max:2*PI,v:.8,play:1,speed:.35,lab:'x',fmt:v=>fr(v,2),step:.01},sx:PI/2,xfmt:v=>{ const n=Math.round(v/(PI/2)); return abs(v-n*PI/2)<1e-6&&n>=0&&n<=4?['0','π/2','π','3π/2','2π'][n]:fr(v); },
 draw(A){ const x=A.p, c=A.col; A.line(x,Math.sin(x),Math.cos(x),c.chord,{w:2}); A.el('circle',{cx:A.X(x),cy:A.Y(Math.sin(x)),r:6.5,fill:c.c},A.G); A.el('circle',{cx:A.X(x),cy:A.Y(Math.cos(x)),r:6.5,fill:c.tan},A.G);
  A.chips.push(['c','sin x',fr(Math.sin(x),3)],['tan','الميل = cos x',fr(Math.cos(x),3)]); }};
['A','B','B2','C'].forEach(k=>{ S['xs-'+k]={v:[-4,4,-3,6],title:'تمارين',hint:'حلّ في دفترك ثم أظهر الحل'}; });
//@WX

/* motion: a car on a road below the graph moves with S(t); drag on the graph to move the time */
S.motion.v=[0,5,-48,110]; S.motion.slx=1; S.motion.anim=1;
{ const d0=S.motion.draw; S.motion.draw=function(A){ d0.call(this,A); const t=A.p, s=3*t*t+5*t+8, c=A.col, G=A.G, y0=A.Y(-14), y1=A.Y(-40), x0=A.X(0), x1=A.X(5), PX=v=>x0+v/98*(x1-x0);
  A.el('rect',{x:x0-6,y:y0,width:x1-x0+12,height:y1-y0,rx:6,fill:'#5b6270'},G); A.el('path',{d:`M${x0} ${(y0+y1)/2}H${x1}`,stroke:'#fff','stroke-width':2,'stroke-dasharray':'12 10',opacity:.7},G);
  A.el('path',{d:`M${PX(8)} ${y0-4}V${y1+4}`,stroke:c.int,'stroke-width':2},G);
  const cx=PX(s), cy=y1-4; A.el('path',{d:`M${cx-20} ${cy}h40v-10l-9 -9h-20l-7 9h-4z`,fill:c.chord,stroke:c.ink2,'stroke-width':1.3},G);
  [-11,11].forEach(k=>A.el('circle',{cx:cx+k,cy:cy+2,r:5.5,fill:'#222',stroke:'#888','stroke-width':2},G));
  T(A,PX(8),y0-10,'S(0) = 8','int',{size:11}); T(A,cx,y0-10,'S = '+fr(s,1)+' m','c',{size:11.5}); }; }
