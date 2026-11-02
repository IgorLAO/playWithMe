import { useEffect, useState } from 'react';
import { noteName } from '../music/theory';
import type { Mistake } from '../practice/evaluator';

export function PracticeFeedback({ mistake, restarting, waiting }: { mistake: Mistake | null; restarting: boolean; waiting: boolean }) {
 const [visible, setVisible] = useState(false);
 useEffect(() => {
  setVisible(!!mistake);
  if (!mistake || waiting) return;
  const timer = window.setTimeout(() => setVisible(false), 3500);
  return () => clearTimeout(timer);
 }, [mistake, waiting]);
 return <div className={`practice-feedback ${visible && mistake ? 'has-mistake' : ''}`} role="status" aria-live="polite" aria-atomic="true">
  {visible && mistake ? <>
   <span className="feedback-icon" aria-hidden="true">✕</span>
   <div><strong>Nota incorreta</strong><p>Esperada: <b>{noteName(mistake.expected)}</b> · Você tocou: <b>{noteName(mistake.detected)}</b></p><small>Compasso {mistake.measure} · {restarting ? 'Reiniciando o exercício…' : waiting ? 'Tente novamente a nota esperada para avançar.' : 'Continue tocando. O erro ficou marcado na partitura.'}</small></div>
  </> : <><span className="feedback-index" aria-hidden="true">↗</span><span><b>GUIA DE PRÁTICA</b> Toque a nota indicada. Confira sua execução abaixo.</span></>}
 </div>;
}
