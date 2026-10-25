/* ======================================================================
   BrightPath data-syllabus.js (Cell 3a)
   Structured syllabus: BP.syl.data[examId][subject] = [chapter strings]
   examId: c1..c12, jee, neet, upsc, ca-f, ca-i, ca-fin  (same ids as the test engine)
   Subject names match the question-bank subject names so "start a test" links work.
   To expand: just add chapters to the arrays below (or push into BP.syl.data from another file).
   API: BP.syl.get(exam) subjects(exam) chapters(exam,sub) detectSub(exam,n)
        testable(exam,sub,ch) hasBank(exam,sub) startTest(exam,sub,ch) open(exam,sub)
   ====================================================================== */
(function (BP) {
  'use strict';
  BP.mods.syllabus = true;
  var E = BP.esc, SYL = BP.syl = BP.syl || {}, D = SYL.data = {};
  function P(p, a) { return a.map(function (x) { return p + ': ' + x; }); }
  function cat() { return Array.prototype.concat.apply([], arguments); }
  SYL.note = 'Chapter lists follow NCERT (rationalised editions for classes 6-12). UPSC and CA are overview structures. Verify against the latest official edition before real use.';

  /* ---------------- CLASSES 1 to 5 ---------------- */
  D.c1 = {
    Mathematics: ["Shapes and Space","Numbers from One to Nine","Addition","Subtraction","Numbers from Ten to Twenty","Time","Measurement","Numbers from Twenty-one to Fifty","Data Handling","Patterns","Numbers","Money","How Many"],
    English: ["A Happy Child","Three Little Pigs","After a Bath","The Bubble, the Straw and the Shoe","One Little Kitten","Lalu and Peelu","Once I Saw a Little Bird","Mittu and the Yellow Mango"],
    Hindi: ["झूला","आम की कहानी","आम की टोकरी","पत्ते ही पत्ते","पकौड़ी","छुक-छुक गाड़ी","रसोईघर","चूहा और बिल्ली"],
    EVS: ["Family and Friends","Food","Shelter","Water","Travel and Transport","Plants and Animals","Things We Make and Do"]
  };
  D.c2 = {
    Mathematics: ["What is Long? What is Round?","Counting in Groups","How Much Can You Carry?","Counting in Tens","Patterns","Footprints","Jugs and Mugs","Tens and Ones","My Funday","Add Our Points","Lines and Lines","Give and Take","The Longest Step","Birds Come, Birds Go","How Many Ponds?"],
    English: ["First Day at School","Haldi's Adventure","I am Lucky!","I Want","A Smile","The Wind and the Sun","Rain","Storm in the Garden","Zoo Manners","Funny Bunny","Mr. Nobody","Curlylocks and the Three Bears"],
    Hindi: ["ऊँट चला","भालू ने खेली फुटबॉल","म्याऊँ, म्याऊँ!!","अधिक बलवान कौन?","दोस्त की मदद","बहुत हुआ","मेरी किताब","तितली और कली","बुलबुल","मीठी सारंगी"],
    EVS: ["Family and Friends","Food","Shelter","Water","Travel and Transport","Plants and Animals","Things We Make and Do"]
  };
  D.c3 = {
    Mathematics: ["Where to Look From","Fun with Numbers","Give and Take","Long and Short","Shapes and Designs","Fun with Give and Take","Time Goes On","Who is Heavier?","How Many Times?","Play with Patterns","Jugs and Mugs","Can We Share?","Smart Charts","Rupees and Paise"],
    English: ["Good Morning","The Magic Garden","Bird Talk","Nina and the Baby Sparrows","Little by Little","The Enormous Turnip","Sea Song","A Little Fish Story","The Balloon Man","The Yellow Butterfly","Trains","The Story of the Road"],
    Hindi: ["कक्कू","शेखीबाज़ मक्खी","चाँद वाली अम्मा","मन करता है","बहादुर बित्तो","हमसे सब कहते","टिपटिपवा","बंदर बाँट","अक्ल बड़ी या भैंस"],
    EVS: ["Poonam's Day Out","The Plant Fairy","Water O Water!","Our First School","Chhotu's House","Foods We Eat","Saying without Speaking","Flying High","It's Raining","What is Cooking"]
  };
  D.c4 = {
    Mathematics: ["Building with Bricks","Long and Short","A Trip to Bhopal","Tick-Tick-Tick","The Way the World Looks","The Junk Seller","Jugs and Mugs","Carts and Wheels","Halves and Quarters","Play with Patterns","Tables and Shares","How Heavy? How Light?","Fields and Fences","Smart Charts"],
    English: ["Wake Up!","Neha's Alarm Clock","Noses","The Little Fir Tree","Run!","Nasruddin's Aim","Why?","Alice in Wonderland","Don't be Afraid of the Dark","Helen Keller","The Donkey","The Milkman's Cow","Hiawatha","The Scholar's Mother Tongue","The Giving Tree","Books","The Naughty Boy"],
    Hindi: ["मन के भोले-भाले बादल","जैसा सवाल वैसा जवाब","किरमिच की गेंद","पापा जब बच्चे थे","दोस्त की पोशाक","नाव बनाओ नाव बनाओ","दान का हिसाब","कौन?","स्वतंत्रता की ओर","थप्प रोटी थप्प दाल","पढ़क्कू की सूझ","सुनीता की पहिया कुर्सी","हुदहुद","मुफ़्त ही मुफ़्त"],
    EVS: ["Going to School","Ear to Ear","A Day with Nandu","The Story of Amrita","Anita and the Honeybees","Omana's Journey","From the Window","Reaching Grandmother's House","Changing Families","The Valley of Flowers","Changing Times","A River's Tale","Basva's Farm","From Market to Home","A Busy Month","Nandita in Mumbai","Too Much Water, Too Little Water","Abdul in the Garden","Eating Together","Food and Fun","The World in My Home","Pochampalli","Home and Abroad","Spicy Riddles","Defence Officer: Wahida","Chuskit Goes to School"]
  };
  D.c5 = {
    Mathematics: ["The Fish Tale","Shapes and Angles","How Many Squares?","Parts and Wholes","Does it Look the Same?","Be My Multiple, I'll be Your Factor","Can You See the Pattern?","Mapping Your Way","Boxes and Sketches","Tenths and Hundredths","Area and its Boundary","Smart Charts","Ways to Multiply and Divide","How Big? How Heavy?"],
    English: ["Ice-cream Man","Wonderful Waste!","Teamwork","Flying Together","My Shadow","Robinson Crusoe Discovers a Footprint","Crying","My Elder Brother","The Lazy Frog","Rip Van Winkle","Class Discussion","The Talkative Barber","Topsy-turvy Land","Gulliver's Travels","Nobody's Friend","The Little Bully","Sing a Song of People","Around the World","Malu Bhalu","Who Will be Ningthou?"],
    Hindi: ["राख की रस्सी","फ़सलों का त्योहार","खिलौनेवाला","नन्हा फ़नकार","जहाँ चाह वहाँ राह","चिट्ठी का सफ़र","डाकिए की कहानी, कँवरसिंह की ज़ुबानी","वे दिन भी क्या दिन थे","एक माँ की बेबसी","एक दिन की बादशाहत","चावल की रोटियाँ","गुरु और चेला","स्वामी की दादी","बाघ आया उस रात","बिशन की दिलेरी","पानी रे पानी","छोटी-सी हमारी नदी"],
    EVS: ["Super Senses","A Snake Charmer's Story","From Tasting to Digesting","Mangoes Round the Year","Seeds and Seeds","Every Drop Counts","Experiments with Water","A Treat for Mosquitoes","Up You Go!","Walls Tell Stories","Sunita in Space","What if it Finishes?","A Shelter so High!","When the Earth Shook!","Blow Hot, Blow Cold","Who will do this Work?","Across the Wall","No Place for Us?","A Seed Tells a Farmer's Tale","Whose Forests?","Like Father, Like Daughter","On the Move Again"]
  };

  /* ---------------- CLASSES 6 to 10 ---------------- */
  var ENG_G = ["Grammar and Writing Skills"], HIN_G = ["व्याकरण और रचनात्मक लेखन"];
  D.c6 = {
    Mathematics: ["Knowing Our Numbers","Whole Numbers","Playing with Numbers","Basic Geometrical Ideas","Understanding Elementary Shapes","Integers","Fractions","Decimals","Data Handling","Mensuration","Algebra","Ratio and Proportion","Symmetry","Practical Geometry"],
    Science: ["Food: Where Does It Come From?","Components of Food","Fibre to Fabric","Sorting Materials into Groups","Separation of Substances","Changes Around Us","Getting to Know Plants","Body Movements","The Living Organisms and Their Surroundings","Motion and Measurement of Distances","Light, Shadows and Reflections","Electricity and Circuits","Fun with Magnets","Water","Air Around Us","Garbage In, Garbage Out"],
    "Social Science": cat(
      P("History", ["What, Where, How and When?","From Hunting-Gathering to Growing Food","In the Earliest Cities","What Books and Burials Tell Us","Kingdoms, Kings and an Early Republic","New Questions and Ideas","Ashoka, the Emperor Who Gave Up War","Vital Villages, Thriving Towns","Traders, Kings and Pilgrims","New Empires and Kingdoms","Buildings, Paintings and Books"]),
      P("Geography", ["The Earth in the Solar System","Globe: Latitudes and Longitudes","Motions of the Earth","Maps","Major Domains of the Earth","Major Landforms of the Earth","Our Country: India","India: Climate, Vegetation and Wildlife"]),
      P("Civics", ["Understanding Diversity","Diversity and Discrimination","What is Government?","Key Elements of a Democratic Government","Panchayati Raj","Rural Administration","Urban Administration","Rural Livelihoods","Urban Livelihoods"])),
    English: cat(["Who Did Patrick's Homework?","How the Dog Found Himself a New Master!","Taro's Reward","An Indian-American Woman in Space: Kalpana Chawla","A Different Kind of School","Who I Am","Fair Play","A Game of Chance","Desert Animals","The Banyan Tree"], ENG_G),
    Hindi: cat(["वह चिड़िया जो","बचपन","नादान दोस्त","चाँद से थोड़ी-सी गप्पें","अक्षरों का महत्व","पार नज़र के","साथी हाथ बढ़ाना","ऐसे-ऐसे","टिकट अलबम","झाँसी की रानी","जो देखकर भी नहीं देखते","संसार पुस्तक है","मैं सबसे छोटी होऊँ","लोकगीत","नौकर","वन के मार्ग में","साँस साँस में बाँस"], HIN_G)
  };
  D.c7 = {
    Mathematics: ["Integers","Fractions and Decimals","Data Handling","Simple Equations","Lines and Angles","The Triangle and its Properties","Congruence of Triangles","Comparing Quantities","Rational Numbers","Practical Geometry","Perimeter and Area","Algebraic Expressions","Exponents and Powers","Symmetry","Visualising Solid Shapes"],
    Science: ["Nutrition in Plants","Nutrition in Animals","Fibre to Fabric","Heat","Acids, Bases and Salts","Physical and Chemical Changes","Weather, Climate and Adaptations of Animals to Climate","Winds, Storms and Cyclones","Soil","Respiration in Organisms","Transportation in Animals and Plants","Reproduction in Plants","Motion and Time","Electric Current and its Effects","Light","Water: A Precious Resource","Forests: Our Lifeline","Wastewater Story"],
    "Social Science": cat(
      P("History", ["Tracing Changes Through a Thousand Years","New Kings and Kingdoms","The Delhi Sultans","The Mughal Empire","Rulers and Buildings","Towns, Traders and Craftspersons","Tribes, Nomads and Settled Communities","Devotional Paths to the Divine","The Making of Regional Cultures","Eighteenth-Century Political Formations"]),
      P("Geography", ["Environment","Inside Our Earth","Our Changing Earth","Air","Water","Natural Vegetation and Wildlife","Human Environment: Settlement, Transport and Communication","Human Environment Interactions: The Tropical and the Subtropical Region","Life in the Deserts"]),
      P("Civics", ["On Equality","Role of the Government in Health","How the State Government Works","Growing up as Boys and Girls","Women Change the World","Understanding Media","Understanding Advertising","Markets Around Us","A Shirt in the Market","Struggles for Equality"])),
    English: cat(["Three Questions","A Gift of Chappals","Gopal and the Hilsa-Fish","The Ashes That Made Trees Bloom","Quality","Expert Detectives","The Invention of Vita-Wonk","Fire: Friend and Foe","A Bicycle in Good Repair","The Story of Cricket"], ENG_G),
    Hindi: cat(["हम पंछी उन्मुक्त गगन के","दादी माँ","हिमालय की बेटियाँ","कठपुतली","मिठाईवाला","रक्त और हमारा शरीर","पापा खो गए","शाम एक किसान","चिड़िया की बच्ची","अपूर्व अनुभव","रहीम के दोहे","कंचा","एक तिनका","खानपान की बदलती तसवीर","नीलकंठ","भोर और बरखा","वीर कुँवर सिंह","संघर्ष के कारण मैं तुनकमिज़ाज हो गया: धनराज","आश्रम का अनुमानित व्यय","विप्लव गायन"], HIN_G)
  };
  D.c8 = {
    Mathematics: ["Rational Numbers","Linear Equations in One Variable","Understanding Quadrilaterals","Practical Geometry","Data Handling","Squares and Square Roots","Cubes and Cube Roots","Comparing Quantities","Algebraic Expressions and Identities","Visualising Solid Shapes","Mensuration","Exponents and Powers","Direct and Inverse Proportions","Factorisation","Introduction to Graphs","Playing with Numbers"],
    Science: ["Crop Production and Management","Microorganisms: Friend and Foe","Synthetic Fibres and Plastics","Materials: Metals and Non-Metals","Coal and Petroleum","Combustion and Flame","Conservation of Plants and Animals","Cell: Structure and Functions","Reproduction in Animals","Reaching the Age of Adolescence","Force and Pressure","Friction","Sound","Chemical Effects of Electric Current","Some Natural Phenomena","Light","Stars and the Solar System","Pollution of Air and Water"],
    "Social Science": cat(
      P("History", ["How, When and Where","From Trade to Territory","Ruling the Countryside","Tribals, Dikus and the Vision of a Golden Age","When People Rebel: 1857 and After","Weavers, Iron Smelters and Factory Owners","Civilising the Native, Educating the Nation","Women, Caste and Reform","The Making of the National Movement","India After Independence"]),
      P("Geography", ["Resources","Land, Soil, Water, Natural Vegetation and Wildlife Resources","Mineral and Power Resources","Agriculture","Industries","Human Resources"]),
      P("Civics", ["The Indian Constitution","Understanding Secularism","Why Do We Need a Parliament?","Understanding Laws","Understanding Our Judiciary","Understanding Our Criminal Justice System","Understanding Marginalisation","Confronting Marginalisation","Public Facilities","Law and Social Justice"])),
    English: cat(["The Best Christmas Present in the World","The Tsunami","Glimpses of the Past","Bepin Choudhury's Lapse of Memory","The Summit Within","This is Jody's Fawn","A Visit to Cambridge","A Short Monsoon Diary","The Great Stone Face"], ENG_G),
    Hindi: cat(["ध्वनि","लाख की चूड़ियाँ","बस की यात्रा","दीवानों की हस्ती","चिट्ठियों की अनूठी दुनिया","भगवान के डाकिये","क्या निराश हुआ जाए","यह सबसे कठिन समय नहीं","कबीर की साखियाँ","कामचोर","जब सिनेमा ने बोलना सीखा","सुदामा चरित","जहाँ पहिया है","अकबरी लोटा","सूरदास के पद","पानी की कहानी","बाज और साँप"], HIN_G)
  };
  D.c9 = {
    Mathematics: ["Number Systems","Polynomials","Coordinate Geometry","Linear Equations in Two Variables","Introduction to Euclid's Geometry","Lines and Angles","Triangles","Quadrilaterals","Circles","Heron's Formula","Surface Areas and Volumes","Statistics"],
    Science: ["Matter in Our Surroundings","Is Matter Around Us Pure?","Atoms and Molecules","Structure of the Atom","The Fundamental Unit of Life","Tissues","Motion","Force and Laws of Motion","Gravitation","Work and Energy","Sound","Improvement in Food Resources"],
    "Social Science": cat(
      P("History", ["The French Revolution","Socialism in Europe and the Russian Revolution","Nazism and the Rise of Hitler","Forest Society and Colonialism","Pastoralists in the Modern World"]),
      P("Geography", ["India: Size and Location","Physical Features of India","Drainage","Climate","Natural Vegetation and Wildlife","Population"]),
      P("Political Science", ["What is Democracy? Why Democracy?","Constitutional Design","Electoral Politics","Working of Institutions","Democratic Rights"]),
      P("Economics", ["The Story of Village Palampur","People as Resource","Poverty as a Challenge","Food Security in India"])),
    English: cat(["The Fun They Had","The Sound of Music","The Little Girl","A Truly Beautiful Mind","The Snake and the Mirror","My Childhood","Packing","Reach for the Top","The Bond of Love","Kathmandu","If I Were You"], ENG_G),
    Hindi: cat(["दो बैलों की कथा","ल्हासा की ओर","उपभोक्तावाद की संस्कृति","साँवले सपनों की याद","नाना साहब की पुत्री देवी मैना को भस्म कर दिया गया","प्रेमचंद के फटे जूते","मेरे बचपन के दिन","एक कुत्ता और एक मैना","साखियाँ और सबद","वाख","सवैये","कैदी और कोकिला","ग्राम श्री","चंद्र गहना से लौटती बेर","मेघ आए","यमराज की दिशा","बच्चे काम पर जा रहे हैं"], HIN_G)
  };
  D.c10 = {
    Mathematics: ["Real Numbers","Polynomials","Pair of Linear Equations in Two Variables","Quadratic Equations","Arithmetic Progressions","Triangles","Coordinate Geometry","Introduction to Trigonometry","Some Applications of Trigonometry","Circles","Areas Related to Circles","Surface Areas and Volumes","Statistics","Probability"],
    Science: ["Chemical Reactions and Equations","Acids, Bases and Salts","Metals and Non-metals","Carbon and its Compounds","Life Processes","Control and Coordination","How do Organisms Reproduce?","Heredity","Light: Reflection and Refraction","The Human Eye and the Colourful World","Electricity","Magnetic Effects of Electric Current","Our Environment"],
    "Social Science": cat(
      P("History", ["The Rise of Nationalism in Europe","Nationalism in India","The Making of a Global World","The Age of Industrialisation","Print Culture and the Modern World"]),
      P("Geography", ["Resources and Development","Forest and Wildlife Resources","Water Resources","Agriculture","Minerals and Energy Resources","Manufacturing Industries","Lifelines of National Economy"]),
      P("Political Science", ["Power Sharing","Federalism","Gender, Religion and Caste","Political Parties","Outcomes of Democracy"]),
      P("Economics", ["Development","Sectors of the Indian Economy","Money and Credit","Globalisation and the Indian Economy","Consumer Rights"])),
    English: cat(["A Letter to God","Nelson Mandela: Long Walk to Freedom","Two Stories about Flying","From the Diary of Anne Frank","Glimpses of India","Mijbil the Otter","Madam Rides the Bus","The Sermon at Benares","The Proposal"], ENG_G),
    Hindi: cat(["पद (सूरदास)","राम-लक्ष्मण-परशुराम संवाद","सवैया और कवित्त","आत्मकथ्य","उत्साह और अट नहीं रही है","यह दंतुरित मुसकान और फसल","छाया मत छूना","कन्यादान","संगतकार","नेताजी का चश्मा","बालगोबिन भगत","लखनवी अंदाज़","मानवीय करुणा की दिव्य चमक","एक कहानी यह भी","स्त्री शिक्षा के विरोधी कुतर्कों का खंडन","नौबतखाने में इबादत","संस्कृति"], HIN_G)
  };

  /* ---------------- CLASSES 11 and 12 ---------------- */
  D.c11 = {
    Physics: ["Units and Measurements","Motion in a Straight Line","Motion in a Plane","Laws of Motion","Work, Energy and Power","System of Particles and Rotational Motion","Gravitation","Mechanical Properties of Solids","Mechanical Properties of Fluids","Thermal Properties of Matter","Thermodynamics","Kinetic Theory","Oscillations","Waves"],
    Chemistry: ["Some Basic Concepts of Chemistry","Structure of Atom","Classification of Elements and Periodicity in Properties","Chemical Bonding and Molecular Structure","Thermodynamics","Equilibrium","Redox Reactions","Organic Chemistry: Some Basic Principles and Techniques","Hydrocarbons"],
    Mathematics: ["Sets","Relations and Functions","Trigonometric Functions","Complex Numbers and Quadratic Equations","Linear Inequalities","Permutations and Combinations","Binomial Theorem","Sequences and Series","Straight Lines","Conic Sections","Introduction to Three Dimensional Geometry","Limits and Derivatives","Statistics","Probability"],
    Biology: ["The Living World","Biological Classification","Plant Kingdom","Animal Kingdom","Morphology of Flowering Plants","Anatomy of Flowering Plants","Structural Organisation in Animals","Cell: The Unit of Life","Biomolecules","Cell Cycle and Cell Division","Photosynthesis in Higher Plants","Respiration in Plants","Plant Growth and Development","Breathing and Exchange of Gases","Body Fluids and Circulation","Excretory Products and their Elimination","Locomotion and Movement","Neural Control and Coordination","Chemical Coordination and Integration"],
    Accountancy: ["Introduction to Accounting","Theory Base of Accounting","Recording of Transactions I","Recording of Transactions II","Bank Reconciliation Statement","Trial Balance and Rectification of Errors","Depreciation, Provisions and Reserves","Bills of Exchange","Financial Statements I","Financial Statements II"],
    "Business Studies": ["Business, Trade and Commerce","Forms of Business Organisation","Private, Public and Global Enterprises","Business Services","Emerging Modes of Business","Social Responsibilities of Business and Business Ethics","Formation of a Company","Sources of Business Finance","Small Business","Internal Trade","International Business"],
    Economics: cat(
      P("Statistics", ["Introduction","Collection of Data","Organisation of Data","Presentation of Data","Measures of Central Tendency","Measures of Dispersion","Correlation","Index Numbers"]),
      P("Indian Economic Development", ["Indian Economy on the Eve of Independence","Indian Economy 1950-1990","Liberalisation, Privatisation and Globalisation","Poverty","Human Capital Formation in India","Rural Development","Employment","Infrastructure","Environment and Sustainable Development","Comparative Development Experiences of India and its Neighbours"])),
    English: cat(["The Portrait of a Lady","We're Not Afraid to Die... if We Can All Be Together","Discovering Tut: the Saga Continues","Landscape of the Soul","The Ailing Planet: the Green Movement's Role","The Browning Version","The Adventure","Silk Road","The Summer of the Beautiful White Horse","The Address","Ranga's Marriage","Albert Einstein at School","Mother's Day","The Ghat of the Only World","Birth","The Tale of Melon City"], ENG_G),
    Hindi: cat(["नमक का दारोगा","मियाँ नसीरुद्दीन","अपू के साथ ढाई साल","विदाई-संभाषण","गलता लोहा","स्पीति में बारिश","रजनी","जामुन का पेड़","हम तो एक करि जाना","मेरे तो गिरिधर गोपाल","पथिक","वे आँखें","घर की याद","चंपा काले-काले अच्छर नहीं चीन्हती","गजल","हे भूख! मत मचल","सबसे खतरनाक","आओ, मिलकर बचाएँ"], HIN_G)
  };
  D.c12 = {
    Physics: ["Electric Charges and Fields","Electrostatic Potential and Capacitance","Current Electricity","Moving Charges and Magnetism","Magnetism and Matter","Electromagnetic Induction","Alternating Current","Electromagnetic Waves","Ray Optics and Optical Instruments","Wave Optics","Dual Nature of Radiation and Matter","Atoms","Nuclei","Semiconductor Electronics"],
    Chemistry: ["Solutions","Electrochemistry","Chemical Kinetics","d- and f-Block Elements","Coordination Compounds","Haloalkanes and Haloarenes","Alcohols, Phenols and Ethers","Aldehydes, Ketones and Carboxylic Acids","Amines","Biomolecules"],
    Mathematics: ["Relations and Functions","Inverse Trigonometric Functions","Matrices","Determinants","Continuity and Differentiability","Application of Derivatives","Integrals","Application of Integrals","Differential Equations","Vector Algebra","Three Dimensional Geometry","Linear Programming","Probability"],
    Biology: ["Sexual Reproduction in Flowering Plants","Human Reproduction","Reproductive Health","Principles of Inheritance and Variation","Molecular Basis of Inheritance","Evolution","Human Health and Disease","Microbes in Human Welfare","Biotechnology: Principles and Processes","Biotechnology and its Applications","Organisms and Populations","Ecosystem","Biodiversity and Conservation"],
    Accountancy: cat(
      P("Part A", ["Accounting for Partnership Firms: Fundamentals","Goodwill","Change in Profit Sharing Ratio","Admission of a Partner","Retirement and Death of a Partner","Dissolution of Partnership Firm"]),
      P("Part A", ["Accounting for Share Capital","Issue and Redemption of Debentures"]),
      P("Part B", ["Financial Statements of a Company","Analysis of Financial Statements","Accounting Ratios","Cash Flow Statement"])),
    "Business Studies": ["Nature and Significance of Management","Principles of Management","Business Environment","Planning","Organising","Staffing","Directing","Controlling","Financial Management","Financial Markets","Marketing Management","Consumer Protection"],
    Economics: cat(
      P("Macroeconomics", ["Introduction","National Income Accounting","Money and Banking","Determination of Income and Employment","Government Budget and the Economy","Open Economy Macroeconomics"]),
      P("Microeconomics", ["Introduction","Consumer's Equilibrium and Demand","Producer Behaviour and Supply","Forms of Market and Price Determination","Simple Applications of Tools of Demand and Supply"])),
    English: cat(["The Last Lesson","Lost Spring","Deep Water","The Rattrap","Indigo","Poets and Pancakes","The Interview","Going Places","The Third Level","The Tiger King","Journey to the End of the Earth","The Enemy","On the Face of It","Memories of Childhood"], ENG_G),
    Hindi: cat(["पतंग","कविता के बहाने","बात सीधी थी पर","कैमरे में बंद अपाहिज","सहर्ष स्वीकारा है","उषा","बादल राग","कवितावली","रुबाइयाँ","छोटा मेरा खेत","भक्तिन","बाज़ार दर्शन","काले मेघा पानी दे","पहलवान की ढोलक","शिरीष के फूल","श्रम विभाजन और जाति प्रथा","सिल्वर वेडिंग","जूझ"], HIN_G)
  };

  /* ---------------- JEE and NEET (built from the class 11-12 lists) ---------------- */
  D.jee = {
    Physics: D.c11.Physics.concat(D.c12.Physics),
    Chemistry: D.c11.Chemistry.concat(D.c12.Chemistry),
    Mathematics: D.c11.Mathematics.concat(D.c12.Mathematics)
  };
  D.neet = {
    Physics: D.c11.Physics.concat(D.c12.Physics),
    Chemistry: D.c11.Chemistry.concat(D.c12.Chemistry),
    Biology: D.c11.Biology.concat(D.c12.Biology)
  };

  /* ---------------- UPSC (overview) ---------------- */
  D.upsc = {
    "Exam Pattern": [
      "Stage 1, Preliminary (objective): GS Paper I and CSAT Paper II, 200 marks each, 2 hours each",
      "CSAT is qualifying: 33% needed. Prelims has negative marking of one third for each wrong answer",
      "Stage 2, Mains (descriptive): 9 papers. 1750 marks count for ranking",
      "Two language papers (Indian language and English, 300 marks each) are qualifying only",
      "Stage 3, Personality Test (interview): 275 marks",
      "Final merit: Mains 1750 + Interview 275 = 2025 marks"
    ],
    "GS Prelims": [
      "Current events of national and international importance",
      "History of India and Indian National Movement",
      "Indian and World Geography: physical, social and economic",
      "Indian Polity and Governance: Constitution, political system, Panchayati Raj, public policy, rights issues",
      "Economy: economic and social development, sustainable development, poverty, inclusion, demographics, social sector",
      "Environment, ecology, bio-diversity and climate change",
      "General Science"
    ],
    "CSAT": [
      "Comprehension",
      "Interpersonal skills including communication skills",
      "Logical reasoning and analytical ability",
      "Decision-making and problem-solving",
      "General mental ability",
      "Basic numeracy: numbers and their relations (Class X level)",
      "Data interpretation: charts, graphs, tables, data sufficiency (Class X level)"
    ],
    "Mains Papers": [
      "Paper A: Compulsory Indian Language (qualifying, 300 marks)",
      "Paper B: English (qualifying, 300 marks)",
      "Paper I: Essay (250 marks)",
      "GS-I: Indian Heritage and Culture, History and Geography of the World and Society (250 marks)",
      "GS-II: Governance, Constitution, Polity, Social Justice and International Relations (250 marks)",
      "GS-III: Technology, Economic Development, Bio-diversity, Environment, Security and Disaster Management (250 marks)",
      "GS-IV: Ethics, Integrity and Aptitude (250 marks)",
      "Optional Subject Paper I (250 marks)",
      "Optional Subject Paper II (250 marks)"
    ],
    "Optional Subjects": [
      "Agriculture","Animal Husbandry and Veterinary Science","Anthropology","Botany","Chemistry","Civil Engineering","Commerce and Accountancy","Economics","Electrical Engineering","Geography","Geology","History","Law","Management","Mathematics","Mechanical Engineering","Medical Science","Philosophy","Physics","Political Science and International Relations","Psychology","Public Administration","Sociology","Statistics","Zoology","Literature of a listed language"
    ]
  };

  /* ---------------- CA (paper-wise overview, 2023 scheme) ---------------- */
  D["ca-f"] = {
    Accounting: ["Theoretical Framework","Accounting Process","Bank Reconciliation Statement","Inventories","Concept and Accounting of Depreciation","Accounting for Special Transactions","Final Accounts of Sole Proprietors","Partnership Accounts","Company Accounts"],
    "Business Laws": ["Indian Contract Act, 1872","Sale of Goods Act, 1930","Indian Partnership Act, 1932","Limited Liability Partnership Act, 2008","Companies Act, 2013 (basics)"],
    "Quantitative Aptitude": cat(
      P("Business Mathematics", ["Ratio, Proportion, Indices and Logarithms","Equations","Linear Inequalities","Mathematics of Finance","Basic Applications of Differential and Integral Calculus"]),
      P("Logical Reasoning", ["Number Series, Coding and Decoding","Direction Tests","Seating Arrangements","Blood Relations"]),
      P("Statistics", ["Statistical Description of Data","Measures of Central Tendency and Dispersion","Probability","Theoretical Distributions","Correlation and Regression","Index Numbers"])),
    "Business Economics and BCK": cat(
      P("Business Economics", ["Introduction to Business Economics","Theory of Demand and Supply","Theory of Production and Cost","Price Determination in Different Markets","Business Cycles"]),
      P("Business and Commercial Knowledge", ["Business Environment","Business Organisations","Government Policies for Business Growth","Organisation of Commerce and Trade","Common Business Terminologies"]))
  };
  D["ca-i"] = {
    "Advanced Accounting": ["Accounting Standards: Applicability and Framework","Presentation of Financial Statements (Ind AS 1)","Inventories (Ind AS 2)","Cash Flow Statement (Ind AS 7)","Events after the Reporting Period (Ind AS 10)","Property, Plant and Equipment (Ind AS 16)","Revenue from Contracts with Customers (Ind AS 115)","Leases (Ind AS 116)","Provisions and Contingencies (Ind AS 37)","Partnership Accounts: Fundamentals and Reconstitution","Dissolution of Firms","Company Accounts: Issue, Forfeiture, Redemption and Buy-back"],
    "Corporate and Other Laws": ["Companies Act, 2013: Preliminary and Incorporation","Prospectus and Allotment of Securities","Share Capital and Debentures","Acceptance of Deposits","Registration of Charges","Management and Administration","Declaration and Payment of Dividend","Accounts of Companies","Audit and Auditors","Companies Incorporated Outside India","Limited Liability Partnership Act, 2008","General Clauses Act, 1897","Interpretation of Statutes","Foreign Exchange Management Act, 1999"],
    Taxation: cat(
      P("Income Tax", ["Income Tax Basics and Basic Concepts","Residential Status and Scope of Total Income","Income from Salaries","Income from House Property","Profits and Gains of Business or Profession","Presumptive Taxation (Sections 44AD, 44ADA, 44AE)","Capital Gains","Income from Other Sources","Clubbing of Income, Set-off and Carry Forward of Losses","Deductions from Gross Total Income","Tax Deduction at Source (TDS) and Collection at Source","Advance Tax and Return of Income"]),
      P("GST", ["GST Basics and Charge of Tax","Supply, Place of Supply and Time of Supply","Value of Supply","Input Tax Credit","GST Registration","Tax Invoice, Payment of Tax and Returns"])),
    "Cost and Management Accounting": ["Introduction to Cost and Management Accounting","Material Cost","Employee Cost and Direct Expenses","Overheads: Absorption Costing Method","Activity Based Costing","Cost Sheet","Cost Accounting Systems","Unit and Batch Costing","Job Costing","Process and Operation Costing","Joint Products and By Products","Service Costing","Standard Costing","Marginal Costing","Budgets and Budgetary Control"],
    "Auditing and Ethics": ["Nature, Objective and Scope of Audit","Audit Strategy, Planning and Programme","Risk Assessment and Internal Control","Audit Evidence","Audit of Items of Financial Statements","Audit Documentation","Completion and Review","Audit Report","Special Features of Audit of Different Types of Entities","Audit of Banks","Ethics and Terms of Audit Engagements"],
    "Financial Management and Strategic Management": cat(
      P("Financial Management", ["Scope and Objectives of Financial Management","Types of Financing","Financial Analysis and Planning: Ratio Analysis","Cost of Capital","Financing Decisions: Capital Structure","Investment Decisions: Capital Budgeting","Management of Working Capital"]),
      P("Strategic Management", ["Introduction to Strategic Management","Strategic Analysis: External Environment","Strategic Analysis: Internal Environment","Strategic Choices","Strategy Implementation and Evaluation"]))
  };
  D["ca-fin"] = {
    "Financial Reporting": ["Ind AS 115: Revenue from Contracts with Customers","Ind AS 116: Leases","Ind AS 103: Business Combinations","Ind AS 110: Consolidated Financial Statements","Ind AS 36: Impairment of Assets","Ind AS 37: Provisions, Contingent Liabilities and Contingent Assets","Ind AS 12: Income Taxes","Ind AS 8: Accounting Policies, Changes in Estimates and Errors","Ind AS 10: Events after the Reporting Period","Ind AS 38: Intangible Assets","Ind AS 33: Earnings per Share","Ind AS 24: Related Party Disclosures","Ind AS 16: Property, Plant and Equipment","Ind AS 2: Inventories","Financial Instruments (Ind AS 32, 107, 109)","Share-based Payment","Analysis of Financial Statements","Integrated and Sustainability Reporting"],
    "Advanced Financial Management": ["Financial Policy and Corporate Strategy","Risk Management","Advanced Capital Budgeting Decisions","Security Analysis","Portfolio Management","Securitisation","Mutual Funds","Derivatives Analysis and Valuation","Foreign Exchange Exposure and Risk Management","International Financial Management","Interest Rate Risk Management","Corporate Valuation","Mergers, Acquisitions and Corporate Restructuring","Startup Finance"],
    "Audit and Assurance": ["Standards on Auditing (SAs): Overview","Quality Control and SA 220","Audit Planning, Strategy and Execution","Materiality, Risk Assessment and Internal Control (SA 315, SA 320)","Audit Evidence, Documentation and Audit Sampling (SA 500, 530, 230)","Fraud and Going Concern (SA 240, SA 570)","Management Representations (SA 580)","Audit Reporting: SA 700 series","Special Features of Company Audit under the Companies Act","Audit of Consolidated Financial Statements","Audit of Banks","Digital Auditing and Assurance","Professional Ethics and Liabilities of Auditors","Peer Review and Quality Reviews"],
    "Direct Tax Laws and International Taxation": ["Assessment of Various Entities","Taxation of Trusts and Charitable Institutions","Tax Planning, Tax Avoidance and Tax Evasion","Advance Rulings and Dispute Resolution","Transfer Pricing","International Taxation","Double Taxation Avoidance Agreements (DTAA)","Base Erosion and Profit Shifting (BEPS)"],
    "Indirect Tax Laws": ["GST: Supply, Place of Supply, Time and Value of Supply","Input Tax Credit","Registration, Returns and Refunds","Assessment and Audit","Demand and Recovery, Appeals and Advance Ruling","Offences and Penalties","E-way Bill","Customs Law and Foreign Trade Policy"],
    "Integrated Business Solutions": ["Multidisciplinary case study paper that integrates accounting, audit, finance, tax and law"]
  };

  /* ---------------- subject keywords for voice / chat (add more freely) ---------------- */
  SYL.kw = {
    Mathematics: ['maths', 'math', 'mathematics', 'गणित', 'मैथ्स', 'मैथ'], Science: ['science', 'विज्ञान', 'साइंस'],
    'Social Science': ['social science', 'social studies', 'social', 'sst', 'history', 'geography', 'civics', 'सामाजिक विज्ञान', 'सामाजिक'],
    English: ['english', 'अंग्रेज़ी', 'अंग्रेजी', 'इंग्लिश'], Hindi: ['hindi', 'हिंदी', 'हिन्दी'], EVS: ['evs', 'environmental studies', 'पर्यावरण'],
    Physics: ['physics', 'phy', 'भौतिकी', 'फिजिक्स', 'फ़िज़िक्स'], Chemistry: ['chemistry', 'chem', 'रसायन', 'केमिस्ट्री'], Biology: ['biology', 'bio', 'जीव विज्ञान', 'बायोलॉजी'],
    Accountancy: ['accountancy', 'accounts', 'accounting', 'लेखाशास्त्र'], 'Business Studies': ['business studies', 'business', 'बिज़नेस स्टडीज', 'व्यावसायिक अध्ययन'],
    Economics: ['economics', 'eco', 'अर्थशास्त्र'], 'GS Prelims': ['gs prelims', 'prelims', 'general studies', 'gs'], CSAT: ['csat'],
    'Exam Pattern': ['pattern', 'structure', 'exam pattern'], 'Mains Papers': ['mains', 'main exam'], 'Optional Subjects': ['optional', 'optionals'],
    Accounting: ['accounting', 'accounts', 'principles and practice of accounting'], 'Quantitative Aptitude': ['quantitative', 'maths', 'mathematics', 'statistics', 'logical reasoning', 'business mathematics'],
    'Business Laws': ['business laws', 'law', 'laws'], 'Business Economics and BCK': ['business economics', 'bck', 'economics', 'commercial knowledge'],
    'Advanced Accounting': ['advanced accounting', 'accounting', 'accounts', 'accounting standards'], 'Corporate and Other Laws': ['corporate laws', 'corporate and other laws', 'companies act', 'laws', 'law'],
    Taxation: ['taxation', 'tax', 'gst', 'income tax'], 'Cost and Management Accounting': ['costing', 'cost accounting', 'cost and management', 'cma'],
    'Auditing and Ethics': ['auditing', 'audit', 'ethics'], 'Financial Management and Strategic Management': ['financial management', 'strategic management'],
    'Financial Reporting': ['financial reporting', 'ind as'], 'Advanced Financial Management': ['advanced financial management', 'afm'],
    'Audit and Assurance': ['audit', 'auditing', 'assurance'], 'Direct Tax Laws and International Taxation': ['direct tax', 'international taxation', 'income tax', 'taxation'],
    'Indirect Tax Laws': ['indirect tax', 'gst'], 'Integrated Business Solutions': ['ibs', 'integrated business solutions']
  };

  /* ---------------- API ---------------- */
  function nrm(s) { return BP.agent.util.norm(s).trim(); }
  function exName(id) { return BP.tests && BP.tests.examName ? BP.tests.examName(id) : id; }
  function sName(s) { return BP.tests && BP.tests.subName ? BP.tests.subName(s) : s; }
  function topicsOnly(e) { return e === 'upsc' || e.indexOf('ca-') === 0; }
  function unitKey(e) { return topicsOnly(e) ? 'sy_topics' : 'sy_chapters'; }
  SYL.get = function (e) { return D[e] || null; };
  SYL.subjects = function (e) { return D[e] ? Object.keys(D[e]) : []; };
  SYL.chapters = function (e, s) { return (D[e] && D[e][s]) || []; };
  SYL.hasBank = function (e, s) { var d = BP.qb && BP.qb.get && BP.qb.get(e); return !!(d && d[s]); };
  SYL.testable = function (e, s, ch) {
    var chs = BP.qb && BP.qb.chapters ? BP.qb.chapters(e, s) : [], n1 = ' ' + nrm(ch) + ' ', best = null, bl = 0;
    chs.forEach(function (c) { var n2 = nrm(c.ch); if (n2 && n1.indexOf(' ' + n2 + ' ') > -1 && n2.length > bl) { best = c; bl = n2.length; } });
    return best;
  };
  SYL.startTest = function (e, s, ch) {
    if (!BP.tests || !BP.tests.start) { BP.toast(BP.t('tt_nobank')); return null; }
    var r = BP.tests.start({ exam: e, subject: s, chapter: ch || '*' });
    if (!r.ok) BP.toast(BP.t('tt_nobank'));
    return r;
  };
  SYL.detectSub = function (exam, n) {
    var d = D[exam]; if (!d) return null;
    var toks = n.trim().split(' '), best = null, bs = 0;
    Object.keys(d).forEach(function (s) {
      var sc = 0, ns = nrm(s);
      if (n.indexOf(' ' + ns + ' ') > -1) sc = 100 + ns.length;
      (SYL.kw[s] || []).forEach(function (k) {
        var kk = k.toLowerCase(), ok;
        if (kk.indexOf(' ') > -1) ok = n.indexOf(' ' + kk + ' ') > -1;
        else ok = toks.some(function (t) { return t === kk || (kk.length >= 5 && t.indexOf(kk) === 0); });
        if (ok) sc = Math.max(sc, kk.length);
      });
      if (sc > bs) { bs = sc; best = s; }
    });
    return best;
  };

  /* ---------------- UI strings (English + Hindi) ---------------- */
  Object.assign(BP.packs.en.ui, {
    sy_chapters: 'chapters', sy_topics: 'topics', sy_test_ch: 'Start a test on this chapter', sy_test_sub: 'Full subject test',
    sy_noq: 'No practice questions for this chapter yet.', sy_nq: 'practice questions available', sy_read: 'Read aloud',
    sy_open: 'Open in Syllabus', sy_start: 'Start a test', sy_subjects: 'Subjects', sy_note: SYL.note
  });
  Object.assign(BP.packs.hi.ui, {
    sy_chapters: 'अध्याय', sy_topics: 'टॉपिक', sy_test_ch: 'इस अध्याय का टेस्ट शुरू करें', sy_test_sub: 'पूरे विषय का टेस्ट',
    sy_noq: 'इस अध्याय के अभ्यास प्रश्न अभी उपलब्ध नहीं हैं।', sy_nq: 'अभ्यास प्रश्न उपलब्ध', sy_read: 'ज़ोर से पढ़ें',
    sy_open: 'सिलेबस में खोलें', sy_start: 'टेस्ट शुरू करें', sy_subjects: 'विषय',
    sy_note: 'अध्याय सूची NCERT के अनुसार है। UPSC और CA की जानकारी संक्षिप्त ढाँचा है। असली उपयोग से पहले नवीनतम आधिकारिक संस्करण से मिलान करें।'
  });

  /* ---------------- styles ---------------- */
  var CSS = '.sy-lbl{font-size:11.5px;color:var(--mut);margin:10px 2px 6px;text-transform:uppercase;letter-spacing:.6px}' +
    '.sy-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.sy-grid.wide{grid-template-columns:repeat(2,1fr)}' +
    '.sy-b{padding:11px 6px;border-radius:14px;background:rgba(255,255,255,.07);border:1px solid var(--gb);font-weight:600;font-size:13px;text-align:center;transition:.2s}.sy-b:active,.sy-chip:active{transform:scale(.95)}' +
    '.sy-b.on{background:linear-gradient(135deg,#ff9a3c,var(--orange));border-color:transparent;color:#fff;box-shadow:0 6px 18px rgba(255,122,26,.35)}' +
    '.sy-chips{display:flex;flex-wrap:wrap;gap:8px}.sy-chip{padding:9px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid var(--gb);font-size:13px;font-weight:500;transition:.2s;text-align:left}' +
    '.sy-chip.on{background:linear-gradient(135deg,var(--teal),#0fa89c);color:#04201e;border-color:transparent;font-weight:600}' +
    '.sy-ch{border-radius:16px;background:var(--glass);border:1px solid var(--gb);margin:8px 0;overflow:hidden;backdrop-filter:blur(12px);transition:.25s}.sy-ch.open{border-color:rgba(20,211,196,.5);box-shadow:0 0 22px rgba(20,211,196,.15)}' +
    '.sy-h{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;text-align:left}' +
    '.sy-n{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:700 12px Poppins,sans-serif;color:#fff;background:linear-gradient(135deg,var(--orange),#e8570a)}' +
    '.sy-t{flex:1;min-width:0;font-weight:600;font-size:14px}.sy-cv{transition:.25s;color:var(--mut)}.sy-ch.open .sy-cv{transform:rotate(180deg)}' +
    '.sy-body{padding:0 14px 14px 54px}.sy-ol{max-height:260px;overflow:auto;padding-right:6px}.sy-sm{font-size:12px}' +
    '@media(min-width:700px){.sy-grid{grid-template-columns:repeat(6,1fr)}.sy-grid.wide{grid-template-columns:repeat(3,1fr)}}';
  if (!document.getElementById('sy-css')) { var stl = document.createElement('style'); stl.id = 'sy-css'; stl.textContent = CSS; document.head.appendChild(stl); }

  /* ---------------- Syllabus Explorer screen ---------------- */
  var ST = SYL.state = { exam: null, sub: null, open: -1 }, IDS = [], i;
  for (i = 1; i <= 12; i++) IDS.push('c' + i);
  IDS.push('jee', 'neet', 'upsc', 'ca-f', 'ca-i', 'ca-fin');
  function tt(k) { return BP.t(k); }
  function speakNow(text) {
    if (!BP.voice) return;
    var lang = /[\u0900-\u097F]/.test(text) ? 'hi' : 'en', v = BP.settings.voiceOn;
    BP.settings.voiceOn = true; BP.voice.speak(text, lang); BP.settings.voiceOn = v;
  }
  function brief(x) { return String(x).replace(/\s*\(.*?\)/g, '').slice(0, 80); }
  function paint() {
    var root = BP.$('#sy-root'); if (!root) return;
    if (!ST.exam) { var h0 = BP.tests && BP.tests.history ? BP.tests.history() : []; ST.exam = h0.length ? h0[h0.length - 1].exam : 'c10'; }
    if (!D[ST.exam]) ST.exam = 'c10';
    var subs = SYL.subjects(ST.exam); if (subs.indexOf(ST.sub) < 0) { ST.sub = subs[0]; ST.open = -1; }
    var h = '<div class="sy-lbl">' + tt('tt_school') + '</div><div class="sy-grid">';
    IDS.forEach(function (id) { if (id.charAt(0) === 'c' && /^c\d+$/.test(id)) h += '<button class="sy-b' + (ST.exam === id ? ' on' : '') + '" data-a="exam" data-v="' + id + '">' + E(exName(id)) + '</button>'; });
    h += '</div><div class="sy-lbl">' + tt('tt_comp') + '</div><div class="sy-grid wide">';
    IDS.forEach(function (id) { if (!/^c\d+$/.test(id)) h += '<button class="sy-b' + (ST.exam === id ? ' on' : '') + '" data-a="exam" data-v="' + id + '">' + E(exName(id)) + '</button>'; });
    h += '</div><div class="sy-lbl">' + tt('sy_subjects') + '</div><div class="sy-chips">';
    subs.forEach(function (s) { h += '<button class="sy-chip' + (ST.sub === s ? ' on' : '') + '" data-a="sub" data-v="' + E(s) + '">' + E(sName(s)) + '</button>'; });
    h += '</div>';
    var list = SYL.chapters(ST.exam, ST.sub), bank = SYL.hasBank(ST.exam, ST.sub);
    h += '<div class="card" style="margin-top:14px"><div class="c-h"><b>' + E(exName(ST.exam) + ' \u00B7 ' + sName(ST.sub)) + '</b><span class="pill">' + list.length + ' ' + tt(unitKey(ST.exam)) + '</span></div><div class="c-b">' +
      '<button class="btn ghost sm" data-a="readsub">' + tt('sy_read') + '</button>' + (bank ? '<button class="btn sm" data-a="testsub">' + tt('sy_test_sub') + '</button>' : '') + '</div></div>';
    list.forEach(function (name, k) {
      var open = ST.open === k, body = '';
      if (open) {
        var q = SYL.testable(ST.exam, ST.sub, name);
        if (q) body = '<p class="mut sy-sm" style="margin:0 0 8px">' + q.n + ' ' + tt('sy_nq') + '</p><div class="c-b"><button class="btn sm" data-a="testch" data-v="' + k + '">' + tt('sy_test_ch') + '</button><button class="btn ghost sm" data-a="readch" data-v="' + k + '">' + tt('sy_read') + '</button></div>';
        else body = '<p class="mut sy-sm" style="margin:0 0 8px">' + tt('sy_noq') + '</p><div class="c-b">' + (bank ? '<button class="btn sm" data-a="testsub">' + tt('sy_test_sub') + '</button>' : '') + '<button class="btn ghost sm" data-a="readch" data-v="' + k + '">' + tt('sy_read') + '</button></div>';
      }
      h += '<div class="sy-ch' + (open ? ' open' : '') + '"><button class="sy-h" data-a="tog" data-v="' + k + '"><span class="sy-n">' + (k + 1) + '</span><span class="sy-t">' + E(name) + '</span><span class="sy-cv">\u25BE</span></button>' + (open ? '<div class="sy-body">' + body + '</div>' : '') + '</div>';
    });
    root.innerHTML = h + '<p class="mut sy-sm" style="margin:12px 2px 0">' + E(tt('sy_note')) + '</p>';
  }
  function onClick(e) {
    var t = e.target.closest('[data-a]'); if (!t) return;
    var a = t.getAttribute('data-a'), v = t.getAttribute('data-v'), list = SYL.chapters(ST.exam, ST.sub);
    switch (a) {
      case 'exam': ST.exam = v; ST.sub = null; ST.open = -1; paint(); break;
      case 'sub': ST.sub = v; ST.open = -1; paint(); break;
      case 'tog': ST.open = ST.open === +v ? -1 : +v; paint(); break;
      case 'testsub': SYL.startTest(ST.exam, ST.sub, '*'); break;
      case 'testch': var q = SYL.testable(ST.exam, ST.sub, list[+v]); SYL.startTest(ST.exam, ST.sub, q ? q.ch : '*'); break;
      case 'readch': speakNow(brief(list[+v])); break;
      case 'readsub': speakNow(exName(ST.exam) + ' ' + sName(ST.sub) + '. ' + list.slice(0, 6).map(brief).join('. ')); break;
    }
  }
  BP.registerView('syllabus', function (box) {
    box.innerHTML = '<h2 class="ph">' + tt('t_syllabus') + '</h2><div id="sy-root"></div>';
    BP.$('#sy-root', box).addEventListener('click', onClick);
    paint();
  });
  SYL.open = function (exam, sub) { ST.exam = exam; ST.sub = sub || null; ST.open = -1; BP.go('syllabus'); };

  /* ---------------- chat cards ---------------- */
  BP.registerCard('syl-list', function (d) {
    var list = SYL.chapters(d.exam, d.sub), bank = SYL.hasBank(d.exam, d.sub);
    return '<div class="card cd"><div class="c-h"><b>' + E(exName(d.exam) + ' \u00B7 ' + sName(d.sub)) + '</b><span class="pill">' + list.length + ' ' + tt(unitKey(d.exam)) + '</span></div>' +
      '<ol class="steps sy-ol">' + list.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ol><div class="c-b" style="margin-top:10px">' +
      '<button class="btn sm ghost" data-syopen="1" data-e="' + E(d.exam) + '" data-s="' + E(d.sub) + '">' + tt('sy_open') + '</button>' +
      (bank ? '<button class="btn sm" data-sytest="1" data-e="' + E(d.exam) + '" data-s="' + E(d.sub) + '">' + tt('sy_start') + '</button>' : '') + '</div></div>';
  });
  BP.registerCard('syl-subjects', function (d) {
    var A = BP.agent, g = BP.settings.lang, lab = d.exam === 'upsc' ? 'UPSC' : exName(d.exam);
    return '<div class="card cd"><div class="c-h"><b>' + E(exName(d.exam)) + '</b></div><div class="sy-chips">' + SYL.subjects(d.exam).map(function (s) {
      var q = g === 'hi' ? lab + ' ' + sName(s) + ' \u0938\u093F\u0932\u0947\u092C\u0938' : lab + ' ' + s + ' syllabus';
      return '<button class="chip" data-ask="' + E(q) + '">' + E(sName(s)) + '</button>';
    }).join('') + '</div></div>';
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-syopen]'); if (t) { SYL.open(t.getAttribute('data-e'), t.getAttribute('data-s')); return; }
    t = e.target.closest('[data-sytest]'); if (t) SYL.startTest(t.getAttribute('data-e'), t.getAttribute('data-s'), '*');
  });

  /* ---------------- voice / chat intent ---------------- */
  function hSyl(m) {
    var A = BP.agent, T = A.T, n = m.n, s = m.slots, exam = null, c;
    if (s.exam) exam = s.exam; else if (s.cls) exam = 'c' + s.cls;
    else { c = A.ctx.slots; if (c) { if (c.exam) exam = c.exam; else if (c.cls) exam = 'c' + c.cls; } }
    A.ctx.pending = 'syllabus';
    var goCard = { type: 'go', view: 'syllabus', label: T('Open Syllabus Explorer', '\u0938\u093F\u0932\u0947\u092C\u0938 \u090F\u0915\u094D\u0938\u092A\u094D\u0932\u094B\u0930\u0930 \u0916\u094B\u0932\u0947\u0902') };
    if (!exam) {
      var t0 = T('Which class or exam do you want the syllabus for?', '\u0906\u092A \u0915\u093F\u0938 \u0915\u0915\u094D\u0937\u093E \u092F\u093E \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u0915\u093E \u0938\u093F\u0932\u0947\u092C\u0938 \u0926\u0947\u0916\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902?');
      return { text: t0, speak: t0, card: goCard, chips: T(['Class 10 syllabus', 'Class 12 syllabus', 'JEE syllabus', 'NEET syllabus', 'UPSC syllabus', 'CA Foundation syllabus'], ['\u0915\u0915\u094D\u0937\u093E 10 \u0938\u093F\u0932\u0947\u092C\u0938', '\u0915\u0915\u094D\u0937\u093E 12 \u0938\u093F\u0932\u0947\u092C\u0938', 'JEE \u0938\u093F\u0932\u0947\u092C\u0938', 'NEET \u0938\u093F\u0932\u0947\u092C\u0938', 'UPSC \u0938\u093F\u0932\u0947\u092C\u0938', 'CA \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0938\u093F\u0932\u0947\u092C\u0938']) };
    }
    if (exam === 'ca') {
      var t1 = T('Which CA level: Foundation, Intermediate or Final?', 'CA \u0915\u093E \u0915\u094C\u0928 \u0938\u093E \u0932\u0947\u0935\u0932: \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928, \u0907\u0902\u091F\u0930\u092E\u0940\u0921\u093F\u090F\u091F \u092F\u093E \u092B\u093E\u0907\u0928\u0932?');
      return { text: t1, speak: t1, chips: T(['CA Foundation syllabus', 'CA Intermediate syllabus', 'CA Final syllabus'], ['CA \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0938\u093F\u0932\u0947\u092C\u0938', 'CA \u0907\u0902\u091F\u0930\u092E\u0940\u0921\u093F\u090F\u091F \u0938\u093F\u0932\u0947\u092C\u0938', 'CA \u092B\u093E\u0907\u0928\u0932 \u0938\u093F\u0932\u0947\u092C\u0938']) };
    }
    var data = SYL.get(exam), nm = exName(exam), lab = exam === 'upsc' ? 'UPSC' : nm;
    if (!data) { var t2 = T('I do not have the syllabus for that yet. A staff member can share it.', '\u0907\u0938\u0915\u093E \u0938\u093F\u0932\u0947\u092C\u0938 \u0905\u092D\u0940 \u092E\u0947\u0930\u0947 \u092A\u093E\u0938 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0938\u094D\u091F\u093E\u092B \u0938\u0926\u0938\u094D\u092F \u0907\u0938\u0947 \u0938\u093E\u091D\u093E \u0915\u0930 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964'); return { text: t2, speak: t2, card: goCard }; }
    var subs = Object.keys(data), sub = SYL.detectSub(exam, n);
    if (!sub && subs.length === 1) sub = subs[0];
    if (!sub) {
      var names = subs.slice(0, 6).map(sName).join(', ');
      var t3 = exam === 'upsc'
        ? T('UPSC has three stages: Prelims with two papers, Mains with nine papers, and an interview. Pick a part to see details.', 'UPSC \u092E\u0947\u0902 \u0924\u0940\u0928 \u091A\u0930\u0923 \u0939\u0948\u0902: \u0926\u094B \u092A\u0947\u092A\u0930 \u0935\u093E\u0932\u093E \u092A\u094D\u0930\u0940\u0932\u093F\u092E\u094D\u0938, \u0928\u094C \u092A\u0947\u092A\u0930 \u0935\u093E\u0932\u093E \u092E\u0947\u0902\u0938, \u0914\u0930 \u0907\u0902\u091F\u0930\u0935\u094D\u092F\u0942\u0964 \u0935\u093F\u0935\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u092D\u093E\u0917 \u091A\u0941\u0928\u0947\u0902\u0964')
        : T('Which subject for ' + nm + '? We have ' + names + '.', nm + ' \u0915\u093E \u0915\u094C\u0928 \u0938\u093E \u0935\u093F\u0937\u092F? \u0909\u092A\u0932\u092C\u094D\u0927 \u0939\u0948\u0902: ' + names + '\u0964');
      return { text: t3, speak: t3, card: { type: 'syl-subjects', exam: exam } };
    }
    A.ctx.pending = null;
    var ch = data[sub], N = ch.length, first = ch.slice(0, 3).map(brief), unit = topicsOnly(exam);
    var sn = sName(sub), list = first.length > 1 ? first.slice(0, -1).join(', ') + T(' and ', ' \u0914\u0930 ') + first[first.length - 1] : first[0];
    var txt = N <= 3
      ? T(nm + ' ' + sub + ' covers ' + list + '.', nm + ' ' + sn + ' \u092E\u0947\u0902 \u0936\u093E\u092E\u093F\u0932 \u0939\u0948\u0902: ' + list + '\u0964')
      : T(nm + ' ' + sub + ' has ' + N + (unit ? ' topics' : ' chapters') + '. The first few are ' + list + '. The full list is on screen.',
          nm + ' ' + sn + ' \u092E\u0947\u0902 ' + N + (unit ? ' \u091F\u0949\u092A\u093F\u0915' : ' \u0905\u0927\u094D\u092F\u093E\u092F') + ' \u0939\u0948\u0902\u0964 \u092A\u0939\u0932\u0947 \u0915\u0941\u091B \u0939\u0948\u0902: ' + list + '\u0964 \u092A\u0942\u0930\u0940 \u0938\u0942\u091A\u0940 \u0938\u094D\u0915\u094D\u0930\u0940\u0928 \u092A\u0930 \u0939\u0948\u0964');
    var chips = [];
    if (SYL.hasBank(exam, sub)) chips.push(T('Start a ' + nm + ' ' + sub + ' test', nm + ' ' + sn + ' \u0915\u093E \u091F\u0947\u0938\u094D\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902'));
    chips.push(T(lab + ' syllabus', lab + ' \u0938\u093F\u0932\u0947\u092C\u0938'));
    return { text: txt, speak: txt, card: { type: 'syl-list', exam: exam, sub: sub }, chips: chips };
  }
  if (BP.agent && BP.agent.registerIntent) {
    BP.agent.registerIntent({ id: 'syllabus', pri: 0.6, handler: hSyl, kw: ['syllabus', 'syllabi', 'chapter', 'chapters', 'curriculum', 'ncert', 'topics', 'what is taught', 'course content', '\u0938\u093F\u0932\u0947\u092C\u0938', '\u092A\u093E\u0920\u094D\u092F\u0915\u094D\u0930\u092E', '\u0905\u0927\u094D\u092F\u093E\u092F', '\u092A\u093E\u0920'] });
  }
})(window.BP);
