import { describe, it, expect } from 'vitest';
import { getMoonPhase, getMoonPhaseAngle, getMoonPhaseName } from '../src/utils/moonPhase.js';

describe('moonPhase', () => {
  describe('getMoonPhase', () => {
    it('should return a value between 0 and 1', () => {
      const phase = getMoonPhase(new Date(2024, 0, 1));
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThan(1);
    });

    it('should return consistent results for the same date', () => {
      const date = new Date(2024, 5, 15);
      const phase1 = getMoonPhase(date);
      const phase2 = getMoonPhase(date);
      expect(phase1).toBeCloseTo(phase2, 5);
    });

    it('should handle different dates', () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 6, 15);
      const phase1 = getMoonPhase(date1);
      const phase2 = getMoonPhase(date2);
      expect(phase1).not.toBe(phase2);
    });

    it('should return approximately 0 for new moon dates', () => {
      // Known new moon: January 11, 2024 11:57 UTC
      const newMoonDate = new Date(Date.UTC(2024, 0, 11, 11, 57));
      const phase = getMoonPhase(newMoonDate);
      // Should be very close to 0 for exact new moon time
      expect(phase).toBeLessThan(0.01);
    });
    
    it('should return small values for dates near new moon', () => {
      // Test dates within a day of new moon
      const nearNewMoon1 = new Date(Date.UTC(2024, 0, 10, 12, 0));
      const nearNewMoon2 = new Date(Date.UTC(2024, 0, 12, 12, 0));
      const phase1 = getMoonPhase(nearNewMoon1);
      const phase2 = getMoonPhase(nearNewMoon2);
      // Should be close to 0 or close to 1 (wrapping around)
      const isNearNew1 = phase1 < 0.1 || phase1 > 0.9;
      const isNearNew2 = phase2 < 0.1 || phase2 > 0.9;
      expect(isNearNew1 || isNearNew2).toBe(true);
    });
  });

  describe('getMoonPhaseAngle', () => {
    it('should return angle in radians', () => {
      const angle = getMoonPhaseAngle(new Date(2024, 0, 1));
      expect(typeof angle).toBe('number');
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThan(2 * Math.PI);
    });

    it('should return 0 for new moon (moon same side as sun)', () => {
      const newMoonDate = new Date(Date.UTC(2024, 0, 11, 11, 57));
      const angle = getMoonPhaseAngle(newMoonDate);
      // New moon should be at 0 radians (same side as sun)
      expect(angle).toBeCloseTo(0, 0.3);
    });

    it('should return approximately π for full moon (moon opposite to sun)', () => {
      // Known full moon: January 25, 2024 17:54 UTC
      const fullMoonDate = new Date(Date.UTC(2024, 0, 25, 17, 54));
      const angle = getMoonPhaseAngle(fullMoonDate);
      // Full moon should be at π radians (opposite to sun)
      expect(angle).toBeCloseTo(Math.PI, 0.5);
    });

    it('should return different angles for different dates', () => {
      // Test that angles vary based on date
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 15);
      const angle1 = getMoonPhaseAngle(date1);
      const angle2 = getMoonPhaseAngle(date2);
      expect(angle1).not.toBe(angle2);
    });
  });

  describe('getMoonPhaseName', () => {
    it('should return a string', () => {
      const name = getMoonPhaseName(new Date(2024, 0, 1));
      expect(typeof name).toBe('string');
    });

    it('should return "New Moon" for phase near 0', () => {
      const newMoonDate = new Date(Date.UTC(2024, 0, 11, 11, 57));
      const name = getMoonPhaseName(newMoonDate);
      expect(name.toLowerCase()).toContain('new');
    });

    it('should allow some leeway around new moon', () => {
      // Within ~36 hours either side of new moon should still be classified as New Moon.
      // This helps avoid "Waxing/Waning" being reported on the day people perceive as new.
      const newMoonDate = new Date(Date.UTC(2024, 0, 11, 11, 57));
      const before = new Date(newMoonDate.getTime() - 36 * 60 * 60 * 1000);
      const after = new Date(newMoonDate.getTime() + 36 * 60 * 60 * 1000);
      expect(getMoonPhaseName(before).toLowerCase()).toContain('new');
      expect(getMoonPhaseName(after).toLowerCase()).toContain('new');
    });

    it('should return "Full Moon" for phase near 0.5', () => {
      const fullMoonDate = new Date(Date.UTC(2024, 0, 25, 17, 54));
      const name = getMoonPhaseName(fullMoonDate);
      expect(name.toLowerCase()).toContain('full');
    });

    it('should allow some leeway around full moon', () => {
      // Within ~36 hours either side of full moon should still be classified as Full Moon.
      // This is intentionally forgiving, because the simplified phase model can be off.
      const fullMoonDate = new Date(Date.UTC(2024, 0, 25, 17, 54));
      const before = new Date(fullMoonDate.getTime() - 36 * 60 * 60 * 1000);
      const after = new Date(fullMoonDate.getTime() + 36 * 60 * 60 * 1000);
      expect(getMoonPhaseName(before).toLowerCase()).toContain('full');
      expect(getMoonPhaseName(after).toLowerCase()).toContain('full');
    });

    it('should return valid phase names', () => {
      const validPhases = ['new', 'waxing', 'first', 'full', 'waning', 'last'];
      const date = new Date(2024, 0, 1);
      const name = getMoonPhaseName(date).toLowerCase();
      const isValid = validPhases.some(phase => name.includes(phase));
      expect(isValid).toBe(true);
    });
  });
});

