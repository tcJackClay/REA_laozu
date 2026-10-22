/* Offline adapter: local map distribution, rewards and recovery cadence are approximate.
 * Client targeting/damage rules remain MiningRules; no server-equivalence claim. */
window.createMiningModel=function(B){
 const S=B.state,interval=600000,rewards={3:[1,100],4:[2,1],5:[21,50],6:[104,1],7:[103,1],8:[6,20],9:[40001,1],10:[1000,1]};
 const defs=()=>FAIRYLAND_DATA.CaveGrid;
 function row(depth){return Array.from({length:6},(_,x)=>{const types=defs().filter(c=>c.iUnlockDepth<=depth),c=types[(depth*7+x*3+Math.floor(depth/5))%types.length];return {type:c.iType,durability:c.iDurability,available:false};});}
 function data(){const s=S();for(const d of s.disciples)if(!d.rosterId)d.rosterId=crypto.randomUUID();if(!s.miningV34){s.miningV34={version:1,team:[null,null,null,null,null],depth:0,board:MiningRules.reveal(Array.from({length:8},(_,i)=>row(i)).flat(),0),revision:0,log:[],recoveryAt:Date.now()+interval};B.add(102,MiningRules.pickaxeLimit(1));B.save();}return s.miningV34;}
 function eligible(){return S().disciples.filter((d,i)=>d.isWanderFinish!==false&&!(S().run&&i===S().selected));}
 function gate(){if(!B.gate(25))throw Error(B.lockText(25));if(!B.gate(28))throw Error(B.lockText(28));}
 function recover(){const d=data(),now=Date.now(),cap=MiningRules.pickaxeLimit(S().discipleRooms?.[3]?.level||1);if(now<d.recoveryAt)return;if(!d.team[0]||!eligible().some(x=>x.rosterId===d.team[0])){d.recoveryAt=now+interval;B.save();return;}const count=Math.floor((now-d.recoveryAt)/interval)+1,amount=Math.max(0,Math.min(count,cap-B.balance(102)));if(amount)B.add(102,amount);d.recoveryAt+=count*interval;B.save();}
 function setMember(pos,id){gate();const d=data();if(!MiningRules.seatOpen(pos,S().sect))throw Error('席位尚未解锁');if(id!==null&&!eligible().some(x=>x.rosterId===id))throw Error('该弟子无法派遣');recover();if(pos===0&&!d.team[0]&&id)d.recoveryAt=Date.now()+interval;d.team=d.team.map(x=>x===id?null:x);d.team[pos]=id;B.save();}
 function mine(tool,index,revision){gate();recover();const d=data();if(revision!==d.revision)throw Error('矿图已更新');const captain=eligible().find(x=>x.rosterId===d.team[0]);const plan=MiningRules.plan({board:d.board,depth:d.depth,team:[captain?1:0],tool,index,balance:B.balance});const gained={};for(const c of plan.destroyed){const r=rewards[c.type];if(r)gained[r[0]]=(gained[r[0]]||0)+r[1];}B.add(plan.cost.id,-1);for(const [id,n] of Object.entries(gained))B.add(+id,n);d.board=MiningRules.reveal(plan.board,0);d.revision++;
  // Local scroll rule: clear the first row, shift exactly one row; source supplies this via server.
  if(d.board.slice(0,6).every(c=>c.type===0)){d.depth++;d.board=d.board.slice(6).concat(row(d.depth+7));d.board=MiningRules.reveal(d.board,0);}
  const result={revision:d.revision,tool,index,depth:d.depth,items:Object.entries(gained).map(([id,n])=>({id:+id,n}))};d.log.unshift(result);d.log=d.log.slice(0,50);B.save();return result;
 }
 return {data,eligible,setMember,mine,recover};
};
