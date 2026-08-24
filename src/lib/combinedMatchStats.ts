import type { ParsedStat } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";

/**
 * Mecz sprowadzony do pojedynczych liczb obejmujących OBIE drużyny.
 *
 * Pogoda działa na mecz, a nie na jedną jego stronę, więc jednostką porównania
 * jest całe spotkanie: gospodarze + goście zsumowani. Ta sama funkcja produkuje
 * i oglądany mecz, i każdy mecz wchodzący do średniej — i to jest jedyny powód,
 * dla którego te dwie liczby w ogóle da się porównywać.
 *
 * Świadomie NIE ma tu posiadania piłki. Gospodarze + goście to zawsze 100, więc
 * wartość łączna nie niesie żadnej informacji.
 */
export type CombinedMatchStats = {
  goals: number;
  xg: number;
  shots_on_target: number;
  corner_kicks: number;
  yellow_cards: number;
  fouls: number;
  goalkeeper_saves: number | null;
  pass_accuracy_pct: number | null;
};

export type CombinedStatKey = keyof CombinedMatchStats;

/** Suma dwóch opcjonalnych liczników; null tylko gdy żadna strona nie ma wartości. */
function sumOptional(
  home: number | undefined,
  away: number | undefined,
): number | null {
  if (home === undefined && away === undefined) return null;
  return (home ?? 0) + (away ?? 0);
}

/**
 * Łączna celność. Uśrednienie dwóch pól `pct` traktowałoby drużynę, która
 * zagrała 200 podań, tak samo jak tę z 600, więc najpierw sumujemy liczniki,
 * a procent wyliczamy dopiero z nich.
 */
function combinedAccuracy(
  home: ParsedStat | undefined,
  away: ParsedStat | undefined,
): number | null {
  const completed = (home?.completed ?? 0) + (away?.completed ?? 0);
  const total = (home?.total ?? 0) + (away?.total ?? 0);

  if (total === 0) return null;
  return (completed / total) * 100;
}

export function getCombinedMatchStats(
  match: MatchWithWeather,
): CombinedMatchStats {
  return {
    goals: match.home_goals + match.away_goals,
    xg: match.home_expected_goals_xg + match.away_expected_goals_xg,
    shots_on_target: match.home_shots_on_target + match.away_shots_on_target,
    corner_kicks: match.home_corner_kicks + match.away_corner_kicks,
    yellow_cards: match.home_yellow_cards + match.away_yellow_cards,
    fouls: match.home_fouls + match.away_fouls,
    goalkeeper_saves: sumOptional(
      match.home_goalkeeper_saves,
      match.away_goalkeeper_saves,
    ),
    pass_accuracy_pct: combinedAccuracy(match.home_passes, match.away_passes),
  };
}

/**
 * Średnia pole po polu z już zsumowanych meczów. Każde pole uśredniamy tylko po
 * tych meczach, które faktycznie je mają — dzięki temu jeden mecz bez obron
 * bramkarza nie ciągnie tej średniej do zera.
 */
export function averageCombinedStats(
  statsList: CombinedMatchStats[],
): CombinedMatchStats {
  const average = (key: CombinedStatKey): number | null => {
    const values = statsList
      .map((stats) => stats[key])
      .filter((value): value is number => value !== null);

    if (values.length === 0) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  return {
    goals: average("goals") ?? 0,
    xg: average("xg") ?? 0,
    shots_on_target: average("shots_on_target") ?? 0,
    corner_kicks: average("corner_kicks") ?? 0,
    yellow_cards: average("yellow_cards") ?? 0,
    fouls: average("fouls") ?? 0,
    goalkeeper_saves: average("goalkeeper_saves"),
    pass_accuracy_pct: average("pass_accuracy_pct"),
  };
}
