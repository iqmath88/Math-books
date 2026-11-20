/* Runs chapter scenes in Node with a mock drawing surface (no browser). Used by tests/scenes-math.test.cjs */
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.join(__dirname,'..');
function loadBook(id){ const win={}; const ctx={window:win,console,Math,JSON,Object,Array,Number,String,isFinite,isNaN,parseFloat,parseInt,Infinity,NaN,Set,Map,Symbol,Error,RegExp,Date};
  ctx.document={createElementNS:()=>node(),createElement:()=>node()}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(ROOT,'v2',id+'.js'),'utf8'),ctx,{filename:id+'.js'}); return win.BOOK; }
function node(){ const n={children:[],setAttribute(){},appendChild(c){ this.children.push(c); return c; },append(){},style:{},textContent:'',classList:{add(){},remove(){}},getTotalLength:()=>100,getPointAtLength:()=>({x:0,y:0}),getBBox:()=>({x:0,y:0,width:10,height:10})}; return n; }
const colProxy=new Proxy({},{get:(t,k)=>typeof k==='string'?'#123456':undefined});
/* same view maths as the engine (pad 0): X/Y linear, plus inverses */
function makeA(sc,{p,q,m,W=600,H=600,B}={}){ const chips=[], legend=[], els=[], labs=[]; let hint=sc.hint||'', ok=false;
  const el=(tag,attrs,parent)=>{ const n=node(); n.tag=tag; n.attrs=attrs||{}; els.push(n); return n; };
  const lab=(x,y,s,o)=>{ labs.push({x,y,s:String(s)}); return node(); };
  const A={W,H,el,lab,col:colProxy,p,t:0,svg:node(),fmt:v=>String(v),subplot:(r,v)=>subplot(r,v),chips,legend,els,labs,
    set hint(v){ hint=v; },get hint(){ return hint; },set ok(v){ ok=!!v; },get ok(){ return ok; },G:node()};
  if(sc.drag2){ A.q=q||{x:sc.drag2.x,y:sc.drag2.y}; } if(sc.modes){ A.m=m??sc.modes.v??0; }
  if(sc.v){ const [x0,x1,y0,y1]=sc.v, V={x0,x1,y0,y1,pad:{l:0,r:0,t:0,b:0}};
    const X=x=>(x-x0)/(x1-x0)*W, Y=y=>(y1-y)/(y1-y0)*H; Object.assign(A,{X,Y,V,W2X:px=>x0+px/W*(x1-x0),X_inv:px=>x0+px/W*(x1-x0),Y_inv:py=>y1-py/H*(y1-y0),ya:0});
    /* the engine's function helpers: f, d1, d2 (numerical when no derivative is given), path, line */
    const fo=sc.f?{f:sc.f,d:sc.d,d2:sc.d2}:(B&&B.F&&B.F[sc.fn])||null, nd=(g,x,P)=>(g(x+1e-5,P)-g(x-1e-5,P))/2e-5;
    if(fo){ const f=x=>fo.f(x,p), d1=x=>fo.d?fo.d(x,p):nd(fo.f,x,p), d2=x=>fo.d2?fo.d2(x,p):nd((u)=>d1(u),x,p); Object.assign(A,{f,d1,d2,a:sc.a??x0,b:sc.b??x1}); }
    A.path=(fn,a,b,n=420)=>{ let d='',pen=false; for(let i=0;i<=n;i++){ const x=a+(b-a)*i/n, y=fn(x); if(!isFinite(y)){ pen=false; continue; } d+=(pen?'L':'M')+X(x).toFixed(1)+' '+Y(y).toFixed(1); pen=true; } return d; };
    A.line=(xa,ya,s,c,o)=>el('path',{d:`M${X(xa-1)} ${Y(ya-s)}L${X(xa+1)} ${Y(ya+s)}`}); }
  function subplot(r,v){ const [rx,ry,rw,rh]=r, [a0,a1,b0,b1]=v, X=x=>rx+(x-a0)/(a1-a0)*rw, Y=y=>ry+(b1-y)/(b1-b0)*rh;
    const api={X,Y,axes(){ return api; },curve(f,c,a=a0,b=a1){ let d=''; for(let i=0;i<=60;i++){ const x=a+(b-a)*i/60, y=f(x); if(isFinite(y)) d+=(d?'L':'M')+X(x).toFixed(1)+' '+Y(y).toFixed(1); } el('path',{d}); return api; },
      pt(x,y,c,l){ el('circle',{cx:X(x),cy:Y(y),r:5}); if(l) lab(X(x),Y(y),l); return api; },seg(xa,ya,xb,yb){ el('path',{d:`M${X(xa)} ${Y(ya)}L${X(xb)} ${Y(yb)}`}); return api; }}; return api; }
  return A; }
/* value of a chip as a number ('−3.31' → -3.31; '(a , b)' → [a,b]) */
function num(s){ s=String(s).replace(/−/g,'-').replace(/\s+/g,' ').trim(); const m=s.match(/-?\d+(\.\d+)?/g); if(!m) return NaN; return m.length===1?+m[0]:m.map(Number); }
function run(sc,opt){ const A=makeA(sc,opt||{}); sc.draw(A); const ch={}; A.chips.forEach(([c,l,v])=>{ ch[l]=v; }); return {A,chips:ch,hint:A.hint,ok:A.ok}; }
module.exports={loadBook,makeA,run,num};
