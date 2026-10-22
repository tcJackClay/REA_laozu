/* Source: UISelectEquip, BagCompEditBehavior, UIBuyGridConfirm,
 * WanderProgressBarItem. Rewards are local approximations, not server odds. */
window.WanderTools=(()=>{
 const D=window.WANDER_TOOLS_DATA;
 const key=(x,y)=>y*100+x;
 function data(s){const r=s.run;if(!r)return null;if(!r.tools){
  // Approximate the initial capacity; use original cell ordering and preserve
  // already-equipped items when opening an existing development save.
  const cells=D.WanderPackageLevel.slice(0,24).map(c=>c.iUnlockPos);
  for(const i of s.inventory.filter(i=>i.x!==null)){const item=window.TeacherRuntime.items.find(d=>d.id===i.id);if(item){let shape=item.shape.map(p=>[...p]);for(let n=0;n<(i.rotation||0);n++)shape=shape.map(([x,y])=>[-y,x]);const mx=Math.min(...shape.map(p=>p[0])),my=Math.min(...shape.map(p=>p[1]));for(const [x,y] of shape)cells.push(key(x-mx+i.x,y-my+i.y));}}
  r.tools={reforge:0,opened:[],baseCells:[...new Set(cells)],transactions:[]};
 }return r.tools;}
 const need=s=>D.WanderingEquipReforge.find(x=>x.iPathID===(s.run?.config.pathId||1001))?.iNeedCount||6;
 const open=(s,x,y)=>{const d=data(s);return !d||d.baseCells.includes(key(x,y))||d.opened.includes(key(x,y));};
 const canOpen=(s,x,y)=>x>=0&&x<7&&y>=0&&y<6&&!open(s,x,y)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>open(s,x+dx,y+dy));
 const cost=s=>D.WanderPackageOpen.find(x=>x.iOpenCount===data(s).opened.length+1);
 const maxOpenFor=s=>D.maxOpen+(window.MonthCardRules?.bonus(s,10)||0);
 function unlock(s,x,y){const d=data(s),c=cost(s);if(d.opened.length>=maxOpenFor(s))return '本轮开启次数已达上限';if(!canOpen(s,x,y))return '请选择与已开格相邻的格子';if(!c)return '暂无开格配置';if((s.crystal||0)<c.iCostVal)return '仙玉不足';s.crystal-=c.iCostVal;d.opened.push(key(x,y));d.transactions.push({type:'open',cell:key(x,y),cost:c.iCostVal});return null;}
 function recycle(s,uid){const d=data(s),i=s.inventory.find(x=>x.uid===uid);if(!d||!i||i.salePrice!=null)return false;s.inventory=s.inventory.filter(x=>x!==i);d.reforge++;d.transactions.push({type:'recycle',uid,id:i.id});return true;}
 function reforge(s,newUid,random=Math.random){const d=data(s),n=need(s);if(d.reforge<n)return null;const pool=window.TeacherRuntime.items.filter(x=>x.quality>=2&&x.quality<=4);const item=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];if(!item)return null;d.reforge-=n;const inst={uid:newUid,id:item.id,x:null,y:null,rotation:0};s.inventory.push(inst);d.transactions.push({type:'reforge',uid:newUid,id:item.id,cost:n});return inst;}
 return {data,need,open,canOpen,cost,unlock,recycle,reforge,maxOpenFor,maxOpen:D.maxOpen};
})();
