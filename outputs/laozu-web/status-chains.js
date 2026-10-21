/* Source Ability descriptions and buff identities; local bounded magnitudes. */
window.StatusChains=(()=>{
 const negative=new Set(['poison','venom','cold','weak','burn','scorch','stunMark','chill','banheal','electric','spore','frostbite','drainWeak']);
 const names={armor:'穿甲',poison:'中毒',venom:'剧毒',cold:'寒冷',weak:'虚弱',burn:'灼烧',scorch:'烧伤',stunMark:'击晕印记',blessing:'庇佑',thunder:'聚雷',electric:'感电',sword:'剑意',blade:'刀意',hammer:'锤势',soul:'招魂',strong:'强攻',chill:'寒意',sacrifice:'炎祭',heat:'火热',will:'雷神意志',thunderGod:'雷神化',hunt:'狩猎',ghost:'驭鬼',king:'鬼王',body:'炼体',golden:'金身',blood:'血脉之力',bloodSacrifice:'血祭',rageThunder:'怒雷',spore:'孢子',frostbite:'冻伤',drainWeak:'汲取衰弱',banheal:'禁疗'};
 const caps={armor:20,poison:100,venom:20,cold:40,weak:30,heat:50,sword:10,blade:12,hammer:20,sacrifice:20,thunder:40,strong:20,will:50,golden:50,blood:2,ghost:30,king:3,bloodSacrifice:20,rageThunder:10,blessing:40,body:60,chill:60};
 const E=()=>CombatEffects, count=(b,k,side='player')=>{const x=b.statuses?.[side]?.[k];return x&&(x.until==null||x.until>=b.round)?x.n:0;};
 function put(s,b,k,n=1,side='player',duration=null){b.statuses??={player:{},enemy:{}};b.statuses[side]??={};const old=count(b,k,side);b.statuses[side][k]={n:Math.max(0,Math.min(caps[k]||30,old+n)),until:duration==null?null:b.round+duration-1};const gain=count(b,k,side)-old;E().trace(b,'status',gain,{status:k,side});if(gain>0)dispatch('stack',s,b,{key:k,gain,side});return gain;}
 function clear(b,k,side='player'){if(b.statuses?.[side])delete b.statuses[side][k];}
 function cleanse(b){const key=Object.keys(b.statuses?.player||{}).find(k=>negative.has(k));if(key){clear(b,key);E().trace(b,'cleanse',1,{status:key});}return key;}
 const extra=(s,b,n,element=0,trueDamage=false)=>{if(b.enemyHp>0)E().deal(s,b,n,{kind:trueDamage?'true':'skill',element,secondary:true,trueDamage});};
 const once=(b,key,fn)=>{b.chainOnce??={};if(!b.chainOnce[key]){b.chainOnce[key]=true;fn();}};
 const chance=(p=.3)=>Math.random()<p;
 const total=(b,key)=>{b.chainCounts??={};return b.chainCounts[key]=(b.chainCounts[key]||0)+1;};
 const R={
 4013:{hit:(s,b,h)=>{if(h.element===1&&chance())put(s,b,'armor');}},
 4017:{attrs:(s,b,a)=>{if(b.round<=3)a[2039]=(a[2039]||0)+count(b,'armor')*300;}},
 4021:{stack:(s,b,x)=>{if(x.key==='armor'&&x.side==='player'&&count(b,'armor')>=10)once(b,'drink',()=>{b.drinkUntil=b.round+2;});},attrs:(s,b,a)=>{if(b.drinkUntil>=b.round)a[2037]=(a[2037]||0)+3000;}},
 4037:{hit:(s,b)=>{if(count(b,'poison','enemy'))extra(s,b,b.playerAtk*.2,2);}},
 4041:{hit:(s,b)=>{if(count(b,'poison','enemy')&&chance())put(s,b,'venom',1,'enemy',3);}},
 4045:{end:(s,b)=>{const n=count(b,'poison','enemy');if(n){E().heal(s,b,n*b.playerAtk*.05);b.marrow=Math.min(.3,(b.marrow||0)+.03);}},attrs:(s,b,a)=>{a[2025]=(a[2025]||0)+(b.marrow||0)*10000;}},
 4061:{hit:(s,b,h)=>{if(h.element===3&&chance())put(s,b,'cold',1,'enemy',3);}},
 4065:{hit:(s,b,h)=>{if(h.element===3&&count(b,'cold','enemy')&&chance())put(s,b,'weak',1,'enemy',2);}},
 4069:{hit:(s,b,h)=>{if(h.element===3&&count(b,'cold','enemy'))extra(s,b,b.playerAtk*.2,3);}},
 4085:{hit:(s,b,h)=>{if(h.element===4&&chance())put(s,b,'burn',1,'enemy',3);}},
 4089:{hit:(s,b,h)=>{if(h.element===4&&count(b,'burn','enemy')&&chance())put(s,b,'scorch',1,'enemy',3);}},
 4093:{hit:(s,b,h)=>{const n=count(b,'burn','enemy');if(h.element===4&&n&&chance()){clear(b,'burn','enemy');extra(s,b,b.playerAtk*n*.15,4);}}},
 4101:{hit:(s,b,h)=>{if(h.element===5&&count(b,'stunMark','enemy')&&chance())extra(s,b,E().power(s,b,'def'),5);}},
 4105:{stack:(s,b,x)=>{if(x.key==='stunMark'&&x.side==='enemy')b.hammerRend=Math.min(5,(b.hammerRend||0)+1);}},
 4109:{begin:(s,b)=>E().heal(s,b,b.playerAtk*.015*count(b,'blessing'))},
 4113:{attrs:(s,b,a)=>{if(count(b,'blessing')>=40){a[2005]=(a[2005]||0)+2000;a[2026]=(a[2026]||0)+1000;}}},
 4117:{begin:(s,b)=>{if(b.round===1)put(s,b,'blessing',10);},attrs:(s,b,a)=>{if(count(b,'blessing')>=40){a[2004]=(a[2004]||0)+2000;a[2025]=(a[2025]||0)+1000;}}},
 4121:{hit:(s,b,h)=>{if(h.element===6&&chance())put(s,b,'thunder');if(count(b,'thunder')>=40)put(s,b,'electric',1,'enemy',3);}},
 4125:{hit:(s,b)=>{if(count(b,'electric','enemy'))extra(s,b,b.playerAtk*.2,6);}},
 4129:{hit:(s,b,h)=>{if(h.kind==='rage'&&count(b,'thunder')>=40){extra(s,b,b.playerAtk,6);extra(s,b,b.playerAtk,6);};}},
 4133:{hit:(s,b,h)=>{if(h.element===6&&chance())extra(s,b,b.playerAtk*.4,6);}},
 4137:{hit:(s,b,h)=>{if(h.element===6&&total(b,'yin')%8===0)extra(s,b,b.playerAtk,6);}},
 4141:{hit:(s,b,h)=>{if(h.element===6&&total(b,'intimidate')%12===0){b.enemyRage=Math.max(0,(b.enemyRage||0)-20);E().trace(b,'rage-remove',20);}}},
 4157:{begin:(s,b)=>put(s,b,'sword',2)},
 4161:{attrs:(s,b,a)=>{for(const k of [2020,2018,2022])a[k]=(a[k]||0)+count(b,'sword')*200;}},
 4165:{attrs:(s,b,a)=>{for(const k of [2025,2026])a[k]=(a[k]||0)+count(b,'sword')*100;}},
 4205:{begin:(s,b)=>{if(b.round===1)put(s,b,'blade',6);},end:(s,b)=>put(s,b,'blade',-2)},
 4209:{hit:(s,b)=>{if(chance())put(s,b,'banheal',1,'enemy',2);}},
 4213:{hit:(s,b)=>extra(s,b,b.playerAtk*.15,0,true)},
 4217:{begin:(s,b)=>put(s,b,'hammer',2)},
 4221:{hit:(s,b,h)=>{if(h.kind==='rage')extra(s,b,E().power(s,b,'def')*2);}},
 4225:{attrs:(s,b,a)=>{if(b.playerHp<b.playerMax*.8)a[2026]=(a[2026]||0)+Math.min(3000,count(b,'hammer')*200);}},
 4229:{begin:(s,b)=>{if(b.round===1)put(s,b,'soul',6);},end:(s,b)=>put(s,b,'soul',-3)},
 4233:{attrs:(s,b,a)=>{const n=count(b,'soul');a[2038]=(a[2038]||0)-n*400;a[2037]=(a[2037]||0)+n*200;}},
 4241:{hit:(s,b,h)=>{if(b.round<=3&&h.critical&&total(b,'crit')>=4)b.fightSpirit=Math.min(3,1+Math.floor(((b.chainCounts.crit||0)-4)/3));},attrs:(s,b,a)=>{if(b.fightSpirit)a[2037]=(a[2037]||0)+2000*b.fightSpirit;}},
 41071:{hit:(s,b,h)=>{if(h.element===1&&total(b,'strong')%10===0)put(s,b,'strong');}},
 41081:{hit:(s,b,h)=>{if(h.element===1&&count(b,'strong')&&chance())extra(s,b,count(b,'strong')*b.playerAtk*.1,0,true);}},
 41091:{stack:(s,b,x)=>{if(x.key==='strong'&&x.side==='player'&&count(b,'strong')>=20)once(b,'strongMax',()=>{for(let i=0;i<10;i++)extra(s,b,b.playerAtk*.6,1);});}},
 43081:{hit:(s,b,h)=>{b.chillHits??={};if(h.element===3&&(b.chillHits[b.round]||0)<10&&chance()){b.chillHits[b.round]=(b.chillHits[b.round]||0)+1;put(s,b,'chill',1,'enemy',3);}}},
 43091:{hit:(s,b,h)=>{if(h.element===3&&(b.playerSpeed||30)>(b.enemySpeed||30)-count(b,'cold','enemy')*2-count(b,'chill','enemy')*3)extra(s,b,E().power(s,b,'def'),3);}},
 44071:{stack:(s,b,x)=>{if(x.key==='sacrifice'&&x.side==='player'&&b.round<=5)E().rage(s,b,5*x.gain);}},
 44081:{stack:(s,b,x)=>{if(x.key==='sacrifice'&&x.side==='player')E().heal(s,b,b.playerAtk*.1*x.gain);}},
 44091:{hit:(s,b,h)=>{if(h.kind==='rage')b.burnout=Math.min(5,(b.burnout||0)+1);},attrs:(s,b,a)=>{a[2004]=(a[2004]||0)+(b.burnout||0)*500;a[2015]=(a[2015]||0)+(b.burnout||0)*500;}},
 45091:{crush:(s,b)=>{b.crushRend=Math.min(30,(b.crushRend||0)+1);}},
 46071:{begin:(s,b)=>{if(b.round===1)put(s,b,'will',5);else if(b.round>=3)put(s,b,'will',5);}},
 46081:{attrs:(s,b,a)=>{if(count(b,'thunderGod')){a[2004]=(a[2004]||0)+2500;a[2005]=(a[2005]||0)+2500;}}},
 46091:{hit:(s,b,h)=>{if(h.kind==='rage'&&count(b,'thunderGod'))extra(s,b,b.playerAtk*1.5,6);}},
 47031:{begin:(s,b)=>{if(b.round===1){for(let i=0;i<4;i++){b.playerHp=Math.max(1,Math.round(b.playerHp*.97));b.selfSacrifices=(b.selfSacrifices||0)+1;extra(s,b,b.playerAtk*.15,7);}}},attrs:(s,b,a)=>{a[2025]=(a[2025]||0)+3000;a[2039]=(a[2039]||0)+6000;a[2026]=(a[2026]||0)-Math.min(2,b.round-1)*1000;}},
 47041:{begin:(s,b)=>{if(b.round===1)put(s,b,'hunt',1,'player',3);},hit:(s,b,h)=>{if(h.element===7&&count(b,'hunt')&&total(b,'hunt')%10===0)extra(s,b,b.playerAtk,7);}},
 47051:{hit:(s,b,h)=>{if(h.element===7&&count(b,'hunt')&&total(b,'huntClean')%20===0)cleanse(b);}},
 47061:{attrs:(s,b,a)=>{if(count(b,'hunt')){a[2037]=(a[2037]||0)+3000;a[2026]=(a[2026]||0)-1000;}}},
 47071:{hit:(s,b,h)=>{if(b.round<=2&&h.element===7&&total(b,'ghostHits')%5===0)put(s,b,'ghost',2);}},
 47081:{hit:(s,b)=>{if(b.enemyHp<b.enemyMax*.5)once(b,'frenzy',()=>{b.frenzyUntil=b.round+1;});},attrs:(s,b,a)=>{if(b.frenzyUntil>=b.round)a[2025]=(a[2025]||0)+3000;}},
 47091:{stack:(s,b,x)=>{if(x.key==='ghost'&&x.side==='player'){const n=Math.floor(count(b,'ghost')/10)-count(b,'king');if(n>0)put(s,b,'king',n);}}},
 48011:{begin:(s,b)=>put(s,b,'body',5)},
 48031:{attrs:(s,b,a)=>{const n=Math.min(3,Math.floor(count(b,'body')/20));a[2039]=(a[2039]||0)+n*200;a[2069]=(a[2069]||0)+n*200;}},
 48041:{begin:(s,b)=>put(s,b,'golden',5)},
 48051:{begin:(s,b)=>{if(count(b,'golden')>=50)cleanse(b);}},
 48061:{end:(s,b)=>{if(count(b,'golden')>=50)for(const [uid,x] of Object.entries(b.equipmentState||{}))if(x.lastRound===b.round&&chance(.2))E().castEquipment(s,b,+uid,{replay:true});}},
 48071:{begin:(s,b)=>put(s,b,'blood')},
 48081:{begin:(s,b)=>{if(b.round>=3&&chance(.5)){const key=Object.keys(b.statuses?.enemy||{}).find(k=>!negative.has(k)&&count(b,k,'enemy'));if(key){put(s,b,key,1);put(s,b,key,-1,'enemy');E().trace(b,'steal-buff',1,{status:key});}}}},
 48091:{hit:(s,b,h)=>{if(h.kind==='rage')E().heal(s,b,b.playerAtk*.2*count(b,'blood'));}}
 };
 function dispatch(event,s,b,arg={}){for(const a of E().active(s)){const id=E().family(a),fn=R[id]?.[event];if(fn){const before=JSON.stringify([b.playerHp,b.enemyHp,b.statuses,b.chainCounts,b.equipmentState]);fn(s,b,arg);if(before!==JSON.stringify([b.playerHp,b.enemyHp,b.statuses,b.chainCounts,b.equipmentState]))E().trace(b,'ability-trigger',id,{event});}}
  if(event==='stack'&&arg.side==='enemy'&&arg.key==='chill'){const tier=Math.floor(count(b,'chill','enemy')/20);if(tier>count(b,'frostbite','enemy'))put(s,b,'frostbite',tier-count(b,'frostbite','enemy'),'enemy');}
  if(event==='stack'&&arg.side==='player'&&arg.key==='will'&&count(b,'will')>=50&&!count(b,'thunderGod'))put(s,b,'thunderGod');
 }
 function attrs(s,b,a,side){const get=k=>count(b,k,side),add=(k,v)=>{a[k]=(a[k]||0)+v;};
  add(2082,get('armor')*200);add(2004,get('blade')*400+get('strong')*500+get('body')*100+get('ghost')*100+get('blessing')*200-get('cold')*150);
  add(2005,get('blessing')*200+get('hammer')*500-get('poison')*100-get('frostbite')*500);add(2025,get('sword')*300+get('blood')*100);
  add(2026,get('thunder')*60-get('strong')*500);add(2037,get('golden')*100+get('soul')*400-get('weak')*200);add(2038,get('soul')*400);
  add(2039,get('sacrifice')*200+get('bloodSacrifice')*200+get('rageThunder')*500);add(2023,get('heat')*40);add(2008,get('heat')-get('chill'));add(2045,-get('banheal')*2000);add(2049,-get('scorch')*100-get('drainWeak')*200);add(2060,-get('scorch')*100);
  if(side==='enemy'){add(2026,-(b.hammerRend||0)*300);add(2004,-(b.crushRend||0)*100);add(2005,-(b.crushRend||0)*100);return a;}
  for(const row of E().active(s))R[E().family(row)]?.attrs?.(s,b,a);return a;
 }
 function dots(s,b){for(const [k,el] of [['poison',2],['venom',2],['burn',4],['spore',2]]){const n=count(b,k,'enemy');if(n){const a=E().attrs(s,b);extra(s,b,b.playerAtk*n*(k==='venom'?.25:k==='burn'?.15:.05)*(1+(a[el===4?2128:2126]||0)/10000),el);}}}
 function begin(s,b){if(b.chainBegin===b.round)return;b.chainBegin=b.round;for(const side of ['player','enemy'])for(const [k,x] of Object.entries(b.statuses?.[side]||{}))if(x.until!=null&&x.until<b.round)clear(b,k,side);dispatch('begin',s,b);const max=b.bodyBaseMax??=b.playerMax,bonus=Math.round(max*count(b,'body')*.005);b.playerMax+=bonus-(b.bodyMaxBonus||0);b.bodyMaxBonus=bonus;dots(s,b);}
 function end(s,b){if(b.chainEnd===b.round)return;b.chainEnd=b.round;dispatch('end',s,b);const kings=count(b,'king');if(kings)extra(s,b,kings*(b.playerAtk*1.5+(b.enemyMax-b.enemyHp)*.05),7);}
 function hit(s,b,h){if(h.secondary)return;if(h.side==='player'&&h.damage>0)dispatch('hit',s,b,h);}
 return {registry:R,names,negative,count,put,clear,cleanse,dispatch,attrs,begin,end,hit};
})();
