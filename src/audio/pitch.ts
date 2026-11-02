import { frequencyToMidi } from '../music/theory';
export type PitchFrame={hz:number;midi:number;confidence:number;rms:number;timestamp:number;onset:boolean}|{hz:null;midi:null;confidence:0;rms:number;timestamp:number;onset:false};
// YIN difference / cumulative mean normalized difference, with a harmonic guard.
export function detectPitch(samples:Float32Array,sampleRate:number,noiseFloor=0.008):PitchFrame {
 const time=performance.now(); let power=0; for(const x of samples) power+=x*x;
 const rms=Math.sqrt(power/samples.length); if(rms<noiseFloor) return {hz:null,midi:null,confidence:0,rms,timestamp:time,onset:false};
 const step=2, n=Math.floor(samples.length/step), minLag=Math.floor(sampleRate/(step*400)), maxLag=Math.min(Math.ceil(sampleRate/(step*28)),Math.floor(n/2));
 const d=new Float32Array(maxLag+1); let sum=0,best=0,bestVal=1;
 for(let lag=1;lag<=maxLag;lag++) { let diff=0; for(let i=0;i<n-lag;i++){const delta=samples[i*step]!-samples[(i+lag)*step]!;diff+=delta*delta;} d[lag]=diff; }
 const cmnd=new Float32Array(maxLag+1);
 for(let lag=1;lag<=maxLag;lag++){sum+=d[lag]!;cmnd[lag]=lag*d[lag]!/(sum||1);if(lag>=minLag&&cmnd[lag]!<bestVal){bestVal=cmnd[lag]!;best=lag;}}
 for(let lag=minLag;lag<maxLag-1;lag++){if(cmnd[lag]!<0.15&&cmnd[lag]!<=cmnd[lag+1]!){best=lag;bestVal=cmnd[lag]!;break;}}
 if(!best||bestVal>0.22) return {hz:null,midi:null,confidence:0,rms,timestamp:time,onset:false};
 const a=cmnd[best-1]??cmnd[best]!,b=cmnd[best]!,c=cmnd[best+1]??cmnd[best]!; const shift=(a-c)/(2*(a-2*b+c)||1); const hz=sampleRate/(step*(best+Math.max(-1,Math.min(1,shift))));
 return {hz,midi:frequencyToMidi(hz),confidence:Math.max(0,1-bestVal),rms,timestamp:time,onset:false};
}
