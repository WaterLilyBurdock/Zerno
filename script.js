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

  /* Фильтр напитков в карте бара (работает всегда) */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const drinkCards = document.querySelectorAll('.drink-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter || 'all';
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      const visibleCards = [];
      drinkCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !matches);
        if (matches) visibleCards.push(card);
      });

      if (!prefersReducedMotion && typeof gsap !== 'undefined' && visibleCards.length) {
        gsap.fromTo(
          visibleCards,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power3.out' }
        );
        ScrollTrigger.refresh();
      }
    });
  });

  /* --------------------------------------------------------------------------
     Интерактивное модальное окно для всех карточек (напитки и микролоты)
     -------------------------------------------------------------------------- */
  const zernoItems = {
    espresso: {
      tag: 'Карта бара · Классика',
      vol: '40 мл · 18 г на входе',
      title: 'Двойной эспрессо',
      price: '180 ₽',
      story: 'Готовим на бразильском лоте Fazenda Passeio: высокая плотность, сладость жжёной карамели, тёмный какао и долгое ореховое послевкусие.',
      sweet: 80,
      acid: 35,
      body: 95,
      recipe: '93 °C · 1:2 · 28 секунд экстракции',
      isRoast: false,
    },
    v60: {
      tag: 'Карта бара · Альтернатива',
      vol: '250 мл · 15 г зерна',
      title: 'Воронка V60',
      price: '320 ₽',
      story: 'Чистая фильтр-чашка на мытом эфиопском лоте Worka Sakaro. Раскрывается по мере остывания нотами жасмина, белого персика и бергамота.',
      sweet: 85,
      acid: 82,
      body: 45,
      recipe: '94 °C · 1:16 · 2:45 (3 вливания)',
      isRoast: false,
    },
    flatwhite: {
      tag: 'Карта бара · Молочный',
      vol: '200 мл · Двойной ристретто',
      title: 'Флэт уайт',
      price: '290 ₽',
      story: 'Шелковистая микропена при 60 °C подчёркивает сливочную сладость кофе без горечи. По желанию готовим на овсяном или миндальном молоке.',
      sweet: 90,
      acid: 30,
      body: 80,
      recipe: '93 °C · Двойной шот + 140 мл молока',
      isRoast: false,
    },
    matcha: {
      tag: 'Карта бара · Чай',
      vol: '250 мл · Сорт Удзи',
      title: 'Матча латте',
      price: '340 ₽',
      story: 'Японский церемониальный матча первого сбора из префектуры Киото, взбитый венчиком тясэн на тёплом овсяном молоке.',
      sweet: 70,
      acid: 20,
      body: 75,
      recipe: '78 °C · 3 г матча · 220 мл овсяного молока',
      isRoast: false,
    },
    coldbrew: {
      tag: 'Карта бара · Холодный',
      vol: '250 мл · Экстракция 18 ч',
      title: 'Колд брю',
      price: '310 ₽',
      story: 'Медленное настаивание в ледяной воде даёт бархатистый напиток без резкой горечи — с нотами спелой вишни и какао-бобов.',
      sweet: 80,
      acid: 50,
      body: 70,
      recipe: '4 °C · 1:12 · 18 часов фильтрации',
      isRoast: false,
    },
    tonic: {
      tag: 'Карта бара · Сезонный',
      vol: '280 мл · Кения АА',
      title: 'Эспрессо-тоник',
      price: '350 ₽',
      story: 'Свежесваренный шот яркого кенийского эспрессо на крафтовом хининовом тонике со льдом и цедрой розового грейпфрута.',
      sweet: 65,
      acid: 90,
      body: 40,
      recipe: 'Лёд · 180 мл тоника · 36 г эспрессо',
      isRoast: false,
    },
    worka: {
      tag: 'Свежая обжарка · Эфиопия',
      vol: '250 г · 88.5 SCA',
      title: 'Worka Sakaro',
      price: '950 ₽',
      story: 'Высокогорный лот из региона Иргачефф (2 050 м). Мытая обработка подчёркивает цветочный аромат жасмина и сочную сладость белого персика.',
      sweet: 88,
      acid: 85,
      body: 50,
      recipe: 'Светлая обжарка под фильтр · Помол перед выдачей',
      isRoast: true,
    },
    paraiso: {
      tag: 'Свежая обжарка · Колумбия',
      vol: '250 г · 89.0 SCA',
      title: 'Finca El Paraiso',
      price: '1 150 ₽',
      story: 'Микролот с двойной анаэробной ферментацией из региона Уила. Яркий тропический профиль: маракуйя, малина и сливочный шоколад.',
      sweet: 94,
      acid: 80,
      body: 68,
      recipe: 'Светлая обжарка под фильтр и аэропресс',
      isRoast: true,
    },
    passeio: {
      tag: 'Свежая обжарка · Бразилия',
      vol: '250 г · 85.5 SCA',
      title: 'Fazenda Passeio',
      price: '790 ₽',
      story: 'Классика натуральной обработки из Можианы. Идеальный баланс для домашнего эспрессо, гейзерной кофеварки или турки.',
      sweet: 90,
      acid: 35,
      body: 92,
      recipe: 'Средняя обжарка под эспрессо, моку и турку',
      isRoast: true,
    },
  };

  const itemKeys = Object.keys(zernoItems);
  const coffeeModal = document.getElementById('coffeeModal');
  const grindBlock = document.getElementById('coffeeModalGrindBlock');
  let activeItemIdx = 0;
  let selectedGrind = 'В зёрнах';

  const fillCoffeeModal = (key) => {
    const data = zernoItems[key];
    if (!data || !coffeeModal) return;
    activeItemIdx = itemKeys.indexOf(key);

    document.getElementById('coffeeModalTag').textContent = data.tag;
    document.getElementById('coffeeModalVol').textContent = data.vol;
    document.getElementById('coffeeModalTitle').textContent = data.title;
    document.getElementById('coffeeModalPrice').textContent = data.price;
    document.getElementById('coffeeModalStory').textContent = data.story;
    document.getElementById('coffeeModalRecipe').textContent = data.recipe;

    document.getElementById('barSweet').style.width = `${data.sweet}%`;
    document.getElementById('barAcid').style.width = `${data.acid}%`;
    document.getElementById('barBody').style.width = `${data.body}%`;

    grindBlock?.classList.toggle('is-hidden', !data.isRoast);
  };

  const openCoffeeModal = (key) => {
    if (!coffeeModal) return;
    fillCoffeeModal(key);
    coffeeModal.classList.add('is-open');
    coffeeModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
      gsap.fromTo(coffeeModal, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power2.out' });
      gsap.fromTo(
        '.coffee-modal__dialog',
        { y: 24, scale: 0.97, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    } else {
      coffeeModal.style.opacity = '1';
    }
  };

  const closeCoffeeModal = () => {
    if (!coffeeModal?.classList.contains('is-open')) return;
    const done = () => {
      coffeeModal.classList.remove('is-open');
      coffeeModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
      gsap.to(coffeeModal, { opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: done });
    } else {
      coffeeModal.style.opacity = '0';
      done();
    }
  };

  document.querySelectorAll('.card[data-item]').forEach((card) => {
    const key = card.dataset.item;
    card.addEventListener('click', () => openCoffeeModal(key));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCoffeeModal(key);
      }
    });
  });

  document.querySelectorAll('.grind-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.grind-pill').forEach((p) => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      selectedGrind = pill.dataset.grind || 'В зёрнах';
    });
  });

  coffeeModal?.querySelectorAll('[data-close-coffee-modal]').forEach((el) => {
    el.addEventListener('click', closeCoffeeModal);
  });

  document.getElementById('coffeeModalCta')?.addEventListener('click', () => {
    const data = zernoItems[itemKeys[activeItemIdx]];
    const noteField = document.querySelector('#cuppingForm textarea[name="note"]');
    if (noteField && data) {
      noteField.value = data.isRoast
        ? `Интересует лот «${data.title}» (${selectedGrind})`
        : `Хочу попробовать «${data.title}»`;
    }
    closeCoffeeModal();
  });

  document.getElementById('coffeeModalPrev')?.addEventListener('click', () => {
    const prevIdx = (activeItemIdx - 1 + itemKeys.length) % itemKeys.length;
    fillCoffeeModal(itemKeys[prevIdx]);
  });

  document.getElementById('coffeeModalNext')?.addEventListener('click', () => {
    const nextIdx = (activeItemIdx + 1) % itemKeys.length;
    fillCoffeeModal(itemKeys[nextIdx]);
  });

  document.addEventListener('keydown', (e) => {
    if (!coffeeModal?.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeCoffeeModal();
    if (e.key === 'ArrowLeft') document.getElementById('coffeeModalPrev')?.click();
    if (e.key === 'ArrowRight') document.getElementById('coffeeModalNext')?.click();
  });

  /* При prefers-reduced-motion отключаем все анимации, курсор и Lenis */
  if (prefersReducedMotion || typeof gsap === 'undefined') {
    document.querySelectorAll('.counter').forEach((el) => {
      el.textContent = el.dataset.target || '0';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  /* Индикатор прогресса скролла и бегущая строка */
  gsap.to('.scroll-progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });

  const marqueeTrack = document.querySelector('.marquee__track');
  if (marqueeTrack) {
    const marqueeTween = gsap.to(marqueeTrack, {
      xPercent: -50,
      duration: 24,
      ease: 'none',
      repeat: -1,
    });
    marqueeTrack.parentElement?.addEventListener('mouseenter', () => marqueeTween.pause());
    marqueeTrack.parentElement?.addEventListener('mouseleave', () => marqueeTween.resume());
  }

  gsap.to('.hero__scroll', {
    opacity: 0,
    y: 16,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '25% top',
      scrub: true,
    },
  });

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
