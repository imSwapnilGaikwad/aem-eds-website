// Main JavaScript for AEMeds.in
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navigation Toggle
    const mobileMenuBtn = document.getElementById('nav-toggle');
    const mobileMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            
            // Toggle hamburger icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = mobileMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
    
    // Smooth Scrolling for Anchor Links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add/remove scrolled class for styling
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll (optional)
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }
    
    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeInUp');
                // Add staggered animation delay for child elements
                const children = entry.target.querySelectorAll('.blog-card, .feature-card, .expertise-card, .mission-card');
                children.forEach((child, index) => {
                    child.style.animationDelay = `${index * 0.1}s`;
                    child.classList.add('animate-fadeInUp');
                });
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.section-header, .blog-grid, .features-grid, .expertise-grid, .mission-grid, .about-content, .contact-content');
    animatedElements.forEach(el => observer.observe(el));
    
    // Newsletter Form Handler
    const newsletterForms = document.querySelectorAll('.newsletter-form, #newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const button = this.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;
            
            // Validate email
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Show loading state
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            button.disabled = true;
            
            // Simulate API call (replace with actual implementation)
            setTimeout(() => {
                // Reset button
                button.innerHTML = originalText;
                button.disabled = false;
                
                // Clear form
                this.reset();
                
                // Show success message
                showNotification('Successfully subscribed! Thank you for joining our newsletter.', 'success');
            }, 2000);
        });
    });
    
    // Copy to Clipboard Function
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(function() {
            showNotification('Link copied to clipboard!', 'success');
        }).catch(function(err) {
            console.error('Could not copy text: ', err);
            showNotification('Failed to copy link', 'error');
        });
    };
    
    // Email Validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Notification System
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 400px;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            backdrop-filter: blur(10px);
            border: 1px solid;
        `;
        
        // Set colors based on type
        if (type === 'success') {
            notification.style.background = 'rgba(16, 185, 129, 0.9)';
            notification.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            notification.style.color = 'white';
        } else if (type === 'error') {
            notification.style.background = 'rgba(239, 68, 68, 0.9)';
            notification.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            notification.style.color = 'white';
        } else {
            notification.style.background = 'rgba(59, 130, 246, 0.9)';
            notification.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            notification.style.color = 'white';
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Add slide animations to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        
        .notification-close:hover {
            opacity: 1;
            background: rgba(0,0,0,0.1);
        }
        
        .navbar.scrolled {
            background: rgba(15, 23, 42, 0.95);
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .navbar {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Lazy Loading for Images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Performance: Preload critical resources
    const preloadLinks = [
        { href: '/assets/css/main.css', as: 'style' },
        { href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', as: 'style' }
    ];
    
    preloadLinks.forEach(link => {
        const linkEl = document.createElement('link');
        linkEl.rel = 'preload';
        linkEl.href = link.href;
        linkEl.as = link.as;
        document.head.appendChild(linkEl);
    });
    
    // Theme Toggle (if you want to add dark/light mode later)
    window.toggleTheme = function() {
        document.documentElement.classList.toggle('light-theme');
        localStorage.setItem('theme', document.documentElement.classList.contains('light-theme') ? 'light' : 'dark');
    };
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    }
    
    // Service Worker Registration (for PWA features)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
});