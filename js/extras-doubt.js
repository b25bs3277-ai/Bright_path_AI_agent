/* ======================================================================
   BrightPath extras-doubt.js (Cell 4b) - doubt solver.
   Add a topic with T(id, subject, [keywords], titleEn, titleHi, [stepsEn], [stepsHi]) below.
   Unknown doubts are never invented: the student is offered to send them to a teacher (saved in bp_doubts).
   API: BP.extras.doubtMatch(text) saveDoubt(text) doubtTopics
   ====================================================================== */
(function (BP) {
  'use strict';
  BP.mods.doubt = true;
  var $ = BP.$, E = BP.esc, X = BP.extras;
  if (!X || !X.addStrings) return;
  function lg() { return BP.settings.lang === 'hi' ? 'hi' : 'en'; }
  function tt(k) { return BP.t(k); }

  X.addStrings({
    db_title: 'Doubt solver', db_ph: 'Type your doubt, e.g. explain Pythagoras theorem', db_topics: 'Try asking about', db_read: 'Read aloud',
    db_none: 'I do not have a step-by-step answer for this yet. Shall I send it to a teacher?', db_send: 'Send to a teacher', db_sent: 'Doubt sent to a teacher. You will get a reply soon.',
    db_my: 'My doubts', db_empty: 'No doubts sent yet.', db_open: 'Open doubt solver', db_mic: 'Speak your doubt', db_ask_more: 'Tell me your doubt, for example: explain Pythagoras theorem.', db_steps: 'Step by step'
  }, {
    db_title: 'डाउट सॉल्वर', db_ph: 'अपना डाउट लिखें, जैसे पाइथागोरस प्रमेय समझाओ', db_topics: 'ये पूछकर देखें', db_read: 'ज़ोर से पढ़ें',
    db_none: 'इसका स्टेप-बाय-स्टेप उत्तर अभी मेरे पास नहीं है। क्या मैं इसे शिक्षक को भेज दूँ?', db_send: 'शिक्षक को भेजें', db_sent: 'डाउट शिक्षक को भेज दिया गया। जल्द जवाब मिलेगा।',
    db_my: 'मेरे डाउट', db_empty: 'अभी कोई डाउट नहीं भेजा।', db_open: 'डाउट सॉल्वर खोलें', db_mic: 'बोलकर डाउट पूछें', db_ask_more: 'अपना डाउट बताइए, जैसे: पाइथागोरस प्रमेय समझाओ।', db_steps: 'स्टेप-बाय-स्टेप'
  });

  /* ---------------- topics ---------------- */
  var D = X.doubtTopics = [];
  function T(id, sub, kw, te, th, se, sh) { D.push({ id: id, sub: sub, kw: kw, t: { en: te, hi: th }, s: { en: se, hi: sh } }); }

  T('pyth', 'Mathematics', ['pythagoras', 'pythagoras theorem', 'hypotenuse', 'right triangle', 'right angled triangle', 'पाइथागोरस', 'पाइथागोरस प्रमेय'],
    'Pythagoras theorem', 'पाइथागोरस प्रमेय',
    ["In a right-angled triangle, the longest side, opposite the right angle, is the hypotenuse.", "The theorem says: hypotenuse² = base² + perpendicular².", "Example: sides 3 and 4. Square them: 9 + 16 = 25.", "Take the square root: hypotenuse = 5."],
    ["समकोण त्रिभुज में समकोण के सामने की सबसे लंबी भुजा कर्ण कहलाती है।", "प्रमेय: कर्ण² = आधार² + लंब²।", "उदाहरण: भुजाएँ 3 और 4। वर्ग करें: 9 + 16 = 25।", "वर्गमूल लें: कर्ण = 5।"]);
  T('quad', 'Mathematics', ['quadratic', 'quadratic equation', 'quadratic equations', 'quadratic formula', 'discriminant', 'द्विघात', 'द्विघात समीकरण'],
    'Solving a quadratic equation', 'द्विघात समीकरण हल करना',
    ["Write the equation as ax² + bx + c = 0 and note a, b and c.", "Find the discriminant: D = b² − 4ac.", "Use the formula: x = (−b ± √D) / 2a.", "Example: x² − 5x + 6 = 0 gives D = 25 − 24 = 1, so x = (5 ± 1) / 2 = 3 or 2."],
    ["समीकरण को ax² + bx + c = 0 के रूप में लिखें और a, b, c पहचानें।", "विविक्तकर निकालें: D = b² − 4ac।", "सूत्र लगाएँ: x = (−b ± √D) / 2a।", "उदाहरण: x² − 5x + 6 = 0 में D = 25 − 24 = 1, इसलिए x = (5 ± 1) / 2 = 3 या 2।"]);
  T('photo', 'Biology', ['photosynthesis', 'chlorophyll', 'प्रकाश संश्लेषण'],
    'Photosynthesis', 'प्रकाश संश्लेषण',
    ["Leaves absorb sunlight with the green pigment chlorophyll.", "Roots supply water and the stomata take in carbon dioxide.", "Light energy converts them into glucose and oxygen.", "Equation: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂, in sunlight and chlorophyll."],
    ["पत्तियाँ हरे वर्णक क्लोरोफिल से सूर्य का प्रकाश सोखती हैं।", "जड़ें पानी देती हैं और रंध्र कार्बन डाइऑक्साइड लेते हैं।", "प्रकाश ऊर्जा इन्हें ग्लूकोज़ और ऑक्सीजन में बदल देती है।", "समीकरण: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂, सूर्य के प्रकाश और क्लोरोफिल में।"]);
  T('newton', 'Physics', ['newton', 'newton laws', 'laws of motion', 'inertia', 'न्यूटन', 'गति के नियम'],
    "Newton's laws of motion", 'न्यूटन के गति नियम',
    ["First law: a body stays at rest or in uniform motion unless a force acts on it. This is inertia.", "Second law: F = m × a. Force equals mass times acceleration.", "Third law: every action has an equal and opposite reaction.", "Example: a 5 kg body accelerating at 2 m/s² needs F = 5 × 2 = 10 N."],
    ["पहला नियम: कोई वस्तु तब तक विराम या एकसमान गति में रहती है जब तक उस पर बल न लगे। यही जड़त्व है।", "दूसरा नियम: F = m × a। बल बराबर द्रव्यमान गुणा त्वरण।", "तीसरा नियम: हर क्रिया की बराबर और विपरीत प्रतिक्रिया होती है।", "उदाहरण: 5 kg की वस्तु को 2 m/s² त्वरण देने के लिए F = 5 × 2 = 10 N बल चाहिए।"]);
  T('ohm', 'Physics', ['ohm', 'ohm law', 'ohms law', 'resistance', 'ओम', 'ओम का नियम'],
    "Ohm's law", 'ओम का नियम',
    ["Ohm's law: V = I × R.", "V is voltage in volts, I is current in amperes and R is resistance in ohms.", "Rearrange as needed: I = V / R and R = V / I.", "Example: 12 V across 4 Ω gives I = 12 / 4 = 3 A."],
    ["ओम का नियम: V = I × R।", "V वोल्टेज (वोल्ट), I धारा (एम्पियर) और R प्रतिरोध (ओम) है।", "ज़रूरत के अनुसार बदलें: I = V / R और R = V / I।", "उदाहरण: 4 Ω पर 12 V लगाने से I = 12 / 4 = 3 A।"]);
  T('interest', 'Mathematics', ['simple interest', 'compound interest', 'ब्याज', 'साधारण ब्याज', 'चक्रवृद्धि ब्याज'],
    'Simple and compound interest', 'साधारण और चक्रवृद्धि ब्याज',
    ["Simple interest: SI = P × R × T / 100.", "Compound interest: Amount = P × (1 + R/100)^T, then CI = Amount − P.", "Example: ₹10,000 at 10% for 2 years. SI = ₹2,000.", "Amount = 10,000 × 1.21 = ₹12,100, so CI = ₹2,100."],
    ["साधारण ब्याज: SI = P × R × T / 100।", "चक्रवृद्धि ब्याज: मिश्रधन = P × (1 + R/100)^T, फिर CI = मिश्रधन − P।", "उदाहरण: ₹10,000, 10% पर 2 वर्ष। SI = ₹2,000।", "मिश्रधन = 10,000 × 1.21 = ₹12,100, इसलिए CI = ₹2,100।"]);
  T('mole', 'Chemistry', ['mole concept', 'moles', 'mole', 'molar mass', 'मोल'],
    'Mole concept', 'मोल अवधारणा',
    ["One mole of any substance contains 6.022 × 10²³ particles.", "Number of moles = given mass / molar mass.", "Example: 36 g of water, molar mass 18 g/mol.", "Moles = 36 / 18 = 2."],
    ["किसी भी पदार्थ के एक मोल में 6.022 × 10²³ कण होते हैं।", "मोल की संख्या = दिया गया द्रव्यमान / मोलर द्रव्यमान।", "उदाहरण: 36 g पानी, मोलर द्रव्यमान 18 g/mol।", "मोल = 36 / 18 = 2।"]);
  T('balance', 'Chemistry', ['balance chemical equation', 'balancing equations', 'balance the equation', 'balancing chemical equations', 'रासायनिक समीकरण संतुलित'],
    'Balancing a chemical equation', 'रासायनिक समीकरण संतुलित करना',
    ["Write the unbalanced equation and count the atoms of each element on both sides.", "Change only the coefficients in front of formulas, never the small subscripts.", "Balance one element at a time and leave hydrogen and oxygen for last.", "Recount. Example: H₂ + O₂ → H₂O becomes 2H₂ + O₂ → 2H₂O."],
    ["असंतुलित समीकरण लिखें और दोनों ओर हर तत्व के परमाणु गिनें।", "केवल सूत्रों के आगे के गुणांक बदलें, छोटे सबस्क्रिप्ट कभी नहीं।", "एक-एक तत्व संतुलित करें और हाइड्रोजन व ऑक्सीजन को अंत में रखें।", "फिर गिनें। उदाहरण: H₂ + O₂ → H₂O बनता है 2H₂ + O₂ → 2H₂O।"]);
  T('trig', 'Mathematics', ['trigonometry', 'trigonometric ratios', 'sin cos tan', 'sine', 'cosine', 'tangent', 'त्रिकोणमिति'],
    'Trigonometric ratios', 'त्रिकोणमितीय अनुपात',
    ["In a right triangle, pick an angle θ and name the opposite side, the adjacent side and the hypotenuse.", "sin θ = opposite / hypotenuse, cos θ = adjacent / hypotenuse, tan θ = opposite / adjacent.", "Memory trick: SOH CAH TOA.", "Standard values: sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2."],
    ["समकोण त्रिभुज में कोण θ चुनें और सम्मुख भुजा, आसन्न भुजा और कर्ण पहचानें।", "sin θ = सम्मुख / कर्ण, cos θ = आसन्न / कर्ण, tan θ = सम्मुख / आसन्न।", "याद रखने की ट्रिक: SOH CAH TOA।", "मानक मान: sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2।"]);
  T('ap', 'Mathematics', ['arithmetic progression', 'ap formula', 'nth term', 'common difference', 'समांतर श्रेणी'],
    'Arithmetic progression', 'समांतर श्रेणी',
    ["In an AP, the difference between consecutive terms is a constant d.", "nth term: aₙ = a + (n − 1)d.", "Sum of n terms: Sₙ = n/2 × [2a + (n − 1)d].", "Example: 2, 5, 8 has d = 3, so the 10th term is 2 + 9 × 3 = 29."],
    ["AP में लगातार पदों का अंतर एक स्थिर संख्या d होता है।", "nवाँ पद: aₙ = a + (n − 1)d।", "n पदों का योग: Sₙ = n/2 × [2a + (n − 1)d]।", "उदाहरण: 2, 5, 8 में d = 3, इसलिए 10वाँ पद 2 + 9 × 3 = 29।"]);
  T('rights', 'Social Science', ['fundamental rights', 'मौलिक अधिकार'],
    'Fundamental Rights', 'मौलिक अधिकार',
    ["Fundamental Rights are in Part III of the Constitution, Articles 12 to 35.", "The six rights: Equality, Freedom, Against Exploitation, Freedom of Religion, Cultural and Educational Rights, and Constitutional Remedies.", "Under Article 32 you can approach the Supreme Court if a right is violated.", "The rights are subject to reasonable restrictions."],
    ["मौलिक अधिकार संविधान के भाग III में अनुच्छेद 12 से 35 तक हैं।", "छह अधिकार: समता, स्वतंत्रता, शोषण के विरुद्ध, धर्म की स्वतंत्रता, सांस्कृतिक और शैक्षिक अधिकार, और संवैधानिक उपचार।", "अधिकार का हनन होने पर अनुच्छेद 32 के तहत सर्वोच्च न्यायालय जा सकते हैं।", "ये अधिकार उचित प्रतिबंधों के अधीन हैं।"]);
  T('golden', 'Accountancy', ['golden rules of accounting', 'golden rules', 'journal entry', 'debit and credit', 'डेबिट क्रेडिट', 'लेखांकन के सुनहरे नियम'],
    'Golden rules of accounting', 'लेखांकन के सुनहरे नियम',
    ["Personal account: debit the receiver, credit the giver.", "Real account: debit what comes in, credit what goes out.", "Nominal account: debit expenses and losses, credit incomes and gains.", "Example: furniture bought for cash. Debit Furniture, credit Cash."],
    ["व्यक्तिगत खाता: पाने वाले को डेबिट, देने वाले को क्रेडिट।", "वास्तविक खाता: जो आए उसे डेबिट, जो जाए उसे क्रेडिट।", "नाममात्र खाता: खर्च और हानि को डेबिट, आय और लाभ को क्रेडिट।", "उदाहरण: नकद में फर्नीचर खरीदा। फर्नीचर डेबिट, नकद क्रेडिट।"]);
  T('demand', 'Economics', ['law of demand', 'demand curve', 'मांग का नियम', 'माँग का नियम'],
    'Law of demand', 'माँग का नियम',
    ["When the price of a good rises, the quantity demanded falls, other things remaining equal.", "Reasons: income effect, substitution effect and diminishing marginal utility.", "So the demand curve slopes downward from left to right.", "Exceptions include Giffen goods and prestige goods."],
    ["अन्य बातें समान रहने पर वस्तु का दाम बढ़ने से माँगी गई मात्रा घटती है।", "कारण: आय प्रभाव, प्रतिस्थापन प्रभाव और ह्रासमान सीमांत उपयोगिता।", "इसलिए माँग वक्र बाएँ से दाएँ नीचे की ओर झुका होता है।", "अपवाद: गिफ़िन वस्तुएँ और प्रतिष्ठा वाली वस्तुएँ।"]);
  T('sdt', 'Mathematics', ['speed distance time', 'speed formula', 'average speed', 'चाल दूरी समय'],
    'Speed, distance and time', 'चाल, दूरी और समय',
    ["Speed = distance / time.", "Distance = speed × time, and time = distance / speed.", "Keep units consistent. To change km/h to m/s, multiply by 5/18.", "Example: 150 km at 60 km/h takes 150 / 60 = 2.5 hours."],
    ["चाल = दूरी / समय।", "दूरी = चाल × समय और समय = दूरी / चाल।", "इकाइयाँ एक जैसी रखें। km/h को m/s में बदलने के लिए 5/18 से गुणा करें।", "उदाहरण: 60 km/h की चाल से 150 km में 150 / 60 = 2.5 घंटे लगते हैं।"]);
  T('hcf', 'Mathematics', ['hcf', 'lcm', 'hcf and lcm', 'highest common factor', 'least common multiple', 'लघुत्तम', 'महत्तम'],
    'HCF and LCM', 'HCF और LCM',
    ["Prime factorise each number.", "HCF is the product of the common primes with the smallest powers. LCM is the product of all primes with the greatest powers.", "Example: 12 = 2² × 3 and 18 = 2 × 3². HCF = 2 × 3 = 6 and LCM = 2² × 3² = 36.", "Check: HCF × LCM = product of the two numbers, 6 × 36 = 12 × 18."],
    ["हर संख्या के अभाज्य गुणनखंड करें।", "HCF साझा अभाज्यों की सबसे छोटी घातों का गुणनफल है। LCM सभी अभाज्यों की सबसे बड़ी घातों का गुणनफल है।", "उदाहरण: 12 = 2² × 3 और 18 = 2 × 3²। HCF = 2 × 3 = 6 और LCM = 2² × 3² = 36।", "जाँच: HCF × LCM = दोनों संख्याओं का गुणनफल, 6 × 36 = 12 × 18।"]);
  T('prob', 'Mathematics', ['probability', 'संभावना', 'प्रायिकता'],
    'Probability', 'प्रायिकता',
    ["Probability of an event = favourable outcomes / total outcomes.", "It always lies between 0 and 1, and P(not A) = 1 − P(A).", "Example: a prime number on a die. Favourable outcomes are 2, 3 and 5.", "So the probability is 3 / 6 = 1/2."],
    ["घटना की प्रायिकता = अनुकूल परिणाम / कुल परिणाम।", "यह हमेशा 0 और 1 के बीच होती है, और P(A नहीं) = 1 − P(A)।", "उदाहरण: पासे पर अभाज्य संख्या। अनुकूल परिणाम 2, 3 और 5 हैं।", "इसलिए प्रायिकता 3 / 6 = 1/2।"]);
  T('energy', 'Physics', ['kinetic energy', 'potential energy', 'work energy', 'गतिज ऊर्जा', 'स्थितिज ऊर्जा'],
    'Kinetic and potential energy', 'गतिज और स्थितिज ऊर्जा',
    ["Kinetic energy: KE = ½ × m × v².", "Potential energy: PE = m × g × h.", "Work done: W = F × d, and work equals the change in kinetic energy.", "Example: 2 kg moving at 5 m/s has KE = ½ × 2 × 25 = 25 J."],
    ["गतिज ऊर्जा: KE = ½ × m × v²।", "स्थितिज ऊर्जा: PE = m × g × h।", "किया गया कार्य: W = F × d, और कार्य गतिज ऊर्जा में बदलाव के बराबर होता है।", "उदाहरण: 5 m/s से चलती 2 kg की वस्तु की KE = ½ × 2 × 25 = 25 J।"]);
  T('voice', 'English', ['active voice', 'passive voice', 'active and passive', 'कर्मवाच्य'],
    'Active and passive voice', 'कर्तृवाच्य और कर्मवाच्य',
    ["In active voice the subject does the action: Ravi eats a cake.", "To make it passive, move the object to the front: A cake ...", "Add the right form of be and the past participle: A cake is eaten ...", "Finish with by and the old subject: A cake is eaten by Ravi."],
    ["कर्तृवाच्य में कर्ता काम करता है: रवि केक खाता है।", "कर्मवाच्य बनाने के लिए कर्म को आगे रखें: केक ...", "क्रिया का कर्मवाच्य रूप लगाएँ: केक खाया जाता है ...", "अंत में कर्ता जोड़ें: केक रवि द्वारा खाया जाता है।"]);

  /* ---------------- matching ---------------- */
  X.doubtMatch = function (raw) {
    var U = BP.agent.util, n = U.norm(raw), toks = n.trim().split(' '), best = null, bs = 0;
    D.forEach(function (d) {
      var sc = 0;
      d.kw.forEach(function (k) {
        var kk = U.norm(k).trim(); if (!kk) return;
        if (kk.indexOf(' ') > -1) { if (n.indexOf(' ' + kk + ' ') > -1) sc += 3; }
        else if (toks.indexOf(kk) > -1) sc += 2;
        else if (kk.length >= 6 && /^[a-z]+$/.test(kk) && toks.some(function (t) { return t.length > kk.length && t.indexOf(kk) === 0; })) sc += 1.5;
      });
      if (sc > bs) { bs = sc; best = d; }
    });
    return bs >= 2 ? best : null;
  };
  function spk(s, l) {
    var hi = l === 'hi';
    return String(s).replace(/²/g, hi ? ' का वर्ग ' : ' squared ').replace(/³/g, hi ? ' का घन ' : ' cubed ').replace(/√/g, hi ? ' वर्गमूल ' : ' square root of ')
      .replace(/×/g, hi ? ' गुणा ' : ' times ').replace(/÷/g, hi ? ' भाग ' : ' divided by ').replace(/=/g, hi ? ' बराबर ' : ' equals ').replace(/→/g, hi ? ' से बनता है ' : ' gives ')
      .replace(/θ/g, hi ? ' थीटा ' : ' theta ').replace(/°/g, hi ? ' डिग्री' : ' degrees').replace(/Ω/g, ' ohm').replace(/±/g, ' plus or minus ').replace(/−/g, ' minus ')
      .replace(/[₀-₉]/g, '').replace(/\^/g, ' power ').replace(/\s+/g, ' ');
  }
  function topicSpeech(d, l, all) {
    var st = d.s[l] || d.s.en, ti = d.t[l] || d.t.en, pre = l === 'hi' ? 'स्टेप ' : 'Step ';
    var lines = (all ? st : st.slice(0, 2)).map(function (x, i) { return pre + (i + 1) + '. ' + x; });
    return spk(ti + '. ' + lines.join(' '), l);
  }
  function stepsCard(d, l) {
    return '<div class="card cd"><div class="c-h"><b>' + E(d.t[l] || d.t.en) + '</b><span class="pill">' + E(BP.tests && BP.tests.subName ? BP.tests.subName(d.sub) : d.sub) + '</span></div><ol class="steps">' +
      (d.s[l] || d.s.en).map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ol><div class="c-b" style="margin-top:8px"><button class="btn sm ghost" data-dread="' + d.id + '" data-l="' + l + '">' + tt('db_read') + '</button></div></div>';
  }
  function sendCard(q) {
    return '<div class="card cd"><div class="c-b"><button class="btn sm" data-dsend="1" data-dq="' + E(q) + '">' + tt('db_send') + '</button></div></div>';
  }

  /* ---------------- saving doubts ---------------- */
  X.saveDoubt = function (q) {
    var a = BP.store.get('doubts', []);
    a.unshift({ id: 'D' + Date.now().toString(36), ts: Date.now(), q: String(q).slice(0, 400), lang: /[\u0900-\u097F]/.test(q) ? 'hi' : lg(), status: 'Pending' });
    BP.store.set('doubts', a.slice(0, 200)); BP.emit('doubt:saved', a[0]); BP.toast(tt('db_sent'), 2600);
    if (X.doubtRefresh) X.doubtRefresh();
    return a[0];
  };
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-dsend]');
    if (t) { X.saveDoubt(t.getAttribute('data-dq')); t.disabled = true; t.textContent = tt('db_sent').split('.')[0] + ' \u2713'; return; }
    t = e.target.closest('[data-dread]');
    if (t) {
      var d = D.filter(function (x) { return x.id === t.getAttribute('data-dread'); })[0]; if (!d) return;
      X.speakNow(topicSpeech(d, t.getAttribute('data-l') || lg(), true));
    }
  });
  BP.registerCard('doubt-steps', function (c) { var d = D.filter(function (x) { return x.id === c.id; })[0]; return d ? stepsCard(d, c.l || lg()) : ''; });
  BP.registerCard('doubt-send', function (c) { return sendCard(c.q); });

  /* ---------------- doubt solver screen ---------------- */
  var CSS = '.db-hist .ex-row b{font-size:13.5px}.db-q{cursor:pointer}.tbox button.on{animation:float 1s infinite;background:linear-gradient(135deg,#ff9a3c,var(--orange))}.db-topics{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}';
  if (!document.getElementById('db-css')) { var stl = document.createElement('style'); stl.id = 'db-css'; stl.textContent = CSS; document.head.appendChild(stl); }

  BP.registerView('doubt', function (box) {
    box.innerHTML = '<div class="ex-hd"><button class="ib" data-go="profile" aria-label="' + E(tt('ex_back')) + '">\u2039</button><h2 class="ph">' + tt('db_title') + '</h2></div>' +
      '<div class="card"><form class="tbox" id="db-f" style="max-width:none"><input id="db-q" autocomplete="off" placeholder="' + E(tt('db_ph')) + '"><button type="button" id="db-mic" aria-label="' + E(tt('db_mic')) + '">' + BP.icons.mic + '</button><button type="submit" aria-label="Send">' + BP.icons.send + '</button></form>' +
      '<div class="mut" style="font-size:12.5px;margin-top:12px">' + tt('db_topics') + '</div><div class="db-topics">' +
      D.slice(0, 8).map(function (d) { return '<button class="chip" data-dq2="' + E(d.t[lg()] || d.t.en) + '">' + E(d.t[lg()] || d.t.en) + '</button>'; }).join('') + '</div></div>' +
      '<div id="db-res"></div><div class="card db-hist"><b>' + tt('db_my') + '</b><div id="db-hist"></div></div>';
    var inp = $('#db-q', box), res = $('#db-res', box);
    function hist() {
      var a = BP.store.get('doubts', []).slice(0, 8), h = $('#db-hist', box); if (!h) return;
      h.innerHTML = a.length ? a.map(function (x) { return '<div class="ex-row"><div><b>' + E(x.q) + '</b><small>' + new Date(x.ts).toLocaleDateString(lg() === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' }) + '</small></div><span class="pill">' + E(x.status) + '</span></div>'; }).join('') : '<p class="mut" style="font-size:13px;margin:8px 0 0">' + tt('db_empty') + '</p>';
    }
    X.doubtRefresh = hist;
    function ask(q) {
      q = String(q || '').trim(); if (!q) return;
      var d = X.doubtMatch(q), l = /[\u0900-\u097F]/.test(q) ? 'hi' : lg();
      if (d) { res.innerHTML = stepsCard(d, l); if (BP.settings.voiceOn && BP.voice) BP.voice.speak(topicSpeech(d, l, false), l); }
      else res.innerHTML = '<div class="card"><p style="margin:0 0 10px">' + tt('db_none') + '</p><div class="c-b"><button class="btn sm" data-dsend="1" data-dq="' + E(q) + '">' + tt('db_send') + '</button></div></div>';
      res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    $('#db-f', box).addEventListener('submit', function (e) { e.preventDefault(); ask(inp.value); });
    $('#db-mic', box).addEventListener('click', function () {
      var m = $('#db-mic', box);
      X.listenOnce(function (t) { inp.value = t; ask(t); }, function (on) { m.classList.toggle('on', on); });
    });
    box.addEventListener('click', function (e) { var t = e.target.closest('[data-dq2]'); if (t) { inp.value = t.getAttribute('data-dq2'); ask(inp.value); } });
    hist();
  });

  /* ---------------- chat / voice intent ---------------- */
  function hDoubt(m) {
    var A = BP.agent, Tt = A.T, d = X.doubtMatch(m.text), l = /[\u0900-\u097F]/.test(m.text) ? 'hi' : A.lang;
    var goCard = { type: 'go', view: 'doubt', label: Tt('Open doubt solver', 'डाउट सॉल्वर खोलें') };
    if (d) {
      var st = d.s[l] || d.s.en, ti = d.t[l] || d.t.en;
      var tx = Tt(ti + ': ' + st[0] + ' ' + st[1] + ' The remaining steps are on screen.', ti + ': ' + st[0] + ' ' + st[1] + ' बाकी स्टेप स्क्रीन पर हैं।');
      return { text: tx, speak: topicSpeech(d, l, false), card: { type: 'doubt-steps', id: d.id, l: l }, chips: Tt(['Explain Ohm law', 'Explain quadratic equation', 'Start a Class 10 Mathematics test'], ['ओम का नियम समझाओ', 'द्विघात समीकरण समझाओ', 'कक्षा 10 गणित का टेस्ट शुरू करें']) };
    }
    var n = BP.agent.util.norm(m.text).trim().split(' ').filter(function (w) { return w.length > 1; });
    if (n.length <= 4) {
      var p = tt('db_ask_more');
      return { text: p, speak: p, card: goCard, chips: Tt(['Explain Pythagoras theorem', 'Explain photosynthesis', 'Explain Newton laws'], ['पाइथागोरस प्रमेय समझाओ', 'प्रकाश संश्लेषण समझाओ', 'न्यूटन के नियम समझाओ']) };
    }
    var t2 = tt('db_none');
    return { text: t2, speak: t2, card: { type: 'doubt-send', q: m.text } };
  }
  if (BP.agent && BP.agent.registerIntent) {
    var kw = ['doubt', 'doubts', 'i have a doubt', 'solve this', 'samjhao', 'डाउट', 'संदेह', 'समझाओ', 'समझाइए', 'explain', 'how to solve'], seen = {};
    D.forEach(function (d) { d.kw.forEach(function (k) { if (!seen[k]) { seen[k] = 1; kw.push(k); } }); });
    BP.agent.registerIntent({ id: 'ex-doubt', pri: 0.4, handler: hDoubt, kw: kw });
  }
})(window.BP);
