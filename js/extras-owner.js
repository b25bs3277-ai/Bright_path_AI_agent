/* ======================================================================
   BrightPath extras-owner.js (Cell 4b) - owner tools:
   * Enquiries panel (leads, callbacks, doubts) with search, status change, Export to CSV
   * White-label settings with live apply: name, logo text, tagline, contact, theme colours,
     fee scale and per-programme / per-course price overrides, owner PIN
   Both screens sit behind a simple owner PIN (demo default 1234). NOTE: this PIN is client-side only,
   fine for a demo, not real security. A real deployment needs server-side login.
   API: BP.extras.csv(rows) download(name, text) applyBrand() unlocked
   ====================================================================== */
(function (BP) {
  'use strict';
  BP.mods.owner = true;
  var $ = BP.$, $$ = BP.$$, E = BP.esc, X = BP.extras;
  if (!X || !X.addStrings) return;
  function lg() { return BP.settings.lang === 'hi' ? 'hi' : 'en'; }
  function tt(k) { return BP.t(k); }

  X.addStrings({
    lk_title: 'Enquiries and leads', lk_pin: 'Enter owner PIN', lk_unlock: 'Unlock', lk_bad: 'Wrong PIN. Please try again.', lk_hint: 'Demo PIN: 1234. You can change it in White-label settings.',
    lk_search: 'Search name, phone, class, question', lk_tab_leads: 'Leads', lk_tab_cb: 'Callbacks', lk_tab_db: 'Doubts', lk_export: 'Export CSV', lk_sample: 'Add sample enquiries',
    lk_empty: 'Nothing here yet.', lk_total: 'Leads', lk_new: 'New', lk_lock: 'Lock', lk_exported: 'CSV downloaded', lk_noexport: 'Nothing to export', lk_tap: 'Tap the status to change it',
    wl_title: 'White-label settings', wl_live: 'Changes apply live. Watch the logo and colours update.', wl_brand: 'Branding', wl_name: 'Institute name', wl_logo: 'Logo text', wl_tag: 'Tagline',
    wl_contact: 'Contact details', wl_phone: 'Phone', wl_email: 'Email', wl_addr: 'Address', wl_hours: 'Working hours', wl_colors: 'Theme colours', wl_base: 'Base', wl_a1: 'Accent 1', wl_a2: 'Accent 2',
    wl_presets: 'Quick themes', wl_fees: 'Fees and prices', wl_scale: 'Fee scale for all programmes and courses', wl_prog: 'Programme fees (override)', wl_course: 'Course prices (override)',
    wl_blank: 'Leave blank to use the default.', wl_pin: 'Owner PIN', wl_pin_new: 'New PIN (4 to 8 digits)', wl_pin_save: 'Change PIN', wl_pin_ok: 'PIN changed', wl_pin_bad: 'PIN must be 4 to 8 digits',
    wl_reset: 'Reset to defaults', wl_reset_q: 'Reset all white-label settings to the defaults?'
  }, {
    lk_title: 'पूछताछ और लीड्स', lk_pin: 'संचालक पिन दर्ज करें', lk_unlock: 'खोलें', lk_bad: 'गलत पिन। कृपया फिर कोशिश करें।', lk_hint: 'डेमो पिन: 1234। इसे व्हाइट-लेबल सेटिंग्स में बदल सकते हैं।',
    lk_search: 'नाम, फोन, कक्षा, सवाल खोजें', lk_tab_leads: 'लीड्स', lk_tab_cb: 'कॉलबैक', lk_tab_db: 'डाउट', lk_export: 'CSV निर्यात', lk_sample: 'नमूना पूछताछ जोड़ें',
    lk_empty: 'यहाँ अभी कुछ नहीं है।', lk_total: 'लीड्स', lk_new: 'नई', lk_lock: 'लॉक करें', lk_exported: 'CSV डाउनलोड हुई', lk_noexport: 'निर्यात के लिए कुछ नहीं', lk_tap: 'स्थिति बदलने के लिए उस पर टैप करें',
    wl_title: 'व्हाइट-लेबल सेटिंग्स', wl_live: 'बदलाव तुरंत लागू होते हैं। लोगो और रंग बदलते देखें।', wl_brand: 'ब्रांडिंग', wl_name: 'संस्था का नाम', wl_logo: 'लोगो टेक्स्ट', wl_tag: 'टैगलाइन',
    wl_contact: 'संपर्क विवरण', wl_phone: 'फोन', wl_email: 'ईमेल', wl_addr: 'पता', wl_hours: 'कार्य समय', wl_colors: 'थीम के रंग', wl_base: 'आधार', wl_a1: 'एक्सेंट 1', wl_a2: 'एक्सेंट 2',
    wl_presets: 'तैयार थीम', wl_fees: 'फीस और कीमतें', wl_scale: 'सभी कार्यक्रमों और कोर्स के लिए फीस स्केल', wl_prog: 'कार्यक्रम की फीस (बदलें)', wl_course: 'कोर्स की कीमत (बदलें)',
    wl_blank: 'डिफ़ॉल्ट के लिए खाली छोड़ें।', wl_pin: 'संचालक पिन', wl_pin_new: 'नया पिन (4 से 8 अंक)', wl_pin_save: 'पिन बदलें', wl_pin_ok: 'पिन बदल गया', wl_pin_bad: 'पिन 4 से 8 अंकों का होना चाहिए',
    wl_reset: 'डिफ़ॉल्ट पर लौटें', wl_reset_q: 'सभी व्हाइट-लेबल सेटिंग्स डिफ़ॉल्ट पर लौटाएँ?'
  });

  /* ---------------- styles ---------------- */
  var CSS = '.ow-tabs{display:flex;gap:8px;margin:2px 0 10px}.ow-tabs button{flex:1;padding:10px 4px;border-radius:14px;font-weight:600;font-size:13px;color:var(--mut);background:rgba(255,255,255,.07);border:1px solid var(--gb);transition:.2s}' +
    '.ow-tabs button.on{color:#fff;background:linear-gradient(135deg,rgba(255,122,26,.38),rgba(20,211,196,.2));border-color:rgba(255,255,255,.3)}' +
    '.ow-err{color:#ff7a7f;font-size:13px;margin:6px 2px}.ow-l{display:block;font-size:12px;color:var(--mut);margin:10px 2px 3px;text-transform:uppercase;letter-spacing:.5px}' +
    '.ow-bar{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.ow-bar .ex-in{flex:1;min-width:160px;margin:0}' +
    '.ow-ld{padding:12px 0;border-top:1px solid rgba(255,255,255,.08)}.ow-ld:first-child{border-top:0}.ow-ld b{font-size:14.5px}.ow-ld small{display:block;color:var(--mut);font-size:12.5px;margin-top:2px}' +
    '.ow-ld .r{display:flex;justify-content:space-between;align-items:center;gap:8px}.ow-ld a{color:var(--teal);font-weight:600;text-decoration:none}' +
    '.ow-st{font-size:11.5px;font-weight:700;padding:4px 11px;border-radius:99px;background:rgba(20,211,196,.18);color:var(--teal);white-space:nowrap}.ow-st.s0{background:rgba(255,176,32,.2);color:#ffb020}.ow-st.s3{background:rgba(20,211,196,.28)}.ow-st.s4{background:rgba(255,90,95,.2);color:#ff7a7f}' +
    '.ow-cols{display:flex;gap:10px;flex-wrap:wrap}.ow-col{flex:1;min-width:90px;text-align:center;font-size:12px;color:var(--mut)}.ow-col input{display:block;width:100%;height:44px;border:1px solid var(--gb);border-radius:12px;background:none;padding:2px;margin-top:4px;cursor:pointer}' +
    '.ow-pre{display:flex;gap:8px;flex-wrap:wrap}.ow-pre button{padding:9px 14px;border-radius:999px;font-size:13px;font-weight:600;border:1px solid var(--gb);background:rgba(255,255,255,.08);display:flex;align-items:center;gap:6px}' +
    '.ow-pre i{width:14px;height:14px;border-radius:50%;display:inline-block;font-style:normal}' +
    '.ow-fee{display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px}.ow-fee span{flex:1;min-width:0}.ow-fee .ex-in{width:130px;margin:0;padding:8px 10px}' +
    'details.ow-d{margin-top:10px}details.ow-d summary{cursor:pointer;font-weight:600;padding:8px 0;color:var(--teal)}' +
    '.ow-rg{width:100%;accent-color:var(--orange)}';
  if (!document.getElementById('ow-css')) { var stl = document.createElement('style'); stl.id = 'ow-css'; stl.textContent = CSS; document.head.appendChild(stl); }

  function hd(key, lock) { return '<div class="ex-hd"><button class="ib" data-go="profile" aria-label="' + E(tt('ex_back')) + '">\u2039</button><h2 class="ph">' + tt(key) + '</h2>' + (lock ? '<div class="sp"></div><button class="btn ghost sm" data-a="lock">' + tt('lk_lock') + '</button>' : '') + '</div>'; }
  function fdt(ts) { return new Date(ts).toLocaleDateString(lg() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

  /* ---------------- PIN gate ---------------- */
  X.unlocked = false;
  function pin() { return BP.store.get('ownerpin', '1234'); }
  function gate(box, key, fn) {
    if (X.unlocked) { fn(); return; }
    box.innerHTML = hd(key) + '<div class="card" style="max-width:420px"><b>' + tt('lk_pin') + '</b><form id="ow-pf"><input class="ex-in" id="ow-pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="PIN"><div class="ow-err" id="ow-pe"></div>' +
      '<button class="btn" type="submit" style="width:100%">' + tt('lk_unlock') + '</button></form><p class="mut" style="font-size:12.5px;margin:10px 0 0">' + tt('lk_hint') + '</p></div>';
    $('#ow-pf', box).addEventListener('submit', function (e) {
      e.preventDefault();
      if ($('#ow-pin', box).value === pin()) { X.unlocked = true; fn(); }
      else { $('#ow-pe', box).textContent = tt('lk_bad'); $('#ow-pin', box).value = ''; }
    });
  }

  /* ---------------- CSV ---------------- */
  X.csv = function (rows) {
    return '\ufeff' + rows.map(function (r) {
      return r.map(function (c) {
        var s = String(c == null ? '' : c);
        if (/^[=+@\t\r]|^-./.test(s)) s = "'" + s;
        return '"' + s.replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\r\n');
  };
  X.download = function (name, text) {
    var b = new Blob([text], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  };

  /* ---------------- enquiries panel ---------------- */
  var LS = ['New', 'Contacted', 'Visited', 'Enrolled', 'Lost'], CS = ['Pending', 'Called', 'Closed'], DS = ['Pending', 'Answered'];
  var S = { tab: 'leads', q: '' };
  function store(tab) { return { leads: 'leads', cb: 'callbacks', db: 'doubts' }[tab]; }
  function flow(tab) { return tab === 'leads' ? LS : tab === 'cb' ? CS : DS; }
  function rows(tab) { return BP.store.get(store(tab), []); }
  function hay(x) { return [x.name, x.phone, x.prog, x.batch, x.type, x.status, x.question, x.q, x.source].join(' ').toLowerCase(); }
  function filtered() { var q = S.q.trim().toLowerCase(); return rows(S.tab).filter(function (x) { return !q || hay(x).indexOf(q) > -1; }); }
  function itemHTML(x) {
    var fl = flow(S.tab), si = Math.max(0, fl.indexOf(x.status)), st = '<button class="ow-st s' + si + '" data-a="st" data-id="' + E(x.id) + '">' + E(x.status || fl[0]) + '</button>';
    if (S.tab === 'leads') return '<div class="ow-ld"><div class="r"><b>' + E(x.name) + '</b>' + st + '</div><small>' + E(x.prog) + (x.batch && x.batch !== '-' ? ' \u00B7 ' + E(x.batch) : '') + '</small><small><a href="tel:' + E(x.phone) + '">' + E(x.phone) + '</a> \u00B7 ' + E(x.type) + ' \u00B7 ' + fdt(x.ts) + '</small></div>';
    return '<div class="ow-ld"><div class="r"><b>' + E(S.tab === 'cb' ? x.question : x.q) + '</b>' + st + '</div><small>' + fdt(x.ts) + ' \u00B7 ' + E((x.lang || '').toUpperCase()) + '</small></div>';
  }
  function list(box) {
    var el = $('#lk-list', box); if (!el) return;
    var a = filtered(); el.innerHTML = a.length ? a.map(itemHTML).join('') + '<p class="mut" style="font-size:12px;margin:8px 0 0">' + tt('lk_tap') + '</p>' : '<p class="mut" style="margin:6px 0">' + tt('lk_empty') + '</p>';
  }
  function renderLeads(box) {
    var L = rows('leads'), nNew = L.filter(function (x) { return x.status === 'New'; }).length;
    box.innerHTML = hd('lk_title', true) +
      '<div class="card"><div class="stats"><div><b>' + L.length + '</b><span>' + tt('lk_total') + '</span></div><div><b>' + nNew + '</b><span>' + tt('lk_new') + '</span></div><div><b>' + rows('cb').length + '</b><span>' + tt('lk_tab_cb') + '</span></div><div><b>' + rows('db').length + '</b><span>' + tt('lk_tab_db') + '</span></div></div></div>' +
      '<div class="ow-tabs">' + [['leads', 'lk_tab_leads'], ['cb', 'lk_tab_cb'], ['db', 'lk_tab_db']].map(function (t) { return '<button class="' + (S.tab === t[0] ? 'on' : '') + '" data-a="tab" data-v="' + t[0] + '">' + tt(t[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="card"><div class="ow-bar"><input class="ex-in" id="lk-q" value="' + E(S.q) + '" placeholder="' + E(tt('lk_search')) + '" autocomplete="off"><button class="btn sm" data-a="export">' + tt('lk_export') + '</button></div>' +
      (S.tab === 'leads' ? '<button class="btn ghost sm" data-a="sample">' + tt('lk_sample') + '</button>' : '') + '<div id="lk-list" style="margin-top:8px"></div></div>';
    list(box);
  }
  function sample() {
    var names = ['Rohan Mehta', 'Priya Nair', 'Aditya Rao', 'Sneha Kapoor', 'Karan Malhotra', 'Ananya Das', 'Vihaan Joshi', 'Ishita Bansal'], progs = BP.agent.K.programs, bt = ['morning', 'evening', 'weekend'], a = BP.store.get('leads', []), i, now = Date.now();
    for (i = 0; i < names.length; i++) {
      var p = progs[(i * 5 + 3) % progs.length];
      a.push({ id: 'S' + now.toString(36) + i, ts: now - (i * 7 + 1) * 3600e3 * 5, type: i % 3 === 0 ? 'demo' : 'enquiry', name: names[i], prog: p.name.en, progId: p.id, phone: '9' + String(800000000 + (i * 7654321) % 199999999).slice(0, 9), batch: bt[i % 3], status: LS[i % 3], source: 'sample' });
    }
    a.sort(function (x, y) { return y.ts - x.ts; }); BP.store.set('leads', a);
  }
  function exportCsv() {
    var a = filtered(), r;
    if (!a.length) { BP.toast(tt('lk_noexport'), 1800); return; }
    if (S.tab === 'leads') r = [['Date', 'Name', 'Phone', 'Class / Programme', 'Batch', 'Type', 'Status', 'Source', 'ID']].concat(a.map(function (x) { return [new Date(x.ts).toISOString().slice(0, 16).replace('T', ' '), x.name, x.phone, x.prog, x.batch, x.type, x.status, x.source, x.id]; }));
    else r = [['Date', 'Question', 'Language', 'Status', 'ID']].concat(a.map(function (x) { return [new Date(x.ts).toISOString().slice(0, 16).replace('T', ' '), S.tab === 'cb' ? x.question : x.q, x.lang, x.status, x.id]; }));
    X.download('brightpath-' + S.tab + '-' + new Date().toISOString().slice(0, 10) + '.csv', X.csv(r)); BP.toast(tt('lk_exported'), 1800);
  }
  BP.registerView('leads', function (box) {
    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-a]'); if (!t) return; var a = t.getAttribute('data-a');
      if (a === 'tab') { S.tab = t.getAttribute('data-v'); S.q = ''; renderLeads(box); }
      else if (a === 'export') exportCsv();
      else if (a === 'sample') { sample(); renderLeads(box); }
      else if (a === 'lock') { X.unlocked = false; BP.go('profile'); }
      else if (a === 'st') {
        var k = store(S.tab), arr = BP.store.get(k, []), fl = flow(S.tab), id = t.getAttribute('data-id');
        arr.forEach(function (x) { if (x.id === id) x.status = fl[(Math.max(0, fl.indexOf(x.status)) + 1) % fl.length]; });
        BP.store.set(k, arr); renderLeads(box);
      }
    });
    box.addEventListener('input', function (e) { if (e.target.id === 'lk-q') { S.q = e.target.value; list(box); } });
    gate(box, 'lk_title', function () { renderLeads(box); });
  });

  /* ---------------- white-label: live brand apply ---------------- */
  function rgb(h) { h = String(h || '#000000').replace('#', ''); if (h.length === 3) h = h.replace(/(.)/g, '$1$1'); var n = parseInt(h, 16) || 0; return (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255); }
  X.applyBrand = function () {
    var s = BP.settings, t = s.theme || BP.defaults.theme, nm = s.logoText || 'B';
    $$('.logo b').forEach(function (e) { e.textContent = s.logoText || ''; });
    $$('.logo small').forEach(function (e) { e.textContent = s.tagline || ''; });
    $$('.logo .mark').forEach(function (e) { e.textContent = nm.charAt(0).toUpperCase(); });
    $$('.side-foot p').forEach(function (e) { e.textContent = s.instName || ''; });
    $$('.welcome h2').forEach(function (e) { e.textContent = s.instName || ''; });
    if (s.instName) document.title = s.instName;
    var st = document.getElementById('wl-css');
    if (!st) { st = document.createElement('style'); st.id = 'wl-css'; document.head.appendChild(st); }
    st.textContent = '#bg .ov{background:radial-gradient(900px 520px at 88% -8%,rgba(' + rgb(t.orange) + ',.26),transparent 60%),radial-gradient(800px 520px at -8% 112%,rgba(' + rgb(t.teal) + ',.22),transparent 60%),linear-gradient(180deg,rgba(' + rgb(t.navy) + ',.88),rgba(' + rgb(t.navy) + ',.80) 50%,rgba(' + rgb(t.navy) + ',.95))}';
  };
  BP.on('settings', X.applyBrand); BP.on('ready', X.applyBrand);

  var PRESETS = [['Classic', '#0a1330', '#ff7a1a', '#14d3c4'], ['Royal', '#150b33', '#f5b400', '#9b7bff'], ['Forest', '#08241c', '#ff6b4a', '#3ddc97'], ['Ocean', '#06203a', '#ff8a3d', '#2ec5ff'], ['Crimson', '#1d0a14', '#ff4d6d', '#ffb703']];
  function defFee(p) { return Math.round(p.fee * (BP.settings.feeScale || 1)); }
  function defCourse(c) { return Math.round(c.price * (BP.settings.feeScale || 1)); }
  function fld(k, lab) { return '<label class="ow-l">' + lab + '</label><input class="ex-in" data-k="' + k + '" value="' + E(BP.settings[k] || '') + '" autocomplete="off">'; }
  function renderAdmin(box) {
    var s = BP.settings, t = s.theme || BP.defaults.theme, A = BP.agent, cl = BP.courses && BP.courses.list ? BP.courses.list : [];
    var h = hd('wl_title', true) + '<p class="mut" style="font-size:13px;margin:0 2px 10px">' + tt('wl_live') + '</p>' +
      '<div class="card"><b>' + tt('wl_brand') + '</b>' + fld('instName', tt('wl_name')) + fld('logoText', tt('wl_logo')) + fld('tagline', tt('wl_tag')) + '</div>' +
      '<div class="card"><b>' + tt('wl_contact') + '</b>' + fld('phone', tt('wl_phone')) + fld('email', tt('wl_email')) + fld('address', tt('wl_addr')) + fld('hours', tt('wl_hours')) + '</div>' +
      '<div class="card"><b>' + tt('wl_colors') + '</b><div class="ow-cols" style="margin-top:8px">' +
      [['navy', 'wl_base'], ['orange', 'wl_a1'], ['teal', 'wl_a2']].map(function (c) { return '<label class="ow-col">' + tt(c[1]) + '<input type="color" data-th="' + c[0] + '" value="' + E(t[c[0]]) + '"></label>'; }).join('') + '</div>' +
      '<label class="ow-l">' + tt('wl_presets') + '</label><div class="ow-pre">' + PRESETS.map(function (p, i) { return '<button data-a="pre" data-v="' + i + '"><i style="background:' + p[2] + '"></i><i style="background:' + p[3] + '"></i>' + p[0] + '</button>'; }).join('') + '</div></div>' +
      '<div class="card"><b>' + tt('wl_fees') + '</b><label class="ow-l">' + tt('wl_scale') + ': <b id="wl-sv" style="color:var(--orange)">' + Math.round((s.feeScale || 1) * 100) + '%</b></label><input class="ow-rg" type="range" min="50" max="200" step="5" data-scale="1" value="' + Math.round((s.feeScale || 1) * 100) + '">' +
      '<details class="ow-d"><summary>' + tt('wl_prog') + '</summary><p class="mut" style="font-size:12px;margin:0 0 6px">' + tt('wl_blank') + '</p>' +
      A.K.programs.map(function (p) { var v = s.fees && s.fees[p.id]; return '<div class="ow-fee"><span>' + E(A.pick(p.name, lg())) + '</span><input class="ex-in" type="number" min="0" inputmode="numeric" data-fee="' + p.id + '" value="' + (v != null && v !== '' ? E(v) : '') + '" placeholder="' + defFee(p) + '"></div>'; }).join('') + '</details>' +
      (cl.length ? '<details class="ow-d"><summary>' + tt('wl_course') + '</summary><p class="mut" style="font-size:12px;margin:0 0 6px">' + tt('wl_blank') + '</p>' + cl.map(function (c) { var v = s.coursePrices && s.coursePrices[c.id]; return '<div class="ow-fee"><span>' + E(c.t[lg()] || c.t.en) + '</span><input class="ex-in" type="number" min="0" inputmode="numeric" data-cp="' + c.id + '" value="' + (v != null && v !== '' ? E(v) : '') + '" placeholder="' + defCourse(c) + '"></div>'; }).join('') + '</details>' : '') + '</div>' +
      '<div class="card"><b>' + tt('wl_pin') + '</b><label class="ow-l">' + tt('wl_pin_new') + '</label><input class="ex-in" id="wl-np" type="password" inputmode="numeric" maxlength="8" autocomplete="off"><button class="btn sm" data-a="pin">' + tt('wl_pin_save') + '</button></div>' +
      '<button class="btn ghost" data-a="reset">' + tt('wl_reset') + '</button>';
    box.innerHTML = h;
  }
  function refreshPh(box) {
    var A = BP.agent;
    $$('[data-fee]', box).forEach(function (i) { var p = A.prog(i.getAttribute('data-fee')); if (p) i.placeholder = defFee(p); });
    $$('[data-cp]', box).forEach(function (i) { var c = BP.courses && BP.courses.get(i.getAttribute('data-cp')); if (c) i.placeholder = defCourse(c); });
  }
  BP.registerView('admin', function (box) {
    box.addEventListener('input', function (e) {
      var t = e.target, s = BP.settings, k;
      if (t.hasAttribute('data-k')) { s[t.getAttribute('data-k')] = t.value; BP.saveSettings(); }
      else if (t.hasAttribute('data-th')) { var th = Object.assign({}, s.theme || BP.defaults.theme); th[t.getAttribute('data-th')] = t.value; s.theme = th; BP.saveSettings(); }
      else if (t.hasAttribute('data-scale')) { s.feeScale = (+t.value) / 100; var sv = $('#wl-sv', box); if (sv) sv.textContent = t.value + '%'; BP.saveSettings(); refreshPh(box); }
      else if (t.hasAttribute('data-fee')) { var f = Object.assign({}, s.fees); k = t.getAttribute('data-fee'); if (t.value === '') delete f[k]; else f[k] = Math.max(0, +t.value); s.fees = f; BP.saveSettings(); }
      else if (t.hasAttribute('data-cp')) { var c = Object.assign({}, s.coursePrices); k = t.getAttribute('data-cp'); if (t.value === '') delete c[k]; else c[k] = Math.max(0, +t.value); s.coursePrices = c; BP.saveSettings(); }
    });
    box.addEventListener('click', function (e) {
      var t = e.target.closest('[data-a]'); if (!t) return; var a = t.getAttribute('data-a');
      if (a === 'lock') { X.unlocked = false; BP.go('profile'); }
      else if (a === 'pre') { var p = PRESETS[+t.getAttribute('data-v')]; BP.settings.theme = { navy: p[1], orange: p[2], teal: p[3] }; BP.saveSettings(); renderAdmin(box); }
      else if (a === 'pin') {
        var v = ($('#wl-np', box) || { value: '' }).value;
        if (!/^\d{4,8}$/.test(v)) { BP.toast(tt('wl_pin_bad'), 2200); return; }
        BP.store.set('ownerpin', v); $('#wl-np', box).value = ''; BP.toast(tt('wl_pin_ok'), 1800);
      }
      else if (a === 'reset') {
        if (!confirm(tt('wl_reset_q'))) return;
        BP.settings = Object.assign({}, BP.defaults, { lang: BP.settings.lang, voiceOn: BP.settings.voiceOn, fees: {}, coursePrices: {}, feeScale: 1, theme: Object.assign({}, BP.defaults.theme) });
        BP.saveSettings(); renderAdmin(box);
      }
    });
    gate(box, 'wl_title', function () { renderAdmin(box); });
  });
})(window.BP);
