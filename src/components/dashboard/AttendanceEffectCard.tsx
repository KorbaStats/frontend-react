import { useMemo } from "react";
import { Link } from "react-router";
import { ArrowDown, TrendingDown, Users } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import {
  MIN_HOME_MATCHES,
  computeBiggestAttendanceDrops,
} from "@/lib/dashboardIndicators";
import { polishPlural } from "@/lib/polishPlural";

import ChartCard from "@/components/shared/ChartCard";

interface AttendanceEffectCardProps {
  matches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
}

const formatCrowd = (crowd: number) => Math.round(crowd).toLocaleString("pl-PL");

const AttendanceEffectCard = ({
  matches,
  isPending,
  isError,
}: AttendanceEffectCardProps) => {
  const drops = useMemo(() => computeBiggestAttendanceDrops(matches), [matches]);

  return (
    <ChartCard
      Icon={Users}
      title="Kibice a pogoda"
      topic="frekwencja u siebie"
      isPending={isPending}
      isError={isError}
      isEmpty={drops.length === 0}
      footnote={`Drużyny z co najmniej ${MIN_HOME_MATCHES} meczami u siebie w każdej pogodzie.`}
    >
      <div className="@container flex flex-col gap-1">
        <h3 className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          Średnio kibiców: normalna → trudna pogoda
        </h3>

        <ul className="grid grid-cols-[minmax(7.25rem,1fr)_auto_minmax(3rem,1fr)] divide-y">
          {drops.map(({ team, normalCrowd, difficultCrowd, changePct, difficultMatches }) => (
            <li
              key={team.id}
              className="col-span-3 grid grid-cols-subgrid items-center gap-x-2 py-1.5"
            >
              <div className="flex min-w-0 flex-col leading-tight">
                <Link
                  to={`/team/${team.id}`}
                  className="truncate text-base font-medium hover:text-primary"
                >
                  {team.name}
                </Link>
                <span className="truncate text-[11px] text-muted-foreground tabular-nums">
                  {difficultMatches}{" "}
                  {polishPlural(difficultMatches, "trudny mecz", "trudne mecze", "trudnych meczów")}
                </span>
              </div>
              <span className="text-center text-xs whitespace-nowrap tabular-nums @sm:text-sm">
                <span className="text-muted-foreground">
                  {formatCrowd(normalCrowd)} →{" "}
                </span>
                <span className="font-semibold">{formatCrowd(difficultCrowd)}</span>
              </span>
              <span className="inline-flex items-center justify-end gap-0.5 text-sm font-semibold text-destructive tabular-nums @sm:text-base">
                <ArrowDown aria-label="spadek" className="h-3.5 w-3.5 @sm:h-4 @sm:w-4" />
                {Math.abs(Math.round(changePct))}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
};

export default AttendanceEffectCard;
