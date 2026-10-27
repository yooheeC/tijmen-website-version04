document.addEventListener('DOMContentLoaded', () => {

  const isDesktop = () => window.innerWidth > 768;

  /* ---------------------------------------------------------------
     Elements
  --------------------------------------------------------------- */
  const bioBtns            = document.querySelectorAll('.bio');
  const biographyContainer = document.querySelector('.biography-container');
  const filters            = document.querySelector('.filters');
  const carousel           = document.querySelector('.biography-carousel');
  const imgToggleBtn       = document.querySelector('.bio-topbar .img-toggle-btn');
  const drawingsToggleBtn  = document.querySelector('.topbar .drawings-toggle-btn');

  /* ---------------------------------------------------------------
     State
  --------------------------------------------------------------- */
  let customCursor    = null;
  let carouselVisible = true;
  let carouselIndex   = 0;

  if (window.drawingsEnabled === undefined) window.drawingsEnabled = true;

  /* ---------------------------------------------------------------
     Custom cursor (desktop size only)
  --------------------------------------------------------------- */
  if (isDesktop()) {
    customCursor = document.createElement('div');
    customCursor.className = 'custom-cursor';
    document.body.appendChild(customCursor);
    document.body.classList.add('cursor-hidden');

    document.addEventListener('mousemove', (e) => {
      customCursor.style.left = `${e.clientX}px`;
      customCursor.style.top  = `${e.clientY}px`;

      if (!isDesktop()) {
        customCursor.style.display = 'none';
        document.body.classList.remove('cursor-hidden');
      }
    });

    document.addEventListener('mouseover', (e) => {
      if (!isDesktop()) return;
      if (e.target.closest('.item-carousel')) {
        customCursor.style.display = 'none';
      } else if (!biographyContainer || biographyContainer.classList.contains('hidden')) {
        customCursor.style.display = 'block';
      }
    });
  }

  window.addEventListener('resize', () => {
    if (!customCursor) return;
    if (!isDesktop()) {
      customCursor.style.display = 'none';
      document.body.classList.remove('cursor-hidden');
      if (biographyContainer) biographyContainer.style.removeProperty('cursor');
    } else {
      if (biographyContainer && !biographyContainer.classList.contains('hidden')) return;
      customCursor.style.display = 'block';
      document.body.classList.add('cursor-hidden');
    }
  });

  /* ---------------------------------------------------------------
     Mobile popup show/hide
  --------------------------------------------------------------- */
  const popupBtn  = document.querySelector('.popup-btn');
  const imgcolumn = document.querySelector('.imgcolumn');

  if (popupBtn && imgcolumn) {
    popupBtn.addEventListener('click', () => {
      const open = imgcolumn.classList.toggle('open');
      popupBtn.textContent = open ? 'hide' : 'show';
    });
  }

  /* ---------------------------------------------------------------
     Intro popup — close + drag
  --------------------------------------------------------------- */
  const introClose = document.querySelector('.intro-popup-close');
  const popup      = document.querySelector('.intro-popup');

  if (introClose && popup) {
    introClose.addEventListener('click', () => {
      popup.style.display = 'none';
    });

    const popupLink = popup.querySelector('a');
    let isDragging = false;
    let hasMoved   = false;
    let startX = 0;
    let startY = 0;

    popup.addEventListener('mousedown', (e) => {
      const rect   = popup.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      if (clickX < rect.width * 0.25 || clickX > rect.width * 0.75) {
        isDragging = true;
        hasMoved   = false;
        startX = clickX;
        startY = e.clientY - rect.top;
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      hasMoved = true;
      popup.style.left      = `${e.clientX - startX}px`;
      popup.style.top       = `${e.clientY - startY}px`;
      popup.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    if (popupLink) {
      popupLink.addEventListener('click', (e) => {
        if (hasMoved) {
          e.preventDefault();
          hasMoved = false;
        }
      });
    }
  }

  /* ---------------------------------------------------------------
     Biography carousel helpers
  --------------------------------------------------------------- */
  const carouselImages = [
    'img/IMG_2591.jpg',
    'img/IMG_2349.jpg',
    'img/IMG_2147.jpg',
    'img/IMG_2080.jpg',
    'img/IMG_1602.jpg',
    'img/IMG_0892.jpg',
    'img/IMG_0813.jpg',
    'img/IMG_0437.jpg',
    'img/IMG_3138.jpg',
    'img/IMG_0611.jpg',
    'img/IMG_9913.jpg',
    'img/IMG_3140.jpg',
    'img/a79286c9-a99d-4078-9504-1894856ab315.jpg',
    'img/0accd2a8-0499-48da-a6f0-21b3f928f85f.jpg',
    'img/IMG_0168.jpg',
    'img/C5F1DA31-ADA8-46C0-84FD-D5CF2D32440A.jpg',
    'img/453fe43d-1dd8-4518-b2b3-4bd9b9312204.JPG',
    'img/0e306369-73e4-49bb-b5ae-9639d75923a2.JPG',
    'img/IMG00137-20260228-0102.jpg',
  ];

  function updateCarousel() {
    if (!carousel) return;

    const mobile = !isDesktop();
    carousel.querySelectorAll('img').forEach((img, i) => {
      if (mobile) {
        img.style.display = i === carouselIndex ? 'block' : 'none';
        img.style.opacity = '1';
      } else {
        img.style.display = '';
        img.style.opacity = '';
        img.classList.toggle('active', i === carouselIndex);
      }
    });
  }

  function syncCarousel() {
    if (!carousel || !biographyContainer) return;
    const open = !biographyContainer.classList.contains('hidden');
    carousel.classList.toggle('visible', open && carouselVisible);
  }

  // Page relative to the clicked element, not the window: on mobile the
  // carousel is a small block, so the window midpoint is the wrong axis.
  function pageCarousel(e, target) {
    if (!carouselVisible) return;
    if (e.target.closest('.bio-topbar')) return;
    if (e.target.closest('a')) return;

    const rect = target.getBoundingClientRect();
    const mid  = rect.left + rect.width / 2;

    carouselIndex = e.clientX < mid
      ? (carouselIndex - 1 + carouselImages.length) % carouselImages.length
      : (carouselIndex + 1) % carouselImages.length;

    updateCarousel();
  }

  function handleMouseMove(e) {
    if (!isDesktop()) {
      biographyContainer.style.removeProperty('cursor');
      return;
    }
    const side = e.clientX < window.innerWidth / 2 ? 'w-resize' : 'e-resize';
    biographyContainer.style.setProperty('cursor', side, 'important');
  }

  function handleMouseLeave() {
    biographyContainer.style.removeProperty('cursor');
  }

  /* ---------------------------------------------------------------
     Biography modal toggle
  --------------------------------------------------------------- */
  if (bioBtns.length > 0 && biographyContainer) {
    bioBtns.forEach(bioBtn => {
      bioBtn.addEventListener('click', () => {
        biographyContainer.classList.toggle('hidden');
        const open = !biographyContainer.classList.contains('hidden');

        bioBtns.forEach(b => b.classList.toggle('active', open));
        document.body.classList.toggle('bio-open', open);
        document.body.style.overflow = open ? 'hidden' : '';

        if (filters)      filters.classList.toggle('hidden', open);
        if (imgToggleBtn) imgToggleBtn.classList.toggle('visible', open);

        syncCarousel();
        updateCarousel();

        if (open) {
          if (imgToggleBtn) {
            imgToggleBtn.textContent = carouselVisible ? 'images off' : 'images on';
          }
        } else {
          document.body.classList.remove('bio-images-off');
          biographyContainer.classList.remove('images-off');
          biographyContainer.style.removeProperty('cursor');
        }

        if (isDesktop() && customCursor) {
          if (open) {
            customCursor.style.display = carouselVisible ? 'none' : 'block';
            document.body.classList.remove('cursor-hidden');
          } else {
            customCursor.style.display = 'block';
            document.body.classList.add('cursor-hidden');
            document.documentElement.style.removeProperty('cursor');
          }
        }
      });
    });
  }

  /* ---------------------------------------------------------------
     Carousel paging
     Desktop: the carousel fills the screen, so the whole modal pages.
     Mobile:  the carousel is an inline block, so only it pages.
     Both listeners are registered and gated at event time, so a
     viewport change switches behaviour without a reload.
  --------------------------------------------------------------- */
  if (biographyContainer) {
    biographyContainer.addEventListener('mousemove', handleMouseMove);
    biographyContainer.addEventListener('mouseleave', handleMouseLeave);

    biographyContainer.addEventListener('click', (e) => {
      if (!isDesktop()) return;
      pageCarousel(e, biographyContainer);
    });
  }

  if (carousel) {
    carousel.addEventListener('click', (e) => {
      if (isDesktop()) return;   // the container handler covers desktop
      pageCarousel(e, carousel);
    });
  }

  /* ---------------------------------------------------------------
     Images on/off
  --------------------------------------------------------------- */
  if (imgToggleBtn) {
    imgToggleBtn.addEventListener('click', () => {
      carouselVisible = !carouselVisible;

      syncCarousel();
      updateCarousel();
      imgToggleBtn.textContent = carouselVisible ? 'images off' : 'images on';

      if (!isDesktop()) return;

      if (carouselVisible) {
        biographyContainer.classList.remove('images-off');
        if (customCursor) {
          customCursor.style.display = 'none';
          document.body.classList.remove('bio-images-off');
        }
      } else {
        biographyContainer.style.removeProperty('cursor');
        biographyContainer.classList.add('images-off');
        if (customCursor) {
          customCursor.style.display = 'block';
          document.body.classList.add('bio-images-off');
        }
      }
    });
  }

  /* ---------------------------------------------------------------
     Drawings on/off
  --------------------------------------------------------------- */
  if (drawingsToggleBtn) {
    drawingsToggleBtn.addEventListener('click', () => {
      window.drawingsEnabled = !window.drawingsEnabled;
      drawingsToggleBtn.textContent = window.drawingsEnabled ? 'drawings off' : 'drawings on';

      if (window.drawingsEnabled) {
        showBackgroundImage(window.activeFilter);
      } else {
        clearBackgroundImage();
      }
    });
  }

  /* ---------------------------------------------------------------
     clicked state on topbar buttons and links
  --------------------------------------------------------------- */
  document
    .querySelectorAll('.topbar button:not(.img-toggle-btn):not(.drawings-toggle-btn):not(.bio), a')
    .forEach(el => {
      el.addEventListener('click', () => el.classList.toggle('clicked'));
    });

  /* ---------------------------------------------------------------
     Keep the carousel correct across viewport changes
  --------------------------------------------------------------- */
  window.addEventListener('resize', updateCarousel);

  updateCarousel();
});