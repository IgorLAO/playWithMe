import modern from '../src/library/modern-catalog.json' with { type: 'json' };
const origin = 'https://guitarprotabs.org';
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/^the/, '');
export class DownloadError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

/** Accept only exact song/artist matches; versions are allowed, covers/live variants are not. */
export function matchingTabUrls(
  html: string,
  title: string,
  artist: string,
): string[] {
  const artists = artist.split(/\s*(?:&|,)\s*/).map(normalize);
  const urls = [...html.matchAll(/href=["']([^"']*\/tabs\/[^"']+)["']/g)]
    .map((match) => {
      try {
        return new URL(match[1]!, origin);
      } catch {
        return null;
      }
    })
    .filter((url): url is URL => !!url && url.origin === origin);
  return [
    ...new Set(
      urls
        .filter((url) => {
          const parts = url.pathname.split('/');
          if (
            parts.length !== 4 ||
            parts[1] !== 'tabs' ||
            !artists.includes(normalize(parts[2]!))
          )
            return false;
          const song = decodeURIComponent(parts[3]!)
            .replace(/-\d+$/, '')
            .replace(/-(?:version|ver)-\d+$/, '')
            .replace(/-\d+$/, '');
          return normalize(song) === normalize(title);
        })
        .map((url) => url.href),
    ),
  ].slice(0, 3);
}
async function readPublic(
  url: string,
  signal: AbortSignal,
  maxBytes: number,
): Promise<{ bytes: Uint8Array; type: string }> {
  for (let redirects = 0; redirects < 4; redirects++) {
    const parsed = new URL(url);
    if (parsed.origin !== origin)
      throw new DownloadError('A fonte mudou o endereço do arquivo.');
    const response = await fetch(parsed, {
      signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'PlayWithMe/0.1 (personal music practice)' },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) break;
      url = new URL(location, parsed).href;
      continue;
    }
    if (!response.ok)
      throw new DownloadError(
        'A fonte de partituras está indisponível. Tente novamente mais tarde.',
      );
    if (Number(response.headers.get('content-length') ?? 0) > maxBytes)
      throw new DownloadError('O arquivo excede o tamanho permitido.');
    const reader = response.body?.getReader();
    if (!reader) throw new DownloadError('A fonte retornou um arquivo vazio.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes)
          throw new DownloadError('O arquivo excede o tamanho permitido.');
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return { bytes, type: response.headers.get('content-type') ?? '' };
  }
  throw new DownloadError('Não foi possível seguir o endereço da partitura.');
}
export type DownloadedTab = {
  bytes: Uint8Array;
  format: string;
  sourceUrl: string;
  bassTrack: number;
};
export async function findAndDownload(
  entry: { title: string; artist: string },
  signal = AbortSignal.timeout(25000),
): Promise<DownloadedTab> {
  const search = new URL('/search', origin);
  search.searchParams.set('q', entry.title);
  const { bytes } = await readPublic(search.href, signal, 2 * 1024 * 1024);
  const html = new TextDecoder().decode(bytes);
  if (!html.includes('matching-songs'))
    throw new DownloadError(
      'A fonte de partituras mudou ou bloqueou a consulta. Tente novamente mais tarde.',
    );
  const candidates = matchingTabUrls(html, entry.title, entry.artist);
  if (!candidates.length)
    throw new DownloadError(
      'Nenhuma partitura compatível foi encontrada para esta música na fonte atual.',
      404,
    );
  const { importer, Settings } = await import('@coderline/alphatab');
  let fallback: DownloadedTab | undefined;
  for (const sourceUrl of candidates) {
    try {
      const file = await readPublic(
        `${sourceUrl}/download`,
        signal,
        8 * 1024 * 1024,
      );
      if (file.type.includes('text/html') || !file.bytes.length)
        throw new Error('Not a score');
      const score = importer.ScoreLoader.loadScoreFromBytes(
        file.bytes,
        new Settings(),
      );
      if (!score.tracks.length) throw new Error('No tracks');
      const bassTrack = score.tracks.findIndex(
        (t) => t.playbackInfo.program >= 32 && t.playbackInfo.program <= 39,
      );
      const tab = { bytes: file.bytes, format: 'gp', sourceUrl, bassTrack };
      if (bassTrack >= 0) return tab;
      fallback ??= tab;
    } catch (error) {
      if (signal.aborted) throw error;
    }
  }
  if (fallback) return fallback;
  throw new DownloadError(
    'A fonte foi encontrada, mas os arquivos não puderam ser lidos. Tente novamente mais tarde.',
  );
}
// Coalesce repeated clicks while a download is running; no permanent server copies.
const pending = new Map<string, Promise<DownloadedTab>>();
export async function handleCatalogRequest(
  path: string,
  method = 'GET',
): Promise<Response | null> {
  const match = /^\/api\/catalog\/([^/]+)\/score$/.exec(path.split('?')[0]!);
  if (!match) return null;
  const json = (error: string, status: number) =>
    Response.json({ error }, { status });
  if (method !== 'GET') return json('Método não permitido.', 405);
  let id: string;
  try {
    id = decodeURIComponent(match[1]!);
  } catch {
    return json('Identificador inválido.', 400);
  }
  const entry = modern.entries.find((e) => e.id === id);
  if (!entry) return json('Música não encontrada no catálogo.', 404);
  try {
    let request = pending.get(id);
    if (!request) {
      request = findAndDownload(entry);
      pending.set(id, request);
      void request.finally(() => pending.delete(id)).catch(() => {});
    }
    const tab = await request;
    return new Response(new Uint8Array(tab.bytes).buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'private, no-store',
        'X-Score-Format': tab.format,
        'X-Score-Source': tab.sourceUrl,
        'X-Bass-Track': String(tab.bassTrack),
      },
    });
  } catch (error) {
    if (error instanceof DownloadError)
      return json(error.message, error.status);
    return json(
      'A busca demorou demais ou a conexão falhou. Tente novamente.',
      502,
    );
  }
}
