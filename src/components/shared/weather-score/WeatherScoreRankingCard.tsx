import { CloudLightning, type LucideIcon } from "lucide-react";

import type { WeatherCategoryKey } from "@/data/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RANKING_MIN_MATCHES, type RankedWeatherScore } from "@/lib/weatherScore";

import WeatherScoreCategoryPicker from "./WeatherScoreCategoryPicker";
import WeatherScoreRankingList from "./WeatherScoreRankingList";

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

  return (
    <Card className="@container break-inside-avoid">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`h-4 w-4 ${iconColor}`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <WeatherScoreCategoryPicker category={category} onChange={onCategoryChange} />
      </CardHeader>

      <CardContent className="px-0">
        {status ? (
          <p className="px-4 py-4 text-center text-sm text-muted-foreground">
            {status}
          </p>
        ) : (
          <WeatherScoreRankingList rows={rows} />
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherScoreRankingCard;
