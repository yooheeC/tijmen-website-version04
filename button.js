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

  /* ---------------------------------------------------------------
     State
  --------------------------------------------------------------- */
  let customCursor    = null;
  let carouselVisible = true;
  let carouselIndex   = 0;

  // 배경 그림은 항상 켜둡니다.
  // 예전에는 상단바의 버튼으로 끌 수 있었지만 그 버튼은 없앴습니다.
  // background.js 가 이 값을 보고 있으므로 변수 자체는 남겨둡니다.
  window.drawingsEnabled = true;

  /* ---------------------------------------------------------------
     커서 상태를 한 곳에서 결정합니다.

     예전에는 커서를 켜고 끄는 코드가 네 군데에 흩어져 있어서
     서로 어긋났습니다. 이제는 "지금 상태가 어떤가"만 보고
     한 번에 정리합니다.

       넘기기 가능 → 진짜 커서(좌우 화살표)를 쓰고 커스텀 커서는 숨김
       그 외       → 커스텀 커서를 쓰고 진짜 커서는 숨김
  --------------------------------------------------------------- */
  function bioIsOpen() {
    return !!biographyContainer && !biographyContainer.classList.contains('hidden');
  }

  // 지금 좌우로 넘길 수 있는 상태인가
  function canPage() {
    return isDesktop() && bioIsOpen() && carouselVisible;
  }

  function applyCursorState() {
    if (!isDesktop()) {
      if (customCursor) customCursor.style.display = 'none';
      document.body.classList.remove('cursor-hidden');
      if (biographyContainer) biographyContainer.style.removeProperty('cursor');
      return;
    }

    if (canPage()) {
      // 사진을 넘기는 중: 진짜 커서가 좌우 화살표를 보여줍니다
      if (customCursor) customCursor.style.display = 'none';
      document.body.classList.remove('cursor-hidden');
    } else {
      // 그 외 모든 경우: 커스텀 커서만 보이게 합니다
      if (customCursor) customCursor.style.display = 'block';
      document.body.classList.add('cursor-hidden');
      if (biographyContainer) biographyContainer.style.removeProperty('cursor');
    }
  }

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
    });

    document.addEventListener('mouseover', (e) => {
      if (!isDesktop()) return;
      if (e.target.closest('.item-carousel')) {
        customCursor.style.display = 'none';
      } else {
        applyCursorState();
      }
    });
  }

  window.addEventListener('resize', () => {
    applyCursorState();
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

     [변경] 사진 개수는 index.html 의 <img> 태그를 직접 세어서 씁니다.
     예전에는 아래 목록의 길이(19)로 계산했는데 실제 <img>는 18개라서,
     한 바퀴에 한 번씩 아무 사진도 안 보이는 빈 칸이 생겼습니다.
     이제 목록과 HTML이 어긋나도 빈 칸이 생기지 않습니다.
  --------------------------------------------------------------- */
  function carouselCount() {
    return carousel ? carousel.querySelectorAll('img').length : 0;
  }

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
    const open = bioIsOpen();
    carousel.classList.toggle('visible', open && carouselVisible);
  }

  // 넘기기를 막아야 하는 곳인지 판단합니다.
  // 커서 모양과 실제 동작이 항상 같은 기준을 쓰도록 함수로 뺐습니다.
  function isPagingBlocked(e) {
    if (!carouselVisible) return true;
    if (e.target.closest('.bio-topbar')) return true;
    if (e.target.closest('a')) return true;
    if (e.target.closest('button')) return true;
    return false;
  }

  // Page relative to the clicked element, not the window: on mobile the
  // carousel is a small block, so the window midpoint is the wrong axis.
  function pageCarousel(e, target) {
    if (isPagingBlocked(e)) return;

    const count = carouselCount();
    if (count === 0) return;

    const rect = target.getBoundingClientRect();
    const mid  = rect.left + rect.width / 2;

    carouselIndex = e.clientX < mid
      ? (carouselIndex - 1 + count) % count
      : (carouselIndex + 1) % count;

    updateCarousel();
  }

  /* ---------------------------------------------------------------
     [변경] 좌우 화살표 커서를 "실제로 넘길 수 있는 곳"에서만 보여줍니다.

     예전에는 biography 영역 전체에 !important 로 칠해서,
     이메일·인스타그램 링크나 상단 버튼 위에서도 화살표가 떴습니다.
     클릭해도 넘어가지 않는 자리였으니 커서가 거짓말을 한 셈입니다.
  --------------------------------------------------------------- */
  function handleMouseMove(e) {
    if (!biographyContainer) return;

    if (!canPage() || isPagingBlocked(e)) {
      biographyContainer.style.removeProperty('cursor');
      return;
    }

    // [변경] 클릭 판정과 똑같이 컨테이너의 가운데를 기준으로 삼습니다.
    // 예전에는 커서는 화면 기준, 클릭은 컨테이너 기준이라
    // 둘이 어긋날 수 있었습니다.
    const rect = biographyContainer.getBoundingClientRect();
    const mid  = rect.left + rect.width / 2;
    const side = e.clientX < mid ? 'w-resize' : 'e-resize';
    biographyContainer.style.setProperty('cursor', side, 'important');
  }

  function handleMouseLeave() {
    if (biographyContainer) biographyContainer.style.removeProperty('cursor');
  }

  /* ---------------------------------------------------------------
     Biography modal toggle
  --------------------------------------------------------------- */
  if (bioBtns.length > 0 && biographyContainer) {
    bioBtns.forEach(bioBtn => {
      bioBtn.addEventListener('click', () => {
        biographyContainer.classList.toggle('hidden');
        const open = bioIsOpen();

        bioBtns.forEach(b => b.classList.toggle('active', open));
        document.body.classList.toggle('bio-open', open);
        document.body.style.overflow = open ? 'hidden' : '';

        if (filters)      filters.classList.toggle('hidden', open);
        if (imgToggleBtn) imgToggleBtn.classList.toggle('visible', open);

        syncCarousel();
        updateCarousel();

        if (open) {
          if (imgToggleBtn) {
            imgToggleBtn.textContent = carouselVisible ? 'Images off' : 'Images on';
          }
          // [변경] 다시 열었을 때 images off 상태가 그대로 이어지도록
          // 클래스를 현재 상태에 맞춰 붙여줍니다.
          biographyContainer.classList.toggle('images-off', !carouselVisible);
          document.body.classList.toggle('bio-images-off', !carouselVisible && isDesktop());
        } else {
          document.body.classList.remove('bio-images-off');
          biographyContainer.classList.remove('images-off');
          biographyContainer.style.removeProperty('cursor');
          document.documentElement.style.removeProperty('cursor');
        }

        applyCursorState();
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
      imgToggleBtn.textContent = carouselVisible ? 'Images off' : 'Images on';

      if (!isDesktop()) return;

      biographyContainer.classList.toggle('images-off', !carouselVisible);
      document.body.classList.toggle('bio-images-off', !carouselVisible);

      // [변경] 커서 처리를 여기서 직접 하지 않고 한 곳에 맡깁니다.
      // 예전에는 커스텀 커서를 켜면서 진짜 커서를 다시 숨기는 걸 빠뜨려서
      // 커서가 두 개로 보였습니다.
      applyCursorState();
    });
  }

  /* ---------------------------------------------------------------
     clicked state on topbar buttons and links
  --------------------------------------------------------------- */
  document
    .querySelectorAll('.topbar button:not(.img-toggle-btn):not(.bio), a')
    .forEach(el => {
      el.addEventListener('click', () => el.classList.toggle('clicked'));
    });

  /* ---------------------------------------------------------------
     Keep the carousel correct across viewport changes
  --------------------------------------------------------------- */
  window.addEventListener('resize', updateCarousel);

  updateCarousel();
  applyCursorState();
});