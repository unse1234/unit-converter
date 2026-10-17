#!/usr/bin/env node
/**
 * Audit every exported HTML route, optionally through the actual deployment server.
 * File mode is artifact evidence only: HTTP statuses/headers/redirects stay unknown.
 * HTTP mode maps production canonical/hreflang targets onto --base for verification.
 * parse5 is installed by the existing jsdom dev dependency; no browser scripts run.
 */
import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parse } from 'parse5';

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
}
const directory = path.resolve(option('--dir', 'out'));
const base = option('--base', null);
const production = new URL(option('--origin', 'https://unitflip.org')).origin;
const output = path.resolve(option('--output', 'docs/seo-audit-after.json'));
const concurrency = Math.max(1, Math.min(12, Number(option('--concurrency', '4'))));
const selected = option('--urls', null)
  ?.split(',')
  .map((value) => value.trim());
const mode = base ? 'http' : 'export-artifact';
const maximumRequests = Number(option('--max-requests', '100000'));
let requestCount = 0;
const issues = [];
const issue = (severity, code, route, detail) => issues.push({ severity, code, route, detail });
const asUrl = (route, origin = production) => new URL(route, origin).href;
const sameUrl = (left, right) => {
  try {
    return new URL(left).href === new URL(right).href;
  } catch {
    return false;
  }
};
const cleanText = (value) => value.replace(/\s+/g, ' ').trim();
const digest = (value) => createHash('sha256').update(value).digest('hex');
const relative = (file) => path.relative(directory, file).split(path.sep).join('/');
const collectionSource = await readFile(
  new URL('../src/data/collections.ts', import.meta.url),
  'utf8',
).catch(() => '');
const collectionSlugs = new Set(
  [...collectionSource.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]),
);
const affectedFile = path.resolve(
  option('--affected-file', 'docs/search-console-affected-urls.txt'),
);
const affectedText = await readFile(affectedFile, 'utf8').catch(() => null);
const affectedUrls =
  affectedText
    ?.split(/\r?\n/)
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url)) ?? [];
async function walk(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  return (
    await Promise.all(
      entries
        .filter((item) => item.name !== '_next')
        .map(async (item) => {
          const file = path.join(folder, item.name);
          return item.isDirectory() ? walk(file) : [file];
        }),
    )
  ).flat();
}
function routeFor(file) {
  const name = relative(file);
  if (name === 'index.html') return '/';
  return `/${name.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`;
}
function routeType(route) {
  const parts = new URL(route, production).pathname.split('/').filter(Boolean);
  if (parts[0]?.match(/^[a-z]{2}(?:-[A-Z]{2})?$/)) parts.shift();
  if (parts.length === 0) return 'home';
  if (['404', '_not-found'].includes(parts[0])) return 'error';
  if (parts[0] === 'search') return 'utility';
  if (['about', 'contact', 'privacy-policy', 'terms'].includes(parts[0])) return 'information';
  return parts.length > 1
    ? 'conversion'
    : collectionSlugs.has(parts[0])
      ? 'collection'
      : 'category';
}
function extract(html) {
  const document = parse(html);
  const result = {
    canonical: [],
    robots: [],
    title: '',
    description: '',
    h1: [],
    language: '',
    hreflang: [],
    links: [],
    initialHtml: {},
  };
  let mainText = '';
  let bodyText = '';
  let hasMain = false;
  let controls = 0;
  function textOf(node) {
    if (['script', 'style', 'noscript', 'template'].includes(node.tagName)) return '';
    if (node.nodeName === '#text') return node.value;
    return (node.childNodes ?? []).map(textOf).join(' ');
  }
  function visit(node) {
    const attrs = Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
    const rels = attrs.rel?.toLowerCase().split(/\s+/) ?? [];
    if (node.tagName === 'html') result.language = attrs.lang ?? '';
    if (node.tagName === 'title') result.title = cleanText(textOf(node));
    if (node.tagName === 'meta' && attrs.name?.toLowerCase() === 'description')
      result.description = attrs.content ?? '';
    if (node.tagName === 'meta' && /^(robots|googlebot|bingbot)$/i.test(attrs.name ?? ''))
      result.robots.push({ agent: attrs.name.toLowerCase(), content: attrs.content ?? '' });
    if (node.tagName === 'link' && rels.includes('canonical'))
      result.canonical.push(attrs.href ?? '');
    if (node.tagName === 'link' && rels.includes('alternate') && attrs.hreflang)
      result.hreflang.push({ language: attrs.hreflang, url: attrs.href ?? '' });
    if (node.tagName === 'h1') result.h1.push(cleanText(textOf(node)));
    if (node.tagName === 'a' && attrs.href) result.links.push(attrs.href);
    if (node.tagName === 'main') {
      hasMain = true;
      mainText += textOf(node);
    }
    if (node.tagName === 'body') bodyText = textOf(node);
    if (['input', 'select', 'textarea'].includes(node.tagName)) controls++;
    for (const child of node.childNodes ?? []) visit(child);
  }
  visit(document);
  mainText = cleanText(mainText);
  result.links = [...new Set(result.links)];
  result.canonicalCount = result.canonical.length;
  result.initialHtml = {
    hasMain,
    mainTextCharacters: mainText.length,
    bodyTextCharacters: cleanText(bodyText).length,
    formControls: controls,
    mainTextSha256: digest(mainText),
    excerpt: mainText.slice(0, 240),
  };
  return result;
}
function robotBlocked(page) {
  return [...page.robots.map((item) => item.content), page.xRobotsTag ?? ''].some((value) =>
    /\b(noindex|none)\b/i.test(value),
  );
}
function robotsAllows(text, pathname, agent = 'googlebot') {
  const groups = [];
  let group = { agents: [], rules: [] };
  for (const line of (text ?? '').split(/\r?\n/)) {
    const match = line
      .split('#')[0]
      .trim()
      .match(/^([\w-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (key === 'user-agent') {
      if (group.rules.length) {
        groups.push(group);
        group = { agents: [], rules: [] };
      }
      group.agents.push(value.toLowerCase());
    } else if (['allow', 'disallow'].includes(key) && value && group.agents.length)
      group.rules.push({ allow: key === 'allow', pattern: value });
  }
  groups.push(group);
  const candidates = groups.map((item) => ({
    ...item,
    specificity: Math.max(
      -1,
      ...item.agents.map((value) =>
        value === '*' ? 0 : agent.includes(value) ? value.length : -1,
      ),
    ),
  }));
  const specificity = Math.max(-1, ...candidates.map((item) => item.specificity));
  const rules = candidates
    .filter((item) => item.specificity === specificity && specificity >= 0)
    .flatMap((item) => item.rules);
  const matches = rules
    .filter(({ pattern }) => {
      const ends = pattern.endsWith('$');
      const expression = (ends ? pattern.slice(0, -1) : pattern)
        .split('*')
        .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*');
      return new RegExp(`^${expression}${ends ? '$' : ''}`).test(pathname);
    })
    .sort(
      (left, right) =>
        right.pattern.replace(/\*/g, '').length - left.pattern.replace(/\*/g, '').length ||
        Number(right.allow) - Number(left.allow),
    );
  return !matches.length || matches[0].allow;
}
const files = await walk(directory);
const fileNames = new Set(files.map(relative));
const rscMappings = files
  .filter((file) => file.endsWith('.txt'))
  .flatMap((file) => {
    const sourceFile = relative(file);
    const segments = sourceFile.split('/');
    const marker = segments.findIndex((segment) => segment.startsWith('__next.'));
    if (marker < 0 || marker === segments.length - 1) return [];
    const expectedFile = [...segments.slice(0, marker), segments.slice(marker).join('.')].join('/');
    return [{ sourceFile, expectedFile, exists: fileNames.has(expectedFile) }];
  });
const missingRscAssets = rscMappings.filter((entry) => !entry.exists);
for (const entry of missingRscAssets)
  issue('error', 'missing-flattened-rsc-segment-asset', `/${entry.expectedFile}`, entry);
const rscHttpChecks = [];
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const artifacts = htmlFiles.filter((file) =>
  ['404.html', '_not-found.html', '_not-found/index.html'].includes(relative(file)),
);
const routes = new Map(
  htmlFiles.filter((file) => !artifacts.includes(file)).map((file) => [routeFor(file), file]),
);
let sitemapXml = '';
try {
  sitemapXml = await readFile(path.join(directory, 'sitemap.xml'), 'utf8');
} catch {
  /* Report missing sitemap below. */
}
const artifactSitemapXml = sitemapXml;
const robotsText = await readFile(path.join(directory, 'robots.txt'), 'utf8').catch(() => null);
let sitemapResponse = null;
let robotsResponse = null;
if (base) {
  try {
    sitemapResponse = await fetchChain('/sitemap.xml');
    if (sitemapResponse.finalStatus === 200) sitemapXml = sitemapResponse.html;
    else {
      sitemapXml = '';
      issue('error', 'http-sitemap-not-200', '/sitemap.xml', sitemapResponse.finalStatus);
    }
  } catch (error) {
    sitemapXml = '';
    issue('error', 'http-sitemap-fetch-failed', '/sitemap.xml', error.message);
  }
  try {
    robotsResponse = await fetchChain('/robots.txt');
    if (robotsResponse.finalStatus !== 200)
      issue('error', 'http-robots-not-200', '/robots.txt', robotsResponse.finalStatus);
  } catch (error) {
    issue('error', 'http-robots-fetch-failed', '/robots.txt', error.message);
  }
}
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
  match[1].replace(/&amp;/g, '&'),
);
const sitemapPaths = new Set(sitemapUrls.map((url) => new URL(url).pathname));
const sitemapAlternates = new Map(
  [...sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((entry) => {
    const location = entry[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
    const alternates = [...entry[1].matchAll(/<xhtml:link\s+([^>]+)>/g)]
      .map((link) =>
        Object.fromEntries(
          [...link[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map((attribute) => [
            attribute[1],
            attribute[2],
          ]),
        ),
      )
      .filter((link) => link.rel === 'alternate')
      .map((link) => ({ language: link.hreflang, url: link.href }));
    return [location ? new URL(location).pathname : '', alternates];
  }),
);
const inventory = [...new Set([...routes.keys(), ...sitemapPaths])].sort();
let requested = selected ?? inventory;
const probeRoutes = selected
  ? []
  : [
      '/_seo-audit-invalid-route',
      '/privacy',
      '/length/',
      '/length.html',
      '/LENGTH',
      '/LENGTH/METERS-TO-FEET.HTML/',
      '/%6cength',
      '/length?utm_source=seo-audit',
      '/length?from=meters&to=feet&value=2&utm_source=seo-audit',
      '/length/meters-to-feet?utm_source=seo-audit',
      '/length/not-a-real-conversion',
      '/404',
      '/404.html',
      '/_not-found',
    ];
const probeSet = new Set([
  ...probeRoutes,
  ...(selected ?? []).filter((route) => !routes.has(route) && !sitemapPaths.has(route)),
]);
if (base && !args.includes('--no-probes')) requested = [...new Set([...requested, ...probeRoutes])];
const pages = [];
const started = new Date();
let completed = 0;
async function fetchChain(route, requestHeaders = {}) {
  let url = asUrl(route, base);
  const chain = [];
  for (let count = 0; count < 9; count++) {
    if (++requestCount > maximumRequests)
      throw new Error(`Request budget exceeded (${maximumRequests})`);
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(20000),
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; UnitFlipLocalAudit/1.0)',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...requestHeaders,
      },
    });
    const location = response.headers.get('location');
    chain.push({ url, status: response.status, location });
    if (location && [301, 302, 303, 307, 308].includes(response.status)) {
      const next = new URL(location, url).href;
      await response.body?.cancel();
      if (chain.some((step) => step.url === next))
        throw new Error(`Redirect loop: ${JSON.stringify(chain)}`);
      url = next;
      continue;
    }
    return {
      html: await response.text(),
      status: chain[0].status,
      finalStatus: response.status,
      finalUrl: url,
      redirectDestination: chain[0].location,
      redirectChain: chain,
      xRobotsTag: response.headers.get('x-robots-tag'),
      linkHeader: response.headers.get('link'),
      contentType: response.headers.get('content-type'),
    };
  }
  throw new Error('More than eight redirects');
}
async function auditRoute(route) {
  const expected = asUrl(route);
  const page = {
    url: expected,
    route,
    routeType:
      probeSet.has(route) && !routes.has(route) ? 'variant-or-invalid-probe' : routeType(route),
    sourceFile: routes.get(route) ? relative(routes.get(route)) : null,
    sitemapIncluded: sitemapUrls.includes(expected),
    sitemapPathIncluded: sitemapPaths.has(new URL(expected).pathname),
    status: null,
    finalStatus: null,
    redirectDestination: null,
    redirectChain: [],
    xRobotsTag: null,
    linkHeader: null,
  };
  try {
    let html;
    if (base) {
      const response = await fetchChain(route);
      html = response.html;
      Object.assign(page, response);
      delete page.html;
    } else {
      const file = routes.get(route);
      if (!file) throw new Error('Sitemap route has no exported HTML file');
      html = await readFile(file, 'utf8');
    }
    Object.assign(page, extract(html));
    page.headerCanonical = [
      ...(page.linkHeader ?? '').matchAll(/<([^>]+)>\s*;\s*rel\s*=\s*"?canonical"?/gi),
    ].map((match) => match[1]);
    page.indexable = !robotBlocked(page) && (!base || page.finalStatus === 200);
    const robotsAvailable = !base || robotsResponse?.finalStatus === 200;
    page.crawlable = {
      googlebot: robotsAvailable
        ? robotsAllows(robotsResponse?.html ?? robotsText, new URL(page.url).pathname)
        : null,
      genericBot: robotsAvailable
        ? robotsAllows(robotsResponse?.html ?? robotsText, new URL(page.url).pathname, '*')
        : null,
    };
  } catch (error) {
    page.error = error.message;
    issue('error', 'read-or-fetch-failed', route, error.message);
  }
  pages.push(page);
  completed++;
  if (completed % 100 === 0) process.stderr.write(`Audited ${completed}/${requested.length}\n`);
}
let cursor = 0;
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (cursor < requested.length) await auditRoute(requested[cursor++]);
  }),
);
pages.sort((a, b) => a.route.localeCompare(b.route));
const pageByPath = new Map(
  pages.filter((page) => inventory.includes(page.route)).map((page) => [page.route, page]),
);
const assetPaths = new Set(files.map((file) => `/${relative(file)}`));
const targetChecks = new Map();
async function targetCheck(url, sourcePage) {
  let target;
  try {
    target = new URL(url);
  } catch {
    return { valid: false, reason: 'not-absolute-url' };
  }
  if (target.origin !== production)
    return { valid: false, reason: 'nonproduction-origin', declaredOrigin: target.origin };
  const targetPage = pageByPath.get(target.pathname);
  if (targetPage)
    return {
      valid:
        !target.hash &&
        !target.search &&
        targetPage.indexable &&
        targetPage.crawlable?.googlebot &&
        targetPage.canonicalCount === 1 &&
        sameUrl(targetPage.canonical?.[0], target.href) &&
        (!base || (targetPage.status === 200 && targetPage.finalStatus === 200)),
      status: targetPage.status,
      indexable: targetPage.indexable,
      crawlable: targetPage.crawlable,
      language: targetPage.language,
      selfCanonical: sameUrl(targetPage.canonical?.[0], target.href),
      reason: target.hash || target.search ? 'fragment-or-query-target' : undefined,
    };
  if (!base || !selected) return { valid: false, reason: 'not-in-exported-inventory' };
  if (!targetChecks.has(target.href))
    targetChecks.set(
      target.href,
      (async () => {
        try {
          const response = await fetchChain(target.pathname + target.search);
          const data = extract(response.html);
          return {
            valid:
              response.status === 200 &&
              (!base || robotsResponse?.finalStatus === 200) &&
              !robotBlocked({ ...data, xRobotsTag: response.xRobotsTag }) &&
              robotsAllows(robotsResponse?.html ?? robotsText, target.pathname) &&
              data.canonicalCount === 1 &&
              sameUrl(data.canonical[0], target.href),
            status: response.status,
            canonical: data.canonical,
            hreflang: data.hreflang,
            language: data.language,
            source: sourcePage.route,
          };
        } catch (error) {
          return { valid: false, reason: error.message };
        }
      })(),
    );
  return targetChecks.get(target.href);
}
const brokenLinks = new Map();
for (const page of pages) {
  if (page.error) continue;
  const isProbe = page.routeType === 'variant-or-invalid-probe';
  if (isProbe) {
    if (
      ['/_seo-audit-invalid-route', '/length/not-a-real-conversion'].includes(page.route) &&
      page.status !== 404
    )
      issue('error', 'invalid-route-not-404', page.route, {
        status: page.status,
        finalStatus: page.finalStatus,
      });
    const preferred = new Map([
      ['/privacy', '/privacy-policy'],
      ['/length/', '/length'],
      ['/length.html', '/length'],
      ['/LENGTH', '/length'],
      ['/LENGTH/METERS-TO-FEET.HTML/', '/length/meters-to-feet'],
      ['/%6cength', '/length'],
    ]).get(page.route);
    if (
      preferred &&
      (![301, 308].includes(page.status) ||
        page.finalStatus !== 200 ||
        new URL(page.finalUrl).pathname !== preferred)
    )
      issue('warning', 'alias-not-permanently-normalized', page.route, {
        status: page.status,
        finalStatus: page.finalStatus,
        destination: page.redirectDestination,
        expectedPath: preferred,
      });
    if (page.route.includes('?')) {
      if (page.finalStatus !== 200 || new URL(page.finalUrl).search !== new URL(page.url).search)
        issue('error', 'query-state-not-preserved', page.route, {
          status: page.finalStatus,
          finalUrl: page.finalUrl,
        });
      if (!sameUrl(page.canonical?.[0], asUrl(new URL(page.url).pathname)))
        issue('error', 'variant-canonical-not-clean-landing-page', page.route, page.canonical);
    }
    delete page.links;
    continue;
  }
  if (base && page.status !== 200)
    issue('error', 'preferred-route-not-200', page.route, {
      status: page.status,
      destination: page.redirectDestination,
    });
  if (page.canonicalCount !== 1) issue('error', 'canonical-count', page.route, page.canonical);
  if (!page.title) issue('warning', 'missing-title', page.route, '');
  if (!page.description) issue('warning', 'missing-description', page.route, '');
  if (page.h1.length !== 1) issue('warning', 'h1-count', page.route, page.h1);
  if (!page.language) issue('warning', 'missing-language', page.route, '');
  if (page.indexable && !page.initialHtml.mainTextCharacters)
    issue('error', 'missing-initial-main-content', page.route, page.initialHtml);
  if (page.indexable && !page.sitemapIncluded)
    issue('warning', 'indexable-page-not-exactly-in-sitemap', page.route, {
      sitemapPathIncluded: page.sitemapPathIncluded,
    });
  if (page.sitemapPathIncluded && !page.indexable)
    issue('error', 'sitemap-nonindexable-page', page.route, page.robots);
  if (page.indexable && page.crawlable.googlebot === false)
    issue('error', 'indexable-page-blocked-in-robots', page.route, page.crawlable);
  const xmlAlternates = sitemapAlternates.get(new URL(page.url).pathname) ?? [];
  page.sitemapHreflang = xmlAlternates;
  if (
    page.sitemapPathIncluded &&
    (xmlAlternates.some(
      (alternate) =>
        !page.hreflang.some(
          (item) => item.language === alternate.language && sameUrl(item.url, alternate.url),
        ),
    ) ||
      page.hreflang.some(
        (alternate) =>
          !xmlAlternates.some(
            (item) => item.language === alternate.language && sameUrl(item.url, alternate.url),
          ),
      ))
  )
    issue('error', 'html-sitemap-hreflang-conflict', page.route, {
      html: page.hreflang,
      sitemap: xmlAlternates,
    });
  page.canonicalTargets = [];
  for (const canonical of page.canonical) {
    const check = await targetCheck(canonical, page);
    const intentionalNoindexUtility =
      page.routeType === 'utility' && !page.indexable && sameUrl(canonical, page.url);
    page.canonicalTargets.push({ url: canonical, ...check, intentionalNoindexUtility });
    if (!check.valid && !intentionalNoindexUtility)
      issue('error', 'invalid-canonical-target', page.route, { url: canonical, ...check });
    if (page.indexable && !sameUrl(canonical, page.url))
      issue('warning', 'nonself-canonical', page.route, canonical);
    if (page.headerCanonical.length && page.headerCanonical.some((url) => !sameUrl(url, canonical)))
      issue('error', 'header-html-canonical-conflict', page.route, page.headerCanonical);
  }
  page.hreflangTargets = [];
  for (const alternate of page.hreflang) {
    let languageValid = alternate.language === 'x-default';
    try {
      languageValid ||= Intl.getCanonicalLocales(alternate.language).length === 1;
    } catch {
      /* Invalid language code. */
    }
    const check = await targetCheck(alternate.url, page);
    const target = pageByPath.get(new URL(alternate.url, production).pathname);
    const reciprocal =
      sameUrl(alternate.url, page.url) ||
      (target?.hreflang ?? check.hreflang ?? []).some((item) => sameUrl(item.url, page.url));
    const languageMatchesTarget =
      alternate.language === 'x-default' ||
      alternate.language.toLowerCase().split('-')[0] ===
        (target?.language ?? check.language ?? '').toLowerCase().split('-')[0];
    page.hreflangTargets.push({
      ...alternate,
      languageValid,
      languageMatchesTarget,
      reciprocal,
      ...check,
    });
    if (!languageValid || !languageMatchesTarget || !check.valid || !reciprocal)
      issue('error', 'invalid-hreflang-relationship', page.route, page.hreflangTargets.at(-1));
  }
  if (
    page.hreflang.length &&
    !page.hreflang.some((item) => sameUrl(item.url, page.url) && item.language !== 'x-default')
  )
    issue('error', 'missing-hreflang-self-reference', page.route, page.hreflang);
  page.internalLinkCount = 0;
  for (const href of page.links) {
    let target;
    try {
      target = new URL(href, page.url);
    } catch {
      continue;
    }
    if (target.origin !== production || !['http:', 'https:'].includes(target.protocol)) continue;
    page.internalLinkCount++;
    const present =
      routes.has(target.pathname) ||
      sitemapPaths.has(target.pathname) ||
      assetPaths.has(target.pathname);
    if (!present) {
      if (!brokenLinks.has(target.pathname))
        brokenLinks.set(target.pathname, {
          target: target.pathname,
          sourceCount: 0,
          sourceExamples: [],
        });
      const entry = brokenLinks.get(target.pathname);
      entry.sourceCount++;
      if (entry.sourceExamples.length < 5) entry.sourceExamples.push(page.route);
    }
  }
  delete page.links;
}
for (const link of brokenLinks.values()) {
  if (base) {
    try {
      const response = await fetchChain(link.target);
      Object.assign(link, {
        status: response.status,
        finalStatus: response.finalStatus,
        finalUrl: response.finalUrl,
      });
      if (response.finalStatus >= 400)
        issue('error', 'broken-internal-link', link.sourceExamples[0], link);
      else if (response.status !== 200)
        issue('warning', 'internal-link-target-redirects', link.sourceExamples[0], link);
    } catch (error) {
      link.error = error.message;
      issue('error', 'internal-link-target-fetch-failed', link.sourceExamples[0], link);
    }
  } else issue('warning', 'internal-link-target-not-exported', link.sourceExamples[0], link);
}
if (!sitemapUrls.length)
  issue('error', 'empty-or-missing-sitemap', '/sitemap.xml', 'No loc entries found');
if (new Set(sitemapUrls).size !== sitemapUrls.length)
  issue(
    'error',
    'duplicate-sitemap-urls',
    '/sitemap.xml',
    sitemapUrls.length - new Set(sitemapUrls).size,
  );
for (const url of sitemapUrls) {
  const parsed = new URL(url);
  if (parsed.origin !== production || parsed.search || parsed.hash)
    issue('error', 'sitemap-nonpreferred-url', parsed.pathname, url);
}
const suspiciousDuplicates = [];
for (const field of ['title', 'description', 'initialMainText']) {
  const groups = new Map();
  for (const page of pages.filter(
    (item) => item.indexable && item.routeType !== 'variant-or-invalid-probe',
  )) {
    const value = field === 'initialMainText' ? page.initialHtml.mainTextSha256 : page[field];
    if (!value) continue;
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(page.route);
  }
  for (const [value, matchingRoutes] of groups)
    if (matchingRoutes.length > 1)
      suspiciousDuplicates.push({
        field,
        value,
        routes: matchingRoutes,
        interpretation:
          'Similarity signal for review; not evidence that pages should be consolidated.',
      });
}
let commit = null;
try {
  commit = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
    windowsHide: true,
  }).trim();
} catch {
  /* Non-git export. */
}
const buildFile = await stat(path.join(directory, 'index.html'));
const countBy = (values, key) =>
  values.reduce((counts, value) => {
    const item = key(value);
    counts[item] = (counts[item] ?? 0) + 1;
    return counts;
  }, {});
const affectedMappings = affectedUrls.map((suppliedUrl) => {
  const supplied = new URL(suppliedUrl);
  const preferredUrl = asUrl(supplied.pathname);
  const preferredPage = pageByPath.get(supplied.pathname);
  return {
    suppliedUrl,
    suppliedScheme: supplied.protocol.slice(0, -1),
    suppliedUrlInSitemap: sitemapUrls.some((url) => sameUrl(url, suppliedUrl)),
    suppliedHttpStatus: null,
    preferredUrl,
    mappingBasis:
      'Same path on configured production origin; no path rewrite assumed. Original HTTP URL is not fetched by this mapping.',
    preferredExportExists: routes.has(supplied.pathname),
    preferredSitemapIncluded: sitemapUrls.some((url) => sameUrl(url, preferredUrl)),
    preferredTargetAudited: Boolean(preferredPage),
    preferredStatus: preferredPage?.status ?? null,
    preferredFinalStatus: preferredPage?.finalStatus ?? null,
    preferredCanonical: preferredPage?.canonical ?? [],
    canonicalMatchesPreferred:
      preferredPage?.canonicalCount === 1 && sameUrl(preferredPage.canonical[0], preferredUrl),
    preferredIndexable: preferredPage?.indexable ?? null,
    preferredLanguage: preferredPage?.language ?? null,
  };
});
if (base && !args.includes('--no-asset-probes')) {
  const candidates = ['', 'length/', 'length/meters-to-feet/']
    .map((prefix) =>
      rscMappings.find(
        (entry) =>
          entry.sourceFile.startsWith(`${prefix}__next.`) &&
          entry.sourceFile.endsWith('/__PAGE__.txt'),
      ),
    )
    .filter(Boolean);
  for (const entry of candidates) {
    const route = `/${entry.expectedFile}`;
    try {
      const response = await fetchChain(route, {
        accept: 'text/x-component,text/plain,*/*',
        rsc: '1',
      });
      const check = {
        url: asUrl(route),
        sourceFile: entry.sourceFile,
        status: response.status,
        finalStatus: response.finalStatus,
        redirectChain: response.redirectChain,
        contentType: response.contentType,
        responseCharacters: response.html.length,
        htmlDocumentReturned: /^\s*(?:<!doctype\s+html|<html)/i.test(response.html),
      };
      rscHttpChecks.push(check);
      if (
        response.status !== 200 ||
        response.finalStatus !== 200 ||
        !response.html.length ||
        check.htmlDocumentReturned ||
        !/text\/(?:plain|x-component)/i.test(response.contentType ?? '')
      )
        issue('error', 'rsc-segment-asset-not-directly-served', route, check);
    } catch (error) {
      const check = { url: asUrl(route), error: error.message };
      rscHttpChecks.push(check);
      issue('error', 'rsc-segment-asset-fetch-failed', route, check);
    }
  }
}
if (!selected) {
  for (const entry of affectedMappings) {
    if (
      !entry.preferredExportExists ||
      !entry.preferredSitemapIncluded ||
      !entry.canonicalMatchesPreferred ||
      !entry.preferredIndexable ||
      (base && entry.preferredStatus !== 200)
    )
      issue(
        'error',
        'affected-url-preferred-target-incomplete',
        new URL(entry.preferredUrl).pathname,
        entry,
      );
  }
}
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  startedAt: started.toISOString(),
  mode,
  base,
  productionOrigin: production,
  requestCount,
  provenance: {
    gitCommitAtAudit: commit,
    exportDirectory: directory,
    exportIndexModifiedAt: buildFile.mtime.toISOString(),
    note: base
      ? 'HTTP audit against supplied server. It must implement deployment routing/headers; this tool does not emulate edge behavior.'
      : 'Existing export artifact only. Commit at audit is not proof of the artifact build commit. HTTP statuses, response headers and redirects are unknown.',
  },
  summary: {
    exportedHtmlPages: htmlFiles.length,
    preferredExportedRoutes: routes.size,
    sitemapUrls: sitemapUrls.length,
    uniqueSitemapUrls: new Set(sitemapUrls).size,
    auditedUrls: pages.length,
    routeTypes: countBy(pages, (page) => page.routeType),
    languages: countBy(
      pages.filter((page) => page.language),
      (page) => page.language,
    ),
    statusCounts: countBy(pages, (page) => page.status ?? 'unknown'),
    issueCounts: countBy(issues, (item) => item.severity),
    issueCodeCounts: countBy(issues, (item) => item.code),
    suspiciousDuplicateGroups: suspiciousDuplicates.length,
    brokenInternalTargets: brokenLinks.size,
  },
  robots: {
    artifactText: robotsText,
    note: 'artifactText is from --dir; HTTP robot response captured separately below when --base is supplied.',
  },
  searchConsoleAffected: {
    sourceFile: affectedText === null ? null : affectedFile,
    suppliedCount: affectedUrls.length,
    uniqueSuppliedCount: new Set(affectedUrls).size,
    suppliedSchemes: countBy(affectedMappings, (entry) => entry.suppliedScheme),
    preferredTargetsAudited: affectedMappings.filter((entry) => entry.preferredTargetAudited)
      .length,
    preferredTargetsInSitemap: affectedMappings.filter((entry) => entry.preferredSitemapIncluded)
      .length,
    preferredTargetsWithMatchingCanonical: affectedMappings.filter(
      (entry) => entry.canonicalMatchesPreferred,
    ).length,
    sourceProtocolVariantsExcludedFromSitemap: affectedMappings.filter(
      (entry) => entry.suppliedScheme !== 'https' && !entry.suppliedUrlInSitemap,
    ).length,
    note: 'These are user-supplied affected URLs. Mapping verifies their preferred same-path production URL using this audit; it does not establish Google-selected canonicals or historical traffic causes.',
    urls: affectedMappings,
  },
  ancillaryAssets: {
    note: 'Next.js segmented RSC payloads are utility assets, checked separately from organic HTML metadata. Nested export filenames require their browser-requested dotted filename to exist.',
    nestedRscSegmentFiles: rscMappings.length,
    missingFlattenedRscAssets: missingRscAssets,
    representativeRscHttpChecks: rscHttpChecks,
  },
  inventory: {
    routes: inventory,
    sitemapUrls,
    sitemapSource: base
      ? sitemapResponse?.finalStatus === 200
        ? 'HTTP response'
        : 'HTTP unavailable; no artifact fallback'
      : 'export artifact',
    artifactSitemapUrlCount: [...artifactSitemapXml.matchAll(/<loc>/g)].length,
    noncontentHtmlArtifacts: artifacts.map(relative),
    sitemapOnlyPaths: [...sitemapPaths].filter((route) => !routes.has(route)),
    exportOnlyPaths: [...routes.keys()].filter((route) => !sitemapPaths.has(route)),
  },
  issues,
  suspiciousDuplicates,
  brokenInternalLinks: [...brokenLinks.values()],
  pages,
};
if (robotsResponse) report.robotsHttp = robotsResponse;
if (sitemapResponse)
  report.sitemapHttp = {
    ...sitemapResponse,
    html: undefined,
    sitemapUrlCount: [...sitemapResponse.html.matchAll(/<loc>/g)].length,
  };
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ output, ...report.summary }, null, 2)}\n`);
if (args.includes('--fail-on-errors') && issues.some((item) => item.severity === 'error'))
  process.exitCode = 1;
