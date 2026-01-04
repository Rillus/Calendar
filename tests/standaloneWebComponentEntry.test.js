import { describe, it, expect } from 'vitest';

describe('standalone web component entry', () => {
  it('should define <circular-calendar> when imported', async () => {
    await import('../src/web-components/standalone.js');

    expect(customElements.get('circular-calendar')).toBeDefined();
  });
});

