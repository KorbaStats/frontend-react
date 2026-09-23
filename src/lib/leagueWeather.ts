import type { MatchWithWeather } from "@/services/matchesService";
import type { Team } from "@/data/types";
import { computeWeatherScore, type WeatherScore } from "./weatherScore";
import { precipBandFor } from "./weatherProfile";

export type LeagueWeatherSummary = {
  avgTemp: number;
  avgWind: number;
  precipPct: number;
  matchesCount: number;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

export function computeLeagueWeatherSummary(
  matches: MatchWithWeather[],
): LeagueWeatherSummary | null {
  let count = 0;
  let tempSum = 0;
  let windSum = 0;
  let precipCount = 0;

  for (const { weather } of matches) {
    if (!weather) continue;
    count++;
    tempSum += weather.temperature_c;
    windSum += weather.wind_speed_kmh;
    if (
      precipBandFor(weather.precipitation_mm, weather.temperature_c) !== "dry"
    )
      precipCount++;
  }

  if (count === 0) return null;

  return {
    avgTemp: round1(tempSum / count),
    avgWind: round1(windSum / count),
    precipPct: Math.round((precipCount / count) * 100),
    matchesCount: count,
  };
}

// top 5 weather score'ow w lidze
export type TeamWeatherScore = {
  team: Team 
  score: WeatherScore
};

type TeamMatches = { team: Team; matches: MatchWithWeather[] };

function addMatch(
  map: Map<number, TeamMatches>,
  team: Team,
  match: MatchWithWeather,
) {
  const entry = map.get(team.id);
  if (entry) entry.matches.push(match);
  else map.set(team.id, { team, matches: [match] });
}

export function computeTopWeatherScores(
  matches: MatchWithWeather[],
  limit: number = 5,
): TeamWeatherScore[] {
  const teamsMap = new Map<number, TeamMatches>();

  for (const match of matches) {
    addMatch(teamsMap, match.homeTeam, match);
    addMatch(teamsMap, match.awayTeam, match);
  }

  const weatherScores: TeamWeatherScore[] = [];
  for (const { team, matches: teamMatches } of teamsMap.values()) {
    const score = computeWeatherScore(teamMatches, team.id);
    if (score === null) continue;

    weatherScores.push({ team, score });
  }

  return weatherScores
    .sort((a, b) => b.score.score - a.score.score)
    .slice(0, limit);
}
