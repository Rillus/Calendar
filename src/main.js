/********/
/* Main */
/********/

import { svgSize } from './config/config.js';
import { initRenderer, drawCalendar, drawCircle, setYear, showSunAndMoonForDate, writeSegmentName } from './renderer/calendarRenderer.js';

function init() {
    const svg = document.getElementById("calendar-svg");
    const yearInput = document.getElementById("year-input");
    
    if (!svg) {
        console.error("SVG element not found");
        return;
    }
    
    if (!yearInput) {
        console.error("Year input not found");
        return;
    }
    
    // Initialize renderer
    initRenderer(svg);
    
    // Set fixed viewBox - this defines the coordinate system
    svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    
    // Draw calendar with initial dimensions (this populates labels array)
    drawCalendar();
    drawCircle();
    
    // Set initial year to current year (after drawCalendar so labels are available)
    const currentYear = new Date().getFullYear();
    yearInput.value = currentYear;
    setYear(currentYear);
    
    // Handle year changes
    yearInput.addEventListener("input", (e) => {
        const year = parseInt(e.target.value, 10);
        if (!isNaN(year) && year >= 1900 && year <= 2100) {
            setYear(year);
            drawCalendar();
            drawCircle();
            // Show sun and moon for today if viewing current year
            if (year === today.getFullYear()) {
                showSunAndMoonForDate(today);
            }
        }
    });
    
    // Handle window resize - only update if needed
    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // ViewBox handles responsiveness, no need to redraw
            // unless we want to change the actual coordinate system
        }, 100);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
