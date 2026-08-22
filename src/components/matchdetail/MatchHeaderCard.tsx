import { Link } from "react-router";
import {
  CalendarDays,
  Clock,
  Cloud,
  Droplets,
  Gauge,
  MapPin,
  Thermometer,
  UserRound,
  Users,
  Wind,
} from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";

import { Card } from "@/components/ui/card";
import TeamLogo from "@/components/shared/TeamLogo";

import { getFormatedDate, getLocalTime } from "@/lib/date";
import { getLeagueCountryCode } from "@/lib/leagueLabel";
import { weatherConfig } from "@/lib/weatherConfig";

interface MatchHeaderCardProps {
  match: MatchWithWeather;
}

const MetaItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-1.5">
    <dt className="sr-only">{label}</dt>
    <Icon size={14} className="shrink-0" />
    <dd>{value}</dd>
  </div>
);

// One weather metric in the bottom strip.
const WeatherTile = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wind;
  label: string;
  value: string;
}) => (
  <div className="min-w-0 rounded-lg border bg-card px-3 py-2">
    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {/* min-w-0 + break-words: "Zachmurzenie" to jedno długie słowo */}
      <Icon size={14} className="shrink-0" />
      <span className="min-w-0 break-words">{label}</span>
    </dt>
    <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
      {value}
    </dd>
  </div>
);

const MatchHeaderCard = ({ match }: MatchHeaderCardProps) => {
  const weather = match.weather;
  const config = weather ? weatherConfig[weather.condition] : null;
  const WeatherIcon = config?.icon;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      {/* Meta strip: league, date, stadium, ref, stadium capacity*/}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b px-4 py-3 text-xs text-muted-foreground lg:px-6">
        <div className="flex items-center gap-2">
          {match.league && (
            <>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold tracking-wider text-primary">
                {getLeagueCountryCode(match.league)}
              </span>
              <span className="font-semibold text-foreground">
                {match.league.name}
              </span>
            </>
          )}
          {match.season && <span>Sezon {match.season}</span>}
        </div>

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <MetaItem
            icon={CalendarDays}
            label="Data"
            value={getFormatedDate(match.datetime)}
          />
          <MetaItem
            icon={Clock}
            label="Godzina"
            value={getLocalTime(match.datetime)}
          />
          <MetaItem
            icon={MapPin}
            label="Stadion"
            value={
              match.stadium
                ? `${match.stadium.name}, ${match.stadium.city}`
                : "Brak stadionu"
            }
          />
          {match.referee && (
            <MetaItem icon={UserRound} label="Sędzia" value={match.referee} />
          )}
          {match.attendance !== null && (
            <MetaItem
              icon={Users}
              label="Frekwencja"
              value={match.attendance.toLocaleString("pl-PL")}
            />
          )}
        </dl>
      </div>

      {/* Scoreline */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-6 lg:gap-6 lg:px-6">
        <Link
          to={`/team/${match.home_team_id}`}
          className="group flex flex-col items-center gap-3 lg:flex-row lg:justify-end"
        >
          <div className="order-2 text-center lg:order-1 lg:text-right">
            <p className="text-lg font-extrabold tracking-wide text-foreground group-hover:text-primary lg:text-xl">
              {match.homeTeam.name}
            </p>
            <span className="text-xs text-muted-foreground">Gospodarze</span>
          </div>
          <div className="order-1 lg:order-2">
            <TeamLogo
              name={match.homeTeam.name}
              short_name={match.homeTeam.short_name}
            />
          </div>
        </Link>

        <div className="flex flex-col items-center gap-1.5">
          <div className="rounded-2xl border bg-muted px-5 py-2">
            <p className="text-3xl font-bold tabular-nums tracking-widest text-foreground lg:text-4xl">
              {match.home_goals}:{match.away_goals}
            </p>
          </div>
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Koniec meczu
          </span>
        </div>

        <Link
          to={`/team/${match.away_team_id}`}
          className="group flex flex-col items-center gap-3 lg:flex-row lg:justify-start"
        >
          <div className="order-2 lg:order-1">
            <TeamLogo
              name={match.awayTeam.name}
              short_name={match.awayTeam.short_name}
            />
          </div>
          <div className="order-1 text-center lg:order-2 lg:text-left">
            <p className="text-lg font-extrabold tracking-wide text-foreground group-hover:text-primary lg:text-xl">
              {match.awayTeam.name}
            </p>
            <span className="text-xs text-muted-foreground">Goście</span>
          </div>
        </Link>
      </div>

      {/* Weather strip */}
      {weather && config && WeatherIcon ? (
        <div className="flex flex-col gap-4 border-t bg-muted/40 px-4 py-4 lg:flex-row lg:items-center lg:px-6">
          <div className="flex items-center gap-3 lg:w-60 lg:shrink-0">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.text}`}
            >
              <WeatherIcon className="h-6 w-6" />
            </span>
            <div className="leading-tight">
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {weather.temperature_c}°C
              </p>
              <p className="text-xs text-muted-foreground">
                {config.label} · odczuwalna {weather.feels_like_c}°C
              </p>
            </div>
          </div>

          <dl className="grid flex-1 grid-cols-2 gap-2 min-[1120px]:grid-cols-4">
            <WeatherTile
              icon={Wind}
              label="Wiatr"
              value={`${weather.wind_speed_kmh} km/h`}
            />
            <WeatherTile
              icon={Droplets}
              label="Opady"
              value={`${weather.precipitation_mm} mm`}
            />
            <WeatherTile
              icon={Gauge}
              label="Wilgotność"
              value={`${weather.humidity_pct}%`}
            />
            <WeatherTile
              icon={Cloud}
              label="Zachmurzenie"
              value={`${weather.cloud_cover_pct}%`}
            />
          </dl>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-t bg-muted/40 px-4 py-4 text-sm text-muted-foreground lg:px-6">
          <Thermometer size={16} />
          Brak danych pogodowych dla tego meczu.
        </div>
      )}
    </Card>
  );
};

export default MatchHeaderCard;
