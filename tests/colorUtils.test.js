import { describe, it, expect } from 'vitest';
import { rgbToHex, rgbToRgbString, colourSum, getContrastColor } from '../src/utils/colorUtils.js';

describe('colorUtils', () => {
  describe('rgbToHex', () => {
    it('should convert RGB array to hex string', () => {
      expect(rgbToHex([255, 255, 255])).toBe('#ffffff');
    });

    it('should convert black to hex', () => {
      expect(rgbToHex([0, 0, 0])).toBe('#000000');
    });

    it('should convert red to hex', () => {
      expect(rgbToHex([255, 0, 0])).toBe('#ff0000');
    });

    it('should convert green to hex', () => {
      expect(rgbToHex([0, 255, 0])).toBe('#00ff00');
    });

    it('should convert blue to hex', () => {
      expect(rgbToHex([0, 0, 255])).toBe('#0000ff');
    });

    it('should pad single digit hex values', () => {
      expect(rgbToHex([10, 15, 5])).toBe('#0a0f05');
    });

    it('should handle month colors correctly', () => {
      expect(rgbToHex([72, 88, 154])).toBe('#48589a'); // JAN
      expect(rgbToHex([39, 93, 164])).toBe('#275da4'); // FEB
      expect(rgbToHex([153, 32, 122])).toBe('#99207a'); // DEC
    });

    it('should handle values at boundaries', () => {
      expect(rgbToHex([0, 0, 0])).toBe('#000000');
      expect(rgbToHex([255, 255, 255])).toBe('#ffffff');
    });
  });

  describe('rgbToRgbString', () => {
    it('should convert RGB array to CSS rgb string', () => {
      expect(rgbToRgbString([255, 128, 64])).toBe('rgb(255, 128, 64)');
    });

    it('should handle zero values', () => {
      expect(rgbToRgbString([0, 0, 0])).toBe('rgb(0, 0, 0)');
    });

    it('should handle maximum values', () => {
      expect(rgbToRgbString([255, 255, 255])).toBe('rgb(255, 255, 255)');
    });

    it('should format correctly with spaces', () => {
      const result = rgbToRgbString([100, 200, 50]);
      expect(result).toBe('rgb(100, 200, 50)');
      expect(result).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });
  });

  describe('colourSum', () => {
    it('should return first colour when thisStep is 0', () => {
      const colour1 = [100, 100, 100];
      const colour2 = [200, 200, 200];
      const result = colourSum(colour1, colour2, 10, 0);
      expect(result).toEqual([100, 100, 100]);
    });

    it('should return second colour when thisStep equals steps', () => {
      const colour1 = [100, 100, 100];
      const colour2 = [200, 200, 200];
      const result = colourSum(colour1, colour2, 10, 10);
      expect(result).toEqual([200, 200, 200]);
    });

    it('should interpolate between two colours', () => {
      const colour1 = [0, 0, 0];
      const colour2 = [100, 100, 100];
      const result = colourSum(colour1, colour2, 4, 2);
      // Should be halfway: 0 + (100-0)/4 * 2 = 50
      expect(result[0]).toBe(50);
      expect(result[1]).toBe(50);
      expect(result[2]).toBe(50);
    });

    it('should handle colour1 greater than colour2', () => {
      const colour1 = [200, 200, 200];
      const colour2 = [100, 100, 100];
      const result = colourSum(colour1, colour2, 4, 2);
      // Should decrease: 200 - (200-100)/4 * 2 = 150
      expect(result[0]).toBe(150);
      expect(result[1]).toBe(150);
      expect(result[2]).toBe(150);
    });

    it('should handle mixed colour relationships', () => {
      const colour1 = [100, 50, 200];
      const colour2 = [200, 150, 100];
      const result = colourSum(colour1, colour2, 10, 5);
      // R: 100 < 200, so 100 + (200-100)/10 * 5 = 150
      // G: 50 < 150, so 50 + (150-50)/10 * 5 = 100
      // B: 200 > 100, so 200 - (200-100)/10 * 5 = 150
      expect(result[0]).toBe(150);
      expect(result[1]).toBe(100);
      expect(result[2]).toBe(150);
    });

    it('should round values correctly', () => {
      const colour1 = [0, 0, 0];
      const colour2 = [3, 3, 3];
      const result = colourSum(colour1, colour2, 3, 1);
      // 0 + (3-0)/3 * 1 = 1
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(1);
      expect(result[2]).toBe(1);
    });

    it('should handle single step interpolation', () => {
      const colour1 = [0, 0, 0];
      const colour2 = [255, 255, 255];
      const result = colourSum(colour1, colour2, 1, 1);
      expect(result).toEqual([255, 255, 255]);
    });

    it('should handle equal colours', () => {
      const colour1 = [100, 100, 100];
      const colour2 = [100, 100, 100];
      const result = colourSum(colour1, colour2, 10, 5);
      expect(result).toEqual([100, 100, 100]);
    });

    it('should return array with three elements', () => {
      const result = colourSum([0, 0, 0], [255, 255, 255], 10, 5);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });

    it('should handle seasonal colour transitions', () => {
      // Test winter to spring transition
      const winter = [72, 88, 154];  // JAN
      const spring = [101, 154, 139]; // APR
      const result = colourSum(winter, spring, 3, 1);
      expect(result.length).toBe(3);
      expect(result[0]).toBeGreaterThanOrEqual(0);
      expect(result[0]).toBeLessThanOrEqual(255);
    });
  });

  describe('getContrastColor', () => {
    it('should return white for dark colours', () => {
      expect(getContrastColor([0, 0, 0])).toBe('#fff');
      expect(getContrastColor([50, 50, 50])).toBe('#fff');
      expect(getContrastColor([72, 88, 154])).toBe('#fff'); // JAN (dark)
    });

    it('should return black for light colours', () => {
      expect(getContrastColor([255, 255, 255])).toBe('#000');
      expect(getContrastColor([200, 200, 200])).toBe('#000');
      expect(getContrastColor([238, 225, 92])).toBe('#000'); // JUL (light yellow)
    });

    it('should handle month colours correctly', () => {
      // Dark colours should return white
      expect(getContrastColor([72, 88, 154])).toBe('#fff'); // JAN
      expect(getContrastColor([39, 93, 164])).toBe('#fff'); // FEB
      expect(getContrastColor([153, 32, 122])).toBe('#fff'); // DEC
      
      // Light colours should return black (based on WCAG luminance)
      expect(getContrastColor([238, 225, 92])).toBe('#000'); // JUL (light yellow - high luminance)
    });

    it('should handle dark mode month colours', () => {
      // Dark mode colours are lighter, so should use black text for better contrast
      expect(getContrastColor([107, 123, 184])).toBe('#fff'); // JAN dark mode (luminance below threshold)
      expect(getContrastColor([238, 225, 92])).toBe('#000'); // JUL dark mode (high luminance)
      expect(getContrastColor([250, 152, 60])).toBe('#000'); // OCT dark mode (luminance above threshold)
    });

    it('should handle edge cases', () => {
      // Middle gray should default to white for better contrast on average
      expect(getContrastColor([128, 128, 128])).toBe('#fff');
      expect(getContrastColor([127, 127, 127])).toBe('#fff');
    });

    it('should always return either black or white', () => {
      const colours = [
        [0, 0, 0],
        [128, 128, 128],
        [255, 255, 255],
        [100, 50, 200],
        [200, 100, 50]
      ];
      
      colours.forEach(colour => {
        const result = getContrastColor(colour);
        expect(['#000', '#fff']).toContain(result);
      });
    });
  });
});

