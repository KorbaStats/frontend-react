import type { Team, Weather } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import { impliedShares, matchOdds } from "./matchOutcomes";
import { computeTeamStats } from "./teamStats";
import { MIN_MATCHES } from "./weatherComparison";
import { isDifficultWeather, tempBandFor } from "./weatherProfile";

export const MIN_TEAM_MATCHES = 8;
export const MIN_HOME_MATCHES = 5;
export const MEANINGFUL_POINTS_DIFF = 0.1;
export const STRONG_FAVOURITE_PCT = 60;

const TOP_TEAMS = 3;
const TOP_ATTENDANCE_DROPS = 5;

type KnownWeatherMatch = MatchWithWeather & { weather: Weather };

const hasWeather = (match: MatchWithWeather): match is KnownWeatherMatch =>
  match.weather !== null;

const average = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

export type DataCoverage = {
  matches: number;
  difficult: number;
  difficultPct: number;
  leagues: number;
  seasons: number;
};

export function computeDataCoverage(matches: MatchWithWeather[]): DataCoverage {
  const known = matches.filter(hasWeather);
  const difficult = known.filter((m) => isDifficultWeather(m.weather)).length;

  return {
    matches: matches.length,
    difficult,
    difficultPct: known.length === 0 ? 0 : Math.round((difficult / known.length) * 100),
    leagues: new Set(matches.map((m) => m.league_id)).size,
    seasons: new Set(matches.map((m) => m.season)).size,
  };
}

type TeamSplit = {
  team: Team;
  normal: KnownWeatherMatch[];
  difficult: KnownWeatherMatch[];
};

function splitByTeam(matches: MatchWithWeather[]): TeamSplit[] {
  const teams = new Map<number, TeamSplit>();

  const add = (team: Team, teamId: number, match: KnownWeatherMatch) => {
    const split = teams.get(teamId) ?? { team, normal: [], difficult: [] };
    (isDifficultWeather(match.weather) ? split.difficult : split.normal).push(match);
    teams.set(teamId, split);
  };

  for (const match of matches.filter(hasWeather)) {
    add(match.homeTeam, match.home_team_id, match);
    add(match.awayTeam, match.away_team_id, match);
  }

  return [...teams.values()];
}

export type TeamPointsChange = {
  team: Team;
  normalPoints: number;
  difficultPoints: number;
  difficultMatches: number;
};

export type TeamWeatherEffect = {
  teams: number;
  better: number;
  same: number;
  worse: number;
  gainers: TeamPointsChange[];
  losers: TeamPointsChange[];
};

export function computeTeamWeatherEffect(
  matches: MatchWithWeather[],
): TeamWeatherEffect {
  const rows = splitByTeam(matches).flatMap(({ team, normal, difficult }) => {
    if (normal.length < MIN_TEAM_MATCHES || difficult.length < MIN_TEAM_MATCHES) {
      return [];
    }

    return [
      {
        team,
        normalPoints: computeTeamStats(normal, team.id).avg_points ?? 0,
        difficultPoints: computeTeamStats(difficult, team.id).avg_points ?? 0,
        difficultMatches: difficult.length,
      },
    ];
  });

  const change = (row: TeamPointsChange) => row.difficultPoints - row.normalPoints;
  const better = rows.filter((row) => change(row) >= MEANINGFUL_POINTS_DIFF).length;
  const worse = rows.filter((row) => change(row) <= -MEANINGFUL_POINTS_DIFF).length;
  const sorted = [...rows].sort((a, b) => change(b) - change(a));

  return {
    teams: rows.length,
    better,
    worse,
    same: rows.length - better - worse,
    gainers: sorted.slice(0, TOP_TEAMS).filter((row) => change(row) > 0),
    losers: sorted.slice(-TOP_TEAMS).reverse().filter((row) => change(row) < 0),
  };
}

export type TeamAttendanceChange = {
  team: Team;
  normalCrowd: number;
  difficultCrowd: number;
  changePct: number;
  difficultMatches: number;
};

export function computeBiggestAttendanceDrops(
  matches: MatchWithWeather[],
): TeamAttendanceChange[] {
  const attendance = (list: KnownWeatherMatch[], teamId: number) =>
    list.flatMap((m) =>
      m.home_team_id === teamId && m.attendance ? [m.attendance] : [],
    );

  const rows = splitByTeam(matches).flatMap(({ team, normal, difficult }) => {
    const normalCrowds = attendance(normal, team.id);
    const difficultCrowds = attendance(difficult, team.id);
    if (
      normalCrowds.length < MIN_HOME_MATCHES ||
      difficultCrowds.length < MIN_HOME_MATCHES
    ) {
      return [];
    }

    const normalCrowd = average(normalCrowds);
    const difficultCrowd = average(difficultCrowds);

    return [
      {
        team,
        normalCrowd,
        difficultCrowd,
        changePct: (difficultCrowd / normalCrowd - 1) * 100,
        difficultMatches: difficultCrowds.length,
      },
    ];
  });

  return rows
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, TOP_ATTENDANCE_DROPS)
    .filter((row) => row.changePct < 0);
}

export type StrongFavouriteResult = {
  expectedPct: number;
  winPct: number;
  matches: number;
};

export type StrongFavourite = {
  normal: StrongFavouriteResult;
  difficult: StrongFavouriteResult;
};

function strongFavouriteResult(
  matches: KnownWeatherMatch[],
): StrongFavouriteResult | null {
  const expected: number[] = [];
  let wins = 0;

  for (const match of matches) {
    const odds = matchOdds(match);
    if (!odds || odds.home === odds.away) continue;

    const shares = impliedShares(odds);
    const homeIsFavourite = odds.home < odds.away;
    const favouriteShare = homeIsFavourite ? shares.home : shares.away;
    if (favouriteShare < STRONG_FAVOURITE_PCT) continue;

    expected.push(favouriteShare);
    const goalDiff = match.home_goals - match.away_goals;
    if (goalDiff !== 0 && homeIsFavourite === goalDiff > 0) wins++;
  }

  if (expected.length < MIN_MATCHES) return null;

  return {
    expectedPct: average(expected),
    winPct: (wins / expected.length) * 100,
    matches: expected.length,
  };
}

export function computeStrongFavourite(
  matches: MatchWithWeather[],
): StrongFavourite | null {
  const known = matches.filter(hasWeather);
  const normal = strongFavouriteResult(
    known.filter((m) => !isDifficultWeather(m.weather)),
  );
  const difficult = strongFavouriteResult(
    known.filter((m) => isDifficultWeather(m.weather)),
  );

  return normal && difficult ? { normal, difficult } : null;
}

function matchWithHighest(
  matches: KnownWeatherMatch[],
  value: (match: KnownWeatherMatch) => number,
): KnownWeatherMatch | null {
  return matches.reduce<KnownWeatherMatch | null>(
    (best, match) => (!best || value(match) > value(best) ? match : best),
    null,
  );
}

export type SurpriseRecord = {
  match: KnownWeatherMatch;
  odds: number;
};

export type WeatherRecords = {
  surprise: SurpriseRecord | null;
  coldest: KnownWeatherMatch | null;
  hottest: KnownWeatherMatch | null;
  rainiest: KnownWeatherMatch | null;
  windiest: KnownWeatherMatch | null;
  snowiest: KnownWeatherMatch | null;
  biggestFreezingCrowd: KnownWeatherMatch | null;
};

function biggestSurprise(matches: KnownWeatherMatch[]): SurpriseRecord | null {
  let record: SurpriseRecord | null = null;

  for (const match of matches) {
    const odds = matchOdds(match);
    if (!odds || match.home_goals === match.away_goals) continue;

    const winnerOdds = match.home_goals > match.away_goals ? odds.home : odds.away;
    if (!record || winnerOdds > record.odds) {
      record = { match, odds: winnerOdds };
    }
  }

  return record;
}

export function computeWeatherRecords(matches: MatchWithWeather[]): WeatherRecords {
  const known = matches.filter(hasWeather);

  return {
    surprise: biggestSurprise(known),
    coldest: matchWithHighest(known, (m) => -m.weather.temperature_c),
    hottest: matchWithHighest(known, (m) => m.weather.temperature_c),
    rainiest: matchWithHighest(
      known.filter((m) => m.weather.precipitation_mm > 0),
      (m) => m.weather.precipitation_mm,
    ),
    windiest: matchWithHighest(known, (m) => m.weather.wind_speed_kmh),
    snowiest: matchWithHighest(
      known.filter((m) => m.weather.snowfall_cm > 0),
      (m) => m.weather.snowfall_cm,
    ),
    biggestFreezingCrowd: matchWithHighest(
      known.filter(
        (m) => m.attendance && tempBandFor(m.weather.temperature_c) === "freezing",
      ),
      (m) => m.attendance ?? 0,
    ),
  };
}
