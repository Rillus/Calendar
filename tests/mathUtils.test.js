import { describe, it, expect } from 'vitest';
import { degreesToRadians, sumTo, polarToCartesian } from '../src/utils/mathUtils.js';

describe('mathUtils', () => {
  describe('degreesToRadians', () => {
    it('should convert 0 degrees to 0 radians', () => {
      expect(degreesToRadians(0)).toBe(0);
    });

    it('should convert 90 degrees to π/2 radians', () => {
      expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
    });

    it('should convert 180 degrees to π radians', () => {
      expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
    });

    it('should convert 360 degrees to 2π radians', () => {
      expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI);
    });

    it('should convert 45 degrees correctly', () => {
      expect(degreesToRadians(45)).toBeCloseTo(Math.PI / 4);
    });

    it('should convert negative degrees correctly', () => {
      expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2);
    });

    it('should handle decimal degrees', () => {
      expect(degreesToRadians(30.5)).toBeCloseTo((30.5 * Math.PI) / 180);
    });
  });

  describe('sumTo', () => {
    it('should return 0 for index 0', () => {
      expect(sumTo([1, 2, 3], 0)).toBe(0);
    });

    it('should sum elements up to but not including index', () => {
      expect(sumTo([1, 2, 3, 4], 2)).toBe(3); // 1 + 2
    });

    it('should sum all elements before the last index', () => {
      expect(sumTo([10, 20, 30], 2)).toBe(30); // 10 + 20
    });

    it('should handle empty array', () => {
      expect(sumTo([], 0)).toBe(0);
    });

    it('should handle single element array', () => {
      expect(sumTo([5], 0)).toBe(0);
      expect(sumTo([5], 1)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(sumTo([-1, -2, -3], 2)).toBe(-3); // -1 + -2
    });

    it('should handle decimal numbers', () => {
      expect(sumTo([1.5, 2.5, 3.5], 2)).toBe(4); // 1.5 + 2.5
    });

    it('should handle index beyond array length', () => {
      expect(sumTo([1, 2, 3], 10)).toBe(6); // 1 + 2 + 3
    });
  });

  describe('polarToCartesian', () => {
    it('should convert polar coordinates at origin', () => {
      const result = polarToCartesian(0, 0, 10, 0);
      expect(result[0]).toBeCloseTo(10);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should convert 90 degrees (π/2) correctly', () => {
      const result = polarToCartesian(0, 0, 10, Math.PI / 2);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(10);
    });

    it('should convert 180 degrees (π) correctly', () => {
      const result = polarToCartesian(0, 0, 10, Math.PI);
      expect(result[0]).toBeCloseTo(-10);
      expect(result[1]).toBeCloseTo(0);
    });

    it('should convert 270 degrees (3π/2) correctly', () => {
      const result = polarToCartesian(0, 0, 10, (3 * Math.PI) / 2);
      expect(result[0]).toBeCloseTo(0);
      expect(result[1]).toBeCloseTo(-10);
    });

    it('should handle offset center point', () => {
      const result = polarToCartesian(100, 100, 10, 0);
      expect(result[0]).toBeCloseTo(110);
      expect(result[1]).toBeCloseTo(100);
    });

    it('should handle 45 degrees correctly', () => {
      const result = polarToCartesian(0, 0, 10, Math.PI / 4);
      const expected = 10 / Math.sqrt(2);
      expect(result[0]).toBeCloseTo(expected);
      expect(result[1]).toBeCloseTo(expected);
    });

    it('should return array with two elements', () => {
      const result = polarToCartesian(0, 0, 5, 0);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should handle zero radius', () => {
      const result = polarToCartesian(50, 50, 0, Math.PI / 4);
      expect(result[0]).toBe(50);
      expect(result[1]).toBe(50);
    });

    it('should handle negative radius', () => {
      const result = polarToCartesian(0, 0, -10, 0);
      expect(result[0]).toBeCloseTo(-10);
      expect(result[1]).toBeCloseTo(0);
    });
  });
});

