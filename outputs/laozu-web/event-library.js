/* Client event actions interpreted locally. Server routing/reward rolls remain approximations. */
window.EventLibrary=(()=>{
 const D=EVENT_LIBRARY_DATA;
 Object.assign(WanderEvents.data.events,D.events);
 const actions=e=>Array.from({length:11},(_,i)=>e['arrAction'+i]||[]).filter(a=>a.length&&a[0]);
 function weighted(values,weights,random=Math.random){const sum=values.reduce((n,_,i)=>n+Math.max(0,weights?.[i]??1),0);let at=random()*sum;for(let i=0;i<values.length;i++){at-=Math.max(0,weights?.[i]??1);if(at<0)return values[i];}return values.at(-1);}
 function action(a){if(a[0]===1)return {type:'source-dispatch',sourceId:a[1]};return {type:'source-effect',action:a};}
 function description(e,name){const source=e.szDesc||D.texts[weighted(e.arrTxtId||[],null)]||'仙途中遇到新的机缘。';return WanderEvents.text(source,name).replace(/\{[^}]+\}/g,m=>({'{monsterName}':'拦路妖兽','{attributePrize}':'修为有所提升','{abilityName}':'新的神通'}[m]||'机缘'));}
 function expand(id,name){const e=D.events[id];if(!e)throw Error('Unresolved event '+id);const t={sourceId:id,title:'游历奇遇',text:description(e,name)},a=actions(e),params=e.arrParam||[];const story={...t,type:'story'};
 switch(e.iEventType){
 case 1:return [];
 case 2:case 24:return [story,...a.map(action)];
 case 3:return [story,...(a.length?[action(weighted(a,params))]:[])];
 case 4:case 18:return [{...t,type:'source-choice'}];
 case 5:case 23:return [story,{type:'source-battle',sourceId:id},...a.map(action)];
 case 6:return [story,{type:'godexam',title:'渡劫突破'},...a.map(action)];
 case 7:return [{...t,type:'source-wheel',wheelId:params[0],rolled:false}];
 case 8:case 17:{const ids=params.slice(2).map(id=>WANDER_DATA.abilities.find(x=>x.abilityId===id||x.id===id)?.id).filter(Boolean);return [story,{type:'ability',sourceId:id,selectCount:Math.max(1,Math.min(3,params[1]||1)),...(ids.length?{options:ids,canRefresh:false}:{})}];}
 case 9:case 16:case 25:return [story,{type:'equipment',sourceId:id,title:'法宝机缘',total:1,quality:Math.max(1,Math.min(4,params[1]||2)),...(e.iEventType===16?{ids:params}: {})}];
 case 10:return [{...t,type:'source-judge',required:params[1]||1000}];
 case 11:case 26:return [story,{type:'shop',sourceId:id,title:'淘宝斋'}];
 case 12:case 27:return [{...t,type:'source-dig',left:Math.max(1,Math.min(9,params[0]||5)),opened:[],cost:Math.max(0,params[2]||5)}];
 case 14:return [{...t,type:'source-alchemy',round:0,score:0,running:false,elapsed:0}];
 case 15:return [story,{type:'pet',sourceId:id}];
 case 19:return [{...t,type:'source-upgrade',cost:20}];
 case 20:return [{...t,type:'source-slots',cost:10,spins:0}];
 default:throw Error('Unimplemented event type '+e.iEventType);
 }}
 function choose(r,types){r.eventSeen??=[];let ids=types.flatMap(t=>D.byType[t]||[]).filter(id=>!r.eventSeen.includes(id));if(!ids.length)ids=types.flatMap(t=>D.byType[t]||[]);const id=weighted(ids);if(id){r.eventSeen.push(id);r.eventSeen=r.eventSeen.slice(-200);}return id;}
 function prize(id){return D.prizes[id];}
 return {data:D,weighted,actions,action,expand,choose,prize};
})();
