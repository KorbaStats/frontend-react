import { useMemo } from "react";
import { Scale } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import {
  computeFavouriteOutcomes,
  type FavouriteOutcomes,
} from "@/lib/leagueWeatherEffects";
import type { WeatherConditionKind } from "@/lib/weatherStylesConfig";

import ChartCard from "@/components/shared/ChartCard";
import ChartHoverCard from "@/components/shared/ChartHoverCard";
import SegmentedBar from "@/components/shared/SegmentedBar";
import WeatherConditionLabel from "@/components/shared/WeatherConditionLabel";

interface FavouriteByWeatherChartProps {
  matches: MatchWithWeather[];
  scope: string;
}

const conditions: { key: WeatherConditionKind; label: string }[] = [
  { key: "normal", label: "normalna" },
  { key: "difficult", label: "trudna" },
];

const segments = [
  {
    key: "winPct",
    label: "Faworyt wygrał",
    className: "bg-primary text-primary-foreground",
  },
  { key: "drawPct", label: "Remis", className: "bg-muted text-foreground" },
  {
    key: "lossPct",
    label: "Faworyt przegrał",
    className: "bg-(--weather-clear) text-black",
  },
] as const;

const ROW_GRID = "grid grid-cols-[4.75rem_1fr_3rem] items-center gap-2";

const barSegments = (outcomes: FavouriteOutcomes) =>
  segments.map(({ key, className }) => ({
    key,
    className,
    pct: outcomes[key],
  }));

const FavouriteByWeatherChart = ({
  matches,
  scope,
}: FavouriteByWeatherChartProps) => {
  const { normal, difficult } = useMemo(
    () => computeFavouriteOutcomes(matches),
    [matches],
  );
  const byCondition = { normal, difficult };

  return (
    <ChartCard
      Icon={Scale}
      title="Faworyt a pogoda"
      scope={scope}
      topic="faworyt to drużyna z niższym kursem"
      isEmpty={!normal || !difficult}
      insight={
        difficult && (
          <>
            W trudnej pogodzie faworyt wygrywa{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {Math.round(difficult.winPct)}%
            </span>{" "}
            meczów przy kursach na{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {Math.round(difficult.expectedPct)}%
            </span>
            .
          </>
        )
      }
      footnote="Szansa z kursu to 1/kurs, przeskalowane tak, żeby trzy wyniki dawały 100%."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className={ROW_GRID}>
            <p className="col-span-3 text-right text-xs text-muted-foreground">
              Kursy
            </p>
          </div>

          {conditions.map(({ key, label }) => {
            const outcomes = byCondition[key]!;

            return (
              <ChartHoverCard
                key={key}
                content={
                  <>
                    <p className="mb-1 font-medium">{label} pogoda</p>
                    {segments.map((segment) => (
                      <p key={segment.key}>
                        {segment.label}:{" "}
                        <span className="font-medium tabular-nums">
                          {Math.round(outcomes[segment.key])}%
                        </span>
                      </p>
                    ))}
                    <p>
                      Kursy dawały faworytowi:{" "}
                      <span className="font-medium tabular-nums">
                        {Math.round(outcomes.expectedPct)}%
                      </span>
                    </p>
                    <p>
                      Mecze:{" "}
                      <span className="font-medium tabular-nums">
                        {outcomes.matches}
                      </span>
                    </p>
                  </>
                }
              >
                <div tabIndex={0} className={`${ROW_GRID} rounded-sm`}>
                  <WeatherConditionLabel kind={key} />
                  <SegmentedBar
                    segments={barSegments(outcomes)}
                    markerPct={outcomes.expectedPct}
                  />
                  <span className="text-right text-sm font-semibold tabular-nums">
                    {Math.round(outcomes.expectedPct)}%
                  </span>
                </div>
              </ChartHoverCard>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {segments.map(({ key, label, className }) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span className={`h-3 w-3 rounded-[3px] ${className}`} />
              {label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-0.5 bg-foreground" />
            Szansa wygranej według kursów
          </span>
        </div>
      </div>
    </ChartCard>
  );
};

export default FavouriteByWeatherChart;
