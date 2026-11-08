import type { ReactNode } from "react";

interface LeagueTileProps {
  league: string;
  headline: string;
  summary: ReactNode;
  children: ReactNode;
}

const LeagueTile = ({ league, headline, summary, children }: LeagueTileProps) => (
  <div className="flex flex-col gap-2 rounded-lg border px-3 py-3">
    <p className="text-xs font-medium">{league}</p>
    <p className="text-3xl font-bold text-primary">{headline}</p>
    <p className="text-xs text-muted-foreground">{summary}</p>
    <div className="mt-auto flex flex-col gap-1.5 pt-1">{children}</div>
  </div>
);

export default LeagueTile;
