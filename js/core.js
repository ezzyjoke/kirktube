/* =========================================================
   KIRKTUBE — CORE.JS
   SHARED NAMESPACE, CONFIG, EVENT BUS, UTILITIES, TOASTS.
   EVERY OTHER MODULE ATTACHES ITSELF TO WINDOW.BAD.
   ALL COMMENTS AND USER-FACING STRINGS ARE UPPERCASE.
   ========================================================= */
(function () {
  'use strict';

  const BAD = (window.BAD = window.BAD || {});

  BAD.APP_NAME = 'KIRKTUBE';
  BAD.VERSION = '0.4.04-BETA';
  BAD.CODENAME = 'BUGGY-BUILD';
  BAD.COMPANY = 'KIRKTUBE CORP™';
  BAD.SLOGAN = 'MAKING SIMPLE THINGS UNNECESSARILY DIFFICULT SINCE FOREVER.';

  /* CENTRAL CONFIGURATION. EDIT PATHS HERE TO SWAP ASSETS. */
  BAD.config = {
    videoSrc: 'assets/demo-placeholder.mp4',
    subtitlesSrc: 'assets/subtitles.vtt',
    videoLoadTimeoutMs: 10000,
    maxToasts: 4,
  };

  /* URL FLAGS (HANDY DURING DEVELOPMENT / PRESENTATIONS). */
  const params = new URLSearchParams(window.location.search);
  BAD.flags = {
    autostart: params.has('autostart'), /* SKIP BOOT WAIT + INTRO */
  };

  /* ---------------- EVENT BUS ---------------- */
  const listeners = Object.create(null);
  BAD.bus = {
    on(evt, fn) {
      (listeners[evt] = listeners[evt] || []).push(fn);
      return () => BAD.bus.off(evt, fn);
    },
    once(evt, fn) {
      const off = BAD.bus.on(evt, (data) => { off(); fn(data); });
      return off;
    },
    off(evt, fn) {
      const list = listeners[evt];
      if (!list) return;
      const i = list.indexOf(fn);
      if (i >= 0) list.splice(i, 1);
    },
    emit(evt, data) {
      (listeners[evt] || []).slice().forEach((fn) => {
        try { fn(data); } catch (err) { console.error(`[BAD.BUS] LISTENER FOR "${evt.toUpperCase()}" FAILED:`, err); }
      });
    },
  };

  /* ---------------- UTILITIES ---------------- */
  BAD.util = {
    $: (sel, root = document) => root.querySelector(sel),
    $$: (sel, root = document) => Array.from(root.querySelectorAll(sel)),
    clamp: (v, min, max) => Math.min(max, Math.max(min, v)),
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),

    formatTime(sec) {
      if (!Number.isFinite(sec) || sec < 0) sec = 0;
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      const ss = String(s).padStart(2, '0');
      return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
    },

    wallTime() {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase();
    },

    escapeHTML(str) {
      return String(str).toUpperCase().replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
      ));
    },
  };

  /* ---------------- TOASTS (BOUNDED) ---------------- */
  BAD.ui = {
    /* SHOW A SMALL TOAST NOTIFICATION (ALWAYS UPPERCASE). */
    toast(message, opts = {}) {
      const layer = document.getElementById('toast-layer');
      if (!layer) return null;
      const { type = 'ok', duration = 3200 } = opts;

      /* NEVER LET TOASTS PILE UP UNCONTROLLABLY. */
      while (layer.children.length >= BAD.config.maxToasts) layer.firstElementChild.remove();

      const t = document.createElement('div');
      t.className = `toast ${type}`;
      t.textContent = String(message).toUpperCase();
      t.addEventListener('click', () => dismiss());
      layer.appendChild(t);

      let gone = false;
      function dismiss() {
        if (gone) return;
        gone = true;
        t.classList.add('leaving');
        setTimeout(() => t.remove(), 300);
      }
      setTimeout(dismiss, duration);
      return { dismiss };
    },

    /* MANDATORY 2-STEP ANNOYING CONFIRMATION AFTER EVERY PROMPT / CHOICE */
    confirmChoice(choiceLabel, onConfirmed, onCancelled) {
      const modal = document.getElementById('confirm-modal');
      const stepBadge = document.getElementById('confirm-step-badge');
      const title = document.getElementById('confirm-title');
      const preview = document.getElementById('confirm-choice-preview');
      const desc = document.getElementById('confirm-desc');
      const yesBtn = document.getElementById('btn-confirm-yes');
      const noBtn = document.getElementById('btn-confirm-cancel');

      if (!modal || !yesBtn || !noBtn) {
        if (typeof onConfirmed === 'function') onConfirmed();
        return;
      }

      const upperChoice = String(choiceLabel).toUpperCase();
      let step = 1;

      function renderStep() {
        if (step === 1) {
          stepBadge.textContent = '⚠ VERIFICATION STEP 1 OF 2';
          const t1 = 'WAIT! ARE YOU 100% SURE ABOUT THAT CHOICE?';
          title.textContent = t1;
          title.setAttribute('data-text', t1);
          preview.textContent = `SELECTED PROMPT: "${upperChoice}"`;
          desc.textContent = 'THIS DECISION WILL BE PERMANENTLY RECORDED IN VOLATILE RAM AND JUDGED HARSHLY BY DUCKFLOW, VERITY, AND EINSTEIN.';
          yesBtn.textContent = '✅ YES, I AM SURE (PROCEED TO FINAL CHECK)';
          noBtn.textContent = '❌ NO, LET ME PICK SOMETHING ELSE';
          modal.querySelector('.confirm-actions').classList.remove('swapped');
        } else {
          stepBadge.textContent = '🚨 FINAL VERIFICATION STEP 2 OF 2 (DOUBLE-CHECK!)';
          const t2 = 'ARE YOU REALLY, TRULY, ABSOLUTELY POSITIVE?!';
          title.textContent = t2;
          title.setAttribute('data-text', t2);
          preview.textContent = `LOCKING IN: "${upperChoice}"`;
          desc.textContent = 'WARNING: WE SWAPPED THE YES AND NO BUTTON POSITIONS JUST TO MAKE SURE YOU ARE PAYING ATTENTION!';
          yesBtn.textContent = '🔥 I SWEAR ON DUCKFLOW, LOCK IT IN!';
          noBtn.textContent = '😱 ABORT! TAKE ME BACK!';
          /* SWAP BUTTON POSITIONS ON STEP 2 TO BE EXTRA ANNOYING */
          modal.querySelector('.confirm-actions').classList.add('swapped');
        }
      }

      function cleanup() {
        modal.classList.add('is-hidden');
        yesBtn.removeEventListener('click', onYes);
        noBtn.removeEventListener('click', onNo);
      }

      function onYes() {
        if (BAD.sound) BAD.sound.playGlitchBlip();
        if (step === 1) {
          step = 2;
          renderStep();
          return;
        }
        cleanup();
        if (typeof onConfirmed === 'function') onConfirmed();
      }

      function onNo() {
        if (BAD.sound) BAD.sound.playWindowsError();
        cleanup();
        BAD.ui.toast('CHOICE ABORTED! PICK AGAIN!', { type: 'warn' });
        if (typeof onCancelled === 'function') onCancelled();
      }

      yesBtn.addEventListener('click', onYes);
      noBtn.addEventListener('click', onNo);

      renderStep();
      modal.classList.remove('is-hidden');
      if (BAD.sound) BAD.sound.playGlitchBlip();
    },

    /* =====================================================
       7-STEP CONFIRMATION GAUNTLET (FOR SKIPPING WALDO CAPTCHA)
       ===================================================== */
    confirmSevenTimes(choiceLabel, onConfirmed, onCancelled) {
      const modal = document.getElementById('confirm-modal');
      const stepBadge = document.getElementById('confirm-step-badge');
      const title = document.getElementById('confirm-title');
      const preview = document.getElementById('confirm-choice-preview');
      const desc = document.getElementById('confirm-desc');
      const yesBtn = document.getElementById('btn-confirm-yes');
      const noBtn = document.getElementById('btn-confirm-cancel');

      if (!modal || !yesBtn || !noBtn) {
        if (typeof onConfirmed === 'function') onConfirmed();
        return;
      }

      const STEPS = [
        {
          badge: '⚠ SKIP CONFIRMATION 1 OF 7',
          title: 'CONFIRMATION #1: ARE YOU SURE YOU WANT TO SKIP WALDO?',
          desc: 'WALDO HID IN THIS CROWD SPECIFICALLY FOR YOU. SKIPPING REQUIRES 7 SEPARATE BUREAUCRATIC CONFIRMATIONS.',
          yes: '✅ YES, CONFIRM SKIP (1/7)',
          no: '❌ NO, TAKE ME BACK TO FIND WALDO',
          swap: false,
        },
        {
          badge: '⚠ SKIP CONFIRMATION 2 OF 7',
          title: 'CONFIRMATION #2: ADMIT DEFEAT TO A STRIPED MAN?',
          desc: 'BY CLICKING YES ON STEP 2, YOU LEGALLY ACKNOWLEDGE THAT A CARTOON MAN IN A BEANIE OUTSMARTED YOU. (WATCH OUT: BUTTONS SWAPPED!)',
          yes: '✅ I ADMIT DEFEAT, CONTINUE SKIP (2/7)',
          no: '❌ ABORT! I WILL FIND WALDO MYSELF!',
          swap: true,
        },
        {
          badge: '⚠ SKIP CONFIRMATION 3 OF 7',
          title: 'CONFIRMATION #3: DUCKFLOW DISAPPOINTMENT WAIVER',
          desc: 'DUCKFLOW IS CRYING DIGITAL TEARS BECAUSE YOU REFUSE TO ENGAGE WITH OUR SECURITY ARTWORK. STILL WANT TO SKIP?',
          yes: '✅ IGNORE DUCKFLOW\'S TEARS (3/7)',
          no: '❌ STOP! I WILL LOOK FOR WALDO!',
          swap: false,
        },
        {
          badge: '⚠ SKIP CONFIRMATION 4 OF 7 (HALFWAY THERE!)',
          title: 'CONFIRMATION #4: YOU COULD HAVE FOUND HIM BY NOW!',
          desc: 'VERITY NOTES THAT YOU HAVE SPENT MORE EFFORT CLICKING CONFIRM THAN LOOKING FOR RED AND WHITE STRIPES. (BUTTONS SWAPPED AGAIN!)',
          yes: '✅ KEEP CLICKING CONFIRM ANYWAY (4/7)',
          no: '❌ CANCEL & RETURN TO CAPTCHA',
          swap: true,
        },
        {
          badge: '⚠ SKIP CONFIRMATION 5 OF 7',
          title: 'CONFIRMATION #5: EINSTEIN PARANOIA CHECK',
          desc: 'EINSTEIN SUSPECTS ONLY AN NSA BOT WOULD STUBBORNLY CLICK THROUGH 5 CONFIRMATION POPUPS. PROVE YOU ARE A STUBBORN HUMAN!',
          yes: '✅ I AM STUBBORN, PROCEED (5/7)',
          no: '❌ ABORT SKIP SEQUENCE',
          swap: false,
        },
        {
          badge: '⚠ SKIP CONFIRMATION 6 OF 7 (ALMOST DONE!)',
          title: 'CONFIRMATION #6: PENULTIMATE SANITY VERIFICATION',
          desc: 'ONLY ONE MORE CONFIRMATION AFTER THIS! CAREFUL — WE SWAPPED THE YES AND NO BUTTONS AGAIN SO YOU DON\'T MISCLICK ON STEP 6!',
          yes: '✅ PROCEED TO FINAL STEP (6/7)',
          no: '❌ MISCLICK TRAP! (CANCELS EVERYTHING)',
          swap: true,
        },
        {
          badge: '🚨 FINAL CONFIRMATION 7 OF 7 — SUPREME UNMUTE OATH',
          title: 'CONFIRMATION #7: FINAL CLICK TO SKIP CAPTCHA & UNMUTE!',
          desc: 'CONGRATULATIONS ON SURVIVING ALL 7 CONFIRMATIONS! CLICK THE GREEN BUTTON BELOW TO BYPASS WALDO AND UNLOCK YOUR AUDIO!',
          yes: '🔓 FINALLY! SKIP CAPTCHA & UNMUTE (7/7)',
          no: '❌ THROW AWAY ALL 6 PREVIOUS CLICKS',
          swap: false,
        },
      ];

      const upperChoice = String(choiceLabel || 'SKIP WALDO CAPTCHA').toUpperCase();
      let idx = 0;

      function renderStep() {
        const s = STEPS[idx];
        stepBadge.textContent = s.badge;
        title.textContent = s.title;
        title.setAttribute('data-text', s.title);
        preview.textContent = `ACTION: "${upperChoice}" [PROGRESS: ${idx + 1} / 7]`;
        desc.textContent = s.desc;
        yesBtn.textContent = s.yes;
        noBtn.textContent = s.no;
        modal.querySelector('.confirm-actions').classList.toggle('swapped', Boolean(s.swap));
      }

      function cleanup() {
        modal.classList.add('is-hidden');
        yesBtn.removeEventListener('click', onYes);
        noBtn.removeEventListener('click', onNo);
      }

      function onYes() {
        if (BAD.sound) BAD.sound.playGlitchBlip();
        if (idx < STEPS.length - 1) {
          idx += 1;
          renderStep();
          BAD.ui.toast(`📋 CONFIRMATION ${idx} OF 7 ACCEPTED! (${7 - idx} LEFT)`, { type: 'info', duration: 1200 });
          return;
        }
        cleanup();
        if (typeof onConfirmed === 'function') onConfirmed();
      }

      function onNo() {
        if (BAD.sound) BAD.sound.playWindowsError();
        cleanup();
        BAD.ui.toast(`❌ SKIP ABORTED AT STEP ${idx + 1} OF 7! FIND WALDO INSTEAD!`, { type: 'warn', duration: 2800 });
        if (typeof onCancelled === 'function') onCancelled();
      }

      yesBtn.addEventListener('click', onYes);
      noBtn.addEventListener('click', onNo);

      renderStep();
      modal.classList.remove('is-hidden');
      if (BAD.sound) BAD.sound.playGlitchBlip();
    },
  };
})();
