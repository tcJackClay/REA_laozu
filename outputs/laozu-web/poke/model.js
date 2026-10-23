/* Fusion rules are new local rules. Source species, moves and type chart: catalog.js. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PokeFusion = api;
})(globalThis, () => {
  'use strict';
  const ROUTES=typeof module==='object'&&module.exports?require('./routes.js'):globalThis.POKE_ROUTES;
  const EVOLUTIONS=typeof module==='object'&&module.exports?require('./evolutions.js'):globalThis.POKE_EVOLUTIONS;
  const GENETICS=typeof module==='object'&&module.exports?require('./genetics.js'):globalThis.POKE_GENETICS;
  const PROGRESSION=typeof module==='object'&&module.exports?require('./progression.js'):globalThis.POKE_PROGRESSION;
  const KEY = 'poke-fusion-v1', COLS = 5, ROWS = 5;
  const NAMES=typeof module==='object'&&module.exports?require('./names-zh.js'):globalThis.POKE_NAMES_ZH;
  const MOVE_NAMES = {'vine-whip':'藤鞭',ember:'火花','water-gun':'水枪',tackle:'撞击',scratch:'抓','razor-leaf':'飞叶快刀','fire-fang':'火焰牙','water-pulse':'水之波动'};
  const TYPES = {normal:'一般',fire:'火',water:'水',grass:'草',electric:'电',poison:'毒',flying:'飞行',bug:'虫',rock:'岩石',ground:'地面',ice:'冰',psychic:'超能',ghost:'幽灵',dragon:'龙',dark:'恶',steel:'钢',fairy:'妖精',fighting:'格斗'};
  function create(catalog, loaded, random = Math.random) {
    const s = loaded || {version:1,points:0,defeats:0,firstFree:true,sequence:0,collection:[],run:null,settled:[]};
    if (s.version !== 1 || !Array.isArray(s.collection) || !Number.isFinite(s.points) || s.points < 0) throw Error('存档格式不正确');
    const species = id => catalog.POKEDEX.find(x => x.id === id);
    const name = id => {
      const base=GENETICS.species[id]?.base||id;
      const suffix=id>=20101&&id<=20127?'·'+('BCDEFGHIJKLMNOPQRSTUVWXYZ!?')[id-20101]:({90025:'·特殊形态',35101:'·太阳形态',35102:'·雨水形态',35103:'·雪云形态',38601:'·攻击形态',38602:'·防御形态',38603:'·速度形态'})[id]||'';
      return (NAMES[base]||'未知宝可梦')+suffix;
    };
    const moveName = id => MOVE_NAMES[id] || catalog.MOVES[id]?.name || id;
    const need = (phase) => { if (!s.run || s.run.phase !== phase) throw Error('当前阶段不能执行此操作'); return s.run; };
    if(!Number.isFinite(s.geneTotal))s.geneTotal=Math.max(s.genePeak||0,s.points,(s.defeats||0)*2);
    const gainGenes=amount=>{s.points+=amount;s.geneTotal+=amount;};
    s.progression ||= {routes:[],badges:[]};
    const chapterOpen=n=>PROGRESSION.gyms.slice(0,n).every(g=>s.progression.badges.includes(g.id));
    const chapterRoutes=n=>ROUTES.variants.filter(v=>v.chapter===n+1);
    function routeUnlocked(id){const v=ROUTES.variants.find(v=>v.id===id);if(!v||!chapterOpen(v.chapter-1))return false;const list=chapterRoutes(v.chapter-1);return list.slice(0,list.indexOf(v)).every(v=>s.progression.routes.includes(v.id));}
    function gymUnlocked(id){const g=PROGRESSION.gyms.find(g=>g.id===id);return !!g&&chapterOpen(g.chapter)&&chapterRoutes(g.chapter).every(v=>s.progression.routes.includes(v.id));}
    function cityUnlocked(id){const c=PROGRESSION.cities.find(c=>c.id===id);if(!c)return false;if(c.id==='PALLET_TOWN')return true;if(!chapterOpen(c.chapter))return false;if(c.id==='INDIGO_PLATEAU')return s.progression.routes.includes('kanto-8-0');return c.requiresRoute?s.progression.routes.includes(c.requiresRoute):chapterOpen(c.chapter);}
    function startGym(id,uid){if(s.run)throw Error('请先完成当前冒险');if(!gymUnlocked(id))throw Error('道馆尚未解锁');const mon=s.collection.find(m=>m.uid===uid);if(!mon)throw Error('请选择收藏中的宝可梦');const g=PROGRESSION.gyms.find(g=>g.id===id),runId=++s.sequence;
      const items=mon.loadout?.length?JSON.parse(JSON.stringify(mon.loadout)):[{uid:'gym-move-'+runId,kind:'move',key:attackPool(mon.speciesId,mon.level).at(-1),w:2,h:1,x:0,y:0,rotation:0}];
      s.run={id:runId,gymId:id,borrowedUid:uid,boardSize:'5x5',mon:JSON.parse(JSON.stringify(mon)),phase:'ready',stage:0,hp:mon.hp||90+mon.level*15,maxHp:mon.hp||90+mon.level*15,earned:0,elapsed:0,battle:null,items,pending:[],log:[g.name+' · '+g.leader],nextItem:items.length+1,outcome:null,totalBattles:g.team.length,route:{id:g.id,name:g.name,scene:g.scene,levels:g.team.map(t=>t[1]),wild:0}};return s.run;}
    const drawCost=(tier=0)=>{if(!Number.isInteger(tier)||!GENETICS.tiers[tier])throw Error('抽取档位无效');return GENETICS.tiers[tier].cost;};
    const tierUnlocked=(tier)=>s.geneTotal>=drawCost(tier);
    function attackPool(id,level){const pool=[...new Set((species(id).learn||[]).filter(([lv,key])=>lv<=level&&catalog.MOVES[key]?.power>0&&['phys','spec'].includes(catalog.MOVES[key].cat)).map(([,key])=>key))];return pool.length?pool:['tackle'];}
    function randomUnit(){const n=random();if(!(n>=0&&n<1))throw Error('抽取随机值无效');return n;}
    function draw(tier=0) {
      if(s.run)throw Error('请先完成当前探险');
      if(s.selectedRoute&&!routeUnlocked(s.selectedRoute))throw Error('道路尚未解锁');
      const cost=drawCost(tier);if(!tierUnlocked(tier))throw Error('抽取档位未解锁');if(s.points<cost)throw Error('基因片段不足');
      const region='kanto',roll=randomUnit()*100;let edge=0,rarity;
      GENETICS.tiers[tier].rates.some((rate,i)=>{edge+=rate;if(roll<edge){rarity=GENETICS.rarities[i];return true;}return false;});
      const pool=GENETICS.pools[region][rarity],id=pool[Math.floor(randomUnit()*pool.length)],def=species(id);
      const routeLevel=ROUTES?.variants.find(v=>v.id===s.selectedRoute)?.levels[0]||5;
      const moves=attackPool(id,routeLevel),primary=moves[moves.length-1];
      const runId = ++s.sequence;
      s.points -= cost; s.firstFree = false;
      const route=ROUTES?.variants.find(v=>v.id===s.selectedRoute);
      s.run = {id:runId,boardSize:'5x5',mon:{uid:'run-'+runId,speciesId:id,level:5,region,rarity,drawTier:tier},phase:'draw',stage:0,hp:90,maxHp:90,earned:0,elapsed:0,battle:null,items:[{uid:'r'+runId+'-0',kind:'move',key:primary,w:2,h:1,x:0,y:0,rotation:0}],pending:[],log:[name(id)+'加入本次探险。'],nextItem:1,outcome:null};
      if(route){s.run.route=JSON.parse(JSON.stringify(route));s.run.totalBattles=route.wild+route.trainers;s.run.mon.level=route.levels[0];s.run.hp=s.run.maxHp=90+route.levels[0]*15;}
      return def;
    }
    function reveal() { need('draw').phase = 'ready'; }
    function size(item) { return item.rotation ? [item.h,item.w] : [item.w,item.h]; }
    function fits(item, x, y) {
      if (!Number.isInteger(x) || !Number.isInteger(y) || !s.run) return false;
      const [w,h] = size(item); if (x<0||y<0||x+w>COLS||y+h>ROWS) return false;
      return !s.run.items.some(other => {
        if (other.uid === item.uid || other.x == null) return false;
        const [ow,oh] = size(other); return x<other.x+ow && x+w>other.x && y<other.y+oh && y+h>other.y;
      });
    }
    // Keep all owned items when restoring an older, wider backpack.
    if(s.run && s.run.boardSize !== '5x5'){
      const r=s.run,old=[...r.items];r.items=[];
      for(const item of old){
        if(!fits(item,item.x,item.y)){
          let found=false;
          for(let y=0;y<ROWS&&!found;y++)for(let x=0;x<COLS&&!found;x++)if(fits(item,x,y)){item.x=x;item.y=y;found=true;}
          if(!found){item.x=null;item.y=null;r.pending.push(item);continue;}
        }
        r.items.push(item);
      }
      r.boardSize='5x5';
      if(r.pending.length&&r.phase==='battle'){r.phase='ready';r.battle=null;}
    }
    const editable = () => { if (!s.run || !['ready','reward','event'].includes(s.run.phase)) throw Error('战斗中不能整理背包'); return s.run; };
    function place(uid, x, y) {
      const r=editable(),item=[...r.items,...r.pending].find(x=>x.uid===uid); if(!item)throw Error('物品已不存在');
      if(!fits(item,x,y))throw Error('格位不足或与其他物品重叠');
      if(r.pending.includes(item)){r.pending=r.pending.filter(x=>x!==item);r.items.push(item);}
      item.x=x;item.y=y;return item;
    }
    function move(uid,x,y){
      const r=editable(),a=r.items.find(i=>i.uid===uid);
      if(!a||fits(a,x,y))return place(uid,x,y);
      const [w,h]=size(a),hits=r.items.filter(i=>i!==a&&x<i.x+size(i)[0]&&x+w>i.x&&y<i.y+size(i)[1]&&y+h>i.y);
      if(hits.length!==1)throw Error('位置不足');
      const b=hits[0],old=[a.x,a.y,b.x,b.y];a.x=x;a.y=y;b.x=old[0];b.y=old[1];
      if(!fits(a,a.x,a.y)||!fits(b,b.x,b.y)){[a.x,a.y,b.x,b.y]=old;throw Error('位置不足');}
    }
    function rotate(uid) {
      const r=editable(),item=[...r.items,...r.pending].find(x=>x.uid===uid);if(!item)throw Error('请先选择物品');
      item.rotation=1-item.rotation;
      if(item.x!=null&&!fits(item,item.x,item.y)){item.rotation=1-item.rotation;throw Error('旋转后格位不足');}
    }
    function withdraw(uid) {
      const r=editable(),item=r.items.find(x=>x.uid===uid);if(!item)throw Error('物品不在背包中');
      r.items=r.items.filter(x=>x!==item);item.x=null;item.y=null;r.pending.push(item);
    }
    function startBattle() {
      const r=s.run;if(!r||!['ready','event'].includes(r.phase))throw Error('当前不能出发');
      if(!r.items.some(x=>x.kind==='move'))throw Error('至少携带一个招式');
      if(r.pending.length)throw Error('请先将待领取物品装入背包');
      let level=r.route?Math.round(r.route.levels[0]+(r.route.levels[1]-r.route.levels[0])*r.stage/Math.max(1,r.totalBattles-1)):null;
      let enemy=[10,19][r.stage];if(r.route&&!r.gymId){const pool=r.route.pool.filter(([id])=>species(id));let roll=random()*pool.reduce((n,p)=>n+p[1],0);enemy=pool[pool.length-1][0];for(const [id,weight] of pool){roll-=weight;if(roll<0){enemy=id;break;}}}
      if(r.gymId){[enemy,level]=PROGRESSION.gyms.find(g=>g.id===r.gymId).team[r.stage];}
      const hp=r.route?24+level*3+r.stage*6:r.stage===0?34:65;
      r.battle={speciesId:enemy,level,trainer:!!r.route&&r.stage>=r.route.wild,hp,maxHp:hp,t:0,enemyAt:1800,skills:Object.fromEntries(r.items.filter(x=>x.kind==='move').map(x=>[x.uid,600])),berryUsed:false,events:[],lastHit:null};
      r.phase='battle';r.log.push('遭遇了'+name(r.battle.speciesId)+'！');
    }
    function damage(move, enemy) {
      const def=species(s.run.mon.speciesId),foe=species(enemy),m=catalog.MOVES[move];
      const atk=m.cat==='spec'?def.stats.spa:def.stats.atk,guard=m.cat==='spec'?foe.stats.spd:foe.stats.def;
      const stab=def.types.includes(m.type)?1.5:1;
      const type=foe.types.reduce((n,t)=>n*(catalog.TYPE_CHART[m.type]?.[t]??1),1);
      const held=s.run.items.some(x=>x.key==='exp-share')?1.2:1;
      return type===0?0:Math.max(1,Math.floor(((2*s.run.mon.level/5+2)*m.power*atk/guard/50+2)*stab*type*held));
    }
    function makeReward(kind,key,w,h){const r=s.run;return {uid:'r'+r.id+'-'+r.nextItem++,kind,key,w,h,x:null,y:null,rotation:0};}
    function rewardMove(){const pool=attackPool(s.run.mon.speciesId,s.run.mon.level);return pool[Math.floor(randomUnit()*pool.length)];}
    const EVENTS=[
      {id:'training',name:'招式特训',icon:'ui/exp-share.png',detail:'招式卡块 ×1',kind:'move'},
      {id:'cache',name:'遗落行囊',icon:'items/storage.png',detail:'携带道具 ×1',kind:'held'},
      {id:'berries',name:'树果采集',icon:'ui/tallgrass-icon.png',detail:'橙橙果 ×2',kind:'berries'},
      {id:'camp',name:'林间休息',icon:'ui/pokecenter.png',detail:'恢复 35% HP',kind:'heal'},
      {id:'points',name:'协助研究',icon:'items/point-card.png',detail:'基因片段 +3',kind:'points'},
      {id:'trade',name:'旅行商人',icon:'items/storage.png',detail:'基因片段 −2 · 携带道具 ×2',kind:'held',cost:2},
      {id:'thicket',name:'深入密林',icon:'ui/tallgrass-icon.png',detail:'HP −10% · 招式与树果各 ×1',kind:'risk'}
    ];
    function reward(){const r=s.run;if(r.gymId){r.log.push('击败'+name(r.battle.speciesId)+'！');if(r.stage+1<r.totalBattles){r.stage++;r.phase='ready';startBattle();}else{r.phase='settlement';r.outcome='graduated';}return;}r.phase='encounter';r.earned+=2;gainGenes(2);s.defeats++;r.mon.level+=2;r.pending=[];
      const deck=EVENTS.filter(e=>!e.cost||s.points>=e.cost).map(e=>({...e}));
      for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
      r.encounter={stage:r.stage,options:deck.slice(0,3)};
      r.log.push('击败'+name(r.battle.speciesId)+'，基因片段 +2，等级 +2。');
    }
    function chooseEncounter(id){const r=need('encounter'),option=r.encounter?.options.find(e=>e.id===id);if(!option)throw Error('事件已失效');if(s.points<(option.cost||0))throw Error('基因片段不足');
      s.points-=option.cost||0;
      const move=()=>makeReward('move',rewardMove(),2,2),berry=()=>makeReward('held','oran-berry',1,1),held=()=>makeReward('held','exp-share',2,1);
      if(option.kind==='move')r.pending=[move()];
      if(option.kind==='held')r.pending=option.cost?[held(),held()]:[held()];
      if(option.kind==='berries')r.pending=[berry(),berry()];
      if(option.kind==='heal')r.hp=Math.min(r.maxHp,r.hp+Math.ceil(r.maxHp*.35));
      if(option.kind==='points'){gainGenes(3);r.earned+=3;}
      if(option.kind==='risk'){r.hp=Math.max(1,r.hp-Math.ceil(r.maxHp*.1));r.pending=[move(),berry()];}
      r.log.push(option.name+'：'+option.detail);r.lastEncounter={...option,stage:r.stage};delete r.encounter;r.phase='reward';
    }
    function offerEvolution(resume){const r=s.run;if(r.deferredEvolution===r.mon.speciesId+':'+r.stage)return false;const options=(EVOLUTIONS?.[r.mon.speciesId]||[]).filter(e=>e.level&&r.mon.level>=e.level&&species(e.to));if(!options.length)return false;
      r.evolution={from:r.mon.speciesId,options:options.map(e=>({to:e.to,level:e.level})),resume};r.phase='evolution';return true;
    }
    function evolve(to){const r=need('evolution'),e=r.evolution.options.find(e=>e.to===Number(to));if(!e)throw Error('不可选择此进化');
      const old=species(r.mon.speciesId),next=species(e.to),ratio=r.hp/r.maxHp;
      const pool=attackPool(e.to,r.mon.level);
      const key=pool[Math.floor(random()*pool.length)],learned=makeReward('move',key,2,1);
      r.items=r.items.filter(i=>i.kind!=='move');r.pending=r.pending.filter(i=>i.kind!=='move');
      let placed=false;for(let y=0;y<ROWS&&!placed;y++)for(let x=0;x<COLS&&!placed;x++)if(fits(learned,x,y)){learned.x=x;learned.y=y;r.items.push(learned);placed=true;}
      if(!placed)r.pending.push(learned);
      r.mon.speciesId=e.to;r.maxHp=Math.round(r.maxHp*next.stats.hp/old.stats.hp);r.hp=Math.max(1,Math.round(r.maxHp*ratio));r.evolution.to=e.to;r.evolution.learned=key;r.phase='evolution-result';r.log.push(name(r.evolution.from)+'进化为'+name(e.to)+'，遗忘原有招式，学会'+moveName(key)+'。');}

    function finishEvolution(skip=false){const r=need(skip?'evolution':'evolution-result'),resume=r.evolution.resume;if(skip)r.deferredEvolution=r.mon.speciesId+':'+r.stage;delete r.evolution;r.phase=resume;if(!r.items.some(i=>i.kind==='move'))return;return forward();}
    function tick(ms) {
      if(!Number.isFinite(ms)||ms<0||ms>120000)throw Error('时间步长无效');
      const r=s.run;if(!r||r.phase!=='battle')return;
      let left=ms;
      while(left>0&&r.phase==='battle'){
        const step=Math.min(50,left);left-=step;const b=r.battle;b.t+=step;r.elapsed+=step;
        for(const item of r.items.filter(x=>x.kind==='move')){
          if(b.t>=b.skills[item.uid]){
            const amount=damage(item.key,b.speciesId);b.hp=Math.max(0,b.hp-amount);
            const effect={actor:'player',move:item.key,amount,time:b.t};b.lastHit=effect;b.events.push(effect);
            b.skills[item.uid]=b.t+(item.w*item.h>=4?2600:1800);
            if(b.hp<=0){reward();break;}
          }
        }
        if(r.phase!=='battle')break;
        if(r.battle!==b)continue;
        if(b.t>=b.enemyAt){const amount=r.route?3+Math.floor(b.level/8):r.stage===0?5:8;r.hp=Math.max(0,r.hp-amount);b.enemyAt+=2200;const e={actor:'enemy',amount,time:b.t};b.events.push(e);b.lastHit=e;}
        if(r.hp>0&&r.hp<=r.maxHp*.55&&!b.berryUsed&&r.items.some(x=>x.key==='oran-berry')){const heal=Math.min(25,r.maxHp-r.hp);r.hp+=heal;b.berryUsed=true;b.events.push({actor:'heal',amount:heal,time:b.t});r.log.push('橙橙果恢复了'+heal+'点生命。');}
        if(r.hp<=0){r.phase='settlement';r.outcome='rescued';r.log.push('探险中止，宝可梦已被救援。');}
      }
    }
    function completeReward() {
      const r=need('reward');if(r.pending.length)throw Error('请先将全部奖励装入背包');
      r.phase='event';r.log.push('背包整理完成，返回探险记录。');
    }
    function proceed() {
      const r=need('event');if(r.stage<(r.totalBattles||2)-1){r.stage++;startBattle();}else{r.phase='settlement';r.outcome='graduated';r.log.push((r.route?.name||'常青小径')+'探险完成！');}
    }
    function forward(){
      if(!s.run||!['ready','reward','event'].includes(s.run.phase))throw Error('当前不能前进');
      if(!s.run.items.some(i=>i.kind==='move'))throw Error('至少携带一个招式');
      s.run.pending=[];
      if(s.run?.phase==='ready'){if(!s.run.gymId&&offerEvolution('ready'))return;return startBattle();}
      if(s.run?.phase==='reward')completeReward();
      if(offerEvolution('event'))return;
      return proceed();
    }
    function settle() {
      const r=need('settlement');
      if(s.settled.includes(r.id))throw Error('本次探险已结算');
      if(r.gymId){if(r.outcome==='graduated'&&!s.progression.badges.includes(r.gymId))s.progression.badges.push(r.gymId);s.settled.push(r.id);s.run=null;return {gymId:r.gymId,outcome:r.outcome};}
      if(r.outcome==='graduated'&&r.route?.id&&!s.progression.routes.includes(r.route.id))s.progression.routes.push(r.route.id);
      const mon={...r.mon,loadout:JSON.parse(JSON.stringify(r.items)),routeId:r.route?.id,uid:'mon-'+r.id,hp:r.maxHp,originRun:r.id,outcome:r.outcome};
      s.collection.push(mon);s.settled.push(r.id);s.run=null;return mon;
    }
    function rescue(){throw Error('请使用免费抽取');}
    function itemInfo(item) {
      if(item.kind==='move'){const m=catalog.MOVES[item.key];return {name:moveName(item.key),type:m.type,detail:(m.cat==='spec'?'特殊':'物理')+' · 威力 '+m.power+' · 冷却 '+(item.w*item.h>=4?'2.6':'1.8')+'秒'};}
      return item.key==='oran-berry'?{name:'橙橙果',type:'grass',detail:'生命不高于55%时恢复25生命；每场战斗一次。'}:{name:'学习装置',type:'normal',detail:'携带时所有招式伤害 ×1.2；同类不叠加。'};
    }
    return {s,routeUnlocked,gymUnlocked,cityUnlocked,startGym,species,name,moveName,drawCost,tierUnlocked,attackPool,draw,reveal,size,fits,place,move,rotate,withdraw,startBattle,tick,completeReward,proceed,forward,settle,rescue,itemInfo,damage,chooseEncounter,evolve,finishEvolution};
  }
  return {KEY,COLS,ROWS,TYPES,create};
});
