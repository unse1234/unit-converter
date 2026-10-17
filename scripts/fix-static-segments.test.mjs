import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fixStaticSegments } from './fix-static-segments.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'unitflip-segments-'));
  t.after(async () => {
    // Verify the exact mkdtemp target before recursive cleanup on Windows.
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('unitflip-segments-'));
    await rm(root, { recursive: true, force: true });
  });
  const put = async (relative, text) => {
    const destination = path.join(root, ...relative.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, text);
    return destination;
  };
  return { root, put };
}

test('flattens Windows-style generated subtree output and preserves originals', async (t) => {
  const { root, put } = await fixture(t);
  const nested = await put('length/__next.!KG1haW4p/$d$category/__PAGE__.txt', 'flight category');
  await put('__next.!KG1haW4p/__PAGE__.txt', 'flight home');
  await put('length/meters-to-feet.html', '<h1>Converter</h1>');
  await put('ordinary/subtree.txt', 'unrelated');
  assert.deepEqual(await fixStaticSegments(root, { concurrency: 2 }), {
    nestedSegments: 2,
    copied: 2,
    unchanged: 0,
  });
  assert.equal(
    await readFile(path.join(root, 'length', '__next.!KG1haW4p.$d$category.__PAGE__.txt'), 'utf8'),
    'flight category',
  );
  assert.equal(
    await readFile(path.join(root, '__next.!KG1haW4p.__PAGE__.txt'), 'utf8'),
    'flight home',
  );
  assert.equal(await readFile(nested, 'utf8'), 'flight category');
  assert.equal(
    await readFile(path.join(root, 'length', 'meters-to-feet.html'), 'utf8'),
    '<h1>Converter</h1>',
  );
});

test('already-correct Linux export is a no-op', async (t) => {
  const { root, put } = await fixture(t);
  const correct = await put('length/__next.!KG1haW4p.$d$category.__PAGE__.txt', 'flight category');
  await put('length/__next._tree.txt', 'tree');
  assert.deepEqual(await fixStaticSegments(root), { nestedSegments: 0, copied: 0, unchanged: 0 });
  assert.equal(await readFile(correct, 'utf8'), 'flight category');
});

test('repair is idempotent and accepts an existing identical payload', async (t) => {
  const { root, put } = await fixture(t);
  await put('pt/__next.!KGxvY2FsaXplZCk/pt/__PAGE__.txt', 'localized flight');
  await put('pt/__next.!KGxvY2FsaXplZCk.pt.__PAGE__.txt', 'localized flight');
  for (let index = 0; index < 2; index++) {
    assert.deepEqual(await fixStaticSegments(root), { nestedSegments: 1, copied: 0, unchanged: 1 });
  }
});

test('refuses a collision with different contents', async (t) => {
  const { root, put } = await fixture(t);
  await put('__next.!KG1haW4p/__PAGE__.txt', 'expected payload');
  const target = await put('__next.!KG1haW4p.__PAGE__.txt', 'different payload');
  await assert.rejects(
    fixStaticSegments(root),
    /Refusing to overwrite a different segment payload/,
  );
  assert.equal(await readFile(target, 'utf8'), 'different payload');
});
