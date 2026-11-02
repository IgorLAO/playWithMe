import { model } from '@coderline/alphatab';
import type { ScoreEvent } from '../music/score';
import type { NoteStatus } from '../practice/evaluator';
const palette:Record<NoteStatus,string>={PENDING:'#191919',ACTIVE:'#456577',CORRECT:'#626747',INCORRECT:'#b52b24',MISSED:'#b52b24'};
export function colorNotes(events:ScoreEvent[],states:Record<string,NoteStatus>){for(const e of events){if(!e.note)continue;const color=model.Color.fromJson(palette[states[e.id]??'PENDING']);e.note.style??=new model.NoteStyle();if(color){e.note.style.colors.set(model.NoteSubElement.StandardNotationNoteHead,color);e.note.style.colors.set(model.NoteSubElement.GuitarTabFretNumber,color);}}}
