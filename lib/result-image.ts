// The same composed PNG is shown in RESULT and passed to native save/share.
export function composeResult(frame:HTMLCanvasElement,icon:CanvasImageSource,line:string){
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1440;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Result canvas unavailable');
 ctx.fillStyle='#171914';ctx.fillRect(0,0,1200,1440);
 ctx.drawImage(frame,0,120,1200,1200);
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#edfa49';ctx.font='900 42px Arial, sans-serif';
 ctx.fillText('SLICED BY BANANA BLADE.',600,66,1080);
 ctx.fillStyle='#e1e6d3';ctx.font='26px Arial, sans-serif';ctx.fillText(line,600,1375,1080);
 ctx.imageSmoothingEnabled=false;ctx.drawImage(icon,1010,1220,130,65);
 return canvas.toDataURL('image/png');
}
