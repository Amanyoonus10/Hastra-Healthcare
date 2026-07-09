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
    initSurgeonTimeline();
  }

  // Interactive UI Components
  initNavbar();
  initHeroParallax();
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
  const canvas = document.getElementById('scroll-canvas');
  const video = document.getElementById('scroll-video');
  const fill = document.querySelector('.video-progress-fill');
  const overlay = document.querySelector('.scroll-indicator-overlay');
  const preloader = document.getElementById('video-preloader');
  const preloaderPct = document.getElementById('preloader-pct');
  
  if (!video || !canvas) return;

  const ctx = canvas.getContext('2d');
  const isMobile = window.matchMedia("(max-width: 768px)").matches || ('ontouchstart' in window);

  // Safari / iOS compatibility and rendering setup
  video.muted = true;
  video.playsInline = true;

  // Upscale canvas resolution to 4K (3840px width) on desktop and 1080px on mobile for razor-sharp rendering
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    const aspectRatio = rect.width / rect.height;
    const targetWidth = isMobile ? 1080 : 3840;
    
    canvas.width = targetWidth;
    canvas.height = Math.round(targetWidth / aspectRatio);
    drawCurrentFrame();
  };

  const drawCurrentFrame = () => {
    if (!video || video.readyState < 1) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // Calculate aspect ratio crop to emulate object-fit: cover
    const videoRatio = videoWidth / videoHeight;
    const canvasRatio = canvasWidth / canvasHeight;
    
    let sx, sy, sWidth, sHeight;
    
    if (canvasRatio > videoRatio) {
      sWidth = videoWidth;
      sHeight = videoWidth / canvasRatio;
      sx = 0;
      sy = (videoHeight - sHeight) / 2;
    } else {
      sHeight = videoHeight;
      sWidth = videoHeight * canvasRatio;
      sx = (videoWidth - sWidth) / 2;
      sy = 0;
    }
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
  };

  window.addEventListener('resize', resizeCanvas);
  video.addEventListener('seeked', drawCurrentFrame);

  // Fetch video as a blob to cache it locally and prevent Range Request network latency during scrub
  async function preloadVideo(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const contentLength = response.headers.get('content-length');
      if (!contentLength) {
        const blob = await response.blob();
        return blob;
      }
      
      const total = parseInt(contentLength, 10);
      let loaded = 0;
      
      const reader = response.body.getReader();
      const chunks = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        if (preloaderPct) {
          preloaderPct.textContent = `${Math.round((loaded / total) * 100)}%`;
        }
      }
      
      return new Blob(chunks, { type: 'video/mp4' });
    } catch (err) {
      console.warn("Blob preloader failed, falling back to direct stream: ", err);
      return null;
    }
  }

  const videoUrl = '/images/1783591836637753_smooth.mp4';
  
  preloadVideo(videoUrl).then(blob => {
    if (blob) {
      const blobUrl = URL.createObjectURL(blob);
      video.src = blobUrl;
    } else {
      video.src = videoUrl;
    }
    
    // Hide the loader once cached
    if (preloader) {
      preloader.classList.add('fade-out');
    }
    
    // Pre-render setup
    try {
      video.load();
      video.currentTime = 0.01;
      video.pause();
    } catch (e) {
      console.warn("Initial video pre-render ignored: ", e);
    }
    
    if (video.readyState >= 1) {
      resizeCanvas();
      startScrollTrigger();
    } else {
      video.addEventListener('loadedmetadata', () => {
        resizeCanvas();
        startScrollTrigger();
      });
    }
  });

  const startScrollTrigger = () => {
    const duration = video.duration && !isNaN(video.duration) ? video.duration : 10;
    
    // Use an interpolated dummy target via GSAP to handle scroll inertia cleanly
    const scrollObj = { progress: 0 };
    const scrubVal = isMobile ? 1.8 : 1.0; 

    gsap.to(scrollObj, {
      progress: 1,
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

    // Auto-throttled frame scrubbing:
    // Only update currentTime if the browser's decoder has completed the previous seek (not video.seeking).
    // This avoids piling up seek requests and eliminates stuttering on high-resolution video.
    const updateFrame = () => {
      const targetTime = scrollObj.progress * (duration - 0.05);
      
      if (!video.seeking && Math.abs(targetTime - video.currentTime) > 0.02) {
        video.currentTime = Math.max(0.01, Math.min(duration - 0.01, targetTime));
      }
      
      requestAnimationFrame(updateFrame);
    };
    requestAnimationFrame(updateFrame);

    // Fade in navbar when past intro scroll section
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
