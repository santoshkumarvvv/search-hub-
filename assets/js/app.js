/* =========================================================
   Queenie — App
   • SpeechRecognition (mic) — केवल user gesture पर शुरू
   • SpeechSynthesis (TTS) — Android/iOS unlock सहित
   • SVG अवतार lip-sync + blink + eye tracking
   • Optional OpenAI-compatible API, वरना लोकल brain
   ========================================================= */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var state = {
    listening: false,
    handsfree: false,
    speaking: false,
    busy: false,
    lang: "hi",
    voiceURI: "",
    rate: 1,
    pitch: 1.15,
    useApi: false,
    apiBase: "",
    apiKey: "",
    apiModel: "",
    history: [],
    ttsUnlocked: false
  };

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var TTS = window.speechSynthesis;
  var recog = null;
  var voices = [];
  var restartTimer = null;
  var manualStop = false;

  /* ---------------- toast / status ---------------- */
  var toastTimer;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }
  function setStatus(msg) { $("status").textContent = msg; }

  /* ---------------- chat ---------------- */
  function addMsg(who, text) {
    var chat = $("chat");
    var d = document.createElement("div");
    d.className = "msg " + who;
    var s = document.createElement("span");
    s.className = "who";
    s.textContent = who === "user" ? "आप" : "Queenie";
    d.appendChild(s);
    d.appendChild(document.createTextNode(text));
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
    state.history.push({ role: who === "user" ? "user" : "assistant", content: text });
    if (state.history.length > 20) state.history.shift();
    saveChat();
    return d;
  }
  function typingOn() {
    var chat = $("chat");
    var d = document.createElement("div");
    d.className = "msg bot typing";
    d.id = "typing";
    d.innerHTML = "<span></span><span></span><span></span>";
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }
  function typingOff() { var t = $("typing"); if (t) t.remove(); }

  function saveChat() {
    try {
      var chat = $("chat");
      var items = [];
      var nodes = chat.querySelectorAll(".msg:not(.typing)");
      for (var i = Math.max(0, nodes.length - 30); i < nodes.length; i++) {
        var n = nodes[i];
        items.push({ who: n.classList.contains("user") ? "user" : "bot", text: n.textContent.replace(/^(आप|Queenie)/, "") });
      }
      localStorage.setItem("queenie_chat", JSON.stringify(items));
    } catch (e) {}
  }
  function loadChat() {
    try {
      var items = JSON.parse(localStorage.getItem("queenie_chat") || "[]");
      for (var i = 0; i < items.length; i++) addMsg(items[i].who, items[i].text);
      return items.length > 0;
    } catch (e) { return false; }
  }

  /* ---------------- avatar animation ---------------- */
  var mouth = null, lidL = null, lidR = null, ring = null;
  var mouthTarget = 5, mouthCur = 5, vizCtx = null, vizCanvas = null;
  var vizLevel = 0;

  function initAvatar() {
    mouth = $("mouth"); lidL = $("lid-l"); lidR = $("lid-r"); ring = $("avatar-ring");
    sizeViz();
    blinkLoop();
    frame();
    // eyes follow pointer
    document.addEventListener("pointermove", function (e) {
      var irises = document.querySelectorAll(".iris");
      var dx = (e.clientX / window.innerWidth - 0.5) * 5;
      var dy = (e.clientY / window.innerHeight - 0.5) * 4;
      for (var i = 0; i < irises.length; i++) {
        irises[i].setAttribute("transform", "translate(" + dx.toFixed(2) + "," + dy.toFixed(2) + ")");
      }
    }, { passive: true });
  }

  // canvas is decorative only — never let it break the app
  function sizeViz() {
    try {
      vizCanvas = $("viz");
      if (!vizCanvas || typeof vizCanvas.getContext !== "function") { vizCtx = null; return; }
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = vizCanvas.clientWidth || 250, h = vizCanvas.clientHeight || 270;
      vizCanvas.width = w * dpr;
      vizCanvas.height = h * dpr;
      var ctx = vizCanvas.getContext("2d");
      if (!ctx || typeof ctx.scale !== "function") { vizCtx = null; return; }
      ctx.scale(dpr, dpr);
      vizCtx = ctx;
    } catch (e) { vizCtx = null; }
  }

  function blinkLoop() {
    var doBlink = function () {
      if (!lidL) return;
      var step = 0;
      var iv = setInterval(function () {
        step++;
        var h = step <= 3 ? step * 4 : (6 - step) * 4;
        if (h < 0) h = 0;
        lidL.setAttribute("height", h);
        lidR.setAttribute("height", h);
        if (step >= 6) { clearInterval(iv); lidL.setAttribute("height", 0); lidR.setAttribute("height", 0); }
      }, 28);
    };
    setInterval(function () { if (Math.random() > 0.35) doBlink(); }, 3200);
  }

  function frame() {
    requestAnimationFrame(frame);
    try { tick(); } catch (e) {}
  }

  function tick() {
    if (state.speaking) mouthTarget = 4 + Math.abs(Math.sin(Date.now() / 90)) * 11 + Math.random() * 3;
    else if (state.listening) mouthTarget = 5;
    else mouthTarget = 5;
    mouthCur += (mouthTarget - mouthCur) * 0.35;
    if (mouth) mouth.setAttribute("ry", mouthCur.toFixed(2));

    var targetLevel = state.speaking ? 0.55 + Math.abs(Math.sin(Date.now() / 110)) * 0.45
                    : state.listening ? 0.30 + Math.abs(Math.sin(Date.now() / 260)) * 0.25 : 0.1;
    vizLevel += (targetLevel - vizLevel) * 0.15;
    if (ring) ring.style.transform = "scale(" + (1 + vizLevel * 0.07).toFixed(3) + ")";
    drawViz();
  }

  function drawViz() {
    if (!vizCtx || !vizCanvas) return;
    var w = vizCanvas.clientWidth || 250, h = vizCanvas.clientHeight || 270;
    vizCtx.clearRect(0, 0, w, h);
    if (!state.speaking && !state.listening) return;
    var cx = w / 2, cy = h / 2, base = Math.min(w, h) * 0.44, bars = 56;
    var hueBase = state.listening ? 190 : 320;
    for (var i = 0; i < bars; i++) {
      var a = (i / bars) * Math.PI * 2;
      var amp = (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + Date.now() / (state.speaking ? 130 : 320)))) * vizLevel;
      var len = 6 + amp * 22;
      var x1 = cx + Math.cos(a) * base, y1 = cy + Math.sin(a) * base;
      var x2 = cx + Math.cos(a) * (base + len), y2 = cy + Math.sin(a) * (base + len);
      vizCtx.strokeStyle = "hsla(" + (hueBase - amp * 40) + ",100%," + (60 + amp * 15) + "%," + (0.25 + amp * 0.6) + ")";
      vizCtx.lineWidth = 2.2; vizCtx.lineCap = "round";
      vizCtx.beginPath(); vizCtx.moveTo(x1, y1); vizCtx.lineTo(x2, y2); vizCtx.stroke();
    }
  }

  function setSpeakingUI(on) {
    state.speaking = on;
    document.body.classList.toggle("speaking", on);
  }
  function setListeningUI(on) {
    state.listening = on;
    document.body.classList.toggle("listening", on);
    $("mic-btn").classList.toggle("active", on);
  }

  /* ---------------- TTS ---------------- */
  function loadVoices() {
    if (!TTS) return;
    voices = TTS.getVoices() || [];
    var sel = $("voice-select");
    if (!sel) return;
    var cur = state.voiceURI;
    sel.innerHTML = "";
    var auto = document.createElement("option");
    auto.value = ""; auto.textContent = "स्वतः चुनें (सुझाया गया)";
    sel.appendChild(auto);
    for (var i = 0; i < voices.length; i++) {
      var o = document.createElement("option");
      o.value = voices[i].voiceURI;
      o.textContent = voices[i].name + " — " + voices[i].lang;
      sel.appendChild(o);
    }
    if (cur) sel.value = cur;
  }

  function isFemale(name) {
    return /female|woman|zira|samantha|swara|kanya|tessa|victoria|jenny|aria|sakshi|kalpana|aditi|veena|heera|lekha|neerja|salli|joanna|karen|moira|fiona|google.*(hindi|हिन्दी)/i.test(name || "");
  }

  function pickVoice(lang) {
    if (!voices.length) return null;
    if (state.voiceURI) {
      for (var k = 0; k < voices.length; k++) if (voices[k].voiceURI === state.voiceURI) return voices[k];
    }
    var want = lang === "hi" ? "hi" : "en";
    var pool = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(want) === 0; });
    if (!pool.length && want === "hi") {
      pool = voices.filter(function (v) { return /en-IN/i.test(v.lang || ""); });
    }
    if (!pool.length) pool = voices;
    var fem = pool.filter(function (v) { return isFemale(v.name); });
    var best = fem.length ? fem : pool;
    var g = best.filter(function (v) { return /google|natural|neural|online/i.test(v.name); });
    return (g.length ? g[0] : best[0]) || null;
  }

  // Android/Chrome needs a user-gesture-triggered utterance to unlock audio.
  function unlockTTS() {
    if (state.ttsUnlocked || !TTS) return;
    try {
      var u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      TTS.speak(u);
      state.ttsUnlocked = true;
    } catch (e) {}
  }

  function speak(text, done) {
    if (!TTS) { toast("यह ब्राउज़र आवाज़ (TTS) सपोर्ट नहीं करता"); done && done(); return; }
    try { TTS.cancel(); } catch (e) {}
    var lang = /[\u0900-\u097F]/.test(text) ? "hi" : "en";
    var clean = text.replace(/[*_`#>~|]/g, "").replace(/\s+/g, " ").trim();
    // long text -> sentence chunks (Chrome truncates ~200 chars)
    var parts = clean.match(/[^।.!?]+[।.!?]*/g) || [clean];
    var chunks = [], buf = "";
    for (var i = 0; i < parts.length; i++) {
      if ((buf + parts[i]).length > 180) { if (buf) chunks.push(buf.trim()); buf = parts[i]; }
      else buf += parts[i];
    }
    if (buf.trim()) chunks.push(buf.trim());
    if (!chunks.length) { done && done(); return; }

    var idx = 0, finished = false;
    var voice = pickVoice(lang);
    setSpeakingUI(true);
    setStatus("बोल रही हूँ… 💬");

    function finish() {
      if (finished) return;
      finished = true;
      clearInterval(keepAlive);
      setSpeakingUI(false);
      done && done();
    }
    // Chrome bug: synthesis pauses after ~15s
    var keepAlive = setInterval(function () {
      if (!TTS.speaking) return;
      try { TTS.pause(); TTS.resume(); } catch (e) {}
    }, 9000);

    function next() {
      if (idx >= chunks.length) { finish(); return; }
      var u = new SpeechSynthesisUtterance(chunks[idx++]);
      u.lang = lang === "hi" ? "hi-IN" : "en-US";
      if (voice) u.voice = voice;
      u.rate = state.rate;
      u.pitch = state.pitch;
      u.volume = 1;
      u.onend = next;
      u.onerror = function () { next(); };
      try { TTS.speak(u); } catch (e) { finish(); }
    }
    next();
    // safety: never get stuck in "speaking" state
    setTimeout(function () { if (!finished && !TTS.speaking && !TTS.pending) finish(); }, 1500);
  }

  function stopSpeaking() {
    try { TTS && TTS.cancel(); } catch (e) {}
    setSpeakingUI(false);
    setStatus(state.listening ? "सुन रही हूँ… 🎧" : "तैयार हूँ — माइक दबाकर बोलिए 🎤");
  }

  /* ---------------- AI reply ---------------- */
  function apiUrl() {
    var b = (state.apiBase || "").trim().replace(/\/+$/, "");
    if (!b) b = "https://api.x.ai/v1";
    if (!/\/chat\/completions$/.test(b)) b += "/chat/completions";
    return b;
  }

  function callApi(text) {
    var msgs = [{ role: "system", content: window.QueenieBrain.systemPrompt }];
    var recent = state.history.slice(-8);
    for (var i = 0; i < recent.length; i++) msgs.push(recent[i]);
    msgs.push({ role: "user", content: text });

    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 25000) : null;

    return fetch(apiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + state.apiKey },
      body: JSON.stringify({
        model: state.apiModel || "grok-3",
        messages: msgs,
        temperature: 0.8,
        max_tokens: 300,
        stream: false
      }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (timer) clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).then(function (data) {
      var c = data && data.choices && data.choices[0];
      var txt = c && ((c.message && c.message.content) || c.text);
      if (!txt) throw new Error("खाली जवाब");
      return String(txt).trim();
    });
  }

  function getReply(text) {
    if (state.useApi && state.apiKey) {
      return callApi(text)["catch"](function (e) {
        toast("API नहीं चला (" + e.message + ") — लोकल जवाब दे रही हूँ");
        return window.QueenieBrain.respond(text);
      });
    }
    return Promise.resolve(window.QueenieBrain.respond(text));
  }

  function handleUser(text) {
    text = (text || "").trim();
    if (!text || state.busy) return;
    state.busy = true;
    unlockTTS();
    addMsg("user", text);
    setStatus("सोच रही हूँ… 💭");
    typingOn();

    getReply(text).then(function (reply) {
      typingOff();
      var clean = String(reply).replace(/[*_`#>~]/g, "").replace(/\n{2,}/g, "\n").trim();
      addMsg("bot", clean);
      state.busy = false;
      speak(clean, function () {
        if (state.handsfree) {
          setStatus("सुन रही हूँ… 🎧");
          startListening(true);
        } else {
          setStatus("तैयार हूँ — माइक दबाकर बोलिए 🎤");
        }
      });
    })["catch"](function (e) {
      typingOff();
      state.busy = false;
      addMsg("bot", "उफ़, कुछ गड़बड़ हो गई 😅 फिर से कहिए ना।");
      setStatus("तैयार हूँ — माइक दबाकर बोलिए 🎤");
    });
  }

  /* ---------------- Speech recognition ---------------- */
  function buildRecognition() {
    if (!SR) return null;
    var r = new SR();
    r.lang = state.lang === "hi" ? "hi-IN" : "en-US";
    r.continuous = false;          // mobile-safe; we restart manually
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onstart = function () {
      setListeningUI(true);
      setStatus("सुन रही हूँ… बोलिए 🎧");
    };
    r.onresult = function (e) {
      var interim = "", finalTxt = "";
      for (var i = e.resultIndex; i < e.results.length; i++) {
        var res = e.results[i];
        if (res.isFinal) finalTxt += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (interim) setStatus("सुन रही हूँ… “" + interim.slice(0, 60) + "”");
      if (finalTxt.trim()) {
        manualStop = true;                 // this turn is done
        try { r.stop(); } catch (err) {}
        handleUser(finalTxt.trim());
      }
    };
    r.onerror = function (e) {
      var err = e.error;
      if (err === "not-allowed" || err === "service-not-allowed") {
        manualStop = true;
        setListeningUI(false);
        state.handsfree = false;
        $("handsfree-btn").classList.remove("active");
        toast("माइक की अनुमति नहीं मिली 🎤 ब्राउज़र के 🔒 आइकॉन से Microphone → Allow करें, फिर पेज रीलोड करें।");
        setStatus("माइक ब्लॉक है — टाइप करके बात कर सकते हैं 💬");
      } else if (err === "no-speech") {
        setStatus("कुछ सुनाई नहीं दिया — फिर बोलिए 🎤");
      } else if (err === "audio-capture") {
        manualStop = true;
        toast("माइक नहीं मिला — डिवाइस चेक करें");
      } else if (err === "network") {
        toast("नेटवर्क ज़रूरी है — वॉइस पहचान इंटरनेट से चलती है");
      }
    };
    r.onend = function () {
      setListeningUI(false);
      // hands-free: auto restart unless we're busy/speaking
      if (state.handsfree && !manualStop && !state.speaking && !state.busy) {
        clearTimeout(restartTimer);
        restartTimer = setTimeout(function () { startListening(true); }, 400);
      } else if (!state.busy && !state.speaking) {
        setStatus("तैयार हूँ — माइक दबाकर बोलिए 🎤");
      }
      manualStop = false;
    };
    return r;
  }

  function startListening(auto) {
    if (!SR) {
      toast("यह ब्राउज़र वॉइस पहचान सपोर्ट नहीं करता। Chrome/Edge इस्तेमाल करें — टाइपिंग यहाँ भी चलेगी 💬");
      return;
    }
    if (!window.isSecureContext && location.hostname !== "localhost") {
      toast("माइक के लिए HTTPS ज़रूरी है");
      return;
    }
    if (state.listening) return;
    unlockTTS();
    try { TTS && TTS.cancel(); } catch (e) {}
    setSpeakingUI(false);
    if (!recog) recog = buildRecognition();
    if (!recog) return;
    recog.lang = state.lang === "hi" ? "hi-IN" : "en-US";
    manualStop = false;
    try {
      recog.start();
    } catch (e) {
      // already started — restart cleanly
      try { recog.stop(); } catch (e2) {}
      setTimeout(function () { try { recog.start(); } catch (e3) {} }, 250);
    }
  }

  function stopListening() {
    manualStop = true;
    clearTimeout(restartTimer);
    if (recog) { try { recog.stop(); } catch (e) {} }
    setListeningUI(false);
    setStatus("तैयार हूँ — माइक दबाकर बोलिए 🎤");
  }

  /* ---------------- settings ---------------- */
  function loadSettings() {
    try {
      var s = JSON.parse(localStorage.getItem("queenie_settings") || "{}");
      state.apiBase = s.apiBase || "";
      state.apiKey = s.apiKey || "";
      state.apiModel = s.apiModel || "";
      state.useApi = !!s.useApi;
      state.voiceURI = s.voiceURI || "";
      state.rate = s.rate || 1;
      state.pitch = s.pitch || 1.15;
      state.lang = s.lang || "hi";
    } catch (e) {}
    $("api-base").value = state.apiBase;
    $("api-key").value = state.apiKey;
    $("api-model").value = state.apiModel;
    $("use-api").checked = state.useApi;
    $("rate").value = state.rate;
    $("pitch").value = state.pitch;
    $("lang-label").textContent = state.lang === "hi" ? "हिन्दी" : "English";
    updateChip();
  }
  function saveSettings() {
    state.apiBase = $("api-base").value.trim();
    state.apiKey = $("api-key").value.trim();
    state.apiModel = $("api-model").value.trim();
    state.useApi = $("use-api").checked;
    state.voiceURI = $("voice-select").value;
    state.rate = parseFloat($("rate").value);
    state.pitch = parseFloat($("pitch").value);
    try {
      localStorage.setItem("queenie_settings", JSON.stringify({
        apiBase: state.apiBase, apiKey: state.apiKey, apiModel: state.apiModel,
        useApi: state.useApi, voiceURI: state.voiceURI, rate: state.rate,
        pitch: state.pitch, lang: state.lang
      }));
    } catch (e) {}
    updateChip();
    toast("सेटिंग्स सेव हो गईं ✅");
    openSheet(false);
  }
  function updateChip() {
    var c = $("mode-chip");
    var live = state.useApi && state.apiKey;
    c.textContent = live ? "AI लाइव" : "लोकल";
    c.classList.toggle("live", !!live);
  }
  function openSheet(on) {
    $("settings").classList.toggle("open", on);
    $("settings").setAttribute("aria-hidden", on ? "false" : "true");
    $("scrim").classList.toggle("show", on);
  }

  function diagnostics() {
    var lines = [];
    lines.push((SR ? "✅" : "❌") + " वॉइस पहचान (SpeechRecognition)");
    lines.push((TTS ? "✅" : "❌") + " बोलना (SpeechSynthesis)");
    lines.push((voices.length ? "✅ " + voices.length + " आवाज़ें मिलीं" : "⚠️ आवाज़ें अभी लोड नहीं हुईं"));
    lines.push((window.isSecureContext ? "✅" : "❌") + " HTTPS सुरक्षित कनेक्शन");
    lines.push((navigator.onLine ? "✅" : "❌") + " इंटरनेट");
    var msg = lines.join("\n") + "\n\n" +
      (SR ? "माइक बटन दबाकर बोलिए।" : "इस ब्राउज़र में वॉइस पहचान नहीं है — Chrome या Edge आज़माएँ। टाइपिंग यहाँ भी काम करती है।");
    addMsg("bot", msg);
  }

  /* ---------------- bind ---------------- */
  function bind() {
    $("mic-btn").addEventListener("click", function () {
      unlockTTS();
      if (state.listening) stopListening(); else startListening(false);
    });

    $("composer").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("text-input").value.trim();
      $("text-input").value = "";
      if (v) handleUser(v);
    });

    $("handsfree-btn").addEventListener("click", function () {
      state.handsfree = !state.handsfree;
      this.classList.toggle("active", state.handsfree);
      unlockTTS();
      if (state.handsfree) { toast("हैंड्स-फ्री ऑन — बस बोलते रहिए 🎙️"); startListening(true); }
      else { toast("हैंड्स-फ्री ऑफ"); stopListening(); }
    });

    $("lang-btn").addEventListener("click", function () {
      state.lang = state.lang === "hi" ? "en" : "hi";
      $("lang-label").textContent = state.lang === "hi" ? "हिन्दी" : "English";
      if (recog) recog.lang = state.lang === "hi" ? "hi-IN" : "en-US";
      toast(state.lang === "hi" ? "अब हिन्दी में सुनूँगी 🇮🇳" : "Listening in English now");
      if (state.listening) { stopListening(); setTimeout(function () { startListening(true); }, 300); }
    });

    $("stop-btn").addEventListener("click", function () { stopSpeaking(); stopListening(); });
    $("diag-btn").addEventListener("click", diagnostics);

    var pills = document.querySelectorAll(".quickbar .pill");
    for (var i = 0; i < pills.length; i++) {
      pills[i].addEventListener("click", function () { handleUser(this.getAttribute("data-q")); });
    }

    $("gear-btn").addEventListener("click", function () { openSheet(true); });
    $("settings-close").addEventListener("click", function () { openSheet(false); });
    $("scrim").addEventListener("click", function () { openSheet(false); });
    $("save-settings").addEventListener("click", saveSettings);
    $("clear-chat").addEventListener("click", function () {
      $("chat").innerHTML = "";
      state.history = [];
      try { localStorage.removeItem("queenie_chat"); } catch (e) {}
      toast("चैट साफ़ हो गई");
      openSheet(false);
    });
    $("test-api").addEventListener("click", function () {
      saveSettings();
      if (!state.apiKey) { toast("पहले API key डालिए 🔑"); return; }
      toast("API टेस्ट कर रही हूँ…");
      callApi("एक छोटा सा हैलो बोलो").then(function (r) {
        addMsg("bot", "API ✅ " + r);
        speak(r);
      })["catch"](function (e) {
        addMsg("bot", "API ❌ " + e.message + " — key, base URL और CORS जाँचें।");
      });
    });

    $("voice-select").addEventListener("change", function () {
      state.voiceURI = this.value;
      var v = pickVoice(state.lang);
      if (v) { setSpeakingUI(true); speak(state.lang === "hi" ? "नमस्ते, मैं ऐसी सुनाई दूँगी" : "Hello, this is how I sound"); }
    });
    $("rate").addEventListener("input", function () { state.rate = parseFloat(this.value); });
    $("pitch").addEventListener("input", function () { state.pitch = parseFloat(this.value); });

    window.addEventListener("resize", sizeViz);

    // stop TTS when tab hidden
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { try { TTS && TTS.cancel(); } catch (e) {} setSpeakingUI(false); }
    });
  }

  /* ---------------- init ---------------- */
  function safe(label, fn) {
    try { fn(); } catch (e) { if (window.console && console.warn) console.warn("Queenie " + label + ":", e); }
  }

  function init() {
    safe("avatar", initAvatar);
    safe("settings", loadSettings);
    safe("voices", loadVoices);
    if (TTS && typeof TTS.onvoiceschanged !== "undefined") {
      TTS.onvoiceschanged = function () { loadVoices(); };
    }
    // some browsers populate voices late
    setTimeout(function () { safe("voices", loadVoices); }, 700);
    setTimeout(function () { safe("voices", loadVoices); }, 2000);

    safe("bind", bind);

    var had = false;
    safe("chat", function () { had = loadChat(); });
    if (!had) {
      addMsg("bot", "नमस्ते! मैं Queenie हूँ 💜 माइक बटन दबाकर बोलिए, या नीचे टाइप कीजिए — मैं सुनकर बोलकर जवाब दूँगी।");
    }

    if (!SR) {
      $("hint").textContent = "इस ब्राउज़र में वॉइस पहचान नहीं है — Chrome/Edge आज़माएँ (टाइपिंग यहाँ भी चलेगी)";
    }
    setStatus("तैयार हूँ — माइक दबाकर बोलिए 🎤");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
