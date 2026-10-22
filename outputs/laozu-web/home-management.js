window.createHomeManagement=function(B){
 const M=createHomeModel(B),D=HOME_MANAGEMENT_DATA,L=HOME_MANAGEMENT_LAYOUTS,U=UnityRect,esc=Cultivation.esc,rich=Cultivation.rich;
 const Clan=createClanPage({...B,resourceBridge:{balance:M.balance,gate:M.gate,lockText:M.lockText,jump:resourceJump},back:()=>{page=null;detail=null;B.render();}});
 const Market=createMarketPage({...B,openResource:(id,info=false)=>{detail={type:info?'resource-info':id===3?'stamina':'recharge',id};redraw();},balance:M.balance,add:M.add,gate:M.gate,lockText:M.lockText,jump:resourceJump,back:()=>{page=null;detail=null;B.render();}});
 const Fairy=createFairylandPage({...B,balance:M.balance,add:M.add,gate:M.gate,lockText:M.lockText,back:()=>{page=null;detail=null;B.render();}});
 const events=new AbortController();
 let currentProfile=null;
 let canvas=null,page=null,detail=null,filter=0,sort=5,reverse=false,combo=false,expanded=false,leftFold=false,rightFold=false;
 const art=name=>Object.values(L.sprites).find(x=>x.name===name)?.file||HOME_DATA.assets[name]||PORTAL_DATA.assets[name]||'';
 const icon=id=>{const n=ALIGNED_STAGE_DATA.icons.find(x=>x.nID===+id)?.strIconName;return art(n);};
 const btn=(a,text,disabled=false)=>`<button data-home26="${a}" ${disabled?'disabled':''}>${text}</button>`;
 const el=(root,suffix)=>[...root.querySelectorAll('[data-source-path]')].find(x=>x.dataset.sourcePath.endsWith(suffix));
 const slot=(root,suffix,html)=>{const n=el(root,suffix);if(n){n.replaceChildren();n.insertAdjacentHTML('beforeend',html);}return n;};
 const redraw=()=>B.render();
 function node(r){const p=r.path,leaf=p.split('/').at(-1),pr=currentProfile||M.profile();
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
  if(leaf==='locker'){const parent=p.slice(0,-7),button=ORIGINAL_LAYOUT_DATA.layouts.uimain.nodes.find(n=>n.path.startsWith(parent+'/')&&n.components.some(c=>c.fields?._funcIDs?.length));const ids=button?.components.flatMap(c=>c.fields?._funcIDs||[])||[];if(ids.length)return {visible:!ids.some(M.gate)};}
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
  target.insertAdjacentHTML('beforeend',sideHTML());
  // Suppress prefab editor lock overlays only when that FunctionButton is actually unlocked.
  for(const r of ORIGINAL_LAYOUT_DATA.layouts.uimain.nodes){const ids=r.components.flatMap(c=>c.fields?._funcIDs||[]);if(!ids.length)continue;const n=el(root,r.path);if(!n)continue;const open=ids.some(M.gate);n.dataset.functionOpen=String(open);if(!open&&n.dataset.originalAction?.startsWith('home26:'))n.setAttribute('aria-label',n.getAttribute('aria-label')+'（'+M.lockText(ids[0])+'）');}
  if(detail)renderDialog();
 }
 function sideHTML(){const groups=M.sideIcons();const side=(group,fold)=>{const rows=groups.filter(x=>group.includes(x.iGroupID));return rows.slice(0,fold?1:undefined).map(x=>`<button data-home26="side:${x.nID}" aria-label="${esc(x.szName)}">${icon(x.iIconID)?`<img src="${icon(x.iIconID)}" alt="">`:''}<span>${esc(x.szName)}</span></button>`).join('');};
  return `<aside class="home-side home-left">${side([2],leftFold)}${groups.some(x=>x.iGroupID===2)?btn('fold-left',leftFold?'⌄':'⌃'):''}</aside><aside class="home-side home-right">${side([3],rightFold)}${groups.some(x=>x.iGroupID===3)?btn('fold-right',rightFold?'⌄':'⌃'):''}</aside><aside class="home-side home-top-activities">${side([1],false)}</aside><aside class="home-side home-low-activities">${side([6],false)}</aside><div class="home26-shortcuts">${btn('mail',`<img src="${art('icon_main_youjian')}" alt="">邮件`)}${btn('warehouse',`<img src="${art('icon_main_cangku')}" alt="">仓库`)}${btn('expand',`<img src="${art('ui_zjm_kuozhan')}" alt="">${expanded?'收起':'展开'}`)}</div>${expanded?`<div class="home-expanded">${side([5],false)}${btn('settings','设置')}${btn('main-task','任务')}${btn('sect-task','老祖')}${btn('seed','功法')}${btn('teacher','长老')}${btn('expand','收起')}</div>`:''}`;
 }
 function layout(name,cb){return U.render(L.layouts[name],L.sprites,{width:1080,height:1920,node:cb});}
 function open(kind){const id=kind==='seed'?2:kind==='teacher'?15:kind==='clan'?4:kind==='market'?13:kind==='fairy'?25:0;if(id&&!M.gate(id))return B.toast(M.lockText(id));if(kind==='clan')Clan.reset();if(kind==='market')Market.reset();if(kind==='fairy')Fairy.reset();page=kind;detail=null;filter=0;combo=false;redraw();}
 function row(id){return M.list(page).find(x=>x.iID===+id);}
 const levelText=n=>n<0?'未解锁':Math.floor(n/6)+'星'+n%6+'阶';
 function card(kind,x){const lv=M.level(kind,x.iID),cost=M.costs(kind,x.iID)[0],can=lv<(kind==='seed'?24:30)&&M.payment(kind,x.iID).enough;
  return `<button class="home-card quality-${x.iQuality} ${lv<0?'unowned':''}" data-home26="item:${x.iID}" aria-label="${esc(x.szName)}"><img src="${x.icon}" alt=""><span>${esc(x.szName)}</span><small>${levelText(lv)}</small>${cost?`<small>${M.balance(cost.id)}/${cost.n} 碎片</small>`:''}${can?'<i class="home-red-dot">!</i>':''}</button>`;
 }
 function renderPage(){if(page==='fairy'){Fairy.render(canvas);return;}if(page==='market'){Market.render(canvas);if(detail)renderDialog();return;}if(page==='clan'){Clan.render(canvas);return;}if(page==='sect-task'){renderSect();return;}
  const teacher=page==='teacher',name=combo?(teacher?'uiteachersuit':'uiseedlingsuit'):(teacher?'uiteacher':'uiallseedling'),root=layout(name,r=>{const p=r.path,leaf=p.split('/').at(-1);
   if(p.includes('/SortTypeList')||leaf==='Auto_Return'||leaf==='ListRoot'||/Awake|Resonance/.test(p))return {visible:false};
   if(leaf==='Auto_SortByOrder')return {action:'home26:reverse',label:'切换排序方向'};
   if(leaf==='Auto_SortOrderName')return {text:reverse?'倒序':'正序'};
   if(leaf==='SortType')return {action:'home26:sort',label:'切换排序方式'};
   if(leaf==='SortName')return {text:({1:'星阶',2:'可升星',3:'品质',4:'五行',5:'战力'})[sort]};
   if(leaf==='TitleDesBtn')return {action:'home26:help',label:'查看说明'};
   return {};
  });canvas.append(root);
  const viewport=combo?'/Scroll View/Viewport':teacher?'/Auto_Teacher/Viewport':'/Auto_Seedling/Viewport';
  const rows=M.list(page).filter(x=>x.icon&&(!filter||x.iTechnique===filter)&&CollectionOwnership.elementOpen(B.state(),x.iTechnique)).sort((a,b)=>{const up=x=>M.level(page,x.iID)<(teacher?30:24)&&M.payment(page,x.iID).enough;const power=x=>{let n=0;for(let i=0;i<(x.arrPower?.length||0);i+=2)if(M.level(page,x.iID)>=x.arrPower[i])n=x.arrPower[i+1];return n;};const value=x=>({1:M.level(page,x.iID),2:+up(x),3:x.iQuality,4:-x.iTechnique,5:(M.level(page,x.iID)>=0?1e9:0)+power(x)})[sort];return (reverse?-1:1)*(Number(up(b))-Number(up(a))||value(b)-value(a)||a.iID-b.iID);});
  slot(root,viewport,`<div class="home-catalog">${combo?comboHTML():rows.map(x=>card(page,x)).join('')}</div>`);
  const selector=el(root,'/auto_ClassSelector');if(selector)selector.innerHTML=`<div class="home-filters">${['全部','金','木','水','火','土','雷','邪','体'].map((x,i)=>`<button data-home26="filter:${i}" aria-pressed="${i===filter}">${x}</button>`).join('')}</div>`;
  const nav=layout(teacher?'uiteachernavs':'uiseedlignavs',r=>{const leaf=r.path.split('/').at(-1);if(leaf==='auto_Back')return {action:'home26:back',label:'返回山门'};if(leaf==='Auto_NavBtn1')return {action:'home26:list',label:teacher?'长老列表':'功法列表'};if(leaf==='Auto_NavBtn2')return {action:'home26:combo',label:teacher?'长老组合':'功法组合'};if(leaf==='Auto_NabBtn3')return {visible:false};return {};});canvas.append(nav);
  if(!el(nav,'/auto_Back'))canvas.insertAdjacentHTML('beforeend',`<button class="home-page-back" data-home26="back"><img src="assets/btn_fanhui.png" alt="返回山门"></button>`);
  if(detail)renderDialog();
 }
 function comboHTML(){return CollectionBonuses.groups(B.state(),page).map(g=>`<section class="home-combo"><h3>${esc(g.name)}</h3><div>${g.ids.map(id=>{const x=row(id);return x?card(page,x).replace(`data-home26="item:${id}"`,`data-home26="combo-item:${id}:${g.id}"`):'';}).join('')}</div>${g.tiers.map(t=>`<p class="${t.active?'active':''}">${t.threshold===0?'集齐整组':`全组达到${t.threshold/6}星`}：${attr(t.id,t.value)} ${t.active?'已激活':'未激活'}</p>`).join('')}</section>`).join('');}
 function attr(id,v){const a=TEACHER_DATA.attributes.find(x=>x.iAtrributeID===id);return esc(a?.szAttrName||'属性 '+id)+' +'+([2001,2002,2003,2007].includes(id)?v:v/100+'%');}
 function itemBody(){const x=row(detail.id),lv=M.level(page,x.iID),next=lv+1,pay=M.payment(page,x.iID),teacher=page==='teacher',attributes=[x.arrSecondAttribute1,x.arrSecondAttribute2,x.arrSecondAttribute3].filter(a=>a?.length>1);
  const skill=!teacher?Cultivation.skill(x.iID,Math.max(0,lv)):null;
  return `<div class="home-item-hero"><img src="${x.icon}" alt=""><div><h2>${esc(x.szName)}</h2><p>${levelText(lv)} → ${levelText(next)}</p></div></div><section class="home-attributes">${attributes.map(a=>`<p>${attr(a[0],lv<0?0:a[Math.min(lv+1,a.length-1)])} → ${attr(a[0],a[Math.min(next+1,a.length-1)])}</p>`).join('')}</section>${skill?`<h3>${esc(skill.szName||'怒气技')}</h3><p>${rich(skill.szDesc)}</p>`:''}${teacher?`<h3>合成配方</h3>${(x.arrComposeID||[]).map(id=>{const r=TEACHER_DATA.recipes.find(r=>r.iFormID===id);return r?`<p>${[r.iMaterial0,r.iMaterial1,r.iMaterial2,r.iMaterial3,r.iMaterial4].filter(Boolean).map(equip).join(' + ')} → ${equip(r.arrProductID[0])}</p>`:'';}).join('')}`:''}<p>${rich(x.szStory||'')}</p><div class="home-costs">${pay.costs.map(c=>`<span>${esc(M.good(c.id).szName)} ${M.balance(c.id)}/${c.n}</span>`).join('')}</div>${btn('upgrade',lv<0?'合成':'升星',!pay.enough||lv>=(teacher?30:24))}${btn('obtain','去获取')}`;
 }
 function equip(id){const x=TEACHER_DATA.equipment.find(x=>x.id===id)||GAME_DATA.items.find(x=>x.id===id);return x?`<span class="home-recipe"><img src="${x.icon}" alt="">${esc(x.name)}</span>`:String(id);}
 function sourceItem(){
  const x=row(detail.id),teacher=page==='teacher',lv=M.level(page,x.iID),max=teacher?30:24,pay=M.payment(page,x.iID),unlocked=lv>=0,name=teacher?'uiteacherinfo':'uiseedlingupgrade';
  const source=L.layouts[name],states=new Map();
  for(const r of source.nodes)for(const c of r.components)if(c.fields?.SpriteList){const leaf=r.path.split('/').at(-1);if(/prop|SwitchBg|takeProp/i.test(leaf))states.set(c.pathID,x.iTechnique);else if(/quality|Auto_Bg/i.test(leaf))states.set(c.pathID,x.iQuality);}
  const shade=document.createElement('button');shade.className='home-source-shade';shade.dataset.home26='close';shade.setAttribute('aria-label','关闭详情');canvas.append(shade);
  const fields={auto_seedlingName:x.szName,auto_Name:x.szName,Auto_curLevel:lv===max?'满级':levelText(lv),auto_curLevel:levelText(lv),Auto_nextLevel:levelText(lv+1),auto_nextLevel:levelText(lv+1),Auto_UpgradeText:unlocked?'升星':teacher?'合成':'解锁',Auto_ViewText:detail.fullbody?'详情':'全身',auto_Power:String((x.arrPower||[]).reduce((v,n,i,a)=>i%2===0&&lv>=n?a[i+1]:v,0))};
  const attributeText=level=>[x.arrSecondAttribute1,x.arrSecondAttribute2,x.arrSecondAttribute3].filter(a=>a?.length>1).map(a=>attr(a[0],level<0?0:a[Math.min(level+1,a.length-1)])).join('\n');
  const root=U.render(source,L.sprites,{width:1080,height:1920,states,node:r=>{const p=r.path,leaf=p.split('/').at(-1);
   if(leaf==='Auto_InfoRoot')return {visible:!detail.fullbody&&!detail.skins};
   if(!teacher&&p.endsWith('/Bg/Content'))return {rect:{m_SizeDelta:{x:870,y:790}}};
   if(!teacher&&leaf==='Auto_Skill')return {rect:{m_SizeDelta:{x:870,y:290}}};
   if(!teacher&&p.endsWith('/Content/LevelUp'))return {rect:{m_SizeDelta:{x:870,y:460}}};
   if(!teacher&&leaf==='Auto_LevelUp')return {rect:{m_SizeDelta:{x:0,y:420}}};
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
   if(leaf==='Auto_Frag')return {visible:!unlocked};
   if(leaf==='Auto_Stars')return {visible:unlocked};
   if(leaf==='auto_nextLevelRoot'||leaf==='Auto_nextLevel')return {visible:lv<max,...(fields[leaf]!==undefined?{text:fields[leaf]}:{})};
   if(leaf==='auto_curPropStr')return {text:attributeText(lv)};
   if(leaf==='auto_nextPropStr')return {text:attributeText(lv+1)};
   if(leaf==='auto_lockAttrStr')return {text:attributeText(0)};
   if(leaf==='auto_seedlingIcon')return {image:x.icon};
   if(leaf==='auto_EquipRoot')return {action:'home26:recipe',label:'合成配方'};
   if(leaf==='Auto_Story'&&!teacher)return {action:'home26:story',label:'功法故事'};
   if(leaf==='Auto_StrageBtn')return {visible:!!x.arrStrategy?.length,action:'home26:strategy',label:'攻略'};
   if(leaf==='Auto_ViewModel')return {visible:!!HOME_DETAIL_DATA.portraits?.[detail.skin||B.state().teacherSkins?.[x.iID]||x.iDefaultSkin],action:'home26:fullbody',label:detail.fullbody?'返回详情':'查看全身'};
   if(leaf==='Auto_SwitchBg')return {visible:!detail.fullbody};
   if(leaf==='Auto_PoolContent')return {rect:{m_SizeDelta:{x:1080,y:13}}};
   if(leaf==='Auto_Pool')return {visible:!!detail.skins&&!detail.fullbody};
   if(leaf==='PoolLeftSwitch'||leaf==='PoolRightSwitch'){const rows=HOME_DETAIL_DATA.TeacherSkin.filter(t=>t.iTeacherID===x.iID),i=rows.findIndex(t=>t.iID===(detail.skin||x.iDefaultSkin)),dir=leaf==='PoolLeftSwitch'?-1:1;return {visible:dir<0?i>0:i<rows.length-1,action:'home26:skin-neighbor:'+dir,label:dir<0?'上一套皮肤':'下一套皮肤'};}
   if(leaf==='auto_ShowBack')return {visible:!!detail.skins,action:'home26:skins-close',label:'返回长老详情'};
   if(leaf==='Auto_ViewSkin')return {visible:HOME_DETAIL_DATA.TeacherSkin.some(t=>t.iTeacherID===x.iID),action:'home26:skins',label:'长老皮肤'};
   if(leaf==='Auto_Dress'){const sid=detail.skin||x.iDefaultSkin,current=B.state().teacherSkins?.[x.iID]||x.iDefaultSkin;const owned=skinOwned(x,sid),skin=HOME_DETAIL_DATA.TeacherSkin.find(t=>t.iID===sid);return {visible:!!detail.skins&&(owned?sid!==current:!!skin?.iJumpId),action:owned?'home26:dress':'home26:skin-obtain',label:owned?'换装':'前往获取'};}
   if(leaf==='Auto_DressTxt')return {text:skinOwned(x,detail.skin||x.iDefaultSkin)?((B.state().teacherSkins?.[x.iID]||x.iDefaultSkin)===(detail.skin||x.iDefaultSkin)?'穿着中':'换装'):(HOME_DETAIL_DATA.TeacherSkin.find(t=>t.iID===(detail.skin||x.iDefaultSkin))?.iJumpId?'前往获取':'未获得')};
   if(['auto_QMoudle','Auto_Tog','auto_storyRoot'].includes(leaf)||/Awake/.test(leaf))return {visible:false};
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
  slot(root,'/Auto_UpgradeList',`<div class="home-native-costs">${pay.costs.filter(c=>c.n>0).map(c=>`<button data-home26="item-resource:${c.id}"><span>${esc(M.good(c.id).szName)}</span><b class="${M.balance(c.id)>=c.n?'enough':'short'}">${M.balance(c.id)}/${c.n}</b></button>`).join('')}</div>`);
  slot(root,'/Auto_Stars',`<div class="home-native-stars">${'★'.repeat(Math.floor(Math.max(0,lv)/6))}${'☆'.repeat(Math.floor(max/6)-Math.floor(Math.max(0,lv)/6))}<small>${levelText(lv)}</small></div>`);
  const costsEl=el(root,'/Auto_UpgradeList');if(costsEl)costsEl.style.width='420px';
  const frag=x.arrCost1;slot(root,'/Auto_Frag',`<div class="home-native-frag">${M.balance(frag[0])}/${frag[1]}</div>`);
  if(teacher){
   const sid=detail.skins?(detail.skin||x.iDefaultSkin):(B.state().teacherSkins?.[x.iID]||x.iDefaultSkin),image=window.HOME_DETAIL_DATA?.portraits?.[sid]||window.HOME_DETAIL_DATA?.portraits?.[x.iDefaultSkin]||x.icon;
   if(detail.skins)slot(root,'/Auto_PoolContent',`<div class="home-native-skins">${HOME_DETAIL_DATA.TeacherSkin.filter(t=>t.iTeacherID===x.iID).map(t=>`<button data-home26="skin-pick:${t.iID}" aria-pressed="${t.iID===sid}"><img src="${HOME_DETAIL_DATA.portraits?.[t.iID]||x.icon}" alt=""><span>${esc(t.szSkinName)}</span><small>${skinOwned(x,t.iID)?'已获得':esc(t.szDes||'未获得')}</small></button>`).join('')}</div>`);
   slot(root,'/auto_Moudle',`<img class="home-teacher-portrait ${detail.fullbody?'full':''}" src="${image}" alt="${esc(x.szName)}">`);
   const rec=TEACHER_DATA.recipes.find(r=>r.iFormID===x.arrComposeID?.[0]);if(rec)slot(root,'/Auto_Equip',equip(rec.arrProductID[0]));
   slot(root,'/auto_Formula',`<div class="home-native-formula">${rec?[rec.iMaterial0,rec.iMaterial1,rec.iMaterial2,rec.iMaterial3,rec.iMaterial4].filter(Boolean).map(equip).join(' + ')+' → '+equip(rec.arrProductID[0]):''}</div>`);
   slot(root,'/Auto_StarProps',`<div class="home-native-teacher-stars">${[6,12,18,24,30].map(n=>`<div class="${lv>=n?'active':''}"><b>${n/6}★</b><p>${teacherStar(x,n)}</p></div>`).join('')}</div>`);
  }else{
   slot(root,'/Auto_PropList',`<div class="home-native-attrs">${[x.arrSecondAttribute1,x.arrSecondAttribute2,x.arrSecondAttribute3].filter(a=>a?.length>1).map(a=>`<div><span>${esc(TEACHER_DATA.attributes.find(t=>t.iAtrributeID===a[0])?.szAttrName||a[0])}</span><b>${lv<0?0:a[Math.min(lv+1,a.length-1)]}</b><i>➜</i><b>${lv===max?'MAX':a[Math.min(lv+2,a.length-1)]}</b></div>`).join('')}</div>`);
   const skill=Cultivation.skill(x.iID,Math.max(0,lv));slot(root,'/Auto_Skill',`<button class="home-native-skill" data-home26="skill"><h3>${esc(skill?.szName||x.szName)} <small>怒气技</small></h3><p>${rich(skill?.szDesc||'')}</p></button>`);
   slot(root,'/Auto_LevelUp',`<div class="home-native-effects">${[1,2,3,4].map(n=>`<p class="${lv>=n*6?'active':''}"><b>${n}★</b> ${rich(x['szStar'+n+'Des'])}</p>`).join('')}</div>`);
  }
 }
 function skinOwned(x,id){return M.level('teacher',x.iID)>=0&&(id===x.iDefaultSkin||B.state().teacherUnlockedSkins?.includes(id));}
 function teacherStar(x,n){const a=x.arrStarAffect1||[],b=x.arrStarAffect2||[];let out=[];for(let i=0;i<a.length;i+=2)if(a[i]===n)out.push('红装属性+'+a[i+1]/100+'%');for(let i=0;i<b.length;i+=2)if(b[i]===n)out.push('红装数量+'+b[i+1]);if((x.arrStarAffect5||[])[0]===n)out.push('解锁幻化');if((x.arrStarAffect4||[]).includes(n))out.push('法宝效果提升');return out.join('<br>')||'携带属性提升';}
 function sourceRecipe(){
  const x=row(detail.id),recipe=TEACHER_DATA.recipes.find(r=>r.iFormID===x.arrComposeID?.[0]),id=recipe?.arrProductID?.[0],equipment=COMBAT_EFFECTS_DATA.equipment[id],S=DETAIL_SECONDARY_LAYOUTS;
  if(!equipment)return;
  const shade=document.createElement('button');shade.className='home-source-shade';shade.dataset.home26='close';shade.setAttribute('aria-label','返回长老详情');canvas.append(shade);
  const recipeParent=S.layouts.uicoloursequiptip.nodes.find(n=>n.path.endsWith('/auto_Formula')).parentID;
  const root=U.render(S.layouts.uicoloursequiptip,S.sprites,{width:1080,height:1920,node:r=>{const leaf=r.path.split('/').at(-1);
   if(leaf==='auto_bg')return {rect:{m_SizeDelta:{x:808,y:x.szSpecialDesc?1050:940},m_AnchoredPosition:{x:0,y:0}}};
   if(r.id===recipeParent)return {rect:{m_SizeDelta:{x:666,y:200}}};
   if(leaf==='Image')return {rect:{m_SizeDelta:{x:666,y:70}}};
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
  slot(root,'/auto_Formula',`<div class="home-native-formula">${[recipe.iMaterial0,recipe.iMaterial1,recipe.iMaterial2,recipe.iMaterial3,recipe.iMaterial4].filter(Boolean).map(equip).join(' + ')} → ${equip(id)}</div>`);
 }
 function sourceSkill(){const x=row(detail.id),skill=Cultivation.skill(x.iID,Math.max(0,M.level(page,x.iID)));const shade=document.createElement('button');shade.className='home-source-shade';shade.dataset.home26='close';shade.setAttribute('aria-label','返回功法详情');canvas.append(shade);const states=new Map();for(const r of L.layouts.uiseedlinginfo.nodes)for(const c of r.components)if(c.fields?.SpriteList)states.set(c.pathID,r.path.endsWith('/Auto_ghosticon')?x.iTechnique:x.iQuality);const root=U.render(L.layouts.uiseedlinginfo,L.sprites,{width:1080,height:1920,states,node:r=>{const leaf=r.path.split('/').at(-1);if(leaf==='Auto_Title')return {text:x.szName};if(leaf==='Auto_Icon')return {image:x.icon};if(leaf==='iauto_select')return {visible:false};if(leaf==='Auto_Content')return {text:''};if(leaf==='Text (TMP)')return {text:'点击空白区域关闭'};return {};}});root.classList.add('home-source-dialog');root.setAttribute('role','dialog');root.setAttribute('aria-label','怒气技说明');canvas.append(root);slot(root,'/Auto_ScrollView',`<div class="home-skill-scroll">${rich(skill?.szDesc||'')}</div>`);}

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
 function resourceJump(j){if(j.szParam1==='UIFairyland'){open('fairy');return true;}if(j.szParam1==='UIMarket'){open('market');return true;}if(j.szParam1==='UIDiscipleBirth'){page=null;detail=null;B.switchTab('wander');return true;}if(j.iMode===102&&j.szParam1==='3'){page=null;detail=null;B.switchTab('story');return true;}B.toast('该目的页尚未接入，资源与当前进度保持不变');return false;}
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
 function renderDialog(){if(detail.type==='recipe'&&page==='teacher')return sourceRecipe();if(detail.type==='story'&&page==='seed')return sourceStory();if(detail.type==='resource'&&[1,21].includes(detail.id))return ResourceTips.render(canvas,detail.id,{balance:M.balance,gate:M.gate,lockText:M.lockText,jump:resourceJump,toast:B.toast,close:()=>action('close')});if(detail.type==='item')return sourceItem();if(detail.type==='skill')return sourceSkill();if(detail.type==='stamina')return sourceStamina();let title='',body='';
  if(detail.type==='item'){title=page==='teacher'?'长老养成':'功法养成';body=itemBody();}
  if(detail.type==='universal'){title='使用通用碎片';const p=M.payment(page,detail.id);body=`<p>专属碎片不足，消耗 ${p.universal} 个通用碎片补足后升星。</p>${btn('upgrade-confirm','确认升星')}`;}
  if(detail.type==='avatar'){title='头像';body=`<div class="home-avatar-list">${D.PlayerAvatar.filter(a=>a.iType===1&&M.avatarUnlocked(a)).map(a=>`<button data-home26="avatar-set:${a.iID}" aria-label="头像${a.iID}"><img src="${icon(a.iIcon)}" alt="">${M.data().avatar===a.iID?'使用中':'使用'}</button>`).join('')}</div>`;}
  if(detail.type==='rename'){title='修改姓名';body=`<input id="home-name" aria-label="玩家姓名" maxlength="8" value="${esc(M.data().name)}"><p>昵称长度为1—8个字符</p>${btn('rename-save','确定')}`;}
  if(detail.type==='stamina'){const p=M.purchase(),c=M.cfgStamina();title='确认购买';body=`<div class="home-stamina-icon"><img src="${icon(ALIGNED_STAGE_DATA.goods.find(x=>x.iGoodsID===3)?.iIconID)}" alt="体力"></div><p>体力 ${M.balance(3)}/${c.iStaminaLimit}</p><p>每${c.iRestoreTime/60}分钟恢复${c.iRestore}点体力</p><p>今日剩余次数：${p.remaining}</p>${btn('stamina-buy',p.remaining?`${p.cost} ${esc(M.good(p.currency).szName)} · 购买${p.amount}体力`:'售罄',!p.remaining||M.balance(p.currency)<p.cost)}`;}
  if(detail.type==='recharge'){title='仙玉充值';body='<p>原版此入口打开仙玉充值商城，需要渠道订单服务。</p><p>当前为本地复刻，未连接支付服务，不会生成订单或增加仙玉。</p>';}
  if(detail.type==='resource-info'){title=M.good(detail.id).szName;body=`<p>拥有：${number(M.balance(detail.id))}</p><p>${esc(ResourceTips.goods(detail.id)?.szDesc||'')}</p>`;}
  if(detail.type==='resource'){const id=detail.id;title=M.good(id).szName;body=`<p>拥有：${number(M.balance(id))}</p><p>${esc(M.good(id).szDesc||'')}</p>${id===3?btn('stamina','购买体力'):btn('go-wander','前往游历获取')}`;}
  if(detail.type==='main-task'){const t=M.mainTask();title='新手任务';body=t?`<p>${esc(t.szDesc)}（${t.progress}/${t.iComdition}）</p>${rewardHTML(t.iRewardID)}${btn('claim-main',t.progress>=t.iComdition?'领取奖励':'前往')}`:'<p>全部新手任务已完成</p>';}
  if(detail.type==='reward'){title='获得奖励';body=detail.items.map(x=>`<p>${esc(M.good(x.id).szName)} ×${x.n}</p>`).join('');}
  if(detail.type==='warehouse'){title='仓库';const ids=[...new Set([...Object.keys(B.state().goods||{}),...Object.keys(B.state().portalV8?.wallet||{})])].map(Number).filter(id=>id>3&&M.balance(id)>0);body=`<div class="home-warehouse">${ids.map(id=>`<button data-home26="resource:${id}">${M.good(id).image?`<img src="${M.good(id).image}" alt="">`:''}${esc(M.good(id).szName)} ×${M.balance(id)}</button>`).join('')||'<p>暂无道具</p>'}</div>`;}
  if(detail.type==='mail'){title='邮件';body=(B.state().mail||[]).map((m,i)=>`<article><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p>${btn('mail-claim:'+i,m.claimed?'已领取':'领取附件',m.claimed||!m.items?.length)}</article>`).join('')||'<p>暂无邮件</p>';}
  if(detail.type==='settings'){title='设置';body=['music','effects'].map(k=>btn('setting:'+k,(k==='music'?'音乐':'音效')+'：'+(M.data().settings[k]===false?'关闭':'开启'))).join('');}
  if(detail.type==='side'){const x=D.FunctionIcon.find(x=>x.nID===detail.id);title=x.szName;body='<p>当前未连接原版在线服务，暂无可用内容。</p>';}
  if(detail.type==='story'){const x=row(detail.id);title=x.szName+' · 故事';body=page==='seed'?rich(x.szStory):HOME_DETAIL_DATA.TeacherStory.filter(t=>t.iTeacherID===x.iID).map(t=>`<article><h3>${esc(t.szStoryTitle||t.szName||'故事')}</h3>${M.level(page,x.iID)>=t.iLockStar?rich(t.szDesc||t.szStory||t.szContent||''):`${Math.floor(t.iLockStar/6)}星解锁`}</article>`).join('')||rich(x.szStory);}
  if(detail.type==='recipe'){const x=row(detail.id);title='合成配方';body=(x.arrComposeID||[]).map(id=>{const r=TEACHER_DATA.recipes.find(r=>r.iFormID===id);return r?`<p>${[r.iMaterial0,r.iMaterial1,r.iMaterial2,r.iMaterial3,r.iMaterial4].filter(Boolean).map(equip).join(' + ')} → ${r.arrProductID.map(equip).join(' / ')}</p>`:'';}).join('');}
  if(detail.type==='strategy'){const x=row(detail.id);title=x.szName+' · 攻略';body=(x.arrStrategy||[]).map(id=>HOME_DETAIL_DATA.Strategy.find(t=>t.iID===id)).filter(Boolean).map(t=>`<article><h3>${esc(t.szStraTitle)}</h3><p>${rich(t.szStraDesc)}</p><p>功法：${esc(Cultivation.seed(t.iSeedingID)?.szName||'无')}</p><p>长老：${t.arrTeacherID.map(id=>esc(TEACHER_DATA.teachers.find(x=>x.iID===id)?.szName||id)).join('、')}</p><div>${t.arrEquipID.map(equip).join('')}</div></article>`).join('');}
  if(detail.type==='sort'){title='排序';body=[5,3,1,4,2].map(id=>btn('sort-set:'+id,({1:'星阶',2:'可升星',3:'品质',4:'五行',5:'战力'})[id])).join('')+btn('reverse',reverse?'恢复正序':'倒序');}
  if(detail.type==='help'){title='养成说明';body='<p>按五行筛选，查看持有与未合成的收藏。合成消耗专属碎片；升星可用通用碎片补足，需再次确认。养成结果同步到游历携带列表和属性。</p>';}
  const box=document.createElement('div');box.className='home-modal';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label',title);box.innerHTML=`<button class="home-modal-shade" data-home26="close" aria-label="关闭弹窗"></button><section><h2>${esc(title)}</h2><div class="home-modal-body">${body}</div>${btn('close','返回')}</section>`;canvas.append(box);
 }
 const rewardHTML=id=>`<div class="home-rewards">${M.rewards(id).map(x=>`<span>${esc(M.good(x.id).szName)} ×${x.n}</span>`).join('')}</div>`;
 function renderSect(){const tasks=M.sectTasks(),root=layout('uisectv2',r=>{const p=r.path,leaf=p.split('/').at(-1);if(p.includes('/Auto_AncestorRoot')||leaf==='Auto_Ancestor'||leaf==='Auto_Preview'||leaf==='Auto_HighPropRoot'||leaf==='Auto_Prop'||leaf==='Auto_Detail')return {visible:false};if(leaf==='Auto_Close')return {action:'home26:back',label:'返回山门'};if(leaf==='Auto_CurLevelTxt')return {text:'老祖 '+B.state().sect+'级'};if(leaf==='Auto_NextLevelTxt')return {text:'老祖 '+(B.state().sect+1)+'级'};if(leaf==='Auto_LevelDes')return {text:D.SectV2.find(x=>x.iLevel===B.state().sect+1)?.szDesc.replace(/<[^>]*>/g,'')||'已满级'};if(leaf==='Auto_LevelUpButton')return {action:'home26:level-up',label:'老祖升级'};if(p.includes('/auto_TopResBar/'))return node(r)||{};return {};});canvas.append(root);slot(root,'/Auto_Tasks',`<div class="home-task-list">${tasks.map(t=>`<section><p>${esc(t.szDesc)}（${t.progress}/${t.iComdition}）</p>${rewardHTML(t.iPrize)}${btn('claim-sect:'+t.iID,t.claimed?'已领取':t.progress>=t.iComdition?'领取':'前往',t.claimed)}</section>`).join('')}</div>`);if(detail)renderDialog();}
 function jump(id){const j=D.FunctionJump.find(x=>x.iID===id);if(j?.szParam1==='UIDiscipleBirth'){page=null;detail=null;B.switchTab('wander');return;}if(j?.szParam1==='UISectV2'){open('sect-task');return;}if(j?.szParam1==='UISeedligNavs'){open('seed');return;}if(j?.szParam1==='UITeacherNavs'){open('teacher');return;}B.toast('该任务目标页面尚未接入，进度与奖励保持不变');}
 function action(a){const [key,value,context]=a.split(':'),id=+value;try{
  if(key==='recharge'&&!M.gate(13))return B.toast(M.lockText(13));
  if(['seed','teacher','sect-task','clan','market','fairy'].includes(key))return open(key);
  if(key==='back'){page=null;detail=null;return redraw();}
  if(key==='close'){if(detail?.type==='item'&&(detail.skins||detail.fullbody)){detail.skins=false;detail.fullbody=false;delete detail.skin;return redraw();}detail=detail?.parent||(['universal','skill','story','recipe','strategy'].includes(detail?.type)?{type:'item',id:detail.id}:null);return redraw();}
  if(key==='item')detail={type:'item',id};
  else if(key==='combo-item'){const g=CollectionBonuses.groups(B.state(),page).find(g=>g.id===+context);if(!g?.ids.includes(id))return;detail={type:'item',id,memberIds:g.ids};}
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
  else if(key==='upgrade'||key==='upgrade-confirm'){const p=M.payment(page,detail.id);if(key==='upgrade'&&p.universal){detail={type:'universal',id:detail.id,parent:{...detail},expectedLevel:M.level(page,detail.id)};}else {M.upgrade(page,detail.id,key==='upgrade-confirm',detail.expectedLevel);detail=detail.parent||{...detail,type:'item'};B.toast('养成成功，携带属性已更新');}}
  else if(key==='obtain'){const pool=page==='teacher'?12002:11002,previousPage=page,previousDetail={...detail};page=null;detail=null;B.openWish(pool,()=>{page=previousPage;detail=previousDetail;redraw();});return;}
  else if(key==='rename-save'){M.rename(document.getElementById('home-name').value);detail=null;}
  else if(key==='avatar-set'){const x=D.PlayerAvatar.find(x=>x.iID===id);if(!x||!M.avatarUnlocked(x))throw Error('头像尚未解锁');M.data().avatar=id;B.save();}
  else if(key==='stamina-buy')M.buyStamina();
  else if(key==='claim-main'){const t=M.mainTask();if(t.progress<t.iComdition)return jump(t.iJumpID);detail={type:'reward',items:M.claim('main',t.iID)};}
  else if(key==='claim-sect'){const t=M.sectTasks().find(t=>t.iID===id);if(t.progress<t.iComdition)return jump(t.iJump);detail={type:'reward',items:M.claim('sect',id)};}
  else if(key==='level-up'){M.levelUp();B.toast('老祖等级提升');}
  else if(key==='go-wander'){detail=null;page=null;B.switchTab('wander');return;}
  else if(key==='side'){const x=D.FunctionIcon.find(x=>x.nID===id);if(!x||!M.gate(x.iFunctionID))throw Error('当前活动未开启');detail={type:'side',id};}
  else if(key==='setting'){M.data().settings[value]=M.data().settings[value]===false;B.save();document.querySelectorAll('audio').forEach(a=>a.muted=M.data().settings.effects===false);}
  else if(key==='mail-claim'){const m=B.state().mail?.[id];if(m&&!m.claimed){m.items.forEach(x=>M.add(x.id,x.n));m.claimed=true;B.save();}}
  else detail={type:key,id};
  redraw();
 }catch(e){B.toast(e.message);}}
 document.addEventListener('click',e=>{const target=e.target.closest('[data-home26]');if(target&&!target.disabled&&canvas?.isConnected&&canvas.contains(target))action(target.dataset.home26);},{signal:events.signal});
 document.addEventListener('keydown',e=>{if(!canvas?.isConnected)return;if(e.key==='Escape'){if(page==='fairy'){Fairy.back();return;}if(page==='clan'){Clan.back();return;}if(page==='market'){if(detail)action('close');else Market.back();return;}if(detail)action('close');else if(page)action('back');}if(e.key==='Tab'&&detail){const dialog=canvas.querySelector('[role=dialog]'),buttons=[...dialog.querySelectorAll('button:not(:disabled),input')].filter(x=>x.checkVisibility()&&!x.classList.contains('home-modal-shade'));const first=buttons[0],last=buttons.at(-1);if(!dialog.contains(document.activeElement)||e.shiftKey&&document.activeElement===first||!e.shiftKey&&document.activeElement===last){e.preventDefault();(e.shiftKey?last:first)?.focus();}}},{signal:events.signal});
 return {releaseMiner:index=>Fairy.model.releaseMember(index),dispose(){events.abort();canvas=null;},begin(){currentProfile=M.profile();},node,after,action,reset(){page=null;detail=null;canvas=null;},model:M,text:()=>({page:page||'home',dialog:detail,profile:M.profile(),tasks:M.sectTasks(),mainTask:M.mainTask(),sideIcons:M.sideIcons().map(x=>x.nID),clan:Clan.text(),market:page==='market'?Market.text():null,fairy:page==='fairy'?Fairy.text():null})};
};
