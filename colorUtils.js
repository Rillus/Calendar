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

