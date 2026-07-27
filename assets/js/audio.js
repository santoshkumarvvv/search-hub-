/* ============================================================
   Queenie — Audio Engine
   • Live mic waveform visualizer (Web Audio AnalyserNode)
   • Sweet Neural Female Voice via SpeechSynthesis (TTS)
   ============================================================ */
(function () {
  const QueenieAudio = {};
  let audioCtx, analyser, micStream, freqData, timeData;
  let voices = [];
  let vizCanvas, vizCtx, vizRAF, micLevel = 0;

  // ---- Microphone ----
  QueenieAudio.initMic = function () {
    return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      micStream = stream;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      src.connect(analyser);
      freqData = new Uint8Array(analyser.frequencyBinCount);
      timeData = new Uint8Array(analyser.frequencyBinCount);
      return true;
    });
  };
  QueenieAudio.hasMic = function () { return !!analyser; };
  QueenieAudio.getAnalyser = function () { return analyser; };
  QueenieAudio.resume = function () { if (audioCtx && audioCtx.state === "suspended") audioCtx.resume(); };
  QueenieAudio.getLevel = function () {
    if (!analyser) return 0;
    analyser.getByteFrequencyData(freqData);
    let sum = 0; for (let i = 0; i < freqData.length; i++) sum += freqData[i];
    return Math.min(1, (sum / freqData.length / 255) * 2.2);
  };

  // ---- Radial visualizer overlay ----
  QueenieAudio.initVisualizer = function (canvas) {
    vizCanvas = canvas;
    vizCtx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const draw = () => {
      vizRAF = requestAnimationFrame(draw);
      const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
      vizCtx.clearRect(0, 0, w, h);
      const bars = 96, baseR = Math.min(w, h) * 0.22, maxLen = Math.min(w, h) * 0.16;
      micLevel += ((analyser ? QueenieAudio.getLevel() : 0) - micLevel) * 0.2;
      for (let i = 0; i < bars; i++) {
        const a = (i / bars) * Math.PI * 2;
        let amp = micLevel;
        if (analyser) {
          analyser.getByteFrequencyData(freqData);
          const idx = Math.floor((i / bars) * (freqData.length * 0.6));
          amp = (freqData[idx] / 255) * 1.2;
        }
        const len = baseR * 0.18 + amp * maxLen;
        const x1 = cx + Math.cos(a) * baseR, y1 = cy + Math.sin(a) * baseR;
        const x2 = cx + Math.cos(a) * (baseR + len), y2 = cy + Math.sin(a) * (baseR + len);
        const hue = 320 - amp * 60; // pink -> purple
        vizCtx.strokeStyle = `hsla(${hue}, 100%, ${60 + amp * 20}%, ${0.35 + amp * 0.6})`;
        vizCtx.lineWidth = 2.4;
        vizCtx.lineCap = "round";
        vizCtx.beginPath(); vizCtx.moveTo(x1, y1); vizCtx.lineTo(x2, y2); vizCtx.stroke();
      }
    };
    draw();
  };

  // ---- Voices ----
  function loadVoices() { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; }
  if (window.speechSynthesis) {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }
  QueenieAudio.listVoices = function () { return voices; };

  function isFemale(name) {
    const n = (name || "").toLowerCase();
    return /female|woman|zira|samantha|kanya|tessa|victoria|jenny|aria|google हिन्दी|hindi|girl|sakshi|kalpana|aditi|veena|leela|heera/i.test(n);
  }

  QueenieAudio.pickVoice = function (lang) {
    if (!voices.length) return null;
    const wantHi = lang === "hi";
    let pool = voices.filter((v) => (wantHi ? v.lang && v.lang.toLowerCase().startsWith("hi") : v.lang && v.lang.toLowerCase().startsWith("en")));
    if (!pool.length) pool = voices;
    const fem = pool.filter((v) => isFemale(v.name));
    const best = fem.length ? fem : pool;
    // prefer Google neural female voices
    const google = best.find((v) => /google/i.test(v.name));
    return google || best[0];
  };

  // en-IN / hi-IN detection helper
  QueenieAudio.langFor = function (text) {
    return /[\u0900-\u097F]/.test(text) ? "hi" : "en";
  };

  // ---- Speak (splits long replies into sentences so TTS never truncates) ----
  QueenieAudio.speak = function (text, lang, hooks) {
    hooks = hooks || {};
    if (!window.speechSynthesis) { hooks.onend && hooks.onend(); return; }
    try { speechSynthesis.cancel(); } catch (e) {}
    const parts = (text.match(/[^।.!?]+[।.!?]*/g) || [text]).map((s) => s.trim()).filter(Boolean);
    let i = 0;
    const speakNext = () => {
      if (i >= parts.length) { hooks.onend && hooks.onend(); return; }
      const chunk = parts[i++];
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = lang === "hi" ? "hi-IN" : "en-US";
      const v = QueenieAudio.pickVoice(lang);
      if (v) u.voice = v;
      u.pitch = 1.28; u.rate = 1.02; u.volume = 1.0;
      u.onstart = () => hooks.onstart && hooks.onstart();
      u.onboundary = () => hooks.onboundary && hooks.onboundary();
      u.onend = speakNext;
      u.onerror = speakNext;
      speechSynthesis.speak(u);
    };
    speakNext();
  };

  QueenieAudio.stop = function () { try { speechSynthesis.cancel(); } catch (e) {} };
  QueenieAudio.supported = function () {
    return !!(window.speechSynthesis && (window.SpeechRecognition || window.webkitSpeechRecognition));
  };

  window.QueenieAudio = QueenieAudio;
})();
