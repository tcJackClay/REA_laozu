/* Goods.arrAccess -> ObtainResources -> FunctionJump, preserving failed-jump context. */
window.ResourceTips=(()=>{
 const D=RESOURCE_DATA,L=RESOURCE_LAYOUTS,esc=Cultivation.esc;
 const goods=id=>D.Goods.find(x=>x.iGoodsID===id);
 const routes=id=>(goods(id)?.arrAccess||[]).map(id=>D.ObtainResources.find(x=>x.iID===id)).filter(Boolean);
 function render(target,id,B){
  const g=goods(id);if(!g)return;const list=routes(id),root=document.createElement('div');root.className='resource-tips';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',g.szName+'获取途径');
  const shade=document.createElement('button');shade.className='resource-dismiss';shade.setAttribute('aria-label','关闭资源详情');shade.onclick=B.close;root.append(shade);
  const view=UnityRect.render(L.layouts.uicommongoodstips,L.sprites,{width:1080,height:1920,node:r=>{const p=r.path,l=p.split('/').at(-1),t=r.components.find(c=>'m_text'in c);if(l==='auto_QuickUseBoxPanel'||l==='Share'||l==='corner'||l==='auto_Btns'||l==='GameObject')return {visible:false};if(l==='auto_AccessPanel')return {visible:list.length>0};if(t?.m_text==='修仙尊贵宝箱')return {text:g.szName};if(l==='482')return {text:String(B.balance(id)),visible:!B.hideCount};if(p.endsWith('/icon/icon'))return {image:PORTAL_DATA.goods.find(x=>x.iGoodsID===id)?.image||false};if(p.endsWith('/icon/icon1'))return {visible:false};return {};}});root.append(view);target.append(root);
  const find=end=>[...view.querySelectorAll('[data-source-path]')].find(e=>e.dataset.sourcePath.endsWith(end));
  const desc=find('/tangchuang01/Scroll View');desc.replaceChildren();desc.classList.add('resource-description');desc.innerHTML=Cultivation.rich(g.szDesc);desc.style.height='110px';
  const panel=find('/auto_Access');panel.replaceChildren();panel.classList.add('resource-route-list');const source=L.layouts.uicommongoodstips.nodes,template=source.find(x=>x.path.endsWith('/auto_Access/Viewport/Content/Item')),rowLayout={nodes:source.filter(x=>x.path===template.path||x.path.startsWith(template.path+'/')).map(x=>({...x,parentID:x.id===template.id?null:x.parentID}))};for(const r of list){const item=UnityRect.render(rowLayout,L.sprites,{width:735,height:104,node:n=>{const leaf=n.path.split('/').at(-1);if(n.id===template.id)return {rect:{m_AnchorMin:{x:0,y:1},m_AnchorMax:{x:0,y:1},m_Pivot:{x:0,y:1},m_AnchoredPosition:{x:0,y:0}}};if(leaf==='Name')return {text:r.szName};if(leaf==='Icon')return {visible:r.iIconID>0};if(leaf==='Go')return {action:'resource:route:'+r.iID,label:'前往'+r.szName};return {};}});item.classList.add('resource-native-row');const go=item.querySelector('[data-original-action]');go.dataset.resourceRoute=r.iID;panel.append(item);}
  // Unity's layout controllers resize these areas at runtime. Keep the source panel width.
  Object.assign(panel.style,{height:Math.min(480,list.length*112)+'px',overflow:'auto'});
  panel.addEventListener('click',e=>{const a=e.target.closest('[data-resource-route]');if(!a)return;const r=list.find(x=>x.iID===+a.dataset.resourceRoute),j=D.FunctionJump.find(x=>x.iID===+r.szJumpParams);if(!j||r.iJumpMode!==0)return B.toast('不支持的跳转');if(!B.gate(j.iFunctionID))return B.toast(B.lockText(j.iFunctionID));B.jump(j);});
  root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopImmediatePropagation();B.close();}if(e.key==='Tab'){const items=[...root.querySelectorAll('button')].filter(e=>e.checkVisibility()),i=items.indexOf(document.activeElement);e.preventDefault();items[(i+(e.shiftKey?-1:1)+items.length)%items.length]?.focus();}});
  root.addEventListener('click',e=>e.stopPropagation());
  queueMicrotask(()=>{if(root.isConnected)shade.focus({preventScroll:true});});
  return root;
 }
 return {goods,routes,render};
})();
