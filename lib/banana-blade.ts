import * as T from 'three';

// A curved, bevelled solid: broad yellow faces, a bright cutting edge and a dark stem.
export function createBananaBlade() {
 const outline=new T.Shape();
 outline.moveTo(-1.3,.42);
 outline.bezierCurveTo(-1.18,-.46,-.62,-.83,.18,-.68);
 outline.bezierCurveTo(.85,-.55,1.22,-.13,1.4,.52);
 outline.bezierCurveTo(.83,-.03,.16,-.24,-.43,-.03);
 outline.bezierCurveTo(-.83,.09,-1.05,.31,-1.3,.42);
 const bodyGeometry=new T.ExtrudeGeometry(outline,{depth:.2,bevelEnabled:true,bevelThickness:.065,bevelSize:.055,bevelSegments:3,curveSegments:24,steps:1});
 bodyGeometry.translate(0,.15,-.1);
 const gold=new T.MeshStandardMaterial({color:0xffdf22,metalness:.32,roughness:.27});
 const rim=new T.MeshStandardMaterial({color:0xfff4a1,metalness:.68,roughness:.21});
 const body=new T.Mesh(bodyGeometry,[gold,rim]);
 const stemGeometry=new T.CylinderGeometry(.065,.09,.24,8);
 const stemMaterial=new T.MeshStandardMaterial({color:0x594128,roughness:.62});
 const stem=new T.Mesh(stemGeometry,stemMaterial);stem.position.set(-1.24,.58,0);stem.rotation.z=-.4;
 const group=new T.Group();group.add(body,stem);
 return {group,dispose(){bodyGeometry.dispose();stemGeometry.dispose();gold.dispose();rim.dispose();stemMaterial.dispose()}};
}
