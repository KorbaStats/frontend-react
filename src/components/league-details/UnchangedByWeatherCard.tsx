import { useMemo } from "react";
import { Equal } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { computeUnchangedStats } from "@/lib/leagueWeatherEffects";
import { polishPlural } from "@/lib/polishPlural";
import { weatherConditionStyles } from "@/lib/weatherStylesConfig";

import ChartCard from "@/components/shared/ChartCard";
import WeatherConditionLabel from "@/components/shared/WeatherConditionLabel";

interface UnchangedByWeatherCardProps {
  matches: MatchWithWeather[];
  scope: string;
}

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
  scope,
}: UnchangedByWeatherCardProps) => {
  const stats = useMemo(() => computeUnchangedStats(matches), [matches]);
  const biggestChange = stats?.biggestChange ?? 0;

  return (
    <ChartCard
      Icon={Equal}
      title="Czego pogoda nie zmienia"
      scope={scope}
      topic="odsetek meczów"
      isEmpty={!stats}
      insight={
        <>
          Żadna z tych statystyk nie zmienia się o więcej niż{" "}
          <span className="font-semibold text-foreground">
            {biggestChange}{" "}
            {polishPlural(biggestChange, "mecz", "mecze", "meczów")} na 100
          </span>
          .
        </>
      }
      footnote="Porównanie wszystkich meczów sezonu, nie tylko tych z tej samej pory roku."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          {stats?.rows.map((row) => (
            <div key={row.key} className="flex items-center gap-1 text-xs">
              <span className="min-w-0 flex-1 text-muted-foreground">
                {row.label}
              </span>
              <ColoredValue kind="normal" value={row.normalPct} />
              <ColoredValue kind="difficult" value={row.difficultPct} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <WeatherConditionLabel kind="normal" />
          <WeatherConditionLabel kind="difficult" />
        </div>
      </div>
    </ChartCard>
  );
};

export default UnchangedByWeatherCard;
