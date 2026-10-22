/* Client path planning: MiningUtility 445577-445863, UIMiningAuto 665352-665393. */
window.MiningAuto=(()=>{
 const adjacent=i=>[i%6?i-1:-1,i%6<5?i+1:-1,i>=6?i-6:-1,i<42?i+6:-1].filter(n=>n>=0);
 function spaces(board){const seen=new Set(),out=[];for(let i=0;i<6;i++){if(board[i].type||!board[i].available||seen.has(i))continue;const stack=[i];while(stack.length){const n=stack.pop();if(seen.has(n)||board[n].type)continue;seen.add(n);out.push(n);for(const v of adjacent(n))if(!seen.has(v)&&!board[v].type)stack.push(v);}}return out;}
 function plan(board,depth,selected,budget){
  if(board.length!==48||!Number.isInteger(budget)||budget<1||budget>150)throw Error('无效矿图或预算');
  const free=spaces(board),open=new Set(free),virtual=depth===0||!free.length,targets=board.map((c,i)=>selected[c.type]?i:-1).filter(i=>i>=0);
  const distance=i=>virtual?Math.floor(i/6)+1:Math.min(...free.map(j=>Math.abs(i%6-j%6)+Math.abs(Math.floor(i/6)-Math.floor(j/6))));
  const ordered=[...targets].sort((a,b)=>distance(a)-distance(b)),path=[];let cost=0;
  for(const target of ordered){if(open.has(target))continue;
   const dist=board.map((c,i)=>open.has(i)?0:virtual&&i<6&&c.available?Math.max(0,c.durability):Infinity),prev=board.map((c,i)=>!open.has(i)&&virtual&&i<6&&c.available?-2:-1),done=new Set();
   for(let k=0;k<48;k++){let u=-1,best=Infinity;for(let i=0;i<48;i++)if(!done.has(i)&&dist[i]<best){u=i;best=dist[i];}if(u<0)break;done.add(u);if(u===target)break;for(const v of adjacent(u)){const next=best+Math.max(0,board[v].durability);if(!done.has(v)&&next<dist[v]){dist[v]=next;prev[v]=u;}}}
   if(!Number.isFinite(dist[target]))continue;const reverse=[];let u=target;while(!open.has(u)){reverse.push(u);u=prev[u];if(u===-2)break;if(u<0){reverse.length=0;break;}}
   for(const i of reverse.reverse()){const n=Math.max(0,board[i].durability);if(cost+n>budget)return {path,cost,remaining:0};path.push(i);open.add(i);cost+=n;if(cost===budget)return {path,cost,remaining:0};}
  }
  let bottom=false;if(targets.every(i=>path.includes(i))&&cost<budget){let start=0;for(const i of (path.length?path:free))if(Math.floor(i/6)>Math.floor(start/6))start=i;bottom=true;for(let y=Math.floor(start/6)+1;y<8;y++){const i=y*6+start%6,n=Math.max(0,board[i].durability);if(cost+n>budget){bottom=false;break;}path.push(i);cost+=n;}}
  return {path,cost,remaining:bottom?budget-cost:0};
 }
 return {spaces,plan};
})();
