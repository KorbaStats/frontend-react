import { Button } from "@/components/ui/button";
import type { WeatherBandFilters } from "@/lib/matchFilters";
import { bandIcons } from "@/lib/weatherConfig";
import { weatherAxes } from "@/lib/weatherProfile";
import { cn } from "@/lib/utils";

interface WeatherAxisFilterPillsProps {
  value: WeatherBandFilters;
  onChange: (next: WeatherBandFilters) => void;
}

const WeatherAxisFilterPills = ({ value, onChange }: WeatherAxisFilterPillsProps) => (
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
          <span className="text-sm font-semibold text-foreground">
            {axis.label}
          </span>

          <div className="flex flex-wrap gap-2">
            {axis.bands.map((band) => {
              const Icon = bandIcons[band.value];
              const active = selected.includes(band.value);

              return (
                <Button
                  key={band.value}
                  variant={active ? "secondary" : "outline"}
                  size="sm"
                  className={cn("rounded-full border", active && "border-transparent")}
                  aria-pressed={active}
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

export default WeatherAxisFilterPills;
