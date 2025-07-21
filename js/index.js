// Newsletter Form Submission

document.getElementById('newsletter-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/subscribe', {
            method: 'POST',
            body: new FormData(e.target)
        });
        alert(response.ok ? 'Subscribed successfully!' : 'Error subscribing.');
    } catch (error) {
        alert('Network error. Please try again.');
    }
});

// Smooth scrolling for anchor links
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

// Back to top button functionality
const backToTopBtn = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Animated counters for facts section
const counters = document.querySelectorAll('[data-toggle="counter-up"]');
const animateCounters = () => {
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-toggle'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
};

// Intersection Observer for facts section
const factsSection = document.querySelector('.facts');
if (factsSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(factsSection);
}

// Add loading animation to product images
document.querySelectorAll('.product-item img').forEach(img => {
    img.addEventListener('load', function() {
        this.style.opacity = '1';
        this.style.transform = 'scale(1)';
    });
});

// Enhanced carousel functionality
const carousel = document.querySelector('#header-carousel');
if (carousel) {
    carousel.addEventListener('slide.bs.carousel', function (e) {
        const captions = this.querySelectorAll('.carousel-caption');
        captions.forEach(caption => {
            caption.style.opacity = '0';
            caption.style.transform = 'translateY(30px)';
        });
    });

    carousel.addEventListener('slid.bs.carousel', function (e) {
        const activeCaption = this.querySelector('.carousel-item.active .carousel-caption');
        if (activeCaption) {
            setTimeout(() => {
                activeCaption.style.opacity = '1';
                activeCaption.style.transform = 'translateY(0)';
            }, 100);
        }
    });
}

// Add hover effects to team social buttons
document.querySelectorAll('.team .btn-square').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1) rotate(5deg)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Newsletter form enhancement
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    const submitBtn = newsletterForm.querySelector('button[type="submit"]');
    
    emailInput.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    emailInput.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
    
    submitBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    submitBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
}

// Mobile-specific enhancements
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    // Improve touch targets
    document.querySelectorAll('.btn, .nav-link, .dropdown-item').forEach(element => {
        element.style.minHeight = '44px';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
    });

    // Add touch feedback
    document.querySelectorAll('.btn, .nav-link, .product-item, .team .position-relative').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });

    // Optimize carousel for mobile
    const carousel = document.querySelector('#header-carousel');
    if (carousel) {
        carousel.addEventListener('touchstart', function(e) {
            this.style.userSelect = 'none';
        });
        
        carousel.addEventListener('touchend', function(e) {
            this.style.userSelect = '';
        });
    }

    // Improve dropdown menu for mobile
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            const dropdown = this.nextElementSibling;
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            } else {
                // Close other dropdowns
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
                dropdown.classList.add('show');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Optimize images for mobile
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });

    // Add pull-to-refresh prevention
    let startY = 0;
    document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
    });
    
    document.addEventListener('touchmove', function(e) {
        const y = e.touches[0].pageY;
        const pull = y - startY;
        
        if (pull > 0 && window.scrollY === 0) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Responsive image loading
function loadResponsiveImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize responsive features
document.addEventListener('DOMContentLoaded', function() {
    loadResponsiveImages();
    
    // Add loading states
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('disabled')) {
                this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
                this.classList.add('disabled');
                
                setTimeout(() => {
                    this.innerHTML = this.getAttribute('data-original-text') || this.innerHTML;
                    this.classList.remove('disabled');
                }, 2000);
            }
        });
    });

    // Store original button text
    document.querySelectorAll('.btn').forEach(btn => {
        btn.setAttribute('data-original-text', btn.innerHTML);
    });
});

// Handle orientation change
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});

// Optimize for low-end devices
if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    // Reduce animations for low-end devices
    document.documentElement.style.setProperty('--animation-duration', '0.2s');
    document.querySelectorAll('.product-item, .team .position-relative').forEach(element => {
        element.style.transition = 'none';
    });
}
