/*************/
/* Constants */
/*************/

export const calendarType = "year";
export const segments = 12;

// Custom seasonal color palette
// Each month gets its own color in the seasonal gradient
export const monthColors = [
    [72, 88, 154],    // JAN - #48589a
    [39, 93, 164],    // FEB - #275da4
    [61, 138, 174],   // MAR - #3d8aae
    [101, 154, 139],  // APR - #659a8b
    [155, 177, 70],   // MAY - #9bb146
    [182, 199, 65],   // JUN - #b6c741
    [218, 205, 72],   // JUL - #dacd48
    [236, 211, 68],   // AUG - #ecd344
    [251, 184, 65],   // SEP - #fbb841
    [248, 132, 40],   // OCT - #f88428
    [229, 94, 52],    // NOV - #e55e34
    [153, 32, 122]    // DEC - #99207a
];

// Light version of palette for hover states
export const monthColorsHover = [
    [117, 132, 196],  // JAN - #7584c4 (light)
    [91, 154, 238],   // FEB - #5b9aee (light)
    [109, 183, 217], // MAR - #6db7d9 (light)
    [123, 182, 165],  // APR - #7bb6a5 (light)
    [170, 193, 80],  // MAY - #aac150 (light)
    [182, 199, 65],  // JUN - #b6c741 (light - same as dark)
    [218, 205, 72],  // JUL - #dacd48 (light - same as dark)
    [236, 211, 68],  // AUG - #ecd344 (light - same as dark)
    [251, 184, 65],  // SEP - #fbb841 (light - same as dark)
    [252, 153, 75],  // OCT - #fc994b (light)
    [255, 158, 128], // NOV - #ff9e80 (light)
    [226, 115, 198]  // DEC - #e273c6 (light)
];

// Dark mode colour palette - adapted for low-light environments
// Colours are lighter/more vibrant to stand out against dark background
export const monthColorsDark = [
    [107, 123, 184],  // JAN - #6b7bb8 (lighter blue)
    [71, 134, 214],   // FEB - #4786d6 (lighter blue)
    [91, 168, 214],   // MAR - #5ba8d6 (lighter blue-green)
    [131, 184, 169],  // APR - #83b8a9 (lighter green)
    [175, 197, 90],   // MAY - #afc55a (lighter yellow-green)
    [202, 219, 85],   // JUN - #cadb55 (lighter yellow-green)
    [238, 225, 92],   // JUL - #eee15c (lighter yellow)
    [246, 221, 88],   // AUG - #f6dd58 (lighter yellow)
    [251, 204, 85],   // SEP - #fbcc55 (lighter orange-yellow)
    [250, 152, 60],   // OCT - #fa983c (lighter orange)
    [235, 114, 72],   // NOV - #eb7248 (lighter red-orange)
    [183, 62, 152]    // DEC - #b73e98 (lighter magenta)
];

// Dark mode hover states
export const monthColorsHoverDark = [
    [127, 143, 204],  // JAN - #7f8fcc (lighter)
    [91, 154, 234],   // FEB - #5b9aea (lighter)
    [111, 188, 234],  // MAR - #6fbcea (lighter)
    [151, 204, 189],  // APR - #97ccbd (lighter)
    [195, 217, 110],  // MAY - #c3d96e (lighter)
    [222, 239, 105],  // JUN - #deef69 (lighter)
    [248, 235, 112],  // JUL - #f8eb70 (lighter)
    [246, 231, 108],  // AUG - #f6e76c (lighter)
    [251, 214, 105],  // SEP - #fbd669 (lighter)
    [250, 172, 80],   // OCT - #faac50 (lighter)
    [245, 134, 92],   // NOV - #f5865c (lighter)
    [203, 82, 172]    // DEC - #cb52ac (lighter)
];

export const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
export const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const deg = 360 / segments;

// Notch configuration: shorter months have reduced outer radius
export const fullRadius = 1.0;  // 31-day months
export const notchedRadius30 = 0.96; // 30-day months (less pronounced)
export const notchedRadiusFeb = 0.92; // February with 28 days (more pronounced)
export const notchedRadiusFebLeap = 0.96; // February with 29 days in leap year (less pronounced)

// SVG dimensions
export const svgSize = 400;

// Space needed for sun and moon outside calendar
export const sunDistance = 50; // Sun appears 50px outside calendar
export const moonDistance = 20; // Moon appears 20px outside calendar
export const padding = 10; // Padding from SVG edge
