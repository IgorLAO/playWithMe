import {describe,it,expect,vi} from 'vitest';
import {catalog,catalogSearch,catalogFileUrl,catalogArtist,catalogTabSearchUrl,downloadCatalogScore,type CatalogEntry} from './catalog';
const entries: CatalogEntry[] = [
 {id:'espresso',kind:'reference',title:'Espresso',artist:'Sabrina Carpenter',collection:'Short n Sweet',genre:'Pop',sourceUrl:'https://example.com'},
 {id:'idiot',kind:'reference',title:'American Idiot',artist:'Green Day',collection:'American Idiot',genre:'Punk',sourceUrl:'https://example.com'},
 {id:'ella',kind:'reference',title:'Ella Baila Sola',artist:'Eslabon Armado & Peso Pluma',collection:'DESVELADO',genre:'Mexicana',sourceUrl:'https://example.com'},
 {id:'eres',kind:'reference',title:'Eres',artist:'Café Tacvba',collection:'Cuatro Caminos',genre:'Rock',sourceUrl:'https://example.com'},
];
describe('catalog',()=>{
 it('keeps open scores separate from modern references',()=>{
  expect(catalog.scoreCount).toBeGreaterThan(1400);
  expect(catalog.referenceCount).toBeGreaterThanOrEqual(30);
  expect(new Set(catalog.entries.map(e=>e.id)).size).toBe(catalog.entries.length);
 });
 it('finds a composer and title without accents',()=>{
  const entry=catalog.entries.find(e=>catalogArtist(e).toLowerCase().includes('schubert'))!;
  expect(catalogSearch(entry.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(' ')[0]+' schubert').length).toBeGreaterThan(0);
 });
 it('uses a pinned URL only for downloadable scores',()=>{
  const entry=catalog.entries.find(e=>e.kind==='score')!;
  expect(catalogFileUrl(entry)).toContain(catalog.revision);
  expect(catalogFileUrl(entry)).toMatch(/\.mxl$/);
  expect(()=>catalogFileUrl(entries[0]!)).toThrow('importada');
 });
 it('does not attempt to download commercial references',async()=>{
  const fetch=vi.spyOn(globalThis,'fetch');
  try{await expect(downloadCatalogScore(entries[0]!)).rejects.toThrow('importada');expect(fetch).not.toHaveBeenCalled();}finally{fetch.mockRestore();}
 });
 it('encodes the artist and title in the external bass tab search',()=>{
  const url=new URL(catalogTabSearchUrl(entries[2]!));
  expect(url.searchParams.get('pattern')).toBe('Eslabon Armado & Peso Pluma Ella Baila Sola');
  expect(url.searchParams.get('inst')).toBe('bass');
 });
});
describe('local vector retrieval',()=>{
 it.each(['Espresso Sabrina','sabrina espresso','espreso sabrina','sabrna carpentr'])('ranks the right title/artist for %s',query=>{
  expect(catalogSearch(query,entries)[0]?.id).toBe('espresso');
 });
 it('normalizes accents and punctuation',()=>expect(catalogSearch('cafe tacvba',entries)[0]?.id).toBe('eres'));
 it('finds a song through a collaborating artist',()=>expect(catalogSearch('peso pluma ella',entries)[0]?.id).toBe('ella'));
 it('supports genre aliases',()=>expect(catalogSearch('musica mexicana',entries).map(e=>e.id)).toEqual(['ella']));
 it('does not return unrelated songs for an unknown query',()=>expect(catalogSearch('qzxw nonexistente',entries)).toEqual([]));
 it('returns the complete catalog for an empty query',()=>expect(catalogSearch('   ',entries)).toEqual(entries));
 it('keeps exact results ahead of fuzzy alternatives',()=>expect(catalogSearch('Just for Today Abbott')).toHaveLength(1));
});
