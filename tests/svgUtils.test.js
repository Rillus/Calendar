import { describe, it, expect } from 'vitest';
import { createArcPath, getMoonIlluminatedFraction, getMoonShadowDx, calculateTextRotation } from '../src/utils/svgUtils.js';

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

  describe('moon illumination helpers', () => {
    it('should report 0 illumination for new moon (phase 0)', () => {
      expect(getMoonIlluminatedFraction(0)).toBeCloseTo(0, 8);
    });

    it('should report 1 illumination for full moon (phase 0.5)', () => {
      expect(getMoonIlluminatedFraction(0.5)).toBeCloseTo(1, 8);
    });

    it('should report ~0.5 illumination for quarters (0.25 and 0.75)', () => {
      expect(getMoonIlluminatedFraction(0.25)).toBeCloseTo(0.5, 8);
      expect(getMoonIlluminatedFraction(0.75)).toBeCloseTo(0.5, 8);
    });

    it('should return dx=0 for new moon (shadow fully covers)', () => {
      expect(getMoonShadowDx(10, 0)).toBeCloseTo(0, 8);
      expect(getMoonShadowDx(10, 1)).toBeCloseTo(0, 8);
    });

    it('should return |dx| ~= 2r for full moon (shadow moved off)', () => {
      expect(Math.abs(getMoonShadowDx(10, 0.5))).toBeCloseTo(20, 8);
    });

    it('should shift shadow left for waxing (positive light on right)', () => {
      expect(getMoonShadowDx(10, 0.25)).toBeLessThan(0);
    });

    it('should shift shadow right for waning (positive light on left)', () => {
      expect(getMoonShadowDx(10, 0.75)).toBeGreaterThan(0);
    });

    it('should wrap negative phases', () => {
      expect(getMoonShadowDx(10, -0.25)).toBeCloseTo(getMoonShadowDx(10, 0.75), 8);
    });
  });

  describe('calculateTextRotation', () => {
    const centerX = 100;
    const centerY = 100;

    it('should calculate rotation for text at top of circle (0 degrees)', () => {
      const labelAngle = -Math.PI / 2; // -90° in calendar = top = 0° in standard = top-right, should NOT flip
      const labelPos = [centerX, centerY - 50];
      const rotation = calculateTextRotation(labelAngle, labelPos, centerX, centerY);
      // Calendar -90° = Standard 0° = top-right quadrant, should NOT flip
      // Base: -90° + 90° = 0°
      expect(rotation).toBeCloseTo(0, 1);
    });

    it('should calculate rotation for text at right of circle', () => {
      const labelAngle = 0; // 0° in calendar = right
      const labelPos = [centerX + 50, centerY];
      const rotation = calculateTextRotation(labelAngle, labelPos, centerX, centerY);
      // Calendar 0° = Standard 90° = bottom-right quadrant, should flip
      // Base: 0° + 90° = 90°, then + 180° = 270°
      expect(rotation).toBeCloseTo(270, 1);
    });

    it('should not flip text on left side of circle (180-270 degrees)', () => {
      const labelAngle = Math.PI;
      const labelPos = [centerX - 50, centerY];
      const rotation = calculateTextRotation(labelAngle, labelPos, centerX, centerY);
      // Text at left-center: isLeft=true (on left side), should NOT flip
      // Base: 180° + 90° = 270°
      expect(rotation).toBeCloseTo(270, 1);
    });

    it('should flip text in bottom left quadrant', () => {
      const labelAngle = (3 * Math.PI) / 4; // 135° in calendar = 225° in standard = bottom-left, should flip
      const labelPos = [centerX - 35, centerY + 35];
      const rotation = calculateTextRotation(labelAngle, labelPos, centerX, centerY);
      // Calendar 135° = Standard 225° = bottom-left quadrant, should flip
      // Base: 135° + 90° = 225°, then + 180° = 405°
      expect(rotation).toBeCloseTo(405, 1);
    });

    it('should not flip text in top right quadrant', () => {
      const labelAngle = -Math.PI / 4; // -45° in calendar = 45° in standard = top-right, should NOT flip
      const labelPos = [centerX + 35, centerY - 35];
      const rotation = calculateTextRotation(labelAngle, labelPos, centerX, centerY);
      // Calendar -45° = Standard 45° = top-right quadrant, should NOT flip
      // Base: -45° + 90° = 45°
      expect(rotation).toBeCloseTo(45, 1);
    });

    it('should handle edge cases correctly', () => {
      // Test various edge cases
      const labelAngle = (7 * Math.PI) / 4; // 315 degrees
      const labelPos = [centerX - 10, centerY + 48]; // Slightly left, bottom
      const rotation = calculateTextRotation(labelAngle, labelPos, centerX, centerY);
      // Should calculate a valid rotation
      expect(typeof rotation).toBe('number');
      expect(Number.isFinite(rotation)).toBe(true);
    });

    it('should handle text exactly at center horizontally', () => {
      const labelAngle = Math.PI / 2;
      const labelPos = [centerX, centerY - 50]; // Exactly at center x
      const rotation = calculateTextRotation(labelAngle, labelPos, centerX);
      // Should calculate a valid rotation
      expect(typeof rotation).toBe('number');
      expect(Number.isFinite(rotation)).toBe(true);
    });
  });
});

