// Portfolio filtering functionality
document.addEventListener('DOMContentLoaded', function () {
    const filterTags = document.querySelectorAll('.filter-tag');
    const caseStudyCards = document.querySelectorAll('.case-study-card');

    // Add click event listeners to filter tags
    filterTags.forEach(tag => {
        tag.addEventListener('click', function () {
            const selectedTag = this.dataset.tag;

            // Update active state
            filterTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Filter cards
            filterCards(selectedTag);
        });
    });

    function filterCards(selectedTag) {
        caseStudyCards.forEach(card => {
            const cardTags = card.dataset.tags.split(',');

            if (selectedTag === 'all' || cardTags.includes(selectedTag)) {
                card.style.display = 'block';
                card.style.animation = 'none';
                card.offsetHeight; // Trigger reflow
                card.style.animation = 'fadeInUp 0.6s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Smooth scroll for any anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add subtle parallax effect to hero section
    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
});