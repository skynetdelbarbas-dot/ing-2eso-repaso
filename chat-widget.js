/**
 * English Tutor — Floating Chat Widget
 * Add this to any HTML page to get a floating chat button.
 * Include with: <script src="chat-widget.js"></script>
 * 
 * Config: set window.TUTOR_API_URL before loading, or defaults to current origin.
 */
(function() {
  'use strict';

  function init() {
    const API_URL = window.TUTOR_API_URL || 'https://tutor.skynetdelbarbas.com/api/chat';

    // ─── Inject CSS ───
    var css = document.createElement('style');
  css.textContent = `
.chat-btn{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:#4dabf7;color:#fff;border:none;font-size:26px;cursor:pointer;box-shadow:0 4px 16px rgba(77,171,247,0.4);z-index:9999;transition:all .2s;display:flex;align-items:center;justify-content:center}
.chat-btn:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(77,171,247,0.5)}
.chat-btn .badge{position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#ff6b6b;display:none}
.chat-overlay{position:fixed;bottom:90px;right:24px;width:360px;max-height:520px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.18);z-index:9998;display:none;flex-direction:column;overflow:hidden;border:1px solid #e9ecef;font-family:'Segoe UI',system-ui,sans-serif}
.chat-overlay.open{display:flex}
.chat-header{background:#4dabf7;color:#fff;padding:14px 16px;font-weight:600;font-size:0.95rem;display:flex;justify-content:space-between;align-items:center}
.chat-header .close-btn{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;opacity:0.7;padding:0 4px}
.chat-header .close-btn:hover{opacity:1}
.chat-messages{flex:1;overflow-y:auto;padding:12px;background:#f8f9fa;min-height:200px;max-height:340px}
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
`;
  document.head.appendChild(css);

  // ─── Build HTML ───
  var btn = document.createElement('button');
  btn.className = 'chat-btn';
  btn.innerHTML = '💬<span class="badge"></span>';
  btn.setAttribute('aria-label', 'Abrir tutor de inglés');

  var overlay = document.createElement('div');
  overlay.className = 'chat-overlay';
  overlay.innerHTML = `
    <div class="chat-header">
      🎓 English Tutor
      <button class="close-btn" aria-label="Cerrar">&times;</button>
    </div>
    <div class="chat-messages" id="chat-msgs">
      <div class="chat-msg bot">👋 Hi! I'm your English tutor. Ask me anything about grammar, vocabulary, or practice!</div>
    </div>
    <div class="chat-input-wrap">
      <input type="text" id="chat-input" placeholder="Write in English..." autocomplete="off">
      <button id="chat-send">Send ➤</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(overlay);

  // ─── State ───
  var open = false;

  // ─── Toggle ───
  btn.addEventListener('click', function() {
    open = !open;
    overlay.classList.toggle('open', open);
    if (open) {
      setTimeout(function() {
        document.getElementById('chat-input').focus();
      }, 300);
    }
  });

  overlay.querySelector('.close-btn').addEventListener('click', function() {
    open = false;
    overlay.classList.remove('open');
  });

  // ─── Send message ───
  var input = document.getElementById('chat-input');
  var sendBtn = document.getElementById('chat-send');
  var msgsEl = document.getElementById('chat-msgs');

  function addMessage(text, cls) {
    var div = document.createElement('div');
    div.className = 'chat-msg ' + cls;
    div.textContent = text;
    msgsEl.appendChild(div);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return div;
  }

  async function sendMessage() {
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;

    addMessage(text, 'user');
    var loadingEl = addMessage('🤔 Thinking...', 'bot loading');

    try {
      var resp = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: text})
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
    input.focus();
  }

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
  });
  sendBtn.addEventListener('click', sendMessage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
