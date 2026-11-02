// Local sparse TF-IDF vectors: words + character trigrams, ranked by cosine.
// This is lexical vector retrieval, not a neural semantic embedding model.
export type SearchDocument = { title: string; artist: string; collection: string; tags: string };
type Vector = Map<string, number>;
export const normalizeSearch = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
const stopWords = new Set(['musica', 'musicas', 'music', 'de', 'da', 'do', 'por']);
const words = (s: string) => normalizeSearch(s).split(' ').filter(w => w && !stopWords.has(w));
function grams(word: string): string[] {
 const padded = `^${word}$`;
 return Array.from({length: Math.max(0, padded.length - 2)}, (_, i) => padded.slice(i, i + 3));
}
function features(text: string): Vector {
 const result: Vector = new Map();
 const add = (key: string, weight: number) => result.set(key, (result.get(key) ?? 0) + weight);
 for (const word of words(text)) {
  add(`w:${word}`, 2);
  for (const gram of grams(word)) add(`g:${gram}`, 1);
 }
 return result;
}
function similarity(a: Vector, b: Vector): number {
 let dot = 0;
 for (const [key, value] of a) dot += value * (b.get(key) ?? 0);
 return dot;
}
function resembles(query: string, term: string): boolean {
 if (term.includes(query)) return true;
 if (query.length < 3 || term.length < 3) return false;
 const a = new Set(grams(query)), b = new Set(grams(term));
 const shared = [...a].filter(g => b.has(g)).length;
 return 2 * shared / (a.size + b.size) >= .45;
}
export function createVectorSearch<T>(entries: readonly T[], document: (entry: T) => SearchDocument) {
 const docs = entries.map(entry => {
  const fields = document(entry);
  const raw: Vector = new Map();
  for (const [text, weight] of [[fields.title, 3], [fields.artist, 2.5], [fields.tags, 1], [fields.collection, .5]] as const) {
   for (const [key, value] of features(text)) raw.set(key, (raw.get(key) ?? 0) + value * weight);
  }
  return {entry, fields, raw, terms: words(Object.values(fields).join(' '))};
 });
 const frequencies = new Map<string, number>();
 for (const doc of docs) for (const key of doc.raw.keys()) frequencies.set(key, (frequencies.get(key) ?? 0) + 1);
 const weight = (raw: Vector) => {
  const vector: Vector = new Map();
  let norm = 0;
  for (const [key, value] of raw) {
   const weighted = Math.log1p(value) * (1 + Math.log((docs.length + 1) / ((frequencies.get(key) ?? 0) + 1)));
   vector.set(key, weighted); norm += weighted * weighted;
  }
  if (norm) for (const [key, value] of vector) vector.set(key, value / Math.sqrt(norm));
  return vector;
 };
 const vectors = docs.map(doc => ({...doc, vector: weight(doc.raw)}));
 return (query: string): T[] => {
  const queryWords = words(query);
  if (!queryWords.length) return [...entries];
  const queryVector = weight(features(query));
  const matches = vectors.map(doc => {
   const exact = queryWords.every(w => doc.terms.some(t => t.includes(w)));
   const covered = exact || queryWords.every(w => doc.terms.some(t => resembles(w, t)));
   const score = similarity(queryVector, doc.vector);
   return {entry: doc.entry, exact, covered, score};
  });
  const hasExact = matches.some(m => m.exact);
  return matches.filter(m => hasExact ? m.exact : m.covered && m.score >= .12)
   .sort((a, b) => b.score - a.score).map(m => m.entry);
 };
}
