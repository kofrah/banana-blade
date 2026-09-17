export type Point = {x:number;y:number};
export function splitPolygon(points:Point[],angle:number,offset=0):[Point[],Point[]]{
 const n={x:-Math.sin(angle),y:Math.cos(angle)};
 const clip=(sign:number)=>{const out:Point[]=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];const da=(a.x*n.x+a.y*n.y-offset)*sign,db=(b.x*n.x+b.y*n.y-offset)*sign;if(da>=-1e-10)out.push(a);if((da>0&&db<0)||(da<0&&db>0)){const t=da/(da-db);out.push({x:a.x+t*(b.x-a.x),y:a.y+t*(b.y-a.y)})}}return out};
 return [clip(1),clip(-1)];
}
export function area(p:Point[]){return Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.x*b.y-b.x*a.y},0)/2)}
