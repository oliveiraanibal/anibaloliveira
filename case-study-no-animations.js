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
    const svg = document.querySelector('.donut-chart');
    const percentageValueTspan = document.getElementById('percentage-value');
    const percentageSymbolTspan = document.getElementById('percentage-symbol');
    const legendText = document.getElementById('legend-text');

    const centerX = 100; // Center X coordinate of the SVG viewBox
    const centerY = 100; // Center Y coordinate of the SVG viewBox
    const outerRadius = 81; // 90% of original 90
    const strokeWidth = 35; // Increased thickness
    const innerRadius = outerRadius - strokeWidth; // 81 - 30 = 51
    const midRadius = innerRadius + (strokeWidth / 2); // 51 + 15 = 66

    // Minimal separation on slices (0.5 degrees)
    const gapDegrees = 1;

    // --- MODIFICATION START ---
    // Get the data from the HTML script tag
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
    // --- MODIFICATION END ---


    // Sort data by percentage in descending order as required
    data.sort((a, b) => b.percentage - a.percentage);

    // Function to convert polar coordinates (angle and radius) to Cartesian coordinates
    // Angles start from the top (12 o'clock) and increase clockwise, matching standard pie chart representation.
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        // Adjust angle: SVG's 0 degrees is typically at 3 o'clock, we want 12 o'clock (top) to be 0.
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    // Function to generate the 'd' attribute for an SVG arc path
    function getArcPath(centerX, centerY, radius, startAngle, endAngle) {
        const start = polarToCartesian(centerX, centerY, radius, startAngle);
        const end = polarToCartesian(centerX, centerY, radius, endAngle);

        // If the arc spans 360 degrees (or very close), ensure it's drawn as a full circle
        // by making the start and end points slightly different to avoid degenerate arc paths.
        const fullCircleAdjustment = (Math.abs(endAngle - startAngle) >= 360 - 0.1) ? true : false;
        const largeArcFlag = (endAngle - startAngle <= 180 && !fullCircleAdjustment) ? '0' : '1';

        // Path for a single arc
        return [
            `M ${start.x} ${start.y}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
        ].join(' ');
    }

    let paths = []; // Array to hold all SVG path elements for slices

    // Create SVG path elements for each slice
    data.forEach((slice, index) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('donut-slice'); // Add class for styling
        path.setAttribute('fill', 'none'); // No fill, we're using stroke
        path.setAttribute('stroke', slice.color); // Set slice color
        path.setAttribute('stroke-width', strokeWidth); // Set thickness of the stroke
        path.setAttribute('stroke-linecap', 'butt'); // 'butt' for square ends
        path.setAttribute('data-percentage', slice.percentage); // Store percentage for hover
        path.setAttribute('data-legend', slice.legend);       // Store legend for hover

        // Initially hide the path
        path.setAttribute('d', ''); // No path drawn initially

        // Add hover event listeners to each slice
        path.addEventListener('mouseover', () => {
            percentageValueTspan.textContent = slice.percentage; // Update percentage value
            percentageSymbolTspan.textContent = '%';             // Update percentage symbol
            legendText.textContent = slice.legend;               // Update legend in donut hole

            // Set opacity for hovered slice to 1, others to 0.3
            paths.forEach(p => {
                p.style.opacity = (p === path) ? '1' : '0.3';
            });
        });
        path.addEventListener('mouseout', () => {
            percentageValueTspan.textContent = ''; // Clear percentage value
            percentageSymbolTspan.textContent = ''; // Clear percentage symbol
            legendText.textContent = '';     // Clear legend text

            // Reset all slices to full opacity
            paths.forEach(p => {
                p.style.opacity = '1';
            });
        });

        svg.appendChild(path); // Add path to SVG
        paths.push(path);      // Store reference to path element
    });

    // Re-order text elements to be on top of paths
    svg.appendChild(document.getElementById('percentage-text'));
    svg.appendChild(document.getElementById('legend-text'));

    // Animation variables
    const animationDuration = 1000; // Animation duration in milliseconds
    let startTime = null;           // Timestamp when animation starts

    // Main animation loop function
    function animate(timestamp) {
        if (!startTime) startTime = timestamp; // Record start time on first call
        const elapsed = timestamp - startTime; // Time elapsed since animation start
        const animationProgress = Math.min(elapsed / animationDuration, 1); // Progress from 0 to 1

        let accumulatedAngle = 0; // Tracks the start of the current slice's *full* angle
        const totalAngleProgressed = 360 * animationProgress; // Total angle swept so far by animation

        for (let i = 0; i < data.length; i++) {
            const slice = data[i];
            const fullSliceAngle = (slice.percentage / 100) * 360; // Full theoretical angle for this slice

            // Calculate the start and end angles for drawing, considering the gap
            // With gapDegrees = 0.5, currentSliceDrawStartAngle = accumulatedAngle + 0.25
            // and currentSliceDrawEndAngle = accumulatedAngle + fullSliceAngle - 0.25
            const currentSliceDrawStartAngle = accumulatedAngle + (gapDegrees / 2);
            const currentSliceDrawEndAngle = accumulatedAngle + fullSliceAngle - (gapDegrees / 2);

            let arcDrawStart = currentSliceDrawStartAngle;
            let arcDrawEnd = currentSliceDrawEndAngle;

            // Adjust the arc drawing based on the animation progress
            if (totalAngleProgressed < currentSliceDrawStartAngle) {
                // Animation hasn't reached the start of this slice (including its leading gap) yet
                arcDrawEnd = arcDrawStart; // Draw nothing yet
            } else if (totalAngleProgressed < currentSliceDrawEndAngle) {
                // Animation is currently sweeping through this slice's drawn area
                // The end of the arc is limited by the overall animation progress
                arcDrawEnd = totalAngleProgressed;
            }
            // If totalAngleProgressed is >= currentSliceDrawEndAngle, the slice is fully drawn

            const path = paths[i];

            // Only draw if the end angle is greater than the start angle to avoid errors with degenerate paths
            if (arcDrawEnd > arcDrawStart + 0.01) { // Adding a small threshold for floating point precision
                path.setAttribute('d', getArcPath(centerX, centerY, midRadius, arcDrawStart, arcDrawEnd));
            } else {
                path.setAttribute('d', ''); // Hide the path if there's nothing to draw yet
            }

            accumulatedAngle += fullSliceAngle; // Move to the start of the next slice's full theoretical position
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

                if (finalDrawEndAngle > finalDrawStartAngle) { // Ensure positive arc length
                    path.setAttribute('d', getArcPath(centerX, centerY, midRadius, finalDrawStartAngle, finalDrawEndAngle));
                } else {
                    path.setAttribute('d', ''); // Should not happen for valid data unless slice is 0%
                }
                finalAccumulatedAngle += fullSliceAngle;
            });
        }
    }

    // Start the animation when the DOM is ready
    requestAnimationFrame(animate);
});