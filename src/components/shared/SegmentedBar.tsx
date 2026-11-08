const MIN_LABEL_PCT = 8;

export type BarSegment = {
  key: string;
  pct: number;
  className: string;
  label?: string;
};

interface SegmentedBarProps {
  segments: BarSegment[];
  markerPct?: number;
  heightClassName?: string;
}

const SegmentedBar = ({
  segments,
  markerPct,
  heightClassName = "h-7",
}: SegmentedBarProps) => (
  <div className="relative">
    <div className={`flex gap-0.5 ${heightClassName}`}>
      {segments.map(({ key, pct, className, label }) => (
        <div
          key={key}
          className={`flex min-w-0 items-center justify-center rounded-lg text-xs font-semibold tabular-nums ${className}`}
          style={{ flexBasis: `${pct}%` }}
        >
          {pct >= MIN_LABEL_PCT && (label ?? `${Math.round(pct)}%`)}
        </div>
      ))}
    </div>
    {markerPct !== undefined && (
      <span
        className="absolute -inset-y-1 w-0.5 -translate-x-1/2 bg-foreground ring-2 ring-card"
        style={{ left: `${markerPct}%` }}
      />
    )}
  </div>
);

export default SegmentedBar;
