import {describe,it,expect} from 'vitest';import {PracticeEvaluator} from './evaluator';import type {ScoreEvent} from '../music/score';
const events:ScoreEvent[]=[{id:'a',midi:28,startMs:0,durationMs:500,measure:1,beat:1,track:0,voice:0,startTick:0,durationTick:960},{id:'b',midi:28,startMs:500,durationMs:500,measure:1,beat:2,track:0,voice:0,startTick:960,durationTick:960}];
const frame=(midi:number,timestamp:number,onset=true)=>({hz:41.2,midi,confidence:.95,rms:.1,timestamp,onset});
describe('practice evaluator',()=>{it('marks correct note',()=>{const e=new PracticeEvaluator(events);expect(e.update(30,frame(28,100)).states.a).toBe('CORRECT');});it('confirms wrong note only after stable time',()=>{const e=new PracticeEvaluator(events);expect(e.update(30,frame(31,100)).restart).toBe(false);expect(e.update(90,frame(31,230)).restart).toBe(true);});it('walkthrough continues',()=>{const e=new PracticeEvaluator(events,'walkthrough');e.update(30,frame(31,100));expect(e.update(90,frame(31,230)).restart).toBe(false);});});

describe('repeated notes',()=>{it('requires a new onset for the second event',()=>{const e=new PracticeEvaluator(events);e.update(10,frame(28,100));expect(e.update(510,frame(28,600,false)).states.b).toBe('ACTIVE');expect(e.update(520,frame(28,650,true)).states.b).toBe('CORRECT');});});

describe('error feedback and recovery',()=>{
 it('captures the expected and detected notes only after confirmation, including timestamp zero',()=>{
  const e=new PracticeEvaluator(events);
  expect(e.update(0,frame(31,0)).lastMistake).toBeNull();
  const result=e.update(120,frame(31,120));
  expect(result.lastMistake).toEqual({eventId:'a',expected:28,detected:31,measure:1,timestamp:120});
  expect(result.restart).toBe(true);
  e.reset();
  expect(e.update(0,null).lastMistake).toBeNull();
 });
 it('requires continuous wrong pitch even when a matching pitch has no onset',()=>{
  const e=new PracticeEvaluator(events);
  e.update(10,frame(31,100));
  e.update(50,frame(28,150,false));
  expect(e.update(100,frame(31,250)).states.a).toBe('ACTIVE');
 });
 it('does not carry the error window across score events',()=>{
  const e=new PracticeEvaluator(events);
  e.update(660,frame(31,100));
  const result=e.update(680,frame(31,230));
  expect(result.states.a).toBe('MISSED');
  expect(result.states.b).toBe('ACTIVE');
  expect(result.lastMistake).toBeNull();
 });
 it('allows correcting a wrong note in wait mode',()=>{
  const e=new PracticeEvaluator(events,'wait');
  e.update(0,frame(31,100));
  expect(e.update(0,frame(31,230)).states.a).toBe('INCORRECT');
  const corrected=e.update(0,frame(28,300));
  expect(corrected.states.a).toBe('CORRECT');
  expect(corrected.currentId).toBe('a');
  expect(corrected.lastMistake).toBeNull();
  expect(corrected.restart).toBe(false);
 });
 it('clears an interrupted wrong pitch window on silence',()=>{
  const e=new PracticeEvaluator(events);
  e.update(0,frame(31,100));e.update(20,null);
  expect(e.update(100,frame(31,250)).states.a).toBe('ACTIVE');
 });
});
