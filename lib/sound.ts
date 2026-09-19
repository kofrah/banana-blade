export type SoundKind='shutter'|'slice'|'rare';
// Short, locally synthesized effects: no audio requests or microphone access.
export function soundSamples(kind:SoundKind,sampleRate:number){
 const duration=kind==='shutter'?.19:kind==='rare'?.58:.29;
 const samples=new Float32Array(Math.ceil(sampleRate*duration));let seed=1987,previous=0;
 for(let i=0;i<samples.length;i++){
 const t=i/sampleRate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/4294967296*2-1;const high=noise-previous;previous=noise;let value=0;
 if(kind==='shutter'){
 for(const [start,strength] of [[0,.36],[.065,.25]]){const age=t-start;if(age>=0)value+=(high*.35+Math.sin(2*Math.PI*1350*age)*.22)*Math.exp(-age*85)*strength}
 }else{
 const envelope=Math.sin(Math.PI*Math.min(1,t/.24))**2*Math.exp(-t*8);value=noise*envelope*.21+high*Math.exp(-t*65)*.09+Math.sin(2*Math.PI*(190*t-180*t*t))*Math.exp(-t*32)*.16;
 if(kind==='rare')for(const [index,freq] of [1320,1760,2640].entries()){const age=t-index*.035;if(age>=0)value+=Math.sin(2*Math.PI*freq*age)*Math.min(1,age/.006)*Math.exp(-age*10)*.06}
 }
 const fade=Math.min(1,t/.0015,(duration-t)/.02);samples[i]=Math.max(-.8,Math.min(.8,value*fade));
 }
 return samples;
}
export function createSoundEngine(){
 let context:AudioContext|null=null,disposed=false;const buffers=new Map<SoundKind,AudioBuffer>(),active=new Set<AudioBufferSourceNode>();
 return {
 async unlock(){if(disposed)return false;try{if(!context){const AudioCtor=window.AudioContext||(window as Window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!AudioCtor)return false;context=new AudioCtor()}if(context.state!=='running')await context.resume();return !disposed&&context.state==='running'}catch{return false}},
 play(kind:SoundKind){if(disposed||!context||context.state!=='running'||document.hidden)return;try{let buffer=buffers.get(kind);if(!buffer){const data=soundSamples(kind,context.sampleRate);buffer=context.createBuffer(1,data.length,context.sampleRate);buffer.copyToChannel(data,0);buffers.set(kind,buffer)}const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;gain.gain.value=.75;source.connect(gain).connect(context.destination);active.add(source);source.onended=()=>{active.delete(source);source.disconnect();gain.disconnect()};source.start()}catch{/* Sound failures must never interrupt capture or cutting. */}},
 dispose(){disposed=true;active.forEach(source=>{try{source.stop()}catch{}});active.clear();buffers.clear();if(context)void context.close().catch(()=>{});context=null}
 };
}
