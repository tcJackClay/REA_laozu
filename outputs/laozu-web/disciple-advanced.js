/* Updated APK: UIRebirthConfirmMessageBox, GemModule/GemPage, UIDiscipleSkin.
 * Requests are atomic browser transactions; random fusion results are local draws. */
window.DiscipleAdvanced=(()=>{
 const D=DISCIPLE_ADVANCED_DATA,copy=x=>structuredClone(x),find=(t,id)=>D[t].find(x=>(x.iID??x.nType??x.iGoodsID)===+id);
 const gem=id=>find('Gem',id),skin=id=>DISCIPLE_SKIN_DATA.Skin.find(x=>x.nID===+id);
 const day=()=>new Date().toLocaleDateString('en-CA'),error=s=>{throw Error(s);};
 function gate(s,id){if(s.openFunctions?.includes(id))return true;const row=find('FunctionOpen',id);if(!row)return false;
  const check=expr=>!!expr&&expr.split(';').every(c=>{const [type,n]=c.split('#').map(Number);return type===1?(s.wanderCompleted??s.cleared??0)>=n:type===5?(s.sect||1)>=n:type===14?!!s.createdAt&&(Date.now()-s.createdAt)/86400000>=n:false;});
  return check(row.arrOpenCond)||check(row.arrForceOpen)||check(row.arrForceOpen2);
 }
 const owned=(s,id)=>id===1?s.gold||0:id===2?s.crystal||0:s.goods?.[id]||0;
 function spend(s,pairs){for(let i=0;i<pairs.length;i+=2)if(owned(s,pairs[i])<pairs[i+1])error((find('Goods',pairs[i])?.szName||'材料')+'不足');for(let i=0;i<pairs.length;i+=2){const id=pairs[i],n=pairs[i+1];if(id===1)s.gold-=n;else if(id===2)s.crystal-=n;else{s.goods??={};s.goods[id]-=n;}}}
 function collect(s){let n=0;for(const [id,count]of Object.entries(s.goods||{})){if(!gem(id)||!Number.isSafeInteger(count)||count<=0)continue;s.gems??=[];for(let i=0;i<count;i++)s.gems.push({uid:crypto.randomUUID(),id:+id,locked:false});s.goods[id]=0;n+=count;}return n;}
 const inv=s=>s.gems||[],pages=s=>s.gemPages||{},page=(s,element,n)=>pages(s)[element+':'+n]||Array(6).fill(null);
 const instance=(s,uid)=>inv(s).find(x=>String(x.uid)===String(uid)),used=(s,uid)=>Object.values(pages(s)).some(p=>p.includes(uid));
 const slots=(s,e)=>D.GemSlot.filter(x=>x.iElement===e).sort((a,b)=>a.iOrder-b.iOrder).map(x=>x.arrCondition.every(id=>gate(s,id)));
 const pagePower=(s,e,n)=>page(s,e,n).reduce((sum,uid)=>sum+(gem(instance(s,uid)?.id)?.iPower||0),0);
 const totalPower=s=>Array.from({length:8},(_,i)=>Math.max(...[0,1,2].map(n=>pagePower(s,i+1,n)))).reduce((a,b)=>a+b,0);
 function validGem(s,h){if(!gate(s,150))error('老祖达到24级，或创角5天且17级后开启魂石');if(!h.element)error('弟子尚未确定属性');if(s.run?.config?.disciple===s.disciples.indexOf(h))error('游历结束后可调整魂石');}
 function selectPage(s,h,n){validGem(s,h);if(![0,1,2].includes(n))error('无效方案');h.gemPage=n;}
 function inlay(s,h,n,uid,target){validGem(s,h);const g=instance(s,uid),d=gem(g?.id);if(!d||d.iElement!==h.element)error('魂石属性不符');const p=[...page(s,h.element,n)],open=slots(s,h.element);if(p.includes(g.uid))error('该魂石已镶嵌');
  const same=p.findIndex(x=>gem(instance(s,x)?.id)?.iGroupID===d.iGroupID);let slot=same>=0?same:target??p.findIndex((x,i)=>!x&&open[i]);if(slot<0)error('请先选择要替换的位置');if(!open[slot])error('该魂石槽尚未解锁');p[slot]=g.uid;s.gemPages??={};s.gemPages[h.element+':'+n]=p;
 }
 function remove(s,h,n,slot){validGem(s,h);const p=[...page(s,h.element,n)];p[slot]=null;s.gemPages??={};s.gemPages[h.element+':'+n]=p;}
 function fusionGroups(s,e){const groups=[];for(let q=1;q<6;q++){const available=inv(s).filter(x=>{const d=gem(x.id);return d?.iElement===e&&d.iQuality===q&&!x.locked&&!used(s,x.uid);});for(let i=0;i+4<available.length;i+=5)groups.push(available.slice(i,i+5));}return groups;}
 function fuse(s,h){validGem(s,h);const groups=fusionGroups(s,h.element);if(!groups.length)error('没有可合成的魂石（需要5枚同属性同品质、未锁定且未镶嵌的魂石）');const result=[];for(const group of groups){const q=gem(group[0].id).iQuality+1,rows=D.Gem.filter(d=>d.iElement===h.element&&d.iQuality===q&&d.iRandWeight>0);if(!rows.length)continue;let r=Math.random()*rows.reduce((n,d)=>n+d.iRandWeight,0),d=rows.find(d=>(r-=d.iRandWeight)<0)||rows.at(-1);const ids=new Set(group.map(x=>x.uid));s.gems=s.gems.filter(x=>!ids.has(x.uid));const g={uid:crypto.randomUUID(),id:d.iID,locked:false};s.gems.push(g);result.push(d.szName);}return result;}
 function upgrade(s){if(!gate(s,150))error('魂石尚未解锁');const next=find('GemPower',(s.gemPowerLevel||0)+1);if(!next)error('已满阶');if(totalPower(s)<next.iPower)error('镶嵌更多高品质魂石以提升魂力值');spend(s,next.arrUpgradeMats);s.gemPowerLevel=next.iID;}
 function refine(s,h,uid){validGem(s,h);const g=instance(s,uid),d=gem(g?.id);if(!d?.arrRefineCost?.length)error('该品质魂石不可洗炼');const pool=D.Gem.filter(x=>x.iElement===d.iElement&&x.iQuality===d.iQuality);spend(s,d.arrRefineCost);g.refineId=pool[Math.floor(Math.random()*pool.length)].iID;return gem(g.refineId);}
 function replaceRefine(s,h,uid){validGem(s,h);const g=instance(s,uid);if(!g?.refineId)error('请先洗炼');const next=gem(g.refineId);for(const p of Object.values(pages(s))){if(!p.includes(g.uid))continue;for(let i=0;i<p.length;i++)if(p[i]!==g.uid&&gem(instance(s,p[i])?.id)?.iGroupID===next.iGroupID)p[i]=null;}g.id=g.refineId;delete g.refineId;}
 function equippedGems(s,h){if(!h||!gate(s,150))return [];const open=slots(s,h.element);return page(s,h.element,h.gemPage||0).filter((_,i)=>open[i]).map(uid=>gem(instance(s,uid)?.id)).filter(Boolean);}
 function suits(s,h){const gs=equippedGems(s,h);return D.GemSuit.map(d=>({d,count:gs.filter(g=>d.arrGemID.includes(g.iID)).length})).filter(x=>x.count>=x.d.arrNeedNum[0]);}
 const suitKeys=[2018,2009,2081,2004,2020,2017,2004,2006,2036,2021,2004,2005,2028,2023,2004,2049,2022,2019,2004,2005,2049,2025,2004,2039,2004,2039,2037,2025,2004,2006,2005,2025];
 function canSkin(s,h,d,inventory=h.journey?.inventory||[],ignoreCount=false){if(d.gender&&d.gender!==DiscipleAppearance.gender(h))return '性别不符，无法穿戴';for(const c of [d.arrEquip1,d.arrEquip2,d.arrEquip3]){if(!c?.length)continue;if(c[0]===1&&!inventory.some(i=>i.x!=null&&c.slice(1).includes(i.id)))return '需要携带对应法宝：'+c.slice(1).map(id=>GAME_DATA.items.find(x=>x.id===id)?.name||TeacherRuntime.items.find(x=>x.id===id)?.name||id).join(' / ');if(c[0]===2&&!ignoreCount&&h.skin?.[d.iPart]!==d.nID&&s.disciples.filter(x=>x.skin?.[d.iPart]===d.nID).length>=c[1]&&d.iPart!==9)return '该幻化已达到使用人数上限';}return '';}
 function attrs(s,h,inventory=h?.journey?.inventory||[]){const out={},add=a=>{for(let i=0;i<(a||[]).length;i+=2)out[a[i]]=(out[a[i]]||0)+a[i+1];};if(!h)return out;
  for(const id of Object.values(h.skin||{})){const d=skin(id);if(d&&!canSkin(s,h,d,inventory,true))add(d.arrAttr);}
  add(DISCIPLE_SKIN_DATA.SkinLevel.find(x=>(x.iLevel??x.iID??x.nID)===(s.skinLevel||0))?.arrAttr);
  if(gate(s,150)&&h.element){for(const g of equippedGems(s,h))add(g.arrAttr);for(const {d}of suits(s,h)){const n=Number(d.SzDesc1.match(/\d+/)?.[0]||0),key=suitKeys[(Math.floor(d.iID%100/10)-1)*4+d.iID%10];if(key)add([key,n*(d.SzDesc1.includes('%')?100:1)]);}add(find('GemPower',s.gemPowerLevel||0)?.arrAttr);}return out;
 }
 // These passive clauses are reconstructed from the original Gem/GemSuit descriptions.
 // Their target, thresholds and duration are explicit; server dispatch ordering remains local.
 function combat(s,b,a,side='player'){
  const h=s.disciples?.[s.selected||0],add=(id,n)=>{a[id]=(a[id]||0)+n;},r=b.round||1;
  if(side==='enemy')for(const g of equippedGems(s,h)){const t=g.szDescribe.replace(/<[^>]+>/g,'');for(const [label,id]of [['治疗效果',2045],['汲取率',2049],['怒气回复效率',2072]]){const m=t.match(new RegExp('敌人'+label+'-([\\d.]+)%'));if(m)add(id,-Number(m[1])*100);}}
  const count=(k,who='player')=>window.StatusChains?.count(b,k,who)||0,casts=Object.values(b.equipmentState||{}).reduce((n,x)=>n+(x.casts||0),0);
  for(const {d,count:n}of suits(s,h)){if(d.arrNeedNum.length<2||n<d.arrNeedNum[1])continue;const id=d.iID;
   if(side==='enemy'){if(id===232&&r<=3)add(2025,-2000);if(id===251)add(2005,-Math.min(5000,Math.floor((b.effectTrace||[]).filter(x=>x.kind==='status'&&x.status==='stunMark'&&x.side==='enemy').reduce((n,x)=>n+x.value,0)/2)*1000));continue;}
   if([210,240,270].includes(id)&&r<=2)add(2025,2000);
   if(id===211&&r<=3)add(2027,4000);if(id===212&&b.enemyHp>b.enemyMax*.5)add(2025,4000);if(id===213&&r<=3)add(2049,3000);
   if(id===220)add(2026,Math.min(2000,r*400));if(id===221)add(2004,Math.min(4000,Math.floor((b.gemHeals||0)/6)*400));
   if(id===222)add(2126,Math.min(5000,r*1000));
   if(id===223){if(b.playerHp<b.playerMax*.5)b.gemHalfRound??=r;if(b.gemHalfRound!=null&&r<b.gemHalfRound+2)add(2026,5000);}
   if([230,260].includes(id)&&r<=2)add(2026,2000);if(id===231)add(2026,Math.max(0,4500-(r-1)*1500));if(id===233&&(b.playerSpeed||30)>(b.enemySpeed||30))add(2005,3000);
   if(id===241&&r<=3&&(b.playerSpeed||30)>(b.enemySpeed||30))add(2035,5000);if(id===242&&r<=3)add(2128,3000);if(id===243&&r<=3&&b.playerHp>b.playerMax*.5)add(2039,6000);
   if(id===250)add(2005,Math.min(3000,r*600));if(id===252)add(2026,Math.min(3000,r*600));if(id===253)add(2005,Math.min(5000,Math.floor(casts/10)*1000));
   if(id===261&&count('thunder')>=40)add(2025,2000);if(id===262)add(2025,Math.min(3000,r*1000));if(id===263&&count('thunderGod'))add(2039,6000);
   if(id===271){if(b.playerHp<b.playerMax*.8)b.gemEightyRound??=r;if(b.gemEightyRound!=null&&r<b.gemEightyRound+2)add(2039,6000);}
   if(id===272&&r<=2)add(2025,Math.min(3000,(b.damageTrace||[]).filter(x=>x.round===1&&x.side==='player'&&x.damage>0).length*300));
   if(id===273){if(b.enemyHp<b.enemyMax*.8)b.gemEnemyRound??=r;if(b.gemEnemyRound!=null&&r<b.gemEnemyRound+2)add(2025,3000);}
   if(id===280){add(2004,Math.min(2000,r*400));add(2005,Math.min(2000,r*400));}if(id===281&&count('body')>=60){add(2025,2000);add(2026,2000);}if(id===282)add(2025,Math.min(3000,Math.floor(casts/10)*1000));if(id===283&&b.playerHp<b.playerMax*.5){add(2025,2000);add(2026,2000);}
  }return a;
 }
 function apply(base,a){const out={...base};for(const [k,id]of [['atk',2001],['def',2002],['hp',2003]])out[k]=Math.max(k==='def'?0:1,Math.round(((out[k]||0)+(a[id]||0))*(1+(a[id+3]||0)/10000)*(1+(a[id+62]||0)/10000)));out.speed=(out.speed||30)+(a[2008]||0);out.power=out.atk*12+out.def*8+Math.round(out.hp/4);return out;}
 function detail(s,h){const base=h.journey?.baseStats||h.journey?.stats||{atk:h.birthBase?.[0]||60,def:h.birthBase?.[1]||20,hp:h.birthBase?.[2]||500,speed:h.birthBase?.[3]||30};return apply(base,attrs(s,h));}
 function power(s,h){if(h.sourcePower!=null&&!h.journey){const base={atk:h.birthBase?.[0]||60,def:h.birthBase?.[1]||20,hp:h.birthBase?.[2]||500};return h.sourcePower+apply(base,attrs(s,h)).power-apply(base,{}).power;}return detail(s,h).power;}
 function rebirthCheck(s,h){if(!gate(s,126))error('完成2次游历后开启重生');if(s.run||s.rebirth)error('请先完成当前游历');if(h.isWanderFinish===false||h.refreshTalent)error('该弟子尚未完成培养');if(h.rebirthDay===day()&&(h.rebirthCount||0)>=find('Misc',3213).nNumVal)error('该弟子今日已达到重生次数上限');if(owned(s,101)<1)error('重生丹不足');return Object.values(s.defenseFormations||{}).some(p=>p.includes(h.rosterId));}
 function beginRebirth(s,h){rebirthCheck(s,h);s.rebirth={index:s.disciples.indexOf(h),backup:copy(h),stage:'ready'};}
 function drawRebirth(s){const r=s.rebirth;if(!r||r.stage!=='ready')error('重生状态无效');const h=s.disciples[r.index];if(s.run)error('请先完成当前游历');spend(s,find('Misc',3204).szArray);h.rebirthCount=(h.rebirthDay===day()?h.rebirthCount||0:0)+1;h.rebirthDay=day();r.backup.rebirthCount=h.rebirthCount;r.backup.rebirthDay=h.rebirthDay;
  for(const p of Object.values(s.defenseFormations||{}))for(let i=0;i<p.length;i++)if(p[i]===h.rosterId)p[i]=null;r.stage='active';const candidate=copy(h);delete candidate.journey;delete candidate.sourcePower;candidate.level=1;candidate.isWanderFinish=false;candidate.birthBase=[60,20,500,30];return candidate;
 }
 function completeRebirth(s,newHero){if(!s.rebirth||s.rebirth.stage!=='active')return false;s.rebirth.candidate=copy(newHero);s.rebirth.stage='compare';return true;}
 function chooseRebirth(s,which){const r=s.rebirth;if(!r||r.stage!=='compare')error('尚未完成重生游历');s.disciples[r.index]=copy(which==='old'?r.backup:r.candidate);s.selected=r.index;s.inventory=copy(s.disciples[r.index].journey?.inventory||[]);delete s.rebirth;s.run=null;}
 return {data:D,collect,gem,skin,gate,owned,spend,page,instance,slots,pagePower,totalPower,selectPage,inlay,remove,fusionGroups,fuse,upgrade,refine,replaceRefine,suits,combat,canSkin,attrs,apply,detail,power,rebirthCheck,beginRebirth,drawRebirth,completeRebirth,chooseRebirth};
})();
