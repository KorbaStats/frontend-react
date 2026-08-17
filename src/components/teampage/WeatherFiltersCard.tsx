import { SlidersHorizontal } from "lucide-react";

import type { WeatherCondition } from "@/data/types";
import { weatherConfig } from "@/lib/weatherConfig";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type WeatherFilterValue = WeatherCondition | "all";

// weatherConfig owns the display order; `available` narrows it to the
// conditions the team has actually played in.
const allConditions = Object.keys(weatherConfig) as WeatherCondition[];

interface WeatherFiltersCardProps {
  value: WeatherFilterValue;
  onChange: (value: WeatherFilterValue) => void;
  available: WeatherCondition[];
  shownCount: number;
  totalCount: number;
}

const WeatherFiltersCard = ({
  value,
  onChange,
  available,
  shownCount,
  totalCount,
}: WeatherFiltersCardProps) => {
  const conditions = allConditions.filter((c) => available.includes(c));

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h1>Filtry pogodowe</h1>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange("all")}
          className={`${value === "all" ? "hidden" : "visible"}`}
        >
          Resetuj filtry
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={value === "all" ? "secondary" : "outline"}
            size="sm"
            className="rounded-full"
            aria-pressed={value === "all"}
            onClick={() => onChange("all")}
          >
            Wszystkie
          </Button>

          {conditions.map((condition) => {
            const { icon: Icon, label } = weatherConfig[condition];
            const active = value === condition;

            return (
              <Button
                key={condition}
                variant={active ? "secondary" : "outline"}
                size="sm"
                className="rounded-full"
                aria-pressed={active}
                onClick={() => onChange(condition)}
              >
                <Icon />
                {label}
              </Button>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full bg-background border rounded-lg p-2 text-sm text-muted-foreground">
          <p className="px-2">
            Pokazano <span className="font-bold">{shownCount}</span> z
            <span className="font-bold"> {totalCount} </span>meczów
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WeatherFiltersCard;
