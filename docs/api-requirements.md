# Czego frontend potrzebuje od API

Stan na 2026-08-19. Zweryfikowane względem `backend/src/index.js`,
`MatchesController.js`, `MatchStatsController.js`.

Frontend jest napisany tak, że **każde wywołanie API przechodzi przez katalog
`src/services/`**, a te funkcje dziś czytają lokalne mocki. Podmiana na prawdziwe
API to zmiana ciała funkcji — komponenty zostają nietknięte. Kształty odpowiedzi,
których oczekuje frontend, są spisane w `src/data/types.ts` i to jest dokument
odniesienia dla pól.

Kolejność ma znaczenie: **P0** blokuje demo, **P1** jest potrzebne do pełnej
funkcjonalności, **P2** to optymalizacja, którą można zrobić na końcu.

---

## P0 — zmiany w tym, co już istnieje

Wszystkie cztery są tanie, żadna nie wymaga migracji.

### 1. Upublicznić endpointy używane przez publiczne widoki

Dziś w `src/index.js` linia `app.use("/api", requireAuth)` odcina wszystko poniżej,
a `/api/teams` i `/api/matches` dodatkowo mają `requirePermission`. Tymczasem
Dashboard, `/team/:id` i `/match/:id` są stronami publicznymi — demo nie ma
logowania.

Potrzebne publicznie (GET, tylko odczyt):

| Endpoint | Używa |
|---|---|
| `GET /api/matches` | `/matches`, Dashboard, `/team/:id` |
| `GET /api/matches/:id` | `/match/:id` |
| `GET /api/teams/:id` | `/team/:id` |
| `GET /api/leagues/:id` | planowana strona ligi |

Wzorzec już masz zastosowany dla `GET /api/leagues` i `GET /api/teams` (listy) —
są zarejestrowane **nad** `app.use("/api", requireAuth)`, a pełny CRUD zostaje pod
spodem za permission. Wystarczy zrobić to samo dla powyższych. Operacje zapisu
(POST/PATCH/DELETE) zostają chronione bez zmian.

### 2. `team_id` w `GET /api/matches`

`MatchesController.index` filtruje dziś `home_team_id` i `away_team_id` osobno, więc
„wszystkie mecze jednej drużyny" wymaga dwóch zapytań i sklejania po stronie
przeglądarki.

Potrzebny jeden parametr `team_id` z semantyką OR. Logika jest już napisana w
`MatchStatsController._applyFilters`:

```js
if (team_id) {
  query.where(function () {
    this.where("home_team_id", team_id).orWhere("away_team_id", team_id);
  });
}
```

### 2b. Mecze nierozegrane (predykcje)

Gdy do `matches` trafią mecze przyszłe (terminarz pod predykcje), potrzebne jest
jednoznaczne rozróżnienie — inaczej każdy agregat po cichu wliczy mecze, które się
nie odbyły, i średnie wyjdą zaniżone.

- kolumna `status` (`played` / `scheduled`) albo konsekwentne filtrowanie po
  `datetime < now()`; pierwsze jest jednoznaczne, drugie darmowe
- `home_goals` / `away_goals` muszą być wtedy nullowalne
- **domyślnie wszystkie endpointy statystyczne liczą tylko mecze rozegrane**;
  terminarz to osobne zapytanie (np. `?status=scheduled`)

### 3. `date_from` / `date_to` w `GET /api/matches`

Widok `/matches` ma filtr zakresu dat. Ta sama konwencja co w `_applyFilters`
(`date_to` domykane do `T23:59:59`).

### 3b. Paginacja i filtrowanie po stronie serwera

Docelowa skala to dziesiątki tysięcy meczów (kilka lig × kilka sezonów ze
scrapera + terminarze), a każdy rekord jest szeroki: ~60 kolumn statystyk plus
`withGraphFetched` doklejające drużyny, stadion i ligę.

Frontend **nie może** pobierać całego zbioru i filtrować lokalnie — dlatego
filtry z punktów 2 i 3 muszą działać jako parametry zapytania, a `paginate()`
musi zostać włączone na `GET /api/matches`. Widoki ograniczone do jednej drużyny
(~190 meczów przy pięciu sezonach) zostają liczone po stronie przeglądarki i nie
wymagają nowych endpointów.

### 4. `GET /api/leagues/:id`

`LeaguesController.show` istnieje, brakuje tylko publicznego wystawienia — patrz
punkt 1.

---

## P1 — pogoda

To jedyna część wymagająca migracji. W bazie nie ma dziś **nic** związanego z
pogodą, a to jest temat całej pracy.

### Tabela `weather`

Jeden rekord na mecz. Pola wprost z `Weather` w `src/data/types.ts`:

| Kolumna | Typ | Uwagi |
|---|---|---|
| `match_id` | integer, FK → `matches.id`, UNIQUE | |
| `temperature_c` | numeric | |
| `feels_like_c` | numeric | |
| `precipitation_mm` | numeric | |
| `wind_speed_kmh` | numeric | |
| `humidity_pct` | integer | 0-100 |
| `cloud_cover_pct` | integer | 0-100 |
| `condition` | text | `clear` \| `clouds` \| `rain` \| `snow` \| `wind` \| `extreme_heat` \| `extreme_cold` |

### `condition` liczymy sami — nie bierzemy go z API

To jest ważne, bo decyduje o tym, co w ogóle zapisujemy do bazy.

Serwisy pogodowe zwracają własne klasyfikacje i **żadna nie pasuje do naszej**:
Open-Meteo daje kody WMO (`0` bezchmurnie, `1-3` zachmurzenie, `45/48` mgła,
`51-57` mżawka, `61-67` deszcz, `71-77` śnieg, `80-82` przelotne, `95-99` burza),
OpenWeatherMap tekst `weather.main` (`"Rain"`, `"Snow"`, `"Clear"`), Visual
Crossing opis słowny. Co więcej, **żaden nie ma kategorii `wind`, `extreme_heat`
ani `extreme_cold`** — to nie są zjawiska pogodowe, tylko progi na liczbach,
których nikt za nas nie wyznaczy.

Dlatego podział jest taki:

- **z API bierzemy i zapisujemy wyłącznie surowe pomiary** — temperatura, opady,
  wiatr, wilgotność, zachmurzenie. Są obiektywne, takie same u każdego dostawcy
  i nie zmienią się przy zmianie API.
- **`condition` wyliczamy z nich jedną funkcją z jawnymi progami** i zapisujemy
  jako kolumnę, żeby SQL mógł po niej filtrować i grupować bez przeliczania.
  Progi są decyzją projektową opisaną w pracy — nie mogą pochodzić z zewnątrz.

Skutek praktyczny: zmiana dostawcy pogody dotyka tylko importu, a nie żadnej
statystyki ani filtra w aplikacji.

### Skąd brać dane pogodowe

Stadiony mają `latitude`/`longitude` (`StadiumsController` ma już `runGeocoding`),
a mecze mają `datetime` — to wystarcza.

**Open-Meteo Historical Weather API** jest darmowe i nie wymaga klucza, więc
byłby to najprostszy start.

Jeden detal: **mecz trwa około dwóch godzin**, więc punktowy odczyt z godziny
rozpoczęcia bywa mylący (o 20:00 sucho, deszcz w 60. minucie). Lepiej pobrać dane
godzinowe dla okna od rozpoczęcia do końca meczu i je zagregować — temperaturę,
wiatr i zachmurzenie uśrednić, **opady zsumować**. To też jest decyzja do opisania
w pracy.

### Dołączenie pogody do meczu

`weather` ma przychodzić zagnieżdżone w payloadzie meczu, tak samo jak dziś
`homeTeam` / `awayTeam` / `stadium` / `league`, czyli przez `withGraphFetched` w
`index` i `show`:

```json
{
  "id": 1028,
  "home_goals": 2,
  "homeTeam": { "...": "" },
  "weather": { "match_id": 1028, "temperature_c": 14.2, "condition": "rain", "...": "" }
}
```

Gdy pogody dla meczu nie ma — `null`, nie pominięte pole. Frontend to obsługuje.

---

## P2 — agregaty

Wszystkie policzalne po stronie frontendu, ale to oznacza ściąganie całego zbioru
meczów do przeglądarki. W SQL to jedno zapytanie, więc docelowo lepiej tutaj.
Można je dorobić po demie.

| Endpoint | Zwraca |
|---|---|
| `GET /api/weather-stats/goals-by-condition` | dla każdego `condition`: `match_count`, `avg_goals` |
| `GET /api/weather-stats/by-league?league_id=` | rozkład liczby meczów wg `condition` (wykres kołowy na stronie ligi) |
| `GET /api/weather-stats/team-score?team_id=` | średnie drużyny w warunkach trudnych vs dobrych (podstawa „weather score") |

Wszystkie powinny przyjmować te same filtry co `/api/match-stats/*`
(`league_id`, `team_id`, `season`, `date_from`, `date_to`).

Istniejące `/api/match-stats/*` i `/api/team-stats/*` są używane i nie wymagają
zmian.

---

## Poza demem (do stycznia)

- `GET/POST/DELETE /api/users/me/favourites` — ulubione drużyny zalogowanego
  użytkownika. Frontend zrobi to najpierw na `localStorage` za fasadą serwisu, więc
  podmiana będzie kosmetyczna. Wystarczy tabela łącząca `user_id` + `team_id`.
- Logowanie/rejestracja — `AuthController` jest gotowy, frontend dorobi ekrany.

---

## Czego nie zmieniać

Nazwy kolumn statystycznych na `matches` (`home_expected_goals_xg`,
`home_ball_possession`, wszystkie pary `home_*` / `away_*`) oraz kształt kolumn
JSONB `{ pct, completed, total }` — **scraper generuje te nazwy w locie** ze slugów
etykiet ze strony źródłowej (`scraper/src/scraper/match.js`). Zmiana nazwy oznacza
przepisanie scrapera. To samo dotyczy `teams.name` i `stadiums.name`, po których
scraper rozpoznaje istniejące rekordy.

Ścieżki endpointów, parametry i koperty odpowiedzi są natomiast w pełni do
negocjacji — jeśli coś powyżej jest niewygodne po stronie backendu, frontend się
dostosuje.
