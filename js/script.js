// Smooth scrolling for navigation links
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

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe product cards and other elements
document.querySelectorAll('.product-card, .brand-item, .contact-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Contact information (for easy updates)
const contactInfo = {
    phone: '01044111143',
    whatsapp: '01050509779',
    location: 'سيدي غازي، محافظة كفر الشيخ',
    facebook: 'https://www.facebook.com/profile_status/',
    tiktok: 'https://www.tiktok.com/@alhazemgurob10',
    instagram: 'https://www.instagram.com/alhazem2025/'
};

// Log contact info for verification
console.log('Contact Information:', contactInfo);

// Add active state to navigation on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.style.borderBottom = '2px solid white';
        } else {
            link.style.borderBottom = 'none';
        }
    });
});

// Handle WhatsApp link click
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', (e) => {
        // WhatsApp will open in new window
        const message = 'السلام عليكم، أود الاستفسار عن المنتجات والأسعار';
        const phoneNumber = '201050509779';
        link.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    });
});

// Add loading indicator
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

console.log('Website loaded successfully! 🎉');
console.log('Company: شركة العالمية');
console.log('Location: سيدي غازي، محافظة كفر الشيخ');