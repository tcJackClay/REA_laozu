window.TeacherAwakeUI=(()=>{
 const U=UnityRect,L=TEACHER_AWAKE_LAYOUTS,E=Cultivation.esc,rich=Cultivation.rich;
 const el=(r,s)=>[...r.querySelectorAll('[data-source-path]')].find(x=>x.dataset.sourcePath.endsWith(s));
 const slot=(r,s,html)=>{const n=el(r,s);if(n)n.innerHTML=html;};
 const button=(a,t,disabled=false)=>`<button data-home26="${a}" ${disabled?'disabled':''}>${t}</button>`;
 const attr=(id,v)=>`${E(TEACHER_DATA.attributes.find(x=>x.iAtrributeID===+id)?.szAttrName||id)} +${v/100}%`;
 function render(canvas,d,M,A,S){
  const layer=d.parent?.type?.startsWith('awake')?render(canvas,d.parent,M,A,S)+1:0;
  const type=d.type,key=type==='awake-success'?'uiteacherawakesuccess':type==='awake-reward'?'uiteacherawakereward':type==='awake-resonance'?'uiteacherawakeresonance':type==='awake-preview'?'uiteacherawakeeffectpreview':'uiteacherawake',info=d.id?A.info(d.id):null,t=TEACHER_DATA.teachers.find(x=>x.iID===d.id),r=TeacherAwake.resonance(S),cfg=info?.rows[0],eq=TEACHER_DATA.equipment.find(x=>x.id===cfg?.iEquip)||TeacherRuntime.items.find(x=>x.id===cfg?.iEquip),shade=document.createElement('button');shade.className='home-source-shade';shade.dataset.home26='close';shade.setAttribute('aria-label','返回');canvas.append(shade);
  const root=U.render(L.layouts[key],L.sprites,{width:1080,height:1920,node:n=>{const p=n.path,l=p.split('/').at(-1);
   if(p.endsWith('/Auto_Attrs/Viewport')||p.endsWith('/auto_effects/Viewport'))return {rect:{m_AnchorMin:{x:0,y:0},m_AnchorMax:{x:1,y:1},m_AnchoredPosition:{x:0,y:0},m_SizeDelta:{x:0,y:0},m_Pivot:{x:.5,y:.5}}};
   if(l==='Auto_CloseTip')return {action:'home26:awake-exp',label:'关闭经验说明'};
   if(['auto_ShowBack','auto_close','guanbi','auto_guanbi'].includes(l))return {action:'home26:close',label:'返回'};
   if(l==='Auto_Bg'&&t){const c=n.components.find(c=>c.fields?.SpriteList),spr=L.sprites[c?.fields.SpriteList[t.iTechnique]?.m_PathID];return spr?{image:spr.file}:{};}
   if(l==='auto_EquipName')return {text:eq?.name||t?.szName||''};
   if(l==='Auto_EquipIcon')return {image:eq?.icon||false};
   if(l==='Auto_StarReward')return {action:'home26:awake-reward',label:'长老星级奖励'};
   if(l==='Auto_UpgradeBtn')return {visible:!!info?.next,action:'home26:awake-upgrade',label:'觉醒',className:d.busy?'awake-busy':''};
   if(l==='auto_upgradeLock')return {visible:!!info?.reason};
   if(l==='Auto_NextUnLockTip')return {visible:!!info?.reason,text:info?.reason||''};
   if(l==='Auto_MatList')return {visible:!!info?.next&&(!info.next.iFunctionOpenID||M.gate(info.next.iFunctionOpenID)),rect:{m_SizeDelta:{x:800,y:145}}};
   if(l==='Auto_SkipAnimation')return {visible:!!info?.next,action:'home26:awake-skip',label:S.skipTeacherAwakeAnimation?'播放觉醒动画':'跳过觉醒动画'};
   if(l==='Checkmark')return {visible:!!S.skipTeacherAwakeAnimation};
   if(l==='Auto_NextArrow'||l==='Auto_NextEffectLevel')return {visible:type==='awake-success'||!!info?.next};
   if(l==='level')return {text:String(p.includes('/Auto_CurEffectLevel/')?d.before??info?.level??0:p.includes('/Auto_NextEffectLevel/')?type==='awake-success'?info.level:info?.next?.iAwakenLevel??info?.level??0:info?.level||0)};
   if(l==='Auto_Level')return {text:String(r.level)};
   if(l==='auto_progress')return {text:r.next?`${r.available} / ${r.next.iExp}`:'已满级'};
   if(l==='Auto_progressFill')return {fill:r.next?Math.min(1,r.available/r.next.iExp):1};
   if(l==='auto_upBtn')return {action:'home26:awake-resonance-upgrade:'+r.level,label:'升级共鸣'};
   if(l==='auto_preview')return {action:'home26:awake-preview',label:'共鸣效果预览'};
   if(l==='auto_ExpDetail')return {action:'home26:awake-exp',label:'共鸣经验详情'};
   if(l==='Auto_tipsRoot')return {visible:!!d.expDetail};
   return {};
  }});shade.style.zIndex=60+layer*2;root.style.zIndex=61+layer*2;root.classList.add('home-source-dialog','home-awake-dialog',type);root.setAttribute('role','dialog');root.setAttribute('aria-label',type==='awake-resonance'?'觉醒共鸣':type==='awake-success'?'觉醒成功':type==='awake-reward'?'长老星级奖励':'长老觉醒');canvas.append(root);
  if(info&&['awake','awake-success'].includes(type)){
   slot(root,'/Auto_EffectList',`<div class="awake-effects">${info.rows.filter(x=>type!=='awake-success'||x.iAwakenLevel<=info.level).map(x=>{const unlocked=!x.iFunctionOpenID||M.gate(x.iFunctionOpenID);return `<section class="${info.level>=x.iAwakenLevel?'active':''}"><b>${E(x.szName)} · ${!unlocked?'未开放':info.level>=x.iAwakenLevel?'已觉醒':'未觉醒'}</b><p>${unlocked?rich(x.szDes):E(M.lockText(x.iFunctionOpenID))}</p></section>`;}).join('')}</div>`);
   slot(root,'/Auto_MatList',`<div class="awake-materials">${info.costs.map(c=>`<button data-home26="item-resource:${c.id}"><span>${E(M.good(c.id).szName)}</span><b>${c.have} / ${c.need}</b></button>`).join('')}</div>`);
   const upgrade=el(root,'/Auto_UpgradeBtn');if(upgrade)upgrade.disabled=!!info.reason||!!d.busy;
   if(type==='awake-success'){const close=button('close','继续');root.insertAdjacentHTML('beforeend',`<div class="awake-success-close">${close}</div>`);}
  }
  if(type==='awake-reward'){const rewards=A.rewards(d.id),next=rewards.find(x=>!x.claimed)?.level;slot(root,'/Auto_StarProps',`<div class="awake-rewards">${rewards.map(x=>`<section><h3>${x.level/6}星奖励</h3><p>${x.items.map(i=>`${E(M.good(i.id).szName)} ×${i.n}`).join('、')||'奖励配置缺失'}</p>${button('awake-claim:'+x.level,x.claimed?'已领取':!x.canClaim?'星级不足':'领取',x.claimed||!x.canClaim||x.level!==next||!x.items.length)}</section>`).join('')}</div>`);}
  if(type==='awake-resonance'){
   const current=TeacherAwake.attributes(S),next=TeacherAwake.attributes(S,r.level+1),ids=[...new Set([...Object.keys(current),...Object.keys(next)])];slot(root,'/Auto_Attrs/Viewport',`<div class="awake-attributes">${ids.map(id=>`<div><span>${E(TEACHER_DATA.attributes.find(x=>x.iAtrributeID===+id)?.szAttrName||id)}</span><b>${(current[id]||0)/100}%</b><b>${(next[id]||0)/100}%</b></div>`).join('')}</div>`);const upgrade=el(root,'/auto_upBtn');if(upgrade)upgrade.disabled=!r.next||r.available<r.next.iExp;
   slot(root,'/Auto_tipsRoot/Auto_QualityExp',`<table class="awake-exp-detail"><thead><tr><th>品质</th>${[1,2,3,4,5].map(x=>`<th>${x}阶</th>`).join('')}</tr></thead><tbody>${[...new Set(TEACHER_DATA.teachers.map(x=>x.iQuality))].sort().map(q=>{const teacher=TEACHER_DATA.teachers.find(x=>x.iQuality===q&&TeacherAwake.rows(x.iID).length);return teacher?`<tr><th>${['','','良','优','珍','极'][q]||q}</th>${TeacherAwake.rows(teacher.iID).map(x=>`<td>${x.iExp}</td>`).join('')}</tr>`:'';}).join('')}</tbody></table>`);
  }
  if(type==='awake-preview')slot(root,'/auto_effects/Viewport',`<div class="awake-preview-list">${TEACHER_AWAKE_DATA.TeacherAwakeningLevel.map(x=>`<section class="${x.iID<=r.level?'active':''}"><b>共鸣${x.iID}级 · ${x.iExp}经验</b><p>${Object.entries(TeacherAwake.attributes(S,x.iID)).filter(([,v])=>v).map(([id,v])=>attr(id,v)).join('、')}</p></section>`).join('')}</div>`);
  return layer;
 }
 return {render};
})();
