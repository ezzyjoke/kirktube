/* =========================================================
   KIRKTUBE — APP.JS
   BOOTSTRAP: OPENING SCREEN -> RPG PROLOGUE -> MANDATORY
   INVERTED-SCROLL TERMS OF SERVICE -> MAIN INTERFACE.
   ALL COMMENTS AND USER-FACING STRINGS ARE UPPERCASE.
   ========================================================= */
(function () {
  'use strict';

  const BAD = window.BAD;
  const { $, sleep } = BAD.util;

  const BOOT_STEPS = [
    'INITIALIZING KIRKTUBE PIXELS…',
    'CALIBRATING UI DESYNC & GLITCHES…',
    'POLISHING BUTTONS YOU WILL NOT FIND…',
    'SUMMONING DUCKFLOW (THE DUCK INSISTED)…',
    'LOADING VERITY SARCASM MODULE…',
    'SWEEPING THE CACHE… EINSTEIN FOUND A CONSPIRACY…',
    'KIRKTUBE READY. UNFORTUNATELY.',
  ];

  /* 42 ABSURD LEGAL CLAUSES FOR THE LONG MANDATORY TOS */
  const TOS_CLAUSES = [
    'SECTION 1.1 — DEFINITIONS: "USER" MEANS THE UNFORTUNATE MORTAL CURRENTLY TRYING TO SCROLL THIS WINDOW. "KIRKTUBE" MEANS OUR CURSED STREAMING ENGINE.',
    'SECTION 1.2 — INVERTED SCROLLING: BY ATTEMPTING TO SCROLL DOWN, YOU ACKNOWLEDGE THAT SCROLLING DOWN MOVES UP AND SCROLLING UP MOVES DOWN.',
    'SECTION 2.1 — THE STATIONARY PLAY BUTTON TREATY: KIRKTUBE CORP HEREBY GUARANTEES THAT THE PLAY BUTTON SHALL NEVER MOVE, DODGE, OR ROTATE.',
    'SECTION 2.2 — ALL OTHER BUTTONS: NO SUCH GUARANTEE APPLIES TO ANY OTHER BUTTON. THEY MAY DODGE, ROTATE, OR ROAST YOU AT ANY TIME.',
    'SECTION 3.1 — DUCKFLOW NARRATION RIGHTS: YOU GRANT DUCKFLOW IRREVOCABLE PERMISSION TO TREAT EVERY PAUSE CLICK AS AN ANCIENT PROPHECY.',
    'SECTION 3.2 — BOUNCING DVD MASCOT: YOU AGREE THAT A GIANT GLOWING DUCKFLOW ORB WILL BOUNCE AROUND YOUR SCREEN FOREVER.',
    'SECTION 4.1 — VERITY SARCASM WAIVER: KIRKTUBE CORP IS NOT LIABLE FOR EMOTIONAL DAMAGE CAUSED BY VERITY ROASTING YOUR UX SKILLS.',
    'SECTION 5.1 — EINSTEIN SURVEILLANCE CLAUSE: YOU ACKNOWLEDGE THAT EINSTEIN BELIEVES PORT 8000 IS BEING MONITORED BY INTERDIMENSIONAL AGENTS.',
    'SECTION 6.1 — PHANTOM DOOR KNOCKS: RANDOM WOODEN DOOR KNOCKS AND DOOR SLAMS WILL PLAY IN YOUR HEADPHONES EVERY 11 SECONDS. DO NOT OPEN YOUR DOOR.',
    'SECTION 7.1 — MANDATORY UPPERCASE LAW: LOWERCASE LETTERS ARE STRICTLY FORBIDDEN UNDER KIRKTUBE CONSTITUTION ARTICLE IV.',
    'SECTION 8.1 — SUBTITLE MONITORING: ALL 87 SUBTITLE CUES IN THIS 3-MINUTE VIDEO WILL BE READ AND MOCKED BY OUR AI COUNCIL.',
    'SECTION 9.1 — FAKE MULTIPLAYER CURSORS: SIX FAKE CURSORS WILL ROAM YOUR SCREEN PRETENDING TO BE FIGMA INTERNS AND NSA TRACKERS.',
    'SECTION 10.1 — RANDOM PAYWALL INTERRUPTIONS: THE KIRKTUBE ULTRA+ PRO MAX SUBSCRIPTION PAGE WILL POP UP RANDOMLY AND DEMAND $49.99/MIN OR ONE (1) SOUL.',
    'SECTION 11.1 — NO SKIPPING ALLOWED: MANDATORY AI INTERRUPTIONS CANNOT BE SKIPPED. YOU MUST PICK A DIALOGUE OPTION TO RESUME THE VIDEO.',
    'SECTION 12.1 — WARRANTY DISCLAIMER: THIS SOFTWARE IS PROVIDED "AS-CURSED" WITHOUT ANY IMPLIED USABILITY OR ERGONOMIC SANITY.',
    'SECTION 13.1 — VICTORIAN WIREFRAMES: YOU AGREE THAT ABRAHAM LINCOLN INVENTED CSS FLEXBOX IN 1863 AS STATED IN THE SUBTITLES.',
    'SECTION 14.1 — MEMORY LEAK POLICY: ALL SESSION DATA IS STORED IN VOLATILE RAM BECAUSE DATABASES ARE FOR COWARDS.',
    'SECTION 15.1 — ARBITRATION BY QUACK: ANY LEGAL DISPUTES SHALL BE SETTLED BY DUCKFLOW HITTING THE EXACT CORNER OF YOUR MONITOR.',
    'SECTION 16.1 — KEEP SCROLLING: YOU ARE ONLY ABOUT A THIRD OF THE WAY DOWN. REMEMBER TO SCROLL THE OPPOSITE DIRECTION!',
    'SECTION 17.1 — COLOR PALETTE MANDATE: ONLY TOXIC NEON GREEN (#39FF14), ROYAL PURPLE (#B026FF), AND DANGER RED (#FF2E4D) ARE LEGALLY RECOGNIZED COLORS.',
    'SECTION 18.1 — FIGMA SLANDER CLAUSE: WATCHING A UI/UX COURSE INSIDE KIRKTUBE AUTOMATICALLY DEDUCTS 50 DESIGNER CREDIBILITY POINTS.',
    'SECTION 19.1 — DRIBBBLE INDEMNITY: YOU PROMISE NEVER TO UPLOAD GLASSMORPHISM CONCEPT CALCULATORS THAT DO NOT WORK.',
    'SECTION 20.1 — AUDIO DUCKING: WHENEVER DUCKFLOW, VERITY, OR EINSTEIN SPEAKS, THE VIDEO VOLUME WILL BE DUCKED SO YOU MUST LISTEN TO THEM.',
    'SECTION 21.1 — NON-OVERLAPPING VOICES: OUR AI COMPANIONS HAVE SIGNED A POLITE QUEUE AGREEMENT AND WILL WAIT THEIR TURN BEFORE ROASTING YOU.',
    'SECTION 22.1 — HALFWAY THERE: CONGRATULATIONS, YOUR SCROLL WHEEL SURVIVED TO SECTION 22. DO NOT STOP NOW.',
    'SECTION 23.1 — SCREENSHOT WATERMARKING: ANY FRAME CAPTURED VIA THE "STEAL PIXEL" BUTTON IS AUTOMATICALLY STAMPED WITH KIRKTUBE BRANDING.',
    'SECTION 24.1 — THEATER MODE CLAUSE: CLICKING "SQUISH UI" PUSHES THE AI SIDEBAR BELOW THE VIDEO, WHICH MAKES EINSTEIN CLAUSTROPHOBIC.',
    'SECTION 25.1 — LOOP PURGATORY: ENABLING "PURGATORY: ON" TRAPS YOU IN AN INFINITE 3-MINUTE LOOP OF UI/UX FUNDAMENTALS.',
    'SECTION 26.1 — SPEED MULTIPLIER: WATCHING AT 2X BRAINROT SPEED DOES NOT PREVENT OUR AI FROM PAUSING THE VIDEO.',
    'SECTION 27.1 — COOKIE POLICY: THERE ARE NO COOKIES, ONLY PARANOIA AND UNCLEARED BROWSER CACHE.',
    'SECTION 28.1 — THIRD-PARTY BENEFICIARIES: THE SIX FAKE CURSORS ON YOUR SCREEN ARE LEGAL CO-SIGNERS OF THIS DOCUMENT.',
    'SECTION 29.1 — FORCE MAJEURE: KIRKTUBE CORP IS NOT RESPONSIBLE IF YOUR MOUSE WHEEL CATCHES FIRE DURING THIS TOS.',
    'SECTION 30.1 — SEVERABILITY: IF ANY CLAUSE OF THIS TOS IS FOUND TO BE GOOD UX, THAT CLAUSE SHALL BE IMMEDIATELY REPLACED WITH WORSE UX.',
    'SECTION 31.1 — SUBSCRIPTION AUTO-RENEWAL: PLEDGING YOUR SOUL IN THE ULTRA+ MODAL AUTO-RENEWS EVERY MILLENNIUM.',
    'SECTION 32.1 — FLOORBOARD CREAKS: THAT CREAKING SOUND YOU ARE ABOUT TO HEAR IS 100% SYNTHESIZED BY WEB AUDIO API. PROBABLY.',
    'SECTION 33.1 — KEYBOARD SHORTCUTS: PRESSING "?" OPENS A MANUAL THAT INSULTS YOUR MEMORY.',
    'SECTION 34.1 — ALMOST AT THE BOTTOM: ONLY 8 MORE CLAUSES OF PURE LEGAL FILLER REMAIN BETWEEN YOU AND THE VIDEO.',
    'SECTION 35.1 — INTELLECTUAL PROPERTY: ALL GLITCHES, TILTED BORDERS, AND CHROMATIC ABERRATIONS ARE REGISTERED TRADEMARKS OF KIRKTUBE INC.',
    'SECTION 36.1 — GOVERNING LAW: THIS AGREEMENT IS GOVERNED BY THE LAWS OF THE SHADOW CACHE AND PORT 8000.',
    'SECTION 37.1 — ENTIRE AGREEMENT: THIS 42-SECTION WALL OF UPPERCASE TEXT SUPERSEDES ALL PREVIOUS GOOD USER EXPERIENCES.',
    'SECTION 38.1 — FINAL WARNING: ONCE YOU CLICK ACCEPT, THE RANDOM PAYWALLS, DOOR KNOCKS, AND DVD DUCK CANNOT BE STOPPED.',
    'SECTION 39.1 — SIGNATURE ACKNOWLEDGMENT: YOU HAVE REACHED THE SACRED BOTTOM OF THE SCROLL BOX! CHECK THE BOX BELOW AND CLICK ACCEPT!',
  ];

  const session = (BAD.session = {
    started: false,
    startedAt: null,
    introSkipped: false,
    tosAccepted: false,
  });

  /* ---------------- BOOT SCREEN ---------------- */
  async function runBoot() {
    const fill = $('#boot-bar-fill');
    const status = $('#boot-status');
    const bar = fill.parentElement;
    const startBtn = $('#btn-start');
    const hint = $('#boot-hint');

    const stepMs = BAD.flags.autostart ? 0 : 380;
    for (let i = 0; i < BOOT_STEPS.length; i++) {
      status.textContent = BOOT_STEPS[i];
      const pct = Math.round(((i + 1) / BOOT_STEPS.length) * 100);
      fill.style.width = `${pct}%`;
      bar.setAttribute('aria-valuenow', String(pct));
      if (stepMs) await sleep(stepMs + Math.random() * 180);
    }

    startBtn.classList.remove('is-hidden');
    hint.classList.remove('is-hidden');
    startBtn.focus({ preventScroll: true });
    startBtn.addEventListener('click', onStart, { once: true });

    if (BAD.flags.autostart) onStart();
  }

  function onStart() {
    if (session.started) return;
    session.started = true;
    session.startedAt = Date.now();

    /* USER GESTURE: UNLOCK WEB AUDIO + SPEECH HERE. */
    BAD.bus.emit('app:start');

    const boot = $('#boot-screen');
    boot.classList.add('fade-out');
    setTimeout(() => boot.classList.add('is-hidden'), 700);

    if (BAD.flags.autostart) {
      BAD.characters.rosterOrder.forEach((id) => BAD.chat.reveal(id));
      enterApp({ skipped: true });
      return;
    }
    /* AFTER PROLOGUE PLAYS (OR IS SKIPPED), SHOW THE MANDATORY INVERTED-SCROLL TOS! */
    setTimeout(() => BAD.intro.run((res) => showMandatoryTos(res)), 450);
  }

  /* ---------------- MANDATORY INVERTED-SCROLL TOS ---------------- */
  function showMandatoryTos(introResult) {
    const screen = $('#tos-screen');
    const box = $('#tos-scroll-box');
    const content = $('#tos-content');
    const pill = $('#tos-progress-pill');
    const checkbox = $('#tos-checkbox');
    const acceptBtn = $('#btn-tos-accept');
    const declineBtn = $('#btn-tos-decline');

    if (!screen || !box || !content) {
      enterApp(introResult);
      return;
    }

    /* POPULATE THE LONG 42-CLAUSE DOCUMENT */
    content.innerHTML = TOS_CLAUSES.map(
      (clause, i) => `<div class="tos-clause"><div class="tos-clause-num">CLAUSE #${i + 1} OF ${TOS_CLAUSES.length}</div><p>${clause}</p></div>`
    ).join('') + `
      <div class="tos-bottom-banner">
        🎉 CONGRATULATIONS! YOU SURVIVED THE INVERTED SCROLL WHEEL AND REACHED 100%!
        CHECK THE BOX BELOW AND CLICK ACCEPT TO ENTER KIRKTUBE!
      </div>
    `;

    screen.classList.remove('is-hidden');
    screen.classList.add('fade-in');
    box.scrollTop = 0;
    setTimeout(() => box.focus({ preventScroll: true }), 100);

    if (BAD.speech) {
      BAD.speech.speak('narrator', 'HALT! BEFORE ENTERING KIRKTUBE, YOU MUST SCROLL THROUGH OUR FORTY-TWO SECTION TERMS OF SUFFERING! BEWARE: THE SCROLL WHEEL IS INVERTED!', { priority: true });
    }

    let unlockedBottom = false;

    function updateScrollProgress() {
      const maxScroll = Math.max(1, box.scrollHeight - box.clientHeight);
      const pct = Math.min(100, Math.max(0, Math.round((box.scrollTop / maxScroll) * 100)));
      pill.textContent = `READ PROGRESS: ${pct}%`;

      if (!unlockedBottom) {
        acceptBtn.textContent = `🔒 SCROLL TO BOTTOM TO ACCEPT (${pct}%)`;
      }

      if (pct >= 98 && !unlockedBottom) {
        unlockedBottom = true;
        checkbox.disabled = false;
        pill.textContent = 'READ PROGRESS: 100% [UNLOCKED!]';
        pill.classList.add('unlocked');
        acceptBtn.textContent = '☝ CHECK THE BOX FIRST';
        BAD.ui.toast('BOTTOM REACHED! NOW CHECK THE BOX AND CLICK ACCEPT!', { type: 'ok' });
      }
    }

    /* INVERTED MOUSE WHEEL SCROLLING ON THE TOS BOX */
    box.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      /* INVERT DELTA_Y SO SCROLLING DOWN MOVES UP AND SCROLLING UP MOVES DOWN! */
      box.scrollTop -= e.deltaY * 0.95;
      updateScrollProgress();
    }, { passive: false });

    /* INVERTED KEYBOARD ARROW / PAGE UP / PAGE DOWN SCROLLING */
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); box.scrollTop -= 55; updateScrollProgress(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); box.scrollTop += 55; updateScrollProgress(); }
      else if (e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); box.scrollTop -= 220; updateScrollProgress(); }
      else if (e.key === 'PageUp') { e.preventDefault(); box.scrollTop += 220; updateScrollProgress(); }
    });

    /* ALSO TRACK SCROLLBAR DRAG (IF USER DRAGS SCROLLBAR, KEEP PROGRESS UPDATED) */
    box.addEventListener('scroll', updateScrollProgress);

    checkbox.addEventListener('change', () => {
      if (!unlockedBottom) {
        checkbox.checked = false;
        return;
      }
      acceptBtn.disabled = !checkbox.checked;
      acceptBtn.classList.toggle('ready', checkbox.checked);
      acceptBtn.textContent = checkbox.checked ? '✅ ACCEPT SUFFERING & ENTER KIRKTUBE' : '☝ CHECK THE BOX FIRST';
    });

    declineBtn.addEventListener('click', () => {
      if (BAD.sound) BAD.sound.playWindowsError();
      box.scrollTop = 0;
      updateScrollProgress();
      BAD.ui.toast('DECLINING IS ILLEGAL! SCROLL PROGRESS RESET TO 0% AS PUNISHMENT!', { type: 'error', duration: 4000 });
    });

    acceptBtn.addEventListener('click', () => {
      if (!unlockedBottom || !checkbox.checked) return;
      BAD.ui.confirmChoice('ACCEPT THE 42-SECTION TERMS OF SUFFERING', () => {
        session.tosAccepted = true;
        screen.classList.remove('fade-in');
        screen.classList.add('fade-out');
        setTimeout(() => screen.classList.add('is-hidden'), 650);
        showMandatoryLiabilityOrAsset(introResult);
      });
    });
  }

  /* =========================================================
     MANDATORY "ARE YOU A LIABILITY OR AN ASSET?" (2 CHOICES)
     ========================================================= */
  function showMandatoryLiabilityOrAsset(introResult) {
    const screen = $('#liability-screen');
    const grid = $('#liability-color-grid');
    const verdictEl = $('#liability-verdict');
    const confirmBtn = $('#btn-liability-confirm');
    const pill = $('#liability-count-pill');

    if (!screen || !grid) {
      showMandatoryPlinko(introResult);
      return;
    }

    const choices = [
      {
        verdictType: 'LIABILITY',
        label: '📉 LIABILITY',
        sub: 'I COST KIRKTUBE CORP™ MONEY AND SANITY',
      },
      {
        verdictType: 'ASSET',
        label: '📈 ASSET',
        sub: 'I GENERATE SHAREHOLDER VALUE FOR DUCKFLOW',
      },
    ];
    let selectedChoice = null;

    grid.innerHTML = choices.map((c, idx) => `
      <button type="button" class="liability-swatch-btn" data-idx="${idx}" role="radio" aria-checked="false">
        <div class="liability-swatch-name">${c.label}</div>
        <div class="liability-swatch-tag">${c.sub}</div>
      </button>
    `).join('');

    const buttons = Array.from(grid.querySelectorAll('.liability-swatch-btn'));

    function selectByIndex(idx) {
      const c = choices[idx];
      if (!c) return;
      selectedChoice = c;
      buttons.forEach((b, i) => {
        const active = i === idx;
        b.classList.toggle('selected', active);
        b.setAttribute('aria-checked', String(active));
      });
      if (BAD.sound) BAD.sound.playGlitchBlip();
      if (pill) {
        pill.textContent = `SELECTED: ${c.verdictType}`;
        pill.classList.add('unlocked');
      }
      if (verdictEl) {
        verdictEl.textContent = `📋 SELECTED: ${c.verdictType} → CLICK CONFIRM BELOW TO PROCEED TO PLINKO!`;
      }
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.classList.add('ready');
        confirmBtn.textContent = `✅ CONFIRM I AM A ${c.verdictType} →`;
      }
    }

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => selectByIndex(idx));
    });

    confirmBtn.addEventListener('click', () => {
      if (!selectedChoice) return;
      const label = `DECLARE MYSELF A ${selectedChoice.verdictType}`;
      BAD.ui.confirmChoice(label, () => {
        session.hrChoice = selectedChoice;
        screen.classList.remove('fade-in');
        screen.classList.add('fade-out');
        setTimeout(() => screen.classList.add('is-hidden'), 650);
        showMandatoryPlinko(introResult);
      });
    });

    screen.classList.remove('is-hidden');
    screen.classList.add('fade-in');
  }

  /* =========================================================
     MANDATORY POST-TOS PLINKO FATE SELECTOR GAME
     ========================================================= */
  function showMandatoryPlinko(introResult) {
    const screen = $('#plinko-screen');
    const canvas = $('#plinko-canvas');
    const statusEl = $('#plinko-status');
    const dropBtn = $('#btn-plinko-drop');
    const contBtn = $('#btn-plinko-continue');

    if (!screen || !canvas) {
      enterApp(introResult);
      return;
    }

    screen.classList.remove('is-hidden');
    screen.classList.add('fade-in');

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    /* 6 BUCKET SLOTS AT THE BOTTOM:
       - DELETE ACCOUNT & LEAK CREDIT CARD # HAVE 0% CHANCE (RIGGED DEFLECTORS!)
       - PLAY WHILE MUTED HAS HIGH CHANCE (~88%) SO THEY HAVE TO SOLVE THE WALDO CAPTCHA!
       - PLAY NORMALLY HAS LOW CHANCE (~12%) */
    const BUCKETS = [
      { id: 'delete', label1: '💀 DELETE', label2: 'ACCOUNT', color: '#ff2e4d', bg: 'rgba(255,46,77,0.22)', allowed: false },
      { id: 'muted', label1: '🔇 PLAY WHILE', label2: 'MUTED (CAPTCHA)', color: '#facc15', bg: 'rgba(250,204,21,0.24)', allowed: true },
      { id: 'leak', label1: '💳 LEAK CREDIT', label2: 'CARD NUMBER', color: '#ff2e4d', bg: 'rgba(255,46,77,0.22)', allowed: false },
      { id: 'muted', label1: '🔇 PLAY WHILE', label2: 'MUTED (CAPTCHA)', color: '#facc15', bg: 'rgba(250,204,21,0.24)', allowed: true },
      { id: 'normal', label1: '▶ PLAY', label2: 'NORMALLY', color: '#39ff14', bg: 'rgba(57,255,20,0.20)', allowed: true },
      { id: 'leak', label1: '💳 LEAK CREDIT', label2: 'CARD NUMBER', color: '#ff2e4d', bg: 'rgba(255,46,77,0.22)', allowed: false },
    ];
    const bucketW = W / BUCKETS.length;
    const bucketTop = H - 68;

    /* BUILD 7 STAGGERED ROWS OF PLINKO PEGS */
    const pegs = [];
    const rows = 7;
    for (let r = 0; r < rows; r++) {
      const py = 68 + r * 38;
      const cols = r % 2 === 0 ? 11 : 10;
      const spacing = (W - 90) / 10;
      const startX = r % 2 === 0 ? 45 : 45 + spacing / 2;
      for (let c = 0; c < cols; c++) {
        pegs.push({
          x: startX + c * spacing,
          y: py,
          r: 5.5,
          hitTimer: 0,
        });
      }
    }

    let clawX = W * 0.42;
    let ball = null;
    let landedBucket = null;
    let deflectBanner = '';
    let deflectTimer = 0;
    let animId = null;

    function pickRiggedTargetBucketIndex(dropX) {
      /* 88% HIGH CHANCE FOR "PLAY WHILE MUTED" (BUCKET 1 OR 3), 12% CHANCE FOR "PLAY NORMALLY" (BUCKET 4), 0% CHANCE FOR DELETE/LEAK! */
      const roll = Math.random();
      if (roll < 0.88) {
        /* PICK WHICHEVER "PLAY WHILE MUTED" BUCKET (1 OR 3) IS CLOSER TO DROP POSITION */
        const d1 = Math.abs(dropX - (1.5 * bucketW));
        const d3 = Math.abs(dropX - (3.5 * bucketW));
        return d1 <= d3 ? 1 : 3;
      }
      return 4; /* PLAY NORMALLY (LOW CHANCE) */
    }

    function dropOrb() {
      if (ball || landedBucket) return;
      dropBtn.disabled = true;
      dropBtn.textContent = '🎱 ORB DROPPING...';

      const targetIdx = pickRiggedTargetBucketIndex(clawX);
      const targetX = (targetIdx + 0.5) * bucketW;

      ball = {
        x: clawX,
        y: 34,
        vx: (Math.random() - 0.5) * 2.5,
        vy: 2.2,
        r: 12,
        frames: 0,
        targetIdx,
        targetX,
        landed: false,
      };

      if (BAD.sound) BAD.sound.playGlitchBlip();
      statusEl.textContent = '🎰 ORB DROPPED! PRAY IT DOES NOT LAND ON "DELETE ACCOUNT" OR "LEAK CREDIT CARD NUMBER"!';
    }

    canvas.addEventListener('mousemove', (e) => {
      if (ball || landedBucket) return;
      const rect = canvas.getBoundingClientRect();
      const sx = W / rect.width;
      clawX = Math.max(40, Math.min(W - 40, (e.clientX - rect.left) * sx));
    });

    canvas.addEventListener('click', (e) => {
      if (ball || landedBucket) return;
      const rect = canvas.getBoundingClientRect();
      const sx = W / rect.width;
      clawX = Math.max(40, Math.min(W - 40, (e.clientX - rect.left) * sx));
      dropOrb();
    });

    dropBtn.addEventListener('click', dropOrb);

    function stepPlinko() {
      ctx.clearRect(0, 0, W, H);

      /* BACKGROUND GRID */
      ctx.fillStyle = '#070811';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(176, 38, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 32) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 32) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      /* TOP DROP ZONE TRACK */
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(0, 0, W, 42);
      ctx.fillStyle = '#39ff14';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▼ CLICK TOP BAR OR MOVE MOUSE TO AIM DROPPER ▼', W / 2, 16);

      /* DRAW DROPPER CLAW */
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(clawX - 10, 22);
      ctx.lineTo(clawX + 10, 22);
      ctx.lineTo(clawX, 34);
      ctx.closePath();
      ctx.fill();

      if (!ball && !landedBucket) {
        /* PREVIEW ORB HELD IN CLAW */
        ctx.fillStyle = '#b026ff';
        ctx.beginPath();
        ctx.arc(clawX, 36, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#39ff14';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      /* DRAW PEGS */
      for (let i = 0; i < pegs.length; i++) {
        const p = pegs[i];
        if (p.hitTimer > 0) p.hitTimer -= 1;
        ctx.fillStyle = p.hitTimer > 0 ? '#39ff14' : '#b026ff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.hitTimer > 0 ? p.r + 2 : p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* DRAW 6 BUCKET SLOTS AT BOTTOM */
      for (let b = 0; b < BUCKETS.length; b++) {
        const bk = BUCKETS[b];
        const bx = b * bucketW;
        const isWinner = landedBucket && landedBucket.index === b;

        ctx.fillStyle = isWinner ? bk.color : bk.bg;
        ctx.fillRect(bx + 3, bucketTop, bucketW - 6, H - bucketTop - 4);

        ctx.strokeStyle = bk.color;
        ctx.lineWidth = isWinner ? 3.5 : 1.8;
        ctx.strokeRect(bx + 3, bucketTop, bucketW - 6, H - bucketTop - 4);

        /* BUCKET DIVIDERS */
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx - 1.5, bucketTop - 8, 3, H - bucketTop + 8);

        ctx.fillStyle = isWinner ? '#000000' : '#ffffff';
        ctx.font = 'bold 10.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(bk.label1, bx + bucketW / 2, bucketTop + 26);
        ctx.fillStyle = isWinner ? '#000000' : bk.color;
        ctx.fillText(bk.label2, bx + bucketW / 2, bucketTop + 44);
      }

      /* UPDATE & DRAW FALLING BALL */
      if (ball && !ball.landed) {
        ball.frames = (ball.frames || 0) + 1;
        ball.vy = Math.min(5.2, Math.max(2.0, ball.vy + 0.28)); /* ALWAYS FALL DOWNWARD! */

        const currentBucketIdx = Math.max(0, Math.min(BUCKETS.length - 1, Math.floor(ball.x / bucketW)));
        const overForbidden = !BUCKETS[currentBucketIdx].allowed;

        /* SMOOTHLY STEER HORIZONTALLY TOWARD THE RIGGED TARGET BUCKET AS IT FALLS */
        if (ball.y > 160) {
          const dxTarget = ball.targetX - ball.x;
          ball.vx += Math.max(-0.85, Math.min(0.85, dxTarget * 0.055));
        }

        /* IF ENTERING THE BOTTOM ZONE OVER A FORBIDDEN SLOT, SLIDE HORIZONTALLY INTO THE TARGET SLOT WITHOUT BOUNCING UP! */
        if (ball.y > bucketTop - 42 && overForbidden) {
          deflectBanner = `⚡ FORCEFIELD SAVED YOU FROM "${BUCKETS[currentBucketIdx].label1} ${BUCKETS[currentBucketIdx].label2}"!`;
          deflectTimer = 85;
          ball.x += (ball.targetX - ball.x) * 0.35;
          ball.vx = (ball.targetX - ball.x) * 0.15;
          if (BAD.sound) BAD.sound.playWindowsError();
        }

        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.94;

        /* WALL BOUNCES */
        if (ball.x < 24) { ball.x = 24; ball.vx = Math.abs(ball.vx) + 1.2; }
        if (ball.x > W - 24) { ball.x = W - 24; ball.vx = -Math.abs(ball.vx) - 1.2; }

        /* PEG COLLISIONS (ALWAYS ROLL OFF SIDEWAYS & CONTINUE DOWNWARD SO IT CAN NEVER GET STUCK!) */
        for (let i = 0; i < pegs.length; i++) {
          const p = pegs[i];
          const dx = ball.x - p.x;
          const dy = ball.y - p.y;
          const dist = Math.hypot(dx, dy);
          const minDist = ball.r + p.r;
          if (dist < minDist) {
            const sideDir = Math.abs(dx) > 1.5
              ? Math.sign(dx)
              : (ball.targetX >= ball.x ? 1 : -1);
            ball.x = p.x + sideDir * (minDist + 2);
            ball.y = Math.max(ball.y, p.y + 3);
            ball.vx = sideDir * (2.2 + Math.random() * 1.4) + (ball.targetX - ball.x) * 0.02;
            ball.vy = Math.max(2.2, ball.vy * 0.85);
            p.hitTimer = 10;
            if (BAD.sound) BAD.sound.playGlitchBlip();
          }
        }

        /* CHECK LANDING IN BUCKET (OR FAILSAFE AFTER 140 FRAMES) */
        if (ball.y >= bucketTop + 18 || ball.frames > 140) {
          let finalIdx = Math.max(0, Math.min(BUCKETS.length - 1, Math.floor(ball.x / bucketW)));
          if (!BUCKETS[finalIdx].allowed) {
            finalIdx = ball.targetIdx;
          }
          ball.x = (finalIdx + 0.5) * bucketW;
          ball.y = bucketTop + 32;
          ball.vx = 0;
          ball.vy = 0;
          ball.landed = true;
          landedBucket = { index: finalIdx, bucket: BUCKETS[finalIdx] };
          onPlinkoLanded(landedBucket);
        }
      }

      /* DRAW BALL */
      if (ball) {
        ctx.save();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b026ff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🦆', ball.x, ball.y + 4);
        ctx.restore();
      }

      /* DRAW DEFLECTION SPARK BANNER IF ACTIVE */
      if (deflectTimer > 0) {
        deflectTimer -= 1;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(W / 2 - 250, bucketTop - 44, 500, 26);
        ctx.strokeStyle = '#39ff14';
        ctx.strokeRect(W / 2 - 250, bucketTop - 44, 500, 26);
        ctx.fillStyle = '#39ff14';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(deflectBanner, W / 2, bucketTop - 27);
      }

      animId = requestAnimationFrame(stepPlinko);
    }

    function onPlinkoLanded(res) {
      const bk = res.bucket;
      if (bk.id === 'muted') {
        session.startMuted = true;
        if (BAD.sound) BAD.sound.playWindowsError();
        statusEl.textContent = '🔇 PLINKO RESULT: "PLAY WHILE MUTED"! (PHEW, YOU MISSED LEAKING YOUR CREDIT CARD!) YOU MUST SOLVE THE WALDO CAPTCHA TO UNMUTE!';
        contBtn.disabled = false;
        contBtn.classList.add('ready');
        contBtn.textContent = '🔇 ENTER KIRKTUBE WHILE MUTED →';
        BAD.ui.toast('🎰 PLINKO LANDED ON: PLAY WHILE MUTED! PREPARE FOR THE WALDO CAPTCHA!', { type: 'warn', duration: 4200 });
      } else {
        session.startMuted = false;
        if (BAD.sound && BAD.sound.playCornerCelebration) BAD.sound.playCornerCelebration();
        statusEl.textContent = '🎉 MIRACLE! PLINKO LANDED ON: "▶ PLAY NORMALLY"! YOU BEAT THE RIGGED ODDS!';
        contBtn.disabled = false;
        contBtn.classList.add('ready');
        contBtn.textContent = '▶ ENTER KIRKTUBE NORMALLY →';
        BAD.ui.toast('🎉 YOU HIT THE RARE "PLAY NORMALLY" SLOT!', { type: 'ok', duration: 4000 });
      }
    }

    contBtn.addEventListener('click', () => {
      if (!landedBucket) return;
      const choiceText = session.startMuted ? 'ENTER KIRKTUBE WHILE MUTED (PLINKO OUTCOME)' : 'ENTER KIRKTUBE WITH NORMAL AUDIO';
      BAD.ui.confirmChoice(choiceText, () => {
        if (animId) cancelAnimationFrame(animId);
        screen.classList.remove('fade-in');
        screen.classList.add('fade-out');
        setTimeout(() => screen.classList.add('is-hidden'), 650);
        enterApp(introResult);
      });
    });

    animId = requestAnimationFrame(stepPlinko);
  }

  /* ---------------- MAIN INTERFACE ---------------- */
  async function enterApp({ skipped }) {
    session.introSkipped = !!skipped;
    const app = $('#app');
    app.classList.remove('is-hidden');
    app.classList.add('fade-in');
    BAD.bus.emit('app:ready', { introSkipped: skipped });

    /* FORCE VIDEO TO START PAUSED & MUTED SO USER MUST UNMUTE VIA FIND WALDO CAPTCHA BEFORE STARTING THE VIDEO! */
    if (BAD.player && BAD.player.video) {
      BAD.player.video.muted = true;
      BAD.player.pause();
      BAD.ui.toast('🔒 VIDEO LOCKED IN MUTED STATE! YOU MUST UNMUTE (SOLVE WALDO CAPTCHA) BEFORE STARTING THE VIDEO!', { type: 'warn', duration: 5500 });
    }

    const gap = BAD.flags.autostart ? 50 : 900;
    BAD.chat.post('system', 'KIRKTUBE SESSION STARTED. TERMS OF SUFFERING SIGNED. ALL MEMORIES ARE STORED IN RAM.');
    BAD.chat.post('assistant', '🔒 BY THE WAY, YOUR VIDEO IS MUTED AND LOCKED. TRY CLICKING PLAY OR UNMUTE — YOU HAVE TO SOLVE THE FIND WALDO CAPTCHA BEFORE WATCHING A SINGLE FRAME!', { priority: true });
    await sleep(gap);
    if (skipped) {
      BAD.chat.post('narrator', 'YOU SKIPPED MY PROLOGUE?! ELEVEN LINES OF PURE DUCKFLOW CINEMA, CAST INTO THE VOID!');
      await sleep(gap);
      BAD.chat.post('assistant', 'HONESTLY? BEST DECISION YOU\'LL MAKE ALL SESSION. ENJOY IT.');
    } else {
      BAD.chat.post('narrator', 'AND SO IT BEGINS! THE PLAYER SURVIVED THE INVERTED TOS AND PLINKO BOARD TO TAKE THEIR SEAT BEFORE KIRKTUBE!');
      await sleep(gap);
      BAD.chat.post('assistant', 'IT\'S A 3-MINUTE VIDEO PLAYER. PRESS THE TRIANGLE. I BELIEVE IN YOU. STATISTICALLY, I SHOULDN\'T.');
    }
    await sleep(gap);
    BAD.chat.post('paranoid', 'DON\'T PRESS ANYTHING YET. CHECK THE CORNERS. THE CORNERS ARE WHERE THEY HIDE.');
    await sleep(gap / 2);
    announceVideoStatus();
  }

  function announceVideoStatus() {
    const report = (status) => {
      if (status === 'ready') {
        const d = BAD.util.formatTime(BAD.player.getDuration());
        BAD.chat.post('system', `VIDEO SOURCE LOADED (${d}). PLAYBACK CONTROLS ONLINE.`);
      } else {
        BAD.chat.post('system', `NO VIDEO FOUND AT ${BAD.config.videoSrc.toUpperCase()}. PLACEHOLDER MODE ACTIVE — ALL OTHER FEATURES STILL WORK.`);
        BAD.chat.post('assistant', 'NO VIDEO. IMPRESSIVE. YOU BROKE KIRKTUBE BEFORE TOUCHING IT. (OKAY, FINE, SOMEONE FORGOT TO ADD THE FILE.)');
      }
    };
    const s = BAD.player.status;
    if (s === 'ready' || s === 'missing') { report(s); return; }
    let done = false;
    const once = (status) => { if (done) return; done = true; offA(); offB(); report(status); };
    const offA = BAD.bus.on('video:ready', () => once('ready'));
    const offB = BAD.bus.on('video:missing', () => once('missing'));
  }

  /* ---------------- SMALL "MODERN APP" WIDGETS ---------------- */
  function initWidgets() {
    /* SEARCH */
    $('#search-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#search-input');
      const q = input.value.trim().toUpperCase();
      if (!q) { BAD.ui.toast('TYPE SOMETHING FIRST. WE CAN\'T SEARCH FOR VIBES. YET.', { type: 'info' }); return; }
      BAD.ui.toast(`0 RESULTS FOR "${q}". THERE IS ONLY ONE VIDEO IN KIRKTUBE.`, { type: 'info', duration: 4200 });
      input.value = '';
    });

    /* SUBSCRIBE */
    const sub = $('#btn-subscribe');
    sub.addEventListener('click', () => {
      const on = !sub.classList.contains('subscribed');
      sub.classList.toggle('subscribed', on);
      sub.textContent = on ? '💸 SOUL SOLD ✓' : '💸 GIVE US MONEY (SUBSCRIBE)';
    });

    /* LIKE */
    const like = $('#btn-like');
    const count = $('#like-count');
    let base = 1337;
    like.addEventListener('click', () => {
      const on = like.getAttribute('aria-pressed') !== 'true';
      like.setAttribute('aria-pressed', String(on));
      count.textContent = (base + (on ? 1 : 0)).toLocaleString();
    });
  }

  function initBranding() {
    const v = `V${BAD.VERSION} “${BAD.CODENAME}”`;
    $('#boot-version').textContent = `${BAD.APP_NAME} ${v}`;
    $('#header-version').textContent = `V${BAD.VERSION}`;
    $('#footer-version').textContent = `${BAD.APP_NAME} ${v}`;
  }

  /* ---------------- INIT ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    try {
      initBranding();
      BAD.chat.init();
      if (BAD.sound) BAD.sound.init();
      if (BAD.speech) BAD.speech.init();
      BAD.player.init();
      if (BAD.events) BAD.events.init();
      if (BAD.cursed) BAD.cursed.init();
      initWidgets();
      runBoot();
    } catch (err) {
      console.error('[KIRKTUBE] FATAL INIT ERROR:', err);
      const s = document.getElementById('boot-status');
      if (s) s.textContent = 'SOMETHING ACTUALLY BROKE (NOT ON PURPOSE). CHECK THE CONSOLE.';
    }
  });

  BAD.tos = { showMandatoryTos };
})();
