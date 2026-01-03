/*********************/
/* Calendar Renderer */
/*********************/

import { 
    segments, 
    monthColors, 
    monthColorsHover,
    months, 
    deg, 
    fullRadius, 
    notchedRadius30,
    notchedRadiusFeb,
    notchedRadiusFebLeap,
    svgSize,
    sunDistance,
    moonDistance,
    padding
} from '../config/config.js';
import { rgbToHex } from '../utils/colorUtils.js';
import { degreesToRadians, sumTo, polarToCartesian } from '../utils/mathUtils.js';
import { createArcPath } from '../utils/svgUtils.js';
import { getDaysInMonth } from '../utils/dateUtils.js';
import { getMoonPhaseAngle } from '../utils/moonPhase.js';

// Calendar state
const data = [];
const labels = [];
const colours = [];

// SVG container and dimensions
let svg;
let centerX = svgSize / 2;
let centerY = svgSize / 2;
let radius = svgSize / 2;
let currentYear = new Date().getFullYear();

// Initialize renderer with SVG element
export function initRenderer(svgElement) {
    svg = svgElement;
    centerX = svgSize / 2;
    centerY = svgSize / 2;
    // Shrink calendar radius to fit sun and moon within SVG bounds
    // Maximum distance from center = svgSize / 2
    // We need: radius + sunDistance + padding <= svgSize / 2
    radius = (svgSize / 2) - sunDistance - padding;
}

// Set the year for the calendar
export function setYear(year) {
    currentYear = year;
    // Update sun and moon position if showing today's date
    const today = new Date();
    if (year === today.getFullYear()) {
        showSunAndMoonForDate(today);
    }
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
        const days = getDaysInMonth(i, currentYear);
        let outerRadiusRatio;
        if (days === 31) {
            outerRadiusRatio = fullRadius;
        } else if (days === 28) {
            // February with 28 days - more pronounced notch
            outerRadiusRatio = notchedRadiusFeb;
        } else if (days === 29) {
            // February with 29 days (leap year) - less pronounced notch
            outerRadiusRatio = notchedRadiusFebLeap;
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
        path.addEventListener("mousemove", (e) => {
            handleMonthHover(e, i);
        });
        path.addEventListener("mouseleave", (e) => {
            e.target.setAttribute("fill", newColourHex);
            drawCircle();
            // Restore sun and moon to today's date if in current year
            const today = new Date();
            if (currentYear === today.getFullYear()) {
                showSunAndMoonForDate(today);
            } else {
                hideSunAndMoon();
            }
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
    // Inner circle radius is proportional to calendar radius (about 1/3 of calendar radius)
    const innerRadius = radius / 3;
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

// Shows sun and moon for a specific date
export function showSunAndMoonForDate(date) {
    const monthIndex = date.getMonth();
    const dayInMonth = date.getDate();
    const year = date.getFullYear();
    
    // Calculate angle for the specific day in the month
    const segmentStartAngle = -degreesToRadians(sumTo(data, monthIndex)) + degreesToRadians(45);
    const segmentSize = degreesToRadians(deg);
    
    // Calculate position within segment (0 = start of month, 1 = end of month)
    const daysInMonth = getDaysInMonth(monthIndex, year);
    const positionInSegment = (dayInMonth - 1) / daysInMonth;
    
    // Calculate angle for this day
    const angleInSegment = positionInSegment * segmentSize;
    const angleForDate = segmentStartAngle + angleInSegment;
    
    // Normalize angle
    let normalizedAngle = angleForDate;
    while (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
    while (normalizedAngle >= 2 * Math.PI) normalizedAngle -= 2 * Math.PI;
    
    // Position sun at this angle
    const sunRadius = radius + sunDistance;
    const sunPos = polarToCartesian(centerX, centerY, sunRadius, normalizedAngle);
    
    // Calculate moon phase for this specific date
    const moonPhaseAngle = getMoonPhaseAngle(date);
    
    // Moon position: sun angle - moon phase angle
    // The moon orbits counter-clockwise, so it lags behind the sun by the phase angle
    // New moon (0°) = same side as sun, Full moon (180°) = opposite side
    const moonAngle = normalizedAngle - moonPhaseAngle;
    const moonRadius = radius + moonDistance;
    const moonPos = polarToCartesian(centerX, centerY, moonRadius, moonAngle);
    
    showSunAndMoon(sunPos, moonPos);
}

// Shows sun and moon based on mouse position and moon phase
function handleMonthHover(event, monthIndex) {
    // Get mouse position relative to SVG viewBox coordinates
    const svgRect = svg.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;
    
    // Get viewBox dimensions
    const viewBox = svg.viewBox.baseVal;
    const svgWidth = svgRect.width;
    const svgHeight = svgRect.height;
    
    // Convert screen coordinates to SVG viewBox coordinates
    const mouseSvgX = (mouseX / svgWidth) * viewBox.width;
    const mouseSvgY = (mouseY / svgHeight) * viewBox.height;
    
    // Calculate angle from center to mouse
    const dx = mouseSvgX - centerX;
    const dy = mouseSvgY - centerY;
    let angleToMouse = Math.atan2(dy, dx);
    
    // Normalize angle to 0-2π range
    if (angleToMouse < 0) {
        angleToMouse += 2 * Math.PI;
    }
    
    // Calculate which day of the month based on cursor position within the segment
    // Each segment starts at: -degreesToRadians(sumTo(data, monthIndex)) + degreesToRadians(45)
    const segmentStartAngle = -degreesToRadians(sumTo(data, monthIndex)) + degreesToRadians(45);
    
    // Normalize angles to 0-2π range for easier comparison
    const normalizeAngle = (angle) => {
        let normalized = angle;
        while (normalized < 0) normalized += 2 * Math.PI;
        while (normalized >= 2 * Math.PI) normalized -= 2 * Math.PI;
        return normalized;
    };
    
    const normalizedMouseAngle = normalizeAngle(angleToMouse);
    const normalizedSegmentStart = normalizeAngle(segmentStartAngle);
    
    // Calculate angle within the segment
    let angleInSegment = normalizedMouseAngle - normalizedSegmentStart;
    if (angleInSegment < 0) {
        angleInSegment += 2 * Math.PI;
    }
    
    // Segment size in radians (30 degrees per month)
    const segmentSize = degreesToRadians(deg);
    
    // Clamp angle to segment bounds (in case cursor is slightly outside)
    angleInSegment = Math.max(0, Math.min(angleInSegment, segmentSize));
    
    // Calculate day based on position within segment
    // positionInSegment: 0 = start of month (day 1), 1 = end of month
    const positionInSegment = angleInSegment / segmentSize;
    const daysInMonth = getDaysInMonth(monthIndex, currentYear);
    // Map position (0-1) to day (1 to daysInMonth)
    const dayInMonth = Math.max(1, Math.min(daysInMonth, Math.floor(positionInSegment * daysInMonth) + 1));
    
    // Position sun outside calendar radius
    const sunRadius = radius + sunDistance;
    const sunPos = polarToCartesian(centerX, centerY, sunRadius, angleToMouse);
    
    // Calculate moon phase for the specific day under cursor
    const moonDate = new Date(currentYear, monthIndex, dayInMonth);
    const moonPhaseAngle = getMoonPhaseAngle(moonDate);
    
    // Moon position: sun angle - moon phase angle
    // The moon orbits counter-clockwise, so it lags behind the sun by the phase angle
    const moonAngle = angleToMouse - moonPhaseAngle;
    const moonRadius = radius + moonDistance;
    const moonPos = polarToCartesian(centerX, centerY, moonRadius, moonAngle);
    
    showSunAndMoon(sunPos, moonPos);
}

// Creates or updates sun and moon SVG elements
function showSunAndMoon(sunPos, moonPos) {
    // Remove existing elements
    hideSunAndMoon();
    
    // Create sun icon (circle with rays)
    const sunGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    sunGroup.setAttribute("class", "sun-icon");
    sunGroup.setAttribute("transform", `translate(${sunPos[0]}, ${sunPos[1]})`);
    
    // Sun rays
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const ray = document.createElementNS("http://www.w3.org/2000/svg", "line");
        const startX = Math.cos(angle) * 8;
        const startY = Math.sin(angle) * 8;
        const endX = Math.cos(angle) * 12;
        const endY = Math.sin(angle) * 12;
        ray.setAttribute("x1", startX);
        ray.setAttribute("y1", startY);
        ray.setAttribute("x2", endX);
        ray.setAttribute("y2", endY);
        ray.setAttribute("stroke", "#ffd700");
        ray.setAttribute("stroke-width", "2");
        ray.setAttribute("stroke-linecap", "round");
        sunGroup.appendChild(ray);
    }
    
    // Sun circle
    const sunCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    sunCircle.setAttribute("r", "8");
    sunCircle.setAttribute("fill", "#ffd700");
    sunCircle.setAttribute("stroke", "#ffaa00");
    sunCircle.setAttribute("stroke-width", "1");
    sunGroup.appendChild(sunCircle);
    
    // Create moon icon (circle)
    const moonCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    moonCircle.setAttribute("cx", moonPos[0]);
    moonCircle.setAttribute("cy", moonPos[1]);
    moonCircle.setAttribute("r", "6");
    moonCircle.setAttribute("fill", "#e0e0e0");
    moonCircle.setAttribute("stroke", "#999");
    moonCircle.setAttribute("stroke-width", "1");
    moonCircle.setAttribute("class", "moon-icon");
    
    svg.appendChild(sunGroup);
    svg.appendChild(moonCircle);
}

// Removes sun and moon elements
function hideSunAndMoon() {
    const sun = svg.querySelector('.sun-icon');
    const moon = svg.querySelector('.moon-icon');
    if (sun) sun.remove();
    if (moon) moon.remove();
}

