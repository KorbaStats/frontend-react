import { SlidersHorizontal } from "lucide-react";

import type { WeatherBandFilters } from "@/lib/matchFilters";
import { emptyBandFilters, hasBandFilters } from "@/lib/matchFilters";

import SidebarSection from "@/components/layout/SidebarSection";
import WeatherAxisFilterPills from "@/components/filters/WeatherAxisFilterPills";
import { Button } from "@/components/ui/button";

interface TeamWeatherFiltersProps {
  value: WeatherBandFilters;
  onChange: (next: WeatherBandFilters) => void;
}

const TeamWeatherFilters = ({ value, onChange }: TeamWeatherFiltersProps) => (
  <SidebarSection
    icon={SlidersHorizontal}
    title="Filtry pogodowe"
    action={
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(emptyBandFilters)}
        className={hasBandFilters(value) ? "visible" : "invisible"}
      >
        Resetuj
      </Button>
    }
  >
    <WeatherAxisFilterPills value={value} onChange={onChange} />
  </SidebarSection>
);

export default TeamWeatherFilters;
