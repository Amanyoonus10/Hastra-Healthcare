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
  initAboutTabs();
  initAdminUploadPanel();
  loadDynamicNewsAndGallery();
  initConductAccordion();
  initProductCardClicks();
  initLazyVideos();
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
      ease: "none",
      scrollTrigger: {
        trigger: journeySection,
        start: "top 65%",
        end: "bottom 35%",
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const isMobileLayout = window.innerWidth <= 768;
          if (isMobileLayout) {
            progressLine.style.height = `${progress * 100}%`;
            progressLine.style.width = '100%';
          } else {
            progressLine.style.width = `${progress * 100}%`;
            progressLine.style.height = '100%';
          }
          
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

/* Interactive About Tabs Logic */
function initAboutTabs() {
  const tabsContainer = document.querySelector('.about-tabs');
  if (!tabsContainer) return;

  const buttons = tabsContainer.querySelectorAll('.about-tab-btn');
  const contents = document.querySelectorAll('.about-tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(`tab-${targetTab}`);
      if (activeContent) {
        activeContent.classList.add('active');
      }

      // Re-create icons in active tab in case any SVG icon wasn't rendered
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  });
}

/* Admin Media Upload Panel & Form Handler */
function initAdminUploadPanel() {
  const trigger = document.getElementById('admin-upload-trigger');
  const overlay = document.getElementById('admin-upload-overlay');
  const closeBtn = document.getElementById('admin-upload-close');
  const form = document.getElementById('admin-upload-form');
  const itemType = document.getElementById('item-type');
  const groupCategory = document.getElementById('group-category');

  if (!trigger || !overlay || !closeBtn || !form) return;

  // Toggle item-category visibility depending on select type
  if (itemType && groupCategory) {
    itemType.addEventListener('change', () => {
      if (itemType.value === 'gallery') {
        groupCategory.style.display = 'none';
      } else {
        groupCategory.style.display = 'block';
      }
    });
  }

  trigger.addEventListener('click', () => {
    overlay.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const type = itemType.value;
    const title = document.getElementById('item-title').value;
    const category = type === 'news' ? document.getElementById('item-category').value : '';
    const date = document.getElementById('item-date').value;
    const desc = document.getElementById('item-desc').value;
    const fileInput = document.getElementById('item-image');

    const saveItem = (imageSrc) => {
      const items = JSON.parse(localStorage.getItem('hastra_uploaded_items') || '[]');
      const newItem = {
        id: Date.now(),
        type,
        title,
        category,
        date,
        desc,
        image: imageSrc || '/images/cleanroom_facility_premium.png'
      };

      items.push(newItem);
      localStorage.setItem('hastra_uploaded_items', JSON.stringify(items));
      
      // Close overlay and reset form
      overlay.classList.remove('active');
      form.reset();
      
      // Reload lists
      loadDynamicNewsAndGallery();

      // Show temporary alert
      alert('Successfully published announcement to the website! (Stored locally in browser)');
    };

    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        saveItem(event.target.result);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      saveItem(null);
    }
  });
}

/* Load & Render News / Gallery Dynamically */
function loadDynamicNewsAndGallery() {
  const newsGrid = document.getElementById('news-grid-container');
  const galleryGrid = document.getElementById('gallery-grid-container');

  if (!newsGrid || !galleryGrid) return;

  // Initial News Data
  const defaultNews = [
    {
      type: 'news',
      title: 'Hastra Healthcare Incorporated — Commercial Launch Commenced',
      category: 'Launch · 2026',
      date: 'Recent',
      desc: 'CDSCO licence applications filed for all products. GEM portal registered. Sub-dealer network activation underway across South and West India.',
      image: '/images/news_insufflator.png'
    },
    {
      type: 'news',
      title: 'Middle East & Africa Distributor Programme Launched',
      category: '🌍 Export · 2026',
      date: 'Scheduled',
      desc: 'Distributor agreements signed with UAE (MOHAP channel) and Nigeria (NAFDAC-registered distributor). First export shipment planned Month 5–6 of Year 1.',
      image: '/images/news_iso.png'
    },
    {
      type: 'news',
      title: 'Year 1 CME Programme — 8 Regional Events Planned',
      category: '🎓 Education · 2026',
      date: 'Year 1',
      desc: 'Clinical education programme for obstetricians and laparoscopic gynaecologists. South India focus: Kerala, Tamil Nadu, Telangana. AICOG and ISAR conference presence confirmed.',
      image: '/images/news_training.jpg'
    },
    {
      type: 'news',
      title: 'Government Tender Programme — GEM & CMSS Registration',
      category: '📋 Regulatory · 2026',
      date: 'Tenders',
      desc: "Hastra's OEM obstetric products registered on GEM portal and CMSS. State Rate Contract tender filing initiated in UP, Bihar, and Odisha. First tender award expected Month 9–12.",
      image: '/images/cleanroom_facility_premium.png'
    },
    {
      type: 'news',
      title: 'New OEM Gynaecology Products — Coming Soon',
      category: '🔬 Product · Pipeline',
      date: 'Coming Soon',
      desc: "Hastra Healthcare's OEM gynaecology product portfolio is in pre-launch preparation. Products and full details will be announced on launch. Register your interest via the Contact page.",
      image: '/images/about_precision_facility.png'
    },
    {
      type: 'news',
      title: 'Sub-dealer Network — South India Activation',
      category: '🏆 Milestone · 2026',
      date: 'Active',
      desc: 'First 15 sub-dealers signed in Kerala, Tamil Nadu, and Telangana. Network anchor: IVF clinic clusters in Bangalore, Chennai, and Hyderabad. Target: 70 active sub-dealers by Month 10.',
      image: '/images/milestone_2026.jpg'
    }
  ];

  // Initial Gallery Data
  const defaultGallery = [
    {
      type: 'gallery',
      title: 'Advanced Cleanroom Production',
      date: 'ISO 13485 sterile assembly lines',
      image: '/images/cleanroom_facility_premium.png'
    },
    {
      type: 'gallery',
      title: 'Inspection & Monitoring',
      date: 'Testing laboratory calibrations',
      image: '/images/about_precision_facility.png'
    },
    {
      type: 'gallery',
      title: 'CME Event & Lectures',
      date: 'Clinical education seminars, South India',
      image: '/images/news_training.jpg'
    },
    {
      type: 'gallery',
      title: 'Commercial Network Rollout',
      date: 'Launch of distributor activations',
      image: '/images/news_insufflator.png'
    }
  ];

  // Retrieve user uploaded items from localStorage
  const customItems = JSON.parse(localStorage.getItem('hastra_uploaded_items') || '[]');

  // Separate custom news and gallery
  const customNews = customItems.filter(item => item.type === 'news');
  const customGallery = customItems.filter(item => item.type === 'gallery');

  // Merge default list with custom list (newly added first)
  const allNews = [...customNews, ...defaultNews];
  const allGallery = [...customGallery, ...defaultGallery];

  // Render News
  newsGrid.innerHTML = allNews.map(item => `
    <div class="news-card glass-card">
      <div class="news-card-image-wrapper">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="news-card-content">
        <div class="news-card-badge-row">
          <span class="news-category-badge">${item.category || 'News'}</span>
          <span class="news-date">${item.date}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
      </div>
    </div>
  `).join('');

  // Render Gallery
  galleryGrid.innerHTML = allGallery.map(item => `
    <div class="gallery-card glass-card">
      <div class="gallery-img-box">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="gallery-desc">
        <h4>${item.title}</h4>
        <p>${item.date || item.desc}</p>
      </div>
    </div>
  `).join('');

  // Refresh Lucide icons in case any are inside dynamic components
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* Init Conduct Accordion Click Handler */
function initConductAccordion() {
  const items = document.querySelectorAll('.conduct-row-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      // Close other active accordions when opening one (exclusive search)
      items.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      item.classList.toggle('active');
    });
  });
}

// Client-side PDF generator for Hastra Ethics & Business Conduct Pledge
window.downloadEthicsPledge = function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Background light tint
  doc.setFillColor(250, 250, 250);
  doc.rect(0, 0, 210, 297, "F");
  
  // Outer Borders
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(10, 10, 190, 277);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, 186, 273);
  
  // Title / Brand Headers
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text("HASTRA HEALTHCARE", 105, 35, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("INTEGRITY · QUALITY · TRANSPARENCY", 105, 42, { align: "center" });
  
  // Separator rule
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(40, 48, 170, 48);
  
  // Title of the Document
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("CODE OF ETHICS & BUSINESS CONDUCT", 105, 60, { align: "center" });
  
  // The Hastra Pledge Banner (Black Box)
  doc.setFillColor(0, 0, 0);
  doc.rect(20, 70, 170, 45, "F");
  
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  const pledgeText = "We exist to give every obstetrician a fair, transparent hospital the same quality clinical tools that are available in a private hospital in Mumbai. If Hastra ever has to choose between margin and patient safety, patient safety wins. Every time. Without exception. This is not a policy—it is who we are.";
  const splitPledge = doc.splitTextToSize(pledgeText, 150);
  doc.text(splitPledge, 30, 82, { align: "left" });
  
  // Pillars Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Core Business Conduct Guidelines", 25, 132);
  
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(25, 136, 185, 136);
  
  // Conduct Items
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. Regulatory Compliance (Zero Shortcuts)", 25, 146);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("All medical products are fully registered under CDSCO before any commercial activities.", 25, 152);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("2. Sub-dealer & Partner Commitments", 25, 164);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("All dealer agreements are structured transparently with clear timelines and commissions.", 25, 170);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("3. Anti-Bribery & Anti-Corruption Policy", 25, 182);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("Zero facilitation payments. We enforce strict adherence to clean commercial practices.", 25, 188);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("4. Supply Chain Ethics", 25, 200);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("Transparent sourcing, labour compliance, and environment-friendly manufacturing.", 25, 206);
  
  // Footer board block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("HASTRA HEALTH Board of Directors", 105, 245, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Issued under corporate compliance policies · 2026", 105, 252, { align: "center" });
  
  doc.save("Hastra_Healthcare_Ethics_Pledge.pdf");
};

// Make product cards fully clickable and enrich WhatsApp URLs on load
function initProductCardClicks() {
  const cards = document.querySelectorAll('.featured-product-card, .product-card-premium');
  cards.forEach(card => {
    const linkElement = card.querySelector('a[href^="https://wa.me"]');
    if (linkElement) {
      try {
        const originalUrl = new URL(linkElement.href);
        const params = new URLSearchParams(originalUrl.search);
        const text = params.get('text') || "Hello Hastra Healthcare";
        
        // Parse REF to construct deep link
        let refId = '';
        const refMatch = text.match(/REF:\s*([A-Z0-9-]+)/i);
        if (refMatch) {
          refId = refMatch[1].toLowerCase();
        }
        const productPageUrl = refId ? `${window.location.origin}/product-portfolio.html#${refId}` : `${window.location.origin}/product-portfolio.html`;
        
        // Get image URL
        const imgElement = card.querySelector('img');
        const imgUrl = imgElement ? new URL(imgElement.getAttribute('src'), window.location.origin).href : '';
        
        // Enrich message text
        const newText = `${text}\n\nProduct Link: ${productPageUrl}\nProduct Image: ${imgUrl}`;
        linkElement.href = `https://wa.me/919745621855?text=${encodeURIComponent(newText)}`;
      } catch (err) {
        console.error("Error enriching WhatsApp link:", err);
      }
    }

    card.addEventListener('click', (e) => {
      // If the clicked element is already a link or inside a link/button, let it handle naturally
      if (e.target.closest('a') || e.target.closest('button')) {
        return;
      }
      const link = card.querySelector('a[href^="https://wa.me"]');
      if (link) {
        window.open(link.href, '_blank');
      }
    });
  });
}

// Lazy load below-the-fold videos using IntersectionObserver
function initLazyVideos() {
  const lazyVideos = document.querySelectorAll('video.lazy-video');
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          const sources = video.querySelectorAll('source');
          sources.forEach(source => {
            source.src = source.dataset.src;
          });
          video.load();
          video.classList.remove('lazy-video');
          videoObserver.unobserve(video);
        }
      });
    }, {
      rootMargin: "300px" // Start loading 300px before they come into view
    });

    lazyVideos.forEach(video => {
      videoObserver.observe(video);
    });
  } else {
    // Fallback if IntersectionObserver is not supported
    lazyVideos.forEach(video => {
      const sources = video.querySelectorAll('source');
      sources.forEach(source => {
        source.src = source.dataset.src;
      });
      video.load();
    });
  }
}

