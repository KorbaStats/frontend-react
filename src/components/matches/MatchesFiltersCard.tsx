import { Search, SlidersHorizontal } from "lucide-react";

import type { WeatherCondition } from "@/data/types";
import type { LeagueWithFlag } from "@/data/leagues";
import type { MatchFilters } from "@/lib/matchFilters";
import { emptyFilters, hasActiveFilters } from "@/lib/matchFilters";
import { weatherConfig } from "@/lib/weatherConfig";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const conditions = Object.keys(weatherConfig) as WeatherCondition[];

// Native <select> instead of the shadcn one: that component isn't installed and
// pulling it in for three dropdowns isn't worth it yet. Styled to sit flush with
// <Input>, so the filter row reads as one control group.
const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    {children}
  </div>
);

interface MatchesFiltersCardProps {
  value: MatchFilters;
  onChange: (filters: MatchFilters) => void;
  seasons: string[];
  leagues: LeagueWithFlag[];
  shownCount: number;
  totalCount: number;
}

const MatchesFiltersCard = ({
  value,
  onChange,
  seasons,
  leagues,
  shownCount,
  totalCount,
}: MatchesFiltersCardProps) => {
  // one setter for every field, so each control stays a one-liner
  const set = <K extends keyof MatchFilters>(key: K, fieldValue: MatchFilters[K]) =>
    onChange({ ...value, [key]: fieldValue });

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filtry
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(emptyFilters)}
          className={hasActiveFilters(value) ? "visible" : "invisible"}
        >
          Resetuj filtry
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* weather condition */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={value.condition === "all" ? "secondary" : "outline"}
            size="sm"
            className="rounded-full"
            aria-pressed={value.condition === "all"}
            onClick={() => set("condition", "all")}
          >
            Wszystkie
          </Button>

          {conditions.map((condition) => {
            const { icon: Icon, label } = weatherConfig[condition];
            const active = value.condition === condition;

            return (
              <Button
                key={condition}
                variant={active ? "secondary" : "outline"}
                size="sm"
                className="rounded-full"
                aria-pressed={active}
                onClick={() => set("condition", condition)}
              >
                <Icon />
                {label}
              </Button>
            );
          })}
        </div>

        {/* team search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Szukaj drużyny (nazwa, skrót lub miasto)..."
            className="pl-8"
          />
        </div>

        {/* season / league / date range */}
        <div className="grid gap-3 lg:grid-cols-4">
          <Field label="Sezon">
            <select
              className={selectClass}
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
          </Field>

          <Field label="Liga">
            <select
              className={selectClass}
              value={value.leagueId}
              // <select> only ever yields strings — league_id is a number
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
                  {league.flag} {league.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Data od">
            <Input
              type="date"
              value={value.dateFrom}
              max={value.dateTo || undefined}
              onChange={(e) => set("dateFrom", e.target.value)}
              // otherwise the native picker icon stays black on a dark card
              className={cn("dark:[color-scheme:dark]")}
            />
          </Field>

          <Field label="Data do">
            <Input
              type="date"
              value={value.dateTo}
              min={value.dateFrom || undefined}
              onChange={(e) => set("dateTo", e.target.value)}
              className={cn("dark:[color-scheme:dark]")}
            />
          </Field>
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full rounded-lg border bg-background p-2 text-sm text-muted-foreground">
          <p className="px-2">
            Pokazano <span className="font-bold">{shownCount}</span> z
            <span className="font-bold"> {totalCount} </span>meczów
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MatchesFiltersCard;
