import manifest from './catalog.json';
import modern from './modern-catalog.json';
import {createVectorSearch} from './vector-search';
export const genres = ['Pop', 'Punk', 'Mexicana', 'Rock', 'Latina', 'Funk / Soul', 'Clássica'] as const;
export type Genre = typeof genres[number];
type BaseEntry = { id: string; title: string; collection: string; genre: Genre };
export type OpenScoreEntry = BaseEntry & { kind: 'score'; composer: string; path: string; size: number };
export type ReferenceEntry = BaseEntry & { kind: 'reference'; artist: string; sourceUrl: string };
export type CatalogEntry = OpenScoreEntry | ReferenceEntry;
export function catalogArtist(entry: CatalogEntry) { return entry.kind === 'score' ? entry.composer : entry.artist; }
const references: ReferenceEntry[] = modern.entries.map(e => ({...e, kind: 'reference', genre: e.genre as Genre}));
const scores: OpenScoreEntry[] = manifest.entries.map(e => ({...e, kind: 'score', genre: 'Clássica'}));
export const catalog = { source: manifest.source, license: manifest.license, repository: manifest.repository, revision: manifest.revision, entries: [...references, ...scores] as CatalogEntry[], scoreCount: scores.length, referenceCount: references.length };
const searchCache = new WeakMap<readonly CatalogEntry[], (query: string) => CatalogEntry[]>();
export function catalogSearch(query: string, entries: readonly CatalogEntry[] = catalog.entries): CatalogEntry[] {
 let search = searchCache.get(entries);
 if (!search) {
  search = createVectorSearch(entries, e => ({title: e.title, artist: catalogArtist(e), collection: e.collection, tags: `${e.genre} ${e.genre === 'Mexicana' ? 'mexicano mexico regional corridos tumbados' : ''}`}));
  searchCache.set(entries, search);
 }
 return search(query);
}
export function catalogTabSearchUrl(entry: CatalogEntry): string {
 const url = new URL('https://www.songsterr.com/');
 url.search = new URLSearchParams({pattern: `${catalogArtist(entry)} ${entry.title}`, inst: 'bass'}).toString();
 return url.toString();
}
export function catalogFileUrl(entry: CatalogEntry): string {
 if (entry.kind !== 'score') throw new Error('Esta música precisa de uma partitura importada.');
 return `https://raw.githubusercontent.com/OpenScore/Lieder/${catalog.revision}/${entry.path.split('/').map(encodeURIComponent).join('/')}`;
}
export async function downloadCatalogScore(entry: CatalogEntry, signal?: AbortSignal): Promise<ArrayBuffer> {
 const response = await fetch(catalogFileUrl(entry), {signal});
 if (!response.ok) throw new Error(`Download falhou (${response.status})`);
 const data = await response.arrayBuffer();
 const header = new Uint8Array(data, 0, Math.min(4, data.byteLength));
 if (data.byteLength < 4 || header[0] !== 0x50 || header[1] !== 0x4b) throw new Error('O arquivo recebido não é uma partitura MXL válida');
 return data;
}
