import * as T from 'three';
export function createRareEffect(scene:T.Scene,reduced:boolean){
 const count=reduced?20:64,positions=new Float32Array(count*3),velocities=new Float32Array(count*3);
 for(let i=0;i<count;i++){const angle=i/count*Math.PI*2,speed=.7+(i%7)*.19;velocities[i*3]=Math.cos(angle)*speed;velocities[i*3+1]=Math.sin(angle)*speed;velocities[i*3+2]=.2+(i%5)*.1}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));
 const material=new T.PointsMaterial({color:0xffdc52,size:.065,transparent:true,depthWrite:false,blending:T.AdditiveBlending});
 const particles=new T.Points(geometry,material);particles.frustumCulled=false;
 const ringGeometry=new T.RingGeometry(.92,1,64),ringMaterial=new T.MeshBasicMaterial({color:0xffe78f,transparent:true,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending});
 const ring=new T.Mesh(ringGeometry,ringMaterial);ring.position.z=.12;
 const group=new T.Group();group.add(particles,ring);group.visible=false;scene.add(group);let age=10;
 return {trigger(x:number,y:number){age=0;group.position.set(x,y,.15);group.visible=true},update(dt:number){age+=dt;if(age>1.3){group.visible=false;return}for(let i=0;i<count;i++){positions[i*3]=velocities[i*3]*age;positions[i*3+1]=velocities[i*3+1]*age-.3*age*age;positions[i*3+2]=velocities[i*3+2]*age}geometry.attributes.position.needsUpdate=true;material.opacity=Math.max(0,1-age/1.3);ring.scale.setScalar(.15+age*(reduced?.8:2));ringMaterial.opacity=Math.max(0,.8-age*.8)},dispose(){scene.remove(group);geometry.dispose();material.dispose();ringGeometry.dispose();ringMaterial.dispose()}};
}
