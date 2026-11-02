import {WorkshopWordmark} from './WorkshopWordmark';
import type {PracticeMode} from '../practice/evaluator';
export function WorkshopMasthead({micOn,playing,mode,tempo,onToggleMic}:{micOn:boolean;playing:boolean;mode:PracticeMode;tempo:number;onToggleMic:()=>void}) {
 return <>
  <a className="skip-link" href="#pratica">Ir para a partitura</a>
  <header className="masthead">
   <div className="edition-line"><span>OFICINA DE MÚSICA · EDIÇÃO PARA CONTRABAIXO</span><span>EST. 1945 <b aria-hidden="true">✳</b> SÉRIE Nº 01</span></div>
   <div className="masthead-main">
    <div className="identity"><WorkshopWordmark/><div className="workshop-title"><span>THE MUSIC WORKSHOP</span><small>LEITURA / ESCUTA / PRÁTICA</small></div></div>
    <div className="workshop-seal" aria-hidden="true"><svg viewBox="0 0 180 130"><circle cx="84" cy="65" r="55"/><circle cx="84" cy="65" r="43"/><circle cx="84" cy="65" r="31"/><circle cx="84" cy="65" r="9" className="seal-center"/><path d="M10 103 155 20M16 113 161 30M22 123 167 40M4 93 149 10"/><path d="m131 4 40 19-7 39-41-22Z" className="seal-head"/><path d="M0 65h23m122 0h35M84 0v9m0 112v18"/></svg><span>PRECISÃO EM CADA NOTA</span></div>
   </div>
   <div className="station-bar"><nav aria-label="Navegação da oficina"><a href="#pratica"><b>01</b> Prática</a><a href="#biblioteca"><b>02</b> Acervo</a><a href="#configuracao"><b>03</b> Ajustes</a></nav><div className="station-status"><span className="session-label">TOMADA 01 · {playing?'EM CURSO':'EM ESPERA'}</span><span className="tempo-chip">♩ {Math.round(tempo)} BPM</span><span className="mode-chip">{mode==='strict'?'Strict Mode':mode==='walkthrough'?'Walkthrough':'Wait-for-Note'}</span><button className={`mic-chip ${micOn?'connected':''}`} onClick={onToggleMic}><i aria-hidden="true"/>{micOn?'Microfone ativo':'Conectar microfone'}</button></div></div>
  </header>
 </>;
}
