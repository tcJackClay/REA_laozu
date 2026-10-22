const assert=require('node:assert/strict'),{slicedBorder}=require('../../outputs/laozu-web/unity-rect.js');
const b={x:302,y:36,z:382,w:35};let r=slicedBorder(b,558,71);
assert.equal(r.x+r.z,558);assert.equal(r.y+r.w,71);assert.ok(Math.abs(r.x/r.z-302/382)<1e-10);
assert.deepEqual(slicedBorder(b,1000,200),b);r=slicedBorder(b,100,20);assert.equal(r.y+r.w,20);assert.ok(Math.abs(r.x+r.z-100)<1e-10);
assert.deepEqual(slicedBorder(b,0,0),{x:0,y:0,z:0,w:0});assert.deepEqual(slicedBorder({x:0,y:0,z:0,w:0},20,20),{x:0,y:0,z:0,w:0});console.log('8 sliced border checks passed');
