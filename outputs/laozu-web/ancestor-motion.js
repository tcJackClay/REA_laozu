/* UIAncestorSkinPreview: original idle sheet, skeleton scale and canvas units,
 * with source SkinUIItemContext.scale .85 and its original origin retained. */
window.AncestorMotion=(()=>{
 const actors=new Map();let observer=null,media=null;
 function resolve(id){return window.ANCESTOR_MOTION_DATA?.actors[id]||null;}
 function geometry(id){const m=resolve(id);if(!m)return null;
  const scale=m.skeletonScale*m.canvasReferencePixelsPerUnit*m.contextScale/m.factor;
  return {width:m.frameWidth*scale,height:m.frameHeight*scale,x:-m.tx*scale,y:-m.ty*scale,scale};
 }
 function frameAt(id,ms){const m=resolve(id);return m?.duration>0?Math.floor(((ms%(m.duration*1000)+m.duration*1000)%(m.duration*1000))/(m.duration*1000)*m.frames):0;}
 function position(m,g,frame){return `${-(frame%m.columns)*g.width}px ${-Math.floor(frame/m.columns)*g.height}px`;}
 function animate(a){if(a.m.duration<=0)return null;return a.sprite.animate(a.keys,{duration:a.m.duration*1000,iterations:Infinity});}
 function motionChanged(){for(const a of actors.values()){a.animation?.cancel();a.animation=media.matches?null:animate(a);}}
 function prune(){for(const [host,a] of actors)if(!host.isConnected){a.animation?.cancel();actors.delete(host);}if(!actors.size&&observer){observer.disconnect();observer=null;media.removeEventListener('change',motionChanged);media=null;}}
 function mount(host,id,name='老祖'){
  const m=resolve(id),g=geometry(id);if(!host||!m)return null;
  actors.get(host)?.animation?.cancel();host.replaceChildren();
  const sprite=document.createElement('div');sprite.className='ancestor-native-motion';sprite.setAttribute('role','img');sprite.setAttribute('aria-label',name+' · 待机');sprite.dataset.ancestorView=id;sprite.dataset.creatureId=m.creatureId;sprite.dataset.animation=m.animation;
  Object.assign(sprite.style,{position:'absolute',pointerEvents:'none',left:`calc(50% + ${g.x}px)`,top:`calc(50% + ${g.y}px)`,width:g.width+'px',height:g.height+'px',backgroundImage:`url("${m.file}")`,backgroundRepeat:'no-repeat',backgroundSize:`${m.columns*g.width}px ${m.rows*g.height}px`,backgroundPosition:'0px 0px'});host.append(sprite);
  if(!media){media=window.matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',motionChanged);}
  const keys=Array.from({length:m.frames+1},(_,i)=>({offset:i/m.frames,backgroundPosition:position(m,g,i%m.frames),easing:'steps(1,end)'}));
  const actor={id:+id,m,g,sprite,keys,animation:null};actor.animation=media.matches?null:animate(actor);actors.set(host,actor);
  if(!observer){observer=new MutationObserver(prune);observer.observe(document.documentElement,{childList:true,subtree:true});}
  return actor;
 }
 function advance(ms){prune();for(const a of actors.values())if(a.animation)a.animation.currentTime=(a.animation.currentTime||0)+ms;}
 function snapshot(){prune();return [...actors.values()].map(a=>({id:a.id,time:a.animation?.currentTime||0}));}
 function restore(snapshot){prune();for(const a of actors.values()){const previous=snapshot.find(s=>s.id===a.id);if(previous&&a.animation)a.animation.currentTime=previous.time;}}
 function text(){prune();return [...actors.values()].map(a=>({ancestorView:a.id,creatureId:a.m.creatureId,animation:a.m.animation,frame:frameAt(a.id,a.animation?.currentTime||0),frames:a.m.frames,duration:a.m.duration,nativeScale:a.m.skeletonScale*a.m.canvasReferencePixelsPerUnit*a.m.contextScale}));}
 return {resolve,geometry,frameAt,mount,advance,snapshot,restore,text};
})();
