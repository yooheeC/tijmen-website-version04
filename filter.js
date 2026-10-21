document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.list-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Only paint the background when drawings are switched on
  function refreshBackground() {
    if (window.drawingsEnabled) {
      showBackgroundImage(window.activeFilter);
    } else {
      clearBackgroundImage();
    }
  }

  function createCarousel(images) {
    const wrapper = document.createElement('div');
    wrapper.className = 'item-carousel';
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    wrapper.style.marginBottom = '0.5rem';

    let index = 0;

    images.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.style.width = '100%';
      img.style.display = i === 0 ? 'block' : 'none';
      wrapper.appendChild(img);
    });

    const leftZone = document.createElement('div');
    leftZone.style.cssText = 'position:absolute;left:0;top:0;width:50%;height:100%;z-index:1;cursor:w-resize;';

    const rightZone = document.createElement('div');
    rightZone.style.cssText = 'position:absolute;right:0;top:0;width:50%;height:100%;z-index:1;cursor:e-resize;';

    leftZone.addEventListener('click', () => {
      const imgs = wrapper.querySelectorAll('img');
      imgs[index].style.display = 'none';
      index = (index - 1 + images.length) % images.length;
      imgs[index].style.display = 'block';
    });

    rightZone.addEventListener('click', () => {
      const imgs = wrapper.querySelectorAll('img');
      imgs[index].style.display = 'none';
      index = (index + 1) % images.length;
      imgs[index].style.display = 'block';
    });

    wrapper.appendChild(leftZone);
    wrapper.appendChild(rightZone);

    return wrapper;
  }

  function renderItems(filter) {
    grid.innerHTML = '';

    const filtered = items.filter(item => {
      const category = item.category.toLowerCase();
      return filter === 'all' || category === filter;
    });

    filtered.sort((a, b) => b.date - a.date);

    filtered.forEach(item => {
      const isMobile = window.innerWidth <= 768;

      /* --- what does this item actually carry? --- */
      const hasDescription = item.description && item.description !== '';
      const hasLink = item.link && item.link !== '';
      const hasImage = item.image && (Array.isArray(item.image) ? item.image[0] !== '' : item.image !== '');
      const hasBoth = hasDescription && hasLink;
      const hasContent = hasDescription || hasLink || hasImage;

      /* --- column 1: category label --- */
      const span1 = document.createElement('span');
      span1.className = 'col1';
      span1.textContent = item.col1;

      if (isMobile) {
        if (filter !== 'all') {
          span1.style.display = 'none';
        } else {
          span1.style.marginBottom = '-0.8rem';
        }
      }

      /* --- column 2: title. Only clickable when there is something to open --- */
      const span2 = document.createElement('span');
      span2.className = hasContent ? 'col2 clickable' : 'col2';
      span2.innerHTML = item.col2;

      /* --- drawer --- */
      const empty1 = document.createElement('span');
      empty1.className = 'col1';
      empty1.style.visibility = 'hidden';

      if (isMobile) {
        empty1.style.display = 'none';
      }

      const linkSpan = document.createElement('span');
      linkSpan.className = 'col-link';
      linkSpan.style.maxHeight = '0';
      linkSpan.style.overflow = 'hidden';
      linkSpan.style.visibility = 'hidden';
      linkSpan.style.paddingTop = '0';

      if (hasImage) {
        const images = Array.isArray(item.image) ? item.image : [item.image];
        linkSpan.appendChild(createCarousel(images));
      }

      let content = '';
      if (hasDescription) {
        content += `<div>${item.description}</div>`;
        if (hasBoth) content += `<div style="height: 1em;"></div>`;
      }
      if (hasLink) {
        if (Array.isArray(item.link)) {
          item.link.forEach((l, index) => {
            content += `<a href="${l}" target="_blank">${index + 1}. ${l}</a><div style="height: 0.3em;"></div>`;
          });
        } else {
          content += `<a href="${item.link}" target="_blank">${item.link}</a>`;
        }
      }
      if (hasContent) content += `<div style="height: 1em;"></div>`;

      linkSpan.insertAdjacentHTML('beforeend', content);

      /* --- open / close ---
         max-height is 'none' when open: a fixed ceiling cut off the items
         carrying long link lists. */
      if (hasContent) {
        span2.addEventListener('click', () => {
          const open = span2.classList.toggle('open');

          empty1.style.visibility = open ? 'visible' : 'hidden';
          linkSpan.style.visibility = open ? 'visible' : 'hidden';
          linkSpan.style.maxHeight = open ? 'none' : '0';
          linkSpan.style.overflow = 'hidden';
        });
      }

      grid.appendChild(span1);
      grid.appendChild(span2);
      grid.appendChild(empty1);
      grid.appendChild(linkSpan);
    });

    if (window.innerWidth > 768) {
      document.querySelectorAll('.col1, .col2').forEach(el => {
        el.addEventListener('mouseover', refreshBackground);
        el.addEventListener('mouseout', refreshBackground);
      });
    }
  }

  renderItems('all');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.activeFilter = btn.dataset.filter;
      refreshBackground();
      renderItems(btn.dataset.filter);
    });
  });
});