/* =========================================================
   KIRKTUBE — INTRO.JS
   THE RPG-STYLE PROLOGUE: TYPEWRITER DIALOGUE BOX, PORTRAITS,
   AND THE GRADUAL INTRODUCTION OF MAIMAI, VERITY, AND EINSTEIN.
   ALL COMMENTS AND USER-FACING STRINGS ARE UPPERCASE.
   ========================================================= */
(function () {
  'use strict';

  const BAD = window.BAD;
  const { $ } = BAD.util;

  /* PROLOGUE SCRIPT FOR DUCKFLOW, VERITY, AND EINSTEIN. */
  const SCRIPT = [
    { speaker: 'system', text: 'KIRKTUBE BOOT SEQUENCE COMPLETE.\nLOADING PERSONALITY MODULES… 3 FOUND. THAT IS 3 TOO MANY.' },
    { speaker: 'narrator', enter: true, text: 'BEHOLD, TRAVELER! YOU HAVE OPENED KIRKTUBE — THE MIGHTIEST VIDEO PLAYER EVER FORGED BY MORTAL HANDS!' },
    { speaker: 'narrator', text: 'FOR A THOUSAND YEARS, SCHOLARS ASKED ONE QUESTION: "WHAT IF PRESSING PLAY… WERE HARD?"' },
    { speaker: 'narrator', text: 'KIRKTUBE ANSWERED! AND I, DUCKFLOW, SHALL NARRATE EVERY. SINGLE. SECOND!' },
    { speaker: 'assistant', enter: true, text: 'UGH. DUCKFLOW IS DOING THE VOICE AGAIN. HI. I\'M VERITY, THE COMPETENT ONE. THE BAR HERE IS ON THE FLOOR.' },
    { speaker: 'narrator', text: 'SILENCE, VERITY! THIS IS MY PROLOGUE!' },
    { speaker: 'assistant', text: 'IT\'S A BUGGY LOADING SCREEN WITH DELUSIONS OF GRANDEUR.' },
    { speaker: 'paranoid', enter: true, glitch: true, chapter: 'CHAPTER 0.5 — SOMETHING IN THE CACHE', text: 'WHO LET THEM IN…\nWHO LET THEM IN?! WHY ARE THEY HERE?! WHAT DO THEY WANT WITH KIRKTUBE?!' },
    { speaker: 'assistant', text: 'THAT\'S EINSTEIN. DON\'T MAKE EYE CONTACT. HE THINKS THE PAUSE BUTTON IS A GOVERNMENT PSYOP.' },
    { speaker: 'paranoid', glitch: true, text: 'IT IS! AND SOMEONE USED KIRKTUBE BEFORE YOU. THE CACHE IS STILL… WARM.' },
    { speaker: 'narrator', text: 'TOGETHER, WE SHALL GUIDE YOU THROUGH AN EPIC QUEST SPANNING… ONE (1) VIDEO. MAY THE CODEC BE WITH YOU!' },
  ];

  const TYPE_SPEED_MS = 22;

  const S = {
    active: false,
    index: -1,
    typing: false,
    typeTimer: null,
    fullText: '',
    onDone: null,
    els: {},
  };

  function run(onDone) {
    S.els = {
      screen: $('#intro-screen'),
      portrait: $('#intro-portrait'),
      box: $('#intro-box'),
      name: $('#intro-name'),
      title: $('#intro-title'),
      text: $('#intro-text'),
      chapter: $('#intro-chapter'),
      skip: $('#btn-skip-intro'),
    };
    S.onDone = onDone;
    S.active = true;
    S.index = -1;

    S.els.screen.classList.remove('is-hidden', 'fade-out');
    S.els.screen.classList.add('fade-in');

    S.els.box.addEventListener('click', advance);
    S.els.portrait.addEventListener('click', advance);
    S.els.skip.addEventListener('click', skip);
    document.addEventListener('keydown', onKey);

    next();
  }

  function onKey(e) {
    if (!S.active) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
    else if (e.key === 'Escape') { e.preventDefault(); skip(); }
  }

  function advance() {
    if (!S.active) return;
    if (S.typing) finishTyping(); else next();
  }

  function next() {
    S.index += 1;
    if (S.index >= SCRIPT.length) { finish(false); return; }
    showLine(SCRIPT[S.index]);
  }

  function showLine(line) {
    const c = BAD.characters.get(line.speaker);
    const { portrait, box, name, title, text, chapter } = S.els;

    if (line.chapter) {
      chapter.textContent = line.chapter.toUpperCase();
      chapter.style.animation = 'none';
      void chapter.offsetWidth; /* RESTART ANIMATION */
      chapter.style.animation = '';
    }

    /* PORTRAIT */
    const prevSpeaker = portrait.dataset.speaker;
    portrait.style.setProperty('--c', c.color);
    if (prevSpeaker !== c.id) {
      portrait.innerHTML = BAD.characters.avatar(c.id);
      portrait.dataset.speaker = c.id;
    }
    portrait.classList.remove('enter', 'glitchy');
    void portrait.offsetWidth;
    if (line.enter) portrait.classList.add('enter');
    if (line.glitch) portrait.classList.add('glitchy');

    /* BOX */
    box.style.setProperty('--c', c.color);
    name.textContent = c.name.toUpperCase();
    title.textContent = c.title.toUpperCase();
    text.classList.toggle('glitch-text', !!line.glitch);

    if (line.enter && BAD.chat) BAD.chat.reveal(c.id);
    BAD.bus.emit('intro:line', { ...line, index: S.index });

    typeText(line.text.toUpperCase());
  }

  function typeText(full) {
    const { text, portrait } = S.els;
    clearInterval(S.typeTimer);
    S.fullText = full.toUpperCase();
    S.typing = true;
    text.textContent = '';
    text.classList.add('typing');
    portrait.classList.add('talking');

    let i = 0;
    S.typeTimer = setInterval(() => {
      i += 1;
      text.textContent = S.fullText.slice(0, i);
      if (i >= S.fullText.length) finishTyping();
    }, TYPE_SPEED_MS);
  }

  function finishTyping() {
    clearInterval(S.typeTimer);
    S.typing = false;
    S.els.text.textContent = S.fullText;
    S.els.text.classList.remove('typing');
    S.els.portrait.classList.remove('talking');
  }

  function skip() {
    if (!S.active) return;
    finish(true);
  }

  function finish(skipped) {
    if (!S.active) return;
    S.active = false;
    clearInterval(S.typeTimer);
    S.typing = false;

    document.removeEventListener('keydown', onKey);
    S.els.box.removeEventListener('click', advance);
    S.els.portrait.removeEventListener('click', advance);
    S.els.skip.removeEventListener('click', skip);

    /* EVERYONE IS CONSIDERED "INTRODUCED" EVEN IF THE PROLOGUE WAS SKIPPED. */
    if (BAD.chat) BAD.characters.rosterOrder.forEach((id) => BAD.chat.reveal(id));

    BAD.bus.emit(skipped ? 'intro:skipped' : 'intro:done', { linesSeen: S.index + 1 });

    const screen = S.els.screen;
    screen.classList.remove('fade-in');
    screen.classList.add('fade-out');
    setTimeout(() => screen.classList.add('is-hidden'), 700);

    if (typeof S.onDone === 'function') S.onDone({ skipped });
  }

  BAD.intro = { run, skip, isActive: () => S.active, SCRIPT };
})();
