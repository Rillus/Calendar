/********/
/* Main */
/********/

import { svgSize } from './config.js';
import { initRenderer, drawCalendar, drawCircle } from './calendarRenderer.js';

function init() {
    const svg = document.getElementById("calendar-svg");
    
    if (!svg) {
        console.error("SVG element not found");
        return;
    }
    
    // Initialize renderer
    initRenderer(svg);
    
    // Set fixed viewBox - this defines the coordinate system
    svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    
    // Draw calendar with initial dimensions
    drawCalendar();
    drawCircle();
    
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
