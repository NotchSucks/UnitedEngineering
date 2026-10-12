/* ============================================
   UEC — Main JavaScript
   Nav toggle, scroll effects, reveal animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Keep the footer copyright year current without yearly edits.
  document.querySelectorAll('.current-year').forEach(year => {
    year.textContent = new Date().getFullYear();
  });

  // ── Navbar Scroll Effect ──
  const navbar = document.querySelector('.navbar');
  if (navbar && !navbar.classList.contains('solid')) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // ── Mobile Nav Toggle ──
  const toggle = document.querySelector('.nav-toggle');
  const mobile = document.querySelector('.nav-mobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobile.classList.toggle('open');
      document.body.style.overflow = mobile.classList.contains('open') ? 'hidden' : '';
    });
    mobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Scroll Reveal (Intersection Observer) ──
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-stagger');
  if (revealElements.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealElements.forEach(el => observer.observe(el));
  }

  // ── Accordion ──
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const inner = body.querySelector('.accordion-body-inner');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.accordion-body').style.maxHeight = '0';
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = inner.scrollHeight + 24 + 'px';
      }
    });
  });

  // ── Project Filter Tabs ──
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card[data-category]');
  if (filterTabs.length && projectCards.length) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.filter;
        projectCards.forEach(card => {
          if (cat === 'all' || card.dataset.category === cat) {
            card.style.display = '';
            card.style.animation = 'fadeIn 0.4s ease';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Interactive Lightbox Gallery Modal ──
  let currentImages = [];
  let currentCaptions = [];
  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  // Dynamically create lightbox HTML overlay if not present
  if (!document.getElementById('galleryLightbox')) {
    const lightboxHtml = `
      <div class="lightbox" id="galleryLightbox" aria-hidden="true" role="dialog">
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close gallery">&times;</button>
          <div class="lightbox-image-container">
            <img class="lightbox-image" src="" alt="UEC Project Installation Photo">
          </div>
          <button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#10094;</button>
          <button class="lightbox-nav lightbox-next" aria-label="Next image">&#10095;</button>
          <div class="lightbox-caption-bar">
            <div class="lightbox-caption"></div>
            <div class="lightbox-index"></div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHtml);
  }

  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxIndex = lightbox.querySelector('.lightbox-index');

  const updateLightbox = () => {
    if (!currentImages.length) return;
    
    // Smooth transition: fade out image, change src, then fade back in
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.96)';
    
    setTimeout(() => {
      lightboxImg.src = currentImages[currentIndex];
      lightboxCaption.textContent = currentCaptions[currentIndex] || "UEC Project Detail";
      lightboxIndex.textContent = `${currentIndex + 1} of ${currentImages.length}`;
      
      // Pre-load next image in background
      const nextIdx = (currentIndex + 1) % currentImages.length;
      const preloadImg = new Image();
      preloadImg.src = currentImages[nextIdx];
      
      lightboxImg.onload = () => {
        lightboxImg.style.opacity = '1';
        lightboxImg.style.transform = 'scale(1)';
      };
    }, 150);
  };

  const showLightbox = (images, captions, startIndex = 0) => {
    currentImages = images;
    currentCaptions = captions;
    currentIndex = startIndex;
    
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    updateLightbox();
  };

  const hideLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightboxImg.src = ''; // Clear image to release browser memory
    }, 300);
  };

  const nextImage = () => {
    if (!currentImages.length) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateLightbox();
  };

  const prevImage = () => {
    if (!currentImages.length) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateLightbox();
  };

  // Bind clicks to dynamically and statically added gallery trigger buttons
  document.addEventListener('click', e => {
    const trigger = e.target.closest('.btn-gallery-trigger');
    if (trigger) {
      e.preventDefault();
      const galleryStr = trigger.dataset.gallery || '';
      const captionsStr = trigger.dataset.captions || '';
      
      if (galleryStr) {
        const images = galleryStr.split(',').map(s => s.trim());
        const captions = captionsStr ? captionsStr.split(',').map(s => s.trim()) : [];
        showLightbox(images, captions, 0);
      }
    }
  });

  // Lightbox Close Events
  lightboxClose.addEventListener('click', hideLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) hideLightbox();
  });

  // Lightbox Navigation Events
  lightboxNext.addEventListener('click', e => {
    e.stopPropagation();
    nextImage();
  });
  
  lightboxPrev.addEventListener('click', e => {
    e.stopPropagation();
    prevImage();
  });

  // Keyboard Shortcuts (Esc to close, Arrow keys to slide)
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      hideLightbox();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    }
  });

  // Mobile Swipe Gestures
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  const handleSwipe = () => {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextImage(); // Swiped left, show next
    } else if (touchEndX > touchStartX + swipeThreshold) {
      prevImage(); // Swiped right, show prev
    }
  };
});

// Fade-in keyframe for filtered cards
const style = document.createElement('style');
style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);
