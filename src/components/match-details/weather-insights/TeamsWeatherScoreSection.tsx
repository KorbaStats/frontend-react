import { CloudSun } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import type {
  MatchWeatherScoreSide,
  MatchWeatherScores,
  WeatherFactor,
  WeatherFactorDefinitions,
} from "@/data/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WEATHER_FACTORS, getCategoryDefinition } from "@/lib/weatherScore";
import { formatWeatherValue } from "@/lib/weatherFormat";
import { weatherFactorIcons, weatherScoreColor } from "@/lib/weatherStylesConfig";
import WeatherScoreIndicator from "@/components/shared/weather-score/WeatherScoreIndicator";

interface TeamsWeatherScoreSectionProps {
  match: MatchWithWeather;
  weatherScores: MatchWeatherScores | undefined;
  categories: WeatherFactorDefinitions | undefined;
  isPending: boolean;
  errorMessage: string | null;
}

const SideScore = ({ side, factor }: { side: MatchWeatherScoreSide; factor: WeatherFactor }) => {
  const score = side.scores[factor];
  return (
    <span
      className={`text-lg font-bold tabular-nums ${
        score === undefined ? "text-muted-foreground" : weatherScoreColor(score)
      }`}
    >
      {score ?? "—"}
    </span>
  );
};

const TeamsWeatherScoreSection = ({
  match,
  weatherScores,
  categories,
  isPending,
  errorMessage,
}: TeamsWeatherScoreSectionProps) => {
  const message = isPending ? "Ładowanie..." : errorMessage;
  const conditions =
    weatherScores && categories
      ? WEATHER_FACTORS.flatMap((factor) => {
          const category = weatherScores.conditions[factor];
          const definition = category && getCategoryDefinition(categories, factor, category);
          if (!definition) return [];
          const column = categories[factor].column;
          return [
            {
              factor,
              label: definition.label,
              value: formatWeatherValue(column, weatherScores.weather[column]),
            },
          ];
        })
      : [];

  return (
    <Card className="break-inside-avoid">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CloudSun className="h-4 w-4 text-primary" />
          Weather Score drużyn
        </CardTitle>
        <CardDescription>
          Jak każda drużyna gra w takich warunkach jak w tym meczu, na tle swojej
          zwykłej gry. 50 = jak zwykle.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid flex-1 grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-6">
        <WeatherScoreIndicator
          teamName={match.homeTeam.name}
          side={weatherScores?.home}
          message={message}
        />

        {!message && weatherScores && conditions.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h3 className="text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Warunki meczu
            </h3>
            <ul className="flex flex-col gap-2">
              {conditions.map(({ factor, label, value }) => {
                const Icon = weatherFactorIcons[factor];
                return (
                  <li
                    key={factor}
                    className="grid grid-cols-[3rem_1fr_3rem] items-center gap-2 text-center"
                  >
                    <SideScore side={weatherScores.home} factor={factor} />
                    <div className="flex items-center justify-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm">
                      <Icon className="h-4 w-4 shrink-0 text-primary" />
                      <span className="font-medium first-letter:uppercase">{label}</span>
                      <span className="tabular-nums text-muted-foreground">· {value}</span>
                    </div>
                    <SideScore side={weatherScores.away} factor={factor} />
                  </li>
                );
              })}
            </ul>
            <p className="text-center text-xs text-muted-foreground">
              Wynik w pierścieniu to średnia z tych {conditions.length} warunków.
            </p>
          </section>
        ) : (
          <div />
        )}

        <WeatherScoreIndicator
          teamName={match.awayTeam.name}
          side={weatherScores?.away}
          message={message}
        />
      </CardContent>
    </Card>
  );
};

export default TeamsWeatherScoreSection;
