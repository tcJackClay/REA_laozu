window.createHomeManagement=function(B){
 const M=createHomeModel(B),D=HOME_MANAGEMENT_DATA,L={layouts:{...HOME_MANAGEMENT_LAYOUTS.layouts,...Object.fromEntries(Object.entries(window.TEACHER_AWAKE_LAYOUTS?.layouts||{}).filter(([k])=>['uiteacher','uiteacherinfo'].includes(k)))},sprites:{...HOME_MANAGEMENT_LAYOUTS.sprites,...window.TEACHER_AWAKE_LAYOUTS?.sprites}},U=UnityRect,esc=Cultivation.esc,rich=Cultivation.rich;
 const AM=createTeacherAwakeModel({...B,balance:M.balance,add:M.add,gate:M.gate,lockText:M.lockText,level:M.level});
 const TSM=createTeacherDiscipleSkinModel({...B,balance:M.balance,add:M.add,gate:M.gate,lockText:M.lockText,level:M.level,good:M.good});
 const MM=createMonthCardModel({...B,balance:M.balance,add:M.add});
 const CardEvents=createMonthCardEvents({...B,model:MM,gate:M.gate,badge:paintCardReddot,guide:()=>!!(B.state().strongGuideActive||B.state().colliderGuideActive),available:()=>!!canvas?.isConnected&&!page&&!detail&&!B.state().warehouseV54?.result&&!document.querySelector('dialog[open], [role=dialog]'),show:()=>{detail={type:'trial-card',popup:1010};redraw();},changed:()=>B.render()});window.MonthCardNotifications=CardEvents;let cardTimer=null;
 let warehouseOrigin=null;
 const MonthUI=createMonthCardUI({model:MM,tile:(...args)=>Warehouse.tile(...args),render:()=>B.render()});
 const TrialUI=createTrialCardUI({model:MM,tile:(...args)=>Warehouse.tile(...args),render:()=>B.render()});
 const Warehouse=createWarehousePage({...B,overlay:()=>page==='market'||!!warehouseOrigin,balance:M.balance,add:M.add,gate:M.gate,lockText:M.lockText,level:M.level,jump:resourceJump,inspect:warehouseInspect,close:()=>{detail=!!warehouseOrigin?{type:warehouseOrigin}:null;warehouseOrigin=null;redraw();}});
 let warehouseRendering=false;
 function warehouseParent(parent){if(!!warehouseOrigin&&parent?.type==='warehouse'&&!Warehouse.text().view&&!Warehouse.text().result){const type=warehouseOrigin;warehouseOrigin=null;return {type};}return page==='market'&&parent?.type==='warehouse'&&!Warehouse.text().view&&!Warehouse.text().result?null:parent;}
 function warehouseContext(d=detail){while(d){if(d.warehouseKind)return d;d=d.parent;}return null;}
 function warehouseInspect(id){
  const g=RESOURCE_DATA.Goods.find(g=>g.iGoodsID===id);if(!g)return false;
  if(g.iSubClass===16&&AncestorPreview.byGoods(id)){detail={type:'warehouse-ancestor',id:AncestorPreview.byGoods(id).iID,parent:{type:'warehouse'}};redraw();return true;}
  if(g.iSubClass===13&&WarehouseSpecial.gem(id)){detail={type:'warehouse-gem',id,parent:{type:'warehouse'}};redraw();return true;}
  if(g.iSubClass===2&&AntiqueRules.cfg(id)){WarehouseAntique.openTip(id);detail={type:'warehouse-antique',id,parent:{type:'warehouse'}};redraw();return true;}
  const skin=g.iSubClass===17?HOME_DETAIL_DATA.TeacherSkin.find(s=>s.iID===g.arrParam?.[0]):null,kind=skin?'teacher':g.iSubClass===1?'seed':g.iSubClass===3?'teacher':null;if(!kind)return false;
  const rows=kind==='seed'?CULTIVATION_DATA.seeds:TEACHER_DATA.teachers,x=rows.find(x=>skin?x.iID===skin.iTeacherID:x.arrCost1[0]===id||x.iID===id);if(!x)return false;
  detail={type:'warehouse-collection',id:x.iID,warehouseKind:kind,readOnly:true,...(skin?{skin:skin.iID,skins:true,tipSkin:true}:{}),parent:{type:'warehouse'}};redraw();return true;
 }

 const Clan=createClanPage({...B,resourceBridge:{balance:M.balance,gate:M.gate,lockText:M.lockText,jump:resourceJump},back:()=>{page=null;detail=null;B.render();}});
 const Market=createMarketPage({...B,warehouse:Warehouse,openWarehouse:(id,mode)=>{Warehouse.reset();detail={type:'warehouse'};if(mode==='batch')Warehouse.openBatch(id);else if(mode==='info')Warehouse.open(id);else redraw();},openResource:(id,info=false)=>{detail={type:info?'resource-info':id===3?'stamina':'recharge',id};redraw();},balance:M.balance,add:M.add,gate:M.gate,lockText:M.lockText,jump:resourceJump,back:()=>{page=null;detail=null;B.render();}});
 const Fairy=createFairylandPage({...B,balance:M.balance,add:M.add,gate:M.gate,lockText:M.lockText,back:()=>{page=null;detail=null;B.render();}});
 const Antique=createAntiquePage({...B,balance:M.balance,add:M.add,gate:M.gate,lockText:M.lockText,jump,back:()=>{page=null;detail=null;B.render();}});
 const WarehouseAntique=createAntiquePage({...B,balance:M.balance,add:M.add,gate:M.gate,lockText:M.lockText,jump,back:()=>{detail=warehouseParent({type:'warehouse'});B.render();}});
 const Pets=createPetPage({...B,balance:M.balance,add:M.add,gate:M.gate,lockText:M.lockText,back:()=>{page=null;detail=null;B.render();}});
 const events=new AbortController();
 let currentProfile=null,currentBuildings=null,currentReadiness=[];
 let canvas=null,page=null,detail=null,filter=0,sort=5,reverse=false,combo=false,expanded=false,leftFold=false,rightFold=false;
 const comboScroll={};
 const art=name=>Object.values(L.sprites).find(x=>x.name===name)?.file||HOME_DATA.assets[name]||PORTAL_DATA.assets[name]||'';
 const icon=id=>{const n=ALIGNED_STAGE_DATA.icons.find(x=>x.nID===+id)?.strIconName;return art(n);};
 const btn=(a,text,disabled=false)=>`<button data-home26="${a}" ${disabled?'disabled':''}>${text}</button>`;
 const el=(root,suffix)=>[...root.querySelectorAll('[data-source-path]')].find(x=>x.dataset.sourcePath.endsWith(suffix));
 const slot=(root,suffix,html)=>{const n=el(root,suffix);if(n){n.replaceChildren();n.insertAdjacentHTML('beforeend',html);}return n;};
 const redraw=()=>{window.SourceLinks?.close();const motion=window.PetMotion?.snapshot();B.render();if(motion)PetMotion.restore(motion);};
 function node(r){const state=currentBuildings?.overrides.get(r.id);if(state)return {...state,...(r.path.endsWith('/auto_wenwuBtn')?{action:'home26:antique',label:'古宝'}:{})};const p=r.path,leaf=p.split('/').at(-1),pr=currentProfile||M.profile();
  if(leaf==='Auto_Photo')return {visible:false};
  if(p.endsWith('/auto_PlayerHead/touxiang'))return {visible:true,image:icon(pr.avatar.iIcon)};
  if(leaf==='auto_PlayerHead')return {action:'home26:avatar',label:'更换老祖头像'};
  if(leaf==='Auto_NameEdit')return {action:'home26:rename',label:'修改姓名'};
  if(leaf==='Auto_Name')return {text:pr.name};
  if(leaf==='Auto_Power')return {text:'战力：'+number(pr.power)};
  if(leaf==='Auto_LevelTxt')return {text:'老祖：'+pr.level+'级'};
  if(leaf==='auto_SectV2Level')return {text:pr.level+'级'};
  if(p.includes('/auto_TopResBar/')){const n=+(p.match(/Res \((\d+)\)/)?.[1]||0),id=[2,1,3][n-1];
   if(n===4)return {visible:false};
   if(id&&leaf==='Num')return {text:id===3?M.balance(3)+'/'+pr.staminaLimit:number(M.balance(id))};
   if(id&&leaf==='Icon')return {image:PORTAL_DATA.goods.find(x=>x.iGoodsID===id)?.image||icon(ALIGNED_STAGE_DATA.goods.find(x=>x.iGoodsID===id)?.iIconID),action:'home26:resource:'+id,label:M.good(id).szName};
   if(id&&leaf.startsWith('Add'))return {action:'home26:'+(id===3?'stamina':id===2?'recharge':'resource:'+id),label:id===3?'购买体力':'获取'+M.good(id).szName};
  }

  if(leaf==='auto_petBtn')return {action:'home26:pet',label:'灵宠管理'};
  if(leaf==='auto_wenwuBtn')return {action:'home26:antique',label:'古宝'};
  if(leaf==='auto_SeedingBtn')return {action:'home26:seed',label:'功法管理'};
  if(leaf==='auto_FairylandBtn')return {action:'home26:fairy',label:'福地'};
  if(leaf==='auto_UIMarket')return {action:'home26:market',label:'坊市'};
  if(leaf==='auto_ClanBtn')return {action:'home26:clan',label:'赐福'};
  if(leaf==='auto_TeacherBtn')return {action:'home26:teacher',label:'长老管理'};
  if(leaf==='auto_SectTask'){const t=M.sectTasks().find(x=>!x.claimed);return {visible:true,action:'home26:sect-task',label:'老祖任务',text:t?.szDesc||'老祖等级可提升'};}
  if(leaf==='auto_SectTaskProgress'){const t=M.sectTasks().find(x=>!x.claimed);return {visible:!!t,text:t?`（${t.progress}/${t.iComdition}）`:''};}
  if(leaf==='auto_MainTaskEntry')return {visible:!!M.mainTask()?.iDisMode};
  if(p.endsWith('/auto_MainTaskEntry/click_area'))return {visible:true};
  if(p.includes('/auto_MainTaskEntry/'))return {visible:false};
  if(p.endsWith('/xia/zhong (1)/btn'))return {visible:false};
  if(p==='/UIMain/SectV2')return {rect:{m_AnchoredPosition:{x:-478.5,y:M.mainTask()?.iDisMode?568.5:470}}};
  if(['LeftDownRoot','LeftBtnGroup','IconGroupLeft','auto_rTopRoot'].includes(leaf))return {visible:false}; // dynamic FunctionIcon slots rendered from config below
  if(p.includes('Auto_PannelMask'))return {visible:false};
  if(leaf==='auto_warehouseBtn')return {visible:false};
  if(leaf==='auto_SectV2')return {action:'home26:sect-task',label:'老祖等级'};
  if(leaf==='WanderDifficulty')return {visible:!!B.state().run,text:B.state().admission?.difficulty||1};
  return null;
 }
 const number=n=>n>=10000?(n/10000).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+'万':String(Math.floor(n));
 function after(root,target){canvas=target;if(page){target.replaceChildren();renderPage();return;}
  // The original task component populates an empty container at runtime.
  const task=M.mainTask(),taskRoot=el(root,'/auto_MainTaskEntry/click_area');
  if(task&&task.iDisMode&&taskRoot){taskRoot.style.display='';taskRoot.innerHTML=`<button class="home-main-task" data-home26="main-task"><strong>新手</strong><span>${esc(task.szDesc)}<br>（${task.progress}/${task.iComdition}）</span>${task.progress>=task.iComdition?'<i class="home-red-dot">!</i>':''}</button>`;}
  target.insertAdjacentHTML('beforeend',sideHTML());paintCardReddot(CardEvents.daily());if(!cardTimer)cardTimer=setInterval(()=>{if(canvas?.isConnected)CardEvents.tick();},250);
  // Suppress prefab editor lock overlays only when that FunctionButton is actually unlocked.
  for(const r of ORIGINAL_LAYOUT_DATA.layouts.uimain.nodes){const ids=r.components.flatMap(c=>c.fields?._funcIDs||[]);if(!ids.length)continue;const n=el(root,r.path);if(!n)continue;const open=ids.some(M.gate);n.dataset.functionOpen=String(open);if(!open&&n.dataset.originalAction?.startsWith('home26:'))n.setAttribute('aria-label',n.getAttribute('aria-label')+'（'+M.lockText(ids[0])+'）');}
  currentReadiness=SourceHomeReadiness.render(root,M,B.state(),AM);
  if(detail)renderDialog();
 }
 function paintCardReddot(ids){const button=canvas?.querySelector('[data-home26="side:9"]');if(!button)return;const key=ids.join(',');if(button.dataset.cardRewards===key)return;button.dataset.cardRewards=key;button.querySelector('.home-card-readiness')?.remove();if(!ids.length)return;const x=D.FunctionIcon.find(x=>x.nID===9),conf=MONTH_CARD_HINTS.reddot,settings=HOME_READINESS_DATA.settings[conf.arrStyleParams[1]],name=settings.ResRef.path.split('/').at(-1).replace('.prefab','').toLowerCase(),layout=HOME_READINESS_LAYOUTS.layouts[name],badge=U.render(layout,HOME_READINESS_LAYOUTS.sprites,{width:button.clientWidth,height:button.clientHeight,node:n=>n.parentID===null?{rect:{m_AnchoredPosition:{x:x.arrReddotPos[0],y:x.arrReddotPos[1]}}}:{}});badge.classList.add('home-card-readiness');badge.dataset.reddotId=conf.iID;badge.dataset.cardIds=key;badge.setAttribute('role','img');badge.setAttribute('aria-label','月卡每日奖励可领取');Object.assign(badge.style,{position:'absolute',inset:0,pointerEvents:'none'});button.style.position='relative';button.append(badge);}
 function sideHTML(){const groups=M.sideIcons();const side=(group,fold)=>{const rows=groups.filter(x=>group.includes(x.iGroupID));return rows.slice(0,fold?1:undefined).map(x=>`<button data-home26="side:${x.nID}" aria-label="${esc(x.szName)}">${icon(x.iIconID)?`<img src="${icon(x.iIconID)}" alt="">`:''}<span>${esc(x.szName)}</span></button>`).join('');};
  return `<aside class="home-side home-left">${side([2],leftFold)}${groups.some(x=>x.iGroupID===2)?btn('fold-left',leftFold?'⌄':'⌃'):''}</aside><aside class="home-side home-right">${side([3],rightFold)}${groups.some(x=>x.iGroupID===3)?btn('fold-right',rightFold?'⌄':'⌃'):''}</aside><aside class="home-side home-top-activities">${side([1],false)}</aside><aside class="home-side home-low-activities">${side([6],false)}</aside><div class="home26-shortcuts">${btn('mail',`<img src="${art('icon_main_youjian')}" alt="">邮件`)}${btn('warehouse',`<img src="${art('icon_main_cangku')}" alt="">仓库`)}${btn('expand',`<img src="${art('ui_zjm_kuozhan')}" alt="">${expanded?'收起':'展开'}`)}</div>${expanded?`<div class="home-expanded">${side([5],false)}${btn('settings','设置')}${btn('main-task','任务')}${btn('sect-task','老祖')}${btn('seed','功法')}${btn('teacher','长老')}${btn('expand','收起')}</div>`:''}`;
 }
 function layout(name,cb){return U.render(L.layouts[name],L.sprites,{width:1080,height:1920,node:cb});}
 function open(kind){const id=kind==='pet'?52:kind==='antique'?3:kind==='seed'?2:kind==='teacher'?15:kind==='clan'?4:kind==='market'?13:kind==='fairy'?25:0;if(id&&!M.gate(id)){if(D.FunctionOpen.find(f=>f.iID===id)?.iLockTipType===1)B.toast(M.lockText(id));return;}if(kind==='pet')Pets.reset();if(kind==='antique')Antique.reset();if(kind==='clan')Clan.reset();if(kind==='market')Market.reset();if(kind==='fairy')Fairy.reset();page=kind;detail=null;filter=0;combo=false;redraw();}
 function row(id){return M.list(page).find(x=>x.iID===+id);}
 const levelText=n=>n<0?'未解锁':Math.floor(n/6)+'星'+n%6+'阶';
 function card(kind,x){const lv=M.level(kind,x.iID),cost=M.costs(kind,x.iID)[0],can=lv<(kind==='seed'?24:30)&&M.payment(kind,x.iID).enough;
  return `<button class="home-card quality-${x.iQuality} ${lv<0?'unowned':''}" data-home26="item:${x.iID}" aria-label="${esc(x.szName)}"><img src="${x.icon}" alt=""><span>${esc(x.szName)}</span><small>${levelText(lv)}</small>${cost?`<small>${M.balance(cost.id)}/${cost.n} 碎片</small>`:''}${can?'<i class="home-red-dot">!</i>':''}</button>`;
 }
 function renderPage(){if(page==='pet'){Pets.render(canvas);return;}if(page==='antique'){Antique.render(canvas);return;}if(page==='fairy'){Fairy.render(canvas);return;}if(page==='market'){Market.render(canvas);if(detail)renderDialog();return;}if(page==='clan'){Clan.render(canvas);return;}if(page==='sect-task'){renderSect();return;}
  const teacher=page==='teacher',name=combo?(teacher?'uiteachersuit':'uiseedlingsuit'):(teacher?'uiteacher':'uiallseedling'),root=layout(name,r=>{const p=r.path,leaf=p.split('/').at(-1);
   if(p.includes('/SortTypeList')||leaf==='Auto_Return'||leaf==='ListRoot')return {visible:false};
   if(/Resonance/.test(leaf))return {visible:M.gate(AM.gateId()),action:'home26:awake-resonance',label:'觉醒共鸣'};
   if(/Awake/.test(leaf))return {visible:false};
   if(leaf==='Auto_SortByOrder')return {action:'home26:reverse',label:'切换排序方向'};
   if(leaf==='Auto_SortOrderName')return {text:reverse?'倒序':'正序'};
   if(leaf==='SortType')return {action:'home26:sort',label:'切换排序方式'};
   if(leaf==='SortName')return {text:({1:'星阶',2:'可升星',3:'品质',4:'五行',5:'战力'})[sort]};
   if(leaf==='TitleDesBtn')return {action:'home26:help',label:'查看说明'};
   return {};
  });canvas.append(root);
  const viewport=combo?'/Scroll View/Viewport':teacher?'/Auto_Teacher/Viewport':'/Auto_Seedling/Viewport';
  const rows=M.list(page).filter(x=>x.icon&&(!filter||x.iTechnique===filter)&&CollectionOwnership.elementOpen(B.state(),x.iTechnique)).sort((a,b)=>{const up=x=>M.level(page,x.iID)<(teacher?30:24)&&M.payment(page,x.iID).enough;const power=x=>{let n=0;for(let i=0;i<(x.arrPower?.length||0);i+=2)if(M.level(page,x.iID)>=x.arrPower[i])n=x.arrPower[i+1];return n;};const value=x=>({1:M.level(page,x.iID),2:+up(x),3:x.iQuality,4:-x.iTechnique,5:(M.level(page,x.iID)>=0?1e9:0)+power(x)})[sort];return (reverse?-1:1)*(Number(up(b))-Number(up(a))||value(b)-value(a)||a.iID-b.iID);});
  if(combo)renderCombos(root,viewport,name);else slot(root,viewport,`<div class="home-catalog">${rows.map(x=>card(page,x)).join('')}</div>`);
  const selector=el(root,'/auto_ClassSelector');if(selector)selector.innerHTML=`<div class="home-filters">${['全部','金','木','水','火','土','雷','邪','体'].map((x,i)=>`<button data-home26="filter:${i}" aria-pressed="${i===filter}">${x}</button>`).join('')}</div>`;
  const nav=layout(teacher?'uiteachernavs':'uiseedlignavs',r=>{const leaf=r.path.split('/').at(-1);if(leaf==='auto_Back')return {action:'home26:back',label:'返回山门'};if(leaf==='Auto_NavBtn1')return {action:'home26:list',label:teacher?'长老列表':'功法列表'};if(leaf==='Auto_NavBtn2')return {action:'home26:combo',label:teacher?'长老组合':'功法组合'};if(leaf==='Auto_NabBtn3')return {visible:false};return {};});canvas.append(nav);
  if(!el(nav,'/auto_Back'))canvas.insertAdjacentHTML('beforeend',`<button class="home-page-back" data-home26="back"><img src="assets/btn_fanhui.png" alt="返回山门"></button>`);
  if(teacher&&M.gate(AM.gateId()))canvas.insertAdjacentHTML('beforeend',`<div class="home-resonance-entry">${btn('awake-resonance','觉醒共鸣 · '+TeacherAwake.resonance(B.state()).level+'级')}</div>`);
  if(detail)renderDialog();
 }
 function sourceSubtree(name,suffix,width,height,node){
  const source=L.layouts[name],first=source.nodes.find(n=>n.path.endsWith(suffix)),nodes=source.nodes.filter(n=>n===first||n.path.startsWith(first.path+'/')).map(n=>n===first?{...n,parentID:null}:n);
  const result=U.render({nodes},L.sprites,{width,height,node:r=>r.id===first.id?{visible:true,rect:{m_AnchorMin:{x:0,y:1},m_AnchorMax:{x:0,y:1},m_Pivot:{x:0,y:1},m_AnchoredPosition:{x:0,y:0},m_SizeDelta:{x:width,y:height}},...node?.(r)}:node?.(r)});
  result.style.width=width+'px';result.style.height=height+'px';return result;
 }
 // StarLevelItem/Flex_StarsItem: six ordered image fragments per star, not text glyphs.
 function sourceStars(root,name,suffix,level,max){
  const source=L.layouts[name],anchor=source.nodes.find(n=>n.path.endsWith(suffix)),first=source.nodes.find(n=>n.path===anchor?.path+'/Stars/ListStar');
  if(!first)return;
  const collection=first.components.find(c=>c.fields?.m_GameObjects)?.fields.m_GameObjects||[],parts=new Map(collection.map((x,i)=>[String(x.m_PathID),i]));
  const size=first.components.find(c=>c.type==='RectTransform').m_SizeDelta;
  const holder=slot(root,suffix,'<div class="home-source-star-strip"></div>')?.firstElementChild;if(!holder)return;
  holder.setAttribute('role','img');holder.setAttribute('aria-label',level<0?'未解锁':levelText(level));holder.dataset.starLevel=level;holder.dataset.starMax=max;holder.style.display=level<0?'none':'flex';
  for(let i=0;i<max/6;i++){
   const count=Math.max(0,Math.min(6,level-i*6));
   const star=sourceSubtree(name,first.path,size.x,size.y,n=>parts.has(String(n.id))?{visible:parts.get(String(n.id))<count}:{});
   star.classList.add('home-source-star');star.dataset.starIndex=i;star.dataset.starParts=count;holder.append(star);
  }
 }
 function sourceSprite(r,index){const sw=r.components.find(c=>c.fields?.SpriteList),ref=sw?.fields.SpriteList[index];return ref?{image:L.sprites[ref.m_PathID]?.file}:{};}
 function sourceDetailRows(root,name,x,lv,max,teacher){
  if(teacher){
   const holder=slot(root,'/Auto_StarProps','<div class="home-source-star-cards"></div>').firstElementChild;
   for(const n of [6,12,18,24,30]){const active=lv>=n,card=sourceSubtree(name,'/Auto_StarProps/ListItem',175,220,r=>{
    const leaf=r.path.split('/').at(-1);
    if(leaf==='xauto_bg'||leaf==='xauto_star')return sourceSprite(r,active?0:1);
    if(leaf==='xauto_level')return {text:String(n/6)};
    if(leaf==='xauto_Str')return {text:teacherStar(x,n).replace(/<br>/g,'\n'),color:active?{r:0.282,g:0.557,b:0.129,a:1}:{r:0.478,g:0.467,b:0.447,a:1}};
    if(leaf==='xauto_locker')return {visible:!active};
    if(leaf==='xauto_LockRoot')return {visible:false};
    return {};
   });card.classList.add('home-source-star-card');card.dataset.active=String(active);holder.append(card);}
  }else{
   const holder=slot(root,'/Auto_PropList','<div class="home-source-attribute-rows"></div>').firstElementChild;
   for(const a of [x.arrSecondAttribute1,x.arrSecondAttribute2,x.arrSecondAttribute3].filter(a=>a?.length>1)){
    const row=sourceSubtree(name,'/Auto_PropList/ListItem',485,40,r=>{const leaf=r.path.split('/').at(-1);
     if(leaf==='xauto_icon')return sourceSprite(r,a[0]-2001);
     if(leaf==='xauto_Name')return {text:TEACHER_DATA.attributes.find(t=>t.iAtrributeID===a[0])?.szAttrName||String(a[0])};
     if(leaf==='xauto_curValue')return {text:String(lv<0?0:a[Math.min(lv+1,a.length-1)])};
     if(leaf==='xauto_upValue')return {visible:lv<max,text:String(a[Math.min(lv+2,a.length-1)])};
     if(leaf==='xauto_jiantou')return {visible:lv<max};
     return {};
    });holder.append(row);
   }
  }
 }
 function renderCombos(root,viewport,name){
  const holder=slot(root,viewport,'<div class="home-source-combos"></div>').firstElementChild;
  const positions=comboScroll[page]??={top:0,members:{}};holder.addEventListener('scroll',()=>{positions.top=holder.scrollTop;});
  for(const g of CollectionBonuses.groups(B.state(),page)){
   const elementMask=page==='seed'?D.SeedlingGroup.find(x=>x.iID===g.id).iActiveFiveElements:0,elementCount=[1,2,3,4,5,6,7,8].filter(e=>elementMask&(1<<(e-1))).length;
   const group=sourceSubtree(name,'/ListSuit',1080,780,r=>{if(r.path.endsWith('/xauto_suitName'))return {text:g.name};if(r.path.endsWith('/xauto_elementList'))return {rect:{m_SizeDelta:{x:elementCount*60,y:71}}};if(page==='seed'&&r.path.endsWith('/baseEffect/title/txt'))return {rect:{m_SizeDelta:{x:450,y:38}}};return {};});group.classList.add('home-combo','home-native-combo');holder.append(group);
   const cards=slot(group,'/ListSuit/Scroll View/Viewport','<div class="home-suit-members"></div>').firstElementChild;
   cards.addEventListener('scroll',()=>{positions.members[g.id]=cards.scrollLeft;});
   for(const id of g.ids){const x=row(id);if(!x)continue;const lv=M.level(page,id),pay=M.payment(page,id),cost=M.costs(page,id)[0];
    const member=sourceSubtree(name,'/ListSuitItem',239,369,r=>{const leaf=r.path.split('/').at(-1);
     if(leaf==='ListSuitItem')return {action:`home26:combo-item:${id}:${g.id}`,label:x.szName};
     if(['Frame','frame01','Prop','Prop_TechniqueIcon'].includes(leaf)){const c=r.components.find(c=>c.fields?.SpriteList),ref=c?.fields.SpriteList[['Frame','frame01'].includes(leaf)?x.iQuality:x.iTechnique],spr=L.sprites[ref?.m_PathID];return spr?{image:spr.file,visible:true}:{};}
     if(leaf==='Icon')return {image:page==='teacher'?(HOME_DETAIL_DATA.cardPortraits?.[B.state().teacherSkins?.[id]||x.iDefaultSkin]||x.icon):x.icon};if(leaf==='Name')return {text:x.szName};
     if(leaf==='Mask')return {visible:lv<0,image:HOME_DETAIL_DATA.cardPortraits?.[B.state().teacherSkins?.[id]||x.iDefaultSkin]||x.icon,className:'home-suit-locked-mask'};
     if(leaf==='mask')return {visible:lv<0};
     if(leaf==='Select')return {visible:false};
     if(['Red','xauto_red'].includes(leaf))return {visible:pay.enough&&lv<(page==='seed'?24:30)};
     if(['Frag','FragProgress'].includes(leaf))return {visible:lv<0};
     if(leaf==='Fill')return {fill:cost?.n?Math.min(1,M.balance(cost.id)/cost.n):0};
     if(leaf==='Value')return {text:cost?`${M.balance(cost.id)}/${cost.n}`:''};
     if(['unlock','Compose'].includes(leaf))return {visible:lv<0&&pay.enough};
     if(leaf==='Stars'||leaf==='starItem')return {visible:lv>=0};
     return {};
    });member.classList.add('home-suit-member');cards.append(member);
    sourceStars(member,name,page==='seed'?'/xauto_seedling/Stars':'/starItem',lv,page==='seed'?24:30);
   }
   if(page==='seed'){const cfg=D.SeedlingGroup.find(x=>x.iID===g.id),iconNode=L.layouts[name].nodes.find(n=>n.path.endsWith('/xauto_elementList/ListItem/xauto_icon')),sprites=iconNode?.components.find(c=>c.fields?.SpriteList)?.fields.SpriteList||[];slot(group,'/xauto_elementList',`<div class="home-suit-elements">${[1,2,3,4,5,6,7,8].filter(e=>cfg.iActiveFiveElements&(1<<(e-1))).map(e=>`<img src="${L.sprites[sprites[e]?.m_PathID]?.file||''}" alt="${['','金','木','水','火','土','雷','邪','体'][e]}">`).join('')}</div>`);}
   slot(group,'/xauto_effecttList',`<div class="home-suit-effects">${g.tiers.map(t=>`<p class="${t.active?'active':''}">${t.threshold===0?'集齐整组':`全组达到${t.threshold/6}星`}：${attr(t.id,t.value)} ${t.active?'已激活':'未激活'}</p>`).join('')}</div>`);
   cards.scrollLeft=positions.members[g.id]||0;
  }
  holder.scrollTop=positions.top;
 }
 function attr(id,v){const a=TEACHER_DATA.attributes.find(x=>x.iAtrributeID===id);return esc(a?.szAttrName||'属性 '+id)+' +'+([2001,2002,2003,2007].includes(id)?v:v/100+'%');}
 function itemBody(){const x=row(detail.id),lv=M.level(page,x.iID),next=lv+1,pay=M.payment(page,x.iID),teacher=page==='teacher',attributes=[x.arrSecondAttribute1,x.arrSecondAttribute2,x.arrSecondAttribute3].filter(a=>a?.length>1);
  const skill=!teacher?Cultivation.skill(x.iID,Math.max(0,lv)):null;
  return `<div class="home-item-hero"><img src="${x.icon}" alt=""><div><h2>${esc(x.szName)}</h2><p>${levelText(lv)} → ${levelText(next)}</p></div></div><section class="home-attributes">${attributes.map(a=>`<p>${attr(a[0],lv<0?0:a[Math.min(lv+1,a.length-1)])} → ${attr(a[0],a[Math.min(next+1,a.length-1)])}</p>`).join('')}</section>${skill?`<h3>${esc(skill.szName||'怒气技')}</h3><p>${rich(skill.szDesc)}</p>`:''}${teacher?`<h3>合成配方</h3>${(x.arrComposeID||[]).map(id=>{const r=TEACHER_DATA.recipes.find(r=>r.iFormID===id);return r?`<p>${[r.iMaterial0,r.iMaterial1,r.iMaterial2,r.iMaterial3,r.iMaterial4].filter(Boolean).map(equip).join(' + ')} → ${equip(r.arrProductID[0])}</p>`:'';}).join('')}`:''}<p>${rich(x.szStory||'')}</p><div class="home-costs">${pay.costs.map(c=>`<span>${esc(M.good(c.id).szName)} ${M.balance(c.id)}/${c.n}</span>`).join('')}</div>${btn('upgrade',lv<0?'合成':'升星',!pay.enough||lv>=(teacher?30:24))}${btn('obtain','去获取')}`;
 }
 function equip(id){const x=TEACHER_DATA.equipment.find(x=>x.id===id)||GAME_DATA.items.find(x=>x.id===id);return x?`<span class="home-recipe"><img src="${x.icon}" alt="">${esc(x.name)}</span>`:String(id);}
 function sourceItem(){
  const x=row(detail.id),teacher=page==='teacher',lv=M.level(page,x.iID),max=teacher?30:24,pay=M.payment(page,x.iID),unlocked=lv>=0,name=teacher?'uiteacherinfo':'uiseedlingupgrade';
  const source=L.layouts[name],states=new Map(),skill=teacher?null:Cultivation.skill(x.iID,Math.max(0,lv));
  for(const r of source.nodes)for(const c of r.components)if(c.fields?.SpriteList){const leaf=r.path.split('/').at(-1);if(/prop|SwitchBg|takeProp/i.test(leaf))states.set(c.pathID,x.iTechnique);else if(/quality|Auto_Bg/i.test(leaf))states.set(c.pathID,x.iQuality);}
  const shade=document.createElement('button');shade.className='home-source-shade';shade.dataset.home26='close';shade.setAttribute('aria-label','关闭详情');canvas.append(shade);
  const fields={auto_seedlingName:x.szName,auto_Name:x.szName,Auto_curLevel:lv===max?'满级':levelText(lv),auto_curLevel:levelText(lv),Auto_nextLevel:levelText(lv+1),auto_nextLevel:levelText(lv+1),Auto_UpgradeText:unlocked?'升星':teacher?'合成':'解锁',Auto_ViewText:detail.fullbody?(detail.skins?'切换':'详情'):'全身',auto_Power:String((x.arrPower||[]).reduce((v,n,i,a)=>i%2===0&&lv>=n?a[i+1]:v,0))};
  const attributeText=level=>[x.arrSecondAttribute1,x.arrSecondAttribute2,x.arrSecondAttribute3].filter(a=>a?.length>1).map(a=>attr(a[0],level<0?0:a[Math.min(level+1,a.length-1)])).join('\n');
  const recipe=teacher?TEACHER_DATA.recipes.find(r=>r.iFormID===x.arrComposeID?.[0]):null,discipleSkin=teacher?TSM.info(x.iID):null,frag=M.costs(page,x.iID)[0]||{id:0,n:1},fragCount=M.balance(frag.id);
  const root=U.render(source,L.sprites,{width:1080,height:1920,states,node:r=>{const p=r.path,leaf=p.split('/').at(-1);
   if(detail.readOnly&&leaf==='auto_QMoudle')return {visible:false};
   if(detail.readOnly&&(['Auto_UpgradeBtn','Auto_GetBtn','auto_leftBtn','auto_rightBtn','Auto_ViewSkin','Auto_Dress'].includes(leaf)||/Awake/.test(leaf)))return {visible:false};
   if(detail.tipSkin&&leaf==='Auto_ViewModel')return {visible:false};
   if(teacher){const skinNode=TeacherDiscipleSkinUI.node(r,discipleSkin,M);if(skinNode)return skinNode;}
   if(teacher){const tile=source.nodes.find(n=>n.path.endsWith('/auto_EquipRoot/Auto_Equip')&&(p===n.path||p.startsWith(n.path+'/'))),match=p.match(/^(.*\/auto_Formula\/equip([123]))(?:\/.*)?$/),id=tile?recipe?.arrProductID?.[0]:match?[recipe?.iMaterial0,recipe?.iMaterial1,recipe?.arrProductID?.[0]][+match[2]-1]:0;if(tile||match)return StrategyDetailUI.smallNode(source,L.sprites,r,tile?.path||match[1],COMBAT_EFFECTS_DATA.equipment[id],x);}
   if(leaf==='Auto_InfoRoot')return {visible:!detail.fullbody&&!detail.skins};
   if(!teacher&&p.endsWith('/Bg/Content'))return {rect:{m_SizeDelta:{x:870,y:790}}};
   if(!teacher&&leaf==='Auto_Skill')return {rect:{m_SizeDelta:{x:870,y:290}}};
   if(!teacher&&p.endsWith('/Auto_Skill/floor_gb_modi2/skillName'))return {text:skill?.szName||'',rect:{m_SizeDelta:{x:(skill?.szName||'').length*37,y:60}}};
   if(!teacher&&p.endsWith('/Auto_Skill/skillDes'))return {text:'',rect:{m_AnchorMin:{x:0,y:1},m_AnchorMax:{x:0,y:1},m_AnchoredPosition:{x:150,y:-79},m_SizeDelta:{x:715,y:205}}};
   if(!teacher&&p.endsWith('/Auto_Skill/skillBtn'))return {action:'home26:skill',label:'查看怒气技全部等级'};
   if(!teacher&&p.endsWith('/Auto_Skill/skillBtn/skilllcon'))return {image:DETAIL_PROGRESS_ICONS.icons[skill?.iIconID]};
   if(!teacher&&p.endsWith('/Content/LevelUp'))return {rect:{m_SizeDelta:{x:870,y:460}}};
   if(!teacher&&leaf==='Auto_LevelUp')return {rect:{m_SizeDelta:{x:0,y:420}}};
   if(!teacher&&['Auto_curLevel','Auto_nextLevel'].includes(leaf))return {text:fields[leaf],visible:leaf==='Auto_curLevel'||lv<max,rect:{m_SizeDelta:{x:130,y:36}}};
   if(!teacher&&p.endsWith('/Bg/GameObject'))return {rect:{m_AnchoredPosition:{x:-40,y:-130}}};
   if(leaf==='Auto_CloseBg')return {action:'home26:close',label:'关闭详情',image:false};
   if(leaf==='auto_leftBtn'||leaf==='auto_rightBtn')return {action:'home26:neighbor:'+(leaf==='auto_leftBtn'?-1:1),label:leaf==='auto_leftBtn'?'上一项':'下一项'};
   if(leaf==='Auto_UpgradeBtn')return {visible:lv<max&&(unlocked||pay.enough),action:'home26:upgrade',label:unlocked?'升星':teacher?'合成':'解锁'};
   if(leaf==='Auto_GetBtn')return {visible:!unlocked&&!pay.enough,action:'home26:obtain',label:'去获取'};
   if(leaf==='Auto_Upgrade')return {visible:lv<max};
   if(leaf==='auto_upgradeFinished')return {visible:lv===max};
   if(leaf==='Auto_UniversalFragmentRedDot')return {visible:pay.universal>0};
   if(leaf==='Auto_UnlockInfo')return {visible:unlocked};
   if(leaf==='Auto_lockInfo')return {visible:!unlocked};
   if(leaf==='Auto_Equiplock')return {visible:!unlocked};
   if(leaf==='Auto_Frag')return {visible:!teacher&&!unlocked};
   if(!teacher&&p.includes('/Auto_Frag/')&&leaf==='Fill')return {fill:Math.min(1,fragCount/frag.n)};
   if(!teacher&&p.includes('/Auto_Frag/')&&leaf==='Value')return {text:fragCount+'/'+frag.n};
   if(leaf==='Auto_Stars')return {visible:unlocked};
   if(leaf==='auto_nextLevelRoot'||leaf==='Auto_nextLevel')return {visible:lv<max,...(fields[leaf]!==undefined?{text:fields[leaf]}:{})};
   if(leaf==='auto_curPropStr')return {text:attributeText(lv)};
   if(leaf==='auto_nextPropStr')return {text:attributeText(lv+1)};
   if(leaf==='auto_lockAttrStr')return {text:attributeText(0)};
   if(leaf==='auto_seedlingIcon')return {image:x.icon};
   if(leaf==='auto_EquipRoot')return {action:'home26:recipe',label:'合成配方'};
   if(leaf==='Auto_Story'&&!teacher)return {action:'home26:story',label:'功法故事'};
   if(leaf==='Auto_StrageBtn')return {visible:!!x.arrStrategy?.length&&!detail.fullbody&&!detail.skins,action:'home26:strategy',label:'攻略'};
   if(leaf==='Auto_ViewModel')return {visible:!!HOME_DETAIL_DATA.portraits?.[detail.skin||B.state().teacherSkins?.[x.iID]||x.iDefaultSkin],action:'home26:fullbody',label:detail.fullbody?(detail.skins?'返回皮肤列表':'返回详情'):'查看全身'};
   if(leaf==='Auto_SwitchBg')return {visible:!detail.fullbody};
   if(leaf==='Auto_PoolContent')return {rect:{m_SizeDelta:{x:1080,y:13}}};
   if(leaf==='Auto_Pool')return {visible:!!detail.skins&&!detail.fullbody};
   if(detail.tipSkin&&['PoolLeftSwitch','PoolRightSwitch','Auto_ViewModel'].includes(leaf))return {visible:false};
   if(leaf==='PoolLeftSwitch'||leaf==='PoolRightSwitch'){const rows=HOME_DETAIL_DATA.TeacherSkin.filter(t=>t.iTeacherID===x.iID),i=rows.findIndex(t=>t.iID===(detail.skin||x.iDefaultSkin)),dir=leaf==='PoolLeftSwitch'?-1:1;return {visible:dir<0?i>0:i<rows.length-1,action:'home26:skin-neighbor:'+dir,label:dir<0?'上一套皮肤':'下一套皮肤'};}
   if(leaf==='auto_ShowBack')return {visible:!!detail.skins,action:'home26:skins-close',label:'返回长老详情'};
   if(leaf==='Auto_ViewSkin')return {visible:HOME_DETAIL_DATA.TeacherSkin.some(t=>t.iTeacherID===x.iID),action:'home26:skins',label:'长老皮肤'};
   if(leaf==='Auto_Dress'){const sid=detail.skin||x.iDefaultSkin,current=B.state().teacherSkins?.[x.iID]||x.iDefaultSkin;const owned=skinOwned(x,sid),skin=HOME_DETAIL_DATA.TeacherSkin.find(t=>t.iID===sid);return {visible:!!detail.skins&&(owned?sid!==current:!!skin?.iJumpId),action:owned?'home26:dress':'home26:skin-obtain',label:owned?'换装':'前往获取'};}
   if(leaf==='Auto_DressTxt')return {text:skinOwned(x,detail.skin||x.iDefaultSkin)?((B.state().teacherSkins?.[x.iID]||x.iDefaultSkin)===(detail.skin||x.iDefaultSkin)?'穿着中':'换装'):(HOME_DETAIL_DATA.TeacherSkin.find(t=>t.iID===(detail.skin||x.iDefaultSkin))?.iJumpId?'前往获取':'未获得')};
   if(/Awake/.test(leaf))return {visible:unlocked&&M.gate(AM.gateId()),action:'home26:awake',label:'长老觉醒'};
   if(['auto_QMoudle','Auto_Tog','auto_storyRoot'].includes(leaf))return {visible:false};
   if(leaf==='auto_Moudle')return {image:false};
   if(leaf==='Auto_PlaySpecialAnim')return {visible:false};
   if(fields[leaf]!==undefined)return {text:fields[leaf]};
   if(p.endsWith('/Auto_Story/Text (TMP)'))return {text:'故事'};
   if(p.endsWith('/Auto_StrageBtn/Text (TMP)'))return {text:'攻略'};
   if(p.endsWith('/Auto_GetBtn/Text'))return {text:'去获取'};
   if(p.endsWith('/Auto_Upgrade/ZuoZuoZuoZuo'))return {text:'升星消耗'};
   if(p.endsWith('/floor_gb_modi2/ZuoZuo'))return {text:'星阶'};
   if(p.endsWith('/LevelUp/floor_gb_modi2/titile'))return {text:'升星效果'};
   if(p.endsWith('/Text (TMP)')&&r.parentID===source.nodes[0].id)return {text:'点击空白区域关闭'};
   return {};
  }});
  root.classList.add('home-source-dialog','home-item-source',teacher?'home-teacher-source':'home-seed-source');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',x.szName);canvas.append(root);
  sourceMaterials(root,name,x,lv,max);
  sourceStars(root,name,'/Auto_Stars',lv,max);

  if(teacher){
   TeacherDiscipleSkinUI.inline(root,discipleSkin,canvas);
   if(unlocked&&M.gate(AM.gateId())&&!detail.fullbody&&!detail.skins)root.insertAdjacentHTML('beforeend',`<div class="home-awake-entry">${btn('awake','觉醒 · '+TeacherAwake.level(B.state(),x.iID)+'阶')}</div>`);
   const sid=detail.skins?(detail.skin||x.iDefaultSkin):(B.state().teacherSkins?.[x.iID]||x.iDefaultSkin),image=window.HOME_DETAIL_DATA?.portraits?.[sid]||window.HOME_DETAIL_DATA?.portraits?.[x.iDefaultSkin]||x.icon;
   if(detail.skins)sourceTeacherSkinPool(root,name,x,sid);
   slot(root,'/auto_Moudle',`<img class="home-teacher-portrait ${detail.fullbody?'full':''}" src="${image}" alt="${esc(x.szName)}">`);
   sourceDetailRows(root,name,x,lv,max,true);
  }else{
   sourceDetailRows(root,name,x,lv,max,false);
   slot(root,'/Auto_Skill/skillDes',`<div class="home-source-skill-description">${rich(skill?.szDesc||'')}</div>`);
   sourceSeedTiers(root,name,x,lv);
  }
 }
 function sourceTeacherSkinPool(root,name,x,selected){
  const skins=HOME_DETAIL_DATA.TeacherSkin.filter(t=>t.iTeacherID===x.iID&&(!detail.tipSkin||t.iID===detail.skin)),holder=slot(root,'/Auto_PoolContent','<div class="home-native-skins home-source-skin-pool"></div>').firstElementChild,current=B.state().teacherSkins?.[x.iID]||x.iDefaultSkin;
  for(const skin of skins){const owned=skinOwned(x,skin.iID),card=sourceSubtree(name,'/Auto_PoolContent/ListItem',262,400,n=>{const leaf=n.path.split('/').at(-1);
   if(leaf==='xauto_PoolItem')return {action:'home26:skin-pick:'+skin.iID,label:skin.szSkinName,image:false};
   if(leaf==='xauto_info')return {visible:true};if(leaf==='xauto_PoolName')return {text:skin.szSkinName};if(leaf==='xauto_des')return {text:skin.szDes};
   if(leaf==='xauto_icon')return {image:HOME_DETAIL_DATA.cardPortraits?.[skin.iID]||HOME_DETAIL_DATA.portraits?.[skin.iID]||x.icon,imageBorder:{x:0,y:0,z:0,w:0}};
   if(['xauto_frame','xauto_frameMask'].includes(leaf))return {...sourceSprite(n,skin.iQuality),visible:leaf==='xauto_frame'||!owned};
   if(leaf==='xauto_dressing')return {visible:owned&&skin.iID===current};if(n.path.endsWith('/xauto_dressing/ZuoZuoZuo'))return {text:'穿着中'};if(leaf==='xauto_UnlockTip')return {visible:false};return {};
  });card.classList.add('home-source-skin-card');const button=card.querySelector('[data-original-action]');button.dataset.home26=button.dataset.originalAction.slice(7);delete button.dataset.originalAction;button.setAttribute('aria-pressed',String(skin.iID===selected));holder.append(card);}
 }
 // Keep native sprites/spacing; browser text measurement supplies preferred height.
 function sourceSeedTiers(root,name,x,lv){
  const source=L.layouts[name],prefix='/Auto_LevelUp/ListItem',find=suffix=>source.nodes.find(n=>n.path.endsWith(prefix+suffix));
  const meta=find('').components.find(c=>c.fields?.Size),group=find('').components.find(c=>c.m_Padding),pad=group.m_Padding;
  const textNode=find('/xauto_upDes'),textConfig=textNode.components.find(c=>'m_text' in c),colors=textNode.components.find(c=>c.fields?.colors).fields.colors;
  const starNode=find('/Star/xauto_Star'),sw=starNode.components.find(c=>c.fields?.SpriteList).fields;
  const holder=slot(root,'/Auto_LevelUp','<div class="home-source-seed-tiers"></div>').firstElementChild,owner=detail;
  holder.addEventListener('scroll',()=>{owner.seedTierScroll=holder.scrollTop;});
  for(let index=0;index<4;index++){const active=index<Math.floor(Math.max(0,lv)/6),spriteIndex=index*2+(active?1:0),sprite=L.sprites[sw.SpriteList[spriteIndex].m_PathID],text=x['szStar'+(index+1)+'Des']||'',color=colors[active?0:1];
   const description=document.createElement('div');description.className='home-source-seed-tier-description';description.innerHTML=rich(text);description.style.fontSize=textConfig.m_fontSize+'px';description.style.color=`rgba(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)},${color.a})`;
   const probe=description.cloneNode(true);Object.assign(probe.style,{position:'fixed',left:'-10000px',top:'0',width:'600px',visibility:'hidden',fontFamily:getComputedStyle(root).fontFamily});document.body.append(probe);const textHeight=Math.ceil(probe.getBoundingClientRect().height);probe.remove();
   const h=Math.max(meta.fields.Size.y,Math.max(sprite.size[1],textHeight)+pad.m_Top+pad.m_Bottom),inner=h-pad.m_Top-pad.m_Bottom;
   const row=sourceSubtree(name,prefix,meta.fields.Size.x,h,n=>{const leaf=n.path.split('/').at(-1);
    if(leaf==='Star')return {rect:{m_SizeDelta:{x:200,y:inner}}};
    if(leaf==='xauto_Star')return {image:sprite.file,rect:{m_SizeDelta:{x:sprite.size[0],y:sprite.size[1]}}};
    if(leaf==='xauto_upDes')return {text:'',rect:{m_SizeDelta:{x:600,y:textHeight}}};
    if(leaf==='xauto_Slider')return {visible:index<3};return {};
   });row.classList.add('home-source-seed-tier');row.dataset.sourceTier=index+1;row.dataset.active=String(active);row.dataset.sourceSpriteIndex=spriteIndex;slot(row,'/xauto_upDes','').append(description);holder.append(row);
  }
  holder.scrollTop=owner.seedTierScroll||0;
 }
 function sourceMaterials(root,name,x,lv,max){
  const holder=slot(root,'/Auto_UpgradeList','<div class="home-source-materials"></div>').firstElementChild;
  for(const c of M.materialDisplay(page,x.iID)){const good=M.good(c.id),S=DETAIL_PROGRESS_LAYOUTS;
   const row=sourceSubtree(name,'/Auto_UpgradeList/ListItem',112,112,n=>n.path.endsWith('/Empty')?{visible:false}:{});
   row.classList.add('home-source-material');row.dataset.goodsId=c.id;row.dataset.have=c.have;row.dataset.need=c.need;
   const states=new Map();for(const n of S.layouts.goodsiconitem_upgrade.nodes)for(const k of n.components)if(k.fields?.SpriteList)states.set(k.pathID,good.iQuality||0);
   const tile=U.render(S.layouts.goodsiconitem_upgrade,S.sprites,{width:150,height:150,states,node:n=>{const leaf=n.path.split('/').at(-1);if(leaf==='GoodsIconItem_Upgrade')return {action:'home26:item-resource:'+c.id,label:good.szName};if(leaf==='icon1')return {image:DETAIL_PROGRESS_ICONS.icons[good.iIconID]};if(leaf==='corner'||leaf==='effect')return {visible:false};if(leaf==='num')return {text:''};return {};}});
   el(tile,'/num').querySelector('.unity-text').innerHTML=lv===max?'MAX':`<span style="color:${c.have>=c.need?'#00ff00':'#ff6159'}">${c.have}</span>\u200b/${c.need}`;
   slot(row,'/xauto_IconItem/ViewRoot','').append(tile);holder.append(row);
  }
 }
 function skinOwned(x,id){return M.level('teacher',x.iID)>=0&&(id===x.iDefaultSkin||B.state().teacherUnlockedSkins?.includes(id));}
 function teacherStar(x,n){return CollectionSuccess.teacherEffect(x,n);}
 function sourceRecipe(){
  const x=row(detail.id),recipe=TEACHER_DATA.recipes.find(r=>r.iFormID===x.arrComposeID?.[0]),id=recipe?.arrProductID?.[0],equipment=COMBAT_EFFECTS_DATA.equipment[id],S=DETAIL_SECONDARY_LAYOUTS;
  if(!equipment)return;
  const shade=document.createElement('button');shade.className='home-source-shade';shade.dataset.home26='close';shade.setAttribute('aria-label','返回长老详情');canvas.append(shade);
  const recipeParent=S.layouts.uicoloursequiptip.nodes.find(n=>n.path.endsWith('/auto_Formula')).parentID;
  const root=U.render(S.layouts.uicoloursequiptip,S.sprites,{width:1080,height:1920,node:r=>{const leaf=r.path.split('/').at(-1),match=r.path.match(/^(.*\/auto_Formula\/equip([123]))(?:\/.*)?$/);
   if(match){const cfg=COMBAT_EFFECTS_DATA.equipment[[recipe.iMaterial0,recipe.iMaterial1,id][+match[2]-1]];return StrategyDetailUI.smallNode(S.layouts.uicoloursequiptip,S.sprites,r,match[1],cfg,x);}
   if(leaf==='auto_bg')return {rect:{m_SizeDelta:{x:808,y:x.szSpecialDesc?1050:940},m_AnchoredPosition:{x:0,y:0}}};
   if(r.id===recipeParent)return {rect:{m_SizeDelta:{x:666,y:200}}};
   if(leaf==='Image'&&!r.path.includes('/auto_Formula/'))return {rect:{m_SizeDelta:{x:666,y:70}}};
   if(leaf==='ui_ty_line')return {rect:{m_SizeDelta:{x:666,y:4}}};
   if(leaf==='auto_Name')return {text:equipment.szName+'【'+equipment.iStar+'阶】'};
   if(leaf==='auto_des')return {text:'',rect:{m_SizeDelta:{x:658,y:230}}};
   if(leaf==='Auto_Feature')return {text:'特性：'+equipment.szEquipFeature};
   if(leaf==='auto_speRoot')return {visible:!!x.szSpecialDesc,rect:{m_SizeDelta:{x:666,y:100}}};
   if(leaf==='Auto_WeaponSpeDesc')return {text:x.szSpecialDesc||''};
   return {};
  }});
  root.classList.add('home-source-dialog','home-recipe-source');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','红装详情');canvas.append(root);
  slot(root,'/auto_des',`<div class="home-red-description">${rich(COMBAT_EFFECTS_DATA.equipmentSkills[equipment.iProvideSkill]?.szDesc||equipment.szEquipSkillDesc||'')}</div>`);
  const attrs=equipment.arrBuffParam||[],names=['','金','木','水','火','土','雷','邪','体'];
  slot(root,'/Auto_EquipPropItem',`<div class="home-red-properties"><p>${equipment.arrTechnique.map(i=>names[i]).filter(Boolean).join(' / ')} · 共鸣值：${equipment.iReson}</p>${Array.from({length:Math.floor(attrs.length/2)},(_,i)=>`<p>${attr(attrs[i*2],attrs[i*2+1])}</p>`).join('')}</div>`);
  for(const tile of root.querySelectorAll('[data-source-path]'))if(/\/auto_Formula\/equip[123]$/.test(tile.dataset.sourcePath))tile.classList.add('home-recipe');
 }
 function sourceSkill(){const x=row(detail.id),skill=Cultivation.skill(x.iID,Math.max(0,M.level(page,x.iID))),S=PET_INFO_LAYOUTS;
  const shade=document.createElement('button');shade.className='home-source-shade';shade.dataset.home26='close';shade.setAttribute('aria-label','返回功法详情');canvas.append(shade);
  const root=U.render(S.layouts.uicommondesc,S.sprites,{width:1080,height:1920,node:r=>{const leaf=r.path.split('/').at(-1);if(leaf==='Auto_Title')return {text:skill?.szName||''};if(leaf==='Auto_Content')return {text:''};return {};}});
  root.classList.add('home-source-dialog','home-skill-level-tip');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','怒气技全部等级');canvas.append(root);
  // UICommonDesc owns a 773px content column; preserve its viewport and TMP style.
  const content=S.layouts.uicommondesc.nodes.find(n=>n.path.endsWith('/Auto_Content')).components.find(c=>c.m_fontSize),owner=detail;
  const viewport=slot(root,'/Scroll View/Viewport','<div class="home-skill-scroll" tabindex="0" aria-label="怒气技各级说明"></div>').firstElementChild;
  viewport.style.fontSize=content.m_fontSize+'px';const color=content.m_fontColor;viewport.style.color=`rgb(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)})`;
  viewport.innerHTML=x.arrAngerSkill.flatMap((threshold,i,a)=>{if(i%2)return [];const cfg=CULTIVATION_DATA.skills.find(t=>t.iSkillID===a[i+1]);return cfg?[`<article data-source-skill="${cfg.iSkillID}"><span class="home-skill-tier-title">${Math.floor(threshold/6)+1}级：${i===0?'解锁激活':Math.floor(threshold/6)+'星激活'}</span><br>${rich(cfg.szDesc)}<br> <br></article>`]:[];}).join('');
  viewport.scrollTop=owner.skillScroll||0;viewport.addEventListener('scroll',()=>{owner.skillScroll=viewport.scrollTop;});

 }

 function sourceStamina(){const p=M.purchase(),c=M.cfgStamina(),shade=document.createElement('div');shade.className='home-source-shade';shade.dataset.home26='close';canvas.append(shade);
  const root=layout('uistamina',r=>{const leaf=r.path.split('/').at(-1);
   if(leaf==='auto_Buy')return {action:'home26:stamina-buy',label:p.remaining?`购买${p.amount}点体力`:'今日已售罄'};
   if(leaf==='Auto_Diam_Icon')return {image:icon(ALIGNED_STAGE_DATA.goods.find(x=>x.iGoodsID===p.currency)?.iIconID)};
   if(leaf==='Auto_BuyCost')return {text:p.remaining?String(p.cost):'售罄'};
   if(leaf==='Auto_Decs')return {text:`每${c.iRestoreTime/60}分钟恢复${c.iRestore}点体力`};
   if(leaf==='Auto_BuyTimes')return {text:'今日剩余次数：'+p.remaining};
   if(leaf==='Auto_Energy_Num')return {text:p.remaining?String(p.amount):''};
   if(leaf==='auto_RefreshLeftTime')return {visible:M.balance(3)<c.iStaminaLimit,text:'当前体力：'+M.balance(3)+'/'+c.iStaminaLimit};
   if(leaf==='ZuoZuoZuoZuoZuoZuoZuoZuo')return {action:'home26:close',label:'关闭体力购买'};
   return {};});root.classList.add('home-source-dialog');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','确认购买');canvas.append(root);
 }
 function resourceJump(j){if(j.szParam1==='UITryLongCard'){CardEvents.shown();detail={type:'trial-card'};redraw();return true;}if(j.szParam1==='UIMonthCard'){detail={type:'month-card'};redraw();return true;}if(j.szParam1==='UIPetNavs'){open('pet');return true;}if(j.szParam1==='UIFairyland'){open('fairy');return true;}if(j.szParam1==='UIMarket'){open('market');return true;}if(j.szParam1==='UIDiscipleBirth'){page=null;detail=null;B.switchTab('wander');return true;}if(j.iMode===102&&j.szParam1==='3'){page=null;detail=null;B.switchTab('story');return true;}B.toast('该目的页尚未接入，资源与当前进度保持不变');return false;}
 function sourceStory(){
  const x=row(detail.id),lv=M.level('seed',x.iID),need=M.costs('seed',x.iID)[0]?.n||0,S=DETAIL_SECONDARY_LAYOUTS;
  const shade=document.createElement('button');shade.className='home-source-shade';shade.dataset.home26='close';shade.setAttribute('aria-label','关闭故事');canvas.append(shade);
  const states=new Map();for(const n of S.layouts.uiseedlingstory.nodes)for(const c of n.components)if(c.fields?.SpriteList)states.set(c.pathID,x.iQuality);
  const root=U.render(S.layouts.uiseedlingstory,S.sprites,{width:1080,height:1920,states,node:r=>{
   const leaf=r.path.split('/').at(-1);
   if(leaf==='StoryTitle')return {text:'故事'};
   if(leaf==='auto_name')return {text:x.szName};
   if(leaf==='auto_icon')return {image:x.icon};
   if(leaf==='auto_unlockInfo')return {visible:lv<0};
   if(leaf==='auto_stars')return {visible:lv>=0};
   if(leaf==='auto_fragmentCount')return {text:`${M.balance(x.arrCost1[0])}/${need}`};
   if(leaf==='auto_sotryDetail')return {text:x.szStory||''};
   if(r.path==='/UISeedlingStory/Text (TMP)')return {text:'点击空白区域关闭'};
   return {};
  }});
  root.classList.add('home-source-dialog');root.setAttribute('role','dialog');root.setAttribute('aria-label',x.szName+' · 故事');root.setAttribute('aria-modal','true');canvas.append(root);
  for(const suffix of ['/Zuo 37/bg','/auto_sotryDetail','/auto_SeedlingInfoItem']){const panel=el(root,suffix);if(panel)panel.style.pointerEvents='auto';}
  const progress=el(root,'/auto_progressSlider');if(progress)progress.style.clipPath=`inset(0 ${100-Math.min(100,need?M.balance(x.arrCost1[0])/need*100:100)}% 0 0)`;
  slot(root,'/auto_stars',`<div class="home-native-stars">${'★'.repeat(Math.floor(Math.max(0,lv)/6))}${'☆'.repeat(4-Math.floor(Math.max(0,lv)/6))}<small>${levelText(lv)}</small></div>`);
 }
 function raiseWarehouseOverlay(start){const boost=Warehouse.text().result?100:20;for(const node of [...canvas.children].slice(start))node.style.zIndex=String(Math.max(70,(parseInt(node.style.zIndex)||60)+boost));}
 function renderWarehouseBase(){if(warehouseOrigin)(warehouseOrigin==='trial-card'?TrialUI:MonthUI).render(canvas);return Warehouse.render(canvas,page==='market'||!!warehouseOrigin);}
 function renderDialog(){if(detail.type==='trial-card')return TrialUI.render(canvas);if(detail.type==='month-card')return MonthUI.render(canvas);if(detail.type==='warehouse-ancestor'){renderWarehouseBase();const start=canvas.children.length;AncestorPreview.render(canvas,B.state(),detail.id);raiseWarehouseOverlay(start);return;}if(detail.type==='warehouse-antique'){renderWarehouseBase();const start=canvas.children.length;WarehouseAntique.renderTip(canvas);raiseWarehouseOverlay(start);return;}if(detail.type==='warehouse-gem'){renderWarehouseBase();const start=canvas.children.length;WarehouseSpecial.renderGem(canvas,detail.id);raiseWarehouseOverlay(start);return;}if(detail.type==='warehouse')return renderWarehouseBase();const ctx=warehouseContext();if(ctx&&!warehouseRendering){renderWarehouseBase();const previousPage=page,previousDetail=detail,start=canvas.children.length;page=ctx.warehouseKind;warehouseRendering=true;if(detail.type==='warehouse-collection')detail={...detail,type:'item'};try{return renderDialog();}finally{page=previousPage;detail=previousDetail;warehouseRendering=false;raiseWarehouseOverlay(start);}}if(['disciple-skin-preview','disciple-skin-confirm'].includes(detail.type)){const current=detail;detail=current.parent;renderDialog();detail=current;const p=TSM.info(current.id);return current.type==='disciple-skin-preview'?TeacherDiscipleSkinUI.preview(canvas,p,M):TeacherDiscipleSkinUI.confirmation(canvas,p,M);}if(detail.type==='collection-success'){const pending=detail;detail=pending.parent;sourceItem();detail=pending;return CollectionSuccessUI.render(canvas,pending,page);}if(detail.type==='universal'){const pending=detail;detail=detail.parent||{type:'item',id:detail.id};sourceItem();detail=pending;return SourceMessageBox.render(canvas,detail,page,M,AM,B.state());}if(detail.type==='awake-confirm'){TeacherAwakeUI.render(canvas,detail.parent,M,AM,B.state());return SourceMessageBox.render(canvas,detail,page,M,AM,B.state());}if((!detail.type.startsWith('awake')||detail.type==='awake-confirm')&&detail.parent?.type?.startsWith('awake'))TeacherAwakeUI.render(canvas,detail.parent,M,AM,B.state());if(detail.type.startsWith('awake')&&detail.type!=='awake-confirm')return TeacherAwakeUI.render(canvas,detail,M,AM,B.state());if(detail.type==='recipe'&&page==='teacher')return sourceRecipe();if(detail.type==='story'&&page==='seed')return sourceStory();if(detail.type==='resource'&&[1,21].includes(detail.id))return ResourceTips.render(canvas,detail.id,{balance:M.balance,gate:M.gate,lockText:M.lockText,jump:resourceJump,toast:B.toast,close:()=>action('close')});if(detail.type==='item')return sourceItem();if(detail.type==='skill')return sourceSkill();if(detail.type==='stamina')return sourceStamina();let title='',body='';
  if(detail.type==='item'){title=page==='teacher'?'长老养成':'功法养成';body=itemBody();}
  if(detail.type==='awake-confirm'){title='觉醒材料确认';const p=AM.info(detail.id);body='<p>确认消耗通用觉醒材料补足本次觉醒？</p>'+p.costs.filter(c=>c.n).map(c=>'<p>'+esc(M.good(c.id).szName)+' ×'+c.n+'</p>').join('')+'<label><input type=checkbox data-home26=awake-disable-confirm '+(B.state().disableTeacherAwakeMaterialConfirm?'checked':'')+'>不再提示通用材料消耗</label>'+btn('awake-confirm','确认觉醒');}if(detail.type==='universal'){title='使用通用碎片';const p=M.payment(page,detail.id);body=`<p>专属碎片不足，消耗 ${p.universal} 个通用碎片补足后升星。</p><label><input type="checkbox" data-home26="universal-disable-confirm" ${B.state().disableUniversalFragmentUpgradeConfirm?'checked':''}>不再提示</label>${btn('upgrade-confirm','确认升星')}`;}
  if(detail.type==='avatar'){title='头像';body=`<div class="home-avatar-list">${D.PlayerAvatar.filter(a=>a.iType===1&&M.avatarUnlocked(a)).map(a=>`<button data-home26="avatar-set:${a.iID}" aria-label="头像${a.iID}"><img src="${icon(a.iIcon)}" alt="">${M.data().avatar===a.iID?'使用中':'使用'}</button>`).join('')}</div>`;}
  if(detail.type==='rename'){title='修改姓名';body=`<input id="home-name" aria-label="玩家姓名" maxlength="8" value="${esc(M.data().name)}"><p>昵称长度为1—8个字符</p>${btn('rename-save','确定')}`;}
  if(detail.type==='stamina'){const p=M.purchase(),c=M.cfgStamina();title='确认购买';body=`<div class="home-stamina-icon"><img src="${icon(ALIGNED_STAGE_DATA.goods.find(x=>x.iGoodsID===3)?.iIconID)}" alt="体力"></div><p>体力 ${M.balance(3)}/${c.iStaminaLimit}</p><p>每${c.iRestoreTime/60}分钟恢复${c.iRestore}点体力</p><p>今日剩余次数：${p.remaining}</p>${btn('stamina-buy',p.remaining?`${p.cost} ${esc(M.good(p.currency).szName)} · 购买${p.amount}体力`:'售罄',!p.remaining||M.balance(p.currency)<p.cost)}`;}
  if(detail.type==='recharge'){title='仙玉充值';body='<p>原版此入口打开仙玉充值商城，需要渠道订单服务。</p><p>当前为本地复刻，未连接支付服务，不会生成订单或增加仙玉。</p>';}
  if(detail.type==='resource-info'){title=M.good(detail.id).szName;body=`<p>拥有：${number(M.balance(detail.id))}</p><p>${esc(ResourceTips.goods(detail.id)?.szDesc||'')}</p>`;}
  if(detail.type==='resource'){const id=detail.id;title=M.good(id).szName;body=`<p>拥有：${number(M.balance(id))}</p><p>${esc(M.good(id).szDesc||'')}</p>${id===3?btn('stamina','购买体力'):btn('go-wander','前往游历获取')}`;}
  if(detail.type==='main-task'){const t=M.mainTask();title='新手任务';body=t?`<p>${esc(t.szDesc)}（${t.progress}/${t.iComdition}）</p>${rewardHTML(t.iRewardID)}${btn('claim-main',t.progress>=t.iComdition?'领取奖励':'前往')}`:'<p>全部新手任务已完成</p>';}
  if(detail.type==='reward'){title='获得奖励';body=detail.items.map(x=>`<p>${esc(M.good(x.id).szName)} ×${x.n}</p>`).join('');}
  if(detail.type==='mail'){title='邮件';body=(B.state().mail||[]).map((m,i)=>`<article><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p>${btn('mail-claim:'+i,m.claimed?'已领取':'领取附件',m.claimed||!m.items?.length)}</article>`).join('')||'<p>暂无邮件</p>';}
  if(detail.type==='settings'){title='设置';body=['music','effects'].map(k=>btn('setting:'+k,(k==='music'?'音乐':'音效')+'：'+(M.data().settings[k]===false?'关闭':'开启'))).join('');}
  if(detail.type==='side'){const x=D.FunctionIcon.find(x=>x.nID===detail.id);title=x.szName;body='<p>当前未连接原版在线服务，暂无可用内容。</p>';}
  if(detail.type==='story'){const x=row(detail.id);title=x.szName+' · 故事';body=page==='seed'?rich(x.szStory):HOME_DETAIL_DATA.TeacherStory.filter(t=>t.iTeacherID===x.iID).map(t=>`<article><h3>${esc(t.szStoryTitle||t.szName||'故事')}</h3>${M.level(page,x.iID)>=t.iLockStar?rich(t.szDesc||t.szStory||t.szContent||''):`${Math.floor(t.iLockStar/6)}星解锁`}</article>`).join('')||rich(x.szStory);}
  if(detail.type==='recipe'){const x=row(detail.id);title='合成配方';body=(x.arrComposeID||[]).map(id=>{const r=TEACHER_DATA.recipes.find(r=>r.iFormID===id);return r?`<p>${[r.iMaterial0,r.iMaterial1,r.iMaterial2,r.iMaterial3,r.iMaterial4].filter(Boolean).map(equip).join(' + ')} → ${r.arrProductID.map(equip).join(' / ')}</p>`:'';}).join('');}
  if(detail.type==='strategy')return StrategyUI.render(canvas,detail,page);
  if(detail.type==='pet-help'){StrategyUI.render(canvas,detail.parent.parent,page);PetInfoPreviewUI.render(canvas,detail.parent.id);return PetInfoPreviewUI.help(canvas,detail.id);}
  if(detail.type==='strategy-recipe'){StrategyUI.render(canvas,detail.parent.parent,page);StrategyDetailUI.render(canvas,detail.parent,page);return StrategyDetailUI.recipe(canvas,detail.id);}
  if(detail.type==='strategy-part'){StrategyUI.render(canvas,detail.parent,page);if(detail.part==='pet')return PetInfoPreviewUI.render(canvas,detail.id);return StrategyDetailUI.render(canvas,detail,page);}
  if(detail.type==='sort'){title='排序';body=[5,3,1,4,2].map(id=>btn('sort-set:'+id,({1:'星阶',2:'可升星',3:'品质',4:'五行',5:'战力'})[id])).join('')+btn('reverse',reverse?'恢复正序':'倒序');}
  if(detail.type==='help'){title='养成说明';body='<p>按五行筛选，查看持有与未合成的收藏。合成消耗专属碎片；升星可用通用碎片补足，需再次确认。养成结果同步到游历携带列表和属性。</p>';}
  const box=document.createElement('div');box.className='home-modal';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label',title);box.innerHTML=`<button class="home-modal-shade" data-home26="close" aria-label="关闭弹窗"></button><section><h2>${esc(title)}</h2><div class="home-modal-body">${body}</div>${btn('close','返回')}</section>`;canvas.append(box);
 }
 const rewardHTML=id=>`<div class="home-rewards">${M.rewards(id).map(x=>`<span>${esc(M.good(x.id).szName)} ×${x.n}</span>`).join('')}</div>`;
 function renderSect(){const tasks=M.sectTasks(),root=layout('uisectv2',r=>{const p=r.path,leaf=p.split('/').at(-1);if(p.includes('/Auto_AncestorRoot')||leaf==='Auto_Ancestor'||leaf==='Auto_Preview'||leaf==='Auto_HighPropRoot'||leaf==='Auto_Prop'||leaf==='Auto_Detail')return {visible:false};if(leaf==='Auto_Close')return {action:'home26:back',label:'返回山门'};if(leaf==='Auto_CurLevelTxt')return {text:'老祖 '+B.state().sect+'级'};if(leaf==='Auto_NextLevelTxt')return {text:'老祖 '+(B.state().sect+1)+'级'};if(leaf==='Auto_LevelDes')return {text:D.SectV2.find(x=>x.iLevel===B.state().sect+1)?.szDesc.replace(/<[^>]*>/g,'')||'已满级'};if(leaf==='Auto_LevelUpButton')return {action:'home26:level-up',label:'老祖升级'};if(p.includes('/auto_TopResBar/'))return node(r)||{};return {};});canvas.append(root);slot(root,'/Auto_Tasks',`<div class="home-task-list">${tasks.map(t=>`<section><p>${esc(t.szDesc)}（${t.progress}/${t.iComdition}）</p>${rewardHTML(t.iPrize)}${btn('claim-sect:'+t.iID,t.claimed?'已领取':t.progress>=t.iComdition?'领取':'前往',t.claimed)}</section>`).join('')}</div>`);if(detail)renderDialog();}
 function jump(id){const j=D.FunctionJump.find(x=>x.iID===id);if(j?.iMode===102&&Number(j.szParam1)===0){page=null;detail=null;B.switchTab('disciples');return;}if(j?.szParam1==='UIDiscipleBirth'){page=null;detail=null;B.switchTab('wander');return;}if(j?.szParam1==='UISectV2'){open('sect-task');return;}if(j?.szParam1==='UISeedligNavs'){open('seed');return;}if(j?.szParam1==='UITeacherNavs'){open('teacher');return;}B.toast('该任务目标页面尚未接入，进度与奖励保持不变');}
 function action(a){const [key,value,context]=a.split(':'),id=+value,activeKind=warehouseContext()?.warehouseKind||page;try{
  if(key==='pet63')return Pets.action(a.slice(6));if(page==='pet'&&key==='close')return Pets.back();if(page==='pet'&&key==='pet-help')return Pets.help(id);
  if(key==='month-claim'){MM.claim(id);Warehouse.reset();warehouseOrigin='month-card';detail={type:'warehouse'};return redraw();}if(key==='month-buy'){const p=MM.info(id);if(!p.renewable)throw Error('月卡续费已达上限！');return B.toast('未连接渠道支付服务，未创建订单');}if(key==='month-good'||key==='trial-good'){Warehouse.reset();warehouseOrigin=key==='trial-good'?'trial-card':'month-card';detail={type:'warehouse'};return Warehouse.open(id);}if(key==='warehouse'){warehouseOrigin=null;Warehouse.reset();detail={type:'warehouse'};return redraw();}if(key==='close'&&detail?.type==='warehouse')return Warehouse.back();if(key==='close'&&detail?.type==='warehouse-antique')return WarehouseAntique.back();if(['upgrade','upgrade-confirm','disciple-skin-preview','disciple-skin-buy','disciple-skin-confirm','awake','dress'].includes(key)&&warehouseContext())return;
  const message=canvas?.querySelector('.source-message-box');if(message&&window.SourceWindowMotion&&['close','message-background','upgrade-confirm','awake-confirm'].includes(key)){const pending=detail;SourceWindowMotion.close(message,()=>{if(detail===pending&&canvas?.isConnected)action(key==='message-background'?'close':a);},key==='message-background');return;}
  if((key==='upgrade-confirm'&&detail?.type==='universal')||(key==='awake-confirm'&&detail?.type==='awake-confirm')){canvas?.querySelector('.source-message-box')?.remove();canvas?.querySelector('.source-message-shade')?.remove();}
  if(key==='recharge'&&!M.gate(13))return B.toast(M.lockText(13));
  if(['pet','antique','seed','teacher','sect-task','clan','market','fairy'].includes(key))return open(key);
  if(key==='back'){page=null;detail=null;return redraw();}
  if(key==='close'&&detail?.tipSkin){detail=warehouseParent(detail.parent);return redraw();}if(key==='skins-close'&&detail?.tipSkin){detail=warehouseParent(detail.parent);return redraw();}
  if(key==='close'){if(detail?.type==='item'&&(detail.skins||detail.fullbody)){detail.skins=false;detail.fullbody=false;delete detail.skin;return redraw();}detail=warehouseParent(detail?.parent)||(['universal','skill','story','recipe','strategy'].includes(detail?.type)?{type:'item',id:detail.id}:null);return redraw();}
  if(key==='awake'){AM.checkEntry(detail.id);detail={type:'awake',id:detail.id,parent:{...detail}};}
  else if(key==='awake-resonance'){AM.checkEntry();detail={type:'awake-resonance',parent:detail?{...detail}:null};}
  else if(key==='awake-reward'){detail={type:'awake-reward',id:detail.id,parent:{...detail}};}
  else if(key==='awake-preview'){detail={type:'awake-preview',parent:{...detail}};}
  else if(key==='awake-exp'){detail.expDetail=!detail.expDetail;}
  else if(key==='awake-disable-confirm'){B.state().disableTeacherAwakeMaterialConfirm=!B.state().disableTeacherAwakeMaterialConfirm;B.save();if(message){SourceMessageBox.updateCheck(canvas,B.state(),true);return;}}else if(key==='awake-skip'){B.state().skipTeacherAwakeAnimation=!B.state().skipTeacherAwakeAnimation;B.save();}
  else if(key==='awake-claim'){detail={type:'reward',items:AM.claim(detail.id,id),parent:{...detail}};}
  else if(key==='awake-resonance-upgrade'){AM.upgradeResonance(id);B.toast('共鸣等级提升，属性已生效');}
  else if(key==='awake-upgrade'||key==='awake-confirm'){if(detail.busy)return;const p=AM.info(detail.id);if(p.reason)throw Error(p.reason);if(key==='awake-upgrade'&&p.confirm){detail={type:'awake-confirm',id:detail.id,expected:p.level,parent:{...detail}};}else{const parent=detail.type==='awake-confirm'?detail.parent:detail,before=detail.expected??p.level;AM.upgrade(detail.id,before,key==='awake-confirm');if(B.state().skipTeacherAwakeAnimation)detail={type:'awake-success',id:detail.id,before,parent};else {const pending={...parent,busy:true};detail=pending;setTimeout(()=>{if(detail===pending){detail={type:'awake-success',id:pending.id,before,parent};redraw();}},700);}}}
  else if(key==='disciple-skin-preview'){const p=TSM.info(detail.id);if(!p.valid)return;detail={type:key,id:detail.id,parent:{...detail}};}
  else if(key==='disciple-skin-buy'){const p=TSM.info(detail.id);if(!p.canBuy)throw Error(p.tip);detail={type:'disciple-skin-confirm',id:detail.id,expected:{skin:p.skin.nID,currency:p.currency,cost:p.cost},parent:{...detail}};}
  else if(key==='disciple-skin-confirm'){if(detail?.type!==key)return;const pending=detail;detail=pending.parent;redraw();TSM.purchase(pending.id,pending.expected);B.toast('弟子幻化已解锁，可前往弟子换装');}
  else if(key==='item')detail={type:'item',id};
  else if(key==='combo-item'){const g=CollectionBonuses.groups(B.state(),page).find(g=>g.id===+context);if(!g?.ids.includes(id))return;detail={type:'item',id,memberIds:g.ids};}
  else if(key==='strategy-tab'){if(detail?.type!=='strategy')return;const v=StrategyPreview.resolve(activeKind,detail.id,id);if(!v||id<0||id>=v.ids.length)return;detail.strategyIndex=id;}
  else if(key==='strategy-part'){if(detail?.type!=='strategy')return;const v=StrategyPreview.resolve(activeKind,detail.id,detail.strategyIndex||0);if(!v||!StrategyUI.part(v,context,id))return;detail={type:'strategy-part',id,part:context,parent:{...detail}};}
  else if(key==='strategy-recipe'){if(detail?.type!=='strategy-part'||detail.part!=='teacher')return;const v=StrategyPreview.resolve(activeKind,detail.parent.id,detail.parent.strategyIndex||0),p=StrategyDetailPreview.resolve(v,'teacher',detail.id);if(!p?.recipeItems.includes(id))return;detail={type:'strategy-recipe',id,parent:{...detail}};}
  else if(key==='pet-help'){if(detail?.type!=='strategy-part'||detail.part!=='pet'||![30,31].includes(id))return;detail={type:'pet-help',id,parent:{...detail}};}
  else if(key==='neighbor'){const rows=detail.memberIds?detail.memberIds.map(row).filter(Boolean):M.list(page).filter(x=>x.icon&&(!filter||x.iTechnique===filter)&&CollectionOwnership.elementOpen(B.state(),x.iTechnique)),i=rows.findIndex(x=>x.iID===detail.id);if(!rows.length)return;detail={type:'item',id:rows[(i+id+rows.length)%rows.length].iID,memberIds:detail.memberIds};}
  else if(['story','recipe','skill','strategy'].includes(key)){detail={type:key,id:detail.id,parent:{...detail}};}
  else if(key==='skins'){detail.skins=true;detail.skin=B.state().teacherSkins?.[detail.id]||row(detail.id).iDefaultSkin;}
  else if(key==='skins-close'){detail.skins=false;detail.fullbody=false;delete detail.skin;}
  else if(key==='skin-neighbor'){const rows=HOME_DETAIL_DATA.TeacherSkin.filter(t=>t.iTeacherID===detail.id),i=rows.findIndex(t=>t.iID===detail.skin);detail.skin=rows[Math.max(0,Math.min(rows.length-1,i+id))].iID;}
  else if(key==='skin-pick'){if(HOME_DETAIL_DATA.TeacherSkin.some(t=>t.iID===id&&t.iTeacherID===detail.id))detail.skin=id;}
  else if(key==='skin-obtain'){const skin=HOME_DETAIL_DATA.TeacherSkin.find(t=>t.iID===detail.skin&&t.iTeacherID===detail.id);if(skin?.iJumpId)jump(skin.iJumpId);}
  else if(key==='dress'){const x=row(detail.id),sid=detail.skin||x.iDefaultSkin;if(!skinOwned(x,sid))throw Error('尚未获得该皮肤');B.state().teacherSkins??={};B.state().teacherSkins[x.iID]=sid;B.save();}
  else if(key==='fullbody'){detail.fullbody=!detail.fullbody;}
  else if(key==='item-resource'){detail={type:'resource',id,parent:{...detail}};}
  else if(key==='filter'){filter=id;detail=null;}
  else if(key==='sort')detail={type:'sort'};
  else if(key==='sort-set'){sort=id;detail=null;}
  else if(key==='reverse')reverse=!reverse;
  else if(key==='combo')combo=true;
  else if(key==='list')combo=false;
  else if(key==='expand')expanded=!expanded;
  else if(key==='fold-left')leftFold=!leftFold;
  else if(key==='fold-right')rightFold=!rightFold;
  else if(key==='universal-disable-confirm'){B.state().disableUniversalFragmentUpgradeConfirm=!B.state().disableUniversalFragmentUpgradeConfirm;B.save();if(message){SourceMessageBox.updateCheck(canvas,B.state(),false);return;}}
  else if(key==='upgrade'||key==='upgrade-confirm'){if(!['item','universal'].includes(detail?.type)||key==='upgrade-confirm'&&detail?.type!=='universal')return;const p=M.payment(page,detail.id);if(key==='upgrade'&&p.enough&&p.universal&&!B.state().disableUniversalFragmentUpgradeConfirm){detail={type:'universal',id:detail.id,parent:{...detail},expectedLevel:M.level(page,detail.id)};}else {const before=M.level(page,detail.id),parent=detail.parent||{...detail,type:'item'};M.upgrade(page,detail.id,key==='upgrade-confirm'||!!B.state().disableUniversalFragmentUpgradeConfirm,detail.expectedLevel);const after=M.level(page,detail.id);detail=CollectionSuccess.shouldShow(page,before,after)?{type:'collection-success',id:detail.id,before,after,parent}:parent;if(detail.type!=='collection-success')B.toast('养成成功，携带属性已更新');}}
  else if(key==='obtain'){const pool=page==='teacher'?12002:11002,previousPage=page,previousDetail={...detail};page=null;detail=null;B.openWish(pool,()=>{page=previousPage;detail=previousDetail;redraw();});return;}
  else if(key==='rename-save'){M.rename(document.getElementById('home-name').value);detail=null;}
  else if(key==='avatar-set'){const x=D.PlayerAvatar.find(x=>x.iID===id);if(!x||!M.avatarUnlocked(x))throw Error('头像尚未解锁');M.data().avatar=id;B.save();}
  else if(key==='stamina-buy')M.buyStamina();
  else if(key==='claim-main'){const t=M.mainTask();if(t.progress<t.iComdition)return jump(t.iJumpID);detail={type:'reward',items:M.claim('main',t.iID)};}
  else if(key==='claim-sect'){const t=M.sectTasks().find(t=>t.iID===id);if(t.progress<t.iComdition)return jump(t.iJump);detail={type:'reward',items:M.claim('sect',id)};}
  else if(key==='level-up'){M.levelUp();B.toast('老祖等级提升');}
  else if(key==='go-wander'){detail=null;page=null;B.switchTab('wander');return;}
  else if(key==='side'){const x=D.FunctionIcon.find(x=>x.nID===id);if(!x||!M.gate(x.iFunctionID))throw Error('当前活动未开启');detail={type:x.iJumpID===1030?'month-card':'side',id};}
  else if(key==='setting'){M.data().settings[value]=M.data().settings[value]===false;B.save();document.querySelectorAll('audio').forEach(a=>a.muted=M.data().settings.effects===false);}
  else if(key==='mail-claim'){const m=B.state().mail?.[id];if(m&&!m.claimed){m.items.forEach(x=>M.add(x.id,x.n));m.claimed=true;B.save();}}
  else detail={type:key,id};
  redraw();
 }catch(e){B.toast(e.message);}}
 document.addEventListener('click',e=>{const target=e.target.closest('[data-home26]');if(target&&!target.disabled&&canvas?.isConnected&&canvas.contains(target))action(target.dataset.home26);},{signal:events.signal});
 document.addEventListener('keydown',e=>{if(!canvas?.isConnected)return;if(e.key==='Escape'){if(page==='pet'){Pets.back();return;}if(page==='antique')return;if(page==='fairy'){Fairy.back();return;}if(page==='clan'){Clan.back();return;}if(page==='market'){if(detail)action('close');else Market.back();return;}if(detail)action('close');else if(page)action('back');}if(e.key==='Tab'&&page==='pet')return Pets.focus(e);if(e.key==='Tab'&&detail){const dialog=[...canvas.querySelectorAll('[role=dialog]')].at(-1),buttons=[...dialog.querySelectorAll('button:not(:disabled),input,[tabindex="0"]')].filter(x=>x.checkVisibility()&&!x.classList.contains('home-modal-shade'));const first=buttons[0],last=buttons.at(-1);if(!dialog.contains(document.activeElement)||e.shiftKey&&document.activeElement===first||!e.shiftKey&&document.activeElement===last){e.preventDefault();(e.shiftKey?last:first)?.focus();}}},{signal:events.signal});
 return {releaseMiner:index=>Fairy.model.releaseMember(index),dispose(){Pets.dispose();clearInterval(cardTimer);TrialUI.dispose();MonthUI.dispose();TeacherDiscipleSkinUI.stop();Antique.dispose();WarehouseAntique.dispose();events.abort();canvas=null;},begin(){currentProfile=M.profile();currentBuildings=SourceHomeReadiness.functions(M);},node,after,action,reset(){Pets.reset();TrialUI.dispose();MonthUI.dispose();warehouseOrigin=null;TeacherDiscipleSkinUI.stop();Warehouse.reset();page=null;detail=null;canvas=null;},model:M,text:()=>({page:page||'home',dialog:detail,petMotion:window.PetMotion?.text()||[],ancestorMotion:window.AncestorMotion?.text()||[],windowMotion:window.SourceWindowMotion?.text()||[],profile:M.profile(),monthNotifications:CardEvents.text(),monthCards:[MM.info(1),MM.info(2),MM.info(3)].map(p=>({id:p.id,owner:p.owner,received:p.received,expires:p.record.expires})),buildingStates:currentBuildings?.states||[],readiness:currentReadiness,tasks:M.sectTasks(),mainTask:M.mainTask(),sideIcons:M.sideIcons().map(x=>x.nID),clan:Clan.text(),market:page==='market'?Market.text():null,warehouse:detail?.type==='warehouse'||warehouseContext()?Warehouse.text():null,antique:page==='antique'?Antique.text():null,pets:page==='pet'?Pets.text():null,fairy:page==='fairy'?Fairy.text():null})};
};
