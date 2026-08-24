// KONTRAKT WYMYŚLONY — nic w tym pliku nie odwzorowuje istniejącego endpointu.
//
// Backend nie ma żadnych danych pogodowych (ani tabeli, ani kolumny, ani route'a
// — sprawdzone grepem 2026-08-05), więc te agregaty to własna propozycja
// frontendu, co powinno zwracać przyszłe API pogodowe. Celowo mają postać
// asynchronicznych wywołań serwisu, a nie czystych funkcji: każde potrzebuje
// PEŁNEGO zbioru meczów, którego prawdziwy klient nigdy by nie pobierał tylko po
// to, żeby uśrednić kilka liczb — to są właśnie te rzeczy, których miejsce jest
// na serwerze.
//
// Proponowane endpointy:
//   GET /api/weather-stats/goals-by-condition  → WeatherGoalsStat[]
//   GET /api/weather-stats/insights            → WeatherGoalsInsights
//   GET /api/weather-stats/coldest-match       → ColdestMatch
//   GET /api/weather-stats/match-averages      → ConditionAverages
//
// Dla kontrastu lib/: wszystko, co wyliczasz z meczów JUŻ pobranych przez
// komponent (np. filtrowanie meczów jednej drużyny po warunku pogodowym),
// zostaje czystą funkcją w lib/ — tam żadna podróż do serwera by się nie broniła.
//TODO: verify against real API response once the backend has weather

import { getMatches } from "@/services/matchesService";
import type { WeatherCondition } from "@/data/types";
import {
  averageCombinedStats,
  getCombinedMatchStats,
  type CombinedMatchStats,
} from "@/lib/combinedMatchStats";

export type WeatherGoalsStat = {
  condition: WeatherCondition;
  matchCount: number;
  avgGoals: number;
};

export type WeatherGoalsInsights = {
  bestWeatherForGoals: WeatherGoalsStat;
  worstWeatherForGoals: WeatherGoalsStat;
};

export type ColdestMatch = {
  city: string | undefined;
  temperature_c: number;
  condition: WeatherCondition;
};

/**
 * GET /api/weather-stats/goals-by-condition?league_id=1
 *
 * `leagueId` jest opcjonalny, ale rzadko bezcelowy: ligi systematycznie różnią
 * się liczbą goli na mecz, a w prawdziwych danych pogoda koreluje z ligą (śnieg
 * pada w Polsce, nie w Hiszpanii), więc nieodfiltrowana średnia po części mierzy
 * skład ligowy, a nie pogodę. Pomijaj go tylko dla świadomie przekrojowego
 * widoku, jak Dashboard.
 */
export async function getGoalsByWeatherCondition(
  leagueId?: number,
): Promise<WeatherGoalsStat[]> {
  const { data } = await getMatches();
  const buckets = new Map<WeatherCondition, number[]>();

  for (const match of data) {
    if (!match.weather) continue;
    if (leagueId !== undefined && match.league_id !== leagueId) continue;

    const totalGoals = match.home_goals + match.away_goals;
    const bucket = buckets.get(match.weather.condition) ?? [];
    bucket.push(totalGoals);
    buckets.set(match.weather.condition, bucket);
  }

  return [...buckets.entries()].map(([condition, goalsList]) => ({
    condition,
    matchCount: goalsList.length,
    avgGoals: Number(
      (goalsList.reduce((sum, g) => sum + g, 0) / goalsList.length).toFixed(1),
    ),
  }));
}

/** GET /api/weather-stats/insights */
export async function getWeatherGoalsInsights(): Promise<WeatherGoalsInsights> {
  const stats = await getGoalsByWeatherCondition();
  const sortedStats = stats
    .filter((s) => s.matchCount > 0)
    .sort((a, b) => b.avgGoals - a.avgGoals);

  return {
    bestWeatherForGoals: sortedStats[0],
    worstWeatherForGoals: sortedStats[sortedStats.length - 1],
  };
}

export type ConditionAverages = {
  condition: WeatherCondition;
  /** Na ilu meczach opierają się średnie — UI to pokazuje, małe próby kłamią. */
  matchCount: number;
  averages: CombinedMatchStats;
};

/**
 * GET /api/weather-stats/match-averages?condition=rain&league_id=1
 *
 * Przeciętny mecz rozegrany przy danym warunku pogodowym, obie drużyny razem.
 * Siedzi tutaj, a nie w lib/, bo potrzebuje wszystkich meczów w bazie — żaden
 * klient nie powinien ich pobierać tylko po to, żeby uśrednić osiem liczb.
 *
 * To samo zastrzeżenie co przy getGoalsByWeatherCondition: pomijaj `leagueId`
 * tylko wtedy, gdy naprawdę chcesz średnią z wielu lig.
 */
export async function getMatchAveragesByCondition(
  condition: WeatherCondition,
  leagueId?: number,
): Promise<ConditionAverages> {
  const { data } = await getMatches();

  const statsList = data
    .filter(
      (match) =>
        match.weather?.condition === condition &&
        (leagueId === undefined || match.league_id === leagueId),
    )
    .map(getCombinedMatchStats);

  return {
    condition,
    matchCount: statsList.length,
    averages: averageCombinedStats(statsList),
  };
}

/** GET /api/weather-stats/coldest-match */
export async function getColdestMatch(): Promise<ColdestMatch> {
  const { data } = await getMatches();

  return data
    .filter((match) => match.weather !== null)
    .map((match) => ({
      city: match.stadium?.city,
      condition: match.weather!.condition,
      temperature_c: match.weather!.temperature_c,
    }))
    .sort((a, b) => a.temperature_c - b.temperature_c)[0];
}
