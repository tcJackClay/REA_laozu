const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='work/rea-pipeline/verification/home-recipe-v52';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch(),checks=[],errors=[];const ck=(n,v)=>{assert.ok(v,n);checks.push(n);};try{
 const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto('http://127.0.0.1:5173/');await page.waitForSelector('[data-original-action="home26:avatar"]');
 await page.locator('[data-original-action="home26:rename"]').click();await page.locator('#home-name').fill('配方测试');await page.locator('[data-home26="rename-save"]').click();
 const fixture=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('laozu-web-v9')),g=HOME_MANAGEMENT_DATA.TeacherGroup[0],id=g.arrTeacherSuit[0],x=TEACHER_DATA.teachers.find(x=>x.iID===id),rec=TEACHER_DATA.recipes.find(r=>r.iFormID===x.arrComposeID[0]);s.sect=20;s.wanderCompleted=20;s.gold=100000;s.teacherUnlockedIds=[];s.teacherStars={};s.goods??={};s.goods[x.arrCost1[0]]=10000;localStorage.setItem('laozu-web-v9',JSON.stringify(s));return {id,fragment:x.arrCost1[0],cost:x.arrCost1[1],group:g.iID,recipe:[rec.iMaterial0,rec.iMaterial1,rec.arrProductID[0]]};});
 await page.reload();await page.waitForSelector('[data-original-action="home26:avatar"]');
 const act=async a=>{await page.locator(`[data-home26="${a}"],[data-original-action="home26:${a}"]`).filter({visible:true}).last().click();};
 const rt=()=>page.evaluate(()=>JSON.parse(render_game_to_text()).source.home),read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('laozu-web-v9')));
 await act('teacher');await act('combo');await act(`combo-item:${fixture.id}:${fixture.group}`);
 const original=await read();
 for(let i=1;i<=3;i++){
  const tile=page.locator(`[data-prefab="/UITeacherInfo"] [data-source-path$="/auto_Formula/equip${i}"]`);
  ck('locked source recipe tile '+i+' visible',await tile.isVisible());
  const result=await tile.evaluate((el,id)=>{const c=COMBAT_EFFECTS_DATA.equipment[id],im=el.querySelector('[data-source-path$="/Icon"] > .unity-image'),shape=el.querySelector('[data-source-path$="/shapeIcon"]');return {actual:(im.style.backgroundImage||im.style.borderImageSource),expected:STRATEGY_DETAIL_ICONS.icons[c.iIconEzID],icon:(im.style.backgroundImage||im.style.borderImageSource).includes(STRATEGY_DETAIL_ICONS.icons[c.iIconEzID]),shape:shape.hidden===!c.iIconShapeId,click:!!el.querySelector('[data-original-action],[data-home26]')||el.hasAttribute('data-original-action')};},fixture.recipe[i-1]);
  if(!result.icon)console.log(result);ck('source small icon '+i,result.icon);ck('source shape state '+i,result.shape);ck('source non-clickable recipe '+i,!result.click);
 }
 ck('old HTML formula removed',await page.locator('.home-native-formula').count()===0);
 await page.screenshot({path:out+'/locked.png'});
 await act('recipe');ck('red equipment source window opens',(await rt()).dialog.type==='recipe');
 for(let i=1;i<=3;i++)ck('red popup source tile '+i,await page.locator(`[data-prefab="/UIColoursEquipTip"] [data-source-path$="/auto_Formula/equip${i}"]`).isVisible());
 ck('read-only recipe does not charge or grant',JSON.stringify(original)===JSON.stringify(await read()));
 await page.screenshot({path:out+'/recipe.png'});await page.keyboard.press('Escape');ck('recipe returns to same group',(await rt()).dialog.memberIds.includes(fixture.id));
 await act('upgrade');const paid=await read();ck('real unlock consumes exact source fragments',paid.goods[fixture.fragment]===original.goods[fixture.fragment]-fixture.cost);
 const icon=page.locator('[data-prefab="/UITeacherInfo"] [data-source-path$="/auto_EquipRoot/Auto_Equip/Icon"] > .unity-image');ck('owned red artifact has source small icon',await icon.evaluate((el,id)=>(el.style.backgroundImage||el.style.borderImageSource).includes(STRATEGY_DETAIL_ICONS.icons[COMBAT_EFFECTS_DATA.equipment[id].iIconEzID]),fixture.recipe[2]));
 await page.screenshot({path:out+'/owned.png'});await act('close');ck('detail returns to combo list',(await rt()).dialog===null);await act('back');ck('list returns home',(await rt()).page==='home');
 await act('teacher');await act('item:24104');
 const extra=await page.locator('[data-source-path$="/auto_EquipRoot/Auto_Equip/PropAllIcons/weaponRoot"]').evaluate(el=>[...el.children].filter(n=>!n.hidden).map(n=>n.querySelector('.unity-image')?.style.backgroundImage));
 ck('Sun Wukong artifact adds source special weapon label',extra.length===2&&extra.every(Boolean));
 const mapping=await page.evaluate(()=>{const t=TEACHER_DATA.teachers.find(t=>t.iID===24104),c=COMBAT_EFFECTS_DATA.equipment[140104];return {base:c.arrWeaponForm,extra:t.arrEquipWeapon,match:t.arrEquip.includes(c.iID)};});
 ck('special label is conditional on source matching equipment',mapping.match&&mapping.base[0]===6&&mapping.extra.includes(10));
 await page.screenshot({path:out+'/special-label.png'});await page.keyboard.press('Escape');await act('back');
 ck('no browser or resource errors',errors.length===0);fs.writeFileSync(out+'/checks.json',JSON.stringify({checks,errors},null,2));console.log(checks.length+' native recipe checks passed');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
