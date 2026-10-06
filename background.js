const categoryImages = {
    exhibitions: { src: 'svg/Exhibitions.svg', size: '100vh auto' },
    edited: { src: 'svg/Edited.svg', size: 'auto 100vh' },
    criticism: { src: 'svg/Criticism.svg', size: '100vh auto' },
    writings: { src: 'svg/Writings.svg', size: '100vh auto' },
    commissioned: { src: 'svg/Commissioned.svg', size: '100vh auto' },
};

window.drawingsEnabled = true;

function preloadImages() {
    Object.values(categoryImages).forEach(item => {
        const img = new Image();
        img.src = item.src;
    });
}

function showBackgroundImage(filter) {
    if (!window.drawingsEnabled) return;

    const item = categoryImages[filter];

    if (!item) {
        clearBackgroundImage();
        return;
    }

    document.body.style.setProperty('--bg-image', `url('${item.src}')`);
    document.body.style.setProperty('--bg-size', item.size);
    document.body.style.setProperty('--bg-position', 'center');
    document.body.style.setProperty('--bg-blend', 'normal');
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