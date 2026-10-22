/* Unity RectTransform -> CSS. Source IDs remain strings: Unity uses Int64 IDs. */
(function(root){
 'use strict';
 const vec=(v,d)=>v||d, I=[1,0,0,1,0,0];
 const mul=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
 const point=(m,x,y)=>({x:m[0]*x+m[2]*y+m[4],y:m[1]*x+m[3]*y+m[5]});
 function resolve(t,parent){
  const a=vec(t.m_AnchorMin,{x:.5,y:.5}),b=vec(t.m_AnchorMax,a),p=vec(t.m_Pivot,{x:.5,y:.5}),d=vec(t.m_SizeDelta,{x:0,y:0}),q=vec(t.m_AnchoredPosition,{x:0,y:0}),s=vec(t.m_LocalScale,{x:1,y:1}),rot=vec(t.m_LocalRotation,{x:0,y:0,z:0,w:1});
  const width=parent.width*(b.x-a.x)+d.x,height=parent.height*(b.y-a.y)+d.y;
  const x=parent.width*(a.x+(b.x-a.x)*p.x)+q.x-width*p.x;
  const y=parent.height-(parent.height*(a.y+(b.y-a.y)*p.y)+q.y+height*(1-p.y));
  const angle=-Math.atan2(2*(rot.w*rot.z+rot.x*rot.y),1-2*(rot.y*rot.y+rot.z*rot.z));
  const ox=width*p.x,oy=height*(1-p.y),c=Math.cos(angle),n=Math.sin(angle),local=[c*s.x,n*s.x,-n*s.y,c*s.y,0,0];
  local[4]=x+ox-local[0]*ox-local[2]*oy;local[5]=y+oy-local[1]*ox-local[3]*oy;
  const matrix=mul(parent.matrix||I,local),corners=[[0,0],[width,0],[width,height],[0,height]].map(([x,y])=>point(matrix,x,y));
  return {x,y,width,height,pivot:p,scale:s,angle,matrix,corners};
 }
 function solve(nodes,width=1080,height=2340,overrides=new Map()){
  const result=new Map(),screen={width,height,matrix:I},children=new Map(),driven=new Map();
  for(const row of nodes){if(!children.has(row.parentID))children.set(row.parentID,[]);children.get(row.parentID).push(row);}
  function visit(row,parent){
   const over=overrides.get(row.id)||{},original=row.components.find(c=>c.type==='RectTransform')||{},t={...original,...over.rect,...driven.get(row.id)};
   const rect={...resolve(t,parent),row,parentID:row.parentID,active:(over.visible??row.active)&&parent.active!==false};result.set(row.id,rect);
   const kids=children.get(row.id)||[],group=row.components.find(c=>c.m_Enabled!==0&&'m_Spacing'in c&&'m_ChildAlignment'in c&&!('m_CellSize'in c));
   if(group){
    // MonoScript identities are APK-local. The horizontal group identity is recovered from UIMainNavs.
    const horizontal=group.scriptName==='HorizontalLayoutGroup'||group.scriptID==='-3229211799126679632',axis=horizontal?'x':'y';
    const sizes=kids.filter(x=>(overrides.get(x.id)?.visible??x.active)).map(x=>{const tr=x.components.find(c=>c.type==='RectTransform')||{};return {row:x,tr,width:tr.m_SizeDelta?.x||0,height:tr.m_SizeDelta?.y||0};});
    const pad=group.m_Padding||{},spacing=group.m_Spacing||0,align=group.m_ChildAlignment||0,pl=pad.m_Left||0,pr=pad.m_Right||0,pt=pad.m_Top||0,pb=pad.m_Bottom||0;
    const main=horizontal?rect.width-pl-pr:rect.height-pt-pb,total=sizes.reduce((v,x)=>v+(horizontal?x.width:x.height),0)+Math.max(0,sizes.length-1)*spacing;
    const factor=horizontal?(align%3)/2:Math.floor(align/3)/2;let position=(horizontal?pl:pt)+(main-total)*factor;
    for(const x of sizes){const left=horizontal?position:pl+(rect.width-pl-pr-x.width)*(align%3)/2,top=horizontal?pt+(rect.height-pt-pb-x.height)*Math.floor(align/3)/2:position;
     const pivot=x.tr.m_Pivot||{x:.5,y:.5};driven.set(x.row.id,{m_AnchorMin:{x:0,y:1},m_AnchorMax:{x:0,y:1},m_AnchoredPosition:{x:left+pivot.x*x.width,y:-top-(1-pivot.y)*x.height}});position+=(horizontal?x.width:x.height)+spacing;
    }
   }
   for(const child of kids)visit(child,rect);
  }
  for(const row of children.get(null)||[])visit(row,screen);
  return result;
 }
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const color=c=>c?`rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${c.a})`:'inherit';
 function stateOverrides(layout,sprites,states=new Map()){
  const result=new Map(),components=new Map(),gos=new Map(layout.nodes.map(r=>[r.id,r]));
  for(const r of layout.nodes)for(const c of r.components)components.set(c.pathID,{row:r,c});
  const selected=new Map(states);for(const r of layout.nodes)for(const c of r.components){const f=c.fields;if(!f?.switcherGOs)continue;const i=selected.get(c.pathID)??f.m_DefaultStateIndex??0;for(const ref of f.switcherGOs){const go=gos.get(ref.m_PathID);for(const sub of go?.components||[])if(sub.fields)selected.set(sub.pathID,i);}}
  const set=(id,v)=>result.set(id,{...result.get(id),...v});
  for(const r of layout.nodes)for(const c of r.components){if(c.m_Enabled===0)continue;const f=c.fields||{},i=selected.get(c.pathID)??f.m_DefaultStateIndex??0;if(i<0)continue;
   const item=f.items?.[i];if(item&&('visibles'in item||'invisibles'in item)){for(const ref of item.visibles||[])set(ref.m_PathID,{visible:true});for(const ref of item.invisibles||[])set(ref.m_PathID,{visible:false});}
   if(f.SpriteList?.[i]){const spr=sprites[f.SpriteList[i].m_PathID];if(spr)set(r.id,{image:spr.file});}
   if(f.colors?.[i]){const target=components.get(f.tmpText?.m_PathID)||components.get(f.text?.m_PathID);if(target)set(target.row.id,{color:f.colors[i]});}
  }
  return result;
 }
 function render(layout,sprites,options={}){
  const defaults=stateOverrides(layout,sprites,options.states);
  const overrides=new Map(layout.nodes.map(row=>[row.id,{...defaults.get(row.id),...options.node?.(row)}]));
  const rects=solve(layout.nodes,options.width||1080,options.height||2340,overrides),html=new Map(),roots=[];
  for(const row of layout.nodes){
   const rect=rects.get(row.id),over=overrides.get(row.id)||{};
   const tag=over.action?'button':'div',el=document.createElement(tag);el.className='unity-node';el.dataset.sourcePath=row.path;el.dataset.sourceId=row.id;
   el.style.cssText=`left:${rect.x}px;top:${rect.y}px;width:${Math.max(0,rect.width)}px;height:${Math.max(0,rect.height)}px;transform-origin:${rect.pivot.x*100}% ${(1-rect.pivot.y)*100}%;transform:rotate(${rect.angle}rad) scale(${rect.scale.x},${rect.scale.y});`;
   // A hidden prefab child can be activated by a source-backed state switch.
   if(over.visible===false||(!row.active&&over.visible!==true))el.hidden=true;
   if(over.action){el.dataset.originalAction=over.action;el.setAttribute('aria-label',over.label||row.path.split('/').at(-1));el.type='button';}
   for(const c of row.components){
    if(c.m_Enabled===0)continue;
    if('m_Sprite' in c){const spr=sprites[String(c.m_Sprite.m_PathID)];
     if((spr||typeof over.image==='string'&&over.image)&&over.image!==false){const im=document.createElement('div');im.className='unity-image';const url=over.image||spr.file;
      if(c.m_Type===1&&Object.values(spr?.border||{}).some(Boolean)){const b=spr.border;im.style.cssText=`border-style:solid;border-width:${b.w}px ${b.z}px ${b.y}px ${b.x}px;border-image:url("${url}") ${b.w} ${b.z} ${b.y} ${b.x} fill stretch;`;}
      else {im.style.backgroundImage=`url("${url}")`;im.style.backgroundSize=c.m_Type===2?'auto':'100% 100%';}
      im.style.opacity=c.m_Color?.a??1;
      if(c.m_Type===3)im.style.clipPath=`inset(0 ${(1-(over.fill??c.m_FillAmount))*100}% 0 0)`;
      el.append(im);
     } else if(!spr&&c.m_Color?.a&&over.image!==false){const im=document.createElement('div');im.className='unity-image';im.style.background=color(c.m_Color);el.append(im);}
    }
    if('m_text' in c){const txt=document.createElement('span');txt.className='unity-text';txt.innerHTML=escape(over.text??c.m_text??'').replace(/&lt;br\s*\/?&gt;/gi,'<br>');const horizontal=c.m_HorizontalAlignment;txt.style.cssText=`font-size:${c.m_fontSize||c.m_FontSize||36}px;color:${color(over.color||c.m_fontColor||c.m_Color)};font-weight:${c.m_fontStyle&1?'bold':'normal'};justify-content:${horizontal===1?'flex-start':horizontal===4?'flex-end':'center'};text-align:${horizontal===1?'left':horizontal===4?'right':'center'};`;el.append(txt);}
   }
   if(over.content){const slot=document.createElement('div');slot.className='unity-slot';slot.innerHTML=over.content;el.append(slot);}
   if(over.className)el.classList.add(over.className);
   html.set(row.id,el);const parent=html.get(row.parentID);if(parent)parent.append(el);else roots.push(el);
  }
  const wrap=document.createElement('div');wrap.className='unity-prefab';wrap.dataset.prefab=layout.nodes[0].path;wrap.append(...roots);wrap.__unityRects=rects;
  for(const r of layout.nodes){const c=r.components.find(c=>'m_text'in c),parent=html.get(r.id),el=parent?.querySelector(':scope>.unity-text');if(c&&el){el.style.whiteSpace=c.fields?.m_enableWordWrapping===0?'pre':'pre-wrap';el.style.overflow=c.fields?.m_overflowMode===0?'visible':'hidden';const over=overrides.get(r.id)||{};root.OriginalFont?.draw(parent,c,over.text??c.m_text??'',rects.get(r.id),color(over.color||c.m_fontColor||c.m_Color));}}
  return wrap;
 }
 const api={resolve,solve,render,mul,point,stateOverrides};root.UnityRect=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
