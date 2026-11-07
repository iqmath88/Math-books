const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const pages=['ch3.html','ch4.html','ch5.html','ch6.html','g9c1.html','g9c5.html'];
assert.match(read('app-version.js'),/version: '1\.3\.0'/);
assert.match(read('sw.js'),/classroom\.js/);
assert.match(read('sw.js'),/classroom\.css/);
for(const name of pages){const page=read(name);assert.match(page,/href="classroom\.css"/);assert.match(page,/src="classroom\.js"/);assert.match(page,/id="bTeach"/);assert.match(page,/const SP/)}
for(const id of ['mbPen','mbErase','mbRed','mbBlue','mbClear','mbFocus','mbZoom','mbFull','mbHide'])assert.ok(read('classroom.js').includes(id));
assert.match(read('index.html'),/id="librarySearch"/);
assert.match(read('index.html'),/library-hero/);
console.log('PASS: six chapters, shared controls, library search, release metadata and precache');
