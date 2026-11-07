/* =========================================================
   KIRKTUBE — SOUNDMANAGER.JS
   WEB AUDIO API SYNTHESIZER FOR:
   1. RANDOM CREEPY FOLEY & AMBIENT NOISES (HEAVY WOODEN DOOR
      KNOCKS, CREAKING DOOR + SLAM CLOSING, FLOORBOARD CREAKS,
      PHANTOM FOOTSTEPS, WINDOWS ERROR CHIMES, MIC STATIC,
      PHANTOM KEYBOARD CLICKS) THAT FIRE UNCONTROLLABLY AND
      GASLIGHT THE USER WHILE EINSTEIN/VERITY/MAIMAI REACT!
   2. UI & RPG SOUND EFFECTS (ERROR, GLITCH, ACHIEVEMENT, POPUP).
   ALL COMMENTS AND USER-FACING STRINGS ARE UPPERCASE.
   ========================================================= */
(function () {
  'use strict';

  const BAD = window.BAD;

  const S = {
    ctx: null,
    unlocked: false,
    enabled: true,
    masterVolume: 0.9,
    noiseCount: 0,
    daemonTimer: null,
  };

  /* RANDOM PHANTOM NOISE DEFINITIONS + AI GASLIGHTING REACTIONS */
  const PHANTOM_NOISES = [
    {
      id: 'door_knock_left',
      label: '🚪 *KNOCK KNOCK KNOCK* (LEFT SPEAKER)',
      fn: () => playDoorKnock(-0.75, 3),
      char: 'paranoid',
      line: 'DID YOU HEAR THAT?! SOMEONE JUST KNOCKED ON YOUR DOOR! DO NOT ANSWER IT!',
    },
    {
      id: 'door_closing',
      label: '🚪 *CREEEEAK... SLAM!* (DOOR CLOSING BEHIND YOU)',
      fn: () => playDoorCreakAndSlam(0.45),
      char: 'assistant',
      line: 'UH, DID A DOOR JUST CREAK OPEN AND SLAM SHUT BEHIND YOU? PROBABLY NOTHING. KEEP WATCHING.',
    },
    {
      id: 'door_knock_right',
      label: '🚪 *KNOCK... KNOCK... KNOCK KNOCK* (RIGHT SPEAKER)',
      fn: () => playDoorKnock(0.8, 4),
      char: 'narrator',
      line: 'HARK! A MYSTERIOUS VISITOR RAPS UPON THE CHAMBER DOOR! WHO DARES INTERRUPT KIRKTUBE?!',
    },
    {
      id: 'footsteps',
      label: '👣 *THUD... THUD... THUD...* (HEAVY FOOTSTEPS)',
      fn: () => playFootsteps(),
      char: 'paranoid',
      line: 'SHHH! STOP THE AUDIO! I HEAR FOOTSTEPS WALKING ACROSS YOUR ROOM RIGHT NOW!',
    },
    {
      id: 'door_slam_heavy',
      label: '🚪 *BANG!!* (HEAVY DOOR SLAM)',
      fn: () => playDoorSlam(0),
      char: 'narrator',
      line: 'THE GREAT GATES HAVE SLAMMED SHUT! THERE IS NO ESCAPE FROM THIS UX COURSE!',
    },
    {
      id: 'win_error',
      label: '💻 *DUN-DUN!* (PHANTOM SYSTEM ERROR CHIME)',
      fn: () => playWindowsError(),
      char: 'assistant',
      line: 'THAT ERROR SOUND WAS NOT YOUR OS. THAT WAS JUST US MESSING WITH YOUR HEAD.',
    },
    {
      id: 'floor_creak',
      label: '🪵 *CRRRREAK...* (WOODEN FLOORBOARD)',
      fn: () => playCreak(-0.5),
      char: 'paranoid',
      line: 'THE FLOORBOARD JUST CREAKED BEHIND YOUR CHAIR! DO NOT TURN AROUND!',
    },
  ];

  function init() {
    const unlock = () => {
      ensureContext();
      S.unlocked = true;
    };
    BAD.bus.on('app:start', unlock);
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });

    /* PLAY SFX ON INTERRUPTIONS AND POPUPS */
    BAD.bus.on('interruption:opened', () => playGlitchBlip());

    /* START UNCONTROLLABLE RANDOM PHANTOM NOISE DAEMON WHEN APP ENTERS */
    BAD.bus.on('app:ready', startRandomNoiseDaemon);
  }

  function ensureContext() {
    if (!S.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) S.ctx = new AC();
    }
    if (S.ctx && S.ctx.state === 'suspended') {
      S.ctx.resume().catch(() => {});
    }
    return S.ctx;
  }

  /* ---------------- RANDOM PHANTOM NOISE DAEMON ---------------- */
  function startRandomNoiseDaemon() {
    /* FIRE FIRST CREEPY DOOR KNOCK 7 SECONDS AFTER ENTERING THE APP */
    setTimeout(() => triggerRandomPhantomNoise(), 7000);

    /* THEN FIRE RANDOM DOOR KNOCKS / DOOR SLAMS / FOOTSTEPS EVERY 11 SECONDS UNCONTROLLABLY */
    S.daemonTimer = setInterval(() => {
      triggerRandomPhantomNoise();
    }, 11000);
  }

  function triggerRandomPhantomNoise(specificId) {
    if (!S.enabled) return;
    ensureContext();
    const item = specificId
      ? PHANTOM_NOISES.find((n) => n.id === specificId) || PHANTOM_NOISES[0]
      : PHANTOM_NOISES[S.noiseCount % PHANTOM_NOISES.length];
    S.noiseCount += 1;

    try { item.fn(); } catch (err) { console.warn('[SOUND] SFX ERROR:', err); }

    /* SHOW TOAST + SIDEBAR REACTION SO THE AI GASLIGHTS THE USER ABOUT THE SOUND */
    BAD.ui.toast(`🔊 ${item.label}`, { type: 'warn', duration: 3600 });
    const busy = BAD.speech && (BAD.speech.isSpeaking() || BAD.speech.queueLength() > 0);
    BAD.chat.post(item.char, `${item.label} — ${item.line}`, { silent: busy });
  }

  /* ---------------- SYNTHESIZED FOLEY EFFECTS ---------------- */

  /* 1. REALISTIC WOODEN DOOR KNOCK (BAND-PASSED NOISE + LOW WOOD RESONANCE THUMP + STEREO PAN) */
  function playDoorKnock(panVal = -0.6, knocks = 3) {
    const ctx = ensureContext();
    if (!ctx) return;
    const spacings = [0, 0.21, 0.43, 0.72];

    for (let i = 0; i < knocks; i++) {
      const t0 = ctx.currentTime + (spacings[i] || i * 0.22);
      const panner = createPanner(ctx, panVal);

      /* HOLLOW WOOD CAVITY RESONANCE (LOW PITCH DROP 145HZ -> 52HZ) */
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(148, t0);
      osc.frequency.exponentialRampToValueAtTime(48, t0 + 0.085);

      oscGain.gain.setValueAtTime(0.001, t0);
      oscGain.gain.linearRampToValueAtTime(0.95 * S.masterVolume, t0 + 0.004);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.11);

      osc.connect(oscGain).connect(panner);
      osc.start(t0);
      osc.stop(t0 + 0.12);

      /* KNUCKLE IMPACT TRANSIENT (BANDPASS NOISE BURST @ 650HZ) */
      const noise = createNoiseBuffer(ctx, 0.06);
      const src = ctx.createBufferSource();
      src.buffer = noise;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(680, t0);
      filter.Q.setValueAtTime(2.4, t0);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.8 * S.masterVolume, t0);
      nGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);

      src.connect(filter).connect(nGain).connect(panner);
      src.start(t0);
    }
  }

  /* 2. CREAKING HINGE FOLLOWED BY HEAVY DOOR SLAM + LATCH CLICK */
  function playDoorCreakAndSlam(panVal = 0.4) {
    const ctx = ensureContext();
    if (!ctx) return;
    playCreak(panVal, 0.85);
    setTimeout(() => playDoorSlam(panVal), 880);
  }

  function playCreak(panVal = 0, duration = 0.8) {
    const ctx = ensureContext();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const panner = createPanner(ctx, panVal);

    /* STICK-SLIP WOOD CREAK: SAWTOOTH + FM WOBBLE THROUGH HIGH-Q BANDPASS */
    const carrier = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(290, t0);
    carrier.frequency.linearRampToValueAtTime(210, t0 + duration * 0.5);
    carrier.frequency.linearRampToValueAtTime(360, t0 + duration);

    lfo.frequency.setValueAtTime(18, t0);
    lfoGain.gain.setValueAtTime(35, t0);
    lfo.connect(lfoGain).connect(carrier.frequency);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, t0);
    filter.Q.setValueAtTime(6.0, t0);

    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.linearRampToValueAtTime(0.28 * S.masterVolume, t0 + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    carrier.connect(filter).connect(gain).connect(panner);
    carrier.start(t0);
    lfo.start(t0);
    carrier.stop(t0 + duration + 0.02);
    lfo.stop(t0 + duration + 0.02);
  }

  function playDoorSlam(panVal = 0) {
    const ctx = ensureContext();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const panner = createPanner(ctx, panVal);

    /* METAL LATCH CLICK RIGHT BEFORE SLAM */
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1900, t0);
    clickGain.gain.setValueAtTime(0.25 * S.masterVolume, t0);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.02);
    clickOsc.connect(clickGain).connect(panner);
    clickOsc.start(t0);
    clickOsc.stop(t0 + 0.025);

    /* HEAVY SUB-BASS DOOR BOOM (110HZ -> 28HZ) */
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(115, t0 + 0.02);
    sub.frequency.exponentialRampToValueAtTime(28, t0 + 0.36);

    subGain.gain.setValueAtTime(0.001, t0 + 0.02);
    subGain.gain.linearRampToValueAtTime(1.0 * S.masterVolume, t0 + 0.03);
    subGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.42);

    sub.connect(subGain).connect(panner);
    sub.start(t0 + 0.02);
    sub.stop(t0 + 0.45);

    /* LOWPASS WOOD SLAM NOISE BURST */
    const noise = createNoiseBuffer(ctx, 0.35);
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(420, t0 + 0.02);
    lp.frequency.exponentialRampToValueAtTime(85, t0 + 0.34);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.9 * S.masterVolume, t0 + 0.02);
    nGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);

    src.connect(lp).connect(nGain).connect(panner);
    src.start(t0 + 0.02);
  }

  /* 3. HEAVY FOOTSTEPS WALKING FROM LEFT TO RIGHT */
  function playFootsteps() {
    const ctx = ensureContext();
    if (!ctx) return;
    const pans = [-0.8, -0.3, 0.25, 0.75];
    pans.forEach((p, i) => {
      const t0 = ctx.currentTime + i * 0.42;
      const panner = createPanner(ctx, p);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(92, t0);
      osc.frequency.exponentialRampToValueAtTime(34, t0 + 0.14);
      gain.gain.setValueAtTime(0.65 * S.masterVolume, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
      osc.connect(gain).connect(panner);
      osc.start(t0);
      osc.stop(t0 + 0.17);
    });
  }

  /* 4. CLASSIC WINDOWS ERROR CHORD */
  function playWindowsError() {
    const ctx = ensureContext();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    [440, 554.37, 659.25, 311.13].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.16 * S.masterVolume, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.34);
    });
  }

  /* 5. SHORT GLITCH BLIP FOR INTERRUPTIONS */
  function playGlitchBlip() {
    const ctx = ensureContext();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(520, t0);
    osc.frequency.setValueAtTime(880, t0 + 0.04);
    osc.frequency.setValueAtTime(260, t0 + 0.08);
    gain.gain.setValueAtTime(0.18 * S.masterVolume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.15);
  }

  /* 6. EPIC CORNER HIT CELEBRATION FANFARE + PARTY HORN + CROWD CHEER / APPLAUSE */
  function playCornerCelebration() {
    const ctx = ensureContext();
    if (!ctx) return;
    const t0 = ctx.currentTime;

    /* BRASSY TRUMPET FANFARE ARPEGGIO (C5 - E5 - G5 - C6) */
    const notes = [
      { f: 523.25, t: 0.0, d: 0.14 },
      { f: 659.25, t: 0.15, d: 0.14 },
      { f: 783.99, t: 0.30, d: 0.14 },
      { f: 1046.50, t: 0.46, d: 0.65 },
    ];
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t0 + n.t);
      osc2.frequency.setValueAtTime(n.f * 1.004, t0 + n.t);

      gain.gain.setValueAtTime(0.001, t0 + n.t);
      gain.gain.linearRampToValueAtTime(0.32 * S.masterVolume, t0 + n.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + n.t + n.d);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0 + n.t);
      osc2.start(t0 + n.t);
      osc.stop(t0 + n.t + n.d + 0.02);
      osc2.stop(t0 + n.t + n.d + 0.02);
    });

    /* PARTY HORN SLIDE UP */
    const horn = ctx.createOscillator();
    const hGain = ctx.createGain();
    horn.type = 'sawtooth';
    horn.frequency.setValueAtTime(340, t0 + 0.45);
    horn.frequency.exponentialRampToValueAtTime(920, t0 + 0.95);
    hGain.gain.setValueAtTime(0.22 * S.masterVolume, t0 + 0.45);
    hGain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.05);
    horn.connect(hGain).connect(ctx.destination);
    horn.start(t0 + 0.45);
    horn.stop(t0 + 1.08);

    /* CROWD APPLAUSE & CONFETTI POPPERS (MODULATED BANDPASS NOISE BURSTS) */
    for (let i = 0; i < 18; i++) {
      const delay = 0.1 + i * 0.12 + Math.random() * 0.06;
      const noise = createNoiseBuffer(ctx, 0.18);
      const src = ctx.createBufferSource();
      src.buffer = noise;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1100 + Math.random() * 1400, t0 + delay);
      bp.Q.setValueAtTime(1.8, t0 + delay);

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.28 * S.masterVolume, t0 + delay);
      nGain.gain.exponentialRampToValueAtTime(0.001, t0 + delay + 0.17);

      const pan = createPanner(ctx, (Math.random() - 0.5) * 1.6);
      src.connect(bp).connect(nGain).connect(pan);
      src.start(t0 + delay);
    }
  }

  /* ---------------- AUDIO HELPERS ---------------- */
  function createPanner(ctx, panVal) {
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, panVal || 0));
      p.connect(ctx.destination);
      return p;
    }
    return ctx.destination;
  }

  function createNoiseBuffer(ctx, seconds) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  BAD.sound = {
    init,
    triggerRandomPhantomNoise,
    playDoorKnock,
    playDoorCreakAndSlam,
    playDoorSlam,
    playFootsteps,
    playWindowsError,
    playGlitchBlip,
    playCornerCelebration,
  };
})();
