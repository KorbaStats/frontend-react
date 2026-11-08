import type { MatchWithWeather } from "@/services/matchesService";
import { impliedShares, matchOdds } from "./matchOutcomes";
import { MIN_MATCHES } from "./weatherComparison";
import { isDifficultWeather } from "./weatherProfile";

type LeagueGroup = { league: string; matches: MatchWithWeather[] };

function groupByLeague(matches: MatchWithWeather[]): LeagueGroup[] {
  const groups = new Map<string, MatchWithWeather[]>();

  for (const match of matches) {
    if (!match.weather || !match.league) continue;
    const group = groups.get(match.league.name);
    if (group) group.push(match);
    else groups.set(match.league.name, [match]);
  }

  return [...groups]
    .map(([league, leagueMatches]) => ({ league, matches: leagueMatches }))
    .sort((a, b) => a.league.localeCompare(b.league, "pl"));
}

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
  league: string;
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
): LeagueFavouriteOutcomes[] {
  return groupByLeague(matches).map(({ league, matches: leagueMatches }) => {
    const { normal, difficult } = splitByDifficulty(leagueMatches);
    return {
      league,
      normal: favouriteOutcomes(normal),
      difficult: favouriteOutcomes(difficult),
    };
  });
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
  league: string;
  biggestChange: number;
  rows: UnchangedStatRow[];
};

export function computeUnchangedStats(
  matches: MatchWithWeather[],
): LeagueUnchangedStats[] {
  const roundedShare = (
    group: MatchWithWeather[],
    stat: (typeof unchangedStats)[number],
  ) => {
    const counted = group.filter(stat.isCounted);
    return counted.length === 0
      ? 0
      : Math.round((counted.filter(stat.isMet).length / counted.length) * 100);
  };

  return groupByLeague(matches).flatMap(({ league, matches: leagueMatches }) => {
    const { normal, difficult } = splitByDifficulty(leagueMatches);
    if (normal.length < MIN_MATCHES || difficult.length < MIN_MATCHES) return [];

    const rows = unchangedStats.map((stat) => ({
      key: stat.key,
      label: stat.label,
      normalPct: roundedShare(normal, stat),
      difficultPct: roundedShare(difficult, stat),
    }));

    return [
      {
        league,
        rows,
        biggestChange: Math.max(
          ...rows.map((row) => Math.abs(row.difficultPct - row.normalPct)),
        ),
      },
    ];
  });
}

export type LeagueAttendance = {
  league: string;
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
): LeagueAttendance[] {
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

  return groupByLeague(matches).flatMap(({ league, matches: leagueMatches }) => {
    const split = splitByDifficulty(leagueMatches);
    const normal = attendanceRatios(split.normal, homeAverages);
    const difficult = attendanceRatios(split.difficult, homeAverages);
    if (normal.length < MIN_MATCHES || difficult.length < MIN_MATCHES) return [];

    return [
      {
        league,
        difficultPerHundred: (average(difficult) / average(normal)) * 100,
        normalMatches: normal.length,
        difficultMatches: difficult.length,
      },
    ];
  });
}
