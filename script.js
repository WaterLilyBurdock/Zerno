(() => {
  'use strict';

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = reducedMotionQuery.matches;

  /* --------------------------------------------------------------------------
     Мобильное меню и форма (работают всегда, включая reduced-motion)
     -------------------------------------------------------------------------- */
  const header = document.querySelector('.header');
  const burger = document.querySelector('.nav__burger');
  const drawer = document.querySelector('.mobile-drawer');

  const toggleDrawer = (forceClose = false) => {
    if (!burger || !drawer) return;
    const isOpen = forceClose ? false : !drawer.classList.contains('is-open');
    burger.classList.toggle('is-open', isOpen);
    drawer.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    drawer.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  burger?.addEventListener('click', () => toggleDrawer());
  drawer?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => toggleDrawer(true));
  });

  const form = document.getElementById('cuppingForm');
  const formStatus = document.querySelector('.visit__form-status');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('input[name="name"]');
    const guestName = nameInput?.value.trim() || 'Гость';
    if (formStatus) {
      formStatus.textContent = `${guestName}, заявка принята! Ждём вас в субботу к 12:00.`;
    }
    form.reset();
  });

  /* Состояние шапки при скролле */
  const updateHeaderState = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });

  /* При prefers-reduced-motion отключаем все анимации, курсор и Lenis */
  if (prefersReducedMotion || typeof gsap === 'undefined') {
    document.querySelectorAll('.counter').forEach((el) => {
      el.textContent = el.dataset.target || '0';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  /* --------------------------------------------------------------------------
     1. Smooth Scroll (Lenis + синхронизация со ScrollTrigger)
     -------------------------------------------------------------------------- */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* Плавный переход по якорным ссылкам */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      toggleDrawer(true);

      if (lenis) {
        lenis.scrollTo(target, { offset: -72, duration: 1.2 });
      } else {
        gsap.to(window, {
          duration: 1.1,
          scrollTo: { y: target, offsetY: 72 },
          ease: 'power3.inOut',
        });
      }
    });
  });

  /* --------------------------------------------------------------------------
     2. Кастомный курсор-зерно
     -------------------------------------------------------------------------- */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cursor = document.querySelector('.bean-cursor');
  const cursorLabel = document.querySelector('.bean-cursor__label');

  if (canHover && cursor) {
    document.body.classList.add('has-custom-cursor');
    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.22, ease: 'power3.out' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.22, ease: 'power3.out' });

    window.addEventListener('mousemove', (e) => {
      moveX(e.clientX);
      moveY(e.clientY);
    });

    const interactiveSelector = 'a, button, [data-cursor], .card';
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(interactiveSelector);
      if (!target) return;
      cursor.classList.add('is-hover');
      const label = target.getAttribute('data-cursor');
      if (label && cursorLabel) {
        cursorLabel.textContent = label;
        cursor.classList.add('has-label');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(interactiveSelector);
      if (!target) return;
      if (target.contains(e.relatedTarget)) return;
      cursor.classList.remove('is-hover', 'has-label');
    });
  }

  /* --------------------------------------------------------------------------
     3. Кинетический заголовок Hero + вступительный таймлайн
     -------------------------------------------------------------------------- */
  const kineticWords = document.querySelectorAll('.kinetic-word');
  gsap.set(kineticWords, { yPercent: 115, rotate: 2 });
  gsap.set('.hero__meta, .hero__bottom', { opacity: 0, y: 24 });

  const heroTl = gsap.timeline({ delay: 0.15 });
  heroTl
    .to(kineticWords, {
      yPercent: 0,
      rotate: 0,
      duration: 1.05,
      ease: 'power4.out',
      stagger: 0.09,
    })
    .to(
      '.hero__meta, .hero__bottom',
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.12,
      },
      '-=0.55'
    );

  /* Кинетический сдвиг строк заголовка при скролле */
  document.querySelectorAll('.kinetic-row').forEach((row) => {
    const dir = Number(row.dataset.kinetic || 1);
    gsap.to(row, {
      x: dir * 36,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  /* --------------------------------------------------------------------------
     4. Parallax-эффекты (фон Hero и фотографии секций)
     -------------------------------------------------------------------------- */
  gsap.to('.hero__bg', {
    yPercent: 22,
    scale: 1.06,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  document.querySelectorAll('.parallax-img').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });

  /* --------------------------------------------------------------------------
     5. Scroll-Reveal анимации
     -------------------------------------------------------------------------- */
  gsap.utils.toArray('.reveal-fade').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });

  gsap.utils.toArray('.reveal-lines').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          once: true,
        },
      }
    );
  });

  ScrollTrigger.batch('.reveal-card', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    },
  });

  /* Анимированные счётчики статистики */
  document.querySelectorAll('.counter').forEach((el) => {
    const target = Number(el.dataset.target || 0);
    const state = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(state, {
          val: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = String(Math.round(state.val));
          },
        });
      },
    });
  });

  /* --------------------------------------------------------------------------
     6. Магнитные кнопки
     -------------------------------------------------------------------------- */
  if (canHover) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      const inner = btn.querySelector('.magnetic__inner');
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3.out' });
      const innerX = inner ? gsap.quickTo(inner, 'x', { duration: 0.45, ease: 'power3.out' }) : null;
      const innerY = inner ? gsap.quickTo(inner, 'y', { duration: 0.45, ease: 'power3.out' }) : null;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;

        xTo(relX * 0.28);
        yTo(relY * 0.28);
        innerX?.(relX * 0.14);
        innerY?.(relY * 0.14);
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
        if (inner) {
          gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
        }
      });
    });

    /* --------------------------------------------------------------------------
       7. Hover-эффекты карточек (3D-наклон + тёплый блик)
       -------------------------------------------------------------------------- */
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;

        card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);

        gsap.to(card, {
          rotateX: (0.5 - py) * 7,
          rotateY: (px - 0.5) * 7,
          y: -6,
          duration: 0.35,
          ease: 'power2.out',
          transformPerspective: 900,
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          duration: 0.65,
          ease: 'elastic.out(1, 0.55)',
        });
      });
    });
  }

  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
})();
