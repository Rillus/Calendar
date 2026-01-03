/********/
/* Bundled Calendar - No modules required */
/********/

(function() {
    'use strict';

    /*************/
    /* Constants */
    /*************/
    const calendarType = "year";
    const segments = 12;

    // Custom seasonal color palette matching the image
    const monthColors = [
        [120, 80, 160],   // JAN - Deep purple/blue
        [100, 120, 200],  // FEB - Medium blue
        [80, 180, 220],   // MAR - Light blue/teal
        [60, 200, 200],   // APR - Greenish-blue
        [100, 220, 140],  // MAY - Light green
        [160, 240, 100],  // JUN - Yellow-green
        [255, 242, 0],    // JUL - Bright yellow
        [255, 200, 0],    // AUG - Golden yellow
        [255, 140, 60],   // SEP - Orange
        [255, 100, 80],   // OCT - Red-orange
        [220, 80, 120],   // NOV - Darker red-orange/magenta
        [180, 100, 160]   // DEC - Purple/magenta
    ];

    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const deg = 360 / segments;

    // Notch configuration
    const fullRadius = 1.0;
    const notchedRadius = 0.92;
    const svgSize = 400;

    /********************/
    /* Colour functions */
    /********************/
    function componentToHex(c) {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(colour) {
        const r = colour[0];
        const g = colour[1];
        const b = colour[2];
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    /*****************************/
    /* Mathematical manipulations */
    /*****************************/
    function degreesToRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    function sumTo(a, i) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
            sum += a[j];
        }
        return sum;
    }

    function polarToCartesian(centerX, centerY, radius, angleInRadians) {
        return [
            centerX + (radius * Math.cos(angleInRadians)),
            centerY + (radius * Math.sin(angleInRadians))
        ];
    }

    /*********************/
    /* SVG utilities */
    /*********************/
    function createArcPath(centerX, centerY, radius, startAngle, endAngle, outerRadiusRatio = 1.0, innerRadius = 0) {
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

    /*********************/
    /* Calendar Renderer */
    /*********************/
    const data = [];
    const labels = [];
    const colours = [];

    let svg;
    let centerX = svgSize / 2;
    let centerY = svgSize / 2;
    let radius = svgSize / 2;

    function initRenderer(svgElement) {
        svg = svgElement;
        centerX = svgSize / 2;
        centerY = svgSize / 2;
        radius = svgSize / 2;
    }

    function drawCalendar() {
        const segmentsGroup = svg.querySelector('.segments-group');
        if (segmentsGroup) {
            segmentsGroup.remove();
        }
        
        const segmentsGroupEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
        segmentsGroupEl.setAttribute("class", "segments-group");
        
        data.length = 0;
        labels.length = 0;
        colours.length = 0;
        
        for (let i = 0; i < segments; i++) {
            const monthColor = monthColors[i];
            const newColourHex = rgbToHex(monthColor);
            
            data.push(deg);
            colours.push(newColourHex);
            labels.push(months[i]);
            
            const days = monthDays[i];
            const outerRadiusRatio = (days === 31) ? fullRadius : notchedRadius;
            
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
            path.style.cursor = "pointer";
            
            path.addEventListener("click", () => writeSegmentName(labels[i]));
            path.addEventListener("mouseenter", () => writeSegmentName(labels[i]));
            path.addEventListener("mouseleave", () => drawCircle());
            
            segmentsGroupEl.appendChild(path);
            
            const labelAngle = -degreesToRadians(sumTo(data, i)) + degreesToRadians(45) + (arcSize / 2);
            const labelRadius = radius * outerRadiusRatio * 0.95;
            const labelPos = polarToCartesian(centerX, centerY, labelRadius, labelAngle);
            
            let textRotation = (labelAngle * 180 / Math.PI) + 90;
            if (labelAngle > Math.PI / 2 && labelAngle < 3 * Math.PI / 2) {
                textRotation += 180;
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
            text.style.fill = "#333";
            text.style.pointerEvents = "none";
            
            segmentsGroupEl.appendChild(text);
        }
        
        svg.appendChild(segmentsGroupEl);
    }

    function drawCircle() {
        const existingCircle = svg.querySelector('.center-circle');
        if (existingCircle) {
            existingCircle.remove();
        }
        
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

    function writeSegmentName(segment) {
        drawCircle();
        
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

    /********/
    /* Init */
    /********/
    function init() {
        const svgElement = document.getElementById("calendar-svg");
        
        if (!svgElement) {
            console.error("SVG element not found");
            return;
        }
        
        initRenderer(svgElement);
        
        svgElement.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);
        svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
        
        drawCalendar();
        drawCircle();
        
        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // ViewBox handles responsiveness
            }, 100);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

