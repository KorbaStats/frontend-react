import { useMemo } from "react";
import { Users } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { computeAttendanceByWeather } from "@/lib/leagueWeatherEffects";
import {
  weatherConditionStyles,
  type WeatherConditionKind,
} from "@/lib/weatherStylesConfig";

import ChartCard from "@/components/shared/ChartCard";
import WeatherConditionLabel from "@/components/shared/WeatherConditionLabel";

interface AttendanceByWeatherCardProps {
  matches: MatchWithWeather[];
  scope: string;
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
  scope,
}: AttendanceByWeatherCardProps) => {
  const attendance = useMemo(() => computeAttendanceByWeather(matches), [matches]);
  const perHundred = attendance ? Math.round(attendance.difficultPerHundred) : 0;

  return (
    <ChartCard
      Icon={Users}
      title="Frekwencja a pogoda"
      scope={scope}
      topic="względem średniej gospodarza"
      isEmpty={!attendance}
      insight={
        <>
          Na 100 kibiców w normalnej pogodzie przychodzi{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {perHundred}
          </span>{" "}
          w trudnej.
        </>
      }
      footnote={
        <>
          {attendance?.normalMatches} meczów w normalnej,{" "}
          {attendance?.difficultMatches} w trudnej. Liczone osobno dla każdego
          gospodarza, więc duże stadiony nie zawyżają wyniku.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-3xl font-bold text-primary tabular-nums">
          {changeLabel(perHundred)}
        </p>
        <div className="flex flex-col gap-1.5">
          <AttendanceBar kind="normal" value={100} />
          <AttendanceBar kind="difficult" value={perHundred} />
        </div>
      </div>
    </ChartCard>
  );
};

export default AttendanceByWeatherCard;
