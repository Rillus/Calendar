import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultEntryPoint = path.join(projectRoot, 'src', 'web-components', 'standalone.js');
const defaultOutfile = path.join(projectRoot, 'dist', 'circular-calendar.min.js');

export async function buildWebComponentBundle({
  entryPoint = defaultEntryPoint,
  outfile = defaultOutfile,
  minify = true,
  sourcemap = false
} = {}) {
  const esbuild = await import('esbuild');

  await fs.mkdir(path.dirname(outfile), { recursive: true });

  const result = await esbuild.build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    platform: 'browser',
    format: 'iife',
    target: ['es2018'],
    minify,
    sourcemap,
    legalComments: 'none'
  });

  // Avoid leaving stale sourcemaps around when sourcemap=false.
  if (!sourcemap) {
    await fs.rm(`${outfile}.map`, { force: true });
  }

  return result;
}

const isDirectRun =
  typeof process?.argv?.[1] === 'string' &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await buildWebComponentBundle();
  console.log(`Built: ${path.relative(projectRoot, defaultOutfile)}`);
}

