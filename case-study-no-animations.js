// Case Study Navigation and Interactions (No Dynamic Loading)
document.addEventListener('DOMContentLoaded', function() {
    const sideNavLinks = document.querySelectorAll('.side-nav-link');
    const sections = document.querySelectorAll('.case-section');

    // Smooth scroll for navigation links
    sideNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Update active navigation based on scroll position
    function updateActiveNav() {
        let current = '';
        const scrollPosition = window.scrollY + 150; // Offset for header

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        sideNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }



    // Animate metric cards when they come into view
    const metricCards = document.querySelectorAll('.metric-card');
    const metricObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease forwards';
            }
        });
    }, { threshold: 0.5 });

    metricCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        metricObserver.observe(card);
    });

    // Add CSS for metric card animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // Scroll event listener
    window.addEventListener('scroll', updateActiveNav);

    // Initialize the active nav on load
    updateActiveNav();
});




    // DONUT CHART


    document.addEventListener('DOMContentLoaded', () => {
    // Get references to SVG elements and text elements in the donut hole
    const svg = document.querySelector('.donut-chart');
    const percentageText = document.getElementById('percentage-text');
    const legendText = document.getElementById('legend-text');

    // Chart dimensions and properties
    const centerX = 100; // Center X coordinate of the SVG viewBox
    const centerY = 100; // Center Y coordinate of the SVG viewBox
    const outerRadius = 81; // 90% of original 90
    const strokeWidth = 30; // Thickness of the donut ring
    const innerRadius = outerRadius - strokeWidth; // Inner edge of the stroke
    const midRadius = innerRadius + (strokeWidth / 2); // Radius for the path to draw the arc

    // Minimal separation between slices in degrees
    const gapDegrees = 0.5;

    // Flag to ensure animation runs only once when chart becomes visible
    let animationStarted = false; 

    // Get the data for the donut chart from the HTML script tag
    const chartDataElement = document.getElementById('donut-chart-data');
    let data = []; // Initialize data array

    if (chartDataElement && chartDataElement.textContent) {
        try {
            // Parse the JSON string from the script tag's text content
            data = JSON.parse(chartDataElement.textContent);
        } catch (e) {
            console.error("Error parsing chart data from HTML:", e);
            // Fallback data in case of parsing error or missing element
            data = [
                { percentage: 33, legend: 'Default 1', color: '#ccc' },
                { percentage: 34, legend: 'Default 2', color: '#aaa' },
                { percentage: 33, legend: 'Default 3', color: '#888' }
            ];
        }
    } else {
        console.warn("Donut chart data element not found or is empty. Using fallback data.");
        // Fallback data if the element is not found or has no content
        data = [
            { percentage: 33, legend: 'Default 1', color: '#ccc' },
            { percentage: 34, legend: 'Default 2', color: '#aaa' },
            { percentage: 33, legend: 'Default 3', color: '#888' }
        ];
    }

    // Sort data by percentage in descending order to ensure consistent layout
    // (largest slice at the top, going clockwise)
    data.sort((a, b) => b.percentage - a.percentage);

    /**
     * Converts polar coordinates (angle and radius) to Cartesian coordinates.
     * Angles are adjusted so 0 degrees is at the 12 o'clock position and increase clockwise.
     * @param {number} centerX - X coordinate of the center.
     * @param {number} centerY - Y coordinate of the center.
     * @param {number} radius - The radius from the center.
     * @param {number} angleInDegrees - Angle in degrees.
     * @returns {{x: number, y: number}} Cartesian coordinates.
     */
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        // Adjust angle: SVG's 0 degrees is typically at 3 o'clock, we want 12 o'clock (top) to be 0.
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    /**
     * Generates the 'd' attribute string for an SVG arc path.
     * @param {number} centerX - X coordinate of the center.
     * @param {number} centerY - Y coordinate of the center.
     * @param {number} radius - The radius of the arc.
     * @param {number} startAngle - The starting angle of the arc in degrees.
     * @param {number} endAngle - The ending angle of the arc in degrees.
     * @returns {string} The 'd' attribute string for the SVG path.
     */
    function getArcPath(centerX, centerY, radius, startAngle, endAngle) {
        const start = polarToCartesian(centerX, centerY, radius, startAngle);
        const end = polarToCartesian(centerX, centerY, radius, endAngle);

        // largeArcFlag determines if the arc should be greater than 180 degrees
        // fullCircleAdjustment helps draw a full circle correctly if angle is exactly 360
        const fullCircleAdjustment = (Math.abs(endAngle - startAngle) >= 360 - 0.1) ? '1' : '0';
        const largeArcFlag = (endAngle - startAngle <= 180 && fullCircleAdjustment === '0') ? '0' : '1';

        return [
            `M ${start.x} ${start.y}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
        ].join(' ');
    }

    let paths = []; // Array to hold all SVG path elements (slices)

    // Initial state: hide percentage/legend text
    percentageText.innerHTML = '';
    legendText.textContent = '';

    // Create SVG path elements for each slice based on the data
    data.forEach((slice, index) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('donut-slice'); // Add class for styling
        path.setAttribute('fill', 'none'); // No fill, we're using stroke
        path.setAttribute('stroke', slice.color); // Set slice color
        path.setAttribute('stroke-width', strokeWidth); // Set thickness of the stroke
        path.setAttribute('stroke-linecap', 'butt'); // 'butt' for square ends (no rounded caps)
        path.setAttribute('data-percentage', slice.percentage); // Store percentage for hover
        path.setAttribute('data-legend', slice.legend);       // Store legend for hover

        // Initially hide the path by giving it an empty 'd' attribute
        path.setAttribute('d', '');

        // Add hover event listeners to each slice for interactivity
        path.addEventListener('mouseover', () => {
            // Show slice-specific text
            percentageText.innerHTML = `${slice.percentage}<tspan style="font-size:0.6em; vertical-align:super;">%</tspan>`;
            legendText.textContent = slice.legend;

            // Set opacity for the hovered slice to 1, and others to 0.3 (dimmed)
            paths.forEach(p => {
                p.style.opacity = (p === path) ? '1' : '0.3';
            });
        });

        path.addEventListener('mouseout', () => {
            // Hide slice-specific text
            percentageText.innerHTML = '';
            legendText.textContent = '';

            // Reset all slices to full opacity
            paths.forEach(p => {
                p.style.opacity = '1';
            });
        });

        // Insert paths into the SVG before the text elements so text is always on top
        svg.insertBefore(path, percentageText);
        paths.push(path); // Store reference to the path element
    });

    // Animation variables
    const animationDuration = 1000; // Animation duration in milliseconds

    /**
     * Main animation loop function.
     * Draws the donut slices incrementally over time.
     * @param {DOMHighResTimeStamp} timestamp - The current time in milliseconds (provided by requestAnimationFrame).
     */
    function animate(timestamp) {
        // Initialize startTime on the first call of animate
        if (!animate.startTime) animate.startTime = timestamp;
        const elapsed = timestamp - animate.startTime; // Time elapsed since animation started
        const animationProgress = Math.min(elapsed / animationDuration, 1); // Progress from 0 to 1

        let accumulatedAngle = 0; // Tracks the start of the current slice's full theoretical angle
        const totalAngleProgressed = 360 * animationProgress; // Total angle swept so far by the animation

        for (let i = 0; i < data.length; i++) {
            const slice = data[i];
            const fullSliceAngle = (slice.percentage / 100) * 360; // Full theoretical angle for this slice

            // Calculate the start and end angles for drawing, considering the gap
            const currentSliceDrawStartAngle = accumulatedAngle + (gapDegrees / 2);
            const currentSliceDrawEndAngle = accumulatedAngle + fullSliceAngle - (gapDegrees / 2);

            let arcDrawStart = currentSliceDrawStartAngle;
            let arcDrawEnd = currentSliceDrawEndAngle;

            // Adjust the arc drawing based on the overall animation progress
            if (totalAngleProgressed < currentSliceDrawStartAngle) {
                // Animation hasn't reached the start of this slice yet (including its leading gap)
                arcDrawEnd = arcDrawStart; // Draw nothing yet
            } else if (totalAngleProgressed < currentSliceDrawEndAngle) {
                // Animation is currently sweeping through this slice's drawn area
                // The end of the arc is limited by the overall animation progress
                arcDrawEnd = totalAngleProgressed;
            }
            // If totalAngleProgressed is >= currentSliceDrawEndAngle, the slice is fully drawn

            const path = paths[i];

            // Only draw if the end angle is greater than the start angle to avoid errors with degenerate paths
            if (arcDrawEnd > arcDrawStart + 0.01) { // Small threshold for floating point precision
                path.setAttribute('d', getArcPath(centerX, centerY, midRadius, arcDrawStart, arcDrawEnd));
            } else {
                path.setAttribute('d', ''); // Hide the path if there's nothing to draw yet
            }

            // Accumulate the full theoretical angle for the next slice's starting point
            accumulatedAngle += fullSliceAngle;
        }

        // Continue animation if not yet complete
        if (animationProgress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Final pass to ensure all slices are perfectly drawn with their full angles and gaps
            let finalAccumulatedAngle = 0;
            paths.forEach((path, index) => {
                const slice = data[index];
                const fullSliceAngle = (slice.percentage / 100) * 360;
                const finalDrawStartAngle = finalAccumulatedAngle + (gapDegrees / 2);
                const finalDrawEndAngle = finalAccumulatedAngle + fullSliceAngle - (gapDegrees / 2);

                if (finalDrawEndAngle > finalDrawStartAngle) {
                    path.setAttribute('d', getArcPath(centerX, centerY, midRadius, finalDrawStartAngle, finalDrawEndAngle));
                } else {
                    path.setAttribute('d', ''); // Should not happen for valid data unless slice is 0%
                }
                finalAccumulatedAngle += fullSliceAngle;
            });
        }
    }

    // Intersection Observer to trigger animation when chart enters the viewport
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animationStarted) {
                // Chart is visible and animation hasn't started yet, so start it
                requestAnimationFrame(animate);
                animationStarted = true; // Set flag to true to prevent re-animation
                observer.disconnect(); // Stop observing once animation has started
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the chart is visible in the viewport
    });

    // Start observing the donut chart SVG element
    observer.observe(svg);
});