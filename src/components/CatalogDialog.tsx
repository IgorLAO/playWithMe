import {useDeferredValue,useMemo,useRef,useState} from 'react';
import {catalog,catalogArtist,catalogSearch,catalogTabSearchUrl,genres,type CatalogEntry,type Genre} from '../library/catalog';
export function CatalogDialog({onClose,onAdd,addedIds}:{onClose:()=>void;onAdd:(entry:CatalogEntry,file?:File)=>Promise<void>;addedIds:Set<string>}) {
 const [query,setQuery]=useState(''),[limit,setLimit]=useState(30),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState('');
 const [genre,setGenre]=useState<Genre|''>(''),[availability,setAvailability]=useState('all');
 const importInput=useRef<HTMLInputElement>(null),importEntry=useRef<CatalogEntry|null>(null);
 const deferred=useDeferredValue(query);
 const results=useMemo(()=>catalogSearch(deferred).filter(e=>(!genre||e.genre===genre)&&(availability==='all'||e.kind===availability)),[deferred,genre,availability]);
 async function add(entry:CatalogEntry,file?:File){setBusy(entry.id);setError('');try{await onAdd(entry,file);}catch(cause){setError(cause instanceof Error?cause.message:'Não foi possível adicionar a partitura');}finally{setBusy(null);}}
 return <div className="catalog-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
  <section className="catalog-dialog" role="dialog" aria-modal="true" aria-label="Catálogo de partituras" onKeyDown={event=>{if(event.key==='Escape')onClose();}}>
   <header className="catalog-header"><div><span className="eyebrow">EXPLORE SEU PRÓXIMO SOM</span><h2>Encontre uma música</h2><p>{catalog.referenceCount} músicas de pop, punk, mexicana e outros estilos, além de {catalog.scoreCount.toLocaleString('pt-BR')} partituras abertas. Busque por música ou artista, mesmo com pequenos erros de digitação.</p></div><button className="catalog-close" aria-label="Fechar catálogo" onClick={onClose}>×</button></header>
   <div className="catalog-search"><span>⌕</span><input autoFocus aria-label="Buscar no catálogo" placeholder="Música ou artista: Espresso, Green Day, Peso Pluma…" value={query} onChange={e=>{setQuery(e.target.value);setLimit(30);}}/><b>{results.length.toLocaleString('pt-BR')} resultados</b></div>
   <div className="catalog-filters"><label>Estilo<select aria-label="Estilo" value={genre} onChange={e=>{setGenre(e.target.value as Genre|'');setLimit(30);}}><option value="">Todos os estilos</option>{genres.map(g=><option key={g}>{g}</option>)}</select></label><label>Partitura<select aria-label="Partitura" value={availability} onChange={e=>{setAvailability(e.target.value);setLimit(30);}}><option value="all">Todas as músicas</option><option value="score">Download disponível</option><option value="reference">Importar meu arquivo</option></select></label><small>Ordenadas por relevância</small></div>
   <input ref={importInput} type="file" aria-label="Arquivo da música selecionada" hidden accept=".gp,.gp3,.gp4,.gp5,.gpx,.gp7,.gp8,.xml,.musicxml,.mxl" onChange={e=>{const file=e.target.files?.[0];const entry=importEntry.current;e.target.value='';if(file&&entry)void add(entry,file);}}/>
   {error&&<p className="catalog-error" role="alert">{error}</p>}
   <div className="catalog-results">{results.slice(0,limit).map(entry=><div className="catalog-row" key={entry.id}>
    <div className="catalog-art" aria-hidden="true">♫</div><div className="catalog-copy"><strong>{entry.title}</strong><span>{catalogArtist(entry)}</span><small className="catalog-badge">{entry.genre} · {entry.kind==='score'?'MXL disponível · CC0':'Partitura não incluída'}</small></div>
    <div className="catalog-row-actions">{entry.kind==='reference'&&<a href={catalogTabSearchUrl(entry)} target="_blank" rel="noreferrer" aria-label={`Buscar tablatura de ${entry.title} por ${catalogArtist(entry)}`}>Buscar tablatura ↗</a>}
     <button onClick={()=>{if(entry.kind==='score')void add(entry);else{importEntry.current=entry;importInput.current?.click();}}} disabled={busy!==null||addedIds.has(entry.id)}>{busy===entry.id?'Adicionando...':addedIds.has(entry.id)?'Adicionada':entry.kind==='score'?'Adicionar':'Importar partitura'}</button>
    </div></div>)}
    {results.length===0&&<div className="catalog-empty">Nenhuma música encontrada. Tente outro título, artista ou estilo.</div>}{limit<results.length&&<button className="catalog-more" onClick={()=>setLimit(limit+30)}>Mostrar mais 30</button>}
   </div>
   <footer className="catalog-footer"><span>“Buscar tablatura” abre uma busca no Songsterr. Para praticar aqui, importe Guitar Pro ou MusicXML/MXL; PDF não é aceito. As partituras abertas vêm do <a href={catalog.repository} target="_blank" rel="noreferrer">OpenScore Lieder</a> (CC0, voz e piano). Títulos e artistas do catálogo moderno: Apple iTunes.</span></footer>
  </section>
 </div>;
}
