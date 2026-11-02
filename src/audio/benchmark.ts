import {detectPitch} from './pitch';
const cases=[['B0',30.868],['E1',41.203],['A1',55],['D2',73.416],['G2',98],['G3',196]] as const;
for(const [name,hz] of cases){const data=new Float32Array(8192);for(let i=0;i<data.length;i++)data[i]=.15*Math.sin(2*Math.PI*hz*i/48000)+.18*Math.sin(4*Math.PI*hz*i/48000);const start=performance.now();let correct=0;for(let i=0;i<20;i++){const p=detectPitch(data,48000);if(p.hz&&Math.abs(1200*Math.log2(p.hz/hz))<35)correct++;}console.log(`${name}\t${correct}/20\t${((performance.now()-start)/20).toFixed(2)} ms/frame`);}
