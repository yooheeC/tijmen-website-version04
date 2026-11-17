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

  // The background drawings are always on.
  // A topbar button used to switch them off; that button has been removed.
  // background.js still reads this flag, so the variable stays.
  window.drawingsEnabled = true;

  /* ---------------------------------------------------------------
     Cursor state, decided in one place.

     The code that switched the cursor on and off used to be spread
     across four handlers, which fell out of step with each other.
     This reads the current state and settles everything at once.

       Can page  -> real cursor shows the arrows, custom cursor hidden
       Otherwise -> custom cursor shows, real cursor hidden
  --------------------------------------------------------------- */
  function bioIsOpen() {
    return !!biographyContainer && !biographyContainer.classList.contains('hidden');
  }

  // Can the carousel be paged left and right right now?
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
      // Paging through photos: the real cursor shows the arrows
      if (customCursor) customCursor.style.display = 'none';
      document.body.classList.remove('cursor-hidden');
    } else {
      // Everywhere else: the custom cursor is the only one shown
      if (customCursor) customCursor.style.display = 'block';
      document.body.classList.add('cursor-hidden');
      if (biographyContainer) biographyContainer.style.removeProperty('cursor');
    }
  }

  /* ---------------------------------------------------------------
     Biography text

     The text used to sit in index.html. It now comes from bio.json so
     it can be edited in the CMS.

     In bio.json the paragraphs are separated by a blank line. They are
     joined here with <br><br>, which is how the original markup spaced
     them, so the section looks exactly as it did before.
  --------------------------------------------------------------- */
  const biographyText = document.querySelector('.biography p');

  if (biographyText) {
    fetch('bio.json')
      .then(res => {
        if (!res.ok) throw new Error('Could not load bio.json (' + res.status + ')');
        return res.json();
      })
      .then(data => {
        const raw = (data && typeof data.text === 'string') ? data.text : '';
        const paragraphs = raw.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        // The text carries <i> tags, so it goes in as HTML rather than as text
        biographyText.innerHTML = paragraphs.join('<br><br>');
      })
      .catch(err => {
        console.error(err);
        // Leave the section empty rather than letting the page break
      });
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

     The number of photos is counted from the <img> tags in index.html.
     Paging used to use the length of the list below (19) while the HTML
     held 18 images, which left one blank step on every full cycle.
     Counting the DOM means a mismatch can no longer produce a blank.
  --------------------------------------------------------------- */
  function carouselCount() {
    return carousel ? carousel.querySelectorAll('img').length : 0;
  }

  /* ---------------------------------------------------------------
     Loading the carousel photos

     The photos carry loading="lazy", which keeps them off the first
     page load. On its own that makes paging flicker: a photo only
     starts downloading on the click that reveals it.

     So once the modal is open they are switched to eager, which starts
     the download right away. The current photo and its neighbours go
     first; the rest follow a moment later, so the next click always
     has its photo ready.

     This works on the <img> elements themselves, not on the browser
     cache, so a server that sends no-cache headers — a local dev
     server, for instance — cannot defeat it.
  --------------------------------------------------------------- */
  function startLoading(img) {
    if (!img) return;

    if (img.loading === 'lazy') {
      img.loading = 'eager';
      if (!img.complete) {
        // Some browsers do not act on the attribute change alone.
        // Re-assigning the source starts the fetch in those too.
        const src = img.getAttribute('src');
        if (src) img.src = src;
      }
    }

    // Having the file is not the same as being ready to draw it. A
    // photo sitting at opacity 0 is not decoded, so the browser only
    // unpacks the JPEG at the moment it is revealed — which is the
    // flicker. decode() does that work ahead of time, off the main
    // thread, so the switch has nothing left to do.
    if (img.decode) img.decode().catch(() => {});
  }

  // The current photo, the one on each side, and one further ahead
  // for someone clicking quickly through.
  function loadNeighbours() {
    if (!carousel) return;
    const imgs = carousel.querySelectorAll('img');
    const count = imgs.length;
    if (!count) return;

    [0, 1, -1, 2].forEach(offset => {
      startLoading(imgs[(carouselIndex + offset + count * 2) % count]);
    });
  }

  // Everything else, shortly after. The delay lets the photos above
  // claim the connection first.
  let restQueued = false;

  function loadRestSoon() {
    if (restQueued || !carousel) return;
    restQueued = true;
    setTimeout(() => {
      carousel.querySelectorAll('img').forEach(startLoading);
    }, 1200);
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

    loadNeighbours();
  }

  function syncCarousel() {
    if (!carousel || !biographyContainer) return;
    const open = bioIsOpen();
    carousel.classList.toggle('visible', open && carouselVisible);
  }

  // Is this a spot where paging should not happen?
  // Kept as one function so the cursor shape and the click behaviour
  // always follow the same rule.
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
     Show the left/right arrows only where paging actually works.

     The arrows used to be painted across the whole biography area with
     !important, so they appeared over the email and Instagram links and
     over the topbar buttons as well. Clicking there paged nothing, so
     the cursor was lying about what a click would do.
  --------------------------------------------------------------- */
  function handleMouseMove(e) {
    if (!biographyContainer) return;

    if (!canPage() || isPagingBlocked(e)) {
      biographyContainer.style.removeProperty('cursor');
      return;
    }

    // Use the container's midpoint, exactly as the click handler does.
    // The cursor used to split on the window midpoint while the click
    // split on the container's, so the two could disagree.
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

        if (open && carouselVisible) { loadNeighbours(); loadRestSoon(); }

        if (open) {
          if (imgToggleBtn) {
            imgToggleBtn.textContent = carouselVisible ? 'Images off' : 'Images on';
          }
          // Re-apply the class from the current state, so an images-off
          // session survives closing and reopening the modal.
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

      // Leave the cursor to the one function above rather than setting it
      // here. This handler used to show the custom cursor without hiding
      // the real one again, which left two cursors on screen.
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
