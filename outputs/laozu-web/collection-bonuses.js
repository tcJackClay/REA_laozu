/* Collection bonuses: source cfg_SeedlingGroup / cfg_TeacherGroup triples.
 * Server stacking/PVE formula is not available; additive local adapter. */
window.CollectionBonuses=(()=>{
 const level=(s,kind,id)=>Array.isArray(s[kind+'UnlockedIds'])&&!s[kind+'UnlockedIds'].includes(id)?-1:s[kind+'Stars']?.[id]??0;
 function groups(s,kind){const teacher=kind==='teacher',D=window.HOME_MANAGEMENT_DATA;if(!D)return [];return D[teacher?'TeacherGroup':'SeedlingGroup'].filter(g=>teacher||!s.openElements||s.openElements.some(e=>g.iActiveFiveElements&(1<<(e-1)))).map(g=>{const ids=g[teacher?'arrTeacherSuit':'arrSeedlingSuit'],minimum=Math.min(...ids.map(id=>level(s,kind,id))),a=g[teacher?'arrTeacherSuitAttr':'arrSeedlingAttribute'],tiers=[];for(let i=0;i<a.length;i+=3)tiers.push({threshold:a[i],id:a[i+1],value:a[i+2],active:minimum>=0&&minimum>=a[i]});return {id:g.iID,kind,name:g[teacher?'szTeacherSuitName':'szSeedlingSuitName'],ids,minimum,tiers,pveRaw:teacher?g.arrTeacherSuitAttrPVE:[]};});}
 function audit(s){return [...groups(s,'seed'),...groups(s,'teacher')].filter(g=>g.tiers.some(t=>t.active));}
 function attributes(s){const out={};for(const g of audit(s))for(const t of g.tiers)if(t.active)out[t.id]=(out[t.id]||0)+t.value;return out;}
 return {level,groups,audit,attributes};
})();
