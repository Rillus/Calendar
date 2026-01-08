/*********************/
/* Skip Links Utility */
/*********************/

/**
 * Creates skip links navigation element
 * @returns {HTMLElement} The skip links nav element
 */
export function createSkipLinks() {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Skip navigation');
  nav.classList.add('skip-links');

  const links = [
    { href: '#calendar-container', text: 'Skip to calendar' },
    { href: '#month-view-container', text: 'Skip to month view' },
    { href: '#selected-date', text: 'Skip to selected date' }
  ];

  links.forEach(linkConfig => {
    const link = document.createElement('a');
    link.href = linkConfig.href;
    link.textContent = linkConfig.text;
    link.classList.add('skip-link');
    
    // Add click handler to focus target element
    link.addEventListener('click', (e) => {
      const targetId = linkConfig.href.substring(1); // Remove #
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        // Use setTimeout to ensure focus happens after navigation
        setTimeout(() => {
          // For SVG elements (like selected-date text), focus the parent container instead
          if (targetElement.namespaceURI === 'http://www.w3.org/2000/svg') {
            // Find the calendar container (parent of SVG)
            const calendarContainer = targetElement.closest('#calendar-container') || 
                                     document.getElementById('calendar-container');
            if (calendarContainer) {
              calendarContainer.setAttribute('tabindex', '-1');
              calendarContainer.focus();
              // Scroll into view if method exists
              if (typeof calendarContainer.scrollIntoView === 'function') {
                calendarContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              // Remove tabindex after a moment
              setTimeout(() => {
                calendarContainer.removeAttribute('tabindex');
              }, 100);
            }
          } else {
            // For regular HTML elements, focus directly
            if (targetElement.tabIndex === -1) {
              targetElement.setAttribute('tabindex', '-1');
            }
            targetElement.focus();
            // Scroll into view if method exists
            if (typeof targetElement.scrollIntoView === 'function') {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            // Remove tabindex after focus to restore natural tab order
            setTimeout(() => {
              if (targetElement.getAttribute('tabindex') === '-1') {
                targetElement.removeAttribute('tabindex');
              }
            }, 100);
          }
        }, 0);
      } else if (targetId === 'selected-date') {
        // If selected date doesn't exist yet, focus the calendar container
        e.preventDefault();
        const calendarContainer = document.getElementById('calendar-container');
        if (calendarContainer) {
          setTimeout(() => {
            calendarContainer.setAttribute('tabindex', '-1');
            calendarContainer.focus();
            if (typeof calendarContainer.scrollIntoView === 'function') {
              calendarContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            setTimeout(() => {
              calendarContainer.removeAttribute('tabindex');
            }, 100);
          }, 0);
        }
      }
    });

    nav.appendChild(link);
  });

  return nav;
}

/**
 * Initializes skip links by appending them to the document body
 * Will not create duplicate skip links if called multiple times
 */
export function initSkipLinks() {
  // Check if skip links already exist
  const existingSkipLinks = document.querySelector('.skip-links');
  if (existingSkipLinks) {
    return;
  }

  const skipLinks = createSkipLinks();
  // Insert at the beginning of body for early access
  document.body.insertBefore(skipLinks, document.body.firstChild);
}
