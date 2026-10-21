const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:null,console,Math,TeacherRuntime:{damage:(_,n)=>({damage:n}),attackContext:x=>x}};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['wander-data','wander-events-data','wander-events','event-library-data','event-library','pet-battle-data','pet-battle'])vm.runInContext(fs.readFileSync(`outputs/laozu-web/${f}.js`,'utf8'),ctx);
let events=0,options=0;
for(const [id,e] of Object.entries(ctx.EventLibrary.data.events)){
 const tasks=ctx.EventLibrary.expand(id,'测试弟子');assert.ok(Array.isArray(tasks),id);events++;
 if([4,18].includes(e.iEventType))for(const option of ctx.WanderEvents.options({sourceId:id},999999,'测试弟子')){assert.ok(option.label);assert.ok(ctx.EventLibrary.action(e['arrAction'+option.id]).type);options++;}
 for(const a of ctx.EventLibrary.actions(e))assert.ok([0,1,2,3,4,5,6,7,8,9].includes(a[0]),`Unknown action ${a}`);
}
const state=id=>({run:{config:{petId:id}},pets:[]});
const battle=()=>({round:1,playerHp:500,playerMax:1000,playerAtk:100,playerDef:20,enemyHp:10000,enemyMax:10000,enemyShield:500,damageTrace:[]});
for(const id of Object.keys(ctx.PET_BATTLE_DATA.pets)){const b=battle();for(let i=1;i<=5;i++){b.round=i;ctx.PetBattle.apply(state(+id),b,()=>.1);}assert.ok(b.petTrace?.length,`pet ${id} never acts`);assert.ok([b.playerHp,b.enemyHp,b.playerShield||0].every(Number.isFinite));const n=b.petTrace.length;ctx.PetBattle.apply(state(+id),b);assert.equal(b.petTrace.length,n,'same round replay');}
let b=battle();b.enemyShield=0;ctx.PetBattle.apply(state(42101),b);assert.equal(b.enemyHp,9700);b.round=2;ctx.PetBattle.apply(state(42101),b);assert.equal(b.enemyHp,9700);
b=battle();ctx.PetBattle.apply(state(42202),b);assert.equal(b.playerHp,600);b.round=2;b.playerHp=990;ctx.PetBattle.apply(state(42202),b);assert.equal(b.playerHp,1000);
b=battle();ctx.PetBattle.apply(state(42303),b);assert.equal(b.playerShield,100);assert.deepEqual(JSON.parse(JSON.stringify(ctx.PetBattle.absorb(b,70))),{absorbed:70,damage:0});assert.equal(b.playerShield,30);
b=battle();ctx.PetBattle.apply(state(42302),b);assert.equal(b.petTrace,undefined);b.round=3;ctx.PetBattle.apply(state(42302),b);assert.ok(b.petTrace.some(e=>e.kind==='damage'));
b=battle();ctx.PetBattle.apply(state(42703),b);assert.equal(b.playerHp,450);
b=battle();ctx.PetBattle.apply(state(42802),b);assert.equal(b.playerHp,580);
const summary={eventsExpanded:events,choiceOptions:options,petsExecuted:Object.keys(ctx.PET_BATTLE_DATA.pets).length,excluded:Object.keys(ctx.EventLibrary.data.excluded).length,checks:'pet schedules, real HP/shields, sacrifice, no round replay; static expansion != natural playthrough'};
fs.writeFileSync('work/rea-pipeline/verification/event-library-model.json',JSON.stringify(summary,null,2));console.log(summary);
