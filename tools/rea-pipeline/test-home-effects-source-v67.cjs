const fs=require('fs'),vm=require('vm'),z=require('zlib'),assert=require('assert/strict');
const dir='outputs/laozu-web/',d=JSON.parse(z.gunzipSync(fs.readFileSync(dir+'assets/home-effects-v67/main-scene.json.gz'))),p=vm.runInNewContext(fs.readFileSync(dir+'home-effects-data.js','utf8')+';window.HOME_EFFECTS_DATA',{window:{}});let checks=0;const ck=x=>{assert.ok(x);checks++};
ck(d.duration===20&&d.frames.length===d.duration*d.fps);ck(Object.keys(d.regions).length===28);ck(d.meshes.length===162);
for(const r of Object.values(d.regions))ck(fs.existsSync(dir+r.file));
for(const frame of d.frames)for(const [id,v,c]of frame){const m=d.meshes[id];ck(!!m&&v.length===m.uv.length&&c.length===4&&v.every(Number.isFinite));ck(m.triangles.every(i=>i>=0&&i<v.length/2));}
ck(p.portals.length===6);ck(p.portals.reduce((n,x)=>n+x.layers.length,0)===42);
for(const portal of p.portals)for(const l of portal.layers){ck(fs.existsSync(dir+l.texture));ck(l.vertices.length===l.uv.length&&l.triangles.every(i=>i>=0&&i<l.vertices.length/2));ck(l.previewCarrier===true);}
console.log(checks+' source mesh/frame/file integrity checks passed');
fs.mkdirSync('work/rea-pipeline/verification/home-effects-v67',{recursive:true});fs.writeFileSync('work/rea-pipeline/verification/home-effects-v67/source-checks.json',JSON.stringify({checks,frames:d.frames.length,meshes:d.meshes.length,regions:Object.keys(d.regions).length,portalLayers:42}));
