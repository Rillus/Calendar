/*****************************/
/* Mathematical manipulations */
/*****************************/

// Converts degrees to radians
export function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

// Sums array elements up to index i
export function sumTo(a, i) {
    let sum = 0;
    for (let j = 0; j < i; j++) {
        sum += a[j];
    }
    return sum;
}

// Converts polar coordinates to Cartesian
export function polarToCartesian(centerX, centerY, radius, angleInRadians) {
    return [
        centerX + (radius * Math.cos(angleInRadians)),
        centerY + (radius * Math.sin(angleInRadians))
    ];
}

