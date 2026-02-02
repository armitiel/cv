# Deploy strony CV (cv.html) na OVH — dokumentacja dla agenta

Dokument opisuje, jak wdrożyć stronę CV na serwerze OVH (domena **amitiel.cv**). Przeznaczony jest dla nowego agenta / developera bez znajomości projektu.

---

## 1. Co jest deployowane

| Element | Opis |
|--------|------|
| **Plik źródłowy** | `cv.html` (w katalogu głównym repozytorium) |
| **Docelowa domena** | **https://amitiel.cv** |
| **Serwer** | OVH (VPS) — adres w skrypcie: `57.129.80.192` |
| **Ścieżka na serwerze** | `/var/www/amitiel.cv` |
| **Strona główna** | Na serwerze `cv.html` jest wgrywany jako **`index.html`** (żeby https://amitiel.cv otwierało CV). |

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
  Potem otwórz w przeglądarce: **http://localhost:8080/cv.html**

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

### 4.1 Z katalogu projektu (np. `C:\Armitiel`)

```powershell
cd C:\Armitiel
.\deploy-amitiel-cv.ps1
```

Bez parametrów skrypt:
- łączy się z serwerem z pliku (domyślnie `57.129.80.192`, użytkownik `ubuntu`),
- robi backup obecnego `index.html` na serwerze w `/var/backups/amitiel.cv/`,
- wgrywa **`cv.html`** jako **`/var/www/amitiel.cv/index.html`**,
- wgrywa **tylko zmienione** pliki z `css/`, `js/`, `images/`, `assets/` (wykrywane przez `git status`).

### 4.2 Pełny upload katalogów (wszystkie pliki)

Jeśli chcesz wymusić wgranie całych katalogów (np. po dużej zmianie lub gdy git nie jest dostępny):

```powershell
.\deploy-amitiel-cv.ps1 -Full
```

### 4.3 Własny serwer / użytkownik / ścieżka

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
5. Wgrywa zmienione/nowe pliki z `css/`, `js/`, `images/`, `assets/` (albo przy `-Full` całe katalogi).
6. Usuwa z serwera pliki usunięte w repo (jeśli wykryte przez `git status`).
7. Wgrywa opcjonalne pliki z roota: `favicon.svg`, `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-*.png`, `site.webmanifest` (jeśli istnieją).
8. Na końcu wykonuje test: `curl -I https://amitiel.cv` (jeśli dostępny z maszyny).

---

## 6. Pliki w projekcie związane z OVH / CV

| Plik | Opis |
|------|------|
| `cv.html` | Strona CV — jedyny plik HTML deployowany jako strona główna amitiel.cv. |
| `deploy-amitiel-cv.ps1` | **Główny skrypt deployu** CV na OVH (SSH + SCP). |
| `connect-ovh.ps1` | Tylko połączenie SSH z serwerem OVH (bez deployu). |
| `ovh-quick-connect.md` | Szybka instrukcja SSH/SCP i panel OVH. |
| `telegram-bot/deployment-guide-ovh.md` | Deploy bota Telegram na OVH (osobny flow). |

---

## 7. Typowe problemy

- **"Brak pliku/katalogu: cv.html"** — uruchom skrypt z katalogu głównego repo (tam gdzie jest `cv.html`).
- **"Permission denied" / "Connection refused"** — sprawdź dostęp SSH: `.\connect-ovh.ps1` lub `ssh ubuntu@57.129.80.192`. W razie potrzeby użyj innego użytkownika (`-User`) lub adresu (`-HostName`).
- **Strona nie zmienia się po deployu** — zrób twarde odświeżenie w przeglądarce (Ctrl+F5) lub sprawdź cache CDN/proxy jeśli jest przed amitiel.cv.
- **Backup nie działa** — użytkownik SSH musi mieć uprawnienia do `sudo mkdir` / `sudo cp` / `sudo chown` w `/var/www/amitiel.cv` i `/var/backups/amitiel.cv` (zazwyczaj konfiguracja jednorazowa na serwerze).

---

## 8. Dla agenta — checklist jednego deployu

1. Otwórz terminal w katalogu repozytorium (tam gdzie jest `cv.html` i `deploy-amitiel-cv.ps1`).
2. Uruchom: `.\deploy-amitiel-cv.ps1` (albo z `-Full` jeśli potrzeba pełnego uploadu).
3. Sprawdź w terminalu, czy nie ma błędów SSH/SCP.
4. Otwórz w przeglądarce https://amitiel.cv i zrób Ctrl+F5.
5. W razie błędu: sprawdź dostęp SSH (`connect-ovh.ps1` lub `ssh ubuntu@<adres>`) oraz sekcję 7 powyżej.

---

*Ostatnia aktualizacja dokumentu: wg stanu plików `deploy-amitiel-cv.ps1`, `ovh-quick-connect.md`, `connect-ovh.ps1` w repo.*
