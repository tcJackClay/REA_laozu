/* Source IDs and activation gates; bounded, offline formulas (not server emulation). */
window.CombatEffects=(()=>{
 const D=COMBAT_EFFECTS_DATA, clamp=(x,min=0,max=1)=>Math.max(min,Math.min(max,x));
 const itemMap=new Map([...GAME_DATA.items,...(window.TeacherRuntime?.items||[])].map(x=>[x.id,x]));
 const items=()=>itemMap,groups=new Map();for(const a of Object.values(D.abilities)){if(!groups.has(a.iAbilityID))groups.set(a.iAbilityID,[]);groups.get(a.iAbilityID).push(a);}
 const equipped=s=>(s.inventory||[]).filter(x=>x.x!==null&&x.salePrice==null);
 const add=(out,id,v)=>{out[id]=(out[id]||0)+Number(v||0);};
 function resonance(s,a){return equipped(s).reduce((n,i)=>{const d=D.equipment[i.id];return n+(d&&(a.iTechnique?d.arrTechnique.includes(a.iTechnique):d.arrWeaponForm.includes(a.iWeaponForm))?d.iReson:0);},0);}
 function learned(s){return (s.run?.abilities||[]).map(id=>{const base=D.abilities[id];if(!base)return null;const value=resonance(s,base);return groups.get(base.iAbilityID).filter(a=>a.iReson<=value).sort((a,b)=>b.iLevel-a.iLevel)[0]||base;}).filter(Boolean);}
 function attributes(s,{equipment=true,teachers=true,advanced=true}={}){
  const out={...(s.run?.eventBonuses||{})},hero=s.disciples?.[s.selected||0];
  if(window.CollectionBonuses)for(const [k,v] of Object.entries(CollectionBonuses.attributes(s)))add(out,k,v);
  const rows=[...(hero?.traitIds||[]).map(id=>D.abilities[id]),...learned(s)];
  for(const a of rows)for(let i=0;i<(a?.arrEffect||[]).length;i+=2)add(out,a.arrEffect[i],a.arrEffect[i+1]);
  if(equipment)for(const i of equipped(s)){const d=items().get(i.id);if(d)for(const [k,v] of Object.entries(TeacherRuntime.equipStats(s,i,d)))if(+k>2003)add(out,k,v);}
  if(teachers)for(const [k,v] of Object.entries(TeacherRuntime.attributes(s)))add(out,k,v);
  if(equipment)for(const [k,v] of Object.entries(EquipmentPassives.statBonuses(s)))add(out,k,v);
  if(advanced&&window.DiscipleAdvanced)for(const [k,v] of Object.entries(DiscipleAdvanced.attrs(s,hero,s.inventory)))add(out,k,v);
  return out;
 }
 function basic(s,base,advanced=true){const a=attributes(s,{advanced});for(const [k,id] of [['atk',2001],['def',2002],['hp',2003]])base[k]=Math.max(k==='def'?0:1,Math.round((base[k]+(a[id]||0))*(1+(a[id+3]||0)/10000)*(1+(a[id+62]||0)/10000)));base.speed=Math.max(1,30+(s.run?.config?.points?.[3]||0)*2+(a[2008]||0));return base;}
 const supportedAbilities=new Set([4001,4005,4009,4025,4029,4033,4049,4053,4057,4073,4077,4081,4097,4145,4149,4153,4169,4173,4177,4181,4185,4189,4193,4197,4201,4237,42071,42081,42091,43071,45071,45081,47011,47021,48021]);
 for(const id of Object.keys(StatusChains.registry))supportedAbilities.add(+id);
 const family=a=>groups.get(a.iAbilityID)?.find(x=>x.iLevel===0)?.iID||a.iID;
 function active(s){return learned(s).filter(a=>a.iLevel>0&&supportedAbilities.has(family(a)));}
 const has=(s,id)=>active(s).some(a=>family(a)===id);
 function trace(b,kind,value,extra={}){const e={round:b.round,kind,value,...extra};(b.effectTrace??=[]).push(e);return e;}
 function attrs(s,b,side='player'){
  const a=side==='player'?attributes(s):{...(b.enemyAttributes||{})};window.DiscipleAdvanced?.combat(s,b,a,side);if(side==='enemy')return StatusChains.attrs(s,b,a,side);
  for(const [id,v] of Object.entries(b.equipmentBonuses||{}))add(a,id,v);
  const ids=new Set(active(s).map(family)),n=b.round||0,put=(k,v)=>add(a,k,v);
  if(ids.has(4001))put(n<=3?2009:2025,n<=3?3000:-2000);
  if(ids.has(4005))put(2027,3000);if(ids.has(4025))put(2017,Math.min(3000,n*500));
  if(ids.has(4029)){put(2045,(b.hitsTaken||0)*500);if(b.hurtRound===n)put(2017,1000);}
  if(ids.has(4049))put(2021,2500);if(ids.has(4057)){put(2021,b.playerShield>0?2000:1000);}
  if(ids.has(4073))put(2023,2500);if(ids.has(4097))put(2019,Math.min(3000,n*500));
  if(ids.has(4145)&&b.playerHp<b.playerMax*.8)put(2026,1500);
  if(ids.has(4149)&&b.belowHalf)put(2049,2000);if(ids.has(4153)&&b.belowEighty)put(2025,2000);
  if(ids.has(4177))put(2039,Math.min(5,n)*500);
  if(ids.has(4197)&&b.playerShield>0){put(2010,3000);put(2024,3000);}
  if(ids.has(4201))put(2026,b.playerShield>0?2000:1000);
  if(ids.has(42081))put(2026,Math.min(3000,Math.max(0,(b.hitsTaken||0)-n)*300));
  if(ids.has(45081))put(2070,Math.min(3000,n*500));
  if(b.revived)put(2025,-2000);if(b.petStunDamage)put(2033,b.petStunDamage*10000);
  return StatusChains.attrs(s,b,a,side);
 }
 function heal(s,b,n,side='player',reason='heal'){
  const a=attrs(s,b,side),other=attrs(s,b,side==='player'?'enemy':'player');
  const curse=side==='enemy'&&b.enemyBloodCurseUntil>=b.round?.2:0;
  const value=Math.min(b[side+'Max']-b[side+'Hp'],Math.max(0,Math.round(n*Math.max(0,1+((a[2045]||0)+(a[2121]||0)-(other[2046]||0))/10000-curse))));
  if(side==='player'&&value>0)b.gemHeals=(b.gemHeals||0)+1;b[side+'Hp']+=value;trace(b,reason,value,{side});return value;
 }
 function shield(s,b,n){const value=Math.max(0,Math.round(n*(1+(attrs(s,b)[2069]||0)/10000)));b.playerShield=(b.playerShield||0)+value;trace(b,'shield',value);return value;}
 function rage(s,b,n,side='player',raw=false){const a=attrs(s,b,side);let rate=1+(a[2072]||0)/10000;if(side==='enemy')rate-= (b.enemyRageReduction||0)+(b.petWeakenUntil>=b.round?(b.petRageWeakness||.3):0);const value=Math.max(0,n*(raw?1:Math.max(0,rate)));b[side+'Rage']=Math.min(Math.max(1,100+(a[2007]||0)),(b[side+'Rage']||0)+value);trace(b,'rage',value,{side});return value;}
 function readyRage(s,b,side='player'){return (b[side+'Rage']||0)>=Math.max(1,100+(attrs(s,b,side)[2007]||0));}
 function power(s,b,kind='atk'){
  const id=kind==='atk'?2004:2005;let rate=1+((attrs(s,b)[id]||0)-(attributes(s)[id]||0))/10000;if(kind==='atk'){if(has(s,4185))rate+=Math.min(.5,b.round*.05);if(has(s,4145)&&b.playerHp<b.playerMax*.8)rate+=.15;}
  if(kind==='def'){if(b.playerShield>0)rate+=b.petShieldDefense||0;if(has(s,4057))rate+=b.playerShield>0?.2:.1;if(has(s,43071))rate+=.2;}
  return Math.round(b[kind==='atk'?'playerAtk':'playerDef']*rate);
 }
 function deal(s,b,base,{outgoing=true,kind='normal',element=0,bulletId,noCrit=false,random=Math.random,ignoreDefense=true,secondary=false,trueDamage=false,attackMods={}}={}){
  const src=outgoing?'player':'enemy',dst=outgoing?'enemy':'player',a=attrs(s,b,src),d=attrs(s,b,dst),context=TeacherRuntime.attackContext({bulletId,element});element=context.element;for(const [id,v] of Object.entries(attackMods))add(a,id,v);
  const roll=n=>n>0&&random()<clamp(n/10000),dodge=!trueDamage&&roll((d[2017]||0)-(a[2018]||0));
  const criticalKey={normal:2011,equipment:2013,rage:2015}[kind];
  const critical=!trueDamage&&!noCrit&&!dodge&&roll((a[2009]||0)+(a[criticalKey]||0)-(d[2010]||0)-(d[criticalKey+1]||0));
  const damageKey={normal:2035,equipment:2037,rage:2039,pet:2079,counter:2029,combo:2031}[kind];
  const elementKey={1:2053,2:2055,3:2057,4:2059,5:2061,6:2051,7:2073,8:2075}[element];
  let factor=Math.max(0,1+((a[2025]||0)+(a[2041]||0)+(a[5005]||0)+(a[damageKey]||0)+(a[elementKey]||0)-(d[2026]||0)-(d[2042]||0)-(d[5006]||0)-(d[damageKey+1]||0)-(d[elementKey+1]||0))/10000);
  factor*=Math.max(0,1+((a[2066]||0)-(d[2067]||0))/10000);
  if(b[dst+'StunnedUntil']>=b.round)factor*=Math.max(0,1+((a[2033]||0)-(d[2034]||0))/10000);
  if(critical)factor*=Math.max(1,1.5+((a[2027]||0)-(d[2028]||0))/10000-(src==='enemy'&&b.petWeakenUntil>=b.round?.5:0));
  if(!ignoreDefense&&!trueDamage){const def=outgoing?(b.enemyDef||0)*Math.max(0,1+(d[2005]||0)/10000):power(s,b,'def'),armor=Math.max(0,def*(1-clamp(((a[2082]||0)-(d[2084]||0))/10000))-Math.max(0,(a[2081]||0)-(d[2083]||0)));base=Math.max(1,base-armor*.6);}
  const blockKey={normal:2089,equipment:2093,rage:2097,pet:2101}[kind],blocked=!trueDamage&&!dodge&&roll((d[2085]||0)+(d[blockKey]||0)-(a[2086]||0)-(a[blockKey+1]||0));
  if(blocked)factor*=1-clamp(.3+((d[2087]||0)+(d[blockKey+2]||0)-(a[2088]||0)-(a[blockKey+3]||0))/10000,0,.9);
  if(trueDamage)factor=1;if(!outgoing)base*=Math.max(0,1+(a[2004]||0)/10000);
  const raw=dodge?0:Math.max(1,Math.round(base*factor)),shieldRate=Math.max(.1,1+((a[2070]||0)-(d[2071]||0))/10000),absorbed=Math.min(raw,(b[dst+'Shield']||0)/shieldRate);
  b[dst+'Shield']=Math.max(0,(b[dst+'Shield']||0)-Math.round(absorbed*shieldRate));const damage=Math.min(b[dst+'Hp'],Math.max(0,Math.round(raw-absorbed)));b[dst+'Hp']-=damage;
  const hit={secondary,side:src,round:b.round,kind,base,damage,absorbed,critical,dodge,blocked,factor,element,bulletId,provenance:'source-attributes/local-formula'};(b.damageTrace??=[]).push(hit);
  if(outgoing&&damage>0){const rate=(a[2049]||0)+(roll((a[2047]||0)-(d[2048]||0))?1000:0)-(d[2050]||0);if(rate>0)heal(s,b,damage*rate/10000,'player','drain');if(kind!=='pet'&&roll((a[2019]||0)-(d[2020]||0))) {b.enemyStunnedUntil=b.round;trace(b,'stun',1);StatusChains.put(s,b,'stunMark',1,'enemy');}if(critical&&has(s,4009))rage(s,b,10);}
  if(!outgoing){if(dodge&&has(s,4033)){heal(s,b,b.playerAtk*.3,'player','dodge-heal');}if(damage>0){b.hitsTaken=(b.hitsTaken||0)+1;b.hurtRound=b.round;if(has(s,4181))heal(s,b,b.playerAtk*.15,'player','hit-heal');if(has(s,4173)&&random()<.3)rage(s,b,10);}}
  b.belowHalf ||= b.playerHp<b.playerMax*.5;b.belowEighty ||= b.playerHp<b.playerMax*.8;
  if(b.playerHp<=0&&has(s,4189)&&!b.revived){b.revived=true;heal(s,b,b.playerMax*.3,'player','revive');}
  StatusChains.hit(s,b,hit);return hit;
 }
 function castEquipment(s,b,uid,options={}){return EquipmentPassives.cast(s,b,uid,options);}
 function equipment(s,b,random=Math.random){for(const i of equipped(s)){castEquipment(s,b,i.uid,{random});if(b.enemyHp<=0)break;}}
 function refreshEquipment(s,b,random=Math.random){const pool=Object.entries(b.equipmentState||{}).filter(([uid,x])=>x.casts>0&&x.nextRound>b.round&&equipped(s).some(i=>String(i.uid)===uid));if(!pool.length)return null;const [uid,x]=pool[Math.floor(random()*pool.length)];x.nextRound=b.round;trace(b,'equipment-refresh',+uid,{itemId:x.id});return +uid;}
 function beginRound(s,b){
  if(b.effectsRound===b.round)return;b.effectsRound=b.round;
  if(b.round===1){b.playerRage=attributes(s)[3002]||0;b.playerShield=(b.playerShield||0)+(attributes(s)[3004]||0);}
  StatusChains.begin(s,b);EquipmentPassives.begin(s,b);
  if(has(s,4169)&&b.round<=3)rage(s,b,10);
  if(has(s,4193))shield(s,b,b.playerAtk*(b.round===1?2:.3));
  if(has(s,45071)&&b.round<=2)shield(s,b,b.playerDef*2);
  if(has(s,42071)&&b.round<=10){b.playerMax+=Math.round(b.playerMax*.02);}
  if(has(s,42091)){heal(s,b,b.playerMax*.02);deal(s,b,b.playerMax*.02,{kind:'skill'});}
 }
 function endRound(s,b){if(b.effectsEnd===b.round)return;b.effectsEnd=b.round;StatusChains.end(s,b);if(has(s,47021))heal(s,b,(b.playerMax-b.playerHp)*.05);if(has(s,48021)){b.playerHp=Math.max(1,b.playerHp-Math.floor(b.playerHp*.03));b.playerMax+=Math.round(b.playerMax*.02);}}
 function counter(s,b,random=Math.random){const a=attrs(s,b),d=attrs(s,b,'enemy');if(b.playerHp<=0||b.enemyHp<=0||random()>=clamp(((a[2021]||0)-(d[2022]||0))/10000))return null;let rate=1;if(b.petCounters>0&&b.petCounterExpires>=b.round){b.petCounters--;rate+=b.petCounterBonus||.6;trace(b,'pet-counter-bonus',rate-1);}const hit=deal(s,b,power(s,b)*rate,{kind:'counter',random});if(has(s,4053))heal(s,b,b.playerAtk*.3);return hit;}
 function bonus(s,n,id){return Math.max(0,Math.round(n*(1+(attributes(s)[id]||0)/10000)));}
 return {attributes,basic,learned,active,resonance,supportedAbilities,family,attrs,heal,shield,rage,readyRage,power,deal,castEquipment,equipment,refreshEquipment,beginRound,endRound,counter,bonus,trace,has};
})();
