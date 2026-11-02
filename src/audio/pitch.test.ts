import {describe,it,expect} from 'vitest';
import {detectPitch} from './pitch';
import {midiToFrequency,frequencyToMidi,noteName} from '../music/theory';
function tone(hz:number,harmonic=0){const samples=new Float32Array(8192);for(let i=0;i<samples.length;i++)samples[i]=.15*Math.sin(2*Math.PI*hz*i/48000)+harmonic*Math.sin(4*Math.PI*hz*i/48000);return samples;}
describe('bass pitch',()=>{it.each([31,41.203,55,73.416,98,196])('recognizes %.2f Hz',hz=>{const p=detectPitch(tone(hz,.18),48000);expect(p.hz).not.toBeNull();expect(Math.abs(p.hz!-hz)).toBeLessThan(1);});it('rejects silence',()=>expect(detectPitch(new Float32Array(8192),48000).hz).toBeNull());it('maps notes',()=>{expect(noteName(frequencyToMidi(41.203))).toBe('E1');expect(midiToFrequency(23)).toBeCloseTo(30.868,2);});});
