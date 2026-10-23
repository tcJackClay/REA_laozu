/* Fusion rules are new local rules. Source species, moves and type chart: catalog.js. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PokeFusion = api;
})(globalThis, () => {
  'use strict';
  const KEY = 'poke-fusion-v1', COST = 3, COLS = 7, ROWS = 6;
  const NAMES = {1:'妙蛙种子',4:'小火龙',7:'杰尼龟',10:'绿毛虫',16:'波波',19:'小拉达',25:'皮卡丘'};
  const MOVE_NAMES = {'vine-whip':'藤鞭',ember:'火花','water-gun':'水枪',tackle:'撞击',scratch:'抓','razor-leaf':'飞叶快刀','fire-fang':'火焰牙','water-pulse':'水之波动'};
  const TYPES = {normal:'一般',fire:'火',water:'水',grass:'草',electric:'电',poison:'毒',flying:'飞行',bug:'虫',rock:'岩石',ground:'地面',ice:'冰',psychic:'超能',ghost:'幽灵',dragon:'龙',dark:'恶',steel:'钢',fairy:'妖精',fighting:'格斗'};
  function create(catalog, loaded, random = Math.random) {
    const s = loaded || {version:1,points:0,defeats:0,firstFree:true,sequence:0,collection:[],run:null,settled:[]};
    if (s.version !== 1 || !Array.isArray(s.collection) || !Number.isFinite(s.points) || s.points < 0) throw Error('存档格式不正确');
    const species = id => catalog.POKEDEX.find(x => x.id === id);
    const name = id => NAMES[id] || species(id)?.name || String(id);
    const moveName = id => MOVE_NAMES[id] || catalog.MOVES[id]?.name || id;
    const need = (phase) => { if (!s.run || s.run.phase !== phase) throw Error('当前阶段不能执行此操作'); return s.run; };
    const drawCost = () => s.firstFree ? 0 : COST;
    function draw() {
      if (s.run) throw Error('请先完成当前探险');
      const cost = drawCost(); if (s.points < cost) throw Error('抽取点不足');
      const roll = random(); if (!(roll >= 0 && roll < 1)) throw Error('抽取随机值无效');
      const id = [1,4,7][Math.floor(roll * 3)], def = species(id);
      const primary = {1:'vine-whip',4:'ember',7:'water-gun'}[id];
      const runId = ++s.sequence;
      s.points -= cost; s.firstFree = false;
      s.run = {id:runId,mon:{uid:'run-'+runId,speciesId:id,level:5},phase:'draw',stage:0,hp:90,maxHp:90,earned:0,elapsed:0,battle:null,items:[{uid:'r'+runId+'-0',kind:'move',key:primary,w:2,h:1,x:0,y:0,rotation:0}],pending:[],log:[name(id)+'加入本次探险。'],nextItem:1,outcome:null};
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
    const editable = () => { if (!s.run || !['ready','reward','event'].includes(s.run.phase)) throw Error('战斗中不能整理背包'); return s.run; };
    function place(uid, x, y) {
      const r=editable(),item=[...r.items,...r.pending].find(x=>x.uid===uid); if(!item)throw Error('物品已不存在');
      if(!fits(item,x,y))throw Error('格位不足或与其他物品重叠');
      if(r.pending.includes(item)){r.pending=r.pending.filter(x=>x!==item);r.items.push(item);}
      item.x=x;item.y=y;return item;
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
      const hp=r.stage===0?34:65;
      r.battle={speciesId:[10,19][r.stage],hp,maxHp:hp,t:0,enemyAt:1800,skills:Object.fromEntries(r.items.filter(x=>x.kind==='move').map(x=>[x.uid,600])),berryUsed:false,events:[],lastHit:null};
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
    function reward() {
      const r=s.run;r.phase='reward';r.earned+=2;s.points+=2;s.defeats++;
      r.mon.level+=2;
      const key={1:'razor-leaf',4:'fire-fang',7:'water-pulse'}[r.mon.speciesId];
      const make=(kind,key,w,h)=>({uid:'r'+r.id+'-'+r.nextItem++,kind,key,w,h,x:null,y:null,rotation:0});
      r.pending=r.stage===0?[make('move',key,2,2),make('held','oran-berry',1,1)]:[make('held','exp-share',2,1)];
      r.log.push('击败'+name(r.battle.speciesId)+'，抽取点 +2，等级 +2。');
    }
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
        if(b.t>=b.enemyAt){const amount=r.stage===0?5:8;r.hp=Math.max(0,r.hp-amount);b.enemyAt+=2200;const e={actor:'enemy',amount,time:b.t};b.events.push(e);b.lastHit=e;}
        if(r.hp>0&&r.hp<=r.maxHp*.55&&!b.berryUsed&&r.items.some(x=>x.key==='oran-berry')){const heal=Math.min(25,r.maxHp-r.hp);r.hp+=heal;b.berryUsed=true;b.events.push({actor:'heal',amount:heal,time:b.t});r.log.push('橙橙果恢复了'+heal+'点生命。');}
        if(r.hp<=0){r.phase='settlement';r.outcome='rescued';r.log.push('探险中止，宝可梦已被救援。');}
      }
    }
    function completeReward() {
      const r=need('reward');if(r.pending.length)throw Error('请先将全部奖励装入背包');
      r.phase='event';r.log.push('背包整理完成，返回探险记录。');
    }
    function proceed() {
      const r=need('event');if(r.stage===0){r.stage=1;startBattle();}else{r.phase='settlement';r.outcome='graduated';r.log.push('常青小径探险完成！');}
    }
    function settle() {
      const r=need('settlement');
      if(s.settled.includes(r.id))throw Error('本次探险已结算');
      const mon={...r.mon,uid:'mon-'+r.id,hp:r.maxHp,originRun:r.id,outcome:r.outcome};
      s.collection.push(mon);s.settled.push(r.id);s.run=null;return mon;
    }
    function rescue() {
      if(s.run||s.firstFree||s.points>=COST)throw Error('当前无需救援补给');
      s.points=COST;return COST;
    }
    function itemInfo(item) {
      if(item.kind==='move'){const m=catalog.MOVES[item.key];return {name:moveName(item.key),type:m.type,detail:(m.cat==='spec'?'特殊':'物理')+' · 威力 '+m.power+' · 冷却 '+(item.w*item.h>=4?'2.6':'1.8')+'秒'};}
      return item.key==='oran-berry'?{name:'橙橙果',type:'grass',detail:'生命不高于55%时恢复25生命；每场战斗一次。'}:{name:'学习装置',type:'normal',detail:'携带时所有招式伤害 ×1.2；同类不叠加。'};
    }
    return {s,species,name,moveName,drawCost,draw,reveal,size,fits,place,rotate,withdraw,startBattle,tick,completeReward,proceed,settle,rescue,itemInfo,damage};
  }
  return {KEY,COST,COLS,ROWS,TYPES,create};
});
