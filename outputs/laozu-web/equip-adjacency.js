/* Original WanderingEquipSlot geometry and WanderingEquipSkill numeric rules.
 * Rotation and final battle stacking remain a local simulation adapter. */
window.EquipAdjacency=(()=>{
 const D=EQUIP_ADJACENCY_DATA,equipment=id=>COMBAT_EFFECTS_DATA.equipment[id],carried=s=>(s.inventory||[]).filter(i=>Number.isFinite(i.x)&&Number.isFinite(i.y)&&i.salePrice==null);
 const cache=new Map(),stateCache=new WeakMap(),plus=(out,id,v)=>{out[id]=(out[id]||0)+v;};
 function skills(i){let ids=equipment(i.id)?.arrSkillID||[];if(i.awakenLevel>0&&i.awakeTeacherId&&window.WanderAwakening)for(const e of WanderAwakening.effects(i.awakeTeacherId,i.awakenLevel))if(e.iType===2)ids=e.arrParam;return [...ids];}
 function geometry(i){const rotation=((i.rotation||0)%4+4)%4,key=i.id+':'+rotation;let shape=cache.get(key);if(!shape){const slot=D.slots[equipment(i.id)?.iSlotId];if(!slot)return {emit:[],absorb:[]};let emit=[],absorb=[];for(let y=0;y<6;y++)for(let x=0;x<6;x++){const a=slot['arrEmitRow'+y]?.[x]||0,b=slot['arrAbsorbRow'+y]?.[x]||0;if(a&1)emit.push({x,y,mask:a});if(b)absorb.push({x,y,mask:b});}
   const rotate=p=>{let {x,y}=p;for(let n=0;n<rotation;n++)[x,y]=[-y,x];return {...p,x,y};};emit=emit.map(rotate);absorb=absorb.map(rotate);if(!emit.length)return {emit:[],absorb:[]};const minX=Math.min(...emit.map(p=>p.x)),minY=Math.min(...emit.map(p=>p.y)),normalize=p=>({...p,x:p.x-minX,y:p.y-minY});shape={emit:emit.map(normalize),absorb:absorb.map(normalize)};cache.set(key,shape);}
  const translate=p=>({...p,x:p.x+i.x,y:p.y+i.y});return {emit:shape.emit.map(translate),absorb:shape.absorb.map(translate)};
 }
 function neighbors(s,i,mask){const area=geometry(i).absorb;return carried(s).filter(j=>j.uid!==i.uid&&geometry(j).emit.some(p=>area.some(a=>a.x===p.x&&a.y===p.y&&(a.mask&p.mask&mask)!==0)));}
 function all(s){const items=carried(s),signature=JSON.stringify(items.map(i=>[i.uid,i.id,i.x,i.y,i.rotation||0,i.awakeTeacherId,i.awakenLevel||0]));const cached=stateCache.get(s);if(cached?.signature===signature)return cached.values;const values=new Map(items.map(i=>[i.uid,{stats:{},flash:{},sources:[]} ]));for(const source of items)for(const id of skills(source)){const rule=D.skills[id];if(!rule||![1005,1006,1007,1008].includes(rule.iType))continue;const params=rule.iType<1007?rule.arrParam:rule.arrFlashParam;if(!params.length)continue;const targets=neighbors(s,source,params[0]),self=rule.iType%2===1,receivers=self&&targets.length?[source]:self?[]:targets;for(const target of receivers){const count=self?targets.length:1,result=values.get(target.uid),out=rule.iType<1007?result.stats:result.flash;for(let n=1;n<params.length;n+=2)plus(out,params[n],params[n+1]*count);result.sources.push({uid:source.uid,skillId:id,count,targets:targets.map(x=>x.uid),kind:self?'self':'neighbors'});}}
  stateCache.set(s,{signature,values});return values;
 }
 function attributes(s,i){return all(s).get(i.uid)||{stats:{},flash:{},sources:[]};}
 function modifiers(s,i){const raw=attributes(s,i),a=raw.stats,f=raw.flash;return {atk:(a[2004]||0)/10000,def:(a[2005]||0)/10000,hp:(a[2006]||0)/10000,damage:((a[2025]||0)+(f[2025]||0))/10000,crit:((a[2027]||0)+(f[2027]||0))/10000,heal:((a[2045]||0)+(f[2045]||0))/10000,shield:((a[2069]||0)+(f[2069]||0))/10000,drain:((a[2049]||0)+(f[2049]||0))/10000,raw};}
 function audit(s){return carried(s).map(i=>({uid:i.uid,id:i.id,awakenLevel:i.awakenLevel||0,skills:skills(i),...attributes(s,i)}));}
 function descriptions(i){return skills(i).map(id=>D.skills[id]?.szDesc).filter(Boolean);}
 return {skills,geometry,neighbors,attributes,modifiers,audit,descriptions};
})();
