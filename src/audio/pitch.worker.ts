import { detectPitch } from './pitch';
self.onmessage=(e:MessageEvent<{samples:Float32Array;sampleRate:number;noiseFloor:number}>)=>{ const {samples,sampleRate,noiseFloor}=e.data; self.postMessage(detectPitch(samples,sampleRate,noiseFloor)); };
