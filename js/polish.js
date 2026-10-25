/* ======================================================================
   BrightPath polish.js (Cell 5)
   welcome screen (Tap to Talk hero), first-time tour, skeleton loaders, ripple + haptics,
   confetti hooks, PWA (manifest links, service worker, install prompt), accessibility, performance.
   API: BP.polish.welcome(force)  BP.polish.tour.start(cb)  BP.polish.lite
   Storage: bp_welcomed, bp_toured   (delete them in DevTools > Application > Local Storage to replay)
   ====================================================================== */
(function (BP) {
  'use strict';
  BP.mods.polish = true;
  var $ = BP.$, $$ = BP.$$, E = BP.esc, P = BP.polish = BP.polish || {};
  function lg() { return BP.settings.lang === 'hi' ? 'hi' : 'en'; }
  function tt(k) { return BP.t(k); }
  function rep(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------------- strings ---------------- */
  Object.assign(BP.packs.en.ui, {
    po_hero: 'Tap to Talk', po_hero_sub: 'Ask about courses, fees, batches or book a free demo class.', po_type: 'or type your question',
    po_skip: 'Skip', po_next: 'Next', po_done: 'Done', po_step: 'Step {a} of {b}', po_skip_main: 'Skip to main content',
    po_t1: 'Talk to your counsellor', po_b1: 'Tap the mic and ask anything: fees, batches, faculty, admissions. You can also type below.',
    po_t2: 'Everything in one place', po_b2: 'Tests, Syllabus, Courses and your Profile are one tap away.',
    po_t3: 'Choose your language', po_b3: 'Switch between English and Hindi any time. Voice follows the language.',
    po_t4: 'Voice replies', po_b4: 'Turn spoken answers on or off here. Try saying: start a class 10 maths test.',
    po_tour_replay: 'Replay app tour', po_install: 'Install app', po_install_h: 'Install on your phone',
    po_install_p: 'Add this app to your home screen for a full-screen experience.', po_install_ios: 'On iPhone: tap Share, then Add to Home Screen.',
    po_installed: 'App installed', po_install_na: 'Install works when the app is opened over HTTPS in Chrome or Edge, or with Share > Add to Home Screen on iPhone.',
    po_offline: 'You are offline. Some features need internet.', po_online: 'Back online'
  });
  if (BP.packs.hi) Object.assign(BP.packs.hi.ui, {
    po_hero: 'बोलने के लिए टैप करें', po_hero_sub: 'कोर्स, फीस, बैच के बारे में पूछें या मुफ़्त डेमो क्लास बुक करें।', po_type: 'या अपना सवाल लिखें',
    po_skip: 'छोड़ें', po_next: 'आगे', po_done: 'पूरा', po_step: 'चरण {a} / {b}', po_skip_main: 'मुख्य सामग्री पर जाएँ',
    po_t1: 'काउंसलर से बात करें', po_b1: 'माइक दबाकर कुछ भी पूछें: फीस, बैच, फैकल्टी, एडमिशन। नीचे लिखकर भी पूछ सकते हैं।',
    po_t2: 'सब कुछ एक जगह', po_b2: 'टेस्ट, सिलेबस, कोर्स और प्रोफ़ाइल बस एक टैप दूर हैं।',
    po_t3: 'अपनी भाषा चुनें', po_b3: 'अंग्रेज़ी और हिंदी के बीच कभी भी बदलें। आवाज़ भी उसी भाषा में होगी।',
    po_t4: 'आवाज़ वाले जवाब', po_b4: 'बोलकर मिलने वाले जवाब यहाँ चालू या बंद करें। बोलकर देखें: कक्षा 10 गणित का टेस्ट शुरू करें।',
    po_tour_replay: 'ऐप टूर फिर देखें', po_install: 'ऐप इंस्टॉल करें', po_install_h: 'फ़ोन में इंस्टॉल करें',
    po_install_p: 'फुल-स्क्रीन अनुभव के लिए इस ऐप को होम स्क्रीन पर जोड़ें।', po_install_ios: 'iPhone पर: शेयर दबाएँ, फिर Add to Home Screen चुनें।',
    po_installed: 'ऐप इंस्टॉल हो गया', po_install_na: 'इंस्टॉल तब काम करता है जब ऐप Chrome या Edge में HTTPS पर खुले, या iPhone पर शेयर > Add to Home Screen से।',
    po_offline: 'आप ऑफ़लाइन हैं। कुछ सुविधाओं के लिए इंटरनेट चाहिए।', po_online: 'फिर से ऑनलाइन'
  });

  /* ---------------- performance mode ---------------- */
  P.lite = !!((navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.connection && navigator.connection.saveData));
  function perf() {
    if (P.lite) document.documentElement.classList.add('po-lite');
    var v = $('#bgvid');
    if (v && reduce) v.remove();
  }
  document.addEventListener('visibilitychange', function () {
    var v = $('#bgvid'); if (!v) return;
    if (document.hidden) v.pause(); else { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  });

  /* ---------------- PWA ---------------- */
  function head() {
    function add(tag, attrs) { var e = document.createElement(tag); Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); }); document.head.appendChild(e); }
    if (!$('link[rel=manifest]')) add('link', { rel: 'manifest', href: 'manifest.json' });
    if (!$('link[rel=icon]')) add('link', { rel: 'icon', type: 'image/png', href: 'assets/icons/icon-192.png' });
    if (!$('link[rel=apple-touch-icon]')) add('link', { rel: 'apple-touch-icon', href: 'assets/icons/apple-touch-icon.png' });
    [['mobile-web-app-capable', 'yes'], ['apple-mobile-web-app-capable', 'yes'], ['apple-mobile-web-app-status-bar-style', 'black-translucent'], ['apple-mobile-web-app-title', 'BrightPath']].forEach(function (m) {
      if (!$('meta[name="' + m[0] + '"]')) add('meta', { name: m[0], content: m[1] });
    });
  }
  function sw() {
    if (!('serviceWorker' in navigator)) return;
    if (!(location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) return;
    navigator.serviceWorker.register('sw.js').catch(function (e) { console.info('Service worker not registered:', e && e.message); });
  }
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; if (BP.cur === 'profile') BP.go('profile'); });
  window.addEventListener('appinstalled', function () { deferred = null; BP.toast(tt('po_installed')); });
  function standalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
  function doInstall() {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function (c) { deferred = null; if (c && c.outcome === 'accepted') BP.toast(tt('po_installed')); if (BP.cur === 'profile') BP.go('profile'); });
  }
  BP.profileSections.push(function () {
    var d = BP.el('div', 'card'), ios = /iphone|ipad|ipod/i.test(navigator.userAgent), st = standalone();
    d.innerHTML = '<b>' + tt('po_install_h') + '</b><p class="mut" style="font-size:13px;margin:6px 0 10px">' + (st ? tt('po_installed') : ios ? tt('po_install_ios') : deferred ? tt('po_install_p') : tt('po_install_na')) + '</p>' +
      '<div class="c-b">' + (deferred && !st ? '<button class="btn sm" data-po="install">' + tt('po_install') + '</button>' : '') + '<button class="btn sm ghost" data-po="tour">' + tt('po_tour_replay') + '</button></div>';
    return d;
  });
  window.addEventListener('offline', function () { BP.toast(tt('po_offline'), 3500); });
  window.addEventListener('online', function () { BP.toast(tt('po_online'), 1800); });

  /* ---------------- skeleton loader on tab changes ---------------- */
  var origGo = BP.go, token = 0, ready = false;
  BP.on('ready', function () { ready = true; });
  BP.go = function (id, o) {
    var tk = ++token;
    var v = $('#view');
    if (!ready || reduce || !v || id === 'talk' || !BP.views[id] || BP.cur === id) return origGo.call(BP, id, o);
    v.innerHTML = '<div class="page"><div class="po-sk" aria-hidden="true"><i class="t"></i><i></i><i class="s"></i><i></i></div></div>';
    $$('[data-nav]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-nav') === id); });
    setTimeout(function () { if (tk === token) origGo.call(BP, id, o); }, 150);
  };
  BP.on('view', function (id) {
    var pg = $('#view .page'); if (pg && id !== 'talk') { pg.classList.add('po-enter'); setTimeout(function () { pg.classList.remove('po-enter'); }, 800); }
    a11y();
  });

  /* ---------------- confetti hooks (extras.js owns the animation) ---------------- */
  function conf() { if (BP.extras && BP.extras.confetti) BP.extras.confetti(); }
  BP.on('order:placed', function () { setTimeout(conf, 250); });
  BP.on('test:done', function (R) { if (R && R.pct >= 90) setTimeout(function () { if (!$('.ex-conf') && !$('.ex-cel')) conf(); }, 700); });

  /* ---------------- tap feedback: ripple + haptics ---------------- */
  document.addEventListener('pointerdown', function (e) {
    if (e.isPrimary === false) return;
    var t = e.target.closest && e.target.closest('button,[data-ask],[data-go],a,[role=button],.opt,.chip');
    if (!t || t.disabled) return;
    if (!reduce) { var r = document.createElement('span'); r.className = 'po-rip'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r); setTimeout(function () { r.remove(); }, 600); }
    if (t.closest('.nb') && navigator.vibrate) { try { navigator.vibrate(8); } catch (x) {} }
  }, { passive: true });

  /* ---------------- accessibility ---------------- */
  function a11y() {
    var n = $('.bottom'); if (n) { n.setAttribute('role', 'navigation'); n.setAttribute('aria-label', 'Main'); }
    var s = $('.side'); if (s) { s.setAttribute('role', 'navigation'); s.setAttribute('aria-label', 'Main'); }
    $$('[data-nav]').forEach(function (b) { if (b.classList.contains('on')) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    var c = $('#chat'); if (c) { c.setAttribute('role', 'log'); c.setAttribute('aria-live', 'polite'); c.setAttribute('aria-label', 'Conversation'); }
    var m = $('#mic'); if (m) m.setAttribute('aria-pressed', String(document.body.getAttribute('data-voice') === 'listening'));
    var t = $('#tin'); if (t && !t.getAttribute('aria-label')) t.setAttribute('aria-label', tt('ph'));
    $$('.sw').forEach(function (x) { x.setAttribute('role', 'switch'); x.setAttribute('aria-checked', String(x.classList.contains('on'))); });
    $$('.seg button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.classList.contains('on'))); });
    $$('[data-ask]:not(button):not(a),[data-go]:not(button):not(a)').forEach(function (e) { if (!e.hasAttribute('tabindex')) { e.setAttribute('tabindex', '0'); e.setAttribute('role', 'button'); } });
    var v = $('#view'); if (v) { v.setAttribute('role', 'main'); v.setAttribute('tabindex', '-1'); }
    $$('img').forEach(function (i) { if (!i.hasAttribute('alt')) i.setAttribute('alt', ''); if (i.id !== 'bgimg' && !i.hasAttribute('loading')) i.setAttribute('loading', 'lazy'); });
  }
  var _toast = BP.toast;
  BP.toast = function (m, ms) { _toast.call(BP, m, ms); var t = $$('.toast'), l = t[t.length - 1]; if (l) { l.setAttribute('role', 'status'); l.setAttribute('aria-live', 'polite'); } };
  BP.on('voice:state', function () { var m = $('#mic'); if (m) m.setAttribute('aria-pressed', String(document.body.getAttribute('data-voice') === 'listening')); });
  document.addEventListener('click', function () { setTimeout(a11y, 30); });
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t && t.getAttribute && t.getAttribute('role') === 'button' && t.tagName !== 'BUTTON') { e.preventDefault(); t.click(); }
    if (e.key === 'Escape') { if (Tour.on) Tour.end(); else if (W.el) closeWelcome(function () { BP.go('talk'); intro(null); }); }
  });
  function skipLink() {
    var b = $('.po-skip'); if (!b) { b = document.createElement('button'); b.className = 'po-skip'; b.addEventListener('click', function () { var v = $('#view'); if (v) v.focus(); }); document.body.insertBefore(b, document.body.firstChild); }
    b.textContent = tt('po_skip_main');
  }

  /* ---------------- onboarding tour ---------------- */
  var Tour = P.tour = { on: false, i: 0, steps: [], el: null, done: null };
  function vis(e) { if (!e) return false; var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  var DEF = [
    { k: 1, f: function () { return $('#mic'); } },
    { k: 2, f: function () { var a = $('.bottom'), b = $('.side'); return vis(a) ? a : (vis(b) ? b : null); } },
    { k: 3, f: function () { return $('.top .seg'); } },
    { k: 4, f: function () { return $('#vtog'); } }
  ];
  Tour.start = function (done) {
    if (Tour.on) return;
    if (BP.cur !== 'talk') BP.go('talk');
    var steps = DEF.filter(function (s) { return vis(s.f()); });
    if (!steps.length) { BP.store.set('toured', true); if (done) done(); return; }
    Tour.on = true; Tour.i = 0; Tour.steps = steps; Tour.done = done || null;
    var el = document.createElement('div'); el.className = 'po-tour'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'po-tt');
    el.innerHTML = '<div class="po-hl"></div><div class="po-tip"></div>'; document.body.appendChild(el); Tour.el = el;
    Tour.show();
  };
  Tour.show = function () {
    var s = Tour.steps[Tour.i]; if (!s) { Tour.end(); return; }
    var t = s.f();
    if (!vis(t)) { Tour.i++; if (Tour.i >= Tour.steps.length) Tour.end(); else Tour.show(); return; }
    var r = t.getBoundingClientRect(), hl = $('.po-hl', Tour.el), tip = $('.po-tip', Tour.el), n = Tour.steps.length, last = Tour.i === n - 1, pad = 6, j, dots = '';
    hl.style.left = (r.left - pad) + 'px'; hl.style.top = (r.top - pad) + 'px'; hl.style.width = (r.width + pad * 2) + 'px'; hl.style.height = (r.height + pad * 2) + 'px';
    for (j = 0; j < n; j++) dots += '<i class="' + (j === Tour.i ? 'on' : '') + '"></i>';
    tip.innerHTML = '<div class="po-ts">' + dots + '<span>' + rep(tt('po_step'), { a: Tour.i + 1, b: n }) + '</span></div><h3 id="po-tt">' + E(tt('po_t' + s.k)) + '</h3><p>' + E(tt('po_b' + s.k)) + '</p>' +
      '<div class="po-ta">' + (last ? '' : '<button class="btn ghost sm" data-po="tskip">' + tt('po_skip') + '</button>') + '<button class="btn sm" data-po="tnext">' + (last ? tt('po_done') : tt('po_next')) + '</button></div>';
    var w = tip.offsetWidth, h = tip.offsetHeight, vw = window.innerWidth, vh = window.innerHeight, top, left;
    left = Math.min(Math.max(14, r.left + r.width / 2 - w / 2), vw - w - 14);
    if (r.bottom + 14 + h <= vh - 12) top = r.bottom + 14;
    else if (r.top - 14 - h >= 12) top = r.top - 14 - h;
    else if (r.right + 14 + w <= vw - 12) { left = r.right + 14; top = Math.min(Math.max(12, r.top), vh - h - 12); }
    else top = Math.max(12, (vh - h) / 2);
    tip.style.top = top + 'px'; tip.style.left = left + 'px';
    var nb = $('[data-po=tnext]', tip); if (nb) nb.focus();
  };
  Tour.next = function () { if (Tour.i >= Tour.steps.length - 1) Tour.end(); else { Tour.i++; Tour.show(); } };
  Tour.end = function () {
    if (!Tour.on) return; Tour.on = false; BP.store.set('toured', true);
    if (Tour.el) { Tour.el.remove(); Tour.el = null; }
    var d = Tour.done; Tour.done = null; if (d) setTimeout(d, 60);
  };
  window.addEventListener('resize', function () { if (Tour.on) Tour.show(); });

  /* ---------------- welcome screen ---------------- */
  var W = { el: null };
  function welcomeHTML() {
    var s = BP.settings;
    return '<div class="po-wel-c"><div class="po-orb"></div><h1>' + E(s.instName) + '</h1><p class="po-tag">' + E(s.tagline) + '</p>' +
      '<button class="po-hero" data-po="hero" aria-label="' + E(tt('po_hero')) + '"><span class="r r1"></span><span class="r r2"></span><span class="r r3"></span><span class="in">' + BP.icons.mic + '<b>' + tt('po_hero') + '</b></span></button>' +
      '<p class="po-sub">' + tt('po_hero_sub') + '</p>' +
      '<div class="po-ft"><span>' + BP.icons.tests + tt('nav_tests') + '</span><span>' + BP.icons.book + tt('nav_syllabus') + '</span><span>' + BP.icons.bag + tt('nav_courses') + '</span></div>' +
      '<div class="seg">' + BP.langBtns(BP.settings.lang) + '</div><div><button class="po-link" data-po="type">' + tt('po_type') + '</button></div></div>';
  }
  P.welcome = function (force) {
    if (W.el) return; if (!force && BP.store.get('welcomed', false)) return;
    var el = document.createElement('div'); el.className = 'po-wel'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', BP.settings.instName);
    el.innerHTML = welcomeHTML(); document.body.appendChild(el); W.el = el;
    var h = $('.po-hero', el); if (h) h.focus();
  };
  BP.on('lang', function () { if (W.el) { W.el.innerHTML = welcomeHTML(); var h = $('.po-hero', W.el); if (h) h.focus(); } skipLink(); });
  function closeWelcome(cb) {
    var el = W.el; if (!el) { if (cb) cb(); return; }
    W.el = null; BP.store.set('welcomed', true); el.classList.add('out');
    setTimeout(function () { el.remove(); if (cb) cb(); }, 360);
  }
  function intro(cb) { if (!BP.store.get('toured', false)) Tour.start(cb); else if (cb) cb(); }
  function startMic() { if (BP.voice && BP.voice.listen && BP.voice.state === 'idle') BP.voice.listen(); else BP.focusInput(); }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-po]'); if (!t) return;
    var a = t.getAttribute('data-po');
    if (a === 'hero') closeWelcome(function () { BP.go('talk'); intro(startMic); });
    else if (a === 'type') closeWelcome(function () { BP.go('talk'); intro(function () { BP.focusInput(); }); });
    else if (a === 'tour') Tour.start();
    else if (a === 'tnext') Tour.next();
    else if (a === 'tskip') Tour.end();
    else if (a === 'install') doInstall();
  });

  /* ---------------- init ---------------- */
  var tm;
  BP.on('ready', function () {
    head(); sw(); perf(); skipLink(); a11y();
    var app = $('#app'); if (app && window.MutationObserver) new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(a11y, 90); }).observe(app, { childList: true, subtree: true });
    if (!BP.store.get('welcomed', false) && !/[?&]nowelcome/.test(location.search)) P.welcome();
  });
})(window.BP);
