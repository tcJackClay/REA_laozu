/* Ownership boundary shared by collection, wishes and preparation.
 * GoodsFragments and FunctionOpen are extracted from the updated APK. */
window.CollectionOwnership=(()=>{
 const rows=kind=>kind==='seed'?window.CULTIVATION_DATA.seeds:window.TEACHER_DATA.teachers;
 function level(s,kind,id){id=+id;const ids=s[kind+'UnlockedIds'],stars=s[kind+'Stars']||{};return Array.isArray(ids)?ids.includes(id)?stars[id]??0:-1:stars[id]??-1;}
 function receive(s,id,n=1){id=+id;if(!Number.isSafeInteger(n)||n<=0)throw Error('无效奖励数量');const row=window.COLLECTION_SOURCE_DATA.GoodsFragments.find(x=>x.iGoodID===id&&[1,2].includes(x.iSystemType));if(!row)return null;
  const kind=row.iSystemType===1?'seed':'teacher',key=kind+'UnlockedIds';s[key]??=Object.keys(s[kind+'Stars']||{}).map(Number).filter(id=>level(s,kind,id)>=0);s[kind+'Stars']??={};let copies=n,unlocked=false;
  if(level(s,kind,row.iSystemId)<0){s[key].push(row.iSystemId);s[kind+'Stars'][row.iSystemId]=0;copies--;unlocked=true;}
  const fragments=copies*row.iFragNum;if(fragments){s.goods??={};s.goods[row.iFragGoodId]=(s.goods[row.iFragGoodId]||0)+fragments;}
  return {kind,id:row.iSystemId,unlocked,fragmentId:row.iFragGoodId,fragments};
 }
 function reconcile(s){if(s.collectionOwnershipVersion===1)return false;
  for(const kind of ['seed','teacher']){if(!Array.isArray(s[kind+'UnlockedIds'])){const used=kind==='seed'?[s.run?.config?.seed,s.run?.config?.sub]:s.run?.config?.teachers||[];const initial=kind==='seed'?window.HOME_MANAGEMENT_DATA.Misc.find(x=>x.nType===2000)?.szArray||[]:[];s[kind+'UnlockedIds']=[...new Set([...initial,...used,...Object.keys(s[kind+'Stars']||{}).map(Number).filter(id=>level(s,kind,id)>=0)].filter(id=>rows(kind).some(x=>x.iID===id)))];}s[kind+'Stars']??={};}
  // Replay only the previously disconnected wish ledger, once. Explicit upgrades remain intact.
  for(const [id,n] of Object.entries(s.portalV8?.owned||{}))if(n>0)receive(s,+id,n);
  s.collectionOwnershipVersion=1;return true;
 }
 function elementOpen(s,e){if(!e)return true;if(Array.isArray(s.openElements))return s.openElements.includes(e);const id=104+e;if(s.functionOpen?.[id]!==undefined)return !!s.functionOpen[id];const f=window.HOME_MANAGEMENT_DATA.FunctionOpen.find(x=>x.iID===id);if(!f)return false;
  const condition=r=>{const [type,n]=r.split('#').map(Number);if(type===6)return Math.floor((Date.now()-(s.serverOpenedAt||s.createdAt||Date.now()))/86400000)+1>=n;if(type===19||type===20){const kind=type===19?'seed':'teacher';return rows(kind).some(x=>x.iTechnique===n&&level(s,kind,x.iID)>=0);}return s.conditionValues?.[r]===true;};
  const group=r=>!r||r.split(';').filter(Boolean).every(condition);return group(f.arrOpenCond)||!!f.arrForceOpen&&group(f.arrForceOpen)||!!f.arrForceOpen2&&group(f.arrForceOpen2);
 }
 return {level,receive,reconcile,elementOpen};
})();
