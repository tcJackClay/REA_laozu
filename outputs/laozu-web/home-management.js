window.createHomeManagement=function(B){
 const M=createHomeModel(B),D=HOME_MANAGEMENT_DATA,L=HOME_MANAGEMENT_LAYOUTS,U=UnityRect,esc=Cultivation.esc,rich=Cultivation.rich;
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
 function open(kind){const id=kind==='seed'?2:kind==='teacher'?15:0;if(id&&!M.gate(id))return B.toast(M.lockText(id));page=kind;detail=null;filter=0;combo=false;redraw();}
 function row(id){return M.list(page).find(x=>x.iID===+id);}
 const levelText=n=>n<0?'未解锁':Math.floor(n/6)+'星'+n%6+'阶';
 function card(kind,x){const lv=M.level(kind,x.iID),cost=M.costs(kind,x.iID)[0],can=lv<(kind==='seed'?24:30)&&M.payment(kind,x.iID).enough;
  return `<button class="home-card quality-${x.iQuality} ${lv<0?'unowned':''}" data-home26="item:${x.iID}" aria-label="${esc(x.szName)}"><img src="${x.icon}" alt=""><span>${esc(x.szName)}</span><small>${levelText(lv)}</small>${cost?`<small>${M.balance(cost.id)}/${cost.n} 碎片</small>`:''}${can?'<i class="home-red-dot">!</i>':''}</button>`;
 }
 function renderPage(){if(page==='sect-task'){renderSect();return;}
  const teacher=page==='teacher',name=teacher?'uiteacher':'uiallseedling',root=layout(name,r=>{const p=r.path,leaf=p.split('/').at(-1);
   if(p.includes('/SortTypeList')||leaf==='Auto_Return'||leaf==='ListRoot'||/Awake|Resonance/.test(p))return {visible:false};
   if(leaf==='Auto_SortByOrder')return {action:'home26:reverse',label:'切换排序方向'};
   if(leaf==='Auto_SortOrderName')return {text:reverse?'倒序':'正序'};
   if(leaf==='SortType')return {action:'home26:sort',label:'切换排序方式'};
   if(leaf==='SortName')return {text:({1:'星阶',2:'可升星',3:'品质',4:'五行',5:'战力'})[sort]};
   if(leaf==='TitleDesBtn')return {action:'home26:help',label:'查看说明'};
   return {};
  });canvas.append(root);
  const viewport=teacher?'/Auto_Teacher/Viewport':'/Auto_Seedling/Viewport';
  const rows=M.list(page).filter(x=>x.icon&&(!filter||x.iTechnique===filter)&&(!B.state().openElements||B.state().openElements.includes(x.iTechnique))).sort((a,b)=>{const up=x=>M.level(page,x.iID)<(teacher?30:24)&&M.payment(page,x.iID).enough;const power=x=>{let n=0;for(let i=0;i<(x.arrPower?.length||0);i+=2)if(M.level(page,x.iID)>=x.arrPower[i])n=x.arrPower[i+1];return n;};const value=x=>({1:M.level(page,x.iID),2:+up(x),3:x.iQuality,4:-x.iTechnique,5:(M.level(page,x.iID)>=0?1e9:0)+power(x)})[sort];return (reverse?-1:1)*(Number(up(b))-Number(up(a))||value(b)-value(a)||a.iID-b.iID);});
  slot(root,viewport,`<div class="home-catalog">${combo?comboHTML():rows.map(x=>card(page,x)).join('')}</div>`);
  const selector=el(root,'/auto_ClassSelector');if(selector)selector.innerHTML=`<div class="home-filters">${['全部','金','木','水','火','土','雷','邪','体'].map((x,i)=>`<button data-home26="filter:${i}" aria-pressed="${i===filter}">${x}</button>`).join('')}</div>`;
  const nav=layout(teacher?'uiteachernavs':'uiseedlignavs',r=>{const leaf=r.path.split('/').at(-1);if(leaf==='auto_Back')return {action:'home26:back',label:'返回山门'};if(leaf==='Auto_NavBtn1')return {action:'home26:list',label:teacher?'长老列表':'功法列表'};if(leaf==='Auto_NavBtn2')return {action:'home26:combo',label:teacher?'长老组合':'功法组合'};if(leaf==='Auto_NabBtn3')return {visible:false};return {};});canvas.append(nav);
  if(!el(nav,'/auto_Back'))canvas.insertAdjacentHTML('beforeend',`<button class="home-page-back" data-home26="back"><img src="assets/btn_fanhui.png" alt="返回山门"></button>`);
  if(detail)renderDialog();
 }
 function comboHTML(){const teacher=page==='teacher',groups=teacher?D.TeacherGroup:D.SeedlingGroup;return groups.map(g=>{const ids=g[teacher?'arrTeacherSuit':'arrSeedlingSuit'],attrs=g[teacher?'arrTeacherSuitAttr':'arrSeedlingAttribute'],level=Math.min(...ids.map(id=>M.level(page,id)));return `<section class="home-combo"><h3>${esc(g[teacher?'szTeacherSuitName':'szSeedlingSuitName'])}</h3><div>${ids.map(id=>{const x=row(id);return x?card(page,x):'';}).join('')}</div>${Array.from({length:attrs.length/3},(_,i)=>`<p class="${level>=attrs[i*3]?'active':''}">全组达到${levelText(attrs[i*3])}：${attr(attrs[i*3+1],attrs[i*3+2])} ${level>=attrs[i*3]?'条件已达成':'条件未达成'}</p>`).join('')}</section>`;}).join('');}
 function attr(id,v){const a=TEACHER_DATA.attributes.find(x=>x.iAtrributeID===id);return esc(a?.szAttrName||'属性 '+id)+' +'+([2001,2002,2003,2007].includes(id)?v:v/100+'%');}
 function itemBody(){const x=row(detail.id),lv=M.level(page,x.iID),next=lv+1,pay=M.payment(page,x.iID),teacher=page==='teacher',attributes=[x.arrSecondAttribute1,x.arrSecondAttribute2,x.arrSecondAttribute3].filter(a=>a?.length>1);
  const skill=!teacher?Cultivation.skill(x.iID,Math.max(0,lv)):null;
  return `<div class="home-item-hero"><img src="${x.icon}" alt=""><div><h2>${esc(x.szName)}</h2><p>${levelText(lv)} → ${levelText(next)}</p></div></div><section class="home-attributes">${attributes.map(a=>`<p>${attr(a[0],lv<0?0:a[Math.min(lv+1,a.length-1)])} → ${attr(a[0],a[Math.min(next+1,a.length-1)])}</p>`).join('')}</section>${skill?`<h3>${esc(skill.szName||'怒气技')}</h3><p>${rich(skill.szDesc)}</p>`:''}${teacher?`<h3>合成配方</h3>${(x.arrComposeID||[]).map(id=>{const r=TEACHER_DATA.recipes.find(r=>r.iFormID===id);return r?`<p>${[r.iMaterial0,r.iMaterial1,r.iMaterial2,r.iMaterial3,r.iMaterial4].filter(Boolean).map(equip).join(' + ')} → ${equip(r.arrProductID[0])}</p>`:'';}).join('')}`:''}<p>${rich(x.szStory||'')}</p><div class="home-costs">${pay.costs.map(c=>`<span>${esc(M.good(c.id).szName)} ${M.balance(c.id)}/${c.n}</span>`).join('')}</div>${btn('upgrade',lv<0?'合成':'升星',!pay.enough||lv>=(teacher?30:24))}${btn('obtain','去获取')}`;
 }
 function equip(id){const x=TEACHER_DATA.equipment.find(x=>x.id===id)||GAME_DATA.items.find(x=>x.id===id);return x?`<span class="home-recipe"><img src="${x.icon}" alt="">${esc(x.name)}</span>`:String(id);}
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
 function renderDialog(){if(detail.type==='stamina')return sourceStamina();let title='',body='';
  if(detail.type==='item'){title=page==='teacher'?'长老养成':'功法养成';body=itemBody();}
  if(detail.type==='universal'){title='使用通用碎片';const p=M.payment(page,detail.id);body=`<p>专属碎片不足，消耗 ${p.universal} 个通用碎片补足后升星。</p>${btn('upgrade-confirm','确认升星')}`;}
  if(detail.type==='avatar'){title='头像';body=`<div class="home-avatar-list">${D.PlayerAvatar.filter(a=>a.iType===1&&M.avatarUnlocked(a)).map(a=>`<button data-home26="avatar-set:${a.iID}" aria-label="头像${a.iID}"><img src="${icon(a.iIcon)}" alt="">${M.data().avatar===a.iID?'使用中':'使用'}</button>`).join('')}</div>`;}
  if(detail.type==='rename'){title='修改姓名';body=`<input id="home-name" aria-label="玩家姓名" maxlength="8" value="${esc(M.data().name)}"><p>昵称长度为1—8个字符</p>${btn('rename-save','确定')}`;}
  if(detail.type==='stamina'){const p=M.purchase(),c=M.cfgStamina();title='确认购买';body=`<div class="home-stamina-icon"><img src="${icon(ALIGNED_STAGE_DATA.goods.find(x=>x.iGoodsID===3)?.iIconID)}" alt="体力"></div><p>体力 ${M.balance(3)}/${c.iStaminaLimit}</p><p>每${c.iRestoreTime/60}分钟恢复${c.iRestore}点体力</p><p>今日剩余次数：${p.remaining}</p>${btn('stamina-buy',p.remaining?`${p.cost} ${esc(M.good(p.currency).szName)} · 购买${p.amount}体力`:'售罄',!p.remaining||M.balance(p.currency)<p.cost)}`;}
  if(detail.type==='recharge'){title='仙玉充值';body='<p>原版此入口打开仙玉充值商城，需要渠道订单服务。</p><p>当前为本地复刻，未连接支付服务，不会生成订单或增加仙玉。</p>';}
  if(detail.type==='resource'){const id=detail.id;title=M.good(id).szName;body=`<p>拥有：${number(M.balance(id))}</p><p>${esc(M.good(id).szDesc||'')}</p>${id===3?btn('stamina','购买体力'):btn('go-wander','前往游历获取')}`;}
  if(detail.type==='main-task'){const t=M.mainTask();title='新手任务';body=t?`<p>${esc(t.szDesc)}（${t.progress}/${t.iComdition}）</p>${rewardHTML(t.iRewardID)}${btn('claim-main',t.progress>=t.iComdition?'领取奖励':'前往')}`:'<p>全部新手任务已完成</p>';}
  if(detail.type==='reward'){title='获得奖励';body=detail.items.map(x=>`<p>${esc(M.good(x.id).szName)} ×${x.n}</p>`).join('');}
  if(detail.type==='warehouse'){title='仓库';const ids=[...new Set([...Object.keys(B.state().goods||{}),...Object.keys(B.state().portalV8?.wallet||{})])].map(Number).filter(id=>id>3&&M.balance(id)>0);body=`<div class="home-warehouse">${ids.map(id=>`<button data-home26="resource:${id}">${M.good(id).image?`<img src="${M.good(id).image}" alt="">`:''}${esc(M.good(id).szName)} ×${M.balance(id)}</button>`).join('')||'<p>暂无道具</p>'}</div>`;}
  if(detail.type==='mail'){title='邮件';body=(B.state().mail||[]).map((m,i)=>`<article><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p>${btn('mail-claim:'+i,m.claimed?'已领取':'领取附件',m.claimed||!m.items?.length)}</article>`).join('')||'<p>暂无邮件</p>';}
  if(detail.type==='settings'){title='设置';body=['music','effects'].map(k=>btn('setting:'+k,(k==='music'?'音乐':'音效')+'：'+(M.data().settings[k]===false?'关闭':'开启'))).join('');}
  if(detail.type==='side'){const x=D.FunctionIcon.find(x=>x.nID===detail.id);title=x.szName;body='<p>当前未连接原版在线服务，暂无可用内容。</p>';}
  if(detail.type==='sort'){title='排序';body=[5,3,1,4,2].map(id=>btn('sort-set:'+id,({1:'星阶',2:'可升星',3:'品质',4:'五行',5:'战力'})[id])).join('')+btn('reverse',reverse?'恢复正序':'倒序');}
  if(detail.type==='help'){title='养成说明';body='<p>按五行筛选，查看持有与未合成的收藏。合成消耗专属碎片；升星可用通用碎片补足，需再次确认。养成结果同步到游历携带列表和属性。</p>';}
  const box=document.createElement('div');box.className='home-modal';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label',title);box.innerHTML=`<button class="home-modal-shade" data-home26="close" aria-label="关闭弹窗"></button><section><h2>${esc(title)}</h2><div class="home-modal-body">${body}</div>${btn('close','返回')}</section>`;canvas.append(box);
 }
 const rewardHTML=id=>`<div class="home-rewards">${M.rewards(id).map(x=>`<span>${esc(M.good(x.id).szName)} ×${x.n}</span>`).join('')}</div>`;
 function renderSect(){const tasks=M.sectTasks(),root=layout('uisectv2',r=>{const p=r.path,leaf=p.split('/').at(-1);if(p.includes('/Auto_AncestorRoot')||leaf==='Auto_Ancestor'||leaf==='Auto_Preview'||leaf==='Auto_HighPropRoot'||leaf==='Auto_Prop'||leaf==='Auto_Detail')return {visible:false};if(leaf==='Auto_Close')return {action:'home26:back',label:'返回山门'};if(leaf==='Auto_CurLevelTxt')return {text:'老祖 '+B.state().sect+'级'};if(leaf==='Auto_NextLevelTxt')return {text:'老祖 '+(B.state().sect+1)+'级'};if(leaf==='Auto_LevelDes')return {text:D.SectV2.find(x=>x.iLevel===B.state().sect+1)?.szDesc.replace(/<[^>]*>/g,'')||'已满级'};if(leaf==='Auto_LevelUpButton')return {action:'home26:level-up',label:'老祖升级'};if(p.includes('/auto_TopResBar/'))return node(r)||{};return {};});canvas.append(root);slot(root,'/Auto_Tasks',`<div class="home-task-list">${tasks.map(t=>`<section><p>${esc(t.szDesc)}（${t.progress}/${t.iComdition}）</p>${rewardHTML(t.iPrize)}${btn('claim-sect:'+t.iID,t.claimed?'已领取':t.progress>=t.iComdition?'领取':'前往',t.claimed)}</section>`).join('')}</div>`);if(detail)renderDialog();}
 function jump(id){const j=D.FunctionJump.find(x=>x.iID===id);if(j?.szParam1==='UIDiscipleBirth'){page=null;detail=null;B.switchTab('wander');return;}if(j?.szParam1==='UISectV2'){open('sect-task');return;}if(j?.szParam1==='UISeedligNavs'){open('seed');return;}if(j?.szParam1==='UITeacherNavs'){open('teacher');return;}B.toast('该任务目标页面尚未接入，进度与奖励保持不变');}
 function action(a){const [key,value]=a.split(':'),id=+value;try{
  if(key==='recharge'&&!M.gate(13))return B.toast(M.lockText(13));
  if(['seed','teacher','sect-task'].includes(key))return open(key);
  if(key==='back'){page=null;detail=null;return redraw();}
  if(key==='close'){detail=detail?.type==='universal'?{type:'item',id:detail.id}:null;return redraw();}
  if(key==='item')detail={type:'item',id};
  else if(key==='filter'){filter=id;detail=null;}
  else if(key==='sort')detail={type:'sort'};
  else if(key==='sort-set'){sort=id;detail=null;}
  else if(key==='reverse')reverse=!reverse;
  else if(key==='combo')combo=true;
  else if(key==='list')combo=false;
  else if(key==='expand')expanded=!expanded;
  else if(key==='fold-left')leftFold=!leftFold;
  else if(key==='fold-right')rightFold=!rightFold;
  else if(key==='upgrade'||key==='upgrade-confirm'){const p=M.payment(page,detail.id);if(key==='upgrade'&&p.universal){detail={type:'universal',id:detail.id};}else {M.upgrade(page,detail.id,key==='upgrade-confirm');detail={type:'item',id:detail.id};B.toast('养成成功，携带属性已更新');}}
  else if(key==='obtain'){page=null;detail=null;B.switchTab('wish');return;}
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
 document.addEventListener('keydown',e=>{if(!canvas?.isConnected)return;if(e.key==='Escape'){if(detail)action('close');else if(page)action('back');}if(e.key==='Tab'&&detail){const dialog=canvas.querySelector('[role=dialog]'),buttons=[...dialog.querySelectorAll('button:not(:disabled),input')].filter(x=>x.checkVisibility()&&!x.classList.contains('home-modal-shade'));const first=buttons[0],last=buttons.at(-1);if(!dialog.contains(document.activeElement)||e.shiftKey&&document.activeElement===first||!e.shiftKey&&document.activeElement===last){e.preventDefault();(e.shiftKey?last:first)?.focus();}}},{signal:events.signal});
 return {dispose(){events.abort();canvas=null;},begin(){currentProfile=M.profile();},node,after,action,reset(){page=null;detail=null;canvas=null;},model:M,text:()=>({page:page||'home',dialog:detail,profile:M.profile(),tasks:M.sectTasks(),mainTask:M.mainTask(),sideIcons:M.sideIcons().map(x=>x.nID)})};
};
