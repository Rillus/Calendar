/********/
/* Main */
/********/

import { svgSize } from './config/config.js';
import { initRenderer, drawCalendar, drawCircle, setYear, showSunAndMoonForDate, subscribeToDateChanges, selectDate, setTimeSelectionOptions, goToToday } from './renderer/calendarRenderer.js';
import { renderMonthView } from './renderer/monthViewRenderer.js';
import { initSkipLinks } from './utils/skipLinks.js';
import { setupVoiceNavigation, parseVoiceCommand } from './utils/voiceNavigation.js';
import { initDarkMode } from './utils/darkMode.js';

function init() {
    const svg = document.getElementById("calendar-svg");
    const yearInput = document.getElementById("year-input");
    const todayButton = document.getElementById("today-button");
    const voiceToggle = document.getElementById("voice-toggle");
    const voiceToggleText = document.getElementById("voice-toggle-text");
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
    
    // Initialize skip links
    initSkipLinks();
    
    // Initialize dark mode
    initDarkMode();
    
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
    let currentYear = new Date().getFullYear();
    let currentSelectedDate = new Date(); // Track currently selected date for voice navigation
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
        currentSelectedDate = new Date(date); // Update tracked date
        currentYear = date.getFullYear(); // Update tracked year
        renderMonthViewWithInteractions(date);
    });
    
    // Handle year changes
    yearInput.addEventListener("input", (e) => {
        const year = parseInt(e.target.value, 10);
        if (!isNaN(year) && year >= 1900 && year <= 2100) {
            currentYear = year; // Update tracked year
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
    
    // Handle Today button click
    const handleGoToToday = () => {
        const today = new Date();
        const todayYear = today.getFullYear();
        const currentYearValue = parseInt(yearInput.value, 10);
        
        // Update year input if needed
        if (todayYear !== currentYearValue) {
            yearInput.value = todayYear;
        }
        
        goToToday();
    };
    
    todayButton?.addEventListener('click', handleGoToToday);
    
    // Handle keyboard shortcut (T key) - only when not typing in an input
    document.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in an input field
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }
        
        // Check for T key (case-insensitive)
        if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            handleGoToToday();
        }
    });

    // Setup voice navigation
    let voiceRecognition = null;
    let isListening = false;

    const handleNextMonth = () => {
        const nextDate = new Date(currentSelectedDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        
        // Update year if needed
        if (nextDate.getFullYear() !== currentYear) {
            currentYear = nextDate.getFullYear();
            yearInput.value = currentYear;
            setYear(currentYear);
            drawCalendar();
            drawCircle();
        }
        
        selectDate(nextDate);
    };

    const handlePreviousMonth = () => {
        const prevDate = new Date(currentSelectedDate);
        prevDate.setMonth(prevDate.getMonth() - 1);
        
        // Update year if needed
        if (prevDate.getFullYear() !== currentYear) {
            currentYear = prevDate.getFullYear();
            yearInput.value = currentYear;
            setYear(currentYear);
            drawCalendar();
            drawCircle();
        }
        
        selectDate(prevDate);
    };

    const handleSelectDate = (date) => {
        const year = date.getFullYear();
        if (year !== currentYear) {
            currentYear = year;
            yearInput.value = year;
            setYear(year);
            drawCalendar();
            drawCircle();
        }
        selectDate(date);
    };

    const handleSelectTime = (time) => {
        // Time selection would need to be integrated with calendar renderer
        // For now, we'll log it
        console.log('Time selection via voice:', time);
        // TODO: Implement time selection integration
    };

    const voiceCallbacks = {
        getCurrentYear: () => currentYear, // Function to get current year dynamically
        onSelectDate: handleSelectDate,
        onSelectTime: handleSelectTime,
        onNextMonth: handleNextMonth,
        onPreviousMonth: handlePreviousMonth,
        onGoToToday: handleGoToToday,
        onError: (error) => {
            console.error('Voice recognition error:', error);
            if (voiceToggleText) {
                voiceToggleText.textContent = '🎤 Voice (Error)';
                setTimeout(() => {
                    if (!isListening && voiceToggleText) {
                        voiceToggleText.textContent = '🎤 Voice';
                    }
                }, 2000);
            }
        },
        onEnd: () => {
            isListening = false;
            if (voiceToggleText) {
                voiceToggleText.textContent = '🎤 Voice';
            }
            if (voiceToggle) {
                voiceToggle.classList.remove('listening');
            }
        },
        onUnrecognised: (command) => {
            console.log('Unrecognised voice command:', command);
        }
    };

    // Initialize voice navigation if supported
    if (voiceToggle) {
        voiceRecognition = setupVoiceNavigation(voiceCallbacks, currentYear);
        
        if (!voiceRecognition) {
            // Voice recognition not supported - hide or disable button
            voiceToggle.disabled = true;
            voiceToggle.setAttribute('aria-label', 'Voice navigation not supported in this browser');
            voiceToggleText.textContent = '🎤 Voice (Not Supported)';
        } else {
            // Handle voice toggle button click
            voiceToggle.addEventListener('click', () => {
                if (!voiceRecognition) return;
                
                if (isListening) {
                    // Stop listening
                    try {
                        voiceRecognition.stop();
                    } catch (err) {
                        console.error('Error stopping recognition:', err);
                    }
                    isListening = false;
                    voiceToggleText.textContent = '🎤 Voice';
                    voiceToggle.classList.remove('listening');
                } else {
                    // Start listening
                    try {
                        voiceRecognition.start();
                        isListening = true;
                        voiceToggleText.textContent = '🎤 Listening...';
                        voiceToggle.classList.add('listening');
                    } catch (err) {
                        console.error('Error starting recognition:', err);
                        isListening = false;
                        if (voiceToggleText) {
                            voiceToggleText.textContent = '🎤 Voice';
                        }
                    }
                }
            });
        }
    }
    
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
