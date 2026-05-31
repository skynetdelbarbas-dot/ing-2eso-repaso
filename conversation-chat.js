/**
 * Inline Conversation Chat — lightweight chat component for speaking practice pages.
 * Embed: <div id="inline-chat" data-scenario="..." data-level="A2"></div>
 * Then include this script and call initInlineChat().
 */
(function() {
  'use strict';

  var API_BASE = (window.TUTOR_API_URL || 'https://tutor.skynetdelbarbas.com/api').replace(/\/chat$/, '');
  var API_CHAT = API_BASE + '/chat';
  var API_START = API_BASE + '/start';

  var LS_ID = 'tutor_student_id';
  var LS_NAME = 'tutor_student_name';
  var LS_LEVEL = 'tutor_student_level';

  // ─── CSS ───
  var css = document.createElement('style');
  css.textContent = `
.inline-chat-wrap{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden;margin:12px 0}
.inline-chat-header{background:var(--primary);color:#fff;padding:12px 16px;font-weight:600;font-size:.9rem;display:flex;justify-content:space-between;align-items:center}
.inline-chat-status{display:flex;align-items:center;gap:6px;font-size:.75rem;font-weight:400}
.inline-chat-status .dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.inline-chat-status .dot.online{background:#51cf66;box-shadow:0 0 6px rgba(81,207,102,.6)}
.inline-chat-status .dot.offline{background:#ff6b6b}
.inline-chat-msgs{height:280px;overflow-y:auto;padding:12px;background:#f8f9fa}
.inline-chat-msgs .msg{margin-bottom:10px;max-width:88%;padding:10px 13px;border-radius:14px;font-size:.87rem;line-height:1.45;word-wrap:break-word;animation:msgIn .2s ease}
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.inline-chat-msgs .msg.user{background:var(--primary);color:#fff;margin-left:auto;border-bottom-right-radius:4px}
.inline-chat-msgs .msg.bot{background:#e9ecef;color:#212529;margin-right:auto;border-bottom-left-radius:4px}
.inline-chat-msgs .msg.bot.loading{color:#868e96;font-style:italic}
.inline-chat-msgs .msg.bot.sys{background:#fff9db;color:#212529;border:1px solid #ffd43b;font-size:.82rem}
.inline-chat-msgs .msg .speak-btn{display:inline-flex;align-items:center;gap:4px;margin-top:6px;padding:5px 12px;border-radius:6px;border:2px solid var(--primary);background:#e7f5ff;color:var(--primary-dark);font-size:.8rem;font-weight:600;cursor:pointer;transition:all .1s}
.inline-chat-msgs .msg .speak-btn:hover{background:var(--primary);color:#fff;border-color:var(--primary)}
.inline-chat-input{display:flex;padding:10px 12px;border-top:1px solid var(--border)}
.inline-chat-input input{flex:1;padding:10px 12px;border:2px solid var(--border);border-radius:8px;font-size:.87rem;outline:none;font-family:inherit}
.inline-chat-input input:focus{border-color:var(--primary)}
.inline-chat-input button{padding:10px 18px;border-radius:8px;border:none;background:var(--primary);color:#fff;font-size:.87rem;font-weight:600;cursor:pointer;margin-left:6px;transition:all .1s}
.inline-chat-input button:hover{background:var(--primary-dark)}
.inline-chat-input button:disabled{opacity:.5;cursor:default}
.inline-chat-register{text-align:center;padding:40px 20px}
.inline-chat-register h3{margin:0 0 6px;font-size:1.1rem}
.inline-chat-register p{color:var(--text2);font-size:.85rem;margin:0 0 18px}
.inline-chat-register input,.inline-chat-register select{padding:10px 12px;border:2px solid var(--border);border-radius:8px;font-size:.9rem;outline:none;font-family:inherit;margin-bottom:10px;width:100%;max-width:280px}
.inline-chat-register input:focus,.inline-chat-register select:focus{border-color:var(--primary)}
.inline-chat-register .reg-btn{padding:10px 30px;border-radius:8px;border:none;background:var(--primary);color:#fff;font-size:.95rem;font-weight:600;cursor:pointer}
.inline-chat-register .reg-btn:hover{background:var(--primary-dark)}
`;
  document.head.appendChild(css);

  function initInlineChat(containerId) {
    var container = document.getElementById(containerId || 'inline-chat');
    if (!container) return;

    var scenario = container.getAttribute('data-scenario') || '';
    var level = container.getAttribute('data-level') || 'A2';
    var studentName = localStorage.getItem(LS_NAME) || '';
    var studentLevel = localStorage.getItem(LS_LEVEL) || level;
    var studentId = localStorage.getItem(LS_ID) || '';
    var online = true;

    // Determine if registered
    var isRegistered = !!(studentId && studentName);

    // ─── Build HTML ───
    var html = '<div class="inline-chat-wrap">';
    html += '<div class="inline-chat-header">';
    html += '<span>' + (scenario ? '🎭 ' + scenario : '🗣 Conversation') + '</span>';
    html += '<span class="inline-chat-status"><span class="dot ' + (online ? 'online' : 'offline') + '" id="ichat-dot"></span><span id="ichat-status-label">Connected</span></span>';
    html += '</div>';

    if (isRegistered) {
      html += buildRegisterDone(scenario, studentName, studentLevel);
    } else {
      html += buildRegisterForm(scenario);
    }
    html += '</div>';
    container.innerHTML = html;

    // If already registered, show chat
    if (isRegistered) {
      showChat(container, scenario, studentName, studentLevel);
    }
  }

  function buildRegisterForm(scenario) {
    var storedLevel = localStorage.getItem(LS_LEVEL) || 'A2';
    return '<div class="inline-chat-register" id="ichat-register">' +
      '<h3>👋 Welcome!</h3>' +
      '<p>Enter your name to start practicing' + (scenario ? ' this scenario' : ' conversation') + '.</p>' +
      '<input type="text" id="ichat-name" placeholder="Your name (e.g. Ana, Marcos...)" value="' + (localStorage.getItem(LS_NAME) || '') + '" autocomplete="off"><br>' +
      '<select id="ichat-level">' +
        '<option value="A1"' + (storedLevel === 'A1' ? ' selected' : '') + '>A1 — Beginner</option>' +
        '<option value="A2"' + (storedLevel === 'A2' ? ' selected' : '') + '>A2 — Elementary</option>' +
        '<option value="B1"' + (storedLevel === 'B1' ? ' selected' : '') + '>B1 — Intermediate</option>' +
        '<option value="B2"' + (storedLevel === 'B2' ? ' selected' : '') + '>B2 — Upper Intermediate</option>' +
        '<option value="C1"' + (storedLevel === 'C1' ? ' selected' : '') + '>C1 — Advanced</option>' +
      '</select><br>' +
      '<button class="reg-btn" onclick="handleInlineReg(\'' + scenario.replace(/'/g,"\\'") + '\')">🚀 Start</button>' +
      '<div id="ichat-reg-error" style="color:#e03131;font-size:.82rem;margin-top:6px;display:none"></div>' +
    '</div>';
  }

  function buildRegisterDone(scenario, name, level) {
    return '<div class="inline-chat-msgs" id="ichat-msgs" style="display:flex;flex-direction:column"></div>' +
      '<div class="inline-chat-input" id="ichat-input-area" style="display:flex">' +
      '<input type="text" id="ichat-input" placeholder="Write in English..." autocomplete="off">' +
      '<button id="ichat-send" onclick="sendInlineMsg()">Send ➤</button>' +
    '</div>';
  }

  function showChat(container, scenario, name, level) {
    var register = container.querySelector('#ichat-register');
    if (register) register.style.display = 'none';

    var msgs = container.querySelector('#ichat-msgs');
    var inputArea = container.querySelector('#ichat-input-area');
    if (!msgs) {
      // Build chat UI
      var wrap = container.querySelector('.inline-chat-wrap');
      var reg = container.querySelector('#ichat-register');
      if (reg) reg.insertAdjacentHTML('afterend', '<div class="inline-chat-msgs" id="ichat-msgs"></div><div class="inline-chat-input" id="ichat-input-area"><input type="text" id="ichat-input" placeholder="Write in English..." autocomplete="off"><button id="ichat-send" onclick="sendInlineMsg()">Send ➤</button></div>');
      reg.style.display = 'none';
    }

    // Show scenario intro message
    var msgsEl = document.getElementById('ichat-msgs');
    if (msgsEl && msgsEl.children.length === 0) {
      if (scenario) {
        addInlineMsg('bot sys', '🎭 <b>Scenario:</b> ' + scenario + '<br>👋 Start the conversation! Say hello or ask a question.');
      } else {
        addInlineMsg('bot', '👋 Hi <b>' + name + '</b>! Ready to practice? Ask me anything or tell me about your day!');
      }
    }

    var input = document.getElementById('ichat-input');
    if (input) {
      input.disabled = false;
      input.focus();
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') sendInlineMsg();
      });
    }
  }

  // ─── Register handler (must be global) ───
  window.handleInlineReg = function(scenario) {
    var name = document.getElementById('ichat-name').value.trim();
    var level = document.getElementById('ichat-level').value;
    var errEl = document.getElementById('ichat-reg-error');

    if (!name) {
      errEl.textContent = 'Please enter your name!';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    var btn = document.querySelector('.inline-chat-register .reg-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Registering...';

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
        showChat(null, scenario, data.name, data.level);
      } else {
        errEl.textContent = '❌ Server error. Try again!';
        errEl.style.display = 'block';
      }
    })
    .catch(function() {
      errEl.textContent = '❌ Connection error. Check your internet.';
      errEl.style.display = 'block';
    })
    .finally(function() {
      btn.disabled = false;
      btn.textContent = '🚀 Start';
    });
  };

  // ─── Send message (must be global) ───
  window.sendInlineMsg = function() {
    var input = document.getElementById('ichat-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;

    var studentId = localStorage.getItem(LS_ID);
    if (!studentId) {
      addInlineMsg('bot sys', '⚠️ Session expired. Please reload the page and register again.');
      return;
    }

    input.value = '';
    document.getElementById('ichat-send').disabled = true;

    addInlineMsg('user', text);
    var loadingEl = addInlineMsg('bot loading', '🤔 Thinking...');

    var container = document.getElementById('inline-chat');
    var scenario = container ? container.getAttribute('data-scenario') || '' : '';

    fetch(API_CHAT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        student_id: parseInt(studentId, 10),
        message: text,
        scenario: scenario
      })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      loadingEl.remove();
      if (data.reply) {
        addInlineMsg('bot', data.reply);
        // Auto-speak the reply
        speakInline(data.reply.replace(/<[^>]*>/g, ''));
      } else {
        addInlineMsg('bot', '❌ Sorry, I couldn\'t process that. Try again!');
      }
    })
    .catch(function() {
      loadingEl.remove();
      addInlineMsg('bot sys', '🔌 Connection error. Check your internet and try again.');
    })
    .finally(function() {
      document.getElementById('ichat-send').disabled = false;
      var inp = document.getElementById('ichat-input');
      if (inp) inp.focus();
    });
  };

  // ─── Add message to chat ───
  function addInlineMsg(cls, text) {
    var msgs = document.getElementById('ichat-msgs');
    if (!msgs) return null;
    var div = document.createElement('div');
    div.className = 'msg ' + cls;
    if (cls.indexOf('bot') >= 0 && cls.indexOf('loading') < 0 && cls.indexOf('sys') < 0) {
      div.innerHTML = text + '<br><button class="speak-btn" onclick="speakInline(\'' + escapeAttr(text.replace(/<[^>]*>/g,'')) + '\')">🔊 Listen</button>';
    } else {
      div.innerHTML = text;
    }
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  // ─── Speak helper ───
  window.speakInline = function(text) {
    if (window.currentInlineUtterance) {
      speechSynthesis.cancel();
    }
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.rate = 0.85;
    var voices = speechSynthesis.getVoices();
    var enVoice = voices.find(function(v) { return v.lang.startsWith('en'); });
    if (enVoice) u.voice = enVoice;
    window.currentInlineUtterance = u;
    speechSynthesis.speak(u);
  };

  // Preload voices
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = function() { speechSynthesis.getVoices(); };

  function escapeAttr(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  // ─── Public API ───
  window.initInlineChat = initInlineChat;

})();
