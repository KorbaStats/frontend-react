import { useMemo } from "react";
import {
  CalendarDays,
  CloudLightning,
  Layers,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { computeDataCoverage } from "@/lib/dashboardIndicators";
import { polishPlural } from "@/lib/polishPlural";

interface DataCoverageStripProps {
  matches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
}

const CoverageItem = ({
  Icon,
  value,
  label,
}: {
  Icon: LucideIcon;
  value: number;
  label: string;
}) => (
  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
    <Icon className="h-4 w-4 text-primary" />
    <span className="text-lg font-bold text-primary">{value}</span>
    {label}
  </span>
);

const DataCoverageStrip = ({
  matches,
  isPending,
  isError,
}: DataCoverageStripProps) => {
  const coverage = useMemo(() => computeDataCoverage(matches), [matches]);

  const placeholder = isPending
    ? "Ładowanie..."
    : isError
      ? "Nie udało się pobrać danych."
      : null;

  return (
    <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-xl border border-primary/20 bg-primary/5 px-5 py-2">
      {placeholder ? (
        <p className="w-full text-center text-sm text-muted-foreground">
          {placeholder}
        </p>
      ) : (
        <>
          <CoverageItem
            Icon={CalendarDays}
            value={coverage.matches}
            label={polishPlural(coverage.matches, "mecz", "mecze", "meczów")}
          />
          <CoverageItem
            Icon={CloudLightning}
            value={coverage.difficult}
            label={`w trudnej pogodzie (${coverage.difficultPct}%)`}
          />
          <CoverageItem
            Icon={Trophy}
            value={coverage.leagues}
            label={polishPlural(coverage.leagues, "liga", "ligi", "lig")}
          />
          <CoverageItem
            Icon={Layers}
            value={coverage.seasons}
            label={polishPlural(coverage.seasons, "sezon", "sezony", "sezonów")}
          />
        </>
      )}
    </div>
  );
};

export default DataCoverageStrip;
