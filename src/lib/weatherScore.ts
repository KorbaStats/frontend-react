import { type MatchWithWeather } from "@/services/matchesService";
import { getMatchFromTeamPerspective } from "./teamStats";
import { isDifficultWeather } from "./weatherProfile";

export const MIN_MATCHES = 5;
const MULTIPLIER = 100 / 3;
const SHRINKAGE_K = 10;

function pointsFor(match: MatchWithWeather, teamId: number): number {
  const result = getMatchFromTeamPerspective(match, teamId).result;

  switch (result) {
    case "W":
      return 3;
    case "D":
      return 1;
    case "L":
      return 0;
  }
}

function averagePoints(matches: MatchWithWeather[], teamId: number): number {
  const sum = matches
    .map((match) => pointsFor(match, teamId))
    .reduce((acc, points) => acc + points, 0);

  return sum / matches.length;
}

export type WeatherScore = {
  score: number;
  difference: number;
  difficultAvg: number;
  normalAvg: number;
  difficultMatches: number;
  normalMatches: number;
  reliability: number;
};

export function computeWeatherScore(
  matches: MatchWithWeather[],
  teamId: number,
): WeatherScore | null {

  const difficult = matches.filter((match) => match.weather !== null && isDifficultWeather(match.weather));
  const normal = matches.filter((match) => match.weather !== null && !isDifficultWeather(match.weather));

  if (normal.length < MIN_MATCHES || difficult.length < MIN_MATCHES) return null;

  const normalAvgPoints = averagePoints(normal, teamId);
  const difficultAvgPoints = averagePoints(difficult, teamId);
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
    reliability,
  }
}

export function weatherScoreLabel(score: number): string {
  if (score <= 34) return "Wyraźnie gorzej w trudnej pogodzie"
  else if (score >= 35 && score <= 44) return "Gorzej w trudnej pogodzie"
  else if (score >= 45 && score <= 54) return "Pogoda nie robi różnicy"
  else if (score >= 55 && score <= 64) return "Lepiej w trudnej pogodzie"
  else if (score >= 65) return "Wyraźnie lepiej w trudnej pogodzie"
  else return "Brak danych";
}