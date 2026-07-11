(() => {
  const storyBase = (location.protocol === 'file:' || location.pathname.includes('/portfolio-v2')) ? '../portfolio/public' : '/portfolio';
  const isEN = (localStorage.getItem('aa_lang') || 'pl') === 'en';
  const T = (pl, en) => isEN ? en : pl;
  // HERO — split the headline into words so it can cascade instead of landing as one slab.
  // No opacity:0 fallback on the h1 itself: if this never runs, the headline still renders normally.
  const heroH1 = document.querySelector('.hero h1');
  if (heroH1 && !heroH1.dataset.split) {
    heroH1.dataset.split = '1';
    heroH1.innerHTML = heroH1.textContent.trim().split(/\s+/)
      .map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(' ');
  }

  const summary = document.querySelector('.summary');
  const foundation = document.querySelector('.foundation');
  const mobile = document.querySelector('.mobile');
  const result = document.querySelector('.result');
  if (!summary || !foundation || !mobile || !result) return;

  summary.classList.add('story-context');
  summary.classList.remove('section');
  summary.innerHTML = `
    <div data-story-reveal>
      <span class="label">${T('Kontekst','Context')}</span>
      <h2>System marki dla startupu farmaceutycznego z Teksasu</h2>
      <p>HubbleRx powstał w 2022 roku podczas mojej pierwszej współpracy z Decom Studios. Celem było stworzenie przyjaznej marki dla internetowej subskrypcji leków — prostszej, bardziej ludzkiej i gotowej do działania w wielu kanałach.</p>
      <div class="story-note">Klient: Decom Studios · Texas · 2022</div>
    </div>
    <div data-story-reveal>
      <span class="label">${T('Zakres eksperymentu','Scope of the experiment')}</span>
      <h2>Jedna idea rozwinięta w pełny system</h2>
      <p>Produkt nie został ostatecznie wprowadzony na rynek, ale proces objął ilustracje, layouty, animacje, prototypy i pierwsze eksperymenty 3D. To zapis projektu, w którym jedna idea stopniowo adaptowała się do kolejnych potrzeb.</p>
      <div class="story-note">Zakres: Branding · Illustration · UI · Motion · 3D</div>
    </div>`;

  summary.insertAdjacentHTML('afterend', `
    <section class="future" id="idea">
      <div class="container grid">
        <div class="future-copy" data-story-reveal>
          <span class="label">${T('Punkt wyjścia','Starting point')}</span>
          <h2>Przyjazna wizja przyszłości</h2>
          <blockquote class="future-quote">„Co, jeśli dostęp do leków byłby równie prosty jak codzienne usługi online?”</blockquote>
          <p>Inspiracją był optymistyczny retrofuturyzm: świat rodzinny, ciepły i technologiczny. Medycyna miała wyglądać jak naturalna część codzienności, a nie chłodny system pełen barier.</p>
        </div>
        <div class="future-art" data-story-reveal><img data-story-src="/projects/hubble/story/world-lineart.jpg" alt="Retrofuturystyczny świat HubbleRx"></div>
      </div>
    </section>
    <section class="container section process">
      <div class="process-head" data-story-reveal><div><span class="label">${T('Proces ilustracyjny','Illustration process')}</span><h2>${T('Od pierwszego szkicu do systemu','From first sketch to system')}</h2></div><p>${T('Pomysł zaczynał się od szybkich rysunków postaci i architektury. Następnie porządkowałem perspektywę, rytm i język form w Illustratorze, aż pojedyncza scena zaczęła działać jako skalowalny system.','It began with quick drawings of characters and architecture. Then I worked the perspective, rhythm and form language in Illustrator, until a single scene started working as a scalable system.')}</p></div>
      <div class="process-grid">
        <article class="process-card" data-story-reveal><div class="process-media"><img data-story-src="/projects/hubble/story/sketch-world.png" alt="Szkic świata HubbleRx"></div><div class="process-meta"><div class="process-n">${T('Szkic','Sketch')}</div><p>${T('Luźna eksploracja świata, postaci i tonu opowieści.','Loose exploration of the world, characters and tone.')}</p></div></article>
        <article class="process-card" data-story-reveal><div class="process-media"><img data-story-src="/projects/hubble/story/world-lineart.jpg" alt="Line art HubbleRx"></div><div class="process-meta"><div class="process-n">${T('Wektor','Vector')}</div><p>${T('Czysta linia, perspektywa i wspólny rytm elementów.','Clean line, perspective and a shared rhythm of forms.')}</p></div></article>
        <article class="process-card" data-story-reveal><div class="process-media"><img data-story-src="/projects/hubble/hero-hubble.png" alt="Finalny system ilustracji HubbleRx"></div><div class="process-meta"><div class="process-n">${T('System','System')}</div><p>${T('Język gotowy do użycia w stronie, reklamie i produkcie.','A language ready for the site, ads and the product.')}</p></div></article>
      </div>
    </section>
    <section class="world">
      <div class="container">
        <div class="world-head" data-story-reveal><h2>Budowanie świata, nie pojedynczej ilustracji</h2><p>Postacie, rodzina, futurystyczna architektura i przyjazna technologia tworzyły jeden rozpoznawalny język — możliwy do rozwijania w kolejnych materiałach.</p></div>
        <div class="world-grid">
          <figure class="world-card" data-story-reveal><img data-story-src="/projects/hubble/story/character-doctor.png" alt="Postać lekarza HubbleRx"><figcaption class="world-tag">Characters</figcaption></figure>
          <figure class="world-card" data-story-reveal><img data-story-src="/projects/hubble/story/sketch-mobile.png" alt="Mobilny świat HubbleRx"><figcaption class="world-tag">Friendly technology</figcaption></figure>
          <figure class="world-card" data-story-reveal><img data-story-src="/projects/hubble/hero-hubble.png" alt="Architektura HubbleRx"><figcaption class="world-tag">Future architecture</figcaption></figure>
          <figure class="world-card" data-story-reveal><img data-story-src="/projects/hubble/story/world-lineart.jpg" alt="Rodzinny świat HubbleRx"><figcaption class="world-tag">Family values</figcaption></figure>
          <figure class="world-card" data-story-reveal><img data-story-src="/projects/hubble/story/mobile-presentation.png" alt="Interfejs HubbleRx"><figcaption class="world-tag">Pharmacy experience</figcaption></figure>
        </div>
      </div>
    </section>`);

  const futureSection = document.querySelector('.future');
  futureSection.insertAdjacentHTML('afterend', `
    <section class="rejected"><div class="container rejected-grid">
      <div class="rejected-copy" data-story-reveal><span class="label">${T('Odrzucony kierunek','Rejected direction')}</span><h2>„The Netflix for Medications”</h2><p>Jedna z pierwszych metafor przedstawiała HubbleRx jako prostą usługę subskrypcyjną dostępną z domowego ekranu. Futurystyczny salon, telewizor i mały robot natychmiast tłumaczyły ideę stałego dostępu.</p><div class="decision"><b>Dlaczego odrzuciliśmy ten kierunek?</b><span>Metafora była czytelna, ale zbyt mocno przesuwała komunikację w stronę rozrywki. W produkcie zdrowotnym ważniejsze okazały się zaufanie, rodzina i klarowność.</span></div></div>
      <div class="rejected-visual" data-story-reveal><span class="rejected-stamp">${T('Eksploracja / niewybrany','Exploration / not selected')}</span><img class="rejected-phone" data-story-src="/projects/hubble/story/product-system/robot-concept.png" alt="Odrzucony kierunek Netflix for Medications"><img class="rejected-ghost" data-story-src="/projects/hubble/story/product-system/robot-room.png" alt="Robot w futurystycznym salonie"></div>
    </div></section>`);

  const worldSection = document.querySelector('.world');
  worldSection.insertAdjacentHTML('afterend', `
    <section class="scene-build" id="ilustracja" aria-label="${T('Scena HubbleRx składająca się z fragmentów podczas przewijania','HubbleRx scene assembling from fragments on scroll')}">
      <div class="scene-stage">
        <div class="scene-head">
          <div class="scene-copy"><span class="label">${T('System ilustracji','Illustration system')}</span><h2>${T('Świat gotowy na każdy format','A world ready for every format')}</h2><p>${T('Scena powstała jako kompozycja modularna. Ten sam świat obsługiwał szeroki banner, wąski slot mobile i tło kampanii — wystarczyło przesunąć kadr.','The scene was built as a modular composition. The same world served a wide banner, a narrow mobile slot and a campaign backdrop — reframing was enough.')}</p></div>
        </div>
        <div class="scene-canvas">${['illustration-01','illustration-02'].map(n=>`<img class="scene-layer" data-story-src="/projects/hubble/story/product-system/${n}.svg" alt="" aria-hidden="true">`).join('')}</div>
        <figure class="scene-3d" data-story-reveal>
          <img data-story-src="/projects/hubble/story/3d-underlay.png" alt="${T('Render architektury HubbleRx wyrzeźbionej w 3D','HubbleRx architecture sculpted in 3D')}">
          <figcaption><b>${T('Architektura rzeźbiona w 3D','Architecture sculpted in 3D')}</b><span>${T('Wieże, budynki i pojazdy powstawały najpierw jako bryły. Wektor był obrysem gotowej geometrii — stąd spójna perspektywa.','Towers, buildings and vehicles were built as solids first. The vector traced finished geometry — hence the consistent perspective.')}</span></figcaption>
        </figure>
        <div class="scene-progress" aria-hidden="true"><i></i></div>
      </div>
    </section>`);

  // bridge 01 — the rejected direction is a turning point, not a detour: say so before the scene lands
  document.querySelector('.scene-build').insertAdjacentHTML('beforebegin', `
    <section class="story-bridge" aria-label="${T('Przejście od odrzuconego kierunku do systemu','Transition from the rejected direction to the system')}">
      <div class="container" data-story-reveal><span class="bridge-n">01</span><p>${T('Odrzucenie metafory odesłało projekt z powrotem do budowania świata.','Rejecting the metaphor sent the project back to building the world.')}</p><span class="bridge-label">${T('Od odrzucenia do systemu','From rejection to system')}</span></div>
    </section>`);

  document.querySelector('.scene-build').insertAdjacentHTML('afterend', `
    <section class="story-bridge" aria-label="${T('Przejście od ilustracji do identyfikacji','Transition from illustration to identity')}">
      <div class="container" data-story-reveal><span class="bridge-n">02</span><p>${T('Ilustracyjny język marki stał się podstawą znaku, koloru i typografii.','The illustrated language became the foundation for the mark, colour and typography.')}</p><span class="bridge-label">${T('Od ilustracji do identyfikacji','From illustration to identity')}</span></div>
    </section>`);

  foundation.insertAdjacentHTML('afterend', `
    <section class="adapt"><div class="container">
      <div class="adapt-head" data-story-reveal><span class="label">Adaptacja</span><h2>Jedna idea, kilka języków wizualnych</h2><p>Różnorodność nie była przypadkiem. Każdy kanał potrzebował innego poziomu emocji, informacji i dynamiki, ale wszystkie materiały wynikały z tego samego rdzenia marki.</p></div>
      <div class="adapt-grid">
        <article class="adapt-card" data-story-reveal><span class="label">Friendly illustration</span><div class="shot"><img data-story-src="/projects/hubble/story/world-lineart.jpg" alt="Ilustracyjny kierunek HubbleRx"></div><h3>Bliskość i opowieść</h3><p>Postacie oraz sceny upraszczały temat i budowały przyjazny ton.</p></article>
        <article class="adapt-card" data-story-reveal><span class="label">Clean healthcare UI</span><div class="shot"><img data-story-src="/projects/hubble/website-presentation.webp" alt="UI HubbleRx"></div><h3>Czytelność i zaufanie</h3><p>Interfejs porządkował informacje i prowadził użytkownika przez ofertę.</p></article>
        <article class="adapt-card" data-story-reveal><span class="label">Campaign & motion</span><div class="shot"><img data-story-src="/projects/hubble/story/blender-mobile.png" alt="Motion i 3D HubbleRx"></div><h3>Energia i uwaga</h3><p>Ruch oraz przestrzeń pozwalały marce działać w reklamie i social media.</p></article>
      </div>
    </div></section>`);

  const adaptSection = document.querySelector('.adapt');
  adaptSection.insertAdjacentHTML('afterend', `
    <section class="story-bridge" aria-label="${T('Przejście od identyfikacji do produktu','Transition from identity to product')}">
      <div class="container" data-story-reveal><span class="bridge-n">03</span><p>${T('Znak i kolor dały ramę, w której oferta mogła się ułożyć.','The mark and colour gave the frame in which the offer could settle.')}</p><span class="bridge-label">${T('Od identyfikacji do produktu','From identity to product')}</span></div>
    </section>
    <section class="membership-system" id="produkt"><div class="container">
      <div class="membership-head" data-story-reveal><span class="label">${T('System korzyści','Benefit system')}</span><h2>Oferta zamieniona w język wizualny</h2><p>Model subskrypcji obejmował kilka kategorii korzyści. Zaprojektowałem moduł kart, który pozwalał użytkownikowi stopniowo odkrywać szczegóły bez przeciążania pierwszego widoku.</p></div>
      <div class="membership-cards" data-story-reveal>
        ${[
          [T('Leki doraźne','Acute medications'),T('Potrzeba natychmiastowa','Immediate need'),[T('Szybki dostęp do leków podstawowych','Fast access to essential medications'),T('Przejrzysta cena w abonamencie','Clear membership pricing'),T('Odbiór w lokalnej aptece','Local pharmacy pickup')]],
          [T('Leki przewlekłe','Chronic medications'),T('Terapia ciągła','Maintenance need'),[T('Wsparcie w chorobach przewlekłych','Long-term condition support'),T('Ponad 480 leków w pakiecie','480+ included medications'),T('Zapas do 21 dni','Up to 21-day supply'),T('Odbiór w lokalnej aptece','Local pharmacy pickup')]],
          [T('Leki bez recepty','OTC medications'),T('Potrzeba codzienna','Everyday need'),[T('Produkty bez recepty','Non-prescription medications'),T('Oszczędność do 50%','Savings up to 50%'),T('Popularne produkty codzienne','Popular everyday products'),T('Dostawa do domu','Home delivery')]],
          [T('Konsultacje farmaceuty','Pharmacy coaching'),T('Infolinia','Helpline'),[T('Bezpośrednie wsparcie farmaceuty','Direct pharmacy support'),T('Pomoc w doborze leków','Medication guidance'),T('Wsparcie w chorobach przewlekłych','Long-term condition support'),T('Odbiór w lokalnej aptece','Local pharmacy pickup')]],
          [T('Zaopatrzenie diabetyczne','Diabetes supplies'),T('Podstawy opieki','Care essentials'),[T('Glukometr','Glucose monitor'),T('Paski testowe','Test strips'),T('Nakłuwacze i lancety','Lancet supplies'),T('Urządzenie i płyn kontrolny','Device and control solution'),T('Dostawa do domu','Home delivery')]]
        ].map((card,i)=>`<article class="membership-card${i===1?' is-open':''}">
          <div class="membership-card-main"><img data-story-src="/projects/hubble/story/product-system/benefit-0${i+1}.svg" alt=""><h3>${card[0]}</h3><p>${card[1]}</p></div>
          <div class="membership-card-details" id="membership-details-${i}" ${i===1?'':'hidden'}><ul>${card[2].map(item=>`<li>${item}</li>`).join('')}</ul></div>
          <button class="membership-toggle" type="button" aria-expanded="${i===1?'true':'false'}" aria-controls="membership-details-${i}"><span>${i===1?T('Zwiń','Close'):T('Zobacz więcej','Learn more')}</span><i aria-hidden="true">${i===1?'−':'+'}</i></button>
        </article>`).join('')}
      </div>
    </div></section>`);

  mobile.insertAdjacentHTML('afterend', `
    <section class="story-bridge" aria-label="${T('Przejście od produktu do ruchu','Transition from product to motion')}">
      <div class="container" data-story-reveal><span class="bridge-n">04</span><p>${T('Gotowy język produktu pozwolił sprawdzić markę w ruchu, reklamie i przestrzeni 3D.','The finished product language let the brand be tested in motion, advertising and 3D.')}</p><span class="bridge-label">${T('Od produktu do motion','From product to motion')}</span></div>
    </section>
    <section class="motion" id="motion"><div class="container motion-layout">
      <div class="motion-copy" data-story-reveal><span class="label">${T('Eksperymenty w ruchu','Motion experiments')}</span><h2>Pomysły testowane w ruchu</h2><p>Od krótkich reklam 2D po przestrzenne eksperymenty i prototypy interfejsu. Ruch pozwalał sprawdzić tempo, hierarchię i charakter marki przed finalnym użyciem.</p></div>
      <div class="motion-grid">
        ${[['motion-2d.mp4',T('Wizerunek marki','Brand imagery')],['motion-social.mp4',T('Animacja 2D','2D Animation')],['motion-3d.mp4',T('Kampania wizerunkowa','Brand campaign')],['motion-prototype.mp4',T('Eksperymenty 3D','3D Experiments')]].map(([src,label])=>`<figure class="motion-card" data-story-reveal><video data-story-video="/projects/hubble/story/${src}" muted loop playsinline preload="metadata"></video><span>${label}</span><i class="play-dot">▶</i></figure>`).join('')}
      </div>
    </div></section>
    <section class="tools-story"><div class="container tools-grid">
      <div class="tools-copy" data-story-reveal><span class="label">${T('Warsztat','Craft')}</span><h2>Od Illustratora do Blendera</h2><p>Płaskie formy wektorowe zapewniały spójność i skalowalność. After Effects dodawał tempo i narrację, a pierwsze eksperymenty w Blenderze pozwalały osadzić markę w bardziej przestrzennym świecie.</p><div class="tool-list"><span>Illustrator</span><span>After Effects</span><span>Blender</span></div></div>
      <div class="tools-visual" data-story-reveal><img class="vector" data-story-src="/projects/hubble/hero-hubble.png" alt="Wektorowy świat HubbleRx"><img class="phones" data-story-src="/projects/hubble/story/mobile2.png" alt="Eksperyment 3D HubbleRx"></div>
    </div></section>`);

  result.classList.add('result-honest');
  result.id = 'wnioski';
  result.id = 'wnioski';
  futureSection.id = 'idea';
  document.querySelector('.membership-system').id = 'produkt';
  result.innerHTML = `<div class="container result-honest-grid" data-story-reveal><div class="result-honest-copy"><span class="label">${T('Wnioski','Takeaways')}</span><h2>Wartość była w eksploracji.</h2><p>HubbleRx nie został wdrożony, ale proces stworzył bogaty zestaw ilustracji, layoutów, animacji i eksperymentów 3D. Projekt stał się początkiem dłuższej współpracy z Decom Studios i ważnym etapem rozwoju mojego warsztatu — od jednej ilustracji do elastycznego języka marki.</p></div><div class="result-honest-badge"><img data-story-src="/projects/hubble/story/product-system/guarantee-30.svg" alt="30 days money back guarantee"></div><ul><li>Silniejszy warsztat ilustracyjny</li><li>Adaptacja stylu do kanału</li><li>Pierwsze komercyjne eksperymenty 3D</li><li>Proces oparty na prototypowaniu</li></ul></div>`;

  document.querySelectorAll('[data-story-src]').forEach(el => { el.src = storyBase + el.dataset.storySrc; });
  document.querySelectorAll('[data-story-video]').forEach(el => { el.src = storyBase + el.dataset.storyVideo; });
  const sceneSection = document.querySelector('.scene-build');
  const sceneCanvas = document.querySelector('.scene-canvas');
  const sceneLayers = Array.from(document.querySelectorAll('.scene-layer'));
  const sceneProgress = document.querySelector('.scene-progress i');
  const sceneFinish = document.querySelector('.scene-finish');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let sceneTicking = false;
  const updateScene = () => {
    if (!sceneSection || !sceneLayers.length) return;
    const rect = sceneSection.getBoundingClientRect();
    const distance = Math.max(1, sceneSection.offsetHeight - innerHeight);
    const raw = reduceMotion || innerWidth <= 620 ? 1 : Math.min(1, Math.max(0, -rect.top / distance));
    const eased = 1 - Math.pow(1 - raw, 3);
    const cw = sceneCanvas ? sceneCanvas.clientWidth : innerWidth;
    sceneLayers.forEach((layer, index) => {
      const side = index === 0 ? -1 : 1;
      const gap = 1 - eased;
      // layer is 59% wide -> resting offset of 20.5% lands each edge exactly on the container padding
      const rest = side * cw * .205;
      const x = rest + side * gap * cw * .5;
      const scale = .94 + eased * .06;
      layer.style.transform = `translateX(calc(-50% + ${x}px)) scale(${scale})`;
      layer.style.opacity = String(Math.min(1, .3 + eased * 1.7));
    });
    if (sceneProgress) sceneProgress.style.height = `${raw * 100}%`;
    if (sceneFinish) {
      const visible = Math.max(0, (raw - .78) / .22);
      sceneFinish.style.opacity = String(visible);
      sceneFinish.style.transform = `translateY(${(1-visible)*12}px)`;
    }
    sceneTicking = false;
  };
  const requestSceneUpdate = () => { if (!sceneTicking) { sceneTicking = true; requestAnimationFrame(updateScene); } };
  addEventListener('scroll', requestSceneUpdate, { passive: true });
  addEventListener('resize', requestSceneUpdate, { passive: true });
  updateScene();
  const webDepth = document.querySelector('.web-depth');
  const browserWrap = document.querySelector('.browser-3d-wrap');
  const browserScreen = document.querySelector('.browser-screen');
  const browserPage = document.querySelector('.browser-page');
  const webProgress = document.querySelector('.web-depth-progress i');
  const webSteps = Array.from(document.querySelectorAll('.web-depth-step'));
  let webTicking = false;
  const updateWebDepth = () => {
    if (!webDepth || !browserWrap || !browserScreen || !browserPage) return;
    const rect = webDepth.getBoundingClientRect();
    const distance = Math.max(1, webDepth.offsetHeight - innerHeight);
    const raw = reduceMotion || innerWidth <= 620 ? .35 : Math.min(1, Math.max(0, -rect.top / distance));
    const maxScroll = Math.max(0, browserPage.scrollHeight - browserScreen.clientHeight);
    browserPage.style.transform = `translateY(${-maxScroll * raw}px)`;
    if (innerWidth > 620) {
      const scale = 1;
      const rotateX = 4 - raw * 3;
      const rotateY = -9 + raw * 13;
      const rotateZ = 1.5 - raw * 2.5;
      browserWrap.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
    }
    if (webProgress) webProgress.style.height = `${raw * 100}%`;
    const activeStep = Math.min(webSteps.length - 1, Math.floor(raw * webSteps.length));
    webSteps.forEach((step, index) => step.classList.toggle('is-active', index === activeStep));
    webTicking = false;
  };
  const requestWebDepthUpdate = () => {
    if (webTicking) return;
    webTicking = true;
    requestAnimationFrame(updateWebDepth);
  };
  addEventListener('scroll', requestWebDepthUpdate, { passive: true });
  addEventListener('resize', requestWebDepthUpdate, { passive: true });
  if (browserPage) browserPage.addEventListener('load', requestWebDepthUpdate, { once: true });
  updateWebDepth();
  const membershipCards = Array.from(document.querySelectorAll('.membership-card'));
  // the drawer's peek animation needs its real content height, not a guessed max-height
  const measureDrawer = details => {
    const inner = details.querySelector('ul');
    if (inner) details.style.setProperty('--dh', inner.offsetHeight + 'px');
  };
  // reserve the tallest possible card height on the grid, so opening a drawer
  // (or the peek animation) never reflows the section
  const cardsGrid = document.querySelector('.membership-cards');
  const reserveHeight = () => {
    if (!cardsGrid) return;
    cardsGrid.style.minHeight = '';
    let tallest = 0;
    membershipCards.forEach(card => {
      const details = card.querySelector('.membership-card-details');
      const main = card.querySelector('.membership-card-main');
      const toggle = card.querySelector('.membership-toggle');
      if (!details || !main || !toggle) return;
      const wasHidden = details.hidden;
      if (wasHidden) details.hidden = false;
      const inner = details.querySelector('ul');
      const h = main.offsetHeight + (inner ? inner.offsetHeight : 0) + toggle.offsetHeight;
      if (wasHidden) details.hidden = true;
      if (h > tallest) tallest = h;
    });
    if (tallest) cardsGrid.style.minHeight = tallest + 'px';
  };
  const syncDrawers = () => {
    membershipCards.forEach(card => {
      const details = card.querySelector('.membership-card-details');
      if (details && card.classList.contains('is-open')) measureDrawer(details);
    });
    reserveHeight();
  };
  syncDrawers();
  addEventListener('resize', syncDrawers, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncDrawers);
  membershipCards.forEach(card => {
    const button = card.querySelector('.membership-toggle');
    const details = card.querySelector('.membership-card-details');
    if (!button || !details) return;
    button.addEventListener('click', () => {
      const willOpen = !card.classList.contains('is-open');
      membershipCards.forEach(other => {
        const otherButton = other.querySelector('.membership-toggle');
        const otherDetails = other.querySelector('.membership-card-details');
        other.classList.remove('is-open');
        if (otherButton) {
          otherButton.setAttribute('aria-expanded', 'false');
          otherButton.querySelector('span').textContent = T('Zobacz więcej', 'Learn more');
          otherButton.querySelector('i').textContent = '+';
        }
        if (otherDetails && other !== card) setTimeout(() => {
          if (!other.classList.contains('is-open')) otherDetails.hidden = true;
        }, 800);
      });
      if (willOpen) {
        details.hidden = false;
        measureDrawer(details);
        requestAnimationFrame(() => card.classList.add('is-open'));
        button.setAttribute('aria-expanded', 'true');
        button.querySelector('span').textContent = T('Zwiń', 'Close');
        button.querySelector('i').textContent = '−';
      } else {
        setTimeout(() => { if (!card.classList.contains('is-open')) details.hidden = true; }, 800);
      }
    });
  });
  // PARALLAX — phones drift vertically against the illustration as the Warsztat section passes.
  // Only --py is written, so the base translateX/scale in CSS (and its breakpoints) stay intact.
  const toolsSection = document.querySelector('.tools-story');
  const phones = document.querySelector('.tools-visual .phones');
  let toolsTicking = false;
  const updateTools = () => {
    toolsTicking = false;
    if (!toolsSection || !phones) return;
    if (reduceMotion || innerWidth <= 620) { phones.style.setProperty('--py', '0px'); return; }
    const rect = toolsSection.getBoundingClientRect();
    // 0 = section entering from below, 1 = fully left through the top
    const raw = (innerHeight - rect.top) / (innerHeight + rect.height);
    const p = Math.min(1, Math.max(0, raw));
    phones.style.setProperty('--py', `${(0.5 - p) * 230}px`);
  };
  const requestToolsUpdate = () => { if (!toolsTicking) { toolsTicking = true; requestAnimationFrame(updateTools); } };
  addEventListener('scroll', requestToolsUpdate, { passive: true });
  addEventListener('resize', requestToolsUpdate, { passive: true });
  updateTools();

  // NAV SCROLL-SPY — the .is-active style already existed in CSS, but nothing ever applied it,
  // so the current stage was never highlighted. This wires it up.
  const navTargets = Array.from(document.querySelectorAll('.case-nav a[href^="#"]'))
    .map(link => ({ link, section: document.getElementById(link.getAttribute('href').slice(1)) }))
    .filter(t => t.section);
  let navTicking = false;
  const updateNav = () => {
    navTicking = false;
    if (!navTargets.length) return;
    const line = innerHeight * .34;
    let current = null;
    navTargets.forEach(t => { if (t.section.getBoundingClientRect().top <= line) current = t; });
    navTargets.forEach(t => t.link.classList.toggle('is-active', t === current));
  };
  const requestNavUpdate = () => { if (!navTicking) { navTicking = true; requestAnimationFrame(updateNav); } };
  addEventListener('scroll', requestNavUpdate, { passive: true });
  addEventListener('resize', requestNavUpdate, { passive: true });
  updateNav();

  const storyObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('on');
    const video = entry.target.matches('video') ? entry.target : entry.target.querySelector('video');
    if (video) video.play().catch(() => {});
    storyObserver.unobserve(entry.target);
  }), { threshold: .08 });
  document.querySelectorAll('[data-story-reveal]').forEach(el => storyObserver.observe(el));
})();
