/**
 * English Tutor — Floating Chat Widget
 * Multi-level (A1-C1) with student registration and personalization.
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

    // ─── localStorage keys ───
    const LS_ID = 'tutor_student_id';
    const LS_NAME = 'tutor_student_name';
    const LS_LEVEL = 'tutor_student_level';

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
.reg-welcome{font-size:0.85rem;color:#6c757d;margin-top:8px}
.reg-welcome strong{color:#212529}

/* Chat screen */
.chat-messages{flex:1;overflow-y:auto;padding:12px;background:#f8f9fa;min-height:200px;max-height:350px}
.chat-msg{margin-bottom:10px;max-width:88%;padding:10px 13px;border-radius:14px;font-size:0.87rem;line-height:1.45;word-wrap:break-word;animation:msgIn .2s ease}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.chat-msg.user{background:#4dabf7;color:#fff;margin-left:auto;border-bottom-right-radius:4px}
.chat-msg.bot{background:#e9ecef;color:#212529;margin-right:auto;border-bottom-left-radius:4px}
.chat-msg.bot.loading{color:#868e96;font-style:italic}
.chat-input-wrap{display:flex;padding:10px 12px;border-top:1px solid #e9ecef;background:#fff;gap:8px}
.chat-input-wrap input{flex:1;padding:10px 12px;border:1px solid #dee2e6;border-radius:10px;font-size:0.87rem;outline:none;font-family:inherit}
.chat-input-wrap input:focus{border-color:#4dabf7;box-shadow:0 0 0 3px rgba(77,171,247,0.12)}
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
        🎓 English Tutor
        <button class="close-btn" aria-label="Cerrar">&times;</button>
      </div>
      <div class="chat-screen" id="screen-register" style="display:${storedName ? 'none' : 'flex'}">
        <div class="register-form">
          <h3>👋 Welcome!</h3>
          <p>Tell us about yourself to start practicing English.</p>
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
    var input = document.getElementById('chat-input');
    var sendBtn = document.getElementById('chat-send');
    var msgsEl = document.getElementById('chat-msgs');

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
      msgsEl.scrollTop = msgsEl.scrollHeight;

      setTimeout(function() {
        input.focus();
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
      if (cls === 'user' || cls.indexOf('loading') === -1) {
        div.textContent = text;
      } else {
        div.textContent = text;
      }
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
        regError.textContent = '❌ Connection error. Check your internet.';
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
        addMessage('❌ Connection error. Check your internet and try again.', 'bot');
      }
      sendBtn.disabled = false;
      sending = false;
      input.focus();
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
        var sid = localStorage.getItem(LS_ID);
        if (sid && screenChat.style.display !== 'none') {
          setTimeout(function() { input.focus(); }, 300);
        } else if (sid) {
          // Already registered but showing register screen? Switch.
          var name = localStorage.getItem(LS_NAME);
          var level = localStorage.getItem(LS_LEVEL);
          switchToChat(name, level);
        } else {
          setTimeout(function() { regName.focus(); }, 300);
        }
      }
    });

    overlay.querySelector('.close-btn').addEventListener('click', function() {
      open = false;
      overlay.classList.remove('open');
    });

    // ─── If student already stored, show chat directly ───
    if (storedName) {
      // Wait for DOM to be ready, then show greeting
      setTimeout(function() {
        switchToChat(storedName, storedLevel);
      }, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
