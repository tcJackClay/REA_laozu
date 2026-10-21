const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:null,console,Math:Object.create(Math)};c.Math.random=()=>0;c.window=c;vm.createContext(c);
for(const f of ['game-data','wander-data','teacher-data','teacher-runtime-data','battle-damage-types','teacher-runtime','combat-effects-data','status-chains','equipment-passives','combat-effects'])vm.runInContext(fs.readFileSync(`outputs/laozu-web/${f}.js`,'utf8'),c);
const E=c.CombatEffects,S=c.StatusChains,P=c.EquipmentPassives,D=c.COMBAT_EFFECTS_DATA,checks=[],ck=(name,v)=>{assert.ok(v,name);checks.push(name);};
const state=()=>({selected:0,disciples:[{traitIds:[]}],run:{config:{teachers:[],points:[0,0,0,0]},abilities:[],eventBonuses:{}},inventory:[]});
const battle=()=>({round:1,playerAtk:100,playerDef:40,playerSpeed:80,enemySpeed:30,playerMax:100000,playerHp:40000,enemyMax:1e9,enemyHp:4e8,enemyAtk:100,enemyDef:100,enemyRage:100,playerRage:0,damageTrace:[]});
function qualify(s,id){s.run.abilities=[id];const a=D.abilities[id],d=Object.values(D.equipment).sort((a,b)=>b.iReson-a.iReson).find(x=>x.iReson>0&&(a.iTechnique?x.arrTechnique.includes(a.iTechnique):x.arrWeaponForm.includes(a.iWeaponForm)));assert.ok(d,'source equipment for '+id);s.inventory=Array.from({length:Math.ceil(100/d.iReson)},(_,i)=>({id:d.iID,uid:i+1,x:i,y:0,rotation:0}));assert.ok(E.has(s,id),'source gate '+id);}
const actual=(s,b)=>JSON.stringify({hp:b.playerHp,enemy:b.enemyHp,max:b.playerMax,shield:b.playerShield,rage:b.playerRage,enemyRage:b.enemyRage,attrs:E.attrs(s,b),enemyAttrs:E.attrs(s,b,'enemy'),power:E.power(s,b),statuses:b.statuses,equipment:b.equipmentState});
function scenario(id,on){const s=state(),b=battle();qualify(s,id);if(!on)s.run.abilities=[];
 for(const [key,n,side] of [['hunt',1],['armor',9],['poison',4,'enemy'],['venom',2,'enemy'],['cold',3,'enemy'],['burn',3,'enemy'],['blessing',40],['stunMark',2,'enemy'],['thunder',40],['electric',2,'enemy'],['sword',5],['hammer',10],['soul',6],['strong',19],['thunderGod',1],['ghost',9],['body',40],['golden',50],['blood',2],['weak',2],['heat',3,'enemy']])S.put(s,b,key,n,side);
 if(id===48041)S.clear(b,'golden');if(id===48071)S.clear(b,'blood');if(id===41071)S.clear(b,'strong');if(id===47071)S.clear(b,'ghost');for(const round of [1,2,3]){b.round=round;E.beginRound(s,b);S.put(s,b,'armor');S.put(s,b,'strong');S.put(s,b,'ghost');S.put(s,b,'sacrifice');S.put(s,b,'stunMark',1,'enemy');S.dispatch('crush',s,b);
  for(let n=0;n<21;n++)for(const el of [1,2,3,4,5,6,7])E.deal(s,b,10,{kind:n%2?'rage':'normal',element:el,random:()=>0});
  // Critical threshold uses real crit hits, not direct handler calls.
  s.run.eventBonuses[2009]=10000;for(let n=0;n<10;n++)E.deal(s,b,10,{random:()=>0});
  E.equipment(s,b,()=>0);E.endRound(s,b);
 }
 return actual(s,b);
}
for(const id of Object.keys(S.registry).map(Number)){let a=scenario(id,true),b=scenario(id,false);ck('ability '+id+' changes combat output after source activation',a!==b);}
ck('exact remaining 62 handlers',Object.keys(S.registry).length===62);
let s=state(),b=battle();qualify(s,46071);b.round=1;E.beginRound(s,b);ck('thunder god not granted at 5 will',!S.count(b,'thunderGod'));for(let r=2;r<=11;r++){b.round=r;E.beginRound(s,b);}ck('source 50 will transition',S.count(b,'will')===50&&S.count(b,'thunderGod')===1);
s=state();b=battle();qualify(s,48081);S.put(s,b,'heat',3,'enemy');E.beginRound(s,b);ck('steal does not trigger before round 3',!S.count(b,'heat'));b.round=3;E.beginRound(s,b);ck('steal removes enemy and grants player buff',S.count(b,'heat')===1&&S.count(b,'heat','enemy')===2);let saved=actual(s,b);E.beginRound(s,b);ck('same round reload does not steal twice',actual(s,b)===saved);
s=state();b=battle();qualify(s,48091);S.put(s,b,'blood',2);const hp=b.playerHp;E.deal(s,b,10,{random:()=>.99});ck('blood heal not on normal attack',b.playerHp===hp);E.deal(s,b,10,{kind:'rage',random:()=>.99});ck('blood heal on rage attack',b.playerHp>hp);
s=state();b=battle();S.put(s,b,'poison',3,'enemy',2);let enemy=b.enemyHp;E.beginRound(s,b);ck('poison ticks at round start',b.enemyHp<enemy);enemy=b.enemyHp;E.endRound(s,b);ck('poison not double ticked at end',b.enemyHp===enemy);b.round=3;E.beginRound(s,b);ck('expired poison no damage',b.enemyHp===enemy&&!S.count(b,'poison','enemy'));
s=state();b=battle();s.inventory=[{id:140401,uid:1,x:0,y:0,rotation:0}];E.equipment(s,b,()=>0);ck('source iProvideSkill fire heat instead of wrong rage skill',S.count(b,'heat')===6&&!b.playerRage);ck('source first round cooldown',b.equipmentState[1].nextRound===1001);saved=actual(s,b);E.equipment(s,b,()=>0);ck('used first round equipment cannot recast without refresh',saved===actual(s,b));
s.inventory=[{id:140201,uid:2,x:0,y:0,rotation:0}];b=battle();E.equipment(s,b,()=>0);ck('wood equipment creates actual poison',S.count(b,'poison','enemy')===2);enemy=b.enemyHp;b.round=2;E.beginRound(s,b);ck('equipment poison damages on later round',b.enemyHp<enemy);
s.inventory=[{id:140101,uid:3,x:0,y:0,rotation:0},{id:140102,uid:4,x:1,y:0,rotation:0}];ck('source adjacency boosts matching element',P.modifiers(s,s.inventory[1]).damage>0);s.inventory[0].x=6;ck('moving gear removes adjacency bonus',P.modifiers(s,s.inventory[1]).damage===0);
s=state();b=battle();qualify(s,4213);E.deal(s,b,100,{random:()=>.99});ck('secondary true damage cannot recursively proc',b.damageTrace.length===2&&b.damageTrace[1].secondary&&b.damageTrace[1].kind==='true');
// All source combat equipment can be cast, persisted, and resumed without nonfinite stats.
let count=0;for(const d of Object.values(D.equipment).filter(d=>D.equipmentSkills[d.iProvideSkill])){s=state();s.inventory=[{id:d.iID,uid:1,x:0,y:0,rotation:0}];b=battle();for(let r=1;r<=4;r++){b.round=r;E.beginRound(s,b);E.equipment(s,b,()=>0);E.endRound(s,b);}assert.ok(Number.isFinite(b.playerHp)&&Number.isFinite(b.enemyHp),'finite equipment '+d.iID);assert.ok(b.equipmentState[1].casts>0,'cast source item '+d.iID);count++;}
ck('source equipment runtime sweep '+count,count>250);
const report={passed:true,count:checks.length,checks,equipmentSourceRows:count};fs.mkdirSync('work/rea-pipeline/verification/status-chains',{recursive:true});fs.writeFileSync('work/rea-pipeline/verification/status-chains/model.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
