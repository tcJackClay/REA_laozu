const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='work/rea-pipeline/verification/library-browser';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch();const errors=[],checks=[];
 const ck=(name,value)=>{assert.ok(value,name);checks.push(name);};
 try{const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>fn.name==='loop'?0:raf(fn);});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const original=a=>page.locator(`[data-original-action="${a}"]`).click();
 const act=a=>page.locator(`[data-flow="${a}"]`).last().click();
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('laozu-web-v9')));
 await page.goto('http://127.0.0.1:5173/?view=wander');
 await original('admit:draw');await page.evaluate(()=>advanceTime(2400));await original('admit:random');await original('admit:accept');
 await page.locator('.seed-catalog [data-seed-id]').first().click();await original('seed:next');await page.locator('[data-teacher-id="22101"]').click();await original('teacher:confirm');


 let s,base=await read();base.gold=1000;base.crystal=100;base.run.pathId=1001;base.run.eventLibraryVersion=19;base.inventory=[{id:110101,uid:9801,x:2,y:1,rotation:0}];
 const load=async s=>{await Promise.all([page.waitForNavigation(),page.evaluate(s=>{localStorage.setItem('laozu-web-v9',JSON.stringify(s));location.reload();},s)]);await original('nav:wander');};
 const entry=async id=>{const s=structuredClone(base);Object.assign(s.run,{step:10,phase:'event',popup:{type:'story',text:'遇到机缘',title:'游历'},queue:[{type:'source-dispatch',sourceId:id}],reward:null,pending:null,sourceSteps:0,hp:1000,records:[],abilities:[]});await load(s);await act('next');};
 const readRuntime=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
 const drainStory=async()=>{for(let i=0;i<40&&(await read()).run.popup?.type==='story';i++)await act('next');};
 await entry(202001);ck('dig event opens',await page.locator('#wander-dialog').getAttribute('data-type')==='source-dig');const before=await read();await page.locator('[data-flow=source-dig]').first().click();s=await read();ck('dig charges once',s.gold===before.gold-5);await load(s);ck('dig charge stable on reload',(await read()).gold===before.gold-5);
 for(let i=0;i<8;i++){s=await read();if(s.run.popup?.type==='source-dig')break;if(s.run.reward){await act('next');await page.evaluate(()=>advanceTime(2000));}else if(s.run.popup?.type==='story')await act('next');else break;}
 ck('dig resumes with tile marked',(await read()).run.popup.opened.includes(0));await page.screenshot({path:out+'/dig.png'});await act('source-finish');ck('dig closes to event',(await read()).run.phase==='node-done');
 await entry(201010);await act('source-alchemy-start');await page.evaluate(()=>advanceTime(600));await act('source-alchemy-stop');s=await read();ck('alchemy scores a completed round',s.run.popup.round===1&&!s.run.popup.running);await load(s);ck('alchemy round restored',(await read()).run.popup.round===1);await page.screenshot({path:out+'/alchemy.png'});await act('source-finish');ck('alchemy exits with reward',(await read()).run.phase==='node-done');
 await entry(999996);const old=(await read()).inventory[0].id;await page.locator('[data-flow=source-upgrade]').first().click();ck('upgrade changes equipped instance',(await read()).inventory[0].id!==old&&(await read()).inventory[0].uid===9801&&(await read()).gold===980);
 await entry(999995);await act('source-slots');ck('slots pays exactly once',(await read()).gold===990);for(let i=0;i<8;i++){s=await read();if(s.run.popup?.type==='source-slots')break;if(s.run.reward){await act('next');await page.evaluate(()=>advanceTime(2000));}else if(s.run.popup?.type==='story')await act('next');}ck('slots returns to remaining spins',(await read()).run.popup.spins===1);await act('source-finish');
 await entry(900010);s=await read();const picked=JSON.stringify(s.run.queue);await load(s);ck('probability branch preserved',JSON.stringify((await read()).run.queue)===picked);ck('probability source logged',s.run.sourceSteps>=1);

 await entry(100031);await drainStory();ck('source battle starts',(await read()).run.phase==='battle');await page.evaluate(()=>advanceTime(60000));s=await read();ck('victory preserves source continuation',s.run.queue.some(t=>t.sourceId===100032));
 await entry(400011);await drainStory();ck('source death reaches defeat settlement',(await read()).run.phase==='defeat'&&(await read()).run.settled);
 // Direct encounter snapshots test actual game tick, not just the independent pet model.
 const fight=async petId=>{const s=structuredClone(base);s.inventory=[];s.pets=[{id:petId,uid:9999,level:1}];Object.assign(s.run.config,{petId,petUid:9999});Object.assign(s.run,{step:3,phase:'battle-ready',popup:null,queue:[],reward:null,pending:null,hp:1000});await load(s);await act('next');await drainStory();return await readRuntime();};
 await fight(42303);await page.evaluate(()=>advanceTime(350));let rt=await readRuntime();ck('pet creates real combat shield',rt.battle?.petTrace.some(x=>x.kind==='shield'));await page.screenshot({path:out+'/pet-shield.png'});let saved=await read();const casts=saved.run.battleSnapshot.petCasts;await load(saved);rt=await readRuntime();ck('battle pet snapshot restored',rt.battle.petTrace.length>0);await page.evaluate(()=>advanceTime(50));ck('restore does not recast round',(await read()).run.battleSnapshot.petCasts===casts);
 await fight(42202);await page.evaluate(()=>advanceTime(350));rt=await readRuntime();s=await read();ck('pet heals player in actual battle',(rt.battle?.petTrace||s.run.lastBattleReport?.pet)?.some(x=>x.kind==='heal'&&x.value>0));
 await fight(42101);await page.evaluate(()=>advanceTime(1500));s=await read();rt=await readRuntime();const trace=s.run.lastBattleReport?.pet||rt.battle?.petTrace;ck('pet attack changes enemy health',trace?.some(x=>x.kind==='damage'&&x.value>0));

 // Full path through normal UI decisions, with a durable combat fixture to focus on flow continuity.
 const whole=structuredClone(base);Object.assign(whole.run,{step:0,phase:'node-ready',popup:null,queue:[],reward:null,pending:null,hp:100000,eventBonuses:{2003:100000,2001:1000}});await load(whole);const visited=new Set();let finished=false;
 for(let n=0;n<500;n++){
  s=await read();const r=s.run;if(!r){finished=true;break;}const p=r.popup;visited.add(p?.type||r.phase);
  if(r.pending){await page.evaluate(()=>advanceTime(2500));continue;}
  if(r.reward){await act('next');await page.evaluate(()=>advanceTime(2200));continue;}
  if(r.phase==='battle'){await page.evaluate(()=>advanceTime(60000));continue;}
  if(!p||p.type==='story'){await act('next');continue;}
  if(p.type==='ability'){if((p.selectCount||1)>1){for(let i=0;i<p.selectCount;i++)await page.locator('[data-flow=ability]').nth(i).click();await act('ability-confirm');}else await page.locator('[data-flow=ability]').first().click();await page.evaluate(()=>advanceTime(600));continue;}
  if(p.type==='pet'){await page.locator('[data-flow=pet]').first().click();await act('pet-confirm');continue;}
  if(p.type==='source-choice'){await page.locator('[data-flow=source-choice]:not([disabled])').first().click();continue;}
  if(p.type==='source-judge'){await act('source-judge');continue;}
  if(p.type==='source-wheel'){await act(p.rolled?'source-finish':'source-wheel');continue;}
  if(p.type.startsWith('source-')){await act('source-finish');continue;}
  if(p.type==='godexam'){await act('godexam');await page.evaluate(()=>advanceTime(2000));continue;}
  if(p.type==='godexam-running'||p.type==='attribute'){await page.evaluate(()=>advanceTime(4000));continue;}
  if(p.type==='wheel'){await act(p.rolled?'popup-next':'wheel');continue;}
  if(p.type==='result'){await page.screenshot({path:out+'/full-route-result.png'});await act('finish-result');continue;}
  if(p.type==='end-detail'){await act('finish-run');continue;}
  throw Error('Unplayable state '+JSON.stringify(p));
 }
 ck('complete route reaches settlement and exits',finished);ck('full route completes without defeat',(await read()).cleared>base.cleared);fs.writeFileSync(out+'/visited.json',JSON.stringify([...visited],null,2));
 ck('no browser/resource errors',errors.length===0);fs.writeFileSync(out+'/results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:true,count:checks.length,checks}));
 }catch(e){fs.writeFileSync(out+'/failure.json',JSON.stringify({checks,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
