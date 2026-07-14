/* ==========================================
   Hastra Healthcare - R&D & Blueprints Interactive Page Script
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // Register GSAP ScrollTrigger
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    initScrollAnimations();
  }

  // Initialize UI features
  initNavbar();
  initVideoPlayer();
  initMagneticButtons();
  initGlobalSearch();
});

/* Sticky Glass Navbar Toggle & Scroll Handle */
function initNavbar() {
  const toggleBtn = document.querySelector(".mobile-menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const nav = document.getElementById("main-nav");

  if (nav) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        nav.classList.add("scrolled");
      } else {
        // Keeps scrolled look on blueprints page since it starts active
        // but can add transition / tweak as needed.
      }
    });
  }

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      toggleBtn.classList.toggle("open");
    });

    // Close menu when links are clicked
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        toggleBtn.classList.remove("open");
      });
    });
  }
}

/* Magnetic Button Hover Effect */
function initMagneticButtons() {
  const magneticElements = document.querySelectorAll(".magnetic");

  magneticElements.forEach(el => {
    el.addEventListener("mousemove", (e) => {
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

    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });
    });
  });
}

/* GSAP Scroll Trigger Animations */
function initScrollAnimations() {
  // Staggered reveal for elements on scroll
  gsap.utils.toArray(".section-header, .pillar-card, .tech-blueprint-card, .cleanroom-left, .cleanroom-right").forEach(el => {
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

  // Hero section reveal animations
  gsap.from(".blueprints-hero-badge, .blueprints-hero-title, .blueprints-hero-desc", {
    y: 30,
    opacity: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out"
  });

  // Video container zoom in on scroll
  gsap.from(".video-player-container", {
    scale: 0.95,
    opacity: 0,
    duration: 1.2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".video-player-container",
      start: "top 85%"
    }
  });
}

/* Custom Interactive Video Player Controls */
function initVideoPlayer() {
  const video = document.getElementById("blueprints-video");
  const playerContainer = document.getElementById("blueprints-player");
  const bigPlayBtn = document.getElementById("big-play-btn");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const rewindBtn = document.getElementById("rewind-btn");
  const forwardBtn = document.getElementById("forward-btn");
  const muteBtn = document.getElementById("mute-btn");
  const volumeSlider = document.getElementById("volume-slider");
  const volumeSliderFill = document.getElementById("volume-slider-fill");
  const progressContainer = document.getElementById("video-progress-container");
  const progressBarFill = document.getElementById("video-progress-fill");
  const currentTimeDisplay = document.getElementById("current-time");
  const durationTimeDisplay = document.getElementById("duration-time");
  const fullscreenBtn = document.getElementById("fullscreen-btn");

  if (!video) return;

  let lastVolume = 1;
  video.volume = 1;
  if (volumeSliderFill) {
    volumeSliderFill.style.width = "100%";
  }

  // Update Lucide icon utility
  const updateIcon = (btn, iconName) => {
    if (btn) {
      btn.innerHTML = `<i data-lucide="${iconName}"></i>`;
      if (typeof lucide !== "undefined") {
        lucide.createIcons();
      }
    }
  };

  // Time format utility (e.g. 132 -> 2:12)
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Video duration load handle
  const updateDuration = () => {
    durationTimeDisplay.textContent = formatTime(video.duration);
  };

  if (video.readyState >= 1) {
    updateDuration();
  } else {
    video.addEventListener("loadedmetadata", updateDuration);
  }

  // Play and Pause Toggle
  const togglePlay = () => {
    if (video.paused) {
      video.play().then(() => {
        playerContainer.classList.add("is-playing");
        updateIcon(playPauseBtn, "pause");
      }).catch(err => console.error("Video play failed:", err));
    } else {
      video.pause();
      playerContainer.classList.remove("is-playing");
      updateIcon(playPauseBtn, "play");
    }
  };

  video.addEventListener("click", togglePlay);
  bigPlayBtn.addEventListener("click", togglePlay);
  playPauseBtn.addEventListener("click", togglePlay);

  // Time Update & Scrub Fill
  video.addEventListener("timeupdate", () => {
    if (video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      if (progressBarFill) {
        progressBarFill.style.width = `${pct}%`;
      }
      currentTimeDisplay.textContent = formatTime(video.currentTime);
    }
  });

  // Dragging and seeking timeline logic
  const seekVideo = (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = Math.max(0, Math.min(video.duration, pct * video.duration));
  };

  let isDraggingProgress = false;
  if (progressContainer) {
    progressContainer.addEventListener("mousedown", (e) => {
      isDraggingProgress = true;
      seekVideo(e);
    });

    window.addEventListener("mousemove", (e) => {
      if (isDraggingProgress) seekVideo(e);
    });

    window.addEventListener("mouseup", () => {
      isDraggingProgress = false;
    });
  }

  // Rewind & Fast Forward Buttons
  if (rewindBtn) {
    rewindBtn.addEventListener("click", () => {
      video.currentTime = Math.max(0, video.currentTime - 10);
    });
  }

  if (forwardBtn) {
    forwardBtn.addEventListener("click", () => {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
    });
  }

  // Volume slider and mute controls
  const toggleMute = () => {
    if (video.muted || video.volume === 0) {
      video.muted = false;
      video.volume = lastVolume > 0 ? lastVolume : 0.8;
      if (volumeSliderFill) {
        volumeSliderFill.style.width = `${video.volume * 100}%`;
      }
      updateIcon(muteBtn, "volume-2");
    } else {
      lastVolume = video.volume;
      video.muted = true;
      if (volumeSliderFill) {
        volumeSliderFill.style.width = "0%";
      }
      updateIcon(muteBtn, "volume-x");
    }
  };

  if (muteBtn) {
    muteBtn.addEventListener("click", toggleMute);
  }

  const setVolume = (e) => {
    const rect = volumeSlider.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const vol = Math.max(0, Math.min(1, pct));
    video.volume = vol;
    video.muted = false;
    if (volumeSliderFill) {
      volumeSliderFill.style.width = `${vol * 100}%`;
    }
    
    if (vol === 0) {
      updateIcon(muteBtn, "volume-x");
    } else if (vol < 0.5) {
      updateIcon(muteBtn, "volume-1");
    } else {
      updateIcon(muteBtn, "volume-2");
    }
  };

  let isDraggingVolume = false;
  if (volumeSlider) {
    volumeSlider.addEventListener("mousedown", (e) => {
      isDraggingVolume = true;
      setVolume(e);
    });

    window.addEventListener("mousemove", (e) => {
      if (isDraggingVolume) setVolume(e);
    });

    window.addEventListener("mouseup", () => {
      isDraggingVolume = false;
    });
  }

  // Fullscreen implementation
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().then(() => updateIcon(fullscreenBtn, "maximize"));
      } else {
        playerContainer.requestFullscreen()
          .then(() => updateIcon(fullscreenBtn, "minimize"))
          .catch(err => console.error("Error attempting fullscreen:", err));
      }
    });

    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        updateIcon(fullscreenBtn, "minimize");
      } else {
        updateIcon(fullscreenBtn, "maximize");
      }
    });
  }

  // Auto-hiding control controls overlay
  let hideControlsTimeout;
  const showControlsTemporarily = () => {
    playerContainer.classList.add("show-controls");
    clearTimeout(hideControlsTimeout);
    if (!video.paused) {
      hideControlsTimeout = setTimeout(() => {
        playerContainer.classList.remove("show-controls");
      }, 3000);
    }
  };

  playerContainer.addEventListener("mousemove", showControlsTemporarily);
  playerContainer.addEventListener("mouseleave", () => {
    if (!video.paused) {
      playerContainer.classList.remove("show-controls");
    }
  });

  video.addEventListener("play", showControlsTemporarily);
  video.addEventListener("pause", () => {
    playerContainer.classList.add("show-controls");
    clearTimeout(hideControlsTimeout);
  });
}

/* Premium Global Search Feature with dynamically generated UI */
function initGlobalSearch() {
  const triggers = document.querySelectorAll('.search-trigger');
  if (triggers.length === 0) return;

  // 1. Inject Search Overlay into DOM dynamically if not exists
  let overlay = document.getElementById('search-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.className = 'search-overlay';
    overlay.innerHTML = `
      <button class="search-close-btn" id="search-close" aria-label="Close search">
        <i data-lucide="x"></i>
      </button>
      <div class="search-container">
        <div class="search-input-wrapper">
          <i data-lucide="search" class="search-input-icon"></i>
          <input type="text" id="search-input" placeholder="Search Hastra Healthcare..." autocomplete="off">
        </div>
        <div class="search-results" id="search-results"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  const closeBtn = document.getElementById('search-close');
  const input = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');

  // Search Index Data
  const searchIndex = [
    // Products
    { title: 'Vacuum-Assisted Delivery Device', desc: 'Premium obstetric delivery system (H-VADD-01).', url: '/product-portfolio.html#h-vadd-01', category: 'Product', icon: 'package' },
    { title: 'Cervical Ripening Balloon', desc: 'Double-balloon catheter for mechanical ripener (H-CRB-03).', url: '/product-portfolio.html#h-crb-03', category: 'Product', icon: 'package' },
    { title: 'Uterine Manipulator Device', desc: 'Adjustable angles for minimally invasive laparoscopic care (H-UMA-05).', url: '/product-portfolio.html#h-uma-05', category: 'Product', icon: 'package' },
    { title: 'Obstetric & Gynaecology Consumables', desc: 'Disposable speculums, retractors, and loops.', url: '/product-portfolio.html#general-medical-card', category: 'Product', icon: 'package' },
    // Landing Sections
    { title: 'About Hastra Healthcare', desc: 'OEM brand purpose, corporate updates, and vision.', url: '/index.html#about', category: 'Section', icon: 'info' },
    { title: 'Clinical Specialities & Facilities', desc: 'Sterile cleanrooms, CDSCO, and regulatory registrations.', url: '/index.html#specialties', category: 'Section', icon: 'shield' },
    { title: 'Surgeon Journey & Clinical Feedback', desc: 'Milestones, surgeon trials, and commercial network rollouts.', url: '/index.html#surgeon-journey', category: 'Section', icon: 'git-commit' },
    { title: 'Ethics & Compliance', desc: 'ISO 13485 audits, cleanroom classifications, and clinical standards.', url: '/index.html#ethics', category: 'Section', icon: 'heart' },
    { title: 'News Room & Corporate Announcements', desc: 'Tender updates, global exports, and milestones.', url: '/index.html#news', category: 'Section', icon: 'file-text' },
    { title: 'Contact & Support Team', desc: 'Reach out to partner, distribute, or request documentation.', url: '/contact.html', category: 'Contact', icon: 'mail' },
    { title: 'R&D / CAD Blueprints', desc: 'Technical specifications, patents, and engineering schematics.', url: '/blueprints.html', category: 'Research', icon: 'layout' }
  ];

  const openSearch = () => {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
    setTimeout(() => {
      if (input) input.focus();
    }, 100);
  };

  const closeSearch = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Unlock background scroll
    if (input) input.value = '';
    if (resultsContainer) resultsContainer.innerHTML = '';
  };

  // Event Listeners
  triggers.forEach(btn => btn.addEventListener('click', openSearch));
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });

  // Handle Search Queries
  if (input && resultsContainer) {
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        resultsContainer.innerHTML = '';
        return;
      }

      // Filter matches
      const matches = searchIndex.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.desc.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );

      // Render results
      if (matches.length > 0) {
        resultsContainer.innerHTML = matches.map(item => `
          <a href="${item.url}" class="search-result-item">
            <div class="search-result-icon">
              <i data-lucide="${item.icon}"></i>
            </div>
            <div class="search-result-content">
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
            </div>
            <span class="search-result-category">${item.category}</span>
          </a>
        `).join('');
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
        
        // Setup click listener to close search overlay when link clicked
        resultsContainer.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', closeSearch);
        });
      } else {
        resultsContainer.innerHTML = `
          <div class="search-no-results">
            <i data-lucide="frown"></i>
            <p>No results found for "${query}"</p>
          </div>
        `;
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      }
    });
  }

  // Keyboard Shortcuts (Cmd+K / Ctrl+K to open, Esc to close)
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') {
      closeSearch();
    }
  });
}
