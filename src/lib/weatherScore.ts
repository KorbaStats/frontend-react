import type {
  MatchWeatherScores,
  Team,
  TeamWeatherScores,
  WeatherCategoryDefinition,
  WeatherCategoryKey,
  WeatherCategoryScore,
  WeatherFactor,
  WeatherFactorDefinitions,
} from "@/data/types";

export const WEATHER_FACTORS: WeatherFactor[] = ["precipitation", "temperature", "wind"];

export const WEATHER_FACTOR_LABELS: Record<WeatherFactor, string> = {
  precipitation: "Opady",
  temperature: "Temperatura",
  wind: "Wiatr",
};

export const RANKING_MIN_MATCHES = 3;

export const RANKING_CATEGORIES: { key: WeatherCategoryKey; label: string }[] = [
  { key: { factor: "precipitation", category: "heavy" }, label: "Deszcz" },
  { key: { factor: "temperature", category: "low" }, label: "Zimno" },
  { key: { factor: "temperature", category: "high" }, label: "Ciepło" },
  { key: { factor: "wind", category: "strong" }, label: "Wiatr" },
];

export const DEFAULT_RANKING_CATEGORY = RANKING_CATEGORIES[1].key;

export type RankedWeatherScore = {
  team: Team;
  score: WeatherCategoryScore;
};

export function getCategoryScore(
  teamScores: TeamWeatherScores,
  { factor, category }: WeatherCategoryKey,
): WeatherCategoryScore | null {
  const scores: Record<string, WeatherCategoryScore | null> = teamScores.scores[factor];
  return scores[category] ?? null;
}

export function getCategoryDefinition(
  definitions: WeatherFactorDefinitions,
  factor: WeatherFactor,
  category: string,
): WeatherCategoryDefinition | undefined {
  return definitions[factor].categories.find((c) => c.name === category);
}

export function categoryLabel(
  definitions: WeatherFactorDefinitions | undefined,
  { factor, category }: WeatherCategoryKey,
): string {
  const definition = definitions && getCategoryDefinition(definitions, factor, category);
  if (!definition) return WEATHER_FACTOR_LABELS[factor];
  return `${definition.label} (${formatCategoryRange(definition, definitions[factor].unit)})`;
}

export function formatCategoryRange(
  { min, max }: WeatherCategoryDefinition,
  unit: string,
): string {
  const format = (value: number) => value.toLocaleString("pl-PL");
  if (min !== null && max !== null) return `${format(min)}–${format(max)} ${unit}`;
  if (max !== null) return `< ${format(max)} ${unit}`;
  return `≥ ${format(min ?? 0)} ${unit}`;
}

export function toCategoryValue({ factor, category }: WeatherCategoryKey): string {
  return `${factor}:${category}`;
}

export function formatConditions(
  definitions: WeatherFactorDefinitions,
  conditions: MatchWeatherScores["conditions"],
): string {
  return WEATHER_FACTORS.flatMap((factor) => {
    const category = conditions[factor];
    if (!category) return [];
    return getCategoryDefinition(definitions, factor, category)?.label ?? category;
  }).join(" · ");
}

export function rankWeatherScores(
  scores: TeamWeatherScores[],
  teams: Team[],
  key: WeatherCategoryKey,
  order: "best" | "worst",
  limit: number = 5,
): RankedWeatherScore[] {
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const ranked: RankedWeatherScore[] = [];

  for (const teamScores of scores) {
    const team = teamsById.get(teamScores.team_id);
    const score = getCategoryScore(teamScores, key);
    if (team && score && score.matches_count >= RANKING_MIN_MATCHES) {
      ranked.push({ team, score });
    }
  }

  const direction = order === "best" ? -1 : 1;
  return ranked
    .sort(
      (a, b) =>
        direction * (a.score.score - b.score.score) ||
        b.score.matches_count - a.score.matches_count,
    )
    .slice(0, limit);
}

export function weatherScoreLabel(score: number): string {
  if (score <= 34) return "Wyraźnie gorzej niż zwykle";
  if (score <= 44) return "Gorzej niż zwykle";
  if (score <= 54) return "Pogoda nie robi różnicy";
  if (score <= 64) return "Lepiej niż zwykle";
  return "Wyraźnie lepiej niż zwykle";
}
