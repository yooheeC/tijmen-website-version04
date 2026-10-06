document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.list-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function createCarousel(images) {
    const wrapper = document.createElement('div');
    wrapper.className = 'item-carousel';
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    wrapper.style.marginBottom = '0.5rem';
    wrapper.style.cursor = 'none';

    let index = 0;

    images.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.style.width = '100%';
      img.style.display = i === 0 ? 'block' : 'none';
      wrapper.appendChild(img);
    });

    wrapper.addEventListener('mousemove', (e) => {
      const x = e.clientX - wrapper.getBoundingClientRect().left;
      wrapper.style.cursor = x < wrapper.offsetWidth / 2 ? 'w-resize' : 'e-resize';
    });

    wrapper.addEventListener('click', (e) => {
      const x = e.clientX - wrapper.getBoundingClientRect().left;
      const imgs = wrapper.querySelectorAll('img');
      imgs[index].style.display = 'none';
      if (x < wrapper.offsetWidth / 2) {
        index = (index - 1 + images.length) % images.length;
      } else {
        index = (index + 1) % images.length;
      }
      imgs[index].style.display = 'block';
    });

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

      const span1 = document.createElement('span');
      span1.className = 'col1';
      span1.textContent = item.col1;

      if (isMobile) {
        span1.style.marginBottom = '-0.8rem';
      }

      const span2 = document.createElement('span');
      span2.className = 'col2 clickable';
      span2.innerHTML = item.col2;

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

      if (item.image) {
        const images = Array.isArray(item.image) ? item.image : [item.image];
        if (images.length > 0 && images[0] !== '') {
          const carousel = createCarousel(images);
          linkSpan.appendChild(carousel);
        }
      }

      const hasDescription = item.description && item.description !== '';
      const hasLink = item.link && item.link !== '';
      const hasBoth = hasDescription && hasLink;
      const hasContent = hasDescription || hasLink;

      let content = '';
      if (hasDescription) {
        content += `<span style="display: block;">${item.description}</span>`;
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

      const rowElements = [span1, span2, empty1, linkSpan];

      rowElements.forEach(el => {
        el.addEventListener('mouseover', () => {
          rowElements.forEach(e => {
            e.style.color = 'blue';
            e.querySelectorAll('a').forEach(a => a.style.color = 'blue');
          });
        });
        el.addEventListener('mouseout', () => {
          rowElements.forEach(e => {
            e.style.color = '';
            e.querySelectorAll('a').forEach(a => a.style.color = '');
          });
        });
      });

      span2.addEventListener('click', () => {
        if (isMobile && !hasContent) return;

        if (empty1.style.visibility === 'hidden') {
          empty1.style.visibility = 'visible';
          linkSpan.style.visibility = 'visible';
          linkSpan.style.overflow = 'hidden';
          linkSpan.style.maxHeight = '1000px';
        } else {
          empty1.style.visibility = 'hidden';
          linkSpan.style.maxHeight = '0';
          linkSpan.style.overflow = 'hidden';
          linkSpan.style.visibility = 'hidden';
        }
      });

      grid.appendChild(span1);
      grid.appendChild(span2);
      grid.appendChild(empty1);
      grid.appendChild(linkSpan);
    });

    if (window.innerWidth > 768) {
      document.querySelectorAll('.col1, .col2').forEach(el => {
        el.addEventListener('mouseover', () => showBackgroundImage(window.activeFilter));
        el.addEventListener('mouseout', () => showBackgroundImage(window.activeFilter));
      });
    }
  }

  renderItems('all');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.activeFilter = btn.dataset.filter;
      showBackgroundImage(window.activeFilter);
      renderItems(btn.dataset.filter);
    });
  });
});