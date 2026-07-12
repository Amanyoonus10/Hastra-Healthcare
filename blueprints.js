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
