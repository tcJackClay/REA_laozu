const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='work/rea-pipeline/verification/home-combo-flow';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch(),checks=[],errors=[];const ck=(n,v)=>{assert.ok(v,n);checks.push(n);};try{
 const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/?view=sect');await page.waitForSelector('[data-original-action="home26:avatar"]');await page.locator('[data-original-action="home26:avatar"]').click();await page.locator('[data-original-action="home26:appearance-open"]').last().click();await page.locator('[data-original-action="home26:appearance-select:2"]').last().click();await page.locator('[data-original-action="home26:appearance-use"]').last().click();await page.locator('[data-original-action="home26:close"]').last().click();await page.keyboard.press('Escape');
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('laozu-web-v9'));s.sect=7;s.wanderCompleted=1;s.gold=1000000;s.goods={};for(const kind of ['seed','teacher']){const rows=kind==='seed'?CULTIVATION_DATA.seeds:TEACHER_DATA.teachers;s[kind+'UnlockedIds']=rows.map(x=>x.iID);s[kind+'Stars']=Object.fromEntries(rows.map(x=>[x.iID,0]));for(const x of rows){s.goods[x.arrCost1[0]]=10000;if(x.iOmniShard)s.goods[x.iOmniShard]=10000;}}localStorage.setItem('laozu-web-v9',JSON.stringify(s));});await page.reload();
 const act=async a=>{const nodes=page.locator(`[data-home26="${a}"],[data-original-action="home26:${a}"]`).filter({visible:true});await (a==='close'?nodes.last():nodes.first()).click();await page.waitForFunction(()=>!window.SourceWindowMotion?.text().some(x=>x.phase!=='idle'));};
 const runtime=()=>page.evaluate(()=>JSON.parse(render_game_to_text()).source.home);
 for(const kind of ['seed','teacher']){
  await act(kind);await act('combo');ck(kind+' uses original suit window',await page.locator(`[data-prefab="/${kind==='seed'?'UISeedlingSuit':'UITeacherSuit'}"]`).count()===1);
  ck(kind+' clones source group and member nodes',await page.locator('.home-native-combo [data-source-path$="/ListSuitItem"]').count()>2);
  if(kind==='seed')ck('source group elements have loaded images',await page.locator('.home-suit-elements img').evaluateAll(imgs=>imgs.length>0&&imgs.every(x=>x.complete&&x.naturalWidth>0)));
  ck(kind+' first and last member are inside horizontal viewport',await page.locator('.home-suit-members').first().evaluate(el=>{const a=el.getBoundingClientRect(),cards=[...el.children].map(x=>x.getBoundingClientRect());return cards[0].left>=a.left&&cards.at(-1).right<=a.right;}));
  const g=await page.evaluate(kind=>CollectionBonuses.groups(JSON.parse(localStorage.getItem('laozu-web-v9')),kind)[0],kind);
  await act(`combo-item:${g.ids[0]}:${g.id}`);await act(kind==='seed'?'skill':'recipe');await act('close');ck(kind+' secondary returns group context',(await runtime()).dialog.memberIds.length===g.ids.length);
  for(let i=1;i<=g.ids.length;i++){await act('neighbor:1');ck(kind+' cycles within group '+i,(await runtime()).dialog.id===g.ids[i%g.ids.length]);}
  await act('upgrade');ck(kind+' upgrade retains group context',(await runtime()).dialog.memberIds.length===g.ids.length);await act('close');
  await page.screenshot({path:out+'/'+kind+'-combo.png'});await act('back');
 }
 await act('teacher');await act('combo');const scroller=page.locator('.home-source-combos');await scroller.evaluate(el=>{el.scrollTop=860;el.dispatchEvent(new Event('scroll'));});
 const beforeScroll=await scroller.evaluate(el=>el.scrollTop);const second=page.locator('.home-native-combo').nth(1);await second.locator('[data-original-action*="combo-item"]').first().click();await act('recipe');await act('close');await act('upgrade');await act('close');ck('nested details and upgrade preserve combo scroll',Math.abs(await scroller.evaluate(el=>el.scrollTop)-beforeScroll)<2);await act('back');
 const transactions=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('laozu-web-v9'));const M=createHomeModel({state:()=>s,save:()=>{},stats:()=>({power:0})}),g=HOME_MANAGEMENT_DATA.TeacherGroup[0],id=g.arrTeacherSuit[0],x=TEACHER_DATA.teachers.find(x=>x.iID===id);s.teacherUnlockedIds=[...g.arrTeacherSuit];s.teacherStars=Object.fromEntries(g.arrTeacherSuit.map(x=>[x,18]));s.teacherStars[id]=17;s.goods[x.arrCost1[0]]=10000;s.gold=1000000;
  const before=CollectionBonuses.attributes(s)[2053];M.upgrade('teacher',id,false,17);const after=CollectionBonuses.attributes(s)[2053],saved=JSON.stringify(s);let stale=false;try{M.upgrade('teacher',id,false,17);}catch{stale=true;}
  const unchanged=saved===JSON.stringify(s);s.functionOpen={15:false};let locked=false;try{M.upgrade('teacher',id);}catch{locked=true;}
  return {before,after,stale,unchanged,locked};});
 ck('source all-members star threshold activates on actual upgrade',transactions.before===200&&transactions.after===600);ck('stale confirmation cannot pay again',transactions.stale&&transactions.unchanged);ck('transaction rechecks feature unlock',transactions.locked);
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('laozu-web-v9'));s.teacherUnlockedIds=[];localStorage.setItem('laozu-web-v9',JSON.stringify(s));});await page.reload();await act('teacher');await act('combo');
 const locked=page.locator('.home-suit-member').first();ck('locked teacher uses actual portrait mask',await locked.evaluate(el=>{const icon=el.querySelector('[data-source-path$="/Icon"]>.unity-image'),mask=el.querySelector('[data-source-path$="/Mask"]>.unity-image');return mask&&icon&&mask.style.backgroundImage===icon.style.backgroundImage&&getComputedStyle(mask).filter.includes('brightness(0)');}));
 ck('quality overlay is visible',await locked.locator('[data-source-path$="/frame01"]').isVisible());await page.screenshot({path:out+'/teacher-locked.png'});
 ck('no browser exceptions',errors.length===0);fs.writeFileSync(out+'/checks.json',JSON.stringify({checks,errors},null,2));console.log(checks.length+' combo flow checks passed');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
