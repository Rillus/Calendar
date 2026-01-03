/*************/
/* Constants */
/*************/

export const calendarType = "year";
export const segments = 12;

// Custom seasonal color palette matching the image
// Each month gets its own color in the seasonal gradient
export const monthColors = [
    [120, 80, 160],   // JAN - Deep purple/blue
    [100, 120, 200],  // FEB - Medium blue
    [80, 180, 220],   // MAR - Light blue/teal
    [60, 200, 200],   // APR - Greenish-blue
    [100, 220, 140],  // MAY - Light green
    [160, 240, 100],  // JUN - Yellow-green
    [255, 242, 0],    // JUL - Bright yellow
    [255, 200, 0],    // AUG - Golden yellow
    [255, 140, 60],   // SEP - Orange
    [255, 100, 80],   // OCT - Red-orange
    [220, 80, 120],   // NOV - Darker red-orange/magenta
    [180, 100, 160]   // DEC - Purple/magenta
];

export const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
export const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const deg = 360 / segments;

// Notch configuration: shorter months have reduced outer radius
export const fullRadius = 1.0;  // 31-day months
export const notchedRadius = 0.92; // 30-day months and February

// SVG dimensions
export const svgSize = 400;

