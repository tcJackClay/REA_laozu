/* Original card ownership/claim/privilege rules. Expiry writes and day rewards
 * use an explicit offline adapter; purchases require a real channel response. */
window.MonthCardRules=(()=>{
 const cfg=id=>MONTH_CARD_DATA.MonthlyCard.find(r=>r.iID===+id),now=()=>Math.floor(Date.now()/1000),day=t=>Math.floor((t+28800)/86400);
 const record=(s,id)=>s.monthCardV59?.cards?.[id]||{expires:0,claimedAt:0};
 function owned(s,id,t=now()){const c=cfg(id),r=record(s,id);return !!c&&(c.iCardType===2&&r.expires===-1||t>0&&r.expires>t);}
 const claimed=(s,id,t=now())=>owned(s,id,t)&&day(record(s,id).claimedAt)===day(t);
 function privilege(s,id,t=now()){const active=MONTH_CARD_DATA.MonthlyCard.some(c=>c.arrPrivilege.includes(+id)&&owned(s,c.iID,t)),row=ANTIQUE_DATA.Privilege.find(p=>p.iPrivilege===+id),has=active||s.entitlements?.[id]===true;return {owned:has,bonus:has?(row?.iBonus||0):0};}
 function rewards(ids){const out=new Map();for(const id of ids){const p=MONTH_CARD_DATA.PrizeMain.find(r=>r.iPrizeID===id);if(!p||p.iRandType!==1||p.iPrizeItemType!==1)throw Error('月卡奖励配置不可用');p.arrItem1.forEach((id,i)=>out.set(id,(out.get(id)||0)+p.arrNum1[i]));}return [...out].map(([id,n])=>({id,n}));}
 function info(s,id,t=now()){const c=cfg(id);if(!c)return null;const r=record(s,id),owner=owned(s,id,t),received=claimed(s,id,t),trial=id===2&&!owner&&owned(s,3,t),remaining=Math.max(0,(trial?record(s,3).expires:r.expires)-t);return {id,cfg:c,record:r,owner,received,trial,remaining,receive:owner&&!received&&c.arrDayPrizeID.length>0,recharge:c.iCardType===2?!owner:!owner||received,renewable:id!==1||remaining<=0||Math.floor(remaining/86400)+c.iExpireTime<=c.iMaxTime,daily:rewards(c.arrDayPrizeID),buy:rewards([c.iBuyPrizeID]),privileges:c.arrPrivilege.map(id=>ANTIQUE_DATA.Privilege.find(p=>p.iPrivilege===id)).filter(p=>p?.iType===0)};}
 return {cfg,now,day,record,owned,claimed,privilege,has:(s,id)=>privilege(s,id).owned,bonus:(s,id)=>privilege(s,id).bonus,rewards,info};
})();
window.createMonthCardModel=function(B){
 const R=MonthCardRules,S=B.state;
 function write(id){const s=S();s.monthCardV59??={version:0,cards:{},provenance:'offline-card-adapter'};return s.monthCardV59.cards[id]??={expires:0,claimedAt:0};}
 function claim(id){const s=S(),p=R.info(s,id);if(s.warehouseV54?.result)throw Error('请先确认领取结果');if(!p?.receive)throw Error(p?.received?'今日奖励已领':'月卡未生效或没有每日奖励');for(const r of p.daily){if(!Number.isSafeInteger(r.n)||r.n<=0)throw Error('月卡奖励配置不可用');}const t=R.now();write(id).claimedAt=t;for(const r of p.daily)B.add(r.id,r.n);s.monthCardV59.version++;s.warehouseV54??={version:0};s.warehouseV54.version++;s.warehouseV54.result={id:'month-card:'+id,rewards:p.daily,provenance:'offline-card-adapter'};B.save();return p.daily;}
 function useGift(id,expected){const s=S(),g=RESOURCE_DATA.Goods.find(g=>g.iGoodsID===+id),u=WAREHOUSE_DATA.GoodsUse.find(u=>u.iGoodsID===+id),p=R.info(s,1);if(id!==65||g?.iSubClass!==15||u?.iUsageType!==2)throw Error('月卡道具配置不可用');if(s.warehouseV54?.result)throw Error('请先确认领取结果');if(!expected||expected.version!==(s.warehouseV54?.version||0)||expected.contract!==JSON.stringify(u))throw Error('物品信息已变化，请重新打开');if(B.balance(id)<1)throw Error('月卡礼盒不足');if(!p.renewable)throw Error('月卡续费已达上限！');const next=Math.max(R.now(),p.record.expires)+p.cfg.iExpireTime*86400;B.add(id,-1);write(1).expires=next;s.monthCardV59.version++;s.warehouseV54??={version:0};s.warehouseV54.version++;B.save();return {activated:1,expires:next};}
 return {info:id=>R.info(S(),id),claim,useGift};
};
