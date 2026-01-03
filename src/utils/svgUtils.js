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

