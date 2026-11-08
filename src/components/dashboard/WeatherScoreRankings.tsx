import { CloudSun, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import type { WeatherCategoryKey } from "@/data/types";
import { RANKING_MIN_MATCHES, type RankedWeatherScore } from "@/lib/weatherScore";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WeatherScoreCategoryPicker from "@/components/shared/weather-score/WeatherScoreCategoryPicker";
import WeatherScoreRankingList from "@/components/shared/weather-score/WeatherScoreRankingList";

interface WeatherScoreRankingsProps {
  best: RankedWeatherScore[];
  worst: RankedWeatherScore[];
  categoryText: string;
  category: WeatherCategoryKey;
  onCategoryChange: (category: WeatherCategoryKey) => void;
  isPending: boolean;
  isError: boolean;
}

const RankingColumn = ({
  Icon,
  iconColor,
  title,
  rows,
}: {
  Icon: LucideIcon;
  iconColor: string;
  title: string;
  rows: RankedWeatherScore[];
}) => (
  <div className="@container min-w-0">
    <h3 className="flex items-center gap-2 px-4 pb-2 text-sm font-semibold">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      {title}
    </h3>
    <WeatherScoreRankingList rows={rows} showScoreBar />
  </div>
);

const WeatherScoreRankings = ({
  best,
  worst,
  categoryText,
  category,
  onCategoryChange,
  isPending,
  isError,
}: WeatherScoreRankingsProps) => {
  const status = isPending
    ? "Ładowanie..."
    : isError
      ? "Nie udało się pobrać weather score."
      : best.length === 0
        ? `Brak drużyn z co najmniej ${RANKING_MIN_MATCHES} meczami w tych warunkach.`
        : null;

  return (
    <Card className="col-span-2 break-inside-avoid print:col-span-1">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CloudSun className="h-4 w-4 text-primary" />
          Weather Score drużyn
        </CardTitle>
        <CardDescription>Wszystkie ligi i sezony · {categoryText}</CardDescription>
        <WeatherScoreCategoryPicker category={category} onChange={onCategoryChange} />
      </CardHeader>

      <CardContent className="px-0">
        {status ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {status}
          </p>
        ) : (
          <div className="grid grid-cols-2 divide-x print:grid-cols-1 print:divide-x-0">
            <RankingColumn
              Icon={TrendingUp}
              iconColor="text-primary"
              title="Najlepsi"
              rows={best}
            />
            <RankingColumn
              Icon={TrendingDown}
              iconColor="text-destructive"
              title="Najsłabsi"
              rows={worst}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherScoreRankings;
