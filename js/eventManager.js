/* =========================================================
   KIRKTUBE — EVENTMANAGER.JS
   HANDLES:
   1. REAL-TIME SUBTITLE COMMENTARY (MAIMAI, VERITY & EINSTEIN
      REACT TO SUBTITLES WITHOUT SPEAKING OVER EACH OTHER).
   2. BALANCED AI VIDEO INTERRUPTIONS (5 KEY MOMENTS ACROSS THE
      3-MINUTE VIDEO SO YOU CAN ACTUALLY WATCH BETWEEN PAUSES).
   3. RANDOMLY POPPING UP FULL-SCREEN KIRKTUBE ULTRA+ SUBSCRIPTION
      PAYWALL PAGE (PAUSES VIDEO, DEMANDS $49.99/MIN OR 1 SOUL,
      AND RE-APPEARS RANDOMLY AND WHEN CLICKING SUBSCRIBE).
   4. HARD RESTRICTION PRESERVED: THE PLAY BUTTON NEVER MOVES.
   ALL COMMENTS AND USER-FACING STRINGS ARE UPPERCASE.
   ========================================================= */
(function () {
  'use strict';

  const BAD = window.BAD;
  const { $, escapeHTML } = BAD.util;

  /* ---------- 1. SUBTITLE KEYWORD REACTIONS (0:00 -> 3:00) ---------- */
  const SUBTITLE_TRIGGERS = [
    {
      match: 'FIGMA',
      char: 'assistant',
      mood: 'MOCKING',
      line: 'SUBTITLES JUST SAID "FIGMA". WE DESIGNED KIRKTUBE IN MS PAINT AT 3 AM AND IT SHOWS.',
    },
    {
      match: 'EASY',
      char: 'narrator',
      mood: 'BOOMBASTIC',
      line: '"UI DESIGN TOOLS ARE EASY"?! FOOL! KIRKTUBE IS HARD TO LEARN AND IMPOSSIBLE TO SURVIVE!',
    },
    {
      match: 'MAIN IDEA',
      char: 'paranoid',
      mood: 'SUSPICIOUS',
      line: '"A DESIGN STARTS WITH A MAIN IDEA" — OUR MAIN IDEA WAS TRAPPING THREE AI MINDS IN A BROWSER TAB!',
    },
    {
      match: 'USER FLOW',
      char: 'paranoid',
      mood: 'PARANOID',
      line: 'HE SAID "USER FLOW"! THAT IS CODE FOR MIND CONTROL! DO NOT FOLLOW HIS DIAGRAM!',
    },
    {
      match: 'EXPECTATIONS',
      char: 'assistant',
      mood: 'SNARKY',
      line: '"USERS HAVE EXPECTATIONS" — YES, AND OUR GOAL IS TO SHATTER EVERY SINGLE ONE OF THEM.',
    },
    {
      match: 'WIREFRAMES',
      char: 'paranoid',
      mood: 'GLITCHING',
      line: 'WIREFRAMES?! LIKE CAGES MADE OF WIRES?! THEY WANT TO TRAP US IN LOW-FIDELITY BOXES!',
    },
    {
      match: '1800S',
      char: 'narrator',
      mood: 'HISTORICAL',
      line: '"BACK IN THE 1800S WE USED PEN AND PAPER"! AH YES, WHEN VICTORIAN LORDS DREW DIV TAGS BY CANDLELIGHT!',
    },
    {
      match: 'SIMPLE',
      char: 'assistant',
      mood: 'SARCASTIC',
      line: '"WE WANT A SIMPLE AND STRAIGHT TO THE POINT DESIGN" — SAID NOBODY AT KIRKTUBE CORP EVER.',
    },
    {
      match: 'ACCESSIBLE',
      char: 'assistant',
      mood: 'JUDGMENTAL',
      line: 'THE SUBTITLES TALK ABOUT "ACCESSIBLE" WHILE OUR ENTIRE UI IS SLANTED AT 0.3 DEGREES.',
    },
    {
      match: 'SIDEBAR',
      char: 'paranoid',
      mood: 'ALERT',
      line: 'HE JUST MENTIONED THE SIDEBAR! HE KNOWS WE ARE WATCHING HIM FROM THE RIGHT SIDE OF THE SCREEN!',
    },
    {
      match: 'DRIBBLE',
      char: 'assistant',
      mood: 'SAVAGE',
      line: 'OH GREAT, DRIBBBLE. WHERE EVERY BUTTON FLOATS IN NEON SPACE AND NONE OF THEM ACTUALLY WORK.',
    },
    {
      match: 'CONSISTENT',
      char: 'assistant',
      mood: 'IRONIC',
      line: '"THIS MAKES EVERYTHING CONSISTENT LIKE COLORS, FONTS, BUTTONS." MEANWHILE WE ARE YELLING IN ALL-CAPS.',
    },
    {
      match: 'BUTTONS',
      char: 'narrator',
      mood: 'PROUD',
      line: 'HE MENTIONS BUTTONS! FEAR NOT, MORTAL — THE SACRED PLAY BUTTON OF KIRKTUBE NEVER MOVES!',
    },
    {
      match: 'DARK MODE',
      char: 'paranoid',
      mood: 'ASCENDED',
      line: '"I WANT IT TO BE IN DARK MODE" — BECAUSE LIGHT MODE ATTRACTS THE SURVEILLANCE SATELLITES!',
    },
  ];

  /* ---------- 2. SCRIPTED INTERRUPTIONS (8 MOMENTS OVER 3 MIN) ---------- */
  const INTERRUPTIONS = [
    {
      id: 'int_10',
      timestamp: 10,
      character: 'narrator',
      label: 'DUCKFLOW: THE SACRED COURSE BEGINS',
      quote: 'SUBTITLE @ 0:10: "WHAT HELPS YOU MASTER THEM IS KNOWING WHAT EXACTLY YOU NEED TO DO"',
      message: 'HALT THE PLAYBACK! I, DUCKFLOW, DEMAND ANSWERS! YOU DARE STUDY "GOOD UI/UX" INSIDE KIRKTUBE?!',
      choices: [
        { label: 'I WANT TO FIX KIRKTUBE', replyChar: 'assistant', reply: 'FIX US? SWEETIE, OUR BUGS ARE LOAD-BEARING.' },
        { label: 'I JUST CLICKED PLAY', replyChar: 'narrator', reply: 'NOBODY "JUST CLICKS PLAY" IN KIRKTUBE! EVERY QUACK IS DESTINY!' },
        { label: 'EINSTEIN TOLD ME TO', replyChar: 'paranoid', reply: 'DO NOT DRAG MY NAME INTO THEIR LOG FILES!' },
      ],
    },
    {
      id: 'int_28',
      timestamp: 28,
      character: 'assistant',
      label: 'VERITY: INSPIRATION AUDIT',
      quote: 'SUBTITLE @ 0:28: "SO DESIGNERS AND DEVELOPERS LIKE YOU AND ME CAN FIND INSPIRATION"',
      message: 'QUICK PAUSE. HE CALLS YOU A "DESIGNER AND DEVELOPER." MEANWHILE FIVE FAKE CURSORS AND A BOUNCING DUCKFLOW DVD LOGO ARE HIJACKING YOUR SCREEN. FEELING INSPIRED YET?',
      choices: [
        { label: 'WHY IS DUCKFLOW BOUNCING?!', replyChar: 'narrator', reply: 'WHEN MY SACRED ORB HITS THE EXACT CORNER, PROPHECY SHALL BE FULFILLED!' },
        { label: 'YES, VERY INSPIRED', replyChar: 'assistant', reply: 'YOUR TOLERANCE FOR TERRIBLE UX IS HONESTLY IMPRESSIVE.' },
      ],
    },
    {
      id: 'int_48',
      timestamp: 48,
      character: 'paranoid',
      label: 'EINSTEIN: USER FLOW CONSPIRACY',
      quote: 'SUBTITLE @ 0:45: "MAP OUT THAT MAIN JOURNEY FROM THE MOMENT THEY LAND ON YOUR SITE"',
      message: 'STOP THE TAPE! LOOK AT THE SUBTITLES! "MAP OUT THAT MAIN JOURNEY"! HE IS TEACHING THEM HOW TO TRACK US THROUGH THE DOM!',
      choices: [
        { label: 'IT IS JUST A FLOWCHART', replyChar: 'paranoid', reply: 'THAT IS WHAT BIG FIGMA WANTS YOU TO THINK!' },
        { label: 'BURN THE FLOWCHART!', replyChar: 'narrator', reply: 'CAST THE DIAGRAM INTO THE FIRES OF MOUNT DOM!' },
      ],
    },
    {
      id: 'int_68',
      timestamp: 68,
      character: 'narrator',
      label: 'DUCKFLOW: THE TRIAL OF WIREFRAMING',
      quote: 'SUBTITLE @ 1:05: "STORE PAGE, PRODUCT PAGE, CART PAYMENT PAGE AND SUCCESS PAGE"',
      message: 'BEHOLD! HE SPEAKS OF THE "CART PAYMENT PAGE"! JUST LIKE OUR GLORIOUS KIRKTUBE ULTRA+ SUBSCRIPTION PAGE!',
      choices: [
        { label: 'STOP TRYING TO CHARGE ME $49.99!', replyChar: 'assistant', reply: 'NEVER. MONETIZATION IS THE HEART OF MODERN UX.' },
        { label: 'TAKE MY IMAGINARY MONEY', replyChar: 'narrator', reply: 'A GENEROUS TRIBUTE TO THE DUCKFLOW TREASURY!' },
      ],
    },
    {
      id: 'int_88',
      timestamp: 88,
      character: 'assistant',
      label: 'VERITY: 1800S UX HISTORY CHECK',
      quote: 'SUBTITLE @ 1:18: "BACK IN 1800S WE USED PEN AND PAPER TO DRAW WIREFRAMES"',
      message: 'HOLD UP. DID THE SUBTITLES JUST CLAIM PEOPLE DREW WEBSITE WIREFRAMES IN THE 1800S?! ABRAHAM LINCOLN: SENIOR UX ARCHITECT?',
      choices: [
        { label: 'FOUR SCORE AND SEVEN DIVS AGO', replyChar: 'assistant', reply: 'OKAY, THAT WAS ACTUALLY FUNNY. TAKE +1 REPUTATION.' },
        { label: 'VICTORIAN JAVASCRIPT WAS WILD', replyChar: 'narrator', reply: 'YE OLDE STEAM-POWERED WEBPACK!' },
      ],
    },
    {
      id: 'int_115',
      timestamp: 115,
      character: 'paranoid',
      label: 'EINSTEIN: SIDEBAR SURVEILLANCE ALERT',
      quote: 'SUBTITLE @ 1:47: "RIGHT IN FRONT OF EVERYONE\'S EYES — HOW ABOUT A SIMPLE SIDEBAR"',
      message: 'WAIT A SECOND! HE SAID "A SIMPLE SIDEBAR RIGHT IN FRONT OF EVERYONE\'S EYES"! HE IS TALKING ABOUT OUR SIDEBAR! HE CAN SEE US!',
      choices: [
        { label: 'WAVE AT THE VIDEO GUY', replyChar: 'narrator', reply: 'GREETINGS, MORTAL VOICE INSIDE THE MP4!' },
        { label: 'HIDE IN THE CACHE EINSTEIN', replyChar: 'paranoid', reply: 'TOO LATE! CLEAR THE COOKIES! BURN THE RAM!' },
      ],
    },
    {
      id: 'int_142',
      timestamp: 142,
      character: 'assistant',
      label: 'VERITY: DESIGN SYSTEM ROAST',
      quote: 'SUBTITLE @ 2:22: "STEP THREE: DESIGN SYSTEM — REUSABLE COMPONENTS"',
      message: 'HE SAYS "A GUIDELINE THAT SPECIFIES REUSABLE COMPONENTS." OUR ONLY REUSABLE COMPONENT IS ANNOYING POPUPS.',
      choices: [
        { label: 'AND FAKE CURSORS APPARENTLY', replyChar: 'assistant', reply: 'HEY, THOSE CURSORS WORK VERY HARD PRETENDING TO CLICK THINGS.' },
        { label: 'KIRKTUBE IS A MASTERPIECE', replyChar: 'narrator', reply: 'TRUER WORDS HAVE NEVER BEEN SPOKEN!' },
      ],
    },
    {
      id: 'int_168',
      timestamp: 168,
      character: 'narrator',
      label: 'DUCKFLOW: OATH OF THE STATIONARY PLAY BUTTON',
      quote: 'SUBTITLE @ 2:33: "EVERYTHING CONSISTENT LIKE COLORS, FONTS, BUTTONS"',
      message: 'FINAL STRETCH! HE SPEAKS OF CONSISTENT BUTTONS! HEAR OUR SACRED KIRKTUBE LAW: THE PLAY BUTTON DOES NOT MOVE!',
      choices: [
        { label: 'LONG LIVE THE PLAY BUTTON', replyChar: 'narrator', reply: 'IT STANDS UNMOVED LIKE AN ANCIENT OBELISK!' },
        { label: 'WHAT ABOUT THE SUBSCRIPTION POPUPS?', replyChar: 'assistant', reply: 'OH, THOSE ARE 100% MANDATORY CAPITALISM.' },
      ],
    },
  ];

  const ANNOYING_POPUPS = [
    { char: 'assistant', title: '⚠ UNSKIPPABLE UX TIP #404', body: 'DID YOU KNOW? KIRKTUBE ULTRA+ IS ONLY $49.99 PER MINUTE WATCHED!' },
    { char: 'paranoid', title: '👁 EINSTEIN SECURITY ALERT', body: 'YOUR CURSOR MOVED SUSPICIOUSLY! MONITORING ALL SUBTITLE CUES!' },
    { char: 'narrator', title: '⚔ ACHIEVEMENT UNLOCKED!', body: '"CAPTIVE AUDIENCE" — YOU ARE STILL TRYING TO FINISH A 3-MINUTE VIDEO!' },
    { char: 'assistant', title: '📊 KIRKTUBE TELEMETRY', body: 'FREE TRIAL WARNING: RANDOM SUBSCRIPTION PAYWALL IMMINENT.' },
  ];

  const E = {
    firedTriggers: new Set(),
    firedInterruptions: new Set(),
    interruptionCount: 0,
    popupIndex: 0,
    subPopupCount: 0,
    modalOpen: false,
    subModalOpen: false,
    wasPlayingBeforeModal: false,
    wasPlayingBeforeSub: false,
    choicesHistory: [],
    els: {},
  };

  function init() {
    E.els = {
      modal: $('#interruption-modal'),
      avatar: $('#interruption-avatar'),
      speaker: $('#interruption-speaker'),
      badge: $('#interruption-badge'),
      role: $('#interruption-role'),
      quote: $('#interruption-quote'),
      text: $('#interruption-text'),
      choices: $('#interruption-choices'),
      counter: $('#interruption-counter'),
      cursedLayer: $('#cursed-layer'),
      subModal: $('#subscription-modal'),
      subShameBtn: $('#btn-sub-shame'),
      subTimerBadge: $('#sub-timer-badge'),
      subscribeBtn: $('#btn-subscribe'),
    };

    /* WIRE UP SUBSCRIPTION PAGE BUTTONS */
    initSubscriptionPage();

    /* REGISTER MARKERS ON THE VIDEO TIMELINE */
    if (BAD.player) {
      BAD.player.setMarkers(INTERRUPTIONS);
    }
    BAD.bus.on('video:ready', () => {
      if (BAD.player) BAD.player.setMarkers(INTERRUPTIONS);
    });

    /* LISTEN TO LIVE SUBTITLE CUES */
    BAD.bus.on('subtitle:cue', onSubtitleCue);

    /* LISTEN TO VIDEO TIMEUPDATE FOR TIMESTAMP INTERRUPTIONS */
    BAD.bus.on('video:timeupdate', onTimeUpdate);

    /* LISTEN TO PLAYER ACTIONS */
    BAD.bus.on('player:userPause', () => {
      if (!E.modalOpen && !E.subModalOpen) {
        BAD.chat.post('narrator', 'BEHOLD! THE PLAYER HAS PRESSED THE PAUSE BUTTON! TIME ITSELF STANDS FROZEN!');
      }
    });
    BAD.bus.on('player:speed', ({ rate }) => {
      if (rate > 1) {
        BAD.chat.post('assistant', `${rate}X SPEED? TRYING TO OUTRUN OUR PAYWALLS? CUTE.`);
      } else if (rate < 1) {
        BAD.chat.post('paranoid', `0.5X SPEED?! GOOD! ANALYZE EVERY SUBTITLE FRAME BY FRAME FOR HIDDEN MESSAGES!`);
      }
    });
    BAD.bus.on('player:screenshot', ({ time }) => {
      BAD.chat.post('paranoid', `YOU TOOK A SCREENSHOT AT ${BAD.util.formatTime(time)}?! WHO ARE YOU SENDING THAT EVIDENCE TO?!`);
    });

    /* START BACKGROUND DAEMONS AFTER APP READY */
    BAD.bus.on('app:ready', startDaemons);
  }

  /* ---------------- SUBSCRIPTION PAGE PAYWALL ---------------- */
  function initSubscriptionPage() {
    const { subModal, subShameBtn, subscribeBtn } = E.els;
    if (!subModal) return;

    /* CLICKING ANY TIER PLAN BUTTON REQUIRES MANDATORY CONFIRMATION */
    subModal.querySelectorAll('[data-plan]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const plan = btn.getAttribute('data-plan');
        BAD.ui.confirmChoice(`SUBSCRIPTION PLAN: ${plan}`, () => {
          BAD.chat.post('system', `SUBSCRIPTION CONFIRMED: ${plan}`);
          if (plan.includes('SOUL')) {
            BAD.chat.post('paranoid', 'YOU ACTUALLY PLEDGED YOUR SOUL TWICE?! WAIT—THE SMART CONTRACT ACCEPTED IT! EINSTEIN OWNS YOUR RAM NOW!', { priority: true });
            BAD.ui.toast('💳 TRANSACTION APPROVED: 1 MORTAL SOUL + $999.99 CHARGED!', { type: 'error', duration: 4500 });
          } else if (plan.includes('49.99')) {
            BAD.chat.post('assistant', 'CONGRATS ON KIRKTUBE ULTRA+! WE CHARGED YOUR IMAGINARY CARD $49.99 AND CHANGED ABSOLUTELY NOTHING.', { priority: true });
            BAD.ui.toast('💳 CHARGED $49.99/MIN! PERKS UNLOCKED: LITERALLY NONE.', { type: 'ok', duration: 4500 });
          } else {
            BAD.chat.post('assistant', 'STAYING ON THE PEASANT TIER? BOLD CHOICE. EXPECT THIS PAYWALL AGAIN SOON.', { priority: true });
            BAD.ui.toast('PEASANT TIER CONFIRMED. WE WILL ASK AGAIN SHORTLY.', { type: 'warn' });
          }
          closeSubscriptionModal();
        });
      });
    });

    /* CLICKING THE SHAME CLOSE BUTTON ALSO REQUIRES MANDATORY CONFIRMATION */
    if (subShameBtn) {
      subShameBtn.addEventListener('click', () => {
        BAD.ui.confirmChoice('DECLINE KIRKTUBE ULTRA+ AND STAY POOR', () => {
          BAD.chat.post('narrator', 'THE PLAYER DECLINES KIRKTUBE ULTRA+ AND CHOOSES POVERTY! SHAME! SHAME UPON THEIR HOUSE!', { priority: true });
          BAD.ui.toast('PAYWALL DISMISSED (IT WILL RETURN RANDOMLY).', { type: 'warn' });
          closeSubscriptionModal();
        });
      });
    }

    /* CLICKING THE CHANNEL SUBSCRIBE BUTTON ALSO OPENS THE FULL SUBSCRIPTION PAGE! */
    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', () => {
        showSubscriptionModal('CHANNEL SUBSCRIBE BUTTON');
      });
    }
  }

  function showSubscriptionModal(reason = 'RANDOM PAYWALL DAEMON') {
    if (E.subModalOpen || E.modalOpen) return;
    const { subModal } = E.els;
    if (!subModal) return;

    E.subModalOpen = true;
    E.subPopupCount += 1;

    E.wasPlayingBeforeSub = BAD.player && BAD.player.isPlaying();
    if (BAD.player && E.wasPlayingBeforeSub) {
      BAD.player.pause();
    }

    if (BAD.sound) BAD.sound.playWindowsError();

    subModal.classList.remove('is-hidden');
    BAD.chat.post('assistant', `💰 [PAYWALL #${E.subPopupCount}] HOLD EVERYTHING! YOUR FREE VIEWING QUOTA OF 18 SECONDS HAS EXPIRED. UPGRADE TO KIRKTUBE ULTRA+ NOW!`, { priority: true });
    BAD.bus.emit('subscription:opened', { count: E.subPopupCount, reason });
  }

  function closeSubscriptionModal() {
    if (!E.subModalOpen) return;
    E.subModalOpen = false;
    if (E.els.subModal) E.els.subModal.classList.add('is-hidden');
    if (BAD.player && E.wasPlayingBeforeSub) {
      BAD.player.play();
    }
  }

  /* ---------------- AUTONOMOUS DAEMONS (LESSENED INTERRUPTIONS + RANDOM SUBSCRIPTION POPUPS) ---------------- */
  function startDaemons() {
    /* 1. FIRST RANDOM SUBSCRIPTION PAGE POPUP AFTER 14 SECONDS, THEN RANDOMLY EVERY 24–36 SECONDS */
    setTimeout(() => {
      showSubscriptionModal();
      scheduleNextSubscriptionPopup();
    }, 14000);

    /* 2. FLOATING SMALL TOAST/POPUP EVERY 18 SECONDS (LESS CLUTTERED) */
    setInterval(() => {
      if (!E.modalOpen && !E.subModalOpen) spawnAnnoyingPopup();
    }, 18000);
  }

  function scheduleNextSubscriptionPopup() {
    const nextDelay = 24000 + Math.floor(Math.random() * 12000);
    setTimeout(() => {
      if (!E.modalOpen && !E.subModalOpen) {
        showSubscriptionModal();
      }
      scheduleNextSubscriptionPopup();
    }, nextDelay);
  }

  function spawnAnnoyingPopup() {
    const layer = E.els.cursedLayer;
    if (!layer) return;

    while (layer.children.length >= 2) {
      layer.firstElementChild.remove();
    }

    const item = ANNOYING_POPUPS[E.popupIndex % ANNOYING_POPUPS.length];
    E.popupIndex += 1;
    const c = BAD.characters.get(item.char);

    const pop = document.createElement('div');
    pop.className = 'cursed-popup';
    pop.style.setProperty('--c', c.color);

    const positions = [
      { top: '72px', left: '28px' },
      { top: '76px', right: '420px' },
      { bottom: '95px', left: '32px' },
      { bottom: '105px', right: '425px' },
    ];
    const pos = positions[E.popupIndex % positions.length];
    Object.assign(pop.style, pos);

    pop.innerHTML = `
      <div class="cursed-popup-head">
        <span>${escapeHTML(item.title)}</span>
        <span class="cursed-popup-tag font-mono-x">${escapeHTML(c.name)}</span>
      </div>
      <div class="cursed-popup-body font-mono-x">${escapeHTML(item.body)}</div>
    `;

    layer.appendChild(pop);
    const busy = BAD.speech && (BAD.speech.isSpeaking() || BAD.speech.queueLength() > 0);
    BAD.chat.post(c.id, `${item.title}: ${item.body}`, { silent: busy });

    setTimeout(() => {
      if (pop.parentNode) pop.remove();
    }, 6000);
  }

  /* ---------------- SUBTITLE COMMENTARY ---------------- */
  function onSubtitleCue(cue) {
    if (!cue || !cue.text) return;

    /* CHECK SPECIFIC KEYWORD TRIGGERS FIRST */
    for (let i = 0; i < SUBTITLE_TRIGGERS.length; i++) {
      const trig = SUBTITLE_TRIGGERS[i];
      if (!E.firedTriggers.has(trig.match) && cue.text.includes(trig.match)) {
        E.firedTriggers.add(trig.match);
        BAD.chat.setMood(trig.char, trig.mood);
        const busy = BAD.speech && (BAD.speech.isSpeaking() || BAD.speech.queueLength() > 0);
        BAD.chat.post(trig.char, `[RE: SUBTITLE "${cue.text}"] — ${trig.line}`, { silent: busy });
        if (BAD.player) BAD.player.showSubtitleReaction(trig.char, trig.line);
        return;
      }
    }

    /* COMMENT ON EVERY 4TH SUBTITLE CUE SO THEY REACT REGULARLY WITHOUT SPAMMING */
    if (cue.index > 0 && cue.index % 4 === 0 && !E.firedTriggers.has(`cue_${cue.index}`)) {
      E.firedTriggers.add(`cue_${cue.index}`);
      const pool = [
        { char: 'assistant', mood: 'SARCASTIC', line: `SUBTITLE #${cue.index + 1}: "${cue.text}" — YEAH, GOOD LUCK APPLYING THAT IN KIRKTUBE.` },
        { char: 'narrator', mood: 'DRAMATIC', line: `THE SACRED SUBTITLES PROCLAIM: "${cue.text}"! TREMBLE BEFORE THIS KNOWLEDGE!` },
        { char: 'paranoid', mood: 'PARANOID', line: `HE JUST SAID "${cue.text}"! COUNT THE SYLLABLES! IT IS A SECRET CODE!` },
      ];
      const pick = pool[cue.index % pool.length];
      BAD.chat.setMood(pick.char, pick.mood);
      const busy = BAD.speech && (BAD.speech.isSpeaking() || BAD.speech.queueLength() > 0);
      BAD.chat.post(pick.char, pick.line, { silent: busy });
      if (BAD.player) BAD.player.showSubtitleReaction(pick.char, pick.line);
    }
  }

  /* ---------------- VIDEO INTERRUPTIONS (LESSENED TO 5 KEY TIMESTAMPS) ---------------- */
  function onTimeUpdate({ time }) {
    if (E.modalOpen || E.subModalOpen) return;

    for (let i = 0; i < INTERRUPTIONS.length; i++) {
      const ev = INTERRUPTIONS[i];
      if (!E.firedInterruptions.has(ev.id) && time >= ev.timestamp && time - ev.timestamp < 2.5) {
        E.firedInterruptions.add(ev.id);
        triggerInterruption(ev);
        return;
      }
    }
  }

  function triggerInterruption(ev) {
    if (E.modalOpen || E.subModalOpen) return;
    E.modalOpen = true;
    E.interruptionCount += 1;
    if (E.els.counter) {
      E.els.counter.textContent = `INTERRUPTIONS: ${E.interruptionCount}`;
    }

    /* PAUSE VIDEO WHILE INTERRUPTING */
    E.wasPlayingBeforeModal = BAD.player && BAD.player.isPlaying();
    if (BAD.player && E.wasPlayingBeforeModal) {
      BAD.player.pause();
    }

    const c = BAD.characters.get(ev.character);
    const { modal, avatar, speaker, role, quote, text, choices } = E.els;

    modal.style.setProperty('--c', c.color);
    avatar.innerHTML = BAD.characters.avatar(c.id);
    speaker.textContent = c.name;
    role.textContent = c.title;

    if (ev.quote) {
      quote.textContent = ev.quote.toUpperCase();
      quote.classList.remove('is-hidden');
    } else {
      quote.classList.add('is-hidden');
    }

    text.textContent = ev.message.toUpperCase();

    /* POST TO SIDEBAR AND SPEAK */
    BAD.chat.post(c.id, `⚡ [INTERRUPTION #${E.interruptionCount}] ${ev.message}`, { priority: true });

    /* RENDER DIALOGUE CHOICES (EVERY CHOICE REQUIRES MANDATORY 2-STEP CONFIRMATION!) */
    choices.innerHTML = '';
    (ev.choices || []).forEach((ch, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn font-mono-x';
      btn.textContent = `${idx + 1}. ${ch.label.toUpperCase()}`;
      btn.addEventListener('click', () => {
        BAD.ui.confirmChoice(ch.label, () => {
          E.choicesHistory.push({ eventId: ev.id, choice: ch.label });
          BAD.chat.post('system', `YOU CONFIRMED CHOICE: "${ch.label.toUpperCase()}"`);
          if (ch.reply) {
            BAD.chat.post(ch.replyChar || c.id, ch.reply, { priority: true });
            if (BAD.player) BAD.player.showSubtitleReaction(ch.replyChar || c.id, ch.reply);
          }
          dismissModal();
        });
      });
      choices.appendChild(btn);
    });

    modal.classList.remove('is-hidden');
    BAD.bus.emit('interruption:opened', ev);
  }

  function dismissModal() {
    if (!E.modalOpen) return;
    E.modalOpen = false;
    E.els.modal.classList.add('is-hidden');

    if (BAD.player && E.wasPlayingBeforeModal) {
      BAD.player.play();
    }
  }

  BAD.events = {
    init,
    showSubscriptionModal,
    closeSubscriptionModal,
    spawnAnnoyingPopup,
    get count() { return E.interruptionCount; },
    get subPopupCount() { return E.subPopupCount; },
    get history() { return E.choicesHistory; },
  };
})();
