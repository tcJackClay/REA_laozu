const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => {if(r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(`${r.status()} ${r.url()}`);});
    await page.goto('http://127.0.0.1:5180/');
    await page.waitForFunction(() => window.sourceHost?.stack.length === 1);
    const generatedBindings = await page.evaluate(() => JSON.parse(document.getElementById('bindings').value));
    assert.ok(Object.values(generatedBindings).some(b => b.action === 'UIBuyGridConfirm.OnBtn_ConfirmClicked'));
    await page.click('#analyze');
    await page.waitForFunction(() => !document.getElementById('analyze').disabled, null, {timeout:60000});
    assert.match(await page.locator('#analysis-status').textContent(), /complete/);
    const result = await page.evaluate(async () => {
      const h = window.sourceHost, original = h.stack[0].payload;
      const row = original.layout.nodes.find(n => n.components.some(c => 'm_text' in c));
      if (!row) throw Error('Source text not found');
      h.close();
      h.open(original, {bindings:{[row.path]:{text:{state:'amount'},action:'confirm'}},state:{amount:'12'}});
      const find = () => [...document.querySelectorAll('[data-source-path]')].find(e => e.dataset.sourcePath === row.path);
      const before = find().textContent;
      h.update({amount:'24'});
      const after = find().textContent;
      find().click();
      h.open(original); h.close();
      const restored = h.snapshot();
      const sourceQuery = await (await fetch('/api/query?q=UISelectEquip')).json();
      return {before,after,restored,queryCount:sourceQuery.windows.length};
    });
    assert.match(result.before,/12/);
    assert.match(result.after,/24/);
    assert.equal(result.restored.events[0].action,'confirm');
    assert.equal(result.restored.state.amount,'24');
    assert.equal(result.restored.stack.length,1);
    assert.ok(result.queryCount > 0);
    const grid = await page.evaluate(() => {
      const rect = {type:'RectTransform',m_SizeDelta:{x:100,y:100}};
      const layout = {nodes:[
        {id:'root',parentID:null,path:'/grid',active:true,components:[rect,
          {m_CellSize:{x:40,y:30},m_Spacing:{x:5,y:7},m_Constraint:1,m_ConstraintCount:2}]},
        ...[0,1,2].map(i=>({id:'c'+i,parentID:'root',path:'/grid/'+i,active:true,components:[rect]}))
      ]};
      const prepared = SourceWindow.prepare(layout,{}, {},{},200,200);
      const solved = UnityRect.solve(layout.nodes,200,200,prepared.overrides);
      return [0,1,2].map(i=>{const r=solved.get('c'+i);return [r.x,r.y,r.width,r.height];});
    });
    assert.deepEqual(grid,[[0,0,40,30],[45,0,40,30],[0,37,40,30]]);
    // Every exported window must render without a JS exception.
    const layouts = await page.evaluate(async () => (await fetch('/api/layouts')).json());
    for (const layout of layouts) {
      await page.evaluate(async name => {
        const payload = await (await fetch('/api/layout?name='+name)).json();
        sourceHost.close(); sourceHost.open(payload);
        if (!document.querySelector('.source-window')) throw Error('No window '+name);
      },layout.name);
    }
    await page.selectOption('#windows','uibuygridconfirm');
    await page.click('#apply');
    await page.waitForTimeout(300);
    fs.mkdirSync('work/rea-pipeline/verification',{recursive:true});
    await page.screenshot({path:'work/rea-pipeline/verification/lab.png'});
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({passed:true,renderedLayouts:layouts.length,checks:['query','text binding','button dispatch','stack restoration','all exported windows render'],errors}));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
