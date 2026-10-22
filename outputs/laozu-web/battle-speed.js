/* Source index+1 is persisted; effective battle time is not the displayed label. */
window.createBattleSpeed=function(B){
 const D=BATTLE_SPEED_DATA,normal=D.misc.find(r=>r.nType===2207).szFloatArray;
 const has=()=>window.MonthCardRules?.has(B.state(),1)??B.state().entitlements?.[1]===true;
 const saved=()=>B.state().battleSpeedV60?.value;
 const selected=()=>Number.isInteger(saved())&&saved()>0&&saved()<=normal.length?saved()-1:window.MonthCardRules?.owned(B.state(),1)?2:1;
 function info(inBattle=false,quick=false){const max=normal.length-(has()?0:1),index=inBattle?Math.min(selected(),max-1):selected(),base=inBattle?normal[index]:1;return {index,label:index+1,max,base,scale:base*(quick?D.quickWanderScale:1),quick:!!quick,persisted:saved()||0};}
 function store(index){B.state().battleSpeedV60={value:index+1};B.save();}
 function sync(){const p=info(true);if(p.index!==selected())store(p.index);return p;}
 function cycle(){if(!B.active())return false;const p=sync();if(p.index===1&&p.max===2)B.toast('月卡解锁3倍速');store((p.index+1)%p.max);return true;}
 return {info,sync,cycle};
};
window.BattleSpeedButton=(()=>{
 const L=()=>BATTLE_SPEED_LAYOUTS,path='/UIBattleStoryWin/Bottom/auto_battlState/auto_changeTimeScale';
 function size(wrap){const scale=wrap.parentElement.clientWidth/1080;wrap.style.setProperty('--battle-control-scale',scale);wrap.style.width=113*scale+'px';wrap.style.height=112*scale+'px';}
 window.addEventListener('resize',()=>{const wrap=document.querySelector('.battle-speed-native');if(wrap)size(wrap);});
 function render(host,p,onClick){let wrap=host.querySelector('.battle-speed-native');if(!wrap){wrap=document.createElement('div');wrap.className='battle-speed-native';host.append(wrap);}if(wrap.dataset.index===String(p.index))return;wrap.dataset.index=p.index;size(wrap);
  const source=L().layouts.uibattlestorywin.nodes,nodes=source.filter(n=>n.path===path||n.path.startsWith(path+'/')).map(n=>n.path===path?{...n,parentID:null}:n);
  const root=UnityRect.render({nodes},L().sprites,{width:113,height:112,states:new Map([[nodes.at(-1).components.find(c=>c.sourceScriptName==='UISpriteSwitcher').pathID,p.index]]),node:n=>n.path===path?{action:'battle:cycle-speed',label:'战斗速度 '+p.label+' 倍，点击切换',rect:{m_AnchorMin:{x:0,y:1},m_AnchorMax:{x:0,y:1},m_AnchoredPosition:{x:0,y:0},m_Pivot:{x:0,y:1}}}:{}});
  const button=root.querySelector('[data-original-action="battle:cycle-speed"]');button.addEventListener('click',onClick);wrap.replaceChildren(root);root.style.transform='scale(var(--battle-control-scale))';root.style.transformOrigin='top left';
 }
 return {render};
})();
