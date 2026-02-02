# Paranormal Detector - Nowe Innowacyjne Funkcje! 🌟

## 🎯 **Ghost Radar** (Radar Duchów)

**Nowy tryb**: Animowany radar sonarowy do wykrywania obecności

### Funkcje:
- Obracający się promień skanujący (360°)
- Wizualizacja wykryć na radarze z pierścieniami dystansu
- Lista kontaktów z kątem i siłą sygnału
- Reaguje na dane z czujników ruchu
- Regulowana czułość (slider 1-10)
- Przycisk "Wyczyść" do resetowania

### Jak działa:
Radar wykorzystuje czujnik ruchu do wykrywania anomalii. Gdy magnitud ruchu przekracza próg (dostosowany czułością), radar generuje kontakt z losowym kątem i dystansem. Każdy kontakt ma czas życia i zanika stopniowo.

---

## 🌡️ **Thermal Scanner** (Skaner Termiczny)

**Nowy tryb**: Kamera termowizyjna z kolorowymi mapami ciepła

### Funkcje:
- Dostęp do kamery urządzenia (tylnej)
- 4 różne filtry kolorystyczne:
  - **Ironbow**: Klasyczny termowizyjny (niebieski → czerwony)
  - **Arctic**: Zimne tony (ciemny niebieski → biały)
  - **Lava**: Gorące tony (czarny → czerwony → biały)
  - **Rainbow**: Tęczowy gradient
- Wykrywanie "zimnych punktów" (potencjalne anomalie)
- Crosshair (celownik) w centrum
- Zrzuty ekranu termiczne
- Wyświetlanie średniej temperatury

### Jak działa:
Kamera przechwytuje obraz w czasie rzeczywistym, a algorytm konwertuje jasność pikseli na kolory termiczne. Ciemne obszary są mapowane na zimne kolory, jasne na gorące. Liczba "zimnych punktów" jest wykrywana i zgłaszana jako anomalie.

---

## 📳 **Vibration Alerts** (Alerty Wibracyjne)

**Nowa funkcja**: Haptic feedback przy wykryciach

### Funkcje:
- Przełącznik ON/OFF w trybie Przegląd
- Automatyczne wibracje przy anomaliach
- Różne wzorce dla różnych typów wykryć
- Działa we wszystkich trybach

### Wzorce:
- Kontakt radaru: [100ms, 50ms, 100ms]
- Anomalia termiczna: [200ms, 100ms, 200ms]
- EMF anomalia: standardowe wibracje

---

## 💡 **Flashlight Morse** (Sygnalizacja Latarką)

**Nowa funkcja**: Automatyczna kontrola latarki telefonu

### Funkcje:
- Przełącznik ON/OFF w trybie Przegląd  
- Miganie latarką przy wykryciach radaru
- Różna liczba błysków dla różnych zdarzeń

**Uwaga**: Wymaga dostępu do kamery z obsługą torch. Działa najlepiej na Android.

---

## 💾 **Session Export** (Eksport Sesji)

**Nowa funkcja**: Zapisywanie danych sesji do pliku JSON

### Dane eksportowane:
- Timestamp sesji
- Czas trwania (sekundy)
- Liczba anomalii
- Historia odczytów EMF
- Liczba kontaktów radarowych
- Liczba zimnych punktów

### Jak używać:
1. Przejdź do trybu "Przegląd"
2. Kliknij przycisk "💾 Eksport"
3. Plik JSON zostanie automatycznie pobrany

Format pliku: `paranormal_session_[timestamp].json`

---

## 🎮 Jak Uruchomić Nowe Funkcje

### 1. Otwórz aplikację w przeglądarce
```
file:///C:/Users/User/.gemini/antigravity/scratch/paranormal-detector/index.html
```

### 2. Przyznaj uprawnienia
Kliknij "Rozpocznij Detekcję" i zatwierdź:
- Czujniki ruchu
- Mikrofon
- Kamera (dla trybu Termicznego)

### 3. Wybierz nowy tryb
- **🎯 Radar**: Ghost Radar
- **🌡️ Termiczny**: Thermal Scanner

### 4. Włącz dodatkowe funkcje (tryb Przegląd)
- **📳 Wibracje**: Haptic feedback
- **💡 Latarka**: Błyski światła
- **💾 Eksport**: Zapis danych sesji

---

## 📱 Najlepsze Doświadczenie

Dla optymalnego działania nowych funkcji:
- Użyj prawdziwego telefonu (nie emulatora)
- Przeglądarka: Chrome lub Edge na Android
- Włącz wszystkie uprawnienia
- Dobra jakość czujników zwiększa dokładność

---

## ⚙️ Pliki Projektu

```
paranormal-detector/
├── index.html          # Główna struktura + nowe tryby
├── style.css           # Pełny design + style nowych trybów
├── app.js              # Podstawowa funkcjonalność
└── features.js         # 🆕 Nowe innowacyjne funkcje!
```

---

## 🎉 Podsumowanie Nowości

✅ **Ghost Radar** - Sonar paranormalny z animacjami  
✅ **Thermal Scanner** - Prawdziwa kamera termowizyjna  
✅ **Vibration API** - Wibracje przy wykryciach  
✅ **Flashlight Control** - Migająca latarka  
✅ **Session Export** - Eksport danych do JSON  

**Łącznie 7 trybów detekcji + 3 dodatkowe funkcje!** 🚀
