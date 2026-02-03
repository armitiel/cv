# Deploy strony CV (cv.html) na OVH — dokumentacja dla agenta

Dokument opisuje, jak wdrożyć stronę CV na serwerze OVH (domena **amitiel.cv**). Przeznaczony jest dla nowego agenta / developera bez znajomości projektu.

---

## 0. Repozytorium i flow deployu

- **Repozytorium CV:** [https://github.com/armitiel/cv](https://github.com/armitiel/cv) — tu trzymana jest całość plików (cv.html, css, js, images, assets, portfolio jako submoduł).
- **Hosting:** OVH (VPS), domena amitiel.cv.
- **Sposób deployu:** zmiany wrzucasz na Git (`git push origin main` do `armitiel/cv`), potem uruchamiasz skrypt `deploy-amitiel-cv.ps1`. Skrypt łączy się z OVH i wgrywa pliki z lokalnego katalogu (który powinien być zsynchronizowany z repo, np. po `git pull`). Na OVH portfolio jest budowane z repo (clone/pull z Gita).

---

## 1. Co jest deployowane

| Element | Opis |
| ------ | ------ |
| **Plik źródłowy** | `cv.html` (w katalogu głównym repozytorium) |
| **Docelowa domena** | `https://amitiel.cv` |
| **Serwer** | OVH (VPS) — adres w skrypcie: `57.129.80.192` |
| **Ścieżka na serwerze** | `/var/www/amitiel.cv` |
| **Strona główna** | Na serwerze `cv.html` jest wgrywany jako **`index.html`** (żeby `https://amitiel.cv` otwierało CV). |
| **Portfolio (submoduł)** | Budowane na OVH z repo przez `git pull` + `git submodule update` i publikowane jako statyczne pliki w **`/var/www/amitiel.cv/portfolio/`** (URL: `https://amitiel.cv/portfolio/`). |

Dodatkowo wgrywane są katalogi: `css/`, `js/`, `images/`, `assets/` oraz opcjonalnie favikony i `site.webmanifest` z roota projektu.

---

## 2. Uruchomienie lokalne (bez instalacji zależności)

Projekt to **statyczna strona HTML** — nie ma `package.json`, buildu ani zależności do instalacji.

- **Otwarcie pliku:** dwuklik na `cv.html` lub w przeglądarce: Plik → Otwórz plik → `cv.html`.
- **Lepiej (serwer HTTP):** żeby ścieżki względne (`css/`, `images/` itd.) działały jak na serwerze, uruchom prosty serwer w katalogu projektu:

  **PowerShell (Python 3):**

  ```powershell
  cd c:\CV
  python -m http.server 8080
  ```

  Potem otwórz w przeglądarce: `http://localhost:8080/cv.html`

  **Alternatywa (Node.js):** `npx serve .` — strona główna będzie w `http://localhost:3000` (otwórz `cv.html` z listy lub dodaj `/cv.html`).

---

## 3. Wymagania

- **PowerShell** (Windows) lub środowisko z `ssh` / `scp`.
- **Dostęp SSH** do serwera OVH:
  - użytkownik: `ubuntu` (domyślnie w skrypcie),
  - adres: w skrypcie `deploy-amitiel-cv.ps1` (parametr `HostName`) lub zmienne środowiskowe.
- Uprawnienia na serwerze: użytkownik musi móc zapisywać do `/var/www/amitiel.cv` (skrypt raz robi `sudo mkdir` / `sudo chown` przy pierwszym uruchomieniu).

---

## 4. Jak zdeployować (krok po kroku)

### 4.1 Standardowy flow (Git → deploy)

1. **Wypchnij zmiany na GitHub (repo CV):**
   ```powershell
   cd c:\CV
   git add .
   git commit -m "Opis zmian"
   git push origin main
   ```
2. **Uruchom deploy na OVH** (z tego samego katalogu — skrypt wgra pliki z lokalnego drzewa na serwer):
   ```powershell
   .\deploy-amitiel-cv.ps1
   ```

Skrypt odczytuje adres repo z `git remote get-url origin` (domyślnie `https://github.com/armitiel/cv.git`). Na OVH portfolio jest budowane z Gita (clone/pull).

### 4.2 Z katalogu projektu (np. `c:\CV`)

```powershell
cd c:\CV
.\deploy-amitiel-cv.ps1
```

Bez parametrów skrypt:

- łączy się z serwerem z pliku (domyślnie `57.129.80.192`, użytkownik `ubuntu`),
- robi backup obecnego `index.html` na serwerze w `/var/backups/amitiel.cv/`,
- wgrywa **`cv.html`** jako **`/var/www/amitiel.cv/index.html`**,
- buduje **portfolio** na OVH (z Gita) i publikuje do `/var/www/amitiel.cv/portfolio/`.

### 4.3 Deploy tylko portfolio (bez ruszania CV)

```powershell
.\deploy-amitiel-cv.ps1 -PortfolioOnly
```

### 4.4 Pominięcie portfolio (tylko CV)

```powershell
.\deploy-amitiel-cv.ps1 -SkipPortfolio
```

### 4.5 Pełny upload katalogów (wszystkie pliki)

Jeśli chcesz wymusić wgranie całych katalogów (np. po dużej zmianie lub gdy git nie jest dostępny):

```powershell
.\deploy-amitiel-cv.ps1 -Full
```

### 4.6 Pobieranie wersji z Vercel na OVH (OVH jako mirror)

Jeśli deploy robisz na **Vercel** (np. po `git push` Vercel automatycznie buduje stronę), możesz **pobierać tę wersję na OVH**, żeby amitiel.cv na OVH pokazywał to samo co na Vercel:

```powershell
.\sync-from-vercel-to-ovh.ps1 -VercelUrl "https://twoj-projekt.vercel.app"
```

Skrypt łączy się z OVH przez SSH i na serwerze uruchamia pobieranie (curl + wget) z podanego URL Vercel do `/var/www/amitiel.cv`. Na serwerze OVH musi być zainstalowany `wget` (np. `sudo apt-get install -y wget`). Opcjonalnie z portfolio:

```powershell
.\sync-from-vercel-to-ovh.ps1 -VercelUrl "https://twoj-projekt.vercel.app" -IncludePortfolio
```

### 4.7 Własny serwer / użytkownik / ścieżka

```powershell
.\deploy-amitiel-cv.ps1 -HostName "twoj-server.ovh.net" -User "ubuntu" -RemoteWebRoot "/var/www/amitiel.cv"
```

Zmienne środowiskowe (opcjonalnie):

- `OVH_SERVER` — adres serwera,
- `OVH_USER` — użytkownik SSH,
- `OVH_KEY_PATH` — ścieżka do klucza SSH (dla `connect-ovh.ps1`; deploy używa tych samych opcji SSH co skrypt, ale w `deploy-amitiel-cv.ps1` nie ma parametru klucza — można go dodać w razie potrzeby).

---

## 5. Co dokładnie robi skrypt `deploy-amitiel-cv.ps1`

1. Sprawdza istnienie: `cv.html`, `css`, `js`, `images`, `assets`.
2. Łączy się z serwerem przez SSH (opcje: `StrictHostKeyChecking=accept-new`, keep-alive).
3. Backup: kopiuje obecny `index.html` z `/var/www/amitiel.cv/` do `/var/backups/amitiel.cv/index-{timestamp}.html`.
4. Wgrywa `cv.html` → `/var/www/amitiel.cv/index.html`.
5. Portfolio (OVH build):
   - klonuje repo (jeśli brak) do katalogu roboczego na serwerze,
   - robi `git pull --ff-only` na `master`,
   - robi `git submodule update --init --recursive`,
   - uruchamia `npm ci` i `npm run build -- --base=/portfolio/` w `portfolio/`,
   - publikuje wynik do `/var/www/amitiel.cv/portfolio/` (przez `rsync --delete` albo `cp -r`).
6. Na końcu wykonuje test: `curl -I https://amitiel.cv` (jeśli dostępny z maszyny).

---

## 6. Pliki w projekcie związane z OVH / CV

| Plik | Opis |
| ------ | ------ |
| `cv.html` | Strona CV — jedyny plik HTML deployowany jako strona główna amitiel.cv. |
| `deploy-amitiel-cv.ps1` | **Główny skrypt deployu** CV na OVH (SSH + SCP). |
| `sync-from-vercel-to-ovh.ps1` | Pobiera wersję z Vercel na OVH (OVH jako mirror). |
| `connect-ovh.ps1` | Tylko połączenie SSH z serwerem OVH (bez deployu). |
| `ovh-quick-connect.md` | Szybka instrukcja SSH/SCP i panel OVH. |
| `telegram-bot/deployment-guide-ovh.md` | Deploy bota Telegram na OVH (osobny flow). |

---

## 7. Typowe problemy

- **"Brak pliku/katalogu: cv.html"** — uruchom skrypt z katalogu głównego repo (tam gdzie jest `cv.html`).
- **"Permission denied" / "Connection refused"** — sprawdź dostęp SSH: `.\connect-ovh.ps1` lub `ssh ubuntu@57.129.80.192`. W razie potrzeby użyj innego użytkownika (`-User`) lub adresu (`-HostName`).
- **Strona nie zmienia się po deployu** — zrób twarde odświeżenie w przeglądarce (Ctrl+F5) lub sprawdź cache CDN/proxy jeśli jest przed `amitiel.cv`.
- **404 na https://amitiel.cv/portfolio/** — (1) Sprawdź, czy nginx ma blok `location /portfolio/` wskazujący na `/var/www/amitiel.cv/portfolio` (patrz sekcja „Nginx a portfolio” poniżej). (2) Po deployu build ustawia ścieżki z prefiksem `/portfolio/` (VITE_BASE_PATH); jeśli nadal 404 na pliki JS/CSS, zdeployuj ponownie po zmianach w `vite.config.ts` / skrypcie.
- **Backup nie działa** — użytkownik SSH musi mieć uprawnienia do `sudo mkdir` / `sudo cp` / `sudo chown` w `/var/www/amitiel.cv` i `/var/backups/amitiel.cv` (zazwyczaj konfiguracja jednorazowa na serwerze).

### Nginx a portfolio

Żeby `https://amitiel.cv/portfolio/` działało, w konfiguracji nginx dla domeny (np. w `/etc/nginx/sites-available/amitiel.cv`) powinien być blok:

```nginx
location /portfolio/ {
    alias /var/www/amitiel.cv/portfolio/;
    try_files $uri $uri/ /portfolio/index.html;
}
```

Po zmianie: `sudo nginx -t` i `sudo systemctl reload nginx`.

---

## 8. Dla agenta — checklist jednego deployu

1. Wypchnij zmiany na GitHub: `git push origin main` (repo: **https://github.com/armitiel/cv**).
2. Otwórz terminal w katalogu repozytorium (tam gdzie jest `cv.html` i `deploy-amitiel-cv.ps1`).
3. Uruchom: `.\deploy-amitiel-cv.ps1` (albo z `-Full` jeśli potrzeba pełnego uploadu).
4. Sprawdź w terminalu, czy nie ma błędów SSH/SCP.
5. Otwórz w przeglądarce `https://amitiel.cv` i zrób Ctrl+F5.
6. W razie błędu: sprawdź dostęp SSH (`connect-ovh.ps1` lub `ssh ubuntu@<adres>`) oraz sekcję 7 powyżej.

---

*Ostatnia aktualizacja dokumentu: repo CV = armitiel/cv; deploy przez Git (push → skrypt na OVH).*
