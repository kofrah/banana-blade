// The same composed PNG is shown in RESULT and passed to native save/share.
export function composeResult(frame:HTMLCanvasElement,icon:HTMLCanvasElement,line:string,rare=false){
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1440;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Result canvas unavailable');
 ctx.fillStyle='#171914';ctx.fillRect(0,0,1200,1440);
 ctx.drawImage(frame,0,120,1200,1200);
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#edfa49';ctx.font='900 42px Arial, sans-serif';
 ctx.fillText('SLICED BY BANANA BLADE.',600,66,1080);
 ctx.fillStyle='#e1e6d3';ctx.font='26px Arial, sans-serif';ctx.fillText(line,600,1375,1080);
 ctx.imageSmoothingEnabled=false;const iconHeight=240,iconWidth=iconHeight*icon.width/icon.height;ctx.drawImage(icon,1130-iconWidth,1280-iconHeight,iconWidth,iconHeight);
 if(rare){ctx.fillStyle='#ffdf52';ctx.font='700 20px Arial, sans-serif';ctx.fillText('RARE BLADE',1060,1300);}
 return canvas.toDataURL('image/png');
}
