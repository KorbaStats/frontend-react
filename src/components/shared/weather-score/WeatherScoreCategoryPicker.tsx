import {
  CloudRain,
  ThermometerSnowflake,
  ThermometerSun,
  Wind,
  type LucideIcon,
} from "lucide-react";

import type { WeatherCategoryKey } from "@/data/types";
import { Button } from "@/components/ui/button";
import { RANKING_CATEGORIES, toCategoryValue } from "@/lib/weatherScore";

const categoryIcons: Record<string, LucideIcon> = {
  "precipitation:heavy": CloudRain,
  "temperature:low": ThermometerSnowflake,
  "temperature:high": ThermometerSun,
  "wind:strong": Wind,
};

interface WeatherScoreCategoryPickerProps {
  category: WeatherCategoryKey;
  onChange: (category: WeatherCategoryKey) => void;
}

const WeatherScoreCategoryPicker = ({
  category,
  onChange,
}: WeatherScoreCategoryPickerProps) => {
  const selected = toCategoryValue(category);

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {RANKING_CATEGORIES.map(({ key, label }) => {
        const value = toCategoryValue(key);
        const Icon = categoryIcons[value];
        const active = value === selected;

        return (
          <Button
            key={value}
            variant={active ? "secondary" : "outline"}
            size="sm"
            className="rounded-full"
            aria-pressed={active}
            onClick={() => onChange(key)}
          >
            <Icon />
            {label}
          </Button>
        );
      })}
    </div>
  );
};

export default WeatherScoreCategoryPicker;
