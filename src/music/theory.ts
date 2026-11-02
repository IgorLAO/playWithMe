export const NAMES = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
export function midiToFrequency(midi: number) { return 440 * 2 ** ((midi - 69) / 12); }
export function frequencyToMidi(hz: number) { return 69 + 12 * Math.log2(hz / 440); }
export function noteName(midi: number) { const n=Math.round(midi); return `${NAMES[((n%12)+12)%12]}${Math.floor(n/12)-1}`; }
export function centsFromMidi(hz: number, midi: number) { return 1200 * Math.log2(hz / midiToFrequency(midi)); }
export const TUNINGS = { standard: [43,38,33,28], five: [43,38,33,28,23], dropD: [43,38,33,26] } as const;
export function fretPositions(midi: number, tuning: readonly number[]) { return tuning.flatMap((open,i) => { const fret=midi-open; return fret>=0&&fret<=24 ? [{string:i+1,fret}] : []; }); }
export function parseTuning(input:string):number[]|null { const parts=input.trim().split(/[\s,]+/);if(parts.length<4||parts.length>8)return null;const values=parts.map(part=>{const match=/^([A-Ga-g])([#♯b♭]?)(-?\d)$/.exec(part);if(!match)return NaN;const base:{[key:string]:number}={C:0,D:2,E:4,F:5,G:7,A:9,B:11};return (Number(match[3])+1)*12+base[match[1]!.toUpperCase()]!+(match[2]==='#'||match[2]==='♯'?1:match[2]==='b'||match[2]==='♭'?-1:0)});if(values.some(Number.isNaN))return null;return values[0]!<values.at(-1)!?values.reverse():values;}
