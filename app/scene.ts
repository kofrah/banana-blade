import * as T from 'three';
import {createBananaBlade} from '../lib/banana-blade';
import {planCuts,type Point} from '../lib/slice';
import {flightCutRandom} from '../lib/blade-variant';
import {createRareEffect} from '../lib/rare-effect';
import {composeResult} from '../lib/result-image';
export function playSlice(host:HTMLDivElement,photo:HTMLCanvasElement,count:number,resultLine:string,rare:boolean,onCut:()=>void,onDone:(result:string)=>void,onError:()=>void){
 let renderer:T.WebGLRenderer;
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:true})}catch{onError();return ()=>{}}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setClearColor(0x171914,1);host.appendChild(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(40,1,.1,100);camera.position.z=9;
 const texture=new T.CanvasTexture(photo);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
 const material=new T.MeshBasicMaterial({map:texture,side:T.DoubleSide});
 const edge=new T.MeshBasicMaterial({color:0xc7cbbb});
 const ratio=photo.width/photo.height,h=Math.min(3.8,3.9/ratio),w=h*ratio;
 const rect:Point[]=[{x:-w/2,y:-h/2},{x:w/2,y:-h/2},{x:w/2,y:h/2},{x:-w/2,y:h/2}];
 const geometries:T.BufferGeometry[]=[];
 function card(poly:Point[]){const shape=new T.Shape();shape.moveTo(poly[0].x,poly[0].y);poly.slice(1).forEach(p=>shape.lineTo(p.x,p.y));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false,steps:1});const pos=geo.getAttribute('position'),uv=geo.getAttribute('uv');for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getY(i)+h/2)/h);uv.needsUpdate=true;geometries.push(geo);return new T.Mesh(geo,[material,edge])}
 const whole=card(rect);scene.add(whole);
 const steps=planCuts(rect,count,flightCutRandom),stages=steps.map(step=>step.polygons.map(card));
 const banana=createBananaBlade(rare),blade=new T.Group();blade.add(banana.group);blade.visible=false;scene.add(blade);
 scene.add(new T.HemisphereLight(0xffffff,0x5b6133,2.1));
 const key=new T.DirectionalLight(0xffffff,3.4);key.position.set(-3,5,7);scene.add(key);
 const rimLight=new T.DirectionalLight(0xffdf65,2);rimLight.position.set(4,-1,-3);scene.add(rimLight);
 const resize=()=>{const width=host.clientWidth,height=host.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.position.z=Math.max(9,(w+1.3)/(2*Math.tan(T.MathUtils.degToRad(20))*camera.aspect));camera.updateProjectionMatrix()};resize();const observer=new ResizeObserver(resize);observer.observe(host);
 const spacing=.64,flightStart=.75,flightDuration=.53,impactOffset=flightDuration*7/12,lastImpact=flightStart+(count-1)*spacing+impactOffset;
 let raf=0,cuts=0,previous=0,elapsed=0,result='';
 const finalPolygons=steps[count-1].polygons;
 const velocities=finalPolygons.map(poly=>{const center=poly.reduce<T.Vector3>((a,p)=>a.add(new T.Vector3(p.x/poly.length,p.y/poly.length,0)),new T.Vector3());return center.normalize().multiplyScalar(.62).add(new T.Vector3(0,.6,0))});
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const rareEffect=rare?createRareEffect(scene,reduced):null;
 function frame(now:number){
 if(banana.failed){onError();return}if(!banana.ready){previous=now;raf=requestAnimationFrame(frame);return}
 if(!previous)previous=now;const dt=Math.min((now-previous)/1000,.04);previous=now;elapsed+=dt;
 const pop=Math.min(elapsed/.42,1);whole.scale.setScalar(.86+.14*(1-Math.pow(1-pop,3)));whole.rotation.y=(1-pop)*-.2;whole.rotation.x=(1-pop)*.08;
 const shot=Math.floor((elapsed-flightStart)/spacing),local=elapsed-flightStart-shot*spacing;
 blade.visible=shot>=0&&shot<count&&local<flightDuration;
 if(blade.visible){const step=steps[shot];blade.position.set(step.target.x,step.target.y,7-local/flightDuration*12);blade.rotation.z=step.angle;blade.scale.setScalar(reduced?.75:1);banana.group.rotation.x=1.15;banana.group.rotation.y=.08}
 if(cuts<count&&elapsed>=flightStart+cuts*spacing+impactOffset){
 if(cuts===0)scene.remove(whole);else stages[cuts-1].forEach(mesh=>scene.remove(mesh));
 stages[cuts].forEach(mesh=>scene.add(mesh));rareEffect?.trigger(steps[cuts].target.x,steps[cuts].target.y);cuts++;onCut();
 }
 // Complete the quick burst before allowing fragments to fall away from the target.
 if(cuts===count){stages[count-1].forEach((piece,i)=>{velocities[i].y-=3.4*dt;piece.position.addScaledVector(velocities[i],dt);piece.rotation.x+=(i%2?-.48:.38)*dt;piece.rotation.z+=(i%2?-.22:.18)*dt;piece.rotation.y+=(i%2?.26:-.3)*dt;if(piece.position.y< -9)piece.visible=false});if(elapsed>lastImpact+2.1){material.transparent=true;material.opacity=Math.max(0,1-(elapsed-lastImpact-2.1)/.5)}}
 rareEffect?.update(dt);
 renderer.render(scene,camera);
 if(!result&&elapsed>=lastImpact+.44){
 const oldRatio=renderer.getPixelRatio();renderer.setPixelRatio(1);renderer.setSize(1200,1200,false);camera.aspect=1;camera.position.z=7.5;camera.updateProjectionMatrix();
 try{const capture=()=>{renderer.render(scene,camera);return composeResult(renderer.domElement,banana.image,resultLine,rare)};result=rareEffect?rareEffect.withoutEffect(capture):capture()}catch{onError();return}
 renderer.setPixelRatio(oldRatio);resize();renderer.render(scene,camera);
 }
 if(elapsed>lastImpact+2.74){onDone(result);return}raf=requestAnimationFrame(frame);
 }
 raf=requestAnimationFrame(frame);
 return()=>{cancelAnimationFrame(raf);observer.disconnect();geometries.forEach(g=>g.dispose());material.dispose();edge.dispose();texture.dispose();banana.dispose();rareEffect?.dispose();renderer.dispose();renderer.domElement.remove()};
}
