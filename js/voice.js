/* ======================================================================
   BrightPath voice.js — browser-native Web Speech API only.
   SpeechRecognition (input) + SpeechSynthesis (output). Language comes from
   the language pack (BP.packs[code].speech), so new languages work automatically.
   API: BP.voice.listen() stop() toggle() speak(text, lang) cancelSpeak() clean()
   ====================================================================== */
(function (BP) {
  'use strict';
  BP.mods.voice = true;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var V = BP.voice = { stt: !!SR, tts: 'speechSynthesis' in window, state: 'idle', rec: null };

  V.setState = function (s) {
    V.state = s; document.body.setAttribute('data-voice', s);
    var l = BP.$('#micLabel'); if (l) l.textContent = BP.t(s === 'listening' ? 'listening' : s === 'speaking' ? 'speaking' : 'tap_talk');
    BP.emit('voice:state', s);
  };
  function caption(t) { var c = BP.$('#caption'); if (c) c.textContent = t || ''; }

  /* ---- voices ---- */
  V.pickVoice = function (lang) {
    if (!V.tts) return null;
    var code = (BP.packs[lang] || BP.packs.en).speech, pre = code.split('-')[0];
    var vs = speechSynthesis.getVoices() || [], i;
    for (i = 0; i < vs.length; i++) if (vs[i].lang.replace('_', '-') === code) return vs[i];
    for (i = 0; i < vs.length; i++) if (vs[i].lang.toLowerCase().indexOf(pre) === 0) return vs[i];
    return null;
  };
  if (V.tts) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = function () {}; } catch (e) {} }

  /* ---- make text speech-friendly ---- */
  V.clean = function (t, lang) {
    var hi = lang === 'hi';
    return String(t).replace(/<[^>]+>/g, ' ')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
      .replace(/\u20B9\s*([\d,]+)/g, function (m, n) { return n.replace(/,/g, '') + (hi ? ' \u0930\u0941\u092A\u092F\u0947' : ' rupees'); })
      .replace(/%/g, hi ? ' \u092A\u094D\u0930\u0924\u093F\u0936\u0924' : ' percent')
      .replace(/\s[\u2013\u2014-]\s/g, hi ? ' \u0938\u0947 ' : ' to ')
      .replace(/[*\u2022|]/g, ', ').replace(/\n+/g, '. ').replace(/\s+/g, ' ').trim();
  };

  /* ---- speaking ---- */
  V.cancelSpeak = function () { if (V.tts) { try { speechSynthesis.cancel(); } catch (e) {} } if (V.state === 'speaking') V.setState('idle'); };
  V.speak = function (text, lang) {
    if (!V.tts || !BP.settings.voiceOn || !text) return;
    lang = lang || BP.settings.lang;
    try {
      speechSynthesis.cancel();
      setTimeout(function () {
        var u = new SpeechSynthesisUtterance(V.clean(text, lang));
        u.lang = (BP.packs[lang] || BP.packs.en).speech;
        var v = V.pickVoice(lang); if (v) u.voice = v;
        u.rate = 1; u.pitch = 1;
        u.onstart = function () { V.setState('speaking'); };
        u.onend = u.onerror = function () { if (V.state === 'speaking') V.setState('idle'); };
        speechSynthesis.speak(u);
      }, 60);
    } catch (e) { console.warn(e); }
  };

  /* ---- listening ---- */
  V.listen = function () {
    if (!SR) { BP.toast(BP.t('unsupported_stt')); BP.focusInput(); return; }
    V.cancelSpeak();
    var r;
    try { r = new SR(); } catch (e) { BP.toast(BP.t('unsupported_stt')); return; }
    r.lang = (BP.packs[BP.settings.lang] || BP.packs.en).speech;
    r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
    var got = '';
    r.onstart = function () { V.setState('listening'); caption(''); };
    r.onresult = function (e) {
      var interim = '', fin = '';
      for (var i = e.resultIndex; i < e.results.length; i++) { var tr = e.results[i][0].transcript; if (e.results[i].isFinal) fin += tr; else interim += tr; }
      if (fin) got = fin; caption(fin || interim);
    };
    r.onerror = function (e) {
      var er = e.error;
      if (er === 'not-allowed' || er === 'service-not-allowed') BP.toast(BP.t('mic_denied'), 4500);
      else if (er === 'no-speech') BP.toast(BP.t('no_speech'));
      else if (er !== 'aborted') BP.toast('Voice error: ' + er);
    };
    r.onend = function () {
      V.rec = null; if (V.state === 'listening') V.setState('idle'); caption('');
      if (got) BP.agent.handle(got, { src: 'voice' });
    };
    V.rec = r;
    try { r.start(); } catch (e) { V.rec = null; V.setState('idle'); }
  };
  V.stop = function () { if (V.rec) { try { V.rec.stop(); } catch (e) {} } };
  V.toggle = function () {
    if (V.state === 'listening') V.stop();
    else if (V.state === 'speaking') V.cancelSpeak();
    else V.listen();
  };
})(window.BP);
