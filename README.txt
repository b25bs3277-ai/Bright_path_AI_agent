BrightPath Coaching AI  -  white-label AI coaching platform demo
=================================================================
RUN (Colab):  run Cell 1 -> click the printed link. Cells 2-5 only add module files and
rebuild this zip; just refresh the page to see new features (server keeps running).

RUN (anywhere else, e.g. your laptop):
  1. Unzip this folder.
  2. In the folder run:  python -m http.server 8000
  3. Open http://localhost:8000 in Chrome (voice features need Chrome/Edge/Safari).
  Voice input needs HTTPS or localhost. Opening index.html by double-click will NOT work well.

FILES
  index.html            shell + module loader (skips modules that do not exist yet)
  css/base.css          theme, layout, chat, cards     (css/polish.css arrives in Cell 5)
  js/core.js            helpers, storage, settings, language packs, navigation, chat UI, cards
  js/voice.js           Web Speech API (SpeechRecognition + SpeechSynthesis)
  js/agent.js           knowledge base (BP.kb), intent engine, lead capture flow
  assets/               generated faculty photos and fallback classroom image

CUSTOMISING FOR AN INSTITUTE
  * Name, contact, colours, fees: Cell 4 adds a live white-label panel. Until then edit
    BP.defaults in js/core.js and the knowledge base in js/agent.js (programs, faculty, results).
  * KB data (toppers, results, fees, faculty) is FICTIONAL sample data. Replace before real use.
  * Background video: edit the VIDEO_CANDIDATES list in Cell 1 (direct .mp4 links).

KNOWN LIMITS
  * Speech recognition quality depends on the browser; Hindi works best in Chrome on Android.
  * Voice replies need one user tap first (browser autoplay rule), so the opening greeting is silent.
  * The agent is rule-based: it answers only from the knowledge base and logs everything else as a callback.


POLISH / PWA (Cell 5)
  css/polish.css, js/polish.js   premium styling, welcome screen, tour, skeletons, accessibility
  manifest.json, sw.js, assets/icons/*   installable app (needs HTTPS or localhost)
  QA.txt                          known issues, read before a customer demo
  Hosting for real customers: upload this folder to any static HTTPS host (Netlify, GitHub Pages, cPanel).
