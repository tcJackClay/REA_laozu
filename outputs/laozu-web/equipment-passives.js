/* Source iProvideSkill / cooldown / descriptions. Adjacency uses rotated occupied cells. */
window.EquipmentPassives=(()=>{
 const D=COMBAT_EFFECTS_DATA,E=()=>CombatEffects,S=()=>StatusChains;
 const carried=s=>(s.inventory||[]).filter(i=>i.x!=null&&i.salePrice==null);
 let definitionMap;const defs=()=>definitionMap??=new Map([...GAME_DATA.items,...(window.TeacherRuntime?.items||[])].map(d=>[d.id,d]));
 const text=id=>(D.equipmentSkills[D.equipment[id]?.iProvideSkill]?.szDesc||'').replace(/<[^>]*>/g,'');
 function cells(i){let shape=defs().get(i.id)?.shape||[[0,0]];for(let r=0;r<((i.rotation||0)%4);r++){shape=shape.map(([x,y])=>[-y,x]);const min=Math.min(...shape.map(p=>p[0]));shape=shape.map(([x,y])=>[x-min,y]);}return shape.map(([x,y])=>[x+i.x,y+i.y]);}
 function adjacent(i,j){return cells(i).some(([x,y])=>cells(j).some(([a,b])=>Math.abs(x-a)+Math.abs(y-b)===1));}
 function neighbors(s,i){return carried(s).filter(j=>j.uid!==i.uid&&D.equipment[j.id]?.arrTechnique.some(x=>D.equipment[i.id]?.arrTechnique.includes(x))&&adjacent(i,j));}
 const percent=(t,re,fallback=0)=>+(t.match(re)?.[1]||fallback)/100;
 function modifiers(s,i){const t=text(i.id),n=neighbors(s,i).length,out={damage:0,heal:0,shield:0,crit:0,drain:0,atk:0,hp:0,def:0};const tail=t.includes('相邻每件')?t.split('相邻每件')[1]:'';
  for(const [k,re] of Object.entries({damage:/伤害(?:加成)?[+提增加升]+(\d+(?:\.\d+)?)%/,heal:/治疗效果[+提升]+(\d+(?:\.\d+)?)%/,shield:/护盾值\+(\d+(?:\.\d+)?)%/,crit:/暴击伤害\+(\d+(?:\.\d+)?)%/,drain:/(\d+(?:\.\d+)?)%汲取率|汲取率\+(\d+(?:\.\d+)?)%/,atk:/攻击力(?:属性)?[+提升]+(\d+(?:\.\d+)?)%/,hp:/生命值[+提升]+(\d+(?:\.\d+)?)%/,def:/防御(?:力)?\+(\d+(?:\.\d+)?)%/}))out[k]=(k==='drain'?+(tail.match(re)?.[1]||tail.match(re)?.[2]||0)/100:percent(tail,re))*n;
  for(const j of neighbors(s,i)){const desc=text(j.id);if(!desc.startsWith('使相邻'))continue;out.damage+=percent(desc,/伤害[+提升增加]+(\d+(?:\.\d+)?)%/);out.hp+=percent(desc,/生命值提升(\d+(?:\.\d+)?)%/);out.def+=percent(desc,/防御\+(\d+(?:\.\d+)?)%/);}
  return out;
 }
 function statBonuses(s){const out={2001:0,2002:0,2003:0};for(const i of carried(s)){const d=defs().get(i.id);if(!d)continue;const m=modifiers(s,i),stats=TeacherRuntime.equipStats(s,i,d);for(const [key,id] of [['atk',2001],['def',2002],['hp',2003]])out[id]+=(stats[id]||0)*m[key];}return out;}
 function begin(s,b){if(b.passiveRound===b.round)return;b.passiveRound=b.round;b.equipmentBonuses={};for(const i of carried(s)){const t=text(i.id),keys={'忽视闪避':2018,'忽视击晕':2020,'普攻减伤':2036,'暴击减伤':2028,'忽视反击':2022};for(const [name,id] of Object.entries(keys)){const m=t.match(new RegExp('提高自身([\\d.]+)%'+name+'（最多([\\d.]+)%'));if(m)b.equipmentBonuses[id]=Math.min(+m[2]*100,(b.equipmentBonuses[id]||0)+ +m[1]*100);}
   if(t.includes('第3次行动前移除')&&b.round<3)b.equipmentBonuses[2026]=Math.min(6000,(b.equipmentBonuses[2026]||0)+percent(t,/减伤\+(\d+)%/)*10000);
  }
  for(const x of Object.values(b.equipmentTimed||{}))if(x.until>=b.round)for(const [id,v] of Object.entries(x.attrs))b.equipmentBonuses[id]=(b.equipmentBonuses[id]||0)+v;
 }
 function cast(s,b,uid,{replay=false,random=Math.random}={}){
  const i=carried(s).find(x=>String(x.uid)===String(uid));if(!i)return false;const source=D.equipment[i.id],skill=D.equipmentSkills[source?.iProvideSkill];if(!skill)return false;
  b.equipmentState??={};const slot=b.equipmentState[uid]??={id:i.id,casts:0,nextRound:Math.max(1,1+skill.iCoolDownFirst)};
  if(replay){if(slot.lastRound!==b.round||slot.replayRound===b.round)return false;slot.replayRound=b.round;}else if(slot.nextRound>b.round)return false;
  slot.casts++;slot.lastRound=b.round;if(!replay)slot.nextRound=b.round+Math.max(1,skill.iCoolDown+1);
  const t=text(i.id),body=t.split('相邻每件')[0],m=modifiers(s,i),atk=E().power(s,b),element=source.arrTechnique[0]||0;
  // Parse only explicit application clauses, never mentions inside threshold/tooltips.
  const names=S().names,randomOptions=Object.entries(names).filter(([key,name])=>new RegExp('层【'+name+'】').test(body)),randomKey=body.includes('随机')&&randomOptions.length?randomOptions[Math.min(randomOptions.length-1,Math.floor(random()*randomOptions.length))][0]:null;for(const [key,name] of Object.entries(names)){const re=new RegExp('(\\d+)层【'+name+'】','g');const found=[...body.matchAll(re)];if(!found.length)continue;let n=+found[0][1];if(body.includes('后续每回合')&&slot.casts>1)n=+found.at(-1)[1];if(randomKey&&randomKey!==key)continue;const preceding=body.slice(Math.max(0,found[0].index-18),found[0].index),prob=preceding.match(/(\d+)%概率[^，。；]*$/);if(prob&&random()>=+prob[1]/100)continue;
   const side=S().negative.has(key)?'enemy':'player';S().put(s,b,key,n,side,side==='enemy'?3:null);
  }
  if(body.includes('冰盾'))E().shield(s,b,atk*.5*(1+m.shield));
  if(body.includes('血祭')||body.includes('消耗')){b.playerHp=Math.max(1,b.playerHp*(1-percent(body,/消耗(\d+)%/,3)));b.selfSacrifices=(b.selfSacrifices||0)+1;if(E().has(s,47011)&&[8,12,16].includes(b.selfSacrifices))E().rage(s,b,50,'player',true);}
  if(body.includes('倾轧')&&random()<percent(body,/(\d+)%概率触发/,100)){S().dispatch('crush',s,b);E().deal(s,b,atk*.3,{kind:'equipment',element:5});}
  const healing=percent(body,/恢复(\d+(?:\.\d+)?)%攻击力/),maxheal=percent(body,/恢复(\d+(?:\.\d+)?)%最大生命值/);if(healing||maxheal)E().heal(s,b,(atk*healing+b.playerMax*maxheal)*(1+m.heal));
  const shield=percent(body,/(\d+(?:\.\d+)?)%攻击力的护盾/ )||percent(body,/攻击力(\d+(?:\.\d+)?)%的护盾/);if(shield)E().shield(s,b,atk*shield*(1+m.shield));
  const rage=body.match(/增加(\d+)点怒气/);if(rage)E().rage(s,b,+rage[1]);
  const attack=percent(body,/(?:攻击力\+|提升自身)(\d+(?:\.\d+)?)%/);if(attack){b.equipmentTimed??={};b.equipmentTimed[uid]={until:b.round+ +(body.match(/持续(\d+)回合/)?.[1]||1)-1,attrs:{2004:attack*10000}};b.passiveRound=null;begin(s,b);}
  const bullets=(skill.arrSkillBulletList||[]).filter(id=>{const x=D.bullets[id];return x&&x.iDamageType>0&&x.iDamageType<98;});
  const emit=body.match(/(?:释放|召唤)(\d+|两)(?:道|个|次|把|条)/),count=emit?(emit[1]==='两'?2:+emit[1]):bullets.length?1:0;
  let casts=count;if(body.includes('下次释放的道数+1'))casts=Math.min(3,count+slot.casts-1);const additional=body.match(/(\d+)%概率额外释放(\d+)道/);if(additional&&random()<+additional[1]/100)casts+=+additional[2];
  const direct=percent(body,/造成(?:攻击力)?(\d+(?:\.\d+)?)%(?:攻击力)?/);let sum=0;
  for(let n=0;n<Math.min(10,casts|| (direct?1:0));n++){if(b.enemyHp<=0)break;const hit=E().deal(s,b,atk*(direct||.3)*(1+m.damage),{kind:'equipment',element,bulletId:bullets[n%bullets.length],attackMods:{2027:m.crit*10000},random});sum+=hit.damage;}
  const drain=percent(body,/(?:汲取率\+|伤害)(\d+(?:\.\d+)?)%/);if(sum&&(m.drain||body.includes('汲取')))E().heal(s,b,sum*(m.drain+drain));
  E().trace(b,'equipment-cast',uid,{itemId:i.id,sourceSkill:source.iProvideSkill,replay,modifiers:m});b.equipmentCasts=(b.equipmentCasts||0)+1;if(E().has(s,4237)&&b.equipmentCasts%8===0)E().refreshEquipment(s,b,random);return true;
 }
 return {cast,begin,modifiers,statBonuses,adjacent,text};
})();
