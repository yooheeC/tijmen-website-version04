document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.list-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Build the col1 label from the category.
  // data.js used to carry col1: "Edited" as a separate field, but it was
  // always just the category capitalised. Deriving it here leaves one
  // source of truth, so the two can never drift apart.
  const CATEGORY_LABELS = {
    exhibitions: 'Exhibitions',
    edited: 'Edited',
    criticism: 'Criticism',
    writings: 'Writings',
    commissioned: 'Commissioned'
  };

  function labelFor(category) {
    const key = String(category || '').toLowerCase();
    if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
    // Unknown category: fall back to capitalising the first letter
    return key ? key.charAt(0).toUpperCase() + key.slice(1) : '';
  }

  // Normalise a value to an array with empty entries stripped out.
  // link and image may arrive as a single string, as a list, or empty;
  // this lets the rest of the code treat all three the same way.
  function toArray(value) {
    if (Array.isArray(value)) {
      return value.filter(v => v && String(v).trim() !== '');
    }
    if (value === undefined || value === null || String(value).trim() === '') {
      return [];
    }
    return [value];
  }

  // The list data. Filled in once data.json has loaded.
  let items = [];

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
      img.decoding = 'async';
      img.style.width = '100%';
      img.style.display = i === 0 ? 'block' : 'none';
      wrapper.appendChild(img);
    });

    // This carousel is only built when the entry is first opened, so by
    // now the visitor has shown they want these images. Fetch the rest
    // ahead of time: a hidden image would otherwise only start loading
    // on the click that reveals it, which shows as a flicker.
    images.slice(1).forEach(src => {
      const preloader = new Image();
      preloader.src = src;
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
      const category = String(item.category || '').toLowerCase();
      return filter === 'all' || category === filter;
    });

    filtered.sort((a, b) => b.date - a.date);

    filtered.forEach(item => {
      const isMobile = window.innerWidth <= 768;

      const span1 = document.createElement('span');
      span1.className = 'col1';
      // Derived from category rather than stored on the item
      span1.textContent = labelFor(item.category);

      if (isMobile) {
        if (filter !== 'all') {
          span1.style.display = 'none';
        } else {
          span1.style.marginBottom = '-0.8rem';
        }
      }

      // An empty array is truthy in JavaScript, so length must be checked
      const links = toArray(item.link);
      const images = toArray(item.image);

      const hasDescription = !!(item.description && String(item.description).trim() !== '');
      const hasLink = links.length > 0;
      const hasImage = images.length > 0;
      const hasBoth = hasDescription && hasLink;
      const hasContent = hasDescription || hasLink || hasImage;

      const span2 = document.createElement('span');
      span2.className = hasContent ? 'col2 clickable' : 'col2';
      // col2 carries <i> tags, so it goes in as HTML rather than as text
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

      // The image carousel is not built here. It is built the first time
      // the entry is opened, so images nobody looks at are never
      // downloaded. See the click handler below.
      let carouselBuilt = false;

      // The group that highlights together: category, title and description.
      // Links are deliberately left out so each one can react on its own.
      // Colouring linkSpan itself would bleed into the links inside it.
      function highlightGroup() {
        const group = [span1, span2, empty1];
        const desc = linkSpan.querySelector('.col-desc');
        if (desc) group.push(desc);
        return group;
      }

      function setHighlight(on) {
        highlightGroup().forEach(e => {
          e.style.color = on ? 'blue' : '';
        });
      }

      let content = '';
      if (hasDescription) {
        content += `<span class="col-desc" style="display: block;">${item.description}</span>`;
        if (hasBoth) content += `<div style="height: 1em;"></div>`;
      }
      if (hasLink) {
        // One link: no number. Several: number them 1. 2. 3.
        if (links.length === 1) {
          content += `<a href="${links[0]}" target="_blank">${links[0]}</a>`;
        } else {
          links.forEach((l, i) => {
            content += `<a href="${l}" target="_blank">${i + 1}. ${l}</a><div style="height: 0.3em;"></div>`;
          });
        }
      }
      if (hasContent) content += `<div style="height: 1em;"></div>`;

      linkSpan.insertAdjacentHTML('beforeend', content);

      const rowElements = [span1, span2, empty1, linkSpan];

      rowElements.forEach(el => {
        el.addEventListener('mouseover', (ev) => {
          // Over a link the group stays unhighlighted, so only that link
          // reacts. The link's own colour is handled in CSS.
          const overLink = !!(ev.target.closest && ev.target.closest('a'));
          if (hasContent) {
            setHighlight(!overLink);
          }
          if (window.innerWidth > 768) {
            showBackgroundImage(String(item.category || '').toLowerCase());
          }
        });
        el.addEventListener('mouseout', () => {
          setHighlight(false);
          if (window.innerWidth > 768) {
            showBackgroundImage(window.activeFilter);
          }
        });
      });

      span2.addEventListener('click', () => {
        if (isMobile && !hasContent) return;

        if (empty1.style.visibility === 'hidden') {
          // Build the carousel the first time this entry is opened.
          // It belongs above the description and links, so insert it first.
          if (hasImage && !carouselBuilt) {
            linkSpan.insertBefore(createCarousel(images), linkSpan.firstChild);
            carouselBuilt = true;
          }

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
  }

  // Load data.json, then draw the list.
  // data.js used to define items before this script ran. Fetching a file
  // takes time, so the list can only be drawn once it has arrived.
  fetch('data.json')
    .then(res => {
      if (!res.ok) throw new Error('Could not load data.json (' + res.status + ')');
      return res.json();
    })
    .then(data => {
      items = Array.isArray(data) ? data : [];
      renderItems('all');
    })
    .catch(err => {
      console.error(err);
      // Leave the list empty rather than letting the whole page break
      grid.innerHTML = '';
    });

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
