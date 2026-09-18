import * as T from 'three';

export function createBananaBlade(rare=false){
 const group=new T.Group(),shape=new T.Group();group.add(shape);
 // Source sword stands upright. Lay its long axis across the flight direction.
 shape.rotation.z=-Math.PI/2;
 const depth=.11,faceMaterial=new T.MeshBasicMaterial({transparent:true,alphaTest:.5,side:T.DoubleSide});
 const sideMaterial=new T.MeshStandardMaterial({color:rare?0xffd95c:0xb98919,metalness:.3,roughness:.4,side:T.DoubleSide});
 let ready=false,failed=false,disposed=false,faceGeometry:T.PlaneGeometry|undefined,sideGeometry:T.BufferGeometry|undefined,faceTexture:T.CanvasTexture|undefined,icon:HTMLCanvasElement;
 const texture=new T.TextureLoader().load(rare?'/blade-rare.png':'/blade-normal.png',tex=>{
 if(disposed){tex.dispose();return}
 try{
 const source=tex.image as HTMLImageElement,canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');ctx.drawImage(source,0,0);
 const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;let minX=canvas.width,minY=canvas.height,maxX=0,maxY=0;
 for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>=128){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
 if(minX>maxX)throw new Error('Empty blade image');
 icon=document.createElement('canvas');icon.width=maxX-minX+1;icon.height=maxY-minY+1;icon.getContext('2d')!.drawImage(source,minX,minY,icon.width,icon.height,0,0,icon.width,icon.height);
 faceTexture=new T.CanvasTexture(icon);faceTexture.colorSpace=T.SRGBColorSpace;faceTexture.magFilter=T.NearestFilter;faceMaterial.map=faceTexture;faceMaterial.needsUpdate=true;
 const height=2.8,width=height*icon.width/icon.height;faceGeometry=new T.PlaneGeometry(width,height);
 const front=new T.Mesh(faceGeometry,faceMaterial),back=new T.Mesh(faceGeometry,faceMaterial);front.position.z=depth/2;back.position.z=-depth/2;shape.add(front,back);
 const rows=256,cols=Math.max(24,Math.round(rows*width/height));canvas.width=cols;canvas.height=rows;ctx.drawImage(icon,0,0,cols,rows);const pixels=ctx.getImageData(0,0,cols,rows).data;
 const opaque=(x:number,y:number)=>x>=0&&x<cols&&y>=0&&y<rows&&pixels[(y*cols+x)*4+3]>=128;
 const positions:number[]=[];const wall=(ax:number,ay:number,bx:number,by:number)=>positions.push(ax,ay,-depth/2,bx,by,-depth/2,bx,by,depth/2,ax,ay,-depth/2,bx,by,depth/2,ax,ay,depth/2);
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){if(!opaque(x,y))continue;const l=(x/cols-.5)*width,r=((x+1)/cols-.5)*width,t=(.5-y/rows)*height,b=(.5-(y+1)/rows)*height;if(!opaque(x-1,y))wall(l,b,l,t);if(!opaque(x+1,y))wall(r,t,r,b);if(!opaque(x,y-1))wall(l,t,r,t);if(!opaque(x,y+1))wall(r,b,l,b)}
 sideGeometry=new T.BufferGeometry();sideGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));sideGeometry.computeVertexNormals();shape.add(new T.Mesh(sideGeometry,sideMaterial));ready=true;
 }catch{failed=true}
 },undefined,()=>{failed=true});
 return {group,get image(){return icon},get ready(){return ready},get failed(){return failed},dispose(){disposed=true;faceGeometry?.dispose();sideGeometry?.dispose();faceMaterial.dispose();sideMaterial.dispose();texture.dispose();faceTexture?.dispose()}};
}
