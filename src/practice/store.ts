import {create} from 'zustand';
import type {PitchFrame} from '../audio/pitch';
import type {NormalizedScore} from '../music/score';
import type {Evaluation,PracticeMode} from './evaluator';
export type AppState={score:NormalizedScore|null;frame:PitchFrame|null;evaluation:Evaluation|null;mode:PracticeMode;playing:boolean;micOn:boolean;positionMs:number;set:(patch:Partial<AppState>)=>void};
export const useApp=create<AppState>(set=>({score:null,frame:null,evaluation:null,mode:'strict',playing:false,micOn:false,positionMs:0,set}));
