/* ======================================================================
   BrightPath extras.js (Cell 4a) - parent dashboard, study plan, rewards, fee reminders,
   shared helpers for the owner tools and doubt solver (Cell 4b).
   API: BP.extras.child() fees() plan() planWeek() planStats() points(n) celebrate(icon,title,sub)
        confetti() addStrings(en, hi, {code: pack}) listenOnce(cb, onState) pk() rep()
   Storage: bp_child, bp_feepaid, bp_plan, bp_game
   Multilingual: every string below lives in BP.packs[code].ui. To add a language, call
   BP.registerLang(code, pack) and BP.extras.addStrings({}, {}, {code: {...ex_ keys...}}).
   ====================================================================== */
(function (BP) {
  'use strict';
  BP.mods.extras = true;
  var $ = BP.$, $$ = BP.$$, E = BP.esc, X = BP.extras = BP.extras || {};
  function lg() { return BP.settings.lang === 'hi' ? 'hi' : 'en'; }
  function tt(k) { return BP.t(k); }
  function pk(o) { return o == null ? '' : typeof o === 'string' ? o : (o[lg()] || o.en || ''); }
  function rep(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  X.pk = pk; X.rep = rep;
  X.addStrings = function (en, hi, other) {
    Object.assign(BP.packs.en.ui, en || {}); if (BP.packs.hi) Object.assign(BP.packs.hi.ui, hi || {});
    if (other) Object.keys(other).forEach(function (c) { if (BP.packs[c]) Object.assign(BP.packs[c].ui, other[c]); });
  };

  /* ---------------- strings ---------------- */
  X.addStrings({
    ex_back: 'Back', ex_more: 'More for you', ex_parent: 'Parent dashboard', ex_plan: 'Study plan', ex_doubt: 'Doubt solver', ex_rewards: 'Rewards', ex_fees: 'Fee reminders',
    ex_owner: 'Institute owner tools', ex_leads: 'Enquiries and leads', ex_admin: 'White-label settings', ex_lock: 'PIN protected',
    pd_title: 'Parent dashboard', pd_edit: 'Edit', pd_save: 'Save', pd_name: 'Student name', pd_prog: 'Class / programme', pd_joined: 'Joined', pd_avg: 'Average score', pd_att: 'Attendance', pd_week: 'Study plan',
    pd_scores: 'Test scores', pd_no_tests: 'No tests taken yet. Scores appear here after the first test.', pd_rank: 'Rank trend (last 6 weeks)', pd_rank_now: 'Current rank', pd_cal: 'Attendance, last 4 weeks',
    pd_up: 'Upcoming tests', pd_weekly: 'weekly test', pd_fee: 'Fee status', pd_paid: 'installments paid', pd_next: 'Next due', pd_all_paid: 'All installments are paid', pd_open_fees: 'Fee reminders',
    pd_present: 'Present', pd_absent: 'Absent', pd_holiday: 'Sunday / holiday', pd_demo: 'Attendance, rank history and upcoming tests are simulated demo data. Test scores and study plan progress come from this device.',
    fe_title: 'Fee reminders', fe_summary: 'Fee summary', fe_total: 'Total fee', fe_paid: 'Paid', fe_bal: 'Balance', fe_sched: 'Installment schedule', fe_inst: 'Installment', fe_paid_s: 'Paid', fe_overdue: 'Overdue', fe_soon: 'Due soon', fe_up: 'Upcoming',
    fe_mark: 'Mark paid (demo)', fe_undo: 'Undo', fe_notes: 'Notifications', fe_remind: 'Send reminder to parent (demo)', fe_sent: 'Reminder sent to the parent app (simulated).', fe_none: 'No pending notifications.',
    fe_n_overdue: 'Installment {n} of {m} ({amt}) was due on {date} and is overdue by {d} days. Please pay at the earliest.', fe_n_soon: 'Installment {n} of {m} ({amt}) is due on {date}, in {d} days.',
    fe_n_up: 'Next installment {n} of {m} ({amt}) is due on {date}.', fe_n_paid: 'Payment received for installment {n} of {m} ({amt}). Thank you!', fe_demo: 'Demo data: payments are not real.',
    pl_title: 'Study plan', pl_built: 'Built from your test results and weak topics.', pl_gen: 'Take a test to make this plan personal. Until then it uses chapters from your class.', pl_weak: 'Focus topics',
    pl_week: 'Week progress', pl_today: 'Today', pl_done_day: 'All tasks done today! Bonus +25 points', pl_start: 'Start practice', pl_ask: 'Ask a doubt', pl_report: 'View report', pl_days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
    pl_t_revise: 'Revise {ch}', pl_t_revise0: "Revise today's class notes", pl_t_prac: 'Practice test: {ch}', pl_t_prac0: 'Practice test (mixed topics)', pl_t_mock: 'Full-length mock test',
    pl_t_doubt: 'Review mistakes and clear doubts', pl_t_rest: 'Light revision of formulas and notes', pl_t_review: 'Weekly review: check your performance report', pl_tick: 'Tick tasks to earn 10 points each.',
    rw_title: 'Rewards', rw_points: 'points', rw_level: 'Level', rw_streak: 'day streak', rw_best: 'Best streak', rw_badges: 'Badges', rw_next: 'points to next level', rw_week: 'This week',
    rw_new: 'New badge unlocked!', rw_plus: '+{n} points', rw_streak_t: 'Day {n} streak!', rw_levels: 'Starter,Learner,Achiever,Scholar,Champion,Legend', rw_tests: 'Tests taken', rw_got: 'Unlocked'
  }, {
    ex_back: 'वापस', ex_more: 'आपके लिए और', ex_parent: 'पेरेंट डैशबोर्ड', ex_plan: 'स्टडी प्लान', ex_doubt: 'डाउट सॉल्वर', ex_rewards: 'रिवॉर्ड्स', ex_fees: 'फीस रिमाइंडर',
    ex_owner: 'संस्था संचालक टूल्स', ex_leads: 'पूछताछ और लीड्स', ex_admin: 'व्हाइट-लेबल सेटिंग्स', ex_lock: 'पिन सुरक्षित',
    pd_title: 'पेरेंट डैशबोर्ड', pd_edit: 'बदलें', pd_save: 'सहेजें', pd_name: 'विद्यार्थी का नाम', pd_prog: 'कक्षा / कार्यक्रम', pd_joined: 'दाखिला', pd_avg: 'औसत स्कोर', pd_att: 'उपस्थिति', pd_week: 'स्टडी प्लान',
    pd_scores: 'टेस्ट स्कोर', pd_no_tests: 'अभी कोई टेस्ट नहीं हुआ। पहले टेस्ट के बाद स्कोर यहाँ दिखेंगे।', pd_rank: 'रैंक ट्रेंड (पिछले 6 सप्ताह)', pd_rank_now: 'मौजूदा रैंक', pd_cal: 'उपस्थिति, पिछले 4 सप्ताह',
    pd_up: 'आने वाले टेस्ट', pd_weekly: 'साप्ताहिक टेस्ट', pd_fee: 'फीस की स्थिति', pd_paid: 'किस्तें जमा', pd_next: 'अगली देय', pd_all_paid: 'सभी किस्तें जमा हैं', pd_open_fees: 'फीस रिमाइंडर',
    pd_present: 'उपस्थित', pd_absent: 'अनुपस्थित', pd_holiday: 'रविवार / छुट्टी', pd_demo: 'उपस्थिति, रैंक इतिहास और आने वाले टेस्ट डेमो के लिए बनाए गए काल्पनिक आँकड़े हैं। टेस्ट स्कोर और स्टडी प्लान की प्रगति इसी डिवाइस से आती है।',
    fe_title: 'फीस रिमाइंडर', fe_summary: 'फीस सारांश', fe_total: 'कुल फीस', fe_paid: 'जमा', fe_bal: 'बकाया', fe_sched: 'किस्तों की सूची', fe_inst: 'किस्त', fe_paid_s: 'जमा', fe_overdue: 'बकाया', fe_soon: 'जल्द देय', fe_up: 'आगामी',
    fe_mark: 'जमा चिह्नित करें (डेमो)', fe_undo: 'वापस', fe_notes: 'सूचनाएँ', fe_remind: 'अभिभावक को रिमाइंडर भेजें (डेमो)', fe_sent: 'पेरेंट ऐप पर रिमाइंडर भेजा गया (काल्पनिक)।', fe_none: 'कोई लंबित सूचना नहीं।',
    fe_n_overdue: 'किस्त {n}/{m} ({amt}) की देय तिथि {date} थी और {d} दिन बीत चुके हैं। कृपया जल्द भुगतान करें।', fe_n_soon: 'किस्त {n}/{m} ({amt}) की देय तिथि {date} है, {d} दिन में।',
    fe_n_up: 'अगली किस्त {n}/{m} ({amt}) की देय तिथि {date} है।', fe_n_paid: 'किस्त {n}/{m} ({amt}) का भुगतान मिल गया। धन्यवाद!', fe_demo: 'डेमो डेटा: भुगतान असली नहीं हैं।',
    pl_title: 'स्टडी प्लान', pl_built: 'आपके टेस्ट परिणाम और कमज़ोर टॉपिक के आधार पर बना।', pl_gen: 'प्लान को अपने अनुसार बनाने के लिए एक टेस्ट दें। तब तक यह आपकी कक्षा के अध्यायों पर आधारित है।', pl_weak: 'फोकस टॉपिक',
    pl_week: 'सप्ताह की प्रगति', pl_today: 'आज', pl_done_day: 'आज के सारे काम पूरे! बोनस +25 पॉइंट', pl_start: 'अभ्यास शुरू करें', pl_ask: 'डाउट पूछें', pl_report: 'रिपोर्ट देखें', pl_days: 'सोम,मंगल,बुध,गुरु,शुक्र,शनि,रवि',
    pl_t_revise: '{ch} दोहराएँ', pl_t_revise0: 'आज की क्लास के नोट्स दोहराएँ', pl_t_prac: 'प्रैक्टिस टेस्ट: {ch}', pl_t_prac0: 'प्रैक्टिस टेस्ट (मिले-जुले टॉपिक)', pl_t_mock: 'पूरा मॉक टेस्ट',
    pl_t_doubt: 'गलतियाँ देखें और डाउट पूछें', pl_t_rest: 'फ़ॉर्मूला और नोट्स का हल्का रिवीज़न', pl_t_review: 'साप्ताहिक समीक्षा: अपनी परफॉर्मेंस रिपोर्ट देखें', pl_tick: 'हर काम पूरा करने पर 10 पॉइंट पाएँ।',
    rw_title: 'रिवॉर्ड्स', rw_points: 'पॉइंट', rw_level: 'लेवल', rw_streak: 'दिन की स्ट्रीक', rw_best: 'सबसे लंबी स्ट्रीक', rw_badges: 'बैज', rw_next: 'पॉइंट अगले लेवल तक', rw_week: 'इस सप्ताह',
    rw_new: 'नया बैज मिला!', rw_plus: '+{n} पॉइंट', rw_streak_t: 'दिन {n} की स्ट्रीक!', rw_levels: 'स्टार्टर,लर्नर,अचीवर,स्कॉलर,चैंपियन,लेजेंड', rw_tests: 'दिए गए टेस्ट', rw_got: 'अनलॉक'
  });

  /* ---------------- small helpers ---------------- */
  function sod(ts) { var d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function dkey(ts) { var d = new Date(ts); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function mondayOf(ts) { var d = new Date(sod(ts)); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; }
  function fd(ts) { return new Date(ts).toLocaleDateString(lg() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' }); }
  function fmt12(s) { var p = s.split(':'), h = +p[0], ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + p[1] + ' ' + ap; }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hd(key) { return '<div class="ex-hd"><button class="ib" data-go="profile" aria-label="' + E(tt('ex_back')) + '">\u2039</button><h2 class="ph">' + tt(key) + '</h2></div>'; }
  function histAll() { return BP.tests && BP.tests.history ? BP.tests.history() : []; }
  function avgPct(h) { return h.length ? Math.round(h.reduce(function (s, e) { return s + e.pct; }, 0) / h.length) : 0; }
  function subN(s) { return BP.tests && BP.tests.subName ? BP.tests.subName(s) : s; }
  function exN(s) { return BP.tests && BP.tests.examName ? BP.tests.examName(s) : s; }

  /* ---------------- styles ---------------- */
  var CSS = '.ex-hd{display:flex;align-items:center;gap:10px;margin:6px 0 10px}.ex-hd .ph{margin:0}.ex-hd .ib{font-size:22px;line-height:1}' +
    '.ex-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:10px 0 4px}.ex-tile{display:flex;align-items:center;gap:10px;padding:12px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid var(--gb);text-align:left;font-weight:600;font-size:13.5px;transition:.2s}' +
    '.ex-tile:hover{border-color:var(--teal);box-shadow:0 0 16px rgba(20,211,196,.25)}.ex-tile:active{transform:scale(.96)}.ex-tile i{font-style:normal;font-size:22px}.ex-tile small{display:block;color:var(--mut);font-weight:500;font-size:11px}' +
    '.stk{padding:6px 11px;border-radius:999px;background:rgba(255,122,26,.18);border:1px solid rgba(255,122,26,.5);font-weight:700;font-size:13px;white-space:nowrap}' +
    '.ex-ch{display:flex;align-items:center;gap:12px}.ex-av{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font:700 18px Poppins,sans-serif;background:linear-gradient(135deg,var(--teal),#0b7f78);color:#04201e;flex:none}' +
    '.ex-rings{display:flex;gap:8px;justify-content:space-around}.ex-ring{position:relative;width:31%;text-align:center}.ex-ring svg{width:100%;height:auto;display:block}' +
    '.ex-rn{position:absolute;left:0;right:0;top:0;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;gap:1px}.ex-rn b{font:700 22px Poppins,sans-serif}.ex-rn small{color:var(--mut);margin-top:6px}.ex-ring>span{display:block;font-size:12px;color:var(--mut)}' +
    '.ex-line{width:100%;height:auto;display:block;margin-top:6px}.ex-line text{fill:#cfe0ff;font-size:9px}' +
    '.ex-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:8px}.ex-cal i{aspect-ratio:1;border-radius:8px;display:grid;place-items:center;font:600 10px Inter,sans-serif;font-style:normal}' +
    '.ex-cal .p{background:rgba(20,211,196,.28)}.ex-cal .a{background:rgba(255,90,95,.35)}.ex-cal .h{background:rgba(255,255,255,.08);color:var(--mut)}' +
    '.ex-lg{display:flex;gap:12px;flex-wrap:wrap;font-size:11.5px;color:var(--mut);margin-top:8px}.ex-lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}' +
    '.ex-bar{height:8px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}.ex-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--orange),var(--teal));transition:width 1s}' +
    '.ex-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid rgba(255,255,255,.08);font-size:13.5px}.ex-row:first-of-type{border-top:0}.ex-row>div{min-width:0;flex:1}.ex-row small{color:var(--mut);display:block}' +
    '.ex-in{width:100%;padding:11px 14px;border-radius:14px;background:rgba(255,255,255,.09);border:1px solid var(--gb);outline:0;margin:4px 0 8px}.ex-in:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(20,211,196,.18)}select.ex-in option{color:#000}' +
    '.ex-days{display:flex;gap:6px;margin-bottom:12px}.ex-days button{flex:1;padding:9px 0;border-radius:12px;font-weight:600;font-size:12.5px;color:var(--mut);background:rgba(255,255,255,.07);border:1px solid var(--gb);position:relative}' +
    '.ex-days button.on{color:#fff;background:linear-gradient(135deg,rgba(255,122,26,.4),rgba(20,211,196,.2));border-color:rgba(255,255,255,.3)}.ex-days button.td:after{content:"";position:absolute;top:4px;right:5px;width:6px;height:6px;border-radius:50%;background:var(--orange)}' +
    '.ex-task{display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:16px;background:var(--glass);border:1px solid var(--gb);margin:8px 0;backdrop-filter:blur(12px)}' +
    '.ex-chk{flex:none;width:30px;height:30px;border-radius:10px;border:2px solid rgba(255,255,255,.35);display:grid;place-items:center;font-weight:700;color:transparent;transition:.2s}.ex-task.done .ex-chk{background:var(--teal);border-color:var(--teal);color:#04201e}' +
    '.ex-tb{flex:1;min-width:0}.ex-tx{font-weight:600;font-size:14.5px}.ex-task.done .ex-tx{text-decoration:line-through;opacity:.6}.ex-tm{color:var(--mut);font-size:12.5px;margin:2px 0 8px}' +
    '.ex-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.ex-chips span{padding:4px 10px;border-radius:999px;background:rgba(255,90,95,.16);color:#ffb1b3;font-size:12px;font-weight:600}' +
    '.ex-nt{display:flex;gap:12px;padding:12px;border-radius:14px;margin:8px 0;background:rgba(255,255,255,.07);border:1px solid var(--gb);font-size:13.5px;animation:viewIn .3s both}.ex-nt i{font-style:normal;font-size:20px}' +
    '.ex-nt.overdue{border-color:rgba(255,90,95,.65)}.ex-nt.soon{border-color:rgba(255,176,32,.65)}.ex-nt.paid{border-color:rgba(20,211,196,.5)}' +
    '.ex-st{font-size:11px;font-weight:700;padding:2px 9px;border-radius:99px;white-space:nowrap}.ex-st.paid{background:rgba(20,211,196,.2);color:var(--teal)}.ex-st.overdue{background:rgba(255,90,95,.2);color:#ff7a7f}.ex-st.soon{background:rgba(255,176,32,.2);color:#ffb020}.ex-st.up{background:rgba(255,255,255,.12);color:var(--mut)}' +
    '.ex-dots{display:flex;gap:8px;justify-content:space-between;margin-top:10px}.ex-dots span{flex:1;text-align:center;font-size:11px;color:var(--mut)}.ex-dots i{display:block;width:100%;aspect-ratio:1;max-width:34px;margin:0 auto 4px;border-radius:50%;background:rgba(255,255,255,.1);font-style:normal;display:grid;place-items:center}.ex-dots i.on{background:linear-gradient(135deg,#ff9a3c,var(--orange));box-shadow:0 0 14px rgba(255,122,26,.5)}' +
    '.ex-bd{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ex-b{padding:14px 10px;border-radius:16px;text-align:center;background:var(--glass);border:1px solid var(--gb)}.ex-b.lock{opacity:.45;filter:grayscale(1)}.ex-b i{font-style:normal;font-size:30px;display:block}.ex-b b{display:block;font-size:13.5px;margin-top:4px}.ex-b small{color:var(--mut);font-size:11.5px}' +
    '.ex-big{font:700 34px Poppins,sans-serif;background:linear-gradient(90deg,#ffb36b,var(--orange));-webkit-background-clip:text;background-clip:text;color:transparent}' +
    '.ex-cel{position:fixed;inset:0;z-index:80;display:grid;place-items:center;background:rgba(5,10,30,.55);backdrop-filter:blur(4px);animation:viewIn .25s both}' +
    '.ex-cel-c{text-align:center;padding:26px 34px;border-radius:24px;background:linear-gradient(160deg,rgba(255,122,26,.4),rgba(20,211,196,.28));border:1px solid rgba(255,255,255,.3);box-shadow:0 0 60px rgba(255,122,26,.5);animation:exPop .5s cubic-bezier(.2,1.4,.3,1) both;max-width:80%}' +
    '.ex-cel-i{font-size:64px;line-height:1;margin-bottom:8px}.ex-cel-c b{display:block;font:700 18px Poppins,"Noto Sans Devanagari",sans-serif}.ex-cel-c span{display:block;color:#e6efff;margin-top:4px}' +
    '@keyframes exPop{from{transform:scale(.5);opacity:0}to{transform:none;opacity:1}}.ex-conf{position:fixed;inset:0;z-index:90;pointer-events:none}' +
    '@media(min-width:760px){.ex-grid{grid-template-columns:repeat(3,1fr)}.ex-bd{grid-template-columns:repeat(5,1fr)}}';
  if (!document.getElementById('ex-css')) { var stl = document.createElement('style'); stl.id = 'ex-css'; stl.textContent = CSS; document.head.appendChild(stl); }

  /* ---------------- shared widgets ---------------- */
  function ring(p, label, color) {
    p = Math.max(0, Math.min(100, p)); var C = 2 * Math.PI * 42;
    return '<div class="ex-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="9"/><circle cx="50" cy="50" r="42" fill="none" stroke="' + color + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - p / 100)).toFixed(1) + '" transform="rotate(-90 50 50)"/></svg><div class="ex-rn"><b>' + Math.round(p) + '</b><small>%</small></div><span>' + E(label) + '</span></div>';
  }
  function line(vals, o) {
    o = o || {}; var W = 300, H = 110, pad = 16, n = vals.length; if (n < 2) return '';
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); if (mn === mx) { mn -= 1; mx += 1; }
    var pts = vals.map(function (v, i) { var x = pad + i * (W - 2 * pad) / (n - 1), t = (v - mn) / (mx - mn), y = o.invert ? pad + t * (H - 2 * pad) : H - pad - t * (H - 2 * pad); return [x, y, v]; });
    var d = pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    var dots = pts.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" fill="' + (o.color || 'var(--orange)') + '"/><text x="' + p[0].toFixed(1) + '" y="' + (p[1] - 8).toFixed(1) + '" text-anchor="middle">' + Math.round(p[2]) + '</text>'; }).join('');
    return '<svg class="ex-line" viewBox="0 0 300 110"><polyline points="' + d + '" fill="none" stroke="' + (o.color || 'var(--orange)') + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' + dots + '</svg>';
  }

  /* ---------------- child profile + fees ---------------- */
  X.child = function () {
    var c = BP.store.get('child', null);
    if (!c) { c = { name: 'Aarav Sharma', prog: 'c10', joined: Date.now() - 25 * 864e5 }; BP.store.set('child', c); var fp = BP.store.get('feepaid', {}); fp.c10 = [0]; BP.store.set('feepaid', fp); }
    return c;
  };
  X.saveChild = function (name, prog) {
    var c = X.child(), fp = BP.store.get('feepaid', {});
    c.name = (name || c.name).trim() || c.name;
    if (prog && prog !== c.prog) { c.prog = prog; if (!fp[prog]) { fp[prog] = [0]; BP.store.set('feepaid', fp); } }
    BP.store.set('child', c); return c;
  };
  X.fees = function () {
    var A = BP.agent, c = X.child(), p = A.prog(c.prog) || A.prog('c10'), inf = A.feeInfo(p), paid = (BP.store.get('feepaid', {})[p.id]) || [], today = sod(Date.now()), items = [], k, paidAmt = 0;
    for (k = 0; k < inf.n; k++) {
      var amt = k < inf.n - 1 ? inf.each : inf.total - inf.each * (inf.n - 1), due = sod(c.joined) + k * 30 * 864e5, diff = Math.round((due - today) / 864e5), st;
      if (paid.indexOf(k) > -1) { st = 'paid'; paidAmt += amt; } else if (diff < 0) st = 'overdue'; else if (diff <= 7) st = 'soon'; else st = 'up';
      items.push({ k: k, amt: amt, due: due, diff: diff, st: st });
    }
    var next = items.filter(function (i) { return i.st !== 'paid'; })[0] || null;
    return { prog: p, info: inf, items: items, paidAmt: paidAmt, balance: inf.total - paidAmt, next: next, nPaid: items.filter(function (i) { return i.st === 'paid'; }).length };
  };
  X.setPaid = function (k, on) {
    var c = X.child(), fp = BP.store.get('feepaid', {}), a = fp[c.prog] || [], i = a.indexOf(k);
    if (on && i < 0) a.push(k); if (!on && i > -1) a.splice(i, 1);
    fp[c.prog] = a; BP.store.set('feepaid', fp);
  };

  /* ---------------- simulated parent data (seeded, stable per child) ---------------- */
  X.attendance = function () {
    var c = X.child(), r = rng(hash(c.name + 'att')), today = sod(Date.now()), days = [], pres = 0, tot = 0, k;
    for (k = 27; k >= 0; k--) {
      var d = new Date(today); d.setDate(d.getDate() - k); var st;
      if (d.getDay() === 0) st = 'h'; else { st = r() < 0.92 ? 'p' : 'a'; tot++; if (st === 'p') pres++; }
      days.push({ t: d.getTime(), s: st, n: d.getDate() });
    }
    return { days: days, pct: tot ? Math.round(pres / tot * 100) : 0 };
  };
  X.planExam = function () {
    var h = histAll(); if (h.length) return h[h.length - 1].exam;
    var p = BP.agent.prog(X.child().prog), t = p && p.tags; return t && t.cls ? 'c' + t.cls : (t && t.exam) || 'c10';
  };
  X.rankTrend = function () {
    var exam = X.planExam(), ri = BP.tests && BP.tests.rankInfo ? BP.tests.rankInfo(exam) : null, r = rng(hash(X.child().name + 'rk')), total = ri ? ri.total : 201, last = ri ? ri.rank : Math.round(total * 0.4), vals = [last], k;
    for (k = 0; k < 5; k++) vals.unshift(Math.max(1, Math.min(total, vals[0] + Math.round((r() - 0.4) * 30))));
    return { vals: vals, total: total, real: !!ri, now: last };
  };
  X.upcoming = function () {
    var ex = X.planExam(), d = BP.qb && BP.qb.get ? BP.qb.get(ex) : null, subs = d ? Object.keys(d) : ['Mathematics', 'Science', 'English'], today = sod(Date.now()), dow = new Date(today).getDay(), toSat = (6 - dow + 7) % 7 || 7, out = [], k;
    for (k = 0; k < 3; k++) out.push({ t: today + (toSat + k * 7) * 864e5, sub: subs[k % subs.length] });
    return out;
  };

  /* ---------------- rewards: points, streak, badges ---------------- */
  var BADGES = [
    { id: 'first_test', ic: '\uD83D\uDE80', n: { en: 'First Step', hi: 'पहला कदम' }, d: { en: 'Complete your first test', hi: 'अपना पहला टेस्ट पूरा करें' } },
    { id: 'tests5', ic: '\uD83D\uDCDA', n: { en: 'Test Taker', hi: 'टेस्ट वीर' }, d: { en: 'Complete 5 tests', hi: '5 टेस्ट पूरे करें' } },
    { id: 'ace', ic: '\uD83C\uDFAF', n: { en: 'Sharp Shooter', hi: 'सटीक निशानेबाज़' }, d: { en: 'Score 80% or more in a test', hi: 'किसी टेस्ट में 80% या अधिक पाएँ' } },
    { id: 'perfect', ic: '\uD83C\uDFC6', n: { en: 'Perfectionist', hi: 'परफेक्शनिस्ट' }, d: { en: 'Answer every question correctly', hi: 'सारे प्रश्न सही करें' } },
    { id: 'streak3', ic: '\uD83D\uDD25', n: { en: 'On Fire', hi: 'लगातार जारी' }, d: { en: 'Reach a 3-day streak', hi: '3 दिन की स्ट्रीक बनाएँ' } },
    { id: 'streak7', ic: '\u26A1', n: { en: 'Week Warrior', hi: 'सप्ताह योद्धा' }, d: { en: 'Reach a 7-day streak', hi: '7 दिन की स्ट्रीक बनाएँ' } },
    { id: 'streak30', ic: '\uD83D\uDC51', n: { en: 'Unstoppable', hi: 'अजेय' }, d: { en: 'Reach a 30-day streak', hi: '30 दिन की स्ट्रीक बनाएँ' } },
    { id: 'planner', ic: '\u2705', n: { en: 'Planner', hi: 'योजनाकार' }, d: { en: 'Finish all tasks of one day in your plan', hi: 'प्लान के एक दिन के सारे काम पूरे करें' } },
    { id: 'buyer', ic: '\uD83D\uDED2', n: { en: 'Course Explorer', hi: 'कोर्स खोजी' }, d: { en: 'Enrol in a course', hi: 'किसी कोर्स में एनरोल हों' } },
    { id: 'pts500', ic: '\uD83D\uDC8E', n: { en: 'Gem Collector', hi: 'रत्न संग्राहक' }, d: { en: 'Earn 500 points', hi: '500 पॉइंट कमाएँ' } }
  ];
  X.badges = BADGES;
  function G() { var g = BP.store.get('game', null) || {}; g.points = g.points || 0; g.streak = g.streak || 0; g.best = g.best || 0; g.last = g.last || ''; g.badges = g.badges || {}; g.days = g.days || []; return g; }
  X.game = G;
  function save(g) { BP.store.set('game', g); BP.emit('game', g); }
  var pend = [], busy = false;
  function award(g, id) { if (g.badges[id]) return false; g.badges[id] = Date.now(); g.points += 25; pend.push(id); return true; }
  function check(g) { if (g.points >= 500) award(g, 'pts500'); }
  function flush() {
    if (busy || !pend.length) return; busy = true;
    var id = pend.shift(), b = BADGES.filter(function (x) { return x.id === id; })[0];
    if (b) X.celebrate(b.ic, tt('rw_new'), pk(b.n));
    setTimeout(function () { busy = false; flush(); }, 2700);
  }
  X.points = function (n, quiet) { var g = G(); g.points += n; check(g); save(g); if (!quiet) BP.toast(rep(tt('rw_plus'), { n: n }), 1500); flush(); return g; };
  X.touch = function () {
    var g = G(), today = dkey(Date.now()); if (g.last === today) return g;
    g.streak = g.last === dkey(Date.now() - 864e5) ? g.streak + 1 : 1; g.best = Math.max(g.best, g.streak); g.last = today;
    g.days.push(today); g.days = g.days.slice(-60); g.points += 5;
    if (g.streak >= 3) award(g, 'streak3'); if (g.streak >= 7) award(g, 'streak7'); if (g.streak >= 30) award(g, 'streak30');
    check(g); save(g);
    if (g.streak > 1 && !pend.length) setTimeout(function () { BP.toast('\uD83D\uDD25 ' + rep(tt('rw_streak_t'), { n: g.streak }), 2400); }, 1200);
    setTimeout(flush, 900); return g;
  };
  X.celebrate = function (icon, title, sub) {
    X.confetti();
    var o = document.createElement('div'); o.className = 'ex-cel';
    o.innerHTML = '<div class="ex-cel-c"><div class="ex-cel-i">' + icon + '</div><b>' + E(title) + '</b><span>' + E(sub || '') + '</span></div>';
    o.onclick = function () { o.remove(); }; document.body.appendChild(o);
    setTimeout(function () { if (o.parentNode) o.remove(); }, 2400);
  };
  X.confetti = function () {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cv = document.createElement('canvas'); cv.className = 'ex-conf'; cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
    var cx = cv.getContext('2d'), cols = ['#ff7a1a', '#14d3c4', '#ffd24a', '#ff5a8a', '#6aa8ff', '#ffffff'], ps = [], i;
    for (i = 0; i < 150; i++) ps.push({ x: cv.width / 2 + (Math.random() - 0.5) * 80, y: cv.height * 0.45, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, s: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[i % cols.length] });
    var t0 = performance.now();
    (function f(t) {
      var el = t - t0; cx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach(function (p) { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.globalAlpha = Math.max(0, 1 - el / 2600); cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); cx.restore(); });
      if (el < 2600) requestAnimationFrame(f); else cv.remove();
    })(t0);
  };
  BP.on('test:done', function (R) {
    var g = G(), gain = R.cor * 2 + 10, n = histAll().length; g.points += gain;
    if (n >= 1) award(g, 'first_test'); if (n >= 5) award(g, 'tests5'); if (R.pct >= 80) award(g, 'ace'); if (R.n > 0 && R.cor === R.n) award(g, 'perfect');
    check(g); save(g); BP.toast(rep(tt('rw_plus'), { n: gain }), 1800); setTimeout(flush, 600);
  });
  BP.on('order:placed', function () { var g = G(); g.points += 20; award(g, 'buyer'); check(g); save(g); setTimeout(flush, 600); });

  /* ---------------- study plan ---------------- */
  X.plan = function () {
    var wk = dkey(mondayOf(Date.now())), p = BP.store.get('plan', null);
    if (!p || p.wk !== wk) { p = { wk: wk, done: {}, paid: {} }; BP.store.set('plan', p); }
    return p;
  };
  X.planItems = function () {
    var exam = X.planExam(), items = [], weak = BP.tests && BP.tests.weak ? BP.tests.weak(6) : [];
    var w2 = weak.filter(function (w) { return w.exam === exam; }); if (w2.length) weak = w2;
    weak.forEach(function (w) { items.push({ exam: w.exam, sub: w.subject, ch: w.chapter, acc: w.acc }); });
    if (items.length < 4 && BP.qb && BP.qb.get) {
      var d = BP.qb.get(exam);
      if (d) Object.keys(d).forEach(function (s) { BP.qb.chapters(exam, s).slice(0, 2).forEach(function (c) { if (items.length < 5 && !items.some(function (i) { return i.sub === s && i.ch === c.ch; })) items.push({ exam: exam, sub: s, ch: c.ch, acc: null }); }); });
    }
    return items;
  };
  X.planWeek = function () {
    var items = X.planItems(), mon = mondayOf(Date.now()), p = X.plan(), days = [], i, exam = X.planExam();
    function it(n) { return items.length ? items[n % items.length] : null; }
    function mk(i, slot, from, to, type, item) { return { key: p.wk + '|' + i + '|' + slot, from: from, to: to, type: type, exam: item ? item.exam : exam, sub: item ? item.sub : null, ch: item ? item.ch : '' }; }
    for (i = 0; i < 7; i++) {
      var d = new Date(mon); d.setDate(mon.getDate() + i);
      var a = it(i), b = it(i + 1) || a, T = [];
      if (i < 5) T.push(mk(i, 'a', '06:30', '07:15', 'revise', a), mk(i, 'b', '17:00', '17:40', 'practice', b), mk(i, 'c', '20:00', '20:30', 'doubt', null));
      else if (i === 5) T.push(mk(i, 'a', '07:00', '08:00', 'revise', a), mk(i, 'b', '10:00', '11:30', 'mock', null), mk(i, 'c', '20:00', '20:30', 'doubt', null));
      else T.push(mk(i, 'a', '09:00', '09:30', 'rest', null), mk(i, 'b', '17:00', '17:30', 'review', null));
      days.push({ i: i, date: d.getTime(), tasks: T });
    }
    return days;
  };
  X.planStats = function () { var wk = X.planWeek(), p = X.plan(), tot = 0, done = 0; wk.forEach(function (d) { d.tasks.forEach(function (t) { tot++; if (p.done[t.key]) done++; }); }); return { total: tot, done: done }; };
  X.taskText = function (t) {
    var k = { revise: t.ch ? 'pl_t_revise' : 'pl_t_revise0', practice: t.ch ? 'pl_t_prac' : 'pl_t_prac0', mock: 'pl_t_mock', doubt: 'pl_t_doubt', rest: 'pl_t_rest', review: 'pl_t_review' }[t.type];
    return rep(tt(k), { ch: t.ch || '' });
  };
  X.tick = function (day, key) {
    var p = X.plan(), g = G(), gain = 0, full = false;
    if (p.done[key]) delete p.done[key];
    else {
      p.done[key] = Date.now(); if (!p.paid[key]) { p.paid[key] = 1; gain += 10; }
      if (day.tasks.every(function (t) { return p.done[t.key]; }) && !p.paid['d' + day.i]) { p.paid['d' + day.i] = 1; gain += 25; full = true; award(g, 'planner'); }
    }
    BP.store.set('plan', p);
    if (gain) { g.points += gain; check(g); save(g); BP.toast(rep(tt('rw_plus'), { n: gain }), 1500); }
    if (full) X.celebrate('\u2705', tt('pl_done_day'), '');
    flush();
  };

  BP.registerView('plan', function (box) {
    var sel = (new Date().getDay() + 6) % 7, todayI = sel;
    function startFor(t) {
      if (!BP.tests || !BP.tests.start) return;
      var r = BP.tests.start({ exam: t.exam, subject: t.type === 'mock' ? '*' : t.sub, chapter: t.type === 'mock' ? '*' : t.ch });
      if (!r.ok) BP.toast(tt('tt_nobank'));
    }
    function paint() {
      var wk = X.planWeek(), p = X.plan(), st = X.planStats(), day = wk[sel], names = tt('pl_days').split(','), weak = BP.tests && BP.tests.weak ? BP.tests.weak(5) : [], h = hd('pl_title');
      h += '<div class="card"><div class="row"><b>' + tt('pl_week') + '</b><span class="pill">' + st.done + ' / ' + st.total + '</span></div><div class="ex-bar"><i style="width:' + (st.total ? Math.round(st.done / st.total * 100) : 0) + '%"></i></div>' +
        '<p class="mut" style="font-size:12.5px;margin:8px 0 0">' + (histAll().length ? tt('pl_built') : tt('pl_gen')) + ' ' + tt('pl_tick') + '</p>';
      if (weak.length) h += '<div class="ex-chips">' + weak.map(function (w) { return '<span>' + E(w.chapter) + ' \u00B7 ' + w.acc + '%</span>'; }).join('') + '</div>';
      h += '</div><div class="ex-days">' + wk.map(function (d) { return '<button class="' + (d.i === sel ? 'on ' : '') + (d.i === todayI ? 'td' : '') + '" data-a="day" data-v="' + d.i + '">' + E(names[d.i] || '') + '<br><small>' + new Date(d.date).getDate() + '</small></button>'; }).join('') + '</div>';
      day.tasks.forEach(function (t, k) {
        var done = !!p.done[t.key], act = '';
        if (t.type === 'revise' || t.type === 'practice') act = t.ch ? '<button class="btn sm" data-a="prac" data-v="' + k + '">' + tt('pl_start') + '</button>' : '';
        else if (t.type === 'mock') act = '<button class="btn sm" data-a="prac" data-v="' + k + '">' + tt('pl_start') + '</button>';
        else if (t.type === 'doubt') act = '<button class="btn sm ghost" data-go="doubt">' + tt('pl_ask') + '</button>';
        else if (t.type === 'review') act = '<button class="btn sm ghost" data-a="report">' + tt('pl_report') + '</button>';
        h += '<div class="ex-task' + (done ? ' done' : '') + '"><button class="ex-chk" data-a="tick" data-v="' + E(t.key) + '" aria-label="done">\u2713</button><div class="ex-tb"><div class="ex-tx">' + E(X.taskText(t)) + '</div><div class="ex-tm">' + fmt12(t.from) + ' - ' + fmt12(t.to) + (t.sub ? ' \u00B7 ' + E(subN(t.sub)) : '') + '</div>' + (act ? '<div class="c-b">' + act + '</div>' : '') + '</div></div>';
      });
      box.innerHTML = h;
    }
    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-a]'); if (!t) return;
      var a = t.getAttribute('data-a'), v = t.getAttribute('data-v'), wk = X.planWeek();
      if (a === 'day') { sel = +v; paint(); }
      else if (a === 'tick') { X.tick(wk[sel], v); paint(); }
      else if (a === 'prac') startFor(wk[sel].tasks[+v]);
      else if (a === 'report') BP.tests.openTab('perf');
    });
    paint();
  });

  /* ---------------- parent dashboard ---------------- */
  BP.registerView('parent', function (box) {
    var st = { edit: false };
    function paint() {
      var A = BP.agent, c = X.child(), p = A.prog(c.prog) || A.prog('c10'), h = histAll(), avg = avgPct(h), att = X.attendance(), ps = X.planStats(), pw = ps.total ? Math.round(ps.done / ps.total * 100) : 0, F = X.fees(), rt = X.rankTrend(), up = X.upcoming(), o = hd('pd_title');
      o += '<div class="card">';
      if (st.edit) {
        o += '<label class="mut" style="font-size:12px">' + tt('pd_name') + '</label><input class="ex-in" id="ex-cn" maxlength="40" value="' + E(c.name) + '"><label class="mut" style="font-size:12px">' + tt('pd_prog') + '</label><select class="ex-in" id="ex-cp">' +
          A.K.programs.map(function (q) { return '<option value="' + q.id + '"' + (q.id === c.prog ? ' selected' : '') + '>' + E(A.pick(q.name, lg())) + '</option>'; }).join('') + '</select><div class="c-b"><button class="btn sm" data-a="save">' + tt('pd_save') + '</button></div>';
      } else {
        o += '<div class="ex-ch"><span class="ex-av">' + E(c.name.charAt(0).toUpperCase()) + '</span><div><b>' + E(c.name) + '</b><div class="mut" style="font-size:13px">' + E(A.pick(p.name, lg())) + ' \u00B7 ' + tt('pd_joined') + ' ' + fd(c.joined) + '</div></div><div class="sp"></div><button class="btn ghost sm" data-a="edit">' + tt('pd_edit') + '</button></div>';
      }
      o += '</div><div class="card"><div class="ex-rings">' + ring(avg, tt('pd_avg'), avg >= 75 ? '#14d3c4' : avg >= 50 ? '#ffb020' : '#ff5a5f') + ring(att.pct, tt('pd_att'), '#6aa8ff') + ring(pw, tt('pd_week'), '#ff7a1a') + '</div></div>';
      o += '<div class="card"><b>' + tt('pd_scores') + '</b>';
      if (!h.length) o += '<p class="mut" style="font-size:13px;margin:8px 0 0">' + tt('pd_no_tests') + '</p>';
      else {
        var last = h.slice(-6); o += line(last.map(function (e) { return e.pct; }), { color: '#14d3c4' });
        last.slice().reverse().slice(0, 4).forEach(function (e) { o += '<div class="ex-row"><div><b>' + E(exN(e.exam) + ' \u00B7 ' + (e.sub === '*' ? '' : subN(e.sub))) + '</b><small>' + fd(e.ts) + ' \u00B7 ' + e.score + '/' + e.max + '</small></div><span class="pill">' + Math.round(e.pct) + '%</span></div>'; });
      }
      o += '</div><div class="card"><div class="row"><b>' + tt('pd_rank') + '</b><span class="pill">' + tt('pd_rank_now') + ' #' + rt.now + '</span></div>' + line(rt.vals, { invert: true, color: '#ffb020' }) + '</div>';
      o += '<div class="card"><b>' + tt('pd_cal') + '</b><div class="ex-cal">' + att.days.map(function (d) { return '<i class="' + d.s + '">' + d.n + '</i>'; }).join('') + '</div><div class="ex-lg"><span><i style="background:rgba(20,211,196,.5)"></i>' + tt('pd_present') + '</span><span><i style="background:rgba(255,90,95,.6)"></i>' + tt('pd_absent') + '</span><span><i style="background:rgba(255,255,255,.2)"></i>' + tt('pd_holiday') + '</span></div></div>';
      o += '<div class="card"><b>' + tt('pd_up') + '</b>' + up.map(function (u) { return '<div class="ex-row"><div><b>' + E(subN(u.sub)) + ' ' + tt('pd_weekly') + '</b></div><span class="pill">' + fd(u.t) + '</span></div>'; }).join('') + '</div>';
      o += '<div class="card"><div class="row"><b>' + tt('pd_fee') + '</b><span class="pill">' + F.nPaid + ' / ' + F.items.length + ' ' + tt('pd_paid') + '</span></div>' +
        BP.kvHTML([[tt('fe_total'), BP.inr(F.info.total)], [tt('fe_paid'), BP.inr(F.paidAmt)], [tt('fe_bal'), BP.inr(F.balance)], [tt('pd_next'), F.next ? E(fd(F.next.due) + ' \u00B7 ' + BP.inr(F.next.amt)) : tt('pd_all_paid')]]) +
        '<button class="btn sm" data-go="fees">' + tt('pd_open_fees') + '</button></div><p class="mut" style="font-size:12px;margin:4px 2px 0">' + tt('pd_demo') + '</p>';
      box.innerHTML = o;
    }
    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-a]'); if (!t) return; var a = t.getAttribute('data-a');
      if (a === 'edit') { st.edit = true; paint(); }
      else if (a === 'save') { X.saveChild(($('#ex-cn', box) || {}).value, ($('#ex-cp', box) || {}).value); st.edit = false; paint(); }
    });
    paint();
  });

  /* ---------------- fee reminders ---------------- */
  BP.registerView('fees', function (box) {
    function paint() {
      var F = X.fees(), n = F.items.length, h = hd('fe_title'), icon = { overdue: '\u26A0\uFE0F', soon: '\u23F0', up: '\uD83D\uDCC5', paid: '\u2705' }, nts = [];
      var pct = F.info.total ? Math.round(F.paidAmt / F.info.total * 100) : 0;
      h += '<div class="card"><b>' + tt('fe_summary') + '</b><div class="ex-rings" style="margin:10px 0">' + ring(pct, tt('fe_paid'), '#14d3c4') + '</div>' +
        BP.kvHTML([[tt('fe_total'), BP.inr(F.info.total)], [tt('fe_paid'), BP.inr(F.paidAmt)], [tt('fe_bal'), BP.inr(F.balance)]]) + '<div class="c-b"><button class="btn sm" data-a="remind">' + tt('fe_remind') + '</button></div></div>';
      F.items.forEach(function (i) {
        var amt = BP.inr(i.amt), o = { n: i.k + 1, m: n, amt: amt, date: fd(i.due), d: Math.abs(i.diff) };
        if (i.st === 'overdue') nts.push({ s: 'overdue', t: rep(tt('fe_n_overdue'), o) });
        else if (i.st === 'soon') nts.push({ s: 'soon', t: rep(tt('fe_n_soon'), o) });
      });
      if (F.next && F.next.st === 'up') nts.push({ s: 'up', t: rep(tt('fe_n_up'), { n: F.next.k + 1, m: n, amt: BP.inr(F.next.amt), date: fd(F.next.due) }) });
      F.items.filter(function (i) { return i.st === 'paid'; }).slice(-2).forEach(function (i) { nts.push({ s: 'paid', t: rep(tt('fe_n_paid'), { n: i.k + 1, m: n, amt: BP.inr(i.amt) }) }); });
      h += '<div class="card"><b>' + tt('fe_notes') + '</b>' + (nts.length ? nts.map(function (x) { return '<div class="ex-nt ' + x.s + '"><i>' + icon[x.s] + '</i><span>' + E(x.t) + '</span></div>'; }).join('') : '<p class="mut" style="font-size:13px">' + tt('fe_none') + '</p>') + '</div>';
      h += '<div class="card"><b>' + tt('fe_sched') + '</b>' + F.items.map(function (i) {
        var lab = { paid: 'fe_paid_s', overdue: 'fe_overdue', soon: 'fe_soon', up: 'fe_up' }[i.st];
        return '<div class="ex-row"><div><b>' + tt('fe_inst') + ' ' + (i.k + 1) + ' / ' + n + ' \u00B7 ' + BP.inr(i.amt) + '</b><small>' + fd(i.due) + '</small></div><span class="ex-st ' + i.st + '">' + tt(lab) + '</span><button class="btn sm ghost" data-a="pay" data-v="' + i.k + '" data-on="' + (i.st === 'paid' ? 0 : 1) + '">' + (i.st === 'paid' ? tt('fe_undo') : tt('fe_mark')) + '</button></div>';
      }).join('') + '<p class="mut" style="font-size:12px;margin:8px 0 0">' + tt('fe_demo') + '</p></div>';
      box.innerHTML = h;
    }
    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-a]'); if (!t) return; var a = t.getAttribute('data-a');
      if (a === 'pay') { X.setPaid(+t.getAttribute('data-v'), t.getAttribute('data-on') === '1'); paint(); }
      else if (a === 'remind') BP.toast(tt('fe_sent'), 2600);
    });
    paint();
  });

  /* ---------------- rewards screen ---------------- */
  BP.registerView('rewards', function (box) {
    var g = G(), lvl = Math.floor(g.points / 100) + 1, into = g.points % 100, names = tt('rw_levels').split(','), o = hd('rw_title'), i, wk = [], n = histAll().length;
    for (i = 6; i >= 0; i--) { var d = new Date(sod(Date.now())); d.setDate(d.getDate() - i); wk.push({ on: g.days.indexOf(dkey(d.getTime())) > -1, l: d.toLocaleDateString(lg() === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short' }).slice(0, 3) }); }
    o += '<div class="card" style="text-align:center"><div class="ex-big">' + g.points + '</div><div class="mut">' + tt('rw_points') + ' \u00B7 ' + tt('rw_level') + ' ' + lvl + ' (' + E(names[Math.min(lvl - 1, names.length - 1)] || '') + ')</div>' +
      '<div class="ex-bar" style="margin:12px 0 6px"><i style="width:' + into + '%"></i></div><div class="mut" style="font-size:12.5px">' + (100 - into) + ' ' + tt('rw_next') + '</div></div>';
    o += '<div class="card"><div class="stats"><div><b>\uD83D\uDD25 ' + g.streak + '</b><span>' + tt('rw_streak') + '</span></div><div><b>' + g.best + '</b><span>' + tt('rw_best') + '</span></div><div><b>' + n + '</b><span>' + tt('rw_tests') + '</span></div></div>' +
      '<div class="ex-dots">' + wk.map(function (x) { return '<span><i class="' + (x.on ? 'on' : '') + '">' + (x.on ? '\uD83D\uDD25' : '') + '</i>' + E(x.l) + '</span>'; }).join('') + '</div></div>';
    o += '<div class="card"><b>' + tt('rw_badges') + ' (' + Object.keys(g.badges).length + '/' + BADGES.length + ')</b><div class="ex-bd" style="margin-top:10px">' + BADGES.map(function (b) {
      var got = !!g.badges[b.id];
      return '<div class="ex-b' + (got ? '' : ' lock') + '"><i>' + b.ic + '</i><b>' + E(pk(b.n)) + '</b><small>' + E(pk(b.d)) + '</small></div>';
    }).join('') + '</div></div>';
    box.innerHTML = o;
  });

  /* ---------------- hub on the Profile tab + header streak chip ---------------- */
  BP.profileSections.push(function () {
    var d = BP.el('div', 'card'), g = G();
    function tile(v, ic, k, sub) { return '<button class="ex-tile" data-go="' + v + '"><i>' + ic + '</i><span>' + tt(k) + (sub ? '<small>' + tt(sub) + '</small>' : '') + '</span></button>'; }
    d.innerHTML = '<b>' + tt('ex_more') + '</b><div class="ex-grid">' + tile('parent', '\uD83D\uDC6A', 'ex_parent') + tile('plan', '\uD83D\uDDD3\uFE0F', 'ex_plan') + tile('doubt', '\uD83D\uDCA1', 'ex_doubt') + tile('rewards', '\uD83C\uDFC6', 'ex_rewards') + tile('fees', '\uD83D\uDD14', 'ex_fees') + '</div>' +
      '<div class="mut" style="font-size:12px;margin:12px 2px 0;text-transform:uppercase;letter-spacing:.5px">' + tt('ex_owner') + '</div><div class="ex-grid">' + tile('leads', '\uD83D\uDCCB', 'ex_leads', 'ex_lock') + tile('admin', '\uD83C\uDFA8', 'ex_admin', 'ex_lock') + '</div>';
    return d;
  });
  var EXV = ['parent', 'plan', 'doubt', 'rewards', 'fees', 'leads', 'admin'];
  function chip() {
    var top = $('.top'); if (!top) return; var c = $('.stk', top), g = G();
    if (!c) { c = document.createElement('button'); c.className = 'stk'; c.setAttribute('data-go', 'rewards'); top.insertBefore(c, $('.seg', top) || null); }
    c.innerHTML = '\uD83D\uDD25 ' + g.streak; c.setAttribute('aria-label', tt('rw_streak'));
  }
  BP.on('view', function (id) { chip(); if (EXV.indexOf(id) > -1) $$('[data-nav]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-nav') === 'profile'); }); });
  BP.on('game', chip);
  BP.on('ready', function () { X.child(); X.touch(); });

  /* ---------------- white-label: replace the brand name inside agent replies ---------------- */
  var _add = BP.chat.add;
  BP.chat.add = function (role, res) {
    if (role === 'agent' && res) { var nm = BP.settings.logoText; if (nm && nm !== 'BrightPath') ['text', 'speak'].forEach(function (k) { if (typeof res[k] === 'string') res[k] = res[k].replace(/BrightPath/g, nm); }); }
    return _add.call(BP.chat, role, res);
  };

  /* ---------------- one-shot voice input helper (used by the doubt solver) ---------------- */
  X.listenOnce = function (cb, onState) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { BP.toast(tt('unsupported_stt')); return; }
    if (BP.voice) BP.voice.cancelSpeak();
    var r; try { r = new SR(); } catch (e) { BP.toast(tt('unsupported_stt')); return; }
    r.lang = (BP.packs[BP.settings.lang] || BP.packs.en).speech; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = function (e) { cb(e.results[0][0].transcript); };
    r.onerror = function (e) { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') BP.toast(tt('mic_denied'), 4500); else if (e.error === 'no-speech') BP.toast(tt('no_speech')); };
    r.onend = function () { if (onState) onState(false); };
    try { r.start(); if (onState) onState(true); } catch (e) { if (onState) onState(false); }
  };
  X.speakNow = function (text) {
    if (!BP.voice) return; var l = /[\u0900-\u097F]/.test(text) ? 'hi' : 'en', v = BP.settings.voiceOn;
    BP.settings.voiceOn = true; BP.voice.speak(text, l); BP.settings.voiceOn = v;
  };

  /* ---------------- voice / chat intents ---------------- */
  function goCard(view, en, hi) { return { type: 'go', view: view, label: BP.agent.T(en, hi) }; }
  function hParent() {
    var A = BP.agent, T = A.T, c = X.child(), att = X.attendance(), h = histAll(), avg = avgPct(h), F = X.fees();
    var t = T(c.name + ' has ' + att.pct + ' percent attendance' + (h.length ? ' and an average test score of ' + avg + ' percent' : '') + '. ' + (F.next ? 'The next fee installment is due on ' + fd(F.next.due) + '.' : 'All fee installments are paid.'),
      c.name + ' की उपस्थिति ' + att.pct + ' प्रतिशत है' + (h.length ? ' और औसत टेस्ट स्कोर ' + avg + ' प्रतिशत है' : '') + '। ' + (F.next ? 'अगली फीस किस्त ' + fd(F.next.due) + ' को देय है।' : 'सभी फीस किस्तें जमा हैं।'));
    return { text: t, speak: t, card: goCard('parent', 'Open parent dashboard', 'पेरेंट डैशबोर्ड खोलें'), chips: T(['Fee status', 'Study plan', 'How did I perform'], ['फीस की स्थिति', 'स्टडी प्लान', 'मेरा प्रदर्शन']) };
  }
  function hFee() {
    var A = BP.agent, T = A.T, F = X.fees(), n = F.next, t;
    if (!n) t = T('All fee installments are paid. Thank you!', 'सभी फीस किस्तें जमा हैं। धन्यवाद!');
    else if (n.st === 'overdue') t = T('Installment ' + (n.k + 1) + ' of ' + BP.inr(n.amt) + ' was due on ' + fd(n.due) + ' and is overdue by ' + Math.abs(n.diff) + ' days. Total balance is ' + BP.inr(F.balance) + '.', 'किस्त ' + (n.k + 1) + ' (' + BP.inr(n.amt) + ') की देय तिथि ' + fd(n.due) + ' थी और ' + Math.abs(n.diff) + ' दिन बीत चुके हैं। कुल बकाया ' + BP.inr(F.balance) + ' है।');
    else t = T('The next installment of ' + BP.inr(n.amt) + ' is due on ' + fd(n.due) + ', ' + (n.diff === 0 ? 'today' : 'in ' + n.diff + ' days') + '. Total balance is ' + BP.inr(F.balance) + '.', 'अगली किस्त ' + BP.inr(n.amt) + ' की देय तिथि ' + fd(n.due) + ' है, ' + (n.diff === 0 ? 'आज' : n.diff + ' दिन में') + '। कुल बकाया ' + BP.inr(F.balance) + ' है।');
    return { text: t, speak: t, card: goCard('fees', 'Open fee reminders', 'फीस रिमाइंडर खोलें'), chips: T(['Parent dashboard', 'Refund policy'], ['पेरेंट डैशबोर्ड', 'रिफंड नीति']) };
  }
  function hPlan() {
    var A = BP.agent, T = A.T, wk = X.planWeek(), day = wk[(new Date().getDay() + 6) % 7], tx = day.tasks.map(X.taskText), p = X.plan();
    var left = day.tasks.filter(function (t) { return !p.done[t.key]; }).length;
    var t = T('Today you have ' + day.tasks.length + ' tasks, ' + left + ' still pending. First: ' + tx[0] + '. Then: ' + tx[1] + '. Open the plan to tick them off.',
      'आज आपके ' + day.tasks.length + ' काम हैं, ' + left + ' बाकी हैं। पहला: ' + tx[0] + '। फिर: ' + tx[1] + '। टिक करने के लिए प्लान खोलें।');
    return { text: t, speak: t, card: goCard('plan', 'Open study plan', 'स्टडी प्लान खोलें'), chips: T(['Start a Class 10 Mathematics test', 'How did I perform'], ['कक्षा 10 गणित का टेस्ट शुरू करें', 'मेरा प्रदर्शन']) };
  }
  function hRewards() {
    var A = BP.agent, T = A.T, g = G(), nb = Object.keys(g.badges).length;
    var t = T('You have ' + g.points + ' points, a ' + g.streak + '-day streak and ' + nb + ' of ' + BADGES.length + ' badges. Keep going!', 'आपके ' + g.points + ' पॉइंट, ' + g.streak + ' दिन की स्ट्रीक और ' + BADGES.length + ' में से ' + nb + ' बैज हैं। लगे रहिए!');
    return { text: t, speak: t, card: goCard('rewards', 'Open rewards', 'रिवॉर्ड्स खोलें') };
  }
  if (BP.agent && BP.agent.registerIntent) {
    var RI = BP.agent.registerIntent;
    RI({ id: 'ex-plan', pri: 0.8, handler: hPlan, kw: ['study plan', 'timetable', 'time table', 'daily plan', 'my plan', 'weekly plan', 'study schedule', 'what should i study', 'पढ़ाई की योजना', 'स्टडी प्लान', 'टाइम टेबल', 'समय सारणी'] });
    RI({ id: 'ex-rewards', pri: 0.6, handler: hRewards, kw: ['streak', 'badge', 'badges', 'my points', 'reward points', 'rewards', 'achievements', 'स्ट्रीक', 'बैज', 'पुरस्कार', 'रिवॉर्ड'] });
    RI({ id: 'ex-parent', pri: 0.6, handler: hParent, kw: ['parent dashboard', 'parents dashboard', 'parent app', 'my child', 'child progress', 'my son', 'my daughter', 'attendance', 'बच्चे की प्रगति', 'उपस्थिति', 'अभिभावक', 'पेरेंट'] });
    RI({ id: 'ex-fee', pri: 0.9, handler: hFee, kw: ['fee due', 'fees due', 'due date', 'next installment', 'installment due', 'fee reminder', 'fee reminders', 'pending fee', 'pending fees', 'fee status', 'fees status', 'balance fee', 'फीस बकाया', 'बकाया', 'किस्त कब'] });
  }
})(window.BP);
