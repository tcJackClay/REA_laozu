/* Source gates: RoleTeacherPart.OnVote, TeacherData.IsCanContinueCompose,
 * BagEquipUtility.GetComposeMaterials. Damage scaling below is an explicit
 * local simulation adapter; the APK client does not contain the server formula. */
window.TeacherRuntime=(()=>{
 const D=window.TEACHER_DATA, R=window.TEACHER_RUNTIME_DATA;
 const teacher=id=>D.teachers.find(t=>t.iID===id),recipe=id=>D.recipes.find(r=>r.iFormID===id);
 const carried=s=>[...new Set(s.run?.config.teachers||[])].filter(id=>id>0&&teacher(id));
 const star=(s,id)=>Math.max(0,s.run?.config.teacherStars?.[id]??s.teacherStars?.[id]??0);
 function limit(s,id){const a=teacher(id).arrStarAffect2;let n=1;for(let i=0;i<a.length-1;i++)if(star(s,id)>=a[i])n+=a[i+1];return n;}
 function owner(s,r){return carried(s).find(id=>teacher(id).arrComposeID.includes(r.iFormID)&&s.inventory.filter(i=>i.id===recipe(teacher(id).arrComposeID[0])?.arrProductID[0]).length<limit(s,id));}
 function allowed(s,r){return !!r&&(!r.bExternal||!!owner(s,r));}
 const materials=r=>[0,1,2,3,4].map(i=>r['iMaterial'+i]).filter(x=>x>0);
 function candidates(s,a,b){if(a===b||!s.inventory.includes(a)||!s.inventory.includes(b))return [];return D.recipes.filter(r=>materials(r).length===2&&allowed(s,r)&&((r.iMaterial0===a.id&&r.iMaterial1===b.id)||(r.iMaterial1===a.id&&r.iMaterial0===b.id)));}
 function plan(s,id,uids){const r=recipe(id);if(!allowed(s,r))return {error:'未携带对应长老，或红装持有数量已达上限'};const pool=uids?uids.map(uid=>s.inventory.find(i=>i.uid===uid&&i.salePrice==null)):s.inventory.filter(i=>!i.offer),used=[];
  for(const id of materials(r)){const i=pool.find(i=>i&&i.id===id&&!used.includes(i));if(!i)return {error:'合成材料不足'};used.push(i);}
  if(uids&&(new Set(uids).size!==uids.length||used.length!==uids.length))return {error:'材料实例不匹配'};
  return {recipe:r,materials:used,teacherId:r.bExternal?owner(s,r):0};
 }
 function product(r,random=Math.random){const weights=r.arrProductProb;if(weights.length!==r.arrProductID.length||!weights.some(x=>x>0))return null;let n=random()*weights.reduce((a,b)=>a+Math.max(0,b),0);for(let i=0;i<weights.length;i++){n-=Math.max(0,weights[i]);if(n<0)return r.arrProductID[i];}return r.arrProductID.at(-1);}
 function equipStats(s,inst,data){let rate=0;if(inst.teacherId){const t=teacher(inst.teacherId);if(t){const a=t.arrStarAffect1;for(let i=0;i<a.length-1;i+=2){if(star(s,t.iID)<a[i])break;rate=a[i+1];}}}const base=Object.fromEntries(Object.entries(data.stats).map(([k,v])=>[k,Math.trunc(v*(1+rate/10000))]));return window.WanderAwakening?WanderAwakening.stats(s,inst,base):base;}
 function attributes(s){const out={};for(const id of carried(s)){const t=teacher(id);for(const a of [t.arrSecondAttribute1,t.arrSecondAttribute2])if(a.length>1)out[a[0]]=(out[a[0]]||0)+a[Math.min(star(s,id)+1,a.length-1)];}return out;}
 // Apply only to the attack's element, not to the defender's affiliation.
 // Unknown attack elements remain neutral. No guessed PVE correction is applied.
 const increases={1:2053,2:2055,3:2057,4:2059,5:2061,6:2051,7:2073,8:2075};
 // EnBulletDamageType differs from iTechnique. BSBulletHitAct resolves the
 // individual bullet's cfg_BattleBullet.iDamageType, never the main seed.
 const damageElements={3:6,4:1,5:2,6:3,7:4,8:5,9:7,10:8};
 function attackContext({bulletId,damageType,element}={}){
  const fromBullet=window.BATTLE_DAMAGE_TYPES?.bullets[bulletId];
  const type=fromBullet??damageType;
  if(type!==undefined&&type!==null)return {element:damageElements[type]||0,damageType:type,elementSource:fromBullet!==undefined?'cfg_BattleBullet.iDamageType':'explicit-damage-type'};
  return {element:Object.hasOwn(increases,element)?Number(element):0,damageType:null,elementSource:Object.hasOwn(increases,element)?'explicit-attack-element':'unknown'};
 }
 // Preserve raw PVE fields for comparison. Their addition/order is not proved
 // by client loading code or by one battle with multiple concurrent buffs.
 function audit(s){return {formulaVerified:false,stacking:'unverified',pveApplication:'unverified',rounding:'unverified',teachers:carried(s).map(id=>{const t=teacher(id),level=star(s,id),read=a=>a?.length>1?{attributeId:a[0],value:a[Math.min(level+1,a.length-1)]}:null;return {id,star:level,display:[read(t.arrSecondAttribute1),read(t.arrSecondAttribute2)],pveRaw:[read(t.arrSecondAttribute1PVE),read(t.arrSecondAttribute2PVE)]};})};}
 function damage(s,base,{outgoing,element=0,kind='normal'}={}){const attrs=attributes(s),key=increases[element],value=outgoing?(attrs[key]||0):(attrs[key+1]||0),equipmentReduction=!outgoing&&kind==='equipment'?(attrs[2038]||0):0,factor=Math.max(0,1+(outgoing?value:-value-equipmentReduction)/10000);return {base,damage:Math.max(1,Math.round(base*factor)),factor,element,attributeId:outgoing?key:key+1,value,equipmentReduction,provenance:'source-values/local-damage-adapter'};}
 function catalogue(s){return carried(s).flatMap(id=>teacher(id).arrComposeID.map(rid=>{const r=recipe(rid),p=plan(s,rid);return {teacherId:id,recipe:r,limit:limit(s,id),count:s.inventory.filter(i=>i.id===recipe(teacher(id).arrComposeID[0])?.arrProductID[0]).length,canCompose:!p.error,reason:p.error||''};}));}
 return {items:R.items,teacher,recipe,carried,star,limit,allowed,candidates,plan,product,equipStats,attributes,attackContext,audit,damage,catalogue};
})();
