/* Original notification and popup gates; payments never manufacture a card state. */
window.createMonthCardEvents=function(B){
 const R=MonthCardRules,S=B.state;let pending=false,readyAt=0,guideAt=-Infinity;
 const daily=()=>[1,2].filter(id=>B.model.info(id).receive);
 const last=()=>S().monthPopupV61?.lastShown||0;
 const valid=()=>B.gate(333)&&R.day(last())!==R.day(R.now());
 function request(){if(!valid()||pending)return false;pending=true;readyAt=0;return true;}
 function shown(){S().monthPopupV61={lastShown:R.now()};B.save();}
 function tick(){B.badge(daily());if(!pending)return;const now=performance.now();if(B.guide?.()){guideAt=now;return;}if(now-guideAt<1000||!B.available())return;if(!readyAt){readyAt=now+200;return;}if(now<readyAt)return;pending=false;readyAt=0;shown();B.show();}
 function state(message){if(!['controlled-fixture','original-runtime-notification'].includes(message?.provenance)||!Array.isArray(message.cards))throw Error('需要明确来源的月卡状态通知');const ids=new Set(),rows=message.cards.map(r=>{if(!Number.isSafeInteger(r.iCardID)||!R.cfg(r.iCardID)||ids.has(r.iCardID)||!Number.isSafeInteger(r.iExpireTime)||r.iExpireTime< -1||!Number.isSafeInteger(r.iLastRewardTime)||r.iLastRewardTime<0)throw Error('月卡状态通知无效');ids.add(r.iCardID);return {id:r.iCardID,expires:r.iExpireTime,claimedAt:r.iLastRewardTime};});
  const s=S();s.monthCardV59??={version:0,cards:{},provenance:message.provenance};for(const r of rows)s.monthCardV59.cards[r.id]={expires:r.expires,claimedAt:r.claimedAt};s.monthCardV59.version++;s.serverFlags??={};s.serverFlags.TryLongCard=false;B.save();request();B.changed();return true;
 }
 return {state,difficulty:n=>n===2&&request(),request,shown,tick,daily,text:()=>({pending,lastShown:last(),gate:B.gate(333),daily:daily(),sourceFlag:S().serverFlags?.TryLongCard??false})};
};
