/* الخامس العلمي · الفصل الخامس · الغاية والاستمرارية */
const sq=Math.sqrt, PI=Math.PI, abs=Math.abs;
const fr=(v,d=2)=>{ if(!isFinite(v)) return '—'; let r=Math.round(v*10**d)/10**d; if(Math.abs(r)<1e-9) r=0; return (r<0?'−':'')+String(Math.abs(r)); };
const T=(A,x,y,s,col='ink2',o={})=>A.lab(x,y,s,{fill:A.col[col]||col,w:o.w??700,size:o.size||13,anchor:o.anchor,halo:1});
const S={};
/* neighbourhood of a number on the number line */
S.nbhd={title:'جوار العدد a',hint:'(a − ε , a + ε) جوار ، (a − ε , a] جوار أيسر ، [a , a + ε) جوار أيمن',sl:{min:.1,max:1.5,v:.5,lab:'ε',fmt:v=>fr(v,2),step:.05},
 draw(A){ const c=A.col, W=A.W, H=A.H, a=1, e=A.p, x0=-1, x1=3, X=x=>40+(x-x0)/(x1-x0)*(W-80), rows=[[H*.3,'جوار',a-e,a+e,'f',0,0],[H*.55,'جوار أيسر',a-e,a,'chord',0,1],[H*.8,'جوار أيمن',a,a+e,'tan',1,0]];
  rows.forEach(([y,l,u,v,col,cu,cv])=>{ A.el('path',{d:`M${X(x0)} ${y}H${X(x1)}`,stroke:c.axis,'stroke-width':1.5});
    for(let t=-1;t<=3;t+=.5) { A.el('path',{d:`M${X(t)} ${y-4}V${y+4}`,stroke:c.axis,'stroke-width':1}); if(Number.isInteger(t)) A.lab(X(t),y+16,String(t).replace('-','−'),{fill:c.muted,size:11}); }
    A.el('path',{d:`M${X(u)} ${y}H${X(v)}`,stroke:c[col],'stroke-width':6,'stroke-linecap':'round',opacity:.85});
    [[u,cu],[v,cv]].forEach(([x,cl])=>A.el('circle',{cx:X(x),cy:y,r:6,fill:cl?c[col]:c.surf,stroke:c[col],'stroke-width':2.4}));
    A.el('circle',{cx:X(a),cy:y,r:3,fill:c.c}); T(A,X(x1)-4,y-16,l,col,{anchor:'end',size:13}); });
  A.chips.push(['c','a','1'],['int','ε',fr(e,2)],['f','الجوار',`(${fr(a-e)} , ${fr(a+e)})`]); }};
/* one-sided limits: a jump at x = 3 */
S.lim={v:[0,6,0,7.5],title:'الاقتراب من 3 من اليسار ومن اليمين',hint:'من اليسار 4 ، ومن اليمين 5 : الغاية غير موجودة',sl:{min:.01,max:2,v:1.2,lab:'البعد عن 3',fmt:v=>fr(v,2),step:.01},
 curves:[{f:x=>x+1,dom:[0,3],w:3},{f:x=>x+2,dom:[3,6],w:3}],
 draw(A){ const h=A.p, c=A.col, G=A.G, X=A.X, Y=A.Y;
  [[3,4,'chord'],[3,5,'tan']].forEach(([x,y,col])=>A.el('circle',{cx:X(x),cy:Y(y),r:6,fill:c.surf,stroke:c[col],'stroke-width':2.4},G));
  const xl=3-h, xr=3+h; [[xl,xl+1,'chord'],[xr,xr+2,'tan']].forEach(([x,y,col])=>{ A.el('path',{d:`M${X(x)} ${Y(0)}V${Y(y)}H${X(0)}`,stroke:c[col],'stroke-width':1.3,'stroke-dasharray':'4 4',fill:'none'},G); A.el('circle',{cx:X(x),cy:Y(y),r:6.5,fill:c[col]},G); });
  A.chips.push(['chord','x → 3⁻',fr(xl,2)+' ↦ '+fr(xl+1,2)],['tan','x → 3⁺',fr(xr,2)+' ↦ '+fr(xr+2,2)]); }};
S.limx={v:[-.5,2.5,-.5,8],f:x=>(x**3-1)/(x-1),brk:[1],title:'(x³ − 1)/(x − 1) عند x = 1',hint:'التعويض يعطي 0/0 ، فنحلّل ونختصر',pts:[[1,3,'(1 , 3)','c',{open:1,dx:28}]],sl:{min:.01,max:1,v:.6,lab:'البعد عن 1',fmt:v=>fr(v,2),step:.01},
 draw(A){ const h=A.p, f=x=>x*x+x+1, c=A.col; [1-h,1+h].forEach(x=>A.el('circle',{cx:A.X(x),cy:A.Y(f(x)),r:6,fill:c.tan},A.G)); A.chips.push(['tan','f(1 − h)',fr(f(1-h),3)],['tan','f(1 + h)',fr(f(1+h),3)],['c','الغاية','3']); }};
S.trig5={v:[-3.6,3.6,-.4,1.3],f:x=>Math.sin(x)/x,brk:[0],title:'sin x / x قرب الصفر',hint:'كلما صغرت x اقتربت النسبة من 1',pts:[[0,1,'(0 , 1)','c',{open:1,dy:-16}]],sl:{min:.01,max:3,v:1.5,lab:'x',fmt:v=>fr(v,2),step:.01},
 draw(A){ const x=A.p, c=A.col, y=Math.sin(x)/x; A.el('circle',{cx:A.X(x),cy:A.Y(y),r:6.5,fill:c.tan},A.G); A.el('circle',{cx:A.X(-x),cy:A.Y(y),r:6.5,fill:c.tan},A.G);
  A.chips.push(['f','x',fr(x,3)],['tan','sin x / x',fr(y,4)]); }};
S['xs-A']={v:[-4,4,-2,7],title:'تمارين (5−1)',hint:'حلّ في دفترك ثم أظهر الحل'};
S['xs-B']={v:[-4,4,-2,7],title:'تمارين (5−2)',hint:'حلّ في دفترك ثم أظهر الحل'};
//@WX
