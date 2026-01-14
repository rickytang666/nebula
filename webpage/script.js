// ===== Particle Background Animation =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.fillStyle = `rgba(96, 165, 250, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Create particles
const particles = [];
const particleCount = 80;

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

// Animation loop
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Draw connections
    particles.forEach((particleA, indexA) => {
        particles.slice(indexA + 1).forEach(particleB => {
            const dx = particleA.x - particleB.x;
            const dy = particleA.y - particleB.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.strokeStyle = `rgba(96, 165, 250, ${0.15 * (1 - distance / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particleA.x, particleA.y);
                ctx.lineTo(particleB.x, particleB.y);
                ctx.stroke();
            }
        });
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

// ===== Email Form Handling =====
const form = document.getElementById('beta-form');
const emailInput = document.getElementById('email');
const formMessage = document.getElementById('form-message');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        formMessage.className = 'form-message';
    }, 5000);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Validate email
    if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
    }

    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    // Simulate form submission (replace with actual API call)
    try {
        // In a real implementation, you would send this to your backend
        // Example:
        // const response = await fetch('/api/beta-signup', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ email })
        // });

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Success
        showMessage('🎉 Success! Check your email for TestFlight invitation.', 'success');
        emailInput.value = '';

        // Optional: Store email in localStorage for analytics
        const signups = JSON.parse(localStorage.getItem('betaSignups') || '[]');
        signups.push({ email, timestamp: new Date().toISOString() });
        localStorage.setItem('betaSignups', JSON.stringify(signups));

    } catch (error) {
        showMessage('Something went wrong. Please try again later.', 'error');
        console.error('Form submission error:', error);
    }
});

// ===== Smooth Scroll Animation =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.animate-fade-in, .animate-fade-in-delay-1, .animate-fade-in-delay-2, .animate-fade-in-delay-3, .animate-fade-in-delay-4, .animate-fade-in-delay-5').forEach(el => {
    observer.observe(el);
});

// ===== Input Focus Effects =====
emailInput.addEventListener('focus', () => {
    emailInput.parentElement.style.transform = 'scale(1.02)';
});

emailInput.addEventListener('blur', () => {
    emailInput.parentElement.style.transform = 'scale(1)';
});

// ===== Console Easter Egg =====
console.log('%c🌌 Nebula Beta', 'font-size: 24px; font-weight: bold; color: #3b82f6;');
console.log('%cInterested in joining our team? Email us!', 'font-size: 14px; color: #60a5fa;');
