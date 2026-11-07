/* =========================================================
   KIRKTUBE — VIDEOPLAYER.JS
   PHASE 2 FULL CUSTOM VIDEO PLAYER:
   - PLAY / PAUSE (HARD RESTRICTION: PLAY BUTTON NEVER MOVES!)
   - VOLUME SLIDER & MUTE
   - PLAYBACK SPEED (0.5X, 1X, 1.25X, 1.5X, 2X)
   - LOOP / REPEAT
   - SUBTITLES (PARSES ASSETS/SUBTITLES.VTT + EMITS CUE EVENTS)
   - FRAME-BY-FRAME STEPPING (1/30S)
   - SCREENSHOT CAPTURE (CANVAS + DOWNLOAD + FLASH)
   - PICTURE-IN-PICTURE (NATIVE API)
   - THEATER MODE & FULLSCREEN
   - SEEKABLE TIMELINE WITH HOVER PREVIEW & AI EVENT MARKERS
   - KEYBOARD SHORTCUTS & TERRIBLE HELP PANEL
   ALL COMMENTS AND USER-FACING STRINGS ARE UPPERCASE.
   ========================================================= */
(function () {
  'use strict';

  const BAD = window.BAD;
  const { $, clamp, formatTime } = BAD.util;

  const SPEEDS = [0.5, 1, 1.25, 1.5, 2];
  const FRAME_STEP = 1 / 30;

  const P = {
    status: 'idle', /* IDLE | LOADING | READY | MISSING */
    src: null,
    loadTimer: null,
    speedIndex: 1,
    ccEnabled: true,
    theater: false,
    cues: [],
    activeCueIndex: -1,
    markers: [],
    els: {},
  };

  function init() {
    const els = (P.els = {
      appMain: $('#app-main'),
      shell: $('#player-shell'),
      wrap: $('#video-wrap'),
      video: $('#video'),
      loading: $('#video-loading'),
      placeholder: $('#video-placeholder'),
      phPath: $('#ph-path'),
      phReason: $('#ph-reason'),
      retry: $('#btn-retry-video'),
      bigPlay: $('#big-play'),
      play: $('#btn-play'),
      framePrev: $('#btn-frame-prev'),
      frameNext: $('#btn-frame-next'),
      mute: $('#btn-mute'),
      muteLabel: $('#mute-btn-label'),
      volSlider: $('#vol-slider'),
      gravityWrap: $('#gravity-vol-wrap'),
      gravityBeam: $('#gravity-vol-beam'),
      tiltLeft: $('#btn-tilt-left'),
      tiltRight: $('#btn-tilt-right'),
      volPump: $('#btn-vol-pump'),
      volReadout: $('#vol-gravity-readout'),
      waldoModal: $('#waldo-captcha-modal'),
      waldoCanvas: $('#waldo-canvas'),
      waldoMisses: $('#waldo-miss-counter'),
      waldoStatus: $('#waldo-status-text'),
      waldoReshuffle: $('#btn-waldo-reshuffle'),
      waldoStayMuted: $('#btn-waldo-stay-muted'),
      waldoSkip: $('#btn-waldo-skip'),
      progress: $('#progress'),
      fill: $('#progress-fill'),
      buffer: $('#progress-buffer'),
      markers: $('#progress-markers'),
      thumb: $('#progress-thumb'),
      hover: $('#progress-hover'),
      hoverTime: $('#progress-hover-time'),
      hoverTag: $('#progress-hover-tag'),
      time: $('#time-display'),
      speed: $('#btn-speed'),
      loop: $('#btn-loop'),
      cc: $('#btn-cc'),
      screenshot: $('#btn-screenshot'),
      pip: $('#btn-pip'),
      theater: $('#btn-theater'),
      fullscreen: $('#btn-fullscreen'),
      shortcutsBtn: $('#btn-shortcuts'),
      shortcutsModal: $('#shortcuts-modal'),
      closeShortcuts: $('#btn-close-shortcuts'),
      flash: $('#screenshot-flash'),
      subBox: $('#subtitle-box'),
      subReact: $('#subtitle-ai-react'),
      status: $('#player-status'),
    });
    if (!els.video) { console.error('[PLAYER] <VIDEO> ELEMENT MISSING'); return; }

    const v = els.video;
    v.controls = false; /* CUSTOM CONTROLS ONLY */

    /* HIDE NATIVE BROWSER SUBTITLE RENDERING SO OUR CUSTOM OVERLAY HANDLES IT CLEANLY */
    if (v.textTracks && v.textTracks[0]) {
      v.textTracks[0].mode = 'hidden';
    }

    v.addEventListener('loadedmetadata', onReady);
    v.addEventListener('error', () => onMissing(describeError(v.error)));
    v.addEventListener('play', syncPlayState);
    v.addEventListener('pause', syncPlayState);
    v.addEventListener('ended', syncPlayState);
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('progress', syncBuffer);
    v.addEventListener('durationchange', () => { syncProgress(); renderMarkers(); });
    v.addEventListener('volumechange', syncVolume);
    v.addEventListener('click', togglePlay);

    els.retry.addEventListener('click', () => load(BAD.config.videoSrc, true));
    els.bigPlay.addEventListener('click', togglePlay);
    els.play.addEventListener('click', togglePlay);
    els.framePrev.addEventListener('click', () => stepFrame(-1));
    els.frameNext.addEventListener('click', () => stepFrame(1));
    els.mute.addEventListener('click', toggleMute);
    els.speed.addEventListener('click', cycleSpeed);
    els.loop.addEventListener('click', toggleLoop);
    els.cc.addEventListener('click', toggleSubtitles);
    els.screenshot.addEventListener('click', captureScreenshot);
    els.pip.addEventListener('click', togglePiP);
    els.theater.addEventListener('click', toggleTheater);
    els.fullscreen.addEventListener('click', toggleFullscreen);
    els.shortcutsBtn.addEventListener('click', toggleShortcutsModal);
    els.closeShortcuts.addEventListener('click', () => toggleShortcutsModal(false));

    els.progress.addEventListener('click', onSeekClick);
    els.progress.addEventListener('mousemove', onProgressHover);
    els.progress.addEventListener('mouseleave', () => els.hover.classList.add('is-hidden'));

    document.addEventListener('keydown', onKeyDown);

    initGravityVolume();
    initWaldoCaptcha();

    syncPlayState();
    syncVolume();
    loadSubtitles(BAD.config.subtitlesSrc);
    load(BAD.config.videoSrc);
  }

  /* ---------------- SUBTITLES PARSER (WITH INLINE FILE:// FALLBACK FOR PORTABILITY) ---------------- */
  const INLINE_VTT_FALLBACK = `WEBVTT

00:00:02.040 --> 00:00:03.909
SO YOU KNOW FIGMA BUT YOU WANT TO KNOW

00:00:03.919 --> 00:00:06.110
HOW TO DESIGN A WEBSITE APP GAME OR ANY

00:00:06.120 --> 00:00:08.270
OTHER PRODUCT UI DESIGN TOOLS ARE EASY

00:00:08.280 --> 00:00:10.230
TO LEARN AND HARD TO MASTER WHAT HELPS

00:00:10.240 --> 00:00:12.110
YOU MASTER THEM IS KNOWING WHAT EXACTLY

00:00:12.120 --> 00:00:14.310
YOU NEED TO DO SO LET'S LEARN UI AND UX

00:00:14.320 --> 00:00:16.510
DESIGN NO JUST WHAT YOU NEED TO

00:00:16.520 --> 00:00:18.590
GET STARTED FUNDAMENTALS STANDARD

00:00:18.600 --> 00:00:20.670
PROCEDURES AND HELPFUL RESOURCES A

00:00:20.680 --> 00:00:22.590
DESIGN STARTS WITH A MAIN IDEA SOLUTION

00:00:22.600 --> 00:00:24.990
TO A PROBLEM OR A USE CASE FOR EXAMPLE I

00:00:25.000 --> 00:00:26.669
REALLY NEEDED A WEB APPLICATION TO

00:00:26.679 --> 00:00:28.630
COLLECT ELEMENT SPECIFIC DESIGNS LIKE

00:00:28.640 --> 00:00:30.470
THESE SO DESIGNERS AND VEL OPERS LIKE

00:00:30.480 --> 00:00:32.310
YOU AND ME CAN FIND INSPIRATION GOT A

00:00:32.320 --> 00:00:34.950
GOOD IDEA LET'S GO STEP BY STEP STEP ONE

00:00:34.960 --> 00:00:36.990
USER FLOW THE PEOPLE YOU HOPE TO USE

00:00:37.000 --> 00:00:38.709
YOUR PRODUCT PROBABLY HAVE CERTAIN

00:00:38.719 --> 00:00:40.270
EXPECTATIONS THEY'RE LOOKING FOR SOME

00:00:40.280 --> 00:00:42.069
INFO WHEN TO BUY SOMETHING OR JUST USE

00:00:42.079 --> 00:00:43.869
THE SERVICE YOU NEED TO MAP OUT THAT

00:00:43.879 --> 00:00:45.549
MAIN JOURNEY FROM THE MOMENT THEY LAND

00:00:45.559 --> 00:00:47.630
ON YOUR SIDE TILL THAT KEY OBJECTIVE IS

00:00:47.640 --> 00:00:49.430
ACHIEVED IN THIS PROJECT FOR EXAMPLE

00:00:49.440 --> 00:00:51.270
WHEN USERS LAND ON THE SITE THEY SHOULD

00:00:51.280 --> 00:00:52.950
IMMEDIATELY FIND THE CATEGORY AND THE

00:00:52.960 --> 00:00:55.189
WEBSITES IN IT WE CALL THIS A USERFLOW

00:00:55.199 --> 00:00:57.750
DIAGRAM STEP TWO WIREFRAMING FROM THE

00:00:57.760 --> 00:00:59.950
USER FLOW DIAGRAM WE'LL TRY TO CREATE C

00:00:59.960 --> 00:01:02.389
RESPONDING SCREENS OR PAGES EACH PAGE OR

00:01:02.399 --> 00:01:03.790
SCREEN IS SUPPOSED TO CONTRIBUTE TO

00:01:03.800 --> 00:01:05.670
REACHING THAT KEY OBJECTIVE IN A WAY IF

00:01:05.680 --> 00:01:07.710
USERS ARE SUPPOSED TO SHOP FOR SOMETHING

00:01:07.720 --> 00:01:09.710
THEN THERE'S A STORE PAGE PRODUCT PAGE

00:01:09.720 --> 00:01:12.149
CARD PAYMENT PAGE AND SUCCESS PAGE YOU

00:01:12.159 --> 00:01:13.950
CAN START DRAWING LAYOUTS FOR DIFFERENT

00:01:13.960 --> 00:01:16.310
SCREENS IN THE FORM OF WIREFRAMES WHICH

00:01:16.320 --> 00:01:18.910
REQUIRES REAL HARD THINKING AND ANALYSIS

00:01:18.920 --> 00:01:21.550
OF USER BEHAVIOR BACK IN 1800S WE USED

00:01:21.560 --> 00:01:23.510
PEN AND PAPER TO DRAW WIREFRAMES BUT

00:01:23.520 --> 00:01:25.230
THANKS TO TECHNOLOGY NOWADAYS WE'RE

00:01:25.240 --> 00:01:26.830
LUCKY ENOUGH TO DO THEM ON TOOLS LIKE

00:01:26.840 --> 00:01:29.190
BALSAMIC ENVISION FREEHAND OR JUST FAKE

00:01:29.200 --> 00:01:31.469
MOT FAKE JAM LIKE A NORMAL PERSON FOR

00:01:31.479 --> 00:01:33.270
EXAMPLE IN THIS PROJECT WE WANT A SIMPLE

00:01:33.280 --> 00:01:35.030
AND A STRAIGHT TO THE POINT DESIGN SO

00:01:35.040 --> 00:01:36.950
JUST ONE SINGLE SCREEN WE NEED SOME

00:01:36.960 --> 00:01:38.830
NAVIGATION IN THE HEADER AND FOOTER OUR

00:01:38.840 --> 00:01:40.749
MAIN GOAL IS SHOWING USERS DESIGNS IN

00:01:40.759 --> 00:01:42.350
DIFFERENT CATEGORIES HOW COULD WE

00:01:42.360 --> 00:01:44.190
IMPLEMENT THAT MAYBE A LITTLE DROP- DOWN

00:01:44.200 --> 00:01:47.230
MENU A FILTER H IT HAS TO BE SIMPLER AND

00:01:47.240 --> 00:01:49.190
MORE ACCESSIBLE LIKE RIGHT IN FRONT OF

00:01:49.200 --> 00:01:51.429
EVERYONE'S EYES HOW ABOUT JUST A SIMPLE

00:01:51.439 --> 00:01:53.910
SIDEBAR WITH THE CATEGORIES LIKE FONT

00:01:53.920 --> 00:01:55.429
AWESOME FOR EXAMPLE THAT'S A GOOD

00:01:55.439 --> 00:01:57.310
INSPIRATION WE ALSO WANT TO SHOWCASE

00:01:57.320 --> 00:01:59.670
DIFFERENT DESIGNS A LOT OF THEM ON THIS

00:01:59.680 --> 00:02:01.590
REMAIN SIDE WE HAVE SEVERAL SOURCES OF

00:02:01.600 --> 00:02:03.230
INSPIRATION FOR THIS THAT HAVE PROVEN TO

00:02:03.240 --> 00:02:05.510
WORK LIKE DRIBBLE SO WE NEED OUR DESIGNS

00:02:05.520 --> 00:02:07.670
IN A LITTLE GRID OVER HERE AND THIS GRID

00:02:07.680 --> 00:02:09.109
SHOULD HAVE A LINK TO THE SOURCE OF THE

00:02:09.119 --> 00:02:11.350
DESIGN ITS NAME AND JUST A SIMPLE IMAGE

00:02:11.360 --> 00:02:13.390
PREVIEW WHAT WE JUST DID WAS A BRIEF

00:02:13.400 --> 00:02:15.990
VERSION OF USER EXPERIENCE OR UX DESIGN

00:02:16.000 --> 00:02:17.830
IT CAN BE EXTENDED AND HAVE YOU GO

00:02:17.840 --> 00:02:19.830
THROUGH OTHER STEPS AS WELL DEPENDING ON

00:02:19.840 --> 00:02:22.030
HOW COMPLICATED YOUR PROJECT IS STEP

00:02:22.040 --> 00:02:23.949
THREE DESIGN SYSTEM THIS MARKS THE

00:02:23.959 --> 00:02:25.830
BEGINNING OF OUR USER INTERFACE OR UI

00:02:25.840 --> 00:02:27.509
DESIGN JOURNEY WHERE WE DEAL WITH

00:02:27.519 --> 00:02:29.910
VISUALS EVERY DESIGN PROJECT IS LED BY

00:02:29.920 --> 00:02:31.750
GUIDELINE THAT SPECIFIES REUSABLE

00:02:31.760 --> 00:02:33.869
COMPONENTS AS YOU CAN IMAGINE THIS MAKES

00:02:33.879 --> 00:02:36.030
EVERYTHING CONSISTENT LIKE COLORS FONTS

00:02:36.040 --> 00:02:39.309
BUTTONS FORMS BOXES CARDS ICONS AND SO

00:02:39.319 --> 00:02:42.630
ON IT CAN BE VERY BIG OR VERY SMALL LIKE

00:02:42.640 --> 00:02:44.350
THE ONE WE HAVE HERE STARTING WITH

00:02:44.360 --> 00:02:46.149
COLORS THEY SHOULD REFLECT YOUR PROJECTS

00:02:46.159 --> 00:02:48.710
INDUSTRY VALUE OR BRAND IDENTITY MEANING

00:02:48.720 --> 00:02:51.390
LOGO PRODUCT OR BRAND COLORS FOR THIS

00:02:51.400 --> 00:02:52.990
PROJECT I JUST KNOW I WANT IT TO BE IN

00:02:53.000 --> 00:02:54.990
DARK MODE WITH MOSTLY NEUTRAL COLORS

00:02:55.000 --> 00:02:57.430
LIKE BLACK WHITE AND GRAY AND MAYBE ONE

00:02:57.440 --> 00:02:59.430
PRIMARY VIVID COLOR I'M NOT REALLY SURE

00:02:59.440 --> 00:03:01.470
WHAT I WANT YET SO I'M USING REAL-TIME`;

  async function loadSubtitles(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      P.cues = parseVTT(text);
      BAD.bus.emit('subtitles:loaded', { count: P.cues.length });
    } catch (err) {
      /* FALL BACK TO INLINE VTT SO DOUBLE-CLICKING INDEX.HTML (FILE://) ON ANY LAPTOP WORKS 100%! */
      P.cues = parseVTT(INLINE_VTT_FALLBACK);
      BAD.bus.emit('subtitles:loaded', { count: P.cues.length });
    }
  }

  function parseVTT(vttText) {
    const blocks = String(vttText).replace(/\r\n/g, '\n').split('\n\n');
    const cues = [];
    for (let i = 0; i < blocks.length; i++) {
      const lines = blocks[i].trim().split('\n').map((l) => l.trim()).filter(Boolean);
      if (!lines.length) continue;
      const arrowLineIdx = lines.findIndex((l) => l.includes('-->'));
      if (arrowLineIdx === -1) continue;
      const m = lines[arrowLineIdx].match(/(\d+:\d+:\d+(?:\.\d+)?|\d+:\d+(?:\.\d+)?)\s*-->\s*(\d+:\d+:\d+(?:\.\d+)?|\d+:\d+(?:\.\d+)?)/);
      if (!m) continue;
      const start = parseTimestamp(m[1]);
      const end = parseTimestamp(m[2]);
      const text = lines.slice(arrowLineIdx + 1).join(' ').replace(/<[^>]+>/g, '').trim().toUpperCase();
      if (text) cues.push({ index: cues.length, start, end, text });
    }
    return cues;
  }

  function parseTimestamp(str) {
    const parts = str.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  }

  function syncSubtitleCue(time) {
    const { subBox } = P.els;
    if (!subBox) return;
    if (!P.ccEnabled || !P.cues.length) {
      subBox.classList.add('is-hidden');
      return;
    }
    const idx = P.cues.findIndex((c) => time >= c.start && time <= c.end);
    if (idx === -1) {
      subBox.classList.add('is-hidden');
      P.activeCueIndex = -1;
      return;
    }
    const cue = P.cues[idx];
    subBox.textContent = cue.text;
    subBox.classList.remove('is-hidden');

    if (P.activeCueIndex !== idx) {
      P.activeCueIndex = idx;
      BAD.bus.emit('subtitle:cue', cue);
    }
  }

  function showSubtitleReaction(charId, commentText) {
    const { subReact } = P.els;
    if (!subReact) return;
    const c = BAD.characters.get(charId);
    subReact.style.setProperty('--c', c.color);
    subReact.textContent = `${c.name}: "${String(commentText).toUpperCase()}"`;
    subReact.classList.remove('is-hidden');
    clearTimeout(P.reactTimer);
    P.reactTimer = setTimeout(() => subReact.classList.add('is-hidden'), 4800);
  }

  /* ---------------- SOURCE LOADING ---------------- */
  function load(src, isRetry = false) {
    const { video, loading, placeholder, phPath } = P.els;
    clearTimeout(P.loadTimer);
    P.src = src;
    setStatus('loading');
    if (phPath) phPath.textContent = String(src).toUpperCase();

    placeholder.classList.add('is-hidden');
    loading.classList.remove('is-hidden');
    video.classList.add('no-source');

    video.src = isRetry ? `${src}?retry=${Date.now()}` : src;
    video.load();

    P.loadTimer = setTimeout(() => {
      if (P.status === 'loading' && video.readyState === 0) {
        onMissing('TIMED OUT WAITING FOR THE VIDEO TO LOAD.');
      }
    }, BAD.config.videoLoadTimeoutMs);
  }

  function onReady() {
    clearTimeout(P.loadTimer);
    const { video, loading, placeholder, bigPlay } = P.els;
    loading.classList.add('is-hidden');
    placeholder.classList.add('is-hidden');
    video.classList.remove('no-source');
    if (video.paused) bigPlay.classList.remove('is-hidden');
    setStatus('ready');
    syncProgress();
    renderMarkers();
    BAD.bus.emit('video:ready', { duration: video.duration, src: P.src });
  }

  function onMissing(reason) {
    if (P.status === 'missing') return;
    clearTimeout(P.loadTimer);
    const { video, loading, placeholder, bigPlay, phReason } = P.els;
    try { video.pause(); } catch (_) { /* IGNORE */ }
    video.removeAttribute('src');
    video.classList.add('no-source');
    loading.classList.add('is-hidden');
    bigPlay.classList.add('is-hidden');
    placeholder.classList.remove('is-hidden');
    if (phReason) phReason.textContent = reason ? `DETAILS: ${String(reason).toUpperCase()}` : '';
    setStatus('missing');
    syncProgress();
    syncPlayState();
    BAD.bus.emit('video:missing', { reason, src: P.src });
  }

  function describeError(err) {
    if (!err) return 'UNKNOWN MEDIA ERROR.';
    const map = {
      1: 'LOADING WAS ABORTED.',
      2: 'A NETWORK ERROR OCCURRED.',
      3: 'THE FILE COULD NOT BE DECODED.',
      4: 'FILE NOT FOUND OR FORMAT NOT SUPPORTED.',
    };
    return map[err.code] || (err.message ? err.message.toUpperCase() : 'UNKNOWN MEDIA ERROR.');
  }

  function setStatus(status) {
    P.status = status;
    const el = P.els.status;
    if (!el) return;
    const label = { idle: 'IDLE', loading: 'LOADING', ready: 'READY', missing: 'NO SOURCE' }[status];
    el.textContent = label;
    el.classList.toggle('ok', status === 'ready');
    el.classList.toggle('bad', status === 'missing');
    const disabled = status !== 'ready';
    [P.els.play, P.els.mute, P.els.framePrev, P.els.frameNext, P.els.screenshot, P.els.pip].forEach(
      (b) => b && b.setAttribute('aria-disabled', String(disabled))
    );
  }

  /* ---------------- GUARDS ---------------- */
  function requireVideo() {
    if (P.status === 'ready') return true;
    if (P.status === 'loading') {
      BAD.ui.toast('STILL LOOKING FOR THE VIDEO… ONE MOMENT.', { type: 'info' });
    } else {
      BAD.ui.toast(`NO VIDEO LOADED. PUT AN MP4 AT ${BAD.config.videoSrc.toUpperCase()} AND PRESS RETRY.`, { type: 'warn', duration: 4500 });
    }
    return false;
  }

  /* ---------------- CONTROLS ---------------- */
  function play() {
    if (!requireVideo()) return Promise.resolve(false);
    const v = P.els.video;
    /* FORCE USERS TO UNMUTE (VIA FIND WALDO CAPTCHA OR 7-CONFIRMATION SKIP) BEFORE STARTING THE VIDEO! */
    if (v.muted || !G.unmutedVerified) {
      BAD.ui.toast('🔒 PLAYBACK BLOCKED! YOU MUST UNMUTE & SOLVE THE WALDO CAPTCHA BEFORE STARTING THE VIDEO!', { type: 'error', duration: 3800 });
      openWaldoCaptcha('YOU MUST UNMUTE BEFORE STARTING THE VIDEO');
      return Promise.resolve(false);
    }
    return v.play().then(() => true).catch((err) => {
      console.warn('[PLAYER] PLAY() REJECTED:', err);
      BAD.ui.toast('THE BROWSER BLOCKED PLAYBACK. CLICK PLAY AGAIN.', { type: 'warn' });
      return false;
    });
  }

  function pause() {
    if (P.status !== 'ready') return;
    P.els.video.pause();
  }

  function togglePlay() {
    if (!requireVideo()) return;
    if (P.els.video.paused || P.els.video.ended) {
      play();
      BAD.bus.emit('player:userPlay');
    } else {
      pause();
      BAD.bus.emit('player:userPause');
    }
  }

  function stepFrame(dir) {
    if (!requireVideo()) return;
    const v = P.els.video;
    if (!v.paused) v.pause();
    seek(v.currentTime + dir * FRAME_STEP);
    BAD.ui.toast(`FRAME STEP ${dir > 0 ? '+1' : '-1'} (${formatTime(v.currentTime)})`, { type: 'info', duration: 1400 });
    BAD.bus.emit('player:frameStep', { dir, time: v.currentTime });
  }

  /* ---------------- GRAVITY-BASED VOLUME SLIDER & FIND WALDO UNMUTE CAPTCHA ---------------- */
  const G = {
    vol: 0.85,
    vel: 0,
    tiltDeg: -8,
    dragging: false,
    captchaOpen: false,
    unmutedVerified: false,
    wasPlayingBeforeCaptcha: false,
    waldoX: 360,
    waldoY: 180,
    misses: 0,
    decoys: [],
  };

  function initGravityVolume() {
    const { volSlider, gravityWrap, gravityBeam, tiltLeft, tiltRight, volPump, video } = P.els;
    if (!volSlider || !video) return;

    /* START LOCKED IN MUTED STATE SO USER IS FORCED TO UNMUTE BEFORE STARTING THE VIDEO! */
    video.volume = G.vol;
    video.muted = true;
    G.unmutedVerified = false;

    if (tiltLeft) {
      tiltLeft.addEventListener('click', () => {
        G.tiltDeg = clamp(G.tiltDeg - 7, -30, 30);
        BAD.ui.toast(`⚖️ VOLUME BEAM TILTED LEFT (${Math.round(G.tiltDeg)}°) — GRAVITY DRAINING VOLUME!`, { type: 'warn', duration: 1500 });
        syncGravityUI();
      });
    }

    if (tiltRight) {
      tiltRight.addEventListener('click', () => {
        if (video.muted) {
          openWaldoCaptcha('ATTEMPTED TO TILT VOLUME UP WHILE MUTED');
          return;
        }
        G.tiltDeg = clamp(G.tiltDeg + 7, -30, 30);
        BAD.ui.toast(`⚖️ VOLUME BEAM TILTED RIGHT (+${Math.round(G.tiltDeg)}°) — GRAVITY SLIDING VOLUME UP!`, { type: 'info', duration: 1500 });
        syncGravityUI();
      });
    }

    if (volPump) {
      volPump.addEventListener('click', () => {
        if (video.muted) {
          openWaldoCaptcha('ATTEMPTED TO PUMP VOLUME WHILE MUTED');
          return;
        }
        G.vel += 0.014;
        G.vol = clamp(G.vol + 0.16, 0, 1);
        G.tiltDeg = clamp(G.tiltDeg + 4, -30, 30);
        video.volume = G.vol;
        if (BAD.sound) BAD.sound.playGlitchBlip();
        BAD.ui.toast(`⛽ PUMPED VOLUME AGAINST GRAVITY TO ${Math.round(G.vol * 100)}%!`, { type: 'ok', duration: 1300 });
        syncGravityUI();
      });
    }

    if (gravityWrap) {
      gravityWrap.addEventListener('wheel', (e) => {
        e.preventDefault();
        const dir = e.deltaY > 0 ? -5 : 5;
        G.tiltDeg = clamp(G.tiltDeg + dir, -30, 30);
        syncGravityUI();
      }, { passive: false });
    }

    volSlider.addEventListener('pointerdown', () => { G.dragging = true; });
    window.addEventListener('pointerup', () => { G.dragging = false; });

    volSlider.addEventListener('input', (e) => {
      if (video.muted) {
        volSlider.value = 0;
        openWaldoCaptcha('DRAGGED VOLUME SLIDER WHILE MUTED');
        return;
      }
      const val = clamp(parseFloat(e.target.value) || 0, 0, 1);
      G.vol = val;
      G.vel = 0;
      /* DRAGGING THE HEAVY VOLUME BALL TILTS THE SEESAW IN THE OPPOSITE DIRECTION! */
      G.tiltDeg = clamp((0.5 - val) * 34, -30, 30);
      video.volume = G.vol;
      syncGravityUI();
    });

    function stepGravity() {
      if (!G.dragging && !G.captchaOpen && P.status === 'ready' && !video.muted) {
        const rad = (G.tiltDeg * Math.PI) / 180;
        /* GRAVITY ACCELERATES THE VOLUME BALL ALONG THE TILTED BEAM */
        const accel = Math.sin(rad) * 0.00048;
        G.vel = (G.vel + accel) * 0.985;
        G.vol += G.vel;

        if (G.vol <= 0.02) {
          G.vol = 0.02;
          G.vel = -G.vel * 0.45;
        } else if (G.vol >= 1) {
          G.vol = 1;
          G.vel = -G.vel * 0.45;
        }

        video.volume = clamp(G.vol, 0, 1);
        syncGravityUI();
      } else if (gravityBeam) {
        syncGravityUI();
      }
      requestAnimationFrame(stepGravity);
    }

    requestAnimationFrame(stepGravity);
  }

  function syncGravityUI() {
    const { video, volSlider, gravityBeam, volReadout, muteLabel } = P.els;
    if (gravityBeam) {
      gravityBeam.style.transform = `rotate(${G.tiltDeg.toFixed(1)}deg)`;
    }
    const muted = video && (video.muted || video.volume === 0);
    const pct = muted ? 0 : Math.round((video ? video.volume : G.vol) * 100);
    if (volSlider && !G.dragging) {
      volSlider.value = muted ? 0 : (video ? video.volume : G.vol);
    }
    if (volReadout) {
      const sign = G.tiltDeg >= 0 ? '+' : '';
      volReadout.textContent = muted ? `MUTED ∠${sign}${Math.round(G.tiltDeg)}°` : `${pct}% ∠${sign}${Math.round(G.tiltDeg)}°`;
    }
    if (muteLabel) {
      muteLabel.textContent = muted ? '🔒 UNMUTE?' : 'EARBLEED';
    }
  }

  function setVolume(val) {
    if (!requireVideo()) return;
    const v = P.els.video;
    if (v.muted && val > 0) {
      openWaldoCaptcha('ATTEMPTED TO UNMUTE VIA VOLUME CONTROL');
      return;
    }
    G.vol = clamp(val, 0, 1);
    v.volume = G.vol;
    syncGravityUI();
  }

  function toggleMute() {
    if (!requireVideo()) return;
    const v = P.els.video;
    /* LOCK AUDIO INTO MUTED STATE, PAUSE VIDEO, AND DEMAND THE FIND WALDO CAPTCHA TO UNMUTE! */
    v.muted = true;
    syncVolume();
    openWaldoCaptcha('USER REQUESTED AUDIO UNMUTE');
  }

  /* ---------------- FIND WALDO CAPTCHA TO UNMUTE ENGINE ---------------- */
  function initWaldoCaptcha() {
    const { waldoCanvas, waldoReshuffle, waldoStayMuted, waldoSkip } = P.els;
    if (!waldoCanvas) return;

    waldoCanvas.addEventListener('click', onWaldoCanvasClick);

    if (waldoReshuffle) {
      waldoReshuffle.addEventListener('click', () => {
        if (BAD.sound) BAD.sound.playGlitchBlip();
        generateWaldoScene();
        BAD.ui.toast('🔀 CROWD RESHUFFLED! WALDO MOVED TO A NEW HIDING SPOT!', { type: 'warn', duration: 2200 });
      });
    }

    if (waldoStayMuted) {
      waldoStayMuted.addEventListener('click', () => {
        if (BAD.sound) BAD.sound.playWindowsError();
        if (P.els.waldoStatus) {
          P.els.waldoStatus.textContent = '❌ ACCESS DENIED! SILENT VIEWING IS ILLEGAL IN KIRKTUBE! YOU ARE FORCED TO UNMUTE (FIND WALDO OR CLICK SKIP 7 TIMES) BEFORE STARTING THE VIDEO!';
        }
        BAD.ui.toast('❌ NICE TRY! YOU CANNOT WATCH IN SILENCE — YOU MUST UNMUTE FIRST!', { type: 'error', duration: 3500 });
        BAD.chat.post('assistant', 'NICE TRY CLICKING "WATCH IN SILENCE." UNMUTING IS MANDATORY BEFORE YOU CAN WATCH A SINGLE FRAME.', { priority: true });
      });
    }

    if (waldoSkip) {
      waldoSkip.addEventListener('click', () => {
        if (BAD.sound) BAD.sound.playGlitchBlip();
        BAD.chat.post('narrator', 'HARK! THE VIEWER ATTEMPTS THE FORBIDDEN 7-CONFIRMATION CAPTCHA SKIP GAUNTLET!', { priority: true });
        BAD.ui.confirmSevenTimes(
          'SKIP FIND WALDO CAPTCHA & UNMUTE AUDIO',
          () => {
            closeWaldoCaptcha(true);
            BAD.ui.toast('🔓 ALL 7 CONFIRMATIONS COMPLETED! WALDO CAPTCHA SKIPPED & AUDIO UNMUTED!', { type: 'ok', duration: 4000 });
            BAD.chat.post('assistant', 'YOU ACTUALLY CLICKED THROUGH ALL 7 CONFIRMATIONS INSTEAD OF JUST CLICKING ON WALDO. RESPECTFULLY, SEEK HELP.', { priority: true });
          },
          () => {
            if (P.els.waldoStatus) {
              P.els.waldoStatus.textContent = '❌ 7-CONFIRMATION SKIP ABORTED! CLICK DIRECTLY ON WALDO BELOW TO UNMUTE!';
            }
          }
        );
      });
    }
  }

  function openWaldoCaptcha(reason) {
    const { waldoModal, waldoStatus, waldoMisses, video } = P.els;
    if (!waldoModal) return;

    G.wasPlayingBeforeCaptcha = video && !video.paused && !video.ended;
    if (video && !video.paused) {
      pause();
    }
    if (video) {
      video.muted = true;
    }
    G.unmutedVerified = false;
    G.captchaOpen = true;
    G.misses = 0;

    if (waldoMisses) waldoMisses.textContent = 'MISSES: 0 / 3 (AUTO-SHUFFLE AT 3)';
    if (waldoStatus) {
      waldoStatus.textContent = `🔒 [${String(reason || 'AUDIO LOCKED').toUpperCase()}] VIDEO PAUSED! CLICK DIRECTLY ON WALDO IN THE CROWD BELOW TO UNMUTE & START VIDEO!`;
    }

    generateWaldoScene();
    waldoModal.classList.remove('is-hidden');
    syncVolume();

    if (BAD.sound) BAD.sound.playWindowsError();
    BAD.chat.post('paranoid', '🚨 MANDATORY UNMUTE CHECK! YOU CANNOT START OR WATCH THE VIDEO UNTIL YOU UNMUTE BY FINDING WALDO IN THIS CROWD OF 140 DECOYS!', { priority: true });
  }

  function closeWaldoCaptcha(unmuteSuccess) {
    const { waldoModal, video } = P.els;
    G.captchaOpen = false;
    if (waldoModal) waldoModal.classList.add('is-hidden');

    if (video && unmuteSuccess) {
      G.unmutedVerified = true;
      video.muted = false;
      G.vol = Math.max(G.vol, 0.85);
      G.vel = 0;
      G.tiltDeg = 0;
      video.volume = G.vol;
    }
    syncVolume();
    if (G.wasPlayingBeforeCaptcha || unmuteSuccess) {
      play();
    }
  }

  function generateWaldoScene() {
    const canvas = P.els.waldoCanvas;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    /* PICK RANDOM COORDINATES FOR REAL WALDO (WITH SAFE PADDING) */
    G.waldoX = Math.round(70 + Math.random() * (w - 140));
    G.waldoY = Math.round(68 + Math.random() * (h - 125));

    /* GENERATE 135 CROWD DECOYS */
    const decoys = [];
    const types = ['stripes_guy', 'barber_pole', 'umbrella', 'duckflow', 'candy_cane', 'cone', 'crowd_hat'];
    for (let i = 0; i < 135; i++) {
      let dx = Math.round(28 + Math.random() * (w - 56));
      let dy = Math.round(38 + Math.random() * (h - 68));
      /* KEEP DECOYS FROM COMPLETELY COVERING WALDO'S FACE */
      if (Math.hypot(dx - G.waldoX, dy - G.waldoY) < 28) {
        dx = (dx + 80) % (w - 60) + 30;
      }
      decoys.push({
        x: dx,
        y: dy,
        type: types[i % types.length],
        seed: Math.random(),
      });
    }
    decoys.sort((a, b) => a.y - b.y);
    G.decoys = decoys;

    drawWaldoScene();
  }

  function drawWaldoScene() {
    const canvas = P.els.waldoCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    /* 1. CARNIVAL / BEACH BACKGROUND */
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.28, '#fef08a');
    grad.addColorStop(1, '#fde047');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    /* DISTANT RED-AND-WHITE CARNIVAL TENTS */
    for (let tx = 20; tx < w; tx += 115) {
      for (let s = 0; s < 5; s++) {
        ctx.fillStyle = s % 2 === 0 ? '#ef4444' : '#ffffff';
        ctx.fillRect(tx + s * 18, 12, 18, 30);
      }
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tx, 12, 90, 30);
    }

    /* 2. DRAW DECOYS & REAL WALDO IN DEPTH ORDER */
    let waldoDrawn = false;
    for (let i = 0; i < G.decoys.length; i++) {
      const d = G.decoys[i];
      if (!waldoDrawn && d.y > G.waldoY) {
        drawRealWaldo(ctx, G.waldoX, G.waldoY);
        waldoDrawn = true;
      }
      drawDecoyItem(ctx, d);
    }
    if (!waldoDrawn) {
      drawRealWaldo(ctx, G.waldoX, G.waldoY);
    }
  }

  function drawDecoyItem(ctx, d) {
    const { x, y, type, seed } = d;
    ctx.save();
    ctx.translate(x, y);

    if (type === 'barber_pole') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -18, 12, 32);
      ctx.fillStyle = '#ef4444';
      for (let sy = -16; sy < 12; sy += 8) {
        ctx.fillRect(-6, sy, 12, 4);
      }
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(0, -20, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'umbrella') {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(0, 14);
      ctx.stroke();
      for (let seg = -3; seg <= 2; seg++) {
        ctx.fillStyle = seg % 2 === 0 ? '#ef4444' : '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(seg * 6, -6);
        ctx.lineTo((seg + 1) * 6, -6);
        ctx.closePath();
        ctx.fill();
      }
    } else if (type === 'duckflow') {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.fillRect(3, -9, 6, 4);
      ctx.fillStyle = '#7e22ce';
      ctx.fillRect(-5, -11, 10, 4);
    } else if (type === 'candy_cane') {
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.lineTo(0, -10);
      ctx.arc(-5, -10, 5, 0, Math.PI, true);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      for (let cy = -8; cy <= 10; cy += 6) {
        ctx.fillRect(-3, cy, 6, 3);
      }
    } else if (type === 'cone') {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(-10, 12);
      ctx.lineTo(10, 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -4, 12, 4);
    } else {
      /* DECOY PERSON (MISSING GLASSES OR WEARING WRONG COLOR STRIPES / HAT) */
      ctx.fillStyle = seed > 0.5 ? '#1d4ed8' : '#047857';
      ctx.fillRect(-6, 4, 12, 12);
      /* SHIRT */
      const shirtColor = type === 'stripes_guy' ? '#ef4444' : '#a855f7';
      ctx.fillStyle = shirtColor;
      ctx.fillRect(-7, -8, 14, 13);
      if (type === 'stripes_guy') {
        /* VERTICAL STRIPES (DECOY! WALDO HAS HORIZONTAL STRIPES!) */
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -8, 3, 13);
        ctx.fillRect(2, -8, 3, 13);
      }
      /* HEAD (NO GLASSES!) */
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -15, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111827';
      ctx.fillRect(-3, -16, 2, 2);
      ctx.fillRect(2, -16, 2, 2);
      /* YELLOW OR GREEN HAT */
      ctx.fillStyle = seed > 0.5 ? '#22c55e' : '#eab308';
      ctx.fillRect(-7, -22, 14, 4);
    }

    ctx.restore();
  }

  function drawRealWaldo(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    /* SUBTLE HALO SHADOW SO SHARP-EYED PLAYERS CAN SPOT HIM */
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    /* BLUE TROUSERS */
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-6, 5, 5, 13);
    ctx.fillRect(1, 5, 5, 13);

    /* HORIZONTAL RED & WHITE STRIPED SHIRT (ICONIC WALDO STRIPES) */
    for (let s = 0; s < 5; s++) {
      ctx.fillStyle = s % 2 === 0 ? '#dc2626' : '#ffffff';
      ctx.fillRect(-8, -10 + s * 3, 16, 3);
    }
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-8, -10, 16, 15);

    /* WALKING CANE IN RIGHT HAND */
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(10, -4);
    ctx.lineTo(13, 17);
    ctx.stroke();

    /* HEAD */
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(0, -17, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* BROWN HAIR TUFT */
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-7, -21, 14, 3);

    /* ICONIC ROUND GLASSES */
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-3, -17, 2.8, 0, Math.PI * 2);
    ctx.arc(3, -17, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    /* SMILE */
    ctx.beginPath();
    ctx.arc(0, -14, 3, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    /* RED & WHITE BOBBLE BEANIE HAT */
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -25, 16, 4);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -25, 7.5, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    /* RED POM-POM BOBBLE ON TOP */
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -33, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  function onWaldoCanvasClick(e) {
    const canvas = P.els.waldoCanvas;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    /* HITBOX AROUND WALDO'S BODY & HEAD */
    const dist = Math.hypot(cx - G.waldoX, cy - (G.waldoY - 8));
    const ctx = canvas.getContext('2d');

    if (dist <= 28) {
      /* FOUND WALDO! */
      ctx.save();
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(G.waldoX, G.waldoY - 8, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.fillRect(G.waldoX - 58, G.waldoY - 52, 116, 20);
      ctx.fillStyle = '#39ff14';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✓ WALDO FOUND!', G.waldoX, G.waldoY - 38);
      ctx.restore();

      if (BAD.sound && BAD.sound.playCornerCelebration) {
        BAD.sound.playCornerCelebration();
      }
      if (P.els.waldoStatus) {
        P.els.waldoStatus.textContent = '🎉 WALDO VERIFIED!! UNLOCKING AUDIO & RESUMING VIDEO...';
      }
      BAD.ui.toast('🎉 YOU FOUND WALDO! AUDIO UNMUTED & VIDEO RESUMED!', { type: 'ok', duration: 3500 });
      BAD.chat.post('narrator', '🎯 BY JOVE! THE MORTAL PIERCED THE CROWD OF DECOYS AND FOUND WALDO! RESTORE THE GLORIOUS SOUNDWAVES!', { priority: true });

      setTimeout(() => {
        closeWaldoCaptcha(true);
      }, 750);
    } else {
      /* MISSED WALDO — HIT A DECOY! */
      G.misses += 1;
      if (BAD.sound) BAD.sound.playWindowsError();

      ctx.save();
      ctx.strokeStyle = '#ff2e4d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 8);
      ctx.lineTo(cx + 8, cy + 8);
      ctx.moveTo(cx + 8, cy - 8);
      ctx.lineTo(cx - 8, cy + 8);
      ctx.stroke();
      ctx.restore();

      const roasts = [
        'THAT IS A DECOY! LOOK FOR HORIZONTAL RED/WHITE STRIPES + ROUND GLASSES + POM-POM BEANIE!',
        'WRONG! YOU JUST CLICKED A RANDOM CARNIVAL OBJECT! KEEP LOOKING!',
        'NOPE! WALDO HAS ROUND GLASSES AND A WALKING CANE!',
      ];
      const msg = roasts[(G.misses - 1) % roasts.length];

      if (G.misses >= 3) {
        G.misses = 0;
        if (P.els.waldoMisses) P.els.waldoMisses.textContent = 'MISSES: 0 / 3 (CROWD RESHUFFLED!)';
        if (P.els.waldoStatus) P.els.waldoStatus.textContent = '🚨 3 MISSES! WALDO PANICKED AND MOVED TO A NEW SPOT IN THE CROWD!';
        BAD.ui.toast('🚨 3 MISSES! WALDO RELOCATED TO A NEW SPOT!', { type: 'danger', duration: 2600 });
        setTimeout(() => generateWaldoScene(), 380);
      } else {
        if (P.els.waldoMisses) P.els.waldoMisses.textContent = `MISSES: ${G.misses} / 3 (AUTO-SHUFFLE AT 3)`;
        if (P.els.waldoStatus) P.els.waldoStatus.textContent = `❌ MISS #${G.misses}: ${msg}`;
        BAD.ui.toast(`❌ NOT WALDO! (${G.misses}/3 MISSES)`, { type: 'warn', duration: 1800 });
      }
    }
  }

  function cycleSpeed() {
    if (!requireVideo()) return;
    P.speedIndex = (P.speedIndex + 1) % SPEEDS.length;
    const rate = SPEEDS[P.speedIndex];
    P.els.video.playbackRate = rate;
    const cursedSpeedLabels = {
      0.5: '🐌 0.5X [MOLASSES]',
      1: '🐌 1X [BORING]',
      1.25: '🐇 1.25X [ZOOMER]',
      1.5: '🚀 1.5X [CAFFEINE]',
      2: '⚡ 2X [BRAINROT]',
    };
    P.els.speed.textContent = cursedSpeedLabels[rate] || `${rate}X`;
    BAD.ui.toast(`PLAYBACK SPEED SET TO ${rate}X`, { type: 'info', duration: 1800 });
    BAD.bus.emit('player:speed', { rate });
  }

  function toggleLoop() {
    if (!requireVideo()) return;
    const v = P.els.video;
    v.loop = !v.loop;
    P.els.loop.textContent = v.loop ? '♾ PURGATORY: ON' : '♾ PURGATORY: OFF';
    P.els.loop.classList.toggle('active', v.loop);
    P.els.loop.setAttribute('aria-pressed', String(v.loop));
    BAD.ui.toast(v.loop ? 'ETERNAL PURGATORY ENABLED. YOU CAN NEVER LEAVE.' : 'PURGATORY LOOP DISABLED.', { type: 'info' });
  }

  function toggleSubtitles() {
    P.ccEnabled = !P.ccEnabled;
    P.els.cc.textContent = P.ccEnabled ? '🤬 YELL-TEXT: ON' : '🤬 YELL-TEXT: OFF';
    P.els.cc.classList.toggle('active', P.ccEnabled);
    P.els.cc.setAttribute('aria-pressed', String(P.ccEnabled));
    syncSubtitleCue(getTime());
    BAD.ui.toast(P.ccEnabled ? 'YELL-TEXT SUBTITLES ENABLED.' : 'SUBTITLES HIDDEN (THE AI CAN STILL READ THEM).', { type: 'info' });
    BAD.bus.emit('player:subtitlesToggle', { enabled: P.ccEnabled });
  }

  function captureScreenshot() {
    if (!requireVideo()) return;
    const v = P.els.video;
    try {
      const c = document.createElement('canvas');
      c.width = v.videoWidth || 1280;
      c.height = v.videoHeight || 720;
      const ctx = c.getContext('2d');
      ctx.drawImage(v, 0, 0, c.width, c.height);

      /* WATERMARK THE SCREENSHOT WITH KIRKTUBE BRANDING */
      ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
      ctx.fillRect(16, c.height - 54, 430, 38);
      ctx.fillStyle = '#39ff14';
      ctx.font = 'bold 18px Consolas, monospace';
      ctx.fillText(`KIRKTUBE SNAPSHOT @ ${formatTime(v.currentTime)}`, 28, c.height - 29);

      const flash = P.els.flash;
      if (flash) {
        flash.classList.remove('is-hidden');
        setTimeout(() => flash.classList.add('is-hidden'), 260);
      }

      const dataUrl = c.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `KIRKTUBE-FRAME-${Math.round(v.currentTime)}S.PNG`;
      a.click();

      BAD.ui.toast('SCREENSHOT CAPTURED & WATERMARKED BY KIRKTUBE!', { type: 'ok' });
      BAD.bus.emit('player:screenshot', { time: v.currentTime });
    } catch (err) {
      console.warn('[PLAYER] SCREENSHOT FAILED:', err);
      BAD.ui.toast('SCREENSHOT BLOCKED BY BROWSER SECURITY.', { type: 'error' });
    }
  }

  async function togglePiP() {
    if (!requireVideo()) return;
    if (!document.pictureInPictureEnabled) {
      BAD.ui.toast('PICTURE-IN-PICTURE IS NOT SUPPORTED IN THIS BROWSER.', { type: 'warn' });
      return;
    }
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await P.els.video.requestPictureInPicture();
        BAD.bus.emit('player:pip', { active: true });
      }
    } catch (err) {
      BAD.ui.toast('COULD NOT TOGGLE PICTURE-IN-PICTURE.', { type: 'warn' });
    }
  }

  function toggleTheater() {
    P.theater = !P.theater;
    P.els.appMain.classList.toggle('theater-mode', P.theater);
    P.els.theater.setAttribute('aria-pressed', String(P.theater));
    P.els.theater.classList.toggle('active', P.theater);
    BAD.ui.toast(P.theater ? 'THEATER MODE: SIDEBAR PUSHED BELOW.' : 'NORMAL LAYOUT RESTORED.', { type: 'info', duration: 1800 });
  }

  function toggleFullscreen() {
    const target = P.els.shell || P.els.wrap;
    if (!document.fullscreenElement) {
      if (target.requestFullscreen) {
        target.requestFullscreen().catch(() => BAD.ui.toast('FULLSCREEN BLOCKED.', { type: 'warn' }));
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  function toggleShortcutsModal(force) {
    const m = P.els.shortcutsModal;
    if (!m) return;
    const show = typeof force === 'boolean' ? force : m.classList.contains('is-hidden');
    m.classList.toggle('is-hidden', !show);
  }

  function seek(seconds) {
    if (P.status !== 'ready' || !Number.isFinite(seconds)) return;
    const v = P.els.video;
    const d = Number.isFinite(v.duration) ? v.duration : 0;
    if (!d) return;
    const target = clamp(seconds, 0, d);
    v.currentTime = target;
    syncProgress();
    syncSubtitleCue(target);
    BAD.bus.emit('player:seeked', { time: target });
    BAD.bus.emit('video:timeupdate', { time: target, duration: d });
  }

  function onSeekClick(e) {
    if (!requireVideo()) return;
    const d = getDuration();
    if (!d) { BAD.ui.toast('THIS VIDEO HAS NO KNOWN DURATION, SO SEEKING IS UNAVAILABLE.', { type: 'warn' }); return; }
    const rect = P.els.progress.getBoundingClientRect();
    const clickedRatio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    /* BECAUSE THE PROGRESS BAR MISREPORTS POSITION & LENGTH, SEEKING JUMPS TO A CURSED SCRAMBLED POSITION! */
    const scrambledRatio = clamp(((clickedRatio * 1.73) + 0.29) % 0.96, 0.02, 0.95);
    const target = scrambledRatio * d;
    seek(target);
    BAD.ui.toast(
      `⚠ TIMELINE DESYNC! YOU CLICKED ${Math.round(clickedRatio * 100)}% BUT THE BAR ACTUALLY JUMPED TO ${formatTime(target)}!`,
      { type: 'warn', duration: 2400 }
    );
  }

  function onProgressHover(e) {
    const d = getDuration();
    if (!d) return;
    const rect = P.els.progress.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const realT = ratio * d;
    const { hover, hoverTime, hoverTag } = P.els;
    hover.style.left = `${ratio * 100}%`;
    /* SHOW ABSURD WRONG TIMESTAMP ON HOVER */
    const fakeHoverMins = Math.floor(ratio * 420) + 12;
    const fakeHoverSecs = String(Math.floor((ratio * 997) % 99)).padStart(2, '0');
    hoverTime.textContent = `${fakeHoverMins}:${fakeHoverSecs} [ESTIMATED LIE]`;

    /* CHECK IF NEAR AN AI MARKER OR SUBTITLE CUE */
    const nearMarker = P.markers.find((m) => Math.abs(m.timestamp - realT) <= 4);
    const cue = P.cues.find((c) => realT >= c.start && realT <= c.end);
    if (nearMarker) {
      hoverTag.textContent = `⚡ ${nearMarker.label}`;
    } else if (cue) {
      hoverTag.textContent = cue.text.slice(0, 34) + (cue.text.length > 34 ? '…' : '');
    } else {
      hoverTag.textContent = '⚠ POSITION UNRELIABLE';
    }
    hover.classList.remove('is-hidden');
  }

  /* ---------------- TIMELINE MARKERS ---------------- */
  function setMarkers(markerList) {
    P.markers = Array.isArray(markerList) ? markerList : [];
    renderMarkers();
  }

  function renderMarkers() {
    const { markers } = P.els;
    if (!markers) return;
    markers.innerHTML = '';
    const d = getDuration() || 180; /* FALLBACK TO 3:00 SO MARKERS SHOW IMMEDIATELY */
    P.markers.forEach((m) => {
      if (m.timestamp < 0 || m.timestamp > d) return;
      const dot = document.createElement('span');
      dot.className = `timeline-marker char-${m.character || 'narrator'}`;
      dot.style.left = `${(m.timestamp / d) * 100}%`;
      dot.title = `${formatTime(m.timestamp)} — ${m.label || 'AI INTERRUPTION'}`;
      markers.appendChild(dot);
    });
  }

  /* ---------------- KEYBOARD SHORTCUTS ---------------- */
  function onKeyDown(e) {
    if (BAD.intro && BAD.intro.isActive()) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const k = e.key.toUpperCase();
    if (e.key === ' ' || k === 'K') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); seek(getTime() + 5); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); seek(getTime() - 5); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setVolume((P.els.video.volume || 0) + 0.1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setVolume((P.els.video.volume || 0) - 0.1); }
    else if (e.key === ',') { e.preventDefault(); stepFrame(-1); }
    else if (e.key === '.') { e.preventDefault(); stepFrame(1); }
    else if (k === 'M') { e.preventDefault(); toggleMute(); }
    else if (k === 'C') { e.preventDefault(); toggleSubtitles(); }
    else if (k === 'T') { e.preventDefault(); toggleTheater(); }
    else if (k === 'F') { e.preventDefault(); toggleFullscreen(); }
    else if (k === 'L') { e.preventDefault(); toggleLoop(); }
    else if (k === 'S') { e.preventDefault(); captureScreenshot(); }
    else if (k === 'I') { e.preventDefault(); BAD.bus.emit('interruption:force'); }
    else if (e.key === '?' || e.key === '/') { e.preventDefault(); toggleShortcutsModal(); }
  }

  /* ---------------- UI SYNC & CURSED LYING PROGRESS BAR ---------------- */
  const FAKE_LENGTH_STRINGS = [
    '99:59',
    '4:20:69',
    '0:04',
    '404:04',
    '-12:34',
    '1,337:00',
    '0:00.5',
    '78:94',
  ];

  function computeCursedProgress(realT, realD) {
    if (!realD || realT <= 0.4) {
      return {
        pct: 0,
        curStr: '0:00',
        lenStr: '99:59',
      };
    }

    const tick = Math.floor(performance.now() / 380);
    const fakeLenStr = FAKE_LENGTH_STRINGS[Math.floor((realT / 7) + (tick % 2)) % FAKE_LENGTH_STRINGS.length];
    let fakePct = 0;
    let fakeCurSeconds = realT;

    if (realT < 14) {
      /* PHASE 1 (0S-14S): ROCKET AT 7X SPEED STRAIGHT TO 96% SO IT LOOKS LIKE THE VIDEO IS OVER! */
      fakePct = Math.min(96, (realT / 14) * 96);
      fakeCurSeconds = realT * 42;
    } else if (realT < 34) {
      /* PHASE 2 (14S-34S): SUDDENLY RUNS BACKWARDS FROM 88% DOWN TO 6%! */
      fakePct = 88 - ((realT - 14) / 20) * 82;
      fakeCurSeconds = Math.max(0, 600 - (realT - 14) * 28);
    } else if (realT < 66) {
      /* PHASE 3 (34S-66S): WILD TELEPORT JUMPS & WRONG SPEED SPURTS! */
      const jumpTable = [14, 92, 37, 81, 5, 99, 48, 73];
      const base = jumpTable[Math.floor(realT * 1.5) % jumpTable.length];
      const microSprint = ((performance.now() % 1000) / 1000) * 14;
      fakePct = clamp(base + microSprint - 7, 3, 99);
      fakeCurSeconds = base * 19 + (realT % 10);
    } else if (realT < 98) {
      /* PHASE 4 (66S-98S): WINDOWS 98 STUCK AT 99% WHILE TIME READS LONGER THAN THE VIDEO LENGTH! */
      fakePct = 98.5 + Math.sin(performance.now() / 180) * 1.2;
      fakeCurSeconds = 5999;
    } else if (realT < 140) {
      /* PHASE 5 (98S-140S): RUBBER-BANDING SLINGSHOT BETWEEN 11% AND 89% AT 5X SPEED! */
      const wave = (Math.sin(realT * 0.9) + 1) * 0.5;
      fakePct = 11 + wave * 78;
      fakeCurSeconds = Math.abs(Math.round(Math.cos(realT * 0.5) * 840));
    } else if (realT < 174) {
      /* PHASE 6 (140S-174S): SNAIL SPEED AT 18% THEN SUDDEN JUMP TO 94%! */
      fakePct = (Math.floor(realT) % 4 === 0) ? 94 : 18 + ((realT - 140) * 0.3);
      fakeCurSeconds = realT * 9.5;
    } else {
      /* FINAL 6 SECONDS: FINALLY SNAPS NEAR THE END */
      fakePct = (realT / realD) * 100;
      fakeCurSeconds = realT;
    }

    return {
      pct: clamp(fakePct, 0, 100),
      curStr: formatTime(fakeCurSeconds),
      lenStr: fakeLenStr,
    };
  }

  function onTimeUpdate() {
    syncProgress();
    const t = getTime();
    syncSubtitleCue(t);
    BAD.bus.emit('video:timeupdate', { time: t, duration: getDuration() });
  }

  function syncPlayState() {
    const { video, play, bigPlay } = P.els;
    const playing = P.status === 'ready' && !video.paused && !video.ended;
    play.querySelector('.icon-play').classList.toggle('is-hidden', playing);
    play.querySelector('.icon-pause').classList.toggle('is-hidden', !playing);
    play.setAttribute('aria-label', playing ? 'PAUSE' : 'PLAY');
    play.title = playing ? 'PAUSE [SPACE]' : 'PLAY [SPACE]';
    bigPlay.classList.toggle('is-hidden', playing || P.status !== 'ready');
    BAD.bus.emit('video:state', { playing });
  }

  function syncProgress() {
    const { video, fill, thumb, time, progress } = P.els;
    const ready = P.status === 'ready';
    const d = ready && Number.isFinite(video.duration) ? video.duration : 0;
    const t = ready ? video.currentTime : 0;
    const cursed = computeCursedProgress(t, d);
    fill.style.width = `${cursed.pct}%`;
    thumb.style.left = `${cursed.pct}%`;
    time.textContent = `${cursed.curStr} / ${cursed.lenStr}`;
    progress.setAttribute('aria-valuenow', String(Math.round(cursed.pct)));
  }

  /* PERIODIC PROGRESS BAR JITTER WHILE PLAYING SO SPEED JUMPS ARE CONSTANTLY VISIBLE */
  setInterval(() => {
    if (P.status === 'ready' && P.els.video && !P.els.video.paused) {
      syncProgress();
    }
  }, 320);

  function syncBuffer() {
    const { video, buffer } = P.els;
    if (P.status !== 'ready' || !video.buffered.length || !video.duration) return;
    const end = video.buffered.end(video.buffered.length - 1);
    buffer.style.width = `${(end / video.duration) * 100}%`;
  }

  function syncVolume() {
    const { video, mute, volSlider } = P.els;
    const muted = video.muted || video.volume === 0;
    mute.querySelector('.icon-vol').classList.toggle('is-hidden', muted);
    mute.querySelector('.icon-muted').classList.toggle('is-hidden', !muted);
    mute.setAttribute('aria-label', muted ? 'UNMUTE (FIND WALDO CAPTCHA)' : 'MUTE / UNMUTE CAPTCHA');
    mute.title = muted ? 'UNMUTE [M] (TRIGGERS FIND WALDO CAPTCHA)' : 'MUTE / UNMUTE CAPTCHA [M]';
    if (volSlider && !G.dragging) volSlider.value = muted ? 0 : video.volume;
    syncGravityUI();
  }

  function getTime() { return P.status === 'ready' ? P.els.video.currentTime : 0; }
  function getDuration() { return P.status === 'ready' && Number.isFinite(P.els.video.duration) ? P.els.video.duration : 0; }

  BAD.player = {
    init,
    load,
    play,
    pause,
    togglePlay,
    toggleMute,
    setVolume,
    openWaldoCaptcha,
    stepFrame,
    cycleSpeed,
    toggleLoop,
    toggleSubtitles,
    captureScreenshot,
    togglePiP,
    toggleTheater,
    toggleFullscreen,
    seek,
    setMarkers,
    showSubtitleReaction,
    get status() { return P.status; },
    isReady: () => P.status === 'ready',
    isPlaying: () => P.status === 'ready' && !P.els.video.paused && !P.els.video.ended,
    getTime,
    getDuration,
    get cues() { return P.cues; },
    get video() { return P.els.video; },
  };
})();
