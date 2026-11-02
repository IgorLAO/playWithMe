import type { ScoreEvent } from '../music/score';
import type { PitchFrame } from '../audio/pitch';
export type NoteStatus='PENDING'|'ACTIVE'|'CORRECT'|'INCORRECT'|'MISSED';
export type PracticeMode='strict'|'walkthrough'|'wait';
export type Evaluation={states:Record<string,NoteStatus>;restart:boolean;currentId:string|null;correct:number;incorrect:number;missed:number};
export class PracticeEvaluator {
 readonly states:Record<string,NoteStatus>={}; private wrongSince=0;private acceptedOnset=new Set<string>();
 constructor(private events:ScoreEvent[],public mode:PracticeMode='strict',public autoRestart=true,public toleranceMs=170,public centsTolerance=45) {this.reset();}
 reset(){for(const e of this.events)this.states[e.id]='PENDING';this.wrongSince=0;this.acceptedOnset.clear();}
 update(timeMs:number,frame:PitchFrame|null):Evaluation {
  const notes=this.events.filter(e=>e.midi!==null);let active:ScoreEvent|null=null;
  for(const e of notes){const state=this.states[e.id];if(state==='PENDING'&&timeMs>=e.startMs-this.toleranceMs)this.states[e.id]='ACTIVE';if(this.states[e.id]==='ACTIVE'&&timeMs>e.startMs+e.durationMs+this.toleranceMs){this.states[e.id]='MISSED';}if(this.states[e.id]==='ACTIVE'&&timeMs>=e.startMs-this.toleranceMs&&timeMs<=e.startMs+e.durationMs+this.toleranceMs){active=e;break;}}
  if(active&&frame?.midi!==null&&frame?.midi!==undefined&&frame.confidence>=.78){
   const target=active.midi!; const match=Math.abs(frame.midi-target)*100<=this.centsTolerance;
   const key=active.id; const onset=frame.onset;
   if(match && onset && !this.acceptedOnset.has(key)){this.states[key]='CORRECT';this.acceptedOnset.add(key);this.wrongSince=0;}
   else if(!match){if(!this.wrongSince)this.wrongSince=frame.timestamp; if(frame.timestamp-this.wrongSince>=115){this.states[key]='INCORRECT';this.wrongSince=0;}}
  } else this.wrongSince=0;
  const values=Object.values(this.states);const incorrect=values.filter(x=>x==='INCORRECT').length;
  return {states:{...this.states},restart:this.mode==='strict'&&this.autoRestart&&incorrect>0,currentId:active?.id??null,correct:values.filter(x=>x==='CORRECT').length,incorrect,missed:values.filter(x=>x==='MISSED').length};
 }
}
