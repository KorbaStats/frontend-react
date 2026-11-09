import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import type { WeatherBandFilters } from "@/lib/matchFilters";
import { bandIcons } from "@/lib/weatherStylesConfig";
import { weatherAxes } from "@/lib/weatherProfile";
import { formatCategoryRange, getCategoryDefinition } from "@/lib/weatherScore";
import { weatherScoreCategoriesOptions } from "@/hooks/queries";

interface WeatherAxisFilterPillsProps {
  value: WeatherBandFilters;
  onChange: (next: WeatherBandFilters) => void;
}

const WeatherAxisFilterPills = ({
  value,
  onChange,
}: WeatherAxisFilterPillsProps) => {
  // zakresy liczbowe kategorii z backendu - pokazywane w podpowiedzi
  const { data: definitions } = useQuery(weatherScoreCategoriesOptions);

  const rangeFor = (factor: (typeof weatherAxes)[number]["factor"], band: string) => {
    if (!definitions || !factor) return undefined;
    const definition = getCategoryDefinition(definitions, factor, band);
    return definition && formatCategoryRange(definition, definitions[factor].unit);
  };

  return (
    <div className="flex flex-col gap-3">
      {weatherAxes.map((axis) => {
        const selected = value[axis.key] as string[];

        const toggle = (band: string) => {
          const next = selected.includes(band)
            ? selected.filter((b) => b !== band)
            : [...selected, band];
          onChange({ ...value, [axis.key]: next } as WeatherBandFilters);
        };

        return (
          <div key={axis.key} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {axis.label}
            </span>

            <div className="flex flex-wrap gap-2">
              {axis.bands.map((band) => {
                const Icon = bandIcons[axis.key][band.value];
                const active = selected.includes(band.value);
                const range = rangeFor(axis.factor, band.value);

                return (
                  <Button
                    key={band.value}
                    variant={active ? "secondary" : "outline"}
                    size="sm"
                    className="rounded-full"
                    aria-pressed={active}
                    title={range}
                    onClick={() => toggle(band.value)}
                  >
                    <Icon />
                    {band.label}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeatherAxisFilterPills;
