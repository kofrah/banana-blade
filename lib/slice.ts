export type Point = {x:number;y:number};
export function splitPolygon(points:Point[],angle:number,offset=0):[Point[],Point[]]{
 const n={x:-Math.sin(angle),y:Math.cos(angle)};
 const clip=(sign:number)=>{const out:Point[]=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];const da=(a.x*n.x+a.y*n.y-offset)*sign,db=(b.x*n.x+b.y*n.y-offset)*sign;if(da>=-1e-10)out.push(a);if((da>0&&db<0)||(da<0&&db>0)){const t=da/(da-db);out.push({x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)})}}return out};
 return [clip(1),clip(-1)];
}
export function area(p:Point[]){return Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.x*b.y-b.x*a.y},0)/2)}

export type CutStep={angle:number;target:Point;polygons:Point[][]};
export function planCuts(rect:Point[],count:number,random:()=>number=Math.random):CutStep[]{
 if(!Number.isInteger(count)||count<1||count>3)throw new Error('Blade count must be 1–3');
 let polygons=[rect];const steps:CutStep[]=[];
 for(let i=0;i<count;i++){
 const largest=polygons.reduce((best,p,index)=>area(p)>area(polygons[best])?index:best,0);
 const target=polygons[largest].reduce((c,p)=>({x:c.x+p.x/polygons[largest].length,y:c.y+p.y/polygons[largest].length}),{x:0,y:0});
 const angle=random()*Math.PI;
 const offset=-Math.sin(angle)*target.x+Math.cos(angle)*target.y;
 const halves=splitPolygon(polygons[largest],angle,offset);
 polygons=polygons.flatMap((p,index)=>index===largest?halves:[p]);
 steps.push({angle,target,polygons});
 }
 return steps;
}
