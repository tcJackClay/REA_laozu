/* Source callbacks and records drive the branches; candidate draws and prices are offline adapters. */
window.WanderEvents=(()=>{
  const D=WANDER_EVENTS_DATA;
  const clean=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/\\n/g,'\n');
  const text=(s,name)=>clean(s).replaceAll('{name}',name);
  const actions=e=>Array.from({length:11},(_,i)=>e['arrAction'+i]).filter(a=>a?.length&&a[0]);
  function tasks(id,name,depth=0){
    if(window.EventLibrary?.data.events[id])return [{type:'source-dispatch',sourceId:id}];
    if(depth>16)throw Error('Event chain exceeds limit');
    const e=D.events[id];if(!e)throw Error('Unknown source event '+id);
    const t={sourceId:id,title:'游历奇遇',text:text(e.szDesc,name)};
    if([4,18].includes(e.iEventType))return [{...t,type:'source-choice'}];
    if([11,26].includes(e.iEventType))return [{...t,type:'story'},{type:'shop',sourceId:id,title:'淘宝斋'}];
    if(e.iEventType===15)return [{...t,type:'story'},{type:'pet',sourceId:id}];
    if([9,16,25].includes(e.iEventType))return [{...t,type:'story'},{type:'equipment',sourceId:id,title:'上品·法宝匣',total:1,quality:3}];
    if(e.iEventType===7)return [{...t,type:'wheel',rolled:false}];
    return [{...t,type:'story'},...actions(e).flatMap(a=>actionTasks(a,name,depth+1))];
  }
  function actionTasks(a,name,depth=0){
    if(a[0]===1)return tasks(a[1],name,depth);
    if(a[0]===8)return [{type:'source-health',attribute:a[1],rate:a[2],flat:a[3]||0}];
    throw Error('Unsupported source action '+a[0]);
  }
  function options(p,power,name){
    const e=D.events[p.sourceId];let offset=0;
    return Array.from({length:11},(_,i)=>i).filter(i=>e['arrAction'+i]?.length).map(i=>{
      let required=0;if(e.iEventType===18){const type=(e.arrParam||[])[offset++]||0;if(type===1)required=(e.arrParam||[])[offset++]||0;}
      return {id:i,label:text(e['szActionTxt'+i]||window.EventLibrary?.data.texts[(e['arrActionTxtId'+i]||[])[0]]||('选择 '+(i+1)),name),required,enabled:power>=required};
    });
  }
  function draw(pool,count,exclude=[]){
    const choices=pool.filter(x=>!exclude.includes(x));const result=[];
    while(result.length<count&&choices.length)result.push(choices.splice(Math.floor(Math.random()*choices.length),1)[0]);
    return result;
  }
  function init(p,r,state){
    if(p.type==='pet'&&!p.options){
      // Owned pets retain their instance identity; generated candidates are local draws from the original Pet table.
      p.options=[...(state.pets||[]).filter(x=>D.pets.some(y=>y.id===x.id)).map(x=>({id:x.id,uid:x.uid,owned:true})),...draw(D.pets.filter(x=>x.quality===2).map(x=>x.id),3).map(id=>({id,owned:false}))];p.selected=null;
    }
    if(p.type==='ability'&&!p.options){p.options=draw(WANDER_DATA.abilities.map(x=>x.id),3,r.abilities);p.selected=null;p.selectCount=p.selectCount||1;}
    r.eventResources??={abilityUsed:0,itemUsed:0};
  }
  const freeRefresh=state=>D.refresh.free+(window.MonthCardRules?.bonus(state,11)||0);
  function refreshAbility(p,r,state,index,confirmed=false){
    if(p.type!=='ability'||r.pending||!Number.isInteger(index)||index<0||index>=p.options.length||p.canRefresh===false)return '当前不能刷新';
    const pool=WANDER_DATA.abilities.map(x=>x.id).filter(id=>!p.options.includes(id)&&!r.abilities.includes(id));
    if(!pool.length)return '当前无合适神通可供刷新';
    const res=r.eventResources,paid=res.abilityUsed>=freeRefresh(state);
    if(paid){if(res.itemUsed>=D.refresh.maxItems)return '道具刷新次数已用完';if(!(state.goods?.[D.refresh.goodsId]>0))return '刷新道具不足';if(!confirmed)return 'confirm';state.goods[D.refresh.goodsId]--;res.itemUsed++;}
    res.abilityUsed++;const previous=p.options[index];p.options[index]=draw(pool,1)[0];p.selected=null;p.selectedIds=(p.selectedIds||[]).filter(id=>id!==previous);return null;
  }
  return {data:D,clean,text,tasks,options,actionTasks,draw,init,freeRefresh,refreshAbility};
})();
