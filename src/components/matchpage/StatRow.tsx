export type NumberRowProps = {
  label: string;
  home: number;
  away: number;
  suffix?: string;
  decimals?: number;
};

const StatRow = ({label, home, away, suffix = "", decimals = 0}: NumberRowProps) => {
  const total = home+away;
  const homeShare = total === 0 ? 0 : (home / total) * 100;
  const awayShare = total === 0 ? 0 : 100 - homeShare;

  return (
    <div className="space-y-1 my-1.5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
        <span className="text-left font-semibold tabular-nums">{home.toFixed(decimals)}{suffix}</span>
        <span className="text-xs text-muted-foreground">
          {label}
        </span>
        <span className="text-right font-semibold tabular-nums">{away.toFixed(decimals)}{suffix}</span>
      </div>

      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
        <div className="bg-primary" style={{ width: `${homeShare}%` }} />
        <div className="bg-foreground/40" style={{ width: `${awayShare}%` }} />
      </div>
    </div>
  )
}

export default StatRow
