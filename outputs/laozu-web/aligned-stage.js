/* Original client flow. No local damage formula, stat multiplier or invented star rating. */
window.createAlignedStage=function(B){
 'use strict';
 const L=window.ORIGINAL_LAYOUT_DATA,D=window.ALIGNED_STAGE_DATA,P=window.PORTAL_DATA,U=window.UnityRect,KEY='laozu-source-alignment-v9';
 const initial=()=>({schema:10,contexts:[],lastChallengeAt:null,phase:'chapter',nodeID:10101,chapterID:101,profile:null,roster:[],formation:[],wallet:{},wins:{},applied:{},journal:[],pending:null,result:null,prizeCache:null,battle:null,trace:[],snapshotProvenance:null});
 let s=initial();try{const v=JSON.parse(localStorage.getItem(KEY));if(v?.schema===10)s=v;}catch{}
 let scene=null,canvas=null,activeTab=null,transport=null,tip=null,lastChallengeAt=null;
 const by=(a,id,key='iID')=>a.find(x=>x[key]===+id),node=()=>by(D.nodes,s.nodeID),enemy=()=>by(D.monsters,by(D.formations,node().iMonsterFormation).arrMonster[0]),starConf=()=>by(D.starRewards,node().iStarPrizeID);
 const esc=B.escape,save=()=>localStorage.setItem(KEY,JSON.stringify(s));
 const trace=(event,payload={})=>{s.trace.push({event,payload});s.trace=s.trace.slice(-100);};
 const art=name=>Object.values(L.sprites).find(x=>x.name===name)?.file||window.HOME_DATA.assets[name]||P.assets[name]||'';
 const good=id=>P.goods.find(x=>x.iGoodsID===+id)||D.goods.find(x=>x.iGoodsID===+id),icon=id=>good(id)?.image||'assets/prop_mu.png';
 const unlocked=n=>!n.arrFrontNode.length||(s.wins[n.arrFrontNode[1]]||0)>0;
 function prefab(name,cb,states){return U.render(L.layouts[name],L.sprites,{width:1080,height:1920,node:cb,states});}
 function locate(root,part){return [...root.querySelectorAll('[data-source-path]')].find(el=>el.dataset.sourcePath.endsWith(part));}
 function replaceSlot(root,part,content){const el=locate(root,part);if(!el)return;el.replaceChildren();const slot=document.createElement('div');slot.className='unity-slot';slot.innerHTML=content;el.append(slot);}
 function blockMessage(text){tip={type:'message',text};draw();}
 function navigate(tab){tip=null;if(tab==='sect')s.phase='chapter';save();B.switchTab(tab);}
 function renderNav(){const ids=['disciples','wish','sect','story','activities','guild'],labels=['弟子','祈愿','山门','主线','玩法','仙盟'],icons=['dizi','zhaomu','zhucheng','zhuxian','wanfa','xianmeng'];return prefab('uimainnavs',r=>{const m=r.path.match(/auto_NavButtons\/(ToggleButton(?: \((\d+)\))?)(?:\/|$)/);if(!m)return {};const i=+(m[2]||0),leaf=r.path.split('/').at(-1);if(r.path.endsWith(m[1]))return {action:'nav:'+ids[i],label:labels[i]};if(leaf==='diwen'||leaf.startsWith('mingzidi'))return {visible:activeTab===ids[i]};if(leaf==='ZuoZuo')return {text:labels[i]};if(r.components.some(c=>c.sprite)&&!['diwen'].includes(leaf)&&!leaf.startsWith('mingzidi'))return {image:art(icons[i])};return {};});}
 function renderHome(){
  const h=prefab('uimain',r=>{const p=r.path;
   if(/\/(LeftDownRoot|LeftBtnGroup|IconGroupLeft|auto_rTopRoot)$/.test(p)||/lop_BuildingReddot|WanderDifficulty|auto_redPrivate/.test(p))return {visible:false};
   if(p.endsWith('/Auto_Photo')||p.endsWith('/auto_PlayerHead/touxiang'))return {image:false};
   if(p.endsWith('/Auto_Name'))return {text:s.profile?.name||'—'};
   if(p.endsWith('/Auto_Power'))return {text:'战力：'+(s.profile?.power??'—')};
   if(p.endsWith('/Auto_LevelTxt'))return {text:'宗门：'+(s.profile?.sectLevel??'—')+'级'};
   if(p.endsWith('/auto_SectV2Level'))return {text:(s.profile?.sectLevel??'—')+'级'};
   if(p.endsWith('/Res (4)'))return {visible:false};
   if(p.includes('/auto_TopResBar/')&&p.endsWith('/Icon')){const i=+(p.match(/Res \((\d+)\)/)?.[1]||1);return {image:sourceIcon(D.goods.find(x=>x.iGoodsID===[2,1,3][i-1])?.iIconID)};}
   if(p.includes('/auto_TopResBar/')&&p.endsWith('/Num')){const i=+(p.match(/Res \((\d+)\)/)?.[1]||1);return {text:String(s.wallet[[2,1,3][i-1]]??0)};}
   if(/auto_SectTask(?:Progress)?$/.test(p)||p.includes('/auto_MainTaskEntry/'))return {visible:false};
   if(/\/(auto_ZhandouBtn)$/.test(p))return {action:'nav:story',label:'主线'};
   if(p.endsWith('/auto_WanderDBtn'))return {action:'nav:wander',label:B.wanderActive?.()?'游历中':'游历'};
   if(p.endsWith('/auto_SeedingBtn')||p.endsWith('/auto_TeacherBtn'))return {action:'nav:wish',label:'祈愿'};
   if(p.endsWith('/auto_warehouseBtn'))return {action:'nav:bag',label:'仓库'};
   if(p.includes('/Auto_WanderD/lop_Label/Text'))return {text:B.wanderActive?.()?'游历中':'游历',...(B.wanderActive?.()?{color:{r:1,g:.8,b:.3,a:1}}:{})};
   if(p.endsWith('/Auto_Zhandou')||p.endsWith('/Auto_CombatSimulator')||p.endsWith('/Auto_EquipIllus')||p.endsWith('/Auto_SectFormation')||p.endsWith('/Auto_Guild')||p.endsWith('/Auto_gem')||/Auto_PannelMask/.test(p))return {visible:false};
   return {};
  });canvas.append(h,renderNav());
 }
 function renderChapter(){
  const total=Object.values(s.wins).reduce((a,b)=>a+b,0);let item=0;
  const h=prefab('uistagechapter',r=>{const p=r.path;
   if(p.endsWith('/auto_PlantScene')||p.includes('/Scrollbar')||p.endsWith('/auto_IdlePrize')||p.endsWith('/StarRank'))return {visible:false};
   if(p.endsWith('/Auto_Exit'))return {action:'nav:sect',label:'返回山门'};
   if(p.endsWith('/xauto_Name'))return {text:D.chapter.szName};
   if(p.endsWith('/xauto_Lock')||p.endsWith('/xauto_Finish')||p.endsWith('/xauto_BoxOpen'))return {visible:false};
   if(p.endsWith('/auto_starsNum'))return {text:total+'/24'};
   if(p.endsWith('/xauto_starCount'))return {text:String([8,16,24][item++]??'')};
   if(p.includes('ListItem (4)')&&p.includes('/auto_StarsPrizes/'))return {visible:false};
   return {};
  });
  const scroll=locate(h,'/Auto_Map');if(scroll){scroll.replaceChildren();scroll.classList.add('source-map-scroll');const map=document.createElement('div');map.className='source-map';const layers=P.maps[D.scene.szStageMapPath.split('/').at(-1).replace('.prefab','').toLowerCase()],height=Math.max(...layers.map(x=>-x.rect.m_AnchoredPosition.y+x.rect.m_SizeDelta.y/2),2340);map.style.height=height+'px';
   // Map coordinates are native map-local coordinates; source node arrPos is centered X / bottom-up Y.
   for(const layer of layers){if(!layer.file)continue;const im=document.createElement('img');im.src=layer.file;const r=layer.rect;im.style.cssText=`left:${r.m_AnchoredPosition.x-r.m_SizeDelta.x/2}px;top:${-r.m_AnchoredPosition.y-r.m_SizeDelta.y/2}px;width:${r.m_SizeDelta.x}px;height:${r.m_SizeDelta.y}px`;map.append(im);}
   for(const n of D.nodes)map.append(renderMapNode(n,height));
   scroll.append(map);requestAnimationFrame(()=>{scroll.scrollTop=Math.max(0,height-node().arrPos[1]-scroll.clientHeight*.65);});
  }
  replaceSlot(h,'/auto_Disciples',teamHTML());canvas.append(h,renderNav());
 }
 function renderMapNode(n,height){
  const data=structuredClone(L.layouts.stagenode_normal),rt=data.nodes[0].components.find(c=>c.type==='RectTransform');
  rt.m_AnchorMin=rt.m_AnchorMax={x:.5,y:0};rt.m_AnchoredPosition={x:n.arrPos[0],y:n.arrPos[1]};
  const fields=data.nodes[0].components.find(c=>c.fields?.stateSwitcher).fields;
  const owner=id=>data.nodes.find(r=>r.components.some(c=>c.pathID===id))?.id;
  const next=D.nodes.find(n=>unlocked(n)&&!s.wins[n.iID]),state=!unlocked(n)?1:next?.iID===n.iID?2:0;
  const starRoot=data.nodes.find(r=>r.path.endsWith('/x')),stars=starRoot.components.find(c=>c.fields?.m_GameObjects)?.fields.m_GameObjects||[];
  const overrides=new Map(stars.map((ref,i)=>[ref.m_PathID,{visible:i<(s.wins[n.iID]||0)}]));
  return U.render(data,L.sprites,{width:1080,height,states:new Map([[fields.stateSwitcher.m_PathID,state]]),node:r=>{
   if(r===data.nodes[0])return {action:'node:'+n.iID,label:n.szTip};
   if(r.id===owner(fields.textName.m_PathID))return {text:n.szName};
   if(r.id===owner(fields.textIdx.m_PathID))return {text:n.szNo};return overrides.get(r.id)||{};
  }});
 }
 function teamHTML(){return `<div class="source-team-list">${s.roster.map(x=>`<button data-original-action="select:${esc(x.id)}" aria-pressed="${s.formation.includes(x.id)}"><img src="${esc(x.icon||'assets/touxiang.png')}" alt=""><span>${esc(x.name)}</span><span>${x.power??'—'}</span></button>`).join('')||'<span>暂无出战弟子</span>'}</div>`;}

 function flexIndex(name,suffix,row){
  const layout=L.layouts[name],root=layout.nodes.find(x=>x.path.endsWith(suffix));if(!root)return -1;
  const list=root.components.find(c=>c.fields?.Items)?.fields.Items||[];
  const ids=list.map(ref=>layout.nodes.find(x=>x.components.some(c=>c.pathID===ref.m_PathID))?.id);
  const parents=new Map(layout.nodes.map(r=>[r.id,r.parentID]));let id=row.id;
  while(id&&parents.get(id)!==root.id)id=parents.get(id);return ids.indexOf(id);
 }
 function sourceIcon(id){const name=D.icons.find(x=>x.nID===+id)?.strIconName;return Object.values(L.sprites).find(x=>x.name===name)?.file||P.assets[name]||'';}
 function monsterIcon(){return sourceIcon(enemy().iSquareIcon);}
 function powerText(n){return n>=10000?(Math.floor(n/100)/100).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')+'万':String(n);}
 function renderDetail(){
  const name='uistagenodeinfokunnanboss',star=s.wins[s.nodeID]||0;
  const h=prefab(name,r=>{const p=r.path,i=flexIndex(name,'/auto_Monsters',r),box=flexIndex(name,'/auto_StarPrize',r);
   if(p.endsWith('/auto_Name'))return {text:node().szName};
   if(p.endsWith('/auto_Start'))return {action:'prepare',label:'挑战'};
   if(p.endsWith('/icon_ty_fanhui'))return {action:'close-detail',label:'返回主线'};
   if(p.endsWith('/auto_DifficultyBar'))return {visible:node().iDifficultyGroup!==0};
   if(p.endsWith('/auto_Skills'))return {visible:enemy().showSkill.length>0};
   if(i>0&&r.parentID===L.layouts[name].nodes.find(x=>x.path.endsWith('/auto_Monsters')).id)return {visible:false};
   if(i===0){
    if(p.endsWith('/xauto_FightPower'))return {text:powerText(enemy().iPower)};
    if(p.endsWith('/xauto_Element'))return {image:art('prop_jin')};
    if(/\/MonsterWeak \([23]\)$/.test(p))return {visible:false};
    if(p.endsWith('/xauto_Name'))return {text:D.weaks.find(x=>x.iID===by(D.formations,node().iMonsterFormation).arrWeak1[0])?.szTitle||''};
   }
   if(box>=0){if(p.endsWith('/xauto_Tip'))return {text:starConf()['szCondTip'+(box+1)]};if(p.endsWith('/xauto_Complete')||p.endsWith('/xauto_Finish'))return {visible:box<star};
    const root=L.layouts[name].nodes.find(x=>x.path.endsWith('/auto_StarPrize'));if(r.parentID===root.id)return {action:'star-preview:'+(box+1),label:starConf()['szCondTip'+(box+1)]};}
   return {};
  });
  const actor=L.layouts[name].nodes.find(r=>flexIndex(name,'/auto_Monsters',r)===0&&r.path.endsWith('/xauto_Avatar'));
  if(actor){const rootRef=actor.components.find(c=>c.fields?.root)?.fields.root.m_PathID,root=L.layouts[name].nodes.find(r=>r.components.some(c=>c.pathID===rootRef)),v=D.monsterVisual;
   if(root&&v)replaceSlot(h,root.path,`<div class="source-turtle" style="width:${v.frameWidth}px;height:${v.frameHeight}px;left:calc(50% - ${v.originX}px);top:calc(50% - ${v.originY}px)" role="img" aria-label="玄铁龟原始骨骼动画"></div>`);
  }canvas.append(h);
 }

 function renderFormation(){const h=prefab('uitowerstageselect',r=>{const p=r.path;
   if(p.endsWith('/Title'))return {text:'选择出战弟子'};
   if(p.endsWith('/Auto_EnemyPower'))return {text:String(enemy().iPower)};
   if(p.endsWith('/Auto_Select_Power'))return {text:String(s.roster.filter(x=>s.formation.includes(x.id)).reduce((a,x)=>a+(x.power||0),0))};
   if(p.endsWith('/Auto_SelectText'))return {text:`出战弟子 ${s.formation.length}/${node().iDiscipleNumMax}`};
   if(p.endsWith('/Auto_ChanllengeText'))return {text:'挑战'};
   if(p.endsWith('/Auto_Challenge'))return {action:'challenge',label:'开始挑战'};
   if(p.endsWith('/Auto_Return'))return {action:'close-formation',label:'返回关卡详情'};
   if(p.endsWith('/Auto_CouponCostIcon')||p.endsWith('/Auto_ElementLimitText')||p.endsWith('/Auto_Attr')||p.endsWith('/Auto_AybssSelectStatusDropdown')||p.endsWith('/auto_EnemyTipPanel'))return {visible:false};
   return {};
  });replaceSlot(h,'/Auto_EnemyList',`<div class="source-monster-preview"><img src="${monsterIcon()}" alt=""><span>${esc(enemy().szName)}</span></div>`);replaceSlot(h,'/Auto_Hero/Viewport/Content',teamHTML());replaceSlot(h,'/Auto_Select/Viewport',teamHTML());canvas.append(h);}
 function requestChallenge(){
  if(s.pending||s.phase!=='formation')return;
  if(!s.formation.length)return blockMessage('请先选择出战弟子');
  if(s.formation.length>node().iDiscipleNumMax)return;
  const now=performance.now();if(lastChallengeAt!==null&&now-lastChallengeAt<2000)return blockMessage('操作过快，请稍后尝试');
  lastChallengeAt=now;
  const payload={chapterid:s.chapterID,nodeid:s.nodeID,formationid:16,buffFlags:0},id=crypto.randomUUID();
  s.pending={id,request:payload};s.contexts.push({id,nodeID:s.nodeID,chapterID:s.chapterID,finished:false});s.contexts=s.contexts.slice(-20);
  s.phase='pending';s.battle=null;s.result=null;s.prizeCache=null;
  trace('RequestSetFormation',{formationid:16,disciples:s.formation});trace('Req_t1053_Challenge',{args:[String(s.chapterID),String(s.nodeID),'16','0']});
  save();draw();if(transport)transport({name:'Req_t1053_Challenge',args:[String(s.chapterID),String(s.nodeID),'16','0'],payload,requestID:id});
 }

 function renderPending(){canvas.insertAdjacentHTML('beforeend',`<div class="source-shade"></div><div class="source-message" role="status">${s.phase==='pending'?'等待战斗数据':'等待结算数据'}<p>尚未接入原版战报，当前不会生成胜负或发放奖励。</p><button data-original-action="cancel-pending">返回主线</button></div>`);}
 function renderBattle(){
  const e=enemy(),b=s.battle;canvas.style.background='#ddd0b7';
  canvas.insertAdjacentHTML('beforeend',`<div class="source-battle-actors">${b.entities.map(x=>`<article><img src="${esc(x.icon||monsterIcon())}" alt=""><span>${esc(x.name)}</span><progress value="${x.hp}" max="${x.maxHp}"></progress><span>${x.hp} / ${x.maxHp}</span></article>`).join('')}</div><div class="source-battle-log">第 ${b.round||0} 回合${b.log.slice(-4).map(x=>'<p>'+esc(x)+'</p>').join('')}</div>`);
  // The battle prefab contains source-positioned round/end presentation; no inferred timer is used.
  canvas.append(prefab('uibattlestoryscene',r=>{if(r.path.endsWith('/Mask'))return {visible:false};if(r.path.endsWith('/auto_battleRoundStart'))return {visible:!b.ended};if(r.path.endsWith('/auto_battleEnd'))return {visible:!!b.ended};if(r.path.endsWith('/auto_battleRoundStartTxt'))return {text:`第${b.round||0}回合`};if(r.path.endsWith('/auto_battleEndTxt'))return {text:'战斗结束'};return {};}));
 }
 function renderResult(){let box=0;const cache=s.prizeCache,h=prefab('uistageprizes',r=>{const p=r.path;
   if(p.endsWith('/auto_NoRewards'))return {visible:!cache};
   if(p.endsWith('/auto_Rewards'))return {visible:!!cache};
   if(p.endsWith('/Auto_Next'))return {visible:!!nextNode(),action:'next-node',label:'下一关'};
   if(p.endsWith('/Auto_Return'))return {visible:false};
   if(p.endsWith('/auto_statistics'))return {action:'statistics',label:'战斗统计'};
   if(p.endsWith('/xauto_PrizeTips')){const i=box++;return {text:starConf()['szCondTip'+(i+1)]};}
   if(p.endsWith('/xauto_PrizeFlag'))return {visible:false};
   return {};
  });replaceSlot(h,'/auto_Rewards',`<div class="source-ledger-items">${(cache?.goods||[]).map(x=>`<div class="source-ledger-item"><img src="${icon(x.id)}" alt=""><span>${esc(good(x.id)?.szName||String(x.id))} ×${x.num}</span></div>`).join('')}</div>`);canvas.append(h);}
 function nextNode(){const i=D.chapter.arrNodes.indexOf(s.nodeID);return D.nodes.find(n=>D.chapter.arrNodes.indexOf(n.iID)>i&&n.iNodeType!==3&&unlocked(n));}
 function draw(){if(!canvas)return;canvas.replaceChildren();canvas.style.background='';canvas.dataset.phase=activeTab==='sect'?'home':s.phase;
  if(activeTab==='sect')renderHome();else {renderChapter();if(['detail','formation','pending'].includes(s.phase)){const shade=document.createElement('div');shade.className='source-shade';canvas.append(shade);}if(s.phase==='detail')renderDetail();if(s.phase==='formation')renderFormation();if(s.phase==='pending')renderPending();if(s.phase==='battle'){canvas.replaceChildren();renderBattle();if(s.battle.ended&&!s.result)renderPending();}if(s.phase==='result'){canvas.replaceChildren();renderResult();}if(s.phase==='failed'){canvas.replaceChildren();canvas.append(prefab('uistagebattlefail',r=>r.path.toLowerCase().includes('return')?{action:'return-result',label:'返回主线'}:{}));}}
  if(s.snapshotProvenance?.kind==='controlled-fixture')canvas.insertAdjacentHTML('beforeend','<span class="source-evidence-badge">受控测试数据</span>');
  if(tip){const text=tip.type==='stars'?starConf().szCondTip1+'<br>'+starConf().szCondTip2+'<br>'+starConf().szCondTip3:esc(tip.text);canvas.insertAdjacentHTML('beforeend',`<div class="source-shade"></div><div class="source-conditions" role="dialog" aria-modal="true">${text}<p><button data-original-action="close-tip">关闭</button></p></div>`);}
 }
 function action(a){if(a.startsWith('nav:'))return navigate(a.slice(4));if(a.startsWith('node:')){const n=by(D.nodes,+a.slice(5));if(!n||!unlocked(n))return;s.nodeID=n.iID;s.phase='detail';trace('UIStageNodeInfoKunNanBoss',{nodeID:n.iID});}
  else if(a==='prepare'){s.phase='formation';trace('UITowerStageSelect');}
  else if(a==='close-detail')s.phase='chapter';else if(a==='close-formation')s.phase='detail';
  else if(a.startsWith('select:')){const id=a.slice(7);if(!s.roster.some(x=>x.id===id))return;if(s.formation.includes(id))s.formation=s.formation.filter(x=>x!==id);else if(s.formation.length<node().iDiscipleNumMax)s.formation.push(id);}
  else if(a==='challenge')return requestChallenge();
  else if(a==='star-tips')tip={type:'stars'};
  else if(a.startsWith('star-preview:')){const i=+a.slice(13)-1,prize=by(D.prizes,starConf().arrPrizeID[i],'iPrizeID');tip={type:'message',text:starConf()['szCondTip'+(i+1)]+'：'+(prize?.arrItem1||[]).map((id,j)=>(good(id)?.szName||id)+' ×'+prize.arrNum1[j]).join('、')};}
  else if(a==='close-tip')tip=null;
  else if(a==='cancel-pending'){const ctx=s.contexts.find(x=>x.id===s.pending?.id);if(ctx)ctx.abandoned=true;s.phase='chapter';s.pending=null;s.battle=null;}
  else if(a==='return-result'){s.phase='chapter';s.prizeCache=null;trace('ClearChallengePrize');}
  else if(a==='next-node'){const n=nextNode();if(n){s.nodeID=n.iID;s.phase='detail';s.prizeCache=null;}}
  else if(a==='statistics')tip={type:'message',text:s.battle?.log.join('；')||'暂无战斗统计'};
  save();draw();
 }
 // Adapter consumes authoritative values. Prize notification, bag updates and star result are distinct events.
 function receive(event){
  const before=structuredClone(s);
  try{
   if(!event||typeof event.name!=='string')throw Error('Invalid event');
   const ctx=s.contexts.find(x=>x.id===event.requestID);if(!ctx)throw Error('Stale or unrelated challenge response');
   const name=event.name,p=event.payload||{},current=s.pending?.id===ctx.id;
   if(!current&&!['BagDelta','Client_t1053_MainLineBattleResultNtf','EVENT_SHOW_PRIZE_CUSTOM'].includes(name))throw Error('Challenge already completed');
   if(name==='Client_t1053_MainLineChallengeRsp'){
    if(p.error){s.phase='formation';ctx.finished=true;s.pending=null;tip={type:'message',text:'挑战请求失败：'+p.error};}
   }else if(name==='EVENT_BATTLE_STORY_INIT_CONTEXT'){
    if(s.battle)throw Error('Battle already initialized');
    if(!Array.isArray(p.entities)||!p.entities.length)throw Error('Missing authoritative battle entities');
    const ids=new Set();for(const x of p.entities){if(typeof x.id!=='string'||ids.has(x.id)||!Number.isSafeInteger(x.hp)||!Number.isSafeInteger(x.maxHp)||x.hp<0||x.maxHp<1||x.hp>x.maxHp)throw Error('Invalid entity snapshot');ids.add(x.id);}
    s.battle={entities:structuredClone(p.entities),round:0,log:[],ended:false};s.phase='battle';
   }else if(name==='BattleRound'){
    if(!s.battle||s.battle.ended)throw Error('Active battle is required');
    if(!Number.isInteger(p.round)||p.round<s.battle.round||p.round<1||p.round>node().iRoundLimit)throw Error('Invalid battle round');
    for(const update of p.entities||[]){const x=s.battle.entities.find(x=>x.id===update.id);if(!x||!Number.isSafeInteger(update.hp)||update.hp<0||update.hp>x.maxHp)throw Error('Invalid entity HP');x.hp=update.hp;}
    s.battle.round=p.round;if(p.text)s.battle.log.push(String(p.text));
   }else if(name==='BattleEnd'){
    if(!s.battle)throw Error('Battle init is required');s.battle.ended=true;
   }else if(name==='BagDelta')applyDelta(event);
   else if(name==='EVENT_SHOW_PRIZE_CUSTOM'){
    if(p.sTag!=='MainLineBattle'||!Array.isArray(p.goods))throw Error('Wrong prize notification');
    for(const x of p.goods)if(!Number.isSafeInteger(x.id)||!Number.isSafeInteger(x.num)||x.num<0)throw Error('Invalid prize goods');
    if(ctx.id===s.pending?.id||s.result?.requestID===ctx.id)s.prizeCache={goods:structuredClone(p.goods),oldStar:Number(p.tagParams?.[0]||0),newStar:Number(p.tagParams?.[1]||0)};
   }else if(name==='Client_t1053_MainLineBattleResultNtf'){
    if(p.error){if(current){s.phase='formation';ctx.finished=true;s.pending=null;}}
    else{
     if(p.chapterid!==ctx.chapterID||p.nodeid!==ctx.nodeID||!Number.isInteger(p.star)||p.star<0||p.star>3)throw Error('Mismatched result');
     if(!ctx.finished){s.wins[ctx.nodeID]=Math.max(s.wins[ctx.nodeID]||0,p.star);ctx.finished=true;if(current){s.result={star:p.star,nodeID:p.nodeid,requestID:ctx.id};s.phase=p.star>0?'result':'failed';s.pending=null;}}
    }
   }else throw Error('Unsupported mainline event: '+name);
   trace(name,p);save();draw();return text();
  }catch(error){s=before;throw error;}
 }

 function applyDelta(event){const p=event.payload;if(!p.id||!Array.isArray(p.goods))throw Error('Missing unique transaction ID');if(s.applied[p.id]){if(JSON.stringify(s.applied[p.id])!==JSON.stringify(p.goods))throw Error('Conflicting transaction replay');return;}const sums={};for(const x of p.goods){if(!Number.isSafeInteger(x.id)||!Number.isSafeInteger(x.num))throw Error('Invalid goods delta');sums[x.id]=(sums[x.id]||0)+x.num;}for(const [id,num]of Object.entries(sums))if(!Number.isSafeInteger((s.wallet[id]||0)+num)||(s.wallet[id]||0)+num<0)throw Error('Invalid balance');for(const[id,num]of Object.entries(sums))s.wallet[id]=(s.wallet[id]||0)+num;s.applied[p.id]=structuredClone(p.goods);s.journal.push({id:p.id,requestID:event.requestID,goods:structuredClone(p.goods)});}
 function text(){return {coordinateSystem:'1080x1920 reference viewport, top-left origin, +x right, +y down',phase:s.phase,nodeID:s.nodeID,enemy:enemy(),pending:s.pending,battle:s.battle,result:s.result,wallet:s.wallet,formation:s.formation,roster:s.roster,journal:s.journal,trace:s.trace,provenance:s.snapshotProvenance};}
 const api={mount(tab,target){activeTab=tab;scene=target;const enabled=['sect','story'].includes(tab);document.querySelector('#app').dataset.sourceLayout=String(enabled);if(!enabled){canvas=null;return false;}scene.innerHTML='<section class="aligned-viewport" aria-label="原始布局场景"><div class="aligned-canvas"></div></section>';canvas=scene.querySelector('.aligned-canvas');const scale=()=>{if(canvas)canvas.style.transform=`scale(${scene.clientWidth/1080})`;};scale();draw();return true;},tick(){},busy:()=>false,text,receive,connect(fn){transport=fn;},loadSnapshot(snapshot){if(!['controlled-fixture','original-runtime-snapshot'].includes(snapshot.provenance?.kind))throw Error('Explicit snapshot provenance is required');
 const v=snapshot.state||{},n=by(D.nodes,v.nodeID||10101);
 if(!n||!['chapter','detail','formation'].includes(v.phase||'chapter'))throw Error('Import requires a known idle stage');
 if(!Array.isArray(v.roster)||!Array.isArray(v.formation)||new Set(v.roster.map(x=>String(x.id))).size!==v.roster.length||v.roster.some(x=>!x.id||typeof x.name!=='string'))throw Error('Invalid roster');
 if(v.formation.length>n.iDiscipleNumMax||new Set(v.formation.map(String)).size!==v.formation.length||v.formation.some(id=>!v.roster.some(x=>String(x.id)===String(id))))throw Error('Invalid formation');
 if(Object.values(v.wallet||{}).some(x=>!Number.isSafeInteger(x)||x<0)||Object.entries(v.wins||{}).some(([id,x])=>!by(D.nodes,id)||!Number.isInteger(x)||x<0||x>3))throw Error('Invalid account values');
 const fresh=initial();s={...fresh,...structuredClone(snapshot.state),schema:10,snapshotProvenance:structuredClone(snapshot.provenance)};s.roster=s.roster.map(x=>({...x,id:String(x.id)}));s.formation=s.formation.map(String);s.lastChallengeAt=null;lastChallengeAt=null;save();draw();},getState:()=>structuredClone(s)};
 document.addEventListener('click',e=>{const el=e.target.closest('[data-original-action]');if(el&&!el.disabled)action(el.dataset.originalAction);else if(canvas?.contains(e.target)&&['result','failed'].includes(s.phase))action('return-result');});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&['sect','story'].includes(activeTab)){if(tip){tip=null;draw();}else if(s.phase==='detail')action('close-detail');else if(s.phase==='formation')action('close-formation');else if(s.phase==='result'||s.phase==='failed')action('return-result');}});
 new ResizeObserver(()=>{if(canvas&&scene)canvas.style.transform=`scale(${scene.clientWidth/1080})`;}).observe(document.querySelector('#app'));
 window.SourceAlignment=api;return api;
};
