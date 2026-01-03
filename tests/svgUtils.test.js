import { describe, it, expect } from 'vitest';
import { createArcPath, createMoonIlluminatedPath } from '../src/utils/svgUtils.js';

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

  describe('createMoonIlluminatedPath', () => {
    it('should return null for new moon (phase 0)', () => {
      const d = createMoonIlluminatedPath(0, 0, 10, 0);
      expect(d).toBe(null);
    });

    it('should return null for new moon again (phase 1)', () => {
      const d = createMoonIlluminatedPath(0, 0, 10, 1);
      expect(d).toBe(null);
    });

    it('should return a non-empty path for first quarter (phase 0.25)', () => {
      const d = createMoonIlluminatedPath(0, 0, 10, 0.25);
      expect(typeof d).toBe('string');
      expect(d.length).toBeGreaterThan(0);
      // Quarter moon terminator should be a straight line (rx ~= 0)
      expect(d).toContain('A 0 10');
    });

    it('should return a non-empty path for last quarter (phase 0.75)', () => {
      const d = createMoonIlluminatedPath(0, 0, 10, 0.75);
      expect(typeof d).toBe('string');
      expect(d.length).toBeGreaterThan(0);
      expect(d).toContain('A 0 10');
    });

    it('should return a circle-like path for full moon (phase 0.5)', () => {
      const d = createMoonIlluminatedPath(0, 0, 10, 0.5);
      expect(typeof d).toBe('string');
      expect(d).toContain('A 10 10');
      expect(d.trim().endsWith('Z')).toBe(true);
    });

    it('should treat negative phases as wrapping around', () => {
      const d1 = createMoonIlluminatedPath(0, 0, 10, -0.5);
      const d2 = createMoonIlluminatedPath(0, 0, 10, 0.5);
      expect(d1).toBe(d2);
    });

    it('should flip the terminator sweep between crescent and gibbous (waxing)', () => {
      // Waxing crescent: terminator should bulge opposite the lit side.
      const crescent = createMoonIlluminatedPath(0, 0, 10, 0.1);
      // Waxing gibbous: terminator should bulge with the lit side.
      const gibbous = createMoonIlluminatedPath(0, 0, 10, 0.4);
      expect(typeof crescent).toBe('string');
      expect(typeof gibbous).toBe('string');
      // Terminator is the second arc. Extract "... A <rx> 10 0 <largeArc> <sweep> ..."
      expect(crescent).toMatch(/A [^ ]+ 10 0 [01] 1 0 -10/);
      expect(gibbous).toMatch(/A [^ ]+ 10 0 [01] 0 0 -10/);
    });

    it('should flip the terminator sweep between crescent and gibbous (waning)', () => {
      const gibbous = createMoonIlluminatedPath(0, 0, 10, 0.6);
      const crescent = createMoonIlluminatedPath(0, 0, 10, 0.9);
      expect(typeof crescent).toBe('string');
      expect(typeof gibbous).toBe('string');
      expect(crescent).toMatch(/A [^ ]+ 10 0 [01] 0 0 -10/);
      expect(gibbous).toMatch(/A [^ ]+ 10 0 [01] 1 0 -10/);
    });
  });
});

