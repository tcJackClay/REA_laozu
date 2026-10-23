const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {create}=require('../../outputs/laozu-web/poke/model.js');
const context={};vm.runInNewContext(fs.readFileSync('outputs/laozu-web/poke/catalog.js','utf8'),context);
const D=JSON.parse(JSON.stringify(context.POKE_CATALOG));let checks=0;const labels=[];
function ck(label,fn){fn();checks++;labels.push(label);console.log('PASS',label)}
function pack(M){for(const item of [...M.s.run.pending]){let placed=false;for(let y=0;y<5&&!placed;y++)for(let x=0;x<5&&!placed;x++)if(M.fits(item,x,y)){M.place(item.uid,x,y);placed=true;}assert.ok(placed);}}
for(const [roll,id] of [[0,1],[.4,4],[.9,7]]){
 const M=create(D,null,()=>roll);
 ck('first free '+id,()=>{M.draw();assert.equal(M.s.points,0);assert.equal(M.s.run.mon.speciesId,id);assert.equal(M.s.firstFree,false);assert.throws(()=>M.draw());});
 M.reveal();
 ck('rotation and placement '+id,()=>{const item=M.s.run.items[0];M.rotate(item.uid);assert.deepEqual(M.size(item),[1,2]);assert.throws(()=>M.place(item.uid,6,5));M.rotate(item.uid);M.place(item.uid,0,0);});
 M.startBattle();
 ck('real damage and victory '+id,()=>{M.tick(60000);assert.equal(M.s.run.phase,'reward');assert.equal(M.s.points,2);assert.equal(M.s.defeats,1);assert.ok(M.s.run.battle.events.some(x=>x.actor==='player'&&x.amount>0));assert.throws(()=>M.startBattle());});
 ck('reward blocks continue '+id,()=>{assert.throws(()=>M.completeReward());assert.throws(()=>M.place(M.s.run.pending[0].uid,0,0));assert.throws(()=>M.place(M.s.run.pending[0].uid,-1,0));});
 const restored=create(D,JSON.parse(JSON.stringify(M.s)),()=>roll);
 ck('refresh idempotence '+id,()=>{restored.tick(60000);assert.equal(restored.s.points,2);assert.equal(restored.s.defeats,1);});
 pack(restored);restored.forward();
 ck('new move participates '+id,()=>{restored.tick(60000);assert.equal(restored.s.run.phase,'reward');assert.equal(restored.s.points,4);assert.ok(new Set(restored.s.run.battle.events.filter(x=>x.actor==='player').map(x=>x.move)).size>=2);});
 pack(restored);restored.forward();
 ck('collection and next paid draw '+id,()=>{const mon=restored.settle();assert.equal(mon.speciesId,id);assert.equal(restored.s.collection.length,1);assert.equal(restored.s.points,4);assert.throws(()=>restored.settle());restored.draw();assert.equal(restored.s.points,1);assert.equal(restored.s.run.id,2);assert.equal(restored.s.collection.length,1);assert.equal(restored.s.run.items.length,1);});
}
ck('failure and rescue cannot double-credit',()=>{const M=create(D,null,()=>0);M.draw();M.reveal();M.startBattle();M.s.run.hp=1;M.s.run.battle.enemyAt=1;M.tick(50);assert.equal(M.s.run.phase,'settlement');assert.equal(M.s.run.outcome,'rescued');M.settle();assert.equal(M.s.collection[0].outcome,'rescued');M.rescue();assert.equal(M.s.points,3);assert.throws(()=>M.rescue());M.draw();assert.equal(M.s.points,0);assert.throws(()=>M.rescue());});
ck('held band changes actual damage',()=>{const M=create(D,null,()=>.4);M.draw();M.reveal();const a=M.damage('ember',19);M.s.run.items.push({kind:'held',key:'exp-share',x:2,y:2,w:2,h:1,uid:'band'});assert.ok(M.damage('ember',19)>a);});
ck('berry heals once each battle',()=>{const M=create(D,null,()=>.4);M.draw();M.reveal();M.s.run.items.push({kind:'held',key:'oran-berry',x:2,y:2,w:1,h:1,uid:'berry'});M.startBattle();M.s.run.hp=30;M.tick(50);assert.equal(M.s.run.hp,55);M.s.run.hp=30;M.tick(50);assert.equal(M.s.run.hp,30);assert.equal(M.s.run.battle.events.filter(x=>x.actor==='heal').length,1);});
ck('withdraw last move prevents battle',()=>{const M=create(D,null,()=>0);M.draw();M.reveal();M.withdraw(M.s.run.items[0].uid);assert.throws(()=>M.startBattle());});
ck('5x5 bounds and old save repack',()=>{const M=create(D,null,()=>0);M.draw();M.reveal();const i=M.s.run.items[0];assert.equal(M.fits(i,4,0),false);assert.equal(M.fits(i,0,5),false);delete M.s.run.boardSize;i.x=5;i.y=5;const N=create(D,JSON.parse(JSON.stringify(M.s)));assert.equal(N.s.run.items.length,1);assert.ok(N.fits(N.s.run.items[0],N.s.run.items[0].x,N.s.run.items[0].y));assert.equal(N.s.points,0);});
ck('forward discards unclaimed rewards and advances',()=>{const M=create(D,null,()=>0);M.draw();M.reveal();M.forward();M.tick(60000);M.forward();assert.equal(M.s.run.phase,'battle');assert.equal(M.s.run.pending.length,0);assert.equal(M.s.points,2);});
console.log(JSON.stringify({checks,species:D.POKEDEX.length,moves:Object.keys(D.MOVES).length}));
fs.mkdirSync('work/poke-verification',{recursive:true});fs.writeFileSync('work/poke-verification/model-checks.json',JSON.stringify({checks,labels,species:D.POKEDEX.length,moves:Object.keys(D.MOVES).length},null,2));
