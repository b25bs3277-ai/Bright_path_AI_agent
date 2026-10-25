/* ======================================================================
   BrightPath courses.js (Cell 3b) - courses store, cart, mock checkout, orders, recommendations.
   Add a course with K(...) inside the COURSE DATA block (see the argument order there).
   API: BP.courses.get(id) price(c) mrp(c) cart() add(id) remove(id) clear() totals(ids,coupon)
        recommend(slots, goals) open(tab, {cat, focus})     tab: store | cart | orders
   Events: 'cart' (cart changed), 'order:placed' (order object)
   Storage: bp_cart (ids), bp_orders (list). Prices follow BP.settings.feeScale and
   BP.settings.coursePrices[id] so the white-label panel (Cell 4) can change them live.
   ====================================================================== */
(function (BP) {
  'use strict';
  BP.mods.courses = true;
  var $ = BP.$, $$ = BP.$$, E = BP.esc, C = BP.courses = BP.courses || {};
  function tt(k) { return BP.t(k); }
  function lg() { return BP.settings.lang === 'hi' ? 'hi' : 'en'; }
  function pk(o) { return o == null ? '' : typeof o === 'string' ? o : (o[lg()] || o.en || ''); }

  /* ---------------- UI strings ---------------- */
  Object.assign(BP.packs.en.ui, {
    cs_title: 'Courses', cs_store: 'Store', cs_cart: 'Cart', cs_orders: 'Orders',
    cs_cat_all: 'All', cs_cat_school: 'School', cs_cat_jee: 'JEE', cs_cat_neet: 'NEET', cs_cat_upsc: 'UPSC', cs_cat_ca: 'CA', cs_cat_skills: 'Skills',
    cs_add: 'Add to cart', cs_buy: 'Buy now', cs_incart: 'Already in your cart', cs_incart_short: 'In cart', cs_added: 'added to cart',
    cs_inc: 'What is included', cs_off: 'off', cs_by: 'Taught by', cs_details: 'Details', cs_empty: 'Your cart is empty', cs_empty_p: 'Add a course to get started.',
    cs_browse: 'Browse courses', cs_remove: 'Remove', cs_coupon: 'Coupon code', cs_apply: 'Apply', cs_coupon_hint: 'Try BRIGHT10 for 10% off or SCHOLAR20 for 20% off',
    cs_coupon_bad: 'This coupon is not valid.', cs_coupon_ok: 'Coupon applied', cs_mrp: 'Total MRP', cs_disc: 'Course discount', cs_cdisc: 'Coupon', cs_total: 'To pay',
    cs_checkout: 'Proceed to checkout', cs_details_h: 'Your details', cs_name: 'Full name', cs_phone: 'Mobile number', cs_email: 'Email (optional)', cs_pay: 'Payment method',
    cs_demo: 'Demo checkout: no real payment is taken. Please do not enter any card or bank details.', cs_pay_btn: 'Pay', cs_proc: 'Processing\u2026',
    cs_e_name: 'Please enter your name.', cs_e_phone: 'Please enter a valid 10-digit mobile number.', cs_e_email: 'Please enter a valid email address.',
    cs_done_h: 'Order placed!', cs_done_p: 'A counsellor will call you shortly to activate your course.', cs_order_id: 'Order ID', cs_no_orders: 'No orders yet.',
    cs_ask: 'Ask the AI counsellor', cs_ask_p: 'Not sure which course fits? Tell the counsellor your class and goal.', cs_ask_q: 'Recommend a course for me',
    cs_inclusive: 'Inclusive of all taxes', cs_back: 'Back to cart', cs_orders_n: 'Orders placed', cs_sub: 'Subtotal', cs_courses: 'courses',
    cs_open_cart: 'Open cart', cs_open_store: 'Open Courses', cs_rec_for: 'Recommended for'
  });
  Object.assign(BP.packs.hi.ui, {
    cs_title: 'कोर्स', cs_store: 'स्टोर', cs_cart: 'कार्ट', cs_orders: 'ऑर्डर',
    cs_cat_all: 'सभी', cs_cat_school: 'स्कूल', cs_cat_jee: 'JEE', cs_cat_neet: 'NEET', cs_cat_upsc: 'UPSC', cs_cat_ca: 'CA', cs_cat_skills: 'स्किल्स',
    cs_add: 'कार्ट में जोड़ें', cs_buy: 'अभी खरीदें', cs_incart: 'पहले से कार्ट में है', cs_incart_short: 'कार्ट में', cs_added: 'कार्ट में जोड़ा गया',
    cs_inc: 'क्या-क्या शामिल है', cs_off: 'छूट', cs_by: 'पढ़ाएँगे', cs_details: 'विवरण', cs_empty: 'आपका कार्ट खाली है', cs_empty_p: 'शुरू करने के लिए कोई कोर्स जोड़ें।',
    cs_browse: 'कोर्स देखें', cs_remove: 'हटाएँ', cs_coupon: 'कूपन कोड', cs_apply: 'लगाएँ', cs_coupon_hint: 'BRIGHT10 से 10% या SCHOLAR20 से 20% छूट पाएँ',
    cs_coupon_bad: 'यह कूपन मान्य नहीं है।', cs_coupon_ok: 'कूपन लागू हुआ', cs_mrp: 'कुल MRP', cs_disc: 'कोर्स छूट', cs_cdisc: 'कूपन', cs_total: 'भुगतान राशि',
    cs_checkout: 'चेकआउट करें', cs_details_h: 'आपकी जानकारी', cs_name: 'पूरा नाम', cs_phone: 'मोबाइल नंबर', cs_email: 'ईमेल (वैकल्पिक)', cs_pay: 'भुगतान का तरीका',
    cs_demo: 'डेमो चेकआउट: कोई असली भुगतान नहीं लिया जाता। कृपया कार्ड या बैंक की जानकारी न भरें।', cs_pay_btn: 'भुगतान करें', cs_proc: 'प्रोसेस हो रहा है\u2026',
    cs_e_name: 'कृपया अपना नाम लिखें।', cs_e_phone: 'कृपया 10 अंकों का सही मोबाइल नंबर लिखें।', cs_e_email: 'कृपया सही ईमेल पता लिखें।',
    cs_done_h: 'ऑर्डर हो गया!', cs_done_p: 'आपका कोर्स चालू करने के लिए काउंसलर जल्द कॉल करेंगे।', cs_order_id: 'ऑर्डर आईडी', cs_no_orders: 'अभी कोई ऑर्डर नहीं।',
    cs_ask: 'AI काउंसलर से पूछें', cs_ask_p: 'कौन सा कोर्स ठीक रहेगा? काउंसलर को अपनी कक्षा और लक्ष्य बताएँ।', cs_ask_q: 'मेरे लिए कोई कोर्स सुझाएँ',
    cs_inclusive: 'सभी कर शामिल', cs_back: 'कार्ट पर वापस', cs_orders_n: 'किए गए ऑर्डर', cs_sub: 'उप-योग', cs_courses: 'कोर्स',
    cs_open_cart: 'कार्ट खोलें', cs_open_store: 'कोर्स खोलें', cs_rec_for: 'सुझाव:'
  });

  /* ---------------- what's included (shared library, {n} is replaced) ---------------- */
  var INC = {
    live: { en: '{n} live classes', hi: '{n} लाइव क्लास' },
    rec: { en: 'Recorded lectures for revision', hi: 'रिवीज़न के लिए रिकॉर्डेड लेक्चर' },
    notes: { en: 'Chapter-wise notes (PDF)', hi: 'अध्यायवार नोट्स (PDF)' },
    tests: { en: '{n} practice tests with analysis', hi: 'विश्लेषण के साथ {n} प्रैक्टिस टेस्ट' },
    mocks: { en: '{n} full-length mock tests', hi: '{n} पूरे मॉक टेस्ट' },
    doubt: { en: 'Daily doubt-clearing support', hi: 'रोज़ डाउट-क्लियरिंग सहायता' },
    ppr: { en: 'Previous year papers with solutions', hi: 'हल सहित पिछले वर्षों के प्रश्न-पत्र' },
    mentor: { en: 'Personal mentor and progress tracking', hi: 'पर्सनल मेंटर और प्रगति ट्रैकिंग' },
    parent: { en: 'Parent app with progress reports', hi: 'प्रगति रिपोर्ट वाला पेरेंट ऐप' },
    cert: { en: 'Course completion certificate', hi: 'कोर्स पूर्णता प्रमाणपत्र' },
    sample: { en: '{n} sample papers', hi: '{n} सैंपल पेपर' },
    ans: { en: 'Answer-writing practice with feedback', hi: 'फीडबैक के साथ उत्तर-लेखन अभ्यास' },
    cur: { en: 'Monthly current affairs magazine', hi: 'मासिक करेंट अफेयर्स पत्रिका' },
    work: { en: 'Activity worksheets and games', hi: 'एक्टिविटी वर्कशीट और गेम' }
  };

  /* ---------------- COURSE DATA ----------------
     K(id, cat, titleEn, titleHi, classes[], exam, stream, price, mrp, durEn, durHi, facultyId, rating, reviews, goals[], includes[[key,n]])
     cat: school | jee | neet | upsc | ca | skills     goals: foundation | board | crash | test | rank
     exam: '' or jee | neet | upsc | ca-f | ca-i | ca-fin     stream: '' or sci | com | arts */
  var LIST = C.list = [];
  function K(id, cat, te, th, cls, exam, stream, price, mrp, de, dh, fac, rating, rv, goals, inc) {
    LIST.push({ id: id, cat: cat, t: { en: te, hi: th }, cls: cls, exam: exam, stream: stream, price: price, mrp: mrp, dur: { en: de, hi: dh }, fac: fac, rating: rating, rv: rv, goals: goals, inc: inc });
  }
  /* school */
  K('c15', 'school', 'Classes 1-5 Smart Start (Maths, English, EVS)', 'कक्षा 1-5 स्मार्ट स्टार्ट (गणित, अंग्रेज़ी, EVS)', [1, 2, 3, 4, 5], '', '', 7999, 11999, '6 months', '6 महीने', 'f5', 4.7, 430, ['foundation'], [['live', 80], ['work'], ['rec'], ['parent'], ['cert']]);
  K('fnd68', 'school', 'Foundation Maths & Science (Classes 6-8)', 'फाउंडेशन गणित और विज्ञान (कक्षा 6-8)', [6, 7, 8], '', '', 9999, 14999, '6 months', '6 महीने', 'f2', 4.6, 640, ['foundation'], [['live', 90], ['rec'], ['notes'], ['tests', 24], ['doubt'], ['parent']]);
  K('c9fnd', 'school', 'Class 9 Foundation Booster', 'कक्षा 9 फाउंडेशन बूस्टर', [9], '', '', 11999, 17999, '8 months', '8 महीने', 'f3', 4.7, 820, ['foundation', 'board'], [['live', 120], ['notes'], ['tests', 30], ['doubt'], ['parent'], ['cert']]);
  K('c10bb', 'school', 'Class 10 Board Booster', 'कक्षा 10 बोर्ड बूस्टर', [10], '', '', 12999, 19999, '5 months', '5 महीने', 'f2', 4.8, 1560, ['board'], [['live', 110], ['notes'], ['ppr'], ['sample', 15], ['tests', 30], ['doubt'], ['mentor']]);
  K('c10mcc', 'school', 'Class 10 Maths Crash Course', 'कक्षा 10 गणित क्रैश कोर्स', [10], '', '', 3999, 6999, '6 weeks', '6 सप्ताह', 'f2', 4.7, 980, ['crash', 'board'], [['live', 36], ['rec'], ['ppr'], ['sample', 10], ['doubt']]);
  K('c10scc', 'school', 'Class 10 Science Crash Course', 'कक्षा 10 विज्ञान क्रैश कोर्स', [10], '', '', 3499, 5999, '6 weeks', '6 सप्ताह', 'f3', 4.6, 710, ['crash', 'board'], [['live', 32], ['rec'], ['ppr'], ['sample', 10], ['doubt']]);
  K('c11sci', 'school', 'Class 11 Science (PCM / PCB) Master Course', 'कक्षा 11 विज्ञान (PCM / PCB) मास्टर कोर्स', [11], '', 'sci', 24999, 34999, '10 months', '10 महीने', 'f1', 4.7, 1120, ['foundation', 'board', 'rank'], [['live', 220], ['notes'], ['tests', 40], ['doubt'], ['mentor'], ['parent']]);
  K('c12sci', 'school', 'Class 12 Science Board Booster', 'कक्षा 12 विज्ञान बोर्ड बूस्टर', [12], '', 'sci', 19999, 28999, '8 months', '8 महीने', 'f1', 4.8, 1390, ['board'], [['live', 180], ['notes'], ['ppr'], ['sample', 20], ['tests', 36], ['doubt'], ['mentor']]);
  K('c1112com', 'school', 'Class 11-12 Commerce Board Pack', 'कक्षा 11-12 वाणिज्य बोर्ड पैक', [11, 12], '', 'com', 14999, 21999, '10 months', '10 महीने', 'f8', 4.6, 540, ['board', 'foundation'], [['live', 160], ['notes'], ['ppr'], ['tests', 30], ['doubt'], ['parent']]);
  K('c1112art', 'school', 'Class 11-12 Arts and Humanities Pack', 'कक्षा 11-12 कला और मानविकी पैक', [11, 12], '', 'arts', 9999, 15999, '10 months', '10 महीने', 'f7', 4.5, 310, ['board', 'foundation'], [['live', 140], ['notes'], ['ppr'], ['ans'], ['doubt']]);
  K('c12cc', 'school', 'Class 12 Board Crash Course (all streams)', 'कक्षा 12 बोर्ड क्रैश कोर्स (सभी स्ट्रीम)', [12], '', '', 5999, 9999, '8 weeks', '8 सप्ताह', 'f1', 4.6, 870, ['crash', 'board'], [['live', 48], ['rec'], ['ppr'], ['sample', 12], ['doubt']]);
  /* JEE */
  K('jeec', 'jee', 'JEE Main + Advanced Complete Course', 'JEE मेन + एडवांस्ड कम्प्लीट कोर्स', [], 'jee', '', 89999, 129999, '2 years', '2 वर्ष', 'f2', 4.8, 2150, ['rank', 'foundation'], [['live', 600], ['notes'], ['tests', 80], ['mocks', 20], ['doubt'], ['mentor'], ['parent']]);
  K('jeecc', 'jee', 'JEE Main Crash Course', 'JEE मेन क्रैश कोर्स', [], 'jee', '', 14999, 24999, '3 months', '3 महीने', 'f1', 4.6, 940, ['crash'], [['live', 90], ['rec'], ['ppr'], ['mocks', 10], ['doubt']]);
  K('jeets', 'jee', 'JEE Test Series (30 full mocks)', 'JEE टेस्ट सीरीज़ (30 पूरे मॉक)', [], 'jee', '', 5999, 9999, '6 months', '6 महीने', 'f2', 4.7, 1260, ['test'], [['mocks', 30], ['doubt'], ['mentor']]);
  /* NEET */
  K('neetc', 'neet', 'NEET Complete Course', 'NEET कम्प्लीट कोर्स', [], 'neet', '', 94999, 139999, '2 years', '2 वर्ष', 'f4', 4.8, 1980, ['rank', 'foundation'], [['live', 640], ['notes'], ['tests', 80], ['mocks', 20], ['doubt'], ['mentor'], ['parent']]);
  K('neetcc', 'neet', 'NEET Crash Course', 'NEET क्रैश कोर्स', [], 'neet', '', 15999, 26999, '3 months', '3 महीने', 'f4', 4.7, 1010, ['crash'], [['live', 96], ['rec'], ['ppr'], ['mocks', 10], ['doubt']]);
  K('neetts', 'neet', 'NEET Test Series (30 full mocks)', 'NEET टेस्ट सीरीज़ (30 पूरे मॉक)', [], 'neet', '', 5999, 9999, '6 months', '6 महीने', 'f3', 4.6, 1090, ['test'], [['mocks', 30], ['doubt'], ['mentor']]);
  /* UPSC */
  K('upscg', 'upsc', 'UPSC Civil Services Foundation (Prelims + Mains)', 'UPSC सिविल सेवा फाउंडेशन (प्रीलिम्स + मेंस)', [], 'upsc', '', 79999, 109999, '12 months', '12 महीने', 'f7', 4.7, 620, ['foundation', 'rank'], [['live', 400], ['notes'], ['cur'], ['ans'], ['tests', 40], ['mentor']]);
  K('upscts', 'upsc', 'UPSC Prelims Test Series', 'UPSC प्रीलिम्स टेस्ट सीरीज़', [], 'upsc', '', 7999, 12999, '4 months', '4 महीने', 'f7', 4.6, 780, ['test'], [['mocks', 20], ['cur'], ['doubt']]);
  K('csat', 'upsc', 'UPSC CSAT Booster', 'UPSC CSAT बूस्टर', [], 'upsc', '', 4999, 7999, '2 months', '2 महीने', 'f2', 4.5, 410, ['crash', 'foundation'], [['live', 40], ['rec'], ['tests', 20], ['doubt']]);
  /* CA */
  K('caf', 'ca', 'CA Foundation Complete Course', 'CA फाउंडेशन कम्प्लीट कोर्स', [], 'ca-f', '', 19999, 29999, '6 months', '6 महीने', 'f6', 4.7, 560, ['foundation'], [['live', 200], ['notes'], ['tests', 20], ['mocks', 4], ['doubt'], ['mentor']]);
  K('cai', 'ca', 'CA Intermediate Group Pack', 'CA इंटरमीडिएट ग्रुप पैक', [], 'ca-i', '', 34999, 49999, '8 months', '8 महीने', 'f6', 4.7, 480, ['foundation'], [['live', 280], ['notes'], ['ppr'], ['tests', 24], ['mocks', 4], ['doubt'], ['mentor']]);
  K('cafin', 'ca', 'CA Final Revision Marathon', 'CA फाइनल रिवीज़न मैराथन', [], 'ca-fin', '', 24999, 36999, '3 months', '3 महीने', 'f6', 4.6, 330, ['crash'], [['live', 120], ['rec'], ['ppr'], ['mocks', 6], ['doubt']]);
  /* skills */
  K('speak', 'skills', 'Spoken English & Confidence', 'स्पोकन इंग्लिश और आत्मविश्वास', [6, 7, 8, 9, 10, 11, 12], '', '', 4999, 7999, '3 months', '3 महीने', 'f5', 4.5, 690, ['foundation'], [['live', 48], ['rec'], ['work'], ['cert']]);

  /* ---------------- helpers: data, price, cart ---------------- */
  var COUPONS = { BRIGHT10: 10, SCHOLAR20: 20 };
  C.get = function (id) { for (var i = 0; i < LIST.length; i++) if (LIST[i].id === id) return LIST[i]; return null; };
  C.price = function (c) { var o = BP.settings.coursePrices && BP.settings.coursePrices[c.id]; return o != null && o !== '' ? +o : Math.round(c.price * (BP.settings.feeScale || 1)); };
  C.mrp = function (c) { return Math.max(C.price(c), Math.round(c.mrp * (BP.settings.feeScale || 1))); };
  C.cart = function () { return BP.store.get('cart', []).filter(function (id) { return C.get(id); }); };
  function orders() { return BP.store.get('orders', []); }
  C.add = function (id, quiet) {
    var c = C.get(id); if (!c) return null;
    var a = BP.store.get('cart', []);
    if (a.indexOf(id) > -1) { if (!quiet) BP.toast(tt('cs_incart'), 1800); return 'dup'; }
    a.push(id); BP.store.set('cart', a); BP.emit('cart');
    if (!quiet) BP.toast(pk(c.t) + ' \u00B7 ' + tt('cs_added'), 1800);
    return 'added';
  };
  C.remove = function (id) { BP.store.set('cart', BP.store.get('cart', []).filter(function (x) { return x !== id; })); BP.emit('cart'); };
  C.clear = function () { BP.store.set('cart', []); BP.emit('cart'); };
  C.totals = function (ids, coupon) {
    var sub = 0, mrp = 0;
    ids.forEach(function (id) { var c = C.get(id); if (c) { sub += C.price(c); mrp += C.mrp(c); } });
    var pct = COUPONS[String(coupon || '').toUpperCase()] || 0, disc = Math.round(sub * pct / 100);
    return { sub: sub, mrp: mrp, save: mrp - sub, pct: pct, disc: disc, total: sub - disc };
  };
  function fac(id) {
    var f = BP.agent.K.faculty.filter(function (x) { return x.id === id; })[0];
    return f || { id: id, name: 'BrightPath Faculty', subject: { en: '', hi: '' } };
  }
  function stars(r) { var f = Math.round(r), s = '', i; for (i = 0; i < 5; i++) s += i < f ? '\u2605' : '\u2606'; return s; }
  function fmtN(n) { return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(n); }
  function incHTML(c) { return '<ul class="dots cs-inc">' + c.inc.map(function (x) { return '<li>' + E(pk(INC[x[0]]).replace('{n}', x[1] || '')) + '</li>'; }).join('') + '</ul>'; }

  /* ---------------- recommendation engine (no AI, simple scoring) ---------------- */
  C.recommend = function (slots, goals) {
    goals = goals || []; if (!slots) return [];
    var out = [];
    LIST.forEach(function (c) {
      var s = 0;
      if (slots.exam) { if (slots.exam === 'ca' ? (c.exam && c.exam.indexOf('ca') === 0) : c.exam === slots.exam) s += 10; }
      else if (slots.cls && c.cls.indexOf(slots.cls) > -1) s += 10;
      if (!s) return;
      if (slots.stream && c.stream && c.stream !== slots.stream) return;
      if (c.cat === 'skills') s -= 5;
      c.goals.forEach(function (g) { if (goals.indexOf(g) > -1) s += 4; });
      if (goals.length && !c.goals.some(function (g) { return goals.indexOf(g) > -1; })) s -= 1;
      out.push({ c: c, s: s + c.rating / 10 });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    return out.slice(0, 3).map(function (x) { return x.c; });
  };

  /* ---------------- styles ---------------- */
  var CSS = '.nb{position:relative}.cbadge{position:absolute;top:3px;right:20%;min-width:17px;height:17px;border-radius:9px;background:var(--orange);color:#fff;font:700 10px Inter,sans-serif;display:grid;place-items:center;padding:0 4px;font-style:normal;box-shadow:0 0 10px rgba(255,122,26,.6)}' +
    '.side .cbadge{top:50%;transform:translateY(-50%);right:14px}' +
    '.cs-tabs{display:flex;gap:8px;margin:2px 0 12px}.cs-tabs button{flex:1;padding:10px 6px;border-radius:14px;font-weight:600;font-size:13.5px;color:var(--mut);background:rgba(255,255,255,.07);border:1px solid var(--gb);transition:.2s}' +
    '.cs-tabs button.on{color:#fff;background:linear-gradient(135deg,rgba(255,122,26,.38),rgba(20,211,196,.2));border-color:rgba(255,255,255,.3);box-shadow:0 0 20px rgba(255,122,26,.2)}' +
    '.cs-chips{display:flex;gap:8px;overflow-x:auto;padding:0 0 10px;scrollbar-width:none}.cs-chips::-webkit-scrollbar{display:none}' +
    '.cs-chip{flex:none;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--gb);font-size:13px;font-weight:500;transition:.2s;white-space:nowrap}.cs-chip:active,.cs-pm:active{transform:scale(.95)}' +
    '.cs-chip.on,.cs-pm.on{background:linear-gradient(135deg,var(--teal),#0fa89c);color:#04201e;border-color:transparent;font-weight:600}' +
    '.cs-pms{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 10px}.cs-pm{padding:9px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--gb);font-size:13px;font-weight:500;transition:.2s}' +
    '.cs-grid{display:grid;grid-template-columns:1fr;gap:12px}' +
    '.cs-c{position:relative;border-radius:18px;padding:14px 14px 14px 17px;background:var(--glass);border:1px solid var(--gb);backdrop-filter:blur(14px);transition:.25s;overflow:hidden}' +
    '.cs-c:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--cc,var(--teal))}' +
    '.cs-c[data-cat=jee]{--cc:#ff7a1a}.cs-c[data-cat=neet]{--cc:#ff5a8a}.cs-c[data-cat=upsc]{--cc:#6aa8ff}.cs-c[data-cat=ca]{--cc:#ffd24a}.cs-c[data-cat=skills]{--cc:#b18cff}' +
    '.cs-c.hl{animation:csHl 1.8s ease-out}@keyframes csHl{0%,60%{box-shadow:0 0 0 2px var(--orange),0 0 30px rgba(255,122,26,.55)}100%{box-shadow:none}}' +
    '.cs-t{display:block;font:600 16px Poppins,"Noto Sans Devanagari",sans-serif;margin:8px 0}' +
    '.cs-rt{font-size:12.5px;color:#ffd24a;white-space:nowrap}.cs-rt small{color:var(--mut)}' +
    '.cs-f{display:flex;align-items:center;gap:10px;margin-bottom:10px}.cs-f img{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--orange);flex:none}.cs-f b{display:block;font-size:13.5px}.cs-f small{color:var(--mut);font-size:12px}' +
    '.cs-p{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:8px}.cs-p b{font:700 22px Poppins,sans-serif;color:var(--orange)}.cs-p s{color:var(--mut);font-size:13px}.cs-p span{color:var(--teal);font-weight:600;font-size:12.5px}' +
    '.cs-more{color:var(--teal);font-weight:600;font-size:13px;padding:4px 0;margin-bottom:6px}.cs-inc{margin:4px 0 10px!important}' +
    '.cs-row{display:flex;gap:10px;align-items:center;padding:10px 0;border-top:1px solid rgba(255,255,255,.08)}.cs-row:first-of-type{border-top:0}.cs-row>div:first-child{flex:1;min-width:0}.cs-row b{display:block;font-size:14px}.cs-row small{color:var(--mut)}' +
    '.cs-x{color:#ff7a7f;font-size:12.5px;font-weight:600;padding:6px}' +
    '.cs-l{display:block;font-size:12px;color:var(--mut);margin:10px 2px 5px;text-transform:uppercase;letter-spacing:.5px}' +
    '.cs-in{width:100%;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.09);border:1px solid var(--gb);outline:0}.cs-in:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(20,211,196,.18)}' +
    '.cs-cp{display:flex;gap:8px;margin:10px 0 4px}.cs-cp .cs-in{flex:1;text-transform:uppercase}' +
    '.cs-note{margin:8px 0;padding:9px 12px;border-radius:12px;background:rgba(255,122,26,.14);border:1px solid rgba(255,122,26,.4);font-size:12.5px}' +
    '.cs-err{color:#ff7a7f;font-size:13px;margin:8px 2px}.cs-ok{color:var(--teal);font-size:13px;margin:6px 2px}' +
    '.cs-done{text-align:center;padding:22px 16px}.cs-tick{width:64px;height:64px;border-radius:50%;margin:0 auto 12px;display:grid;place-items:center;font-size:32px;color:#04201e;background:linear-gradient(135deg,#52f3e4,var(--teal));box-shadow:0 0 40px rgba(20,211,196,.5)}' +
    '.cs-rr{padding:10px 0;border-top:1px solid rgba(255,255,255,.08)}.cs-rr:first-child{border-top:0}.cs-ri b{display:block;font-size:14px}.cs-ri span{font-size:12.5px}.cs-rp{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;flex-wrap:wrap}.cs-rp>b{color:var(--orange);font-size:17px}' +
    '@media(min-width:760px){.cs-grid{grid-template-columns:repeat(2,1fr)}}@media(min-width:1180px){.cs-grid{grid-template-columns:repeat(3,1fr)}}';
  if (!document.getElementById('cs-css')) { var stl = document.createElement('style'); stl.id = 'cs-css'; stl.textContent = CSS; document.head.appendChild(stl); }

  /* ---------------- screen state ---------------- */
  var ST = C.state = { tab: 'store', cat: 'all', open: null, coupon: '', form: { name: '', phone: '', email: '', pay: 'upi' }, err: '', busy: false, last: null, focus: null };
  var CATS = ['all', 'school', 'jee', 'neet', 'upsc', 'ca'];
  var PAYS = [['upi', 'UPI', 'UPI'], ['card', 'Card', 'कार्ड'], ['nb', 'Net banking', 'नेट बैंकिंग'], ['cash', 'Pay at institute', 'संस्था में भुगतान']];
  function payName(k) { var p = PAYS.filter(function (x) { return x[0] === k; })[0]; return p ? (lg() === 'hi' ? p[2] : p[1]) : k; }
  function fmtDate(ts) { return new Date(ts).toLocaleDateString(lg() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

  function tabsHTML() {
    var act = { checkout: 'cart', done: 'orders' }[ST.tab] || ST.tab, n = C.cart().length, o = orders().length;
    return '<div class="cs-tabs">' + [['store', tt('cs_store')], ['cart', tt('cs_cart') + (n ? ' (' + n + ')' : '')], ['orders', tt('cs_orders') + (o ? ' (' + o + ')' : '')]].map(function (x) {
      return '<button class="' + (act === x[0] ? 'on' : '') + '" data-a="tab" data-v="' + x[0] + '">' + E(x[1]) + '</button>';
    }).join('') + '</div>';
  }
  function cardHTML(c) {
    var f = fac(c.fac), p = C.price(c), m = C.mrp(c), off = m > p ? Math.round((m - p) / m * 100) : 0, inCart = C.cart().indexOf(c.id) > -1, open = ST.open === c.id;
    return '<div class="cs-c" data-cid="' + c.id + '" data-cat="' + c.cat + '"><div class="c-h"><span class="pill">' + tt('cs_cat_' + c.cat) + '</span><span class="cs-rt">' + stars(c.rating) + ' ' + c.rating + ' <small>(' + fmtN(c.rv) + ')</small></span></div>' +
      '<b class="cs-t">' + E(pk(c.t)) + '</b><div class="cs-f"><img src="assets/faculty/' + E(f.id) + '.png" alt=""><div><b>' + E(f.name) + '</b><small>' + E(pk(f.subject)) + ' \u00B7 ' + E(pk(c.dur)) + '</small></div></div>' +
      '<div class="cs-p"><b>' + BP.inr(p) + '</b>' + (off ? '<s>' + BP.inr(m) + '</s><span>' + off + '% ' + tt('cs_off') + '</span>' : '') + '</div>' +
      '<button class="cs-more" data-a="inc" data-v="' + c.id + '">' + tt('cs_inc') + ' ' + (open ? '\u25B4' : '\u25BE') + '</button>' + (open ? incHTML(c) : '') +
      '<div class="c-b">' + (inCart ? '<button class="btn sm ghost" data-a="tab" data-v="cart">' + tt('cs_incart_short') + ' \u2713</button>' : '<button class="btn sm ghost" data-a="add" data-v="' + c.id + '">' + tt('cs_add') + '</button>') +
      '<button class="btn sm" data-a="buy" data-v="' + c.id + '">' + tt('cs_buy') + '</button></div></div>';
  }
  function storeHTML() {
    var h = '<div class="cs-chips">' + CATS.map(function (k) { return '<button class="cs-chip' + (ST.cat === k ? ' on' : '') + '" data-a="cat" data-v="' + k + '">' + tt('cs_cat_' + k) + '</button>'; }).join('') + '</div>';
    var list = LIST.filter(function (c) { return ST.cat === 'all' || c.cat === ST.cat || (ST.cat === 'school' && c.cat === 'skills'); });
    h += '<div class="cs-grid">' + list.map(cardHTML).join('') + '</div>';
    h += '<div class="card" style="margin-top:14px"><b>' + tt('cs_ask') + '</b><p class="mut" style="margin:4px 0 10px;font-size:13.5px">' + tt('cs_ask_p') + '</p><button class="btn sm" data-a="askai">' + tt('cs_ask') + '</button></div>';
    return h + '<p class="mut" style="font-size:12px;margin:10px 2px 0">' + tt('cs_inclusive') + '</p>';
  }
  function cartHTML() {
    var ids = C.cart();
    if (!ids.length) return '<div class="card cs-done"><h3>' + tt('cs_empty') + '</h3><p class="mut">' + tt('cs_empty_p') + '</p><button class="btn" data-a="tab" data-v="store">' + tt('cs_browse') + '</button></div>';
    var t = C.totals(ids, ST.coupon), h = '<div class="card">';
    ids.forEach(function (id) {
      var c = C.get(id), f = fac(c.fac);
      h += '<div class="cs-row"><div><b>' + E(pk(c.t)) + '</b><small>' + E(f.name) + ' \u00B7 ' + E(pk(c.dur)) + '</small></div><b style="color:var(--orange)">' + BP.inr(C.price(c)) + '</b><button class="cs-x" data-a="rm" data-v="' + id + '">' + tt('cs_remove') + '</button></div>';
    });
    h += '</div><div class="card"><b>' + tt('cs_coupon') + '</b><div class="cs-cp"><input class="cs-in" id="cs-cp" value="' + E(ST.coupon) + '" maxlength="14" autocomplete="off" placeholder="BRIGHT10"><button class="btn sm" data-a="coupon">' + tt('cs_apply') + '</button></div>' +
      (t.pct ? '<div class="cs-ok">' + tt('cs_coupon_ok') + ': ' + E(ST.coupon) + ' (' + t.pct + '%)</div>' : '<div class="mut" style="font-size:12px;margin:4px 2px">' + tt('cs_coupon_hint') + '</div>') + '</div>';
    var rows = [[tt('cs_mrp'), BP.inr(t.mrp)], [tt('cs_disc'), '\u2212' + BP.inr(t.save)]];
    if (t.disc) rows.push([tt('cs_cdisc') + ' (' + E(ST.coupon) + ')', '\u2212' + BP.inr(t.disc)]);
    rows.push([tt('cs_total'), '<span style="color:var(--orange);font-size:18px">' + BP.inr(t.total) + '</span>']);
    h += '<div class="card">' + BP.kvHTML(rows) + '<div class="c-b"><button class="btn" data-a="checkout">' + tt('cs_checkout') + '</button><button class="btn ghost" data-a="tab" data-v="store">' + tt('cs_browse') + '</button></div></div>';
    return h;
  }
  function checkoutHTML() {
    var ids = C.cart(); if (!ids.length) return cartHTML();
    var t = C.totals(ids, ST.coupon), f = ST.form;
    var h = '<div class="card"><div class="c-h"><b>' + tt('cs_cart') + ' (' + ids.length + ')</b><button class="cs-x" data-a="tab" data-v="cart">' + tt('cs_back') + '</button></div>';
    h += ids.map(function (id) { var c = C.get(id); return '<div class="cs-row"><div><b>' + E(pk(c.t)) + '</b></div><b>' + BP.inr(C.price(c)) + '</b></div>'; }).join('');
    h += '</div><div class="card"><b>' + tt('cs_details_h') + '</b>' +
      '<label class="cs-l" for="cs-name">' + tt('cs_name') + '</label><input class="cs-in" id="cs-name" data-f="name" value="' + E(f.name) + '" autocomplete="name" maxlength="40">' +
      '<label class="cs-l" for="cs-phone">' + tt('cs_phone') + '</label><input class="cs-in" id="cs-phone" data-f="phone" value="' + E(f.phone) + '" inputmode="numeric" maxlength="10" autocomplete="tel">' +
      '<label class="cs-l" for="cs-email">' + tt('cs_email') + '</label><input class="cs-in" id="cs-email" data-f="email" value="' + E(f.email) + '" inputmode="email" autocomplete="email">' +
      '<label class="cs-l">' + tt('cs_pay') + '</label><div class="cs-pms">' + PAYS.map(function (p) { return '<button class="cs-pm' + (f.pay === p[0] ? ' on' : '') + '" data-a="pay" data-v="' + p[0] + '">' + E(payName(p[0])) + '</button>'; }).join('') + '</div>' +
      '<div class="cs-note">' + tt('cs_demo') + '</div>' + (ST.err ? '<div class="cs-err">' + tt(ST.err) + '</div>' : '') +
      '<button class="btn" style="width:100%"' + (ST.busy ? ' disabled style="width:100%;opacity:.7"' : '') + ' data-a="place">' + (ST.busy ? tt('cs_proc') : tt('cs_pay_btn') + ' ' + BP.inr(t.total) + ' (demo)') + '</button></div>';
    return h;
  }
  function orderCard(o) {
    var h = '<div class="card"><div class="c-h"><b>' + E(o.id) + '</b><span class="pill">' + fmtDate(o.ts) + '</span></div>';
    h += o.items.map(function (i) { return '<div class="cs-row"><div><b>' + E(pk({ en: i.t, hi: i.th })) + '</b></div><b>' + BP.inr(i.p) + '</b></div>'; }).join('');
    return h + BP.kvHTML([[tt('cs_pay'), E(payName(o.pay))], [tt('cs_total'), '<span style="color:var(--orange)">' + BP.inr(o.total) + '</span>']]) + '</div>';
  }
  function doneHTML() {
    var o = ST.last; if (!o) return ordersHTML();
    return '<div class="card cs-done"><div class="cs-tick">\u2713</div><h2>' + tt('cs_done_h') + '</h2><p class="mut" style="margin:6px 0 4px">' + tt('cs_done_p') + '</p><p style="margin:0">' + tt('cs_order_id') + ': <b>' + E(o.id) + '</b></p></div>' + orderCard(o) +
      '<div class="c-b"><button class="btn" data-a="tab" data-v="store">' + tt('cs_browse') + '</button><button class="btn ghost" data-a="tab" data-v="orders">' + tt('cs_orders') + '</button></div>';
  }
  function ordersHTML() {
    var os = orders(); if (!os.length) return '<div class="card cs-done"><p class="mut">' + tt('cs_no_orders') + '</p><button class="btn" data-a="tab" data-v="store">' + tt('cs_browse') + '</button></div>';
    return os.map(orderCard).join('');
  }
  function paint(keep) {
    var root = $('#cs-root'); if (!root) return;
    var h = tabsHTML();
    if (ST.tab === 'cart') h += cartHTML(); else if (ST.tab === 'checkout') h += checkoutHTML(); else if (ST.tab === 'done') h += doneHTML(); else if (ST.tab === 'orders') h += ordersHTML(); else h += storeHTML();
    root.innerHTML = h;
    if (ST.focus) { var el = $('[data-cid="' + ST.focus + '"]', root); if (el) { el.classList.add('hl'); el.scrollIntoView({ block: 'center' }); } ST.focus = null; }
    else if (!keep) { var pg = root.closest('.page'); if (pg) pg.scrollTop = 0; }
    badge();
  }

  /* ---------------- checkout (mock) ---------------- */
  function validate() {
    var f = ST.form;
    if (f.name.trim().length < 2) return 'cs_e_name';
    if (!/^[6-9]\d{9}$/.test(f.phone)) return 'cs_e_phone';
    if (f.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) return 'cs_e_email';
    return '';
  }
  function finalize() {
    var ids = C.cart();
    if (!ids.length) { ST.busy = false; ST.tab = 'cart'; paint(); return; }
    var t = C.totals(ids, ST.coupon), f = ST.form;
    var o = { id: 'BP-' + Date.now().toString(36).toUpperCase(), ts: Date.now(), name: f.name.trim(), phone: f.phone, email: f.email.trim(), pay: f.pay, coupon: t.pct ? ST.coupon : '', sub: t.sub, disc: t.disc, total: t.total,
      items: ids.map(function (id) { var c = C.get(id); return { id: id, t: c.t.en, th: c.t.hi, p: C.price(c) }; }) };
    var os = orders(); os.unshift(o); BP.store.set('orders', os.slice(0, 50));
    var leads = BP.store.get('leads', []);
    leads.unshift({ id: 'L' + Date.now().toString(36), ts: o.ts, type: 'purchase', name: o.name, prog: o.items.map(function (i) { return i.t; }).join(', '), progId: 'store', phone: o.phone, batch: '-', status: 'New', source: 'store' });
    BP.store.set('leads', leads);
    C.clear(); ST.busy = false; ST.last = o; ST.tab = 'done'; ST.coupon = '';
    BP.emit('order:placed', o);
    if (BP.cur === 'courses' && $('#cs-root')) paint(); else BP.toast(tt('cs_done_h') + ' ' + o.id);
    if (BP.voice) BP.voice.speak(lg() === 'hi' ? 'ऑर्डर हो गया। काउंसलर जल्द आपको कॉल करेंगे।' : 'Your order is placed. A counsellor will call you shortly.', lg());
  }
  function onInput(e) {
    var t = e.target.closest('[data-f]'); if (!t) return;
    var k = t.getAttribute('data-f');
    if (k === 'phone') { var v = t.value.replace(/\D/g, '').slice(0, 10); if (v !== t.value) t.value = v; }
    ST.form[k] = t.value;
  }
  function onClick(e) {
    var t = e.target.closest('[data-a]'); if (!t) return;
    var a = t.getAttribute('data-a'), v = t.getAttribute('data-v');
    switch (a) {
      case 'tab': ST.tab = v; ST.err = ''; paint(); break;
      case 'cat': ST.cat = v; paint(true); break;
      case 'inc': ST.open = ST.open === v ? null : v; paint(true); break;
      case 'add': C.add(v); paint(true); break;
      case 'buy': C.add(v, true); ST.tab = 'cart'; paint(); break;
      case 'rm': C.remove(v); paint(true); break;
      case 'coupon':
        var cv = ($('#cs-cp') || { value: '' }).value.trim().toUpperCase();
        if (!cv) ST.coupon = ''; else if (COUPONS[cv]) ST.coupon = cv; else { ST.coupon = ''; BP.toast(tt('cs_coupon_bad'), 2200); }
        paint(true); break;
      case 'checkout': if (C.cart().length) { ST.tab = 'checkout'; ST.err = ''; paint(); } break;
      case 'pay': ST.form.pay = v; paint(true); break;
      case 'place':
        if (ST.busy) break;
        ST.err = validate(); if (ST.err) { paint(true); break; }
        ST.busy = true; paint(true); setTimeout(finalize, 1600); break;
      case 'askai': BP.go('talk'); setTimeout(function () { BP.agent.handle(tt('cs_ask_q'), { src: 'tap' }); }, 350); break;
    }
  }
  BP.registerView('courses', function (box) {
    box.innerHTML = '<h2 class="ph">' + tt('cs_title') + '</h2><div id="cs-root"></div>';
    var r = $('#cs-root', box); r.addEventListener('click', onClick); r.addEventListener('input', onInput);
    if (ST.tab === 'done' && !ST.last) ST.tab = 'store';
    paint();
  });
  C.open = function (tab, o) {
    o = o || {}; ST.tab = tab || 'store';
    if (o.cat) ST.cat = o.cat;
    if (o.focus) { ST.focus = o.focus; ST.open = o.focus; ST.cat = 'all'; }
    BP.go('courses');
  };

  /* ---------------- nav badge + profile line ---------------- */
  function badge() {
    var n = C.cart().length;
    $$('[data-nav="courses"]').forEach(function (b) {
      var x = $('.cbadge', b);
      if (!n) { if (x) x.remove(); return; }
      if (!x) { x = document.createElement('i'); x.className = 'cbadge'; b.appendChild(x); }
      x.textContent = n;
    });
  }
  BP.on('view', badge); BP.on('cart', badge); BP.on('lang', function () { setTimeout(badge, 50); });
  BP.profileSections.push(function () {
    var d = BP.el('div', 'card');
    d.innerHTML = '<div class="row"><span>' + tt('cs_orders_n') + '</span><b>' + orders().length + '</b></div><div class="c-b"><button class="btn sm ghost" data-ccart="orders">' + tt('cs_orders') + '</button></div>';
    return d;
  });

  /* ---------------- chat cards + buttons ---------------- */
  BP.registerCard('course-rec', function (d) {
    return '<div class="card cd">' + d.ids.map(function (id) {
      var c = C.get(id); if (!c) return '';
      return '<div class="cs-rr"><div class="cs-ri"><b>' + E(pk(c.t)) + '</b><span class="mut">' + E(pk(c.dur)) + ' \u00B7 \u2605 ' + c.rating + '</span></div><div class="cs-rp"><b>' + BP.inr(C.price(c)) + '</b><div class="c-b"><button class="btn sm" data-cadd="' + id + '">' + tt('cs_add') + '</button><button class="btn sm ghost" data-cview="' + id + '">' + tt('cs_details') + '</button></div></div></div>';
    }).join('') + '<div class="c-b" style="margin-top:8px"><button class="btn sm ghost" data-ccart="cart">' + tt('cs_open_cart') + '</button></div></div>';
  });
  BP.registerCard('cart-sum', function () {
    var ids = C.cart(); if (!ids.length) return '';
    var t = C.totals(ids, ST.coupon);
    return '<div class="card cd">' + ids.map(function (id) { var c = C.get(id); return '<div class="cs-row"><div><b>' + E(pk(c.t)) + '</b></div><b>' + BP.inr(C.price(c)) + '</b></div>'; }).join('') +
      BP.kvHTML([[tt('cs_total'), '<span style="color:var(--orange)">' + BP.inr(t.total) + '</span>']]) + '<div class="c-b"><button class="btn sm" data-ccart="cart">' + tt('cs_checkout') + '</button></div></div>';
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-cadd],[data-cview],[data-ccart]'); if (!t) return;
    if (t.hasAttribute('data-cadd')) { var r = C.add(t.getAttribute('data-cadd')); if (r) { t.textContent = tt('cs_incart_short') + ' \u2713'; t.classList.add('ghost'); } }
    else if (t.hasAttribute('data-cview')) C.open('store', { focus: t.getAttribute('data-cview') });
    else C.open(t.getAttribute('data-ccart') || 'cart');
  });

  /* ---------------- voice / chat intent ---------------- */
  var GOALS = { board: ['board', 'boards', 'cbse', 'icse'], crash: ['crash', 'revision', 'last minute', 'quick'], test: ['test series', 'mock', 'mocks', 'practice'], foundation: ['foundation', 'basics', 'basic', 'concepts', 'strong base'], rank: ['rank', 'topper', 'advanced', 'complete'] };
  function goalsOf(n) { var U = BP.agent.util, g = []; Object.keys(GOALS).forEach(function (k) { if (U.hasAny(n, GOALS[k])) g.push(k); }); return g; }
  function exLabel(s) {
    var tn = BP.tests && BP.tests.examName;
    if (s.exam) return s.exam === 'ca' ? 'CA' : (tn ? tn(s.exam) : s.exam);
    return tn ? tn('c' + s.cls) : 'Class ' + s.cls;
  }
  function hCourses(m) {
    var A = BP.agent, T = A.T, U = A.util, n = m.n, inr = BP.inr;
    function nm(c) { return c.t[A.lang] || c.t.en; }
    var storeCard = { type: 'go', view: 'courses', label: T('Open Courses', 'कोर्स खोलें') };
    /* add the last recommended course */
    if (U.hasAny(n, ['add to cart', 'add it', 'add this', 'add it to cart', 'buy it', 'buy this', 'कार्ट में डालो', 'कार्ट में जोड़ो']) && C.lastRec && C.lastRec.length) {
      var c0 = C.get(C.lastRec[0]), r0 = C.add(C.lastRec[0], true), ids0 = C.cart(), t0 = C.totals(ids0, '');
      var s0 = r0 === 'dup' ? T(nm(c0) + ' is already in your cart.', nm(c0) + ' पहले से आपके कार्ट में है।') : T('Added ' + nm(c0) + ' to your cart. Cart total is ' + inr(t0.total) + '.', nm(c0) + ' कार्ट में जोड़ दिया। कार्ट का कुल ' + inr(t0.total) + ' है।');
      return { text: s0, speak: s0, card: { type: 'cart-sum' }, chips: T(['Open cart', 'Fees for Class 10'], ['कार्ट खोलें', 'कक्षा 10 की फीस']) };
    }
    if (U.hasAny(n, ['cart', 'checkout', 'check out', 'कार्ट'])) {
      var ids = C.cart();
      if (!ids.length) { var te = T('Your cart is empty. Tell me your class or exam and I will recommend a course.', 'आपका कार्ट खाली है। अपनी कक्षा या परीक्षा बताइए, मैं कोर्स सुझाऊँगा।'); return { text: te, speak: te, card: storeCard, chips: T(['Recommend a course for Class 10 boards', 'Recommend a JEE course'], ['कक्षा 10 बोर्ड के लिए कोर्स सुझाएँ', 'JEE का कोर्स सुझाएँ']) }; }
      var tc = C.totals(ids, ''), tx = T('You have ' + ids.length + ' course' + (ids.length > 1 ? 's' : '') + ' in your cart, total ' + inr(tc.total) + '. Tap checkout to enrol.', 'आपके कार्ट में ' + ids.length + ' कोर्स हैं, कुल ' + inr(tc.total) + '। एनरोल करने के लिए चेकआउट दबाएँ।');
      return { text: tx, speak: tx, card: { type: 'cart-sum' } };
    }
    var s = m.slots.any ? m.slots : A.ctx.slots;
    if (m.slots.stream && !m.slots.cls && !m.slots.exam && A.ctx.slots && A.ctx.slots.cls > 10) s = { cls: A.ctx.slots.cls, stream: m.slots.stream, any: true };
    var ask = U.hasAny(n, ['recommend', 'recommendation', 'suggest', 'suggestion', 'best', 'which', 'should', 'सुझाव', 'सुझाएँ', 'सुझाइए']);
    var hasSlot = s && (s.exam || s.cls);
    if (!hasSlot) {
      if (!ask) { var tb = T('Here are our latest courses with prices, faculty and what is included. Tell me your class and goal for a recommendation.', 'ये हमारे नए कोर्स हैं, कीमत, फैकल्टी और शामिल सुविधाओं के साथ। सुझाव के लिए अपनी कक्षा और लक्ष्य बताइए।'); return { text: tb, speak: tb, card: storeCard, chips: T(['Recommend a course for Class 10 boards', 'Recommend a JEE course', 'Recommend a NEET course'], ['कक्षा 10 बोर्ड के लिए कोर्स सुझाएँ', 'JEE का कोर्स सुझाएँ', 'NEET का कोर्स सुझाएँ']) }; }
      A.ctx.pending = 'courses';
      var tq = T('Sure. Which class or exam is it for, and what is your goal: boards, crash course, test series or complete preparation?', 'ज़रूर। यह किस कक्षा या परीक्षा के लिए है, और लक्ष्य क्या है: बोर्ड, क्रैश कोर्स, टेस्ट सीरीज़ या पूरी तैयारी?');
      return { text: tq, speak: tq, chips: T(['Class 10 boards', 'Class 12 Science boards', 'JEE crash course', 'NEET complete course', 'UPSC test series', 'CA Foundation'], ['कक्षा 10 बोर्ड', 'कक्षा 12 विज्ञान बोर्ड', 'JEE क्रैश कोर्स', 'NEET कम्प्लीट कोर्स', 'UPSC टेस्ट सीरीज़', 'CA फाउंडेशन']) };
    }
    if (m.slots.any) A.ctx.slots = s;
    A.ctx.pending = null;
    var rec = C.recommend(s, goalsOf(n)), lab = exLabel(s);
    if (!rec.length) { var tn2 = T('I do not have a course for ' + lab + ' yet. A staff member can suggest the best option.', lab + ' के लिए अभी कोई कोर्स नहीं है। स्टाफ सदस्य सबसे अच्छा विकल्प बता सकते हैं।'); return { text: tn2, speak: tn2, card: storeCard }; }
    C.lastRec = rec.map(function (c) { return c.id; });
    var top = rec[0], f = fac(top.fac);
    var tr = T('For ' + lab + ', I recommend ' + nm(top) + ' at ' + inr(C.price(top)) + ', taught by ' + f.name + '.' + (rec[1] ? ' You could also consider ' + nm(rec[1]) + '.' : '') + ' Tap Add to cart to buy.',
      lab + ' के लिए मैं ' + nm(top) + ' सुझाऊँगा, कीमत ' + inr(C.price(top)) + ', पढ़ाएँगे ' + f.name + '।' + (rec[1] ? ' ' + nm(rec[1]) + ' भी देख सकते हैं।' : '') + ' खरीदने के लिए कार्ट में जोड़ें दबाएँ।');
    return { text: tr, speak: tr, card: { type: 'course-rec', ids: C.lastRec }, chips: T(['Add it to cart', 'Show my cart', 'Fees for ' + lab, 'Book a demo class'], ['कार्ट में डालो', 'मेरा कार्ट दिखाएँ', lab + ' की फीस', 'डेमो क्लास बुक करें']) };
  }
  if (BP.agent && BP.agent.registerIntent) {
    BP.agent.registerIntent({ id: 'courses', pri: 0.6, handler: hCourses,
      kw: ['buy', 'purchase', 'cart', 'checkout', 'add to cart', 'add it to cart', 'recommend', 'recommendation', 'suggest', 'new courses', 'course store', 'which course', 'best course', 'course for', 'crash course', 'test series', 'online course', 'enroll in course', 'show courses',
        '\u0916\u0930\u0940\u0926\u0947\u0902', '\u0916\u0930\u0940\u0926\u0928\u093E', '\u0915\u093E\u0930\u094D\u091F', '\u0938\u0941\u091D\u093E\u0935', '\u0938\u0941\u091D\u093E\u090F\u0901', '\u0915\u094D\u0930\u0948\u0936 \u0915\u094B\u0930\u094D\u0938', '\u091F\u0947\u0938\u094D\u091F \u0938\u0940\u0930\u0940\u091C\u093C'] });
  }
})(window.BP);
