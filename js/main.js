/* ===================================================================
 * Hudson 1.0.0 - Main JS
 * WERSJA LOKALNA - NAJBARDZIEJ AKTUALNA
 *
 * ------------------------------------------------------------------- */

(function(html) {

    'use strict';


   /* preloader
    * -------------------------------------------------- */
    const ssPreloader = function() {

        const siteBody = document.querySelector('body');
        const preloader = document.querySelector('#preloader');
        if (!preloader) return;

        html.classList.add('ss-preload');
        
        let preloaderHidden = false;
        
        const hidePreloader = function() {
            if (preloaderHidden) return;
            preloaderHidden = true;
            
            html.classList.remove('ss-preload');
            html.classList.add('ss-loaded');
            
            preloader.addEventListener('transitionend', function afterTransition(e) {
                if (e.target.matches('#preloader'))  {
                    siteBody.classList.add('ss-show');
                    e.target.style.display = 'none';
                    preloader.removeEventListener(e.type, afterTransition);
                }
            });
            
            // Backup: ukryj preloader po 1 sekundzie nawet jeśli transitionend nie zadziała
            setTimeout(function() {
                if (preloader.style.display !== 'none') {
                    siteBody.classList.add('ss-show');
                    preloader.style.display = 'none';
                }
            }, 1000);
        };
        
        // Ukryj preloader gdy DOM jest gotowy (szybsze niż window.load)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', hidePreloader);
        } else {
            // DOM już gotowy
            hidePreloader();
        }
        
        // Maksymalny czas oczekiwania - 2 sekundy
        setTimeout(hidePreloader, 2000);

    }; // end ssPreloader


   /* move header
    * -------------------------------------------------- */
    const ssMoveHeader = function () {

        const hdr = document.querySelector('.s-header');
        const hero = document.querySelector('#intro');
        let triggerHeight;
        let isMobile = window.innerWidth <= 900;

        if (!(hdr && hero)) return;

        setTimeout(function() {
            triggerHeight = hero.offsetHeight - 170;
        }, 300);

        // Sprawdź czy to urządzenie mobilne przy zmianie rozmiaru okna
        window.addEventListener('resize', function() {
            isMobile = window.innerWidth <= 900;
        });

        window.addEventListener('scroll', function () {

            let loc = window.scrollY;

            // Na urządzeniach mobilnych - jedna stała wersja paska (bez zmian)
            if (isMobile) {
                // Na mobile pasek jest zawsze w tej samej pozycji - bez klas sticky/scrolling/offset
                return;
            }

            // Logika dla desktop - z pełnymi animacjami
            if (loc > triggerHeight) {
                hdr.classList.add('sticky');
            } else {
                hdr.classList.remove('sticky');
            }

            if (loc > triggerHeight + 20) {
                hdr.classList.add('offset');
            } else {
                hdr.classList.remove('offset');
            }

            if (loc > triggerHeight + 150) {
                hdr.classList.add('scrolling');
            } else {
                hdr.classList.remove('scrolling');
            }

        });

    }; // end ssMoveHeader


   /* mobile menu
    * ---------------------------------------------------- */ 
    const ssMobileMenu = function() {

        const toggleButton = document.querySelector('.s-header__menu-toggle');
        const mainNavWrap = document.querySelector('.s-header__nav');
        const siteBody = document.querySelector('body');

        if (!(toggleButton && mainNavWrap)) return;

        toggleButton.addEventListener('click', function(e) {
            e.preventDefault();
            toggleButton.classList.toggle('is-clicked');
            siteBody.classList.toggle('menu-is-open');
        });

        mainNavWrap.querySelectorAll('.s-header__nav a').forEach(function(link) {

            link.addEventListener("click", function(event) {

                // at 900px and below
                if (window.matchMedia('(max-width: 900px)').matches) {
                    toggleButton.classList.toggle('is-clicked');
                    siteBody.classList.toggle('menu-is-open');
                }
            });
        });

        window.addEventListener('resize', function() {

            // above 900px
            if (window.matchMedia('(min-width: 901px)').matches) {
                if (siteBody.classList.contains('menu-is-open')) siteBody.classList.remove('menu-is-open');
                if (toggleButton.classList.contains('is-clicked')) toggleButton.classList.remove('is-clicked');
            }
        });

    }; // end ssMobileMenu


   /* highlight active menu link on pagescroll
    * ------------------------------------------------------ */
    const ssScrollSpy = function() {

        const sections = document.querySelectorAll('.target-section');
        if (!sections) return;

        // Add an event listener listening for scroll
        window.addEventListener('scroll', navHighlight);

        function navHighlight() {
        
            // Get current scroll position
            let scrollY = window.pageYOffset;
        
            // Loop through sections to get height(including padding and border), 
            // top and ID values for each
            sections.forEach(function(current) {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 50;
                const sectionId = current.getAttribute('id');
            
               /* If our current scroll position enters the space where current section 
                * on screen is, add .current class to parent element(li) of the thecorresponding 
                * navigation link, else remove it. To know which link is active, we use 
                * sectionId variable we are getting while looping through sections as 
                * an selector
                */
                const navLink = document.querySelector('.s-header__nav a[href*=' + sectionId + ']');
                if (navLink) {
                    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                        navLink.parentNode.classList.add('current');
                    } else {
                        navLink.parentNode.classList.remove('current');
                    }
                }
            });
        }

    }; // end ssScrollSpy


   /* glightbox
    * ------------------------------------------------------ */ 
    const ssGLightbox = function() {

        // Znajdź wszystkie galerie według data-gallery
        const galleriesData = {};
        const allGlightboxElements = document.querySelectorAll('.glightbox');
        
        allGlightboxElements.forEach(element => {
            const galleryName = element.getAttribute('data-gallery');
            if (galleryName) {
                if (!galleriesData[galleryName]) {
                    galleriesData[galleryName] = {
                        elements: [],
                        triggers: []
                    };
                }
                
                // Przygotuj dane dla GLightbox
                const href = element.getAttribute('href');
                const glightboxData = element.getAttribute('data-glightbox');
                
                // Parsuj data-glightbox
                let title = '';
                let description = '';
                
                if (glightboxData) {
                    const titleMatch = glightboxData.match(/title:\s*([^;]+)/);
                    const descMatch = glightboxData.match(/description:\s*([^;]+)/);
                    
                    // Tytuł jest ustawiony jako pusty string - bez hover tooltips
                    if (titleMatch) title = '';
                    if (descMatch) {
                        const descClass = descMatch[1].trim();
                        const descElement = document.querySelector(descClass);
                        if (descElement) {
                            description = descElement.innerHTML;
                        }
                    }
                }
                
                galleriesData[galleryName].elements.push({
                    href: href,
                    type: 'image',
                    title: '', // Bez tytułu w hover
                    description: description
                });
                
                galleriesData[galleryName].triggers.push(element);
            }
        });

        // Inicjalizuj osobny GLightbox dla każdej galerii
        const lightboxInstances = {};
        
        Object.keys(galleriesData).forEach(galleryName => {
            const galleryInfo = galleriesData[galleryName];
            
            // Utwórz instancję GLightbox
            const lightbox = GLightbox({
                elements: galleryInfo.elements,
                zoomable: false,
                touchNavigation: true,
                loop: false,
                autoplayVideos: true,
                slideEffect: 'slide',
                moreLength: 0, // Wyłącz skracanie opisów
                svg: {
                    close: '<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z"/></svg>',
                    prev: '<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z" fill-rule="nonzero"/></svg>',
                    next: '<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m14.523 18.787s4.501-4.505 6.255-6.26c.146-.146.219-.338.219-.53s-.073-.383-.219-.53c-1.753-1.754-6.255-6.258-6.255-6.258-.144-.145-.334-.217-.524-.217-.193 0-.385.074-.532.221-.293.292-.295.766-.004 1.056l4.978 4.978h-14.692c-.414 0-.75.336-.75.75s.336.75.75.75h14.692l-4.979 4.979c-.289.289-.286.762.006 1.054.148.148.341.222.533.222.19 0 .378-.072.522-.215z" fill-rule="nonzero"/></svg>'
                }
            });
            
            // Funkcja wymuszająca widoczność strzałek
            const forceArrowsVisible = () => {
                const prevBtn = document.querySelector('.glightbox-container .gprev');
                const nextBtn = document.querySelector('.glightbox-container .gnext');
                const isMobile = window.innerWidth <= 768;
                
                // Responsywne rozmiary
                const size = isMobile ? '35px' : '45px';
                const padding = isMobile ? '15px' : '0px';
                
                if (prevBtn) {
                    // Mobile: niewidoczne tło + padding dla większego obszaru klikalności
                    // Desktop: normalne tło
                    if (isMobile) {
                        prevBtn.style.cssText = `position: absolute !important; display: flex !important; visibility: visible !important; top: 50% !important; left: 15px !important; transform: translateY(-50%) !important; z-index: 99999 !important; width: ${size} !important; height: ${size} !important; padding: ${padding} !important; background: transparent !important; border: none !important; outline: none !important; box-shadow: none !important; border-radius: 50% !important; align-items: center !important; justify-content: center !important; box-sizing: content-box !important;`;
                    } else {
                        prevBtn.style.cssText = `position: absolute !important; display: flex !important; visibility: visible !important; opacity: 1 !important; top: 50% !important; left: 15px !important; transform: translateY(-50%) !important; z-index: 99999 !important; width: ${size} !important; height: ${size} !important; background-color: rgba(0, 0, 0, 0.32) !important; border-radius: 50% !important; align-items: center !important; justify-content: center !important; transition: all 0.3s ease !important;`;
                    }
                    console.log('✅ Wymuszono widoczność przycisku PREV (mobile:', isMobile, ')');
                }
                if (nextBtn) {
                    if (isMobile) {
                        nextBtn.style.cssText = `position: absolute !important; display: flex !important; visibility: visible !important; top: 50% !important; right: 15px !important; transform: translateY(-50%) !important; z-index: 99999 !important; width: ${size} !important; height: ${size} !important; padding: ${padding} !important; background: transparent !important; border: none !important; outline: none !important; box-shadow: none !important; border-radius: 50% !important; align-items: center !important; justify-content: center !important; box-sizing: content-box !important;`;
                    } else {
                        nextBtn.style.cssText = `position: absolute !important; display: flex !important; visibility: visible !important; opacity: 1 !important; top: 50% !important; right: 15px !important; transform: translateY(-50%) !important; z-index: 99999 !important; width: ${size} !important; height: ${size} !important; background-color: rgba(0, 0, 0, 0.32) !important; border-radius: 50% !important; align-items: center !important; justify-content: center !important; transition: all 0.3s ease !important;`;
                    }
                    console.log('✅ Wymuszono widoczność przycisku NEXT (mobile:', isMobile, ')');
                }
            };
            
            // Funkcja sprawdzająca stan strzałek (disabled na krańcach)
            const checkArrowsState = () => {
                const prevBtn = document.querySelector('.glightbox-container .gprev');
                const nextBtn = document.querySelector('.glightbox-container .gnext');
                const slides = document.querySelectorAll('.gslide');
                const activeSlide = document.querySelector('.gslide.current');
                
                if (slides.length > 0 && activeSlide && (prevBtn || nextBtn)) {
                    const currentIndex = Array.from(slides).indexOf(activeSlide);
                    
                    // Lewa strzałka - disabled na pierwszym slajdzie
                    if (prevBtn) {
                        if (currentIndex === 0) {
                            prevBtn.classList.add('disabled');
                        } else {
                            prevBtn.classList.remove('disabled');
                        }
                    }
                    
                    // Prawa strzałka - disabled na ostatnim slajdzie
                    if (nextBtn) {
                        if (currentIndex === slides.length - 1) {
                            nextBtn.classList.add('disabled');
                        } else {
                            nextBtn.classList.remove('disabled');
                        }
                    }
                }
            };
            
            // Wymuszenie widoczności strzałek po otwarciu galerii
            lightbox.on('open', () => {
                setTimeout(forceArrowsVisible, 50);
                setTimeout(forceArrowsVisible, 200);
                setTimeout(forceArrowsVisible, 500);
                
                // Sprawdź stan strzałek przy otwarciu
                setTimeout(checkArrowsState, 150);
                
                // Interwał wymuszający widoczność podczas otwartej galerii
                const intervalId = setInterval(forceArrowsVisible, 300);
                
                // Aktualizuj przy zmianie rozmiaru okna (np. obrót telefonu)
                const resizeHandler = () => {
                    forceArrowsVisible();
                };
                window.addEventListener('resize', resizeHandler);
                
                // Wyczyść interwał i event listener po zamknięciu
                lightbox.on('close', () => {
                    clearInterval(intervalId);
                    window.removeEventListener('resize', resizeHandler);
                });
            });
            
            // Wymuszenie po zmianie slajdu
            lightbox.on('slide_changed', () => {
                setTimeout(forceArrowsVisible, 50);
                setTimeout(checkArrowsState, 100); // Sprawdź stan strzałek po zmianie slajdu
            });
            
            lightboxInstances[galleryName] = lightbox;
            
            // Dodaj obsługę kliknięć dla wszystkich triggerów tej galerii
            galleryInfo.triggers.forEach((trigger, index) => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    trigger.blur(); // Usuń focus z linku przed otwarciem galerii
                    console.log(`🖼️ Otwieranie galerii "${galleryName}" od zdjęcia ${index}`);
                    console.log(`📸 Zdjęcia w galerii:`, galleryInfo.elements.map(el => el.href));
                    lightbox.openAt(index);
                });
            });
            
            console.log(`✅ Galeria "${galleryName}" - ${galleryInfo.elements.length} zdjęć`);
        });

        console.log(`✅ Zainicjalizowano ${Object.keys(lightboxInstances).length} niezależnych galerii`);
        
        // Usuń wszystkie atrybuty title z linków galerii (natywne tooltips przeglądarki)
        const removeTooltips = () => {
            allGlightboxElements.forEach(element => {
                // Usuń title z samego linku
                if (element.hasAttribute('title')) {
                    element.removeAttribute('title');
                }
                
                // Usuń title ze wszystkich elementów potomnych (np. div, h4, img, span)
                const childElements = element.querySelectorAll('*');
                childElements.forEach(child => {
                    if (child.hasAttribute('title')) {
                        child.removeAttribute('title');
                    }
                });
                
                // Dodatkowo ustaw pusty title na kluczowych elementach
                const titleElements = element.querySelectorAll('.entry__title, .entry__cat, .entry__info');
                titleElements.forEach(el => {
                    el.setAttribute('title', '');
                });
            });
        };
        
        // Usuń title na start
        removeTooltips();
        
        // Usuń title również po najechaniu myszką (zapobieganie dynamicznemu dodawaniu)
        allGlightboxElements.forEach(element => {
            element.addEventListener('mouseenter', removeTooltips);
            element.addEventListener('focus', removeTooltips);
            
            // Także dla wszystkich potomków
            element.querySelectorAll('*').forEach(child => {
                child.addEventListener('mouseenter', removeTooltips);
                child.addEventListener('focus', removeTooltips);
            });
        });
        
        // MutationObserver - monitoruj i usuwaj atrybut title jeśli zostanie dodany
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
                    const target = mutation.target;
                    if (target.hasAttribute('title')) {
                        target.removeAttribute('title');
                    }
                }
            });
        });
        
        // Obserwuj każdy element galerii i wszystkie jego potomki
        allGlightboxElements.forEach(element => {
            observer.observe(element, {
                attributes: true,
                attributeFilter: ['title']
            });
            
            // Obserwuj także wszystkie elementy potomne
            element.querySelectorAll('*').forEach(child => {
                observer.observe(child, {
                    attributes: true,
                    attributeFilter: ['title']
                });
            });
        });
        
        console.log('✅ Usunięto natywne tooltips (title) z elementów galerii i ich potomków + aktywny monitoring');
        
        // Usuń tytuły z atrybutów data-glightbox (zapobiega tworzeniu tooltipów przez GLightbox)
        allGlightboxElements.forEach(element => {
            const dataGlightbox = element.getAttribute('data-glightbox');
            if (dataGlightbox && dataGlightbox.includes('title:')) {
                // Zamień "title: Jakaś nazwa" na "title: " (pusty)
                const modifiedData = dataGlightbox.replace(/title:\s*[^;]+/g, 'title: ');
                element.setAttribute('data-glightbox', modifiedData);
                console.log('🔧 Usunięto tytuł z data-glightbox:', element.href);
            }
        });
        
        // Dodatkowa warstwa ochrony - regularnie sprawdzaj i usuwaj tooltips
        setInterval(() => {
            allGlightboxElements.forEach(element => {
                if (element.hasAttribute('title')) {
                    element.removeAttribute('title');
                }
                element.querySelectorAll('*').forEach(child => {
                    if (child.hasAttribute('title')) {
                        child.removeAttribute('title');
                    }
                });
            });
        }, 500); // Co pół sekundy

    } // end ssGLightbox


   /* swiper
    * ------------------------------------------------------ */ 
    const ssSwiper = function() {

        const testimonialsSwiper = new Swiper('.s-testimonials__slider', {

            slidesPerView: 1,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                // when window width is > 400px
                401: {
                    slidesPerView: 1,
                    spaceBetween: 20
                },
                // when window width is > 800px
                801: {
                    slidesPerView: 2,
                    spaceBetween: 50
                },
                // when window width is > 1180px
                1181: {
                    slidesPerView: 3,
                    spaceBetween: 48
                }
            }
        });

    }; // end ssSwiper


   /* alert boxes
    * ------------------------------------------------------ */
    const ssAlertBoxes = function() {

        const boxes = document.querySelectorAll('.alert-box');
  
        boxes.forEach(function(box){

            box.addEventListener('click', function(e) {
                if (e.target.matches('.alert-box__close')) {
                    e.stopPropagation();
                    e.target.parentElement.classList.add('hideit');

                    setTimeout(function() {
                        box.style.display = 'none';
                    }, 500)
                }
            });
        })

    }; // end ssAlertBoxes


    /* Back to Top
    * ------------------------------------------------------ */
    const ssBackToTop = function() {

        const pxShow = 900;
        const goTopButton = document.querySelector(".ss-go-top");

        if (!goTopButton) return;

        // Show or hide the button
        if (window.scrollY >= pxShow) goTopButton.classList.add("link-is-visible");

        window.addEventListener('scroll', function() {
            if (window.scrollY >= pxShow) {
                if(!goTopButton.classList.contains('link-is-visible')) goTopButton.classList.add("link-is-visible")
            } else {
                goTopButton.classList.remove("link-is-visible")
            }
        });

    }; // end ssBackToTop


   /* smoothscroll
    * ------------------------------------------------------ */
    const ssMoveTo = function() {

        const easeFunctions = {
            easeInQuad: function (t, b, c, d) {
                t /= d;
                return c * t * t + b;
            },
            easeOutQuad: function (t, b, c, d) {
                t /= d;
                return -c * t* (t - 2) + b;
            },
            easeInOutQuad: function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            },
            easeInOutCubic: function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t*t + b;
                t -= 2;
                return c/2*(t*t*t + 2) + b;
            }
        }

        const triggers = document.querySelectorAll('.smoothscroll');
        
        const moveTo = new MoveTo({
            tolerance: 0,
            duration: 1200,
            easing: 'easeInOutCubic',
            container: window
        }, easeFunctions);

        triggers.forEach(function(trigger) {
            moveTo.registerTrigger(trigger);
        });

    }; // end ssMoveTo


   /* Animated Image Section on Scroll
    * ------------------------------------------------------ */
    const ssAnimatedImage = function() {

        const animatedSection = document.querySelector('.s-animated-image');
        if (!animatedSection) return;

        // Sprawdź czy animacja już się odbyła
        if (animatedSection.dataset.animated === 'true') {
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1 // Animacja uruchomi się gdy 10% sekcji jest widoczne
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Dodaj klasę is-visible z małym opóźnieniem dla płynności
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                        // Oznacz animację jako zakończoną
                        entry.target.dataset.animated = 'true';
                        // Usuń observer - animacja już się nie powtórzy
                        observer.unobserve(entry.target);
                    }, 100);
                }
            });
        }, observerOptions);

        observer.observe(animatedSection);

        // Sprawdź stan początkowy po załadowaniu strony
        window.addEventListener('load', function() {
            const rect = animatedSection.getBoundingClientRect();
            const isVisible = (
                rect.top >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
            ) || (
                rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
            
            if (isVisible) {
                setTimeout(() => {
                    animatedSection.classList.add('is-visible');
                    // Oznacz animację jako zakończoną
                    animatedSection.dataset.animated = 'true';
                    // Usuń observer
                    observer.unobserve(animatedSection);
                }, 300);
            }
        });

    }; // end ssAnimatedImage



    /* Animated Image Slider with Swipe
     * ------------------------------------------------------ */
    const ssAnimatedSlider = function() {

        const slider = document.querySelector('.animated-slider');
        if (!slider) {
            return;
        }
        
        // Sprawdź czy animacja już się odbyła
        if (slider.dataset.animated === 'true') {
            return;
        }
        

        const slides = document.querySelectorAll('.animated-slide');
        const dots = document.querySelectorAll('.slider-dot[data-slide]'); // Tylko kropki ze slajdami
        let currentSlide = 1; // Zaczynamy od slajdu 1 (aura1)
        let startX = 0;
        let currentX = 0;
        let isDragging = false;


        // Ustaw pozycję początkową (slajd 1)
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Funkcja zmiany slajdu
        function goToSlide(slideIndex) {
            if (slideIndex < 0 || slideIndex >= slides.length) {
                return;
            }
            
            
            currentSlide = slideIndex;
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Aktualizuj wskaźniki - tylko kropki zdjęć
            dots.forEach((dot) => {
                const dotSlide = parseInt(dot.dataset.slide);
                dot.classList.toggle('active', dotSlide === currentSlide);
            });
            
            // Aktualizuj klasy active na slajdach
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentSlide);
            });
        }
        
        // Funkcja nawigacji z obsługą paneli na krańcach
        function navigateLeft() {
            console.log('⬅️ Navigate LEFT - current slide:', currentSlide);
            
            // Jeśli jesteśmy na pierwszym slajdzie - wywołaj trigger dla lewego panelu
            if (currentSlide === 0) {
                console.log('🔵 At first slide - triggering left panel');
                // Symuluj kliknięcie lewej niebieskiej kropki
                if (window.triggerLeftPanel) {
                    window.triggerLeftPanel();
                }
                return;
            }
            
            // Przejdź do poprzedniego slajdu
            goToSlide(currentSlide - 1);
        }
        
        function navigateRight() {
            console.log('➡️ Navigate RIGHT - current slide:', currentSlide);
            
            // Jeśli jesteśmy na ostatnim slajdzie - wywołaj trigger dla kropki prawego panelu
            if (currentSlide === slides.length - 1) {
                console.log('🔵 At last slide - triggering right panel');
                // Symuluj kliknięcie prawej niebieskiej kropki
                if (window.triggerRightPanel) {
                    window.triggerRightPanel();
                }
                return;
            }
            
            // Przejdź do następnego slajdu
            goToSlide(currentSlide + 1);
        }

        // Touch events
        let touchStartTime = 0;
        
        slider.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            touchStartTime = Date.now();
            isDragging = true;
            slider.style.transition = 'none';
        }, { passive: true });

        slider.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            
            // Zablokuj przesuwanie na krańcach
            if ((currentSlide === 0 && diffX > 0) || 
                (currentSlide === slides.length - 1 && diffX < 0)) {
                return; // Nie pozwól na przesuwanie poza granice
            }
            
            const currentTranslate = -currentSlide * 100;
            const movePercent = (diffX / slider.offsetWidth) * 100;
            
            slider.style.transform = `translateX(${currentTranslate + movePercent}%)`;
        }, { passive: true });

        slider.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            
            isDragging = false;
            slider.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            const diffX = currentX - startX;
            const threshold = slider.offsetWidth * 0.2; // 20% szerokości
            const touchDuration = Date.now() - touchStartTime;
            const openPanel = window.getOpenPanel ? window.getOpenPanel() : null;
            
            // Sprawdź czy to był tap (szybki dotyk bez przesunięcia)
            const isTap = touchDuration < 300 && Math.abs(diffX) < 10;
            
            if (isTap) {
                // To był tap - obsłuż jako kliknięcie
                const touch = e.changedTouches[0];
                const rect = slider.getBoundingClientRect();
                const tapX = touch.clientX - rect.left;
                const sliderWidth = rect.width;
                const tapPercent = (tapX / sliderWidth) * 100;
                
                console.log('👆 Slider tapped at', tapPercent.toFixed(1) + '%');
                
                if (tapPercent < 50) {
                    // Lewa połowa - idź w lewo
                    console.log('   ⬅️ Left side tapped');
                    if (openPanel === 'right') {
                        console.log('   Closing right panel');
                        if (window.triggerRightPanel) window.triggerRightPanel();
                    } else {
                        navigateLeft();
                    }
                } else {
                    // Prawa połowa - idź w prawo
                    console.log('   ➡️ Right side tapped');
                    if (openPanel === 'left') {
                        console.log('   Closing left panel');
                        if (window.triggerLeftPanel) window.triggerLeftPanel();
                    } else {
                        navigateRight();
                    }
                }
            } else if (Math.abs(diffX) > threshold) {
                // To był swipe
                if (diffX > 0) {
                    // Swipe w prawo
                    console.log('👆 Swipe RIGHT detected, openPanel:', openPanel);
                    
                    // Jeśli prawy panel jest otwarty, zamknij go
                    if (openPanel === 'right') {
                        console.log('⬅️ Closing right panel with swipe');
                        if (window.triggerRightPanel) window.triggerRightPanel();
                    } else {
                        navigateLeft();
                    }
                } else {
                    // Swipe w lewo
                    console.log('👆 Swipe LEFT detected, openPanel:', openPanel);
                    
                    // Jeśli lewy panel jest otwarty, zamknij go
                    if (openPanel === 'left') {
                        console.log('➡️ Closing left panel with swipe');
                        if (window.triggerLeftPanel) window.triggerLeftPanel();
                    } else {
                        navigateRight();
                    }
                }
            } else {
                // Małe przesunięcie - przywróć pozycję
                goToSlide(currentSlide);
            }
            
            startX = 0;
            currentX = 0;
        }, { passive: true });

        // Mouse events dla desktop
        slider.addEventListener('mousedown', function(e) {
            startX = e.clientX;
            isDragging = true;
            slider.style.transition = 'none';
            slider.style.cursor = 'grabbing';
        });

        slider.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            currentX = e.clientX;
            const diffX = currentX - startX;
            
            // Zablokuj przesuwanie na krańcach
            if ((currentSlide === 0 && diffX > 0) || 
                (currentSlide === slides.length - 1 && diffX < 0)) {
                return; // Nie pozwól na przesuwanie poza granice
            }
            
            const currentTranslate = -currentSlide * 100;
            const movePercent = (diffX / slider.offsetWidth) * 100;
            
            slider.style.transform = `translateX(${currentTranslate + movePercent}%)`;
            
            e.preventDefault();
        });

        slider.addEventListener('mouseup', function(e) {
            if (!isDragging) return;
            
            isDragging = false;
            slider.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            slider.style.cursor = 'grab';
            
            const diffX = currentX - startX;
            const threshold = slider.offsetWidth * 0.2;
            const openPanel = window.getOpenPanel ? window.getOpenPanel() : null;
            
            console.log('🖱️ Mouse up - diffX:', diffX, 'threshold:', threshold);
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // Drag w prawo
                    console.log('🖱️ Mouse drag RIGHT detected, openPanel:', openPanel);
                    
                    // Jeśli prawy panel jest otwarty, zamknij go
                    if (openPanel === 'right') {
                        console.log('⬅️ Closing right panel with drag');
                        if (window.triggerRightPanel) window.triggerRightPanel();
                    } else {
                        navigateLeft();
                    }
                } else {
                    // Drag w lewo
                    console.log('🖱️ Mouse drag LEFT detected, openPanel:', openPanel);
                    
                    // Jeśli lewy panel jest otwarty, zamknij go
                    if (openPanel === 'left') {
                        console.log('➡️ Closing left panel with drag');
                        if (window.triggerLeftPanel) window.triggerLeftPanel();
                    } else {
                        navigateRight();
                    }
                }
            } else {
                // Małe przesunięcie - przywróć pozycję (kliknięcie będzie obsłużone przez event listener 'click')
                goToSlide(currentSlide);
            }
            
            startX = 0;
            currentX = 0;
        });

        slider.addEventListener('mouseleave', function() {
            if (isDragging) {
                isDragging = false;
                slider.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                slider.style.cursor = 'grab';
                goToSlide(currentSlide);
            }
        });

        // Kliknięcie na wskaźniki (tylko kropki zdjęć, bez paneli)
        dots.forEach((dot) => {
            const slideIndex = parseInt(dot.dataset.slide);
            if (!isNaN(slideIndex)) {
                dot.addEventListener('click', () => {
                    console.log('📷 Dot clicked, going to slide:', slideIndex);
                    goToSlide(slideIndex);
                });
            }
        });

        // Dedykowana obsługa kliknięć na slider - lewa strona = poprzedni, prawa = następny
        let clickStartX = 0;
        let clickStartTime = 0;
        
        slider.addEventListener('mousedown', function(e) {
            clickStartX = e.clientX;
            clickStartTime = Date.now();
        }, { passive: true });
        
        slider.addEventListener('click', function(e) {
            const clickEndTime = Date.now();
            const clickDuration = clickEndTime - clickStartTime;
            const moveDistance = Math.abs(e.clientX - clickStartX);
            
            // Sprawdź czy to było rzeczywiste kliknięcie (a nie przeciąganie)
            // Kliknięcie: krótki czas (<300ms) i małe przesunięcie (<10px)
            if (clickDuration < 300 && moveDistance < 10) {
                const rect = slider.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const sliderWidth = rect.width;
                const clickPercent = (clickX / sliderWidth) * 100;
                
                console.log('🖱️ Slider clicked at', clickPercent.toFixed(1) + '%');
                
                const openPanel = window.getOpenPanel ? window.getOpenPanel() : null;
                
                if (clickPercent < 50) {
                    // Lewa połowa - idź w lewo
                    console.log('   ⬅️ Left side clicked');
                    if (openPanel === 'right') {
                        console.log('   Closing right panel');
                        if (window.triggerRightPanel) window.triggerRightPanel();
                    } else {
                        navigateLeft();
                    }
                } else {
                    // Prawa połowa - idź w prawo
                    console.log('   ➡️ Right side clicked');
                    if (openPanel === 'left') {
                        console.log('   Closing left panel');
                        if (window.triggerLeftPanel) window.triggerLeftPanel();
                    } else {
                        navigateRight();
                    }
                }
            }
        });

        // Obsługa klawiszy strzałek na klawiaturze - zatrzymuje się na krańcach + otwiera panele
        document.addEventListener('keydown', function(e) {
            const openPanel = window.getOpenPanel ? window.getOpenPanel() : null;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                console.log('⌨️ Keyboard: Arrow Left pressed, openPanel:', openPanel);
                
                // Jeśli prawy panel jest otwarty, zamknij go
                if (openPanel === 'right') {
                    console.log('⬅️ Closing right panel with left arrow');
                    if (window.triggerRightPanel) window.triggerRightPanel();
                    return;
                }
                
                // Jeśli lewy panel jest otwarty, ignoruj (nie można iść dalej w lewo)
                if (openPanel === 'left') {
                    console.log('🛑 Left panel is open - cannot go further left');
                    return;
                }
                
                // Normalna nawigacja (może otworzyć panel na pierwszym slajdzie)
                navigateLeft();
                
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                console.log('⌨️ Keyboard: Arrow Right pressed, openPanel:', openPanel);
                
                // Jeśli lewy panel jest otwarty, zamknij go
                if (openPanel === 'left') {
                    console.log('➡️ Closing left panel with right arrow');
                    if (window.triggerLeftPanel) window.triggerLeftPanel();
                    return;
                }
                
                // Jeśli prawy panel jest otwarty, ignoruj (nie można iść dalej w prawo)
                if (openPanel === 'right') {
                    console.log('🛑 Right panel is open - cannot go further right');
                    return;
                }
                
                // Normalna nawigacja (może otworzyć panel na ostatnim slajdzie)
                navigateRight();
            }
        });

        // Ustaw kursor
        slider.style.cursor = 'grab';
        
        // Oznacz animację jako zakończoną
        slider.dataset.animated = 'true';

    }; // end ssAnimatedSlider


    /* Mobile Touch Fixes
     * -------------------------------------------------- */
    const ssMobileTouchFixes = function() {
        
        // Minimalistyczne zabezpieczenia - tylko dla specyficznych przypadków
        // Większość obsługi jest w poszczególnych sliderach
        
        console.log('Mobile touch fixes initialized (lightweight mode)');
    };

    /* pinch-to-zoom dla slajderów na mobile
     * -------------------------------------------------- */
    const ssPinchToZoom = function() {
        
        const slides = document.querySelectorAll('.animated-slide');
        if (!slides.length) return;

        slides.forEach(slide => {
            let initialDistance = 0;
            let currentScale = 1;
            let isZoomed = false;

            // Obsługa gestów dotykowych
            slide.addEventListener('touchstart', function(e) {
                if (e.touches.length === 2) {
                    // Oblicz odległość między dwoma palcami
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    initialDistance = Math.sqrt(
                        Math.pow(touch2.clientX - touch1.clientX, 2) + 
                        Math.pow(touch2.clientY - touch1.clientY, 2)
                    );
                }
            });

            slide.addEventListener('touchmove', function(e) {
                if (e.touches.length === 2) {
                    e.preventDefault(); // Zapobiegaj domyślnemu zachowaniu
                    
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const currentDistance = Math.sqrt(
                        Math.pow(touch2.clientX - touch1.clientX, 2) + 
                        Math.pow(touch2.clientY - touch1.clientY, 2)
                    );
                    
                    if (initialDistance > 0) {
                        const scale = currentDistance / initialDistance;
                        currentScale = Math.max(1, Math.min(3, scale)); // Ogranicz do 3x
                        
                        const img = slide.querySelector('img');
                        if (img) {
                            img.style.transform = `scale(${currentScale})`;
                        }
                    }
                }
            });

            slide.addEventListener('touchend', function(e) {
                if (e.touches.length === 0) {
                    // Sprawdź czy użytkownik wykonał pinch-to-zoom
                    if (currentScale > 1.2) {
                        slide.classList.add('zoomed');
                        isZoomed = true;
                    } else if (currentScale < 0.8) {
                        slide.classList.remove('zoomed');
                        isZoomed = false;
                        currentScale = 1;
                        const img = slide.querySelector('img');
                        if (img) {
                            img.style.transform = 'scale(1)';
                        }
                    }
                }
            });

            // Podwójne dotknięcie dla zoom
            slide.addEventListener('touchend', function(e) {
                if (e.touches.length === 0 && e.changedTouches.length === 1) {
                    const touch = e.changedTouches[0];
                    const now = new Date().getTime();
                    
                    if (now - (slide.lastTouchEnd || 0) <= 300) {
                        // Podwójne dotknięcie
                        if (isZoomed) {
                            slide.classList.remove('zoomed');
                            isZoomed = false;
                            currentScale = 1;
                            const img = slide.querySelector('img');
                            if (img) {
                                img.style.transform = 'scale(1)';
                            }
                        } else {
                            slide.classList.add('zoomed');
                            isZoomed = true;
                            currentScale = 2;
                            const img = slide.querySelector('img');
                            if (img) {
                                img.style.transform = 'scale(2)';
                            }
                        }
                    }
                    slide.lastTouchEnd = now;
                }
            });
        });
    };

    /* Glassmorphism Slider
     * -------------------------------------------------- */
    const ssGlassmorphismSlider = function() {
        
        const leftSlide = document.querySelector('.glassmorphism-slide--left');
        const rightSlide = document.querySelector('.glassmorphism-slide--right');
        const animatedSlider = document.querySelector('.animated-slider');
        const leftPanelDot = document.querySelector('.slider-dot--panel-left');
        const rightPanelDot = document.querySelector('.slider-dot--panel-right');
        const slides = document.querySelectorAll('.animated-slide');
        
        console.log('Glassmorphism elements found:', {
            leftSlide: !!leftSlide,
            rightSlide: !!rightSlide,
            animatedSlider: !!animatedSlider,
            leftPanelDot: !!leftPanelDot,
            rightPanelDot: !!rightPanelDot,
            slides: slides.length
        });
        
        if (!leftSlide || !rightSlide || !animatedSlider || !leftPanelDot || !rightPanelDot) {
            console.log('Glassmorphism slider elements not found');
            return;
        }
        
        let isLeftOpen = false;
        let isRightOpen = false;
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        let scrollLocked = false;
        let scrollPosition = 0;
        let isMobile = window.innerWidth <= 768;

        // Funkcja blokady scrollowania - prostsze rozwiązanie bez position: fixed
        function lockScroll() {
            if (!scrollLocked) {
                // Zapisz aktualną pozycję scroll
                scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
                
                // Proste zablokowanie bez position: fixed (nie powoduje przeładowania layoutu)
                document.body.style.overflow = 'hidden';
                document.body.style.touchAction = 'none';
                
                scrollLocked = true;
                console.log('Scroll locked at position:', scrollPosition);
            }
        }

        function unlockScroll(immediate = false) {
            if (scrollLocked) {
                const savedPosition = scrollPosition;
                
                // Natychmiast oznacz jako unlocked, aby zapobiec wielokrotnym wywołaniom
                scrollLocked = false;
                
                // Jeśli immediate = false, opóźnij przywracanie scroll do końca animacji panelu
                const delay = immediate ? 0 : 800; // 800ms = czas trwania animacji panelu (transition: 0.8s)
                
                setTimeout(() => {
                    // Usuń blokadę scroll
                    document.body.style.overflow = '';
                    document.body.style.touchAction = '';
                    
                    // Przywróć pozycję scroll płynnie (tylko jeśli pozycja się zmieniła)
                    const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
                    if (currentPosition !== savedPosition) {
                        requestAnimationFrame(() => {
                            window.scrollTo({
                                top: savedPosition,
                                behavior: 'instant'
                            });
                        });
                    }
                    
                    console.log('Scroll unlocked, restored to position:', savedPosition);
                }, delay);
            }
        }
        
        // Funkcja zamykania wszystkich sliderów
        function closeAllSliders() {
            console.log('closeAllSliders called');
            leftSlide.classList.remove('active');
            rightSlide.classList.remove('active');
            leftPanelDot.classList.remove('active');
            rightPanelDot.classList.remove('active');
            isLeftOpen = false;
            isRightOpen = false;
            unlockScroll(); // Odblokuj scrollowanie
            console.log('All panels closed');
        }
        
        // Funkcja otwierania lewego slidera
        function openLeftSlider() {
            console.log('openLeftSlider called');
            closeAllSliders();
            leftSlide.classList.add('active');
            isLeftOpen = true;
            lockScroll(); // Zablokuj scrollowanie
            console.log('Left panel opened, classList:', leftSlide.className);
        }
        
        // Funkcja otwierania prawego slidera
        function openRightSlider() {
            console.log('openRightSlider called');
            closeAllSliders();
            rightSlide.classList.add('active');
            isRightOpen = true;
            lockScroll(); // Zablokuj scrollowanie
            console.log('Right panel opened, classList:', rightSlide.className);
        }
        
        // Funkcja sprawdzająca aktualny slajd (bez nadmiernego logowania)
        function getCurrentSlide() {
            const activeSlide = document.querySelector('.animated-slide.active');
            if (!activeSlide) return 1;
            return parseInt(activeSlide.dataset.slide);
        }
        
        // Funkcja sprawdzająca czy jesteśmy na pierwszym slajdzie
        function isOnFirstSlide() {
            const currentSlideIndex = getCurrentSlide();
            return currentSlideIndex === 0;
        }
        
        // Funkcja sprawdzająca czy jesteśmy na ostatnim slajdzie
        function isOnLastSlide() {
            const currentSlideIndex = getCurrentSlide();
            return currentSlideIndex === slides.length - 1;
        }
        
        console.log('Glassmorphism slider initialized successfully');
        
        // Globalne funkcje do wywoływania paneli (używane przez slider)
        window.triggerLeftPanel = function() {
            const currentSlideIndex = getCurrentSlide();
            console.log('🎯 triggerLeftPanel called - current slide:', currentSlideIndex);
            
            // Lewy panel dostępny tylko na pierwszym slajdzie (0)
            if (currentSlideIndex !== 0) {
                return;
            }
            
            if (isLeftOpen) {
                console.log('🔴 Closing left panel');
                leftSlide.classList.remove('active');
                isLeftOpen = false;
                leftPanelDot.classList.remove('active');
                unlockScroll(); // Odblokuj scrollowanie
            } else {
                console.log('🟢 Opening left panel');
                // Zamknij prawy panel jeśli otwarty
                rightSlide.classList.remove('active');
                isRightOpen = false;
                rightPanelDot.classList.remove('active');
                unlockScroll(); // Odblokuj scrollowanie prawego panelu jeśli był otwarty
                
                // Otwórz lewy panel
                leftSlide.classList.add('active');
                isLeftOpen = true;
                leftPanelDot.classList.add('active');
                lockScroll(); // Zablokuj scrollowanie
                console.log('✅ Left panel opened, classList:', leftSlide.className);
            }
        };
        
        window.triggerRightPanel = function() {
            const currentSlideIndex = getCurrentSlide();
            console.log('🎯 triggerRightPanel called - current slide:', currentSlideIndex);
            
            if (!isOnLastSlide()) {
                return;
            }
            
            if (isRightOpen) {
                console.log('🔴 Closing right panel');
                rightSlide.classList.remove('active');
                isRightOpen = false;
                rightPanelDot.classList.remove('active');
                unlockScroll(); // Odblokuj scrollowanie
            } else {
                console.log('🟢 Opening right panel');
                // Zamknij lewy panel jeśli otwarty
                leftSlide.classList.remove('active');
                isLeftOpen = false;
                leftPanelDot.classList.remove('active');
                unlockScroll(); // Odblokuj scrollowanie lewego panelu jeśli był otwarty
                
                // Otwórz prawy panel
                rightSlide.classList.add('active');
                isRightOpen = true;
                rightPanelDot.classList.add('active');
                lockScroll(); // Zablokuj scrollowanie
                console.log('✅ Right panel opened, classList:', rightSlide.className);
            }
        };
        
        // Globalna funkcja sprawdzająca czy panel jest otwarty i który
        window.getOpenPanel = function() {
            if (isLeftOpen) return 'left';
            if (isRightOpen) return 'right';
            return null;
        };
        
        // Funkcja aktualizująca wizualne wskazówki kropek paneli
        function updatePanelDotsVisibility() {
            const currentSlideIndex = getCurrentSlide();
            const isFirst = currentSlideIndex === 0;
            const isLast = currentSlideIndex === slides.length - 1;
            
            console.log('🔄 updatePanelDotsVisibility - slide:', currentSlideIndex, 'isFirst:', isFirst, 'isLast:', isLast);
            
            // Lewa kropka - aktywna tylko na pierwszym slajdzie
            if (isFirst) {
                leftPanelDot.style.opacity = '1';
                leftPanelDot.style.animation = 'pulse-panel-dot 2s ease-in-out infinite';
                console.log('✨ LEFT panel dot activated (first slide)');
            } else {
                leftPanelDot.style.opacity = '0.5';
                leftPanelDot.style.animation = 'none';
            }
            
            // Prawa kropka - aktywna tylko na ostatnim slajdzie
            if (isLast) {
                rightPanelDot.style.opacity = '1';
                rightPanelDot.style.animation = 'pulse-panel-dot 2s ease-in-out infinite';
                console.log('✨ RIGHT panel dot activated (last slide)');
            } else {
                rightPanelDot.style.opacity = '0.5';
                rightPanelDot.style.animation = 'none';
            }
            
            if (!isFirst && !isLast) {
                console.log('💤 Both panel dots dimmed - panels locked');
            }
        }
        
        // Obserwuj zmiany slajdów
        const slideObserver = new MutationObserver(function() {
            updatePanelDotsVisibility();
        });
        
        slides.forEach(slide => {
            slideObserver.observe(slide, {
                attributes: true,
                attributeFilter: ['class']
            });
        });
        
        // Początkowa aktualizacja
        updatePanelDotsVisibility();
        
        // Touch/swipe events na sliderze zdjęć - lewy panel na pierwszym, prawy na ostatnim slajdzie
        animatedSlider.addEventListener('touchstart', function(e) {
            // TYLKO jeśli nie ma aktywnych paneli i jesteśmy na pierwszym lub ostatnim slajdzie
            const canOpenLeftPanel = isOnFirstSlide();
            const canOpenRightPanel = isOnLastSlide();
            
            if (!isLeftOpen && !isRightOpen && (canOpenLeftPanel || canOpenRightPanel)) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isDragging = true;
                console.log('🎯 Touch start at X:', startX, '| Can open left:', canOpenLeftPanel, '| Can open right:', canOpenRightPanel);
            } else {
                // Jeśli panel jest otwarty lub nie jesteśmy na odpowiednim slajdzie, ignoruj touch events
                isDragging = false;
            }
        }, { passive: true });
        
        animatedSlider.addEventListener('touchmove', function(e) {
            if (!isDragging || isLeftOpen || isRightOpen) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = currentX - startX;
            const diffY = currentY - startY;
            
            
            // Sprawdź czy to swipe poziomy (nie pionowy)
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 20) {
                const screenWidth = window.innerWidth;
                const leftEdge = screenWidth * 0.25; // 25% od lewej (większy obszar)
                
                console.log('🔄 Horizontal swipe detected - checking conditions...');
                
                // Swipe w prawo od lewej krawędzi - TYLKO NA PIERWSZYM SLAJDZIE
                // Lewy panel wymaga rozpoczęcia od lewej krawędzi
                if (diffX > 30 && startX < leftEdge && isOnFirstSlide()) {
                    console.log('✅ Opening LEFT panel - swipe right from left edge on first slide (diffX:', diffX, 'startX:', startX, ')');
                    e.preventDefault();
                    openLeftSlider();
                    isDragging = false;
                }
                // Swipe w lewo - TYLKO NA OSTATNIM SLAJDZIE
                // Prawy panel: swipe w lewo z DOWOLNEGO miejsca ekranu (bez ograniczenia startX)
                // Intuicyjne: przesuwasz palcem w lewo = panel wysuwa się z prawej
                else if (diffX < -30 && isOnLastSlide()) {
                    console.log('✅ Opening RIGHT panel - swipe left on last slide (diffX:', diffX, 'startX:', startX, 'currentX:', currentX, ')');
                    e.preventDefault();
                    openRightSlider();
                    isDragging = false;
                } else {
                }
            }
        }, { passive: false });
        
        animatedSlider.addEventListener('touchend', function(e) {
            isDragging = false;
            startX = 0;
            startY = 0;
        }, { passive: true });
        
        // Mouse events dla desktop - lewy panel na pierwszym, prawy na ostatnim slajdzie
        animatedSlider.addEventListener('mousedown', function(e) {
            const canOpenLeftPanel = isOnFirstSlide();
            const canOpenRightPanel = isOnLastSlide();
            
            if (!isLeftOpen && !isRightOpen && (canOpenLeftPanel || canOpenRightPanel)) {
                startX = e.clientX;
                isDragging = true;
                console.log('🖱️ Mouse down at X:', startX, '| Can open left:', canOpenLeftPanel, '| Can open right:', canOpenRightPanel);
            }
        });
        
        animatedSlider.addEventListener('mousemove', function(e) {
            if (!isDragging || isLeftOpen || isRightOpen) return;
            
            const currentX = e.clientX;
            const diffX = currentX - startX;
            
            if (Math.abs(diffX) > 20) {
                const screenWidth = window.innerWidth;
                const leftEdge = screenWidth * 0.25; // 25% od lewej (większy obszar)
                
                // Swipe w prawo od lewej krawędzi - TYLKO NA PIERWSZYM SLAJDZIE
                // Lewy panel wymaga rozpoczęcia od lewej krawędzi
                if (diffX > 30 && startX < leftEdge && isOnFirstSlide()) {
                    console.log('✅ Opening LEFT panel - mouse drag right from left edge on first slide (diffX:', diffX, 'startX:', startX, ')');
                    openLeftSlider();
                    isDragging = false;
                } 
                // Swipe w lewo - TYLKO NA OSTATNIM SLAJDZIE
                // Prawy panel: swipe w lewo z DOWOLNEGO miejsca ekranu (bez ograniczenia startX)
                // Intuicyjne: przesuwasz w lewo = panel wysuwa się z prawej
                else if (diffX < -30 && isOnLastSlide()) {
                    console.log('✅ Opening RIGHT panel - mouse drag left on last slide (diffX:', diffX, 'startX:', startX, 'currentX:', currentX, ')');
                    openRightSlider();
                    isDragging = false;
                }
            }
        });
        
        animatedSlider.addEventListener('mouseup', function() {
            isDragging = false;
            startX = 0;
        });
        
        // Zamykanie paneli gestem swipe na samych panelach
        let panelStartX = 0;
        let panelCurrentX = 0;
        let isPanelDragging = false;
        
        // Touch events dla lewego panelu
        leftSlide.addEventListener('touchstart', function(e) {
            if (isLeftOpen) {
                panelStartX = e.touches[0].clientX;
                isPanelDragging = true;
                // Zablokuj scrollowanie podczas przeciągania panelu
                lockScroll();
                // Zapobiegnij domyślnemu zachowaniu
                e.preventDefault();
            }
        }, { passive: false });
        
        leftSlide.addEventListener('touchmove', function(e) {
            if (!isPanelDragging || !isLeftOpen) return;
            
            panelCurrentX = e.touches[0].clientX;
            const diffX = panelCurrentX - panelStartX;
            
            // Swipe w lewo = zamknij lewy panel
            if (diffX < -50) {
                e.preventDefault();
                closeAllSliders();
                isPanelDragging = false;
            }
        }, { passive: false });
        
        leftSlide.addEventListener('touchend', function(e) {
            isPanelDragging = false;
            panelStartX = 0;
            panelCurrentX = 0;
            // Scrollowanie zostanie odblokowane automatycznie przez closeAllSliders()
            // Zapobiegnij domyślnemu zachowaniu
            e.preventDefault();
        }, { passive: false });
        
        // Touch events dla prawego panelu
        rightSlide.addEventListener('touchstart', function(e) {
            if (isRightOpen) {
                panelStartX = e.touches[0].clientX;
                isPanelDragging = true;
                // Zablokuj scrollowanie podczas przeciągania panelu
                lockScroll();
                // Zapobiegnij domyślnemu zachowaniu
                e.preventDefault();
            }
        }, { passive: false });
        
        rightSlide.addEventListener('touchmove', function(e) {
            if (!isPanelDragging || !isRightOpen) return;
            
            panelCurrentX = e.touches[0].clientX;
            const diffX = panelCurrentX - panelStartX;
            
            // Swipe w prawo = zamknij prawy panel
            if (diffX > 50) {
                e.preventDefault();
                closeAllSliders();
                isPanelDragging = false;
            }
        }, { passive: false });
        
        rightSlide.addEventListener('touchend', function(e) {
            isPanelDragging = false;
            panelStartX = 0;
            panelCurrentX = 0;
            // Scrollowanie zostanie odblokowane automatycznie przez closeAllSliders()
            // Zapobiegnij domyślnemu zachowaniu
            e.preventDefault();
        }, { passive: false });
        
        // Zamykanie sliderów po kliknięciu poza nimi (tylko dla desktop)
        let lastTouchTime = 0;
        
        const handleDocumentClick = function(e) {
            // Ignoruj kliknięcia które są wynikiem touch events (mobile)
            // Na mobile zamykanie odbywa się przez swipe
            const timeSinceTouch = Date.now() - lastTouchTime;
            if (timeSinceTouch < 500) {
                console.log('Ignoring click - was touch event');
                return;
            }
            
            // Sprawdź czy kliknięto w panel lub kropkę panelu
            const clickedInsidePanel = leftSlide.contains(e.target) || rightSlide.contains(e.target);
            const clickedPanelDot = leftPanelDot.contains(e.target) || rightPanelDot.contains(e.target);
            
            if (!clickedInsidePanel && !clickedPanelDot) {
                if (isLeftOpen || isRightOpen) {
                    console.log('Clicked outside panels - closing');
                    closeAllSliders();
                    leftPanelDot.classList.remove('active');
                    rightPanelDot.classList.remove('active');
                }
            }
        };
        
        // Śledź touch events aby ignorować kliknięcia z nich wynikające
        document.addEventListener('touchstart', function() {
            lastTouchTime = Date.now();
        }, { passive: true });
        
        document.addEventListener('click', handleDocumentClick);
        
        // Zamykanie sliderów po naciśnięciu Escape
        const handleKeydown = function(e) {
            if (e.key === 'Escape') {
                console.log('🔑 Escape pressed - closing panels');
                closeAllSliders();
                leftPanelDot.classList.remove('active');
                rightPanelDot.classList.remove('active');
            }
        };
        document.addEventListener('keydown', handleKeydown);
        
        // Event listenery dla kropek paneli
        if (leftPanelDot) {
            leftPanelDot.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const currentSlide = getCurrentSlide();
                const isFirst = currentSlide === 0;
                
                console.log('Current slide:', currentSlide, '| Is first slide:', isFirst, '| Panel open:', isLeftOpen);
                
                // Lewy panel dostępny tylko na pierwszym slajdzie (0)
                if (!isFirst) {
                    return;
                }
                
                if (isLeftOpen) {
                    console.log('Closing left panel from dot');
                    leftSlide.classList.remove('active');
                    isLeftOpen = false;
                    leftPanelDot.classList.remove('active');
                    unlockScroll(); // Odblokuj scrollowanie
                } else {
                    console.log('Opening left panel from dot');
                    // Zamknij prawy panel jeśli otwarty
                    rightSlide.classList.remove('active');
                    isRightOpen = false;
                    rightPanelDot.classList.remove('active');
                    unlockScroll(); // Odblokuj scrollowanie prawego panelu
                    
                    // Otwórz lewy panel
                    leftSlide.classList.add('active');
                    isLeftOpen = true;
                    leftPanelDot.classList.add('active');
                    lockScroll(); // Zablokuj scrollowanie
                    console.log('Left panel opened, classes:', leftSlide.className);
                }
            });
        }
        
        if (rightPanelDot) {
            rightPanelDot.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const currentSlide = getCurrentSlide();
                const isLast = isOnLastSlide();
                
                console.log('Current slide:', currentSlide, '| Is last slide:', isLast, '| Panel open:', isRightOpen);
                
                if (!isLast) {
                    return;
                }
                
                if (isRightOpen) {
                    console.log('Closing right panel from dot');
                    rightSlide.classList.remove('active');
                    isRightOpen = false;
                    rightPanelDot.classList.remove('active');
                    unlockScroll(); // Odblokuj scrollowanie
                } else {
                    console.log('Opening right panel from dot');
                    // Zamknij lewy panel jeśli otwarty
                    leftSlide.classList.remove('active');
                    isLeftOpen = false;
                    leftPanelDot.classList.remove('active');
                    unlockScroll(); // Odblokuj scrollowanie lewego panelu
                    
                    // Otwórz prawy panel
                    rightSlide.classList.add('active');
                    isRightOpen = true;
                    rightPanelDot.classList.add('active');
                    lockScroll(); // Zablokuj scrollowanie
                    console.log('Right panel opened, classes:', rightSlide.className);
                }
            });
        }
        
        console.log('Panel dot callbacks registered successfully');
        
        
        
        // Smooth scroll dla linków w sliderach
        const sliderLinks = document.querySelectorAll('.glassmorphism-btn');
        sliderLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    closeAllSliders();
                    
                    // Opóźnienie dla płynnego przejścia
                    setTimeout(() => {
                        const target = document.querySelector(href);
                        if (target) {
                            target.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }, 300);
                }
            });
        });
    };

    /* Proste animacje fade-in dla sekcji
     * -------------------------------------------------- */
    const ssSectionAnimations = function() {
        
        const animatedSections = document.querySelectorAll('.section-animate');
        if (!animatedSections.length) return;

        // Funkcja animacji sekcji
        const animateSection = (section) => {
            if (section.classList.contains('animate-in')) return;
            section.classList.add('animate-in');
        };

        // Obserwator intersection dla animacji przy scrollu
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSection(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Dodaj obserwator do wszystkich animowanych sekcji
        animatedSections.forEach(section => {
            observer.observe(section);
        });

        // Animacja sekcji "O mnie" przy pierwszym załadowaniu
        const aboutSection = document.querySelector('#about.section-animate');
        if (aboutSection) {
            setTimeout(() => {
                animateSection(aboutSection);
            }, 500);
        }

        // Sekcja "Zalety użytkowe" animuje się tylko przy scrollu (przez IntersectionObserver)
    };


   /* Animacje dla poszczególnych miniatur galerii
    * ------------------------------------------------------ */
    const ssGalleryAnimations = function() {
        
        // Znajdź wszystkie miniatury w sekcji z animacją
        const gallerySection = document.querySelector('#works.section-animate');
        if (!gallerySection) return;
        
        const galleryEntries = gallerySection.querySelectorAll('.folio-entries .entry');
        if (!galleryEntries.length) return;

        // Obserwator dla poszczególnych miniatur
        const entryObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Dodaj klasę do konkretnej miniatury
                    entry.target.classList.add('entry-visible');
                    // Przestań obserwować tę miniaturę
                    entryObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2, // 20% miniatury musi być widoczne
            rootMargin: '0px 0px -50px 0px' // Start animacji trochę wcześniej
        });

        // Obserwuj każdą miniaturę osobno
        galleryEntries.forEach(entry => {
            entryObserver.observe(entry);
        });

        console.log(`✅ Obserwuję ${galleryEntries.length} miniatur galerii`);
    };


   /* Animacje dla stopki
    * ------------------------------------------------------ */
    const ssFooterAnimations = function() {
        
        const footer = document.querySelector('.s-footer');
        if (!footer) return;
        
        // Obserwator dla stopki
        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Dodaj klasę aktywującą animacje
                    entry.target.classList.add('footer-visible');
                    // Przestań obserwować po pierwszej aktywacji
                    footerObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1, // 10% stopki musi być widoczne
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Obserwuj stopkę
        footerObserver.observe(footer);
        
        console.log('✅ Obserwuję animacje stopki');
    };


   /* Animacje dla poszczególnych kart w sekcji Zalety
    * ------------------------------------------------------ */
    const ssBenefitsAnimations = function() {
        
        // Znajdź sekcję zalety z animacją
        const benefitsSection = document.querySelector('#zalety.section-animate');
        if (!benefitsSection) return;
        
        const benefitCards = benefitsSection.querySelectorAll('.benefits-cards .column');
        if (!benefitCards.length) return;

        // Obserwator dla poszczególnych kart
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Dodaj klasę do konkretnej karty
                    entry.target.classList.add('card-visible');
                    // Przestań obserwować tę kartę
                    cardObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2, // 20% karty musi być widoczne
            rootMargin: '0px 0px -50px 0px' // Start animacji trochę wcześniej
        });

        // Obserwuj każdą kartę osobno
        benefitCards.forEach(card => {
            cardObserver.observe(card);
        });

        console.log(`✅ Obserwuję ${benefitCards.length} kart w sekcji Zalety`);
    };


   /* Animacje dla zdjęcia w sekcji O mnie
    * ------------------------------------------------------ */
    const ssAboutImageAnimation = function() {
        
        // Znajdź sekcję O mnie z animacją
        const aboutSection = document.querySelector('#about.section-animate');
        if (!aboutSection) return;
        
        const aboutImage = aboutSection.querySelector('.about-image-column');
        if (!aboutImage) return;

        // Obserwator dla zdjęcia
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Dodaj klasę do zdjęcia
                    entry.target.classList.add('image-visible');
                    // Przestań obserwować
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2, // 20% zdjęcia musi być widoczne
            rootMargin: '0px 0px -50px 0px'
        });

        // Obserwuj zdjęcie
        imageObserver.observe(aboutImage);

        console.log(`✅ Obserwuję zdjęcie w sekcji O mnie`);
    };


   /* Animacje dla kart produktów w sekcji Aktualności
    * ------------------------------------------------------ */
    const ssNewsAnimations = function() {
        
        // Znajdź sekcję news z animacją
        const newsSection = document.querySelector('#aktualnosci.section-animate, .s-news.section-animate');
        if (!newsSection) return;
        
        // Animacja dla karty intro
        const introCard = newsSection.querySelector('.news-intro-card');
        if (introCard) {
            const introObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('news-intro-visible');
                        introObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            });
            introObserver.observe(introCard);
        }
        
        const productCards = newsSection.querySelectorAll('.news-product-card');
        if (!productCards.length) return;

        // Obserwator dla poszczególnych kart produktów
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const index = Array.from(productCards).indexOf(card);
                    
                    // Opóźnienie startowe (400ms) + delay między kartami (250ms)
                    const delay = 400 + (index * 250);
                    
                    setTimeout(() => {
                        // Dodaj klasę do konkretnej karty
                        card.classList.add('news-card-visible');
                    }, delay);
                    
                    // Przestań obserwować tę kartę
                    cardObserver.unobserve(card);
                }
            });
        }, {
            threshold: 0.2, // 20% karty musi być widoczne
            rootMargin: '0px 0px -50px 0px' // Start animacji trochę wcześniej
        });

        // Obserwuj wszystkie karty
        productCards.forEach((card) => {
            cardObserver.observe(card);
        });

        console.log(`✅ Obserwuję ${productCards.length} kart produktów w sekcji Aktualności`);
    };



   /* Simple Panel System (triggered by buttons)
    * ------------------------------------------------------ */
    const ssSimplePanels = function() {
        
        console.log('=== INICJALIZACJA PANELI ===');
        
        const leftPanel = document.getElementById('panel-left');
        const rightPanel = document.getElementById('panel-right');
        const panelTriggers = document.querySelectorAll('.panel-trigger, .round-panel-trigger');
        const panelCloseButtons = document.querySelectorAll('.panel-close');
        
        console.log('Znalezione panele:', {
            leftPanel: !!leftPanel,
            rightPanel: !!rightPanel,
            buttonsCount: panelTriggers.length
        });
        
        if (!leftPanel || !rightPanel) {
            console.error('❌ PANELE NIE ZNALEZIONE!');
            return;
        }
        
        if (panelTriggers.length === 0) {
            console.error('❌ PRZYCISKI NIE ZNALEZIONE!');
            return;
        }
        
        let currentPanel = null;
        let scrollPosition = 0;
        
        // Funkcja otwierania panelu
        function openPanel(panel) {
            // Zapisz pozycję scroll
            scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            
            // Zablokuj scroll
            document.body.style.overflow = 'hidden';
            
            // Otwórz panel
            panel.classList.add('active');
            currentPanel = panel;
            
            console.log('Panel opened:', panel.id);
        }
        
        // Funkcja zamykania panelu
        function closePanel() {
            if (!currentPanel) return;
            
            // Zamknij panel
            currentPanel.classList.remove('active');
            
            // Odczekaj na animację, potem odblokuj scroll
            setTimeout(() => {
                document.body.style.overflow = '';
                
                // Przywróć pozycję scroll
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'instant'
                });
                
                currentPanel = null;
                console.log('Panel closed');
            }, 800); // Czas trwania animacji
        }
        
        // Event listenery dla przycisków otwierających
        console.log('✅ Znaleziono', panelTriggers.length, 'przycisków paneli');
        panelTriggers.forEach((button, index) => {
            const label = button.getAttribute('aria-label') || button.textContent || 'Brak etykiety';
            const panelType = button.dataset.panel;
            console.log(`   Przycisk ${index + 1}:`, {
                label: label,
                panel: panelType,
                classList: button.className,
                visible: window.getComputedStyle(button).display !== 'none'
            });
            
            button.addEventListener('click', function(e) {
                console.log('🖱️ KLIKNIĘTO PRZYCISK!', {
                    label: label,
                    panel: panelType,
                    timestamp: new Date().toLocaleTimeString()
                });
                e.preventDefault();
                e.stopPropagation();
                
                if (panelType === 'left') {
                    console.log('   → Otwieranie lewego panelu...');
                    openPanel(leftPanel);
                } else if (panelType === 'right') {
                    console.log('   → Otwieranie prawego panelu...');
                    openPanel(rightPanel);
                } else {
                    console.error('   ❌ Nieznany typ panelu:', panelType);
                }
            });
        });
        
        console.log('✅ Event listenery dodane do wszystkich przycisków');
        
        // Event listenery dla przycisków zamykających
        panelCloseButtons.forEach(button => {
            button.addEventListener('click', closePanel);
        });
        
        // Zamykanie przez kliknięcie poza panelem (na backdrop)
        [leftPanel, rightPanel].forEach(panel => {
            panel.addEventListener('click', function(e) {
                // Zamknij tylko jeśli kliknięto w sam panel (backdrop), nie w zawartość
                if (e.target === panel) {
                    closePanel();
                }
            });
        });
        
        // Zamykanie przez Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && currentPanel) {
                closePanel();
            }
        });
    };

   /* News Product Cards Accordion
    * ------------------------------------------------------ */
    const ssNewsAccordion = function() {
        
        const productCards = document.querySelectorAll('.news-product-card');
        
        // Funkcja do otwierania karty z animacją
        const openCard = function(card, header, content) {
            header.setAttribute('aria-expanded', 'true');
            card.classList.add('active');
            
            // Najpierw ustaw overflow na hidden, aby zmierzyć wysokość
            content.style.overflow = 'hidden';
            content.style.maxHeight = '0';
            
            // Wymuś reflow
            content.offsetHeight;
            
            // Ustaw max-height na scrollHeight + margines bezpieczeństwa z animacją
            const scrollHeight = content.scrollHeight;
            requestAnimationFrame(() => {
                content.style.maxHeight = scrollHeight > 0 ? (scrollHeight + 50) + 'px' : 'none';
                
                // Po zakończeniu animacji max-height, zmień overflow na visible
                setTimeout(() => {
                    content.style.overflow = 'visible';
                }, 500); // Czas trwania animacji max-height
            });
        };
        
        // Funkcja do zamykania karty z animacją
        const closeCard = function(card, header, content) {
            header.setAttribute('aria-expanded', 'false');
            card.classList.remove('active');
            
            // Ustaw max-height na aktualną wysokość przed animacją zamykania
            const currentHeight = content.scrollHeight;
            content.style.maxHeight = currentHeight + 'px';
            
            // Wymuś reflow, aby przeglądarka zarejestrowała zmianę
            content.offsetHeight;
            
            // Teraz ustaw na 0 z animacją
            requestAnimationFrame(() => {
                content.style.maxHeight = '0';
                content.style.overflow = 'hidden';
            });
        };
        
        // Znajdź kartę Diasen (product-diasen) i ustaw ją jako otwartą domyślnie
        const diasenCard = document.querySelector('#product-diasen')?.closest('.news-product-card');
        if (diasenCard) {
            const diasenHeader = diasenCard.querySelector('.news-product-card-header');
            const diasenContent = diasenCard.querySelector('.news-product-card-content');
            
            if (diasenHeader && diasenContent) {
                // Ustaw początkowy stan jako otwarty
                diasenHeader.setAttribute('aria-expanded', 'true');
                diasenCard.classList.add('active');
                
                // Ustaw max-height dla otwartej karty
                const scrollHeight = diasenContent.scrollHeight;
                if (scrollHeight > 0) {
                    diasenContent.style.maxHeight = (scrollHeight + 50) + 'px';
                    diasenContent.style.overflow = 'visible';
                }
            }
        }
        
        // Obserwator dla sekcji news - otwórz kartę Diasen przy pierwszym wejściu
        const newsSection = document.querySelector('#aktualnosci.section-animate, .s-news.section-animate');
        if (newsSection && diasenCard) {
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const diasenHeader = diasenCard.querySelector('.news-product-card-header');
                        const diasenContent = diasenCard.querySelector('.news-product-card-content');
                        
                        // Sprawdź, czy karta nie jest już otwarta
                        if (diasenHeader && diasenContent && diasenHeader.getAttribute('aria-expanded') !== 'true') {
                            // Opóźnienie dla animacji (po animacji kart)
                            setTimeout(() => {
                                openCard(diasenCard, diasenHeader, diasenContent);
                            }, 1000); // Opóźnienie 1 sekunda po wejściu na sekcję
                        }
                        
                        // Przestań obserwować sekcję po pierwszym wejściu
                        sectionObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            });
            
            sectionObserver.observe(newsSection);
        }
        
        productCards.forEach(card => {
            const header = card.querySelector('.news-product-card-header');
            const content = card.querySelector('.news-product-card-content');
            
            if (!(header && content)) return;
            
            header.addEventListener('click', function() {
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                
                // Zamknij wszystkie inne karty
                productCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        const otherHeader = otherCard.querySelector('.news-product-card-header');
                        const otherContent = otherCard.querySelector('.news-product-card-content');
                        if (otherHeader && otherContent) {
                            otherHeader.setAttribute('aria-expanded', 'false');
                            otherCard.classList.remove('active');
                            otherContent.style.maxHeight = '0';
                            otherContent.style.overflow = 'hidden';
                        }
                    }
                });
                
                // Przełącz stan bieżącej karty
                if (isExpanded) {
                    // Zwiń kartę - płynna animacja
                    closeCard(card, header, content);
                } else {
                    // Rozwiń kartę - płynna animacja
                    openCard(card, header, content);
                }
            });
        });
        
    }; // end ssNewsAccordion

    /* typing animation for news opening question
     * -------------------------------------------------- */
    const ssTypingAnimation = function() {
        const questionElement = document.querySelector('.news-opening-question');
        const newsSection = document.querySelector('#aktualnosci.section-animate, .s-news.section-animate');
        
        if (!questionElement || !newsSection) return;

        // Funkcja do uruchomienia animacji
        const startTypingAnimation = function() {
            // Sprawdź czy animacja już się wykonała
            if (questionElement.dataset.animated === 'true') return;
            
            // Oznacz jako animowane, aby nie uruchamiać ponownie
            questionElement.dataset.animated = 'true';

            // Usuń klasę typing jeśli istnieje
            questionElement.classList.remove('typing');

            // Pobierz aktualny język
            const currentLang = localStorage.getItem('language') || 'pl';
            
            // Pobierz tekst bezpośrednio z tłumaczeń
            let originalText = '';
            if (typeof translations !== 'undefined' && translations[currentLang] && translations[currentLang]['news.opening.question']) {
                originalText = translations[currentLang]['news.opening.question'];
            } else {
                // Fallback: pobierz z elementu jeśli tłumaczenia nie są dostępne
                originalText = questionElement.textContent.trim();
            }
            
            if (!originalText) return;

            // Wyczyść element
            questionElement.textContent = '';

            // Funkcja do animacji pisania
            let currentIndex = 0;
            const typingSpeed = 50; // ms między literami

            const typeChar = function() {
                if (currentIndex < originalText.length) {
                    questionElement.textContent = originalText.substring(0, currentIndex + 1);
                    currentIndex++;
                    setTimeout(typeChar, typingSpeed);
                } else {
                    // Dodaj klasę typing dla kursora
                    questionElement.classList.add('typing');
                }
            };

            // Rozpocznij animację po małym opóźnieniu
            setTimeout(typeChar, 300);
        };

        // Użyj IntersectionObserver do wykrycia, kiedy sekcja jest widoczna
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Sekcja jest widoczna - uruchom animację
                    startTypingAnimation();
                    // Przestań obserwować po pierwszej aktywacji
                    observer.unobserve(newsSection);
                }
            });
        }, {
            threshold: 0.2, // 20% sekcji musi być widoczne
            rootMargin: '0px 0px -50px 0px'
        });

        // Rozpocznij obserwację sekcji
        observer.observe(newsSection);
        
        // Sprawdź stan początkowy - jeśli sekcja jest już widoczna przy załadowaniu
        const rect = newsSection.getBoundingClientRect();
        const isVisible = (
            rect.top >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        ) || (
            rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
        
        if (isVisible && rect.top < window.innerHeight * 0.8) {
            // Sekcja jest już widoczna - uruchom animację z małym opóźnieniem
            setTimeout(() => {
                startTypingAnimation();
                observer.unobserve(newsSection);
            }, 500);
        }
    };
    
    // Eksportuj funkcję globalnie, aby można było ją wywołać po zmianie języka
    window.ssTypingAnimation = ssTypingAnimation;

   /* Benefits Cards Accordion
    * ------------------------------------------------------ */
    const ssBenefitsAccordion = function() {
        
        const benefitCards = document.querySelectorAll('.benefit-card');
        
        benefitCards.forEach(card => {
            const header = card.querySelector('.benefit-card-header');
            const content = card.querySelector('.benefit-card-content');
            
            if (!(header && content)) return;
            
            header.addEventListener('click', function() {
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                
                const resetInlineStyles = (el) => {
                    if (!el) return;
                    el.style.removeProperty('max-height');
                    el.style.removeProperty('overflow');
                    el.style.removeProperty('opacity');
                    el.style.removeProperty('transform');
                };

                // Zamknij wszystkie inne karty
                benefitCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        const otherHeader = otherCard.querySelector('.benefit-card-header');
                        const otherContent = otherCard.querySelector('.benefit-card-content');
                        if (otherHeader && otherContent) {
                            otherHeader.setAttribute('aria-expanded', 'false');
                            otherCard.classList.remove('active');
                            // Wymuś zamknięcie animacją, a potem oddaj kontrolę CSS
                            resetInlineStyles(otherContent);
                            otherContent.style.maxHeight = '0';
                            otherContent.style.overflow = 'hidden';
                            const otherBody = otherContent.querySelector('.benefit-card-body');
                            resetInlineStyles(otherBody);
                        }
                    }
                });
                
                // Przełącz stan bieżącej karty - tylko przez klasę .active
                if (isExpanded) {
                    // Zwiń kartę
                    header.setAttribute('aria-expanded', 'false');
                    card.classList.remove('active');
                    resetInlineStyles(content);
                    content.style.maxHeight = '0';
                    content.style.overflow = 'hidden';
                    const body = content.querySelector('.benefit-card-body');
                    resetInlineStyles(body);
                } else {
                    // Rozwiń kartę
                    header.setAttribute('aria-expanded', 'true');
                    card.classList.add('active');
                    
                    // Ustaw max-height na rzeczywistą wysokość zawartości dla płynnej animacji
                    const body = content.querySelector('.benefit-card-body');
                    // Usuń ewentualne “zablokowane” style inline (np. opacity:0 po wcześniejszym zamknięciu)
                    resetInlineStyles(content);
                    resetInlineStyles(body);

                    // Najpierw ustaw overflow na hidden, aby zmierzyć wysokość
                    content.style.setProperty('overflow', 'hidden');
                    content.style.setProperty('max-height', '0');
                    
                    // Wymuś reflow
                    content.offsetHeight;
                    
                    // Ustaw max-height na scrollHeight + margines bezpieczeństwa
                    const scrollHeight = content.scrollHeight;
                    content.style.setProperty('max-height', scrollHeight > 0 ? (scrollHeight + 50) + 'px' : '2000px');
                    
                    // Po animacji zmień overflow na visible
                    setTimeout(() => {
                        content.style.setProperty('overflow', 'visible');
                    }, 500);
                    
                    // Usuń style inline dla body, aby CSS mógł kontrolować animację
                    if (body) {
                        body.style.removeProperty('opacity');
                        body.style.removeProperty('transform');
                    }
                }
            });
        });
        
    }; // end ssBenefitsAccordion

   /* Initialize
    * ------------------------------------------------------ */
    (function ssInit() {

        ssPreloader();
        ssMoveHeader();
        ssMobileMenu();
        ssScrollSpy();
        ssGLightbox();
        ssSwiper();
        ssAlertBoxes();
        ssBackToTop();
        ssMoveTo();
        ssAnimatedImage();
        
        // Inicjalizuj slider po załadowaniu DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', ssAnimatedSlider);
        } else {
            ssAnimatedSlider();
        }

        // Inicjalizuj animacje sekcji
        ssSectionAnimations();
        
        // Inicjalizuj animacje miniatur galerii
        ssGalleryAnimations();
        
        // Inicjalizuj animacje kart w sekcji Zalety
        ssBenefitsAnimations();
        
        // Inicjalizuj animacje zdjęcia w sekcji O mnie
        ssAboutImageAnimation();
        
        // Inicjalizuj animacje kart produktów w sekcji Aktualności
        ssNewsAnimations();
        
        // Inicjalizuj animacje stopki
        ssFooterAnimations();
        
        // Inicjalizuj accordion dla kart produktów w sekcji Aktualności
        ssNewsAccordion();
        
        // Inicjalizuj animację typing dla pytania w sekcji Aktualności
        // Animacja uruchomi się automatycznie, gdy sekcja zostanie odsłonięta (przez IntersectionObserver)
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', ssTypingAnimation);
        } else {
            ssTypingAnimation();
        }
        
        // Inicjalizuj accordion dla kart zalet
        ssBenefitsAccordion();
        
        // Inicjalizuj mobile touch fixes
        ssMobileTouchFixes();
        
        // Inicjalizuj pinch-to-zoom
        console.log('🔄 Przed ssPinchToZoom...');
        try {
            ssPinchToZoom();
            console.log('✅ ssPinchToZoom zakończone');
        } catch(e) {
            console.error('❌ Błąd w ssPinchToZoom:', e);
        }
        
        console.log('🔄 Przed ssSimplePanels...');
        
        // NOWA uproszczona implementacja paneli - z opóźnieniem dla pewności
        setTimeout(function() {
            console.log('⏰ Inicjalizacja paneli po opóźnieniu...');
            try {
                ssSimplePanels();
            } catch(e) {
                console.error('❌ Błąd w ssSimplePanels (opóźniony):', e);
            }
        }, 500);

        // Również od razu
        try {
            console.log('▶️ Wywołanie ssSimplePanels...');
            ssSimplePanels();
            console.log('✅ ssSimplePanels zakończone');
        } catch(e) {
            console.error('❌ Błąd w ssSimplePanels:', e);
        }
        
        // TEST: Nasłuchuj na wszystkie kliknięcia w dokumencie
        document.addEventListener('click', function(e) {
            if (e.target.closest('.round-panel-trigger')) {
                console.log('🎯 KLIKNIĘCIE WYKRYTE przez delegację!', {
                    target: e.target,
                    closest: e.target.closest('.round-panel-trigger'),
                    panel: e.target.closest('.round-panel-trigger').dataset.panel
                });
            }
        }, true);
        
        console.log('✅ Delegacja kliknięć włączona');
        
        // DODATKOWY TEST: Stwórz globalne funkcje testowe
        window.testLeftPanel = function() {
            console.log('🧪 TEST: Otwieranie lewego panelu...');
            const panel = document.getElementById('panel-left');
            if (panel) {
                panel.classList.add('active');
                document.body.style.overflow = 'hidden';
                console.log('✅ Lewy panel otwarty!');
            } else {
                console.error('❌ Panel nie znaleziony!');
            }
        };
        
        window.testRightPanel = function() {
            console.log('🧪 TEST: Otwieranie prawego panelu...');
            const panel = document.getElementById('panel-right');
            if (panel) {
                panel.classList.add('active');
                document.body.style.overflow = 'hidden';
                console.log('✅ Prawy panel otwarty!');
            } else {
                console.error('❌ Panel nie znaleziony!');
            }
        };
        
        console.log('🧪 Funkcje testowe dostępne: testLeftPanel() i testRightPanel()');

    })();

})(document.documentElement);