/* SABER V6 — Core Application with Groq */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  /* ============ Config ============ */
  const CFG = (typeof SABER_CONFIG !== 'undefined') ? SABER_CONFIG : {
    GROQ_API_KEY: '',
    GROQ_MODEL: 'mistral-saba-24b',
    PROXY_URL: '',
    VERSION: '6.0.0'
  };

  /* ============ State ============ */
  const S = {
    state: 'IDLE',
    chat: [],
    memory: [],
    files: [],
    micStream: null,
    audioCtx: null,
    analyser: null,
    rafId: null,
    recognition: null,
    isListening: false,
    isSpeaking: false,
    workTimer: null,
    settings: { ttsVoice: '', ttsRate: 0.9, ttsPitch: 0.85, model: CFG.GROQ_MODEL }
  };

  /* ============ Storage ============ */
  function load(key, def) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  }
  function save(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }

  /* ============ Toast ============ */
  function toast(msg) {
    const t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(window._toastT);
    window._toastT = setTimeout(() => t.classList.remove('show'), 2500);
  }

  /* ============ Router ============ */
  window.show = function (id) {
    if (!id) return;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
    const page = $(id);
    if (page) page.classList.add('on');
    document.querySelectorAll('.bnav button').forEach(b => {
      b.classList.toggle('on', b.dataset.page === id);
    });
    if (id === 'memory') renderMemory();
    if (id === 'settings') refreshVoices();
    if (id === 'status') renderStatus();
    if (id === 'chat') renderChat();
  };

  window.toggleMore = function (e) {
    if (e) e.stopPropagation();
    $('moreMenu')?.classList.toggle('on');
  };
  window.closeMore = function () { $('moreMenu')?.classList.remove('on'); };
  document.addEventListener('click', () => $('moreMenu')?.classList.remove('on'));

  /* ============ System Status ============ */
  function setSys(text, type = 'ok') {
    const el = $('sysText');
    const led = $('sysLed');
    if (el) el.textContent = text;
    if (led) led.className = 'led' + (type === 'warn' ? ' warn' : type === 'err' ? ' err' : '');
  }

  function setAvatar(st) {
    S.state = st;
    const av = $('avatar');
    if (av) av.className = 'avatar ' + st.toLowerCase();
    const labels = {
      IDLE: '● IDLE — آماده',
      LISTENING: '● LISTENING — گوش می‌دهم',
      THINKING: '● THINKING — در حال پردازش',
      SPEAKING: '● SPEAKING — در حال صحبت',
      ERROR: '● ERROR — خطا'
    };
    const el = $('vstate');
    if (el) {
      el.textContent = labels[st] || st;
      el.className = 'vstate' + (st === 'ERROR' ? ' err' : st === 'THINKING' ? ' warn' : '');
    }
    setSys(st === 'IDLE' ? 'READY' : st, st === 'ERROR' ? 'err' : st === 'THINKING' ? 'warn' : 'ok');
  }

  /* ============ Groq AI ============ */
  async function getAIResponse(userMessage) {
    if (!CFG.GROQ_API_KEY || CFG.GROQ_API_KEY.includes('PASTE')) {
      return '⚠️ کلید Groq تنظیم نشده. فایل config.js را باز کن و کلیدت را داخلش بذار.';
    }

    const messages = [
      {
        role: 'system',
        content: `تو "صابر" هستی، یک دستیار هوش مصنوعی تاکتیکی، نظامی و فارسی‌زبان.
همیشه فارسی جواب میدی. لحنت رسمی، دقیق، کوتاه و مفید است.
از عبارات نظامی مثل "بله قربان"، "اطاعت"، "در خدمتم" استفاده می‌کنی ولی نه زیاده از حد.
وقتی سوال فنی می‌پرسند، دقیق جواب میدی.
وقتی کد می‌خوان، کد تمیز و کارآمد با توضیح کوتاه می‌نویسی.
از خودت اضافه توضیح نمی‌دی. فقط کاری که خواسته شده.`
      },
      ...S.chat.slice(-10).filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.text })),
      { role: 'user', content: userMessage }
    ];

    // اگر Proxy تنظیم شده بود، از اون استفاده کن
    if (CFG.PROXY_URL && CFG.USE_PROXY) {
      try {
        const res = await fetch(CFG.PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, model: S.settings.model })
        });
        if (!res.ok) throw new Error('Proxy HTTP ' + res.status);
        const data = await res.json();
        return data.reply || 'پاسخی نیامد.';
      } catch (e) {
        return '⚠️ خطای Proxy: ' + e.message;
      }
    }

    // حالت مستقیم (بدون Proxy)
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + CFG.GROQ_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: S.settings.model || CFG.GROQ_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error?.message || 'HTTP ' + res.status;
        throw new Error(errMsg);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'پاسخی نیامد.';
    } catch (e) {
      console.error('[Groq]', e);
      return '⚠️ خطا: ' + e.message;
    }
  }

  /* ============ Chat ============ */
  function addMsg(role, text, extra) {
    const msg = Object.assign({
      role, text,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    }, extra || {});
    S.chat.push(msg);
    save('saber_v6_chat', S.chat);
    if ($('messages')) {
      renderOne(msg, S.chat.length - 1);
    }
    return msg;
  }

  function renderOne(m, idx) {
    const box = $('messages');
    if (!box) return;
    $('welcome')?.remove();

    const el = document.createElement('div');
    el.className = 'msg ' + m.role;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = m.text;
    el.appendChild(bubble);

    if (m.role === 'assistant') {
      const mini = document.createElement('div');
      mini.className = 'mini';
      mini.textContent = 'ص';
      el.appendChild(mini);
    }

    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
  }

  function renderChat() {
    const box = $('messages');
    if (!box) return;
    box.innerHTML = '';
    if (!S.chat.length) {
      box.innerHTML = `
        <div class="welcome" id="welcome" style="text-align:center;max-width:340px;margin:4vh auto">
          <div style="width:64px;height:64px;border:1px solid #4b8665;border-radius:20px;margin:auto;display:grid;place-items:center;font-size:28px;color:var(--g);background:radial-gradient(circle,#173b2c,#08110d)">ص</div>
          <h1 style="margin-top:10px;font-size:17px">گفت‌وگو با صابر</h1>
          <p class="muted">پیام بفرست یا از پیشنهادها استفاده کن.</p>
          <div class="chips">
            <button class="chip" onclick="ask('سلام صابر، خودت رو معرفی کن')">سلام صابر</button>
            <button class="chip" onclick="ask('یه کد پایتون بنویس')">کد بنویس</button>
            <button class="chip" onclick="ask('ساعت چنده؟')">ساعت چند؟</button>
          </div>
        </div>`;
      return;
    }
    S.chat.forEach((m, i) => renderOne(m, i));
  }

  function thinking() {
    const box = $('messages');
    if (!box) return null;
    const el = document.createElement('div');
    el.className = 'msg assistant';
    el.innerHTML = '<div class="bubble" style="color:#7a9086">صابر در حال پردازش...</div>';
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    return el;
  }

  window.sendChat = async function () {
    const input = $('input');
    if (!input) return;
    const t = input.value.trim();
    if (!t) return;
    input.value = '';
    addMsg('user', t);
    const ph = thinking();
    setSys('THINKING', 'warn');

    try {
      const reply = await getAIResponse(t);
      ph?.remove();
      addMsg('assistant', reply);
      setSys('READY', 'ok');
    } catch (e) {
      ph?.remove();
      addMsg('assistant', 'خطا: ' + e.message);
      setSys('ERROR', 'err');
    }
  };

  window.ask = function (t) {
    const inp = $('input');
    if (inp) inp.value = t;
    show('chat');
    setTimeout(() => sendChat(), 100);
  };

  window.keyChat = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  };

  /* ============ TTS ============ */
  function getVoices() {
    try { return window.speechSynthesis ? speechSynthesis.getVoices() : []; }
    catch { return []; }
  }

  function refreshVoices() {
    const sel = $('ttsVoice');
    if (!sel) return;
    const voices = getVoices();
    const prev = S.settings.ttsVoice || sel.value;
    sel.innerHTML = '<option value="">خودکار (فارسی ترجیح)</option>';
    voices.forEach(v => {
      const o = document.createElement('option');
      o.value = v.name;
      o.textContent = `${v.name} (${v.lang})`;
      sel.appendChild(o);
    });
    if (prev && [...sel.options].some(o => o.value === prev)) sel.value = prev;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) { toast('TTS پشتیبانی نمی‌شود'); return; }
    try { speechSynthesis.cancel(); } catch {}

    const prepared = window.PersianTTSPreprocessor
      ? window.PersianTTSPreprocessor.prepareForTTS(text, {})
      : text;
    if (!prepared) return;

    const u = new SpeechSynthesisUtterance(prepared);
    u.lang = 'fa-IR';
    u.rate = S.settings.ttsRate || 0.9;
    u.pitch = S.settings.ttsPitch || 0.85;

    const voices = getVoices();
    let voice = null;
    if (S.settings.ttsVoice) voice = voices.find(v => v.name === S.settings.ttsVoice);
    if (!voice) voice = voices.find(v => String(v.lang || '').toLowerCase().startsWith('fa'));
    if (voice) u.voice = voice;

    u.onstart = () => {
      S.isSpeaking = true;
      setAvatar('SPEAKING');
      animSpeak();
    };
    u.onend = () => {
      S.isSpeaking = false;
      stopAnim();
      setAvatar('IDLE');
    };
    u.onerror = () => {
      S.isSpeaking = false;
      stopAnim();
      setAvatar('IDLE');
    };
    speechSynthesis.speak(u);
  }

  window.stopSpeaking = function () {
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch {}
    S.isSpeaking = false;
    stopAnim();
    if (S.state === 'SPEAKING') setAvatar('IDLE');
  };

  window.speakCurrent = function () {
    const t = $('transcript');
    if (!t) return;
    const clean = t.textContent.replace(/[«»]/g, '').trim();
    if (clean) speak(clean);
  };

  window.testVoice = function () {
    speak('سلام، من صابرم. این یک تست صدای فارسی است.');
  };

  let animId = null;
  function animSpeak() {
    stopAnim();
    const mouth = $('mouth');
    const bars = $('viz')?.children || [];
    function tick() {
      if (!S.isSpeaking) return;
      const v = 0.3 + Math.random() * 0.7;
      if (mouth) mouth.style.height = (4 + v * 10) + 'px';
      for (let i = 0; i < bars.length; i++) {
        bars[i].style.height = Math.max(3, Math.random() * v * 26) + 'px';
        bars[i].style.opacity = String(0.4 + v * 0.5);
      }
      animId = requestAnimationFrame(tick);
    }
    tick();
  }

  function stopAnim() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    const mouth = $('mouth');
    if (mouth) mouth.style.height = '';
    const bars = $('viz')?.children || [];
    for (let i = 0; i < bars.length; i++) {
      bars[i].style.height = '4px';
      bars[i].style.opacity = '0.5';
    }
  }

  /* ============ Voice Recognition ============ */
  function initRec() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.lang = 'fa-IR';
    rec.interimResults = true;
    rec.continuous = false;

    rec.onstart = () => {
      S.isListening = true;
      $('micBtn')?.classList.add('active');
      setAvatar('LISTENING');
    };
    rec.onresult = (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      const t = $('transcript');
      if (final) {
        if (t) t.textContent = final;
        stopListen();
        handleVoice(final);
      } else if (interim && t) {
        t.textContent = interim;
      }
    };
    rec.onerror = (e) => {
      stopListen();
      if (e.error === 'no-speech') { setAvatar('IDLE'); toast('صدایی نشنیدم'); }
      else if (e.error === 'aborted') setAvatar('IDLE');
      else { setAvatar('ERROR'); toast('خطا: ' + e.error); setTimeout(() => setAvatar('IDLE'), 2000); }
    };
    rec.onend = () => {
      $('micBtn')?.classList.remove('active');
      if (S.isListening) { S.isListening = false; if (S.state === 'LISTENING') setAvatar('IDLE'); }
    };
    return rec;
  }

  window.toggleMic = async function () {
    if (S.isListening) { stopListen(); return; }
    if (S.isSpeaking) stopSpeaking();

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      }
    } catch (e) {
      toast('دسترسی میکروفون رد شد');
      setAvatar('ERROR');
      setTimeout(() => setAvatar('IDLE'), 2000);
      return;
    }

    S.recognition = initRec();
    if (!S.recognition) { toast('تشخیص گفتار پشتیبانی نمی‌شود'); return; }
    try {
      S.recognition.start();
    } catch (e) {
      toast('شروع تشخیص ناموفق');
    }
  };

  function stopListen() {
    S.isListening = false;
    $('micBtn')?.classList.remove('active');
    try { if (S.recognition) S.recognition.stop(); } catch {}
    if (S.state === 'LISTENING') setAvatar('IDLE');
  }

  async function handleVoice(text) {
    setAvatar('THINKING');
    const t = $('transcript');
    if (t) t.textContent = text;
    try {
      addMsg('user', text);
      const reply = await getAIResponse(text);
      if (t) t.textContent = '«' + reply + '»';
      addMsg('assistant', reply);
      speak(reply);
    } catch (e) {
      setAvatar('ERROR');
      setTimeout(() => setAvatar('IDLE'), 2000);
    }
  }

  /* ============ Work Agent ============ */
  window.runWork = function (name) {
    const card = $('agentCard');
    const title = $('agentTitle');
    const steps = $('agentSteps');
    const log = $('workLog');
    if (!card) return;

    if (S.workTimer) clearInterval(S.workTimer);
    card.style.display = 'block';
    if (title) title.textContent = 'اجرای: ' + (name || 'وظیفه');
    steps?.querySelectorAll('li').forEach(li => li.style.borderColor = 'var(--line)');
    if (log) log.textContent = '';

    const seq = ['received', 'analyzing', 'planning', 'executing', 'completed'];
    let i = 0;
    S.workTimer = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(S.workTimer);
        if (log) log.textContent += '\n> ✅ کار تکمیل شد.';
        return;
      }
      const key = seq[i];
      const li = steps?.querySelector(`li[data-step="${key}"]`);
      if (li) li.style.borderColor = 'var(--g)';
      if (log) log.textContent += (log.textContent ? '\n' : '') + '> ' + key;
      i++;
    }, 500);
  };

  /* ============ Memory ============ */
  window.addMemory = function () {
    const k = $('memKey')?.value.trim();
    const v = $('memVal')?.value.trim();
    if (!k || !v) { toast('هر دو فیلد لازم است'); return; }
    S.memory.push({ key: k, value: v, ts: Date.now() });
    save('saber_v6_memory', S.memory);
    if ($('memKey')) $('memKey').value = '';
    if ($('memVal')) $('memVal').value = '';
    renderMemory();
    toast('ذخیره شد');
  };

  function renderMemory() {
    const list = $('memList');
    if (!list) return;
    if (!S.memory.length) {
      list.innerHTML = '<div class="mem-empty">حافظه‌ای ثبت نشده.</div>';
      return;
    }
    list.innerHTML = S.memory.map((m, i) => `
      <div class="mem-item">
        <div class="mem-body"><b>${escape(m.key)}</b>${escape(m.value)}</div>
        <button class="mem-del" data-idx="${i}">✕</button>
      </div>
    `).join('');
    list.querySelectorAll('.mem-del').forEach(b => {
      b.onclick = () => {
        S.memory.splice(+b.dataset.idx, 1);
        save('saber_v6_memory', S.memory);
        renderMemory();
      };
    });
  }

  window.clearMemory = function () {
    if (!confirm('همه حافظه پاک شود؟')) return;
    S.memory = [];
    save('saber_v6_memory', []);
    renderMemory();
  };

  function escape(s) {
    return String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));
  }

  /* ============ Files ============ */
  window.handleFiles = function (fs) {
    if (!fs?.length) return;
    [...fs].forEach(f => S.files.push({ name: f.name, size: f.size, type: f.type }));
    renderFiles();
    toast(fs.length + ' فایل انتخاب شد');
  };

  function renderFiles() {
    const box = $('fileRows');
    if (!box) return;
    if (!S.files.length) { box.innerHTML = ''; return; }
    box.innerHTML = S.files.map((f, i) => `
      <div class="card" style="padding:10px">
        <b>${escape(f.name)}</b>
        <div class="muted" style="font-size:10px">${(f.size/1024).toFixed(1)} KB • ${escape(f.type || 'نامشخص')}</div>
        <button class="btn" style="margin-top:6px;padding:5px 10px;font-size:10px" onclick="S_delFile(${i})">حذف</button>
      </div>
    `).join('');
  }

  window.S_delFile = function (i) {
    S.files.splice(i, 1);
    renderFiles();
  };

  /* ============ Status ============ */
  function renderStatus() {
    const box = $('statusTable');
    if (!box) return;
    const checks = [
      ['Groq API Key', !!(CFG.GROQ_API_KEY && !CFG.GROQ_API_KEY.includes('PASTE'))],
      ['Microphone', !!navigator.mediaDevices?.getUserMedia],
      ['Speech Recognition', !!(window.SpeechRecognition || window.webkitSpeechRecognition)],
      ['Speech Synthesis', 'speechSynthesis' in window],
      ['LocalStorage', (() => { try { localStorage.setItem('_t','1'); localStorage.removeItem('_t'); return true; } catch { return false; } })()],
      ['Service Worker', 'serviceWorker' in navigator],
      ['Fetch API', typeof fetch === 'function']
    ];
    box.innerHTML = checks.map(([name, ok]) => `
      <div class="status-row">
        <span class="name">${name}</span>
        <span class="tag ${ok ? 'pass' : 'fail'}">${ok ? 'PASS' : 'FAIL'}</span>
      </div>
    `).join('');
  }

  /* ============ Settings ============ */
  window.saveSettings = function () {
    const model = $('model')?.value;
    const voice = $('ttsVoice')?.value;
    const rate = parseFloat($('ttsRate')?.value || 0.9);
    if (model) S.settings.model = model;
    if (voice !== undefined) S.settings.ttsVoice = voice;
    S.settings.ttsRate = rate;
    save('saber_v6_settings', S.settings);
  };

  /* ============ Boot ============ */
  function boot() {
    S.chat = load('saber_v6_chat', []);
    S.memory = load('saber_v6_memory', []);
    const savedSettings = load('saber_v6_settings', null);
    if (savedSettings) Object.assign(S.settings, savedSettings);

    setAvatar('IDLE');
    setSys('READY', 'ok');
    renderChat();
    renderMemory();

    // Model select
    const modelSel = $('model');
    if (modelSel && S.settings.model) modelSel.value = S.settings.model;

    // Rate slider
    const rateSlider = $('ttsRate');
    if (rateSlider) {
      rateSlider.value = S.settings.ttsRate || 0.9;
      const rv = $('rateVal');
      if (rv) rv.textContent = parseFloat(rateSlider.value).toFixed(2);
    }

    // Voices
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = refreshVoices;
      setTimeout(refreshVoices, 300);
    }

    // Key status
    const ks = $('keyStatus');
    if (ks) {
      if (CFG.GROQ_API_KEY && !CFG.GROQ_API_KEY.