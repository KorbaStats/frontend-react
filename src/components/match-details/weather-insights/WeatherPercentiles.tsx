import { useEffect, useState } from "react";
import {
  Droplets,
  Gauge,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import {
  getWeatherPercentiles,
  type WeatherMetricKey,
  type WeatherPercentile,
} from "@/services/weatherStatsService";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WeatherPercentilesProps {
  match: MatchWithWeather;
}

type MetricConfig = {
  label: string;
  icon: LucideIcon;
  unit: string;
  decimals: number;
  higher: string;
  lower: string;
};

const metricConfig: Record<WeatherMetricKey, MetricConfig> = {
  temperature_c: {
    label: "Temperatura",
    icon: Thermometer,
    unit: "°C",
    decimals: 1,
    higher: "cieplej",
    lower: "chłodniej",
  },
  wind_speed_kmh: {
    label: "Wiatr",
    icon: Wind,
    unit: " km/h",
    decimals: 0,
    higher: "więcej wiatru",
    lower: "mniej wiatru",
  },
  precipitation_mm: {
    label: "Opady",
    icon: Droplets,
    unit: " mm",
    decimals: 1,
    higher: "więcej opadów",
    lower: "mniej opadów",
  },
  humidity_pct: {
    label: "Wilgotność",
    icon: Gauge,
    unit: "%",
    decimals: 0,
    higher: "wilgotniej",
    lower: "mniej wilgotno",
  },
};

// Liczone z odległości od mediany — 5. i 95. percentyl są tak samo nietypowe.
function extremityLabel(percentiles: WeatherPercentile[]): string | null {
  if (percentiles.length === 0) return null;

  const deviation = Math.max(
    ...percentiles.map((p) => Math.abs(p.percentile - 50)),
  );

  if (deviation >= 40) return "Nietypowe warunki";
  if (deviation >= 25) return "Lekko nietypowe";
  return "Typowe warunki";
}

const PercentileRow = ({ item }: { item: WeatherPercentile }) => {
  const config = metricConfig[item.metric];
  const Icon = config.icon;

  const isAboveMedian = item.percentile >= 50;
  const share = isAboveMedian ? item.percentile : 100 - item.percentile;
  const verb = isAboveMedian ? config.higher : config.lower;

  const format = (value: number) =>
    `${value.toFixed(config.decimals)}${config.unit}`;

  return (
    <div className="rounded-lg border bg-card px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon size={14} className="shrink-0" />
          {config.label}
        </span>
        <span className="text-lg font-semibold tabular-nums text-foreground">
          {format(item.value)}
        </span>
      </div>

      {/* Pasek wypełniony od środka (mediany) do percentyla meczu. Skala jest
          percentylowa, nie w jednostkach. */}
      <div className="relative mt-2.5 h-2.5 overflow-hidden rounded-full bg-muted">
        <span
          aria-hidden
          className="absolute inset-y-0 bg-primary"
          style={{
            left: `${Math.min(50, item.percentile)}%`,
            width: `${Math.abs(item.percentile - 50)}%`,
          }}
        />
        <span
          aria-hidden
          className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-foreground/40"
        />
      </div>

      {/* Norma na sztywno na 50%, żeby stała nad znacznikiem niezależnie od
          szerokości liczb po bokach. */}
      <div className="relative mt-1.5 h-4 text-[10px] text-muted-foreground">
        <span className="absolute left-0">{format(item.min)}</span>
        <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-medium text-foreground">
          norma {format(item.median)}
        </span>
        <span className="absolute right-0">{format(item.max)}</span>
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {verb} niż w {share.toFixed(0)}%
        </span>{" "}
        meczów
      </p>
    </div>
  );
};

const WeatherPercentiles = ({ match }: WeatherPercentilesProps) => {
  const [percentiles, setPercentiles] = useState<WeatherPercentile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const matchId = match.id;
  const leagueId = match.league_id ?? undefined;

  useEffect(() => {
    getWeatherPercentiles(matchId, leagueId)
      .then((data) => {
        setPercentiles(data);
        setError(null);
      })
      .catch((err) => {
        setError("Nie udało się pobrać rozkładu warunków.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [matchId, leagueId]);

  const extremity = extremityLabel(percentiles);
  const matchCount = percentiles[0]?.matchCount ?? 0;

  const placeholder = isLoading
    ? "Ładowanie..."
    : error
      ? error
      : percentiles.length === 0
        ? "Brak danych pogodowych dla tego meczu."
        : null;

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-2 border-b pb-6">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Thermometer className="h-4 w-4 text-primary" />
            Warunki pogodowe na tle całej ligi
          </CardTitle>
          <CardDescription>
            Warunki pogodowe w tym meczu na tle {matchCount || "wszystkich"} meczów
            {match.league ? ` ${match.league.name}` : ""}. Środek toru to norma,
            a wypełnienie pokazuje, jak daleko od niej były te warunki.
          </CardDescription>
        </div>
        {!isLoading && !error && extremity && (
          <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {extremity}
          </span>
        )}
      </CardHeader>

      <CardContent>
        {placeholder ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {placeholder}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 min-[1120px]:grid-cols-4">
            {percentiles.map((item) => (
              <PercentileRow key={item.metric} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherPercentiles;
