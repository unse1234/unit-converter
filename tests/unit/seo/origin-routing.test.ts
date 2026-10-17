import { describe, expect, it, vi } from 'vitest';
import { handleRequest, preferredContentPath } from '@/hosting/worker';
import { absoluteUrl, siteConfig } from '@/lib/site';
import { assertProductionOrigin } from '@/lib/site-origin';
import sitemap from '@/app/sitemap';

describe('production URL contract', () => {
  it('always builds public URLs even with a local preview origin configured', () => {
    expect(siteConfig.url).toBe('https://unitflip.org');
    expect(absoluteUrl('/length/meters-to-feet')).toBe(
      'https://unitflip.org/length/meters-to-feet',
    );
    expect(absoluteUrl('/length?from=inch&to=meter')).toContain('?from=inch&to=meter');
    expect(() => absoluteUrl('//other.example/path')).toThrow();
  });

  it('rejects origins and components that would corrupt canonical signals', () => {
    for (const value of [
      'http://localhost:3000',
      'http://unitflip.org',
      'https://www.unitflip.org',
      'https://unitflip.org/path',
      'https://unitflip.org/?x=1',
      'https://unitflip.org/#fragment',
      'https://user:pass@unitflip.org',
      'not a URL',
    ])
      expect(() => assertProductionOrigin(value)).toThrow();
    for (const value of [undefined, '', 'https://unitflip.org', 'https://unitflip.org/']) {
      expect(() => assertProductionOrigin(value)).not.toThrow();
    }
  });

  it('does not invent editorial last-modified dates on rebuild', () => {
    for (const entry of sitemap()) expect(entry.lastModified).toBeUndefined();
  });
});

describe('Workers HTML route normalization', () => {
  const assets = (status = 200) => ({
    ASSETS: {
      fetch: vi.fn(
        async (_request: Request) =>
          new Response(null, { status, headers: { 'content-type': 'text/html' } }),
      ),
    },
  });

  it('serves Next segment payloads without exposing an encoding redirect', async () => {
    const env = assets();
    const request = new Request(
      'http://127.0.0.1:3100/length/__next.!KG1haW4p.$d$category.__PAGE__.txt?_rsc=key',
      { headers: { rsc: '1' } },
    );
    const response = await handleRequest(request, env);
    expect(response.status).toBe(200);
    const forwarded = env.ASSETS.fetch.mock.calls[0]?.[0];
    expect(forwarded?.url).toContain('/__next.!KG1haW4p.%24d%24category.__PAGE__.txt?_rsc=key');
    expect(forwarded?.headers.get('rsc')).toBe('1');
  });

  it('combines equivalent case, encoded, slash, extension and legacy forms', async () => {
    for (const path of [
      '/Length/Meters-To-Feet/',
      '/length/meters-to-feet.html',
      '/%6cength/meters-to-feet',
      '/length/meters-to-feet/index.html',
    ]) {
      const response = await handleRequest(
        new Request(`https://www.unitflip.org${path}?value=10&utm_source=test`),
        assets(),
      );
      expect(response.status).toBe(308);
      expect(response.headers.get('location')).toBe(
        'https://unitflip.org/length/meters-to-feet?value=10&utm_source=test',
      );
    }
    const response = await handleRequest(new Request('https://unitflip.org/Privacy/'), assets());
    expect(response.headers.get('location')).toBe('https://unitflip.org/privacy-policy');
  });

  it('normalizes protocol and hostname without changing the path or parameters', async () => {
    const response = await handleRequest(
      new Request('http://www.unitflip.org/es/longitud?value=2'),
      assets(),
    );
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://unitflip.org/es/longitud?value=2');
  });

  it('keeps invalid routes as real 404s and protects asset filenames', async () => {
    const env = assets(404);
    const response = await handleRequest(new Request('https://unitflip.org/Invalid-Route/'), env);
    expect(response.status).toBe(404);
    for (const path of ['/ICON.svg', '/length%2fmeters-to-feet', '/%broken']) {
      expect(preferredContentPath(path)).toBeNull();
    }
  });

  it('does not redirect local testing to production', async () => {
    const env = assets();
    const response = await handleRequest(new Request('http://127.0.0.1:3100/length'), env);
    expect(response.status).toBe(200);
    expect(env.ASSETS.fetch).toHaveBeenCalledTimes(1);
  });
});
