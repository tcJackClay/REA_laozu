const assert=require('assert/strict');global.window=global;for(const n of ['teacher-data','teacher-runtime-data','teacher-runtime','wander-tools-data','wander-tools'])require('../../outputs/laozu-web/'+n+'.js');
const W=WanderTools,s={run:{config:{}},inventory:[],crystal:0};let checks=0;const ck=(a,b)=>{assert.deepEqual(a,b);checks++};
ck(W.data(s).baseCells.length,24);ck(W.open(s,0,0),false);ck(W.canOpen(s,0,0),true);ck(W.unlock(s,0,0),'仙玉不足');ck(W.data(s).opened.length,0);
s.crystal=100;ck(W.unlock(s,0,0),null);ck(s.crystal,90);ck(W.unlock(s,0,0),'请选择与已开格相邻的格子');ck(s.crystal,90);
for(let i=0;i<2;i++){let found=false;for(let y=0;y<6&&!found;y++)for(let x=0;x<7&&!found;x++)if(W.canOpen(s,x,y)){ck(W.unlock(s,x,y),null);found=true;}}
ck(W.data(s).opened.length,3);ck(W.unlock(s,6,5),'本轮开启次数已达上限');ck(s.crystal,70);
ck(W.reforge(s,99),null);ck(W.recycle(s,404),false);s.inventory=[{uid:1,id:140103,x:null,y:null,rotation:0}];ck(W.recycle(s,1),true);ck(W.recycle(s,1),false);ck(W.data(s).reforge,1);
W.data(s).reforge=6;const item=W.reforge(s,10,()=>0);ck(!!item,true);ck(s.inventory.length,1);ck(W.data(s).reforge,0);ck(W.reforge(s,11),null);ck(s.inventory.length,1);
console.log('PASS',checks,'model checks');
