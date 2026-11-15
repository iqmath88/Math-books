/* Generate the flat copy of the v2 book in the repo root (v2/a/b.ext → v2__a__b.ext), rewriting relative links.
   v2/ stays the only place to edit; run after every build:  node tools/flatten.cjs [--check]
   --check: exit 1 if any flat file is missing or out of date (used by release.test.cjs). */
const fs=require('fs'), path=require('path');
const root=path.join(__dirname,'..'), V2=path.join(root,'v2'), CHECK=process.argv.includes('--check');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const SKIP=/\.(md|txt)$|(^|\/)\.|\/lib\/katex\/fonts\/.*\.(woff|ttf)$/;   /* the flat site ships woff2 only */
const flatName=rel=>'v2__'+rel.split(path.sep).join('__');
/* rewrite a reference written relative to the file's folder inside v2 */
function mapRef(ref,dir){ if(/^(?:[a-z]+:|#|\/|data:)/i.test(ref)) return ref;
  const [p,q='']=ref.split(/(?=[?#])/); const abs=path.normalize(path.join(dir,p));
  if(abs.startsWith('..'+path.sep)) return abs.slice(3).split(path.sep).join('/')+q;      /* ../x → x (repo root) */
  return flatName(abs)+q; }
function convert(rel,buf){ const ext=path.extname(rel), dir=path.dirname(rel);
  if(!/\.(html|css|js|json)$/.test(ext)) return buf;
  let s=buf.toString('utf8');
  if(ext==='.html') s=s.replace(/((?:src|href)=")([^"]+)(")/g,(m,a,r,b)=>a+mapRef(r,dir)+b);
  if(ext==='.css') s=s.replace(/url\(([^)'"]+)\)/g,(m,r)=>'url('+mapRef(r,dir)+')');
  if(ext==='.js'&&dir==='.'){
    s=s.replace(/(['"`])\.\.\/(index\.html|update\.js)\1/g,'$1$2$1')
       .replace(/new URL\('tags\.json'/g,"new URL('v2__tags.json'")
       .replace(/"classic": "\.\.\/([^"]+)"/g,'"classic": "$1"'); }
  return Buffer.from(s,'utf8'); }
let bad=0, n=0;
for(const f of walk(V2)){ const rel=path.relative(V2,f); if(SKIP.test('/'+rel.split(path.sep).join('/'))) continue;
  const out=path.join(root,flatName(rel)), data=convert(rel,fs.readFileSync(f)); n++;
  const same=fs.existsSync(out)&&fs.readFileSync(out).equals(data);
  if(CHECK){ if(!same){ bad++; console.log('out of date:',path.basename(out)); } } else if(!same) fs.writeFileSync(out,data); }
console.log(CHECK?(bad?`FAIL ${bad} flat files out of date (run node tools/flatten.cjs)`:`PASS flat copy in sync (${n} files)`):`wrote flat copy (${n} files)`);
if(CHECK&&bad) process.exit(1);
