/* Stateful child windows return to the same disciple detail. */
window.createDiscipleAdvancedUI=function(B){
 const A=DiscipleAdvanced,S=B.state,H=B.hero,esc=Cultivation.esc,btn=B.btn;
 let page=0,target=null,pending=null;
 const button=(a,t,extra='')=>btn('advanced-'+a,t,extra);
 const icon=g=>A.data.gemIcons[g?.iID]?`<img class="dp-soul-icon" src="${A.data.gemIcons[g.iID]}" alt="">`:'';
 const text=a=>{const rows=[];for(let i=0;i<(a||[]).length;i+=2){const name=COMBAT_EFFECTS_DATA.attributes[a[i]]||String(a[i]);rows.push(esc(name)+' +'+(A.data.percentAttrs.includes(a[i])?a[i+1]/100+'%':a[i+1]));}return rows.join(' · ');};
 const art=id=>Object.values(DISCIPLE_ADVANCED_LAYOUTS.sprites).find(x=>x.name===id)?.file;
 function show(title,body,source){B.show(title,`<section class="dp-advanced" style="--gem-card:url('${art('ui_bs_xqd')}')" data-original-window="${source}">${body}</section>`);}
 function rebirth(){try{A.rebirthCheck(S(),H());pending='rebirth';const cost=A.data.Misc.find(x=>x.nType===3204).szArray;B.confirm('弟子重生',`<section class="dp-advanced" data-original-window="UIRebirthConfirmMessageBox"><p>重新培养此弟子，保留原弟子；游历结束后比较并选择保留其中一位。</p><p>今日重生 ${H().rebirthDay===new Date().toLocaleDateString('en-CA')?H().rebirthCount||0:0}/5</p><p>重生丹 ${A.owned(S(),cost[0])}/${cost[1]}，招生时另消耗体力。</p></section>`,'advanced-rebirth-confirm');}catch(e){B.toast(e.message);}}
 function open(){if(A.collect(S()))B.save();page=H().gemPage||0;target=null;select();}
 function select(){show('选择魂石方案',`<p>${esc(H().name)} · ${['','金','木','水','火','土','雷','邪','体'][H().element]}系图腾</p>`+[0,1,2].map(n=>`<article class="dp-gem-plan"><b>方案 ${n+1} · 总魂力 ${A.pagePower(S(),H().element,n)}</b><div class="dp-gem-mini">${A.page(S(),H().element,n).map(uid=>{const g=A.gem(A.instance(S(),uid)?.id);return `<span>${icon(g)}${g?esc(g.szName):'空'}</span>`;}).join('')}</div>${button('gem-select:'+n,H().gemPage===n||!H().gemPage&&n===0?'已使用':'使用方案')}${button('gem-edit:'+n,'镶嵌魂石')}</article>`).join('')+button('close','返回弟子详情'),'UIDiscipleSelectGemPage');}
 function editor(){const open=A.slots(S(),H().element),p=A.page(S(),H().element,page),next=A.data.GemPower.find(x=>x.iID===(S().gemPowerLevel||0)+1);
 show('魂石图腾',`<div class="dp-tabs">${[0,1,2].map(n=>button('gem-edit:'+n,'方案 '+(n+1),`aria-pressed="${n===page}"`)).join('')}</div><p>总魂力 ${A.pagePower(S(),H().element,page)} · 点击位置选择替换，点击仓库魂石镶嵌</p><div class="dp-gem-slots">${p.map((uid,i)=>{const g=A.gem(A.instance(S(),uid)?.id);return button('gem-slot:'+i,` ${icon(g)}<b>${g?esc(g.szName):'空位'}</b><small>${!open[i]?(i<4?'28':'30')+'级解锁':g?text(g.arrAttr):'可镶嵌'}</small>`,`aria-pressed="${target===i}" ${open[i]?'':'disabled'}`);}).join('')}</div>${target!==null&&p[target]?button('gem-remove','卸下选中魂石'):''}<p>魂力阶段 ${S().gemPowerLevel||0} · 全系魂力 ${A.totalPower(S())}${next?'/'+next.iPower:''}</p>${button('gem-upgrade','提升阶段')}<div class="dp-gem-store">${(S().gems||[]).filter(g=>A.gem(g.id)?.iElement===H().element).map(g=>{const d=A.gem(g.id);return button('gem-info:'+g.uid,`${icon(d)}<b>${esc(d.szName)}</b><small>${text(d.arrAttr)}</small><small>${g.locked?'已锁定 · ':''}${p.includes(g.uid)?'已镶嵌':'魂力 '+d.iPower}</small>`);}).join('')||'<p>暂无该属性魂石</p>'}</div><div class="actions">${button('gem-fuse','一键合成')}${button('gem-pages','返回选择方案')}</div>`,'UIGem');
 }
 function info(uid){const g=A.instance(S(),uid),d=A.gem(g?.id);if(!d)return;show(d.szName,`${icon(d)}<p>魂力 ${d.iPower}</p><p>${Cultivation.rich(d.szDescribe)}</p>${button('gem-inlay:'+uid,'镶嵌')}${button('gem-lock:'+uid,g.locked?'解锁魂石':'锁定魂石')}${d.arrRefineCost?.length?button('gem-refine:'+uid,'洗炼'):''}${button('gem-edit:'+page,'返回图腾')}`,'UIGemInlay');}
 function refine(uid){const g=A.instance(S(),uid),d=A.gem(g?.id),next=A.gem(g?.refineId);show('魂石洗炼',`<p>当前：${Cultivation.rich(d.szDescribe)}</p><p>洗炼消耗 ${d.arrRefineCost[1]} ${A.data.Goods.find(x=>x.iGoodsID===d.arrRefineCost[0])?.szName||'洗炼材料'}（拥有 ${A.owned(S(),d.arrRefineCost[0])}）</p>${next?`<p>待替换：${Cultivation.rich(next.szDescribe)}</p>`:''}${button('gem-roll:'+uid,'洗炼')}${next?button('gem-replace:'+uid,'替换属性'):''}${button('gem-info:'+uid,'返回魂石')}`,'UIGemRefine');}
 function action(op,v){try{
  if(op==='close'){pending=null;B.close();return;}
  if(op==='rebirth-confirm'){if(pending!=='rebirth')return;if(A.rebirthCheck(S(),H())){pending='formation';B.confirm('重生将自动下阵','<p>该弟子已加入宗门防守编队，确认重生后将从所有编队下阵。</p>','advanced-rebirth-begin');return;}pending='formation';return action('rebirth-begin');}
  if(op==='rebirth-begin'){if(pending!=='formation')return;A.beginRebirth(S(),H());pending=null;B.save();B.beginRebirth(S().rebirth.index);return;}
  if(op==='gem-pages'){target=null;select();return;}
  if(op==='gem-select'){A.selectPage(S(),H(),+v);B.save();select();return;}
  if(op==='gem-edit'){page=+v;target=null;editor();return;}
  if(op==='gem-slot'){target=+v;editor();return;}
  if(op==='gem-info'){info(v);return;}
  if(op==='gem-inlay'){A.inlay(S(),H(),page,v,target);target=null;B.save();editor();return;}
  if(op==='gem-remove'){A.remove(S(),H(),page,target);target=null;B.save();editor();return;}
  if(op==='gem-refine'){refine(v);return;}if(op==='gem-roll'){pending='refine:'+v;B.confirm('确认洗炼','<p>消耗材料生成新属性；已有待替换属性将覆盖，确认替换前当前属性保持不变。</p>','advanced-gem-roll-confirm:'+v);return;}if(op==='gem-roll-confirm'){if(pending!=='refine:'+v)return;A.refine(S(),H(),v);pending=null;B.save();refine(v);return;}if(op==='gem-replace'){pending='replace:'+v;B.confirm('确认替换','<p>替换魂石属性，所有使用此魂石的方案同步生效。同名魂石将自动卸下。</p>','advanced-gem-replace-confirm:'+v);return;}if(op==='gem-replace-confirm'){if(pending!=='replace:'+v)return;A.replaceRefine(S(),H(),v);pending=null;B.save();refine(v);return;}
  if(op==='gem-lock'){const g=A.instance(S(),v);if(g)g.locked=!g.locked;B.save();info(v);return;}
  if(op==='gem-upgrade'){const next=A.data.GemPower.find(x=>x.iID===(S().gemPowerLevel||0)+1);if(!next)return B.toast('已满阶');pending='upgrade';B.confirm('提升魂力阶段',`<p>全系魂力 ${A.totalPower(S())}/${next.iPower}</p><p>消耗 ${next.arrUpgradeMats[1]} 灵石</p><p>${text(next.arrAttr)}</p>`,'advanced-gem-upgrade-confirm');return;}
  if(op==='gem-upgrade-confirm'){if(pending!=='upgrade')return;A.upgrade(S());pending=null;B.save();editor();return;}
  if(op==='gem-fuse'){const groups=A.fusionGroups(S(),H().element);pending='fusion';B.confirm('魂石合成',`<p>5枚同属性同品质魂石合成1枚更高品质魂石，锁定及已镶嵌的魂石不参与。</p><p>本次消耗 ${groups.length*5} 枚，获得 ${groups.length} 枚。</p>`,'advanced-gem-fuse-confirm');return;}
  if(op==='gem-fuse-confirm'){if(pending!=='fusion')return;const result=A.fuse(S(),H());pending=null;B.save();editor();B.toast('获得 '+result.join('、'));}
 }catch(e){B.toast(e.message);}}
 return {rebirth,open,action};
};
