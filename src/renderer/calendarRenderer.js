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
import { createArcPath, getMoonShadowDx } from '../utils/svgUtils.js';
import { getDaysInMonth } from '../utils/dateUtils.js';
import { getMoonPhase, getMoonPhaseAngle, getMoonPhaseName } from '../utils/moonPhase.js';

// Calendar state
const data = [];
const labels = [];
const colours = [];

// Date change listeners (used by external views, e.g. month view)
const dateChangeListeners = new Set();

const notifyDateChanged = (date) => {
    const safeDate = new Date(date.getTime());
    for (const listener of dateChangeListeners) {
        try {
            listener(safeDate);
        } catch (err) {
            // Avoid breaking rendering if a listener throws
            console.error('Date change listener failed', err);
        }
    }
};

// Subscribe to date changes (e.g. when the sun is dragged or year changes)
export function subscribeToDateChanges(listener) {
    dateChangeListeners.add(listener);
    return () => dateChangeListeners.delete(listener);
}

// SVG container and dimensions
let svg;
let centerX = svgSize / 2;
let centerY = svgSize / 2;
let radius = svgSize / 2;
let currentYear = new Date().getFullYear();
let moonClipIdCounter = 0;

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
    // Update sun and moon position
    const today = new Date();
    if (year === today.getFullYear()) {
        showSunAndMoonForDate(today);
        // Display today's date in center text
        writeSegmentName(labels[today.getMonth()], today);
        notifyDateChanged(today);
    } else {
        // Show sun and moon for middle of the year if not current year
        const midYearDate = new Date(year, 5, 15); // June 15
        showSunAndMoonForDate(midYearDate);
        // Display mid-year date in center text
        writeSegmentName(labels[midYearDate.getMonth()], midYearDate);
        notifyDateChanged(midYearDate);
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
        
        // Add event handlers - just hover color change
        path.addEventListener("mouseenter", (e) => {
            e.target.setAttribute("fill", hoverColourHex);
        });
        path.addEventListener("mouseleave", (e) => {
            e.target.setAttribute("fill", newColourHex);
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

// Writes segment name and date in the center
export function writeSegmentName(segment, date = null) {
    drawCircle();
    
    // Remove existing center text elements
    const existingTexts = svg.querySelectorAll('.center-text');
    existingTexts.forEach(text => text.remove());
    
    // Font sizes
    const mainFontSize = 16;
    const smallFontSize = 10;
    const lineSpacing = 6;
    
    // Calculate vertical positions
    const mainY = centerY;
    const dayOfWeekY = mainY - (mainFontSize / 2) - lineSpacing;
    const yearY = mainY + (mainFontSize / 2) + lineSpacing;
    
    // Day of week (above, smaller)
    if (date) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = dayNames[date.getDay()];
        
        const dayText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        dayText.setAttribute("x", centerX);
        dayText.setAttribute("y", dayOfWeekY);
        dayText.setAttribute("text-anchor", "middle");
        dayText.setAttribute("dominant-baseline", "middle");
        dayText.setAttribute("class", "center-text");
        dayText.textContent = dayOfWeek;
        dayText.style.fontSize = `${smallFontSize}px`;
        dayText.style.fontFamily = "Helvetica, Arial, sans-serif";
        dayText.style.fill = "#333";
        svg.appendChild(dayText);
    }
    
    // Main text: "MONTH" or "MONTH Day"
    const mainText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    mainText.setAttribute("x", centerX);
    mainText.setAttribute("y", mainY);
    mainText.setAttribute("text-anchor", "middle");
    mainText.setAttribute("dominant-baseline", "middle");
    mainText.setAttribute("class", "center-text");
    
    let textContent = segment;
    if (date) {
        const day = date.getDate();
        textContent = `${segment} ${day}`;
    }
    
    mainText.textContent = textContent;
    mainText.style.fontSize = `${mainFontSize}px`;
    mainText.style.fontFamily = "Helvetica, Arial, sans-serif";
    mainText.style.fill = "#333";
    svg.appendChild(mainText);
    
    // Year (below, smaller)
    if (date) {
        const year = date.getFullYear();
        
        const yearText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yearText.setAttribute("x", centerX);
        yearText.setAttribute("y", yearY);
        yearText.setAttribute("text-anchor", "middle");
        yearText.setAttribute("dominant-baseline", "middle");
        yearText.setAttribute("class", "center-text");
        yearText.textContent = year.toString();
        yearText.style.fontSize = `${smallFontSize}px`;
        yearText.style.fontFamily = "Helvetica, Arial, sans-serif";
        yearText.style.fill = "#333";
        svg.appendChild(yearText);
        
        // Moon phase (below year, smaller)
        const moonPhaseName = getMoonPhaseName(date);
        const moonPhaseY = yearY + smallFontSize + lineSpacing;
        
        const moonPhaseText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        moonPhaseText.setAttribute("x", centerX);
        moonPhaseText.setAttribute("y", moonPhaseY);
        moonPhaseText.setAttribute("text-anchor", "middle");
        moonPhaseText.setAttribute("dominant-baseline", "middle");
        moonPhaseText.setAttribute("class", "center-text");
        moonPhaseText.textContent = moonPhaseName;
        moonPhaseText.style.fontSize = `${smallFontSize}px`;
        moonPhaseText.style.fontFamily = "Helvetica, Arial, sans-serif";
        moonPhaseText.style.fill = "#666";
        svg.appendChild(moonPhaseText);
    }
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
    // Reverse so days increase clockwise
    const daysInMonth = getDaysInMonth(monthIndex, year);
    const positionInSegment = 1 - ((dayInMonth - 1) / daysInMonth);
    
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
    const moonPhase = getMoonPhase(date);
    const moonPhaseAngle = getMoonPhaseAngle(date);
    
    // Moon position: sun angle - moon phase angle
    // As phase increases, moon moves clockwise relative to sun
    // New moon (0°) = same side as sun, Full moon (180°) = opposite side
    const moonAngle = normalizedAngle - moonPhaseAngle;
    const moonRadius = radius + moonDistance;
    const moonPos = polarToCartesian(centerX, centerY, moonRadius, moonAngle);
    
    showSunAndMoon(sunPos, moonPos, true, moonPhase);
}

// Selects a specific date (used by external views, e.g. month view)
export function selectDate(date) {
    const safeDate = new Date(date.getTime());
    const monthIndex = safeDate.getMonth();

    showSunAndMoonForDate(safeDate);
    writeSegmentName(labels[monthIndex] ?? months[monthIndex], safeDate);
    notifyDateChanged(safeDate);
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
    // Reverse the position so days increase clockwise (as mouse moves clockwise)
    const positionInSegment = 1 - (angleInSegment / segmentSize);
    const daysInMonth = getDaysInMonth(monthIndex, currentYear);
    // Map position (0-1) to day (1 to daysInMonth)
    const dayInMonth = Math.max(1, Math.min(daysInMonth, Math.floor(positionInSegment * daysInMonth) + 1));
    
    // Update center text with month and date
    const hoverDate = new Date(currentYear, monthIndex, dayInMonth);
    writeSegmentName(labels[monthIndex], hoverDate);
    
    // Position sun outside calendar radius
    const sunRadius = radius + sunDistance;
    const sunPos = polarToCartesian(centerX, centerY, sunRadius, angleToMouse);
    
    // Calculate moon phase for the specific day under cursor
    const moonDate = new Date(currentYear, monthIndex, dayInMonth);
    const moonPhase = getMoonPhase(moonDate);
    const moonPhaseAngle = getMoonPhaseAngle(moonDate);
    
    // Moon position: sun angle - moon phase angle
    // As phase increases, moon moves clockwise relative to sun
    const moonAngle = angleToMouse - moonPhaseAngle;
    const moonRadius = radius + moonDistance;
    const moonPos = polarToCartesian(centerX, centerY, moonRadius, moonAngle);
    
    showSunAndMoon(sunPos, moonPos, false, moonPhase);
}

// Creates or updates sun and moon SVG elements
function showSunAndMoon(sunPos, moonPos, makeDraggable = false, moonPhase = null) {
    // Remove existing elements
    hideSunAndMoon();
    
    // Create sun icon (circle with rays)
    const sunGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    sunGroup.setAttribute("class", "sun-icon");
    sunGroup.setAttribute("transform", `translate(${sunPos[0]}, ${sunPos[1]})`);
    if (makeDraggable) {
        sunGroup.style.cursor = "grab";
        sunGroup.setAttribute("data-draggable", "true");
        // Make the sun group pointer-events enabled
        sunGroup.style.pointerEvents = "all";
    }
    
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
    
    // Create moon icon (white disc with clipped black shadow circle)
    const moonGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    moonGroup.setAttribute("class", "moon-icon");
    moonGroup.setAttribute("transform", `translate(${moonPos[0]}, ${moonPos[1]})`);

    const moonRadius = 6;

    const clipId = `moon-clip-${moonClipIdCounter++}`;
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    clipPath.setAttribute("id", clipId);
    const clipCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    clipCircle.setAttribute("cx", "0");
    clipCircle.setAttribute("cy", "0");
    clipCircle.setAttribute("r", String(moonRadius));
    clipPath.appendChild(clipCircle);
    defs.appendChild(clipPath);
    moonGroup.appendChild(defs);

    const moonDisc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    moonDisc.setAttribute("cx", "0");
    moonDisc.setAttribute("cy", "0");
    moonDisc.setAttribute("r", String(moonRadius));
    moonDisc.setAttribute("fill", "#f5f5f5");
    moonDisc.setAttribute("class", "moon-icon__disc");
    moonGroup.appendChild(moonDisc);

    const phaseValue = Number.isFinite(Number(moonPhase)) ? Number(moonPhase) : 0;
    const shadowDx = getMoonShadowDx(moonRadius, phaseValue);

    const moonShadow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    moonShadow.setAttribute("cx", String(shadowDx));
    moonShadow.setAttribute("cy", "0");
    moonShadow.setAttribute("r", String(moonRadius));
    moonShadow.setAttribute("fill", "#111");
    moonShadow.setAttribute("clip-path", `url(#${clipId})`);
    moonShadow.setAttribute("class", "moon-icon__shadow");
    moonGroup.appendChild(moonShadow);

    const moonOutline = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    moonOutline.setAttribute("cx", "0");
    moonOutline.setAttribute("cy", "0");
    moonOutline.setAttribute("r", String(moonRadius));
    moonOutline.setAttribute("fill", "none");
    moonOutline.setAttribute("stroke", "#999");
    moonOutline.setAttribute("stroke-width", "1");
    moonOutline.setAttribute("class", "moon-icon__outline");
    moonGroup.appendChild(moonOutline);
    
    svg.appendChild(sunGroup);
    svg.appendChild(moonGroup);
    
    // Add drag handlers if draggable
    if (makeDraggable) {
        setupSunDragHandlers(sunGroup);
    }
}

// Removes sun and moon elements
function hideSunAndMoon() {
    const sun = svg.querySelector('.sun-icon');
    const moon = svg.querySelector('.moon-icon');
    if (sun) sun.remove();
    if (moon) moon.remove();
}

// Sets up drag handlers for the sun
function setupSunDragHandlers(sunGroup) {
    let isDragging = false;
    
    const getEventPos = (e) => {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    };
    
    const getAngleFromEvent = (e) => {
        const svgRect = svg.getBoundingClientRect();
        const pos = getEventPos(e);
        const mouseX = pos.x - svgRect.left;
        const mouseY = pos.y - svgRect.top;
        
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
        let angle = Math.atan2(dy, dx);
        
        // Normalize angle to 0-2π range
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        
        return angle;
    };
    
    const updateSunPosition = (angle) => {
        // Calculate which month and day based on angle
        const segmentStartAngles = [];
        for (let i = 0; i < segments; i++) {
            const startAngle = -degreesToRadians(sumTo(data, i)) + degreesToRadians(45);
            let normalized = startAngle;
            while (normalized < 0) normalized += 2 * Math.PI;
            while (normalized >= 2 * Math.PI) normalized -= 2 * Math.PI;
            segmentStartAngles.push({ month: i, angle: normalized });
        }
        
        // Find which segment the angle falls into
        let monthIndex = 0;
        let angleInSegment = 0;
        
        for (let i = 0; i < segmentStartAngles.length; i++) {
            const currentStart = segmentStartAngles[i].angle;
            const nextStart = i < segmentStartAngles.length - 1 
                ? segmentStartAngles[i + 1].angle 
                : segmentStartAngles[0].angle + 2 * Math.PI;
            
            let segmentEnd = currentStart + degreesToRadians(deg);
            if (segmentEnd > 2 * Math.PI) {
                segmentEnd -= 2 * Math.PI;
            }
            
            // Check if angle is in this segment
            let inSegment = false;
            if (currentStart < segmentEnd) {
                inSegment = angle >= currentStart && angle < segmentEnd;
            } else {
                // Segment wraps around
                inSegment = angle >= currentStart || angle < segmentEnd;
            }
            
            if (inSegment) {
                monthIndex = segmentStartAngles[i].month;
                angleInSegment = angle - currentStart;
                if (angleInSegment < 0) {
                    angleInSegment += 2 * Math.PI;
                }
                break;
            }
        }
        
        // Calculate day within the month
        const segmentSize = degreesToRadians(deg);
        angleInSegment = Math.max(0, Math.min(angleInSegment, segmentSize));
        const positionInSegment = 1 - (angleInSegment / segmentSize); // Reverse for clockwise
        const daysInMonth = getDaysInMonth(monthIndex, currentYear);
        const dayInMonth = Math.max(1, Math.min(daysInMonth, Math.floor(positionInSegment * daysInMonth) + 1));
        
        // Create date and update display
        const date = new Date(currentYear, monthIndex, dayInMonth);
        writeSegmentName(labels[monthIndex], date);
        notifyDateChanged(date);
        
        // Update sun and moon positions
        const sunRadius = radius + sunDistance;
        const sunPos = polarToCartesian(centerX, centerY, sunRadius, angle);
        
        const moonPhaseAngle = getMoonPhaseAngle(date);
        const moonPhase = getMoonPhase(date);
        const moonAngle = angle - moonPhaseAngle;
        const moonRadius = radius + moonDistance;
        const moonPos = polarToCartesian(centerX, centerY, moonRadius, moonAngle);
        
        // Update sun position
        sunGroup.setAttribute("transform", `translate(${sunPos[0]}, ${sunPos[1]})`);
        
        // Update moon position + phase shading
        const moonGroup = svg.querySelector('.moon-icon');
        if (moonGroup) {
            moonGroup.setAttribute("transform", `translate(${moonPos[0]}, ${moonPos[1]})`);

            const moonIconRadius = 6;
            const shadowDx = getMoonShadowDx(moonIconRadius, moonPhase);
            const shadow = moonGroup.querySelector?.('.moon-icon__shadow');
            if (shadow) {
                shadow.setAttribute('cx', String(shadowDx));
            }
        }
    };
    
    // Mouse events
    sunGroup.addEventListener("mousedown", (e) => {
        isDragging = true;
        sunGroup.style.cursor = "grabbing";
        e.preventDefault();
        e.stopPropagation();
    });
    
    const handleMouseMove = (e) => {
        if (isDragging) {
            const angle = getAngleFromEvent(e);
            updateSunPosition(angle);
            e.preventDefault();
        }
    };
    
    const handleMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            sunGroup.style.cursor = "grab";
        }
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    // Touch events - use passive listeners where possible
    sunGroup.addEventListener("touchstart", (e) => {
        isDragging = true;
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener("touchmove", (e) => {
        if (isDragging) {
            const angle = getAngleFromEvent(e);
            updateSunPosition(angle);
            e.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener("touchend", () => {
        if (isDragging) {
            isDragging = false;
        }
    }, { passive: true });
}

