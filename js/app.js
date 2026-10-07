/**
 * Neo Digital Studio - Master Wedding Invitation Engine
 * Supports Multi-Tenant Slug Routing, Template Themes,
 * RSVP Submissions, Sharing, Lightbox, Audio, and Canvas Petals.
 */

(function () {
  'use strict';

  // --- 1. SLUG ROUTING & WEDDING LOADER ---
  function getActiveWeddingSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('wedding')) {
      return urlParams.get('wedding').toLowerCase();
    }
    const pathMatch = window.location.pathname.match(/\/wedding\/([a-z0-9-]+)/i);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1].toLowerCase();
    }
    const hashMatch = window.location.hash.match(/wedding=([a-z0-9-]+)/i);
    if (hashMatch && hashMatch[1]) {
      return hashMatch[1].toLowerCase();
    }
    return 'siddharth-kiara'; // Default flagship wedding
  }

  const currentSlug = getActiveWeddingSlug();
  let currentWedding = null;

  function loadActiveWedding() {
    if (window.NeoDB) {
      currentWedding = window.NeoDB.getWeddingBySlug(currentSlug);
      window.NeoDB.incrementViewCount(currentSlug);
    }

    if (!currentWedding) {
      currentWedding = {
        slug: 'siddharth-kiara',
        templateId: 'royal-red',
        data: window.weddingDataDefault || {}
      };
    }

    // Apply template theme
    const themeId = currentWedding.templateId || 'royal-red';
    document.body.setAttribute('data-theme', themeId);

    return currentWedding;
  }

  function getWeddingPayload() {
    if (currentWedding && currentWedding.data) {
      return currentWedding.data;
    }
    return window.weddingDataDefault || {};
  }

  // --- TOAST NOTIFICATION UTILITY ---
  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // --- AUDIO SYSTEM (Tanpura Drone Synthesizer + MP3 Fallback) ---
  class LuxuryAudioEngine {
    constructor() {
      this.isPlaying = false;
      this.audioCtx = null;
      this.gainNode = null;
      this.intervalId = null;
      // Bind to declarative audio element in HTML or create fallback
      this.audioElement = document.getElementById('weddingBgAudio') || new Audio('assets/wedding_music.mp3');
      this.audioElement.loop = true;
      this.audioElement.preload = 'auto';
      this.audioElement.volume = 1.0; // Play at full clear volume immediately
      this.hasCustomMp3 = true;
      this._interactionBound = false;
      this.onStateChange = null;

      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
        if (this.onStateChange) this.onStateChange(true);
      });

      this.audioElement.addEventListener('pause', () => {
        this.isPlaying = false;
        if (this.onStateChange) this.onStateChange(false);
      });

      this.audioElement.addEventListener('error', (err) => {
        console.warn('assets/wedding_music.mp3 error, falling back to drone synthesizer', err);
        this.hasCustomMp3 = false;
        if (this.isPlaying) {
          this.startWebAudioDrone();
        }
      });
    }

    initWebAudio() {
      if (this.audioCtx) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.audioCtx = new AudioContext();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);
    }

    playTanpuraNote(freq, startTime, duration, type = 'sine', gainVal = 0.05) {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, startTime);

      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.linearRampToValueAtTime(gainVal, startTime + duration * 0.25);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(startTime);
      osc.stop(startTime + duration);
    }

    startWebAudioDrone() {
      this.initWebAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0.4, this.audioCtx.currentTime + 2.0);

      const rootSa = 138.59;
      const pa = 207.65;
      const highSa = 277.18;
      const ga = 174.61;

      const playDroneCycle = () => {
        if (!this.isPlaying || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        this.playTanpuraNote(pa, now + 0.0, 4.0, 'triangle', 0.07);
        this.playTanpuraNote(highSa, now + 1.2, 3.8, 'sine', 0.06);
        this.playTanpuraNote(highSa, now + 2.4, 3.8, 'sine', 0.06);
        this.playTanpuraNote(rootSa, now + 3.6, 5.0, 'triangle', 0.09);
        this.playTanpuraNote(ga, now + 4.8, 4.2, 'sine', 0.05);
      };

      playDroneCycle();
      this.intervalId = setInterval(playDroneCycle, 5800);
    }

    stopWebAudio() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      if (this.audioCtx && this.gainNode) {
        this.gainNode.gain.cancelScheduledValues(this.audioCtx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.8);
      }
    }

    // Attach listeners on every possible user gesture so audio starts on the absolute first touch/click
    bindInteractionUnlock() {
      if (this._interactionBound) return;
      this._interactionBound = true;

      const gestureEvents = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'click', 'keydown'];
      const triggerUnlock = () => {
        this.play().then((started) => {
          if (started) {
            // Audio unlocked! Remove gesture listeners
            gestureEvents.forEach((evt) => {
              window.removeEventListener(evt, triggerUnlock, true);
              document.removeEventListener(evt, triggerUnlock, true);
            });
            this._interactionBound = false;
          }
        });
      };

      gestureEvents.forEach((evt) => {
        window.addEventListener(evt, triggerUnlock, { capture: true, passive: true });
        document.addEventListener(evt, triggerUnlock, { capture: true, passive: true });
      });
    }

    play() {
      this.isPlaying = true;
      this.stopWebAudio();
      this.audioElement.volume = 1.0;

      const promise = this.audioElement.play();
      if (promise !== undefined && promise.then) {
        return promise.then(() => {
          this.hasCustomMp3 = true;
          this.isPlaying = true;
          if (this.onStateChange) this.onStateChange(true);
          return true;
        }).catch((err) => {
          console.log('Audio autoplay prevented by browser policy, waiting for first interaction:', err);
          this.isPlaying = false;
          if (this.onStateChange) this.onStateChange(false);
          this.bindInteractionUnlock();
          return false;
        });
      }
      return Promise.resolve(false);
    }

    pause() {
      this.isPlaying = false;
      if (this.hasCustomMp3) {
        this.audioElement.pause();
      }
      this.stopWebAudio();
      if (this.onStateChange) this.onStateChange(false);
    }

    toggle() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
      return this.isPlaying;
    }
  }

  // --- FLOATING PETALS & PARTICLES CANVAS WITH CELEBRATORY BURST ---
  let triggerPetalsBlast = null;

  function initPetalsCanvas() {
    const canvas = document.getElementById('petalsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const ambientParticles = [];
    const count = 38;

    const ambientColors = [
      { r: 212, g: 175, b: 55, a: 0.35, isGold: true },
      { r: 195, g: 40, b: 65, a: 0.28, isPetal: true },
      { r: 235, g: 120, b: 35, a: 0.24, isPetal: true },
      { r: 245, g: 215, b: 125, a: 0.32, isGold: true }
    ];

    for (let i = 0; i < count; i++) {
      ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 3,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: Math.random() * 0.5 - 0.25,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 1.2,
        color: ambientColors[Math.floor(Math.random() * ambientColors.length)],
        oscillation: Math.random() * Math.PI * 2
      });
    }

    // Celebratory Blast Particles
    const blastParticles = [];

    const blastColors = [
      // Deep Velvet Royal Rose Petals
      { r: 188, g: 24, b: 48, isPetal: true, type: 'rose' },
      { r: 216, g: 38, b: 68, isPetal: true, type: 'rose' },
      { r: 148, g: 16, b: 36, isPetal: true, type: 'rose' },
      { r: 232, g: 58, b: 88, isPetal: true, type: 'rose' },
      // Saffron / Marigold Festive Petals
      { r: 245, g: 145, b: 25, isPetal: true, type: 'marigold' },
      { r: 255, g: 185, b: 35, isPetal: true, type: 'marigold' },
      { r: 235, g: 105, b: 20, isPetal: true, type: 'marigold' },
      // Shimmering Antique Gold Flakes & Sequins
      { r: 248, g: 220, b: 130, isGold: true, type: 'gold' },
      { r: 212, g: 175, b: 55, isGold: true, type: 'gold' },
      { r: 255, g: 238, b: 175, isGold: true, type: 'gold' }
    ];

    triggerPetalsBlast = function (originX, originY) {
      const centerX = originX || width / 2;
      const centerY = originY || height / 2;

      function spawnBatch(num, speedMultiplier, yBias) {
        for (let i = 0; i < num; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (Math.random() * 16 + 6) * speedMultiplier;
          const vx = Math.cos(angle) * speed;
          // Upward celebratory launch
          const vy = Math.sin(angle) * speed * 0.85 - (Math.random() * 9 + 4);

          const color = blastColors[Math.floor(Math.random() * blastColors.length)];
          const size = color.isGold ? (Math.random() * 5 + 3) : (Math.random() * 13 + 8);

          blastParticles.push({
            x: centerX + (Math.random() - 0.5) * 40,
            y: centerY + yBias + (Math.random() - 0.5) * 20,
            vx: vx,
            vy: vy,
            friction: 0.958,
            gravity: color.isGold ? 0.26 : 0.16,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 7,
            flutterAngle: Math.random() * Math.PI * 2,
            flutterSpeed: Math.random() * 0.08 + 0.03,
            size: size,
            color: color,
            alpha: 1.0,
            decay: Math.random() * 0.0035 + 0.0022,
            wobbleSpeed: Math.random() * 2 + 1.2
          });
        }
      }

      // Wave 1: Immediate explosive burst
      spawnBatch(140, 1.0, 0);

      // Wave 2: Saffron & Rose bloom wave
      setTimeout(() => {
        spawnBatch(80, 0.85, -30);
      }, 200);

      // Wave 3: Golden sparkle shimmer wave as gates open
      setTimeout(() => {
        spawnBatch(50, 0.7, -60);
      }, 450);
    };

    window.triggerPetalsBlast = triggerPetalsBlast;

    function render() {
      ctx.clearRect(0, 0, width, height);

      // 1. Ambient gentle background drift
      ambientParticles.forEach((p) => {
        p.y += p.speedY;
        p.oscillation += 0.02;
        p.x += Math.sin(p.oscillation) * 0.6 + p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.color.isPetal) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.color.a})`;
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.color.a})`;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
          ctx.shadowBlur = 6;
          ctx.fill();
        }

        ctx.restore();
      });

      // 2. Celebratory explosion petals & golden sparkles
      for (let i = blastParticles.length - 1; i >= 0; i--) {
        const p = blastParticles[i];

        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;

        p.flutterAngle += p.flutterSpeed;
        p.x += p.vx + Math.sin(p.flutterAngle) * (p.color.isGold ? 0.6 : 2.0);
        p.y += p.vy;

        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > height + 60) {
          blastParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        // Realistic 3D tumbling fluttering scale
        const scaleX = Math.cos(p.flutterAngle * p.wobbleSpeed);
        const scaleY = Math.sin(p.flutterAngle * 1.3) * 0.25 + 0.75;
        ctx.scale(scaleX, scaleY);

        if (p.color.isPetal) {
          // Organic curved rose/marigold petal shape
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.9, -p.size * 0.6, p.size * 0.8, p.size * 0.8, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.8, -p.size * 0.9, -p.size * 0.6, 0, -p.size);
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha * 0.92})`;
          ctx.fill();

          // Subtle center petal rib highlight
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 235, 185, ${p.alpha * 0.25})`;
          ctx.lineWidth = 0.9;
          ctx.moveTo(0, -p.size * 0.7);
          ctx.lineTo(0, p.size * 0.7);
          ctx.stroke();
        } else {
          // Sparkling gold sequin / flake
          ctx.beginPath();
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.7)';
          ctx.shadowBlur = 8;
          ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.fill();
        }

        ctx.restore();
      }

      requestAnimationFrame(render);
    }

    render();
  }

  // --- SVG ICON PROVIDER FOR RITUALS ---
  function getGoldIconSvg(type) {
    switch (type) {
      case 'haldi':
        return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#ffd966"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#d4af37" stroke-width="2"/></svg>`;
      case 'music':
      case 'sangeet':
        return `<svg viewBox="0 0 24 24"><path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" fill="currentColor"/></svg>`;
      case 'vivah':
      case 'mandap':
        return `<svg viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="currentColor"/></svg>`;
      case 'ring':
        return `<svg viewBox="0 0 24 24"><circle cx="12" cy="14" r="7" stroke="currentColor" stroke-width="2" fill="none"/><polygon points="12,3 15,7 9,7" fill="#ffd966"/></svg>`;
      case 'celebration':
        return `<svg viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" fill="currentColor"/></svg>`;
      case 'heart':
        return `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>`;
      case 'om':
      default:
        return `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm1-5.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" fill="currentColor"/></svg>`;
    }
  }

  // --- 4. RENDER CELEBRATION SCHEDULE ---
  function renderEventsSchedule(data) {
    const container = document.getElementById('eventsScheduleGrid');
    if (!container) return;

    const events = (data.eventsSection && data.eventsSection.events) || [];
    container.innerHTML = '';

    events.forEach((evt, idx) => {
      const card = document.createElement('article');
      card.className = `event-luxury-card reveal-on-scroll delay-${(idx % 3) + 1}`;
      
      const directionsBtn = evt.directionsUrl 
        ? `<a href="${evt.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn-event-directions">
             <span>GET DIRECTIONS →</span>
           </a>`
        : '';

      const mapsBtn = evt.mapsUrl
        ? `<a href="${evt.mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-event-directions" style="background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.4);">
             <span>VIEW MAP</span>
           </a>`
        : '';

      card.innerHTML = `
        <div class="event-card-header">
          <span class="event-category-badge">${evt.category || 'CEREMONY'}</span>
          <div class="event-gold-icon">
            ${getGoldIconSvg(evt.icon || 'vivah')}
          </div>
        </div>

        <h3 class="event-card-title">${evt.title}</h3>
        <p class="event-card-desc">${evt.description}</p>

        <div class="event-card-meta">
          <div class="event-meta-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>${evt.date}</span>
          </div>

          <div class="event-meta-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>${evt.time}</span>
          </div>

          <div class="event-meta-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="event-meta-venue">${evt.venue}</span>
          </div>
        </div>

        <div class="event-card-actions">
          ${directionsBtn}
          ${mapsBtn}
        </div>
      `;

      container.appendChild(card);
    });
  }

  // --- 5. SACRED MUHURAT COUNTDOWN ---
  let countdownTimerId = null;

  function initCountdown(targetIso) {
    if (countdownTimerId) clearInterval(countdownTimerId);

    const targetDate = new Date(targetIso || '2026-10-12T10:30:00+05:30').getTime();

    const hDaysEl = document.getElementById('countDays');
    const hHoursEl = document.getElementById('countHours');
    const hMinsEl = document.getElementById('countMins');
    const hSecsEl = document.getElementById('countSecs');

    const mDaysEl = document.getElementById('muhuratDays');
    const mHoursEl = document.getElementById('muhuratHours');
    const mMinsEl = document.getElementById('muhuratMinutes');
    const mSecsEl = document.getElementById('muhuratSeconds');

    const liveBoxesEl = document.getElementById('muhuratLiveBoxes');
    const completedBannerEl = document.getElementById('muhuratCompletedBanner');

    function update() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        if (liveBoxesEl) liveBoxesEl.style.display = 'none';
        if (completedBannerEl) completedBannerEl.style.display = 'block';

        const zero = '00';
        if (hDaysEl) hDaysEl.innerText = zero;
        if (hHoursEl) hHoursEl.innerText = zero;
        if (hMinsEl) hMinsEl.innerText = zero;
        if (hSecsEl) hSecsEl.innerText = zero;
        return;
      }

      if (liveBoxesEl) liveBoxesEl.style.display = 'flex';
      if (completedBannerEl) completedBannerEl.style.display = 'none';

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const dStr = String(days).padStart(2, '0');
      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');

      if (hDaysEl) hDaysEl.innerText = dStr;
      if (hHoursEl) hHoursEl.innerText = hStr;
      if (hMinsEl) hMinsEl.innerText = mStr;
      if (hSecsEl) hSecsEl.innerText = sStr;

      if (mDaysEl) mDaysEl.innerText = dStr;
      if (mHoursEl) mHoursEl.innerText = hStr;
      if (mMinsEl) mMinsEl.innerText = mStr;
      if (mSecsEl) mSecsEl.innerText = sStr;
    }

    update();
    countdownTimerId = setInterval(update, 1000);
  }

  // --- 6. PHOTO GALLERY & LIGHTBOX ---
  let currentGalleryIndex = 0;
  let currentGalleryList = [];

  function openLightbox(index) {
    if (!currentGalleryList.length) return;
    currentGalleryIndex = (index + currentGalleryList.length) % currentGalleryList.length;
    const item = currentGalleryList[currentGalleryIndex];

    const modal = document.getElementById('lightboxModal');
    const imgEl = document.getElementById('lightboxImg');
    const titleEl = document.getElementById('lightboxTitle');
    const captionEl = document.getElementById('lightboxCaption');
    const counterEl = document.getElementById('lightboxCounter');

    if (imgEl) imgEl.src = item.url;
    if (titleEl) titleEl.innerText = item.title || '';
    if (captionEl) captionEl.innerText = item.caption || '';
    if (counterEl) {
      counterEl.innerText = `${String(currentGalleryIndex + 1).padStart(2, '0')} / ${String(currentGalleryList.length).padStart(2, '0')}`;
    }

    if (modal) modal.classList.add('active');
  }

  function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) modal.classList.remove('active');
  }

  function nextLightbox() {
    openLightbox(currentGalleryIndex + 1);
  }

  function prevLightbox() {
    openLightbox(currentGalleryIndex - 1);
  }

  function renderPhotoGallery(data) {
    const container = document.getElementById('galleryGrid');
    if (!container) return;

    currentGalleryList = (data.gallery && data.gallery.photos) || [];
    container.innerHTML = '';

    currentGalleryList.forEach((photo, idx) => {
      const item = document.createElement('div');
      item.className = `gallery-item ratio-${photo.ratio || 'portrait'} reveal-on-scroll delay-${(idx % 3) + 1}`;
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `View photo: ${photo.title || 'Wedding memory'}`);

      item.innerHTML = `
        <img src="${photo.url}" alt="${photo.title || 'Wedding Photo'}" loading="lazy">
        <div class="gallery-item-overlay">
          <h4 class="gallery-item-title">${photo.title || ''}</h4>
          <p class="gallery-item-caption">${photo.caption || ''}</p>
        </div>
      `;

      item.addEventListener('click', () => openLightbox(idx));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      });

      container.appendChild(item);
    });
  }

  function initLightboxListeners() {
    const closeBtn = document.getElementById('lightboxBtnClose');
    const prevBtn = document.getElementById('lightboxBtnPrev');
    const nextBtn = document.getElementById('lightboxBtnNext');
    const modal = document.getElementById('lightboxModal');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', prevLightbox);
    if (nextBtn) nextBtn.addEventListener('click', nextLightbox);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeLightbox();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (!modal || !modal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
    });

    let touchStartX = 0;
    if (modal) {
      modal.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      modal.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (diff > 50) prevLightbox();
        if (diff < -50) nextLightbox();
      }, { passive: true });
    }
  }

  // --- 7. OUR STORY TIMELINE ---
  function renderOurStory(data) {
    const container = document.getElementById('storyTimelineTrack');
    if (!container) return;

    const timeline = (data.story && data.story.timeline) || [];
    container.innerHTML = '';

    timeline.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `story-entry-row reveal-on-scroll delay-${(idx % 2) + 1}`;

      row.innerHTML = `
        <div class="story-node-medallion" aria-hidden="true">
          ${getGoldIconSvg(item.icon || 'sparkle')}
        </div>
        <div class="story-entry-card">
          <span class="story-tag-pill">${item.tag || 'CHAPTER'}</span>
          <h3 class="story-title">${item.title}</h3>
          <p class="story-desc">${item.description}</p>
        </div>
      `;

      container.appendChild(row);
    });
  }

  // --- 8. VENUE & TRAVEL ---
  function renderVenueAndTravel(data) {
    const venuesContainer = document.getElementById('venuesGrid');
    const notesContainer = document.getElementById('travelNotesList');

    if (venuesContainer) {
      const venues = (data.venueAndTravel && data.venueAndTravel.venues) || [];
      venuesContainer.innerHTML = '';

      venues.forEach((v, idx) => {
        const card = document.createElement('article');
        card.className = `venue-spec-card reveal-on-scroll delay-${(idx % 2) + 1}`;

        card.innerHTML = `
          <span class="venue-event-badge">${v.eventName}</span>
          <h3 class="venue-title-text">${v.venueName}</h3>
          <p class="venue-address-text">${v.address}</p>

          <div class="event-meta-row" style="margin-bottom: 22px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>${v.date} · ${v.time}</span>
          </div>

          <div class="event-card-actions">
            <a href="${v.mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-event-directions">
              <span>OPEN IN MAPS</span>
            </a>
            <a href="${v.directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn-event-directions" style="background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.4);">
              <span>GET DIRECTIONS</span>
            </a>
          </div>
        `;

        venuesContainer.appendChild(card);
      });
    }

    if (notesContainer) {
      const notes = (data.venueAndTravel && data.venueAndTravel.travelNotes) || [];
      notesContainer.innerHTML = '';

      notes.forEach((note) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <svg viewBox="0 0 24 24"><path d="M12 2L15 9H9L12 2Z"/><circle cx="12" cy="14" r="4"/></svg>
          <span>${note}</span>
        `;
        notesContainer.appendChild(li);
      });
    }
  }

  // --- 9. LIVE STREAM ---
  function renderLiveStream(data) {
    const section = document.getElementById('liveStreamSection');
    const btn = document.getElementById('btnJoinLiveStream');
    const badge = document.getElementById('liveStreamBadge');
    const title = document.getElementById('liveStreamTitle');
    const subtitle = document.getElementById('liveStreamSubtitle');
    const btnText = document.getElementById('liveStreamBtnText');

    if (!section) return;

    const stream = data.liveStream;
    if (!stream || !stream.enabled || !stream.streamUrl || !stream.streamUrl.trim()) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    if (btn) btn.href = stream.streamUrl;
    if (badge && stream.badge) badge.innerText = stream.badge;
    if (title && stream.title) title.innerText = stream.title;
    if (subtitle && stream.subtitle) subtitle.innerText = stream.subtitle;
    if (btnText && stream.buttonText) btnText.innerText = stream.buttonText;
  }

  // --- 10. RSVP SUBMISSION HANDLER ---
  let selectedRsvpStatus = 'accepted';

  function initRsvpSection(data) {
    const btnAccept = document.getElementById('btnRsvpAccept');
    const btnDecline = document.getElementById('btnRsvpDecline');
    const form = document.getElementById('rsvpForm');
    const successBox = document.getElementById('rsvpSuccessBox');
    const successTitle = document.getElementById('rsvpSuccessTitle');
    const successText = document.getElementById('rsvpSuccessText');
    const rsvpSection = document.getElementById('rsvpSection');

    // Check if RSVP is enabled in wedding
    if (currentWedding && currentWedding.rsvpEnabled === false) {
      if (rsvpSection) rsvpSection.style.display = 'none';
      return;
    }

    if (btnAccept && btnDecline) {
      btnAccept.addEventListener('click', () => {
        btnAccept.classList.add('active');
        btnDecline.classList.remove('active');
        selectedRsvpStatus = 'accepted';
      });

      btnDecline.addEventListener('click', () => {
        btnDecline.classList.add('active');
        btnAccept.classList.remove('active');
        selectedRsvpStatus = 'declined';
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const guestName = document.getElementById('rsvpGuestName').value.trim();
        const message = document.getElementById('rsvpMessage').value.trim();

        if (!guestName) {
          alert('Please enter your full name.');
          return;
        }

        const res = window.NeoDB.submitRSVP(currentSlug, {
          name: guestName,
          status: selectedRsvpStatus,
          message: message
        });

        if (!res.success) {
          alert(res.error);
          return;
        }

        // Show confirmation
        form.style.display = 'none';
        if (successBox) {
          successBox.style.display = 'block';
          if (selectedRsvpStatus === 'accepted') {
            successTitle.innerText = 'BLESSINGS RECEIVED WITH JOY!';
            successText.innerText = `Thank you, ${guestName}! We are overjoyed to celebrate our union with you in Udaipur.`;
          } else {
            successTitle.innerText = 'GRATEFUL FOR YOUR BLESSINGS';
            successText.innerText = `Thank you, ${guestName}! We appreciate your warm wishes and will miss your presence.`;
          }
        }
        showToast('RSVP sent successfully!');
      });
    }
  }

  // --- 11. SHARE INVITATION BUTTONS ---
  function initShareButtons(data) {
    const btnWhatsapp = document.getElementById('btnShareWhatsApp');
    const btnCalendar = document.getElementById('btnShareCalendar');
    const btnCopyLink = document.getElementById('btnShareCopyLink');

    const coupleName = (data.invitation && data.invitation.coupleDisplay) || 'Siddharth & Kiara';
    const dateText = (data.invitation && data.invitation.date) || 'Monday, October 12, 2026';
    const hashtag = (currentWedding && currentWedding.weddingHashtag) || '#SiddharthKiaraWedding';
    const pageUrl = window.location.href;

    // WhatsApp Pre-filled message
    if (btnWhatsapp) {
      const msg = encodeURIComponent(
        `🌸 Sacred Wedding Invitation 🌸\n\n` +
        `Together with our families, you are joyfully invited to celebrate the union of ${coupleName}.\n\n` +
        `📅 Date: ${dateText}\n` +
        `📍 Venue: The Royal Udaivilas Palace, Udaipur\n\n` +
        `View the royal digital invitation:\n${pageUrl}\n\n` +
        `${hashtag}`
      );
      btnWhatsapp.href = `https://api.whatsapp.com/send?text=${msg}`;
    }

    // Add to Calendar (Google Calendar link + .ics download)
    if (btnCalendar) {
      btnCalendar.addEventListener('click', () => {
        const title = encodeURIComponent(`The Wedding Celebration of ${coupleName}`);
        const details = encodeURIComponent(`Sacred Vivah Sanskar and Wedding Celebration of ${coupleName}.`);
        const location = encodeURIComponent(`The Royal Udaivilas Palace, Lake Pichola, Udaipur, Rajasthan`);
        const dates = `20261012T050000Z/20261012T160000Z`;

        const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
        window.open(googleCalUrl, '_blank');
      });
    }

    // Copy Link
    if (btnCopyLink) {
      btnCopyLink.addEventListener('click', () => {
        navigator.clipboard.writeText(pageUrl).then(() => {
          showToast('Invitation link copied to clipboard!');
        }).catch(() => {
          prompt('Copy invitation link:', pageUrl);
        });
      });
    }
  }

  // --- 12. FINAL THANK YOU SECTION ---
  function renderThankYouSection(data) {
    const coupleNameEl = document.getElementById('thankYouCoupleName');
    const dateEl = document.getElementById('thankYouDate');
    const hashtagEl = document.getElementById('thankYouHashtag');

    if (coupleNameEl) {
      coupleNameEl.innerText = (data.invitation && data.invitation.coupleDisplay) || 'Siddharth & Kiara';
    }
    if (dateEl) {
      dateEl.innerText = (data.invitation && data.invitation.date) || 'October 12, 2026';
    }
    if (hashtagEl) {
      hashtagEl.innerText = (currentWedding && currentWedding.weddingHashtag) || '#SiddharthKiaraWedding';
    }
  }

  // --- GENERAL DATA POPULATION ---
  function populateGeneralData(data) {
    const savedEmblem = localStorage.getItem('neo_ganapathi_emblem') || (data.sacred && data.sacred.ganapathiEmblem) || 'assets/ganapathi.png';
    document.querySelectorAll('.js-ganapathi-img').forEach((img) => {
      img.src = savedEmblem;
    });

    document.querySelectorAll('.js-couple-name').forEach((el) => {
      el.innerHTML = `${data.couple.groom.name} <span class="ampersand">&</span> ${data.couple.bride.name}`;
    });

    const gName = document.getElementById('groomName');
    if (gName) gName.innerText = data.couple.groom.name;
    const gParents = document.getElementById('groomParents');
    if (gParents) gParents.innerText = data.couple.groom.parents;
    const gRelation = document.getElementById('groomRelation');
    if (gRelation) gRelation.innerText = data.couple.groom.relationTitle;
    const gCity = document.getElementById('groomCity');
    if (gCity) gCity.innerText = data.couple.groom.familyCity;
    const gPhoto = document.getElementById('groomPhoto');
    if (gPhoto && data.couple.groom.photo) gPhoto.src = data.couple.groom.photo;

    const bName = document.getElementById('brideName');
    if (bName) bName.innerText = data.couple.bride.name;
    const bParents = document.getElementById('brideParents');
    if (bParents) bParents.innerText = data.couple.bride.parents;
    const bRelation = document.getElementById('brideRelation');
    if (bRelation) bRelation.innerText = data.couple.bride.relationTitle;
    const bCity = document.getElementById('brideCity');
    if (bCity) bCity.innerText = data.couple.bride.familyCity;
    const bPhoto = document.getElementById('bridePhoto');
    if (bPhoto && data.couple.bride.photo) bPhoto.src = data.couple.bride.photo;

    const targetIso = (data.countdown && data.countdown.targetDateTimeISO) || (data.invitation && data.invitation.eventDateTimeISO);
    initCountdown(targetIso);
  }

  // --- SCROLL REVEAL OBSERVER ---
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  // --- MASTER RENDER ---
  function renderAll() {
    loadActiveWedding();
    const data = getWeddingPayload();

    populateGeneralData(data);
    renderEventsSchedule(data);
    renderPhotoGallery(data);
    renderOurStory(data);
    renderVenueAndTravel(data);
    renderLiveStream(data);
    initRsvpSection(data);
    initShareButtons(data);
    renderThankYouSection(data);
    initScrollReveal();
  }

  // --- INITIALIZE APPLICATION ---
  document.addEventListener('DOMContentLoaded', () => {
    if (window.NeoDB) window.NeoDB.init();

    const audioEngine = new LuxuryAudioEngine();
    const audioBtn = document.getElementById('audioToggleBtn');
    const openInvitationBtn = document.getElementById('btnOpenInvitation');
    const coverScreen = document.getElementById('coverScreen');
    const scrollDownBtn = document.getElementById('scrollDownIndicator');

    initPetalsCanvas();
    renderAll();
    initLightboxListeners();

    // Keep UI button in exact sync with audio state
    audioEngine.onStateChange = (isPlaying) => {
      if (!audioBtn) return;
      const text = audioBtn.querySelector('.audio-text');
      if (isPlaying) {
        audioBtn.classList.add('playing');
        if (text) text.innerText = 'MUSIC ON';
      } else {
        audioBtn.classList.remove('playing');
        if (text) text.innerText = 'MUSIC OFF';
      }
    };

    // 1. Immediate play attempt on page load
    audioEngine.play();

    // 2. Also try on window load
    window.addEventListener('load', () => {
      if (!audioEngine.isPlaying) {
        audioEngine.play();
      }
    });

    // 3. Any touch or click anywhere on the opening cover screen starts the music immediately

    if (coverScreen) {
      coverScreen.addEventListener('pointerdown', () => {
        if (!audioEngine.isPlaying) {
          audioEngine.play();
        }
      }, { passive: true });
      coverScreen.addEventListener('click', () => {
        if (!audioEngine.isPlaying) {
          audioEngine.play();
        }
      }, { passive: true });
    }

    // 4. Audio Button Manual Toggle (Mute / Unmute)
    if (audioBtn) {
      audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        audioEngine.toggle();
      });
    }

    // 5. Open Invitation Button: Petals Explosion & Reveal
    if (openInvitationBtn && coverScreen) {
      openInvitationBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        // 1. Trigger celebratory royal flower petals blast
        const rect = openInvitationBtn.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;
        if (typeof triggerPetalsBlast === 'function') {
          triggerPetalsBlast(originX, originY);
        }

        // 2. Ensure music is playing
        if (!audioEngine.isPlaying) {
          audioEngine.play();
        }

        // 3. Open the royal envelope gates
        coverScreen.classList.add('opened');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Scroll Down Indicator
    if (scrollDownBtn) {
      scrollDownBtn.addEventListener('click', () => {
        const coupleSection = document.getElementById('coupleSection');
        if (coupleSection) {
          coupleSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  });
})();
