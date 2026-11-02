declare class AudioWorkletProcessor { readonly port: MessagePort; constructor(); }
declare function registerProcessor(name:string, ctor:typeof AudioWorkletProcessor):void;
class BassCapture extends AudioWorkletProcessor {
 private ring=new Float32Array(8192); private write=0; private count=0; private hop=0; private selectedChannel=-1;
 constructor(){super();this.port.onmessage=(event:MessageEvent<{channel:number}>)=>{this.selectedChannel=event.data.channel;};}
 process(inputs:Float32Array[][]) {
  const channels=inputs[0];if(!channels?.length)return true;
  let channel=channels[this.selectedChannel]??channels[0]!;
  if(this.selectedChannel<0&&channels.length>1){let best=-1;for(const candidate of channels){let power=0;for(const sample of candidate)power+=sample*sample;if(power>best){best=power;channel=candidate;}}}
  for(const x of channel){this.ring[this.write]=x;this.write=(this.write+1)%this.ring.length;this.count=Math.min(this.count+1,this.ring.length);if(++this.hop>=2048&&this.count===this.ring.length){this.hop=0;const out=new Float32Array(this.ring.length);out.set(this.ring.subarray(this.write));out.set(this.ring.subarray(0,this.write),this.ring.length-this.write);this.port.postMessage(out,[out.buffer]);}}
  return true;
 }
}
registerProcessor('bass-capture',BassCapture);
