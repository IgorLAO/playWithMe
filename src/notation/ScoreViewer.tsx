import {useEffect,useRef} from 'react';
import {AlphaTabApi,LayoutMode,model} from '@coderline/alphatab';
import {DEMO_TEX,normalizeScore,type NormalizedScore} from '../music/score';
import {colorNotes} from './colors';
import {useApp} from '../practice/store';
export function ScoreViewer({onApi,loadedFile,track,zoom,layout}:{onApi:(api:AlphaTabApi|null)=>void;loadedFile:ArrayBuffer|null;track:number;zoom:number;layout:'page'|'horizontal'}){const host=useRef<HTMLDivElement>(null);const apiRef=useRef<AlphaTabApi|null>(null);const scoreRef=useRef<model.Score|null>(null);const trackRef=useRef(track);trackRef.current=track;const set=useApp(s=>s.set);const lastStates=useApp(s=>s.evaluation?.states);
 useEffect(()=>{if(!host.current)return;const api=new AlphaTabApi(host.current,{core:{fontDirectory:`${import.meta.env.BASE_URL}font/`,enableLazyLoading:false},player:{enablePlayer:true,soundFont:`${import.meta.env.BASE_URL}soundfont/sonivox.sf2`,scrollElement:host.current},display:{scale:zoom,layoutMode:layout==='page'?LayoutMode.Page:LayoutMode.Horizontal}});apiRef.current=api;onApi(api);
 api.scoreLoaded.on(score=>{scoreRef.current=score;const normalized=normalizeScore(score,trackRef.current);set({score:normalized,evaluation:null,positionMs:0});});
 api.playerPositionChanged.on(e=>set({positionMs:e.currentTime}));api.playerStateChanged.on(e=>set({playing:e.state===1}));api.tex(DEMO_TEX);
 return()=>{onApi(null);api.destroy();apiRef.current=null;};},[]);
 useEffect(()=>{const api=apiRef.current;if(!api)return;if(loadedFile)api.load(new Uint8Array(loadedFile));},[loadedFile]);
 useEffect(()=>{const api=apiRef.current;const score=scoreRef.current;if(!api||!score)return;const selected=score.tracks[track];if(selected){api.renderTracks([selected]);set({score:normalizeScore(score,track),evaluation:null});}},[track]);
 useEffect(()=>{const api=apiRef.current;if(!api)return;api.settings.display.scale=zoom;api.settings.display.layoutMode=layout==='page'?LayoutMode.Page:LayoutMode.Horizontal;api.updateSettings();api.render();},[zoom,layout]);
 useEffect(()=>{const api=apiRef.current;const score=useApp.getState().score;if(!api||!score||!lastStates)return;colorNotes(score.events,lastStates);api.render();},[lastStates]);
 return <div className="score-canvas" ref={host}/>;
}
