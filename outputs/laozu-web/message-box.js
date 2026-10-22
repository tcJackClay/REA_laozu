/* Native UIMessageBoxDesigner bindings, shared by the two material prompts.
 * Transactions remain in the home models; this renderer cannot grant items. */
window.SourceMessageBox=(()=>{
 const colors=['','#488e21','#6892c2','#a86cb6','#d28944','#c05d51','#a86cb6'];
 function settings(detail,page,M,AM,state){const awake=detail.type==='awake-confirm';if(awake){const p=AM.info(detail.id),id=p.next?.arrReduceGoods?.[1];return {title:'系统提示',message:'确认消耗「'+M.good(id).szName+'」进行觉醒吗？',checked:!!state.disableTeacherAwakeMaterialConfirm,toggle:'awake-disable-confirm',confirm:'awake-confirm'};}
  const p=M.payment(page,detail.id),cfg=(page==='teacher'?TEACHER_DATA.teachers:CULTIVATION_DATA.seeds).find(x=>x.iID===detail.id),good=M.good(cfg.iOmniShard),color=colors[good.iQuality]||'#674D2F';return {title:'提示',message:`是否消耗${p.universal}个【<color=${color}>${good.szName}</color>】补充消耗，进行升星`,checked:!!state.disableUniversalFragmentUpgradeConfirm,toggle:'universal-disable-confirm',confirm:'upgrade-confirm'};
 }
 function render(canvas,detail,page,M,AM,state){const s=settings(detail,page,M,AM,state),L=MESSAGE_BOX_LAYOUTS,layout=L.layouts.uimessageboxnew;
  const bindings=layout.nodes[0].components.find(c=>c.fields?.btnYes)?.fields,owns=(r,key)=>r.components.some(c=>c.pathID===bindings[key]?.m_PathID);
  const measure=document.createElement('div');measure.className='source-message-content';measure.style.cssText='position:absolute;visibility:hidden;width:766.0675px;height:auto';measure.innerHTML=Cultivation.rich(s.message);canvas.append(measure);const height=measure.offsetHeight;measure.remove();
  const shade=document.createElement('button');shade.className='home-source-shade source-message-shade';shade.style.zIndex=79;shade.dataset.home26='close';shade.setAttribute('aria-label','取消并返回详情');canvas.append(shade);
  const root=UnityRect.render(layout,L.sprites,{width:1080,height:1920,node:r=>{const leaf=r.path.split('/').at(-1);if(owns(r,'tmpTitle'))return {text:s.title};if(owns(r,'textContent'))return {visible:false};if(owns(r,'tmpContent'))return {visible:true,text:'',rect:{m_SizeDelta:{x:766.0675,y:height}}};if(owns(r,'disableTipRoot'))return {visible:true};if(owns(r,'disableTipFlag'))return {visible:s.checked};if(owns(r,'btnDisableTip'))return {action:'home26:'+s.toggle,label:'本次登录不再提示'};if(owns(r,'btnClose')||owns(r,'btnNo'))return {action:'home26:close',label:'取消'};if(owns(r,'btnYes'))return {action:'home26:'+s.confirm,label:'确定'};if(owns(r,'tmpYesBtnLabel'))return {text:'确定'};if(owns(r,'tmpNoBtnLabel'))return {text:'取消'};if(leaf==='kuangti'&&r.path==='/UIMessageBoxNew/kuangti')return {rect:{m_SizeDelta:{x:913,y:133.6300048828125+height+110.27200317382812+127.66729736328125+60}}};return {};}});
  root.classList.add('home-source-dialog','source-message-box');root.style.zIndex=80;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',s.title);canvas.append(root);
  const content=layout.nodes.find(r=>owns(r,'tmpContent')),slot=root.querySelector(`[data-source-id="${content.id}"]`);slot.innerHTML=`<div class="source-message-content">${Cultivation.rich(s.message)}</div>`;
  const check=root.querySelector(`[data-original-action="home26:${s.toggle}"]`);delete check.dataset.originalAction;check.dataset.home26=s.toggle;check.setAttribute('role','checkbox');check.setAttribute('aria-checked',String(s.checked));return root;
 }
 return {settings,render};
})();
