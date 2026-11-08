import type {
  Weather,
  WeatherCategoryDefinition,
  WeatherFactor,
  WeatherFactorDefinitions,
} from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import { hasExpectedGoals, matchOdds } from "./matchOutcomes";
import { computeTeamStats } from "./teamStats";
import { WEATHER_FACTORS } from "./weatherScore";

function categoryFor(
  definitions: WeatherFactorDefinitions,
  factor: WeatherFactor,
  weather: Weather,
): WeatherCategoryDefinition | undefined {
  const { column, categories } = definitions[factor];
  const value = weather[column];

  return categories.find(
    ({ min, max }) =>
      (min === null || value >= min) && (max === null || value < max),
  );
}

const usedByWeatherScore = (match: MatchWithWeather) =>
  match.weather !== null && matchOdds(match) !== null && hasExpectedGoals(match);

export type TeamPoints = {
  avgPoints: number | null;
  matches: number;
};

export type ConditionPointsRow = {
  factor: WeatherFactor;
  definition: WeatherCategoryDefinition;
  home: TeamPoints;
  away: TeamPoints;
};

export type ConditionPoints = {
  rows: ConditionPointsRow[];
  usualHome: TeamPoints;
  usualAway: TeamPoints;
};

function pointsOf(matches: MatchWithWeather[], teamId: number): TeamPoints {
  const stats = computeTeamStats(matches, teamId);
  return { avgPoints: stats.avg_points, matches: stats.matches };
}

export function computeConditionPoints(
  definitions: WeatherFactorDefinitions,
  match: MatchWithWeather,
  homeMatches: MatchWithWeather[],
  awayMatches: MatchWithWeather[],
): ConditionPoints | null {
  const { weather } = match;
  if (!weather) return null;

  const scoredHome = homeMatches.filter(usedByWeatherScore);
  const scoredAway = awayMatches.filter(usedByWeatherScore);

  const rows = WEATHER_FACTORS.flatMap((factor) => {
    const definition = categoryFor(definitions, factor, weather);
    if (!definition) return [];

    const inCategory = (m: MatchWithWeather) =>
      categoryFor(definitions, factor, m.weather!)?.name === definition.name;

    return [
      {
        factor,
        definition,
        home: pointsOf(scoredHome.filter(inCategory), match.home_team_id),
        away: pointsOf(scoredAway.filter(inCategory), match.away_team_id),
      },
    ];
  });

  return {
    rows,
    usualHome: pointsOf(scoredHome, match.home_team_id),
    usualAway: pointsOf(scoredAway, match.away_team_id),
  };
}
