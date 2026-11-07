/* =========================================================
   KIRKTUBE — CHATPANEL.JS
   RENDERS THE AI SIDEBAR: CHARACTER ROSTER (WITH MOOD AND
   ONLINE STATUS) AND THE MESSAGE LOG WITH TIMESTAMPS.
   ALL COMMENTS AND USER-FACING STRINGS ARE UPPERCASE.
   ========================================================= */
(function () {
  'use strict';

  const BAD = window.BAD;
  const { $, escapeHTML, wallTime, formatTime } = BAD.util;

  const state = {
    revealed: new Set(),
    messageCount: 0,
    speaking: null,
  };

  let rosterEl, logEl, statsEl;

  function init() {
    rosterEl = $('#ai-roster');
    logEl = $('#chat-log');
    statsEl = $('#chat-stats');
    renderRoster();
    renderEmpty();
  }

  function renderEmpty() {
    if (!logEl || state.messageCount) return;
    logEl.innerHTML = '<p class="chat-empty">WAITING FOR KIRKTUBE COMPANIONS TO CONNECT…</p>';
  }

  function renderRoster() {
    if (!rosterEl) return;
    rosterEl.innerHTML = '';
    BAD.characters.rosterOrder.forEach((id) => {
      const c = BAD.characters.get(id);
      const revealed = state.revealed.has(id);
      const card = document.createElement('div');
      card.className = `roster-card ${revealed ? 'online' : 'locked'}${state.speaking === id ? ' speaking' : ''}`;
      card.dataset.char = id;
      card.style.setProperty('--c', c.color);
      card.title = revealed ? `${c.name} — ${c.bio}` : 'NOT YET SUMMONED';
      card.innerHTML = `
        <span class="status-dot"></span>
        ${BAD.characters.avatar(id)}
        <div class="roster-name">${revealed ? escapeHTML(c.name) : '???'}</div>
        <div class="roster-role">${revealed ? escapeHTML(c.title) : 'NOT YET SUMMONED'}</div>
        <span class="mood-chip" title="CURRENT MOOD">${revealed ? '◆ ' + escapeHTML(c.mood) : 'OFFLINE'}</span>`;
      rosterEl.appendChild(card);
    });
  }

  /* BRING A COMPANION ONLINE IN THE ROSTER. */
  function reveal(id) {
    if (state.revealed.has(id)) return;
    state.revealed.add(id);
    renderRoster();
    const card = rosterEl && rosterEl.querySelector(`[data-char="${id}"]`);
    if (card) card.classList.add('just-revealed');
    BAD.bus.emit('chat:revealed', id);
  }

  function isRevealed(id) { return state.revealed.has(id); }

  function setMood(id, mood) {
    const c = BAD.characters.all[id];
    if (!c) return;
    c.mood = String(mood).toUpperCase();
    renderRoster();
  }

  function setSpeaking(id) {
    state.speaking = id || null;
    if (!rosterEl) return;
    rosterEl.querySelectorAll('.roster-card').forEach((card) => {
      card.classList.toggle('speaking', card.dataset.char === state.speaking);
    });
  }

  /* POST A MESSAGE TO THE SIDEBAR (ALWAYS UPPERCASE). */
  function post(charId, text, opts = {}) {
    if (!logEl) return null;
    if (!state.messageCount) logEl.innerHTML = '';

    const c = BAD.characters.get(charId);
    if (c.id !== 'system' && !state.revealed.has(c.id)) reveal(c.id);

    const upperText = String(text).toUpperCase();
    const videoTime = BAD.player && BAD.player.isReady() ? formatTime(BAD.player.getTime()) : null;
    const meta = `${wallTime()}${videoTime ? ' · ▶ ' + videoTime : ''}`;

    const msg = document.createElement('div');
    msg.className = `msg char-${c.id}${c.id === 'system' ? ' system' : ''}${opts.kind ? ' kind-' + opts.kind : ''}`;
    msg.style.setProperty('--c', c.color);

    if (c.id === 'system') {
      msg.innerHTML = `<div class="msg-bubble">${escapeHTML(upperText)} <span class="msg-meta">· ${meta}</span></div>`;
    } else {
      msg.innerHTML = `
        ${BAD.characters.avatar(c.id)}
        <div>
          <div class="msg-head">
            <span class="msg-name">${escapeHTML(c.name)}</span>
            <span class="msg-meta">${meta}</span>
          </div>
          <div class="msg-bubble">${escapeHTML(upperText)}</div>
        </div>`;
    }

    logEl.appendChild(msg);
    logEl.scrollTop = logEl.scrollHeight;

    state.messageCount += 1;
    if (statsEl) statsEl.textContent = `${state.messageCount} MESSAGE${state.messageCount === 1 ? '' : 'S'}`;

    BAD.bus.emit('chat:message', { charId: c.id, text: upperText, opts });
    return msg;
  }

  BAD.chat = { init, post, reveal, setMood, isRevealed, setSpeaking, renderRoster };
})();
