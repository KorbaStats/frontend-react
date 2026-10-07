import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  CloudLightning,
  ThermometerSnowflake,
  Wind,
  type LucideIcon,
} from "lucide-react";

import type { MatchStatsSummary } from "@/data/types";
import { getMatchStatsSummary } from "@/services/matchStatsService";
import type {
  DifficultWeatherShare,
  ExtremeMatch,
  WeatherExtremes,
} from "@/services/weatherStatsService";
import {
  getDifficultWeatherShare,
  getWeatherExtremes,
} from "@/services/weatherStatsService";

import { weatherDisplay, weatherDisplayFor } from "@/lib/weatherStylesConfig";

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

const SummaryCards = () => {
  const [statsSummary, setStatsSummary] = useState<MatchStatsSummary>();
  const [extremes, setExtremes] = useState<WeatherExtremes>();
  const [difficultShare, setDifficultShare] = useState<DifficultWeatherShare>();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getMatchStatsSummary(),
      getWeatherExtremes(),
      getDifficultWeatherShare(),
    ])
      .then(([summary, extremes, difficultShare]) => {
        setStatsSummary(summary);
        setExtremes(extremes);
        setDifficultShare(difficultShare);
      })
      .catch((err) => {
        setError("Pobieranie statystyk nie powiodło się.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-destructive">
          {error}
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
    <div className="grid grid-cols-2 items-stretch gap-4 xl:grid-cols-4">
      <StatCard
        title="Śledzone mecze"
        Icon={CalendarDays}
        value={statsSummary?.total_matches}
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
        value={`${coldest?.weather.temperature_c}°C`}
        hint={extremeHint(coldest)}
      />

      <StatCard
        title="Najbardziej wietrzny mecz"
        Icon={Wind}
        value={`${windiest?.weather.wind_speed_kmh} km/h`}
        hint={extremeHint(windiest)}
      />
    </div>
  );
};

export default SummaryCards;
