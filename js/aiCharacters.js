/* =========================================================
   KIRKTUBE — AICHARACTERS.JS
   CHARACTER DEFINITIONS: IDENTITY, VISUALS (PNG/WEBP AVATARS),
   DEFAULT MOODS, AND VOICE HINTS.
   MAIMAI (OVERDRAMATIC NARRATOR) -> MEIMEI.PNG
   VERITY (SARCASTIC ASSISTANT)   -> VERITY.PNG
   EINSTEIN (PARANOID AI)         -> EINSTEIN.PNG
   ALL COMMENTS AND STRINGS ARE UPPERCASE.
   ========================================================= */
(function () {
  'use strict';

  const BAD = window.BAD;

  /* ---------- AVATARS (IMAGE ASSETS + SYSTEM SVG) ---------- */
  const AVATARS = {
    narrator: (c, img, name) => `
      <img class="avatar avatar-img" src="${img}" alt="${name}" style="--c:${c}" />`,
    assistant: (c, img, name) => `
      <img class="avatar avatar-img" src="${img}" alt="${name}" style="--c:${c}" />`,
    paranoid: (c, img, name) => `
      <img class="avatar avatar-img" src="${img}" alt="${name}" style="--c:${c}" />`,
    system: (c) => `
      <svg class="avatar" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="8" y="12" width="48" height="40" rx="6" fill="#111" stroke="${c}" stroke-width="2.5"/>
        <path d="M17 26 l7 6 -7 6 M28 40 h14" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>`,
  };

  /* ---------- CHARACTER DATA ---------- */
  const CHARACTERS = {
    narrator: {
      id: 'narrator',
      name: 'DUCKFLOW',
      title: 'THE OVERDRAMATIC NARRATOR',
      shortRole: 'NARRATOR',
      image: 'duckflow.png',
      color: '#b026ff',
      defaultMood: 'THEATRICAL',
      bio: 'BELIEVES EVERY BUTTON PRESS IS A TURNING POINT IN HISTORY.',
      /* DEEP, BOOMING, DRAMATIC THEATRICAL CADENCE */
      voice: {
        rate: 0.84,
        pitch: 0.55,
        preferred: ['Microsoft George', 'Google UK English Male', 'Microsoft David', 'Daniel', 'Microsoft Mark', 'Alex'],
      },
    },
    assistant: {
      id: 'assistant',
      name: 'VERITY',
      title: 'THE SARCASTIC ASSISTANT',
      shortRole: 'ASSISTANT',
      image: 'verity.png',
      color: '#39ff14',
      defaultMood: 'UNIMPRESSED',
      bio: 'THE ONLY COMPETENT ENTITY IN KIRKTUBE. JUST ASK.',
      /* CRISP, SNAPPY, SARCASTIC FEMALE VOICE */
      voice: {
        rate: 1.06,
        pitch: 1.12,
        preferred: ['Microsoft Zira', 'Google US English', 'Microsoft Aria', 'Samantha', 'Victoria', 'Karen'],
      },
    },
    paranoid: {
      id: 'paranoid',
      name: 'EINSTEIN',
      title: 'THE PARANOID AI',
      shortRole: 'PARANOID AI',
      image: 'Einstein.png',
      color: '#ff2e4d',
      defaultMood: 'SUSPICIOUS',
      bio: 'KNOWS YOU ARE UP TO SOMETHING. CANNOT PROVE IT. YET.',
      /* FAST, FRANTIC, HIGH-PITCHED CONSPIRACY VOICE */
      voice: {
        rate: 1.28,
        pitch: 1.55,
        preferred: ['Microsoft Hazel', 'Google UK English Female', 'Microsoft Susan', 'Microsoft Catherine', 'Tessa', 'Moira'],
      },
    },
    system: {
      id: 'system',
      name: 'KIRKTUBE OS',
      title: 'KIRKTUBE RUNTIME',
      shortRole: 'SYSTEM',
      image: null,
      color: '#71717a',
      defaultMood: 'BUGGY',
      bio: 'DEFINITELY NOT HIDING ANYTHING.',
      voice: { rate: 1, pitch: 1, preferred: [] },
    },
  };

  /* RUNTIME MOOD (SEPARATE FROM DEFINITION SO IT CAN BE RESET). */
  Object.values(CHARACTERS).forEach((c) => { c.mood = c.defaultMood; });

  /* ORDER IN WHICH COMPANIONS APPEAR IN THE ROSTER. */
  const ROSTER_ORDER = ['narrator', 'assistant', 'paranoid'];

  BAD.characters = {
    all: CHARACTERS,
    rosterOrder: ROSTER_ORDER,
    get(id) { return CHARACTERS[id] || CHARACTERS.system; },
    avatar(id) {
      const c = CHARACTERS[id] || CHARACTERS.system;
      const fn = AVATARS[c.id] || AVATARS.system;
      return fn(c.color, c.image, c.name);
    },
    resetMoods() { Object.values(CHARACTERS).forEach((c) => { c.mood = c.defaultMood; }); },
  };
})();
