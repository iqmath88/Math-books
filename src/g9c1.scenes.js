/* الثالث المتوسط · الفصل الأول · العلاقات والمتباينات في الأعداد الحقيقية */
const sq=Math.sqrt, abs=Math.abs;
const fr=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
const T=(A,x,y,s,col='ink2',o={})=>A.lab(x,y,s,{fill:A.col[col]||col,w:o.w??700,size:o.size||13,anchor:o.anchor,halo:1});
const S={};
/* every line of a simplification has the same value */
function valScene(o){ return {title:o.title,hint:'كل سطر في الحل يساوي القيمة نفسها',draw(A){ const c=A.col, W=A.W, H=A.H, v=o.vals[o.k], vs=o.vals.filter(isFinite);
  const lo=Math.min(...vs,0), hi=Math.max(...vs,0), pad=Math.max(1,(hi-lo)*.4), x0=lo-pad, x1=hi+pad, X=x=>30+(x-x0)/(x1-x0)*(W-60), y=H*.62;
  A.lab(W/2,H*.26,isFinite(v)?'≈ '+fr(v,3):'—',{fill:c.f,w:700,size:Math.min(48,W/9)});
  A.lab(W/2,H*.4,'قيمة السطر '+(o.k+1)+' من '+o.vals.length,{fill:c.muted,size:13});
  A.el('path',{d:`M20 ${y}H${W-20}`,stroke:c.axis,'stroke-width':1.6}); A.el('path',{d:`M${X(0)} ${y-6}V${y+6}`,stroke:c.axis,'stroke-width':1.6}); A.lab(X(0),y+18,'0',{fill:c.muted,size:11});
  o.vals.forEach((u,i)=>{ if(isFinite(u)) A.el('circle',{cx:X(u),cy:y-(i===o.k?0:0),r:i===o.k?8:4,fill:i===o.k?c.c:c.tan,opacity:i===o.k?1:.5}); });
  if(isFinite(v)) A.lab(X(v),y-20,fr(v,2),{fill:c.c,w:700,size:13,halo:1});
  A.chips.push(['f','القيمة',isFinite(v)?fr(v,4):'—']); }}; }
S.sets={title:'N ⊂ W ⊂ Z ⊂ Q ⊂ R',hint:'كل مجموعة داخل التي تليها',
 draw(A){ const c=A.col, W=A.W, H=A.H, L=[['R','الحقيقية','f'],['Q','النسبية','int'],['Z','الصحيحة','chord'],['W','الكلية','tan'],['N','الطبيعية','c']];
  L.forEach(([n,ar,col],i)=>{ const m=i*Math.min(W,H)*.075, x=20+m, y=20+m*.9, w=W-40-2*m, h=H-40-1.8*m; A.el('rect',{x,y,width:w,height:h,rx:22,fill:c[col],'fill-opacity':.07,stroke:c[col],'stroke-width':2.2});
    A.lab(x+16,y+18,n+'  '+ar,{fill:c[col],w:700,size:13,anchor:'start'}); });
  [['√2',.84,.88,'f'],['2/3',.75,.78,'int'],['−3',.68,.7,'chord'],['0',.6,.62,'tan'],['7',.5,.55,'c']].forEach(([t,x,y,col])=>A.lab(W*x,H*y,t,{fill:c[col],w:700,size:15})); }};
/* arrow diagram X → Y */
function arrows(A,X,Y,P,o={}){ const c=A.col, W=A.W, H=A.H, gx=W*.27, gy=W*.73, top=H*.12, h=H*.76, yX=i=>top+h*(i+.5)/X.length, yY=j=>top+h*(j+.5)/Y.length, bw=Math.min(W*.18,80);
  [[gx,X,yX,'X'],[gy,Y,yY,'Y']].forEach(([gxx,arr,yf,nm])=>{ A.el('ellipse',{cx:gxx,cy:top+h/2,rx:bw,ry:h/2+12,fill:c.surf2,stroke:c.line,'stroke-width':1.6}); A.lab(gxx,top-4,nm,{fill:c.ink2,w:700,size:14});
    arr.forEach((v,i)=>A.lab(gxx,yf(i),String(v),{fill:c.ink,w:700,size:15})); });
  const img=new Set(P.map(p=>p[1]));
  Y.forEach((v,j)=>{ if(!img.has(j)) A.el('circle',{cx:gy,cy:yY(j),r:13,fill:'none',stroke:c.muted,'stroke-dasharray':'3 3'}); });
  P.forEach(([i,j])=>{ const x1=gx+22, y1=yX(i), x2=gy-22, y2=yY(j), an=Math.atan2(y2-y1,x2-x1); A.el('path',{d:`M${x1} ${y1}L${x2} ${y2}`,stroke:c.f,'stroke-width':2.2});
    A.el('path',{d:`M${x2} ${y2}L${x2-10*Math.cos(an-.4)} ${y2-10*Math.sin(an-.4)}L${x2-10*Math.cos(an+.4)} ${y2-10*Math.sin(an+.4)}Z`,fill:c.f}); });
  if(o.rule) A.lab(W/2,H-12,o.rule,{fill:c.chord,w:700,size:13}); }
S.map={title:'التطبيق: لكل عنصر صورة واحدة',hint:'المدى {2 , 3 , 4} ⊂ المجال المقابل',draw(A){ arrows(A,[4,6,8],[2,3,4,5],[[0,0],[1,1],[2,2]],{rule:'y = ½x'}); A.chips.push(['f','المدى','{2 , 3 , 4}'],['chord','المجال المقابل','{2 , 3 , 4 , 5}']); }};
S.kind0={title:'شامل وغير متباين',hint:'المدى = المجال المقابل ، لكن 2 و 3 لهما الصورة نفسها',draw(A){ arrows(A,[1,2,3],[1,2],[[0,0],[1,1],[2,1]]); A.chips.push(['tan','شامل','✓'],['bad','متباين','✗']); }};
S.kind1={title:'متباين وغير شامل',hint:'كل عنصرين مختلفين لهما صورتان مختلفتان ، و 3 بلا أصل',draw(A){ arrows(A,[1,2],[1,2,3],[[0,0],[1,1]]); A.chips.push(['bad','شامل','✗'],['tan','متباين','✓']); }};
S.kind2={title:'تقابل',hint:'شامل ومتباين في آن واحد',draw(A){ arrows(A,[1,2,3],[1,2,3],[[0,1],[1,0],[2,2]]); A.chips.push(['tan','شامل','✓'],['tan','متباين','✓']); }};
S.comp={title:'(fog)(x) = f(g(x))',hint:'نطبّق g أولاً ثم f',sl:{min:0,max:5,v:3,step:1,lab:'x',fmt:v=>String(v)},
 draw(A){ const c=A.col, W=A.W, H=A.H, x=A.p, g=x*x, f=2*g+1, y=H*.45, xs=[W*.84,W*.5,W*.16];
  [[x,'x','ink2'],[g,'g(x) = x²','tan'],[f,'f(g(x)) = 2x² + 1','f']].forEach(([v,l,col],i)=>{ A.el('circle',{cx:xs[i],cy:y,r:Math.min(44,W*.09),fill:c[col],'fill-opacity':.12,stroke:c[col],'stroke-width':2.4}); A.lab(xs[i],y,String(v),{fill:c[col],w:700,size:20}); A.lab(xs[i],y+Math.min(44,W*.09)+20,l,{fill:c[col],w:700,size:12.5}); });
  [[0,1,'g'],[1,2,'f']].forEach(([a,b,l])=>{ const x1=xs[a]-50, x2=xs[b]+50; A.el('path',{d:`M${x1} ${y}L${x2} ${y}`,stroke:c.chord,'stroke-width':2.4}); A.el('path',{d:`M${x2} ${y}L${x2+10} ${y-6}L${x2+10} ${y+6}Z`,fill:c.chord}); A.lab((x1+x2)/2,y-14,l,{fill:c.chord,w:700,size:15}); });
  A.chips.push(['tan','(fog)('+x+')',String(f)],['f','(gof)('+x+')',String((2*x+1)**2)]); }};
S.tri={title:'هل تلتقي القطع الثلاث؟',hint:'A + B > C شرط تكوين المثلث',sl:{min:6,max:15,v:13,step:.5,lab:'الضلع C',fmt:v=>fr(v,1)},
 draw(A){ const c=A.col, W=A.W, H=A.H, a=10, b=8, C=A.p, sc=Math.min(W*.8/C,H*.75/Math.max(a,b)), ox=W/2-C*sc/2, oy=H*.82, ok=a+b>C&&a+C>b&&b+C>a;
  A.el('path',{d:`M${ox} ${oy}H${ox+C*sc}`,stroke:c.c,'stroke-width':4}); A.lab(ox+C*sc/2,oy+18,'C = '+fr(C,1),{fill:c.c,w:700,size:13});
  if(ok){ const x=(b*b-a*a+C*C)/(2*C), y=sq(Math.max(0,b*b-x*x)); A.el('path',{d:`M${ox} ${oy}L${ox+x*sc} ${oy-y*sc}L${ox+C*sc} ${oy}`,stroke:c.f,'stroke-width':4,fill:c.f,'fill-opacity':.08}); }
  else { A.el('path',{d:`M${ox} ${oy}l${b*sc*.95} ${-b*sc*.3}M${ox+C*sc} ${oy}l${-a*sc*.95} ${-a*sc*.3}`,stroke:c.f,'stroke-width':4}); A.lab(W/2,H*.15,'لا يلتقي الضلعان',{fill:c.bad,w:700,size:14}); }
  A.chips.push(['f','A , B','10 , 8'],[ok?'tan':'bad','A + B > C',ok?'✓':'✗'],['int','مدى C','2 < C < 18']); }};
['A1','A2','B1','B2','C1','C2','C3','D1','D2','D3','T1','T2'].forEach(k=>{ S['xs-'+k]={title:'تمارين',hint:'حلّ في دفترك ثم أظهر الحل',draw(A){ A.lab(A.W/2,A.H/2,'✎',{fill:A.col.muted,size:Math.min(A.W,A.H)*.3}); }}; });
//@G9
