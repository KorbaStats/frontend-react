import { useMemo } from "react";
import { Users } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { computeAttendanceByWeather } from "@/lib/leagueWeatherEffects";
import {
  weatherConditionStyles,
  type WeatherConditionKind,
} from "@/lib/weatherStylesConfig";

import DashboardChartCard from "./DashboardChartCard";
import LeagueTile from "./LeagueTile";
import WeatherConditionLabel from "./WeatherConditionLabel";

interface AttendanceByWeatherCardProps {
  matches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
}

const AttendanceBar = ({
  kind,
  value,
}: {
  kind: WeatherConditionKind;
  value: number;
}) => (
  <div className="grid grid-cols-[4.75rem_1fr_1.75rem] items-center gap-2 text-xs">
    <WeatherConditionLabel kind={kind} />
    <div className="h-3 overflow-hidden rounded-lg bg-muted">
      <div
        className="h-full rounded-lg"
        style={{
          width: `${Math.min(value, 100)}%`,
          background: weatherConditionStyles[kind].color,
        }}
      />
    </div>
    <span className="text-right font-medium tabular-nums">{value}</span>
  </div>
);

const changeLabel = (perHundred: number) => {
  const change = perHundred - 100;
  if (change === 0) return "bez zmian";
  return `${change > 0 ? "+" : "−"}${Math.abs(change)}%`;
};

const AttendanceByWeatherCard = ({
  matches,
  isPending,
  isError,
}: AttendanceByWeatherCardProps) => {
  const leagues = useMemo(() => computeAttendanceByWeather(matches), [matches]);
  const biggestDrop = leagues.reduce<(typeof leagues)[number] | null>(
    (lowest, league) =>
      !lowest || league.difficultPerHundred < lowest.difficultPerHundred
        ? league
        : lowest,
    null,
  );

  return (
    <DashboardChartCard
      Icon={Users}
      title="Frekwencja a pogoda"
      topic="względem średniej gospodarza"
      isPending={isPending}
      isError={isError}
      isEmpty={leagues.length === 0}
      insight={
        biggestDrop && (
          <>
            Trudna pogoda najmocniej zmienia frekwencję w lidze{" "}
            <span className="font-semibold text-foreground">
              {biggestDrop.league}: {changeLabel(Math.round(biggestDrop.difficultPerHundred))}
            </span>
            .
          </>
        )
      }
      footnote="Liczone osobno dla każdego gospodarza, więc duże stadiony nie zawyżają wyniku."
    >
      <div className="grid flex-1 grid-cols-2 gap-3">
        {leagues.map((league) => {
          const perHundred = Math.round(league.difficultPerHundred);

          return (
            <LeagueTile
              key={league.league}
              league={league.league}
              headline={changeLabel(perHundred)}
              summary={
                <>
                  Na 100 kibiców w normalnej pogodzie przychodzi{" "}
                  <span className="font-semibold text-foreground">{perHundred}</span>{" "}
                  w trudnej.
                </>
              }
            >
              <AttendanceBar kind="normal" value={100} />
              <AttendanceBar kind="difficult" value={perHundred} />
              <p className="pt-1 text-[11px] text-muted-foreground tabular-nums">
                {league.normalMatches} meczów w normalnej, {league.difficultMatches}{" "}
                w trudnej
              </p>
            </LeagueTile>
          );
        })}
      </div>
    </DashboardChartCard>
  );
};

export default AttendanceByWeatherCard;
