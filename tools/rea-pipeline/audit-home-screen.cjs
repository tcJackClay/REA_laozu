const fs=require('fs');const {chromium}=require('C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

function writeInteractiveChecklist(result) {
  const lines = [
    '# 山门原始交互节点逐项表', '',
    '源范围：UIMain + UIMainNavs。隔离新档，390×844。可见指 DOM 布局可见，不保证未被遮挡或完全处于视口内。隐藏需另核对解锁、活动、折叠和平台条件。', '',
    '|序号|原始节点|原功能ID|当前可见|网页绑定|检查状态|',
    '|---|---|---|---|---|---|',
  ];
  result.rows.filter(r => r.interactive).forEach((r, i) => {
    const wrongTarget = /auto_(Seeding|Teacher)Btn$/.test(r.path) && r.action === 'nav:wish';
    const status = wrongTarget ? '已确认误连祈愿' : r.visible
      ? (r.action ? '已有绑定，仍需验证功能闭环' : '可见但无绑定')
      : (r.action ? '有绑定但隐藏，需核对显示条件' : '隐藏且无绑定，需核对显示条件');
    lines.push(`|I${String(i + 1).padStart(2, '0')}|\`${r.path}\`|${r.funcIDs.join(',') || '—'}|${r.visible ? '是' : '否'}|${r.action || '—'}|${status}|`);
  });
  fs.writeFileSync('tools/rea-pipeline/audits/home/interactive-checklist.md', lines.join('\n') + '\n');
}

(async()=>{const b=await chromium.launch();try{const p=await b.newPage({viewport:{width:390,height:844}});await p.goto('http://127.0.0.1:5173/?view=sect');await p.waitForTimeout(1200);fs.mkdirSync('tools/rea-pipeline/audits/home',{recursive:true});await p.screenshot({path:'tools/rea-pipeline/audits/home/current.png'});const result=await p.evaluate(()=>{let rows=[];for(const key of ['uimain','uimainnavs'])for(const n of ORIGINAL_LAYOUT_DATA.layouts[key].nodes){const el=[...document.querySelectorAll('[data-source-path]')].find(e=>e.dataset.sourcePath===n.path);const interactive=n.components.some(c=>c.fields&&('m_OnClick' in c.fields||'onValueChanged' in c.fields||'_funcIDs'in c.fields));rows.push({layout:key,path:n.path,sourceActive:n.active,interactive,funcIDs:n.components.flatMap(c=>c.fields?._funcIDs||[]),sprites:n.components.filter(c=>c.sprite).map(c=>c.sprite.name),rendered:!!el,visible:!!el&&el.checkVisibility()&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0,action:el?.dataset.originalAction||null,label:el?.getAttribute('aria-label')||null,rect:el?{x:Math.round(el.getBoundingClientRect().x),y:Math.round(el.getBoundingClientRect().y),width:Math.round(el.getBoundingClientRect().width),height:Math.round(el.getBoundingClientRect().height)}:null});}return {viewport:{width:innerWidth,height:innerHeight},text:document.body.innerText,rows};});fs.writeFileSync('tools/rea-pipeline/audits/home/inventory.json',JSON.stringify(result,null,2));const counts={nodes:result.rows.length,interactive:result.rows.filter(x=>x.interactive).length,visibleInteractive:result.rows.filter(x=>x.interactive&&x.visible).length,visibleUnbound:result.rows.filter(x=>x.interactive&&x.visible&&!x.action).length,hiddenInteractive:result.rows.filter(x=>x.interactive&&!x.visible).length};fs.writeFileSync('tools/rea-pipeline/audits/home/summary.json',JSON.stringify(counts,null,2));const q=x=>'\"'+String(x??'').replaceAll('\"','\"\"')+'\"';fs.writeFileSync('tools/rea-pipeline/audits/home/nodes.csv','\ufeff'+['layout,path,sourceActive,interactive,visible,action,label,funcIDs,sprites',...result.rows.map(r=>[r.layout,r.path,r.sourceActive,r.interactive,r.visible,r.action,r.label,r.funcIDs.join(';'),r.sprites.join(';')].map(q).join(','))].join('\n'));writeInteractiveChecklist(result);console.log(JSON.stringify(counts));}finally{await b.close()}})();
