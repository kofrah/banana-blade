import * as T from 'three';

// Keep the exact pixel-art face. Extrude only its opaque silhouette into side walls.
export function createBananaBlade(){
 const group=new T.Group(),width=2.5,height=1.25,depth=.14;
 const faceGeometry=new T.PlaneGeometry(width,height);
 const faceMaterial=new T.MeshBasicMaterial({transparent:true,alphaTest:.5,side:T.DoubleSide});
 const sideMaterial=new T.MeshStandardMaterial({color:0xd8a521,metalness:.2,roughness:.38});
 const front=new T.Mesh(faceGeometry,faceMaterial),back=new T.Mesh(faceGeometry,faceMaterial);
 front.position.z=depth/2;back.position.z=-depth/2;group.add(front,back);
 let ready=false,failed=false,disposed=false,sideGeometry:T.BufferGeometry|undefined;
 const texture=new T.TextureLoader().load('/banana-blade.png',tex=>{
 if(disposed){tex.dispose();return}
 try{
 const cols=192,rows=96,canvas=document.createElement('canvas');canvas.width=cols;canvas.height=rows;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
 ctx.drawImage(tex.image,0,0,cols,rows);const pixels=ctx.getImageData(0,0,cols,rows).data;
 const opaque=(x:number,y:number)=>x>=0&&x<cols&&y>=0&&y<rows&&pixels[(y*cols+x)*4+3]>=128;
 const positions:number[]=[];
 const wall=(ax:number,ay:number,bx:number,by:number)=>{positions.push(ax,ay,-depth/2,bx,by,-depth/2,bx,by,depth/2,ax,ay,-depth/2,bx,by,depth/2,ax,ay,depth/2)};
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){if(!opaque(x,y))continue;const l=(x/cols-.5)*width,r=((x+1)/cols-.5)*width,t=(.5-y/rows)*height,b=(.5-(y+1)/rows)*height;
 if(!opaque(x-1,y))wall(l,b,l,t);if(!opaque(x+1,y))wall(r,t,r,b);if(!opaque(x,y-1))wall(l,t,r,t);if(!opaque(x,y+1))wall(r,b,l,b)}
 sideGeometry=new T.BufferGeometry();sideGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));sideGeometry.computeVertexNormals();sideMaterial.side=T.DoubleSide;group.add(new T.Mesh(sideGeometry,sideMaterial));ready=true;
 }catch{failed=true}
 },undefined,()=>{failed=true});
 texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;faceMaterial.map=texture;
 return {group,get image(){return texture.image as CanvasImageSource},get ready(){return ready},get failed(){return failed},dispose(){disposed=true;faceGeometry.dispose();sideGeometry?.dispose();faceMaterial.dispose();sideMaterial.dispose();texture.dispose()}};
}
