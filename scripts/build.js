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
  sourcemap = true
} = {}) {
  const esbuild = await import('esbuild');

  await fs.mkdir(path.dirname(outfile), { recursive: true });

  return esbuild.build({
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
}

const isDirectRun =
  typeof process?.argv?.[1] === 'string' &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await buildWebComponentBundle();
  console.log(`Built: ${path.relative(projectRoot, defaultOutfile)}`);
}

