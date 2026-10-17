#!/usr/bin/env node
/**
 * Next's Windows exporter passes backslashes to its slash-only segment encoder.
 * Copy nested generated segment payloads to the dotted names requested by the
 * browser. Correct Linux exports are unchanged; original payloads are retained.
 */
import { constants } from 'node:fs';
import { copyFile, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function inside(root, candidate) {
  const relative = path.relative(root, candidate);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Segment path escapes export directory: ${candidate}`);
  }
  return candidate;
}

export async function fixStaticSegments(directory, { concurrency = 6 } = {}) {
  const root = await realpath(path.resolve(directory));
  const pending = [];
  async function walk(folder, segmentRoot = null) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const source = inside(root, path.join(folder, entry.name));
      // Never follow symlinks outside the export tree.
      if (entry.isDirectory()) {
        const generated = segmentRoot ?? (entry.name.startsWith('__next.') ? source : null);
        await walk(source, generated);
      } else if (entry.isFile() && segmentRoot && entry.name.endsWith('.txt')) {
        const suffix = path.relative(segmentRoot, source).split(path.sep).join('.');
        const destination = inside(
          root,
          path.join(path.dirname(segmentRoot), `${path.basename(segmentRoot)}.${suffix}`),
        );
        pending.push({ source, destination });
      }
    }
  }
  await walk(root);
  let cursor = 0;
  let copied = 0;
  let unchanged = 0;
  async function sameContents(source, destination) {
    const [sourceBytes, destinationBytes] = await Promise.all([
      readFile(source),
      readFile(destination),
    ]);
    if (!sourceBytes.equals(destinationBytes)) {
      throw new Error(`Refusing to overwrite a different segment payload: ${destination}`);
    }
  }
  const workers = Math.max(1, Math.min(12, Math.trunc(concurrency) || 1));
  await Promise.all(
    Array.from({ length: Math.min(workers, pending.length) }, async () => {
      while (cursor < pending.length) {
        const { source, destination } = pending[cursor++];
        try {
          await copyFile(source, destination, constants.COPYFILE_EXCL);
          copied++;
        } catch (error) {
          if (error.code !== 'EEXIST') throw error;
          await sameContents(source, destination);
          unchanged++;
        }
      }
    }),
  );
  return { nestedSegments: pending.length, copied, unchanged };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await fixStaticSegments(process.argv[2] ?? 'out');
    process.stdout.write(`${JSON.stringify({ staticSegmentRepair: result })}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
