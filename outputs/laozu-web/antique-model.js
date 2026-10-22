/* Source Gubao/GubaoSuit projections. Server aggregation and lottery RNG are local adapters. */
window.AntiqueRules=(()=>{
 const D=ANTIQUE_DATA,cfg=id=>D.Gubao.find(x=>x.iID===+id),level=(s,id)=>s.antiqueV51?.levels?.[id]||0;
 const pairs=a=>Array.from({length:(a||[]).length/2},(_,i)=>({id:a[i*2],n:a[i*2+1]}));
 function max(c){let n=0;while(n<10&&c?.['arrCost_Lv'+(n+1)]?.length)n++;return n;}
 function suits(s){return D.GubaoSuit.filter(x=>x.iActiveFiveElements).map(c=>{const minimum=Math.min(...c.arrGubaoSuit.map(id=>level(s,id)));return {cfg:c,minimum,owned:c.arrGubaoSuit.filter(id=>level(s,id)>0).length,tiers:Array.from({length:c.arrSuitAttribute.length/3},(_,i)=>({level:c.arrSuitAttribute[i*3],id:c.arrSuitAttribute[i*3+1],n:c.arrSuitAttribute[i*3+2],active:minimum>=c.arrSuitAttribute[i*3]}))};});}
 function effect(s,c,l=level(s,c.iID)){const values=pairs(c['arrEffectValue_Lv'+Math.max(1,l)]);if(![2,4].includes(c.iEffectType))return values;const count=Math.min(c.arrEffectParam[2]||0,Math.floor((s.antiqueV51?.progress?.[c.iID]||0)/(c.arrEffectParam[1]||1)));return values.map(v=>({...v,n:v.n*count}));}
 function attributes(s,h){const out={},add=(id,n)=>out[id]=(out[id]||0)+n;for(const c of D.Gubao){const l=level(s,c.iID);if(!l)continue;for(const v of pairs(c['arrAttribute_Lv'+l]))add(v.id,v.n);if([1,2].includes(c.iEffectType))for(const v of effect(s,c,l))add(v.id,v.n);}
  for(const g of suits(s))if(g.cfg.iActiveFiveElements&(1<<((h?.element||0)-1)))for(const t of g.tiers)if(t.active)add(t.id,t.n);return out;}
 function privileges(s){const out={};for(const c of D.Gubao)if(level(s,c.iID)>0&&[3,4].includes(c.iEffectType))for(const v of effect(s,c))out[v.id]=(out[v.id]||0)+v.n;return out;}
 const value=(id,n)=>{const a=D.Attribute.find(x=>x.iAtrributeID===+id);return (a?.szAttrName||id)+' +'+(a?.iAttrType===2?n/100+'%':n);};
 const privilege=(id,n)=>{const p=D.Privilege.find(x=>x.iPrivilege===+id);return (p?.szPrivilegeDescribe||String(id)).replace('{0}',p?.iAttrType===2?n/100:n).replace('{1}','0').replace('{2}',n);};
 return {cfg,level,pairs,max,suits,effect,attributes,privileges,value,privilege};
})();
window.createAntiqueModel=function(B){
 const D=ANTIQUE_DATA,R=AntiqueRules,state=B.state;
 const data=()=>state().antiqueV51??={levels:{},progress:{},draws:0,pity:{},wish:[],result:null};
 const level=id=>R.level(state(),id),costs=id=>R.pairs(R.cfg(id)?.['arrCost_Lv'+(level(id)+1)]),balance=B.balance;
 function canUnlock(id){const c=costs(id)[0];return level(id)===0&&!!c&&balance(c.id)>=c.n;}
 function canUpgrade(id){const c=R.cfg(id),l=level(id),pay=costs(id);return !!c&&l<R.max(c)&&(!l||c.iIsCanUpgrade>0)&&pay.length>0&&pay.every(v=>balance(v.id)>=v.n);}
 function upgrade(id,expected){const c=R.cfg(id),l=level(id);if(!B.gate(3))throw Error(B.lockText(3));if(expected!==l)throw Error('星级已变化，请重新操作');if(!canUpgrade(id))throw Error(l>=R.max(c)?'已达最高星级':l&&c.iIsCanUpgrade<=0?'该古宝不能升星':'古宝材料不足');const pay=costs(id);pay.forEach(v=>B.add(v.id,-v.n));data().levels[id]=l+1;B.save();return l+1;}
 function list(ready=false){return [...D.Gubao].filter(c=>!ready||canUpgrade(c.iID)).sort((a,b)=>a.iGubaoQuality-b.iGubaoQuality||level(b.iID)-level(a.iID)||b.iSort-a.iSort);}
 function neighbor(id,dir,ids){const rows=ids?.map(R.cfg).filter(Boolean)||list(),i=rows.findIndex(x=>x.iID===+id);return rows[i+dir]?.iID||null;}
 const pool=()=>D.Lootbox[0],eligible=x=>{const [type,n,...rest]=x.arrUnlock||[];if(!type)return true;if(type===1)return (state().portalV8?.draws&&Object.values(state().portalV8.draws).reduce((a,b)=>a+b,0)||0)>=(rest.at(-1)||n||0);if(type===3)return (state().wanderCompleted||0)>=n;if(type===4)return !!state().createdAt&&Math.floor((Date.now()-state().createdAt)/86400000)+1>=n;return false;};
 const entries=()=>D.LootboxPool.filter(x=>x.iBoxId===pool().iID&&x.iProp>0&&x.iDisplayRule!==2&&eligible(x));
 function price(n){const p=pool(),i=n===10?1:0,ticket=p.arrGoodNum[i];return balance(p.iGoodID)>=ticket?{id:p.iGoodID,n:ticket}:{id:p.iCurrency,n:p.arrCurrencyNum[i]};}
 function draw(n,expected){const p=pool();if(![1,10].includes(n))throw Error('无效抽取次数');if(!B.gate(p.iFunctionOpenID))throw Error(B.lockText(p.iFunctionOpenID));const day=new Date().toLocaleDateString('en-CA'),used=state().antiqueV51?.dayCounts?.[day]||0;if(p.iDailyBuyTimes>0&&used+n>p.iDailyBuyTimes)throw Error('今日抽取次数已用完');if(p.iTotalBuyTimes>0&&(state().antiqueV51?.draws||0)+n>p.iTotalBuyTimes)throw Error('抽取次数已达上限');if((state().antiqueV51?.draws||0)!==expected)throw Error('抽取状态已变化');if(state().antiqueV51?.result)throw Error('请先查看当前抽取结果');const pay=price(n),rows=entries();if(balance(pay.id)<pay.n)throw Error('抽取材料不足');if(!rows.length)throw Error('当前没有可抽取古宝');
  const d={levels:{},progress:{},draws:0,pity:{},wish:[],...structuredClone(state().antiqueV51||{})},result=[];d.pity??={};
  for(let j=0;j<n;j++){d.draws++;for(const g of D.LootboxGuarantee)d.pity[g.iId]=(d.pity[g.iId]||0)+1;const forced=[...D.LootboxGuarantee].reverse().find(g=>d.pity[g.iId]>=g.iActivateCount);let choices;
   if(forced)choices=rows.filter(x=>forced.arrScarcity.includes(x.iScarcity));else{let roll=Math.random()*p.arrQualityProp.filter((_,i)=>i%2).reduce((a,b)=>a+b,0),quality=p.arrQualityProp[0];for(let i=0;i<p.arrQualityProp.length;i+=2){roll-=p.arrQualityProp[i+1];if(roll<0){quality=p.arrQualityProp[i];break;}}choices=rows.filter(x=>x.iQuality===quality&&x.iScarcity<5);}
   if(!choices?.length)throw Error('保底奖励配置不完整');const weight=x=>d.wish?.includes(x.iGoodID)&&x.iWishListProp>0?x.iWishListProp:x.iProp;let roll=Math.random()*choices.reduce((a,x)=>a+weight(x),0),picked=choices.at(-1);for(const x of choices){roll-=weight(x);if(roll<0){picked=x;break;}}if(forced)d.pity[forced.iId]=0;result.push({id:picked.iGoodID,n:picked.iNum,quality:picked.iQuality});}
  d.dayCounts??={};d.dayCounts[day]=used+n;B.add(pay.id,-pay.n);result.forEach(x=>B.add(x.id,x.n));d.result=result;state().antiqueV51=d;B.save();return result;
 }
 function acknowledge(){if(state().antiqueV51?.result){data().result=null;B.save();}}
 function wish(id){const p=pool(),row=entries().find(x=>x.iGoodID===id&&x.iWishListTag>0);if(!p.iHasWishlist||!B.gate(p.iWishFuncID)||!row)throw Error('当前不可选择该心愿');const d=data();d.wish??=[];d.wish=d.wish.includes(id)?d.wish.filter(x=>x!==id):[...d.wish.filter(x=>!entries().some(r=>r.iGoodID===x&&r.iWishListTag===row.iWishListTag)),id];B.save();}
 return {data,level,costs,canUnlock,canUpgrade,upgrade,list,neighbor,pool,entries,price,draw,acknowledge,wish,suits:()=>R.suits(state())};
};
