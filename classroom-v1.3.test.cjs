const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const pages=['ch3.html','ch4.html','ch5.html','ch6.html','g9c1.html','g9c5.html'];
assert.match(read('app-version.js'),/version: '1\.3\.0'/);
assert.match(read('sw.js'),/classroom-enhancements\.js/);
for(const page of pages){const text=read(page);assert.equal(text.split('classroom-enhancements.js').length-1,1,page);assert.match(text,/id="bTeach"/);assert.match(text,/id="tExit"/);}
for(const id of ['mbPresent','mbUndo','mbMask','mbReset'])assert.ok(read('classroom-enhancements.js').includes(id));
assert.match(read('classroom.js'),/mb-undo-stroke/);
console.log('v1.3.0 classroom checks passed for all six chapters');
