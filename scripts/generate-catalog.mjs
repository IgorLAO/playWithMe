import {writeFile} from 'node:fs/promises';
const repo='OpenScore/Lieder';
async function github(path){const response=await fetch(`https://api.github.com/repos/${repo}/${path}`,{headers:{Accept:'application/vnd.github+json','User-Agent':'PlayWithMe-catalog-generator'}});if(!response.ok)throw new Error(`GitHub API ${response.status}: ${path}`);return response.json();}
const commit=await github('commits/main');
const sha=commit.sha;
const tree=await github(`git/trees/${sha}?recursive=1`);
if(tree.truncated)throw new Error('GitHub returned a truncated tree; catalog would be incomplete');
const entries=tree.tree.filter(item=>item.type==='blob'&&item.path.startsWith('scores/')&&item.path.endsWith('.mxl')).map(item=>{
 const parts=item.path.split('/');const composer=parts[1].replaceAll('_',' ').replace(/^([^,]+),\s*(.+)$/,'$2 $1');
 const title=parts.at(-2).replaceAll('_',' ');
 const collection=parts.slice(2,-2).filter(part=>part!=='_').join(' · ').replaceAll('_',' ');
 return {id:`openscore-lieder:${item.path}`,title,composer,collection,path:item.path,size:item.size??0};
}).sort((a,b)=>a.title.localeCompare(b.title));
await writeFile('src/library/catalog.json',JSON.stringify({source:'OpenScore Lieder',license:'CC0-1.0',repository:'https://github.com/OpenScore/Lieder',revision:sha,entries}));
console.log(`Indexed ${entries.length} CC0 MXL scores from ${repo}@${sha}`);
