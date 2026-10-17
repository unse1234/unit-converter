import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const auditScript = fileURLToPath(new URL('./audit-seo.mjs', import.meta.url));
const origin = 'https://unitflip.org';
const home = `<!doctype html><html lang="en"><head><title>Fixture converter</title><meta name="description" content="Fixture home"><link rel="canonical" href="${origin}"><link rel="alternate" hreflang="en" href="${origin}"></head><body><main><h1>Fixture converter</h1><p>Initial HTML content</p><input value="1"><a href="/search">Search</a></main></body></html>`;
const search = `<!doctype html><html lang="en"><head><title>Fixture search</title><meta name="description" content="Search fixture"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${origin}/search"></head><body><main><h1>Search</h1></main></body></html>`;
const sitemap = `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"><url><loc>${origin}/</loc><xhtml:link rel="alternate" hreflang="en" href="${origin}" /></url></urlset>`;
const robots = `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;

async function fixture(options, inspect) {
  const directory = await mkdtemp(path.join(tmpdir(), 'unitflip-audit-fixture-'));
  await Promise.all([
    writeFile(path.join(directory, 'index.html'), home),
    writeFile(path.join(directory, 'search.html'), search),
    writeFile(path.join(directory, 'sitemap.xml'), sitemap),
    writeFile(path.join(directory, 'robots.txt'), robots),
  ]);
  if (options.rsc) {
    await mkdir(path.join(directory, '__next.!KG1haW4p'));
    await writeFile(path.join(directory, '__next.!KG1haW4p', '__PAGE__.txt'), '0:["fixture"]');
    if (options.rsc === 'normalized')
      await writeFile(path.join(directory, '__next.!KG1haW4p.__PAGE__.txt'), '0:["fixture"]');
  }
  // This small server is only a tool regression fixture, never an edge emulator.
  const server = createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const contents = {
      '/': home,
      '/search': search,
      '/robots.txt': robots,
      '/sitemap.xml': sitemap,
      ...(options.rsc === 'normalized'
        ? { '/__next.!KG1haW4p.__PAGE__.txt': '0:["fixture"]' }
        : {}),
    };
    const status =
      pathname === '/robots.txt'
        ? (options.robotsStatus ?? 200)
        : pathname === '/sitemap.xml'
          ? (options.sitemapStatus ?? 200)
          : contents[pathname]
            ? 200
            : 404;
    response.writeHead(status, {
      'content-type': pathname.endsWith('.xml')
        ? 'application/xml'
        : pathname.endsWith('.txt')
          ? 'text/plain'
          : 'text/html',
    });
    response.end(
      contents[pathname] ??
        '<html lang="en"><meta name="robots" content="noindex"><h1>Not found</h1></html>',
    );
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const reportFile = path.join(directory, 'report.json');
    const args = [
      auditScript,
      '--dir',
      directory,
      '--base',
      `http://127.0.0.1:${server.address().port}`,
      '--output',
      reportFile,
      '--affected-file',
      path.join(directory, 'no-affected-urls.txt'),
      '--no-probes',
      '--fail-on-errors',
    ];
    const child = spawn(process.execPath, args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk;
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
    });
    const code = await new Promise((resolve, reject) => {
      child.on('error', reject);
      child.on('close', resolve);
    });
    const report = JSON.parse(await readFile(reportFile, 'utf8'));
    await inspect({ code, report, output });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    const resolved = path.resolve(directory);
    assert.equal(path.dirname(resolved), path.resolve(tmpdir()));
    assert.ok(path.basename(resolved).startsWith('unitflip-audit-fixture-'));
    await rm(resolved, { recursive: true, force: true });
  }
}

test('accepts equivalent root URL spellings and an intentional noindex utility', async () => {
  await fixture({}, ({ code, report, output }) => {
    assert.equal(code, 0, output);
    assert.equal(report.summary.issueCounts.error ?? 0, 0);
    const root = report.pages.find((page) => page.route === '/');
    assert.equal(root.hreflangTargets[0].reciprocal, true);
    assert.equal(root.canonicalTargets[0].selfCanonical, true);
    assert.ok(root.initialHtml.mainTextCharacters > 0);
    const utility = report.pages.find((page) => page.route === '/search');
    assert.equal(utility.indexable, false);
    assert.equal(utility.sitemapIncluded, false);
    assert.equal(utility.canonicalTargets[0].intentionalNoindexUtility, true);
  });
});

test('rejects a failed HTTP sitemap instead of silently using the valid artifact', async () => {
  await fixture({ sitemapStatus: 503 }, ({ code, report }) => {
    assert.equal(code, 1);
    assert.ok(report.issues.some((issue) => issue.code === 'http-sitemap-not-200'));
    assert.equal(report.summary.sitemapUrls, 0);
    assert.match(report.inventory.sitemapSource, /no artifact fallback/);
    assert.equal(report.inventory.artifactSitemapUrlCount, 1);
  });
});

test('rejects a failed HTTP robots file and marks crawlability unknown', async () => {
  await fixture({ robotsStatus: 404 }, ({ code, report }) => {
    assert.equal(code, 1);
    assert.ok(report.issues.some((issue) => issue.code === 'http-robots-not-200'));
    assert.equal(report.pages.find((page) => page.route === '/').crawlable.googlebot, null);
  });
});

test('detects missing browser-requested RSC filenames independently of organic HTML', async () => {
  await fixture({ rsc: 'missing' }, ({ code, report }) => {
    assert.equal(code, 1);
    assert.equal(report.ancillaryAssets.nestedRscSegmentFiles, 1);
    assert.equal(report.ancillaryAssets.missingFlattenedRscAssets.length, 1);
    assert.ok(report.issues.some((issue) => issue.code === 'missing-flattened-rsc-segment-asset'));
  });
});

test('accepts normalized RSC utility assets served as plain text', async () => {
  await fixture({ rsc: 'normalized' }, ({ code, report, output }) => {
    assert.equal(code, 0, output);
    assert.equal(report.ancillaryAssets.missingFlattenedRscAssets.length, 0);
    assert.equal(report.ancillaryAssets.representativeRscHttpChecks[0].status, 200);
    assert.equal(report.summary.preferredExportedRoutes, 2);
  });
});
