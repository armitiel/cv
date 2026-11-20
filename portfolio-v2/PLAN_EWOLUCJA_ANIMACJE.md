# EwolucJA — plan ruchu i interakcji w portfolio

Wybrany kierunek: 3, zielone sekcje świata przeplatane jasnymi sekcjami UI. To plan do wdrożenia, nie gotowa animowana strona. Źródła sprawdzone 7 października 2026: komponenty UI, MemoryGame.jsx i scena biegPlanety.js w lokalnym projekcie EwolucJA. Zachowanie w przeglądarce wymaga osobnej weryfikacji.

## Zasada prowadząca

Strona opowiada o doświadczeniu: odkrywanie świata → zabawa → komunikacja → odpowiedź świata. Ruch ma pokazywać zależności. Sekcje pozostają czytelne bez animacji. Przewijanie jest naturalne; brak przechwytywania scrolla i obowiązkowych długich scen.

## Choreografia strony

| Fragment | Wejście treści | Interakcja / efekt | Uruchomienie |
|---|---|---|---|
| Hero | Tytuł: 600 ms, przesunięcie 20 px i odsłonięcie. Opis i CTA po 100–160 ms. | Delikatny ruch chmur i jednokrotne pojawienie się postaci. Opcjonalny podgląd świata po kliknięciu. | Raz po załadowaniu głównego obrazu; treść dostępna od razu. |
| Świat | Panorama i opis odsłaniają się w 550 ms. | Krótki klip rzeczywistej eksploracji. Kliknięcie punktu pokazuje podpis: odkrywanie, gwiazdki, domek. | Klip startuje, gdy sekcja jest widoczna; pauzuje poza nią. |
| Gra na Pamięć | Grafika i tytuł w 450 ms, niewielka różnica czasu. | Mini-demo: cztery prawdziwe karty, dwie pary. Kliknięcie / dotknięcie odkrywa kartę; trafiona para świeci. Przycisk „Jeszcze raz”. | Dopiero po interakcji. |
| Bieg Liska | Obraz planety przechodzi w rzeczywisty klip: droga wyrasta → bieg → droga się chowa. | Krótka demonstracja trzech pasów, skoku i wyboru odpowiedzi. Opcjonalne „Wypróbuj” otwiera odizolowany fragment gry. | Klip w widocznej sekcji; demo wyłącznie po kliknięciu. |
| System komunikacji | Nagłówek i cztery etapy wchodzą kolejno co 100 ms. | Jeden żywy podgląd: Zaproszenie → Wskazówka → Działanie → Reakcja świata. Kliknięcie etapu pokazuje odpowiedni prawdziwy element UI. Zielony przycisk przechodzi do następnego kroku. | Pierwszy etap po wejściu w sekcję; dalsze na żądanie, bez automatycznego znikania tekstu. |
| Dodatkowe aktywności | Grafiki i opisy w 400–500 ms; grupy maksymalnie 2–3 elementy. | Atlas: obrót rzeczywistego modelu grzyba po dotknięciu; domek i baloniki: krótkie klipy; Porada dnia: otwierany rzeczywisty panel. | Cięższe podglądy dopiero po kliknięciu. |
| Postacie | Jednorazowe odsłonięcie 500 ms. | Wizkor: istniejąca animacja mrugnięcia / uśmiechu odtwarzana raz. Krótka próbka głosu po kliknięciu ikony audio. | Wejście sekcji / świadoma interakcja. |
| Poza ekranem i finał | Spokojne wejście 400 ms, subtelna zmiana tła. | Ilustracje i tekst; CTA do kolejnego projektu. | Raz, bez zapętlonych dekoracji. |

## Główny pokaz: komunikacja między zadaniami

Na komputerze po lewej opis etapów, po prawej stała scena demonstracyjna z planetą w tle. Na telefonie etapy nad pełnoszerokim podglądem; bez przypinania długiej sekcji do ekranu. Wybrany etap oznaczony tekstem i kolorem. Można przejść w przód, wrócić i zrestartować pokaz.

1. Zaproszenie: postać pojawia się nad papierową kartą. Otwiera się okno Wizkora z jednym wyróżnionym celem i zielonym przyciskiem.
2. Wskazówka: karta się zamyka, dymek wskazuje konkretne miejsce / ikonę. Jeden element dostaje krótki akcent, bez pulsowania wszystkich kontrolek.
3. Działanie: otwiera się panel zadania. W wersji mobilnej wysuwa się od dołu; w desktopowej mieści się w podglądzie. Przycisk symuluje ukończenie demonstracyjnego kroku.
4. Reakcja świata: krótki błysk / lokalne drobiny, komunikat potwierdzenia i przejście do kolejnego zaproszenia. Zmiana świata pochodzi z rzeczywistej sceny lub nagrania.

To demonstracja portfolio. Wyniki i kliknięcia nie zapisują postępu gracza. Dobieramy jeden rzeczywisty ciąg zadania; nie łączymy Porady dnia i nagrody za gwiazdki w pozorną wspólną misję. Galeria pozostałych wzorców pozostaje osobnym pokazem UI.

## Co wykorzystać z gry

| Źródło w C:/Users/DELL/EwolucJA/frontend | Wartość do wykorzystania | Sposób przeniesienia |
|---|---|---|
| src/hub/Dymek.jsx, src/hub/ksztaltChmurki.js, src/styles/dymek.css | Kształt dymku, dopasowanie do treści, ogon i kolor postaci. | Wydzielona warstwa wizualna z potrzebnymi zależnościami i tokenami. |
| src/hub/PopupPostaci.jsx | Postać wychodząca z karty, główna akcja, obsługa zamknięcia; istniejący animowany Wizkor. | Adapter demonstracyjny; zastąpić połączenia z mową / stanem gry lokalnymi danymi. |
| src/hub/PanelSheet.jsx | Wysuwanie panelu od dołu i osobny popup. Kod podaje 280 ms dla zamykania szuflady i 260 ms dla popupu. | Zachować oryginalny ruch w odizolowanym podglądzie. |
| src/pages/MemoryGame.jsx | Karta MemCard: zwężenie scaleX przez 180 ms, zmiana strony, rozszerzenie przez kolejne 180 ms. | Wyodrębnić kartę i minimalną logikę dwóch par. Nie osadzać całej strony gry. |
| scena-3d-src/src/biegPlanety.js | Rzeczywiste wyrastanie drogi, zmiana pasa, skok, bramki i schowanie trasy. Zdarzenia bieg:start, bieg:pytanie, bieg:odpowiedz, bieg:meta. | Najpierw nagranie prawdziwej rozgrywki. Osobne demo 3D po sprawdzeniu zależności sceny. |
| src/hub/styles/bieg-planety.css | Animacje pytania, reakcji i licznika. | Oryginalne efekty w podglądzie biegu. |

Elementy UI można wydzielić z większą pewnością niż cały świat 3D. BiegPlanety korzysta z aplikacji sceny i jej stanu; nie jest samodzielnym widgetem. Nazwy zdarzeń dają dobry punkt zaczepienia dla pokazów, ale osadzenie wymaga adaptera i testów. HTML portfolio nie może bezpośrednio uruchomić plików JSX — potrzebny będzie mały zbudowany moduł demonstracyjny.

## Responsywność, ruch i wydajność

- Desktop: dwa szerokie pola w sekcjach gier i systemu komunikacji. Mobile: jedna kolumna; grafika, tytuł, opis, demonstracja. Etapy UI pionowo, bez drobnych czterokolumnowych miniaturek.
- Żadna istotna akcja nie zależy od hover. Obsługa dotyku i klawiatury; przyciski co najmniej 44 px. Fokus zostaje widoczny.
- Preferowany zakres wejść: 400–650 ms; reakcje kontrolek 120–220 ms. Efekty modalne dopasować do oryginalnej gry.
- Ruch strony uruchamiany raz; nie odpala na nowo przy każdym przewinięciu w górę. Długie akapity pojawiają się całymi blokami, bez pisania znak po znaku.
- prefers-reduced-motion: bez paralaksy i automatycznego ruchu świata, statyczna wersja postaci, natychmiastowe zmiany etapów. Wszystkie treści i akcje nadal dostępne.
- Audio wyłącznie po kliknięciu. Dźwięk można wyłączyć; opis tekstowy zawsze widoczny.
- Jedno aktywne demo naraz. Wstrzymanie poza ekranem i po ukryciu zakładki. Filmy, modele i moduł demonstracyjny ładowane na żądanie.
- Brak ciężkiego renderera 3D przy pierwszym wejściu. Hero ma lekki obraz startowy; rzeczywiste klipy i opcjonalne demo zapewniają zgodność z grą.

## Kolejność wdrożenia i odbiór

1. Responsywny układ wybranego kierunku 3, pełne teksty i prawdziwe materiały.
2. Wejścia sekcji i odtwarzanie klipów w widocznych obszarach.
3. Interaktywna sekwencja komunikacji — główny wyróżnik prezentacji.
4. Mini-demo Memory i oryginalna animacja Wizkora.
5. Nagranie aktualnego biegu na planecie; opcjonalne demo sceny po audycie zależności.
6. Opcjonalny model atlasu i pozostałe podglądy.

Odbiór w przeglądarce: desktop 1440 px, tablet 768 px, telefon 390 px i krótki ekran telefonu. Sprawdzić kolejność treści, brak poziomego scrolla, zamykanie paneli, fokus, gesty dotykowe, wyciszenie i reduced-motion. Potwierdzić wizualnie rzeczywisty tryb Biegu Liska i usunięcie Lotu Liska. Nagrania i demonstracje jasno odróżnić od ilustracji koncepcyjnych.
