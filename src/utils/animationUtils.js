/**
 * Animation utilities for calendar micro-interactions
 * Respects prefers-reduced-motion accessibility preference
 */

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if prefers-reduced-motion is reduce
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {
    return false;
  }
}

/**
 * Check if animations should be enabled
 * @returns {boolean} True if animations should be enabled
 */
export function shouldAnimate() {
  return !prefersReducedMotion();
}

/**
 * Add pulse animation to an element on selection
 * @param {SVGElement} element - The SVG element to animate
 * @param {number} duration - Animation duration in milliseconds (default: 300)
 */
export function addPulseAnimation(element, duration = 300) {
  if (!shouldAnimate() || !element) {
    return;
  }

  element.classList.add('pulse-animation');
  
  setTimeout(() => {
    element.classList.remove('pulse-animation');
  }, duration);
}

/**
 * Create a ripple effect at the click/tap position
 * @param {SVGElement} element - The clicked element
 * @param {Event} event - The click/tap event
 * @param {SVGElement} svgContainer - The SVG container element
 * @param {number} duration - Animation duration in milliseconds (default: 600)
 */
export function addRippleEffect(element, event, svgContainer, duration = 600) {
  if (!shouldAnimate() || !element || !event || !svgContainer) {
    return;
  }

  // Get click position relative to SVG
  const svgRect = svgContainer.getBoundingClientRect();
  const viewBox = svgContainer.viewBox?.baseVal || {
    width: svgRect.width || 100,
    height: svgRect.height || 100
  };
  const svgWidth = svgRect.width || viewBox.width;
  const svgHeight = svgRect.height || viewBox.height;

  // Get event coordinates (handle both mouse and touch events)
  let clientX, clientY;
  if (event.touches && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX || 0;
    clientY = event.clientY || 0;
  }

  const mouseX = clientX - (svgRect.left || 0);
  const mouseY = clientY - (svgRect.top || 0);

  // Convert to SVG coordinates
  const svgX = svgWidth > 0 ? (mouseX / svgWidth) * viewBox.width : viewBox.width / 2;
  const svgY = svgHeight > 0 ? (mouseY / svgHeight) * viewBox.height : viewBox.height / 2;

  // Create ripple circle
  const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ripple.setAttribute('class', 'ripple-effect');
  ripple.setAttribute('cx', String(svgX));
  ripple.setAttribute('cy', String(svgY));
  ripple.setAttribute('r', '0');
  ripple.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
  ripple.setAttribute('stroke', 'rgba(255, 255, 255, 0.8)');
  ripple.setAttribute('stroke-width', '2');
  ripple.style.pointerEvents = 'none';

  svgContainer.appendChild(ripple);

  // Animate ripple
  requestAnimationFrame(() => {
    const maxRadius = Math.max(viewBox.width, viewBox.height) * 0.3;
    ripple.style.transition = `r ${duration}ms ease-out, opacity ${duration}ms ease-out`;
    ripple.setAttribute('r', String(maxRadius));
    ripple.style.opacity = '0';
  });

  // Remove ripple after animation
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, duration);
}

/**
 * Add hover scale effect to an element
 * @param {SVGElement} element - The SVG element to add hover scale to
 */
export function addHoverScale(element) {
  if (!shouldAnimate() || !element) {
    return;
  }

  element.classList.add('hover-scale');
}
