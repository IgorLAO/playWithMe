import type { PitchFrame } from './pitch';
export class MicrophoneEngine {
 private context?:AudioContext; private stream?:MediaStream; private source?:MediaStreamAudioSourceNode; private worklet?:AudioWorkletNode; private worker?:Worker; private busy=false; private lastMidi:number|null=null; private stable=0; private lastSound=false; private pendingOnset=false; private noiseFloor=0.008;
 onFrame?: (frame:PitchFrame)=>void;
 onError?: (error:Error)=>void;
 setNoiseFloor(value:number){this.noiseFloor=value;}
 setChannel(value:number){this.worklet?.port.postMessage({channel:value});}
 async start(deviceId?:string,noiseFloor=0.008,channel=-1) {
  this.noiseFloor=noiseFloor;
  await this.stop(); if(!navigator.mediaDevices?.getUserMedia)throw new Error('getUserMedia indisponível'); this.stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:deviceId?{exact:deviceId}:undefined,echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
  this.context=new AudioContext({latencyHint:'interactive'}); await this.context.audioWorklet.addModule(new URL('./capture.worklet.ts',import.meta.url));
  this.worker=new Worker(new URL('./pitch.worker.ts',import.meta.url),{type:'module'});this.worker.onerror=()=>this.onError?.(new Error('Falha no processamento de áudio. Recarregue a página.'));
  this.worker.onmessage=(event:MessageEvent<PitchFrame>)=>{this.busy=false;const raw=event.data; if(raw.midi!==null){const rounded=Math.round(raw.midi);if(rounded!==this.lastMidi)this.pendingOnset=true;this.stable=rounded===this.lastMidi?this.stable+1:1;this.lastMidi=rounded;}else{this.stable=0;this.lastMidi=null;this.pendingOnset=false;}
   const valid=raw.midi!==null&&raw.confidence>=0.78&&this.stable>=2;const frame:PitchFrame=valid?{...raw,onset:!this.lastSound||this.pendingOnset}: {hz:null,midi:null,confidence:0,rms:raw.rms,timestamp:raw.timestamp,onset:false};if(valid)this.pendingOnset=false;this.lastSound=valid;this.onFrame?.(frame);};
  this.source=this.context.createMediaStreamSource(this.stream);this.worklet=new AudioWorkletNode(this.context,'bass-capture');this.worklet.onprocessorerror=()=>this.onError?.(new Error('Falha no processador de áudio. Recarregue a página.'));this.setChannel(channel);this.worklet.port.onmessage=(event:MessageEvent<Float32Array>)=>{if(this.busy)return;this.busy=true;this.worker?.postMessage({samples:event.data,sampleRate:this.context!.sampleRate,noiseFloor:this.noiseFloor},[event.data.buffer]);};
  this.source.connect(this.worklet);const silent=this.context.createGain();silent.gain.value=0;this.worklet.connect(silent).connect(this.context.destination);await this.context.resume();
 }
 get latencyMs(){return this.context?((this.context.baseLatency??0)+(this.context.outputLatency??0))*1000+8192/this.context.sampleRate*500:0;}
 async devices(){return navigator.mediaDevices?.enumerateDevices?(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput'):[];}
 async stop(){this.source?.disconnect();this.worklet?.disconnect();this.worker?.terminate();this.stream?.getTracks().forEach(t=>t.stop());await this.context?.close();this.context=undefined;this.stream=undefined;this.busy=false;this.lastSound=false;}
}
