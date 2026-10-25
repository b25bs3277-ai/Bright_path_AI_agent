/* ======================================================================
   BrightPath agent.js — knowledge base + rule-based intent engine + lead flow.
   NO LLM, NO API. Answers ONLY from BP.kb; unknown questions become saved
   callback requests; off-topic questions are politely redirected.
   Later modules add skills with BP.agent.registerIntent({id, kw:[...], pri, handler(m)})
   where m = {text, n, toks, slots, lang} and handler returns
   {text, speak, card, chips}.  Re-registering an id replaces it.
   ====================================================================== */
(function (BP) {
  'use strict';
  BP.mods.agent = true;
  var A = BP.agent = { ctx: { slots: null, last: null, pending: null }, intents: [], lang: 'en' };
  function T(en, hi) { return A.lang === 'hi' ? (hi == null ? en : hi) : en; }
  A.T = T;
  A.pick = function (o, g) { if (o == null) return ''; if (typeof o === 'string') return o; return o[g || A.lang] || o.en || ''; };
  var inr = BP.inr;

  /* ================= KNOWLEDGE BASE (edit freely, keep the shapes) ================= */
  var STREAM_EN = { sci: 'Science', com: 'Commerce', arts: 'Arts' };
  var STREAM_HI = { sci: '\u0935\u093F\u091C\u094D\u091E\u093E\u0928', com: '\u0935\u093E\u0923\u093F\u091C\u094D\u092F', arts: '\u0915\u0932\u093E' };
  var SCHED = {
    junior: { morning: '8:00 AM - 10:00 AM', evening: '4:00 PM - 6:00 PM', weekend: 'Sat-Sun, 10:00 AM - 1:00 PM' },
    middle: { morning: '7:30 AM - 10:00 AM', evening: '4:30 PM - 7:00 PM', weekend: 'Sat-Sun, 10:00 AM - 2:00 PM' },
    senior: { morning: '7:00 AM - 10:30 AM', evening: '4:30 PM - 8:00 PM', weekend: 'Sat-Sun, 9:00 AM - 3:00 PM' },
    comp: { morning: '6:30 AM - 10:30 AM', evening: '4:00 PM - 8:00 PM', weekend: 'Sat-Sun, 9:00 AM - 4:00 PM' },
    prof: { morning: '7:00 AM - 10:00 AM', evening: '6:00 PM - 9:00 PM', weekend: 'Sat-Sun, 9:00 AM - 5:00 PM' }
  };
  var progs = [];
  function addProg(id, en, hi, group, fee, sk, tags, dur, early) { progs.push({ id: id, name: { en: en, hi: hi }, group: group, fee: fee, sk: sk, tags: tags, dur: dur, early: early }); }
  var D1 = { en: '1 academic year', hi: '1 \u0936\u0948\u0915\u094D\u0937\u0923\u093F\u0915 \u0935\u0930\u094D\u0937' };
  var CF = { 1: 16000, 2: 16000, 3: 18000, 4: 18000, 5: 20000, 6: 24000, 7: 24000, 8: 28000, 9: 36000, 10: 42000 };
  for (var n = 1; n <= 10; n++) addProg('c' + n, 'Class ' + n, '\u0915\u0915\u094D\u0937\u093E ' + n, n <= 5 ? 'junior' : n <= 8 ? 'middle' : 'secondary', CF[n], n <= 5 ? 'junior' : n <= 8 ? 'middle' : 'senior', { cls: n }, D1, 10);
  var SF = { sci: { 11: 58000, 12: 62000 }, com: { 11: 48000, 12: 50000 }, arts: { 11: 40000, 12: 42000 } };
  [11, 12].forEach(function (c) {
    ['sci', 'com', 'arts'].forEach(function (s) {
      addProg('c' + c + '-' + s, 'Class ' + c + ' ' + STREAM_EN[s], '\u0915\u0915\u094D\u0937\u093E ' + c + ' (' + STREAM_HI[s] + ')', 'sr-' + s, SF[s][c], 'senior', { cls: c, stream: s }, D1, 10);
    });
  });
  addProg('jee', 'JEE (Main + Advanced)', 'JEE (\u092E\u0947\u0928 + \u090F\u0921\u0935\u093E\u0902\u0938\u094D\u0921)', 'jee', 125000, 'comp', { exam: 'jee' }, { en: '2 years (1-year dropper batch available)', hi: '2 \u0935\u0930\u094D\u0937 (1 \u0935\u0930\u094D\u0937 \u0915\u093E \u0921\u094D\u0930\u0949\u092A\u0930 \u092C\u0948\u091A \u0909\u092A\u0932\u092C\u094D\u0927)' }, 8);
  addProg('neet', 'NEET (UG)', 'NEET (UG)', 'neet', 130000, 'comp', { exam: 'neet' }, { en: '2 years (1-year dropper batch available)', hi: '2 \u0935\u0930\u094D\u0937 (1 \u0935\u0930\u094D\u0937 \u0915\u093E \u0921\u094D\u0930\u0949\u092A\u0930 \u092C\u0948\u091A \u0909\u092A\u0932\u092C\u094D\u0927)' }, 8);
  addProg('upsc', 'UPSC Civil Services', 'UPSC \u0938\u093F\u0935\u093F\u0932 \u0938\u0947\u0935\u093E', 'upsc', 95000, 'prof', { exam: 'upsc' }, { en: '12 months', hi: '12 \u092E\u0939\u0940\u0928\u0947' }, 8);
  addProg('ca-f', 'CA Foundation', 'CA \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928', 'ca', 28000, 'prof', { exam: 'ca-f' }, { en: '6 months', hi: '6 \u092E\u0939\u0940\u0928\u0947' }, 8);
  addProg('ca-i', 'CA Intermediate', 'CA \u0907\u0902\u091F\u0930\u092E\u0940\u0921\u093F\u090F\u091F', 'ca', 42000, 'prof', { exam: 'ca-i' }, { en: '8 months', hi: '8 \u092E\u0939\u0940\u0928\u0947' }, 8);
  addProg('ca-fin', 'CA Final', 'CA \u092B\u093E\u0907\u0928\u0932', 'ca', 48000, 'prof', { exam: 'ca-fin' }, { en: '8 months', hi: '8 \u092E\u0939\u0940\u0928\u0947' }, 8);

  var K = A.K = BP.kb = {
    sched: SCHED, programs: progs,
    groups: [
      { t: { en: 'Classes 1-5', hi: '\u0915\u0915\u094D\u0937\u093E 1-5' }, items: ['c1', 'c2', 'c3', 'c4', 'c5'] },
      { t: { en: 'Classes 6-10', hi: '\u0915\u0915\u094D\u0937\u093E 6-10' }, items: ['c6', 'c7', 'c8', 'c9', 'c10'] },
      { t: { en: 'Class 11-12 Science', hi: '\u0915\u0915\u094D\u0937\u093E 11-12 \u0935\u093F\u091C\u094D\u091E\u093E\u0928' }, items: ['c11-sci', 'c12-sci'] },
      { t: { en: 'Class 11-12 Commerce', hi: '\u0915\u0915\u094D\u0937\u093E 11-12 \u0935\u093E\u0923\u093F\u091C\u094D\u092F' }, items: ['c11-com', 'c12-com'] },
      { t: { en: 'Class 11-12 Arts', hi: '\u0915\u0915\u094D\u0937\u093E 11-12 \u0915\u0932\u093E' }, items: ['c11-arts', 'c12-arts'] },
      { t: { en: 'Competitive & Professional', hi: '\u092A\u094D\u0930\u0924\u093F\u092F\u094B\u0917\u0940 \u0914\u0930 \u092A\u094D\u0930\u094B\u092B\u0947\u0936\u0928\u0932' }, items: ['jee', 'neet', 'upsc', 'ca-f', 'ca-i', 'ca-fin'] }
    ],
    faculty: [
      { id: 'f1', name: 'Dr. Meera Iyer', g: 'F', exp: 15, subject: { en: 'Physics', hi: '\u092D\u094C\u0924\u093F\u0915\u0940' }, groups: ['sr-sci', 'jee', 'neet'], kw: ['physics', 'phy', '\u092D\u094C\u0924\u093F\u0915\u0940', '\u092B\u093F\u091C\u093C\u093F\u0915\u094D\u0938', '\u092B\u093F\u091C\u093F\u0915\u094D\u0938'] },
      { id: 'f2', name: 'Rajesh Khanna', g: 'M', exp: 18, subject: { en: 'Mathematics', hi: '\u0917\u0923\u093F\u0924' }, groups: ['middle', 'secondary', 'sr-sci', 'sr-com', 'jee'], kw: ['maths', 'math', 'mathematics', '\u0917\u0923\u093F\u0924', '\u092E\u0948\u0925\u094D\u0938'] },
      { id: 'f3', name: 'Prof. Anita Deshmukh', g: 'F', exp: 14, subject: { en: 'Chemistry', hi: '\u0930\u0938\u093E\u092F\u0928 \u0935\u093F\u091C\u094D\u091E\u093E\u0928' }, groups: ['secondary', 'sr-sci', 'jee', 'neet'], kw: ['chemistry', 'chem', '\u0930\u0938\u093E\u092F\u0928', '\u0915\u0947\u092E\u093F\u0938\u094D\u091F\u094D\u0930\u0940'] },
      { id: 'f4', name: 'Dr. Sandeep Verma', g: 'M', exp: 12, subject: { en: 'Biology', hi: '\u091C\u0940\u0935 \u0935\u093F\u091C\u094D\u091E\u093E\u0928' }, groups: ['sr-sci', 'neet'], kw: ['biology', 'bio', '\u091C\u0940\u0935', '\u092C\u093E\u092F\u094B\u0932\u0949\u091C\u0940'] },
      { id: 'f5', name: 'Neha Kapoor', g: 'F', exp: 9, subject: { en: 'English & Hindi', hi: '\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940 \u0914\u0930 \u0939\u093F\u0902\u0926\u0940' }, groups: ['junior', 'middle', 'secondary', 'sr-arts'], kw: ['english', 'hindi', 'evs', '\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940', '\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u0940', '\u0939\u093F\u0902\u0926\u0940'] },
      { id: 'f6', name: 'CA Rohit Mehra', g: 'M', exp: 12, subject: { en: 'Accounts & Taxation', hi: '\u0932\u0947\u0916\u093E \u0914\u0930 \u0915\u0930' }, groups: ['ca', 'sr-com'], kw: ['accounts', 'accountancy', 'taxation', 'audit', 'ca', '\u0932\u0947\u0916\u093E'] },
      { id: 'f7', name: 'Vikram Singh Rathore', g: 'M', exp: 11, subject: { en: 'UPSC GS & Polity', hi: 'UPSC \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0905\u0927\u094D\u092F\u092F\u0928 \u0914\u0930 \u0930\u093E\u091C\u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E' }, groups: ['upsc', 'sr-arts', 'secondary'], kw: ['upsc', 'polity', 'gs', 'history', 'geography', 'social'] },
      { id: 'f8', name: 'Sunita Bansal', g: 'F', exp: 13, subject: { en: 'Economics & Business Studies', hi: '\u0905\u0930\u094D\u0925\u0936\u093E\u0938\u094D\u0924\u094D\u0930 \u0914\u0930 \u092C\u093F\u091C\u093C\u0928\u0947\u0938 \u0938\u094D\u091F\u0921\u0940\u091C\u093C' }, groups: ['sr-com', 'sr-arts'], kw: ['economics', 'business', 'commerce', '\u0905\u0930\u094D\u0925\u0936\u093E\u0938\u094D\u0924\u094D\u0930'] }
    ],
    admission: [
      { en: 'Free counselling or a demo class', hi: '\u092E\u0941\u092B\u094D\u0924 \u0915\u093E\u0909\u0902\u0938\u0932\u093F\u0902\u0917 \u092F\u093E \u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938' },
      { en: 'Fill the registration form', hi: '\u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0947\u0936\u0928 \u092B\u0949\u0930\u094D\u092E \u092D\u0930\u0947\u0902' },
      { en: 'Optional BrightPath Scholarship Test', hi: '\u0935\u0948\u0915\u0932\u094D\u092A\u093F\u0915 \u092C\u094D\u0930\u093E\u0907\u091F\u092A\u093E\u0925 \u0938\u094D\u0915\u0949\u0932\u0930\u0936\u093F\u092A \u091F\u0947\u0938\u094D\u091F' },
      { en: 'Pay the fee in full or in installments', hi: '\u092A\u0942\u0930\u0940 \u092B\u0940\u0938 \u092F\u093E \u0915\u093F\u0938\u094D\u0924\u094B\u0902 \u092E\u0947\u0902 \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0930\u0947\u0902' },
      { en: 'Batch allotment and orientation', hi: '\u092C\u0948\u091A \u0906\u0935\u0902\u091F\u0928 \u0914\u0930 \u0911\u0930\u093F\u090F\u0902\u091F\u0947\u0936\u0928' }
    ],
    docs: [
      { en: 'Last class marksheet or report card', hi: '\u092A\u093F\u091B\u0932\u0940 \u0915\u0915\u094D\u0937\u093E \u0915\u0940 \u092E\u093E\u0930\u094D\u0915\u0936\u0940\u091F' },
      { en: 'Aadhaar card or other photo ID', hi: '\u0906\u0927\u093E\u0930 \u0915\u093E\u0930\u094D\u0921 \u092F\u093E \u0905\u0928\u094D\u092F \u092B\u094B\u091F\u094B \u0906\u0908\u0921\u0940' },
      { en: '2 passport-size photographs', hi: '2 \u092A\u093E\u0938\u092A\u094B\u0930\u094D\u091F \u0938\u093E\u0907\u091C\u093C \u092B\u094B\u091F\u094B' },
      { en: 'Address proof', hi: '\u092A\u0924\u0947 \u0915\u093E \u092A\u094D\u0930\u092E\u093E\u0923' },
      { en: 'Birth certificate (classes 1-5)', hi: '\u091C\u0928\u094D\u092E \u092A\u094D\u0930\u092E\u093E\u0923 \u092A\u0924\u094D\u0930 (\u0915\u0915\u094D\u0937\u093E 1-5)' },
      { en: 'Transfer certificate, if changing school', hi: '\u0938\u094D\u0915\u0942\u0932 \u092C\u0926\u0932\u0928\u0947 \u092A\u0930 \u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930 \u0938\u0930\u094D\u091F\u093F\u092B\u093F\u0915\u0947\u091F' },
      { en: 'CA: 10+2 marksheet and CA registration proof. UPSC: graduation proof', hi: 'CA: 12\u0935\u0940\u0902 \u0915\u0940 \u092E\u093E\u0930\u094D\u0915\u0936\u0940\u091F \u0914\u0930 CA \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0947\u0936\u0928\u0964 UPSC: \u0938\u094D\u0928\u093E\u0924\u0915 \u0915\u093E \u092A\u094D\u0930\u092E\u093E\u0923' }
    ],
    results: {
      stats: [
        { v: '12', l: { en: 'JEE Main 99+ percentile', hi: 'JEE Main 99+ \u092A\u0930\u094D\u0938\u0947\u0902\u091F\u093E\u0907\u0932' } },
        { v: '41', l: { en: 'NEET 600+ scorers', hi: 'NEET 600+ \u0938\u094D\u0915\u094B\u0930\u0930' } },
        { v: '91%', l: { en: 'Class 10 board average', hi: '10\u0935\u0940\u0902 \u092C\u094B\u0930\u094D\u0921 \u0914\u0938\u0924' } },
        { v: '78%', l: { en: 'CA Foundation pass rate', hi: 'CA \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u092A\u093E\u0938 \u0926\u0930' } }
      ],
      toppers: [
        { n: 'Aarav Sharma', e: { en: 'JEE Main, 99.8 percentile', hi: 'JEE Main, 99.8 \u092A\u0930\u094D\u0938\u0947\u0902\u091F\u093E\u0907\u0932' } },
        { n: 'Ishita Verma', e: { en: 'NEET, 685 / 720', hi: 'NEET, 685 / 720' } },
        { n: 'Mohit Rao', e: { en: 'Class 12 PCM, 98.4%', hi: '12\u0935\u0940\u0902 PCM, 98.4%' } },
        { n: 'Sneha Kulkarni', e: { en: 'CA Foundation, AIR 14', hi: 'CA \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928, AIR 14' } }
      ]
    },
    facilities: [
      { en: 'Smart AC classrooms with digital boards', hi: '\u0921\u093F\u091C\u093F\u091F\u0932 \u092C\u094B\u0930\u094D\u0921 \u0935\u093E\u0932\u0947 \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0915\u0915\u094D\u0937\u093E-\u0915\u0915\u094D\u0937' },
      { en: 'Digital library and study room', hi: '\u0921\u093F\u091C\u093F\u091F\u0932 \u0932\u093E\u0907\u092C\u094D\u0930\u0947\u0930\u0940 \u0914\u0930 \u0938\u094D\u091F\u0921\u0940 \u0930\u0942\u092E' },
      { en: 'Doubt-clearing desk every day', hi: '\u0939\u0930 \u0926\u093F\u0928 \u0921\u093E\u0909\u091F-\u0915\u094D\u0932\u093F\u092F\u0930\u093F\u0902\u0917 \u0921\u0947\u0938\u094D\u0915' },
      { en: 'Weekly test series and analysis', hi: '\u0938\u093E\u092A\u094D\u0924\u093E\u0939\u093F\u0915 \u091F\u0947\u0938\u094D\u091F \u0938\u0940\u0930\u0940\u091C\u093C \u0914\u0930 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923' },
      { en: 'Recorded lectures for revision', hi: '\u0930\u093F\u0935\u0940\u091C\u093C\u0928 \u0915\u0947 \u0932\u093F\u090F \u0930\u093F\u0915\u0949\u0930\u094D\u0921\u0947\u0921 \u0932\u0947\u0915\u094D\u091A\u0930' },
      { en: 'Parent app with progress and attendance', hi: '\u092A\u094D\u0930\u0917\u0924\u093F \u0914\u0930 \u0909\u092A\u0938\u094D\u0925\u093F\u0924\u093F \u0935\u093E\u0932\u093E \u092A\u0947\u0930\u0947\u0902\u091F \u0910\u092A' },
      { en: 'CCTV-secured campus', hi: 'CCTV \u0938\u0947 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0915\u0948\u0902\u092A\u0938' }
    ]
  };
  BP.fee = function (p) { var o = BP.settings.fees && BP.settings.fees[p.id]; return o != null && o !== '' ? +o : Math.round(p.fee * (BP.settings.feeScale || 1)); };
  A.prog = function (id) { return progs.filter(function (p) { return p.id === id; })[0]; };
  A.feeInfo = function (p) {
    var total = BP.fee(p), nn = total >= 100000 ? 6 : total >= 40000 ? 4 : 3, after = Math.round(total * (1 - p.early / 100));
    return { total: total, n: nn, each: Math.round(total / nn), early: p.early, after: after, saved: total - after };
  };
  A.schol = function (p) {
    if (p.group === 'jee' || p.group === 'neet') return { en: 'Up to 90% via the BrightPath Scholarship Test', hi: '\u092C\u094D\u0930\u093E\u0907\u091F\u092A\u093E\u0925 \u0938\u094D\u0915\u0949\u0932\u0930\u0936\u093F\u092A \u091F\u0947\u0938\u094D\u091F \u0938\u0947 90% \u0924\u0915' };
    if (p.group === 'upsc' || p.group === 'ca') return { en: 'Up to 30% fee waiver for merit and need', hi: '\u092E\u0947\u0930\u093F\u091F \u0914\u0930 \u091C\u093C\u0930\u0942\u0930\u0924 \u092A\u0930 30% \u0924\u0915 \u092B\u0940\u0938 \u092E\u093E\u092B\u093C\u0940' };
    return { en: 'Up to 50% via the Scholarship Test; 25% for 90%+ in the last exam', hi: '\u0938\u094D\u0915\u0949\u0932\u0930\u0936\u093F\u092A \u091F\u0947\u0938\u094D\u091F \u0938\u0947 50% \u0924\u0915; \u092A\u093F\u091B\u0932\u0940 \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u092E\u0947\u0902 90%+ \u092A\u0930 25%' };
  };

  /* ================= TEXT UTILITIES ================= */
  function norm(s) { return ' ' + String(s).toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim() + ' '; }
  function lev(a, b) {
    var m = a.length, nn = b.length; if (Math.abs(m - nn) > 2) return 9;
    var p = [], i, j; for (j = 0; j <= nn; j++) p[j] = j;
    for (i = 1; i <= m; i++) { var prev = p[0]; p[0] = i; for (j = 1; j <= nn; j++) { var tmp = p[j]; p[j] = Math.min(p[j] + 1, p[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = tmp; } }
    return p[nn];
  }
  var LAT = /^[a-z]+$/;
  function kwScore(kw, n, toks) {
    var k = kw.toLowerCase(), b = 0;
    if (k.indexOf(' ') > -1) return n.indexOf(' ' + k) > -1 ? 2.4 : 0;
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i]; if (!t) continue;
      if (t === k) return 2;
      if (k.length >= 4 && t.length > k.length && t.indexOf(k) === 0) b = Math.max(b, 1.6);
      else if (LAT.test(k) && k.length >= 5 && t.length >= 4 && lev(t, k) <= (k.length >= 8 ? 2 : 1)) b = Math.max(b, 1.4);
    }
    return b;
  }
  function score(it, n, toks) { var s = 0; it.kw.forEach(function (k) { s += kwScore(k, n, toks); }); return Math.min(s, 6) + (it.pri || 0); }
  function hasAny(n, list) { return list.some(function (k) { return n.indexOf(' ' + k + ' ') > -1 || (k.indexOf(' ') > -1 && n.indexOf(k) > -1); }); }
  A.util = { norm: norm, lev: lev, hasAny: hasAny, score: score };

  /* ================= SLOT DETECTION (class / stream / exam) ================= */
  var ORD = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12,
    '\u092A\u0939\u0932\u0940': 1, '\u0926\u0942\u0938\u0930\u0940': 2, '\u0924\u0940\u0938\u0930\u0940': 3, '\u091A\u094C\u0925\u0940': 4, '\u092A\u093E\u0902\u091A\u0935\u0940\u0902': 5, '\u091B\u0920\u0940': 6, '\u0938\u093E\u0924\u0935\u0940\u0902': 7, '\u0906\u0920\u0935\u0940\u0902': 8, '\u0928\u094C\u0935\u0940\u0902': 9, '\u0926\u0938\u0935\u0940\u0902': 10, '\u0917\u094D\u092F\u093E\u0930\u0939\u0935\u0940\u0902': 11, '\u092C\u093E\u0930\u0939\u0935\u0940\u0902': 12 };
  function detectSlots(raw, nrm) {
    var s = { cls: null, stream: null, exam: null, any: false }, m;
    var d = raw.toLowerCase().replace(/[\u0966-\u096F]/g, function (c) { return c.charCodeAt(0) - 0x966; });
    if ((m = d.match(/(?:class|std|standard|grade|\u0915\u0915\u094D\u0937\u093E|\u0915\u094D\u0932\u093E\u0938)\s*[-:]?\s*(\d{1,2})/))) s.cls = +m[1];
    else if ((m = d.match(/(\d{1,2})\s*(?:th|st|nd|rd|\u0935\u0940\u0902|\u0935\u0940|\u0935\u093E\u0902|\u0935\u093E)/))) s.cls = +m[1];
    else if ((m = d.trim().match(/^(\d{1,2})$/))) s.cls = +m[1];
    else { for (var w in ORD) { if (nrm.indexOf(' ' + w + ' ') > -1) { s.cls = ORD[w]; break; } } }
    if (s.cls !== null && (s.cls < 1 || s.cls > 12)) s.cls = null;
    if (hasAny(nrm, ['science', '\u0935\u093F\u091C\u094D\u091E\u093E\u0928', '\u0938\u093E\u0907\u0902\u0938', '\u0938\u093E\u092F\u0902\u0938', 'pcm', 'pcb'])) s.stream = 'sci';
    if (hasAny(nrm, ['commerce', '\u0915\u0949\u092E\u0930\u094D\u0938', '\u0915\u093E\u092E\u0930\u094D\u0938', '\u0935\u093E\u0923\u093F\u091C\u094D\u092F'])) s.stream = 'com';
    if (hasAny(nrm, ['arts', 'humanities', '\u0906\u0930\u094D\u091F\u094D\u0938', '\u0915\u0932\u093E'])) s.stream = 'arts';
    if (hasAny(nrm, ['jee', 'iit', '\u091C\u0947\u0908\u0908'])) s.exam = 'jee';
    if (hasAny(nrm, ['neet', '\u0928\u0940\u091F'])) s.exam = 'neet';
    if (hasAny(nrm, ['upsc', 'ias', 'ips', 'civil services', 'civil service', '\u092F\u0942\u092A\u0940\u090F\u0938\u0938\u0940'])) s.exam = 'upsc';
    if (hasAny(nrm, ['ca', '\u0938\u0940\u090F', 'chartered'])) {
      s.exam = 'ca';
      if (hasAny(nrm, ['foundation', '\u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928'])) s.exam = 'ca-f';
      else if (hasAny(nrm, ['intermediate', 'inter', '\u0907\u0902\u091F\u0930\u092E\u0940\u0921\u093F\u090F\u091F'])) s.exam = 'ca-i';
      else if (hasAny(nrm, ['final', '\u092B\u093E\u0907\u0928\u0932'])) s.exam = 'ca-fin';
    }
    s.any = !!(s.cls || s.stream || s.exam);
    return s;
  }
  A.detectSlots = detectSlots;
  function resolve(s) {
    if (!s) return [];
    return progs.filter(function (p) {
      var t = p.tags;
      if (s.exam) return s.exam === 'ca' ? (t.exam && t.exam.indexOf('ca') === 0) : t.exam === s.exam;
      if (s.cls) { if (t.cls !== s.cls) return false; if (s.stream && t.stream) return t.stream === s.stream; return true; }
      return false;
    });
  }
  A.resolve = resolve;
  function labelFor(ps) {
    if (ps.length === 1) return A.pick(ps[0].name);
    var t = ps[0].tags; if (t.cls) return T('Class ', '\u0915\u0915\u094D\u0937\u093E ') + t.cls; return 'CA';
  }
  function remember(s) { A.ctx.slots = s; }

  /* ================= INTENT REGISTRY ================= */
  A.registerIntent = function (def) {
    for (var i = 0; i < A.intents.length; i++) if (A.intents[i].id === def.id) { A.intents[i] = def; return; }
    A.intents.push(def);
  };
  function best(n, toks) { var b = null, sc = 0; A.intents.forEach(function (it) { var s = score(it, n, toks); if (s > sc) { sc = s; b = it; } }); return { it: b, sc: sc }; }

  A.defaultChips = function () {
    return A.lang === 'hi' || BP.settings.lang === 'hi'
      ? ['\u0915\u0915\u094D\u0937\u093E 10 \u0915\u0940 \u092B\u0940\u0938', 'JEE \u092C\u0948\u091A \u091F\u093E\u0907\u092E\u093F\u0902\u0917', '\u092B\u0948\u0915\u0932\u094D\u091F\u0940', '\u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902', '\u0938\u094D\u0915\u0949\u0932\u0930\u0936\u093F\u092A \u0914\u0930 \u091B\u0942\u091F', '\u0906\u092A \u0915\u0939\u093E\u0901 \u0939\u0948\u0902?']
      : ['Fees for Class 10', 'JEE batch timings', 'Meet the faculty', 'Book a demo class', 'Scholarships & discounts', 'Where are you located?'];
  };
  function progChips() { return T(['Class 10', 'Class 12 Science', 'JEE', 'NEET', 'UPSC', 'CA Foundation'], ['\u0915\u0915\u094D\u0937\u093E 10', '\u0915\u0915\u094D\u0937\u093E 12 \u0935\u093F\u091C\u094D\u091E\u093E\u0928', 'JEE', 'NEET', 'UPSC', 'CA \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928']); }
  function askProg(pend) {
    A.ctx.pending = pend;
    var q = { fees: T('Which class or exam are you asking about?', '\u0906\u092A \u0915\u093F\u0938 \u0915\u0915\u094D\u0937\u093E \u092F\u093E \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u092A\u0942\u091B \u0930\u0939\u0947 \u0939\u0948\u0902?') }[pend] || T('Which class or exam are you asking about?', '\u0906\u092A \u0915\u093F\u0938 \u0915\u0915\u094D\u0937\u093E \u092F\u093E \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u092A\u0942\u091B \u0930\u0939\u0947 \u0939\u0948\u0902?');
    return { text: q, speak: q, chips: progChips() };
  }
  function slotsFor(m) { var s = m.slots; if (s && s.any) { if (s.stream && !s.cls && !s.exam && A.ctx.slots && A.ctx.slots.cls > 10) s = { cls: A.ctx.slots.cls, stream: s.stream }; remember(s); return s; } return A.ctx.slots; }

  /* ================= INTENT HANDLERS ================= */
  function greet() {
    var h = new Date().getHours(), g = h < 12 ? T('Good morning', '\u0938\u0941\u092A\u094D\u0930\u092D\u093E\u0924') : h < 17 ? T('Good afternoon', '\u0928\u092E\u0938\u094D\u0924\u0947') : T('Good evening', '\u0936\u0941\u092D \u0938\u0902\u0927\u094D\u092F\u093E');
    var t = g + T("! I'm the BrightPath AI counsellor. Ask me about courses, fees, batches, faculty or admissions.", '! \u092E\u0948\u0902 \u092C\u094D\u0930\u093E\u0907\u091F\u092A\u093E\u0925 \u0915\u093E AI \u0915\u093E\u0909\u0902\u0938\u0932\u0930 \u0939\u0942\u0901\u0964 \u0915\u094B\u0930\u094D\u0938, \u092B\u0940\u0938, \u092C\u0948\u091A, \u092B\u0948\u0915\u0932\u094D\u091F\u0940 \u092F\u093E \u090F\u0921\u092E\u093F\u0936\u0928 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u092A\u0942\u091B\u093F\u090F\u0964');
    return { text: t, speak: t, chips: A.defaultChips() };
  }
  A.greet = function () { A.lang = BP.settings.lang; var r = greet(); BP.chat.add('agent', r); BP.chat.setChips(r.chips); };

  function fees(m) {
    var s = slotsFor(m), ps = resolve(s);
    if (!ps.length) return askProg('fees');
    A.ctx.pending = null;
    if (ps.length === 1) {
      var p = ps[0], i = A.feeInfo(p), nm = A.pick(p.name);
      var t = T(nm + ' costs ' + inr(i.total) + '. You can pay in ' + i.n + ' installments of ' + inr(i.each) + ', or save ' + inr(i.saved) + ' with the early-bird offer.',
        nm + ' \u0915\u0940 \u092B\u0940\u0938 ' + inr(i.total) + ' \u0939\u0948\u0964 \u0906\u092A ' + i.n + ' \u0915\u093F\u0938\u094D\u0924\u094B\u0902 \u092E\u0947\u0902 ' + inr(i.each) + ' \u092A\u094D\u0930\u0924\u093F \u0915\u093F\u0938\u094D\u0924 \u0926\u0947 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902, \u092F\u093E \u0905\u0930\u094D\u0932\u0940-\u092C\u0930\u094D\u0921 \u0911\u092B\u0930 \u092E\u0947\u0902 ' + inr(i.saved) + ' \u092C\u091A\u093E \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964');
      return { text: t, speak: t, card: { type: 'fee', id: p.id }, chips: T(['Batch timings', 'Book a demo class', 'Scholarships & discounts', 'Meet the faculty'], ['\u092C\u0948\u091A \u091F\u093E\u0907\u092E\u093F\u0902\u0917', '\u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902', '\u0938\u094D\u0915\u0949\u0932\u0930\u0936\u093F\u092A \u0914\u0930 \u091B\u0942\u091F', '\u092B\u0948\u0915\u0932\u094D\u091F\u0940']) };
    }
    var t2 = T('Fees for ' + labelFor(ps) + ' depend on the stream or level. Tap one on screen for full details.', labelFor(ps) + ' \u0915\u0940 \u092B\u0940\u0938 \u0938\u094D\u091F\u094D\u0930\u0940\u092E \u092F\u093E \u0932\u0947\u0935\u0932 \u092A\u0930 \u0928\u093F\u0930\u094D\u092D\u0930 \u0915\u0930\u0924\u0940 \u0939\u0948\u0964 \u092A\u0942\u0930\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0915\u0947 \u0932\u093F\u090F \u0938\u094D\u0915\u094D\u0930\u0940\u0928 \u092A\u0930 \u091A\u0941\u0928\u0947\u0902\u0964');
    return { text: t2, speak: t2, card: { type: 'feelist', ids: ps.map(function (p) { return p.id; }) } };
  }
  function discount(m) {
    var s = slotsFor(m), ps = resolve(s);
    if (ps.length === 1) {
      var p = ps[0], i = A.feeInfo(p), nm = A.pick(p.name);
      var t = T('For ' + nm + ', pay in full early and save ' + inr(i.saved) + ' (' + p.early + '%). Scholarship: ' + A.pick(A.schol(p)) + '.', nm + ' \u0915\u0947 \u0932\u093F\u090F \u091C\u0932\u094D\u0926\u0940 \u092A\u0942\u0930\u093E \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0930\u0928\u0947 \u092A\u0930 ' + inr(i.saved) + ' (' + p.early + '%) \u092C\u091A\u0924 \u0939\u094B\u0924\u0940 \u0939\u0948\u0964 \u0938\u094D\u0915\u0949\u0932\u0930\u0936\u093F\u092A: ' + A.pick(A.schol(p)) + '\u0964');
      return { text: t, speak: t, card: { type: 'fee', id: p.id } };
    }
    var g = T('Early-bird discounts of 8 to 10 percent on full payment, easy installments, and scholarships up to 50 percent for school classes and up to 90 percent for JEE and NEET through our Scholarship Test.',
      '\u092A\u0942\u0930\u093E \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0930\u0928\u0947 \u092A\u0930 8 \u0938\u0947 10 \u092A\u094D\u0930\u0924\u093F\u0936\u0924 \u0905\u0930\u094D\u0932\u0940-\u092C\u0930\u094D\u0921 \u091B\u0942\u091F, \u0906\u0938\u093E\u0928 \u0915\u093F\u0938\u094D\u0924\u0947\u0902, \u0914\u0930 \u0938\u094D\u0915\u0949\u0932\u0930\u0936\u093F\u092A \u091F\u0947\u0938\u094D\u091F \u0938\u0947 \u0938\u094D\u0915\u0942\u0932 \u0915\u0915\u094D\u0937\u093E\u0913\u0902 \u092E\u0947\u0902 50 \u0914\u0930 JEE-NEET \u092E\u0947\u0902 90 \u092A\u094D\u0930\u0924\u093F\u0936\u0924 \u0924\u0915 \u0938\u094D\u0915\u0949\u0932\u0930\u0936\u093F\u092A\u0964');
    return { text: g, speak: g, chips: T(['Fees for Class 10', 'Fees for JEE', 'Book a demo class'], ['\u0915\u0915\u094D\u0937\u093E 10 \u0915\u0940 \u092B\u0940\u0938', 'JEE \u0915\u0940 \u092B\u0940\u0938', '\u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902']) };
  }
  function batch(m) {
    var s = slotsFor(m), ps = resolve(s);
    if (!ps.length) return askProg('batch');
    A.ctx.pending = null;
    var p = ps[0], sc = SCHED[p.sk], lb = labelFor(ps);
    var t = T(lb + ': morning ' + sc.morning + ', evening ' + sc.evening + ', weekend ' + sc.weekend + '.', lb + ': \u0938\u0941\u092C\u0939 ' + sc.morning + ', \u0936\u093E\u092E ' + sc.evening + ', \u0935\u0940\u0915\u0947\u0902\u0921 ' + sc.weekend + '\u0964');
    return { text: t, speak: t, card: { type: 'batch', sk: p.sk, title: lb }, chips: T(['Book a demo class', 'Fees for ' + lb, 'Change batch policy'], ['\u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902', lb + ' \u0915\u0940 \u092B\u0940\u0938', '\u092C\u0948\u091A \u092C\u0926\u0932\u0928\u0947 \u0915\u0940 \u0928\u0940\u0924\u093F']) };
  }
  function faculty(m) {
    var s = slotsFor(m), ps = resolve(s), list = K.faculty, lb = '';
    var sub = K.faculty.filter(function (f) { return f.kw.some(function (k) { return kwScore(k, m.n, m.toks) >= 2; }); });
    if (sub.length) list = sub;
    else if (ps.length) { var gs = ps.map(function (p) { return p.group; }); list = K.faculty.filter(function (f) { return f.groups.some(function (g) { return gs.indexOf(g) > -1; }); }); lb = labelFor(ps); }
    if (!list.length) list = K.faculty;
    var names = list.slice(0, 3).map(function (f) { return f.name + ' (' + A.pick(f.subject) + ')'; }).join(', ');
    var t = lb ? T('For ' + lb + ', you will be taught by ' + names + '.', lb + ' \u0915\u0947 \u0932\u093F\u090F \u0906\u092A\u0915\u094B \u092A\u0922\u093C\u093E\u090F\u0902\u0917\u0947: ' + names + '\u0964')
      : T('Our faculty includes ' + names + '. Full team is on screen.', '\u0939\u092E\u093E\u0930\u0940 \u092B\u0948\u0915\u0932\u094D\u091F\u0940 \u092E\u0947\u0902 \u0936\u093E\u092E\u093F\u0932 \u0939\u0948\u0902: ' + names + '\u0964 \u092A\u0942\u0930\u0940 \u091F\u0940\u092E \u0938\u094D\u0915\u094D\u0930\u0940\u0928 \u092A\u0930 \u0939\u0948\u0964');
    return { text: t, speak: t, card: { type: 'faculty', ids: list.map(function (f) { return f.id; }) }, chips: T(['Book a demo class', 'Fees for Class 10', 'Batch timings'], ['\u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902', '\u0915\u0915\u094D\u0937\u093E 10 \u0915\u0940 \u092B\u0940\u0938', '\u092C\u0948\u091A \u091F\u093E\u0907\u092E\u093F\u0902\u0917']) };
  }
  function admission() {
    var t = T('Admission is simple: free counselling, registration, an optional scholarship test, fee payment, then batch allotment. Shall I arrange a counsellor call?', '\u090F\u0921\u092E\u093F\u0936\u0928 \u0906\u0938\u093E\u0928 \u0939\u0948: \u092E\u0941\u092B\u094D\u0924 \u0915\u093E\u0909\u0902\u0938\u0932\u093F\u0902\u0917, \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0947\u0936\u0928, \u0935\u0948\u0915\u0932\u094D\u092A\u093F\u0915 \u0938\u094D\u0915\u0949\u0932\u0930\u0936\u093F\u092A \u091F\u0947\u0938\u094D\u091F, \u092B\u0940\u0938 \u092D\u0941\u0917\u0924\u093E\u0928 \u0914\u0930 \u092B\u093F\u0930 \u092C\u0948\u091A \u0906\u0935\u0902\u091F\u0928\u0964 \u0915\u094D\u092F\u093E \u092E\u0948\u0902 \u0915\u093E\u0909\u0902\u0938\u0932\u0930 \u0915\u0949\u0932 \u0915\u093E \u0907\u0902\u0924\u091C\u093C\u093E\u092E \u0915\u0930\u0942\u0901?');
    return { text: t, speak: t, card: { type: 'steps', title: T('Admission process', '\u090F\u0921\u092E\u093F\u0936\u0928 \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E'), items: K.admission.map(function (x) { return A.pick(x); }) }, chips: T(['Required documents', 'Request a callback', 'Book a demo class'], ['\u091C\u093C\u0930\u0942\u0930\u0940 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u093C', '\u0915\u0949\u0932\u092C\u0948\u0915 \u091A\u093E\u0939\u093F\u090F', '\u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902']) };
  }
  function docs() {
    var t = T('You will need the last marksheet, a photo ID, two photographs, address proof, and a birth or transfer certificate where applicable. The full list is on screen.', '\u0906\u092A\u0915\u094B \u092A\u093F\u091B\u0932\u0940 \u092E\u093E\u0930\u094D\u0915\u0936\u0940\u091F, \u092B\u094B\u091F\u094B \u0906\u0908\u0921\u0940, \u0926\u094B \u092B\u094B\u091F\u094B, \u092A\u0924\u0947 \u0915\u093E \u092A\u094D\u0930\u092E\u093E\u0923 \u0914\u0930 \u091C\u093C\u0930\u0942\u0930\u0924 \u0905\u0928\u0941\u0938\u093E\u0930 \u091C\u0928\u094D\u092E \u092F\u093E \u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930 \u0938\u0930\u094D\u091F\u093F\u092B\u093F\u0915\u0947\u091F \u091A\u093E\u0939\u093F\u090F\u0964 \u092A\u0942\u0930\u0940 \u0938\u0942\u091A\u0940 \u0938\u094D\u0915\u094D\u0930\u0940\u0928 \u092A\u0930 \u0939\u0948\u0964');
    return { text: t, speak: t, card: { type: 'list', title: T('Documents required', '\u091C\u093C\u0930\u0942\u0930\u0940 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u093C'), items: K.docs.map(function (x) { return A.pick(x); }) }, chips: T(['Admission process', 'Request a callback'], ['\u090F\u0921\u092E\u093F\u0936\u0928 \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E', '\u0915\u0949\u0932\u092C\u0948\u0915 \u091A\u093E\u0939\u093F\u090F']) };
  }
  function results() {
    var t = T('Last session, 12 students scored above 99 percentile in JEE Main, 41 scored 600-plus in NEET, and our Class 10 board average was 91 percent.', '\u092A\u093F\u091B\u0932\u0947 \u0938\u0924\u094D\u0930 \u092E\u0947\u0902 12 \u091B\u093E\u0924\u094D\u0930\u094B\u0902 \u0928\u0947 JEE Main \u092E\u0947\u0902 99 \u092A\u0930\u094D\u0938\u0947\u0902\u091F\u093E\u0907\u0932 \u0938\u0947 \u090A\u092A\u0930, 41 \u0928\u0947 NEET \u092E\u0947\u0902 600 \u0938\u0947 \u0905\u0927\u093F\u0915 \u0938\u094D\u0915\u094B\u0930 \u0915\u093F\u092F\u093E, \u0914\u0930 10\u0935\u0940\u0902 \u092C\u094B\u0930\u094D\u0921 \u0915\u093E \u0914\u0938\u0924 91 \u092A\u094D\u0930\u0924\u093F\u0936\u0924 \u0930\u0939\u093E\u0964');
    return { text: t, speak: t, card: { type: 'results' }, chips: T(['Fees for JEE', 'Book a demo class', 'Meet the faculty'], ['JEE \u0915\u0940 \u092B\u0940\u0938', '\u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902', '\u092B\u0948\u0915\u0932\u094D\u091F\u0940']) };
  }
  function facilities() {
    var t = T('Smart AC classrooms, a digital library, a daily doubt desk, weekly test series, recorded lectures and a parent app. The full list is on screen.', '\u0938\u094D\u092E\u093E\u0930\u094D\u091F AC \u0915\u0915\u094D\u0937\u093E-\u0915\u0915\u094D\u0937, \u0921\u093F\u091C\u093F\u091F\u0932 \u0932\u093E\u0907\u092C\u094D\u0930\u0947\u0930\u0940, \u0930\u094B\u091C\u093C \u0921\u093E\u0909\u091F \u0921\u0947\u0938\u094D\u0915, \u0938\u093E\u092A\u094D\u0924\u093E\u0939\u093F\u0915 \u091F\u0947\u0938\u094D\u091F \u0938\u0940\u0930\u0940\u091C\u093C, \u0930\u093F\u0915\u0949\u0930\u094D\u0921\u0947\u0921 \u0932\u0947\u0915\u094D\u091A\u0930 \u0914\u0930 \u092A\u0947\u0930\u0947\u0902\u091F \u0910\u092A\u0964 \u092A\u0942\u0930\u0940 \u0938\u0942\u091A\u0940 \u0938\u094D\u0915\u094D\u0930\u0940\u0928 \u092A\u0930 \u0939\u0948\u0964');
    return { text: t, speak: t, card: { type: 'list', title: T('Facilities', '\u0938\u0941\u0935\u093F\u0927\u093E\u090F\u0901'), items: K.facilities.map(function (x) { return A.pick(x); }) } };
  }
  function refund() {
    var t = T('You get a full refund within 7 days of joining, minus a registration fee of \u20B91,000. From day 8 to day 30, 50 percent of the fee paid is refunded, and after that there is no refund.', '\u091C\u0949\u0907\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 7 \u0926\u093F\u0928 \u0915\u0947 \u0905\u0902\u0926\u0930 \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0947\u0936\u0928 \u092B\u0940\u0938 \u20B91,000 \u0915\u093E\u091F\u0915\u0930 \u092A\u0942\u0930\u093E \u0930\u093F\u092B\u0902\u0921 \u092E\u093F\u0932\u0924\u093E \u0939\u0948\u0964 \u0926\u093F\u0928 8 \u0938\u0947 30 \u0924\u0915 \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0940 \u0917\u0908 \u092B\u0940\u0938 \u0915\u093E 50 \u092A\u094D\u0930\u0924\u093F\u0936\u0924 \u0932\u094C\u091F\u093E\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948, \u0909\u0938\u0915\u0947 \u092C\u093E\u0926 \u0930\u093F\u092B\u0902\u0921 \u0928\u0939\u0940\u0902\u0964');
    return { text: t, speak: t, chips: T(['Batch transfer policy', 'Fees for Class 10'], ['\u092C\u0948\u091A \u092C\u0926\u0932\u0928\u0947 \u0915\u0940 \u0928\u0940\u0924\u093F', '\u0915\u0915\u094D\u0937\u093E 10 \u0915\u0940 \u092B\u0940\u0938']) };
  }
  function transfer() {
    var t = T('You can switch batches once per session free of charge, subject to seat availability. Please request it at least 3 days in advance.', '\u0906\u092A \u0939\u0930 \u0938\u0924\u094D\u0930 \u092E\u0947\u0902 \u090F\u0915 \u092C\u093E\u0930 \u092E\u0941\u092B\u094D\u0924 \u092C\u0948\u091A \u092C\u0926\u0932 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902, \u0938\u0940\u091F \u0909\u092A\u0932\u092C\u094D\u0927 \u0939\u094B\u0928\u0947 \u092A\u0930\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u092E \u0938\u0947 \u0915\u092E 3 \u0926\u093F\u0928 \u092A\u0939\u0932\u0947 \u0905\u0928\u0941\u0930\u094B\u0927 \u0915\u0930\u0947\u0902\u0964');
    return { text: t, speak: t, chips: T(['Refund policy', 'Batch timings'], ['\u0930\u093F\u092B\u0902\u0921 \u0928\u0940\u0924\u093F', '\u092C\u0948\u091A \u091F\u093E\u0907\u092E\u093F\u0902\u0917']) };
  }
  function contact() {
    var s = BP.settings;
    var t = T("We are at " + s.address + ". Open " + s.hours + ". Call " + s.phone + '.', '\u0939\u092E \u0907\u0938 \u092A\u0924\u0947 \u092A\u0930 \u0939\u0948\u0902: ' + s.address + '\u0964 \u0938\u092E\u092F: ' + s.hours + '\u0964 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902: ' + s.phone + '\u0964');
    return { text: t, speak: t, card: { type: 'contact' }, chips: T(['Request a callback', 'Book a demo class'], ['\u0915\u0949\u0932\u092C\u0948\u0915 \u091A\u093E\u0939\u093F\u090F', '\u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902']) };
  }
  function programs() {
    var t = T('We teach classes 1 to 12, with Science, Commerce and Arts streams for 11 and 12, plus JEE, NEET, UPSC, and CA Foundation, Intermediate and Final.', '\u0939\u092E \u0915\u0915\u094D\u0937\u093E 1 \u0938\u0947 12 \u092A\u0922\u093C\u093E\u0924\u0947 \u0939\u0948\u0902, 11-12 \u092E\u0947\u0902 \u0935\u093F\u091C\u094D\u091E\u093E\u0928, \u0935\u093E\u0923\u093F\u091C\u094D\u092F \u0914\u0930 \u0915\u0932\u093E \u0938\u094D\u091F\u094D\u0930\u0940\u092E \u0915\u0947 \u0938\u093E\u0925, \u0914\u0930 JEE, NEET, UPSC \u0924\u0925\u093E CA \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928, \u0907\u0902\u091F\u0930\u092E\u0940\u0921\u093F\u090F\u091F \u0935 \u092B\u093E\u0907\u0928\u0932\u0964');
    return { text: t, speak: t, card: { type: 'programs' } };
  }
  function help() {
    var t = T('I can tell you about courses, fees, batch timings, faculty, results, facilities and admissions, and I can book a free demo class for you.', '\u092E\u0948\u0902 \u0915\u094B\u0930\u094D\u0938, \u092B\u0940\u0938, \u092C\u0948\u091A \u091F\u093E\u0907\u092E\u093F\u0902\u0917, \u092B\u0948\u0915\u0932\u094D\u091F\u0940, \u0930\u093F\u091C\u093C\u0932\u094D\u091F, \u0938\u0941\u0935\u093F\u0927\u093E\u0913\u0902 \u0914\u0930 \u090F\u0921\u092E\u093F\u0936\u0928 \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u092C\u0924\u093E \u0938\u0915\u0924\u093E \u0939\u0942\u0901 \u0914\u0930 \u092E\u0941\u092B\u094D\u0924 \u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092D\u0940 \u092C\u0941\u0915 \u0915\u0930 \u0938\u0915\u0924\u093E \u0939\u0942\u0901\u0964');
    return { text: t, speak: t, chips: A.defaultChips() };
  }
  function thanks() { var t = T("You're welcome! Anything else I can help with?", '\u0906\u092A\u0915\u093E \u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948! \u0915\u094D\u092F\u093E \u0914\u0930 \u0915\u0941\u091B \u092E\u0926\u0926 \u0915\u0930\u0942\u0901?'); return { text: t, speak: t }; }
  function bye() { var t = T('Goodbye! Do visit us or book a free demo class anytime.', '\u0905\u0932\u0935\u093F\u0926\u093E! \u0915\u092D\u0940 \u092D\u0940 \u0906\u0907\u090F \u092F\u093E \u092E\u0941\u092B\u094D\u0924 \u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0947\u0902\u0964'); return { text: t, speak: t }; }
  function langSwitch(m) {
    var hi = /hindi|\u0939\u093F\u0902\u0926\u0940|\u0939\u093F\u0928\u094D\u0926\u0940/.test(m.text.toLowerCase());
    BP.setLang(hi ? 'hi' : 'en'); A.lang = hi ? 'hi' : 'en';
    var t = hi ? '\u0920\u0940\u0915 \u0939\u0948, \u0905\u092C \u0938\u0947 \u092E\u0948\u0902 \u0939\u093F\u0902\u0926\u0940 \u092E\u0947\u0902 \u091C\u0935\u093E\u092C \u0926\u0942\u0901\u0917\u093E\u0964' : 'Sure, I will reply in English from now on.';
    return { text: t, speak: t };
  }
  function goStub(view, en, hi) { return function () { var t = T(en, hi); return { text: t, speak: t, card: { type: 'go', view: view, label: T('Open ' + view.charAt(0).toUpperCase() + view.slice(1), '\u0916\u094B\u0932\u0947\u0902') } }; }; }

  function registerAll() {
    var R = A.registerIntent;
    R({ id: 'greet', kw: ['hi', 'hello', 'hey', 'hii', 'namaste', 'namaskar', 'good morning', 'good evening', 'good afternoon', '\u0928\u092E\u0938\u094D\u0924\u0947', '\u0928\u092E\u0938\u094D\u0915\u093E\u0930', '\u0939\u0947\u0932\u094B', '\u0939\u093E\u092F'], handler: greet });
    R({ id: 'thanks', kw: ['thanks', 'thank you', 'thankyou', 'thx', 'shukriya', 'dhanyavad', '\u0927\u0928\u094D\u092F\u0935\u093E\u0926', '\u0936\u0941\u0915\u094D\u0930\u093F\u092F\u093E'], handler: thanks });
    R({ id: 'bye', kw: ['bye', 'goodbye', 'see you', 'alvida', '\u0905\u0932\u0935\u093F\u0926\u093E', 'tata'], handler: bye });
    R({ id: 'help', kw: ['help', 'what can you do', 'how can you help', 'options', 'menu', '\u092E\u0926\u0926', '\u0938\u0939\u093E\u092F\u0924\u093E'], handler: help });
    R({ id: 'lang', kw: ['speak hindi', 'in hindi', 'hindi mein', 'speak english', 'in english', 'english mein', '\u0939\u093F\u0902\u0926\u0940 \u092E\u0947\u0902', '\u0939\u093F\u0928\u094D\u0926\u0940 \u092E\u0947\u0902', '\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940 \u092E\u0947\u0902', '\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u0940 \u092E\u0947\u0902'], pri: 0.5, handler: langSwitch });
    R({ id: 'fees', kw: ['fee', 'fees', 'fees structure', 'cost', 'price', 'charges', 'charge', 'kitna', 'kitni', 'installment', 'instalment', 'emi', 'payment', '\u0936\u0941\u0932\u094D\u0915', '\u092B\u0940\u0938', '\u0915\u093F\u0924\u0928\u093E', '\u0915\u093F\u0924\u0928\u0940', '\u0916\u0930\u094D\u091A', '\u0915\u093F\u0938\u094D\u0924', '\u092A\u0948\u0938\u0947'], handler: fees });
    R({ id: 'discount', kw: ['discount', 'scholarship', 'scholarships', 'offer', 'offers', 'early bird', 'earlybird', 'concession', 'waiver', '\u091B\u0942\u091F', '\u0938\u094D\u0915\u0949\u0932\u0930\u0936\u093F\u092A', '\u0911\u092B\u0930', '\u0930\u093F\u092F\u093E\u092F\u0924'], pri: 0.3, handler: discount });
    R({ id: 'batch', kw: ['batch', 'batches', 'timing', 'timings', 'schedule', 'slot', 'slots', 'morning batch', 'evening batch', 'weekend batch', '\u092C\u0948\u091A', '\u0938\u092E\u092F', '\u091F\u093E\u0907\u092E\u093F\u0902\u0917', '\u0936\u0947\u0921\u094D\u092F\u0942\u0932'], handler: batch });
    R({ id: 'faculty', kw: ['faculty', 'teacher', 'teachers', 'professor', 'professors', 'mentor', 'mentors', 'instructor', 'who teaches', 'sir', 'madam', '\u0936\u093F\u0915\u094D\u0937\u0915', '\u091F\u0940\u091A\u0930', '\u092B\u0948\u0915\u0932\u094D\u091F\u0940', '\u0905\u0927\u094D\u092F\u093E\u092A\u0915'], handler: faculty });
    R({ id: 'demo', kw: ['demo', 'demo class', 'trial', 'trial class', 'free class', 'sample class', 'book demo', '\u0921\u0947\u092E\u094B', '\u091F\u094D\u0930\u093E\u092F\u0932', '\u092E\u0941\u092B\u094D\u0924 \u0915\u094D\u0932\u093E\u0938'], pri: 0.5, handler: function (m) { return A.startFlow('demo', slotsFor(m)); } });
    R({ id: 'enquiry', kw: ['enquiry', 'inquiry', 'callback', 'call back', 'call me', 'contact me', 'counsellor', 'counselor', 'counselling', 'counseling', 'interested', 'sign me up', 'request a callback', '\u0915\u0949\u0932\u092C\u0948\u0915', '\u0915\u0949\u0932 \u092C\u0948\u0915', '\u0915\u093E\u0909\u0902\u0938\u0932\u0930', '\u0907\u091A\u094D\u091B\u0941\u0915'], pri: 0.5, handler: function (m) { return A.startFlow('enquiry', slotsFor(m)); } });
    R({ id: 'admission', kw: ['admission', 'admissions', 'enroll', 'enrol', 'enrolment', 'join', 'register', 'registration', 'process', 'how to apply', 'apply', '\u092A\u094D\u0930\u0935\u0947\u0936', '\u090F\u0921\u092E\u093F\u0936\u0928', '\u0926\u093E\u0916\u093F\u0932\u093E', '\u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0947\u0936\u0928', '\u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E'], handler: admission });
    R({ id: 'docs', kw: ['document', 'documents', 'papers', 'certificate', 'certificates', 'required documents', 'need to bring', '\u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u093C', '\u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C', '\u0921\u0949\u0915\u094D\u092F\u0942\u092E\u0947\u0902\u091F', '\u0915\u093E\u0917\u091C'], pri: 0.6, handler: docs });
    R({ id: 'results', kw: ['result', 'results', 'topper', 'toppers', 'selection', 'selections', 'success', 'track record', 'past results', '\u092A\u0930\u093F\u0923\u093E\u092E', '\u0930\u093F\u091C\u093C\u0932\u094D\u091F', '\u0930\u093F\u091C\u0932\u094D\u091F', '\u091F\u0949\u092A\u0930', '\u0938\u092B\u0932\u0924\u093E'], handler: results });
    R({ id: 'facilities', kw: ['facility', 'facilities', 'infrastructure', 'library', 'smart class', 'wifi', 'cctv', 'lab', 'campus', 'canteen', 'transport', 'hostel', '\u0938\u0941\u0935\u093F\u0927\u093E', '\u0938\u0941\u0935\u093F\u0927\u093E\u090F\u0902', '\u0932\u093E\u0907\u092C\u094D\u0930\u0947\u0930\u0940', '\u0915\u0948\u0902\u092A\u0938'], handler: facilities });
    R({ id: 'refund', kw: ['refund', 'money back', 'cancellation', 'cancel admission', 'return fee', '\u0930\u093F\u092B\u0902\u0921', '\u092A\u0948\u0938\u0947 \u0935\u093E\u092A\u0938', '\u0935\u093E\u092A\u0938\u0940'], pri: 0.5, handler: refund });
    R({ id: 'transfer', kw: ['transfer', 'change batch', 'switch batch', 'shift batch', 'batch change', 'batch transfer', '\u092C\u0948\u091A \u092C\u0926\u0932', '\u091F\u094D\u0930\u093E\u0902\u0938\u092B\u0930'], pri: 0.8, handler: transfer });
    R({ id: 'contact', kw: ['contact', 'phone', 'number', 'call', 'email', 'address', 'location', 'where', 'located', 'directions', 'branch', 'reach', 'office hours', '\u092A\u0924\u093E', '\u092B\u094B\u0928', '\u0928\u0902\u092C\u0930', '\u0938\u0902\u092A\u0930\u094D\u0915', '\u0915\u0939\u093E\u0901', '\u0915\u0939\u093E\u0902', '\u0908\u092E\u0947\u0932', '\u0932\u094B\u0915\u0947\u0936\u0928', '\u092C\u094D\u0930\u093E\u0902\u091A'], handler: contact });
    R({ id: 'programs', kw: ['course', 'courses', 'program', 'programs', 'programme', 'streams', 'stream', 'what do you teach', 'classes offered', '\u0915\u094B\u0930\u094D\u0938', '\u0915\u094D\u0932\u093E\u0938\u0947\u0938', '\u092A\u094D\u0930\u094B\u0917\u094D\u0930\u093E\u092E'], handler: programs });
    /* ---- stubs: later cells re-register these ids with real handlers ---- */
    R({ id: 'tests', kw: ['test', 'tests', 'mock test', 'quiz', 'practice test', '\u091F\u0947\u0938\u094D\u091F', '\u092E\u0949\u0915'], stub: true, handler: goStub('tests', 'You can take practice tests in the Tests tab.', '\u092A\u094D\u0930\u0948\u0915\u094D\u091F\u093F\u0938 \u091F\u0947\u0938\u094D\u091F \u0906\u092A \u091F\u0947\u0938\u094D\u091F \u091F\u0948\u092C \u092E\u0947\u0902 \u0926\u0947 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964') });
    R({ id: 'rank', kw: ['rank', 'ranking', 'leaderboard', 'percentile', '\u0930\u0948\u0902\u0915'], stub: true, handler: goStub('tests', 'Your rank will appear in the Tests tab.', '\u0906\u092A\u0915\u0940 \u0930\u0948\u0902\u0915 \u091F\u0947\u0938\u094D\u091F \u091F\u0948\u092C \u092E\u0947\u0902 \u0926\u093F\u0916\u0947\u0917\u0940\u0964') });
    R({ id: 'perf', kw: ['performance', 'progress', 'how did i perform', 'scorecard', '\u092A\u094D\u0930\u0926\u0930\u094D\u0936\u0928', '\u092A\u094D\u0930\u0917\u0924\u093F'], stub: true, handler: goStub('tests', 'Your performance report is in the Tests tab.', '\u0906\u092A\u0915\u0940 \u092A\u0930\u092B\u0949\u0930\u094D\u092E\u0947\u0902\u0938 \u0930\u093F\u092A\u094B\u0930\u094D\u091F \u091F\u0947\u0938\u094D\u091F \u091F\u0948\u092C \u092E\u0947\u0902 \u0939\u0948\u0964') });
    R({ id: 'syllabus', kw: ['syllabus', 'chapter', 'chapters', 'curriculum', 'ncert', '\u0938\u093F\u0932\u0947\u092C\u0938', '\u0905\u0927\u094D\u092F\u093E\u092F'], stub: true, handler: goStub('syllabus', 'You can explore the syllabus in the Syllabus tab.', '\u0938\u093F\u0932\u0947\u092C\u0938 \u0906\u092A \u0938\u093F\u0932\u0947\u092C\u0938 \u091F\u0948\u092C \u092E\u0947\u0902 \u0926\u0947\u0916 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964') });
    R({ id: 'courses', kw: ['buy', 'purchase', 'cart', 'recommend', 'recommendation', 'suggest', '\u0938\u0941\u091D\u093E\u0935', '\u0916\u0930\u0940\u0926\u0947\u0902'], stub: true, handler: goStub('courses', 'You can browse and buy courses in the Courses tab.', '\u0915\u094B\u0930\u094D\u0938 \u0915\u094B\u0930\u094D\u0938 \u091F\u0948\u092C \u092E\u0947\u0902 \u0926\u0947\u0916 \u0914\u0930 \u0916\u0930\u0940\u0926 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964') });
  }
  registerAll();

  /* ================= FALLBACKS ================= */
  var DOMAIN = { kw: ['class', 'course', 'courses', 'fee', 'fees', 'exam', 'batch', 'teacher', 'admission', 'coaching', 'institute', 'study', 'student', 'scholarship', 'online', 'offline', 'hostel', 'transport', 'bus', 'canteen', 'books', 'notes', 'material', 'homework', 'tuition', 'school', 'board', 'cbse', 'icse', 'seat', 'seats', 'mentor', 'career', 'syllabus', 'test', 'result', '\u0915\u094B\u0930\u094D\u0938', '\u092A\u0930\u0940\u0915\u094D\u0937\u093E', '\u092A\u0922\u093C\u093E\u0908', '\u091B\u093E\u0924\u094D\u0930', '\u0938\u094D\u0915\u0942\u0932', '\u091F\u094D\u092F\u0942\u0936\u0928', '\u0915\u093F\u0924\u093E\u092C', '\u0928\u094B\u091F\u094D\u0938', '\u0915\u094D\u0932\u093E\u0938', '\u0915\u0915\u094D\u0937\u093E'] };
  function saveCallback(q) { var a = BP.store.get('callbacks', []); a.unshift({ id: 'C' + Date.now().toString(36), ts: Date.now(), question: q, lang: A.lang, status: 'Pending' }); BP.store.set('callbacks', a); BP.emit('callback:saved'); }
  function fallback(m, slots) {
    if (score(DOMAIN, m.n, m.toks) >= 1.8 || slots.any) {
      saveCallback(m.text);
      var t = T("I don't have that detail with me, so I've noted your question and a staff member will follow up with you shortly.", '\u092F\u0939 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u092E\u0947\u0930\u0947 \u092A\u093E\u0938 \u0928\u0939\u0940\u0902 \u0939\u0948, \u0907\u0938\u0932\u093F\u090F \u092E\u0948\u0902\u0928\u0947 \u0906\u092A\u0915\u093E \u0938\u0935\u093E\u0932 \u0926\u0930\u094D\u091C \u0915\u0930 \u0932\u093F\u092F\u093E \u0939\u0948 \u0914\u0930 \u0938\u094D\u091F\u093E\u092B \u0938\u0926\u0938\u094D\u092F \u091C\u0932\u094D\u0926 \u0906\u092A\u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902\u0917\u0947\u0964');
      return { text: t, speak: t, chips: T(['Request a callback', 'Contact details', 'Fees for Class 10'], ['\u0915\u0949\u0932\u092C\u0948\u0915 \u091A\u093E\u0939\u093F\u090F', '\u0938\u0902\u092A\u0930\u094D\u0915 \u0935\u093F\u0935\u0930\u0923', '\u0915\u0915\u094D\u0937\u093E 10 \u0915\u0940 \u092B\u0940\u0938']) };
    }
    var o = T("I can only help with BrightPath's courses, fees, batches, faculty, admissions and tests. What would you like to know?", '\u092E\u0948\u0902 \u0938\u093F\u0930\u094D\u092B\u093C \u092C\u094D\u0930\u093E\u0907\u091F\u092A\u093E\u0925 \u0915\u0947 \u0915\u094B\u0930\u094D\u0938, \u092B\u0940\u0938, \u092C\u0948\u091A, \u092B\u0948\u0915\u0932\u094D\u091F\u0940, \u090F\u0921\u092E\u093F\u0936\u0928 \u0914\u0930 \u091F\u0947\u0938\u094D\u091F \u092E\u0947\u0902 \u092E\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u093E \u0939\u0942\u0901\u0964 \u0906\u092A \u0915\u094D\u092F\u093E \u091C\u093E\u0928\u0928\u093E \u091A\u093E\u0939\u0947\u0902\u0917\u0947?');
    return { text: o, speak: o, chips: A.defaultChips() };
  }

  /* ================= ROUTER ================= */
  A.route = function (text) {
    var n = norm(text), toks = n.trim().split(' ');
    var m = { text: text, n: n, toks: toks, slots: detectSlots(text, n), lang: A.lang };
    if (F.active) { var r = flowInput(m); if (r) return r; }
    var b = best(n, toks), pend = A.ctx.pending;
    if (b.it && b.sc >= 1.8) {
      A.ctx.pending = null;
      var res = b.it.handler(m);
      if (F.active && b.it.id !== 'demo' && b.it.id !== 'enquiry') { res.chips = (res.chips || []).concat([T('Continue booking', '\u092C\u0941\u0915\u093F\u0902\u0917 \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902')]); }
      return res;
    }
    if (m.slots.any && pend) { var pi = A.intents.filter(function (i) { return i.id === pend; })[0]; if (pi) return pi.handler(m); }
    if (m.slots.any && A.ctx.last && ['fees', 'batch', 'faculty', 'discount'].indexOf(A.ctx.last) > -1) { var li = A.intents.filter(function (i) { return i.id === A.ctx.last; })[0]; if (li) return li.handler(m); }
    return fallback(m, m.slots);
  };
  A.handle = function (text, opts) {
    text = (text || '').trim(); if (!text) return;
    BP.chat.add('user', { text: text });
    A.lang = /[\u0900-\u097F]/.test(text) ? 'hi' : BP.settings.lang;
    var res;
    try { res = A.route(text); } catch (e) { console.error(e); res = { text: T('Sorry, something went wrong. Please try again.', '\u0915\u094D\u0937\u092E\u093E \u0915\u0930\u0947\u0902, \u0915\u0941\u091B \u0917\u0932\u0924 \u0939\u094B \u0917\u092F\u093E\u0964 \u0915\u0943\u092A\u092F\u093E \u092B\u093F\u0930 \u0915\u094B\u0936\u093F\u0936 \u0915\u0930\u0947\u0902\u0964') }; }
    if (res && res.intentId) A.ctx.last = res.intentId;
    var b = best(norm(text), norm(text).trim().split(' ')); if (b.it && b.sc >= 1.8) A.ctx.last = b.it.id;
    BP.say(res, { lang: A.lang });
  };

  /* ================= LEAD CAPTURE FLOW (name > class/exam > phone > batch > read-back confirmation) ================= */
  var F = A.flow = { active: false, type: 'enquiry', data: {}, step: null, stage: 'collect', pslots: null };
  var ORDER = ['name', 'prog', 'phone', 'batch'];
  var CANCEL = ['cancel', 'stop', 'nevermind', 'never mind', 'leave it', '\u0930\u0926\u094D\u0926', '\u0930\u0939\u0928\u0947 \u0926\u094B', '\u091B\u094B\u0921\u093C\u094B', '\u091B\u094B\u0921\u093C \u0926\u094B'];
  var YES = ['yes', 'yeah', 'yep', 'correct', 'right', 'confirm', 'ok', 'okay', 'sure', 'haan', 'han', 'ji', 'sahi', '\u0939\u093E\u0901', '\u0939\u093E\u0902', '\u091C\u0940', '\u0938\u0939\u0940', '\u0920\u0940\u0915', '\u0915\u0928\u094D\u092B\u0930\u094D\u092E', '\u0915\u0928\u094D\u092B\u093C\u0930\u094D\u092E'];
  var NO = ['no', 'nope', 'wrong', 'change', 'edit', 'incorrect', 'nahi', 'nahin', '\u0928\u0939\u0940\u0902', '\u0917\u0932\u0924', '\u092C\u0926\u0932\u094B', '\u092C\u0926\u0932\u0947\u0902', '\u092C\u0926\u0932\u0928\u093E'];
  var FIELDW = { name: ['name', 'naam', '\u0928\u093E\u092E'], prog: ['class', 'exam', 'course', '\u0915\u094D\u0932\u093E\u0938', '\u0915\u0915\u094D\u0937\u093E', '\u0915\u094B\u0930\u094D\u0938'], phone: ['phone', 'number', 'mobile', '\u0928\u0902\u092C\u0930', '\u092B\u094B\u0928', '\u092E\u094B\u092C\u093E\u0907\u0932'], batch: ['batch', 'timing', '\u092C\u0948\u091A'] };
  var DIG = { zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, shunya: 0, ek: 1, do: 2, teen: 3, char: 4, chaar: 4, paanch: 5, panch: 5, chhe: 6, chah: 6, saat: 7, aath: 8, nau: 9,
    '\u0936\u0942\u0928\u094D\u092F': 0, '\u090F\u0915': 1, '\u0926\u094B': 2, '\u0924\u0940\u0928': 3, '\u091A\u093E\u0930': 4, '\u092A\u093E\u0902\u091A': 5, '\u092A\u093E\u0901\u091A': 5, '\u091B\u0939': 6, '\u091B\u0903': 6, '\u0938\u093E\u0924': 7, '\u0906\u0920': 8, '\u0928\u094C': 9 };
  function digitsFrom(raw, toks) {
    var d = raw.replace(/[\u0966-\u096F]/g, function (c) { return c.charCodeAt(0) - 0x966; }), out = '';
    d.split(/\s+/).forEach(function (w) { var c = w.replace(/\D/g, ''); if (c && c.length === w.replace(/[^\p{L}\p{M}\p{N}]/gu, '').length) out += c; });
    if (out.length < 10) { out = ''; toks.forEach(function (t) { if (/^\d+$/.test(t)) out += t; else if (DIG[t] != null) out += DIG[t]; }); }
    return out.length >= 10 ? out.slice(-10) : '';
  }
  function parseName(raw) {
    var s = raw.replace(/^\s*(my name is|name is|i am|i'm|this is|it is|its|mera naam|mera nam|\u092E\u0947\u0930\u093E \u0928\u093E\u092E|\u0928\u093E\u092E \u0939\u0948|\u092E\u0948\u0902|\u092E\u0948)\s+/i, '').replace(/\s+(hai|\u0939\u0948)\s*$/i, '').replace(/[^\p{L}\p{M}\s.'-]/gu, '').trim();
    if (s.length < 2 || s.length > 40 || s.split(/\s+/).length > 5 || /\d/.test(raw.replace(/\D/g, '').length > 3 ? '1' : '')) return '';
    return s.replace(/\b([a-z])/g, function (c) { return c.toUpperCase(); });
  }
  function parseBatch(n) {
    if (hasAny(n, ['morning', 'subah', 'subha', '\u0938\u0941\u092C\u0939'])) return 'morning';
    if (hasAny(n, ['evening', 'shaam', 'sham', '\u0936\u093E\u092E'])) return 'evening';
    if (hasAny(n, ['weekend', 'saturday', 'sunday', 'weekends', '\u0935\u0940\u0915\u0947\u0902\u0921', '\u0938\u092A\u094D\u0924\u093E\u0939\u093E\u0902\u0924', '\u0936\u0928\u093F\u0935\u093E\u0930', '\u0930\u0935\u093F\u0935\u093E\u0930'])) return 'weekend';
    return '';
  }
  function batchName(b) { return { morning: T('morning', '\u0938\u0941\u092C\u0939 \u0915\u093E'), evening: T('evening', '\u0936\u093E\u092E \u0915\u093E'), weekend: T('weekend', '\u0935\u0940\u0915\u0947\u0902\u0921') }[b]; }
  function prompt(step) {
    return {
      name: { t: T("May I have the student's name?", '\u0935\u093F\u0926\u094D\u092F\u093E\u0930\u094D\u0925\u0940 \u0915\u093E \u0928\u093E\u092E \u092C\u0924\u093E\u0907\u090F?'), c: [] },
      prog: { t: T('Which class or exam is this for?', '\u092F\u0939 \u0915\u093F\u0938 \u0915\u0915\u094D\u0937\u093E \u092F\u093E \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0915\u0947 \u0932\u093F\u090F \u0939\u0948?'), c: progChips() },
      phone: { t: T('Please share a 10-digit mobile number for our counsellor to call.', '\u0915\u093E\u0909\u0902\u0938\u0932\u0930 \u0915\u0947 \u0915\u0949\u0932 \u0915\u0947 \u0932\u093F\u090F 10 \u0905\u0902\u0915\u094B\u0902 \u0915\u093E \u092E\u094B\u092C\u093E\u0907\u0932 \u0928\u0902\u092C\u0930 \u092C\u0924\u093E\u0907\u090F\u0964'), c: [] },
      batch: { t: T('Which batch do you prefer: morning, evening or weekend?', '\u0906\u092A\u0915\u094B \u0915\u094C\u0928 \u0938\u093E \u092C\u0948\u091A \u091A\u093E\u0939\u093F\u090F: \u0938\u0941\u092C\u0939, \u0936\u093E\u092E \u092F\u093E \u0935\u0940\u0915\u0947\u0902\u0921?'), c: T(['Morning', 'Evening', 'Weekend'], ['\u0938\u0941\u092C\u0939', '\u0936\u093E\u092E', '\u0935\u0940\u0915\u0947\u0902\u0921']) }
    }[step];
  }
  A.startFlow = function (type, slots) {
    F.active = true; F.type = type; F.data = {}; F.pslots = null; F.stage = 'collect';
    if (slots && slots.any) { var ps = resolve(slots); if (ps.length === 1) F.data.prog = ps[0].id; else if (ps.length > 1) F.pslots = slots; }
    var pre = type === 'demo' ? T("Great, let's book your free demo class. ", '\u092C\u0922\u093C\u093F\u092F\u093E, \u0906\u092A\u0915\u0940 \u092E\u0941\u092B\u094D\u0924 \u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u092C\u0941\u0915 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964 ') : T("Sure, I'll arrange a counsellor call. ", '\u091C\u093C\u0930\u0942\u0930, \u092E\u0948\u0902 \u0915\u093E\u0909\u0902\u0938\u0932\u0930 \u0915\u0949\u0932 \u0915\u093E \u0907\u0902\u0924\u091C\u093C\u093E\u092E \u0915\u0930\u0924\u093E \u0939\u0942\u0901\u0964 ');
    return nextStep(pre);
  };
  function nextStep(pre) {
    var miss = ORDER.filter(function (k) { return !F.data[k]; });
    if (!miss.length) return confirmRes();
    F.step = miss[0]; F.stage = 'collect';
    var q = prompt(F.step), txt = (pre || '') + q.t;
    if (F.step === 'prog' && F.pslots) { txt = (pre || '') + T('Which stream or level exactly?', '\u0915\u094C\u0928 \u0938\u093E \u0938\u094D\u091F\u094D\u0930\u0940\u092E \u092F\u093E \u0932\u0947\u0935\u0932?'); q.c = resolve(F.pslots).map(function (p) { return A.pick(p.name); }); }
    return { text: txt, speak: txt, chips: q.c };
  }
  function confirmRes() {
    F.stage = 'confirm'; var d = F.data, p = A.prog(d.prog), nm = A.pick(p.name);
    var ph = d.phone.split('').join(' ');
    var read = T('Please confirm: name ' + d.name + ', for ' + nm + ', phone ' + ph + ', ' + batchName(d.batch) + ' batch. Is this correct?', '\u0915\u0943\u092A\u092F\u093E \u092A\u0941\u0937\u094D\u091F\u093F \u0915\u0930\u0947\u0902: \u0928\u093E\u092E ' + d.name + ', ' + nm + ' \u0915\u0947 \u0932\u093F\u090F, \u092B\u094B\u0928 ' + ph + ', ' + batchName(d.batch) + ' \u092C\u0948\u091A\u0964 \u0915\u094D\u092F\u093E \u092F\u0939 \u0938\u0939\u0940 \u0939\u0948?');
    var yes = T('Yes, confirm', '\u0939\u093E\u0901, \u0915\u0928\u094D\u092B\u0930\u094D\u092E'), no = T('Change something', '\u0915\u0941\u091B \u092C\u0926\u0932\u0928\u093E \u0939\u0948');
    return { text: read, speak: read, card: { type: 'confirm', title: F.type === 'demo' ? T('Demo class request', '\u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u0905\u0928\u0941\u0930\u094B\u0927') : T('Enquiry details', '\u091C\u093E\u0928\u0915\u093E\u0930\u0940'), data: { name: d.name, prog: d.prog, phone: d.phone, batch: d.batch }, yes: yes, no: no }, chips: [yes, no] };
  }
  function saveLead() {
    var d = F.data, leads = BP.store.get('leads', []);
    var L = { id: 'L' + Date.now().toString(36), ts: Date.now(), type: F.type, name: d.name, prog: A.prog(d.prog).name.en, progId: d.prog, phone: d.phone, batch: d.batch, status: 'New', source: 'chat' };
    leads.unshift(L); BP.store.set('leads', leads); BP.emit('lead:saved', L); return L;
  }
  function flowInput(m) {
    var n = m.n, toks = m.toks, d = F.data;
    if (hasAny(n, CANCEL)) { F.active = false; var c = T("No problem, I've cancelled that. Anything else I can help with?", '\u0920\u0940\u0915 \u0939\u0948, \u092E\u0948\u0902\u0928\u0947 \u0907\u0938\u0947 \u0930\u0926\u094D\u0926 \u0915\u0930 \u0926\u093F\u092F\u093E\u0964 \u0914\u0930 \u0915\u0941\u091B \u092E\u0926\u0926 \u0915\u0930\u0942\u0901?'); return { text: c, speak: c, chips: A.defaultChips() }; }
    if (hasAny(n, ['continue booking', 'continue', 'resume', '\u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902'])) return F.stage === 'confirm' ? confirmRes() : nextStep('');
    var b = best(n, toks);
    if (F.stage === 'confirm') {
      var ph = digitsFrom(m.text, toks);
      if (ph && /^[6-9]/.test(ph)) { d.phone = ph; return confirmRes(); }
      var fld = null; Object.keys(FIELDW).forEach(function (k) { if (hasAny(n, FIELDW[k])) fld = k; });
      var no = hasAny(n, NO), yes = hasAny(n, YES);
      if (fld && (no || n.indexOf(' change ') > -1)) { delete d[fld]; return nextStep(T('Okay. ', '\u0920\u0940\u0915 \u0939\u0948\u0964 ')); }
      if (yes && !no) {
        var L = saveLead(); F.active = false;
        var what = L.type === 'demo' ? T('demo class request', '\u0921\u0947\u092E\u094B \u0915\u094D\u0932\u093E\u0938 \u0905\u0928\u0941\u0930\u094B\u0927') : T('enquiry', '\u091C\u093E\u0928\u0915\u093E\u0930\u0940');
        var t = T('Thank you, ' + L.name + '! Your ' + what + ' for ' + L.prog + ' is saved. Our counsellor will call you on ' + L.phone + ' to confirm the ' + L.batch + ' batch.', '\u0927\u0928\u094D\u092F\u0935\u093E\u0926 ' + L.name + '! ' + L.prog + ' \u0915\u0947 \u0932\u093F\u090F \u0906\u092A\u0915\u0940 ' + what + ' \u0938\u0939\u0947\u091C \u0932\u0940 \u0917\u0908 \u0939\u0948\u0964 \u0939\u092E\u093E\u0930\u0947 \u0915\u093E\u0909\u0902\u0938\u0932\u0930 ' + L.phone + ' \u092A\u0930 \u0915\u0949\u0932 \u0915\u0930\u0915\u0947 \u092C\u0948\u091A \u0915\u0940 \u092A\u0941\u0937\u094D\u091F\u093F \u0915\u0930\u0947\u0902\u0917\u0947\u0964');
        return { text: t, speak: t, chips: T(['Fees for ' + L.prog, 'Meet the faculty', 'Admission process'], ['\u092B\u0940\u0938', '\u092B\u0948\u0915\u0932\u094D\u091F\u0940', '\u090F\u0921\u092E\u093F\u0936\u0928 \u092A\u094D\u0930\u0915\u094D\u0930\u093F\u092F\u093E']) };
      }
      if (no) { var q = T('Which one should I change: name, class, phone or batch?', '\u0915\u094D\u092F\u093E \u092C\u0926\u0932\u0928\u093E \u0939\u0948: \u0928\u093E\u092E, \u0915\u0915\u094D\u0937\u093E, \u092B\u094B\u0928 \u092F\u093E \u092C\u0948\u091A?'); return { text: q, speak: q, chips: T(['Name', 'Class', 'Phone', 'Batch'], ['\u0928\u093E\u092E', '\u0915\u0915\u094D\u0937\u093E', '\u092B\u094B\u0928', '\u092C\u0948\u091A']) }; }
      if (fld) { delete d[fld]; return nextStep(''); }
      return b.sc >= 1.8 ? null : confirmRes();
    }
    var ok = false;
    if (F.step === 'name') { if (b.sc >= 2.4) return null; var nm = parseName(m.text); if (nm) { d.name = nm; ok = true; } }
    else if (F.step === 'prog') {
      var sl = Object.assign({}, F.pslots || {}); var ns = detectSlots(m.text, n);
      ['cls', 'stream', 'exam'].forEach(function (k) { if (ns[k]) sl[k] = ns[k]; }); sl.any = !!(sl.cls || sl.stream || sl.exam);
      var ps = resolve(sl);
      if (ps.length === 1) { d.prog = ps[0].id; F.pslots = null; ok = true; }
      else if (ps.length > 1) { F.pslots = sl; return nextStep(''); }
    }
    else if (F.step === 'phone') { var p10 = digitsFrom(m.text, toks); if (/^[6-9]\d{9}$/.test(p10)) { d.phone = p10; ok = true; } }
    else if (F.step === 'batch') { var bt = parseBatch(n); if (bt) { d.batch = bt; ok = true; } }
    if (ok) return nextStep('');
    if (b.sc >= 1.8) return null;
    var again = T("Sorry, I didn't catch that. ", '\u092E\u093E\u092B\u093C \u0915\u0940\u091C\u093F\u090F\u0917\u093E, \u092E\u0948\u0902 \u0938\u092E\u091D \u0928\u0939\u0940\u0902 \u092A\u093E\u092F\u093E\u0964 ');
    return nextStep(again);
  }
  A.flowInput = flowInput;
})(window.BP);
