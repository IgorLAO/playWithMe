import manifest from './catalog.json';
import modern from './modern-catalog.json';
import { createVectorSearch } from './vector-search';
export const genres = [
  'Pop',
  'Punk',
  'Mexicana',
  'Rock',
  'Latina',
  'Funk / Soul',
  'Clássica',
] as const;
export type Genre = (typeof genres)[number];
type BaseEntry = {
  id: string;
  title: string;
  collection: string;
  genre: Genre;
};
export type OpenScoreEntry = BaseEntry & {
  kind: 'score';
  composer: string;
  path: string;
  size: number;
};
export type ReferenceEntry = BaseEntry & {
  kind: 'reference';
  artist: string;
  sourceUrl: string;
};
export type CatalogEntry = OpenScoreEntry | ReferenceEntry;
export function catalogArtist(entry: CatalogEntry) {
  return entry.kind === 'score' ? entry.composer : entry.artist;
}
const references: ReferenceEntry[] = modern.entries.map((e) => ({
  ...e,
  kind: 'reference',
  genre: e.genre as Genre,
}));
const scores: OpenScoreEntry[] = manifest.entries.map((e) => ({
  ...e,
  kind: 'score',
  genre: 'Clássica',
}));
export const catalog = {
  source: manifest.source,
  license: manifest.license,
  repository: manifest.repository,
  revision: manifest.revision,
  entries: [...references, ...scores] as CatalogEntry[],
  scoreCount: scores.length,
  referenceCount: references.length,
};
const searchCache = new WeakMap<
  readonly CatalogEntry[],
  (query: string) => CatalogEntry[]
>();
export function catalogSearch(
  query: string,
  entries: readonly CatalogEntry[] = catalog.entries,
): CatalogEntry[] {
  let search = searchCache.get(entries);
  if (!search) {
    search = createVectorSearch(entries, (e) => ({
      title: e.title,
      artist: catalogArtist(e),
      collection: e.collection,
      tags: `${e.genre} ${e.genre === 'Mexicana' ? 'mexicano mexico regional corridos tumbados' : ''}`,
    }));
    searchCache.set(entries, search);
  }
  return search(query);
}
export function catalogFileUrl(entry: CatalogEntry): string {
  if (entry.kind === 'reference')
    return `/api/catalog/${encodeURIComponent(entry.id)}/score`;
  return `https://raw.githubusercontent.com/OpenScore/Lieder/${catalog.revision}/${entry.path.split('/').map(encodeURIComponent).join('/')}`;
}
export async function downloadCatalogScore(
  entry: CatalogEntry,
  signal?: AbortSignal,
): Promise<{ data: ArrayBuffer; format: string; sourceUrl: string }> {
  const response = await fetch(catalogFileUrl(entry), {
    signal: signal ?? AbortSignal.timeout(35000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error ||
        `Não foi possível baixar a partitura (${response.status}).`,
    );
  }
  if (response.headers.get('content-type')?.includes('text/html'))
    throw new Error(
      'O serviço de download não está disponível neste servidor.',
    );
  const data = await response.arrayBuffer();
  if (!data.byteLength) throw new Error('A fonte retornou um arquivo vazio.');
  if (entry.kind === 'score') {
    const header = new Uint8Array(data, 0, Math.min(4, data.byteLength));
    if (data.byteLength < 4 || header[0] !== 0x50 || header[1] !== 0x4b)
      throw new Error('O arquivo recebido não é uma partitura MXL válida');
  }
  return {
    data,
    format: entry.kind === 'score' ? 'mxl' : 'gp',
    sourceUrl:
      entry.kind === 'score'
        ? catalogFileUrl(entry)
        : (response.headers.get('X-Score-Source') ??
          'https://guitarprotabs.org/'),
  };
}
