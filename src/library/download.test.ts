import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  matchingTabUrls,
  findAndDownload,
  handleCatalogRequest,
} from '../../server/catalog-download';
import { createTestGp } from '../../tests/fixtures/demo-score';
const source =
  'https://guitarprotabs.org/tabs/green-day/american-idiot-version-4-20723';
const html = `<h2 id="matching-songs">Results</h2><a href="${source}">American Idiot</a>`;
afterEach(() => vi.restoreAllMocks());
describe('automatic tab provider', () => {
  it('matches both artist and title, rejecting live versions and other hosts', () => {
    const links =
      html +
      `<a href="https://evil.example/tabs/green-day/american-idiot-1">x</a><a href="https://guitarprotabs.org/tabs/other/american-idiot-1">x</a><a href="https://guitarprotabs.org/tabs/green-day/american-idiot-live-version-2">x</a>`;
    expect(matchingTabUrls(links, 'American Idiot', 'Green Day')).toEqual([
      source,
    ]);
  });
  it('downloads and validates the file and identifies its bass track', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(html))
      .mockResolvedValueOnce(
        new Response(new Uint8Array(createTestGp()).buffer),
      );
    const tab = await findAndDownload({
      title: 'American Idiot',
      artist: 'Green Day',
    });
    expect(tab.bassTrack).toBe(0);
    expect(tab.sourceUrl).toBe(source);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('reports no match instead of downloading a different artist', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(html));
    await expect(
      findAndDownload({ title: 'American Idiot', artist: 'Someone Else' }),
    ).rejects.toMatchObject({ status: 404 });
  });
  it('rejects redirects to an untrusted host', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(null, {
          status: 302,
          headers: { location: 'http://127.0.0.1/private' },
        }),
      );
    await expect(
      findAndDownload({ title: 'American Idiot', artist: 'Green Day' }),
    ).rejects.toThrow('endereço');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('rejects HTML login/challenge responses posing as a score', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(html))
      .mockResolvedValueOnce(
        new Response('<html>Login</html>', {
          headers: { 'Content-Type': 'text/html' },
        }),
      );
    await expect(
      findAndDownload({ title: 'American Idiot', artist: 'Green Day' }),
    ).rejects.toThrow('não puderam ser lidos');
  });
  it('does not fetch unknown IDs or allow arbitrary URL downloads', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    expect(
      (await handleCatalogRequest('/api/catalog/unknown/score'))?.status,
    ).toBe(404);
    expect(
      (
        await handleCatalogRequest(
          '/api/catalog/itunes:1161539471/score',
          'POST',
        )
      )?.status,
    ).toBe(405);
    expect(fetch).not.toHaveBeenCalled();
  });
});
