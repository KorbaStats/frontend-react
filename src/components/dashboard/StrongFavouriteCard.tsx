import { useMemo } from "react";
import { Crown } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import {
  STRONG_FAVOURITE_PCT,
  computeStrongFavourite,
  type StrongFavouriteResult,
} from "@/lib/dashboardIndicators";
import { polishPlural } from "@/lib/polishPlural";
import {
  weatherConditionStyles,
  type WeatherConditionKind,
} from "@/lib/weatherStylesConfig";

import ChartCard from "@/components/shared/ChartCard";
import WeatherConditionLabel from "@/components/shared/WeatherConditionLabel";

interface StrongFavouriteCardProps {
  matches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
}

const ResultRow = ({
  kind,
  result,
}: {
  kind: WeatherConditionKind;
  result: StrongFavouriteResult;
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-baseline justify-between gap-2">
      <WeatherConditionLabel kind={kind} />
      <span className="text-2xl font-bold">{Math.round(result.winPct)}%</span>
    </div>
    <div className="relative">
      <div className="h-3 overflow-hidden rounded-lg bg-muted">
        <div
          className="h-full rounded-lg"
          style={{
            width: `${result.winPct}%`,
            background: weatherConditionStyles[kind].color,
          }}
        />
      </div>
      <span
        className="absolute -inset-y-1 w-0.5 -translate-x-1/2 bg-foreground ring-2 ring-card"
        style={{ left: `${result.expectedPct}%` }}
      />
    </div>
    <p className="text-xs text-muted-foreground tabular-nums">
      Kursy dawały{" "}
      <span className="font-semibold text-foreground">
        {Math.round(result.expectedPct)}%
      </span>{" "}
      · {result.matches}{" "}
      {polishPlural(result.matches, "mecz", "mecze", "meczów")}
    </p>
  </div>
);

const StrongFavouriteCard = ({
  matches,
  isPending,
  isError,
}: StrongFavouriteCardProps) => {
  const favourite = useMemo(() => computeStrongFavourite(matches), [matches]);
  const change = favourite
    ? Math.round(favourite.difficult.winPct) - Math.round(favourite.normal.winPct)
    : 0;

  return (
    <ChartCard
      Icon={Crown}
      title="Mocny faworyt"
      topic={`kursy dawały mu min. ${STRONG_FAVOURITE_PCT}%`}
      isPending={isPending}
      isError={isError}
      isEmpty={!favourite}
      insight={
        change === 0 ? (
          "Trudna pogoda nie zmienia tego, jak często wygrywa."
        ) : (
          <>
            W trudnej pogodzie faworyt wygrywa{" "}
            <span className="font-semibold text-foreground">
              o {Math.abs(change)} na 100 meczów {change < 0 ? "rzadziej" : "częściej"}
            </span>
            .
          </>
        )
      }
      footnote="Kreska to szansa z kursu. Łączne liczby ze wszystkich lig mogą różnić się od wyników pojedynczej ligi."
    >
      {favourite && (
        <div className="flex flex-1 flex-col justify-evenly gap-4">
          <ResultRow kind="normal" result={favourite.normal} />
          <ResultRow kind="difficult" result={favourite.difficult} />
        </div>
      )}
    </ChartCard>
  );
};

export default StrongFavouriteCard;
