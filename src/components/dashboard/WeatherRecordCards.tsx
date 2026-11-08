import { useMemo } from "react";
import { Link } from "react-router";
import {
  CloudRain,
  CloudSnow,
  // Sparkles,
  ThermometerSnowflake,
  ThermometerSun,
  Users,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { computeWeatherRecords } from "@/lib/dashboardIndicators";
import { getFormatedDate } from "@/lib/date";
import { formatNumber, formatWeatherValue } from "@/lib/weatherFormat";

import { Card, CardContent } from "@/components/ui/card";

interface WeatherRecordCardsProps {
  matches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
}

type RecordCard = {
  key: string;
  Icon: LucideIcon;
  color: string;
  label: string;
  value: string;
  detail?: string;
  match: MatchWithWeather;
};

const tint = (color: string, pct: number, base = "var(--card)") =>
  `color-mix(in oklab, ${color} ${pct}%, ${base})`;

const WeatherRecordRow = ({
  Icon,
  color,
  label,
  value,
  detail,
  match,
}: Omit<RecordCard, "key">) => {
  const place = [
    getFormatedDate(match.datetime),
    match.stadium?.city,
    detail,
  ].filter(Boolean);

  return (
    <Link
      to={`/match/${match.id}`}
      className="grid flex-1 grid-cols-[2.25rem_minmax(0,1.5fr)_6.5rem_minmax(0,1.5fr)] items-center gap-3 rounded-xl border px-3 py-2 shadow-sm transition-shadow hover:shadow-md"
      style={{
        background: tint(color, 16),
        borderColor: tint(color, 40, "var(--border)"),
      }}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground"
        style={{ background: tint(color, 45) }}
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">{label}</span>
        <span className="truncate text-xs text-muted-foreground">
          {place.join(" · ")}
        </span>
      </div>

      <span className="text-right text-lg font-bold tabular-nums">{value}</span>

      <span className="min-w-0 text-right text-sm font-medium">
        {match.homeTeam.name}{" "}
        <span className="font-bold tabular-nums">
          {match.home_goals}:{match.away_goals}
        </span>{" "}
        {match.awayTeam.name}
      </span>
    </Link>
  );
};

const WeatherRecordCards = ({
  matches,
  isPending,
  isError,
}: WeatherRecordCardsProps) => {
  const records = useMemo(() => computeWeatherRecords(matches), [matches]);

  const { surprise, coldest, hottest, rainiest, windiest, snowiest, biggestFreezingCrowd } =
    records;

  const cards: RecordCard[] = [
    surprise && {
      key: "surprise",
      Icon: Zap,
      color: "var(--weather-clear)",
      label: "Największa niespodzianka",
      value: `kurs ${formatNumber(surprise.odds, 2)}`,
      match: surprise.match,
    },
    coldest && {
      key: "coldest",
      Icon: ThermometerSnowflake,
      color: "var(--weather-extreme-cold)",
      label: "Najzimniejszy mecz",
      value: formatWeatherValue("temperature_c", coldest.weather.temperature_c),
      match: coldest,
    },
    hottest && {
      key: "hottest",
      Icon: ThermometerSun,
      color: "var(--weather-extreme-heat)",
      label: "Najgorętszy mecz",
      value: formatWeatherValue("temperature_c", hottest.weather.temperature_c),
      match: hottest,
    },
    rainiest && {
      key: "rainiest",
      Icon: CloudRain,
      color: "var(--weather-rain)",
      label: "Najwięcej deszczu w meczu",
      value: formatWeatherValue("precipitation_mm", rainiest.weather.precipitation_mm),
      match: rainiest,
    },
    windiest && {
      key: "windiest",
      Icon: Wind,
      color: "var(--weather-wind)",
      label: "Najbardziej witrzny mecz",
      value: formatWeatherValue("wind_speed_kmh", windiest.weather.wind_speed_kmh),
      match: windiest,
    },
    snowiest && {
      key: "snowiest",
      Icon: CloudSnow,
      color: "var(--weather-snow)",
      label: "Najwięcej śniegu",
      value: formatWeatherValue("snowfall_cm", snowiest.weather.snowfall_cm),
      match: snowiest,
    },
    biggestFreezingCrowd && {
      key: "crowd",
      Icon: Users,
      color: "var(--weather-normal)",
      label: "Najwięcej kibiców na mrozie",
      value: (biggestFreezingCrowd.attendance ?? 0).toLocaleString("pl-PL"),
      detail: formatWeatherValue(
        "temperature_c",
        biggestFreezingCrowd.weather.temperature_c,
      ),
      match: biggestFreezingCrowd,
    },
  ].filter((card) => card !== null);

  const placeholder = isPending
    ? "Ładowanie..."
    : isError
      ? "Nie udało się pobrać meczów."
      : cards.length === 0
        ? "Brak meczów."
        : null;

  return (
    <section className="col-span-3 flex flex-col gap-2 print:col-span-1">
      {/* <h2 className="flex items-center gap-2 text-base font-semibold">
        <Sparkles className="h-4 w-4 text-primary" />
        Ciekawostki
      </h2> */}

      {placeholder ? (
        <Card className="flex-1">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {placeholder}
          </CardContent>
        </Card>
      ) : (
        cards.map(({ key, ...card }) => <WeatherRecordRow key={key} {...card} />)
      )}
    </section>
  );
};

export default WeatherRecordCards;
