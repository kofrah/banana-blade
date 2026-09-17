import * as T from 'three';
import {splitPolygon,type Point} from '../lib/slice';
export function playSlice(host:HTMLDivElement,photo:HTMLCanvasElement,onCut:()=>void,onDone:()=>void,onError:()=>void){
 let renderer:T.WebGLRenderer;
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:true})}catch{onError();return ()=>{}}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setClearColor(0x171914,1);host.appendChild(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.1,100);camera.position.z=9;
 const texture=new T.CanvasTexture(photo);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
 const material=new T.MeshBasicMaterial({map:texture,side:T.DoubleSide});
 const edge=new T.MeshBasicMaterial({color:0xc7cbbb});
 const ratio=photo.width/photo.height;let h=Math.min(3.8,3.9/ratio),w=h*ratio;
 const rect:Point[]=[{x:-w/2,y:-h/2},{x:w/2,y:-h/2},{x:w/2,y:h/2},{x:-w/2,y:h/2}];
 const geometries:T.BufferGeometry[]=[];const materials:T.Material[]=[material,edge];
 function card(poly:Point[]){const shape=new T.Shape();shape.moveTo(poly[0].x,poly[0].y);poly.slice(1).forEach(p=>shape.lineTo(p.x,p.y));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false,steps:1});const pos=geo.getAttribute('position'),uv=geo.getAttribute('uv');for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getY(i)+h/2)/h);uv.needsUpdate=true;geometries.push(geo);const mesh=new T.Mesh(geo,[material,edge]);return mesh}
 const whole=card(rect);scene.add(whole);
 const angle=Math.random()*Math.PI;const normal=new T.Vector3(-Math.sin(angle),Math.cos(angle),0);
 const pieces=splitPolygon(rect,angle,(Math.random()-.5)*Math.min(w,h)*.18).map(p=>card(p));
 const bladeTexture=new T.TextureLoader().load('/banana-blade.png');bladeTexture.colorSpace=T.SRGBColorSpace;bladeTexture.magFilter=T.NearestFilter;
 const bladeMat=new T.MeshBasicMaterial({map:bladeTexture,transparent:true,side:T.DoubleSide,depthWrite:false});materials.push(bladeMat);
 const bladeGeo=new T.PlaneGeometry(2.5,1.25);geometries.push(bladeGeo);const blade=new T.Mesh(bladeGeo,bladeMat);blade.rotation.z=angle;blade.position.z=7;blade.visible=false;scene.add(blade);
 const resize=()=>{const width=host.clientWidth,height=host.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.position.z=Math.max(9,(w+1.3)/(2*Math.tan(T.MathUtils.degToRad(20))*camera.aspect));camera.updateProjectionMatrix()};resize();const observer=new ResizeObserver(resize);observer.observe(host);
 let raf=0,cut=false,finished=false,previous=0,elapsed=0;
 const velocities=[normal.clone().multiplyScalar(.52).add(new T.Vector3(0,.7,.25)),normal.clone().multiplyScalar(-.52).add(new T.Vector3(0,.55,-.15))];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function frame(now:number){if(!previous)previous=now;const dt=Math.min((now-previous)/1000,.04);previous=now;elapsed+=dt;
 const pop=Math.min(elapsed/.42,1);whole.scale.setScalar(.86+.14*(1-Math.pow(1-pop,3)));whole.rotation.y=(1-pop)*-.2;whole.rotation.x=(1-pop)*.08;
 if(elapsed>.75&&elapsed<1.28){blade.visible=true;blade.position.z=7-((elapsed-.75)/.53)*12;blade.scale.setScalar(reduced?.75:1)}else blade.visible=false;
 if(elapsed>=1.06&&!cut){cut=true;scene.remove(whole);pieces.forEach(p=>scene.add(p));onCut()}
 if(cut){pieces.forEach((p,i)=>{velocities[i].y-=3.4*dt;p.position.addScaledVector(velocities[i],dt);p.rotation.x+=(i?-.48:.38)*dt;p.rotation.z+=(i?-.22:.18)*dt;p.rotation.y+=(i?.26:-.3)*dt;if(p.position.y< -9)p.visible=false});if(elapsed>3.2){material.transparent=true;material.opacity=Math.max(0,1-(elapsed-3.2)/.5)}}
 renderer.render(scene,camera);
 if(elapsed>3.8&&!finished){finished=true;onDone();return}raf=requestAnimationFrame(frame)}raf=requestAnimationFrame(frame);
 return()=>{cancelAnimationFrame(raf);observer.disconnect();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());texture.dispose();bladeTexture.dispose();renderer.dispose();renderer.domElement.remove()};
}
