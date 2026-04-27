(function () {
  const CONFIG = {
    apiUrl: document.currentScript?.src
      ? new URL(document.currentScript.src).origin + '/api/chat'
      : '/api/chat',
    clinicInfo: window.ChatbotClinica || {},
  };

  const QUICK_REPLIES = [
    'Agendar una cita',
    'Ver especialidades',
    'Horarios y costos',
    'Hablar con alguien',
  ];

  const css = `
    #cb-bubble{position:fixed;bottom:24px;right:24px;width:52px;height:52px;border-radius:50%;background:#185FA5;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(24,95,165,.4);z-index:99999;transition:transform .2s}
    #cb-bubble:hover{transform:scale(1.08)}
    #cb-bubble svg{width:24px;height:24px;fill:white}
    #cb-box{position:fixed;bottom:88px;right:24px;width:340px;height:480px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.15);z-index:99998;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    #cb-box.open{display:flex}
    #cb-head{background:#185FA5;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}
    #cb-head .av{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center}
    #cb-head .av svg{width:18px;height:18px;fill:white}
    #cb-head .info .nm{color:#fff;font-size:14px;font-weight:600;margin:0}
    #cb-head .info .st{color:rgba(255,255,255,.8);font-size:11px;margin:2px 0 0}
    #cb-head .close{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.7);font-size:20px;cursor:pointer;padding:0;line-height:1}
    #cb-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#f4f7fb}
    .cb-msg{max-width:82%;display:flex;flex-direction:column;gap:2px}
    .cb-msg.b{align-self:flex-start}.cb-msg.u{align-self:flex-end}
    .cb-bbl{padding:9px 13px;border-radius:14px;font-size:13px;line-height:1.5}
    .cb-msg.b .cb-bbl{background:#fff;border:1px solid #e8edf5;color:#1a1a1a;border-bottom-left-radius:3px}
    .cb-msg.u .cb-bbl{background:#185FA5;color:#fff;border-bottom-right-radius:3px}
    .cb-tm{font-size:10px;color:#aab;padding:0 3px}
    .cb-msg.b .cb-tm{align-self:flex-start}.cb-msg.u .cb-tm{align-self:flex-end}
    #cb-qr{padding:8px 12px 4px;display:flex;flex-wrap:wrap;gap:5px;background:#fff;border-top:1px solid #eef}
    .cb-qb{background:none;border:1px solid #185FA5;color:#185FA5;border-radius:14px;padding:4px 10px;font-size:11.5px;cursor:pointer;font-family:inherit}
    .cb-qb:hover{background:#eaf2ff}
    #cb-input{display:flex;gap:6px;padding:10px 12px;background:#fff;border-top:1px solid #eef;flex-shrink:0}
    #cb-text{flex:1;border:1px solid #dde3f0;border-radius:14px;padding:8px 12px;font-size:13px;outline:none;font-family:inherit;resize:none;height:36px}
    #cb-text:focus{border-color:#185FA5}
    #cb-send{background:#185FA5;color:#fff;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    #cb-send:hover{background:#0C447C}
    #cb-send svg{width:16px;height:16px;fill:white}
    .cb-dot{width:5px;height:5px;border-radius:50%;background:#bbb;animation:cbbc 1.2s infinite;display:inline-block;margin:0 1.5px}
    .cb-dot:nth-child(2){animation-delay:.2s}.cb-dot:nth-child(3){animation-delay:.4s}
    @keyframes cbbc{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
    #cb-badge{position:absolute;top:-4px;right:-4px;background:#E24B4A;color:#fff;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;display:none}
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const bubbleHTML = `
    <div id="cb-bubble">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6V10h12v2zm0-3H6V7h12v2z"/></svg>
      <div id="cb-badge">1</div>
    </div>
    <div id="cb-box">
      <div id="cb-head">
        <div class="av"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
        <div class="info">
          <p class="nm">${CONFIG.clinicInfo.nombre || 'Asistente Clínica'}</p>
          <p class="st">En línea · responde al instante</p>
        </div>
        <button class="close" id="cb-close">&times;</button>
      </div>
      <div id="cb-msgs"></div>
      <div id="cb-qr"></div>
      <div id="cb-input">
        <input id="cb-text" type="text" placeholder="Escribe tu mensaje..."/>
        <button id="cb-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = bubbleHTML;
  document.body.appendChild(container);

  const box = document.getElementById('cb-box');
  const msgs = document.getElementById('cb-msgs');
  const input = document.getElementById('cb-text');
  const badge = document.getElementById('cb-badge');

  let history = [];
  let busy = false;
  let opened = false;

  function time() {
    return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  function addMsg(text, who) {
    const d = document.createElement('div');
    d.className = 'cb-msg ' + who;
    d.innerHTML = `<div class="cb-bbl">${text}</div><span class="cb-tm">${time()}</span>`;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const d = document.createElement('div');
    d.className = 'cb-msg b';
    d.id = 'cb-typing';
    d.innerHTML = '<div class="cb-bbl"><span class="cb-dot"></span><span class="cb-dot"></span><span class="cb-dot"></span></div>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const e = document.getElementById('cb-typing');
    if (e) e.remove();
  }

  async function sendMessage(text) {
    if (busy || !text.trim()) return;
    busy = true;
    addMsg(text, 'u');
    history.push({ role: 'user', content: text });
    document.getElementById('cb-qr').innerHTML = '';
    showTyping();

    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, clinicInfo: CONFIG.clinicInfo })
      });
      const data = await res.json();
      hideTyping();
      const reply = data.reply || 'Lo siento, hubo un error. Intenta de nuevo.';
      addMsg(reply, 'b');
      history.push({ role: 'assistant', content: reply });
    } catch {
      hideTyping();
      addMsg('Error de conexión. Por favor intenta de nuevo.', 'b');
    }
    busy = false;
  }

  function setQR(replies) {
    const qr = document.getElementById('cb-qr');
    qr.innerHTML = '';
    replies.forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'cb-qb';
      btn.textContent = r;
      btn.onclick = () => sendMessage(r);
      qr.appendChild(btn);
    });
  }

  function openChat() {
    box.classList.add('open');
    badge.style.display = 'none';
    opened = true;
    if (msgs.children.length === 0) {
      const nombre = CONFIG.clinicInfo.nombre || 'nuestra clínica';
      addMsg(`Hola, bienvenido a ${nombre}. Soy tu asistente virtual. ¿En qué te puedo ayudar hoy?`, 'b');
      setQR(QUICK_REPLIES);
    }
  }

  document.getElementById('cb-bubble').onclick = () => {
    if (box.classList.contains('open')) {
      box.classList.remove('open');
    } else {
      openChat();
    }
  };

  document.getElementById('cb-close').onclick = (e) => {
    e.stopPropagation();
    box.classList.remove('open');
  };

  document.getElementById('cb-send').onclick = () => {
    const v = input.value.trim();
    if (v) { sendMessage(v); input.value = ''; }
  };

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const v = input.value.trim();
      if (v) { sendMessage(v); input.value = ''; }
    }
  });

  setTimeout(() => {
    if (!opened) {
      badge.style.display = 'flex';
      badge.textContent = '1';
    }
  }, 3000);
})();
