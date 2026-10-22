/* Source TeacherData/RoleTeacherPart; local transactions replace server acknowledgements. */
window.TeacherAwake=(()=>{
 const D=TEACHER_AWAKE_DATA,rows=id=>D.TeacherAwakening.filter(x=>x.iID===+id).sort((a,b)=>a.iAwakenLevel-b.iAwakenLevel),level=(s,id)=>Math.max(0,Math.min(5,s.teacherAwakenLevels?.[id]||0));
 const owned=(s,id)=>window.CollectionOwnership?CollectionOwnership.level(s,'teacher',id)>=0:s.teacherUnlockedIds?.includes(+id);
 function resonance(s){const total=D.TeacherAwakening.filter(x=>owned(s,x.iID)&&x.iAwakenLevel===level(s,x.iID)).reduce((n,x)=>n+x.iExp,0),lv=Math.max(0,Math.min(100,s.teacherResonanceLevel||0)),used=D.TeacherAwakeningLevel.filter(x=>x.iID<=lv).reduce((n,x)=>n+x.iExp,0),next=D.TeacherAwakeningLevel.find(x=>x.iID===lv+1);return {level:lv,total,available:Math.max(0,total-used),next};}
 function attributes(s,lv=resonance(s).level){const out={};for(const r of D.TeacherAwakeningLevel.filter(x=>x.iID<=lv))for(let i=0;i<r.arrAttribute.length;i+=2)out[r.arrAttribute[i]]=(out[r.arrAttribute[i]]||0)+r.arrAttribute[i+1];return out;}
 return {rows,level,resonance,attributes};
})();
window.createTeacherAwakeModel=function(B){
 const S=B.state,D=TEACHER_AWAKE_DATA,A=TeacherAwake,teacher=id=>TEACHER_DATA.teachers.find(x=>x.iID===+id),gateId=()=>HOME_MANAGEMENT_DATA.Misc.find(x=>x.nType===5102)?.nNumVal||318;
 function checkEntry(id){if(!B.gate(gateId()))throw Error(B.lockText(gateId()));if(id&&!teacher(id))throw Error('长老配置不存在');if(id&&B.level('teacher',id)<0)throw Error('尚未获得该长老');}
 function info(id){const level=A.level(S(),id),rows=A.rows(id),next=rows.find(x=>x.iAwakenLevel===level+1),costs=[];let remaining=next?.iReduceGoodsNum||0;for(const material of next?.arrReduceGoods||[]){const have=B.balance(material),n=Math.min(remaining,have);costs.push({id:material,have,n,need:remaining});remaining-=n;}
  const reason=!B.gate(gateId())?B.lockText(gateId()):B.level('teacher',id)<0?'尚未获得该长老':!next?'已达觉醒上限':next.iFunctionOpenID&&!B.gate(next.iFunctionOpenID)?B.lockText(next.iFunctionOpenID):remaining>0?'觉醒材料不足':'';
  return {id:+id,level,rows,next,costs,remaining,reason,confirm:costs.some((c,i)=>i>0&&c.n>0)&&!S().disableTeacherAwakeMaterialConfirm};
 }
 function upgrade(id,expected,confirmed=false){checkEntry(id);const x=info(id);if(x.level!==expected)throw Error('觉醒等级已变化，请重新确认');if(x.reason)throw Error(x.reason);if(x.confirm&&!confirmed)throw Error('需要确认使用通用觉醒材料');x.costs.forEach(c=>{if(c.n)B.add(c.id,-c.n);});S().teacherAwakenLevels??={};S().teacherAwakenLevels[id]=x.level+1;B.save();return info(id);}
 function upgradeResonance(expected){checkEntry();const r=A.resonance(S());if(r.level!==expected)throw Error('共鸣等级已变化');if(!r.next)throw Error('共鸣已满级');if(r.available<r.next.iExp)throw Error('共鸣经验不足');S().teacherResonanceLevel=r.level+1;B.save();return A.resonance(S());}
 function rewards(id){const t=teacher(id),a=t?.arrLevelReward||[],received=S().teacherLevelRewardLevels?.[id]||0,star=B.level('teacher',id),out=[];for(let i=0;i<a.length;i+=2){const prize=D.PrizeMain.find(x=>x.iPrizeID===a[i+1]);out.push({level:a[i],claimed:a[i]<=received,canClaim:star>=a[i]&&a[i]>received,items:(prize?.arrItem1||[]).map((id,j)=>({id,n:prize.arrNum1[j]}))});}return out;}
 function claim(id,expected){checkEntry(id);const list=rewards(id),r=list.find(x=>!x.claimed);if(!r||r.level!==expected)throw Error('请依次领取星级奖励');if(!r.canClaim)throw Error('长老星级不足');if(!r.items.length)throw Error('奖励配置缺失');r.items.forEach(x=>B.add(x.id,x.n));S().teacherLevelRewardLevels??={};S().teacherLevelRewardLevels[id]=r.level;B.save();return r.items;}
 return {info,checkEntry,gateId,upgrade,upgradeResonance,rewards,claim};
};
