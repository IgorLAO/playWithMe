import type { model } from '@coderline/alphatab';
export type ScoreEvent = { id:string; midi:number|null; startMs:number; durationMs:number; measure:number; beat:number; track:number; voice:number; string?:number; fret?:number; note?:model.Note; startTick:number; durationTick:number };
export type NormalizedScore = { title:string; artist:string; tempo:number; events:ScoreEvent[]; durationMs:number; measures:number; tracks:{index:number;name:string}[] };
// alphaTab's MIDI ticks are 960 per quarter note. Tempo changes are folded into the
// per-bar clock so the evaluator never depends on renderer coordinates.
export function normalizeScore(score:model.Score, selectedTrack=0):NormalizedScore {
  const events:ScoreEvent[]=[]; let elapsed=0; let tempo=score.tempo || 100;
  const track=score.tracks[selectedTrack];
  if (!track) return {title:score.title||'Sem título',artist:score.artist||'',tempo,events,durationMs:0,measures:0,tracks:[]};
  for(let mi=0;mi<score.masterBars.length;mi++) {
    const mb=score.masterBars[mi]!; const barStart=elapsed;
    if (mb.tempoAutomation?.value) tempo=mb.tempoAutomation.value;
    const msPerTick=60000/(tempo*960);
    const bar=track.staves[0]?.bars[mi];
    if(bar) for(const voice of bar.voices) for(const beat of voice.beats) {
      const startMs=barStart+beat.playbackStart*msPerTick;
      const durationMs=beat.playbackDuration*msPerTick;
      if(beat.isRest) events.push({id:`${selectedTrack}:${mi}:${voice.index}:${beat.index}:rest`,midi:null,startMs,durationMs,measure:mi+1,beat:1+beat.playbackStart/960,track:selectedTrack,voice:voice.index,startTick:mb.start+beat.playbackStart,durationTick:beat.playbackDuration});
      for(const note of beat.notes) events.push({id:`${selectedTrack}:${mi}:${voice.index}:${beat.index}:${note.index}`,midi:note.realValue,startMs,durationMs,measure:mi+1,beat:1+beat.playbackStart/960,track:selectedTrack,voice:voice.index,string:note.string,fret:note.fret,note,startTick:mb.start+beat.playbackStart,durationTick:beat.playbackDuration});
    }
    elapsed+=mb.calculateDuration()*msPerTick;
  }
  return {title:score.title||'Sem título',artist:score.artist||'',tempo:score.tempo||100,events:events.sort((a,b)=>a.startMs-b.startMs),durationMs:elapsed,measures:score.masterBars.length,tracks:score.tracks.map((t,index)=>({index,name:t.name||`Trilha ${index+1}`}))};
}
export const DEMO_TEX = `\\title "Primeiros passos no baixo" \\artist "PlayWithMe" \\tempo 80 \\track "Baixo elétrico" \\instrument 34 \\tuning G2 D2 A1 E1 . \\clef F4 \\ts 4 4 0.4 0.4 2.4 2.4 | 0.3 0.3 2.3 2.3 | 0.2 0.2 2.2 2.2 | 0.1 0.1 2.1 2.1 | 2.2 0.2 2.3 0.3 | 2.4 0.4 2.4 0.4 | 0.3 2.3 0.2 2.2 | 0.4.2 r.2 0.4.2 r.2`;
