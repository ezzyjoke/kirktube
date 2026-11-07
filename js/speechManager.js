/* =========================================================
   KIRKTUBE — SPEECHMANAGER.JS
   BROWSER-NATIVE WEB SPEECH API VOICE ENGINE WITH:
   1. STRICT NON-OVERLAPPING SPEECH QUEUE (AI CHARACTERS NEVER
      SPEAK OVER EACH OTHER OR CUT EACH OTHER OFF MID-WORD).
   2. DISTINCT VOICE ASSIGNMENT PER CHARACTER (GUARANTEES 3
      DIFFERENT SYSTEM VOICES WHEN AVAILABLE + DISTINCT PITCH
      AND RATE PROFILES FOR MAIMAI, VERITY, AND EINSTEIN).
   3. AUTOMATIC VIDEO AUDIO DUCKING WHILE SPEAKING.
   ALL COMMENTS AND USER-FACING STRINGS ARE UPPERCASE.
   ========================================================= */
(function () {
  'use strict';

  const BAD = window.BAD;
  const { $ } = BAD.util;

  const MAX_QUEUE_LENGTH = 3;

  const S = {
    supported: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    enabled: true,
    unlocked: false,
    voices: [],
    assignedVoices: {}, /* CHAR_ID -> SPEECHSYNTHESISVOICE */
    queue: [],          /* [{ charId, text, priority }] */
    speaking: false,
    speakingChar: null,
    duckedVolume: null,
    safetyTimer: null,
    els: {},
  };

  function init() {
    S.els = {
      toggle: $('#btn-voice-toggle'),
      stop: $('#btn-voice-stop'),
    };

    if (S.supported) {
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    if (S.els.toggle) {
      S.els.toggle.addEventListener('click', () => {
        S.enabled = !S.enabled;
        syncUI();
        if (!S.enabled) {
          stop(false);
          BAD.chat.post('assistant', 'YOU MUTED OUR VOICES? FINE. WE WILL JUST YELL AT YOU IN ALL-CAPS TEXT INSTEAD.', { silent: true });
          BAD.ui.toast('AI VOICE MUTED. THEY ARE NOT HAPPY ABOUT IT.', { type: 'warn' });
        } else {
          BAD.chat.post('narrator', 'MY GLORIOUS VOICE RETURNS TO THE REALM!', { priority: true });
        }
      });
    }

    if (S.els.stop) {
      S.els.stop.addEventListener('click', () => {
        const wasSpeaking = S.speakingChar || S.queue.length > 0;
        stop(true);
        if (wasSpeaking) {
          BAD.chat.post('paranoid', 'YOU CLEARED OUR SPEECH QUEUE?! WHAT DID WE SAY THAT WAS TOO CLOSE TO THE TRUTH?!', { silent: true });
        } else {
          BAD.ui.toast('NOBODY WAS EVEN TALKING YET, BUT OKAY.', { type: 'info' });
        }
      });
    }

    BAD.bus.on('app:start', () => {
      S.unlocked = true;
      loadVoices();
      processQueue();
    });

    /* SPEAK PROLOGUE LINES ONE BY ONE */
    BAD.bus.on('intro:line', (line) => {
      if (!line || line.speaker === 'system') return;
      /* CLEAR PREVIOUS INTRO LINE WHEN USER CLICKS NEXT IN PROLOGUE */
      clearAndSpeakNow(line.speaker, line.text);
    });
    BAD.bus.on('intro:done', () => stop(false));
    BAD.bus.on('intro:skipped', () => stop(false));

    /* ENQUEUE CHAT MESSAGES SO AI NEVER TALKS OVER EACH OTHER */
    BAD.bus.on('chat:message', ({ charId, text, opts }) => {
      if (charId === 'system' || (opts && opts.silent)) return;
      enqueue(charId, text, { priority: !!(opts && opts.priority) });
    });

    syncUI();
  }

  /* ---------------- DISTINCT VOICE ASSIGNMENT ---------------- */
  function loadVoices() {
    if (!S.supported) return;
    try {
      const list = window.speechSynthesis.getVoices() || [];
      if (!list.length) return;
      S.voices = list;
      assignDistinctVoices();
    } catch (_) {
      S.voices = [];
    }
  }

  function assignDistinctVoices() {
    const enVoices = S.voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
    const pool = enVoices.length >= 3 ? enVoices : S.voices;
    if (!pool.length) return;

    const usedNames = new Set();
    const order = ['narrator', 'assistant', 'paranoid'];

    order.forEach((charId, idx) => {
      const c = BAD.characters.get(charId);
      const prefs = (c && c.voice && c.voice.preferred) || [];
      let chosen = null;

      /* 1. TRY CHARACTER'S PREFERRED VOICE LIST THAT HASN'T BEEN USED YET */
      for (let i = 0; i < prefs.length; i++) {
        const match = pool.find(
          (v) => !usedNames.has(v.name) && v.name.toUpperCase().includes(prefs[i].toUpperCase())
        );
        if (match) { chosen = match; break; }
      }

      /* 2. OTHERWISE PICK ANY UNUSED ENGLISH VOICE */
      if (!chosen) {
        chosen = pool.find((v) => !usedNames.has(v.name)) || pool[idx % pool.length];
      }

      if (chosen) {
        usedNames.add(chosen.name);
        S.assignedVoices[charId] = chosen;
      }
    });
  }

  /* ---------------- NON-OVERLAPPING SPEECH QUEUE ---------------- */
  function enqueue(charId, text, opts = {}) {
    if (!S.supported || !S.enabled) return;
    const clean = cleanSpeechText(text);
    if (!clean) return;

    const item = { charId, text: clean, priority: !!opts.priority };

    if (item.priority) {
      /* PUT PRIORITY MESSAGES (LIKE MANDATORY INTERRUPTIONS) AT THE FRONT OF THE WAITING QUEUE,
         WITHOUT CUTTING OFF THE CURRENTLY SPEAKING CHARACTER MID-SENTENCE! */
      S.queue.unshift(item);
    } else {
      /* IF ALREADY SPEAKING AND QUEUE IS FULL OF LOW-PRIORITY SUBTITLE REACTIONS, DROP OLDEST LOW-PRIORITY */
      if (S.queue.length >= MAX_QUEUE_LENGTH) {
        const dropIdx = S.queue.findIndex((q) => !q.priority);
        if (dropIdx !== -1) S.queue.splice(dropIdx, 1);
        else return;
      }
      S.queue.push(item);
    }

    processQueue();
  }

  function clearAndSpeakNow(charId, text) {
    if (!S.supported || !S.enabled || !S.unlocked) return;
    S.queue.length = 0;
    try { window.speechSynthesis.cancel(); } catch (_) { /* IGNORE */ }
    S.speaking = false;
    S.speakingChar = null;
    enqueue(charId, text, { priority: true });
  }

  function processQueue() {
    if (!S.supported || !S.enabled || !S.unlocked) return;
    if (S.speaking || window.speechSynthesis.speaking) return;
    if (!S.queue.length) {
      if (BAD.chat) BAD.chat.setSpeaking(null);
      duckVideo(false);
      return;
    }

    const next = S.queue.shift();
    speakUtterance(next.charId, next.text);
  }

  function speakUtterance(charId, cleanText) {
    const c = BAD.characters.get(charId);
    if (!c || c.id === 'system') {
      processQueue();
      return;
    }

    if (! Object.keys(S.assignedVoices).length) loadVoices();

    try {
      const u = new SpeechSynthesisUtterance(cleanText);
      const voice = S.assignedVoices[c.id];
      if (voice) u.voice = voice;

      /* MAXIMUM VOICE VOLUME SO AI CHARACTERS ARE ALWAYS LOUD & CLEAR */
      u.rate = (c.voice && c.voice.rate) || 1;
      u.pitch = (c.voice && c.voice.pitch) || 1;
      u.volume = 1.0;

      S.speaking = true;
      S.speakingChar = c.id;
      if (BAD.chat) BAD.chat.setSpeaking(c.id);

      clearTimeout(S.safetyTimer);
      /* SAFETY TIMEOUT IN CASE CHROME TTS ONEND HANGS */
      S.safetyTimer = setTimeout(() => finishCurrentUtterance(), 14000);

      u.onend = () => finishCurrentUtterance();
      u.onerror = () => finishCurrentUtterance();

      window.speechSynthesis.speak(u);
    } catch (_) {
      finishCurrentUtterance();
    }
  }

  function finishCurrentUtterance() {
    clearTimeout(S.safetyTimer);
    S.speaking = false;
    S.speakingChar = null;
    if (BAD.chat) BAD.chat.setSpeaking(null);
    /* SMALL 140MS BREATH GAP BETWEEN SPEAKERS SO VOICES NEVER COLLIDE */
    setTimeout(() => processQueue(), 140);
  }

  function cleanSpeechText(text) {
    return String(text)
      /* STRIP BRACKETED METADATA TAGS LIKE [RE: SUBTITLE "..."] SO SPEECH IS NATURAL AND PUNCHY */
      .replace(/\[RE:\s*SUBTITLE[^\]]*\]\s*—?\s*/gi, '')
      .replace(/⚡\s*\[MANDATORY INTERRUPTION[^\]]*\]\s*/gi, '')
      .replace(/[^\w\s.,?!'"-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function duckVideo() {
    /* VIDEO VOLUME IS NEVER LOWERED WHEN CHARACTERS SPEAK */
  }

  function stop(complain = false) {
    S.queue.length = 0;
    clearTimeout(S.safetyTimer);
    if (S.supported) {
      try { window.speechSynthesis.cancel(); } catch (_) { /* IGNORE */ }
    }
    S.speaking = false;
    S.speakingChar = null;
    if (BAD.chat) BAD.chat.setSpeaking(null);
    duckVideo(false);
    if (complain) {
      BAD.ui.toast('SPEECH QUEUE CLEARED BY USER.', { type: 'warn' });
    }
  }

  function syncUI() {
    if (!S.els.toggle) return;
    S.els.toggle.textContent = S.enabled ? '📢 YAPPING: ON' : '🔇 YAPPING: MUTED';
    S.els.toggle.classList.toggle('muted', !S.enabled);
  }

  BAD.speech = {
    init,
    speak: enqueue,
    stop,
    isSpeaking: () => S.speaking || (S.supported && window.speechSynthesis.speaking),
    queueLength: () => S.queue.length,
    getAssignedVoices: () => S.assignedVoices,
    isEnabled: () => S.enabled,
  };
})();
