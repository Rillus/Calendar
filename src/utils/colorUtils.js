/********************/
/* Colour functions */
/********************/

// Converts a single component to hex
function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// Converts RGB array to hex string
export function rgbToHex(colour) {
    const r = colour[0];
    const g = colour[1];
    const b = colour[2];
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Converts RGB array to CSS rgb string
export function rgbToRgbString(colour) {
    return `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`;
}

// Interpolates between two colours
export function colourSum(colour1, colour2, steps, thisStep) {
    const colourDiff = [];
    const new2 = [];
    
    colourDiff.push((Math.max(colour1[0], colour2[0]) - Math.min(colour1[0], colour2[0])) / steps);
    colourDiff.push((Math.max(colour1[1], colour2[1]) - Math.min(colour1[1], colour2[1])) / steps);
    colourDiff.push((Math.max(colour1[2], colour2[2]) - Math.min(colour1[2], colour2[2])) / steps);
    
    if (colour1[0] < colour2[0]) {
        new2.push(Math.round(colour1[0] + (colourDiff[0] * thisStep)));
    } else {
        new2.push(Math.round(colour1[0] - (colourDiff[0] * thisStep)));
    }
    
    if (colour1[1] < colour2[1]) {
        new2.push(Math.round(colour1[1] + (colourDiff[1] * thisStep)));
    } else {
        new2.push(Math.round(colour1[1] - (colourDiff[1] * thisStep)));
    }
    
    if (colour1[2] < colour2[2]) {
        new2.push(Math.round(colour1[2] + (colourDiff[2] * thisStep)));
    } else {
        new2.push(Math.round(colour1[2] - (colourDiff[2] * thisStep)));
    }
    
    return new2;
}

/**
 * Calculate the relative luminance of an RGB colour using WCAG formula
 * @param {number[]} colour - RGB array [r, g, b] with values 0-255
 * @returns {number} Relative luminance (0-1)
 */
function getRelativeLuminance(colour) {
    // Normalize RGB values to 0-1 range
    const [r, g, b] = colour.map(component => {
        const normalized = component / 255;
        // Apply gamma correction
        return normalized <= 0.03928 
            ? normalized / 12.92 
            : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    
    // WCAG relative luminance formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Get the appropriate contrast colour (black or white) for text on a given background
 * Uses WCAG relative luminance formula to determine if colour is light or dark
 * @param {number[]} colour - RGB array [r, g, b] with values 0-255
 * @returns {string} '#000' for light colours, '#fff' for dark colours
 */
export function getContrastColor(colour) {
    const luminance = getRelativeLuminance(colour);
    // Threshold adjusted to match original design: months 3-9 (April-October) use black text
    // APR has lowest luminance (0.277) in that group, so threshold is set below that
    // This ensures APR, MAY, OCT get black text while MAR (0.222) stays white
    return luminance > 0.27 ? '#000' : '#fff';
}
