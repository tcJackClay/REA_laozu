const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='work/rea-pipeline/verification/status-chains/browser';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch();const errors=[],checks=[];
 const ck=(name,value)=>{assert.ok(value,name);checks.push(name);};
 try{const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>fn.name==='loop'?0:raf(fn);});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const original=a=>page.locator(`[data-original-action="${a}"]`).first().click();
 const act=a=>page.locator(`[data-flow="${a}"]`).last().click();
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('laozu-web-v9')));
 await page.goto('http://127.0.0.1:5173/?view=wander');
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('laozu-web-v9'));CollectionOwnership.receive(s,22101);localStorage.setItem('laozu-web-v9',JSON.stringify(s));});await page.reload();await original('nav:wander');
 await original('admit:draw');await page.evaluate(()=>advanceTime(2400));await original('admit:random');await original('admit:accept');
 await page.locator('.seed-catalog [data-seed-id]').first().click();await original('seed:next');await page.locator('[data-teacher-id="22101"]').click();await original('teacher:confirm');


 let s,base=await read();base.gold=1000;base.crystal=100;base.run.pathId=1001;base.run.eventLibraryVersion=19;base.inventory=[{id:110101,uid:9801,x:2,y:1,rotation:0}];
 const load=async s=>{await Promise.all([page.waitForNavigation(),page.evaluate(s=>{localStorage.setItem('laozu-web-v9',JSON.stringify(s));location.reload();},s)]);await original('nav:wander');};
 const entry=async id=>{const s=structuredClone(base);Object.assign(s.run,{step:10,phase:'event',popup:{type:'story',text:'遇到机缘',title:'游历'},queue:[{type:'source-dispatch',sourceId:id}],reward:null,pending:null,sourceSteps:0,hp:1000,records:[],abilities:[]});await load(s);await act('next');};
 const readRuntime=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
 const drainStory=async()=>{for(let i=0;i<40&&(await read()).run.popup?.type==='story';i++)await act('next');};

 // Claim a formerly display-only ability through the actual event UI, then carry poison gear into battle.
 const claimed=structuredClone(base);Object.assign(claimed.run,{step:3,phase:'event',popup:{type:'ability',title:'神通',options:[4037],selectCount:1,canRefresh:false},queue:[],reward:null,pending:null,abilities:[],hp:1000});await load(claimed);await page.locator('[data-flow="ability"][data-value="4037"]').click();await page.evaluate(()=>advanceTime(600));
 s=await read();ck('event claim writes selected ability once',s.run.abilities.filter(x=>x===4037).length===1);await load(s);ck('claimed ability persists once',(await read()).run.abilities.filter(x=>x===4037).length===1);
 s=await read();s.inventory=[{id:140201,uid:9801,x:0,y:0,rotation:0},{id:140209,uid:9802,x:2,y:0,rotation:0}];s.run.config.teachers=[];s.disciples[s.selected].traitIds=[];Object.assign(s.run,{phase:'battle',popup:null,pending:null,queue:[],battleSnapshot:{elapsed:0,round:0,playerHp:500,playerMax:2000,playerAtk:100,playerDef:20,playerSpeed:30,enemySpeed:30,enemyHp:5000,enemyMax:5000,enemyAtk:10,cooldown:0,enemyCooldown:.4,playerInterval:.85,boss:false,visual:{player:null,enemy:null,effects:[]}}});await load(s);await page.evaluate(()=>advanceTime(1400));
 let b=(await read()).run.battleSnapshot;ck('source poison gear reaches battle status',b.statuses.enemy.poison.n>0);ck('claimed poison ability actually triggers',b.effectTrace.some(e=>e.kind==='ability-trigger'&&e.value===4037));ck('secondary skill actually damages',b.damageTrace.some(h=>h.secondary&&h.damage>0));await page.screenshot({path:out+'/claimed-ability-battle.png'});
 const before={hp:b.enemyHp,casts:b.equipmentState[9801].casts,round:b.round,trace:b.damageTrace.length};await load(await read());b=(await read()).run.battleSnapshot;ck('reload preserves hp status cooldown without replay',b.enemyHp===before.hp&&b.round===before.round&&b.damageTrace.length===before.trace&&b.equipmentState[9801].casts===before.casts);
 await page.evaluate(()=>advanceTime(60000));s=await read();ck('fight reaches source reward continuation',s.run.phase!=='battle'&&s.run.lastBattleReport.won&&s.run.lastBattleReport.effects.some(e=>e.value===4037));
 for(let n=0;n<20;n++){s=await read();if(s.run.phase==='node-done')break;if(s.run.pending){await page.evaluate(()=>advanceTime(2400));continue;}if(s.run.reward||s.run.popup?.type==='story'||!s.run.popup){await act('next');await page.evaluate(()=>advanceTime(2400));}else break;}
 ck('reward organization returns to event', (await read()).run.phase==='node-done');const step=(await read()).run.step;await act('next');ck('continue advances next node',(await read()).run.step>step);await page.screenshot({path:out+'/continued-event.png'});
 ck('no browser errors',errors.length===0);fs.writeFileSync(out+'/results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:true,count:checks.length,checks}));
 }catch(e){fs.writeFileSync(out+'/failure.json',JSON.stringify({checks,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
