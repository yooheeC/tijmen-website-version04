document.addEventListener('DOMContentLoaded', () => {

  // 커스텀 커서
  const customCursor = document.createElement('div');
  customCursor.className = 'custom-cursor';
  document.body.appendChild(customCursor);
  document.body.classList.add('cursor-hidden');

  document.addEventListener('mousemove', (e) => {
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
  });

  // 모바일 팝업 show/hide
  const btn = document.querySelector('.popup-btn');
  const imgcolumn = document.querySelector('.imgcolumn');

  if (btn && imgcolumn) {
    btn.addEventListener('click', () => {
      imgcolumn.classList.toggle('open');
      btn.textContent = imgcolumn.classList.contains('open') ? 'hide' : 'show';
    });
  }

  // intro 팝업 닫기
  const introClose = document.querySelector('.intro-popup-close');
  const popup = document.querySelector('.intro-popup');

  if (introClose && popup) {
    introClose.addEventListener('click', () => {
      popup.style.display = 'none';
    });

    const popupLink = document.querySelector('.intro-popup a');
    let isDragging = false;
    let hasMoved = false;
    let startX, startY;

    popup.addEventListener('mousedown', (e) => {
      const rect = popup.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const centerStart = rect.width * 0.25;
      const centerEnd = rect.width * 0.75;

      if (clickX < centerStart || clickX > centerEnd) {
        isDragging = true;
        hasMoved = false;
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      hasMoved = true;
      popup.style.left = `${e.clientX - startX}px`;
      popup.style.top = `${e.clientY - startY}px`;
      popup.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    popupLink.addEventListener('click', (e) => {
      if (hasMoved) {
        e.preventDefault();
        hasMoved = false;
      }
    });
  }

  // 모든 요소 선언
  const bioBtn = document.querySelector('.bio');
  const biographyContainer = document.querySelector('.biography-container');
  const filters = document.querySelector('.filters');
  const carousel = document.querySelector('.biography-carousel');
  const imgToggleBtn = document.querySelector('.img-toggle-btn');

  // biography 토글
  if (bioBtn && biographyContainer) {
    bioBtn.addEventListener('click', () => {
      biographyContainer.classList.toggle('hidden');
      bioBtn.classList.toggle('active');
      if (filters) filters.classList.toggle('hidden');
      if (carousel) carousel.classList.toggle('visible');
      if (imgToggleBtn) imgToggleBtn.classList.toggle('visible');

      if (!biographyContainer.classList.contains('hidden')) {
        customCursor.style.display = 'none';
        document.body.classList.remove('cursor-hidden');
      } else {
        customCursor.style.display = 'block';
        document.body.classList.add('cursor-hidden');
      }
    });
  }

  // biography 카루셀
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

  let carouselIndex = 0;
  let carouselVisible = true;

  function updateCarousel() {
    if (carousel) {
      carousel.querySelectorAll('img').forEach((img, i) => {
        img.classList.toggle('active', i === carouselIndex);
      });
    }
  }

  function handleMouseMove(e) {
    const x = e.clientX;
    if (x < window.innerWidth / 2) {
      biographyContainer.style.cursor = 'w-resize';
    } else {
      biographyContainer.style.cursor = 'e-resize';
    }
  }

  if (biographyContainer) {
    biographyContainer.addEventListener('mousemove', handleMouseMove);

    biographyContainer.addEventListener('mouseleave', () => {
      biographyContainer.style.cursor = 'default';
    });

    biographyContainer.addEventListener('click', (e) => {
      if (!carouselVisible) return;
      const x = e.clientX;
      if (x < window.innerWidth / 2) {
        carouselIndex = (carouselIndex - 1 + carouselImages.length) % carouselImages.length;
      } else {
        carouselIndex = (carouselIndex + 1) % carouselImages.length;
      }
      updateCarousel();
    });
  }

  if (imgToggleBtn) {
    imgToggleBtn.addEventListener('click', () => {
      carouselVisible = !carouselVisible;
      if (carousel) carousel.classList.toggle('visible');
      imgToggleBtn.textContent = carouselVisible ? 'image off' : 'image on';

      if (!carouselVisible) {
        biographyContainer.style.cursor = 'default';
        biographyContainer.removeEventListener('mousemove', handleMouseMove);
      } else {
        biographyContainer.addEventListener('mousemove', handleMouseMove);
      }
    });
  }

  // clicked 클래스 토글 (topbar 버튼, a 태그 - img-toggle-btn 제외)
  document.querySelectorAll('.topbar button:not(.img-toggle-btn), a').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('clicked');
    });
  });

});