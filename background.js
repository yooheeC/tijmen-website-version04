const categoryImages = {
    exhibition: 'svg/01.svg',
    editorial: 'svg/02.svg',
    criticism: 'svg/03.svg',
    essays: 'svg/04.svg',
    commissioned: 'svg/05.svg',
};

function preloadImages() {
    Object.values(categoryImages).forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

function showBackgroundImage(filter) {
    const img = categoryImages[filter];

    if (!img) {
        clearBackgroundImage();
        return;
    }

    if (Array.isArray(img)) {
        document.body.style.setProperty('--bg-image', img.map(i => `url('${i}')`).join(', '));
        document.body.style.setProperty('--bg-size', img.map(() => `auto ${window.innerHeight}px`).join(', '));
        document.body.style.setProperty('--bg-position', img.map(() => 'center').join(', '));
        document.body.style.setProperty('--bg-blend', img.map(() => 'multiply').join(', '));
    } else {
        document.body.style.setProperty('--bg-image', `url('${img}')`);
        document.body.style.setProperty('--bg-size', `auto ${window.innerHeight}px`);
        document.body.style.setProperty('--bg-position', 'center');
        document.body.style.setProperty('--bg-blend', 'normal');
    }
}

function clearBackgroundImage() {
    document.body.style.setProperty('--bg-image', 'none');
}

window.activeFilter = 'all';

if (window.innerWidth > 768) {
    document.addEventListener('DOMContentLoaded', () => {

        preloadImages();

        document.querySelectorAll('.imgcolumn img').forEach(img => {
            img.addEventListener('load', () => {
                img.addEventListener('mouseover', () => {
                    const biographyContainer = document.querySelector('.biography-container');
                    biographyContainer.style.backgroundImage = `url('${img.src}')`;
                    biographyContainer.style.backgroundSize = `auto ${window.innerHeight}px`;
                    biographyContainer.style.backgroundPosition = 'center top';
                    biographyContainer.style.backgroundRepeat = 'no-repeat';
                    biographyContainer.style.backgroundAttachment = 'fixed';
                    biographyContainer.style.backgroundBlendMode = 'normal';
                });

                img.addEventListener('mouseout', () => {
                    const biographyContainer = document.querySelector('.biography-container');
                    biographyContainer.style.backgroundImage = 'none';
                });
            });

            if (img.complete) {
                img.dispatchEvent(new Event('load'));
            }
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('mouseover', () => {
                showBackgroundImage(btn.dataset.filter);
            });

            btn.addEventListener('mouseout', () => {
                showBackgroundImage(window.activeFilter);
            });
        });

        showBackgroundImage(window.activeFilter);
    });
}