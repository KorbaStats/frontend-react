import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  CloudLightning,
  ThermometerSnowflake,
  Wind,
  type LucideIcon,
} from "lucide-react";

import type { MatchStatsSummary } from "@/data/types";
import type {
  DifficultWeatherShare,
  ExtremeMatch,
  WeatherExtremes,
} from "@/lib/weatherStats";
import { weatherDisplay, weatherDisplayFor } from "@/lib/weatherStylesConfig";
import { formatWeatherValue } from "@/lib/weatherFormat";

interface SummaryCardsProps {
  summary?: MatchStatsSummary;
  extremes?: WeatherExtremes;
  difficultShare?: DifficultWeatherShare;
  isPending: boolean,
  isError: boolean,
}

interface StatCardProps {
  title: string;
  Icon?: LucideIcon;
  value: React.ReactNode;
  hint: string;
}

const StatCard = ({ title, Icon, value, hint }: StatCardProps) => (
  <Card className="flex flex-col border-primary/20 bg-primary/5">
    <CardHeader className="flex items-center justify-between">
      <CardTitle className="text-xs text-muted-foreground">{title}</CardTitle>
      {Icon && (
        <span className="rounded-md bg-primary/10 p-1.5">
          <Icon size={16} className="text-primary" />
        </span>
      )}
    </CardHeader>
    <CardContent className="flex flex-1 flex-col justify-end">
      <span className="text-3xl font-bold text-primary">{value}</span>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </CardContent>
  </Card>
);

const extremeHint = (match: ExtremeMatch | null | undefined) =>
  match ? `${match.city} · ${weatherDisplay[weatherDisplayFor(match.weather)].label}` : "";

const SummaryCards = ({summary, extremes, difficultShare, isPending, isError}: SummaryCardsProps) => {

  if (isPending) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-destructive">
          Nie udało się pobrać danych
        </CardContent>
      </Card>
    );
  }

  const coldest = extremes?.coldest;
  const windiest = extremes?.windiest;

  const difficultPct =
    difficultShare && difficultShare.withWeather > 0
      ? Math.round((difficultShare.difficult / difficultShare.withWeather) * 100)
      : 0;

  return (
    <div className="grid grid-cols-4 items-stretch gap-4">
      <StatCard
        title="Śledzone mecze"
        Icon={CalendarDays}
        value={summary?.total_matches}
        hint="łącznie w bazie"
      />

      <StatCard
        title="Mecze w trudnej pogodzie"
        Icon={CloudLightning}
        value={difficultShare?.difficult}
        hint={`${difficultPct}% wszystkich meczów`}
      />

      <StatCard
        title="Najzimniejszy mecz"
        Icon={ThermometerSnowflake}
        value={formatWeatherValue(
          "temperature_c",
          coldest?.weather.temperature_c,
        )}
        hint={extremeHint(coldest)}
      />

      <StatCard
        title="Najbardziej wietrzny mecz"
        Icon={Wind}
        value={formatWeatherValue(
          "wind_speed_kmh",
          windiest?.weather.wind_speed_kmh,
        )}
        hint={extremeHint(windiest)}
      />
    </div>
  );
};

export default SummaryCards;
