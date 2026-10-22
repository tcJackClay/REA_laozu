/* Executed in Chromium: one GPU indexed mesh per attachment, no triangle
 * expansion or per-triangle compositing. Color and blending are premultiplied. */
module.exports=async function raster({width,height,images,draws}){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,antialias:true});
 if(!gl)throw Error('WebGL unavailable');
 const shader=(type,text)=>{const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 aPos;attribute vec2 aUV;uniform vec2 uSize;varying vec2 vUV;void main(){gl_Position=vec4(aPos.x/uSize.x*2.0-1.0,1.0-aPos.y/uSize.y*2.0,0,1);vUV=aUV;}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 vUV;uniform sampler2D uTex;uniform vec4 uColor;void main(){vec4 p=texture2D(uTex,vUV);gl_FragColor=vec4(p.rgb*uColor.rgb*uColor.a,p.a*uColor.a);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 gl.uniform2f(gl.getUniformLocation(program,'uSize'),width,height);gl.uniform1i(gl.getUniformLocation(program,'uTex'),0);gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
 const textures={};
 for(const [key,data] of Object.entries(images)){const image=new Image();image.src=data;await image.decode();const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);textures[key]=t;}
 const vertices=gl.createBuffer(),indices=gl.createBuffer(),pos=gl.getAttribLocation(program,'aPos'),uv=gl.getAttribLocation(program,'aUV'),color=gl.getUniformLocation(program,'uColor');gl.bindBuffer(gl.ARRAY_BUFFER,vertices);gl.enableVertexAttribArray(pos);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,16,0);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,16,8);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);
 for(const d of draws){const data=new Float32Array(d.vertices.length*2);for(let i=0;i<d.vertices.length/2;i++){data[i*4]=d.vertices[i*2];data[i*4+1]=d.vertices[i*2+1];data[i*4+2]=d.uv[i*2];data[i*4+3]=d.uv[i*2+1];}gl.bindTexture(gl.TEXTURE_2D,textures[d.image]);gl.uniform4fv(color,d.color);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STREAM_DRAW);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(d.triangles),gl.STREAM_DRAW);
  if(d.blend===1)gl.blendFuncSeparate(gl.ONE,gl.ONE,gl.ONE,gl.ONE);
  else if(d.blend===2)gl.blendFuncSeparate(gl.DST_COLOR,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  else if(d.blend===3)gl.blendFuncSeparate(gl.ONE,gl.ONE_MINUS_SRC_COLOR,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  else gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  gl.drawElements(gl.TRIANGLES,d.triangles.length,gl.UNSIGNED_SHORT,0);
 }
 const error=gl.getError();if(error!==gl.NO_ERROR)throw Error('WebGL draw error '+error);
 const single=document.createElement('canvas');single.width=320;single.height=420;single.getContext('2d').drawImage(canvas,0,0,320,420,0,0,320,420);
 const result={sheet:canvas.toDataURL('image/png').split(',')[1],single:single.toDataURL('image/png').split(',')[1],renderer:'webgl-indexed-mesh',draws:draws.length};
 gl.getExtension('WEBGL_lose_context')?.loseContext();return result;
};
