/*********************/
/* SVG utilities */
/*********************/

import { polarToCartesian } from './mathUtils.js';

// Creates an SVG arc path for calendar segments
export function createArcPath(centerX, centerY, radius, startAngle, endAngle, outerRadiusRatio = 1.0, innerRadius = 0) {
    const outerRadius = radius * outerRadiusRatio;
    const start = polarToCartesian(centerX, centerY, outerRadius, endAngle);
    const end = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const innerStart = innerRadius > 0 ? polarToCartesian(centerX, centerY, innerRadius, endAngle) : [centerX, centerY];
    const innerEnd = innerRadius > 0 ? polarToCartesian(centerX, centerY, innerRadius, startAngle) : [centerX, centerY];
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    if (innerRadius > 0) {
        return [
            "M", start[0], start[1],
            "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end[0], end[1],
            "L", innerEnd[0], innerEnd[1],
            "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart[0], innerStart[1],
            "Z"
        ].join(" ");
    } else {
        return [
            "M", centerX, centerY,
            "L", start[0], start[1],
            "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end[0], end[1],
            "Z"
        ].join(" ");
    }
}

const normalisePhase = (phase) => {
    const value = Number(phase);
    if (!Number.isFinite(value)) return 0;
    // Wrap into [0, 1)
    const wrapped = ((value % 1) + 1) % 1;
    return wrapped;
};

export function getMoonIlluminatedFraction(phase) {
    const p = normalisePhase(phase);
    const angle = p * 2 * Math.PI;
    // 0 (new) -> 1 (full) -> 0 (new)
    return (1 - Math.cos(angle)) / 2;
}

/**
 * Returns the horizontal offset (dx) for a shadow circle used to shade the moon.
 *
 * Used with a white base disc + a clipped black shadow circle of equal radius:
 * - new moon: dx ~= 0 (shadow covers disc)
 * - full moon: |dx| ~= 2r (shadow moved off disc)
 * - waxing phases: shadow moves left (negative dx), leaving light on the right
 * - waning phases: shadow moves right (positive dx), leaving light on the left
 */
export function getMoonShadowDx(radius, phase) {
    const rValue = Number(radius);
    if (!Number.isFinite(rValue) || rValue <= 0) return 0;

    const p = normalisePhase(phase);
    const illuminatedFraction = getMoonIlluminatedFraction(p);

    const magnitude = 2 * rValue * illuminatedFraction;
    const isWaxing = p < 0.5;
    const direction = isWaxing ? -1 : 1;
    // At exact new moon magnitude is 0, so direction doesn't matter.
    return direction * magnitude;
}

const formatNumber = (value) => {
    // Keep path strings stable for tests and diffs.
    if (Math.abs(value) < 1e-10) return '0';
    const rounded = Math.round(value * 1000) / 1000;
    return String(rounded);
};

const createCirclePath = (centerX, centerY, radius) => {
    const cx = formatNumber(centerX);
    const cy = formatNumber(centerY);
    const r = formatNumber(radius);
    const topY = formatNumber(centerY - radius);
    const bottomY = formatNumber(centerY + radius);
    return [
        'M', cx, topY,
        'A', r, r, 0, 1, 1, cx, bottomY,
        'A', r, r, 0, 1, 1, cx, topY,
        'Z'
    ].join(' ');
};

/**
 * Calculates the rotation angle for text positioned around a circle.
 * Ensures text is always right-side up and readable from outside the circle.
 * 
 * The calendar uses an angle system with -90° offset (top = 0° in calendar, -90° in standard polar).
 * Text should be readable from outside the circle.
 * 
 * @param {number} labelAngle - The angle in radians where the label is positioned (in calendar's coordinate system)
 * @param {Array<number>} labelPos - [x, y] position of the label
 * @param {number} centerX - X coordinate of the circle center
 * @param {number} centerY - Y coordinate of the circle center (optional, defaults to centerX for square SVGs)
 * @returns {number} Rotation angle in degrees for the SVG transform
 */
export function calculateTextRotation(labelAngle, labelPos, centerX, centerY = centerX) {
  // Calculate base rotation to make text tangent to the circle
  let textRotation = (labelAngle * 180 / Math.PI) + 90;
  
  // The calendar uses a -90° offset coordinate system
  // Calendar: -90° = top, 0° = right, 90° = bottom, 180° = left
  // Standard: 0° = right, 90° = bottom, 180° = left, 270° = top
  // Convert calendar angle to standard angle for quadrant detection
  const standardAngle = labelAngle + (Math.PI / 2); // Add 90° to convert
  const standardAngleDeg = standardAngle * 180 / Math.PI;
  
  // Normalize to 0-360 range
  let normalizedDeg = standardAngleDeg;
  while (normalizedDeg < 0) normalizedDeg += 360;
  while (normalizedDeg >= 360) normalizedDeg -= 360;
  
  // Determine quadrant in standard coordinates
  // User reports: bottom-right (Apr, May, Jun) and bottom-left (Jul, Aug, Sep) are upside down
  // Top-left and top-right (Jan, Feb, Mar) are correct
  // So we need to flip bottom-right (90-180°) and bottom-left (180-270°)
  const isBottomRight = normalizedDeg >= 90 && normalizedDeg < 180;
  const isBottomLeft = normalizedDeg >= 180 && normalizedDeg < 270;
  
  if (isBottomRight || isBottomLeft) {
    // Bottom-right or bottom-left: flip to fix upside-down text
    textRotation += 180;
  }
  // Top-left and top-right: don't flip (these are already correct)
  
  return textRotation;
}

/**
 * Creates an SVG path for the illuminated portion of the moon.
 *
 * Phase is normalised so 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter.
 *
 * Returns:
 * - null for (near) new moon
 * - a closed path string for other phases (including full moon)
 */
export function createMoonIlluminatedPath(centerX, centerY, radius, phase) {
    const rValue = Number(radius);
    if (!Number.isFinite(rValue) || rValue <= 0) return null;

    const p = normalisePhase(phase);
    const angle = p * 2 * Math.PI;

    // Fraction illuminated: 0 (new) -> 1 (full) -> 0 (new)
    const illuminatedFraction = (1 - Math.cos(angle)) / 2;
    const epsilon = 1e-6;

    if (illuminatedFraction <= epsilon) return null;
    if (illuminatedFraction >= 1 - epsilon) {
        return createCirclePath(centerX, centerY, rValue);
    }

    const cx = formatNumber(centerX);
    const cy = formatNumber(centerY);
    const r = formatNumber(rValue);
    const topY = formatNumber(centerY - rValue);
    const bottomY = formatNumber(centerY + rValue);

    // The terminator projects as an ellipse. Quarter moons have rx ~= 0 (straight line).
    const terminatorRx = Math.abs(Math.cos(angle)) * rValue;
    const rx = formatNumber(terminatorRx);

    // Waxing: lit on the right. Waning: lit on the left.
    const isWaxing = p < 0.5;
    const limbSweep = isWaxing ? 1 : 0;

    // Choose which side of the terminator ellipse to trace:
    // - crescents (< 0.5 illuminated): terminator must be on the SAME side as the lit limb,
    //   otherwise you get a thick shape instead of a thin sliver.
    // - gibbous (> 0.5 illuminated): terminator is on the OPPOSITE side, so most of the disc is lit.
    const isGibbous = illuminatedFraction > 0.5;
    const terminatorSweep = isGibbous ? (limbSweep ? 0 : 1) : limbSweep;

    // With top/bottom endpoints, largeArcFlag has no visible effect, but keep it explicit.
    const largeArcFlag = 0;

    return [
        'M', cx, topY,
        'A', r, r, 0, 0, limbSweep, cx, bottomY,
        'A', rx, r, 0, largeArcFlag, terminatorSweep, cx, topY,
        'Z'
    ].join(' ');
}

