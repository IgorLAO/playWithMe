import type { ScoreEvent } from '../music/score';
import type { PitchFrame } from '../audio/pitch';
export type NoteStatus = 'PENDING' | 'ACTIVE' | 'CORRECT' | 'INCORRECT' | 'MISSED';
export type PracticeMode = 'strict' | 'walkthrough' | 'wait';
export type Mistake = { eventId: string; expected: number; detected: number; measure: number; timestamp: number };
export type Evaluation = { states: Record<string, NoteStatus>; restart: boolean; currentId: string | null; correct: number; incorrect: number; missed: number; lastMistake: Mistake | null };
export class PracticeEvaluator {
 readonly states: Record<string, NoteStatus> = {};
 private wrongSince: number | null = null;
 private wrongEvent: string | null = null;
 private lastMistake: Mistake | null = null;
 constructor(private events: ScoreEvent[], public mode: PracticeMode = 'strict', public autoRestart = true, public toleranceMs = 170, public centsTolerance = 45) { this.reset(); }
 reset() {
  for (const e of this.events) this.states[e.id] = 'PENDING';
  this.wrongSince = null;
  this.wrongEvent = null;
  this.lastMistake = null;
 }
 update(timeMs: number, frame: PitchFrame | null): Evaluation {
  const notes = this.events.filter(e => e.midi !== null);
  let active: ScoreEvent | null = null;
  for (const e of notes) {
   if (this.states[e.id] === 'PENDING' && timeMs >= e.startMs - this.toleranceMs) this.states[e.id] = 'ACTIVE';
   if (this.states[e.id] === 'ACTIVE' && timeMs > e.startMs + e.durationMs + this.toleranceMs) this.states[e.id] = 'MISSED';
   const canAttempt = this.states[e.id] === 'ACTIVE' || (this.mode === 'wait' && this.states[e.id] === 'INCORRECT');
   if (canAttempt && timeMs >= e.startMs - this.toleranceMs && timeMs <= e.startMs + e.durationMs + this.toleranceMs) { active = e; break; }
  }
  if (this.wrongEvent !== active?.id) this.wrongSince = null;
  this.wrongEvent = active?.id ?? null;
  if (active && frame?.midi !== null && frame?.midi !== undefined && frame.confidence >= .78) {
   const match = Math.abs(frame.midi - active.midi!) * 100 <= this.centsTolerance;
   if (match) {
    // A matching pitch interrupts the error window, even without a new attack.
    this.wrongSince = null;
    if (frame.onset) {
     this.states[active.id] = 'CORRECT';
     this.lastMistake = null;
    }
   } else {
    this.wrongSince ??= frame.timestamp;
    if (frame.timestamp - this.wrongSince >= 115 && this.states[active.id] !== 'INCORRECT') {
     this.states[active.id] = 'INCORRECT';
     this.lastMistake = { eventId: active.id, expected: active.midi!, detected: frame.midi, measure: active.measure, timestamp: frame.timestamp };
     this.wrongSince = null;
    }
   }
  } else this.wrongSince = null;
  const values = Object.values(this.states);
  const incorrect = values.filter(x => x === 'INCORRECT').length;
  return { states: { ...this.states }, restart: this.mode === 'strict' && this.autoRestart && incorrect > 0, currentId: active?.id ?? null, correct: values.filter(x => x === 'CORRECT').length, incorrect, missed: values.filter(x => x === 'MISSED').length, lastMistake: this.lastMistake };
 }
}
