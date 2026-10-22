window.createFairylandPage=function(B){
 const M=createMiningModel(B),L=FAIRYLAND_LAYOUTS,esc=Cultivation.esc;let view='home',tool=1,modal=null,slot=0,busy=false,timer=null,hit=-1;
 const find=(r,s)=>[...r.querySelectorAll('[data-source-path]')].find(x=>x.dataset.sourcePath.endsWith(s));
 const icon=id=>{const name=ALIGNED_STAGE_DATA.icons.find(x=>x.nID===id)?.strIconName;return Object.values(L.sprites).find(x=>x.name===name)?.file||'';};
 const name=id=>RESOURCE_DATA.Goods.find(x=>x.iGoodsID===id)?.szName||id;
 const button=(a,t)=>`<button data-fairy="${a}">${t}</button>`;
 function reset(){clearInterval(timer);view='home';modal=null;busy=false;}
 function back(){if(modal)modal=modal==='select'?'team':null;else if(view==='mine')view='home';else {clearInterval(timer);return B.back();}B.render();}
 function render(target){clearInterval(timer);const mine=view==='mine';if(mine)M.recover();const d=mine?M.data():null;
 const root=UnityRect.render(L.layouts[mine?'uimining':'uifairyland'],L.sprites,{width:1080,height:1920,node:r=>{const p=r.path,l=p.split('/').at(-1);
  if(!mine){if(['RoomFocusMask','auto_AvatarOpMask','auto_Fields','auto_Dispatch'].includes(l)||p.includes('fieldState'))return {visible:false};if(l==='auto_Back')return {action:'fairy:back',label:'返回山门'};if(l==='Mining')return {action:'fairy:mine',label:'进入灵脉'};if(l==='xauto_NotOpen'&&p.includes('/Mining/'))return {visible:!B.gate(28)};if(l==='xauto_Devolop'&&p.includes('/Mining/'))return {visible:false};if(l==='auto_WndTitle')return {text:'福地'};return {};}
  if(l==='CommonExitButton')return {visible:true};
  if(['Auto_Exit'].includes(l))return {action:'fairy:back',label:'返回福地'};
  if(l==='auto_TopResBar'||l==='WechatMessageSubscriberBar'||l==='Auto_PickaxeEffect')return {visible:false};
  if(l==='Auto_Depth')return {text:String(d.depth+6)+'m'};
  if(l==='auto_Log')return {action:'fairy:log',label:'挖矿日志'};
  const k=['Auto_Pickaxe','Auto_Drill','Auto_Explosive'].indexOf(l);if(k>=0)return {action:'fairy:tool:'+(k+1),label:['镐','钻头','炸药'][k]};
  const n=['Auto_PickaxeNum','Auto_DrillNum','Auto_ExplosiveNum'].indexOf(l);if(n>=0)return {text:String(B.balance(102+n))};
  if(l==='Auto_PickaxeRestoreTime')return {text:Math.max(0,Math.ceil((d.recoveryAt-Date.now())/60000))+'分'};
  return {};
 }});root.classList.add('fairy-page',mine?'fairy-mine':'fairy-home');target.append(root);
 if(mine){const zone=find(root,'/Auto_GameBoard');zone.replaceChildren();zone.classList.add('fairy-grid');d.board.forEach((c,i)=>{const cfg=FAIRYLAND_DATA.CaveGrid.find(x=>x.iType===c.type),b=document.createElement('button');b.dataset.fairy='dig:'+i;b.dataset.revision=d.revision;b.className='fairy-cell'+(!c.available?' fog':'')+(hit===i?' struck':'');b.setAttribute('aria-label',`${i+1}号${cfg?.szName||'空地'}${c.available?'':'未到达'}`);const src=cfg?icon(c.durability<cfg.iDurability&&cfg.iBreakIconID?cfg.iBreakIconID:cfg.iIconID):'';b.innerHTML=(src?`<img src="${src}" alt="">`:'')+(cfg&&c.durability<cfg.iDurability?`<small>${c.durability}/${cfg.iDurability}</small>`:'');zone.append(b);});
 const hud=document.createElement('div');hud.className='fairy-hud';hud.innerHTML=`<span>灵石 ${B.balance(1)} · 晶矿 ${B.balance(21)}</span>${button('team','派遣')}<strong>${['镐','钻头','炸药'][tool-1]}</strong>`;root.append(hud);
 }
 if(mine){const active=root.querySelector(`[data-original-action="fairy:tool:${tool}"]`);if(active)active.classList.add('fairy-tool-active');timer=setInterval(()=>{if(!root.isConnected){clearInterval(timer);return;}const n=B.balance(102);M.recover();if(n!==B.balance(102)){B.render();return;}const text=find(root,'/Auto_PickaxeRestoreTime');if(text){text.textContent=Math.max(0,Math.ceil((d.recoveryAt-Date.now())/60000))+'分';text.classList.add('fairy-clock');}},1000);}
 if(modal)dialog(root);
 root.addEventListener('click',e=>{const n=e.target.closest('[data-fairy],[data-original-action^="fairy:"]');if(!n)return;e.stopPropagation();const raw=n.dataset.fairy||n.dataset.originalAction.slice(6),[a,v]=raw.split(':');try{
 if(a==='back')return back();if(a==='mine'){if(!B.gate(28))throw Error(B.lockText(28));view='mine';M.data();}
 if(a==='tool')tool=+v;
 if(a==='dig'){if(busy)return;const result=M.mine(tool,+v,+n.dataset.revision);busy=true;hit=+v;B.toast(result.items.length?result.items.map(x=>name(x.id)+' +'+x.n).join('，'):'挖掘完成');setTimeout(()=>{busy=false;hit=-1;},200);}
 if(a==='team')modal='team';if(a==='log')modal='log';if(a==='seat'){slot=+v;modal='select';}if(a==='member'){M.setMember(slot,v==='none'?null:v);modal='team';}if(a==='close')modal=modal==='select'?'team':null;
 B.render();}catch(err){B.toast(err.message);}});
 }
 function dialog(root){const d=M.data(),box=document.createElement('div');box.className='fairy-overlay';let body='';
 if(modal==='team'){const native=UnityRect.render(L.layouts.uiminingteameditor,L.sprites,{width:1080,height:1920,node:r=>{const p=r.path,l=p.split('/').at(-1),match=p.match(/\/Item_(\d+)/),i=match?+match[1]-1:-1,member=i>=0?B.state().disciples.find(x=>x.rosterId===d.team[i]):null;
  if(/^Item_[1-5]$/.test(l))return {action:'fairy:seat:'+i,label:(i?'队员'+i:'队长')+' '+(member?.name||'未派遣')};
  if(l==='xauto_DisciplePanel')return {visible:!!member};if(l==='xauto_Empty')return {visible:!member};
  if(l==='Right'||l==='SelfProductAdd')return {visible:false};
  if(l==='Name')return {text:member?.name||''};if(l==='Realm')return {text:member?.realm||'炼气期'};if(l==='Power')return {text:''};
  if(l==='Help')return {visible:false};if(l.startsWith('WndCloseBtn'))return {action:'fairy:close',label:'返回矿洞'};return {};}});for(let i=0;i<5;i++){const member=B.state().disciples.find(x=>x.rosterId===d.team[i]),panel=find(native,`/Item_${i+1}/xauto_DisciplePanel`);if(member&&panel){panel.replaceChildren();panel.innerHTML=`<div class="fairy-member-display">${DiscipleAppearance.html(member)}<span>${esc(member.name)}<small>${esc(member.realm||'炼气期')}</small></span></div>`;}}box.append(native);}

 else {body=modal==='select'?M.eligible().map(x=>button('member:'+x.rosterId,esc(x.name))).join('')+button('member:none','撤下弟子'):d.log.map(x=>`<p>${x.depth+6}m · ${x.items.map(i=>`${name(i.id)} ×${i.n}`).join('、')||'挖掘矿层'}</p>`).join('')||'<p>暂无记录</p>';box.innerHTML=`<section role="dialog" aria-label="${modal==='select'?'选择弟子':'挖矿日志'}">${body}${button('close','返回')}</section>`;}
 root.append(box);
 }
 return {render,back,reset,model:M,text:()=>({view,tool,modal,busy,mining:view==='mine'?M.data():null})};
};
