import { useEffect, useState } from "react";
import { CalendarRange, Search, SlidersHorizontal } from "lucide-react";

import type { League } from "@/data/types";
import type { MatchFilters } from "@/lib/matchFilters";
import { emptyFilters, hasActiveFilters } from "@/lib/matchFilters";
import { getLeagues } from "@/services/leaguesService";
import { getAvailableSeasons } from "@/services/matchesService";

import WeatherAxisFilterPills from "@/components/shared/WeatherAxisFilterPills";
import SidebarSection from "@/components/layout/sidebar-type/SidebarSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

interface FiltersSidebarProps {
  value: MatchFilters;
  onChange: (next: MatchFilters) => void;
  showMatchFields: boolean;
}

const FiltersSidebar = ({
  value,
  onChange,
  showMatchFields,
}: FiltersSidebarProps) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);

  useEffect(() => {
    getLeagues().then((res) => setLeagues(res.data));
    getAvailableSeasons().then(setSeasons);
  }, []);

  // jeden setter na wszystkie pola
  const set = <K extends keyof MatchFilters>(
    key: K,
    fieldValue: MatchFilters[K],
  ) => onChange({ ...value, [key]: fieldValue });

  return (
    <div className="flex flex-col gap-6">
      <SidebarSection
        icon={SlidersHorizontal}
        title="Filtry"
        action={
          hasActiveFilters(value) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(emptyFilters)}
            >
              Wyczyść
            </Button>
          )
        }
      >
        {showMatchFields && (
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={value.query}
              onChange={(e) => set("query", e.target.value)}
              placeholder="Szukaj drużyny..."
              aria-label="Szukaj drużyny"
              className="h-9 pl-8"
            />
          </div>
        )}

        <WeatherAxisFilterPills
          value={value}
          onChange={(bands) => onChange({ ...value, ...bands })}
        />
      </SidebarSection>

      {showMatchFields && (
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
      )}
    </div>
  );
};

export default FiltersSidebar;
