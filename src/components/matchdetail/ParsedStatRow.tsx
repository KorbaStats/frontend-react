import type { ParsedStat } from "@/data/types";

export type ParsedRowProps = {
  label: string;
  home: ParsedStat | undefined;
  away: ParsedStat | undefined;
};

const ParsedStatRow = ({ label, home, away }: ParsedRowProps) => {
  if (!home || !away) return null;

  const total = home.pct + away.pct;
  const homeShare = total === 0 ? 0 : (home.pct / total) * 100;
  const awayShare = total === 0 ? 0 : 100 - homeShare;

  return (
    <div className="space-y-1 my-1">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
        <div className="text-left leading-tight">
          <span className="font-semibold tabular-nums">{home.pct}%</span>
          <span className="block text-xs text-muted-foreground tabular-nums">
            ({home.completed}/{home.total})
          </span>
        </div>

        <span className="text-xs text-muted-foreground">{label}</span>

        <div className="text-right leading-tight">
          <span className="font-semibold tabular-nums">{away.pct}%</span>
          <span className="block text-xs text-muted-foreground tabular-nums">
            ({away.completed}/{away.total})
          </span>
        </div>
      </div>

      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
        <div className="bg-primary" style={{ width: `${homeShare}%` }} />
        <div className="bg-foreground/40" style={{ width: `${awayShare}%` }} />
      </div>
    </div>
  );
};

export default ParsedStatRow;