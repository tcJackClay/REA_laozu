/* Original Pet -> BattleSkill -> BattleBullet identity; offline combat execution. */
window.PetBattle=(()=>{
 const D=PET_BATTLE_DATA;
 function selected(state){const r=state.run,owned=(state.pets||[]).find(p=>p.uid===r?.config.petUid),id=owned?.id||r?.config.petId,row=D.pets[id];if(!row)return null;const level=owned?.level||1;let stage=0;for(const n of row.pet.arrBreakLevel)if(level>=n)stage++;return {id:+id,pet:row.pet,skill:row.skills[Math.min(stage,row.skills.length-1)]};}
 function due(skill,round){const d=skill.szDesc;if(d.includes('前2回合'))return round<=2;const once=d.match(/第(\d+)回合/);if(once)return round===+once[1];if(d.includes('首回合'))return round===1;return (round-1)%(skill.iCoolDown+1)===0;}
 function apply(state,b,random=Math.random){const p=selected(state);if(!p||b.playerHp<=0||b.enemyHp<=0||b.petRound===b.round)return [];b.petRound=b.round;if(!due(p.skill,b.round))return [];const family=Math.floor(p.skill.iSkillID/1000),tier=Math.min(2,p.pet.iQuality-2),gold=tier===2,cast=(b.petCasts||0);b.petCasts=cast+1;const out=[];const record=(kind,value,extra={})=>{const e={side:'pet',petId:p.id,skillId:p.skill.iSkillID,round:b.round,kind,value,...extra};out.push(e);(b.petTrace??=[]).push(e);};
 const heal=n=>{if(window.CombatEffects){record('heal',CombatEffects.heal(state,b,n));return;}const value=Math.min(b.playerMax-b.playerHp,Math.max(0,Math.round(n)));b.playerHp+=value;record('heal',value);};
 const shield=n=>{if(window.CombatEffects){record('shield',CombatEffects.shield(state,b,n));return;}const value=Math.max(0,Math.round(n));b.playerShield=(b.playerShield||0)+value;record('shield',value);};
 const hit=(n,bulletId=p.skill.arrSkillBulletList[0])=>{if(window.CombatEffects){const hit=CombatEffects.deal(state,b,n,{kind:'pet',bulletId,noCrit:p.skill.szDesc.includes('无法暴击'),random});record('damage',hit.damage,{bulletId,damage:hit.damage,shielded:hit.absorbed});return;}const hit=TeacherRuntime.damage(state,Math.max(0,Math.round(n)),{outgoing:true,...TeacherRuntime.attackContext({bulletId})});const shielded=Math.min(b.enemyShield||0,hit.damage);b.enemyShield=Math.max(0,(b.enemyShield||0)-shielded);const damage=Math.min(b.enemyHp,Math.max(0,hit.damage-shielded));b.enemyHp-=damage;record('damage',damage,{bulletId,damage,shielded});(b.damageTrace??=[]).push({...hit,side:'pet',round:b.round,petId:p.id,skillId:p.skill.iSkillID,bulletId,damage});};
 const atk=window.CombatEffects?CombatEffects.power(state,b):b.playerAtk,def=window.CombatEffects?CombatEffects.power(state,b,'def'):b.playerDef,hp=b.playerMax;const gainRage=n=>{if(window.CombatEffects)CombatEffects.rage(state,b,n);else b.playerRage=(b.playerRage||0)+n;record('rage',n);};const rate=arr=>arr[tier];
 if([282,283].includes(family)){const cost=Math.floor(b.playerHp*(family===282?.05:gold?.05:.1));b.playerHp=Math.max(1,b.playerHp-cost);record('sacrifice',cost);b.selfSacrifices=(b.selfSacrifices||0)+1;if(window.CombatEffects&&CombatEffects.has(state,47011)&&b.selfSacrifices%3===0)CombatEffects.rage(state,b,20,'player',true);}
 switch(family){
 case 211:case 241:hit(atk*rate([3,4,4]));if(gold&&family===211)gainRage(20);if(gold&&family===241)hit(Math.min(b.enemyMax*.04,hp*.12));break;
 case 212:hit(Math.min(b.enemyHp*rate([.06,.08,.08]),b.playerHp*rate([.24,.32,.32])));if(gold&&b.playerHp>hp/2)hit(atk);break;
 case 213:hit(atk*rate([1,1.2,1.2])*(gold&&b.enemyHp>b.enemyMax/2?1.4:1));break;
 case 221:hit(atk*rate([1,1.2,1.2]));if(gold)hit(hp*.01);break;
 case 222:heal(atk*rate([1,1.2,1.2])*(gold?1+Math.min(.5,cast*.1):1));break;
 case 223:heal((hp-b.playerHp)*rate([.04,.05,.04]));if(gold)hit(b.playerHp*.04);break;
 case 231:hit(atk*rate([1,1.2,1.2]));if(gold){b.petCounters=Math.min(6,3+cast);b.petCounterExpires=b.round;b.petCounterBonus=.6;record("counter-buff",b.petCounters);}break;
 case 232:hit(atk*rate([4,5,5]));if(gold)hit(def*3);break;
 case 233:shield(atk*rate([1,1.2,1.2]));if(gold)b.petShieldDefense=.2;break;
 case 242:hit(atk*rate([1,1.2,1.2]));if(gold){b.petWeakenUntil=b.round;b.petRageWeakness=.3;record('rage-critical-weaken',1);}break;
 case 243:hit(atk*rate([2,2.5,2.5]));if(gold)gainRage(15);break;
 case 251:hit(atk*rate([2,2.5,2.5]));if(gold){b.petStunDamage=Math.min(.3,(cast+1)*.1);record('stun-damage-buff',b.petStunDamage);}break;
 case 252:if(gold){const n=Math.floor((b.enemyShield||0)*Math.min(1,.2+cast*.1));b.enemyShield=(b.enemyShield||0)-n;record('break-shield',n);}hit(atk*rate([1,1.2,1.2]));break;
 case 253:heal(atk*rate([.8,1,1])*(gold?1+Math.min(1,cast*.2):1));shield(atk*rate([.4,.5,1]));break;
 case 261:hit(atk*rate([1.8,2.1,2.1]));if(gold&&random()<.3){b.enemyDisarmedUntil=b.round;record('disarm',1);}break;
 case 262:shield(atk*rate([1.5,1.8,1])*(gold?1+Math.min(1.5,cast*.5):1));break;
 case 263:hit(atk*rate([4,5,5])*(gold&&b.enemyHp/b.enemyMax<b.playerHp/hp?1.3:1));break;
 case 264:for(let i=0;i<Math.min(3,1+cast);i++)hit(atk);break;
 case 281:{const count=gold?3+Math.floor(random()*3):2;for(let i=0;i<count;i++){hit(atk*rate([1.5,2,1]));if(gold)hit(Math.min(b.enemyHp*.01,b.playerHp*.04));}break;}
 case 282:hit(atk*rate([1.5,1.8,2]));hit(atk*rate([1.5,1.8,2]));b.enemyBloodCurseUntil=b.round+1;record('blood-curse',2);break;
 case 283:hit(atk*rate([1.2,1.5,1.5]));if(gold&&random()<.4){const uid=window.CombatEffects?CombatEffects.refreshEquipment(state,b,random):null;if(uid!=null)record('refresh-equipment',uid);}break;
 case 291:shield(atk*rate([1.5,1.8,1.8]));if(gold)b.enemyRageReduction=Math.min(.5,(cast+1)*.1);break;
 case 292:heal(def*rate([4,5,5])*(gold&&b.playerHp<hp/2?1.5:1));break;
 case 293:hit(hp*rate([.04,.05,.05]));if(gold)for(let i=0;i<Math.min(5,cast+1);i++)hit(atk*.1);break;
 default:throw Error('Unmapped pet skill '+p.skill.iSkillID);
 }
 return out;
 }
 function absorb(b,damage){const n=Math.min(b.playerShield||0,damage);b.playerShield=Math.max(0,(b.playerShield||0)-n);return {absorbed:n,damage:damage-n};}
 return {selected,due,apply,absorb};
})();
