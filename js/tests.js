/* ======================================================================
   BrightPath tests.js (Cell 2) - test engine, performance meter, ranking, voice commands.
   Question banks live in separate files and register through a queue:
     (window.BP_QB = window.BP_QB || []).push([examId, subject, rows])
     row = [chapter, question, "opt1|opt2|opt3|opt4", correctIndex, explanation]
   examId: c1..c12, jee, neet, upsc, ca-f, ca-i, ca-fin.  Add questions by pushing more rows.
   PUBLIC API: BP.tests.start({exam,subject,chapter,neg}) | history() | weak(n) | rankInfo(exam)
               examName(id) | openTab(tab, exam) | BP.qb.get(exam) | BP.qb.chapters(exam, subject)
   Event: BP.on('test:done', fn(resultObject))
   ====================================================================== */
(function (BP) {
  'use strict';
  BP.mods.tests = true;
  var $ = BP.$, $$ = BP.$$, E = BP.esc, tt = function (k) { return BP.t(k); };
  var S = BP.tests = BP.tests || {};
  var QB = BP.qb = BP.qb || { data: {}, loading: 0 };

  /* ---------------- UI strings (English + Hindi) ---------------- */
  var EN = {
    tt_title: 'Tests & Ranking', tt_start: 'Practice', tt_perf: 'Performance', tt_rank: 'Rank',
    tt_pick_exam: 'Choose class or exam', tt_school: 'School classes', tt_comp: 'Competitive & professional',
    tt_pick_sub: 'Choose subject', tt_pick_ch: 'Choose chapter or full test', tt_full_sub: 'Full subject test',
    tt_all_sub: 'Full mock (all subjects)', tt_neg: 'Negative marking', tt_begin: 'Start test', tt_qs: 'questions', tt_min: 'min',
    tt_nobank: 'Questions for this section are not installed yet. They arrive with the next update cells.',
    tt_q: 'Question', tt_prev: 'Previous', tt_next: 'Next', tt_mark: 'Mark for review', tt_marked: 'Marked', tt_clear: 'Clear',
    tt_pal: 'Palette', tt_submit: 'Submit test', tt_read: 'Read aloud', tt_confirm_sub: 'Submit the test now? Unanswered:',
    tt_ans: 'Answered', tt_unans: 'Not answered', tt_review: 'For review', tt_timeup: "Time's up! Submitting your test.",
    tt_res: 'Result', tt_score: 'Score', tt_acc: 'Accuracy', tt_tpq: 'Time / question', tt_cor: 'Correct', tt_wrong: 'Wrong', tt_skip: 'Skipped',
    tt_sub_perf: 'Subject-wise performance', tt_ch_perf: 'Chapter-wise performance', tt_explain: 'Review and explanations',
    tt_your: 'Your answer', tt_right: 'Correct answer', tt_all: 'All', tt_retake: 'Retake test', tt_see_rank: 'See my rank', tt_home: 'Back to tests', tt_none: 'Not answered',
    tt_avg: 'Average score', tt_attempt: 'Attempt rate', tt_taken: 'Tests taken', tt_tests: 'tests', tt_strong: 'Strengths', tt_weak: 'Weak topics',
    tt_practice: 'Practice', tt_recent: 'Recent tests', tt_no_hist: 'No tests yet. Take your first test to see your performance.',
    tt_of: 'of', tt_pctile: 'Percentile', tt_change: 'Rank change', tt_new: 'New', tt_you: 'You', tt_top: 'Leaderboard',
    tt_no_rank: 'Take a test in this class or exam to get ranked against your peers.', tt_open_lb: 'Open leaderboard', tt_open_perf: 'Open report',
    tt_marking: 'Marking', tt_peers: 'Ranked against simulated peers (demo data)',
    tt_nofull: 'This chapter has no questions yet, so a full subject test was started.', tt_none_weak: 'Not enough data yet', tt_acc_short: 'accuracy'
  };
  var HI = {
    tt_title: 'टेस्ट और रैंकिंग', tt_start: 'अभ्यास', tt_perf: 'प्रदर्शन', tt_rank: 'रैंक',
    tt_pick_exam: 'कक्षा या परीक्षा चुनें', tt_school: 'स्कूल कक्षाएँ', tt_comp: 'प्रतियोगी और प्रोफेशनल',
    tt_pick_sub: 'विषय चुनें', tt_pick_ch: 'अध्याय या पूरा टेस्ट चुनें', tt_full_sub: 'पूरे विषय का टेस्ट',
    tt_all_sub: 'पूरा मॉक (सभी विषय)', tt_neg: 'नेगेटिव मार्किंग', tt_begin: 'टेस्ट शुरू करें', tt_qs: 'प्रश्न', tt_min: 'मिनट',
    tt_nobank: 'इस सेक्शन के प्रश्न अभी जोड़े नहीं गए हैं। वे अगले अपडेट सेल के साथ आएँगे।',
    tt_q: 'प्रश्न', tt_prev: 'पिछला', tt_next: 'अगला', tt_mark: 'रिव्यू के लिए चिह्नित करें', tt_marked: 'चिह्नित', tt_clear: 'हटाएँ',
    tt_pal: 'पैलेट', tt_submit: 'टेस्ट जमा करें', tt_read: 'ज़ोर से पढ़ें', tt_confirm_sub: 'क्या अभी टेस्ट जमा करें? अनुत्तरित:',
    tt_ans: 'उत्तर दिया', tt_unans: 'उत्तर नहीं दिया', tt_review: 'रिव्यू के लिए', tt_timeup: 'समय समाप्त! टेस्ट जमा हो रहा है।',
    tt_res: 'परिणाम', tt_score: 'स्कोर', tt_acc: 'सटीकता', tt_tpq: 'समय / प्रश्न', tt_cor: 'सही', tt_wrong: 'गलत', tt_skip: 'छोड़े',
    tt_sub_perf: 'विषयवार प्रदर्शन', tt_ch_perf: 'अध्यायवार प्रदर्शन', tt_explain: 'समीक्षा और व्याख्या',
    tt_your: 'आपका उत्तर', tt_right: 'सही उत्तर', tt_all: 'सभी', tt_retake: 'दोबारा दें', tt_see_rank: 'मेरी रैंक देखें', tt_home: 'टेस्ट पर वापस', tt_none: 'उत्तर नहीं दिया',
    tt_avg: 'औसत स्कोर', tt_attempt: 'प्रयास दर', tt_taken: 'दिए गए टेस्ट', tt_tests: 'टेस्ट', tt_strong: 'मज़बूत पक्ष', tt_weak: 'कमज़ोर टॉपिक',
    tt_practice: 'अभ्यास', tt_recent: 'हाल के टेस्ट', tt_no_hist: 'अभी कोई टेस्ट नहीं। अपना प्रदर्शन देखने के लिए पहला टेस्ट दें।',
    tt_of: 'में से', tt_pctile: 'पर्सेंटाइल', tt_change: 'रैंक बदलाव', tt_new: 'नया', tt_you: 'आप', tt_top: 'लीडरबोर्ड',
    tt_no_rank: 'साथियों के बीच रैंक पाने के लिए इस कक्षा या परीक्षा में टेस्ट दें।', tt_open_lb: 'लीडरबोर्ड खोलें', tt_open_perf: 'रिपोर्ट खोलें',
    tt_marking: 'अंकन', tt_peers: 'काल्पनिक साथियों के बीच रैंक (डेमो डेटा)',
    tt_nofull: 'इस अध्याय में अभी प्रश्न नहीं हैं, इसलिए पूरे विषय का टेस्ट शुरू किया गया।', tt_none_weak: 'अभी पर्याप्त डेटा नहीं', tt_acc_short: 'सटीकता'
  };
  Object.assign(BP.packs.en.ui, EN); Object.assign(BP.packs.hi.ui, HI);

  /* ---------------- styles (injected, so no extra css file is needed) ---------------- */
  var CSS = `
.tt-tabs{display:flex;gap:8px;margin:2px 0 12px}
.tt-tabs button{flex:1;padding:10px 6px;border-radius:14px;font-weight:600;font-size:13.5px;color:var(--mut);background:rgba(255,255,255,.07);border:1px solid var(--gb);transition:.2s}
.tt-tabs button.on{color:#fff;background:linear-gradient(135deg,rgba(255,122,26,.38),rgba(20,211,196,.2));border-color:rgba(255,255,255,.3);box-shadow:0 0 20px rgba(255,122,26,.2)}
.tt-h{font-size:15px;margin:16px 2px 8px;color:var(--teal)}
.tt-lbl{font-size:11.5px;color:var(--mut);margin:8px 2px 6px;text-transform:uppercase;letter-spacing:.6px}
.tt-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.tt-grid.wide{grid-template-columns:repeat(2,1fr)}
.tt-b{padding:11px 6px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid var(--gb);font-weight:600;font-size:13px;text-align:center;transition:.2s}
.tt-b:active,.tt-chip:active{transform:scale(.95)}
.tt-b.on{background:linear-gradient(135deg,#ff9a3c,var(--orange));border-color:transparent;color:#fff;box-shadow:0 6px 18px rgba(255,122,26,.35)}
.tt-chips{display:flex;flex-wrap:wrap;gap:8px}
.tt-chip{padding:9px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--gb);font-size:13px;font-weight:500;transition:.2s;text-align:left}
.tt-chip.on{background:linear-gradient(135deg,var(--teal),#0fa89c);color:#04201e;border-color:transparent;font-weight:600}
.chip.on{background:var(--teal);color:#04201e;border-color:transparent}
.tt-empty{text-align:center;padding:24px 14px}
.small{font-size:12px}
.tr-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 8px}
.tmr{font:700 22px 'Poppins',sans-serif;color:var(--teal);text-shadow:0 0 14px rgba(20,211,196,.5);letter-spacing:1px}
.tmr.low{color:#ff5a5f;text-shadow:0 0 14px rgba(255,90,95,.6);animation:float 1s infinite}
.bar{height:8px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}
.bar i{display:block;height:100%;width:0;border-radius:99px;transition:width 1s cubic-bezier(.2,.8,.2,1)}
.tr-q{margin-top:12px}
.q-t{font-size:17px;font-weight:600;line-height:1.5;margin:10px 0 14px}
.opt{display:flex;gap:12px;align-items:flex-start;width:100%;text-align:left;padding:12px 14px;margin:8px 0;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid var(--gb);transition:.2s}
.opt:active{transform:scale(.985)}
.opt.on{border-color:var(--teal);background:rgba(20,211,196,.15);box-shadow:0 0 18px rgba(20,211,196,.25)}
.ol{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:12px;background:rgba(255,255,255,.12)}
.opt.on .ol{background:var(--teal);color:#04201e}
.tr-act{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 10px}.tr-act .btn{flex:1;min-width:84px;text-align:center}
.btn.on{background:linear-gradient(135deg,var(--teal),#0fa89c);color:#04201e}
.pal{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:8px}
.pal button{height:42px;border-radius:12px;font-weight:600;background:rgba(255,255,255,.07);border:1px solid var(--gb)}
.pal .ans{background:rgba(20,211,196,.28);border-color:var(--teal)}.pal .mk{background:rgba(255,122,26,.34);border-color:var(--orange)}.pal .cur{outline:2px solid #fff}
.lg{display:flex;gap:12px;flex-wrap:wrap;font-size:11.5px;color:var(--mut);margin-top:10px}.lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.gwrap{display:flex;align-items:center;gap:14px}
.gg{position:relative;width:118px;flex:none;text-align:center}
.gg svg{width:100%;height:auto;display:block}
.gg .gv{transition:stroke-dashoffset 1.3s cubic-bezier(.2,.8,.2,1)}
.gg .gn{position:absolute;left:0;right:0;top:0;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;gap:1px}
.gg .gn b{font:700 24px 'Poppins',sans-serif}.gg .gn small{color:var(--mut);margin-top:6px}
.gg>span{display:block;font-size:12px;color:var(--mut);margin-top:2px}
.grow{display:flex;gap:8px;justify-content:space-around}.grow .gg{width:31%}
.bar-r{margin:11px 0}.bar-h{display:flex;justify-content:space-between;gap:8px;font-size:13px;margin-bottom:5px}.bar-h span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.radar{max-width:330px;margin:4px auto}.radar svg{width:100%;height:auto;display:block}.radar text{fill:#cfe0ff;font-size:10px}
.stats.wrap{flex-wrap:wrap}.stats.wrap>div{min-width:30%}
.rv{border-top:1px solid rgba(255,255,255,.1);padding:12px 0}
.st{font-size:11px;font-weight:700;padding:2px 9px;border-radius:99px}
.st.ok{background:rgba(20,211,196,.2);color:var(--teal)}.st.no{background:rgba(255,90,95,.2);color:#ff7a7f}.st.sk{background:rgba(255,255,255,.12);color:var(--mut)}
.ex{margin-top:8px;padding:10px 12px;border-radius:12px;background:rgba(20,211,196,.09);font-size:13.5px}
.lb-r{display:flex;align-items:center;gap:10px;padding:9px 8px;border-radius:12px}
.lb-r.me{background:linear-gradient(90deg,rgba(255,122,26,.3),rgba(20,211,196,.12));border:1px solid rgba(255,255,255,.22)}
.lb-n{width:30px;text-align:center;font:700 14px 'Poppins',sans-serif}.lb-n.g1{color:#ffd24a}.lb-n.g2{color:#d6dde8}.lb-n.g3{color:#e39a5f}
.av{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:13px;background:linear-gradient(135deg,var(--teal),#0b7f78);color:#04201e;flex:none}
.lb-r b{flex:1;min-width:0;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.up{color:var(--teal);font-size:12px;font-weight:600}.dn{color:#ff7a7f;font-size:12px;font-weight:600}
.tt-fl{margin:0 -14px 8px}
.wk{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid rgba(255,255,255,.08);font-size:13.5px}.wk>div{flex:1;min-width:0}.wk small{color:var(--mut);display:block}
@media(min-width:700px){.tt-grid{grid-template-columns:repeat(6,1fr)}.tt-grid.wide{grid-template-columns:repeat(3,1fr)}.gg{width:140px}}
`;
  if (!document.getElementById('tt-css')) { var stl = document.createElement('style'); stl.id = 'tt-css'; stl.textContent = CSS; document.head.appendChild(stl); }

  /* ---------------- question bank registry ---------------- */
  QB.add = function (exam, subject, rows) {
    var d = QB.data[exam] = QB.data[exam] || {}, a = d[subject] = d[subject] || [];
    rows.forEach(function (r) { a.push({ ch: r[0], q: r[1], o: String(r[2]).split('|'), a: r[3], e: r[4] || '' }); });
  };
  QB.drain = function () { var q = window.BP_QB; if (!q) return; while (q.length) { var x = q.shift(); QB.add(x[0], x[1], x[2]); } };
  QB.get = function (exam) { QB.drain(); var d = QB.data[exam]; return d && Object.keys(d).length ? d : null; };
  QB.chapters = function (exam, sub) {
    var d = QB.get(exam), out = [], idx = {}; if (!d || !d[sub]) return out;
    d[sub].forEach(function (q) { if (idx[q.ch] == null) { idx[q.ch] = out.length; out.push({ ch: q.ch, n: 0 }); } out[idx[q.ch]].n++; });
    return out;
  };
  QB.files = ['js/qb-jee-neet.js', 'js/qb-ca-upsc.js', 'js/qb-class11-12.js', 'js/qb-class1-5.js', 'js/qb-class6-10.js', 'js/qb-lang-6-12.js'];
  QB.loading = QB.files.length;
  QB.files.forEach(function (f) {
    var s = document.createElement('script'); s.src = f + '?v=' + Date.now();
    s.onload = s.onerror = function () { QB.loading--; QB.drain(); };
    document.body.appendChild(s);
  });

  /* ---------------- catalog, names, marking schemes ---------------- */
  var CAT = [];
  for (var ci = 1; ci <= 12; ci++) CAT.push({ id: 'c' + ci, g: 'school', en: 'Class ' + ci, hi: 'कक्षा ' + ci });
  CAT.push({ id: 'jee', g: 'comp', en: 'JEE', hi: 'JEE' }, { id: 'neet', g: 'comp', en: 'NEET', hi: 'NEET' },
    { id: 'upsc', g: 'comp', en: 'UPSC Prelims', hi: 'UPSC प्रीलिम्स' }, { id: 'ca-f', g: 'comp', en: 'CA Foundation', hi: 'CA फाउंडेशन' },
    { id: 'ca-i', g: 'comp', en: 'CA Inter', hi: 'CA इंटर' }, { id: 'ca-fin', g: 'comp', en: 'CA Final', hi: 'CA फाइनल' });
  S.catalog = CAT;
  var SUBJ_HI = { Mathematics: 'गणित', Science: 'विज्ञान', English: 'अंग्रेज़ी', Hindi: 'हिंदी', 'Social Science': 'सामाजिक विज्ञान', EVS: 'पर्यावरण अध्ययन',
    Physics: 'भौतिकी', Chemistry: 'रसायन विज्ञान', Biology: 'जीव विज्ञान', Accountancy: 'लेखाशास्त्र', 'Business Studies': 'व्यावसायिक अध्ययन', Economics: 'अर्थशास्त्र',
    'GS Prelims': 'सामान्य अध्ययन', CSAT: 'CSAT' };
  function lg() { return BP.settings.lang === 'hi' ? 'hi' : 'en'; }
  function catOf(id) { for (var i = 0; i < CAT.length; i++) if (CAT[i].id === id) return CAT[i]; return null; }
  S.examName = function (id) { var c = catOf(id); return c ? c[lg()] : id; };
  function subName(s) { return s === '*' ? tt('tt_all_sub') : (lg() === 'hi' ? (SUBJ_HI[s] || s) : s); }
  S.subName = subName;
  function isComp(id) { var c = catOf(id); return !!c && c.g === 'comp'; }
  function scheme(id) {
    if (id === 'jee' || id === 'neet') return { c: 4, w: 1, sec: 75, neg: true };
    if (id === 'upsc') return { c: 2, w: 2 / 3, sec: 72, neg: true };
    if (id.indexOf('ca') === 0) return { c: 1, w: 0.25, sec: 90, neg: true };
    return { c: 1, w: 0, sec: 45, neg: false };
  }
  function fmt(s) { s = Math.max(0, Math.round(s)); var m = Math.floor(s / 60), x = s % 60; return (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function norm(s) { return BP.agent.util.norm(s).trim(); }
  function col(p) { return p >= 75 ? '#14d3c4' : p >= 50 ? '#ffb020' : '#ff5a5f'; }
  function hist() { return BP.store.get('tests', []); }
  S.history = hist;
  function lastExam() { var h = hist(); return h.length ? h[h.length - 1].exam : null; }
  function speakNow(text) {
    if (!BP.voice) return;
    var lang = /[\u0900-\u097F]/.test(text) ? 'hi' : 'en', v = BP.settings.voiceOn;
    BP.settings.voiceOn = true; BP.voice.speak(text, lang); BP.settings.voiceOn = v;
  }
  var GRID = BP.svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>');

  /* ---------------- SVG / chart widgets ---------------- */
  function gauge(p, label, color, stat) {
    p = Math.max(0, Math.min(100, p)); var C = 2 * Math.PI * 42, off = (C * (1 - p / 100)).toFixed(1);
    return '<div class="gg"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="9"/>' +
      '<circle class="gv" cx="50" cy="50" r="42" fill="none" stroke="' + color + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (stat ? off : C.toFixed(1)) + '" data-off="' + off + '" transform="rotate(-90 50 50)"/></svg>' +
      '<div class="gn"><b' + (stat ? '' : ' class="cnt" data-v="' + Math.round(p) + '"') + '>' + (stat ? Math.round(p) : 0) + '</b><small>%</small></div><span>' + E(label) + '</span></div>';
  }
  function bar(label, pct, sub) {
    pct = Math.max(0, Math.min(100, pct));
    return '<div class="bar-r"><div class="bar-h"><span>' + E(label) + (sub ? ' <small class="mut">' + E(sub) + '</small>' : '') + '</span><b>' + Math.round(pct) + '%</b></div><div class="bar"><i data-w="' + Math.round(pct) + '" style="background:' + col(pct) + '"></i></div></div>';
  }
  function radar(items) {
    var n = items.length, cx = 140, cy = 130, R = 78, grid = '', axes = '', lbl = '', pts = [], dots = '', g, i, a, pp;
    for (g = 1; g <= 4; g++) {
      pp = [];
      for (i = 0; i < n; i++) { a = -Math.PI / 2 + i * 2 * Math.PI / n; pp.push((cx + R * g / 4 * Math.cos(a)).toFixed(1) + ',' + (cy + R * g / 4 * Math.sin(a)).toFixed(1)); }
      grid += '<polygon points="' + pp.join(' ') + '" fill="none" stroke="rgba(255,255,255,.14)"/>';
    }
    for (i = 0; i < n; i++) {
      a = -Math.PI / 2 + i * 2 * Math.PI / n; var ca = Math.cos(a), sa = Math.sin(a), v = Math.max(0, Math.min(100, items[i].v)) / 100;
      axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R * ca).toFixed(1) + '" y2="' + (cy + R * sa).toFixed(1) + '" stroke="rgba(255,255,255,.12)"/>';
      var px = (cx + R * v * ca).toFixed(1), py = (cy + R * v * sa).toFixed(1); pts.push(px + ',' + py);
      dots += '<circle cx="' + px + '" cy="' + py + '" r="3.5" fill="var(--orange)"/>';
      var nm = items[i].l.length > 12 ? items[i].l.slice(0, 11) + '\u2026' : items[i].l;
      lbl += '<text x="' + (cx + (R + 12) * ca).toFixed(1) + '" y="' + (cy + (R + 12) * sa + 3).toFixed(1) + '" text-anchor="' + (ca > 0.3 ? 'start' : ca < -0.3 ? 'end' : 'middle') + '">' + E(nm) + '</text>';
    }
    return '<div class="radar"><svg viewBox="0 0 280 260">' + grid + axes + '<polygon points="' + pts.join(' ') + '" fill="rgba(20,211,196,.28)" stroke="var(--teal)" stroke-width="2"/>' + dots + lbl + '</svg></div>';
  }
  function animateIn(root) {
    setTimeout(function () {
      $$('.gv', root).forEach(function (el) { el.style.strokeDashoffset = el.getAttribute('data-off'); });
      $$('.bar i[data-w]', root).forEach(function (el) { el.style.width = el.getAttribute('data-w') + '%'; });
      $$('.cnt', root).forEach(function (el) {
        var v = +el.getAttribute('data-v'), t0 = performance.now();
        (function f(t) { var k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(v * k); if (k < 1) requestAnimationFrame(f); })(t0);
      });
    }, 60);
  }

  /* ---------------- building a test ---------------- */
  function selectQs(o) {
    var d = QB.get(o.exam); if (!d) return [];
    var subs = (o.subject && o.subject !== '*') ? [o.subject] : Object.keys(d);
    var cap = o.subject === '*' ? 30 : (isComp(o.exam) ? 25 : 20), per = Math.ceil(cap / subs.length), out = [];
    subs.forEach(function (s) {
      var pool = (d[s] || []).filter(function (q) { return !o.chapter || o.chapter === '*' || q.ch === o.chapter; });
      shuffle(pool.slice()).slice(0, per).forEach(function (q) {
        var idx = []; for (var k = 0; k < q.o.length; k++) idx.push(k);
        if (!q.o.some(function (t) { return /above|both|none of|all of/i.test(t); })) shuffle(idx);
        out.push({ s: s, ch: q.ch, q: q.q, o: idx.map(function (k) { return q.o[k]; }), a: idx.indexOf(q.a), e: q.e, sel: null, mark: false, t: 0 });
      });
    });
    return out;
  }
  function detectChapter(exam, sub, n) {
    var chs = QB.chapters(exam, sub), padded = ' ' + n + ' ';
    for (var i = 0; i < chs.length; i++) {
      var nc = norm(chs[i].ch);
      if (padded.indexOf(' ' + nc + ' ') > -1) return chs[i].ch;
      var tk = nc.split(' ').filter(function (w) { return w.length >= 4; });
      if (tk.length && tk.every(function (w) { return padded.indexOf(' ' + w) > -1; })) return chs[i].ch;
    }
    return null;
  }
  function matchChapter(exam, sub, txt) {
    var chs = QB.chapters(exam, sub), low = String(txt).toLowerCase();
    for (var i = 0; i < chs.length; i++) if (chs[i].ch.toLowerCase() === low) return chs[i].ch;
    return detectChapter(exam, sub, norm(txt));
  }
  S.start = function (o) {
    o = o || {}; var d = QB.get(o.exam);
    if (!d) return { ok: false, reason: 'nobank' };
    var sub = o.subject || '*'; if (sub !== '*' && !d[sub]) return { ok: false, reason: 'nosub' };
    var ch = o.chapter || '*', fb = false;
    if (ch !== '*') { var rc = matchChapter(o.exam, sub, ch); if (rc) ch = rc; else { ch = '*'; fb = true; } }
    var qs = selectQs({ exam: o.exam, subject: sub, chapter: ch });
    if (!qs.length) return { ok: false, reason: 'empty' };
    if (S.run && S.run.timer) clearInterval(S.run.timer);
    var sc = scheme(o.exam), neg = sc.neg && o.neg !== false, total = qs.length * sc.sec;
    S.run = { exam: o.exam, sub: sub, ch: ch, qs: qs, i: 0, total: total, left: total, neg: neg, pal: false, done: false, timer: null };
    S.run.timer = setInterval(tick, 1000); S.show = null; S.tab = 'start';
    if (o.nav !== false) BP.go('tests');
    return { ok: true, n: qs.length, min: Math.round(total / 60), fallback: fb, chapter: ch, subject: sub };
  };
  function tick() {
    var r = S.run; if (!r || r.done) return;
    r.left--; r.qs[r.i].t++;
    var t = BP.$('#tmr'); if (t) { t.textContent = fmt(r.left); t.classList.toggle('low', r.left < 60); }
    if (r.left <= 0) { BP.toast(tt('tt_timeup')); finish(); if (BP.cur === 'tests') paint(); }
  }
  function finish() {
    var r = S.run; if (!r || r.done) return;
    r.done = true; clearInterval(r.timer);
    var sc = scheme(r.exam), cor = 0, wr = 0, sk = 0, neg = !!r.neg;
    r.qs.forEach(function (q) { if (q.sel == null) sk++; else if (q.sel === q.a) cor++; else wr++; });
    var score = Math.round((cor * sc.c - (neg ? wr * sc.w : 0)) * 100) / 100, max = r.qs.length * sc.c;
    var R = { id: 'T' + Date.now().toString(36), ts: Date.now(), exam: r.exam, sub: r.sub, ch: r.ch, n: r.qs.length, cor: cor, wr: wr, sk: sk, score: score, max: max,
      pct: Math.max(0, Math.round(score / max * 1000) / 10), acc: (cor + wr) ? Math.round(cor / (cor + wr) * 1000) / 10 : 0,
      used: Math.max(1, r.total - r.left), neg: neg,
      det: r.qs.map(function (q) { return [q.s, q.ch, q.sel != null && q.sel === q.a ? 1 : 0, q.sel != null ? 1 : 0]; }) };
    var h = hist(); h.push(R); if (h.length > 60) h = h.slice(-60); BP.store.set('tests', h);
    S.last = R; S.lastRun = r; S.show = 'result'; S.rv = 'all';
    BP.emit('test:done', R);
  }

  /* ---------------- analytics helpers ---------------- */
  function flat(h) { var rows = []; h.forEach(function (e) { (e.det || []).forEach(function (d) { rows.push({ e: e.exam, s: d[0], ch: d[1], ok: d[2], att: d[3] }); }); }); return rows; }
  function group(rows, keyf, labf) {
    var m = {}, out = [];
    rows.forEach(function (r) { var k = keyf(r); if (!m[k]) { m[k] = { k: k, c: 0, t: 0, r: r }; out.push(m[k]); } m[k].t++; m[k].c += r.ok; });
    return out;
  }
  S.weak = function (n) {
    var g = group(flat(hist()), function (r) { return r.e + '|' + r.s + '|' + r.ch; });
    return g.filter(function (x) { return x.t >= 2 && x.c / x.t < 0.6; }).sort(function (a, b) { return a.c / a.t - b.c / b.t; }).slice(0, n || 5)
      .map(function (x) { return { exam: x.r.e, subject: x.r.s, chapter: x.r.ch, acc: Math.round(x.c / x.t * 100), n: x.t }; });
  };
  function strong(n) {
    var g = group(flat(hist()), function (r) { return r.e + '|' + r.s + '|' + r.ch; });
    return g.filter(function (x) { return x.t >= 2 && x.c / x.t >= 0.8; }).sort(function (a, b) { return b.c / b.t - a.c / a.t; }).slice(0, n || 3)
      .map(function (x) { return { exam: x.r.e, subject: x.r.s, chapter: x.r.ch, acc: Math.round(x.c / x.t * 100), n: x.t }; });
  }

  /* ---------------- simulated peers + ranking ---------------- */
  var FN = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Reyansh', 'Krishna', 'Ishaan', 'Rohan', 'Kabir', 'Dhruv', 'Ananya', 'Diya', 'Aanya', 'Saanvi', 'Myra', 'Ira', 'Kavya', 'Riya', 'Meera', 'Tara', 'Neha', 'Pooja', 'Sanjana', 'Harsh', 'Nikhil', 'Yash', 'Tanvi', 'Simran', 'Varun', 'Pranav'];
  var SN = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Iyer', 'Nair', 'Reddy', 'Khan', 'Mehta', 'Joshi', 'Das', 'Bose', 'Kulkarni', 'Chopra', 'Malhotra', 'Bansal', 'Yadav', 'Rao', 'Menon'];
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function prng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function gauss(r) { var u = 0, v; while (!u) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  var PC = {};
  function peers(exam) {
    if (PC[exam]) return PC[exam];
    var rnd = prng(hash(exam)), mean = !isComp(exam) ? 68 : exam === 'neet' ? 58 : exam === 'jee' ? 50 : exam === 'upsc' ? 44 : 48, sd = isComp(exam) ? 15 : 13, out = [];
    for (var i = 0; i < 200; i++) {
      var s = Math.max(4, Math.min(99.5, mean + sd * gauss(rnd)));
      out.push({ n: FN[Math.floor(rnd() * FN.length)] + ' ' + SN[Math.floor(rnd() * SN.length)].charAt(0) + '.', s: Math.round(s * 10) / 10, d: Math.floor(rnd() * 11) - 5 });
    }
    out.sort(function (a, b) { return b.s - a.s; });
    return PC[exam] = out;
  }
  function avgPct(h) { var t = 0; h.forEach(function (e) { t += e.pct; }); return Math.round(t / h.length * 10) / 10; }
  function rankOf(P, s) { var above = P.filter(function (p) { return p.s > s; }).length; return { rank: above + 1, total: P.length + 1, pctile: Math.round((P.length - above) / P.length * 1000) / 10 }; }
  S.rankInfo = function (exam) {
    var h = hist().filter(function (e) { return e.exam === exam; }); if (!h.length) return null;
    var P = peers(exam), mine = avgPct(h.slice(-10)), cur = rankOf(P, mine), prev = null;
    if (h.length > 1) prev = rankOf(P, avgPct(h.slice(0, -1).slice(-10))).rank;
    return { exam: exam, pct: mine, rank: cur.rank, total: cur.total, pctile: cur.pctile, change: prev == null ? null : prev - cur.rank, tests: h.length };
  };
  function chg(i) { return i.change == null ? tt('tt_new') : i.change > 0 ? '\u25B2' + i.change : i.change < 0 ? '\u25BC' + (-i.change) : '\u2014'; }

  /* ---------------- views ---------------- */
  S.tab = S.tab || 'start'; S.sel = S.sel || { exam: null, sub: null, ch: '*', neg: true }; S.pf = 'all'; S.rf = null; S.show = null;
  function chip(a, v, label, on) { return '<button class="tt-chip' + (on ? ' on' : '') + '" data-a="' + a + '" data-v="' + E(v) + '">' + E(label) + '</button>'; }
  function tabsHTML() {
    return '<div class="tt-tabs">' + [['start', 'tt_start'], ['perf', 'tt_perf'], ['rank', 'tt_rank']].map(function (x) { return '<button class="' + (S.tab === x[0] ? 'on' : '') + '" data-a="tab" data-v="' + x[0] + '">' + tt(x[1]) + '</button>'; }).join('') + '</div>';
  }

  function homeStart() {
    var se = S.sel; if (!se.exam) se.exam = lastExam() || 'c10';
    var h = '<h3 class="tt-h">1 \u00B7 ' + tt('tt_pick_exam') + '</h3><div class="tt-lbl">' + tt('tt_school') + '</div><div class="tt-grid">';
    CAT.forEach(function (c) { if (c.g === 'school') h += '<button class="tt-b' + (se.exam === c.id ? ' on' : '') + '" data-a="exam" data-v="' + c.id + '">' + E(c[lg()]) + '</button>'; });
    h += '</div><div class="tt-lbl">' + tt('tt_comp') + '</div><div class="tt-grid wide">';
    CAT.forEach(function (c) { if (c.g === 'comp') h += '<button class="tt-b' + (se.exam === c.id ? ' on' : '') + '" data-a="exam" data-v="' + c.id + '">' + E(c[lg()]) + '</button>'; });
    h += '</div>';
    var d = QB.get(se.exam);
    if (!d) {
      if (QB.loading > 0) { setTimeout(function () { if (BP.$('#tt-root') && S.tab === 'start' && !(S.run && !S.run.done) && S.show !== 'result') paint(true); }, 500); return h + '<div class="card" style="margin-top:14px"><div class="typing"><i></i><i></i><i></i></div></div>'; }
      return h + '<div class="card tt-empty" style="margin-top:14px"><p class="mut" style="margin:0">' + tt('tt_nobank') + '</p></div>';
    }
    if (se.sub && se.sub !== '*' && !d[se.sub]) se.sub = null;
    var subs = Object.keys(d);
    h += '<h3 class="tt-h">2 \u00B7 ' + tt('tt_pick_sub') + '</h3><div class="tt-chips">';
    subs.forEach(function (s) { h += chip('sub', s, subName(s), se.sub === s); });
    if (subs.length > 1) h += chip('sub', '*', tt('tt_all_sub'), se.sub === '*');
    h += '</div>';
    if (se.sub && se.sub !== '*') {
      h += '<h3 class="tt-h">3 \u00B7 ' + tt('tt_pick_ch') + '</h3><div class="tt-chips">' + chip('ch', '*', tt('tt_full_sub'), se.ch === '*');
      QB.chapters(se.exam, se.sub).forEach(function (c) { h += chip('ch', c.ch, c.ch + ' (' + c.n + ')', se.ch === c.ch); });
      h += '</div>';
    }
    if (se.sub) {
      var qs = selectQs({ exam: se.exam, subject: se.sub, chapter: se.sub === '*' ? '*' : se.ch }), sc = scheme(se.exam), neg = sc.neg && se.neg;
      h += '<div class="card" style="margin-top:16px"><div class="row"><b>' + E(S.examName(se.exam)) + ' \u00B7 ' + E(subName(se.sub)) + '</b></div>' +
        '<div class="mut" style="font-size:13px;margin-bottom:6px">' + qs.length + ' ' + tt('tt_qs') + ' \u00B7 ' + Math.round(qs.length * sc.sec / 60) + ' ' + tt('tt_min') + ' \u00B7 ' + tt('tt_marking') + ': +' + sc.c + ' / \u2212' + (neg ? Math.round(sc.w * 100) / 100 : 0) + '</div>';
      if (sc.neg) h += '<div class="row"><span>' + tt('tt_neg') + '</span><button class="sw' + (se.neg ? ' on' : '') + '" data-a="neg" aria-label="' + E(tt('tt_neg')) + '"><i></i></button></div>';
      h += '<button class="btn" style="width:100%;margin-top:6px" data-a="begin">' + tt('tt_begin') + '</button></div>';
    }
    return h;
  }

  function runnerHTML() {
    var r = S.run, q = r.qs[r.i], n = r.qs.length, L = 'ABCDEFGH', h = '', i;
    h += '<div class="tr-top"><div><small class="mut">' + tt('tt_q') + '</small> <b>' + (r.i + 1) + ' / ' + n + '</b></div><div class="tmr' + (r.left < 60 ? ' low' : '') + '" id="tmr">' + fmt(r.left) + '</div><button class="ib" data-a="pal" aria-label="' + E(tt('tt_pal')) + '">' + GRID + '</button></div>';
    h += '<div class="bar"><i style="width:' + Math.round((r.i + 1) / n * 100) + '%;background:linear-gradient(90deg,var(--orange),var(--teal))"></i></div>';
    if (r.pal) {
      var na = 0, nm = 0;
      h += '<div class="card" style="margin-top:12px"><div class="pal">';
      for (i = 0; i < n; i++) {
        var x = r.qs[i], c = x.mark ? 'mk' : x.sel != null ? 'ans' : ''; if (x.sel != null) na++; if (x.mark) nm++;
        h += '<button class="' + c + (i === r.i ? ' cur' : '') + '" data-a="goto" data-v="' + i + '">' + (i + 1) + '</button>';
      }
      h += '</div><div class="lg"><span><i style="background:var(--teal)"></i>' + tt('tt_ans') + ' ' + na + '</span><span><i style="background:var(--orange)"></i>' + tt('tt_review') + ' ' + nm + '</span><span><i style="background:rgba(255,255,255,.3)"></i>' + tt('tt_unans') + ' ' + (n - na) + '</span></div></div>';
    }
    h += '<div class="card tr-q"><div class="c-h"><span class="pill">' + E(subName(q.s)) + '</span><span class="mut small">' + E(q.ch) + '</span></div><div class="q-t">' + E(q.q) + '</div>';
    q.o.forEach(function (o, k) { h += '<button class="opt' + (q.sel === k ? ' on' : '') + '" data-a="opt" data-v="' + k + '"><span class="ol">' + L.charAt(k) + '</span><span>' + E(o) + '</span></button>'; });
    h += '</div><div class="tr-act"><button class="btn ghost sm" data-a="prev"' + (r.i === 0 ? ' disabled style="opacity:.4"' : '') + '>' + tt('tt_prev') + '</button>' +
      '<button class="btn ghost sm' + (q.mark ? ' on' : '') + '" data-a="mark">' + (q.mark ? tt('tt_marked') : tt('tt_mark')) + '</button>' +
      '<button class="btn ghost sm" data-a="clr">' + tt('tt_clear') + '</button>' +
      '<button class="btn sm" data-a="' + (r.i === n - 1 ? 'submit' : 'next') + '">' + (r.i === n - 1 ? tt('tt_submit') : tt('tt_next')) + '</button></div>' +
      '<div class="tr-act"><button class="btn ghost sm" data-a="read">' + BP.icons.spk.replace('<svg', '<svg style="display:inline;vertical-align:-5px;width:18px;height:18px;margin-right:6px"') + tt('tt_read') + '</button>' +
      (r.i !== n - 1 ? '<button class="btn ghost sm" data-a="submit">' + tt('tt_submit') + '</button>' : '') + '</div>';
    return h;
  }

  function resultHTML() {
    var R = S.last, r = S.lastRun, h = '';
    h += '<div class="card"><div class="c-h"><b>' + E(S.examName(R.exam)) + ' \u00B7 ' + E(subName(R.sub)) + '</b><span class="pill">' + tt('tt_res') + '</span></div>';
    h += '<div class="gwrap">' + gauge(R.pct, tt('tt_score'), col(R.pct)) + '<div><div class="big">' + R.score + ' / ' + R.max + '</div><div class="mut" style="font-size:13px">' + tt('tt_marking') + ': +' + scheme(R.exam).c + ' / \u2212' + (R.neg ? Math.round(scheme(R.exam).w * 100) / 100 : 0) + '<br>' + fmt(R.used) + '</div></div></div>';
    h += '<div class="stats wrap" style="margin-top:12px"><div><b>' + Math.round(R.acc) + '%</b><span>' + tt('tt_acc') + '</span></div><div><b>' + fmt(R.used / R.n) + '</b><span>' + tt('tt_tpq') + '</span></div><div><b style="color:var(--teal)">' + R.cor + '</b><span>' + tt('tt_cor') + '</span></div><div><b style="color:#ff7a7f">' + R.wr + '</b><span>' + tt('tt_wrong') + '</span></div><div><b>' + R.sk + '</b><span>' + tt('tt_skip') + '</span></div></div></div>';
    var rows = R.det.map(function (d) { return { s: d[0], ch: d[1], ok: d[2] }; }), bySub = group(rows, function (x) { return x.s; }), multi = bySub.length > 1;
    var gr = multi ? bySub : group(rows, function (x) { return x.ch; });
    h += '<div class="card"><b>' + tt(multi ? 'tt_sub_perf' : 'tt_ch_perf') + '</b>';
    if (gr.length >= 3) h += radar(gr.slice(0, 8).map(function (x) { return { l: multi ? subName(x.k) : x.k, v: x.c / x.t * 100 }; }));
    gr.forEach(function (x) { h += bar(multi ? subName(x.k) : x.k, x.c / x.t * 100, x.c + '/' + x.t); });
    h += '</div>';
    var ri = S.rankInfo(R.exam);
    if (ri) h += '<div class="card"><div class="stats"><div><b>#' + ri.rank + '</b><span>' + tt('tt_of') + ' ' + ri.total + '</span></div><div><b>' + ri.pctile + '</b><span>' + tt('tt_pctile') + '</span></div><div><b>' + chg(ri) + '</b><span>' + tt('tt_change') + '</span></div></div></div>';
    h += '<div class="tr-act"><button class="btn sm" data-a="seerank">' + tt('tt_see_rank') + '</button><button class="btn ghost sm" data-a="retake">' + tt('tt_retake') + '</button><button class="btn ghost sm" data-a="home">' + tt('tt_home') + '</button></div>';
    var f = S.rv || 'all';
    h += '<div class="card"><b>' + tt('tt_explain') + '</b><div class="tt-chips" style="margin:8px 0 2px">';
    [['all', tt('tt_all')], ['wrong', tt('tt_wrong')], ['skip', tt('tt_skip')], ['right', tt('tt_cor')]].forEach(function (x) { h += chip('rvf', x[0], x[1], f === x[0]); });
    h += '</div>';
    r.qs.forEach(function (q, i) {
      var st = q.sel == null ? 'sk' : (q.sel === q.a ? 'ok' : 'no');
      if ((f === 'wrong' && st !== 'no') || (f === 'skip' && st !== 'sk') || (f === 'right' && st !== 'ok')) return;
      h += '<div class="rv"><div class="c-h"><b>' + (i + 1) + '.</b><span class="st ' + st + '">' + (st === 'ok' ? tt('tt_cor') : st === 'no' ? tt('tt_wrong') : tt('tt_skip')) + '</span><span class="mut small">' + fmt(q.t) + '</span></div>' +
        '<div style="margin:4px 0 8px">' + E(q.q) + '</div><div class="small mut">' + tt('tt_your') + ': <b style="color:var(--txt)">' + (q.sel == null ? tt('tt_none') : E(q.o[q.sel])) + '</b></div>' +
        '<div class="small mut">' + tt('tt_right') + ': <b style="color:var(--teal)">' + E(q.o[q.a]) + '</b></div>' +
        (q.e ? '<div class="ex">' + E(q.e) + '</div>' : '') + '<button class="btn ghost sm" style="margin-top:8px" data-a="readexp" data-v="' + i + '">' + tt('tt_read') + '</button></div>';
    });
    return h + '</div>';
  }

  function perfHTML() {
    var all = hist();
    if (!all.length) return '<div class="card tt-empty"><p class="mut">' + tt('tt_no_hist') + '</p><button class="btn" data-a="tab" data-v="start">' + tt('tt_begin') + '</button></div>';
    var exs = []; all.forEach(function (e) { if (exs.indexOf(e.exam) < 0) exs.push(e.exam); });
    if (S.pf !== 'all' && exs.indexOf(S.pf) < 0) S.pf = 'all';
    var f = S.pf === 'all' ? all : all.filter(function (e) { return e.exam === S.pf; });
    var cor = 0, att = 0, tot = 0; f.forEach(function (e) { cor += e.cor; att += e.cor + e.wr; tot += e.n; });
    var h = '<div class="tt-chips" style="margin-bottom:10px">' + chip('pfilter', 'all', tt('tt_all'), S.pf === 'all');
    exs.forEach(function (x) { h += chip('pfilter', x, S.examName(x), S.pf === x); });
    h += '</div><div class="card"><div class="grow">' + gauge(avgPct(f), tt('tt_avg'), col(avgPct(f))) + gauge(att ? cor / att * 100 : 0, tt('tt_acc'), col(att ? cor / att * 100 : 0)) + gauge(tot ? att / tot * 100 : 0, tt('tt_attempt'), '#6aa8ff') + '</div>' +
      '<div class="stats" style="margin-top:12px"><div><b>' + f.length + '</b><span>' + tt('tt_taken') + '</span></div><div><b>' + Math.round(Math.max.apply(null, f.map(function (e) { return e.pct; }))) + '%</b><span>Best</span></div></div></div>';
    var rows = flat(f), bs = group(rows, function (x) { return x.s; });
    if (bs.length) {
      h += '<div class="card"><b>' + tt('tt_sub_perf') + '</b>';
      if (bs.length >= 3) h += radar(bs.slice(0, 8).map(function (x) { return { l: subName(x.k), v: x.c / x.t * 100 }; }));
      bs.forEach(function (x) { h += bar(subName(x.k), x.c / x.t * 100, x.c + '/' + x.t); });
      h += '</div>';
    }
    var st = strong(3), wk = S.weak(5);
    h += '<div class="card"><b style="color:var(--teal)">' + tt('tt_strong') + '</b>';
    if (!st.length) h += '<p class="mut small" style="margin:6px 0 0">' + tt('tt_none_weak') + '</p>';
    st.forEach(function (x) { h += '<div class="wk"><div><b>' + E(x.chapter) + '</b><small>' + E(S.examName(x.exam) + ' \u00B7 ' + subName(x.subject)) + '</small></div><span class="pill">' + x.acc + '%</span></div>'; });
    h += '</div><div class="card"><b style="color:#ff9a9d">' + tt('tt_weak') + '</b>';
    if (!wk.length) h += '<p class="mut small" style="margin:6px 0 0">' + tt('tt_none_weak') + '</p>';
    wk.forEach(function (x) { h += '<div class="wk"><div><b>' + E(x.chapter) + '</b><small>' + E(S.examName(x.exam) + ' \u00B7 ' + subName(x.subject)) + ' \u00B7 ' + x.acc + '%</small></div><button class="btn sm" data-a="prac" data-e="' + E(x.exam) + '" data-s="' + E(x.subject) + '" data-c="' + E(x.chapter) + '">' + tt('tt_practice') + '</button></div>'; });
    h += '</div><div class="card"><b>' + tt('tt_recent') + '</b>';
    f.slice(-6).reverse().forEach(function (e) {
      var dt = new Date(e.ts).toLocaleDateString(lg() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' });
      h += '<div class="wk"><div><b>' + E(S.examName(e.exam) + ' \u00B7 ' + subName(e.sub)) + '</b><small>' + dt + ' \u00B7 ' + e.score + '/' + e.max + '</small></div><span class="pill" style="color:' + col(e.pct) + '">' + Math.round(e.pct) + '%</span></div>';
    });
    return h + '</div>';
  }

  function rowHTML(rank, name, sc, d, me) {
    var tr = d == null ? '' : d > 0 ? '<span class="up">\u25B2' + d + '</span>' : d < 0 ? '<span class="dn">\u25BC' + (-d) + '</span>' : '<span class="mut">\u2014</span>';
    return '<div class="lb-r' + (me ? ' me' : '') + '"><span class="lb-n' + (rank <= 3 ? ' g' + rank : '') + '">' + rank + '</span><span class="av">' + E((me ? tt('tt_you') : name).charAt(0)) + '</span><b>' + E(me ? tt('tt_you') : name) + '</b><span class="mut">' + sc.toFixed(1) + '%</span>' + tr + '</div>';
  }
  function rankHTML() {
    var ex = S.rf || lastExam() || 'c10', h = '<div class="chips tt-fl">';
    CAT.forEach(function (c) { h += '<button class="chip' + (c.id === ex ? ' on' : '') + '" data-a="rexam" data-v="' + c.id + '">' + E(c[lg()]) + '</button>'; });
    h += '</div>';
    var i = S.rankInfo(ex), P = peers(ex), all = P.slice(), meIdx = -1;
    if (i) {
      h += '<div class="card"><div class="c-h"><b>' + E(S.examName(ex)) + '</b><span class="pill">' + i.tests + ' ' + tt('tt_tests') + '</span></div><div class="stats"><div><b>#' + i.rank + '</b><span>' + tt('tt_of') + ' ' + i.total + '</span></div><div><b>' + i.pctile + '</b><span>' + tt('tt_pctile') + '</span></div><div><b class="' + (i.change > 0 ? 'up' : i.change < 0 ? 'dn' : '') + '" style="font-size:22px">' + chg(i) + '</b><span>' + tt('tt_change') + '</span></div></div></div>';
      meIdx = P.filter(function (p) { return p.s > i.pct; }).length; all.splice(meIdx, 0, { me: true, s: i.pct, d: i.change });
    } else {
      h += '<div class="card tt-empty"><p class="mut" style="margin-top:0">' + tt('tt_no_rank') + '</p><button class="btn" data-a="startex" data-v="' + ex + '">' + tt('tt_begin') + '</button></div>';
    }
    h += '<div class="card"><div class="c-h"><b>' + tt('tt_top') + '</b><span class="pill">' + E(S.examName(ex)) + '</span></div>';
    all.slice(0, 10).forEach(function (p, k) { h += rowHTML(k + 1, p.n || '', p.s, p.d, !!p.me); });
    if (meIdx >= 10) h += '<div class="mut" style="text-align:center">\u22EF</div>' + rowHTML(meIdx + 1, '', i.pct, i.change, true);
    return h + '<p class="mut small" style="margin:10px 0 0">' + tt('tt_peers') + '</p></div>';
  }

  /* ---------------- paint + events ---------------- */
  function paint(keepScroll) {
    var root = BP.$('#tt-root'); if (!root) return;
    var h;
    if (S.run && !S.run.done) h = runnerHTML();
    else if (S.show === 'result' && S.last && S.lastRun) h = resultHTML();
    else h = tabsHTML() + (S.tab === 'perf' ? perfHTML() : S.tab === 'rank' ? rankHTML() : homeStart());
    root.innerHTML = h; animateIn(root);
    if (!keepScroll) { var pg = root.closest('.page'); if (pg) pg.scrollTop = 0; }
  }
  function onClick(e) {
    var t = e.target.closest('[data-a]'); if (!t) return;
    var a = t.getAttribute('data-a'), v = t.getAttribute('data-v'), r = S.run, q = r && !r.done ? r.qs[r.i] : null;
    switch (a) {
      case 'tab': S.tab = v; S.show = null; paint(); break;
      case 'exam': S.sel.exam = v; S.sel.sub = null; S.sel.ch = '*'; paint(true); break;
      case 'sub': S.sel.sub = v; S.sel.ch = '*'; paint(true); break;
      case 'ch': S.sel.ch = v; paint(true); break;
      case 'neg': S.sel.neg = !S.sel.neg; paint(true); break;
      case 'begin':
        var res = S.start({ exam: S.sel.exam, subject: S.sel.sub, chapter: S.sel.sub === '*' ? '*' : S.sel.ch, neg: S.sel.neg, nav: false });
        if (!res.ok) { BP.toast(tt('tt_nobank')); break; }
        if (res.fallback) BP.toast(tt('tt_nofull')); paint(); break;
      case 'opt': if (q) { q.sel = +v; paint(true); } break;
      case 'clr': if (q) { q.sel = null; paint(true); } break;
      case 'mark': if (q) { q.mark = !q.mark; paint(true); } break;
      case 'next': if (q && r.i < r.qs.length - 1) { r.i++; paint(); } break;
      case 'prev': if (q && r.i > 0) { r.i--; paint(); } break;
      case 'goto': if (q) { r.i = +v; r.pal = false; paint(); } break;
      case 'pal': if (q) { r.pal = !r.pal; paint(true); } break;
      case 'read': if (q) { var w = /[\u0900-\u097F]/.test(q.q) ? '\u0935\u093F\u0915\u0932\u094D\u092A ' : 'Option '; speakNow(q.q + '. ' + q.o.map(function (o, i) { return w + 'ABCD'.charAt(i) + '. ' + o; }).join('. ')); } break;
      case 'submit':
        if (!q) break;
        var un = r.qs.filter(function (x) { return x.sel == null; }).length;
        if (!confirm(tt('tt_confirm_sub') + ' ' + un)) break;
        finish(); paint(); break;
      case 'rvf': S.rv = v; paint(true); break;
      case 'readexp': var rq = S.lastRun && S.lastRun.qs[+v]; if (rq) speakNow(rq.q + '. ' + tt('tt_right') + ': ' + rq.o[rq.a] + '. ' + rq.e); break;
      case 'retake': if (S.last) { var R = S.last, rs = S.start({ exam: R.exam, subject: R.sub, chapter: R.ch, neg: R.neg, nav: false }); if (rs.ok) paint(); } break;
      case 'seerank': S.rf = S.last ? S.last.exam : null; S.tab = 'rank'; S.show = null; S.run = null; paint(); break;
      case 'home': S.show = null; S.run = null; paint(); break;
      case 'prac':
        var rp = S.start({ exam: t.getAttribute('data-e'), subject: t.getAttribute('data-s'), chapter: t.getAttribute('data-c'), nav: false });
        if (rp.ok) paint(); else BP.toast(tt('tt_nobank')); break;
      case 'pfilter': S.pf = v; paint(true); break;
      case 'rexam': S.rf = v; paint(true); break;
      case 'startex': S.sel.exam = v; S.sel.sub = null; S.sel.ch = '*'; S.tab = 'start'; paint(); break;
    }
  }
  BP.registerView('tests', function (box) {
    box.innerHTML = '<h2 class="ph">' + tt('tt_title') + '</h2><div id="tt-root"></div>';
    BP.$('#tt-root', box).addEventListener('click', onClick);
    paint();
  });
  S.openTab = function (tab, exam) { S.tab = tab; S.show = null; if (exam) { S.rf = exam; if (tab === 'start') S.sel.exam = exam; } BP.go('tests'); };
  document.addEventListener('click', function (e) { var t = e.target.closest('[data-ttab]'); if (t) S.openTab(t.getAttribute('data-ttab'), t.getAttribute('data-exam')); });

  /* ---------------- cards shown inside the chat ---------------- */
  BP.registerCard('tt-rank', function (d) {
    var i = S.rankInfo(d.exam); if (!i) return '';
    return '<div class="card cd"><div class="c-h"><b>' + E(S.examName(d.exam)) + '</b><span class="pill">' + i.tests + ' ' + tt('tt_tests') + '</span></div><div class="stats"><div><b>#' + i.rank + '</b><span>' + tt('tt_of') + ' ' + i.total + '</span></div><div><b>' + i.pctile + '</b><span>' + tt('tt_pctile') + '</span></div><div><b>' + chg(i) + '</b><span>' + tt('tt_change') + '</span></div></div>' +
      '<div class="c-b" style="margin-top:10px"><button class="btn sm" data-ttab="rank" data-exam="' + E(d.exam) + '">' + tt('tt_open_lb') + '</button></div></div>';
  });
  BP.registerCard('tt-perf', function () {
    var h = hist(); if (!h.length) return '';
    var cor = 0, att = 0, tot = 0; h.forEach(function (e) { cor += e.cor; att += e.cor + e.wr; tot += e.n; });
    var av = avgPct(h), ac = att ? cor / att * 100 : 0, ap = tot ? att / tot * 100 : 0;
    return '<div class="card cd"><div class="grow">' + gauge(av, tt('tt_avg'), col(av), true) + gauge(ac, tt('tt_acc'), col(ac), true) + gauge(ap, tt('tt_attempt'), '#6aa8ff', true) + '</div>' +
      '<div class="c-b" style="margin-top:10px"><button class="btn sm" data-ttab="perf">' + tt('tt_open_perf') + '</button></div></div>';
  });

  /* ---------------- voice / chat commands ---------------- */
  var SUBKW = [
    ['Mathematics', ['maths', 'math', 'mathematics', '\u0917\u0923\u093F\u0924', '\u092E\u0948\u0925\u094D\u0938', '\u092E\u0948\u0925']],
    ['Physics', ['physics', 'phy', '\u092D\u094C\u0924\u093F\u0915\u0940', '\u092B\u093F\u091C\u093C\u093F\u0915\u094D\u0938', '\u092B\u093F\u091C\u093F\u0915\u094D\u0938']],
    ['Chemistry', ['chemistry', 'chem', '\u0930\u0938\u093E\u092F\u0928', '\u0915\u0947\u092E\u093F\u0938\u094D\u091F\u094D\u0930\u0940']],
    ['Biology', ['biology', 'bio', '\u091C\u0940\u0935', '\u092C\u093E\u092F\u094B\u0932\u0949\u091C\u0940']],
    ['Social Science', ['social science', 'social', 'sst', 'history', 'geography', 'civics', '\u0938\u093E\u092E\u093E\u091C\u093F\u0915']],
    ['Science', ['science', '\u0935\u093F\u091C\u094D\u091E\u093E\u0928', '\u0938\u093E\u0907\u0902\u0938']],
    ['English', ['english', '\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u093C\u0940', '\u0905\u0902\u0917\u094D\u0930\u0947\u091C\u0940']],
    ['Hindi', ['hindi', '\u0939\u093F\u0902\u0926\u0940', '\u0939\u093F\u0928\u094D\u0926\u0940']],
    ['EVS', ['evs', 'environmental studies']],
    ['Accountancy', ['accountancy', 'accounts', 'accounting', '\u0932\u0947\u0916\u093E\u0936\u093E\u0938\u094D\u0924\u094D\u0930']],
    ['Business Studies', ['business', '\u092C\u093F\u091C\u093C\u0928\u0947\u0938', '\u092C\u093F\u091C\u0928\u0947\u0938']],
    ['Economics', ['economics', 'eco', '\u0905\u0930\u094D\u0925\u0936\u093E\u0938\u094D\u0924\u094D\u0930']],
    ['GS Prelims', ['gs', 'general studies', 'prelims']], ['CSAT', ['csat']]
  ];
  function resolveSub(exam, sub) {
    var d = QB.get(exam); if (!d) return null;
    if (d[sub]) return sub;
    if (sub === 'Science' && d.EVS) return 'EVS'; if (sub === 'EVS' && d.Science) return 'Science';
    return null;
  }
  function detectSub(exam, n) {
    var d = QB.get(exam) || {}, k;
    for (k in d) if (n.indexOf(' ' + norm(k) + ' ') > -1) return k;
    for (var i = 0; i < SUBKW.length; i++) if (BP.agent.util.hasAny(n, SUBKW[i][1])) { var r = resolveSub(exam, SUBKW[i][0]); if (r) return r; }
    return null;
  }
  function examFromSlots(s) { if (s.exam) return s.exam === 'ca' ? 'ca-f' : s.exam; if (s.cls) return 'c' + s.cls; return null; }

  function hTests(m) {
    var A = BP.agent, T = A.T, exam = examFromSlots(m.slots);
    if (m.n.indexOf(' scholarship') > -1) { var di = A.intents.filter(function (i) { return i.id === 'discount'; })[0]; if (di) return di.handler(m); }
    var goCard = { type: 'go', view: 'tests', label: T('Open Tests', '\u091F\u0947\u0938\u094D\u091F \u0916\u094B\u0932\u0947\u0902') };
    if (!exam) {
      var t = T('Which class or exam would you like a test for?', '\u0906\u092A \u0915\u093F\u0938 \u0915\u0915\u094D\u0937\u093E \u092F\u093E \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0915\u093E \u091F\u0947\u0938\u094D\u091F \u0926\u0947\u0928\u093E \u091A\u093E\u0939\u0947\u0902\u0917\u0947?');
      return { text: t, speak: t, card: goCard, chips: T(['Start a Class 10 Mathematics test', 'Start a JEE mock test', 'Start a NEET mock test', 'Start a UPSC GS Prelims test'], ['\u0915\u0915\u094D\u0937\u093E 10 \u0917\u0923\u093F\u0924 \u0915\u093E \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902', 'JEE \u092E\u0949\u0915 \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902', 'NEET \u092E\u0949\u0915 \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902']) };
    }
    var nm = S.examName(exam), d = QB.get(exam);
    if (!d) { var t1 = T('Questions for ' + nm + ' are not available yet. Please check again after the next update.', nm + ' \u0915\u0947 \u092A\u094D\u0930\u0936\u094D\u0928 \u0905\u092D\u0940 \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u0939\u0948\u0902\u0964 \u0915\u0943\u092A\u092F\u093E \u0905\u0917\u0932\u0947 \u0905\u092A\u0921\u0947\u091F \u0915\u0947 \u092C\u093E\u0926 \u0926\u0947\u0916\u0947\u0902\u0964'); return { text: t1, speak: t1, card: goCard }; }
    var sub = detectSub(exam, m.n);
    if (!sub && !isComp(exam)) {
      S.sel.exam = exam; S.sel.sub = null; S.sel.ch = '*'; S.tab = 'start';
      var t2 = T('Which subject for ' + nm + '?', nm + ' \u0915\u093E \u0915\u094C\u0928 \u0938\u093E \u0935\u093F\u0937\u092F?');
      return { text: t2, speak: t2, card: goCard, chips: Object.keys(d).map(function (k) { return T('Start a ' + nm + ' ' + k + ' test', nm + ' ' + subName(k) + ' \u0915\u093E \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902'); }) };
    }
    var chap = sub ? detectChapter(exam, sub, m.n) : null;
    var r = S.start({ exam: exam, subject: sub || '*', chapter: chap || '*' });
    if (!r.ok) { var t3 = T('I could not find questions for that. Please pick another subject.', '\u0907\u0938\u0915\u0947 \u0932\u093F\u090F \u092A\u094D\u0930\u0936\u094D\u0928 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u0947\u0964 \u0915\u0943\u092A\u092F\u093E \u0926\u0942\u0938\u0930\u093E \u0935\u093F\u0937\u092F \u091A\u0941\u0928\u0947\u0902\u0964'); return { text: t3, speak: t3, card: goCard }; }
    var what = nm + (sub ? ' ' + sub : ' mock') + (chap ? ' (' + chap + ')' : ''), whatHi = nm + (sub ? ' ' + subName(sub) : ' \u092E\u0949\u0915') + (chap ? ' (' + chap + ')' : '');
    var t4 = T('Starting your ' + what + ' test: ' + r.n + ' questions, ' + r.min + ' minutes. Good luck!', whatHi + ' \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942: ' + r.n + ' \u092A\u094D\u0930\u0936\u094D\u0928, ' + r.min + ' \u092E\u093F\u0928\u091F\u0964 \u0936\u0941\u092D\u0915\u093E\u092E\u0928\u093E\u090F\u0901!');
    return { text: t4, speak: t4 };
  }
  function hRank(m) {
    var A = BP.agent, T = A.T, exam = examFromSlots(m.slots) || lastExam();
    var startChips = T(['Start a Class 10 Mathematics test', 'Start a JEE mock test'], ['\u0915\u0915\u094D\u0937\u093E 10 \u0917\u0923\u093F\u0924 \u0915\u093E \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902', 'JEE \u092E\u0949\u0915 \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902']);
    var i = exam && S.rankInfo(exam);
    if (!i) {
      var t0 = hist().length ? T('You have not taken a test in ' + S.examName(exam || '') + ' yet, so there is no rank for it. Take one to get ranked.', '\u0906\u092A\u0928\u0947 \u0907\u0938 \u092E\u0947\u0902 \u0905\u092D\u0940 \u0924\u0915 \u0915\u094B\u0908 \u091F\u0947\u0938\u094D\u091F \u0928\u0939\u0940\u0902 \u0926\u093F\u092F\u093E \u0939\u0948, \u0907\u0938\u0932\u093F\u090F \u0930\u0948\u0902\u0915 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0930\u0948\u0902\u0915 \u092A\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u091F\u0947\u0938\u094D\u091F \u0926\u0940\u091C\u093F\u090F\u0964')
        : T('You have not taken any test yet, so there is no rank. Take a test to get ranked against your peers.', '\u0906\u092A\u0928\u0947 \u0905\u092D\u0940 \u0924\u0915 \u0915\u094B\u0908 \u091F\u0947\u0938\u094D\u091F \u0928\u0939\u0940\u0902 \u0926\u093F\u092F\u093E, \u0907\u0938\u0932\u093F\u090F \u0930\u0948\u0902\u0915 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0930\u0948\u0902\u0915 \u092A\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u091F\u0947\u0938\u094D\u091F \u0926\u0940\u091C\u093F\u090F\u0964');
      return { text: t0, speak: t0, chips: startChips };
    }
    var nm = S.examName(exam), ch = i.change > 0 ? T(', up ' + i.change + ' places', ', ' + i.change + ' \u0938\u094D\u0925\u093E\u0928 \u090A\u092A\u0930') : i.change < 0 ? T(', down ' + (-i.change) + ' places', ', ' + (-i.change) + ' \u0938\u094D\u0925\u093E\u0928 \u0928\u0940\u091A\u0947') : '';
    var t = T('Your rank in ' + nm + ' is ' + i.rank + ' out of ' + i.total + ', at the ' + i.pctile + ' percentile' + ch + '.', nm + ' \u092E\u0947\u0902 \u0906\u092A\u0915\u0940 \u0930\u0948\u0902\u0915 ' + i.total + ' \u092E\u0947\u0902 \u0938\u0947 ' + i.rank + ' \u0939\u0948, ' + i.pctile + ' \u092A\u0930\u094D\u0938\u0947\u0902\u091F\u093E\u0907\u0932' + ch + '\u0964');
    return { text: t, speak: t, card: { type: 'tt-rank', exam: exam }, chips: T(['How did I perform', 'Start a Class 10 Mathematics test'], ['\u092E\u0947\u0930\u093E \u092A\u094D\u0930\u0926\u0930\u094D\u0936\u0928', '\u0915\u0915\u094D\u0937\u093E 10 \u0917\u0923\u093F\u0924 \u0915\u093E \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902']) };
  }
  function hPerf() {
    var A = BP.agent, T = A.T, h = hist();
    if (!h.length) {
      var t0 = T('You have not taken any test yet. Take one and I will show your performance.', '\u0906\u092A\u0928\u0947 \u0905\u092D\u0940 \u0924\u0915 \u0915\u094B\u0908 \u091F\u0947\u0938\u094D\u091F \u0928\u0939\u0940\u0902 \u0926\u093F\u092F\u093E\u0964 \u090F\u0915 \u091F\u0947\u0938\u094D\u091F \u0926\u0940\u091C\u093F\u090F, \u092B\u093F\u0930 \u092E\u0948\u0902 \u0906\u092A\u0915\u093E \u092A\u094D\u0930\u0926\u0930\u094D\u0936\u0928 \u0926\u093F\u0916\u093E\u090A\u0901\u0917\u093E\u0964');
      return { text: t0, speak: t0, chips: T(['Start a Class 10 Mathematics test', 'Start a JEE mock test'], ['\u0915\u0915\u094D\u0937\u093E 10 \u0917\u0923\u093F\u0924 \u0915\u093E \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902', 'JEE \u092E\u0949\u0915 \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902']) };
    }
    var L = h[h.length - 1], avg = Math.round(avgPct(h)), wk = S.weak(1)[0];
    var nm = S.examName(L.exam) + (L.sub === '*' ? '' : ' ' + subName(L.sub));
    var t = T('In your last test, ' + nm + ', you scored ' + L.score + ' out of ' + L.max + ' with ' + Math.round(L.acc) + ' percent accuracy. Your average across ' + h.length + ' tests is ' + avg + ' percent.' + (wk ? ' Your weakest topic is ' + wk.chapter + '.' : ''),
      '\u092A\u093F\u091B\u0932\u0947 \u091F\u0947\u0938\u094D\u091F, ' + nm + ', \u092E\u0947\u0902 \u0906\u092A\u0915\u093E \u0938\u094D\u0915\u094B\u0930 ' + L.max + ' \u092E\u0947\u0902 \u0938\u0947 ' + L.score + ' \u0930\u0939\u093E, \u0938\u091F\u0940\u0915\u0924\u093E ' + Math.round(L.acc) + ' \u092A\u094D\u0930\u0924\u093F\u0936\u0924\u0964 ' + h.length + ' \u091F\u0947\u0938\u094D\u091F \u0915\u093E \u0914\u0938\u0924 ' + avg + ' \u092A\u094D\u0930\u0924\u093F\u0936\u0924 \u0939\u0948\u0964' + (wk ? ' \u0938\u092C\u0938\u0947 \u0915\u092E\u091C\u093C\u094B\u0930 \u091F\u0949\u092A\u093F\u0915: ' + wk.chapter + '\u0964' : ''));
    return { text: t, speak: t, card: { type: 'tt-perf' }, chips: T(['Show my rank', 'Start a Class 10 Mathematics test'], ['\u092E\u0947\u0930\u0940 \u0930\u0948\u0902\u0915 \u0926\u093F\u0916\u093E\u090F\u0901', '\u0915\u0915\u094D\u0937\u093E 10 \u0917\u0923\u093F\u0924 \u0915\u093E \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902']) };
  }
  if (BP.agent && BP.agent.registerIntent) {
    var RI = BP.agent.registerIntent;
    RI({ id: 'tests', pri: 0.6, handler: hTests, kw: ['test', 'tests', 'mock', 'mock test', 'quiz', 'practice test', 'take a test', 'start test', 'start a test', '\u091F\u0947\u0938\u094D\u091F', '\u092E\u0949\u0915', '\u0915\u094D\u0935\u093F\u091C\u093C', '\u0915\u094D\u0935\u093F\u091C'] });
    RI({ id: 'rank', pri: 0.5, handler: hRank, kw: ['rank', 'ranking', 'my rank', 'leaderboard', 'percentile', 'where do i stand', '\u0930\u0948\u0902\u0915', '\u0930\u0948\u0902\u0915\u093F\u0902\u0917', '\u092A\u0930\u094D\u0938\u0947\u0902\u091F\u093E\u0907\u0932', '\u0932\u0940\u0921\u0930\u092C\u094B\u0930\u094D\u0921'] });
    RI({ id: 'perf', pri: 0.5, handler: hPerf, kw: ['how did i perform', 'how did i do', 'my performance', 'my progress', 'my score', 'my scores', 'my result', 'my results', 'how am i doing', 'performance', 'perform', 'progress', 'scorecard', 'report card', '\u092A\u094D\u0930\u0926\u0930\u094D\u0936\u0928', '\u092A\u094D\u0930\u0917\u0924\u093F', '\u092E\u0947\u0930\u093E \u0938\u094D\u0915\u094B\u0930', '\u092E\u0947\u0930\u093E \u092A\u0930\u093F\u0923\u093E\u092E'] });
  }
})(window.BP);
