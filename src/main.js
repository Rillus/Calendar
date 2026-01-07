/********/
/* Main */
/********/

import { svgSize } from './config/config.js';
import { initRenderer, drawCalendar, drawCircle, setYear, showSunAndMoonForDate, subscribeToDateChanges, selectDate, setTimeSelectionOptions } from './renderer/calendarRenderer.js';
import { renderMonthView } from './renderer/monthViewRenderer.js';

function init() {
    const svg = document.getElementById("calendar-svg");
    const yearInput = document.getElementById("year-input");
    const includeTimeToggle = document.getElementById('toggle-include-time');
    const is12HourToggle = document.getElementById('toggle-12-hour');
    const monthViewContainer = document.getElementById("month-view-container");
    
    if (!svg) {
        console.error("SVG element not found");
        return;
    }
    
    if (!yearInput) {
        console.error("Year input not found");
        return;
    }

    if (!monthViewContainer) {
        console.error("Month view container not found");
        return;
    }
    
    // Initialize renderer
    initRenderer(svg, {
        timeSelectionEnabled: Boolean(includeTimeToggle?.checked),
        is12HourClock: Boolean(is12HourToggle?.checked)
    });
    
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

    const handleMonthViewSelectDate = (date) => {
        const year = date.getFullYear();
        const currentYearValue = parseInt(yearInput.value, 10);
        if (year !== currentYearValue) {
            yearInput.value = year;
            setYear(year);
            drawCalendar();
            drawCircle();
        }

        selectDate(date);
    };

    const renderMonthViewWithInteractions = (date) => {
        renderMonthView(monthViewContainer, date, {
            weekStartsOn: 1,
            locale: 'en-GB',
            onSelectDate: handleMonthViewSelectDate
        });
    };

    // Render month view (defaults to current month)
    const today = new Date();
    renderMonthViewWithInteractions(today);

    // Keep month view in sync with circular calendar's current date
    subscribeToDateChanges((date) => {
        renderMonthViewWithInteractions(date);
    });
    
    // Handle year changes
    yearInput.addEventListener("input", (e) => {
        const year = parseInt(e.target.value, 10);
        if (!isNaN(year) && year >= 1900 && year <= 2100) {
            setYear(year);
            drawCalendar();
            drawCircle();
            // Show sun and moon for today if viewing current year
            const now = new Date();
            if (year === now.getFullYear()) {
                showSunAndMoonForDate(now);
            }
        }
    });

    const syncTimeSelectionOptions = () => {
        setTimeSelectionOptions({
            timeSelectionEnabled: Boolean(includeTimeToggle?.checked),
            is12HourClock: Boolean(is12HourToggle?.checked)
        });
    };

    includeTimeToggle?.addEventListener('change', syncTimeSelectionOptions);
    is12HourToggle?.addEventListener('change', syncTimeSelectionOptions);
    
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
