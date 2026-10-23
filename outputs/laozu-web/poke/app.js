(() => {
  'use strict';
  const {KEY,TYPES,COLS,ROWS}=PokeFusion,app=document.querySelector('#app');
  let loaded=null,loadError='';
  try{loaded=JSON.parse(localStorage.getItem(KEY));}catch{loadError='存档读取失败，请先导出浏览器数据再处理。';}
  let M;try{M=PokeFusion.create(POKE_CATALOG,loaded);}catch(e){loadError=e.message;}
  if(loadError){app.innerHTML='<p role="alert">'+loadError+' 未覆盖原存档。</p>';return;}
  let view='home',selected=null,drag=null,drawTimer=null,tip=null,suppressClick=false,feed='battle',settingsOpen=false;
  M.s.preferences ||= {speed:1,reducedMotion:false};
  if(![1,2,4].includes(M.s.preferences.speed))M.s.preferences.speed=1;
  if(M.s.selectedRoute==='viridian')M.s.selectedRoute='kanto-0-2';
  const imageCache=new Map(),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sprite=id=>'poke/pokemon/'+id+'.png';
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(M.s));}catch{toast('无法保存，请检查浏览器存储空间');}};
  const text=(id)=>M.name(id),btn=(action,label,cls='',disabled=false)=>{
    const pixel=/(^|\s)(gold|soft|mini|round-start|active)(\s|$)/.test(cls);
    const skin=pixel?'btn '+(/soft|mini/.test(cls)?'ghost ':cls==='round-start'?'gold ':''):'';
    return `<button type="button" data-action="${action}" class="${skin+cls}" ${disabled?'disabled':''}>${label}</button>`;
  };
  function imageBounds(id){const path='assets/pokemon/'+id+'.png',size=POKE_CATALOG.SPRITE_SIZES[path]||[72,72],b=POKE_CATALOG.SPRITE_BOUNDS[path]||[0,0,...size];return {x:b[0],y:b[1],w:b[2]-b[0]+1,h:b[3]-b[1]+1,size};}
  const img=(id,cls='')=>{const b=imageBounds(id),max=Math.max(b.w,b.h);return `<span class="pokemon sprite ${cls}" role="img" aria-label="${esc(text(id))}"><img src="${sprite(id)}" alt="" draggable="false" style="width:${b.size[0]/max*100}%;height:${b.size[1]/max*100}%;left:${(0.5-(b.x+b.w/2)/max)*100}%;top:${(0.5-(b.y+b.h/2)/max)*100}%"></span>`;};
  function icon(key){
    const paths={collection:'items/storage.png',research:'ui/exp-share.png',home:'ui/pokecenter.png',gym:'ui/medal-gold.png',wander:'ui/town-map.png',dex:'ui/pokedex-red.png',point:'items/point-card.png',bag:'items/storage.png'};
    return `<img class="ui-icon" src="poke/${paths[key]||paths.point}" alt="" draggable="false">`;
  }
  function toast(s){const n=document.querySelector('#toast');n.textContent=s;n.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>n.hidden=true,2400);}
  function header(){const owned=new Set(M.s.collection.map(m=>m.speciesId)).size;return `<header class="topbar compact-topbar"><button data-action="home" class="trainer" aria-label="返回据点"><img class="trainer-portrait" src="poke/trainers/still/acetrainer.png" alt=""></button><span class="collection-count" aria-label="已收藏物种 ${owned}，共 ${POKE_CATALOG.POKEDEX.length}">${owned} / ${POKE_CATALOG.POKEDEX.length}</span><div class="wallet" aria-label="基因片段 ${M.s.points}"><b>${M.s.points}</b>${icon('point')}</div><span class="defeat-count" aria-label="击败 ${M.s.defeats}"><i></i>${M.s.defeats}</span><button class="settings-button" data-action="settings" aria-label="设置">⚙</button></header>`;}
  function speedControl(){return `<div class="speed-control" aria-label="战斗倍率">${[1,2,4].map(n=>`<button data-action="speed:${n}" aria-pressed="${M.s.preferences.speed===n}" class="${M.s.preferences.speed===n?'chosen':''}">×${n}</button>`).join('')}</div>`;}
  function settings(){return settingsOpen?`<div class="settings-shade"><section class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div class="settings-title"><h2 id="settings-title">设置</h2><button data-action="close-settings" aria-label="关闭设置">×</button></div><div class="settings-row"><span>战斗倍率</span>${speedControl()}</div><button class="motion-toggle" data-action="motion" aria-pressed="${!!M.s.preferences.reducedMotion}">减少动态效果 <span>${M.s.preferences.reducedMotion?'开':'关'}</span></button></section></div>`:'';}
  function messageFeed(r){
    const b=r.battle,own=esc(text(r.mon.speciesId)),foe=b?`对手的${esc(text(b.speciesId))}`:'';
    const lines=(b?.events||[]).slice(-8).map(e=>{
      if(e.actor==='heal')return `<div class="battle-history"><p>${own}吃掉了<strong>橙橙果</strong>！</p><small>恢复了 ${e.amount} 点生命！</small></div>`;
      const action=e.actor==='player'?`${own}使用了<strong>${esc(M.moveName(e.move))}</strong>！`:`${foe}发动了攻击！`;
      return `<div class="battle-history"><p>${action}</p><small>对${e.actor==='player'?foe:own}造成了 ${e.amount} 点伤害！</small></div>`;
    });
    if(b?.hp<=0)lines.push(`<div class="battle-history"><p>${foe}倒下了！</p></div>`);
    else if(b&&r.hp<=0)lines.push(`<div class="battle-history"><p>${own}倒下了！</p></div>`);
    return `<section class="message-feed" aria-label="${feed==='battle'?'战斗记录':'世界消息'}"><button class="feed-arrow previous" data-action="feed-toggle" aria-label="上一消息频道">‹</button><div class="feed-content" data-feed="${feed}" tabindex="0">${feed==='battle'?lines.join(''):''}</div><button class="feed-arrow next" data-action="feed-toggle" aria-label="下一消息频道">›</button></section>`;
  }
  function nav(){return `<nav class="bottom-nav" aria-label="主要导航">${[['collection','收藏'],['research','研究'],['home','据点'],['gym','道馆'],['wander','探险'],['dex','图鉴']].map(([id,label])=>btn('nav:'+id,icon(id)+`<span>${label}</span>`,view===id?'active':'')).join('')}</nav>`;}
  const badge=type=>`<span class="type type-${type}">${TYPES[type]||type}</span>`;
  function routeOutline(regions){
    const cells=new Set(regions.flatMap(g=>g.cells.map(([x,y])=>`${x},${y}`))),edges=new Map();
    const edge=(x,y,a,b)=>edges.set(`${x},${y}`, [a,b]);
    for(const key of cells){const[x,y]=key.split(',').map(Number);if(!cells.has(`${x},${y-1}`))edge(x,y,x+1,y);if(!cells.has(`${x+1},${y}`))edge(x+1,y,x+1,y+1);if(!cells.has(`${x},${y+1}`))edge(x+1,y+1,x,y+1);if(!cells.has(`${x-1},${y}`))edge(x,y+1,x,y);}
    let path='';while(edges.size){const start=edges.keys().next().value;let key=start;const[x,y]=key.split(',').map(Number);path+=`M${8+x*8-20},${16+y*8}`;do{const next=edges.get(key);if(!next)break;edges.delete(key);path+=`L${8+next[0]*8-20},${16+next[1]*8}`;key=next.join(',');}while(key!==start);path+='Z';}return path;
  }
  function positionRouteBubble(){
    const map=app.querySelector('.region-map'),bubble=app.querySelector('.route-bubble');if(!map||!bubble)return;
    const m=map.getBoundingClientRect(),w=bubble.offsetWidth,h=bubble.offsetHeight;
    const blocked=[...map.querySelectorAll('.route-cell,.city-cell,.region-name')].map(e=>{const r=e.getBoundingClientRect();return{x:r.left-m.left-4,y:r.top-m.top-4,w:r.width+8,h:r.height+8};});
    const selected=[...map.querySelectorAll('.route-cell.chosen')].map(e=>e.getBoundingClientRect());
    const target=selected[0],ax=target?(target.left+target.right)/2-m.left:m.width/2,ay=target?(target.top+target.bottom)/2-m.top:0;
    let best=null;for(let y=5;y+h<=m.height-5;y+=4)for(let x=5;x+w<=m.width-5;x+=4){if(blocked.some(r=>x<r.x+r.w&&x+w>r.x&&y<r.y+r.h&&y+h>r.y))continue;const score=Math.hypot(x+w/2-ax,y+h/2-ay);if(!best||score<best.score)best={x,y,score};}
    bubble.classList.toggle('docked',!best);map.parentElement.style.paddingBottom=best?'':`${h+12}px`;
    bubble.style.left=(best?best.x:Math.max(5,(m.width-w)/2))+'px';bubble.style.top=(best?best.y:m.height+6)+'px';
  }
  let selectedCity=null;
  function home(){
    const route=POKE_ROUTES.variants.find(v=>v.id===M.s.selectedRoute&&M.routeUnlocked(v.id)),chosen=(!selectedCity&&!!route)||!!M.s.run;
    const active=route?POKE_ROUTES.regions.filter(g=>route.regions.includes(g.id)):[];
    const cropLeft=20,mapWidth=144;
    const variants=active.length?[...new Set(active.flatMap(g=>g.variants))].map(id=>POKE_ROUTES.variants.find(v=>v.id===id)).filter(v=>M.routeUnlocked(v.id)):[];
    return `<main class="home-page region-home"><section class="region-panel" aria-label="关都地区"><div class="region-map"><img class="region-art" src="poke/maps/kanto.png" alt="关都地区地图" draggable="false"><strong class="region-name">关都地区</strong><svg class="route-highlight" viewBox="0 0 144 144" aria-hidden="true"><path d="${routeOutline(active)}"/></svg><div class="route-zones">${POKE_ROUTES.regions.map(g=>g.cells.map(([x,y],i)=>`<button class="route-cell ${route?.regions.includes(g.id)?'chosen':''} ${g.variants.some(id=>M.routeUnlocked(id))?'':'locked'}" ${g.variants.some(id=>M.routeUnlocked(id))?'':'disabled'} data-action="route:${g.id}" data-region="${g.id}" aria-label="选择${g.name}" aria-pressed="${route?.regions.includes(g.id)||false}" ${i?'tabindex="-1"':''} style="left:${(8+x*8-cropLeft)/mapWidth*100}%;top:${(16+y*8)/144*100}%;width:${8/mapWidth*100}%;height:${8/144*100}%"></button>`).join('')).join('')}</div><div class="city-zones">${POKE_PROGRESSION.cities.map(c=>c.cells.map(([x,y])=>`<button class="city-cell ${M.cityUnlocked(c.id)?'':'locked'}" data-action="city:${c.id}" aria-label="${c.name}" ${M.cityUnlocked(c.id)?'':'disabled'} style="left:${(8+x*8-cropLeft)/mapWidth*100}%;top:${(16+y*8)/144*100}%;width:${8/mapWidth*100}%;height:${8/144*100}%"></button>`).join('')).join('')}</div>${selectedCity?`<div class="route-bubble"><strong>${POKE_PROGRESSION.cities.find(c=>c.id===selectedCity).name}</strong>${POKE_PROGRESSION.cities.find(c=>c.id===selectedCity).gym?btn('nav:gym','道馆','mini'):''}</div>`:route?`<div class="route-bubble"><strong>${esc(route.name)}</strong><span>难度 Lv.${route.levels.join('–')}</span>${variants.length>1?`<div class="route-levels">${variants.map(v=>`<button data-action="difficulty:${v.id}" aria-label="选择等级${v.levels.join('至')}" aria-pressed="${v.id===route.id}">${v.levels.join('–')}</button>`).join('')}</div>`:''}</div>`:''}</div></section><section class="adventure-launch"><button class="pokeball-start" data-action="start-adventure" ${chosen?'':'disabled'} aria-label="${M.s.run?'继续冒险':'开始冒险'}"><img src="poke/items/poke-ball.png" alt="" draggable="false"><span>${M.s.run?'继续冒险':'开始冒险'}</span></button></section></main>`;
  }

  let drawTier=0;
  function geneticsBadge(id){const d=POKE_GENETICS.species[id];return `<small class="genetics-badge ${d.rarity}">${POKE_GENETICS.labels[d.region]} · ${POKE_GENETICS.labels[d.rarity]}</small>`;}
  function tierPicker(){return `<div class="gene-picker"><h1>关都</h1><div class="gene-tiers">${POKE_GENETICS.tiers.map((t,i)=>`<button class="gene-tier ${drawTier===i?'selected':''}" data-action="draw-tier:${i}" aria-pressed="${drawTier===i}" ${M.tierUnlocked(i)?'':'disabled'}><strong>${t.cost?`${t.cost} 基因片段`:'免费'}</strong><span>${M.tierUnlocked(i)?(M.s.points<t.cost?'余额不足':'已解锁'):`累计 ${M.s.geneTotal}/${t.cost}`}</span><div>${t.rates.map((n,j)=>`<small class="${POKE_GENETICS.rarities[j]}">${POKE_GENETICS.labels[POKE_GENETICS.rarities[j]]} ${n}%</small>`).join('')}</div></button>`).join('')}</div>${btn('draw','抽取','gold primary',!M.tierUnlocked(drawTier)||M.s.points<M.drawCost(drawTier))}</div>`;}
  function drawScreen(){const r=M.s.run,shown=r?.phase==='ready'&&r.awaitingEntrance;return `<main class="draw-page encounter-draw ${shown?'revealed':r?'opening':'choosing'}">${!r?tierPicker():`<div class="draw-stage">${shown?`${img(r.mon.speciesId,'draw-partner')}<h1>${esc(text(r.mon.speciesId))}</h1>${geneticsBadge(r.mon.speciesId)}<div class="draw-level">Lv.${r.mon.level}</div><div class="draw-types">${M.species(r.mon.speciesId).types.map(badge).join('')}</div>`:`<img class="summon-image rolling" src="poke/items/poke-ball.png" alt="精灵球">`}</div>`}<div class="draw-controls">${shown?btn('enter-adventure','进入冒险','gold primary'):r?'<span class="sr-only" role="status">正在抽取宝可梦</span>':''}${!r||shown?btn('home','返回','text-button'):''}</div></main>`;}


  const BATTLE_STATUS={burn:['灼伤','#f0703a'],paralysis:['麻痹','#e8c41c'],poison:['中毒','#b65ad6'],sleep:['睡眠','#9aa3b5'],freeze:['冰冻','#6ad0f0'],confusion:['混乱','#ff8fd0']};
  function combatInfo(side,mon,value,max){const states=[mon.status,mon.confused?'confusion':null].filter((v,i,a)=>BATTLE_STATUS[v]&&a.indexOf(v)===i);return `<div class="combat-status ${side}">${states.length?`<div class="combat-ailments">${states.map(v=>`<span class="st-chip" data-status="${v}" style="background:${BATTLE_STATUS[v][1]}">${BATTLE_STATUS[v][0]}</span>`).join('')}</div>`:''}${hp(value,max)}</div><div class="combat-identity ${side}"><span>Lv.${mon.level||5}</span><b>${esc(text(mon.speciesId))}</b></div>`;}
  function hp(value,max){const ratio=Math.max(0,Math.min(1,value/max));return `<div class="hp" role="progressbar" aria-label="生命值" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${Math.ceil(value)}"><div style="width:${ratio*100}%;background:${ratio>.2?'#f0607a':'#d6334f'}"></div></div>`;}
  function item(item,placement=false){const info=M.itemInfo(item),[w,h]=M.size(item);return `<button class="item ${item.kind} ${selected===item.uid?'selected':''} type-${info.type}" data-item="${item.uid}" aria-label="${esc(info.name+'，'+info.detail.replace(/ · 冷却 .*$/,''))}" ${tip===item.uid?'aria-describedby="item-tip"':''} ${placement?`style="left:${item.x/COLS*100}%;top:${item.y/ROWS*100}%;width:${w/COLS*100}%;height:${h/ROWS*100}%"`:`style="width:calc(var(--cell)*${w});height:calc(var(--cell)*${h})"`}>${item.kind==='move'?`<span class="move-line"><span class="type-well"><img class="source-type" src="poke/type-icons/symbols/${info.type}.svg" alt="${TYPES[info.type]}属性" draggable="false"></span><b>${esc(info.name)}</b></span>`:`<img class="held-art" src="poke/ui/${item.key==='oran-berry'?'berry-oran.png':'exp-share.png'}" alt="">`}</button>`;}
  function itemTooltip(){const pick=[...(M.s.run?.items||[]),...(M.s.run?.pending||[])].find(i=>i.uid===tip);if(!pick||view!=='wander')return '';const info=M.itemInfo(pick);return `<div id="item-tip" class="bag-tip" role="tooltip"><b>${esc(info.name)}</b><p>${esc(info.detail.replace(/ · 冷却 .*$/,''))}</p></div>`;}
  function positionTip(){const box=app.querySelector('#item-tip'),anchor=app.querySelector(`[data-item="${tip}"]`);if(!box||!anchor)return;const root=app.getBoundingClientRect(),r=anchor.getBoundingClientRect();box.style.left=Math.max(8,Math.min(r.left-root.left,root.width-box.offsetWidth-8))+'px';const above=r.top-root.top-box.offsetHeight-8;box.style.top=(above>62?above:r.bottom-root.top+8)+'px';}
  function route(r){if(r.gymId)return `<div class="route"><span class="tl-count">${r.stage+1}/${r.totalBattles}</span></div>`;const phase=r.evolution?.resume||r.phase;if(r.route){const total=r.totalBattles*2+2,current=phase==='ready'?0:phase==='settlement'?total-1:r.stage*2+(['reward','event','encounter','evolution','evolution-result'].includes(phase)?2:1);const indices=Array.from({length:Math.min(6,total)},(_,i)=>Math.max(0,Math.min(total-6,current-2))+i);return `<div class="route"><div class="tl-rail"><div class="timeline" aria-label="冒险进度">${indices.map((i,n)=>`${n?'<i class="tl-link on"></i>':''}<span class="tl-node ev ${i===current?'current':''}" ${i===current?'aria-current="step"':''}><img src="poke/${i===0?'items/poke-ball.png':i===total-1?'ui/pokecenter.png':i%2?'ui/tallgrass-icon.png':'items/storage.png'}" alt="${i%2?'遭遇':'奖励'}"></span>`).join('')}</div><span class="tl-count">${current+1}/${total}</span></div></div>`;}const current=phase==='ready'?0:phase==='settlement'?5:r.stage*2+(['reward','event','encounter','evolution','evolution-result'].includes(phase)?2:1),nodes=[['伙伴','poke-ball.png'],['遭遇','tallgrass-icon.png'],['奖励','storage.png'],['遭遇','tallgrass-icon.png'],['奖励','storage.png'],['结算','pokecenter.png']];return `<div class="route"><div class="tl-rail"><span class="tl-zone">常青小径</span><div class="timeline" aria-label="冒险进度">${nodes.map(([label,asset],i)=>`${i?`<i class="tl-link ${i<=current?'on':''}"></i>`:''}<span class="tl-node ${i===1||i===3?'wild':'ev'} ${i<current?'done':i===current?'current':''}" ${i===current?'aria-current="step"':''} title="${label}"><img src="poke/${asset==='poke-ball.png'||asset==='storage.png'?'items':'ui'}/${asset}" alt="${label}"></span>`).join('')}</div><span class="tl-count">${current+1}/6</span></div></div>`;}
  function board(r){const shelf=side=>`<div class="drop-shelf" aria-label="${side===0?'左':'右'}侧掉落">${r.pending.filter(i=>(Number(i.uid.split('-').at(-1))-1)%2===side).map(i=>item(i)).join('')}</div>`;return `<div class="board-wrap">${shelf(0)}<div class="board" aria-label="五列五行背包"><div class="cells">${Array.from({length:COLS*ROWS},(_,i)=>`<div data-cell="${i}"></div>`).join('')}</div>${r.items.map(i=>item(i,true)).join('')}</div>${shelf(1)}</div>`;}
  function adventureChoice(r){
    if(r.phase==='encounter')return `<div class="adventure-choice" role="dialog" aria-modal="true" aria-label="选择事件"><section class="encounter-options">${r.encounter.options.map(e=>btn('encounter:'+e.id,`<img src="poke/${e.icon}" alt=""><span><b>${esc(e.name)}</b><small>${esc(e.detail)}</small></span>`,'event-option')).join('')}</section></div>`;
    if(r.phase==='evolution'){const e=r.evolution.options[0];return `<div class="adventure-choice" role="dialog" aria-modal="true" aria-label="进化选择"><section class="encounter-options evolution-options">${btn('evolve:'+e.to,`${img(e.to)}<span><b>进化为${text(e.to)}</b><small>遗忘全部招式 · 随机招式 ×1</small></span>`,'event-option evolution-option')}${btn('evolution-skip',`${img(r.mon.speciesId)}<span><b>保持${text(r.mon.speciesId)}</b><small>保留当前招式</small></span>`,'event-option')}</section></div>`;}

    if(r.phase==='evolution-result')return `<div class="adventure-choice" role="dialog" aria-modal="true" aria-label="进化完成"><section class="evolution-choice evolution-result">${img(r.mon.speciesId,'evolved-partner')}<h2>${text(r.mon.speciesId)}</h2><p>Lv.${r.mon.level} ${M.species(r.mon.speciesId).types.map(badge).join('')}</p><p class="evolution-learned">${badge(POKE_CATALOG.MOVES[r.evolution.learned]?.type||'normal')} ${esc(M.moveName(r.evolution.learned))}</p>${btn('evolution-done','继续','gold primary')}</section></div>`;
    return '';
  }
  function explore(){const r=M.s.run;if(!r||r.phase==='draw'||r.awaitingEntrance)return drawScreen();
    const b=r.battle,phase=r.phase,editing=['ready','reward','event'].includes(phase),pick=[...r.items,...r.pending].find(i=>i.uid===selected);
    let lower='';
    if(phase==='settlement'&&r.gymId){lower=`<section class="settlement"><h2>${r.outcome==='graduated'?'挑战成功':'挑战结束'}</h2>${img(r.mon.speciesId)}${btn('settle','返回道馆','gold primary')}</section>`;}else if(phase==='settlement'){
      lower=`<section class="settlement"><small>EXPEDITION REPORT</small><h2>${r.outcome==='graduated'?'探险毕业':'救援归来'}</h2><div class="graduate">${img(r.mon.speciesId)}<div><b>${text(r.mon.speciesId)}</b><p>Lv.${r.mon.level} · ${M.species(r.mon.speciesId).types.map(badge).join('')}</p></div></div><dl><div><dt>本次获得基因片段</dt><dd>+${r.earned}</dd></div><div><dt>当前基因片段</dt><dd>${M.s.points}</dd></div></dl><p>确认后将本局宝可梦收入收藏。<br>招式背包仅属于本次探险。</p>${btn('settle','收入收藏','gold primary')}</section>`;
    }else{
      lower=`<section class="workspace">${board(r)}<div class="pack-footer">${editing?btn('forward','前进','gold'):phase==='battle'?'<span class="fighting-dot">战斗进行中</span>':''}</div></section>`;
    }
    return `<main class="explore-page phase-${phase}"><h1 class="sr-only">常青小径探险</h1><section class="battle-scene scene"><canvas id="scene" aria-label="常青小径探险战斗场景"></canvas><div class="map-heading"><span>${esc(r.route?.name||'常青小径')}</span>${route(r)}${speedControl()}</div>${combatInfo('own',r.mon,r.hp,r.maxHp)}${phase==='battle'?combatInfo('foe',b,b.hp,b.maxHp):''}<div class="scene-caption">${phase==='battle'?'属性克制 · 招式自动释放':phase==='reward'?'遭遇胜利 · 整理战利品':phase==='settlement'?'本次旅途已记录':'一人一包，继续前行'}</div></section>${messageFeed(r)}${lower}${adventureChoice(r)}</main>`;
  }
  const catalogFilters={collection:{region:'all',rarity:'all'},dex:{region:'all',rarity:'all'}};
  function filterBar(page){const f=catalogFilters[page];return `<div class="catalog-filters">${[['region',['all','kanto','johto','hoenn']],['rarity',['all',...POKE_GENETICS.rarities]]].map(([key,values])=>`<div class="filter-row" role="group" aria-label="${key==='region'?'地区':'稀有度'}">${values.map(value=>`<button data-action="filter:${page}:${key}:${value}" class="${key==='rarity'?value:''}" aria-pressed="${f[key]===value}">${value==='all'?'全部':POKE_GENETICS.labels[value]}</button>`).join('')}</div>`).join('')}</div>`;}
  function matchesFilter(page,id){const f=catalogFilters[page],d=POKE_GENETICS.species[id];return (f.region==='all'||d.region===f.region)&&(f.rarity==='all'||d.rarity===f.rarity);}
  function collection(){const list=M.s.collection.filter(mon=>matchesFilter('collection',mon.speciesId));return `<main class="list-page"><div class="page-title"><h1>宝可梦收藏 <small>${list.length} / ${M.s.collection.length}</small></h1></div>${filterBar('collection')}<div class="collection-list">${list.map(mon=>`<article class="mon-card rarity-${POKE_GENETICS.species[mon.speciesId].rarity}" data-species="${mon.speciesId}">${img(mon.speciesId)}<div><b class="mon-name">${esc(text(mon.speciesId))}</b>${geneticsBadge(mon.speciesId)}<p>Lv.${mon.level} · ${M.species(mon.speciesId).types.map(badge).join('')}</p><small>探险 #${mon.originRun} · ${mon.outcome==='graduated'?'毕业':'救援归来'}</small></div></article>`).join('')||'<div class="empty-state">暂无宝可梦</div>'}</div>${btn('nav:wander',M.s.run?'继续冒险':'开始冒险','gold primary')}</main>`;}

  function research(){return `<main class="list-page"><h1>伙伴研究所</h1>${tierPicker()}${btn('nav:wander',M.s.run?'继续冒险':'前往抽取','gold primary')}</main>`;}

  function gym(){const uid=M.s.collection.at(-1)?.uid;return `<main class="gym-page" aria-label="道馆"><div class="gym-track">${POKE_PROGRESSION.gyms.map(g=>`<button class="gym-card ${M.gymUnlocked(g.id)?'':'locked'}" data-gym="${g.id}" data-action="gym-start:${g.id}" aria-label="${g.name} · ${g.leader}${M.gymUnlocked(g.id)?'，挑战':'，未解锁'}" style="--gym-color:${g.color}" ${!M.gymUnlocked(g.id)||!uid||M.s.run?'disabled':''}><img class="leader" src="poke/trainers/still/${g.sprite}.png" alt=""><span class="gym-badge ${M.s.progression.badges.includes(g.id)?'earned':''}" role="img" aria-label="${M.s.progression.badges.includes(g.id)?'已获得徽章':'徽章'}" style="background-image:url(poke/badges/${g.badgeImage});background-position:${-32*g.chapter}px 0"></span></button>`).join('')}</div></main>`;}


  function dex(){const owned=new Set(M.s.collection.map(x=>x.speciesId)),list=POKE_CATALOG.POKEDEX.filter(d=>matchesFilter('dex',d.id));return `<main class="list-page"><div class="page-title"><h1>宝可梦图鉴 <small>${list.length} / ${POKE_CATALOG.POKEDEX.length}</small></h1></div>${filterBar('dex')}<div class="dex-grid">${list.map(d=>`<article data-species="${d.id}" class="dex-card rarity-${POKE_GENETICS.species[d.id].rarity} ${owned.has(d.id)?'owned':''}"><small>#${String(d.id).padStart(3,'0')}</small>${img(d.id)}<b class="mon-name">${esc(text(d.id))}</b>${geneticsBadge(d.id)}<span>${owned.has(d.id)?'已收藏':d.types.map(t=>TYPES[t]||t).join(' / ')}</span></article>`).join('')||'<div class="empty-state">暂无宝可梦</div>'}</div></main>`;}

  function render(){const focusAction=document.activeElement?.dataset?.action;app.innerHTML=header()+(view==='home'?home():view==='wander'?explore():view==='collection'?collection():view==='research'?research():view==='gym'?gym():dex())+nav()+itemTooltip()+settings();app.classList.toggle('reduced-motion',!!M.s.preferences.reducedMotion);const log=app.querySelector('.feed-content');if(log)log.scrollTop=log.scrollHeight;fitBoard();drawScene();positionTip();positionRouteBubble();if(focusAction)app.querySelector(`[data-action="${focusAction}"]`)?.focus({preventScroll:true});}
  function fitBoard(){const box=app.querySelector('.board-wrap'),board=app.querySelector('.board');if(!box||!board)return;const cell=Math.max(1,Math.floor(Math.min((box.clientWidth-16)/9,box.clientHeight/5)));box.style.setProperty('--cell',cell+'px');board.style.width=cell*5+'px';}
  function scheduleReveal(){clearTimeout(drawTimer);if(M.s.run?.phase==='draw')drawTimer=setTimeout(()=>{if(M.s.run?.phase==='draw'){M.s.run.awaitingEntrance=true;M.reveal();save();render();}},1800);}
  function act(action){tip=null;try{
    if(action==='settings'){settingsOpen=true;}
    else if(action==='close-settings'){settingsOpen=false;}
    else if(action.startsWith('speed:')){M.s.preferences.speed=Number(action.split(':')[1]);save();}
    else if(action==='motion'){M.s.preferences.reducedMotion=!M.s.preferences.reducedMotion;save();}
    else if(action==='feed-toggle'){feed=feed==='battle'?'world':'battle';}

    else if(action.startsWith('route:')){const g=POKE_ROUTES.regions.find(g=>g.id===action.slice(6));if(g){const id=g.variants.find(id=>M.routeUnlocked(id));if(id){selectedCity=null;M.s.selectedRoute=id;save();}}}
    else if(action.startsWith('difficulty:')){const id=action.slice(11);if(POKE_ROUTES.variants.some(v=>v.id===id)&&M.routeUnlocked(id)){M.s.selectedRoute=id;save();}}
    else if(action==='start-adventure'){if(!M.s.run&&!POKE_ROUTES.variants.some(v=>v.id===M.s.selectedRoute&&M.routeUnlocked(v.id)))return;view='wander';drawTier=0;}
    else if(action==='home'){view='home';selected=null;}
    else if(action.startsWith('nav:')){view=action.slice(4);selected=null;}
    else if(action.startsWith('city:')){const id=action.slice(5);if(M.cityUnlocked(id))selectedCity=id;}
    else if(action.startsWith('gym-start:')){M.startGym(action.slice(10),M.s.collection.at(-1)?.uid);view='wander';save();}
    else if(action.startsWith('filter:')){const [,page,key,value]=action.split(':');if(catalogFilters[page]&&['region','rarity'].includes(key))catalogFilters[page][key]=value;}
    else if(action.startsWith('draw-tier:')){drawTier=Number(action.slice(10));}
    else if(action==='draw'){if(!M.s.selectedRoute||!M.routeUnlocked(M.s.selectedRoute))M.s.selectedRoute=POKE_ROUTES.variants.find(v=>M.routeUnlocked(v.id)).id;M.draw(drawTier);view='wander';M.s.run.awaitingEntrance=true;save();scheduleReveal();}
    else if(action==='enter-adventure'){if(M.s.run?.phase==='ready'&&M.s.run.awaitingEntrance){delete M.s.run.awaitingEntrance;save();}}
    else if(action.startsWith('encounter:')){M.chooseEncounter(action.slice(10));save();}
    else if(action.startsWith('evolve:')){M.evolve(action.slice(7));save();}
    else if(action==='evolution-skip'){M.finishEvolution(true);save();}
    else if(action==='evolution-done'){M.finishEvolution();save();}
    else if(action==='forward'){M.forward();save();selected=null;}
    else if(action==='battle'){M.startBattle();save();selected=null;}
    else if(action==='reward-done'){M.completeReward();save();selected=null;}
    else if(action==='continue'){M.proceed();save();selected=null;}
    else if(action==='settle'){const mon=M.settle();save();view=mon.gymId?'gym':'collection';toast(mon.gymId?(mon.outcome==='graduated'?'挑战成功':'挑战结束'):text(mon.speciesId)+'已收入收藏');}
    render();if(action==='settings')app.querySelector('[data-action="close-settings"]')?.focus();if(action==='close-settings')app.querySelector('[data-action="settings"]')?.focus();
  }catch(e){toast(e.message);}}
  app.addEventListener('click',e=>{if(suppressClick){suppressClick=false;return;}const a=e.target.closest('[data-action]');if(a){if(!a.disabled)act(a.dataset.action);return;}const item=e.target.closest('[data-item]');if(item){selected=item.dataset.item;tip=tip===selected?null:selected;render();return;}});
  app.addEventListener('pointerdown',e=>{const item=e.target.closest('[data-item]');if(!item||!['ready','reward','event'].includes(M.s.run?.phase)||e.button!==0)return;const rect=item.getBoundingClientRect(),data=[...M.s.run.items,...M.s.run.pending].find(x=>x.uid===item.dataset.item),[w,h]=M.size(data);drag={uid:data.uid,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,width:rect.width,height:rect.height,grabX:e.clientX-rect.left,grabY:e.clientY-rect.top,offsetX:Math.min(w-1,Math.floor((e.clientX-rect.left)/rect.width*w)),offsetY:Math.min(h-1,Math.floor((e.clientY-rect.top)/rect.height*h)),moved:false};item.setPointerCapture(e.pointerId);});
  app.addEventListener('pointermove',e=>{if(!drag)return;drag.x=e.clientX;drag.y=e.clientY;if(Math.hypot(drag.x-drag.startX,drag.y-drag.startY)>7){drag.moved=true;tip=null;app.querySelector('#item-tip')?.remove();let ghost=document.querySelector('#drag-ghost');if(!ghost){ghost=document.createElement('div');ghost.id='drag-ghost';const source=app.querySelector(`[data-item="${drag.uid}"]`);ghost.innerHTML=source.innerHTML;ghost.style.setProperty('--type',getComputedStyle(source).getPropertyValue('--type'));document.body.append(ghost);}ghost.style.width=drag.width+'px';ghost.style.height=drag.height+'px';ghost.style.left=(e.clientX-drag.grabX)+'px';ghost.style.top=(e.clientY-drag.grabY)+'px';}});
  app.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;document.querySelector('#drag-ghost')?.remove();if(!d.moved)return;suppressClick=true;setTimeout(()=>suppressClick=false,0);const rect=app.querySelector('.board')?.getBoundingClientRect();try{if(rect&&e.clientX>=rect.left&&e.clientX<rect.right&&e.clientY>=rect.top&&e.clientY<rect.bottom){M.move(d.uid,Math.floor((e.clientX-rect.left)/rect.width*COLS)-d.offsetX,Math.floor((e.clientY-rect.top)/rect.height*ROWS)-d.offsetY);selected=d.uid;save();}else toast('未放入背包，物品保持原位');}catch(error){toast(error.message);}render();});
  app.addEventListener('pointercancel',()=>{drag=null;document.querySelector('#drag-ghost')?.remove();});
  document.addEventListener('pointerdown',e=>{if(tip&&!e.target.closest('[data-item]')&&!e.target.closest('#item-tip')){tip=null;app.querySelector('#item-tip')?.remove();}});
  window.addEventListener('keydown',e=>{if(settingsOpen){if(e.key==='Escape'){act('close-settings');return;}if(e.key==='Tab'){const buttons=[...app.querySelectorAll('.settings-panel button')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}return;}if(e.key==='Escape'&&tip){tip=null;render();return;}if(e.key.toLowerCase()==='f'){if(document.fullscreenElement)document.exitFullscreen?.();else app.requestFullscreen?.().catch(()=>{});}if(e.key==='Escape'){drag=null;document.querySelector('#drag-ghost')?.remove();view='home';render();}});
  let feedStart=null;app.addEventListener('pointercancel',()=>{feedStart=null;});app.addEventListener('pointerdown',e=>{if(e.target.closest('.message-feed')&&!e.target.closest('button')){feedStart={x:e.clientX,y:e.clientY};app.setPointerCapture(e.pointerId);}});app.addEventListener('pointermove',e=>{if(feedStart&&Math.abs(e.clientX-feedStart.x)>45&&Math.abs(e.clientY-feedStart.y)<35){feedStart=null;act('feed-toggle');}});app.addEventListener('pointerup',e=>{if(feedStart&&Math.abs(e.clientX-feedStart.x)>45&&Math.abs(e.clientY-feedStart.y)<35)act('feed-toggle');feedStart=null;});
  window.addEventListener('resize',()=>{fitBoard();drawScene();positionTip();positionRouteBubble();});
  function getImage(url){let image=imageCache.get(url);if(!image){image=new Image();image.src=url;image.onload=drawScene;imageCache.set(url,image);}return image;}
  function adventureScene(){const r=M.s.run;return r?.route?.scene||POKE_ROUTES.variants.find(v=>v.id===r?.route?.id)?.scene||'02-chemin-boise-lisiere-710x400.webp';}
  function drawScene(){const canvas=document.querySelector('#scene');if(!canvas)return;const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;const c=canvas.getContext('2d'),w=rect.width,h=rect.height;c.scale(dpr,dpr);c.imageSmoothingEnabled=false;
    const sceneFile=view==='home'?'39-bourg-palette-710x400.webp':adventureScene();canvas.dataset.scene=sceneFile;
    const background=getImage('poke/scenes/'+sceneFile);
    if(background.complete&&background.naturalWidth){const scale=Math.max(w/background.naturalWidth,h/background.naturalHeight),sw=w/scale,sh=h/scale;c.drawImage(background,(background.naturalWidth-sw)/2,(background.naturalHeight-sh)/2,sw,sh,0,0,w,h);}
    if(view==='home'){
      for(const [id,x,y] of [[1,.19,.8],[4,.83,.84],[7,.62,.65]]){const im=getImage(sprite(id)),b=imageBounds(id),scale=42/Math.max(b.w,b.h);if(im.complete&&im.naturalWidth)c.drawImage(im,b.x,b.y,b.w,b.h,x*w-b.w*scale/2,y*h-b.h*scale/2,b.w*scale,b.h*scale);}
    }else{
      const r=M.s.run;if(!r)return;const t=r.battle?.t||0,hit=r.battle?.lastHit;const recent=!M.s.preferences.reducedMotion&&hit&&t-hit.time<350;
      const drawMon=(id,x,y,size,flip,attack)=>{const im=getImage(sprite(id));if(!im.complete||!im.naturalWidth)return;c.save();c.translate(x+(attack?Math.sin((t%350)/350*Math.PI)*12*(flip?1:-1):0),y);c.scale(flip?-1:1,1);const b=imageBounds(id),scale=size;c.drawImage(im,b.x,b.y,b.w,b.h,-b.w*scale/2,-b.h*scale,b.w*scale,b.h*scale);c.restore();};
      const k=Math.max(2,Math.round(w*.24/68));
      const spriteScale=id=>{const b=imageBounds(id);return Math.min(k,h*.29/b.h,w*.20/b.w);};
      const ownSize=spriteScale(r.mon.speciesId),enemySize=r.battle?spriteScale(r.battle.speciesId):k;
      for(const [cls,id,scale,baseline] of [['own',r.mon.speciesId,ownSize,.82],['foe',r.battle?.speciesId,enemySize,.78]]){const hud=app.querySelector('.combat-status.'+cls);if(hud&&id){hud.style.setProperty('--hp-width',13*k+'px');hud.style.top=(h*baseline-imageBounds(id).h*scale-hud.offsetHeight-4)+'px';const identity=app.querySelector('.combat-identity.'+cls);if(identity)identity.style.top=(h*baseline+3)+'px';}}
      drawMon(r.mon.speciesId,w*.25,h*.82,ownSize,true,recent&&hit.actor==='player');
      if(r.phase==='battle'){drawMon(r.battle.speciesId,w*.77,h*.78,enemySize,false,recent&&hit.actor==='enemy');}
      if(recent&&r.phase==='battle'){const x=hit.actor==='player'?w*.77:w*.25,y=hit.actor==='player'?h*.42:h*.57;c.font='bold 22px system-ui';c.textAlign='center';c.strokeStyle='#443a30';c.lineWidth=3;c.fillStyle=hit.actor==='heal'?'#b5ec9d':'#fff1bc';c.strokeText((hit.actor==='heal'?'+':'−')+hit.amount,x,y);c.fillText((hit.actor==='heal'?'+':'−')+hit.amount,x,y);}
    }
  }
  window.render_game_to_text=()=>JSON.stringify({view,scene:view==='wander'?adventureScene():null,speed:M.s.preferences.speed,feed,settingsOpen,coordinateSystem:'board origin top-left; x right 0..4, y down 0..4',points:M.s.points,geneTotal:M.s.geneTotal,drawTier,catalogFilters,defeats:M.s.defeats,firstFree:M.s.firstFree,collection:M.s.collection,progression:M.s.progression,run:M.s.run,selected});
  window.advanceTime=ms=>{if(view==='wander'&&M.s.run?.phase==='battle'){M.tick(ms);save();render();}};
  let last=performance.now(),acc=0;function frame(now){const dt=Math.min(100,now-last);last=now;if(!settingsOpen&&!document.hidden&&view==='wander'&&M.s.run?.phase==='battle'){acc+=dt;if(acc>=100){M.tick(acc*M.s.preferences.speed);acc=0;save();render();}}requestAnimationFrame(frame);}requestAnimationFrame(frame);
  save();render();scheduleReveal();
})();
