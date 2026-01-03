/*********************/
/* Calendar Renderer */
/*********************/

import { 
    segments, 
    monthColors, 
    monthColorsHover,
    months, 
    monthDays, 
    deg, 
    fullRadius, 
    notchedRadius30,
    notchedRadiusFeb,
    svgSize 
} from '../config/config.js';
import { rgbToHex } from '../utils/colorUtils.js';
import { degreesToRadians, sumTo, polarToCartesian } from '../utils/mathUtils.js';
import { createArcPath } from '../utils/svgUtils.js';

// Calendar state
const data = [];
const labels = [];
const colours = [];

// SVG container and dimensions
let svg;
let centerX = svgSize / 2;
let centerY = svgSize / 2;
let radius = svgSize / 2;

// Initialize renderer with SVG element
export function initRenderer(svgElement) {
    svg = svgElement;
    centerX = svgSize / 2;
    centerY = svgSize / 2;
    radius = svgSize / 2;
}

// Draws the calendar with all segments
export function drawCalendar() {
    // Clear previous segments
    const segmentsGroup = svg.querySelector('.segments-group');
    if (segmentsGroup) {
        segmentsGroup.remove();
    }
    
    const segmentsGroupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
    segmentsGroupEl.setAttribute("class", "segments-group");
    
    // Reset state
    data.length = 0;
    labels.length = 0;
    colours.length = 0;
    
    for (let i = 0; i < segments; i++) {
        // Use custom color for each month
        const monthColor = monthColors[i];
        const monthColorHover = monthColorsHover[i];
        const newColourHex = rgbToHex(monthColor);
        const hoverColourHex = rgbToHex(monthColorHover);
        
        data.push(deg);
        colours.push(newColourHex);
        labels.push(months[i]);
        
        // Determine outer radius based on month length (notched for shorter months)
        const days = monthDays[i];
        let outerRadiusRatio;
        if (days === 31) {
            outerRadiusRatio = fullRadius;
        } else if (days === 28) {
            // February - more pronounced notch
            outerRadiusRatio = notchedRadiusFeb;
        } else {
            // 30-day months - less pronounced notch
            outerRadiusRatio = notchedRadius30;
        }
        
        // Create segment path
        const startingAngle = -degreesToRadians(sumTo(data, i)) + degreesToRadians(45);
        const arcSize = degreesToRadians(data[i]);
        const endingAngle = startingAngle + arcSize;
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", createArcPath(centerX, centerY, radius, startingAngle, endingAngle, outerRadiusRatio));
        path.setAttribute("fill", newColourHex);
        path.setAttribute("stroke", "#fff");
        path.setAttribute("stroke-width", "1");
        path.setAttribute("data-segment-index", i);
        path.setAttribute("class", "calendar-segment");
        path.setAttribute("data-base-color", newColourHex);
        path.setAttribute("data-hover-color", hoverColourHex);
        path.style.cursor = "pointer";
        
        // Add event handlers
        path.addEventListener("click", () => writeSegmentName(labels[i]));
        path.addEventListener("mouseenter", (e) => {
            e.target.setAttribute("fill", hoverColourHex);
            writeSegmentName(labels[i]);
        });
        path.addEventListener("mouseleave", (e) => {
            e.target.setAttribute("fill", newColourHex);
            drawCircle();
        });
        
        segmentsGroupEl.appendChild(path);
        
        // Create label on outer perimeter
        const labelAngle = -degreesToRadians(sumTo(data, i)) + degreesToRadians(45) + (arcSize / 2);
        const labelRadius = radius * outerRadiusRatio * 0.95; // Slightly inside the outer edge
        const labelPos = polarToCartesian(centerX, centerY, labelRadius, labelAngle);
        
        // Calculate rotation for text orientation (tangent to circle, reading outwards)
        // Text should be perpendicular to radius, and flipped if on left side
        let textRotation = (labelAngle * 180 / Math.PI) + 90;
        if (labelAngle > Math.PI / 2 && labelAngle < 3 * Math.PI / 2) {
            textRotation += 180; // Flip text on left side so it reads correctly
        }
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", labelPos[0]);
        text.setAttribute("y", labelPos[1]);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("transform", `rotate(${textRotation} ${labelPos[0]} ${labelPos[1]})`);
        text.setAttribute("class", "segment-label");
        text.setAttribute("data-segment-index", i);
        text.textContent = labels[i];
        text.style.fontSize = `${svgSize / 35}px`;
        text.style.fontFamily = "Helvetica, Arial, sans-serif";
        text.style.fontWeight = "bold";
        text.style.pointerEvents = "none";
        
        // Apply contrast rules based on CSS: dark text on light backgrounds, text shadow on dark backgrounds
        // Dark text (#000) for: Apr (3), May (4), Jun (5), Jul (6), Aug (7), Sep (8), Oct (9)
        // Text shadow for: Jan (0), Feb (1), Mar (2), Nov (10), Dec (11)
        if (i >= 3 && i <= 9) {
            // Light backgrounds - use dark text
            text.style.fill = "#000";
        } else {
            // Dark backgrounds - use light text with shadow
            text.style.fill = "#fff";
            text.style.filter = "drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.2))";
        }
        
        segmentsGroupEl.appendChild(text);
    }
    
    svg.appendChild(segmentsGroupEl);
}

// Draws the center circle
export function drawCircle() {
    // Remove existing center circle
    const existingCircle = svg.querySelector('.center-circle');
    if (existingCircle) {
        existingCircle.remove();
    }
    
    // Remove existing center text
    const existingText = svg.querySelector('.center-text');
    if (existingText) {
        existingText.remove();
    }
    
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const innerRadius = svgSize / 3;
    circle.setAttribute("cx", centerX);
    circle.setAttribute("cy", centerY);
    circle.setAttribute("r", innerRadius);
    circle.setAttribute("fill", "#ffffff");
    circle.setAttribute("class", "center-circle");
    
    svg.appendChild(circle);
}

// Writes segment name in the center
export function writeSegmentName(segment) {
    drawCircle();
    
    // Remove existing center text
    const existingText = svg.querySelector('.center-text');
    if (existingText) {
        existingText.remove();
    }
    
    const fontSize = svgSize / 5;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", centerX);
    text.setAttribute("y", centerY + (fontSize / 2));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("class", "center-text");
    text.textContent = segment;
    text.style.fontSize = `${fontSize}px`;
    text.style.fontFamily = "Helvetica, Arial, sans-serif";
    text.style.fill = "#333";
    
    svg.appendChild(text);
}

