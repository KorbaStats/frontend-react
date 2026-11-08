import {
  weatherConditionStyles,
  type WeatherConditionKind,
} from "@/lib/weatherStylesConfig";

const WeatherConditionLabel = ({ kind }: { kind: WeatherConditionKind }) => {
  const { label, color } = weatherConditionStyles[kind];

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
};

export default WeatherConditionLabel;
