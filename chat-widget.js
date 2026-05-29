/**
 * English Tutor — Floating Chat Widget
 * Multi-level (A1-C1) with student registration and personalization.
 * Includes connection status monitoring and graceful degradation.
 * 
 * Add to any HTML page: <script src="chat-widget.js"></script>
 * Config: set window.TUTOR_API_URL before loading, or defaults to current origin.
 */
(function() {
  'use strict';

  function init() {
    // ─── API URL ───
    // The static site is on GitHub Pages (ingles.skynetdelbarbas.com)
    // The API is served via Cloudflare tunnel (tutor.skynetdelbarbas.com → localhost:18401)
    // Override with window.TUTOR_API_URL if needed
    const API_BASE = (window.TUTOR_API_URL || 'https://tutor.skynetdelbarbas.com/api').replace(/\/chat$/, '');
    const API_CHAT = API_BASE + '/chat';
    const API_START = API_BASE + '/start';
    const API_HEALTH = API_BASE + '/health';

    // ─── localStorage keys ───
    const LS_ID = 'tutor_student_id';
    const LS_NAME = 'tutor_student_name';
    const LS_LEVEL = 'tutor_student_level';

    // ─── Status monitoring ───
    var tutorOnline = true;
    var statusCheckInterval = null;
    var statusCheckInProgress = false;

    // ─── Inject CSS ───
    var css = document.createElement('style');
    css.textContent = `
.chat-btn{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:#4dabf7;color:#fff;border:none;font-size:26px;cursor:pointer;box-shadow:0 4px 16px rgba(77,171,247,0.4);z-index:9999;transition:all .2s;display:flex;align-items:center;justify-content:center}
.chat-btn:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(77,171,247,0.5)}
.chat-btn .badge{position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#ff6b6b;display:none}
.chat-overlay{position:fixed;bottom:90px;right:24px;width:360px;max-height:540px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.18);z-index:9998;display:none;flex-direction:column;overflow:hidden;border:1px solid #e9ecef;font-family:'Segoe UI',system-ui,sans-serif}
.chat-overlay.open{display:flex}
.chat-header{background:#4dabf7;color:#fff;padding:14px 16px;font-weight:600;font-size:0.95rem;display:flex;justify-content:space-between;align-items:center}
.chat-header .close-btn{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;opacity:0.7;padding:0 4px;line-height:1}
.chat-header .close-btn:hover{opacity:1}
/* Status dot in header */
.chat-status{display:flex;align-items:center;gap:6px;font-size:0.7rem;font-weight:400;opacity:0.9;margin-left:8px}
.chat-status .dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0}
.chat-status .dot.online{background:#51cf66;box-shadow:0 0 6px rgba(81,207,102,0.6)}
.chat-status .dot.offline{background:#ff6b6b;box-shadow:0 0 6px rgba(255,107,107,0.6)}
.chat-status .dot.checking{background:#ffd43b;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}

/* Registration screen */
.chat-screen{padding:0;overflow:hidden;display:flex;flex-direction:column;flex:1}
.register-form{padding:24px 20px;text-align:center}
.register-form h3{margin:0 0 6px 0;color:#212529;font-size:1.1rem}
.register-form p{color:#6c757d;font-size:0.85rem;margin:0 0 18px 0}
.register-form label{display:block;text-align:left;font-size:0.8rem;font-weight:600;color:#495057;margin-bottom:4px}
.register-form input,.register-form select{width:100%;padding:10px 12px;border:1px solid #dee2e6;border-radius:10px;font-size:0.9rem;outline:none;font-family:inherit;box-sizing:border-box;margin-bottom:12px;transition:border-color .2s}
.register-form input:focus,.register-form select:focus{border-color:#4dabf7;box-shadow:0 0 0 3px rgba(77,171,247,0.12)}
.register-form .reg-btn{width:100%;padding:11px 0;border-radius:10px;border:none;background:#4dabf7;color:#fff;font-size:0.95rem;cursor:pointer;font-weight:600;transition:background .2s}
.register-form .reg-btn:hover{background:#339af0}
.register-form .reg-btn:disabled{opacity:0.5;cursor:not-allowed}
.reg-error{color:#e03131;font-size:0.8rem;margin-top:6px;display:none}
.reg-error.info{color:#1971c2;font-size:0.8rem;margin-top:6px;display:none}
.reg-welcome{font-size:0.85rem;color:#6c757d;margin-top:8px}
.reg-welcome strong{color:#212529}
.offline-msg{background:#fff5f5;border:1px solid #ffc9c9;border-radius:8px;padding:10px 12px;margin:0 20px 12px;font-size:0.78rem;color:#c92a2a;text-align:center;display:none}

/* Chat screen */
.chat-messages{flex:1;overflow-y:auto;padding:12px;background:#f8f9fa;min-height:200px;max-height:350px}
.chat-msg{margin-bottom:10px;max-width:88%;padding:10px 13px;border-radius:14px;font-size:0.87rem;line-height:1.45;word-wrap:break-word;animation:msgIn .2s ease}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.chat-msg.user{background:#4dabf7;color:#fff;margin-left:auto;border-bottom-right-radius:4px}
.chat-msg.bot{background:#e9ecef;color:#212529;margin-right:auto;border-bottom-left-radius:4px}
.chat-msg.bot.loading{color:#868e96;font-style:italic}
.chat-msg.bot.offline-notice{background:#fff5f5;color:#c92a2a;border:1px solid #ffc9c9;font-size:0.82rem}
.chat-msg.bot.reconnect-notice{background:#e6fcf5;color:#2b8a3e;border:1px solid #b2f2bb;font-size:0.82rem}
.chat-input-wrap{display:flex;padding:10px 12px;border-top:1px solid #e9ecef;background:#fff;gap:8px}
.chat-input-wrap input{flex:1;padding:10px 12px;border:1px solid #dee2e6;border-radius:10px;font-size:0.87rem;outline:none;font-family:inherit}
.chat-input-wrap input:focus{border-color:#4dabf7;box-shadow:0 0 0 3px rgba(77,171,247,0.12)}
.chat-input-wrap input:disabled{background:#f1f3f5;cursor:not-allowed}
.chat-input-wrap button{padding:8px 16px;border-radius:10px;border:none;background:#4dabf7;color:#fff;font-size:0.87rem;cursor:pointer;font-weight:600;white-space:nowrap}
.chat-input-wrap button:disabled{opacity:0.5;cursor:not-allowed}
.chat-input-wrap button:hover:not(:disabled){background:#339af0}

/* Level selector styling */
.level-help{font-size:0.75rem;color:#868e96;margin:-8px 0 12px 0;text-align:left}
.level-tag{display:inline-block;background:#e7f5ff;color:#1971c2;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;margin-left:6px;cursor:pointer}
`;
    document.head.appendChild(css);

    // ─── Build HTML ───
    var btn = document.createElement('button');
    btn.className = 'chat-btn';
    btn.innerHTML = '💬<span class="badge"></span>';
    btn.setAttribute('aria-label', 'Abrir tutor de inglés');

    var storedName = localStorage.getItem(LS_NAME) || '';
    var storedLevel = localStorage.getItem(LS_LEVEL) || 'A2';

    var overlay = document.createElement('div');
    overlay.className = 'chat-overlay';
    overlay.innerHTML = `
      <div class="chat-header">
        <span style="display:flex;align-items:center;gap:4px">
          🎓 English Tutor
          <span class="chat-status" id="chat-status">
            <span class="dot checking" id="status-dot"></span>
            <span id="status-label">Checking...</span>
          </span>
        </span>
        <button class="close-btn" aria-label="Cerrar">&times;</button>
      </div>
      <div class="chat-screen" id="screen-register" style="display:${storedName ? 'none' : 'flex'}">
        <div class="register-form">
          <h3>👋 Welcome!</h3>
          <p>Tell us about yourself to start practicing English.</p>
          <div class="offline-msg" id="reg-offline-msg">🔌 The tutor is offline right now. You can still study the exercises — the chat will work again when the connection is restored.</div>
          <label for="reg-name">Your name</label>
          <input type="text" id="reg-name" placeholder="e.g. Ana, Marcos, Laura..." value="${storedName}" autocomplete="off">
          <label for="reg-level">Your English level</label>
          <select id="reg-level">
            <option value="A1" ${storedLevel === 'A1' ? 'selected' : ''}>A1 — Beginner</option>
            <option value="A2" ${storedLevel === 'A2' ? 'selected' : ''}>A2 — Elementary</option>
            <option value="B1" ${storedLevel === 'B1' ? 'selected' : ''}>B1 — Intermediate</option>
            <option value="B2" ${storedLevel === 'B2' ? 'selected' : ''}>B2 — Upper Intermediate</option>
            <option value="C1" ${storedLevel === 'C1' ? 'selected' : ''}>C1 — Advanced</option>
          </select>
          <div class="level-help">💡 Not sure? Pick A2 if in Secondary school, B1 if in Bachillerato.</div>
          <button class="reg-btn" id="reg-start">🚀 Start Learning</button>
          <div class="reg-error" id="reg-error">Please enter your name!</div>
        </div>
      </div>
      <div class="chat-screen" id="screen-chat" style="display:${storedName ? 'flex' : 'none'}">
        <div class="chat-messages" id="chat-msgs"></div>
        <div class="chat-input-wrap">
          <input type="text" id="chat-input" placeholder="Write in English..." autocomplete="off">
          <button id="chat-send">Send ➤</button>
        </div>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(overlay);

    // ─── State ───
    var open = false;
    var sending = false;

    // ─── DOM refs ───
    var screenRegister = document.getElementById('screen-register');
    var screenChat = document.getElementById('screen-chat');
    var regName = document.getElementById('reg-name');
    var regLevel = document.getElementById('reg-level');
    var regBtn = document.getElementById('reg-start');
    var regError = document.getElementById('reg-error');
    var regOfflineMsg = document.getElementById('reg-offline-msg');
    var input = document.getElementById('chat-input');
    var sendBtn = document.getElementById('chat-send');
    var msgsEl = document.getElementById('chat-msgs');
    var statusDot = document.getElementById('status-dot');
    var statusLabel = document.getElementById('status-label');

    // ─── Connection status monitoring ───

    function updateStatusUI(online) {
      tutorOnline = online;
      statusDot.className = 'dot ' + (online ? 'online' : 'offline');
      statusLabel.textContent = online ? 'Connected' : 'Offline';

      // Update input availability
      if (screenChat.style.display !== 'none') {
        input.disabled = !online;
        sendBtn.disabled = !online || sending;
        input.placeholder = online ? 'Write in English...' : '🔌 Tutor offline — exercises still work!';
      }

      // Show/hide offline message on register screen
      if (regOfflineMsg) {
        regOfflineMsg.style.display = online ? 'none' : 'block';
      }
    }

    function checkStatus() {
      if (statusCheckInProgress) return;
      statusCheckInProgress = true;
      statusDot.className = 'dot checking';
      statusLabel.textContent = 'Checking...';

      fetch(API_HEALTH, { signal: AbortSignal.timeout(5000) })
        .then(function(r) {
          return r.ok;
        })
        .then(function(ok) {
          var wasOffline = !tutorOnline;
          updateStatusUI(ok);
          // If we just came back online while chat is open, notify the user
          if (ok && wasOffline && open && screenChat.style.display !== 'none') {
            var div = document.createElement('div');
            div.className = 'chat-msg bot reconnect-notice';
            div.textContent = '🔌 The tutor is back online! You can chat again.';
            msgsEl.appendChild(div);
            msgsEl.scrollTop = msgsEl.scrollHeight;
          }
        })
        .catch(function() {
          var wasOnline = tutorOnline;
          updateStatusUI(false);
          // If we just went offline while chat is open, notify the user
          if (wasOnline && open && screenChat.style.display !== 'none') {
            var div = document.createElement('div');
            div.className = 'chat-msg bot offline-notice';
            div.innerHTML = '🔌 <b>Tutor connection lost.</b> You can still practice exercises and study — the chat will resume automatically when the connection is restored.';
            msgsEl.appendChild(div);
            msgsEl.scrollTop = msgsEl.scrollHeight;
          }
        })
        .finally(function() {
          statusCheckInProgress = false;
        });
    }

    function startStatusMonitoring() {
      // Initial check
      checkStatus();
      // Periodic check every 30 seconds
      if (statusCheckInterval) clearInterval(statusCheckInterval);
      statusCheckInterval = setInterval(checkStatus, 30000);
    }

    function stopStatusMonitoring() {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        statusCheckInterval = null;
      }
    }

    // ─── Helper functions ───

    function switchToChat(studentName, studentLevel) {
      screenRegister.style.display = 'none';
      screenChat.style.display = 'flex';

      // Welcome/greeting message
      var greeting = '👋 Welcome back, <strong>' + escapeHtml(studentName) + '</strong>! Ready to practice <span class="level-tag">' + studentLevel + '</span>? Ask me anything about grammar, vocabulary, or conversation!';
      var div = document.createElement('div');
      div.className = 'chat-msg bot';
      div.innerHTML = greeting;
      msgsEl.appendChild(div);

      // If offline when switching to chat, show notice
      if (!tutorOnline) {
        var notice = document.createElement('div');
        notice.className = 'chat-msg bot offline-notice';
        notice.innerHTML = '🔌 <b>Tutor is offline.</b> You can still study and practice exercises. The chat will work again when the connection is restored.';
        msgsEl.appendChild(notice);
        input.disabled = true;
        sendBtn.disabled = true;
        input.placeholder = '🔌 Tutor offline — exercises still work!';
      }

      msgsEl.scrollTop = msgsEl.scrollHeight;

      setTimeout(function() {
        if (tutorOnline) input.focus();
      }, 300);
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    function addMessage(text, cls) {
      var div = document.createElement('div');
      div.className = 'chat-msg ' + cls;
      div.textContent = text;
      msgsEl.appendChild(div);
      msgsEl.scrollTop = msgsEl.scrollHeight;
      return div;
    }

    // ─── Registration ───

    function handleRegister() {
      var name = regName.value.trim();
      var level = regLevel.value;

      if (!name) {
        regError.style.display = 'block';
        regName.focus();
        return;
      }
      regError.style.display = 'none';

      if (!tutorOnline) {
        regError.textContent = '🔌 The tutor is offline. Please try again later.';
        regError.style.display = 'block';
        return;
      }

      regBtn.disabled = true;
      regBtn.textContent = '⏳ Registering...';

      fetch(API_START, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: name, level: level})
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.student_id) {
          localStorage.setItem(LS_ID, data.student_id);
          localStorage.setItem(LS_NAME, data.name);
          localStorage.setItem(LS_LEVEL, data.level);
          switchToChat(data.name, data.level);
        } else {
          regError.textContent = '❌ Server error. Try again!';
          regError.style.display = 'block';
        }
      })
      .catch(function() {
        if (!tutorOnline) {
          regError.textContent = '🔌 The tutor is offline. Please try again later.';
        } else {
          regError.textContent = '❌ Connection error. Check your internet.';
        }
        regError.style.display = 'block';
      })
      .finally(function() {
        regBtn.disabled = false;
        regBtn.textContent = '🚀 Start Learning';
      });
    }

    regBtn.addEventListener('click', handleRegister);
    regName.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleRegister();
    });
    regLevel.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleRegister();
    });

    // ─── Chat ───

    async function sendMessage() {
      var text = input.value.trim();
      if (!text || sending) return;

      if (!tutorOnline) {
        addMessage('🔌 The tutor is offline. You can still practice exercises — the chat will work when the connection is restored.', 'bot offline-notice');
        return;
      }

      var studentId = localStorage.getItem(LS_ID);
      if (!studentId) {
        // Session expired or not registered — reload widget
        localStorage.removeItem(LS_ID);
        localStorage.removeItem(LS_NAME);
        localStorage.removeItem(LS_LEVEL);
        screenChat.style.display = 'none';
        screenRegister.style.display = 'flex';
        regName.value = '';
        regError.textContent = 'Session expired. Please register again.';
        regError.style.display = 'block';
        return;
      }

      input.value = '';
      sendBtn.disabled = true;
      sending = true;

      addMessage(text, 'user');
      var loadingEl = addMessage('🤔 Thinking...', 'bot loading');

      try {
        var resp = await fetch(API_CHAT, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({student_id: parseInt(studentId, 10), message: text})
        });
        var data = await resp.json();
        loadingEl.remove();
        if (data.reply) {
          addMessage(data.reply, 'bot');
        } else {
          addMessage('❌ Sorry, I couldn\'t process that. Try again!', 'bot');
        }
      } catch(e) {
        loadingEl.remove();
        if (!tutorOnline) {
          addMessage('🔌 The tutor is offline. You can still practice exercises — the chat will work when the connection is restored.', 'bot offline-notice');
        } else {
          addMessage('❌ Connection error. Check your internet and try again.', 'bot');
        }
      }
      sendBtn.disabled = !tutorOnline;
      sending = false;
      if (tutorOnline) input.focus();
    }

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendMessage();
    });
    sendBtn.addEventListener('click', sendMessage);

    // ─── Toggle ───
    btn.addEventListener('click', function() {
      open = !open;
      overlay.classList.toggle('open', open);
      if (open) {
        // Start or resume status monitoring when opening
        if (!statusCheckInterval) startStatusMonitoring();
        // Do a fresh check immediately
        checkStatus();

        var sid = localStorage.getItem(LS_ID);
        if (sid && screenChat.style.display !== 'none') {
          setTimeout(function() { if (tutorOnline) input.focus(); }, 300);
        } else if (sid) {
          var name = localStorage.getItem(LS_NAME);
          var level = localStorage.getItem(LS_LEVEL);
          switchToChat(name, level);
        } else {
          setTimeout(function() { regName.focus(); }, 300);
        }
      } else {
        // Pause monitoring when closed to save resources
        stopStatusMonitoring();
      }
    });

    overlay.querySelector('.close-btn').addEventListener('click', function() {
      open = false;
      overlay.classList.remove('open');
      stopStatusMonitoring();
    });

    // ─── If student already stored, show chat directly and start monitoring ───
    if (storedName) {
      setTimeout(function() {
        switchToChat(storedName, storedLevel);
      }, 100);
    }

    // Start monitoring if chat is visible on page load (user already registered)
    if (storedName) {
      startStatusMonitoring();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
