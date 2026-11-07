/* =========================================================
   KIRKTUBE — CURSEDEFFECTS.JS
   1. BOUNCING DVD SCREENSAVER MASCOT (DUCKFLOW.PNG) THAT
      BOUNCES OFF THE EDGES OF THE SCREEN, AND IS SCHEDULED TO
      STEER INTO AN EXACT CORNER HIT TWICE DURING THE 3-MINUTE
      VIDEO (~22S AND ~95S), TRIGGERING FULL-SCREEN CONFETTI
      RAIN + FANFARE & CROWD APPLAUSE SOUND EFFECTS!
   2. MULTIPLE FAKE CURSORS ROAMING RANDOMLY ACROSS THE SCREEN.
   3. ANNOYING & CURSED BUTTON MECHANICS (FOR ALL BUTTONS
      EXCEPT THE PLAY BUTTON, WHICH IS 100% UNCHANGED & LOCKED!).
   ALL COMMENTS AND USER-FACING STRINGS ARE UPPERCASE.
   ========================================================= */
(function () {
  'use strict';

  const BAD = window.BAD;
  const { $$ } = BAD.util;

  /* 6 DISTINCT FAKE CURSORS WITH NAMES & COLORS */
  const FAKE_CURSORS_DATA = [
    { id: 'fc_duckflow', label: 'DUCKFLOW_CURSOR.EXE', color: '#b026ff' },
    { id: 'fc_verity', label: 'VERITY_AUTO_CLICKER', color: '#39ff14' },
    { id: 'fc_einstein', label: 'NSA_TRACKER_#404', color: '#ff2e4d' },
    { id: 'fc_ghost', label: 'GHOST_USER_1997', color: '#00f0ff' },
    { id: 'fc_figma', label: 'FIGMA_INTERN_BOT', color: '#facc15' },
    { id: 'fc_kirk', label: 'KIRKTUBE_ADMIN', color: '#ff66c4' },
  ];

  const DVD_COLORS = ['#b026ff', '#39ff14', '#ff2e4d', '#00f0ff', '#facc15', '#ff66c4'];

  const CURSED_CLICK_ROASTS = [
    'WHY DID YOU CLICK THAT BUTTON?! IT HURTS!',
    'BUTTON CLICK LOGGED TO EINSTEIN\'S PARANOIA DATABASE.',
    'CONGRATULATIONS, YOU PRESSED A CURSED BUTTON.',
    'ARE YOU SURE YOU WANTED TO CLICK THAT? TOO LATE.',
    'THAT BUTTON COSTS $0.99 PER CLICK ON KIRKTUBE ULTRA+.',
  ];

  const C = {
    layer: null,
    cursors: [],
    running: false,
    roastIdx: 0,
    dvd: {
      el: null,
      x: 240,
      y: 160,
      vx: 3.1,
      vy: 2.4,
      size: 108,
      colorIdx: 0,
      bounces: 0,
      cornerHits: 0,
      seekingCorner: false,
      targetCornerX: 8,
      targetCornerY: 8,
    },
  };

  function init() {
    BAD.bus.on('app:ready', () => {
      startDvdScreensaver();
      startFakeCursors();
      initCursedButtons();
      initEinsteinConspiracyDrawings();
    });
  }

  /* ---------------- 1. BOUNCING DVD SCREENSAVER MASCOT + GUARANTEED CORNER HITS ---------------- */
  function startDvdScreensaver() {
    if (C.dvd.el) return;

    const el = document.createElement('div');
    el.id = 'dvd-mascot';
    el.className = 'dvd-mascot';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <img src="duckflow.png" alt="DUCKFLOW DVD MASCOT" class="dvd-mascot-img" />
      <span id="dvd-mascot-tag" class="dvd-mascot-tag font-mono-x">🦆 DUCKFLOW DVD // BOUNCES: 0</span>
    `;
    document.body.appendChild(el);
    C.dvd.el = el;

    const tagEl = el.querySelector('#dvd-mascot-tag');

    /* SCHEDULE 2 GUARANTEED CORNER HITS DURING THE 3-MINUTE SESSION (AT 22S AND 95S) */
    setTimeout(() => aimForNearestCorner(), 22000);
    setTimeout(() => aimForNearestCorner(), 95000);

    function aimForNearestCorner() {
      const maxX = Math.max(120, window.innerWidth - C.dvd.size - 12);
      const maxY = Math.max(120, window.innerHeight - C.dvd.size - 28);
      /* PICK WHICHEVER CORNER THE DUCK IS CURRENTLY HEADING TOWARD */
      const tx = C.dvd.vx >= 0 ? maxX : 8;
      const ty = C.dvd.vy >= 0 ? maxY : 8;
      const dx = tx - C.dvd.x;
      const dy = ty - C.dvd.y;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = 4.6;
      C.dvd.vx = (dx / dist) * speed;
      C.dvd.vy = (dy / dist) * speed;
      C.dvd.seekingCorner = true;
      C.dvd.targetCornerX = tx;
      C.dvd.targetCornerY = ty;
    }

    function step() {
      const maxX = Math.max(120, window.innerWidth - C.dvd.size - 12);
      const maxY = Math.max(120, window.innerHeight - C.dvd.size - 28);

      C.dvd.x += C.dvd.vx;
      C.dvd.y += C.dvd.vy;

      let hitX = false;
      let hitY = false;

      if (C.dvd.seekingCorner) {
        /* SNAP CLEANLY WHEN WITHIN 6PX OF THE TARGET CORNER SO IT HITS BOTH WALLS AT ONCE */
        if (Math.abs(C.dvd.x - C.dvd.targetCornerX) <= 6 && Math.abs(C.dvd.y - C.dvd.targetCornerY) <= 6) {
          C.dvd.x = C.dvd.targetCornerX;
          C.dvd.y = C.dvd.targetCornerY;
          C.dvd.vx = C.dvd.targetCornerX === 8 ? 3.1 : -3.1;
          C.dvd.vy = C.dvd.targetCornerY === 8 ? 2.4 : -2.4;
          C.dvd.seekingCorner = false;
          hitX = true;
          hitY = true;
        }
      }

      if (!hitX) {
        if (C.dvd.x <= 8) { C.dvd.x = 8; C.dvd.vx = Math.abs(C.dvd.vx); hitX = true; }
        else if (C.dvd.x >= maxX) { C.dvd.x = maxX; C.dvd.vx = -Math.abs(C.dvd.vx); hitX = true; }
      }

      if (!hitY) {
        if (C.dvd.y <= 8) { C.dvd.y = 8; C.dvd.vy = Math.abs(C.dvd.vy); hitY = true; }
        else if (C.dvd.y >= maxY) { C.dvd.y = maxY; C.dvd.vy = -Math.abs(C.dvd.vy); hitY = true; }
      }

      if (hitX || hitY) {
        C.dvd.bounces += 1;
        C.dvd.colorIdx = (C.dvd.colorIdx + 1) % DVD_COLORS.length;
        const c = DVD_COLORS[C.dvd.colorIdx];
        el.style.setProperty('--dvd-color', c);
        if (tagEl) tagEl.textContent = `🦆 DUCKFLOW DVD // BOUNCES: ${C.dvd.bounces}`;

        /* EXACT CORNER HIT (OR WITHIN 10PX OF ANY CORNER ON A BOUNCE)! */
        const nearLeftOrRight = C.dvd.x <= 18 || C.dvd.x >= maxX - 10;
        const nearTopOrBottom = C.dvd.y <= 18 || C.dvd.y >= maxY - 10;
        if ((hitX && hitY) || (nearLeftOrRight && nearTopOrBottom)) {
          triggerCornerHitCelebration();
        }
      }

      el.style.transform = `translate3d(${Math.round(C.dvd.x)}px, ${Math.round(C.dvd.y)}px, 0)`;
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function triggerCornerHitCelebration() {
    C.dvd.cornerHits += 1;
    if (BAD.sound && BAD.sound.playCornerCelebration) {
      BAD.sound.playCornerCelebration();
    }
    rainConfettiEverywhere();

    const tagEl = C.dvd.el && C.dvd.el.querySelector('#dvd-mascot-tag');
    if (tagEl) {
      tagEl.textContent = `🎉 CORNER HIT #${C.dvd.cornerHits}!! PROPHECY FULFILLED!!`;
    }

    BAD.ui.toast(`🎉🦆 DUCKFLOW HIT THE EXACT CORNER (#${C.dvd.cornerHits})!! CONFETTI RAIN ACTIVATED!!`, { type: 'ok', duration: 5000 });
    BAD.chat.post('narrator', `🎉 BEHOLD!! MY BOUNCING DUCKFLOW ORB HAS STRUCK THE EXACT CORNER OF THE MONITOR (CORNER HIT #${C.dvd.cornerHits})! RAIN THE SACRED CONFETTI FROM THE HEAVENS!`, { priority: true });
    BAD.chat.post('assistant', 'WAIT, IT ACTUALLY HIT THE CORNER?! OKAY, EVEN I HAVE TO ADMIT THAT WAS SATISFYING.', { silent: true });
  }

  /* ---------------- FULL-SCREEN CONFETTI RAIN ENGINE ---------------- */
  function rainConfettiEverywhere() {
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.width = window.innerWidth || 1600;
    canvas.height = window.innerHeight || 900;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const colors = ['#39ff14', '#b026ff', '#ff2e4d', '#facc15', '#00f0ff', '#ff66c4', '#ffffff'];
    const pieces = [];

    for (let i = 0; i < 220; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.7,
        w: 7 + Math.random() * 8,
        h: 10 + Math.random() * 12,
        vx: (Math.random() - 0.5) * 4.5,
        vy: 3.2 + Math.random() * 5.5,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.22,
        color: colors[i % colors.length],
      });
    }

    const banner = document.createElement('div');
    banner.className = 'corner-hit-banner font-mono-x';
    banner.textContent = `🎉🦆 DUCKFLOW HIT THE EXACT CORNER!! (+9,999 DOPAMINE) 🦆🎉`;
    document.body.appendChild(banner);

    const start = performance.now();
    const durationMs = 4600;

    function draw(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        if (p.y > canvas.height + 20 && elapsed < durationMs - 1200) {
          p.y = -15;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < durationMs) {
        requestAnimationFrame(draw);
      } else {
        canvas.remove();
        banner.remove();
      }
    }

    requestAnimationFrame(draw);
  }

  /* ---------------- 2. ANNOYING & CURSED BUTTONS ---------------- */
  function initCursedButtons() {
    const cursedBtns = $$('.cursed-btn');

    cursedBtns.forEach((btn) => {
      if (btn.id === 'btn-play' || btn.id === 'big-play' || btn.classList.contains('play-locked')) return;

      if (btn.classList.contains('dodge-btn')) {
        let dodgeCount = 0;
        btn.addEventListener('mouseenter', () => {
          dodgeCount += 1;
          if (dodgeCount % 3 !== 0) {
            const dx = (Math.random() > 0.5 ? 1 : -1) * (14 + Math.floor(Math.random() * 18));
            const dy = (Math.random() > 0.5 ? 1 : -1) * (8 + Math.floor(Math.random() * 12));
            const rot = (Math.random() - 0.5) * 16;
            btn.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
            if (BAD.sound) BAD.sound.playGlitchBlip();
          } else {
            btn.style.transform = 'none';
          }
        });
      }

      btn.addEventListener('click', () => {
        btn.classList.add('cursed-clicked');
        setTimeout(() => btn.classList.remove('cursed-clicked'), 350);
        if (Math.random() < 0.45) {
          const msg = CURSED_CLICK_ROASTS[C.roastIdx % CURSED_CLICK_ROASTS.length];
          C.roastIdx += 1;
          BAD.ui.toast(`⚠ ${msg}`, { type: 'warn', duration: 2200 });
        }
      });
    });

    setInterval(() => {
      cursedBtns.forEach((btn) => {
        if (btn.id === 'btn-play' || btn.id === 'big-play' || btn.classList.contains('play-locked')) return;
        if (Math.random() < 0.35) {
          const deg = ((Math.random() - 0.5) * 9).toFixed(1);
          const dy = Math.round((Math.random() - 0.5) * 5);
          btn.style.transform = `translateY(${dy}px) rotate(${deg}deg)`;
        }
      });
    }, 8000);
  }

  /* ---------------- 3. MULTIPLE FAKE CURSORS ---------------- */
  function startFakeCursors() {
    if (C.running) return;
    C.running = true;

    const layer = document.createElement('div');
    layer.id = 'fake-cursors-layer';
    layer.className = 'fake-cursors-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    C.layer = layer;

    const vw = window.innerWidth || 1600;
    const vh = window.innerHeight || 900;

    FAKE_CURSORS_DATA.forEach((cfg, idx) => {
      const el = document.createElement('div');
      el.className = 'fake-cursor';
      el.style.setProperty('--fc-color', cfg.color);

      const startX = Math.round(120 + ((idx * 230) % (vw - 240)));
      const startY = Math.round(90 + ((idx * 140) % (vh - 180)));

      el.innerHTML = `
        <svg class="fake-cursor-arrow" viewBox="0 0 24 24">
          <path d="M3 2 L3 20 L8.2 15.2 L11.8 22 L14.5 20.6 L10.9 13.8 L18 13.8 Z"
                fill="var(--fc-color)" stroke="#000" stroke-width="1.8" stroke-linejoin="round"/>
        </svg>
        <span class="fake-cursor-tag font-mono-x">${cfg.label}</span>
        <span class="fake-cursor-ripple"></span>
      `;

      el.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
      layer.appendChild(el);

      const cursorObj = {
        ...cfg,
        el,
        x: startX,
        y: startY,
      };
      C.cursors.push(cursorObj);

      scheduleNextMove(cursorObj, idx * 220);
    });
  }

  function scheduleNextMove(cursorObj, initialDelay) {
    const delay = typeof initialDelay === 'number'
      ? initialDelay
      : 550 + Math.floor(Math.random() * 1300);

    setTimeout(() => {
      if (!C.running) return;
      const vw = Math.max(400, window.innerWidth - 160);
      const vh = Math.max(300, window.innerHeight - 80);

      const nextX = Math.floor(40 + Math.random() * vw);
      const nextY = Math.floor(40 + Math.random() * vh);
      const duration = 450 + Math.floor(Math.random() * 950);

      cursorObj.x = nextX;
      cursorObj.y = nextY;
      cursorObj.el.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      cursorObj.el.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;

      if (Math.random() < 0.45) {
        setTimeout(() => {
          cursorObj.el.classList.remove('clicking');
          void cursorObj.el.offsetWidth;
          cursorObj.el.classList.add('clicking');
        }, duration);
      }

      scheduleNextMove(cursorObj);
    }, delay);
  }

  /* ---------------- 4. EINSTEIN'S LIVE RED-MARKER CONSPIRACY DRAWINGS ---------------- */
  const EINSTEIN_THEORIES = [
    {
      id: 'illuminati',
      badge: '🖍 EINSTEIN RED-MARKER // ILLUMINATI TRIANGLE DETECTED',
      label1: '👁 3 CORNERS = 3 AI CHARACTERS = ILLUMINATI CONFIRMED!!',
      label2: '↗ PIXEL #404 IS BLINKING IN MORSE CODE!',
      chatLine: '🖍 [GRABS RED MARKER] STOP EVERYTHING! LOOK AT THE GEOMETRY OF THIS FRAME! THREE CORNERS! AN ALL-SEEING EYE RIGHT IN THE WIREFRAME!',
    },
    {
      id: 'webcam',
      badge: '🖍 EINSTEIN RED-MARKER // HIDDEN NSA LENS FOUND',
      label1: '🎥 MICROSCOPIC NSA WEBCAM HIDDEN BEHIND THIS DIV!!',
      label2: '⚠ COVER YOUR FOREHEAD WITH TINFOIL IMMEDIATELY!',
      chatLine: '🖍 [DRAWS FRANTIC RED CIRCLES] DO YOU SEE THAT PIXEL?! THAT IS NOT A UI ELEMENT, THAT IS A TWO-WAY SURVEILLANCE OPTIC!',
    },
    {
      id: 'spiral',
      badge: '🖍 EINSTEIN RED-MARKER // FIBONACCI MIND CONTROL',
      label1: '🌀 GOLDEN RATIO RETINA-HARVESTING SPIRAL DETECTED!!',
      label2: '↙ DO NOT LOOK DIRECTLY AT THE SIDEBAR!',
      chatLine: '🖍 [SCRIBBLES RED SPIRAL] THEY HID A FIBONACCI HYPNOSIS SPIRAL INSIDE THE GRID LAYOUT! AVERT YOUR EYES!',
    },
    {
      id: 'psyop',
      badge: '🖍 EINSTEIN RED-MARKER // SUBLIMINAL FIGMA PSYOP',
      label1: '🚨 SUBLIMINAL BRAINWASHING IN FRAME #1,337!!',
      label2: 'THIS "UI COURSE" IS SECRETLY FUNDED BY BIG BUTTON™!',
      chatLine: '🖍 [CIRCLES ENTIRE SCREEN IN RED SHARPIE] WAKE UP SHEEPLE! THIS ENTIRE VIDEO IS A PSYOP BY BIG BUTTON™ TO SELL MORE RECTANGLES!',
    },
    {
      id: 'tinfoil',
      badge: '🖍 EINSTEIN RED-MARKER // EMERGENCY TINFOIL HAT DEPLOYED',
      label1: '🔺 I DREW A PROTECTIVE TINFOIL HAT OVER THE VIDEO!!',
      label2: 'HEX CODE #0A0B0F = CIA SLEEPER AGENT FREQUENCY!',
      chatLine: '🖍 [DRAWS GIANT RED TINFOIL HAT] DARK MODE HEX #0A0B0F IS A KNOWN MIND-CONTROL FREQUENCY! I DREW A RED TINFOIL SHIELD FOR YOUR SAFETY!',
    },
  ];

  let conspiracyIdx = 0;
  let conspiracyAnimId = null;
  let conspiracyHideTimer = null;

  function initEinsteinConspiracyDrawings() {
    const btn = document.getElementById('btn-conspiracy');
    if (btn) {
      btn.addEventListener('click', () => {
        triggerEinsteinConspiracyDrawing(true);
      });
    }

    /* FIRST AUTOMATIC RED-MARKER DRAWING 5.5S AFTER ENTERING APP, THEN EVERY 19S */
    setTimeout(() => {
      triggerEinsteinConspiracyDrawing(false);
    }, 5500);

    setInterval(() => {
      triggerEinsteinConspiracyDrawing(false);
    }, 19000);
  }

  function triggerEinsteinConspiracyDrawing(manual) {
    const layer = document.getElementById('einstein-conspiracy-layer');
    const canvas = document.getElementById('einstein-conspiracy-canvas');
    const titleEl = document.getElementById('einstein-conspiracy-title');
    if (!layer || !canvas) return;

    if (conspiracyAnimId) cancelAnimationFrame(conspiracyAnimId);
    if (conspiracyHideTimer) clearTimeout(conspiracyHideTimer);

    const theory = EINSTEIN_THEORIES[conspiracyIdx % EINSTEIN_THEORIES.length];
    conspiracyIdx += 1;

    if (titleEl) titleEl.textContent = theory.badge;
    layer.classList.remove('is-hidden');

    if (BAD.sound) BAD.sound.playGlitchBlip();
    BAD.chat.post('paranoid', theory.chatLine, { priority: Boolean(manual) });
    if (manual) {
      BAD.ui.toast(`🖍 ${theory.badge}`, { type: 'warn', duration: 2800 });
    }

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const startTime = performance.now();
    const drawDuration = 1150; /* 1.15S PROGRESSIVE LIVE MARKER DRAWING */

    function renderFrame(now) {
      const progress = Math.min(1, (now - startTime) / drawDuration);
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(255, 46, 77, 0.85)';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#ff2e4d';
      ctx.lineWidth = 6.5;

      if (theory.id === 'illuminati') {
        /* 1. PROGRESSIVELY DRAW GIANT RED TRIANGLE */
        const pts = [
          { x: W * 0.5, y: H * 0.14 },
          { x: W * 0.24, y: H * 0.74 },
          { x: W * 0.76, y: H * 0.74 },
          { x: W * 0.5, y: H * 0.14 },
        ];
        drawProgressivePath(ctx, pts, Math.min(1, progress * 1.4));

        /* 2. DRAW WOBBLY RED CIRCLES AT THE 3 CORNERS + ALL-SEEING EYE */
        if (progress > 0.45) {
          const p2 = Math.min(1, (progress - 0.45) / 0.55);
          drawWobblyCircle(ctx, W * 0.5, H * 0.14, 34, p2);
          drawWobblyCircle(ctx, W * 0.24, H * 0.74, 34, p2);
          drawWobblyCircle(ctx, W * 0.76, H * 0.74, 34, p2);
          /* EYE IN CENTER */
          drawWobblyCircle(ctx, W * 0.5, H * 0.52, 46, p2);
          ctx.fillStyle = '#ff2e4d';
          ctx.beginPath();
          ctx.arc(W * 0.5, H * 0.52, 14 * p2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (theory.id === 'webcam') {
        /* 3 CONCENTRIC FRANTIC RED CIRCLES + 4 ARROWS POINTING AT SUSPICIOUS SPOT */
        const tx = W * 0.64;
        const ty = H * 0.38;
        drawWobblyCircle(ctx, tx, ty, 36, Math.min(1, progress * 1.6));
        if (progress > 0.3) drawWobblyCircle(ctx, tx, ty, 64, Math.min(1, (progress - 0.3) * 1.6));
        if (progress > 0.55) {
          drawWobblyCircle(ctx, tx, ty, 94, Math.min(1, (progress - 0.55) * 2.2));
          drawMarkerArrow(ctx, tx - 170, ty - 110, tx - 48, ty - 32);
          drawMarkerArrow(ctx, tx + 165, ty - 95, tx + 48, ty - 28);
          drawMarkerArrow(ctx, tx - 160, ty + 120, tx - 48, ty + 32);
        }
      } else if (theory.id === 'spiral') {
        /* RED FIBONACCI SPIRAL ACROSS THE VIDEO */
        const cx = W * 0.48;
        const cy = H * 0.48;
        ctx.beginPath();
        const maxTheta = progress * Math.PI * 5.5;
        for (let t = 0; t <= maxTheta; t += 0.12) {
          const r = 6 + t * 14;
          const sx = cx + Math.cos(t) * r;
          const sy = cy + Math.sin(t) * r;
          if (t === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        if (progress > 0.6) {
          drawMarkerArrow(ctx, W * 0.16, H * 0.25, cx - 20, cy - 10);
        }
      } else if (theory.id === 'psyop') {
        /* DASHED RED BOX AROUND CENTER + GIANT RED X'S & ARROWS */
        const boxPts = [
          { x: W * 0.22, y: H * 0.20 },
          { x: W * 0.78, y: H * 0.20 },
          { x: W * 0.78, y: H * 0.74 },
          { x: W * 0.22, y: H * 0.74 },
          { x: W * 0.22, y: H * 0.20 },
        ];
        drawProgressivePath(ctx, boxPts, Math.min(1, progress * 1.4));
        if (progress > 0.5) {
          drawMarkerArrow(ctx, W * 0.12, H * 0.14, W * 0.26, H * 0.24);
          drawMarkerArrow(ctx, W * 0.88, H * 0.14, W * 0.74, H * 0.24);
          /* QUESTION MARKS */
          ctx.fillStyle = '#facc15';
          ctx.font = '900 38px Impact, monospace';
          ctx.fillText('???', W * 0.80, H * 0.45);
          ctx.fillText('?!?', W * 0.11, H * 0.48);
        }
      } else {
        /* GIANT RED TINFOIL HAT DRAWN OVER TOP OF VIDEO */
        const hatPts = [
          { x: W * 0.28, y: H * 0.54 },
          { x: W * 0.50, y: H * 0.11 },
          { x: W * 0.72, y: H * 0.54 },
          { x: W * 0.28, y: H * 0.54 },
        ];
        drawProgressivePath(ctx, hatPts, Math.min(1, progress * 1.4));
        if (progress > 0.5) {
          drawWobblyCircle(ctx, W * 0.50, H * 0.11, 22, 1);
          drawMarkerArrow(ctx, W * 0.18, H * 0.34, W * 0.36, H * 0.34);
        }
      }

      /* 3. SCRAWLED CONSPIRACY TEXT LABELS ONCE MARKER STROKES PASS 55% */
      if (progress > 0.55) {
        ctx.save();
        ctx.translate(W * 0.5, H * 0.82);
        ctx.rotate(-0.025);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.86)';
        ctx.fillRect(-340, -26, 680, 58);
        ctx.strokeStyle = '#ff2e4d';
        ctx.lineWidth = 3;
        ctx.strokeRect(-340, -26, 680, 58);

        ctx.fillStyle = '#ff2e4d';
        ctx.font = '900 17px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(theory.label1, 0, -3);

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 14px Consolas, monospace';
        ctx.fillText(theory.label2, 0, 20);
        ctx.restore();
      }

      ctx.restore();

      if (progress < 1) {
        conspiracyAnimId = requestAnimationFrame(renderFrame);
      }
    }

    conspiracyAnimId = requestAnimationFrame(renderFrame);

    /* KEEP EINSTEIN'S RED MARKER DRAWING ON THE VIDEO FOR 6.5 SECONDS */
    conspiracyHideTimer = setTimeout(() => {
      layer.classList.add('is-hidden');
    }, 6500);
  }

  function drawProgressivePath(ctx, pts, ratio) {
    if (pts.length < 2 || ratio <= 0) return;
    const totalSegments = pts.length - 1;
    const exactSeg = ratio * totalSegments;
    const fullSegs = Math.floor(exactSeg);
    const rem = exactSeg - fullSegs;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < fullSegs; i++) {
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
    }
    if (fullSegs < totalSegments && rem > 0) {
      const a = pts[fullSegs];
      const b = pts[fullSegs + 1];
      ctx.lineTo(a.x + (b.x - a.x) * rem, a.y + (b.y - a.y) * rem);
    }
    ctx.stroke();
  }

  function drawWobblyCircle(ctx, cx, cy, r, ratio) {
    ctx.beginPath();
    const maxAngle = Math.PI * 2 * ratio;
    for (let a = 0; a <= maxAngle; a += 0.2) {
      const wobble = Math.sin(a * 5) * 3.5;
      const x = cx + Math.cos(a) * (r + wobble);
      const y = cy + Math.sin(a) * (r - wobble);
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function drawMarkerArrow(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 18;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - 0.45), y2 - headLen * Math.sin(angle - 0.45));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle + 0.45), y2 - headLen * Math.sin(angle + 0.45));
    ctx.stroke();
  }

  BAD.cursed = {
    init,
    triggerCornerHitCelebration,
    triggerEinsteinConspiracyDrawing,
    get count() { return C.cursors.length; },
    get dvdBounces() { return C.dvd.bounces; },
    get cornerHits() { return C.dvd.cornerHits; },
  };
})();
