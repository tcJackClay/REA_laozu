/* Original TMP glyph metrics and atlas; the browser approximates Unity SDF antialiasing. */
window.OriginalFont=(()=>{
 const D=window.ORIGINAL_FONT_DATA,im=new Image(),missing=new Set();let ready=false;const waiting=[];
 im.onload=()=>{ready=true;for(const f of waiting.splice(0))f();};im.src=D.image;
 function draw(el,c,text,rect,color){
  if(c.fields?.m_fontAsset?.m_PathID!==D.id)return;
  const chars=[...String(text)];if(chars.some(ch=>ch!=='\n'&&!D.characters[ch.codePointAt(0)])){for(const ch of chars)if(ch!=='\n'&&!D.characters[ch.codePointAt(0)])missing.add(ch);return;}
  const render=()=>{
   const size=c.m_fontSize||c.m_FontSize||36,f=size/D.pointSize,lines=String(text).split('\n'),adv=line=>[...line].reduce((n,ch)=>n+D.characters[ch.codePointAt(0)][6]*f,0),width=Math.max(rect.width,...lines.map(adv)),height=Math.max(rect.height,size*1.5),pad=D.padding;
   if(!width||!height)return;const cv=document.createElement('canvas');cv.className='unity-font';cv.setAttribute('aria-hidden','true');
   const scale=2;cv.width=Math.ceil(width*scale);cv.height=Math.ceil(height*scale);cv.style.cssText=`position:absolute;left:${c.m_HorizontalAlignment===2?(rect.width-width)/2:0}px;top:0;width:${width}px;height:${height}px;pointer-events:none;`;
   const ctx=cv.getContext('2d');ctx.scale(scale,scale);ctx.imageSmoothingEnabled=true;
   let y=(rect.height-lines.length*size*1.15)/2;
   for(const line of lines){
    const glyphs=[...line].map(ch=>D.characters[ch.codePointAt(0)]),top=Math.min(...glyphs.map(g=>-g[5]*f),0),bottom=Math.max(...glyphs.map(g=>(g[8]-g[5])*f),0);
    const baseline=lines.length===1?(rect.height-top-bottom)/2:y-top;
    const lineWidth=adv(line);let pen=c.m_HorizontalAlignment===1?0:c.m_HorizontalAlignment===4?width-lineWidth:(width-lineWidth)/2;
    for(const g of glyphs){if(g[2]&&g[3])ctx.drawImage(im,g[0]-pad,D.atlasSize[1]-g[1]-g[3]-pad,g[2]+pad*2,g[3]+pad*2,pen+(g[4]-pad)*f,baseline-(g[5]+pad)*f,(g[7]+pad*2)*f,(g[8]+pad*2)*f);pen+=g[6]*f;}
    y+=size*1.15;
   }
   ctx.globalCompositeOperation='source-in';ctx.fillStyle=color;ctx.fillRect(0,0,width,height);const img=document.createElement('img');img.src=cv.toDataURL();img.className=cv.className;img.style.cssText=cv.style.cssText;img.alt='';img.setAttribute('aria-hidden','true');el.append(img);
   const span=el.querySelector(':scope>.unity-text');if(span)span.style.color='transparent';
  };
  if(ready)render();else waiting.push(()=>{if(el.isConnected)render();});
 }
 return {draw,missing:()=>[...missing],ready:()=>ready};
})();
