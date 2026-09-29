import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, type LucideIcon } from "lucide-react";

import type { MatchStatsSummary } from "@/data/types";
import { getMatchStatsSummary } from "@/services/matchStatsService";
import type {
  ColdestMatch,
  WeatherGoalsInsights,
} from "@/services/weatherStatsService";
import {
  getColdestMatch,
  getWeatherGoalsInsights,
} from "@/services/weatherStatsService";

import { weatherConfig } from "@/lib/weatherConfig";

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

const SummaryCards = () => {
  const [statsSummary, setStatsSummary] = useState<MatchStatsSummary>();
  const [weatherInsights, setWeatherInsights] =
    useState<WeatherGoalsInsights>();
  const [coldestMatch, setColdestMatch] = useState<ColdestMatch>();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getMatchStatsSummary(),
      getWeatherGoalsInsights(),
      getColdestMatch(),
    ])
      .then(([summary, insights, coldestMatch]) => {
        setStatsSummary(summary);
        setWeatherInsights(insights);
        setColdestMatch(coldestMatch);
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

  const best = weatherInsights?.bestWeatherForGoals;
  const worst = weatherInsights?.worstWeatherForGoals;

  const bestConfig = best && weatherConfig[best.condition];
  const worstConfig = worst && weatherConfig[worst.condition];
  const coldestConfig = coldestMatch && weatherConfig[coldestMatch.condition];

  return (
    <div className="grid grid-cols-2 items-stretch gap-4 xl:grid-cols-4">
      <StatCard
        title="Śledzone mecze"
        Icon={CalendarDays}
        value={statsSummary?.total_matches}
        hint="łącznie w bazie"
      />

      <StatCard
        title="Najlepsza pogoda na gole"
        Icon={bestConfig?.icon}
        value={best?.avgGoals}
        hint={`${bestConfig?.label} · ${best?.matchCount} meczów`}
      />

      <StatCard
        title="Najgorsza pogoda na gole"
        Icon={worstConfig?.icon}
        value={worst?.avgGoals}
        hint={`${worstConfig?.label} · ${worst?.matchCount} meczów`}
      />

      <StatCard
        title="Najzimniejszy mecz"
        Icon={coldestConfig?.icon}
        value={`${coldestMatch?.temperature_c}°C`}
        hint={`${coldestMatch?.city} · ${coldestConfig?.label}`}
      />
    </div>
  );
};

export default SummaryCards;
