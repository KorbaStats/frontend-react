import { type MatchWithWeather } from "@/services/matchesService";
import {
  computeTeamStats,
  type TeamStats,
} from "./teamStats";
import { isDifficultWeather } from "./weatherProfile";

export const MIN_MATCHES = 5;
const MULTIPLIER = 100 / 3;
const SHRINKAGE_K = 10;


type MatchResults = Pick<TeamStats, "wins" | "draws" | "losses">;

export type WeatherScore = {
  score: number;
  difference: number;
  difficultAvg: number;
  normalAvg: number;
  difficultMatches: number;
  normalMatches: number;
  difficultResults: MatchResults;
  normalResults: MatchResults;
  reliability: number;
};

export function computeWeatherScore(
  matches: MatchWithWeather[],
  teamId: number,
): WeatherScore | null {
  const difficult = matches.filter(
    (match) => match.weather !== null && isDifficultWeather(match.weather),
  );
  const normal = matches.filter(
    (match) => match.weather !== null && !isDifficultWeather(match.weather),
  );

  if (normal.length < MIN_MATCHES || difficult.length < MIN_MATCHES)
    return null;

  const difficultStats = computeTeamStats(difficult, teamId);
  const difficultResults = {
    wins: difficultStats.wins,
    draws: difficultStats.draws,
    losses: difficultStats.losses,
  };
  const normalStats = computeTeamStats(normal, teamId);
  const normalResults = {
    wins: normalStats.wins,
    draws: normalStats.draws,
    losses: normalStats.losses,
  };

  const difficultAvgPoints = difficultStats.avg_points ?? 0;
  const normalAvgPoints = normalStats.avg_points ?? 0;
  const difference = difficultAvgPoints - normalAvgPoints;

  const sampleSize = Math.min(difficult.length, normal.length);
  const reliability = sampleSize / (sampleSize + SHRINKAGE_K);

  const weatherScore = Math.round(
    Math.min(Math.max(50 + difference * MULTIPLIER * reliability, 0), 100),
  );

  return {
    score: weatherScore,
    difference: difference,
    difficultAvg: difficultAvgPoints,
    normalAvg: normalAvgPoints,
    difficultMatches: difficult.length,
    normalMatches: normal.length,
    difficultResults,
    normalResults,
    reliability,
  };
}

export function computeTeamWeatherScore(
  teamMatches: MatchWithWeather[],
  teamId: number,
  season: string | null,
): WeatherScore | null {
  const scoped = season
    ? teamMatches.filter((match) => match.season === season)
    : teamMatches;

  return computeWeatherScore(scoped, teamId);
}

export function weatherScoreLabel(score: number): string {
  if (score <= 34) return "Wyraźnie gorzej w trudnej pogodzie";
  else if (score >= 35 && score <= 44) return "Gorzej w trudnej pogodzie";
  else if (score >= 45 && score <= 54) return "Pogoda nie robi różnicy";
  else if (score >= 55 && score <= 64) return "Lepiej w trudnej pogodzie";
  else if (score >= 65) return "Wyraźnie lepiej w trudnej pogodzie";
  else return "Brak danych";
}
