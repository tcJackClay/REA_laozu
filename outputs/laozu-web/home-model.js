/* Source: UIMain, ResourceBarManager, HeroUpgradeMaterialUtility, cfg_*.
 * State/transactions are local; unknown server/platform conditions fail closed. */
window.createHomeModel=function(B){
 const D=HOME_MANAGEMENT_DATA,s=B.state,find=(a,id,key='iID')=>a.find(x=>x[key]===+id);
 const data=()=>{const v=s().homeV26??={name:'无名老祖',avatar:1,claims:{},mainIndex:0,staminaAt:Date.now(),purchases:{},settings:{},messages:[]};return v;};
 const cfgStamina=()=>D.Stamina.find(x=>x.iSect===(s().sect||1))||D.Stamina[1];
 function stamina(){if(!s().admission)s().admission={version:1,phase:'recruit',difficulty:1,maxDifficulty:1,stamina:cfgStamina().iStaminaLimit,cost:5,elapsed:0,points:[0,0,0,0],draws:0,profile:null};return s().admission;}
 function restore(){const a=stamina(),h=data(),c=cfgStamina(),now=Date.now(),interval=c.iRestoreTime*1000;
  if(a.stamina>=c.iStaminaLimit){h.staminaAt=now;return;}
  const n=Math.floor(Math.max(0,now-h.staminaAt)/interval);if(n){a.stamina=Math.min(c.iStaminaLimit,a.stamina+n*c.iRestore);h.staminaAt+=n*interval;B.save();}
 }
 function balance(id){id=+id;if(id===1)return s().gold||0;if(id===3)return stamina().stamina;return (id===2?s().crystal||0:0)+(s().portalV8?.wallet?.[id]||0)+(s().goods?.[id]||0);}
 function add(id,n){id=+id;if(id===1)s().gold=Math.max(0,(s().gold||0)+n);else if(id===3)stamina().stamina=Math.max(0,stamina().stamina+n);else if(id===2&&n>=0){s().crystal=(s().crystal||0)+n;}else if(n>=0){s().goods??={};s().goods[id]=(s().goods[id]||0)+n;}else{let rest=-n;if(id===2){const v=Math.min(rest,s().crystal||0);s().crystal=(s().crystal||0)-v;rest-=v;}for(const bag of [s().portalV8?.wallet,s().goods])if(bag){const v=Math.min(rest,bag[id]||0);bag[id]=(bag[id]||0)-v;rest-=v;}}}
 const good=id=>PORTAL_DATA.goods.find(x=>x.iGoodsID===+id)||(D.Goods||[]).find(x=>x.iGoodsID===+id)||{szName:'道具 '+id};
 const misc=id=>D.Misc.find(x=>x.nType===id);
 function purchase(){const today=new Date().toLocaleDateString('en-CA'),n=data().purchases[today]||0,c=misc(1002);return {day:today,count:n,remaining:c.szFloatArray.length-n,cost:c.szFloatArray[n]||0,amount:c.szArray[n]||0,currency:misc(1001).nNumVal};}
 function buyStamina(){const p=purchase();if(p.remaining<=0)throw Error('今日购买次数已用完');if(balance(p.currency)<p.cost)throw Error(good(p.currency).szName+'不足');add(p.currency,-p.cost);add(3,p.amount);data().purchases[p.day]=p.count+1;B.save();}
 const completed=()=>s().wanderCompleted??s().cleared??0;
 function condition(rule){const [type,...p]=rule.split('#'),a=+p[0];switch(+type){
  case 1:return completed()>=a;case 5:return (s().sect||1)>=a;
  case 6:return Math.floor((Date.now()-(s().createdAt||Date.now()))/86400000)+1>=a;
  case 4:return (s().homeV26?.maxWanderDifficulty||0)>=a;
  case 11:return (s().homeV26?.maxWanderDifficulty||0)>=(+p[1]||a);
  case 1001:return p.every(k=>s().serverFlags?.[k]===true);
  default:return s().conditionValues?.[rule]===true;
 }}
 const group=str=>!str||str.split(';').filter(Boolean).every(condition);
 function gate(id){if(!id)return true;const f=find(D.FunctionOpen,id);if(!f)return false;
  if(s().functionOpen?.[id]!==undefined)return !!s().functionOpen[id];
  if(f.arrPlatforms.length&&!f.arrPlatforms.includes(s().platformID))return false;
  if(f.arrPlatformVers.length&&!f.arrPlatformVers.includes(s().platformVersion))return false;
  if(f.iCeleId&&!s().activeCelebrations?.includes(f.iCeleId))return false;
  return group(f.arrOpenCond)||!!f.arrForceOpen&&group(f.arrForceOpen)||!!f.arrForceOpen2&&group(f.arrForceOpen2);
 }
 function lockText(id){const f=find(D.FunctionOpen,id);if(!f)return '尚未开放';return f.arrOpenCond.split(';').map(r=>{const [t,n]=r.split('#').map(Number);return t===1?'完成'+n+'次游历开启':t===5?'老祖'+n+'级开启':t===6?'开服第'+n+'天开启':'';}).filter(Boolean).join('，')||f.szLockTipText.replace(/<[^>]*>/g,'')||'尚未开放';}
 const list=kind=>kind==='seed'?CULTIVATION_DATA.seeds:TEACHER_DATA.teachers;
 function level(kind,id){const ids=s()[kind+'UnlockedIds'],stars=s()[kind+'Stars']||{};return Array.isArray(ids)&&!ids.includes(+id)?-1:stars[id]??0;}
 function costs(kind,id){const row=find(list(kind),id),lv=level(kind,id);if(!row)return [];return [row.arrCost1,row.arrCost2].filter(x=>x?.length>1).map(a=>({id:a[0],n:a[Math.min(a.length-1,Math.max(1,lv+2))]}));}
 function payment(kind,id){const row=find(list(kind),id),lv=level(kind,id),cs=costs(kind,id),out=[];let universal=0;
  for(let i=0;i<cs.length;i++){const c=cs[i],have=balance(c.id),missing=Math.max(0,c.n-have);if(i===0&&lv>=0&&missing&&row.iOmniShard){out.push({id:c.id,n:Math.min(have,c.n)},{id:row.iOmniShard,n:missing});universal=missing;}else out.push(c);}
  return {costs:out,universal,enough:out.every(c=>balance(c.id)>=c.n)};
 }
 function upgrade(kind,id,allowUniversal=false){const row=find(list(kind),id),lv=level(kind,id),max=kind==='seed'?24:30;if(!row||lv>=max)throw Error('已达最高星阶');const p=payment(kind,id);if(!p.enough)throw Error('升星材料不足');if(p.universal&&!allowUniversal)throw Error('需要确认使用通用碎片');
  p.costs.forEach(c=>add(c.id,-c.n));s()[kind+'Stars']??={};s()[kind+'Stars'][id]=lv+1;data()[kind+'Upgrades']=(data()[kind+'Upgrades']||0)+1;if(Array.isArray(s()[kind+'UnlockedIds'])&&!s()[kind+'UnlockedIds'].includes(+id))s()[kind+'UnlockedIds'].push(+id);B.save();return lv+1;
 }
 function avatarUnlocked(a){if(a.iType!==1)return false;const p=a.arrUnlockParams;if(!p.length)return true;if(p[0]===1)return (s().sect||1)>=p[1];if(p[0]===2)return level('teacher',p[1])>=0;return s().ownedAvatarIds?.includes(a.iID)||false;}
 function rename(name){name=name.trim();if(!name||name.length>8)throw Error('昵称长度为1—8个字符');data().name=name;B.save();}
 function profile(){restore();const h=data();return {name:h.name,avatar:find(D.PlayerAvatar,h.avatar)||D.PlayerAvatar[0],level:s().sect||1,power:s().disciples.reduce((n,d)=>n+(d.sourcePower??B.stats(d).power??0),0),resources:[2,1,3].map(id=>({id,n:balance(id)})),staminaLimit:cfgStamina().iStaminaLimit};}
 function rawProgress(t,kind='sect'){const q=s(),h=data(),params=t.arrCondParams||[];if(kind==='main'){if(t.iType===18)return q.sect||1;if(t.iType===20)return h.stageAttempts||0;if(t.iType===21)return Object.entries(q.portalV8?.draws||{}).filter(([id])=>+id<12000).reduce((n,[,v])=>n+v,0);if(t.iType===999)return 0;}switch(t.iType){
  case 1:return q.admission?.draws||0;case 2:return completed();case 3:return q.blessingLevel||0;
  case 4:return h.antiqueUpgrades||0;case 5:return q.portalV8?.modes?.tower?.wins||0;case 6:return q.portalV8?.modes?.ladder?.attempts||0;case 7:return h.formationUpgrades||0;case 8:return h.blessingUpgrades||0;case 9:return q.disciples.filter(d=>d.isWanderFinish).length;case 10:return q.portalV8?.modes?.tower?.wins||0;case 11:return h.formationLevel||0;case 12:return h.maxWanderDifficulty||0;case 13:return h.seedUpgrades||0;case 14:return q.disciples.filter(d=>d.element===params[1]).length;case 17:return q.disciples.filter(d=>d.isWanderFinish&&(d.sourcePower||0)>=params[2]).length;case 18:return q.disciples.filter(d=>d.element===params[1]&&(d.sourcePower||0)>=params[2]).length;case 29:return q.portalV8?.stage?.wins?.[params[1]]?1:0;
  case 19:return q.disciples.filter(d=>d.isWanderFinish&&(d.realmIndex??d.level??0)>=params[1]).length;
  case 20:return q.disciples.filter(d=>(d.realmIndex??d.level??0)>=params[1]).length;
  case 31:return h.staminaSpent??(q.admission?.draws||0)*(q.admission?.cost||5);
  default:return h.taskProgress?.[t.iID]||0;
 }}
 function taskProgress(t,kind='sect'){const raw=rawProgress(t,kind),counter=(kind==='main'?[2,6,8,20,21]:[1,2,4,5,6,7,8,9,13,19,31]).includes(t.iType);return Math.max(0,raw-(counter?(data()[kind+'Baseline']?.[t.iType]||0):0));}
 const baseline=kind=>Object.fromEntries((kind==='main'?D.MainTask:D.SectV2Task).map(t=>[t.iType,rawProgress(t,kind)]));
 const sectTasks=()=>{const cfg=D.SectV2.find(x=>x.iLevel===(s().sect||1));return (cfg?.arrTask||[]).map(id=>find(D.SectV2Task,id)).filter(Boolean).map(t=>({...t,progress:Math.min(t.iComdition,taskProgress(t)),claimed:!!data().claims['sect:'+s().sect+':'+t.iID]}));};
 const mainTask=()=>{const t=D.MainTask[data().mainIndex];return t?{...t,progress:Math.min(t.iComdition,taskProgress(t,'main'))}:null;};
 const rewards=id=>{const p=D.PrizeMain.find(x=>x.iPrizeID===+id);return (p?.arrItem1||[]).map((id,i)=>({id,n:p.arrNum1[i]||0}));};
 function claim(kind,id){const t=kind==='main'?mainTask():sectTasks().find(t=>t.iID===+id);if(!t||t.iID!==+id||t.claimed||t.progress<t.iComdition)throw Error('任务尚未完成或已领取');const items=rewards(kind==='main'?t.iRewardID:t.iPrize);items.forEach(x=>add(x.id,x.n));if(kind==='main'){data().mainIndex++;data().mainBaseline=baseline('main');}else data().claims['sect:'+s().sect+':'+id]=true;B.save();return items;}
 function levelUp(){const tasks=sectTasks();if(!tasks.length||!tasks.every(t=>t.claimed)||!D.SectV2.some(x=>x.iLevel===s().sect+1))throw Error('请先完成并领取全部老祖任务');s().sect++;data().sectBaseline=baseline('sect');B.save();}
 function sideIcons(){return D.FunctionIcon.filter(x=>[1,2,3,5,6].includes(x.iGroupID)&&x.iFunctionID&&gate(x.iFunctionID)&&(!x.arrCheckerParams||s().iconConditions?.[x.nID]===true)).sort((a,b)=>b.iSort-a.iSort);}
 return {data,profile,balance,add,good,cfgStamina,restore,purchase,buyStamina,gate,lockText,list,level,costs,payment,upgrade,avatarUnlocked,rename,sectTasks,mainTask,rewards,claim,levelUp,sideIcons};
};
