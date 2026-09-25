import {
  CalendarCheck,
  CloudRain,
  Thermometer,
  Users,
  Wind,
} from "lucide-react";

import { type League } from "@/data/types";
import { Card } from "@/components/ui/card";
import TeamLogo from "@/components/shared/TeamLogo";
import { getLeagueCountryCode } from "@/lib/leagueLabel";
import type { LeagueWeatherSummary } from "@/lib/leagueWeather";
import { weatherConfig } from "@/lib/weatherConfig";

interface LeagueHeaderProps {
  league: League | null;
  seasons: string[];
  selectedSeason: string | null;
  onSeasonChange: (season: string) => void;
  teamsCount: number;
  matchesCount: number;
  weatherSummary: LeagueWeatherSummary | null;
}

const LeagueHeader = ({
  league,
  seasons,
  selectedSeason,
  onSeasonChange,
  teamsCount,
  matchesCount,
  weatherSummary,
}: LeagueHeaderProps) => {
  const weatherItems = weatherSummary && [
    {
      icon: Thermometer,
      style: weatherConfig.clear,
      label: "Śr. temperatura",
      value: `${weatherSummary.avgTemp}°C`,
    },
    {
      icon: CloudRain,
      style: weatherConfig.rain,
      label: "Mecze z opadami",
      value: `${weatherSummary.precipPct}%`,
    },
    {
      icon: Wind,
      style: weatherConfig.wind,
      label: "Śr. wiatr",
      value: `${weatherSummary.avgWind} km/h`,
    },
  ];

  return (
    <Card className="gap-0 py-0 break-inside-avoid">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <TeamLogo
            name={league?.name}
            short_name={league ? getLeagueCountryCode(league) : ""}
          />
          <div>
            <p className="text-md font-bold tracking-widest text-primary">
              {league?.country.toUpperCase()}
            </p>
            <h1 className="mb-1 text-3xl font-bold">{league?.name}</h1>
            <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <dt className="sr-only">Liczba drużyn</dt>
                <Users size={16} />
                <dd>{teamsCount} drużyn</dd>
              </div>
              <div className="flex items-center gap-1">
                <dt className="sr-only">Rozegrane mecze</dt>
                <CalendarCheck size={16} />
                <dd>{matchesCount} meczów</dd>
              </div>
            </dl>
          </div>
        </div>

        <select
          aria-label="Sezon"
          value={selectedSeason ?? ""}
          onChange={(e) => onSeasonChange(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground"
        >
          {seasons.map((s) => (
            <option key={s} value={s}>
              Sezon {s}
            </option>
          ))}
        </select>
      </div>

      {weatherItems && (
        <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t px-4 py-3">
          {weatherItems.map(({ icon: Icon, style, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${style.bg} ${style.text}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex flex-col-reverse leading-tight">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
};

export default LeagueHeader;
