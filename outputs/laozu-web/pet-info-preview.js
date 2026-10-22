/* UIPetInfo.ShowByCfgId(..., Strategy): configuration level1, never a pet instance. */
window.PetInfoPreview=(()=>{
 const D=PET_PREVIEW_DATA;
 function skill(group){const id=D.groups[group]?.arrSkill[0];return id?D.skills[id]||null:null;}
 function resolve(id){const pet=D.pets[id],level=D.levels[id];if(!pet||!level)return null;return {pet,level,displayLevel:1,breakTimes:0,additionValid:false,active:skill(pet.iActiveSkill),passive:skill(pet.iPassiveSkill),icon:D.icons[pet.iIcon]||WANDER_EVENTS_DATA.pets.find(p=>p.id===id)?.icon||null};}
 function attribute(id,value){const type=TEACHER_DATA.attributes.find(a=>a.iAtrributeID===id)?.iAttrType;return '+'+(type===2?value/100+'%':value);}
 return {resolve,skill,attribute};
})();
window.PetInfoPreviewUI=(()=>{
 const L=PET_INFO_LAYOUTS,esc=Cultivation.esc,rich=Cultivation.rich;
 function render(canvas,id){const v=PetInfoPreview.resolve(id);if(!v)return null;
  const shade=document.createElement('button');shade.className='home-source-shade pet-preview-shade';shade.dataset.home26='close';shade.setAttribute('aria-label','关闭灵宠详情');canvas.append(shade);
  const nodes=L.layouts.uipetinfo.nodes,states=new Map(),bindings=new Map(),descriptions=[];
  for(const n of nodes){const leaf=n.path.split('/').at(-1);for(const c of n.components)if(c.fields?.SpriteList&&['auto_prop','auto_PetQuality','auto_TeacherQualityItem'].includes(leaf)){const state=leaf==='auto_prop'?v.pet.iElement:v.pet.iQuality;states.set(c.pathID,state);}
   if(['auto_petSkillA','auto_petSkillB'].includes(leaf)){const main=leaf==='auto_petSkillA',s=main?v.active:v.passive,widget=n.components.find(c=>c.fields?.skillDesc)?.fields;if(!widget||!s)continue;const field=(key)=>nodes.find(r=>r.components.some(c=>c.pathID===widget[key]?.m_PathID));const name=field('skillNameLevel'),desc=field('skillDesc'),icon=field('skillIcon');if(name)bindings.set(name.id,{visible:true,text:s.szName+(main?' 1阶':'')});if(desc){bindings.set(desc.id,{visible:true,text:''});descriptions.push({id:desc.id,text:s.szDesc});}if(icon)bindings.set(icon.id,{visible:!!PET_PREVIEW_DATA.icons[s.iIconID],image:PET_PREVIEW_DATA.icons[s.iIconID]});states.set(widget.skillPos.m_PathID,main?0:1);}
  }
  const root=UnityRect.render(L.layouts.uipetinfo,L.sprites,{width:1080,height:1920,states,node:r=>{const p=r.path,leaf=p.split('/').at(-1);
   if(bindings.has(r.id))return bindings.get(r.id);
   const help=r.components.find(c=>c.fields?._helpID)?.fields._helpID;if(help&&[30,31].includes(help))return {action:'home26:pet-help:'+help,label:PET_PREVIEW_DATA.help[help].szTitle};
   if(['Auto_Follow','Auto_Lock','auto_discipleParent','auto_changeName','auto_changeDisciple','auto_chuzhan','auto_left','auto_right','auto_full','auto_break','auto_upgrade','auto_delete','auto_abilityParent'].includes(leaf))return {visible:false};
   if(leaf==='auto_bg')return {rect:{m_SizeDelta:{x:1072,y:1150}}};
   if(leaf==='auto_guanbi')return {action:'home26:close',label:'返回攻略'};
   if(leaf==='auto_Name')return {text:v.pet.szName};
   if(leaf==='auto_level')return {text:'等级：1/'+v.pet.iLevelLimit};
   if(leaf==='auto_exp')return {text:'0/'+v.level.iNeedExp};
   if(leaf==='auto_StarPrizeProgress')return {fill:0};
   if(['auto_break1','auto_break2'].includes(leaf))return {className:'pet-preview-inactive'};
   if(leaf==='auto_petSkillA')return {visible:!!v.active};if(leaf==='auto_petSkillB')return {visible:!!v.passive};
   if(leaf==='auto_emptySkillA')return {visible:!v.active};if(leaf==='auto_emptySkillB')return {visible:!v.passive};
   if(p.includes('/auto_petSkill')&&['name','detail','level'].includes(leaf))return {visible:false};
   if(/^auto_attr(Name|Val)[1-6]$/.test(leaf)){const i=+leaf.at(-1)-1,a=i<3?v.level.arrAddProp:v.level.arrExtraProp,k=i%3*2;return {text:leaf.includes('Name')?COMBAT_EFFECTS_DATA.attributes[a[k]]:PetInfoPreview.attribute(a[k],a[k+1]),...(i>=3?{className:'pet-preview-inactive'}:{})};}
   if(['auto_additionTip','auto_additionIcon'].includes(leaf))return {className:'pet-preview-inactive'};
   return {};
  }});root.classList.add('home-source-dialog','pet-preview-source');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',v.pet.szName+' · 灵宠详情');canvas.append(root);
  const byId=id=>root.querySelector(`[data-source-id="${id}"]`);
  for(const d of descriptions){const e=byId(d.id);e.style.cssText+=';position:relative;left:0;top:0;width:100%;height:100%;transform:none;pointer-events:auto;';e.innerHTML=`<div class="pet-preview-description">${rich(d.text)}</div>`;}
  const actor=[...root.querySelectorAll('[data-source-path]')].find(e=>e.dataset.sourcePath.endsWith('/auto_tranRole'));if(v.icon)actor.innerHTML=`<img class="pet-preview-portrait" src="${esc(v.icon)}" alt="${esc(v.pet.szName)}">`;
  return root;
 }
 function help(canvas,id){const cfg=PET_PREVIEW_DATA.help[id];if(!cfg)return;const shade=document.createElement('button');shade.className='home-source-shade pet-help-shade';shade.dataset.home26='close';shade.setAttribute('aria-label','返回灵宠详情');canvas.append(shade);const root=UnityRect.render(L.layouts.uicommondesc,L.sprites,{width:1080,height:1920,node:r=>{const leaf=r.path.split('/').at(-1);if(leaf==='Auto_Title')return {text:cfg.szTitle};if(leaf==='Auto_Content')return {text:''};if(r.path==='/UICommonDesc/Text (TMP)')return {text:'点击空白区域关闭'};return {};}});root.classList.add('home-source-dialog','pet-help-source');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',cfg.szTitle);canvas.append(root);const e=[...root.querySelectorAll('[data-source-path]')].find(e=>e.dataset.sourcePath.endsWith('/Scroll View'));e.innerHTML=`<div class="pet-help-content">${rich(cfg.szContent)}</div>`;}
 return {render,help};
})();
