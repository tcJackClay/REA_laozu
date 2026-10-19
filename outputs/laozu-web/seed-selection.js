window.createSeedSelection=function(B){
 const D=window.SEED_LAYOUT_DATA,L=D.layouts.uiselectseedling,C=window.Cultivation,U=window.UnityRect;let canvas=null,observer=null,filter=0,last=0,held=null,suppress=false,origin=null;
 const state=()=>B.state(),run=()=>state().run,stars=()=>state().seedStars||{},art=n=>Object.values(D.sprites).find(x=>x.name===n)?.file||'';
 function node(root,s){return [...root.querySelectorAll('[data-source-path]')].find(e=>e.dataset.sourcePath.endsWith(s));}
 function slot(root,s,html){const el=node(root,s);if(el)el.innerHTML=html;}
 function button(id,selected=false){const x=C.seed(id);if(!x)return '<span class="seed-empty">未携带</span>';const r=run(),tag=r.config.seed===id?'主修':r.config.sub===id?'辅修':'';return `<button class="seed-card q${x.iQuality}" data-seed-id="${id}" aria-label="${C.esc(x.szName)}" aria-pressed="${!!tag}"><img src="${x.icon}" alt="" draggable="false"><i class="seed-element el${x.iTechnique}">${' 金木水火土雷邪体'[x.iTechnique]}</i>${tag?`<strong>${tag}</strong>`:''}<span>${C.esc(x.szName)}</span></button>`;}
 function draw(){if(!canvas)return;const r=run(),p=state().admission?.profile||state().disciples[r.config.disciple],b=C.combined(r.config,stars()),sk=C.skill(r.config.seed,stars()[r.config.seed]||0),base=p.birthBase||[60,20,500,30],g=r.config.birthGains||[10,10,500,5],points=r.config.points;const value={atk:base[0]+points[0]*g[0]+b.atk,def:base[1]+points[1]*g[1]+b.def,hp:base[2]+points[2]*g[2]+b.hp,speed:base[3]+points[3]*g[3]+b.speed};
 const oldScroll=canvas.querySelector('.seed-catalog')?.scrollTop||0;canvas.replaceChildren();
 const root=U.render(L,D.sprites,{width:1080,height:1920,node:n=>{const path=n.path,leaf=path.split('/').at(-1);
 if(path.includes('/Auto_HeadItem/Effect')||path.includes('/Auto_HeadItem/Grade')||path.endsWith('/RoleProp')||path.includes('/Auto_Quality')||path.endsWith('/Auto_Ability')||path.endsWith('/Auto_Selector'))return {visible:false};
 if(path.endsWith('/Auto_Quick')||path.endsWith('/Auto_Confirm'))return {visible:false};
 if(leaf==='Auto_Next')return {action:'seed:next',label:'选择长老'};
 if(leaf==='Auto_Return')return {action:'seed:back',label:'返回入学档案'};
 if(leaf==='Auto_Strategy')return {action:'seed:help',label:'功法攻略'};
 if(leaf==='Auto_Handbook')return {action:'seed:book',label:'功法图鉴'};
 if(leaf==='Auto_PropInfo')return {action:'seed:stats',label:'属性说明'};
 if(leaf==='RoleBg')return {image:art('ui_xzgfpzq04')};
 if(leaf==='Auto_RoleName')return {text:p.name};
 if(leaf==='RoleGrade')return {text:p.realm||'炼气期'};
 if(leaf==='Auto_powerValue')return {text:p.sourcePower!=null?String(p.sourcePower):'—'};
 if(leaf==='auto_attack')return {text:String(value.atk)};if(leaf==='auto_hp')return {text:String(value.hp)};if(leaf==='auto_defense')return {text:String(value.def)};if(leaf==='auto_Speed')return {text:String(value.speed)};
 if(leaf==='auto_AddProp')return {text:r.config.seed||r.config.sub?`攻击+${b.atk}\n防御+${b.def}\n生命+${b.hp}\n速度+${b.speed}`:''};
 if(leaf==='auto_skillname')return {text:sk?.szName||'怒气技能'};
 return {};}});
 canvas.append(root);
 for(const el of root.querySelectorAll('.unity-text')){const row=L.nodes.find(n=>n.id===el.parentElement.dataset.sourceId),c=row?.components.find(c=>'m_text'in c),color=c?.m_fontColor||c?.m_Color;if(color)el.style.setProperty('color',`rgba(${Math.round(color.r*255)},${Math.round(color.g*255)},${Math.round(color.b*255)},${color.a})`,'important');}
 slot(root,'/RoleIcon','<div class="seed-portrait"></div>');
 node(root,'/Auto_Name')?.insertAdjacentHTML('beforeend','<span class="seed-quality">优</span>');
 slot(root,'/DisciplePropInfo/Image',`<div class="seed-traits">${C.traitHTML(p)}</div>`);
 slot(root,'/Auto_TeacherList','<div class="seed-teachers"><span class="seed-empty">未携带</span><span class="seed-empty">未携带</span></div>');
 slot(root,'/SeedlingHeadList',`<div class="seed-equipped"><div>${button(r.config.seed,true)}</div><div>${button(r.config.sub,true)}</div></div>`);
 slot(root,'/Auto_DesScroll',`<div class="seed-skill-description">${C.rich(sk?.szDesc)}</div>`);
 const list=window.CULTIVATION_DATA.seeds.filter(x=>x.icon&&(!Array.isArray(state().seedUnlockedIds)||state().seedUnlockedIds.includes(x.iID))&&(!filter||x.iTechnique===filter)).sort((a,b)=>b.iQuality-a.iQuality||(stars()[b.iID]||0)-(stars()[a.iID]||0)||a.iTechnique-b.iTechnique||b.iID-a.iID);
 slot(root,'/SeedlingList/Viewport',`<div class="seed-catalog">${list.map(x=>button(x.iID)).join('')}</div>`);
 canvas.insertAdjacentHTML('beforeend',`<div class="seed-filter">${['全部','金','木','水','火','土','雷','邪','体'].map((x,i)=>`<button data-seed-filter="${i}" class="el${i} ${filter===i?'selected':''}" aria-pressed="${filter===i}">${x}</button>`).join('')}</div>`);
 canvas.querySelector('.seed-catalog').scrollTop=oldScroll;
 }
 function select(id){const c=run().config;if(c.seed===id)c.seed=null;else if(c.sub===id)c.sub=null;else {if(!c.seed)c.seed=id;else if(!c.sub)c.sub=id;else if(last===c.seed)c.seed=id;else c.sub=id;last=id;}c.sourceSeedSelection=true;B.save();draw();}
 function detail(id){const x=C.seed(id),sk=C.skill(id,stars()[id]||0),v=C.bonus(id,stars()[id]||0);show(x.szName,`${x.szStory}\n${sk?.szDesc||''}\n攻击+${v.atk} 防御+${v.def} 生命+${v.hp}`);}
 function show(title,text){canvas.querySelector('.seed-modal')?.remove();const el=document.createElement('div');el.className='seed-modal';el.setAttribute('role','dialog');el.setAttribute('aria-label',title);el.innerHTML=`<section><h2>${C.esc(title)}</h2><div>${C.rich(text)}</div><button data-original-action="seed:close">知道了</button></section>`;canvas.append(el);}
 document.addEventListener('click',e=>{if(!canvas||!canvas.contains(e.target))return;if(suppress){suppress=false;if(e.target.closest('[data-seed-id]'))return;}const t=e.target.closest('[data-cultivation-trait]');if(t)return C.tip(t,canvas);canvas.querySelector('.cultivation-tooltip')?.remove();const f=e.target.closest('[data-seed-filter]');if(f){filter=+f.dataset.seedFilter;draw();return;}const card=e.target.closest('[data-seed-id]');if(card){select(+card.dataset.seedId);return;}const a=e.target.closest('[data-original-action]')?.dataset.originalAction;if(a==='seed:close')canvas.querySelector('.seed-modal')?.remove();if(a==='seed:back'){run().prepare='birth';run().popup={type:'birth'};state().admission.phase='birth';B.save();B.render();}if(a==='seed:next'){if(!run().config.seed)return show('请选择主修功法','主修功法为空，请先选择主修功法。');run().prepare='teacher';run().popup={type:'teacher'};B.save();B.render();}if(a==='seed:help')show('功法选择','点击功法依次装备主修、辅修；再次点击卸下。仅主修功法提供怒气技，长按查看功法效果。');if(a==='seed:book')show('功法图鉴',window.CULTIVATION_DATA.seeds.map(x=>x.szName).join('、'));if(a==='seed:stats')show('属性说明','显示本地弟子的基础属性、分配点数与所选功法星级加成。战力需原版弟子数据，尚未采集时显示 —。');});
 document.addEventListener('pointerdown',e=>{if(!canvas)return;const el=e.target.closest('[data-seed-id]');if(!el||!canvas.contains(el))return;origin={x:e.clientX,y:e.clientY};held=setTimeout(()=>{held=null;suppress=true;detail(+el.dataset.seedId);},500);});
 function cancel(){clearTimeout(held);held=null;origin=null;}
 document.addEventListener('pointerup',cancel);document.addEventListener('pointercancel',cancel);document.addEventListener('pointermove',e=>{if(origin&&Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>10)cancel();});
 return {mount(host){if(run()?.phase!=='prepare'||run()?.prepare!=='seed'){this.unmount();return false;}document.querySelector('#app').dataset.seedSelection='true';observer?.disconnect();host.innerHTML='<section class="seed-view" aria-label="选择功法"><div class="seed-stage"></div></section>';canvas=host.querySelector('.seed-stage');const resize=()=>{if(canvas)canvas.style.transform=`scale(${host.clientWidth/1080})`;};observer=new ResizeObserver(resize);observer.observe(host);draw();resize();return true;},unmount(){cancel();canvas=null;observer?.disconnect();document.querySelector('#app').dataset.seedSelection='false';}};
};
