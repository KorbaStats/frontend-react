import { Link } from "react-router";
import { CloudLightning, MapPin } from "lucide-react";

import type {
  Fixture,
  FixtureWeatherScore,
  MatchWeatherScoreSide,
  Team,
  WeatherFactor,
  WeatherFactorDefinitions,
} from "@/data/types";
import { Card, CardContent } from "@/components/ui/card";
import { getLocalTime } from "@/lib/date";
import { WEATHER_FACTORS, getCategoryDefinition } from "@/lib/weatherScore";
import { formatWeatherValue } from "@/lib/weatherFormat";
import { isDifficultConditions } from "@/lib/weatherProfile";
import { weatherFactorIcons, weatherScoreColor } from "@/lib/weatherStylesConfig";
import FavouriteStar from "@/components/shared/FavouriteStar";

// różnica weather score poniżej tej wartości - pogoda nie faworyzuje żadnej drużyny
export const NEUTRAL_DIFFERENCE = 3;

interface PredictionCardProps {
  fixture: Fixture;
  prediction: FixtureWeatherScore;
  categories: WeatherFactorDefinitions | undefined;
}

const TeamSide = ({
  team,
  side,
  align,
}: {
  team: Team | null;
  side: MatchWeatherScoreSide;
  align: "left" | "right";
}) => (
  <div
    className={`flex min-w-0 flex-col gap-1 ${
      align === "left" ? "items-start text-left" : "items-end text-right"
    }`}
  >
    <div
      className={`flex max-w-full items-center gap-1 ${
        align === "right" ? "flex-row-reverse" : ""
      }`}
    >
      <Link
        to={`/team/${side.team_id}`}
        className="truncate font-semibold hover:text-primary"
      >
        {team?.name ?? side.team_name}
      </Link>
      <FavouriteStar teamId={side.team_id} size={14} />
    </div>
    <span
      className={`text-3xl font-bold tabular-nums ${
        side.weather_score === null
          ? "text-muted-foreground"
          : weatherScoreColor(side.weather_score)
      }`}
    >
      {side.weather_score === null ? "—" : Math.round(side.weather_score)}
    </span>
    {!side.scores_computed && (
      <span className="text-xs text-muted-foreground">
        brak historii - wartość neutralna
      </span>
    )}
  </div>
);

const FactorScore = ({
  side,
  factor,
}: {
  side: MatchWeatherScoreSide;
  factor: WeatherFactor;
}) => {
  const score = side.scores[factor];
  return (
    <span
      className={`text-sm font-semibold tabular-nums ${
        score === undefined ? "text-muted-foreground" : weatherScoreColor(score)
      }`}
    >
      {score ?? "—"}
    </span>
  );
};

function verdict(prediction: FixtureWeatherScore, fixture: Fixture): string {
  const { difference, favored_team_id, home, away } = prediction;
  if (difference === null) return "Brak prognozy dla żadnego z czynników.";
  if (Math.abs(difference) < NEUTRAL_DIFFERENCE || favored_team_id === null) {
    return "Pogoda nie faworyzuje żadnej z drużyn.";
  }
  const favoured = favored_team_id === home.team_id ? home : away;
  const team = favored_team_id === home.team_id ? fixture.homeTeam : fixture.awayTeam;
  const value = Math.abs(difference).toLocaleString("pl-PL", { maximumFractionDigits: 1 });
  return `Prognozowana pogoda sprzyja: ${team?.name ?? favoured.team_name} (+${value} pkt Weather Score).`;
}

const PredictionCard = ({ fixture, prediction, categories }: PredictionCardProps) => {
  const difficult = isDifficultConditions(prediction.conditions);

  const conditions = categories
    ? WEATHER_FACTORS.flatMap((factor) => {
        const category = prediction.conditions[factor];
        const definition = category && getCategoryDefinition(categories, factor, category);
        if (!definition) return [];
        const column = categories[factor].column;
        return [
          {
            factor,
            label: definition.label,
            value: formatWeatherValue(column, prediction.weather[column]),
          },
        ];
      })
    : [];

  const venue = fixture.venue_name ?? fixture.stadium?.name;

  return (
    <Card className="break-inside-avoid">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-foreground tabular-nums">
              {getLocalTime(fixture.datetime)}
            </span>
            {fixture.league?.name}
            {fixture.round !== null && ` · ${fixture.round}. kolejka`}
          </span>
          <span className="flex items-center gap-2">
            {difficult && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--weather-difficult)]/15 px-2 py-0.5 font-medium text-foreground">
                <CloudLightning className="h-3.5 w-3.5" />
                Trudna pogoda
              </span>
            )}
            {venue && (
              <span className="hidden items-center gap-1 sm:inline-flex">
                <MapPin className="h-3.5 w-3.5" />
                {venue}
              </span>
            )}
          </span>
        </div>

        {/* telefon: drużyny obok siebie, warunki pod nimi; szerszy ekran: warunki pośrodku */}
        <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)]">
          <TeamSide team={fixture.homeTeam} side={prediction.home} align="left" />

          <ul className="order-last col-span-2 flex flex-col gap-1.5 sm:order-none sm:col-span-1">
            {conditions.map(({ factor, label, value }) => {
              const Icon = weatherFactorIcons[factor];
              return (
                <li
                  key={factor}
                  className="grid grid-cols-[2rem_1fr_2rem] items-center gap-1 text-center"
                >
                  <FactorScore side={prediction.home} factor={factor} />
                  <div className="flex min-w-0 items-center justify-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate font-medium first-letter:uppercase">
                      {label}
                    </span>
                    <span className="hidden shrink-0 tabular-nums text-muted-foreground md:inline">
                      · {value}
                    </span>
                  </div>
                  <FactorScore side={prediction.away} factor={factor} />
                </li>
              );
            })}
          </ul>

          <TeamSide team={fixture.awayTeam} side={prediction.away} align="right" />
        </div>

        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          {verdict(prediction, fixture)}
        </p>
      </CardContent>
    </Card>
  );
};

export default PredictionCard;
