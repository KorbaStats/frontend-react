import type { Weather } from "@/data/types";
import { type MatchWithWeather } from "@/services/matchesService";
import { getMatchFromTeamPerspective } from "./teamStats";
import { profileFor } from "./weatherProfile";

const MIN_MATCHES = 5;
const MULTIPLIER = 100 / 3;

// ilosc punktow za dany mecz danej druzyny
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

function isDifficultWeather(weather: Weather): boolean {
  const { temp, precip, wind } = profileFor(weather);
  return (
    temp === "freezing" ||
    temp === "hot" ||
    precip === "heavy" ||
    precip === "snow" ||
    wind === "strong"
  );
}

// srednie punkty druzyny z id=teamId i meczami=matches (przefiltrowane mecze wyzej w logice)
function averagePoints(matches: MatchWithWeather[], teamId: number): number {
  const sum = matches
    .map((match) => pointsFor(match, teamId))
    .reduce((acc, points) => acc + points, 0);

  return sum / matches.length;
}

// weather score for a team
export type WeatherScore = {
  score: number; // 0–100
  difference: number; // R
  difficultAvg: number; // P_T
  normalAvg: number; // P_N
  difficultMatches: number;
  normalMatches: number;
} | null;

export function computeWeatherScore(
  matches: MatchWithWeather[],
  teamId: number,
): WeatherScore | null {

  const difficult = matches.filter((match) => match.weather !== null && isDifficultWeather(match.weather));
  const normal = matches.filter((match) => match.weather !== null && !isDifficultWeather(match.weather));

  //sprawdzenie liczby meczy
  if (normal.length < MIN_MATCHES || difficult.length < MIN_MATCHES) return null;

  const normalAvgPoints = averagePoints(normal, teamId);
  const difficultAvgPoints = averagePoints(difficult, teamId);
  const difference = difficultAvgPoints - normalAvgPoints;
  const weatherScore = Math.round(Math.min(Math.max(50 + difference * MULTIPLIER, 0), 100));

  return {
    score: weatherScore,
    difference: difference,
    difficultAvg: difficultAvgPoints,
    normalAvg: normalAvgPoints,
    difficultMatches: difficult.length,  
    normalMatches: normal.length,
  }
}

export function weatherScoreLabel(score: number): string {
  if (score <= 34) return "Wyraźnie gorzej w trudnej pogodzie"
  else if (score >= 35 && score <= 44) return "Gorzej w trudnej pogodzie"
  else if (score >= 45 && score <= 54) return "Pogoda nie robi różnicy"
  else if (score >= 55 && score <= 64) return "Lepiej w trudnej pogodzie"
  else if (score >= 65) return "Wyraźnie lepiej w trudnej pogodzie"
  else return "Brak danych."
}