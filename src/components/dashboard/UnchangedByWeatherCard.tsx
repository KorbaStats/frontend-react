import { useMemo } from "react";
import { Equal } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { computeUnchangedStats } from "@/lib/leagueWeatherEffects";
import { weatherConditionStyles } from "@/lib/weatherStylesConfig";

import DashboardChartCard from "./DashboardChartCard";
import LeagueTile from "./LeagueTile";
import WeatherConditionLabel from "./WeatherConditionLabel";

interface UnchangedByWeatherCardProps {
  matches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
}

const matchesWord = (count: number) => {
  if (count === 1) return "mecz";
  return count >= 2 && count <= 4 ? "mecze" : "meczów";
};

const ColoredValue = ({
  kind,
  value,
}: {
  kind: "normal" | "difficult";
  value: number;
}) => (
  <span className="inline-flex w-12 shrink-0 items-center justify-end gap-1 text-xs font-medium tabular-nums">
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ background: weatherConditionStyles[kind].color }}
    />
    {value}%
  </span>
);

const UnchangedByWeatherCard = ({
  matches,
  isPending,
  isError,
}: UnchangedByWeatherCardProps) => {
  const leagues = useMemo(() => computeUnchangedStats(matches), [matches]);
  const biggestChange = Math.max(0, ...leagues.map((l) => l.biggestChange));

  return (
    <DashboardChartCard
      Icon={Equal}
      title="Czego pogoda nie zmienia"
      topic="odsetek meczów"
      isPending={isPending}
      isError={isError}
      isEmpty={leagues.length === 0}
      insight={
        <>
          Żadna z tych statystyk nie zmienia się o więcej niż{" "}
          <span className="font-semibold text-foreground">
            {biggestChange} {matchesWord(biggestChange)} na 100
          </span>
          .
        </>
      }
      footnote="Porównanie wszystkich meczów z obu sezonów, nie tylko tych z tej samej pory roku."
    >
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          {leagues.map((league) => (
            <LeagueTile
              key={league.league}
              league={league.league}
              headline={`${league.biggestChange} na 100`}
              summary="Największa różnica między normalną a trudną pogodą."
            >
              {league.rows.map((row) => (
                <div key={row.key} className="flex items-center gap-1 text-xs">
                  <span className="min-w-0 flex-1 text-muted-foreground">
                    {row.label}
                  </span>
                  <ColoredValue kind="normal" value={row.normalPct} />
                  <ColoredValue kind="difficult" value={row.difficultPct} />
                </div>
              ))}
            </LeagueTile>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <WeatherConditionLabel kind="normal" />
          <WeatherConditionLabel kind="difficult" />
        </div>
      </div>
    </DashboardChartCard>
  );
};

export default UnchangedByWeatherCard;
