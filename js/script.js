document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       1. Verificação de Ambiente (Dispositivo e Preferências)
       ========================================================================== */
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const htmlElement = document.documentElement;

    /* ==========================================================================
       2. Sistema de Tema Premium (Preservando preferência)
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });

    /* ==========================================================================
       3. Interação do Cursor (Iluminação Ambiental & Magnetic)
       ========================================================================== */
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isMoving = false;

    // Atualiza variáveis globais CSS para uso nos gradientes e iluminação
    function updateMousePosition() {
        htmlElement.style.setProperty('--mouse-x', `${mouseX}px`);
        htmlElement.style.setProperty('--mouse-y', `${mouseY}px`);
        isMoving = false;
    }

    if (!isTouchDevice && !prefersReducedMotion) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isMoving) {
                window.requestAnimationFrame(updateMousePosition);
                isMoving = true;
            }
        });

        /* ==========================================================================
           4. Magnetic Buttons / Items
           ========================================================================== */
        const magneticItems = document.querySelectorAll('.magnetic-item, .magnetic-btn');

        magneticItems.forEach(item => {
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Limite do magnetismo
                const magnetStrength = item.classList.contains('magnetic-btn') ? 0.3 : 0.2;

                item.style.transform = `translate(${x * magnetStrength}px, ${y * magnetStrength}px)`;
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translate(0px, 0px)';
                item.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            });

            item.addEventListener('mouseenter', () => {
                item.style.transition = 'none';
            });
        });

        /* ==========================================================================
           5. 3D Tilt no Hero
           ========================================================================== */
        const tiltContainer = document.querySelector('.tilt-container');
        const tiltElement = document.querySelector('.tilt-element');

        if (tiltContainer && tiltElement) {
            tiltContainer.addEventListener('mousemove', (e) => {
                const rect = tiltContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Mapeia coordenadas (-1 a 1)
                const xMultiplier = (x / rect.width) * 2 - 1;
                const yMultiplier = (y / rect.height) * 2 - 1;

                // Aplica rotação sutil (max 6 graus)
                const rotateX = yMultiplier * -6;
                const rotateY = xMultiplier * 6;

                tiltElement.style.setProperty('--rotate-x', `${rotateX}deg`);
                tiltElement.style.setProperty('--rotate-y', `${rotateY}deg`);
            });

            tiltContainer.addEventListener('mouseleave', () => {
                tiltElement.style.setProperty('--rotate-x', `0deg`);
                tiltElement.style.setProperty('--rotate-y', `0deg`);
                tiltElement.style.transition = 'transform 0.5s ease-out';
                setTimeout(() => {
                    tiltElement.style.transition = 'transform 0.1s ease-out';
                }, 500);
            });
        }
    }

    /* ==========================================================================
       6. Menu Mobile & Scroll NavBar
       ========================================================================== */
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links .nav-item');
    const nav = document.querySelector('.glass-nav');

    mobileMenuBtn.addEventListener('click', () => {
        const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
        mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('active');
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Efeito glassmorphism aprimorado no scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });

    /* ==========================================================================
       7. Scroll Reveal e Animação do Gráfico (Intersection Observer)
       ========================================================================== */
    if (!prefersReducedMotion) {
        // Observer para revelaçoes padrao
        const revealOptions = { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 };
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);

        document.querySelectorAll('.reveal-fade-up, .reveal-fade, .reveal-scale').forEach(el => {
            revealObserver.observe(el);
        });

        // Observer especial para o gráfico SVG animado
        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Adiciona a classe que dispara os keyframes/transitions do SVG
                    document.querySelector('.conceptual-chart').classList.add('chart-animated');
                    chartObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });

        const chartContainer = document.querySelector('.conceptual-chart');
        if(chartContainer) chartObserver.observe(chartContainer);
    } else {
        // Fallback imediato para reduced-motion
        document.querySelectorAll('.reveal-fade-up, .reveal-fade, .reveal-scale').forEach(el => {
            el.classList.add('is-revealed');
        });
        const chartContainer = document.querySelector('.conceptual-chart');
        if(chartContainer) chartContainer.classList.add('chart-animated');
    }

    /* ==========================================================================
       8. Scrollspy - Marcador ativo no menu
       ========================================================================== */
    const sections = document.querySelectorAll('section[id]');

    const scrollSpyOptions = { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 };
    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('href') === `#${currentId}`) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }, scrollSpyOptions);

    sections.forEach(section => scrollSpyObserver.observe(section));
});