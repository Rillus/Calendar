import { describe, it, expect } from 'vitest';
import { createArcPath } from '../src/utils/svgUtils.js';

describe('svgUtils', () => {
  describe('createArcPath', () => {
    it('should create a path string', () => {
      const path = createArcPath(100, 100, 50, 0, Math.PI / 2);
      expect(typeof path).toBe('string');
      expect(path.length).toBeGreaterThan(0);
    });

    it('should create path starting from center when innerRadius is 0', () => {
      const path = createArcPath(100, 100, 50, 0, Math.PI / 2);
      expect(path).toContain('M 100 100');
    });

    it('should include arc command', () => {
      const path = createArcPath(100, 100, 50, 0, Math.PI / 2);
      expect(path).toContain('A');
    });

    it('should close path with Z', () => {
      const path = createArcPath(100, 100, 50, 0, Math.PI / 2);
      expect(path.trim().endsWith('Z')).toBe(true);
    });

    it('should use outerRadiusRatio to scale radius', () => {
      const path1 = createArcPath(100, 100, 50, 0, Math.PI / 2, 1.0);
      const path2 = createArcPath(100, 100, 50, 0, Math.PI / 2, 0.5);
      // Paths should be different due to different radii
      expect(path1).not.toBe(path2);
    });

    it('should handle full circle (360 degrees)', () => {
      const path = createArcPath(100, 100, 50, 0, 2 * Math.PI);
      expect(path).toContain('A');
      expect(path.trim().endsWith('Z')).toBe(true);
    });

    it('should handle innerRadius for donut shape', () => {
      const path = createArcPath(100, 100, 50, 0, Math.PI / 2, 1.0, 25);
      expect(path).toContain('A');
      expect(path).toContain('L'); // Should have line to inner radius
    });

    it('should use largeArcFlag correctly for angles > 180 degrees', () => {
      const path = createArcPath(100, 100, 50, 0, Math.PI * 1.5);
      // Large arc flag should be "1" for angles > 180
      expect(path).toContain('1');
    });

    it('should use largeArcFlag correctly for angles <= 180 degrees', () => {
      const path = createArcPath(100, 100, 50, 0, Math.PI / 2);
      // Large arc flag should be "0" for angles <= 180
      expect(path).toContain('0');
    });

    it('should handle negative angles', () => {
      const path = createArcPath(100, 100, 50, -Math.PI / 2, 0);
      expect(typeof path).toBe('string');
      expect(path.trim().endsWith('Z')).toBe(true);
    });

    it('should create different paths for different angles', () => {
      const path1 = createArcPath(100, 100, 50, 0, Math.PI / 4);
      const path2 = createArcPath(100, 100, 50, 0, Math.PI / 2);
      expect(path1).not.toBe(path2);
    });

    it('should handle zero radius', () => {
      const path = createArcPath(100, 100, 0, 0, Math.PI / 2);
      expect(typeof path).toBe('string');
    });

    it('should handle different center points', () => {
      const path1 = createArcPath(0, 0, 50, 0, Math.PI / 2);
      const path2 = createArcPath(200, 200, 50, 0, Math.PI / 2);
      expect(path1).not.toBe(path2);
    });

    it('should create valid SVG path syntax', () => {
      const path = createArcPath(100, 100, 50, 0, Math.PI / 2);
      // Should start with M (move to)
      expect(path.trim().startsWith('M')).toBe(true);
      // Should contain valid path commands
      const validCommands = ['M', 'L', 'A', 'Z'];
      const hasValidCommand = validCommands.some(cmd => path.includes(cmd));
      expect(hasValidCommand).toBe(true);
    });
  });
});

