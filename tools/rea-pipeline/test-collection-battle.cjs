const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='work/rea-pipeline/verification/home-v27/collection-battle';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch();const errors=[],checks=[];
 const ck=(name,value)=>{assert.ok(value,name);checks.push(name);};
 try{const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>fn.name==='loop'?0:raf(fn);});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const original=a=>page.locator(`[data-original-action="${a}"]`).click();
 const act=a=>page.locator(`[data-flow="${a}"]`).last().click();
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('laozu-web-v9')));
 await page.goto('http://127.0.0.1:5173/?view=wander');
 await page.waitForFunction(()=>localStorage.getItem('laozu-web-v9'));await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('laozu-web-v9'));CollectionOwnership.receive(s,22101);localStorage.setItem('laozu-web-v9',JSON.stringify(s));});await page.goto('http://127.0.0.1:5173/?view=wander');
 await original('admit:draw');await page.evaluate(()=>advanceTime(2400));await original('admit:random');await original('admit:accept');
 await page.locator('.seed-catalog [data-seed-id]').first().click();await original('seed:next');await page.locator('[data-teacher-id="22101"]').click();await original('teacher:confirm');


 let s,base=await read();// Isolate pet/event effects from account-wide collection passives.
 base.seedUnlockedIds=[];base.teacherUnlockedIds=[];base.gold=1000;base.crystal=100;base.run.pathId=1001;base.run.eventLibraryVersion=19;base.inventory=[{id:110101,uid:9801,x:2,y:1,rotation:0}];
 const load=async s=>{await Promise.all([page.waitForNavigation(),page.evaluate(s=>{localStorage.setItem('laozu-web-v9',JSON.stringify(s));location.reload();},s)]);await original('nav:wander');};
 const entry=async id=>{const s=structuredClone(base);Object.assign(s.run,{step:10,phase:'event',popup:{type:'story',text:'遇到机缘',title:'游历'},queue:[{type:'source-dispatch',sourceId:id}],reward:null,pending:null,sourceSteps:0,hp:1000,records:[],abilities:[]});await load(s);await act('next');};
 const readRuntime=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
 const drainStory=async()=>{for(let i=0;i<40&&(await read()).run.popup?.type==='story';i++)await act('next');};

 // Source rewards followed by a real fight; all fixtures stay in this independent browser context.
 await entry(99901);await drainStory();s=await read();ck('original attribute reward applied',Object.keys(s.run.eventBonuses||{}).length>0);const once=JSON.stringify(s.run.eventBonuses);await load(s);ck('source reward not repeated by reload',JSON.stringify((await read()).run.eventBonuses)===once);
 const battleFixture=async(pet,attrs={},extra={})=>{const s=structuredClone(base);s.disciples[s.selected].traitIds=[];s.inventory=[{id:110401,uid:9801,x:2,y:1,rotation:0}];s.run.config.teachers=[];s.run.abilities=[];s.run.config.petId=pet;s.run.config.petUid=9999;s.pets=[{id:pet,uid:9999,level:1}];Object.assign(s.run,{phase:'battle',popup:null,queue:[],reward:null,pending:null,eventBonuses:attrs,battleSnapshot:{elapsed:0,round:0,playerHp:500,playerMax:2000,playerAtk:100,playerDef:20,enemyHp:100000,enemyMax:100000,enemyAtk:100,enemyDef:0,cooldown:0,enemyCooldown:.4,playerInterval:.85,boss:false,visual:{player:null,enemy:null,effects:[]},...extra}});await load(s);await page.evaluate(()=>{Math.random=()=>.01;});};
 await battleFixture(44301,{});await page.evaluate(()=>{Math.random=()=>.99;advanceTime(500)});const plain=(await read()).run.battleSnapshot;
 await battleFixture(44301,{});const boosted=await read();const g=await page.evaluate(()=>HOME_MANAGEMENT_DATA.TeacherGroup.find(g=>g.arrTeacherSuitAttr[1]===2057));boosted.teacherUnlockedIds=g.arrTeacherSuit;boosted.teacherStars=Object.fromEntries(g.arrTeacherSuit.map(id=>[id,18]));boosted.teacherStars[g.arrTeacherSuit[0]]=17;boosted.sect=7;boosted.gold=1000000;
 await load(boosted);const upgrade=await page.evaluate(id=>{const s=JSON.parse(localStorage.getItem('laozu-web-v9')),x=TEACHER_DATA.teachers.find(x=>x.iID===id);s.goods??={};s.goods[x.arrCost1[0]]=10000;const M=createHomeModel({state:()=>s,save:()=>localStorage.setItem('laozu-web-v9',JSON.stringify(s)),stats:()=>({power:0})});const before=CollectionBonuses.attributes(s)[2057]||0;M.upgrade('teacher',id,false,17);return {before,after:CollectionBonuses.attributes(s)[2057]||0};},g.arrTeacherSuit[0]);ck('paid upgrade activates next source collection tier',upgrade.after>upgrade.before);await load(await read());await page.evaluate(()=>{Math.random=()=>.99;advanceTime(500)});const actual=(await read()).run.battleSnapshot;
 const p=plain.damageTrace.find(h=>h.kind==='pet'&&h.side==='player'),q=actual.damageTrace.find(h=>h.kind==='pet'&&h.side==='player');ck('same production attack and element',p&&q&&p.element===q.element&&p.base===q.base);ck('collection increases real loop damage',q.damage>p.damage);ck('neutral normal attack stays unchanged',plain.damageTrace.find(h=>h.kind==='normal'&&h.side==='player').damage===actual.damageTrace.find(h=>h.kind==='normal'&&h.side==='player').damage);ck('real enemy hp decreased further',actual.enemyHp<plain.enemyHp);const rt=await readRuntime();ck('battle exposes active collection source tiers',rt.battle.collectionBonuses.some(x=>x.id===g.iID&&x.kind==='teacher'));await page.screenshot({path:out+'/collection-battle.png'});
 ck('no browser/resource errors',errors.length===0);fs.writeFileSync(out+'/results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:true,count:checks.length,checks}));
 }catch(e){fs.writeFileSync(out+'/failure.json',JSON.stringify({checks,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
