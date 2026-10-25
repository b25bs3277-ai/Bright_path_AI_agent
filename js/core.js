/* ======================================================================
   BrightPath core.js — namespace, helpers, storage, settings, i18n, theme,
   shell, navigation, chat UI, card renderers, toast, profile screen.
   PUBLIC API for later modules:
     BP.registerView(id, fn(box,opts))   BP.registerCard(type, fn(data)->html)
     BP.registerLang(code, pack)         BP.on / BP.emit
     BP.go(id)  BP.say(res)  BP.toast(msg)  BP.store.get/set/del
   ====================================================================== */
window.BP = window.BP || {};
(function (BP) {
  'use strict';
  BP.mods = BP.mods || {}; BP.mods.core = true;
  BP.version = '1.0';

  /* ---------- tiny helpers ---------- */
  BP.$ = function (s, r) { return (r || document).querySelector(s); };
  BP.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  BP.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  BP.el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  BP.inr = function (n) { return '\u20B9' + Number(n).toLocaleString('en-IN'); };
  BP.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var _h = {};
  BP.on = function (e, f) { (_h[e] = _h[e] || []).push(f); };
  BP.emit = function (e, d) { (_h[e] || []).forEach(function (f) { try { f(d); } catch (x) { console.error(x); } }); };

  /* ---------- storage (localStorage, prefixed bp_) ---------- */
  BP.store = {
    get: function (k, d) { try { var v = localStorage.getItem('bp_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('bp_' + k, JSON.stringify(v)); } catch (e) {} return v; },
    del: function (k) { try { localStorage.removeItem('bp_' + k); } catch (e) {} }
  };

  /* ---------- settings (white-label ready) ---------- */
  BP.defaults = {
    instName: 'BrightPath Coaching Institute', logoText: 'BrightPath',
    tagline: 'Learn smarter. Rank higher.',
    phone: '+91 98765 43210', email: 'hello@brightpath.example',
    address: 'BrightPath Tower, 3rd Floor, Knowledge Park, Near Metro Station',
    hours: 'Mon-Sat 8:00 AM - 8:00 PM, Sunday 10:00 AM - 2:00 PM',
    lang: 'en', voiceOn: true, fees: {}, feeScale: 1,
    theme: { navy: '#0a1330', orange: '#ff7a1a', teal: '#14d3c4' }
  };
  BP.settings = Object.assign({}, BP.defaults, BP.store.get('settings', {}));
  BP.saveSettings = function () { BP.store.set('settings', BP.settings); BP.applyTheme(); BP.emit('settings', BP.settings); };
  BP.applyTheme = function () {
    var t = BP.settings.theme || BP.defaults.theme, r = document.documentElement.style;
    r.setProperty('--navy', t.navy); r.setProperty('--orange', t.orange); r.setProperty('--teal', t.teal);
    var m = BP.$('meta[name=theme-color]'); if (m) m.setAttribute('content', t.navy);
  };

  /* ---------- i18n: language-pack structure (add more languages with BP.registerLang) ---------- */
  BP.packs = {};
  BP.registerLang = function (code, pack) { BP.packs[code] = pack; };
  BP.lang = function () { return BP.settings.lang; };
  BP.t = function (k) {
    var p = BP.packs[BP.settings.lang] || BP.packs.en, v = p && p.ui[k];
    if (v == null && BP.packs.en) v = BP.packs.en.ui[k];
    return v == null ? k : v;
  };
  BP.setLang = function (code) {
    if (!BP.packs[code]) return;
    BP.settings.lang = code; BP.saveSettings(); document.documentElement.lang = code;
    if (BP.voice) BP.voice.cancelSpeak();
    BP.chat.chips = [];
    BP.render(); BP.emit('lang', code);
  };

  /* ---------- icons ---------- */
  function svg(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  BP.svg = svg;
  BP.icons = {
    mic: svg('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>'),
    tests: svg('<path d="M9 2h6v3H9z"/><path d="M15 4h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3"/><path d="m9 14 2 2 4-4"/>'),
    book: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>'),
    bag: svg('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
    user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    send: svg('<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>'),
    spk: svg('<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>'),
    spkOff: svg('<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    cal: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    phone: svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
    mail: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'),
    pin: svg('<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'),
    clock: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>')
  };

  /* ---------- language packs: English + Hindi (more can be added later) ---------- */
  BP.registerLang('en', {
    code: 'en', name: 'English', short: 'EN', speech: 'en-IN',
    ui: {
      nav_talk: 'Talk', nav_tests: 'Tests', nav_syllabus: 'Syllabus', nav_courses: 'Courses', nav_profile: 'Profile',
      tap_talk: 'Tap to talk', listening: 'Listening\u2026', speaking: 'Speaking\u2026 tap to stop',
      ph: 'Type your question\u2026', unsupported_stt: 'Voice input is not supported in this browser. Please type, or open in Chrome.',
      mic_denied: 'Microphone permission is blocked. Please allow it in your browser settings.',
      no_speech: "I didn't hear anything. Tap the mic and try again.",
      voice_on: 'Voice replies on', voice_off: 'Voice replies off',
      welcome_h: 'Your AI admissions counsellor', welcome_p: 'Ask about courses, fees, batches, faculty, or book a free demo class.',
      c_duration: 'Duration', c_install: 'Installments', c_early: 'Early-bird price', c_schol: 'Scholarship',
      c_book: 'Book demo', c_batches: 'Batch timings', c_morning: 'Morning', c_evening: 'Evening', c_weekend: 'Weekend',
      c_exp: 'yrs experience', c_name: 'Name', c_class: 'Class / Exam', c_phone: 'Phone', c_batch: 'Batch',
      c_call: 'Call', c_email: 'Email', c_addr: 'Address', c_hours: 'Hours', c_fee: 'Fee', c_open: 'Open',
      q_demo: 'Book a demo class for', q_batch: 'Batch timings for', q_fees: 'Fees for',
      p_title: 'Profile & Settings', p_lang: 'Language', p_voice: 'Voice replies', p_leads: 'Enquiries saved',
      p_callbacks: 'Callback requests', p_reset: 'Clear demo data', p_reset_q: 'Clear all saved enquiries and callbacks?',
      soon_t: 'Coming in the next update', soon_p: 'This section is being added. Everything else is already live.',
      t_tests: 'Tests & Ranking', t_syllabus: 'Syllabus Explorer', t_courses: 'Courses'
    }
  });
  BP.registerLang('hi', {
    code: 'hi', name: '\u0939\u093F\u0928\u094D\u0926\u0940', short: '\u0939\u093F', speech: 'hi-IN',
    ui: {
      nav_talk: '\u092C\u093E\u0924 \u0915\u0930\u0947\u0902', nav_tests: '\u091F\u0947\u0938\u094D\u091F', nav_syllabus: '\u0938\u093F\u0932\u0947\u092C\u0938', nav_courses: '\u0915\u094B\u0930\u094D\u0938', nav_profile: '\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932',
      tap_talk: '\u092C\u094B\u0932\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u091F\u0948\u092A \u0915\u0930\u0947\u0902', listening: '\u0938\u0941\u0928 \u0930\u0939\u093E \u0939\u0942\u0901\u2026', speaking: '\u092C\u094B\u0932 \u0930\u0939\u093E \u0939\u0942\u0901\u2026 \u0930\u094B\u0915\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u091F\u0948\u092A \u0915\u0930\u0947\u0902',
      ph: '\u0905\u092A\u0928\u093E \u0938\u0935\u093E\u0932 \u0932\u093F\u0916\u0947\u0902\u2026', unsupported_stt: '\u0907\u0938 \u092C\u094D\u0930\u093E\u0909\u091C\u093C\u0930 \u092E\u0947\u0902 \u0935\u0949\u0907\u0938 \u0907\u0928\u092A\u0941\u091F \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u091F\u093E\u0907\u092A \u0915\u0930\u0947\u0902 \u092F\u093E Chrome \u092E\u0947\u0902 \u0916\u094B\u0932\u0947\u0902\u0964',
      mic_denied: '\u092E\u093E\u0907\u0915\u094D\u0930\u094B\u092B\u093C\u094B\u0928 \u0915\u0940 \u0905\u0928\u0941\u092E\u0924\u093F \u092C\u0902\u0926 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u092C\u094D\u0930\u093E\u0909\u091C\u093C\u0930 \u0938\u0947\u091F\u093F\u0902\u0917 \u092E\u0947\u0902 \u0905\u0928\u0941\u092E\u0924\u093F \u0926\u0947\u0902\u0964',
      no_speech: '\u0915\u0941\u091B \u0938\u0941\u0928\u093E\u0908 \u0928\u0939\u0940\u0902 \u0926\u093F\u092F\u093E\u0964 \u092E\u093E\u0907\u0915 \u0926\u092C\u093E\u0915\u0930 \u092B\u093F\u0930 \u092C\u094B\u0932\u0947\u0902\u0964',
      voice_on: '\u0906\u0935\u093E\u091C\u093C \u0935\u093E\u0932\u0947 \u091C\u0935\u093E\u092C \u091A\u093E\u0932\u0942', voice_off: '\u0906\u0935\u093E\u091C\u093C \u0935\u093E\u0932\u0947 \u091C\u0935\u093E\u092C \u092C\u0902\u0926',
      welcome_h: '\u0906\u092A\u0915\u093E AI \u090F\u0921\u092E\u093F\u0936\u0928 \u0915\u093E\u0909\u0902\u0938\u0932\u0930', welcome_p: '\u0915\u094B\u0930\u094D\u0938, \u092B\u0940\u0938, \u092C\u0948\u091A, \u092B\u0948\u0915\u0932\u094D\u091F\u0940 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u092A\u0942\u091B\u0947\u0902 \u092F\u093E \u092E\u0941\u092B\u094D\u0924 \u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902\u0964',
      c_duration: '\u0905\u0935\u0927\u093F', c_install: '\u0915\u093F\u0938\u094D\u0924\u0947\u0902', c_early: '\u0905\u0930\u094D\u0932\u0940-\u092C\u0930\u094D\u0921 \u092E\u0942\u0932\u094D\u092F', c_schol: '\u0938\u094D\u0915\u0949\u0932\u0930\u0936\u093F\u092A',
      c_book: '\u0921\u0947\u092E\u094B \u092C\u0941\u0915 \u0915\u0930\u0947\u0902', c_batches: '\u092C\u0948\u091A \u091F\u093E\u0907\u092E\u093F\u0902\u0917', c_morning: '\u0938\u0941\u092C\u0939', c_evening: '\u0936\u093E\u092E', c_weekend: '\u0935\u0940\u0915\u0947\u0902\u0921',
      c_exp: '\u0935\u0930\u094D\u0937 \u0905\u0928\u0941\u092D\u0935', c_name: '\u0928\u093E\u092E', c_class: '\u0915\u0915\u094D\u0937\u093E / \u092A\u0930\u0940\u0915\u094D\u0937\u093E', c_phone: '\u092B\u094B\u0928', c_batch: '\u092C\u0948\u091A',
      c_call: '\u0915\u0949\u0932', c_email: '\u0908\u092E\u0947\u0932', c_addr: '\u092A\u0924\u093E', c_hours: '\u0938\u092E\u092F', c_fee: '\u092B\u0940\u0938', c_open: '\u0916\u094B\u0932\u0947\u0902',
      q_demo: '\u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902', q_batch: '\u092C\u0948\u091A \u091F\u093E\u0907\u092E\u093F\u0902\u0917', q_fees: '\u092B\u0940\u0938',
      p_title: '\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932 \u0914\u0930 \u0938\u0947\u091F\u093F\u0902\u0917', p_lang: '\u092D\u093E\u0937\u093E', p_voice: '\u0906\u0935\u093E\u091C\u093C \u0935\u093E\u0932\u0947 \u091C\u0935\u093E\u092C', p_leads: '\u0938\u0939\u0947\u091C\u0940 \u0917\u0908 \u091C\u093E\u0928\u0915\u093E\u0930\u093F\u092F\u093E\u0901',
      p_callbacks: '\u0915\u0949\u0932\u092C\u0948\u0915 \u0905\u0928\u0941\u0930\u094B\u0927', p_reset: '\u0921\u0947\u092E\u094B \u0921\u0947\u091F\u093E \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902', p_reset_q: '\u0938\u092D\u0940 \u0938\u0939\u0947\u091C\u0940 \u0917\u0908 \u091C\u093E\u0928\u0915\u093E\u0930\u093F\u092F\u093E\u0901 \u0914\u0930 \u0915\u0949\u0932\u092C\u0948\u0915 \u0939\u091F\u093E\u090F\u0901?',
      soon_t: '\u0905\u0917\u0932\u0947 \u0905\u092A\u0921\u0947\u091F \u092E\u0947\u0902 \u0906 \u0930\u0939\u093E \u0939\u0948', soon_p: '\u092F\u0939 \u0938\u0947\u0915\u094D\u0936\u0928 \u091C\u094B\u0921\u093C\u093E \u091C\u093E \u0930\u0939\u093E \u0939\u0948\u0964 \u092C\u093E\u0915\u0940 \u0938\u092C \u0915\u0941\u091B \u092A\u0939\u0932\u0947 \u0938\u0947 \u091A\u093E\u0932\u0942 \u0939\u0948\u0964',
      t_tests: '\u091F\u0947\u0938\u094D\u091F \u0914\u0930 \u0930\u0948\u0902\u0915\u093F\u0902\u0917', t_syllabus: '\u0938\u093F\u0932\u0947\u092C\u0938 \u090F\u0915\u094D\u0938\u092A\u094D\u0932\u094B\u0930\u0930', t_courses: '\u0915\u094B\u0930\u094D\u0938'
    }
  });

  /* ---------- toast ---------- */
  BP.toast = function (msg, ms) {
    var t = BP.el('div', 'toast'); t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = 0; t.style.transition = 'opacity .3s'; setTimeout(function () { t.remove(); }, 320); }, ms || 3200);
  };

  /* ---------- background video with image fallback ---------- */
  BP.bg = {
    init: function () {
      var v = BP.$('#bgvid'); if (!v) return;
      var list = (BP.config && BP.config.videos) || [], i = 0;
      var save = navigator.connection && navigator.connection.saveData;
      if (!list.length || save) { v.remove(); return; }
      v.muted = true; v.setAttribute('muted', '');
      function next() { if (i >= list.length) { v.remove(); return; } v.src = list[i++]; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      v.addEventListener('error', next);
      v.addEventListener('playing', function () { v.classList.add('on'); });
      next();
    }
  };

  /* ---------- views registry & navigation ---------- */
  BP.views = {};
  BP.registerView = function (id, fn) { BP.views[id] = fn; };
  BP.navItems = [
    { id: 'talk', ic: 'mic', k: 'nav_talk' }, { id: 'tests', ic: 'tests', k: 'nav_tests' },
    { id: 'syllabus', ic: 'book', k: 'nav_syllabus' }, { id: 'courses', ic: 'bag', k: 'nav_courses' },
    { id: 'profile', ic: 'user', k: 'nav_profile' }
  ];
  function navHTML() { return BP.navItems.map(function (n) { return '<button class="nb" data-nav="' + n.id + '">' + BP.icons[n.ic] + '<span>' + BP.t(n.k) + '</span></button>'; }).join(''); }
  function langBtns(cur) { return Object.keys(BP.packs).map(function (c) { return '<button data-l="' + c + '" class="' + (c === cur ? 'on' : '') + '">' + BP.packs[c].short + '</button>'; }).join(''); }
  BP.langBtns = langBtns;
  function logo() { var s = BP.settings; return '<div class="logo"><span class="mark">' + BP.esc((s.logoText || 'B').charAt(0).toUpperCase()) + '</span><div><b>' + BP.esc(s.logoText) + '</b><small>' + BP.esc(s.tagline) + '</small></div></div>'; }

  BP.buildShell = function () {
    var s = BP.settings;
    BP.$('#app').innerHTML =
      '<div class="shell"><aside class="side glass">' + logo() + '<nav class="sidenav">' + navHTML() + '</nav>' +
      '<div class="side-foot"><div class="seg">' + langBtns(s.lang) + '</div><p>' + BP.esc(s.instName) + '</p></div></aside>' +
      '<main class="main"><header class="top">' + logo() + '<div class="sp"></div><div class="seg">' + langBtns(s.lang) + '</div>' +
      '<button class="ib' + (s.voiceOn ? '' : ' off') + '" id="vtog" aria-label="Voice replies">' + (s.voiceOn ? BP.icons.spk : BP.icons.spkOff) + '</button></header>' +
      '<section id="view" class="view"></section></main>' +
      '<nav class="bottom glass">' + navHTML() + '</nav></div>';
  };
  BP.go = function (id, o) {
    if (!BP.views[id]) id = 'talk';
    BP.cur = id;
    try { if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id); } catch (e) {}
    BP.$$('[data-nav]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-nav') === id); });
    var v = BP.$('#view'); if (!v) return; v.innerHTML = '';
    var pg = BP.el('div', 'page' + (id === 'talk' ? ' nopad' : '')); v.appendChild(pg);
    BP.chat.mounted = false;
    try { BP.views[id](pg, o || {}); } catch (e) { console.error(e); pg.innerHTML = '<div class="card">Sorry, this screen could not load.</div>'; }
    BP.emit('view', id);
  };
  BP.render = function () { BP.buildShell(); BP.go(BP.cur || 'talk'); };

  /* ---------- placeholder for screens added by later cells ---------- */
  BP.placeholder = function (box, key, ic) {
    box.innerHTML = '<h2 class="ph">' + BP.t(key) + '</h2><div class="card" style="text-align:center;padding:34px 18px"><div class="mark" style="margin:0 auto 14px;width:56px;height:56px">' + BP.icons[ic] + '</div><h3>' + BP.t('soon_t') + '</h3><p class="mut">' + BP.t('soon_p') + '</p></div>';
  };
  BP.views.tests = function (b) { BP.placeholder(b, 't_tests', 'tests'); };
  BP.views.syllabus = function (b) { BP.placeholder(b, 't_syllabus', 'book'); };
  BP.views.courses = function (b) { BP.placeholder(b, 't_courses', 'bag'); };

  /* ---------- CARD RENDERERS (agent replies can attach {card:{type:...}}) ---------- */
  BP.cardTypes = {};
  BP.registerCard = function (t, f) { BP.cardTypes[t] = f; };
  BP.renderCard = function (c) { var f = c && BP.cardTypes[c.type]; try { return f ? f(c) : ''; } catch (e) { console.error(e); return ''; } };
  function kv(rows) { return '<ul class="kv">' + rows.map(function (r) { return '<li><span>' + BP.esc(r[0]) + '</span><b>' + r[1] + '</b></li>'; }).join('') + '</ul>'; }
  BP.kvHTML = kv;
  var R = BP.registerCard, E = BP.esc;

  R('fee', function (d) {
    var A = BP.agent, g = BP.settings.lang, p = A.prog(d.id), i = A.feeInfo(p), nm = A.pick(p.name, g);
    return '<div class="card cd"><div class="c-h"><b>' + E(nm) + '</b><span class="pill">' + E(A.pick(p.dur, g)) + '</span></div><div class="big">' + BP.inr(i.total) + '</div>' +
      kv([[BP.t('c_install'), i.n + ' \u00D7 ' + BP.inr(i.each)], [BP.t('c_early'), BP.inr(i.after) + ' (\u2212' + i.early + '%)'], [BP.t('c_schol'), E(A.pick(A.schol(p), g))]]) +
      '<div class="c-b"><button class="btn sm" data-ask="' + E(BP.t('q_demo') + ' ' + nm) + '">' + BP.t('c_book') + '</button><button class="btn sm ghost" data-ask="' + E(BP.t('q_batch') + ' ' + nm) + '">' + BP.t('c_batches') + '</button></div></div>';
  });
  R('feelist', function (d) {
    var A = BP.agent, g = BP.settings.lang;
    return '<div class="card cd">' + d.ids.map(function (id) {
      var p = A.prog(id), i = A.feeInfo(p), nm = A.pick(p.name, g);
      return '<div class="bt" data-ask="' + E(BP.t('q_fees') + ' ' + nm) + '" style="cursor:pointer"><div><b>' + E(nm) + '</b><span>' + i.n + ' \u00D7 ' + BP.inr(i.each) + '</span></div><div class="sp"></div><b style="color:var(--orange)">' + BP.inr(i.total) + '</b></div>';
    }).join('') + '</div>';
  });
  R('batch', function (d) {
    var A = BP.agent, g = BP.settings.lang, s = A.K.sched[d.sk];
    var rows = [['sun', 'c_morning', s.morning], ['moon', 'c_evening', s.evening], ['cal', 'c_weekend', s.weekend]];
    return '<div class="card cd"><b>' + E(d.title || '') + '</b>' + rows.map(function (r) { return '<div class="bt"><div class="ic">' + BP.icons[r[0]] + '</div><div><b>' + BP.t(r[1]) + '</b><span>' + E(r[2]) + '</span></div></div>'; }).join('') +
      '<div class="c-b" style="margin-top:8px"><button class="btn sm" data-ask="' + E(BP.t('q_demo') + ' ' + (d.title || '')) + '">' + BP.t('c_book') + '</button></div></div>';
  });
  R('faculty', function (d) {
    var A = BP.agent, g = BP.settings.lang;
    return '<div class="card cd"><div class="fac">' + d.ids.map(function (id) {
      var f = A.K.faculty.filter(function (x) { return x.id === id; })[0];
      return '<div class="ft"><img src="assets/faculty/' + f.id + '.png" alt="' + E(f.name) + '"><b>' + E(f.name) + '</b><span>' + E(A.pick(f.subject, g)) + '</span><small>' + f.exp + ' ' + BP.t('c_exp') + '</small></div>';
    }).join('') + '</div></div>';
  });
  R('steps', function (d) { return '<div class="card cd"><b>' + E(d.title) + '</b><ol class="steps">' + d.items.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ol></div>'; });
  R('list', function (d) { return '<div class="card cd"><b>' + E(d.title) + '</b><ul class="dots">' + d.items.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul></div>'; });
  R('contact', function () {
    var s = BP.settings, maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(s.address);
    function row(ic, k, v) { return '<div class="bt"><div class="ic">' + BP.icons[ic] + '</div><div><b>' + BP.t(k) + '</b><span>' + v + '</span></div></div>'; }
    return '<div class="card cd"><b>' + E(s.instName) + '</b>' + row('phone', 'c_call', '<a class="link" href="tel:' + E(s.phone.replace(/\s/g, '')) + '">' + E(s.phone) + '</a>') +
      row('mail', 'c_email', '<a class="link" href="mailto:' + E(s.email) + '">' + E(s.email) + '</a>') +
      row('pin', 'c_addr', '<a class="link" target="_blank" rel="noopener" href="' + maps + '">' + E(s.address) + '</a>') + row('clock', 'c_hours', E(s.hours)) + '</div>';
  });
  R('results', function (d) {
    var A = BP.agent, g = BP.settings.lang, K = A.K.results;
    return '<div class="card cd"><div class="stats" style="flex-wrap:wrap">' + K.stats.map(function (s) { return '<div style="min-width:42%"><b>' + E(s.v) + '</b><span>' + E(A.pick(s.l, g)) + '</span></div>'; }).join('') + '</div>' +
      '<ul class="kv" style="margin-top:10px">' + K.toppers.map(function (t) { return '<li><span>' + E(t.n) + '</span><b>' + E(A.pick(t.e, g)) + '</b></li>'; }).join('') + '</ul></div>';
  });
  R('programs', function () {
    var A = BP.agent, g = BP.settings.lang;
    return '<div class="card cd">' + A.K.groups.map(function (gr) {
      return '<div style="margin:6px 0"><b style="font-size:13px;color:var(--teal)">' + E(A.pick(gr.t, g)) + '</b><div class="c-b" style="margin-top:6px">' +
        gr.items.map(function (id) { var p = A.prog(id); return '<button class="chip" data-ask="' + E(BP.t('q_fees') + ' ' + A.pick(p.name, g)) + '">' + E(A.pick(p.name, g)) + '</button>'; }).join('') + '</div></div>';
    }).join('') + '</div>';
  });
  R('confirm', function (d) {
    var A = BP.agent, g = BP.settings.lang, x = d.data, bn = { morning: BP.t('c_morning'), evening: BP.t('c_evening'), weekend: BP.t('c_weekend') };
    return '<div class="card cd"><b>' + E(d.title) + '</b>' + kv([[BP.t('c_name'), E(x.name)], [BP.t('c_class'), E(A.pick(A.prog(x.prog).name, g))], [BP.t('c_phone'), E(x.phone)], [BP.t('c_batch'), E(bn[x.batch] || x.batch)]]) +
      '<div class="c-b"><button class="btn sm" data-ask="' + E(d.yes) + '">' + E(d.yes) + '</button><button class="btn sm ghost" data-ask="' + E(d.no) + '">' + E(d.no) + '</button></div></div>';
  });
  R('go', function (d) { return '<div class="card cd"><button class="btn" data-go="' + E(d.view) + '">' + E(d.label) + '</button></div>'; });

  /* ---------- CHAT UI ---------- */
  var C = BP.chat = { log: [], mounted: false, chips: [] };
  function fmt(t) { return BP.esc(t).replace(/\n/g, '<br>'); }
  C.scroll = function () { var b = BP.$('#chat'); if (b) b.scrollTo({ top: b.scrollHeight, behavior: 'smooth' }); };
  C.append = function (e) {
    var box = BP.$('#chat'); if (!box) return;
    var m = BP.el('div', 'msg ' + e.role);
    var html = e.res.text ? '<div class="bub">' + fmt(e.res.text) + '</div>' : '';
    if (e.res.card) html += '<div class="cardwrap">' + BP.renderCard(e.res.card) + '</div>';
    m.innerHTML = html; box.appendChild(m); C.scroll();
  };
  C.add = function (role, res) { var e = { role: role, res: res }; C.log.push(e); if (C.mounted) C.append(e); };
  C.typing = function (on) {
    var box = BP.$('#chat'); if (!box) return; var t = BP.$('#typ');
    if (on && !t) { t = BP.el('div', 'msg agent', '<div class="bub typing"><i></i><i></i><i></i></div>'); t.id = 'typ'; box.appendChild(t); C.scroll(); }
    if (!on && t) t.remove();
  };
  C.setChips = function (arr) {
    C.chips = arr || []; var c = BP.$('#chips'); if (!c) return;
    c.innerHTML = C.chips.map(function (x) { return '<button class="chip" data-ask="' + BP.esc(x) + '">' + BP.esc(x) + '</button>'; }).join('');
  };
  C.mount = function () {
    C.mounted = true;
    var box = BP.$('#chat');
    box.innerHTML = '<div class="welcome"><div class="orb"></div><h2>' + BP.esc(BP.settings.instName) + '</h2><p><b style="color:var(--teal)">' + BP.t('welcome_h') + '</b><br>' + BP.t('welcome_p') + '</p></div>';
    C.log.forEach(C.append);
    var tin = BP.$('#tin');
    BP.$('#tform').addEventListener('submit', function (e) { e.preventDefault(); var v = tin.value.trim(); if (!v) return; tin.value = ''; BP.agent.handle(v, { src: 'text' }); });
    BP.$('#mic').addEventListener('click', function () { BP.voice.toggle(); });
    if (BP.voice) { BP.voice.setState(BP.voice.state === 'idle' ? 'idle' : BP.voice.state); if (!BP.voice.stt) { var n = BP.el('div', 'note', BP.t('unsupported_stt')); box.parentNode.insertBefore(n, BP.$('#chips')); } }
    if (!C.log.length && BP.agent) BP.agent.greet(); else C.setChips(C.chips.length ? C.chips : (BP.agent ? BP.agent.defaultChips() : []));
    C.scroll();
  };
  BP.views.talk = function (box) {
    box.innerHTML = '<div class="talk"><div class="chat" id="chat"></div><div class="chips" id="chips"></div><div class="dock"><div class="caption" id="caption"></div>' +
      '<button class="mic" id="mic" aria-label="Talk"><span class="ring"></span><span class="ring r2"></span><span class="micicon">' + BP.icons.mic + '</span><span class="bars"><i></i><i></i><i></i><i></i><i></i></span></button>' +
      '<div class="mlabel" id="micLabel">' + BP.t('tap_talk') + '</div>' +
      '<form class="tbox" id="tform"><input id="tin" autocomplete="off" placeholder="' + BP.esc(BP.t('ph')) + '"><button type="submit" aria-label="Send">' + BP.icons.send + '</button></form></div></div>';
    C.mount();
  };
  BP.focusInput = function () { var i = BP.$('#tin'); if (i) i.focus(); };

  /* say(res): show typing, add agent message, show chips, speak the short "speak" text */
  BP.say = function (res, o) {
    o = o || {}; C.typing(true);
    setTimeout(function () {
      C.typing(false); C.add('agent', res);
      C.setChips(res.chips && res.chips.length ? res.chips : BP.agent.defaultChips());
      if (res.speak && o.speak !== false && BP.voice) BP.voice.speak(res.speak, o.lang || BP.settings.lang);
    }, o.delay == null ? 420 : o.delay);
  };

  /* ---------- profile screen (other modules add sections via BP.profileSections.push(fn -> element)) ---------- */
  BP.profileSections = [];
  BP.views.profile = function (box) {
    var s = BP.settings, leads = BP.store.get('leads', []), cbs = BP.store.get('callbacks', []);
    box.innerHTML = '<h2 class="ph">' + BP.t('p_title') + '</h2>' +
      '<div class="card"><div class="row"><span>' + BP.t('p_lang') + '</span><div class="seg">' + langBtns(s.lang) + '</div></div>' +
      '<div class="row"><span>' + BP.t('p_voice') + '</span><button class="sw' + (s.voiceOn ? ' on' : '') + '" id="pv" aria-label="Voice replies"><i></i></button></div></div>' +
      '<div class="card"><div class="stats"><div><b>' + leads.length + '</b><span>' + BP.t('p_leads') + '</span></div><div><b>' + cbs.length + '</b><span>' + BP.t('p_callbacks') + '</span></div></div></div>' +
      '<div class="card"><h3>' + E(s.instName) + '</h3><p class="mut" style="margin:4px 0 8px">' + E(s.tagline) + '</p>' + BP.renderCard({ type: 'contact' }).replace('<div class="card cd"><b>' + E(s.instName) + '</b>', '<div>').replace(/<\/div>$/, '</div>') + '</div>' +
      '<div id="psx"></div><button class="btn ghost" id="pr">' + BP.t('p_reset') + '</button>';
    BP.$('#pv').onclick = function () { BP.toggleVoice(); this.classList.toggle('on', BP.settings.voiceOn); };
    BP.$('#pr').onclick = function () { if (confirm(BP.t('p_reset_q'))) { BP.store.del('leads'); BP.store.del('callbacks'); BP.go('profile'); } };
    BP.profileSections.forEach(function (fn) { try { var e = fn(); if (e) BP.$('#psx').appendChild(e); } catch (x) { console.error(x); } });
  };
  BP.toggleVoice = function () {
    BP.settings.voiceOn = !BP.settings.voiceOn; BP.saveSettings();
    if (!BP.settings.voiceOn && BP.voice) BP.voice.cancelSpeak();
    var b = BP.$('#vtog'); if (b) { b.classList.toggle('off', !BP.settings.voiceOn); b.innerHTML = BP.settings.voiceOn ? BP.icons.spk : BP.icons.spkOff; }
    BP.toast(BP.t(BP.settings.voiceOn ? 'voice_on' : 'voice_off'), 1600);
  };

  /* ---------- global click handling (delegated, bound once) ---------- */
  var bound = false;
  function bindGlobal() {
    if (bound) return; bound = true;
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-ask]'); if (t) { BP.agent.handle(t.getAttribute('data-ask'), { src: 'tap' }); return; }
      t = e.target.closest('[data-go]'); if (t) { BP.go(t.getAttribute('data-go')); return; }
      t = e.target.closest('[data-nav]'); if (t) { BP.go(t.getAttribute('data-nav')); return; }
      t = e.target.closest('[data-l]'); if (t) { BP.setLang(t.getAttribute('data-l')); return; }
      if (e.target.closest('#vtog')) BP.toggleVoice();
    });
    window.addEventListener('hashchange', function () { var id = location.hash.slice(1); if (id && id !== BP.cur) BP.go(id); });
  }

  /* ---------- boot ---------- */
  BP.boot = function () {
    BP.applyTheme(); document.documentElement.lang = BP.settings.lang;
    BP.bg.init(); bindGlobal(); BP.buildShell();
    BP.go(location.hash.slice(1) || 'talk');
    BP.emit('ready');
  };
})(window.BP);
