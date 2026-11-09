import type { MatchWithWeather } from "@/services/matchesService";
import { impliedShares, matchOdds } from "./matchOutcomes";
import { MIN_MATCHES } from "./weatherComparison";
import { isDifficultWeather } from "./weatherProfile";

function splitByDifficulty(matches: MatchWithWeather[]) {
  return {
    normal: matches.filter((m) => m.weather && !isDifficultWeather(m.weather)),
    difficult: matches.filter((m) => m.weather && isDifficultWeather(m.weather)),
  };
}

const average = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

export type FavouriteOutcomes = {
  winPct: number;
  drawPct: number;
  lossPct: number;
  expectedPct: number;
  matches: number;
};

export type LeagueFavouriteOutcomes = {
  normal: FavouriteOutcomes | null;
  difficult: FavouriteOutcomes | null;
};

function favouriteOutcomes(matches: MatchWithWeather[]): FavouriteOutcomes | null {
  const expected: number[] = [];
  let wins = 0;
  let draws = 0;

  for (const match of matches) {
    const odds = matchOdds(match);
    if (!odds || odds.home === odds.away) continue;

    const shares = impliedShares(odds);
    const homeIsFavourite = odds.home < odds.away;
    expected.push(homeIsFavourite ? shares.home : shares.away);

    const goalDiff = match.home_goals - match.away_goals;
    if (goalDiff === 0) draws++;
    else if (homeIsFavourite === goalDiff > 0) wins++;
  }

  const total = expected.length;
  if (total < MIN_MATCHES) return null;

  return {
    winPct: (wins / total) * 100,
    drawPct: (draws / total) * 100,
    lossPct: ((total - wins - draws) / total) * 100,
    expectedPct: average(expected),
    matches: total,
  };
}

export function computeFavouriteOutcomes(
  matches: MatchWithWeather[],
): LeagueFavouriteOutcomes {
  const { normal, difficult } = splitByDifficulty(matches);
  return {
    normal: favouriteOutcomes(normal),
    difficult: favouriteOutcomes(difficult),
  };
}

const totalGoals = (match: MatchWithWeather) =>
  match.home_goals + match.away_goals;

const everyMatch = () => true;

const unchangedStats = [
  {
    key: "over25",
    label: "Ponad 2,5 gola",
    isCounted: everyMatch,
    isMet: (match: MatchWithWeather) => totalGoals(match) > 2.5,
  },
  {
    key: "bothScored",
    label: "Obie strzelają",
    isCounted: everyMatch,
    isMet: (match: MatchWithWeather) =>
      match.home_goals > 0 && match.away_goals > 0,
  },
  {
    key: "goalless",
    label: "Mecz 0:0",
    isCounted: everyMatch,
    isMet: (match: MatchWithWeather) => totalGoals(match) === 0,
  },
  {
    key: "redCard",
    label: "Czerwona kartka",
    isCounted: (match: MatchWithWeather) => match.home_fouls !== null,
    isMet: (match: MatchWithWeather) =>
      (match.home_red_cards ?? 0) + (match.away_red_cards ?? 0) > 0,
  },
];

export type UnchangedStatRow = {
  key: string;
  label: string;
  normalPct: number;
  difficultPct: number;
};

export type LeagueUnchangedStats = {
  biggestChange: number;
  rows: UnchangedStatRow[];
};

export function computeUnchangedStats(
  matches: MatchWithWeather[],
): LeagueUnchangedStats | null {
  const roundedShare = (
    group: MatchWithWeather[],
    stat: (typeof unchangedStats)[number],
  ) => {
    const counted = group.filter(stat.isCounted);
    return counted.length === 0
      ? 0
      : Math.round((counted.filter(stat.isMet).length / counted.length) * 100);
  };

  const { normal, difficult } = splitByDifficulty(matches);
  if (normal.length < MIN_MATCHES || difficult.length < MIN_MATCHES) return null;

  const rows = unchangedStats.map((stat) => ({
    key: stat.key,
    label: stat.label,
    normalPct: roundedShare(normal, stat),
    difficultPct: roundedShare(difficult, stat),
  }));

  return {
    rows,
    biggestChange: Math.max(
      ...rows.map((row) => Math.abs(row.difficultPct - row.normalPct)),
    ),
  };
}

export type LeagueAttendance = {
  difficultPerHundred: number;
  normalMatches: number;
  difficultMatches: number;
};

function attendanceRatios(
  matches: MatchWithWeather[],
  homeAverages: Map<number, number>,
): number[] {
  return matches.flatMap((match) => {
    const norm = homeAverages.get(match.home_team_id);
    return match.attendance && norm ? [match.attendance / norm] : [];
  });
}

export function computeAttendanceByWeather(
  matches: MatchWithWeather[],
): LeagueAttendance | null {
  const attendanceByHome = new Map<number, number[]>();
  for (const match of matches) {
    if (!match.attendance) continue;
    const list = attendanceByHome.get(match.home_team_id);
    if (list) list.push(match.attendance);
    else attendanceByHome.set(match.home_team_id, [match.attendance]);
  }

  const homeAverages = new Map(
    [...attendanceByHome].map(([teamId, values]) => [teamId, average(values)]),
  );

  const split = splitByDifficulty(matches);
  const normal = attendanceRatios(split.normal, homeAverages);
  const difficult = attendanceRatios(split.difficult, homeAverages);
  if (normal.length < MIN_MATCHES || difficult.length < MIN_MATCHES) return null;

  return {
    difficultPerHundred: (average(difficult) / average(normal)) * 100,
    normalMatches: normal.length,
    difficultMatches: difficult.length,
  };
}
