// Run from repository root; optional Pet IDs filter the output manifest. Requires extracted Spine workspace.
const root=require('node:path').resolve(__dirname,'../..');process.chdir(root+'/work/spine-tools');require('node:fs').mkdirSync(root+'/outputs/laozu-web/assets/pet-motion-v43',{recursive:true});const spineRequire=require('node:module').createRequire(root+'/work/spine-tools/render-transmog-v25.cjs');
const fs=require('fs'),path=require('path');const S=spineRequire('@pixi-spine/runtime-3.8');const {loadImage}=require('C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
spineRequire('@pixi-spine/base').settings.yDown=false; // Unity uses Y-up; the Pixi runtime defaults to Y-down.

(async()=>{
 const manifest=[];const {chromium}=require('C:/Users/45186/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),browser=await chromium.launch({args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']}),page=await browser.newPage(),raster=require(root+'/tools/rea-pipeline/pet-webgl-raster.cjs');
 try{
 for(const spec of JSON.parse(fs.readFileSync('../alignment-v43/specs.json')).filter(s=>!process.argv[2]||process.argv.slice(2).map(Number).includes(s.petId))){
 if(spec.initialFlipX||spec.initialFlipY||spec.transformChain.some(t=>Object.values(t.m_LocalPosition).some(v=>v!==0)||Object.values(t.m_LocalScale).some(v=>v!==1)||t.m_LocalRotation.x||t.m_LocalRotation.y||t.m_LocalRotation.z||t.m_LocalRotation.w!==1))throw Error('Unapplied prefab transform '+spec.petId);
 const dir='../alignment-v43/regions',regions=JSON.parse(fs.readFileSync(dir+'/'+spec.map));
 function region(p){return {u:0,v:0,u2:1,v2:1,width:100,height:100,originalWidth:100,originalHeight:100,offsetX:0,offsetY:0,rotate:false,degrees:0,texture:{},...regions[p]};}
 const loader={newRegionAttachment:(s,n,p)=>{const a=new S.RegionAttachment(n);a.setRegion(region(p));return a;},newMeshAttachment:(s,n,p)=>{const a=new S.MeshAttachment(n);a.region=region(p);return a;},newBoundingBoxAttachment:(s,n)=>new S.BoundingBoxAttachment(n),newPathAttachment:(s,n)=>new S.PathAttachment(n),newPointAttachment:(s,n)=>new S.PointAttachment(n),newClippingAttachment:(s,n)=>new S.ClippingAttachment(n)};
 const data=new S.SkeletonBinary(loader).readSkeletonData(new Uint8Array(fs.readFileSync('../alignment-v43/text-assets/'+spec.mainFile)));
 {const B=spineRequire('@pixi-spine/base').BinaryInput;const raw=new Uint8Array(fs.readFileSync('../alignment-v43/text-assets/'+spec.mainFile));const main=new B(raw);main.readString();main.readString();for(let k=0;k<4;k++)main.readFloat();const ne=main.readBoolean();if(ne){main.readFloat();main.readString();main.readString();}const strings=[];for(let k=0,n=main.readInt(true);k<n;k++)strings.push(main.readString());const file=spec.dynamicFile;const dynamic=new B(new Uint8Array(fs.readFileSync('../alignment-v43/text-assets/'+file)),strings);const binary=new S.SkeletonBinary(loader);for(let k=0,n=dynamic.readInt(true);k<n;k++){const name=dynamic.readString();data.animations.push(binary.readAnimation(dynamic,name,data));}}
 for(const sk of data.skins)for(const e of sk.getAttachments())if(e.attachment instanceof S.RegionAttachment)e.attachment.updateOffset();
 let skin=data.defaultSkin||data.skins[0];
 const skeleton=new S.Skeleton(data);skeleton.setSkin(skin);skeleton.setSlotsToSetupPose();
 const images={};for(const e of skin.getAttachments()){const p=e.attachment.path;if(p&&regions[p]&&!images[p])images[p]=await loadImage(path.join(dir,regions[p].file));}
 console.log(spec.id,data.animations.length);
 if(!data.findAnimation('idle'))throw Error('Missing source idle '+spec.petId);const chosen=[['idle','idle']];
 function pose(name,time){skeleton.setToSetupPose();data.findAnimation(name).apply(skeleton,0,time,false,null,1,2,0);skeleton.updateWorldTransform();}
 function verts(slot,a){const v=new Float32Array(a instanceof S.MeshAttachment?a.worldVerticesLength:8);if(a instanceof S.MeshAttachment)a.computeWorldVertices(slot,0,v.length,v,0,2);else if(a instanceof S.RegionAttachment)a.computeWorldVertices(slot.bone,v,0,2);else return null;return v;}
 const absent=new Set(),width=320,height=420,frames=Math.min(512,Math.max(16,Math.ceil(data.findAnimation('idle').duration*24))),columns=Math.min(16,frames),rows=Math.ceil(frames/columns);
 function bounds(name){let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(let i=0;i<frames;i++){pose(name,data.findAnimation(name).duration*i/frames);for(const slot of skeleton.drawOrder){const a=slot.attachment;if(!a?.path||slot.color.a*(a.color?.a??1)<.001)continue;if(!images[a.path]){absent.add(a.path);continue;}const v=verts(slot,a);if(!v)continue;for(let q=0;q<v.length;q+=2){minX=Math.min(minX,v[q]);maxX=Math.max(maxX,v[q]);minY=Math.min(minY,v[q+1]);maxY=Math.max(maxY,v[q+1]);}}}
 return {minX,minY,maxX,maxY};}
 for(const [id,name] of chosen){
 const {minX,minY,maxX,maxY}=bounds(name),factor=Math.min(300/(maxX-minX),390/(maxY-minY));
 const duration=data.findAnimation(name).duration,draws=[],tx=160-(minX+maxX)/2*factor,ty=405+minY*factor;
 if(skin.getAttachments().some(e=>e.attachment instanceof S.ClippingAttachment))throw Error('Clipping must be implemented for '+spec.petId);
 for(let i=0;i<frames;i++){
  pose(name,duration*i/frames);const cx=i%columns*width,cy=Math.floor(i/columns)*height;
  for(const slot of skeleton.drawOrder){const a=slot.attachment,im=a&&images[a.path];if(!im)continue;const v=verts(slot,a);if(!v)continue;
   const vertices=Array.from(v,(p,k)=>k%2?ty-p*factor+cy:tx+p*factor+cx);
   draws.push({image:a.path,vertices,uv:Array.from(a instanceof S.MeshAttachment?a.regionUVs:[0,1,0,0,1,0,1,1]),triangles:Array.from(a instanceof S.MeshAttachment?a.triangles:[0,1,2,0,2,3]),color:['r','g','b','a'].map(k=>slot.color[k]*(a.color?.[k]??1)),blend:slot.data.blendMode});
  }
 }
 const imageData=Object.fromEntries(Object.keys(images).map(p=>[p,'data:image/png;base64,'+fs.readFileSync(path.join(dir,regions[p].file)).toString('base64')]));
 const result=await page.evaluate(raster,{width:width*columns,height:height*rows,images:imageData,draws});
 const file=spec.id+'-'+id+'-sheet.webp';fs.writeFileSync('../../outputs/laozu-web/assets/pet-motion-v43/'+file,Buffer.from(result.sheet,'base64'));fs.writeFileSync('../../outputs/laozu-web/assets/pet-motion-v43/'+spec.id+'-full.png',Buffer.from(result.single,'base64'));
 manifest.push({petId:spec.petId,creatureId:spec.creatureId,skeletonScale:spec.skeletonScale,canvasReferencePixelsPerUnit:100,contextScale:1.7,frameWidth:width,frameHeight:height,columns,rows,availableAnimations:data.animations.map(a=>a.name),character:spec.id,animation:name,file,frames,duration,factor,tx,ty,bounds:{minX,minY,maxX,maxY},missingPaths:[...absent],renderer:result.renderer});}

 global.gc?.();
 }
 const filtered=process.argv.length>2;fs.writeFileSync('../alignment-v43/'+(filtered?'manifest-selected.json':'manifest.json'),JSON.stringify(manifest,null,2));if(!filtered){if(manifest.length!==73)throw Error('Refusing incomplete pet motion publication');const exportData={pets:Object.fromEntries(manifest.map(m=>[m.petId,{...m,file:'assets/pet-motion-v43/'+m.file}]))};fs.writeFileSync('../../outputs/laozu-web/pet-motion-data.js','window.PET_MOTION_DATA='+JSON.stringify(exportData)+';\n');}
 }finally{await browser.close();}
})();
