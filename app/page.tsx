'use client';
import {Camera,RotateCcw,ArrowUpRight,Download} from 'lucide-react';
import {useCallback,useEffect,useRef,useState} from 'react';
import {playSlice} from './scene';
type Phase='camera'|'loading'|'playing'|'done';
type CameraStatus='starting'|'ready'|'error';
export default function Home(){
 const video=useRef<HTMLVideoElement>(null),host=useRef<HTMLDivElement>(null),stream=useRef<MediaStream|null>(null),cleanup=useRef<(()=>void)|null>(null),generation=useRef(0),mounted=useRef(true),busy=useRef(false);
 const [phase,setPhase]=useState<Phase>('camera'),[status,setStatus]=useState<CameraStatus>('starting'),[error,setError]=useState(''),[shots,setShots]=useState(0),[flash,setFlash]=useState(false),[cut,setCut]=useState(false);
 const [result,setResult]=useState(''),[saving,setSaving]=useState(false),[saveMessage,setSaveMessage]=useState('');
 const savingRef=useRef(false);
 const stopStream=useCallback(()=>{stream.current?.getTracks().forEach(t=>t.stop());stream.current=null},[]);
 const startCamera=useCallback(async()=>{const id=++generation.current;stopStream();setStatus('starting');setError('');
 try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');const s=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}});if(!mounted.current||id!==generation.current){s.getTracks().forEach(t=>t.stop());return}stream.current=s;
 s.getVideoTracks()[0].addEventListener('ended',()=>{if(mounted.current&&id===generation.current){setStatus('error');setError('カメラとの接続が切れました。もう一度接続してください。')}});
 if(video.current){video.current.srcObject=s;await video.current.play()}
 }catch(e){if(!mounted.current||id!==generation.current)return;stopStream();setStatus('error');const name=e instanceof Error?e.name:'';setError(name==='NotAllowedError'?'カメラの使用を許可してください。ブラウザの設定から許可したあと、もう一度お試しください。':name==='NotFoundError'?'カメラが見つかりません。カメラのあるスマートフォンで開いてください。':name==='NotReadableError'?'カメラを使用できません。ほかのカメラアプリを閉じて、もう一度お試しください。':'カメラに接続できません。Safari や Chrome などのブラウザで開き直してお試しください。')}},[stopStream]);
 useEffect(()=>{mounted.current=true;void startCamera();return()=>{mounted.current=false;generation.current++;stopStream();cleanup.current?.()}},[startCamera,stopStream]);
 const reset=useCallback(()=>{generation.current++;busy.current=false;cleanup.current?.();cleanup.current=null;setFlash(false);setCut(false);setResult('');setSaveMessage('');setPhase('camera');void startCamera()},[startCamera]);
 const shoot=useCallback(async()=>{if(busy.current||phase!=='camera'||status!=='ready')return;const v=video.current;if(!v?.videoWidth)return;busy.current=true;const id=generation.current;setPhase('loading');setFlash(true);setCut(false);
 try{const photo=document.createElement('canvas');const scale=Math.min(1,1600/Math.max(v.videoWidth,v.videoHeight));photo.width=Math.round(v.videoWidth*scale);photo.height=Math.round(v.videoHeight*scale);const ctx=photo.getContext('2d');if(!ctx)throw new Error();ctx.drawImage(v,0,0,photo.width,photo.height);stopStream();await new Promise<void>(r=>requestAnimationFrame(()=>r()));if(id!==generation.current||!mounted.current)return;setFlash(false);setShots(n=>n+1);setPhase('playing');
 if(host.current)cleanup.current=playSlice(host.current,photo,()=>{if(id===generation.current)setCut(true)},(image)=>{if(id===generation.current){setResult(image);setPhase('done');busy.current=false}},()=>{setPhase('camera');setStatus('error');setError('3D表示を開始できませんでした。ブラウザを更新して、もう一度お試しください。');busy.current=false});
 }catch{busy.current=false;setPhase('camera');setStatus('error');setError('撮影を完了できませんでした。もう一度お試しください。');setFlash(false)}},[phase,status,stopStream]);
 const saveResult=useCallback(async()=>{
 if(!result||savingRef.current)return;
 savingRef.current=true;setSaving(true);setSaveMessage('');const id=generation.current;
 try{
 const binary=atob(result.split(',')[1]);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
 const file=new File([bytes],`banana-blade-${Date.now()}.png`,{type:'image/png'});
 if(navigator.canShare?.({files:[file]})){
 await navigator.share({files:[file],title:'Banana Blade — Result'});
 if(id===generation.current)setSaveMessage('保存・共有メニューを閉じました。');
 }else{
 const url=URL.createObjectURL(file),link=document.createElement('a');link.href=url;link.download=file.name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 if(id===generation.current)setSaveMessage('PNG画像のダウンロードを開始しました。');
 }
 }catch(e){if(id===generation.current)setSaveMessage(e instanceof Error&&e.name==='AbortError'?'保存はキャンセルされました。':'保存メニューを開けませんでした。結果画像を長押しして保存することもできます。')}
 finally{savingRef.current=false;if(mounted.current)setSaving(false)}
 },[result]);
 const actions=useRef({reset,shoot,phase,status});actions.current={reset,shoot,phase,status};
 useEffect(()=>{type Tool={name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean};execute:(input:unknown)=>unknown};const mc=(document as Document&{modelContext?:{registerTool:(t:Tool,o:{signal:AbortSignal})=>void}}).modelContext;if(!mc)return;const abort=new AbortController();const valid=(input:unknown)=>{if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('Expected an empty object')};try{mc.registerTool({name:'get_camera_state',description:'Read camera readiness and the current Banana Blade animation state. Does not access the photo.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){valid(input);return {phase:actions.current.phase,camera:actions.current.status}}},{signal:abort.signal});mc.registerTool({name:'reset_banana_blade',description:'Reset the current animation and return to the camera. May request camera permission.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},async execute(input){valid(input);actions.current.reset();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return {phase:actions.current.phase}}},{signal:abort.signal})}catch{}return()=>abort.abort()},[]);
 const cameraVisible=phase==='camera';
 return <main className="camera-app">
 <video ref={video} autoPlay playsInline muted className="live-video" style={{visibility:cameraVisible&&status==='ready'?'visible':'hidden'}} onLoadedData={()=>{if(stream.current)setStatus('ready')}} onPlaying={()=>{if(stream.current)setStatus('ready')}} aria-label="カメラのライブプレビュー"/>
 <div ref={host} className="scene" style={{visibility:cameraVisible?'hidden':'visible'}} aria-label="撮影した写真の3D切断アニメーション"/>
 <header><div className="wordmark">BANANA<br/>BLADE<span>AS A SERVICE</span></div><span className="edition">THE CAMERA<br/>THAT CUTS.</span></header>
 <div className="camera-status"><b/>{cameraVisible?(status==='ready'?'LIVE CAMERA':'CAMERA / STANDBY'):phase==='done'?'SLICE COMPLETE':cut?'NICE SLICE.':'BANANA INCOMING'}</div>
 {cameraVisible&&<div className="viewfinder" aria-hidden="true"><i/><i/><i/><i/></div>}
 {cameraVisible&&status!=='ready'&&<section className="camera-message" aria-live="polite"><Camera size={28}/><h1>{status==='error'?'カメラをつなごう。':'撮って、スパッと。'}</h1><p>{status==='error'?error:'カメラの使用を許可すると、撮影できます。'}</p>{status==='error'&&<button onClick={()=>void startCamera()}>カメラに再接続 <ArrowUpRight size={16} style={{display:'inline',verticalAlign:'middle'}}/></button>}</section>}
 {phase==='loading'&&<div className="camera-message" role="status"><img className="loader" src="/banana-blade.png" alt=""/><p>バナナ、準備中。</p></div>}
 {phase==='done'&&<section className="result result-review" aria-label="切断結果"><div className="result-heading"><span>RESULT</span><h2>NICE SLICE.</h2></div>{result&&<img className="result-image" src={result} alt="撮影した写真がランダムな角度で切断され、2つの破片に分かれた結果"/>}<div className="result-actions"><button className="save-result" onClick={()=>void saveResult()} disabled={saving||!result}><Download size={18}/>{saving?'保存メニューを開いています…':'結果を保存する'}</button><button className="retake-result" onClick={reset} disabled={saving}>もう一度撮る <ArrowUpRight size={16}/></button><p className="save-message" role="status">{saveMessage||'気に入ったら保存。保存せずに次の一枚へ進めます。'}</p></div></section>}
 {phase!=='done'&&<footer><div className="mode">{cameraVisible?'PHOTO / SLICE':'ONE SHOT. ONE SLICE.'}</div><div className="controls"><button className="reset" onClick={reset} aria-label="リセットしてカメラに戻る"><RotateCcw size={20}/></button><button className="shutter" onClick={()=>void shoot()} disabled={!cameraVisible||status!=='ready'} aria-label="写真を撮影して自動切断"><span/></button><span className="counter">{String(shots).padStart(2,'0')}<span>SHOTS<br/>SLICED</span></span></div><p className="hint">{cameraVisible?'シャッターを押す。その先は、バナナにおまかせ。':'撮ったそのままを、スパッと。'}</p></footer>}{flash&&<div className="flash"/>}
 </main>
}
