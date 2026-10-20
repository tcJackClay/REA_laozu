/* UIEquipAwakeBook and BagCompEditBehavior; local transaction replaces server ack. */
window.WanderAwakening=(()=>{
 const D=AWAKENING_DATA,T=TeacherRuntime;
 for(const item of window.AWAKENING_ITEMS_DATA?.items||[])if(!T.items.some(x=>x.id===item.id))T.items.push(item);
 const teacher=id=>D.Teacher.find(t=>t.iID===id);
 const level=(s,id)=>Math.max(0,Math.min(5,Number(s.run?.config.teacherAwakenLevels?.[id]??s.teacherAwakenLevels?.[id]??0)));
 const rows=(id,n)=>D.TeacherAwakening.filter(r=>r.iID===id&&r.iAwakenLevel<=n).sort((a,b)=>a.iAwakenLevel-b.iAwakenLevel);
 const effects=(id,n)=>rows(id,n).flatMap(r=>r.arrAwakenEffect.map(id=>D.TeacherAwakenEffect.find(e=>e.iID===id)).filter(Boolean));
 function pairs(s,id){const n=level(s,id),t=teacher(id),cfg=rows(id,n).at(-1);if(!T.carried(s).includes(id)||!n||!cfg||!t)return [];return s.inventory.filter(i=>i.id===cfg.iEquip&&!i.awakenLevel&&(!i.offer||i.x!==null)).flatMap(a=>s.inventory.filter(b=>b.uid!==a.uid&&b.id===t.iAwakeningEquip&&(!b.offer||b.x!==null)).map(b=>({teacherId:id,level:n,source:a.uid,material:b.uid})));}
 function slots(s){return T.carried(s).filter(id=>level(s,id)>0).flatMap(id=>{const t=teacher(id),equip=T.recipe(t.arrComposeID[0])?.arrProductID[0],owned=s.inventory.filter(i=>i.id===equip&&i.awakeTeacherId===id&&i.awakenLevel>0),matches=pairs(s,id);return Array.from({length:T.limit(s,id)},(_,i)=>({key:id+':'+i,teacherId:id,equip,material:t.iAwakeningEquip,level:level(s,id),awakened:i<owned.length,pair:i<owned.length?null:matches[i-owned.length]||null}));});}
 function plan(s,p){if(!p||s.run?.pending||s.run?.settled)return null;return pairs(s,p.teacherId).find(x=>x.source===p.source&&x.material===p.material)||null;}
 function start(s,p){const valid=plan(s,p);if(!valid)return false;s.run.pending={kind:'awaken',elapsed:0,duration:2.1,...valid};return true;}
 function finish(s,p,nextUid){const a=s.inventory.find(i=>i.uid===p.source),b=s.inventory.find(i=>i.uid===p.material);if(!a||!b||a===b||a.awakenLevel)return null;const valid=pairs(s,p.teacherId).find(x=>x.source===a.uid&&x.material===b.uid);if(!valid)return null;
  s.inventory=s.inventory.filter(i=>i!==b);a.awakenLevel=valid.level;a.awakeTeacherId=p.teacherId;
  const fx=effects(p.teacherId,a.awakenLevel);a.awakenSkillIds=fx.filter(e=>e.iType===2).at(-1)?.arrParam||[];
  const rewards=fx.filter(e=>e.iType===1).flatMap(e=>e.arrParam).map(id=>({uid:nextUid(),id,x:null,y:null,rotation:0}));s.inventory.push(...rewards);
  (s.run.awakenLog??=[]).push({source:a.uid,material:b.uid,teacherId:p.teacherId,level:a.awakenLevel,rewards:rewards.map(i=>i.uid)});return {item:a,rewards};
 }
 function stats(s,i,base){const item=[...GAME_DATA.items,...T.items].find(d=>d.id===i.id);let aura=0;for(const other of s.inventory.filter(x=>x.uid!==i.uid&&x.x!==null&&x.awakenLevel>0))for(const e of effects(other.awakeTeacherId,other.awakenLevel))if([4,5].includes(e.iType)&&e.arrParam[0]===item?.element)aura+=e.arrParam[1];const fx=effects(i.awakeTeacherId,i.awakenLevel||0),rates={};for(const e of fx.filter(e=>e.iType===3))for(let n=0;n<e.arrParam.length;n+=3){const [target,attr,value]=e.arrParam.slice(n,n+3);if(target===2)rates[attr]=(rates[attr]||0)+value;}return Object.fromEntries(Object.entries(base).map(([k,v])=>[k,Math.trunc(v*(1+((rates[Number(k)+3]||0)+([2001,2002,2003].includes(Number(k))?aura:0))/10000))]));}
 return {teacher,level,rows,effects,pairs,slots,plan,start,finish,stats};
})();
