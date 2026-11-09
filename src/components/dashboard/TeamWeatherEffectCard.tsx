import { useMemo } from "react";
import { Link } from "react-router";
import {
  ArrowLeftRight,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import {
  MEANINGFUL_POINTS_DIFF,
  MIN_TEAM_MATCHES,
  computeTeamWeatherEffect,
  type TeamPointsChange,
} from "@/lib/dashboardIndicators";
import { polishPlural } from "@/lib/polishPlural";
import { formatNumber } from "@/lib/weatherFormat";
import { difficultConditionsText } from "@/lib/weatherProfile";

import SegmentedBar from "@/components/shared/SegmentedBar";
import ChartCard from "@/components/shared/ChartCard";

interface TeamWeatherEffectCardProps {
  matches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
}

const TeamList = ({
  Icon,
  color,
  title,
  rows,
}: {
  Icon: LucideIcon;
  color: string;
  title: string;
  rows: TeamPointsChange[];
}) => (
  <div className="flex min-w-0 flex-col gap-1">
    <h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Icon className={`h-3.5 w-3.5 ${color}`} />
      {title}
    </h3>
    <ul className="flex flex-col divide-y">
      {rows.map(({ team, normalPoints, difficultPoints, difficultMatches }) => (
        <li key={team.id} className="flex items-center justify-between gap-2 py-1.5">
          <div className="flex min-w-0 flex-col leading-tight">
            <Link
              to={`/team/${team.id}`}
              className="truncate text-sm font-medium hover:text-primary"
            >
              {team.name}
            </Link>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {difficultMatches}{" "}
              {polishPlural(difficultMatches, "trudny mecz", "trudne mecze", "trudnych meczów")}
            </span>
          </div>
          <span className="shrink-0 text-sm tabular-nums">
            <span className="text-muted-foreground">
              {formatNumber(normalPoints, 2)} →{" "}
            </span>
            <span className={`font-semibold ${color}`}>
              {formatNumber(difficultPoints, 2)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const TeamWeatherEffectCard = ({
  matches,
  isPending,
  isError,
}: TeamWeatherEffectCardProps) => {
  const effect = useMemo(() => computeTeamWeatherEffect(matches), [matches]);
  const share = (count: number) => (count / effect.teams) * 100;

  return (
    <div className="col-span-2 grid print:col-span-1">
      <ChartCard
        Icon={ArrowLeftRight}
        title="Komu pogoda pomaga, a komu szkodzi"
        topic="punkty na mecz w trudnej i normalnej pogodzie"
        isPending={isPending}
        isError={isError}
        isEmpty={effect.teams === 0}
        insight={
          <>
            W trudnej pogodzie{" "}
            <span className="font-semibold text-foreground">
              {effect.better} {polishPlural(effect.better, "drużyna punktuje", "drużyny punktują", "drużyn punktuje")}{" "}
              lepiej
            </span>
            , a{" "}
            <span className="font-semibold text-foreground">
              {effect.worse} gorzej
            </span>{" "}
            niż w normalnej.
          </>
        }
        footnote={
          <>
            Drużyny z co najmniej {MIN_TEAM_MATCHES} meczami w każdej pogodzie. „Bez
            zmian” to różnica mniejsza niż{" "}
            {formatNumber(MEANINGFUL_POINTS_DIFF, 1)} pkt/mecz. Trudna pogoda to:{" "}
            {difficultConditionsText}.
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SegmentedBar
            heightClassName="h-9"
            segments={[
              {
                key: "better",
                pct: share(effect.better),
                label: `Lepiej: ${effect.better}`,
                className: "bg-primary text-primary-foreground",
              },
              {
                key: "same",
                pct: share(effect.same),
                label: `Bez zmian: ${effect.same}`,
                className: "bg-muted text-foreground",
              },
              {
                key: "worse",
                pct: share(effect.worse),
                label: `Gorzej: ${effect.worse}`,
                className: "bg-(--weather-clear) text-black",
              },
            ]}
          />

          <div className="grid grid-cols-2 gap-6 print:grid-cols-1">
            <TeamList
              Icon={TrendingUp}
              color="text-green-600 dark:text-green-500/90"
              title="Najwięcej zyskują (pkt/mecz)"
              rows={effect.gainers}
            />
            <TeamList
              Icon={TrendingDown}
              color="text-destructive"
              title="Najwięcej tracą (pkt/mecz)"
              rows={effect.losers}
            />
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default TeamWeatherEffectCard;
