import { Link } from "react-router";
import {
  CloudLightning,
  CloudRain,
  ThermometerSnowflake,
  ThermometerSun,
  Wind,
  type LucideIcon,
} from "lucide-react";

import type { WeatherCategoryKey } from "@/data/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  RANKING_CATEGORIES,
  RANKING_MIN_MATCHES,
  toCategoryValue,
  weatherScoreLabel,
  type RankedWeatherScore,
} from "@/lib/weatherScore";
import { weatherScoreColor } from "@/lib/weatherStylesConfig";
import { getTeamShortName } from "@/lib/teamLabel";

const categoryIcons: Record<string, LucideIcon> = {
  "precipitation:heavy": CloudRain,
  "temperature:low": ThermometerSnowflake,
  "temperature:high": ThermometerSun,
  "wind:strong": Wind,
};

interface WeatherScoreRankingCardProps {
  Icon?: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
  rows: RankedWeatherScore[];
  category: WeatherCategoryKey;
  onCategoryChange: (category: WeatherCategoryKey) => void;
  isPending: boolean;
  isError: boolean;
}

const WeatherScoreRankingCard = ({
  Icon = CloudLightning,
  iconColor = "text-primary",
  title,
  description,
  rows,
  category,
  onCategoryChange,
  isPending,
  isError,
}: WeatherScoreRankingCardProps) => {
  const status = isPending
    ? "Ładowanie..."
    : isError
      ? "Nie udało się pobrać weather score."
      : rows.length === 0
        ? `Brak drużyn z co najmniej ${RANKING_MIN_MATCHES} meczami w tych warunkach.`
        : null;
  const selected = toCategoryValue(category);

  return (
    <Card className="@container break-inside-avoid">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-2 flex flex-wrap gap-2">
          {RANKING_CATEGORIES.map(({ key, label }) => {
            const value = toCategoryValue(key);
            const Icon = categoryIcons[value];
            const active = value === selected;
            return (
              <Button
                key={value}
                variant={active ? "secondary" : "outline"}
                size="sm"
                className="rounded-full"
                aria-pressed={active}
                onClick={() => onCategoryChange(key)}
              >
                <Icon />
                {label}
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {status ? (
          <p className="px-4 py-4 text-center text-sm text-muted-foreground">
            {status}
          </p>
        ) : (
          <ol className="divide-y">
            {rows.map(({ team, score }, idx) => (
              <li key={team.id} className="flex items-center gap-3 px-4 py-2">
                <span className="w-4 shrink-0 text-center text-sm tabular-nums text-muted-foreground">
                  {idx + 1}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-secondary/20 text-[10px] font-extrabold">
                  {getTeamShortName(team)}
                </span>

                <div className="flex min-w-0 flex-col leading-tight">
                  <Link
                    to={`/team/${team.id}`}
                    className="truncate font-medium text-foreground hover:text-primary"
                  >
                    {team.name}
                  </Link>
                  <span className="hidden truncate text-xs text-muted-foreground @sm:inline">
                    {weatherScoreLabel(score.score)}
                  </span>
                </div>

                <div className="ml-auto flex shrink-0 flex-col items-end leading-tight">
                  <span
                    className={`text-lg font-bold tabular-nums ${weatherScoreColor(score.score)}`}
                  >
                    {score.score}
                  </span>
                  <span className="hidden text-xs tabular-nums text-muted-foreground @sm:inline">
                    meczów: {score.matches_count}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherScoreRankingCard;
