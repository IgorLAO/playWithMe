export type PlayerState='unstarted'|'playing'|'paused'|'buffering'|'ended';
type YTPlayer={playVideo():void;pauseVideo():void;seekTo(seconds:number,allowSeekAhead:boolean):void;getCurrentTime():number;getPlayerState():number;setPlaybackRate(rate:number):void;destroy():void};
declare global {interface Window {YT?:{Player:new(element:HTMLElement,config:object)=>YTPlayer};onYouTubeIframeAPIReady?:()=>void}}
let loading:Promise<void>|null=null;
function loadApi(){return loading??=new Promise<void>(resolve=>{if(window.YT){resolve();return;}const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';window.onYouTubeIframeAPIReady=()=>resolve();document.head.append(script);});}
export class YouTubePlayer {private player?:YTPlayer;state:PlayerState='unstarted';onState?:(state:PlayerState)=>void;
 async mount(element:HTMLElement,videoId:string){await loadApi();await new Promise<void>(resolve=>{this.player=new window.YT!.Player(element,{videoId,playerVars:{playsinline:1,origin:location.origin},events:{onReady:()=>resolve(),onStateChange:(event:{data:number})=>{this.state=({[-1]:'unstarted',[0]:'ended',[1]:'playing',[2]:'paused',[3]:'buffering'} as Record<number,PlayerState>)[event.data]??'unstarted';this.onState?.(this.state);}}});});}
 async seekAndWait(ms:number,timeoutMs=4500){this.seek(ms);const started=performance.now();while(performance.now()-started<timeoutMs){if(Math.abs(this.position()-ms)<500&&this.state!=='buffering')return true;await new Promise(resolve=>setTimeout(resolve,120));}return false;}

 play(){this.player?.playVideo();}pause(){this.player?.pauseVideo();}seek(ms:number){this.player?.seekTo(Math.max(0,ms/1000),true);}position(){return (this.player?.getCurrentTime()??0)*1000;}rate(rate:number){this.player?.setPlaybackRate(rate);}destroy(){this.player?.destroy();this.player=undefined;}
}
