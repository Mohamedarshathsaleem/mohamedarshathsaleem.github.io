/* ============================================================
   PARTICLE CANVAS BACKGROUND
   ============================================================ */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

const PARTICLE_COUNT = 55;
const PRIMARY = 'rgba(255, 0, 79,';
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : (Math.random() > 0.5 ? -5 : canvas.height + 5);
        this.size = Math.random() * 1.8 + 0.4;
        this.speedX = (Math.random() - 0.5) * 0.35;
        this.speedY = (Math.random() - 0.5) * 0.35;
        this.opacity = Math.random() * 0.45 + 0.08;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < -5 || this.x > canvas.width + 5 || this.y < -5 || this.y > canvas.height + 5) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${PRIMARY} ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
}

function drawLines() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist < 130) {
                const alpha = (1 - dist / 130) * 0.12;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `${PRIMARY} ${alpha})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animateParticles);
}

resizeCanvas();
initParticles();
animateParticles();
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

/* ============================================================
   TYPING ANIMATION
   ============================================================ */
const roles = ['Web Developer', 'UI/UX Designer', 'CS Student', 'Creative Coder'];
let roleIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typedText');

function typeLoop() {
    const current = roles[roleIdx];
    const speed = deleting ? 55 : 105;

    typedEl.textContent = deleting
        ? current.slice(0, charIdx--)
        : current.slice(0, charIdx++);

    if (!deleting && charIdx > current.length) {
        deleting = true;
        setTimeout(typeLoop, 1800);
        return;
    }
    if (deleting && charIdx < 0) {
        deleting = false;
        charIdx = 0;
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(typeLoop, 400);
        return;
    }
    setTimeout(typeLoop, speed);
}
typeLoop();

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    progressBar.style.width = (scrolled * 100) + '%';
}, { passive: true });

/* ============================================================
   NAVBAR — SCROLL STYLE + ACTIVE LINK
   ============================================================ */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    // active link highlight
    const scrollY = window.scrollY + 110;
    sections.forEach(sec => {
        if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
            navLinks.forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('href') === `#${sec.id}`) a.classList.add('active');
            });
        }
    });
}, { passive: true });

/* ============================================================
   MOBILE MENU
   ============================================================ */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const overlay     = document.getElementById('mobileOverlay');
const closeBtn    = document.getElementById('closeBtn');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);
mobileLinks.forEach(l => l.addEventListener('click', closeMenu));

/* ============================================================
   SCROLL REVEAL (Intersection Observer)
   ============================================================ */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ============================================================
   SKILL BARS — animate width on scroll
   ============================================================ */
const barFills = document.querySelectorAll('.sb-fill');

const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        setTimeout(() => { el.style.width = el.dataset.width + '%'; }, 350);
        barObserver.unobserve(el);
    });
}, { threshold: 0.3 });

barFills.forEach(b => barObserver.observe(b));

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCount(el, target) {
    let val = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const tick = setInterval(() => {
        val = Math.min(val + step, target);
        el.textContent = val;
        if (val >= target) clearInterval(tick);
    }, 25);
}

const counterEls = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target, parseInt(entry.target.dataset.target));
        counterObserver.unobserve(entry.target);
    });
}, { threshold: 0.5 });

counterEls.forEach(el => counterObserver.observe(el));

/* ============================================================
   TABS (About section)
   ============================================================ */
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(target).classList.add('active');
    });
});

/* ============================================================
   PORTFOLIO FILTER
   ============================================================ */
const filterBtns = document.querySelectorAll('.filter-btn');
const pCards     = document.querySelectorAll('.p-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        pCards.forEach(card => {
            const cats = card.dataset.category || '';
            const show = filter === 'all' || cats.includes(filter);
            card.classList.toggle('hidden', !show);
            if (show) card.style.animation = 'fadeUp 0.4s ease';
        });
    });
});

/* ============================================================
   CONTACT FORM — simulated submission
   ============================================================ */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn   = document.getElementById('submitBtn');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.innerHTML = '<span>Sending…</span> <i class="fa-solid fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;

    setTimeout(() => {
        contactForm.reset();
        submitBtn.innerHTML = '<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>';
        submitBtn.disabled = false;
        formSuccess.classList.add('show');
        setTimeout(() => formSuccess.classList.remove('show'), 4500);
    }, 1600);
});

/* ============================================================
   BACK TO TOP
   ============================================================ */
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 380);
}, { passive: true });

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
