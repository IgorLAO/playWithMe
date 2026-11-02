import type { AlphaTabApi } from '@coderline/alphatab';
import type { YouTubePlayer } from '../youtube/YouTubePlayer';
import { scoreToVideo,type Anchor } from '../youtube/sync';
export type Source='virtual'|'youtube';
export class Transport {source:Source='virtual';anchors:Anchor[]=[];offsetMs=0;constructor(public api:AlphaTabApi,public video?:YouTubePlayer){}
 play(){this.source==='youtube'?this.video?.play():this.api.play();}
 pause(){this.source==='youtube'?this.video?.pause():this.api.pause();}
 seek(ms:number){this.api.timePosition=ms;if(this.source==='youtube')this.video?.seek(scoreToVideo(ms,this.anchors,this.offsetMs));}
 position(){return this.source==='youtube'?(this.video?.position()??0)-this.offsetMs:this.api.timePosition;}
 restart(){this.pause();this.seek(0);}
}
