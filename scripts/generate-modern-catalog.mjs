import {readFile,writeFile,rename} from 'node:fs/promises';
// Pinned track IDs avoid covers, live versions and changes in search ranking.
const seeds=JSON.parse(await readFile(new URL('./modern-catalog-seeds.json',import.meta.url),'utf8'));
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const url=new URL('https://itunes.apple.com/lookup');
url.search=new URLSearchParams({id:seeds.map(s=>s[3]).join(','),entity:'song',country:'US'}).toString();
const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error(`Metadata lookup failed (${response.status})`);
const {results}=await response.json();
const entries=seeds.map(([artist,title,genre,id])=>{
 const track=results.find(t=>t.trackId===id);
 if(!track||normalize(track.trackName)!==normalize(title)||!normalize(track.artistName).includes(normalize(artist)))throw new Error(`Metadata mismatch: ${artist} — ${title} (${id})`);
 return {id:`itunes:${track.trackId}`,title:track.trackName,artist:track.artistName,collection:track.collectionName,genre,sourceUrl:track.trackViewUrl};
});
if(new Set(entries.map(e=>e.id)).size!==entries.length)throw new Error('Duplicate tracks');
const target=new URL('../src/library/modern-catalog.json',import.meta.url);
const temporary=new URL('../src/library/modern-catalog.json.tmp',import.meta.url);
await writeFile(temporary,JSON.stringify({source:'Apple iTunes API (metadata only)',updatedAt:new Date().toISOString().slice(0,10),entries},null,2)+'\n');
await rename(temporary,target);
console.log(`Verified ${entries.length} music references. No scores or audio downloaded.`);
