/* ============================================================
   JS FLAG — content is visible by default; reveal styles only
   apply once this script has run (see .js .reveal in style.css)
   ============================================================ */
document.documentElement.classList.add('js');

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
const NAV_OFFSET = 110;
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    // active link highlight (last section wins once the page bottom is reached)
    const scrollY = window.scrollY + NAV_OFFSET;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    sections.forEach((sec, i) => {
        const isLast = i === sections.length - 1;
        const inView = scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight;
        if ((atBottom && isLast) || (!atBottom && inView)) {
            navLinks.forEach(a => {
                const isCurrent = a.getAttribute('href') === `#${sec.id}`;
                a.classList.toggle('active', isCurrent);
                if (isCurrent) a.setAttribute('aria-current', 'true');
                else a.removeAttribute('aria-current');
            });
        }
    });
}, { passive: true });

/* ============================================================
   MOBILE MENU
   ============================================================ */
const MOBILE_BREAKPOINT = 900;
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');
const overlay     = document.getElementById('mobileOverlay');
const closeBtn    = document.getElementById('closeBtn');
const mobileLinks = document.querySelectorAll('.mobile-link');

function setMenuOpen(isOpen) {
    hamburger.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('active', isOpen);
    overlay.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    mobileMenu.inert = !isOpen;
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

function openMenu() {
    setMenuOpen(true);
    closeBtn.focus();
}
function closeMenu() {
    const wasOpen = mobileMenu.classList.contains('active');
    setMenuOpen(false);
    if (wasOpen) hamburger.focus();
}

hamburger.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);
mobileLinks.forEach(l => l.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > MOBILE_BREAKPOINT) setMenuOpen(false); });

/* ============================================================
   SCROLL REVEAL (Intersection Observer)
   ============================================================ */
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const delay = parseInt(entry.target.dataset.delay || 0);
            setTimeout(() => entry.target.classList.add('visible'), delay);
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('visible'));
}

/* ============================================================
   FOOTER YEAR
   ============================================================ */
document.getElementById('year').textContent = new Date().getFullYear();

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
