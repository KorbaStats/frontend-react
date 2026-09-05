import { CalendarRange, Search, SlidersHorizontal } from "lucide-react";

import type { League } from "@/data/types";
import type { MatchFilters } from "@/lib/matchFilters";
import { emptyFilters, hasActiveFilters } from "@/lib/matchFilters";

import SidebarSection from "@/components/layout/SidebarSection";
import WeatherAxisFilterPills from "@/components/filters/WeatherAxisFilterPills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

interface MatchesFiltersProps {
  value: MatchFilters;
  onChange: (filters: MatchFilters) => void;
  seasons: string[];
  leagues: League[];
}

const MatchesFilters = ({
  value,
  onChange,
  seasons,
  leagues,
}: MatchesFiltersProps) => {
  // jeden setter na wszystkie pola
  const set = <K extends keyof MatchFilters>(
    key: K,
    fieldValue: MatchFilters[K],
  ) => onChange({ ...value, [key]: fieldValue });

  return (
    <>
      <SidebarSection
        icon={SlidersHorizontal}
        title="Filtry"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(emptyFilters)}
            className={hasActiveFilters(value) ? "visible" : "invisible"}
          >
            Resetuj
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          {/* wyszukiwarka drużyn */}
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={value.query}
              onChange={(e) => set("query", e.target.value)}
              placeholder="Szukaj drużyny..."
              // bez widocznej etykiety placeholder jest jedyną podpowiedzią,
              // a znika przy pisaniu
              aria-label="Szukaj drużyny"
              className="h-9 pl-8"
            />
          </div>

          <WeatherAxisFilterPills
            value={value}
            onChange={(bands) => onChange({ ...value, ...bands })}
          />
        </div>
      </SidebarSection>

      <SidebarSection icon={CalendarRange} title="Zakres">
        <div className="flex flex-col gap-2">
          <select
            className={selectClass}
            aria-label="Sezon"
            value={value.season}
            onChange={(e) => set("season", e.target.value)}
          >
            <option value="all">Wszystkie sezony</option>
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            aria-label="Liga"
            value={value.leagueId}
            onChange={(e) =>
              set(
                "leagueId",
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
          >
            <option value="all">Wszystkie ligi</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              aria-label="Data od"
              value={value.dateFrom}
              max={value.dateTo || undefined}
              onChange={(e) => set("dateFrom", e.target.value)}
              className="h-9 px-2 text-sm dark:scheme-dark"
            />
            <Input
              type="date"
              aria-label="Data do"
              value={value.dateTo}
              min={value.dateFrom || undefined}
              onChange={(e) => set("dateTo", e.target.value)}
              className="h-9 px-2 text-sm dark:scheme-dark"
            />
          </div>
        </div>
      </SidebarSection>
    </>
  );
};

export default MatchesFilters;
