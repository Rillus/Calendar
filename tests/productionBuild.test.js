// @vitest-environment node

import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { buildWebComponentBundle } from '../scripts/build.js';

describe('production build', () => {
  it('should produce a minified standalone bundle', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'circular-calendar-build-'));

    const unminifiedOutfile = path.join(tmpDir, 'circular-calendar.js');
    const minifiedOutfile = path.join(tmpDir, 'circular-calendar.min.js');

    await buildWebComponentBundle({ outfile: unminifiedOutfile, minify: false, sourcemap: false });
    await buildWebComponentBundle({ outfile: minifiedOutfile, minify: true, sourcemap: false });

    const [unminifiedStat, minifiedStat] = await Promise.all([
      fs.stat(unminifiedOutfile),
      fs.stat(minifiedOutfile)
    ]);

    expect(unminifiedStat.size).toBeGreaterThan(0);
    expect(minifiedStat.size).toBeGreaterThan(0);
    expect(minifiedStat.size).toBeLessThan(unminifiedStat.size);
  });
});

