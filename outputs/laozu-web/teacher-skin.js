/* Source: TeacherUtility.BuyTeacherSkin, UITeacherSkinTip and cfg_Teacher.arrStarAffect3.
 * Server ownership/receive notifications are one local, repeat-safe transaction. */
window.createTeacherDiscipleSkinModel=function(B){
 function info(id){const teacher=TEACHER_DATA.teachers.find(t=>t.iID===+id),a=teacher?.arrStarAffect3||[],skin=DISCIPLE_SKIN_DATA.Skin.find(t=>t.nID===a[1]),view=HOME_DETAIL_DATA.TeacherSkin.find(t=>t.iID===teacher?.iDefaultSkin);
  const valid=!!teacher&&a.length>=5&&!!skin&&a[2]===1&&a[3]>0&&a[4]>0&&view?.iSamllCreateView>0,unlocked=!!teacher&&B.level('teacher',teacher.iID)>=0,purchased=!!B.state().teacherDiscipleSkinPurchasesV53?.[id];
  return {teacher,skin,valid,unlocked,purchased,currency:a[3],cost:a[4],canBuy:valid&&unlocked&&!purchased,tip:purchased?'已购买':unlocked?'购买可获得对应弟子幻化':'获得长老后可购买'};
 }
 function purchase(id,expected){const p=info(id);if(!B.gate(15))throw Error(B.lockText(15));if(!p.valid)throw Error('该长老没有可购买的弟子幻化');if(!p.unlocked)throw Error('获得长老后可购买');if(p.purchased)throw Error('该幻化已经购买');
  if(!expected||p.skin.nID!==expected.skin||p.currency!==expected.currency||p.cost!==expected.cost)throw Error('购买信息已变化，请重新确认');if(B.balance(p.currency)<p.cost)throw Error(B.good(p.currency).szName+'不足');
  const s=B.state(),have=new Set([...(s.ownedSkinIds||[]),...(s.disciples||[]).flatMap(h=>Object.values(h.skin||{}))]),newSkin=!have.has(p.skin.nID);
  B.add(p.currency,-p.cost);s.teacherDiscipleSkinPurchasesV53??={};s.teacherDiscipleSkinPurchasesV53[id]=true;s.ownedSkinIds=[...new Set([...(s.ownedSkinIds||[]),p.skin.nID])];
  if(newSkin&&Number.isFinite(s.skinValue))s.skinValue+=p.skin.iLevelVal||0;B.save();return p.skin;
 }
 return {info,purchase};
};
window.TeacherDiscipleSkinUI=(()=>{
 const L=()=>TEACHER_SKIN_LAYOUTS,find=(root,suffix)=>[...root.querySelectorAll('[data-source-path]')].find(n=>n.dataset.sourcePath.endsWith(suffix));
 const content=(root,suffix,html)=>{const node=find(root,suffix);if(node)node.innerHTML=html;return node;};
 const currencyIcon=(M,id)=>DETAIL_PROGRESS_ICONS.icons[M.good(id).iIconID]||M.good(id).image;
 let raf=0;
 function animate(canvas){cancelAnimationFrame(raf);const start=performance.now(),frame=now=>{if(!canvas.isConnected)return;const hosts=[...canvas.querySelectorAll('.teacher-disciple-skin-art')];if(!hosts.length)return;for(const host of hosts)AppearanceMotion.pose(host,'idle',0,matchMedia('(prefers-reduced-motion: reduce)').matches?0:(now-start)/1000);raf=requestAnimationFrame(frame);};raf=requestAnimationFrame(frame);}
 const art=p=>`<div class="teacher-disciple-skin-art">${AppearanceMotion.has(p.skin.nID)?AppearanceMotion.html(p.skin.nID):DiscipleAppearance.html({skin:{9:p.skin.nID}})}</div>`;
 function node(r,p,M){const leaf=r.path.split('/').at(-1);if(leaf==='auto_QMoudle')return {visible:p.valid};if(!r.path.includes('/auto_QMoudle/'))return null;
  if(leaf==='auto_tip')return {text:p.purchased?'已购买':p.unlocked?'':'获得长老后\n可购买',visible:!p.unlocked||p.purchased};
  if(leaf==='auto_SkinTip')return {visible:p.valid,action:'home26:disciple-skin-preview',label:'查看弟子幻化'};
  if(leaf==='auto_buy')return {visible:p.canBuy,action:'home26:disciple-skin-buy',label:'购买弟子幻化'};
  if(leaf==='auto_buyIcon')return {image:currencyIcon(M,p.currency),imageBorder:{x:0,y:0,z:0,w:0}};
  if(leaf==='auto_buyNum')return {text:String(p.cost||'')};return {};
 }
 function inline(root,p,canvas){if(p.valid){content(root,'/auto_QSkin',art(p));animate(canvas);}}
 function create(canvas,key,title,render,layer){const shade=document.createElement('button');shade.className='home-source-shade';shade.style.zIndex=layer;shade.dataset.home26='close';shade.setAttribute('aria-label','返回上一层');canvas.append(shade);
  const root=UnityRect.render(L().layouts[key],L().sprites,{width:1080,height:1920,node:render});root.classList.add('home-source-dialog','teacher-disciple-skin-window');root.style.zIndex=layer+1;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',title);canvas.append(root);return root;
 }
 function preview(canvas,p,M){const rows=[];for(let i=0;i<(p.skin.arrAttr||[]).length;i+=2)if(p.skin.arrAttr[i]!==2047)rows.push({id:p.skin.arrAttr[i],value:p.skin.arrAttr[i+1]});
  const root=create(canvas,'uiteacherskintip','弟子幻化预览',r=>{const leaf=r.path.split('/').at(-1);if(leaf==='Auto_attrBg')return {visible:!!p.skin.arrAttr.length};if(leaf==='auto_tip')return {text:p.tip};if(leaf==='auto_buy')return {visible:p.canBuy,action:'home26:disciple-skin-buy',label:'购买弟子幻化'};if(leaf==='auto_buyIcon')return {image:currencyIcon(M,p.currency),imageBorder:{x:0,y:0,z:0,w:0}};if(leaf==='auto_buyNum')return {text:String(p.cost)};return {};},66);
  content(root,'/auto_moudle',art(p));const holder=content(root,'/AttrFlex','');
  const layout=L().layouts.uiteacherskintip,first=layout.nodes.find(n=>n.path.endsWith('/AttrFlex/ListItem')),nodes=layout.nodes.filter(n=>n===first||n.path.startsWith(first.path+'/')).map(n=>n===first?{...n,parentID:null}:n);
  const font=window.ORIGINAL_FONT_DATA,point=font?.pointSize||37,size=nodes.find(n=>n.path.endsWith('/value')).components.find(c=>'m_text'in c).m_fontSize;
  const entries=rows.map((a,index)=>{const cfg=TEACHER_DATA.attributes.find(n=>n.iAtrributeID===a.id),label=(cfg?.szAttrNameShort||cfg?.szAttrName||'属性')+'+'+Math.trunc(a.value/100)+'%',textWidth=Math.ceil([...label].reduce((v,ch)=>v+(font?.characters[ch.codePointAt(0)]?.[6]||point),0)*size/point);return {label,textWidth,width:textWidth+(index<rows.length-1?46+5:0)};});
  const width=entries.reduce((v,e)=>v+e.width,0)+Math.max(0,entries.length-1)*55;Object.assign(holder.style,{left:'50%',top:'-3.7px',width:width+'px',height:'58.4px',transform:'translateX(-50%)'});let offset=0;
  entries.forEach((a,index)=>{const row=UnityRect.render({nodes},L().sprites,{width:a.width,height:58.4,node:r=>r.id===first.id?{visible:true,rect:{m_AnchorMin:{x:0,y:1},m_AnchorMax:{x:0,y:1},m_Pivot:{x:0,y:1},m_AnchoredPosition:{x:offset,y:0},m_SizeDelta:{x:a.width,y:58.4}}}:r.path.endsWith('/value')?{text:a.label,rect:{m_SizeDelta:{x:a.textWidth,y:37}}}:r.path.endsWith('/line')?{visible:index<entries.length-1,rect:{m_SizeDelta:{x:5,y:51}}}:{} });holder.append(row);offset+=a.width+55;});animate(canvas);return root;
 }
 function confirmation(canvas,p,M){const message=`购买${p.teacher.szName}长老的外观\n<color=#9f7646>长老的外观可进一步将弟子幻化成该长老的模样</color>`;
  const probe=document.createElement('div');probe.className='teacher-skin-purchase-message';Object.assign(probe.style,{position:'fixed',left:'-10000px',top:'0',width:'777.6px',height:'auto',visibility:'hidden'});probe.innerHTML=Cultivation.rich(message);canvas.append(probe);const messageHeight=Math.ceil(probe.offsetHeight);probe.remove();const middleHeight=messageHeight+40+40+100+86;
  const root=create(canvas,'uiconsumeconfirm','购买弟子幻化',r=>{const path=r.path,leaf=path.split('/').at(-1);if(leaf==='kuangti')return {rect:{m_SizeDelta:{x:913,y:175+middleHeight+241}}};if(leaf==='auto_middle')return {visible:true,rect:{m_SizeDelta:{x:777.6,y:middleHeight}}};if(leaf==='auto_Title')return {text:'购买外观'};if(leaf==='Auto_Close'||leaf==='Auto_Cancel')return {action:'home26:close',label:'取消购买'};if(leaf==='Auto_Confirm')return {action:'home26:disciple-skin-confirm',label:'确认购买'};if(leaf==='Auto_ConfirmBtnText')return {text:'确定'};if(leaf==='auto_middle1')return {visible:false};if(leaf==='Auto_Message')return {text:'',rect:{m_SizeDelta:{x:777.6,y:messageHeight}}};
   if(path.includes('/Auto_Cost/')){if(leaf==='icon')return {image:currencyIcon(M,p.currency),imageBorder:{x:0,y:0,z:0,w:0}};if(leaf==='num')return {text:String(p.cost)};}
   const match=path.match(/\/Res \((\d)\)(?:\/(.*))?$/);if(match){if(!match[2])return {visible:+match[1]===1};if(match[2]==='Icon')return {image:currencyIcon(M,p.currency),imageBorder:{x:0,y:0,z:0,w:0}};if(match[2]==='Num')return {text:String(M.balance(p.currency))};if(match[2].startsWith('Add'))return {visible:false};}return {};},69);
  content(root,'/Auto_Message',`<div class="teacher-skin-purchase-message">${Cultivation.rich(message)}</div>`);return root;
 }
 return {node,inline,preview,confirmation,stop(){cancelAnimationFrame(raf);}};
})();
