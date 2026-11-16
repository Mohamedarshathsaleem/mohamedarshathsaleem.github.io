/* ============================================================
   Portfolio interactions. Loaded with `defer`, so the DOM is
   parsed before this runs. The page is fully readable without it.
   ============================================================ */
(() => {
    'use strict';

    const NAV_OFFSET = 110;
    const NAV_SCROLLED_AT = 40;
    const BACK_TO_TOP_AT = 380;
    const MOBILE_BREAKPOINT = 900;

    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reveal styles only apply once this flag is set (see .js .reveal in style.css)
    root.classList.add('js');

    /* ---------- Scroll-driven UI: one rAF-throttled handler ---------- */
    const progressBar = document.getElementById('scrollProgress');
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    function setActiveLink(sectionId) {
        navLinks.forEach((link) => {
            const isCurrent = link.getAttribute('href') === `#${sectionId}`;
            link.classList.toggle('active', isCurrent);
            if (isCurrent) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }

    function findCurrentSection(scrollY, atBottom) {
        if (atBottom) return sections[sections.length - 1];
        const marker = scrollY + NAV_OFFSET;
        return sections.find((sec) => marker >= sec.offsetTop && marker < sec.offsetTop + sec.offsetHeight);
    }

    function updateOnScroll() {
        const scrollY = window.scrollY;
        const scrollable = root.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(scrollY / scrollable, 1) : 0;

        if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
        if (navbar) navbar.classList.toggle('scrolled', scrollY > NAV_SCROLLED_AT);
        if (backToTop) backToTop.classList.toggle('visible', scrollY > BACK_TO_TOP_AT);

        const current = findCurrentSection(scrollY, scrollable > 0 && scrollY >= scrollable - 2);
        if (current) setActiveLink(current.id);
    }

    let isTicking = false;
    function requestScrollUpdate() {
        if (isTicking) return;
        isTicking = true;
        window.requestAnimationFrame(() => {
            updateOnScroll();
            isTicking = false;
        });
    }

    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate, { passive: true });
    updateOnScroll();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    /* ---------- Mobile menu ---------- */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    const closeBtn = document.getElementById('closeBtn');

    if (hamburger && mobileMenu && overlay && closeBtn) {
        const isMenuOpen = () => mobileMenu.classList.contains('active');

        const setMenuOpen = (isOpen) => {
            hamburger.classList.toggle('open', isOpen);
            mobileMenu.classList.toggle('active', isOpen);
            overlay.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
            hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
            mobileMenu.setAttribute('aria-hidden', String(!isOpen));
            mobileMenu.inert = !isOpen;
            document.body.classList.toggle('menu-open', isOpen);
        };

        const closeMenu = ({ restoreFocus = true } = {}) => {
            if (!isMenuOpen()) return;
            setMenuOpen(false);
            if (restoreFocus) hamburger.focus();
        };

        // Keep Tab inside the open menu
        const trapFocus = (event) => {
            const focusable = mobileMenu.querySelectorAll('a[href], button:not([disabled])');
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        hamburger.addEventListener('click', () => {
            setMenuOpen(true);
            closeBtn.focus();
        });
        closeBtn.addEventListener('click', () => closeMenu());
        overlay.addEventListener('click', () => closeMenu());
        mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
            link.addEventListener('click', () => closeMenu({ restoreFocus: false }));
        });
        document.addEventListener('keydown', (event) => {
            if (!isMenuOpen()) return;
            if (event.key === 'Escape') closeMenu();
            if (event.key === 'Tab') trapFocus(event);
        });
        window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT + 1}px)`).addEventListener('change', (event) => {
            if (event.matches) closeMenu({ restoreFocus: false });
        });
    }

    /* ---------- Scroll reveal ---------- */
    const revealEls = document.querySelectorAll('.reveal');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const delay = Number.parseInt(entry.target.dataset.delay || '0', 10);
                window.setTimeout(() => entry.target.classList.add('visible'), delay);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach((el) => revealObserver.observe(el));
    }

    /* ---------- Hero: typed stack line (decorative, hidden from screen readers) ---------- */
    const TYPE_MS = 65;
    const DELETE_MS = 30;
    const HOLD_MS = 2200;
    const typed = document.getElementById('typed');

    if (typed && !prefersReducedMotion) {
        const phrases = (typed.dataset.phrases || '').split('|').filter(Boolean);
        if (phrases.length > 1) {
            let phraseIndex = 0;
            let charCount = phrases[0].length;
            let isDeleting = true;

            const tick = () => {
                const phrase = phrases[phraseIndex];
                charCount += isDeleting ? -1 : 1;
                typed.textContent = phrase.slice(0, charCount);

                let delay = isDeleting ? DELETE_MS : TYPE_MS;
                if (isDeleting && charCount === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                } else if (!isDeleting && charCount === phrase.length) {
                    isDeleting = true;
                    delay = HOLD_MS;
                }
                window.setTimeout(tick, delay);
            };
            window.setTimeout(tick, HOLD_MS);
        }
    }

    /* ---------- About: count-up stats ---------- */
    const COUNT_MS = 1200;
    const counters = document.querySelectorAll('.counter[data-target]');

    function animateCounter(el) {
        const target = Number.parseFloat(el.dataset.target);
        const decimals = Number.parseInt(el.dataset.decimals || '0', 10);
        if (Number.isNaN(target)) return;
        const start = performance.now();

        const step = (now) => {
            const t = Math.min((now - start) / COUNT_MS, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = (target * eased).toFixed(decimals);
            if (t < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        counters.forEach((el) => counterObserver.observe(el));
    }

    /* ---------- Cards: spotlight follows the cursor ---------- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.querySelectorAll('.exp-card, .proj-card, .side-block, .contact-panel').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
                card.style.setProperty('--my', `${event.clientY - rect.top}px`);
            }, { passive: true });
        });
    }

    /* ---------- Footer year ---------- */
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
})();
