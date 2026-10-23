const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='work/rea-pipeline/verification/antique-v51/battle';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch();const errors=[],checks=[];
 const ck=(name,value)=>{assert.ok(value,name);checks.push(name);};
 try{const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>fn.name==='loop'?0:raf(fn);});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const original=a=>page.locator(`[data-original-action="${a}"]`).first().click();
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
 await battleFixture(44301,{});const boosted=await read();boosted.sect=15;boosted.goods={1611:10000,1000:10000};await load(boosted);
 const upgrade=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('laozu-web-v9')),H=createHomeModel({state:()=>s,save:()=>{},stats:()=>({power:0})}),M=createAntiqueModel({state:()=>s,balance:H.balance,add:H.add,gate:H.gate,lockText:H.lockText,save:()=>localStorage.setItem('laozu-web-v9',JSON.stringify(s))});M.upgrade(1611,0);return {level:M.level(1611),attrs:CombatEffects.attributes(s)};});ck('paid antique unlock enters combat attributes',upgrade.level===1&&upgrade.attrs[2057]===200);
 await load(await read());await page.evaluate(()=>{Math.random=()=>.99;advanceTime(500)});const actual=(await read()).run.battleSnapshot;
 const p=plain.damageTrace.find(h=>h.kind==='pet'&&h.side==='player'),q=actual.damageTrace.find(h=>h.kind==='pet'&&h.side==='player');ck('same production attack and element',p&&q&&p.element===q.element&&p.base===q.base);ck('antique increases real pet damage',q.damage>p.damage);ck('neutral normal attack unchanged',plain.damageTrace.find(h=>h.kind==='normal'&&h.side==='player').damage===actual.damageTrace.find(h=>h.kind==='normal'&&h.side==='player').damage);ck('enemy hp falls by actual antique damage',actual.enemyHp<plain.enemyHp);await page.screenshot({path:out+'/antique-battle.png'});
 const graduate=async antique=>{const s=structuredClone(base);s.sect=15;s.antiqueV51={levels:antique?{1611:1}:{},progress:{}};s.run.abilities=[];Object.assign(s.run,{phase:'complete',settled:true,popup:{type:'end-detail'},queue:[],reward:null,pending:null});await load(s);await act('finish-run');return read();};
 const without=await graduate(false),withAntique=await graduate(true),h=withAntique.disciples[withAntique.selected];ck('actual graduation handler does not bake antique into base',JSON.stringify(h.journey.clanBaseStats)===JSON.stringify(without.disciples[without.selected].journey.clanBaseStats));
 const details=await page.evaluate(s=>{const h=s.disciples[s.selected],before=DiscipleAdvanced.detail(s,h),snapshot=JSON.stringify(h.journey.clanBaseStats);s.antiqueV51.levels[1611]=2;const after=DiscipleAdvanced.detail(s,h);s.antiqueV51.levels={};return {before,after,removed:DiscipleAdvanced.detail(s,h),baseUnchanged:snapshot===JSON.stringify(h.journey.clanBaseStats)};},withAntique);ck('later upgrade changes live attributes only once',details.after.atk-details.before.atk===20&&details.after.def-details.before.def===20&&details.after.hp-details.before.hp===1000);ck('removing antique restores live baseline',details.before.atk-details.removed.atk===20&&details.before.def-details.removed.def===20&&details.before.hp-details.removed.hp===1000&&details.baseUnchanged);
 ck('no browser/resource errors',errors.length===0);fs.writeFileSync(out+'/results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:true,count:checks.length,checks}));
 }catch(e){fs.writeFileSync(out+'/failure.json',JSON.stringify({checks,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
