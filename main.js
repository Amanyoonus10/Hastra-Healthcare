/* ==========================================
   Hastra Healthcare Medical Devices - Premium Script
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide SVG Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Register GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    
    // Core Layout Animations
    initIntroVideoScroll();
    initScrollAnimations();
    initStatsCounter();
    initSurgeonTimeline();
  }

  // Interactive UI Components
  initNavbar();
  initHeroParallax();
  initProductTabs();
  initAboutOverlay();
  initMagneticButtons();
});

/* Navbar Scroll & Mobile Menu Interaction */
function initNavbar() {
  const nav = document.getElementById('main-nav');
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      toggleBtn.classList.toggle('open');
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        toggleBtn.classList.remove('open');
      });
    });
  }
}

/* Mouse Parallax on Hero 3D Scene */
function initHeroParallax() {
  const heroScene = document.getElementById('hero-3d-scene');
  const hero = document.getElementById('hero');

  if (heroScene && hero) {
    hero.addEventListener('mousemove', (e) => {
      const { width, height, left, top } = hero.getBoundingClientRect();
      const x = e.clientX - left - width / 2;
      const y = e.clientY - top - height / 2;
      
      const xPct = x / (width / 2);
      const yPct = y / (height / 2);
      
      gsap.to(heroScene, {
        rotateY: xPct * 12,
        rotateX: -yPct * 12,
        transformPerspective: 1000,
        ease: "power2.out",
        duration: 0.6
      });
    });
    
    hero.addEventListener('mouseleave', () => {
      gsap.to(heroScene, {
        rotateY: 0,
        rotateX: 0,
        ease: "power2.out",
        duration: 0.8
      });
    });
  }
}

/* Interactive Product Carousel (Button Controls & Drag-To-Scroll) */
/* Product Portfolio Tabs Switching */
function initProductTabs() {
  const tabs = document.querySelectorAll('.portfolio-tab-btn');
  const panes = document.querySelectorAll('.portfolio-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active to current tab
      tab.classList.add('active');

      // Hide all panes with transition
      panes.forEach(pane => {
        pane.classList.remove('active');
        pane.style.display = 'none';
        pane.style.opacity = '0';
      });

      // Show targeted pane
      const activePane = document.getElementById(`pane-${targetTab}`);
      if (activePane) {
        activePane.style.display = 'block';
        // Force reflow for opacity transition
        activePane.offsetHeight;
        activePane.classList.add('active');
        activePane.style.opacity = '1';

        // Re-trigger GSAP ScrollTrigger refresh so scrolling animations align with new height
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }
    });
  });
}

/* Magnetic Button Force Hover Effect */
function initMagneticButtons() {
  const magneticElements = document.querySelectorAll('.magnetic');
  
  magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(el, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });
    });
  });
}

/* Stats Counter Animation */
function initStatsCounter() {
  gsap.utils.toArray('.stat-card').forEach(card => {
    const numEl = card.querySelector('.stat-number');
    const target = parseFloat(numEl.getAttribute('data-target'));
    const isFloat = numEl.getAttribute('data-target').includes('.');
    const obj = { value: 0 };
    
    gsap.to(obj, {
      value: target,
      duration: 2.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      onUpdate: () => {
        if (isFloat) {
          numEl.textContent = obj.value.toFixed(2);
        } else {
          numEl.textContent = Math.floor(obj.value).toLocaleString();
        }
      }
    });
  });
}

/* Surgeon Timeline Progress Scrubber */
function initSurgeonTimeline() {
  const journeySection = document.querySelector('.surgeon-journey-section');
  const progressLine = document.querySelector('.timeline-progress');
  const steps = document.querySelectorAll('.timeline-step');
  const journeyVideo = document.getElementById('journey-scroll-video');

  if (journeySection && progressLine && steps.length > 0) {
    // 1. Progress line and active step highlighting
    gsap.to(progressLine, {
      width: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: journeySection,
        start: "top 65%",
        end: "bottom 35%",
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalSteps = steps.length;
          const activeIndex = Math.min(Math.floor(progress * totalSteps), totalSteps - 1);
          
          steps.forEach((step, idx) => {
            if (idx <= activeIndex) {
              step.classList.add('active');
            } else {
              step.classList.remove('active');
            }
          });
        }
      }
    });



    // Support clicking a step to slide to its scroll area
    steps.forEach((step, idx) => {
      step.addEventListener('click', () => {
        const totalHeight = journeySection.offsetHeight;
        const triggerScrollTop = journeySection.offsetTop;
        const targetScroll = triggerScrollTop + (totalHeight * (idx / steps.length)) - 100;
        
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      });
    });
  }
}

/* Staggered GSAP scroll fades for elements */
function initScrollAnimations() {
  // Simple fade up for sections
  const fadeUpElements = gsap.utils.toArray('.section-header, .specialty-card, .ethics-left, .ethics-right, .divider-section, .info-card, .directory-card');
  fadeUpElements.forEach(el => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none"
      }
    });
  });

  // Scale in the background elements or special videos
  gsap.from('.hero-scene-container', {
    scale: 0.95,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out"
  });

  gsap.from('.hero-title, .hero-desc, .hero-ctas, .hero-pillars', {
    y: 30,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    ease: "power2.out"
  });
}

/* Scroll-Bound Intro Video Scrubbing */
function initIntroVideoScroll() {
  const video = document.getElementById('scroll-video');
  const fill = document.querySelector('.video-progress-fill');
  const overlay = document.querySelector('.scroll-indicator-overlay');
  
  if (!video) return;

  const isMobile = window.matchMedia("(max-width: 768px)").matches || ('ontouchstart' in window);

  // Safari / iOS compatibility and rendering setup
  video.muted = true;
  video.playsInline = true;
  
  // Try loading and setting minor play offset to force rendering of the first frame immediately
  try {
    video.load();
    video.currentTime = 0.01;
    video.pause();
  } catch (e) {
    console.warn("Initial video pre-render ignored: ", e);
  }

  const startScrollTrigger = () => {
    const duration = video.duration && !isNaN(video.duration) ? video.duration : 10;
    
    // Create a dummy playhead object that GSAP will tween smoothly with inertia
    const playhead = { frame: 0.01 };
    const scrubVal = isMobile ? 2.2 : 1.5; // Damped physics on mobile to handle touch inertia smoothly
    
    gsap.to(playhead, {
      frame: duration - 0.02,
      ease: "none",
      scrollTrigger: {
        trigger: "#intro-video-sec",
        start: "top top",
        end: "bottom bottom",
        scrub: scrubVal,
        onUpdate: (self) => {
          if (fill) {
            fill.style.width = `${self.progress * 100}%`;
          }
          if (overlay) {
            overlay.style.opacity = Math.max(1 - self.progress * 2.5, 0);
          }
        }
      }
    });

    // Throttled frame setting using performance-budgeted seek interval (150ms on mobile, 33ms on desktop)
    let lastSeekTime = 0;
    const seekThrottleMs = isMobile ? 150 : 33;

    const renderFrame = () => {
      const now = performance.now();
      if (now - lastSeekTime > seekThrottleMs) {
        if (Math.abs(playhead.frame - video.currentTime) > 0.02 && !video.seeking) {
          video.currentTime = Math.max(0.01, Math.min(duration - 0.01, playhead.frame));
          lastSeekTime = now;
        }
      }
      requestAnimationFrame(renderFrame);
    };
    requestAnimationFrame(renderFrame);

    // 3. Fade in navbar when past intro scroll section
    gsap.to('#main-nav', {
      opacity: 1,
      pointerEvents: "auto",
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#intro-video-sec",
        start: "bottom 30%",
        toggleActions: "play none none reverse"
      }
    });
  };

  if (video.readyState >= 1) {
    startScrollTrigger();
  } else {
    video.addEventListener('loadedmetadata', startScrollTrigger);
  }
}

/* Interactive About Fullscreen Overlay */
function initAboutOverlay() {
  const overlay = document.getElementById('about-overlay');
  const closeBtn = document.getElementById('about-close');
  const aboutLinks = document.querySelectorAll('a[href="#about"]');

  if (!overlay || !closeBtn) return;

  const openOverlay = (e) => {
    e.preventDefault();
    overlay.classList.add('active');
    document.body.classList.add('about-open');

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  };

  const closeOverlay = () => {
    overlay.classList.remove('active');
    document.body.classList.remove('about-open');
  };

  aboutLinks.forEach(link => {
    link.addEventListener('click', openOverlay);
  });

  closeBtn.addEventListener('click', closeOverlay);

  const bg = overlay.querySelector('.about-overlay-bg');
  if (bg) {
    bg.addEventListener('click', closeOverlay);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeOverlay();
    }
  });
}
