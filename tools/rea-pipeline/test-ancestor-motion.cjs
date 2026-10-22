const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {loadImage}=require('C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const c={window:null};c.window=c;vm.createContext(c);
for(const f of ['ancestor-motion-data.js','ancestor-motion.js'])vm.runInContext(fs.readFileSync('outputs/laozu-web/'+f,'utf8'),c);
(async()=>{
 const actors=Object.values(c.ANCESTOR_MOTION_DATA.actors);assert.equal(actors.length,12);let staticCount=0;
 for(const m of actors){
  assert.equal(m.contextScale,.85);assert.equal(m.canvasReferencePixelsPerUnit,100);assert.equal(m.missingPaths.length,0);
  assert.match(m.mainSha256,/^[a-f0-9]{64}$/);assert.equal(typeof m.mainSource.path_id,'string');assert.equal(typeof m.atlasSource.path_id,'string');assert.equal(typeof m.skeletonDataRef.m_PathID,'string');
  const sheet=await loadImage('outputs/laozu-web/'+m.file);assert.equal(sheet.width,m.columns*m.frameWidth);assert.equal(sheet.height,m.rows*m.frameHeight);
  const g=c.AncestorMotion.geometry(m.creatureId);assert.ok(Object.values(g).every(Number.isFinite));
  assert.equal(c.AncestorMotion.frameAt(m.creatureId,0),0);assert.equal(c.AncestorMotion.frameAt(m.creatureId,m.duration*1000),0);
  if(m.duration===0){staticCount++;assert.equal(m.frames,1);assert.equal(c.AncestorMotion.frameAt(m.creatureId,Infinity),0);assert.equal(c.AncestorMotion.frameAt(m.creatureId,450),0);}
  else{assert.equal(m.frames,Math.ceil(m.duration*24));assert.ok(c.AncestorMotion.frameAt(m.creatureId,450)>0);assert.ok(c.AncestorMotion.frameAt(m.creatureId,-1)>=0);}
 }
 assert.equal(staticCount,3);assert.equal(new Set(actors.filter(m=>m.duration===0).map(m=>m.mainSha256)).size,1);
 console.log('12 source motion manifests, dimensions, origins and frame boundaries passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
