const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='work/rea-pipeline/verification/wander-events';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch();const errors=[],checks=[];
 const ck=(name,value)=>{assert.ok(value,name);checks.push(name);};
 try{const page=await browser.newPage({viewport:{width:390,height:844}});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 const original=a=>page.locator(`[data-original-action="${a}"]`).click();
 const act=a=>page.locator(`[data-flow="${a}"]`).last().click();
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('laozu-web-v9')));
 await page.goto('http://127.0.0.1:5173/?view=wander');
 await original('admit:draw');await page.evaluate(()=>advanceTime(2400));await original('admit:random');await original('admit:accept');
 await page.locator('.seed-catalog [data-seed-id]').first().click();await original('seed:next');await page.locator('[data-teacher-id="22101"]').click();await original('teacher:confirm');

 let base=await read();base.gold=1000;base.crystal=100;base.inventory=[];base.run.pathId=1003;base.run.config.pet=null;base.pets=[];
 const load=async s=>{await page.evaluate(s=>localStorage.setItem('laozu-web-v9',JSON.stringify(s)),s);await page.reload();await original('nav:wander');};
 const node=async step=>{const s=structuredClone(base);Object.assign(s.run,{step,phase:'node-ready',popup:null,queue:[],reward:null,pending:null,hp:1000,records:[],abilities:[]});delete s.run.tools;await load(s);await act('next');};
 const nextStory=async()=>{for(let i=0;i<6&&(await read()).run.popup?.type==='story';i++)await act('next');};
 // Pet flow uses original stage 2. No fixture pet options are supplied.
 await node(1);await nextStory();let s=await read();ck('source pet event opens candidates',s.run.popup.type==='pet'&&s.run.popup.options.length===3);
 await act('pet-confirm');ck('pet requires selection',!(await read()).run.config.petUid);
 await page.locator('[data-flow=pet-info]').first().click();await act('cancel-confirm');ck('pet detail returns to same candidates',JSON.stringify((await read()).run.popup.options)===JSON.stringify(s.run.popup.options));
 await page.locator('[data-flow=pet]').first().click();s=await read();await load(s);ck('pet selection survives reload',(await read()).run.popup.selected===0);
 await page.screenshot({path:out+'/pet.png'});await act('pet-confirm');s=await read();ck('pet bound once and registered',s.pets.length===1&&s.disciples[s.selected].petUid===s.run.config.petUid&&s.run.phase==='node-done');
 await act('bag-info');ck('bag shows companion',await page.locator('.wd-pet').innerText().then(t=>t.includes(s.run.config.pet)));await act('cancel-confirm');await act('next');ck('pet continues next node',(await read()).run.step===2);
 // Ability refresh: source free count 1; item 216 and cap 2.
 await node(4);s=await read();s.goods={216:2};await load(s);const before=[...s.run.popup.options];
 await page.locator('[data-flow=ability-refresh]').nth(1).click();s=await read();ck('single slot refreshed using free quota',s.run.popup.options[0]===before[0]&&s.run.popup.options[1]!==before[1]&&s.run.popup.options[2]===before[2]&&s.goods[216]===2&&s.run.eventResources.abilityUsed===1);
 await page.locator('[data-flow=ability-refresh]').first().click();await act('cancel-confirm');ck('cancel consumes no token',(await read()).goods[216]===2);
 await page.locator('[data-flow=ability-refresh]').first().click();await act('ability-refresh-confirm');s=await read();ck('paid refresh consumes one token',s.goods[216]===1&&s.run.eventResources.itemUsed===1);
 await act('bag-info');await act('cancel-confirm');ck('bag restores ability options',JSON.stringify((await read()).run.popup.options)===JSON.stringify(s.run.popup.options));
 await page.screenshot({path:out+'/ability.png'});await page.locator('[data-flow=ability]').first().click();await page.evaluate(()=>advanceTime(600));s=await read();ck('ability commits once',s.run.abilities.length===1&&s.run.phase==='node-done');await page.evaluate(()=>advanceTime(1000));ck('no duplicate ability',(await read()).run.abilities.length===1);
 // Source choice chain: skip, sacrifice, rewards, then next.
 await node(11);s=await read();ck('original choice event loaded',s.run.popup?.sourceId===600010);await page.screenshot({path:out+'/choice.png'});
 await page.locator('[data-flow=source-choice][data-value="0"]').click();await nextStory();ck('skip keeps health and ends event',(await read()).run.hp===1000&&(await read()).run.phase==='node-done');
 await node(11);await page.locator('[data-flow=source-choice][data-value="1"]').click();await nextStory();s=await read();ck('sacrifice applies original 10 percent current health',s.run.hp===900&&s.run.reward&&s.run.reward.quality===3);await load(s);ck('reload does not charge health twice',(await read()).run.hp===900);await act('next');await page.evaluate(()=>advanceTime(1800));ck('choice reward completes same node',(await read()).run.phase==='node-done'&&(await read()).run.step===11);await act('next');ck('choice continues next node',(await read()).run.step===12);
 // Conditional option power gate from UIEventMessageBox, and multi-select ability callback.
 let fixture=structuredClone(base);Object.assign(fixture.run,{step:5,phase:'event',popup:{type:'source-choice',sourceId:310410,text:'修行考验'},queue:[],reward:null,pending:null});await load(fixture);ck('power-gated option disabled',await page.locator('[data-flow=source-choice][data-value="0"]').isDisabled());await page.locator('[data-flow=source-choice][data-value="1"]').click();ck('fallback option reaches source wheel',(await read()).run.popup.type==='wheel');await act('wheel');await act('popup-next');ck('wheel returns to event',(await read()).run.phase==='node-done');
 await node(4);fixture=await read();fixture.run.popup.selectCount=2;await load(fixture);await act('ability-confirm');ck('multi-select requires full count',(await read()).run.abilities.length===0);await page.locator('[data-flow=ability]').nth(0).click();await page.locator('[data-flow=ability]').nth(1).click();await act('ability-confirm');ck('multi-select grants exactly two',(await read()).run.abilities.length===2);
 // The original path has 31 nodes: do not terminate at old hardcoded day 20.
 await node(19);ck('route does not finish on day twenty',!(await read()).run.settled);await node(30);ck('route ends at source final node',(await read()).run.settled===true);
 // Shop stage is reachable through the original path 1003, day 9.
 await node(8);await nextStory();s=await read();ck('source shop reachable',s.run.reward.shop&&s.inventory.filter(i=>i.salePrice!=null).length===3);
 const ids=s.inventory.map(i=>i.uid);await act('leave');await act('next');ck('return preserves merchandise',JSON.stringify((await read()).inventory.map(i=>i.uid))===JSON.stringify(ids));
 const gold=s.gold;s.gold=0;await load(s);await act('shop-refresh');ck('insufficient gold does not refresh',(await read()).run.reward.refreshes===0);s.gold=gold;await load(s);await act('shop-refresh');s=await read();ck('shop refresh costs source 10',s.gold===gold-10&&s.run.reward.refreshes===1);
 // Actual drag into a valid bag location must open confirmation before deduction.
 const dragFirst=async()=>{const card=page.locator('#w-reward [data-flow-item]').first(),b=await card.boundingBox(),board=await page.locator('#board').boundingBox();const cell=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('laozu-web-v9'));const i=s.inventory.find(i=>i.salePrice!=null),d=GAME_DATA.items.find(d=>d.id===i.id);for(let y=0;y<6;y++)for(let x=0;x<7;x++)if(d.shape.every(([a,b])=>x+a<7&&y+b<6&&WanderTools.open(s,x+a,y+b)))return[x,y];});assert.ok(cell);await page.mouse.move(b.x+2,b.y+2);await page.mouse.down();await page.mouse.move(board.x+(cell[0]+.2)*board.width/7,board.y+(cell[1]+.2)*board.height/6,{steps:15});await page.mouse.up();};
 await dragFirst();ck('drag asks before charging',await page.locator('#wander-dialog').getAttribute('data-type')==='shop-buy'&&(await read()).gold===s.gold);await act('cancel-confirm');ck('cancel leaves item unowned',(await read()).inventory.every(i=>i.x===null));
 await dragFirst();await page.screenshot({path:out+'/shop-buy.png'});await act('shop-buy-confirm');s=await read();const kept=s.inventory.find(i=>i.x!==null);ck('purchase charges once and places',kept&&kept.salePrice==null&&s.gold<gold-10);await load(s);ck('purchase survives refresh',(await read()).inventory.find(i=>i.uid===kept.uid).x!==null);
 ck('source refresh count exhausted',await page.locator('[data-flow=shop-refresh]').isDisabled());ck('purchased item retained',(await read()).inventory.some(i=>i.uid===kept.uid));
 s=await read();s.gold=0;await load(s);const snapshot=JSON.stringify(s.inventory);ck('exhausted refresh cannot change stock',await page.locator('[data-flow=shop-refresh]').isDisabled()&&(await read()).run.reward.refreshes===1);
 await page.screenshot({path:out+'/shop.png'});await act('next');await page.evaluate(()=>advanceTime(1800));s=await read();ck('unsold goods discarded without reforge credit',s.run.phase==='node-done'&&s.inventory.length===1&&(s.run.tools?.reforge||0)===0);await act('next');ck('shop continues to next event',(await read()).run.step===9);
 ck('no browser/resource errors',errors.length===0);fs.writeFileSync(out+'/results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:true,count:checks.length,checks,errors}));
 }catch(e){fs.writeFileSync(out+'/failure.json',JSON.stringify({checks,errors,error:e.stack},null,2));throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
