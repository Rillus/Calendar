// @vitest-environment node

import { describe, it, expect } from 'vitest';
import fs from 'node:fs/promises';

describe('index.html controls', () => {
  it('should include toggles for time selection and 12-hour clock', async () => {
    const html = await fs.readFile(new URL('../index.html', import.meta.url), 'utf8');

    expect(html).toContain('id="toggle-include-time"');
    expect(html).toContain('id="toggle-12-hour"');
  });
});

