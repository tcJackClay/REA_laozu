const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');global.window=global;
for(const name of ['pet-preview-data','pet-motion-data','pet-motion'])vm.runInThisContext(fs.readFileSync('outputs/laozu-web/'+name+'.js','utf8'));
const specs=JSON.parse(fs.readFileSync('work/alignment-v43/specs.json')),checks=[],ck=(n,v)=>{assert.ok(v,n);checks.push(n);};
ck('all original73 pets exported',Object.keys(PET_MOTION_DATA.pets).length===73&&Object.keys(PET_PREVIEW_DATA.pets).length===73);
for(const pet of Object.values(PET_PREVIEW_DATA.pets)){
 const id=pet.iID,m=PetMotion.resolve(id),s=specs.find(s=>s.petId===id),g=PetMotion.geometry(id),native=m.skeletonScale*100*1.7;
 ck(id+' exact creature reference',m.creatureId===pet.iCreatureID&&s.creatureId===pet.iCreatureID);
 ck(id+' real idle not combat pose',m.animation==='idle'&&m.availableAnimations.includes('idle')&&m.renderer==='webgl-indexed-mesh');
 ck(id+' source timing and complete grid',m.frames===Math.ceil(m.duration*24)&&m.columns*m.rows>=m.frames&&m.rows===Math.ceil(m.frames/m.columns));
 ck(id+' sheet exists and no missing paths',fs.statSync('outputs/laozu-web/'+m.file).size>0&&m.missingPaths.length===0);
 ck(id+' local skeleton asset reference recorded',s.skeletonDataRef.m_FileID==='0'&&s.graphicPathID&&s.mainSource.bundle===s.dynamicSource.bundle&&s.dynamicSource.bundle===s.atlasSource.bundle);
 ck(id+' native pivot inverse preserves source origin',Math.abs(g.x+m.tx*g.scale)<1e-8&&Math.abs(g.y+m.ty*g.scale)<1e-8&&Math.abs(g.scale*m.factor-native)<1e-8);
 ck(id+' source bounds fit without clipping',(m.bounds.maxX-m.bounds.minX)*m.factor<=300.001&&(m.bounds.maxY-m.bounds.minY)*m.factor<=390.001);
 ck(id+' idle loops at actual source duration',PetMotion.frameAt(id,0)===0&&PetMotion.frameAt(id,m.duration*1000)===0&&PetMotion.frameAt(id,m.duration*500)===Math.floor(m.frames/2));
}
ck('unknown motion is not invented',PetMotion.resolve(-1)===null&&PetMotion.geometry(-1)===null);
const out='work/rea-pipeline/verification/pet-motion-v43';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/model.json',JSON.stringify({checks},null,2));console.log(checks.length+' pet motion checks passed');
