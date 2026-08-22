import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

import type { MatchStatsSummary } from "@/data/types";
import { getMatchStatsSummary } from "@/services/matchStatsService";
import type { ColdestMatch, WeatherGoalsInsights } from "@/services/weatherStatsService";
import { getColdestMatch, getWeatherGoalsInsights } from "@/services/weatherStatsService";


import { weatherConfig } from "@/lib/weatherConfig";

const SummaryCards = () => {
  const [statsSummary, setStatsSummary] = useState<MatchStatsSummary>();
  const [weatherInsights, setWeatherInsights] = useState<WeatherGoalsInsights>();
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

  const bestWeatherConfig =
    weatherInsights && weatherConfig[weatherInsights.bestWeatherForGoals.condition];
  const worstWeatherConfig =
    weatherInsights && weatherConfig[weatherInsights.worstWeatherForGoals.condition];

  const BestIcon = bestWeatherConfig?.icon;
  const WorstIcon = worstWeatherConfig?.icon;

  const coldestConfig = coldestMatch && weatherConfig[coldestMatch.condition];
  const ColdestIcon = coldestConfig?.icon;

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 items-stretch">
      {/* Ilość meczy */}
      <Card className="flex flex-col">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-muted-foreground text-xs">
            Śledzone mecze
          </CardTitle>
          <CalendarDays size={16} className="text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <span className="text-3xl font-bold">
            {statsSummary?.total_matches}
          </span>
          <p className="text-xs text-muted-foreground mt-1">łącznie w bazie</p>
        </CardContent>
      </Card>

      {/* Najlepsza pogoda do bramek */}
      <Card className="flex flex-col">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-muted-foreground text-xs">
            Najlepsza pogoda na gole
          </CardTitle>
          {BestIcon && <BestIcon size={16} className="text-muted-foreground" />}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <span className="text-3xl font-bold">
            {weatherInsights?.bestWeatherForGoals.avgGoals}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {bestWeatherConfig?.label} · {weatherInsights?.bestWeatherForGoals.matchCount}{" "}
            meczów
          </p>
        </CardContent>
      </Card>
{/* 
                  <span className={`text-2xl font-bold ${stylesConfig.bg}`} key={m.id}>
              {stylesConfig.text}
            </span> */}

      {/* Najgorsza pogoda do bramek */}
      <Card className="flex flex-col">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-muted-foreground text-xs">
            Najgorsza pogoda na gole
          </CardTitle>
          {WorstIcon && (
            <WorstIcon size={16} className="text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <span className="text-3xl font-bold">
            {weatherInsights?.worstWeatherForGoals.avgGoals}
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {worstWeatherConfig?.label} · {weatherInsights?.worstWeatherForGoals.matchCount}{" "}
            meczów
          </p>
        </CardContent>
      </Card>

      {/* Najzimniejszy mecz */}
      <Card className="flex flex-col">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-muted-foreground text-xs">
            Najzimniejszy mecz
          </CardTitle>
          {ColdestIcon && (
            <ColdestIcon size={16} className="text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <span className="text-3xl font-bold">
            {coldestMatch?.temperature_c}°C
          </span>
          <p className="text-xs text-muted-foreground mt-1">
            {coldestMatch?.city} · {coldestConfig?.label}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
