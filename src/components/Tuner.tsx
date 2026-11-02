import type {PitchFrame} from '../audio/pitch';
import {centsFromMidi,noteName} from '../music/theory';
export function Tuner({frame,latency,noiseFloor,onNoiseFloor}:{frame:PitchFrame|null;latency:number;noiseFloor:number;onNoiseFloor:(n:number)=>void}) {
 const midi=frame?.midi??null;
 const cents=midi!==null?centsFromMidi(frame!.hz!,Math.round(midi)):0;
 const weak=!!frame&&frame.rms>=noiseFloor&&(midi===null||frame.confidence<.78);
 const status=weak?'SINAL INCERTO':midi===null?'AGUARDANDO SINAL':'SINAL IDENTIFICADO';
 const angle=Math.max(-60,Math.min(60,cents*1.2));
 return <section className={`panel tuner ${weak?'signal-weak':''}`} aria-label="Afinador e diagnóstico">
  <div className="panel-heading"><div><span className="eyebrow">INSTRUMENTO DE MEDIÇÃO / A–01</span><h2>Escuta ao vivo</h2></div><span className={`live-dot ${midi!==null?'on':''}`} aria-hidden="true"/></div>
  <div className="analog-gauge" aria-hidden="true"><svg viewBox="0 0 260 120"><path className="gauge-arc" d="M47.7 64.5 A95 95 0 0 1 212.3 64.5"/>{Array.from({length:21},(_,i)=>{const a=(-150+i*6)*Math.PI/180;return <line key={i} x1={130+Math.cos(a)*95} y1={112+Math.sin(a)*95} x2={130+Math.cos(a)*(i%5===0?80:87)} y2={112+Math.sin(a)*(i%5===0?80:87)}/>;})}<text x="30" y="112">−50</text><text x="124" y="11">0</text><text x="208" y="112">+50</text><text x="104" y="84" className="gauge-unit">CENTS</text><g className="gauge-needle" style={{transform:`rotate(${angle}deg)`}}><path d="M127 112 130 42 133 112Z"/></g><circle cx="130" cy="112" r="6"/></svg></div>
  <div className="meter-labels"><span>GRAVE</span><b>{midi===null?'SEM LEITURA':`${Math.round(cents)>0?'+':''}${Math.round(cents)} cents`}</b><span>AGUDO</span></div>
  <div className="note-readout"><strong>{midi===null?'—':noteName(midi)}</strong><span>{frame?.hz?`${frame.hz.toFixed(1)} Hz`:'— Hz'}<small>FREQUÊNCIA</small></span></div>
  <p className="signal-label">{status}</p>
  <div className="diagnostics"><div><span>Confiança</span><b>{Math.round((frame?.confidence??0)*100)}%</b></div><div><span>Volume</span><b>{Math.round((frame?.rms??0)*1000)/10}%</b></div><div><span>Latência estimada</span><b>{Math.round(latency)} ms</b></div></div>
  <label className="noise-control">Filtro de ruído<input type="range" min="0.002" max="0.05" step="0.002" value={noiseFloor} onChange={e=>onNoiseFloor(Number(e.target.value))}/><span>{noiseFloor.toFixed(3)}</span></label>
 </section>;
}
