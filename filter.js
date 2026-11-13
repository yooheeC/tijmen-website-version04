document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.list-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // ── [추가] category 로 col1 라벨을 자동으로 만듭니다 ──────────────
  // 예전에는 data.js 에 col1: "Edited" 가 따로 들어있었지만,
  // category 와 항상 똑같은 값이라 클라이언트가 두 번 입력할 필요가
  // 없도록 여기서 만들어 씁니다.
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
    // 새 분류가 생겨도 첫 글자만 대문자로 바꿔서 표시
    return key ? key.charAt(0).toUpperCase() + key.slice(1) : '';
  }

  // ── [추가] 값을 항상 "빈 것이 걸러진 배열"로 바꿔줍니다 ───────────
  // link, image 가 글자 하나일 때도, 목록일 때도, 비어 있을 때도
  // 모두 똑같이 처리되게 만드는 안전장치입니다.
  function toArray(value) {
    if (Array.isArray(value)) {
      return value.filter(v => v && String(v).trim() !== '');
    }
    if (value === undefined || value === null || String(value).trim() === '') {
      return [];
    }
    return [value];
  }

  // ── [변경] 목록 데이터. data.json 을 읽어온 뒤 채워집니다 ─────────
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
      // [추가] 첫 장만 바로 받고, 나머지는 넘길 때 받습니다
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
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
      const category = String(item.category || '').toLowerCase();
      return filter === 'all' || category === filter;
    });

    filtered.sort((a, b) => b.date - a.date);

    filtered.forEach(item => {
      const isMobile = window.innerWidth <= 768;

      const span1 = document.createElement('span');
      span1.className = 'col1';
      // [변경] item.col1 → category 에서 자동 생성
      span1.textContent = labelFor(item.category);

      if (isMobile) {
        if (filter !== 'all') {
          span1.style.display = 'none';
        } else {
          span1.style.marginBottom = '-0.8rem';
        }
      }

      // ── [변경] 빈 배열을 "값이 있다"고 잘못 판단하던 부분 수정 ─────
      const links = toArray(item.link);
      const images = toArray(item.image);

      const hasDescription = !!(item.description && String(item.description).trim() !== '');
      const hasLink = links.length > 0;
      const hasImage = images.length > 0;
      const hasBoth = hasDescription && hasLink;
      const hasContent = hasDescription || hasLink || hasImage;

      const span2 = document.createElement('span');
      span2.className = hasContent ? 'col2 clickable' : 'col2';
      // col2 에는 <i> 같은 태그가 들어있으므로 innerHTML 을 그대로 씁니다
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

      // [변경] 이미지 캐러셀은 여기서 만들지 않습니다.
      // 사용자가 그 항목을 처음 펼칠 때 만들어서, 보지도 않은 이미지를
      // 미리 다운로드하지 않게 합니다. (아래 클릭 핸들러 참고)
      let carouselBuilt = false;

      // [추가] 함께 파래지는 묶음: 분류 + 제목 + 설명.
      // 링크는 일부러 뺍니다. 링크는 각자 hover 되어야 하니까요.
      // (linkSpan 자체를 칠하면 그 안의 링크까지 같이 물들어서 안 됩니다)
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
        // [유지] 링크가 하나면 번호 없이, 여러 개면 1. 2. 3. 번호를 붙입니다
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
          // [변경] 마우스가 링크 위에 있으면 묶음은 칠하지 않습니다.
          // 그래야 링크 하나만 따로 반응합니다 (링크 색은 CSS가 처리).
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
          // [추가] 처음 펼칠 때 이미지 캐러셀을 만듭니다.
          // 설명·링크보다 위에 와야 하므로 맨 앞에 끼워 넣습니다.
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

  // ── [추가] data.json 을 읽어온 뒤에 목록을 그립니다 ───────────────
  // 예전에는 data.js 가 items 변수를 미리 만들어줬지만, 이제는
  // 파일을 불러오는 데 시간이 걸리므로 다 읽은 다음에 그려야 합니다.
  fetch('data.json')
    .then(res => {
      if (!res.ok) throw new Error('data.json 을 불러올 수 없습니다 (' + res.status + ')');
      return res.json();
    })
    .then(data => {
      items = Array.isArray(data) ? data : [];
      renderItems('all');
    })
    .catch(err => {
      console.error(err);
      // 데이터를 못 읽어도 페이지 전체가 깨지지는 않게 비워둡니다
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