const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {create,KEY}=require('../../outputs/laozu-web/poke/model.js');
const box={};vm.runInNewContext(fs.readFileSync('outputs/laozu-web/poke/catalog.js','utf8'),box);const D=JSON.parse(JSON.stringify(box.POKE_CATALOG));
const out='work/poke-dark-verification';fs.mkdirSync(out,{recursive:true});
function pack(M){for(const item of [...M.s.run.pending]){let placed=false;for(let y=0;y<5&&!placed;y++)for(let x=0;x<5&&!placed;x++)if(M.fits(item,x,y)){M.place(item.uid,x,y);placed=true;}assert.ok(placed);}}
const completed=create(D,null,()=>0);completed.draw();completed.reveal();completed.startBattle();completed.tick(60000);pack(completed);completed.completeReward();completed.proceed();completed.tick(60000);pack(completed);completed.completeReward();completed.proceed();completed.settle();
(async()=>{const b=await chromium.launch(),checks=[],errors=[],styles={};const ck=(n,v)=>{assert.ok(v,n);checks.push(n)};try{
 const ctx=await b.newContext({viewport:{width:390,height:844}}),p=await ctx.newPage();
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await p.addInitScript(([key,s])=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));},[KEY,completed.s]);
 await p.goto(process.env.POKE_URL||'http://127.0.0.1:5175');await p.evaluate(()=>document.fonts.ready);
 const bg=selector=>p.locator(selector).first().evaluate(el=>getComputedStyle(el).backgroundColor);
 ck('dark source tokens',await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()==='#141826'));
 ck('source font loaded',await p.evaluate(()=>document.fonts.check('16px "Jersey 10"')&&document.fonts.check('16px "Jersey 15"')));
 ck('header source dark panel',await bg('.topbar')==='rgb(28, 32, 48)');ck('navigation source sunken',await bg('.bottom-nav')==='rgb(16, 19, 31)');
 ck('source ball texture',await p.evaluate(()=>getComputedStyle(document.body).getPropertyValue('--ball-pattern').includes('data:image/svg+xml')));
 for(const view of ['home','collection','research','gym','dex','wander']){
   await p.locator(`[data-action="nav:${view}"]`).last().click();await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`${out}/${view}.png`});
   const root=p.locator('main');styles[view]=await root.evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
   ck('light text '+view,styles[view].color==='rgb(238, 241, 248)');
   ck('source images only '+view,await p.locator('img').evaluateAll(els=>els.every(el=>new URL(el.src).pathname.startsWith('/poke/'))));
   if(view!=='home')ck('dark content '+view,['rgb(20, 24, 38)','rgb(16, 19, 31)'].includes(styles[view].background));
 }
 ck('pixel CTA source mask',await p.locator('[data-action="draw"]').evaluate(el=>getComputedStyle(el,'::after').clipPath.startsWith('polygon(')));
 ck('yellow source CTA',await p.locator('[data-action="draw"]').evaluate(el=>getComputedStyle(el).getPropertyValue('--bc').trim()==='#ffcb05'));
 const m=create(D,null,()=>0);m.draw();m.reveal();m.startBattle();m.tick(60000);
 await p.evaluate(([key,s])=>localStorage.setItem(key,JSON.stringify(s)),[KEY,m.s]);await p.reload();await p.locator('[data-action="nav:wander"]').last().click();
 ck('drops in backpack side shelves',await p.locator('.drop-shelf .item').count()===2);ck('dark backpack grid',await bg('.board')==='rgb(16, 21, 34)');ck('attribute-colored move card',await bg('.item.move')==='rgb(122, 199, 76)');
 ck('original grass color',await p.locator('.type-grass').first().evaluate(el=>getComputedStyle(el).getPropertyValue('--type').trim().toLowerCase()==='#7ac74c'));
 await p.screenshot({path:out+'/reward.png'});
 for(const size of [{width:320,height:568},{width:360,height:800},{width:450,height:800}]){await p.setViewportSize(size);await p.waitForTimeout(80);const bounds=await p.locator('.board').boundingBox(),nav=await p.locator('.bottom-nav').boundingBox();ck('dark reward fits '+size.width,bounds.x>=0&&bounds.y+bounds.height<=nav.y+1&&bounds.x+bounds.width<=size.width+1);await p.screenshot({path:out+'/reward-'+size.width+'.png'});}
 ck('no graphical svg generated in UI',await p.locator('#app svg').count()===0);ck('no console or image errors',errors.length===0);
 fs.writeFileSync(out+'/checks.json',JSON.stringify({checks,errors,styles,fixture:'Completed local model run for collection/gym; reward fixture for geometry. Not original-site runtime evidence.'},null,2));console.log(JSON.stringify({passed:checks.length,errors}));await ctx.close();
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
