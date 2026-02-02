# 👻 Paranormal Detector - Polish Paranormal TV Edition

<p align="center">
  <img src="pptv-logo.png" alt="PPTV Logo" width="300">
</p>

## 🎬 O Aplikacji

Profesjonalny detektor zjawisk paranormalnych stworzony dla kanału **Polish Paranormal TV**. Wykorzystuje czujniki smartfona do wykrywania anomalii elektromagnetycznych, ruchu i dźwięku.

### ✨ Funkcje

- 📡 **Detektor EMF** - Wykrywanie pola magnetycznego
- 🌀 **Detektor Ruchu** - Analiza wibracji i przemieszczeń
- 🎤 **Rejestrator EVP** - Nagrywanie Electronic Voice Phenomena
- 👻 **Spirit Box** - Komunikacja z duchami
- 🔮 **Skaner Aury** - Wizualizacja pola energetycznego
- 🎱 **Cyfrowe Wahadło** - Pytania TAK/NIE z obsługą głosu
- ✨ **Detektor Orbów** - Wykrywanie świetlistych anomalii kamerą
- 📊 **Przegląd** - Wszystkie czujniki + eksport danych

## 🎯 Kluczowe Usprawnienia (v2.0)

### ✅ Eliminacja Fałszywych Odczytów
- Automatyczna kalibracja czujników przy starcie
- Statystyczne progi oparte na prawdziwych danych (3σ, 5σ, 7σ)
- Exponential smoothing filters redukujące szum
- **Usunięto całkowicie losowe wartości** z odczytów

### 📱 Optymalizacja Mobilna
- Touch-friendly design (wszystkie przyciski ≥44px)
- Responsywne na 100% ekranów (telefony, tablety, landscape)
- Safe area support dla iPhone X/11/12/13/14/15
- Brak poziomego przewijania

### 🎨 Branding PPTV
- Animowany ekran powitalny z logo
- Stała odznaka w interfejsie
- Profesjonalny wygląd dla kanału YouTube

## 🚀 Jak Uruchomić

### Metoda 1: Bezpośrednio w przeglądarce
```bash
# Po prostu otwórz plik:
index.html
```

### Metoda 2: Lokalny serwer (zalecane)
```bash
# Zainstaluj http-server (jednorazowo)
npm install -g http-server

# Uruchom serwer
http-server . -p 8080

# Otwórz w przeglądarce:
http://localhost:8080
```

### Metoda 3: Python
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

## 📱 Pierwsze Użycie

1. **Ekran Powitalny (3s)**
   - Logo PPTV pojawi się z animacją
   - Możesz kliknąć aby pominąć

2. **Uprawnienia**
   - Kliknij "Rozpocznij Detekcję"
   - Zezwól na dostęp do czujników i mikrofonu

3. **Kalibracja (1s)**
   - **WAŻNE:** Trzymaj telefon NIERUCHOMO
   - Aplikacja zbierze 60 próbek dla dokładności
   - Status zmieni się na "Skalibrowane" ✓

4. **Gotowe!**
   - Wybierz tryb detekcji
   - Odczyty są teraz precyzyjne i wiarygodne

## 🎯 Kalibracja

### Kiedy Rekalibrować?
- 🏢 Po zmianie lokalizacji
- 📱 Gdy w pobliżu są źródła EMF (WiFi, telefony)
- 🔋 Bateria poniżej 20%
- 🔄 Podejrzane odczyty

### Jak Rekalibrować?
1. Przejdź do trybu **📊 Przegląd**
2. Kliknij **🎯 Rekalibracja**
3. Trzymaj telefon nieruchomo przez 1s
4. Poczekaj na wibrację potwierdzającą

## 💾 Eksport Danych

W trybie **Przegląd** kliknij **💾 Eksport** aby zapisać:
- Czas trwania sesji
- Liczbę wykrytych anomalii
- Historię odczytów EMF
- Wykryte orby
- **Parametry kalibracji** (baseline, progi)

Format: JSON

## 🔧 Wymagania Techniczne

### Minimalne:
- Chrome 67+ / Safari 13+ / Firefox 69+
- JavaScript włączony
- Czujniki ruchu (akcelerometr)

### Zalecane:
- Chrome 90+ / Safari 14+ (iOS 14+)
- Magnetometr (Android)
- Mikrofon + Kamera
- Vibration API

### Fallbacki:
- Brak magnetometru → DeviceMotion API
- Brak mikrofonu → EVP wyłączone
- Brak kamery → Orby wyłączone

## 📂 Struktura Projektu

```
paranormal-detector/
├── index.html              # Główny plik HTML
├── pptv-logo.png          # Logo PPTV (995KB)
│
├── CSS:
│   ├── style.css          # Style bazowe (31KB)
│   ├── new-modes.css      # Style trybów (11KB)
│   ├── mobile.css         # Responsywność mobilna (15KB)
│   └── splash.css         # Ekran powitalny (4KB)
│
├── JavaScript:
│   ├── splash.js          # Kontroler splash screen (1.6KB)
│   ├── app.js             # Główna logika + kalibracja (34KB)
│   └── features.js        # Dodatkowe tryby (20KB)
│
└── Dokumentacja:
    ├── README.md          # Ten plik
    └── README-NEW-FEATURES.md
```

## 🎬 Dla Twórców YouTube

### Jak Używać w Video:

1. **Intro**
   - Pokaż splash screen z logo PPTV
   - Krótkie wyjaśnienie aplikacji

2. **Kalibracja**
   - Pokaż proces kalibracji
   - Wyjaśnij dlaczego to ważne

3. **Sesja**
   - Wybierz tryb (EMF, Spirit Box, itd.)
   - Reaguj na odczyty w czasie rzeczywistym
   - Pokaż animacje i efekty wizualne

4. **Podsumowanie**
   - Eksportuj dane
   - Pokaż statystyki sesji
   - Screen z parametrami kalibracji

### Wskazówki:
- 📱 Używaj trybu poziomego dla lepszego kadru
- 🔊 Włącz nagrywanie ekranu z dźwiękiem
- 💡 Trzymaj telefon stabilnie (lub użyj statywu)
- 🎯 Rekalibruj przed każdą lokalizacją

## 🐛 Troubleshooting

### "Nie otrzymuję żadnych odczytów"
- Sprawdź czy zezwoliłeś na dostęp do czujników
- Spróbuj rekalibracji
- Odśwież stronę i spróbuj ponownie

### "Odczyty skaczą zbyt szybko"
- To normalne przy pierwszym uruchomieniu
- Poczekaj 5-10 sekund - filtry się ustabilizują
- Jeśli problem trwa - rekalibruj

### "Kamera nie działa (Orby)"
- Sprawdź uprawnienia kamery
- Spróbuj w HTTPS (nie HTTP)
- Niektóre przeglądarki wymagają bezpiecznego połączenia

### "Na iOS nie działa magnetometr"
- To ograniczenie Apple - iOS nie udostępnia magnetometru
- Aplikacja używa fallback (DeviceMotion)
- EMF będzie mniej precyzyjne ale ciągle użyteczne

## 📊 Statystyki Kalibracji

Po kalibracji, w konsoli przeglądarki zobaczysz:

```
EMF Calibration complete: {
  baseline: "45.2",
  stdDev: "4.3",
  normalThreshold: "58.1",
  elevatedThreshold: "66.7",
  anomalyThreshold: "75.3"
}
```

Te wartości są **unikalne dla twojego urządzenia i lokalizacji**.

## ⚠️ Disclaimer

Aplikacja jest przeznaczona **wyłącznie do celów rozrywkowych**. 

Odczyty czujników mogą być zakłócane przez:
- 📱 Inne urządzenia elektroniczne
- 📡 Sieci WiFi i Bluetooth
- 🏢 Metalowe konstrukcje budynków
- 🔋 Stan baterii telefonu
- 🌡️ Temperaturę otoczenia

Nie należy traktować jako profesjonalnego sprzętu do badań paranormalnych.

## 📞 Kontakt

Aplikacja stworzona dla: **Polish Paranormal TV**

Powered by Polish Paranormal TV 👻

---

**Wersja:** 2.0 (PPTV Edition)  
**Data Wydania:** 2 Lutego 2026  
**Licencja:** Użytek dla PPTV  
**Status:** ✅ Gotowe do produkcji
