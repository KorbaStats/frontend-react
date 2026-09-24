import { Link } from "react-router";
import {
  CalendarCheck,
  ChevronRight,
  CloudRain,
  Thermometer,
  Users,
  Wind,
} from "lucide-react";

import type { LeagueSummary } from "@/lib/leagueSummaries";
import { getLeagueCountryCode } from "@/lib/leagueLabel";
import { weatherConfig } from "@/lib/weatherConfig";

import { Card } from "@/components/ui/card";
import TeamLogo from "@/components/shared/TeamLogo";

const LeagueCard = ({
  league,
  teamsCount,
  matchesCount,
  weather,
}: LeagueSummary) => {
  const weatherItems = weather && [
    {
      icon: Thermometer,
      style: weatherConfig.clear,
      label: "Śr. temp.",
      value: `${weather.avgTemp}°C`,
    },
    {
      icon: CloudRain,
      style: weatherConfig.rain,
      label: "Z opadami",
      value: `${weather.precipPct}%`,
    },
    {
      icon: Wind,
      style: weatherConfig.wind,
      label: "Śr. wiatr",
      value: `${weather.avgWind} km/h`,
    },
  ];

  return (
    <Card className="gap-0 py-0 transition-colors hover:border-primary/50">
      <Link to={`/league/${league.id}`} className="flex flex-col">
        <div className="flex items-center gap-4 p-4">
          <TeamLogo
            name={league.name}
            short_name={getLeagueCountryCode(league)}
          />
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-widest text-primary">
              {league.country.toUpperCase()}
            </p>
            <h2 className="truncate text-xl font-bold">{league.name}</h2>
            <dl className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <dt className="sr-only">Liczba drużyn</dt>
                <Users size={14} />
                <dd>{teamsCount} drużyn</dd>
              </div>
              <div className="flex items-center gap-1">
                <dt className="sr-only">Rozegrane mecze</dt>
                <CalendarCheck size={14} />
                <dd>{matchesCount} meczów</dd>
              </div>
            </dl>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-muted-foreground" />
        </div>

        {weatherItems && (
          <dl className="flex flex-wrap gap-x-6 gap-y-3 border-t px-4 py-3">
            {weatherItems.map(({ icon: Icon, style, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${style.bg} ${style.text}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex flex-col-reverse leading-tight">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-semibold tabular-nums text-foreground">
                    {value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        )}
      </Link>
    </Card>
  );
};

export default LeagueCard;
