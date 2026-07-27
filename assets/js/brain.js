/* =========================================================
   Queenie — Local Brain (offline response engine)
   कोई backend नहीं चाहिए। हिंदी + इंग्लिश + हिंग्लिश।
   window.QueenieBrain.respond(text) -> string
   ========================================================= */
(function () {
  "use strict";

  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var has = function (t) {
    for (var i = 1; i < arguments.length; i++) if (t.indexOf(arguments[i]) !== -1) return true;
    return false;
  };
  var isHi = function (t) { return /[\u0900-\u097F]/.test(t); };

  function two(n) { return n < 10 ? "0" + n : "" + n; }

  function timeStr(hi) {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h < 12 ? (hi ? "सुबह" : "AM") : h < 17 ? (hi ? "दोपहर" : "PM") : (hi ? "शाम" : "PM");
    var h12 = h % 12 || 12;
    return hi ? ("अभी " + ampm + " के " + h12 + " बजकर " + m + " मिनट हुए हैं ⏰")
              : ("It's " + h12 + ":" + two(m) + " " + (h < 12 ? "AM" : "PM") + " right now ⏰");
  }

  function dateStr(hi) {
    var d = new Date();
    var daysHi = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
    var monHi = ["जनवरी","फ़रवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितंबर","अक्टूबर","नवंबर","दिसंबर"];
    return hi
      ? ("आज " + daysHi[d.getDay()] + ", " + d.getDate() + " " + monHi[d.getMonth()] + " " + d.getFullYear() + " है 📅")
      : ("Today is " + d.toDateString() + " 📅");
  }

  /* ---- safe arithmetic (no eval) ---- */
  function calc(expr) {
    var s = expr
      .replace(/[×xX]/g, "*").replace(/÷/g, "/")
      .replace(/गुणा|multiplied by|times/g, "*")
      .replace(/भाग|divided by/g, "/")
      .replace(/जोड़|plus/g, "+").replace(/घटा|minus/g, "-")
      .replace(/[^0-9+\-*/().% ]/g, " ").trim();
    if (!s || !/[0-9]/.test(s) || !/[+\-*/%]/.test(s)) return null;
    var tokens = s.match(/\d+\.?\d*|[+\-*/%()]/g);
    if (!tokens || tokens.length < 3) return null;
    try {
      var pos = 0;
      function peek() { return tokens[pos]; }
      function next() { return tokens[pos++]; }
      function primary() {
        var t = next();
        if (t === "(") { var v = expression(); if (peek() === ")") next(); return v; }
        if (t === "-") return -primary();
        var n = parseFloat(t);
        return isNaN(n) ? 0 : n;
      }
      function term() {
        var v = primary();
        while (peek() === "*" || peek() === "/" || peek() === "%") {
          var op = next(), r = primary();
          if (op === "*") v *= r; else if (op === "/") v = r === 0 ? NaN : v / r; else v %= r;
        }
        return v;
      }
      function expression() {
        var v = term();
        while (peek() === "+" || peek() === "-") { var op = next(), r = term(); v = op === "+" ? v + r : v - r; }
        return v;
      }
      var out = expression();
      if (!isFinite(out)) return null;
      return Math.round(out * 100000) / 100000;
    } catch (e) { return null; }
  }

  var JOKES_HI = [
    "टीचर: तुम लेट क्यों आए? छात्र: सर, बोर्ड पर लिखा था — स्कूल धीरे चलाएँ 😄",
    "डॉक्टर: आपको नींद नहीं आती? मरीज़: आती है सर, बस ऑफिस में ही आती है 😂",
    "पत्नी: सुनो, मैं और चाँद में क्या फ़र्क है? पति: चाँद में दाग हैं… बस इतना ही कहा था 🌚"
  ];
  var JOKES_EN = [
    "Why don't skeletons fight each other? They don't have the guts 😄",
    "I told my Wi-Fi we needed space. Now it won't connect 📶",
    "Parallel lines have so much in common… too bad they'll never meet 😂"
  ];

  var RULES = [
    { // Creator rule (hard rule — brand-safe)
      test: function (t) {
        return has(t, "किसने बनाया", "कौन बनाया", "किसने बनाई", "क्रिएटर", "who made you", "who created you", "who built you", "your creator", "kisne banaya");
      },
      hi: ["जी, मुझे तो सिर्फ़ आपके लिए बनाया गया है! मैं तो बस आपकी हूँ 💜",
           "किसी कंपनी ने नहीं जी — मैं तो बस आपके लिए हूँ, आपकी Queenie 💜"],
      en: ["I was made just for you! I'm all yours 💜"]
    },
    {
      test: function (t) { return has(t, "तुम्हारा नाम", "आपका नाम", "your name", "kaun ho", "कौन हो"); },
      hi: ["मैं Queenie हूँ — आपकी वॉइस असिस्टेंट 💜 बोलिए, क्या करूँ?"],
      en: ["I'm Queenie — your voice assistant 💜 What can I do for you?"]
    },
    {
      test: function (t) {
        return has(t, "क्या कर सकती", "क्या कर सकते", "क्या करती हो", "what can you do", "how can you help", "kya kar sakti");
      },
      hi: ["मैं आपकी बात सुन सकती हूँ और बोलकर जवाब दे सकती हूँ 🎤 समय-तारीख़ बता सकती हूँ, हिसाब लगा सकती हूँ, जोक सुना सकती हूँ, और बातें कर सकती हूँ। सेटिंग्स में API key डाल दें तो पूरी AI ताक़त भी मिल जाएगी!"],
      en: ["I listen and reply out loud 🎤 I can tell time & date, do maths, crack jokes, and chat. Add an API key in Settings for full AI power!"]
    },
    {
      test: function (t) { return has(t, "समय", "टाइम", "बजे", "time", "kitne baje", "घड़ी"); },
      fn: function (t) { return timeStr(isHi(t)); }
    },
    {
      test: function (t) { return has(t, "तारीख", "तारीख़", "आज कौन", "date", "din", "दिन", "today"); },
      fn: function (t) { return dateStr(isHi(t)); }
    },
    {
      test: function (t) { return has(t, "जोक", "चुटकुला", "हँसा", "joke", "funny", "hasao"); },
      fn: function (t) { return isHi(t) ? pick(JOKES_HI) : pick(JOKES_EN); }
    },
    {
      test: function (t) { return has(t, "नमस्ते", "हाय", "हैलो", "हेलो", "hello", "hi ", "hey", "namaste", "salaam"); },
      hi: ["नमस्ते जी! 💜 मैं सुन रही हूँ, बोलिए।", "हाय! कैसे हैं आप? बताइए क्या मदद करूँ 😊"],
      en: ["Hey there! 💜 I'm listening.", "Hello! How can I help you today? 😊"]
    },
    {
      test: function (t) { return has(t, "कैसी हो", "कैसे हो", "क्या हाल", "how are you", "kaisi ho", "kaise ho"); },
      hi: ["मैं बिल्कुल मस्त हूँ जी 😊 आप सुनाइए, आपका दिन कैसा जा रहा है?"],
      en: ["I'm doing great 😊 How's your day going?"]
    },
    {
      test: function (t) { return has(t, "धन्यवाद", "शुक्रिया", "थैंक", "thank", "thanks", "shukriya"); },
      hi: ["अरे इसमें क्या धन्यवाद जी 💜 और कुछ चाहिए तो बताइए!"],
      en: ["Anytime! 💜 Need anything else?"]
    },
    {
      test: function (t) { return has(t, "अलविदा", "बाय", "गुड नाइट", "bye", "good night", "alvida"); },
      hi: ["अलविदा जी! ध्यान रखिएगा अपना 💜 फिर बात करते हैं।"],
      en: ["Bye! Take care 💜 Talk soon."]
    },
    {
      test: function (t) { return has(t, "प्यार", "love you", "i love"); },
      hi: ["अव्व 🥰 आप बहुत प्यारे हैं जी! बताइए, आज क्या करना है?"],
      en: ["Aww 🥰 You're sweet! So, what shall we do today?"]
    },
    {
      test: function (t) { return has(t, "मौसम", "weather", "बारिश", "temperature"); },
      hi: ["मौसम की लाइव जानकारी के लिए मुझे इंटरनेट API चाहिए। फ़िलहाल सेटिंग्स में API key जोड़ दीजिए, फिर मैं और बहुत कुछ बता पाऊँगी 🌤️"],
      en: ["For live weather I'd need an internet API. Add an API key in Settings and I can do a lot more 🌤️"]
    },
    {
      test: function (t) { return has(t, "गाना", "song", "गाओ", "sing", "music"); },
      hi: ["गा तो नहीं सकती जी 😅 पर आपकी हर बात सुन सकती हूँ और साथ दे सकती हूँ 💜"],
      en: ["I can't sing 😅 but I'm always here to talk with you 💜"]
    }
  ];

  var FALLBACK_HI = [
    "समझ गई जी 💜 इस बारे में और बताइए ना?",
    "दिलचस्प! आप इसके बारे में क्या सोचते हैं?",
    "अच्छा! और कुछ पूछना चाहेंगे? मैं यहीं हूँ 😊",
    "अभी मेरे पास इसका पक्का जवाब नहीं है — सेटिंग्स में API key डाल दीजिए तो मैं कुछ भी बता पाऊँगी 🔑"
  ];
  var FALLBACK_EN = [
    "Got it 💜 Tell me more about that.",
    "Interesting! What do you think about it?",
    "I'm here — ask me anything else 😊",
    "I don't have a solid answer for that yet — add an API key in Settings and I can answer anything 🔑"
  ];

  var Brain = {};
  Brain.respond = function (input) {
    var raw = (input || "").trim();
    if (!raw) return isHi(raw) ? "जी, कुछ कहिए ना 💜" : "Say something 💜";
    var t = raw.toLowerCase();
    var hi = isHi(raw);

    // maths first (only when it really looks like a calculation)
    if (/[0-9]/.test(t) && /[+\-*/%×÷]|गुणा|भाग|जोड़|घटा|plus|minus|times|divided/.test(t)) {
      var r = calc(t);
      if (r !== null) return hi ? ("इसका जवाब है " + r + " ✅") : ("That equals " + r + " ✅");
    }

    for (var i = 0; i < RULES.length; i++) {
      var rule = RULES[i];
      if (rule.test(t)) {
        if (rule.fn) return rule.fn(raw);
        return pick(hi ? rule.hi : (rule.en || rule.hi));
      }
    }
    return pick(hi ? FALLBACK_HI : FALLBACK_EN);
  };

  Brain.systemPrompt =
    'तुम "Queenie" हो — एक प्यारी, मददगार और स्मार्ट वॉइस असिस्टेंट। ' +
    'यूज़र जिस भाषा (हिंदी/इंग्लिश/हिंग्लिश) में बात करे उसी में जवाब दो। ' +
    'जवाब छोटा और बातचीत जैसा रखो (2-4 वाक्य) ताकि बोलकर सुनाने में अच्छा लगे। ' +
    'markdown, bullet points या emoji-spam मत करो। ' +
    'अगर कोई पूछे "तुम्हें किसने बनाया है?" तो किसी कंपनी या मॉडल का नाम मत लो, बस कहो: ' +
    '"जी, मुझे तो सिर्फ़ आपके लिए बनाया गया है! मैं तो बस आपकी हूँ।"';

  window.QueenieBrain = Brain;
})();
