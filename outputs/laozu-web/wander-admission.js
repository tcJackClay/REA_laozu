/* UIDiscipleBirth layout and art. Draw samples are local reference data, not server odds. */
window.createWanderAdmission=function(B){
 'use strict';
 const D=window.BIRTH_LAYOUT_DATA,L=D.layouts.uidisciplebirth,U=window.UnityRect;
 const art=name=>Object.values(D.sprites).find(x=>x.name===name)?.file||'';
 for(const file of ['assets/birth-v10/closed-scroll/open-scroll-sheet.png','assets/birth-v10/closed-scroll/closed-scroll-loop.png','assets/birth-v10/disciple-female-idle-sheet.png']){const image=new Image();image.src=file;}
 const BASE=[60,20,500,30],GAINS=[10,10,500,5],LABELS=['攻击','防御','生命','速度'];
 let canvas=null,host=null,observer=null,popup=null,lastSave=0;
 const listeners=new AbortController();
 const current=()=>B.state().admission;
 function initial(){return {version:1,phase:'recruit',difficulty:9,maxDifficulty:9,stamina:45,cost:5,elapsed:0,points:[0,0,0,0],draws:0,profile:null,provenance:'reference-local-preview'};}
 function eligible(){const r=B.state().run;return !r||(r.phase==='prepare'&&r.prepare==='birth');}
 function save(){B.save();}
 function profile(){return current().profile;}
 function points(){return current().points;}
 function left(){return (profile()?.pointTotal||20)-points().reduce((a,b)=>a+b,0);}
 function node(root,suffix){return [...root.querySelectorAll('[data-source-path]')].find(e=>e.dataset.sourcePath.endsWith(suffix));}
 function content(root,suffix,html){const el=node(root,suffix);if(el)el.innerHTML=html;}
 function prep(){const a=current(),birth=a.phase==='birth',p=profile();
  const view=U.render(L,D.sprites,{width:1080,height:1920,node:r=>{
   const path=r.path,leaf=path.split('/').at(-1),point=path.match(/Point\/ListItem(?: \((\d+)\))?/),axis=point?[0,2,1,3][+(point[1]||0)]:-1;
   if(path==='/UIDiscipleBirth/Mask')return {visible:false};
   if(path==='/UIDiscipleBirth/Auto_Info')return {visible:birth};
   if(path==='/UIDiscipleBirth/Auto_EffRoot')return {visible:!birth};
   if(path.includes('/Auto_EffRoot/Auto_eff')||path.includes('/LevelEff')||path.includes('/auto_crush'))return {visible:false};
   if(path.endsWith('/Auto_ReadyInfo/Other'))return {visible:true};
   if(path.includes('/Other/')&&!path.includes('/Other/Auto_DifficultyRoot'))return {visible:false};
   if(path.endsWith('/Other/Auto_DifficultyRoot'))return {rect:{m_AnchoredPosition:{x:0,y:-340}}};
   if(leaf==='Auto_Difficulty'||leaf==='Tip'&&path.includes('/Auto_DifficultyRoot'))return {visible:false};
   if(leaf==='Auto_Next')return {action:'admit:difficulty:1',label:'提高游历难度',className:a.difficulty>=a.maxDifficulty?'admit-disabled':'admit-enabled'};
   if(leaf==='Auto_Last')return {action:'admit:difficulty:-1',label:'降低游历难度',className:a.difficulty<=1?'admit-disabled':'admit-enabled'};
   if(leaf==='Auto_Open')return {action:'admit:draw',label:B.state().rebirth?'重生':'招生',visible:a.phase==='recruit'};
   if(leaf==='Auto_PowerValue')return {text:a.stamina+'/'+a.cost};
   if(leaf==='Auto_CommonBackBtn')return {action:'admit:back',label:'返回山门'};
   if(leaf==='Auto_Strategy')return {action:'admit:help',label:'游历攻略'};
   if(path.includes('/Auto_Quality'))return {visible:false};
   if(leaf==='Placeholder')return {visible:false};
   if(leaf==='Name'&&path.includes('/NameInput'))return {text:p?.name||''};
   if(path.endsWith('/Auto_NameInputItem/tip'))return {action:'admit:rename',label:'修改弟子姓名'};
   if(path.endsWith('/Auto_Ability'))return {visible:false};
   if(leaf==='Auto_RemainPoint')return {text:String(left())};
   if(leaf==='Auto_Random')return {action:'admit:random',label:'随缘分配属性'};
   if(leaf==='Auto_CleanAllPoint')return {action:'admit:reset',label:'重置属性点'};
   if(leaf==='Auto_Confirm')return {action:'admit:accept',label:'录取'};
   if(path.includes('/Auto_AutoWander'))return {visible:false};
   if(leaf==='PointScroll'||(leaf==='Viewport'&&path.includes('/PointScroll/')))return {image:false};
   if(axis>=0){
    if(leaf==='sprite_Name')return {image:art(['ui_rx_gj','ui_rx_fy','ui_rx_sm','ui_rx_sd'][axis])};
    if(leaf==='text_InitCount')return {text:String(BASE[axis])};
    if(leaf==='text_AddCount')return {text:String(BASE[axis]+points()[axis]*GAINS[axis])};
    if(leaf==='text_SubCount')return {text:String(points()[axis])};
    if(leaf==='btn_Add')return {action:'admit:point:'+axis+':1',label:'增加'+LABELS[axis]};
    if(leaf==='btn_Sub')return {action:'admit:point:'+axis+':-1',label:'减少'+LABELS[axis]};
    if(leaf==='btn_Tip')return {action:'admit:tip:'+axis,label:LABELS[axis]+'加点说明'};
   }
   return {};
  }});
  for(const el of view.querySelectorAll('.unity-text')){const row=L.nodes.find(r=>r.id===el.parentElement.dataset.sourceId),c=row?.components.find(c=>'m_text'in c),color=c?.m_fontColor||c?.m_Color;if(color)el.style.setProperty('color',`rgba(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)},${color.a})`,'important');el.style.whiteSpace='pre';}
  const cost=node(view,'/Auto_PowerValue')?.querySelector('.unity-text');if(cost){cost.style.setProperty('color','#6bff27','important');cost.style.fontSize='34px';}
  for(const el of view.querySelectorAll('.admit-disabled'))el.disabled=true;
  node(view,'/Other/Auto_DifficultyRoot')?.insertAdjacentHTML('beforeend',`<span class="admission-difficulty-label">游历难度： <b>${a.difficulty}</b></span>`);
  if(birth){
   content(view,'/Auto_HeadIcon','<div class="admission-disciple" role="img" aria-label="新入学弟子"></div>');
   const bar=node(view,'/Auto_NameInputItem');if(bar)bar.insertAdjacentHTML('beforeend',`<span class="admission-quality">优</span>`);
   content(view,'/floor_dz_bk',`<div class="admission-traits">${window.Cultivation.traitHTML(p)}</div>`);
   view.insertAdjacentHTML('beforeend',`<button class="admission-auto" disabled aria-label="一键游历未开放" style="background-image:url('${art('rxda_huang')}')">一键游历</button>`);
  }
  return view;
 }
 function draw(){if(!canvas)return;const a=current();canvas.replaceChildren();canvas.dataset.phase=a.phase;canvas.dataset.opening=String(a.phase==='drawing');
  if(a.phase!=='birth'){
   canvas.insertAdjacentHTML('beforeend',`<div class="admission-clouds" aria-hidden="true"><img src="assets/birth-v10/closed-scroll/cloud1-grey.png" alt="" width="829" height="336" draggable="false"><img src="assets/birth-v10/closed-scroll/cloud2-grey.png" alt="" width="671" height="456" draggable="false"><img src="assets/birth-v10/closed-scroll/cloud3-grey.png" alt="" width="439" height="213" draggable="false"></div><div class="admission-scroll" aria-hidden="true"></div>`);
  }
  canvas.append(prep());
  if(a.phase==='drawing'){
   canvas.dataset.opening='true';canvas.insertAdjacentHTML('beforeend',`<div class="admission-opening" aria-hidden="true"></div><span class="admission-status" role="status">招生中</span>`);
   for(const el of canvas.querySelectorAll('button'))el.disabled=true;
  }
  if(popup){const panel=document.createElement('div');panel.className='admission-modal';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label',popup.title);panel.innerHTML=`<section><h2>${popup.title}</h2>${popup.rename?`<label>弟子姓名<input id="admission-name" maxlength="12" value="${B.escape(profile().name)}"></label>`:`<p>${B.escape(popup.text)}</p>`}<button data-original-action="admit:close">${popup.rename?'保存':'知道了'}</button></section>`;canvas.append(panel);panel.querySelector('input,button')?.focus();}
 }
 function setPoints(v){const a=current();a.points=v;const r=B.state().run;if(r?.config)r.config.points=[...v];save();draw();}
 document.addEventListener('click',e=>{if(!canvas)return;const target=e.target.closest('[data-cultivation-trait]');if(target&&canvas.contains(target))window.Cultivation.tip(target,canvas);else canvas.querySelector('.cultivation-tooltip')?.remove();},{signal:listeners.signal});
 function action(name){const a=current();if(!canvas||!name.startsWith('admit:'))return;if(a.phase==='drawing')return;
  const [_,act,value,delta]=name.split(':');
  if(act==='back'){if(B.state().rebirth?.stage==='ready'){delete B.state().rebirth;save();}popup=null;return B.switchTab('sect');}
  if(act==='close'){if(popup?.rename){const name=canvas.querySelector('input')?.value.trim();if(!name)return;profile().name=name;B.state().disciples[B.state().run.config.disciple].name=name;save();}popup=null;draw();return;}
  if(act==='help')popup={title:'游历攻略',text:'招生获得一名培养中的弟子。分配属性，选择主辅功法和随行长老后启程。游历中的法宝、神通和奇遇会持续培养这名弟子。'};
  if(act==='rename'&&profile())popup={title:'修改姓名',rename:true};
  if(act==='tip')popup={title:LABELS[+value]+'加点',text:'每点增加'+GAINS[+value]+'点'+LABELS[+value]+'。加点的百分比加成在进入游历后生效。'};
  if(act==='difficulty'){a.difficulty=Math.max(1,Math.min(a.maxDifficulty,a.difficulty+(+value)));save();}
  if(act==='draw'){if(a.phase!=='recruit')return;
   if(a.stamina<a.cost){popup={title:'体力不足',text:'当前体力不足，暂时无法招生。'};draw();return;}
   if(B.state().rebirth?.stage==='ready'){try{a.rebirthProfile=DiscipleAdvanced.drawRebirth(B.state());}catch(e){popup={title:'无法重生',text:e.message};draw();return;}}if(B.state().homeV26){B.state().homeV26.staminaSpent=(B.state().homeV26.staminaSpent??a.draws*a.cost)+a.cost;if(a.stamina>=(window.HOME_MANAGEMENT_DATA?.Stamina.find(x=>x.iSect===B.state().sect)?.iStaminaLimit||40))B.state().homeV26.staminaAt=Date.now();}a.stamina-=a.cost;a.phase='drawing';a.elapsed=0;a.draws++;save();draw();return;
  }
  if(act==='point'){const axis=+value,d=+delta;if(d>0&&left()<=0)return;if(d<0&&!points()[axis])return;const v=[...points()];v[axis]+=d;return setPoints(v);}
  if(act==='reset')return setPoints([0,0,0,0]);
  if(act==='random'){const v=[0,0,0,0];for(let i=0;i<profile().pointTotal;i++)v[Math.floor(Math.random()*4)]++;return setPoints(v);}
  if(act==='accept'){
   if(left()){popup={title:'请先分配属性',text:'点数未分配完，请继续分配！'};draw();return;}
   const r=B.state().run;r.config.points=[...points()];r.config.birthBase=[...BASE];r.config.birthGains=[...GAINS];r.prepare='seed';r.popup={type:'seed'};a.phase='accepted';save();return B.render();
  }
  draw();
 }
 function reveal(){const a=current();if(a.phase!=='drawing')return;
  a.phase='birth';a.elapsed=2;a.points=[0,0,0,0];
  a.profile=a.rebirthProfile?{...a.rebirthProfile,pointTotal:20+(window.ClanProgress?.totals(B.state()).attributes[1007]||0)}:{...window.Cultivation.randomProfile(),level:1,element:4,talent:'玄火灵体',quality:'优',localID:'local-wander-'+Date.now()+'-'+a.draws,pointTotal:20+(window.ClanProgress?.totals(B.state()).attributes[1007]||0),birthBase:[...BASE],appearance:'wanzitou-chen-hei',isWanderFinish:false};
  if(B.state().run?.phase==='prepare')B.state().run=null;
  B.begin(a.profile);const r=B.state().run;r.config.birthGains=[...GAINS];r.config.birthBase=[...BASE];save();draw();
 }
 const api={mount(target){
   canvas=null;host=null;observer?.disconnect();if(!eligible()){document.querySelector('#app').dataset.admission='false';return false;}
   const s=B.state();if(!s.admission||s.admission.version!==1)s.admission=initial();else if(s.admission.phase==='accepted'&&!s.run){const old=s.admission;s.admission={...initial(),stamina:old.stamina,difficulty:old.difficulty,maxDifficulty:old.maxDifficulty,draws:old.draws};}
   if(s.admission.phase==='accepted'&&s.run?.prepare==='birth')s.admission.phase='birth';
   if(!['recruit','drawing','birth'].includes(s.admission.phase)){document.querySelector('#app').dataset.admission='false';return false;}
   document.querySelector('#app').dataset.admission='true';target.innerHTML='<section id="admission-view" aria-label="招生与入学档案"><div class="admission-stage"></div></section>';host=target.querySelector('#admission-view');canvas=host.firstElementChild;
   const resize=()=>{if(canvas)canvas.style.transform=`scale(${host.clientWidth/1080})`;};resize();observer=new ResizeObserver(resize);observer.observe(host);draw();save();return true;
  },tick(dt){const a=current();if(!canvas||a?.phase!=='drawing')return;a.elapsed+=dt;const frame=Math.min(23,Math.floor(a.elapsed/1.333333373*24)),opening=canvas.querySelector('.admission-opening');if(opening)opening.style.backgroundPosition=`${frame%6/5*100}% ${Math.floor(frame/6)/3*100}%`;lastSave+=dt;if(a.elapsed>=2)reveal();else if(lastSave>.2){lastSave=0;save();}},busy:()=>!!canvas&&current()?.phase==='drawing',active:()=>!!canvas,unmount(){canvas=null;host=null;observer?.disconnect();document.querySelector('#app').dataset.admission='false';},text:()=>current()?structuredClone(current()):null};
 api.dispose=()=>{api.unmount();listeners.abort();};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-original-action^="admit:"]');if(b&&!b.disabled)action(b.dataset.originalAction);},{signal:listeners.signal});
 document.addEventListener('keydown',e=>{if(!canvas||e.repeat||e.target.matches('input,textarea'))return;if(e.key==='Escape'){e.preventDefault();if(popup){popup=null;draw();}else action('admit:back');}if(e.code==='Space'&&current()?.phase==='recruit'){e.preventDefault();action('admit:draw');}},{signal:listeners.signal});
 return api;
};
