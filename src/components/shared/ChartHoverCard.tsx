import type { ReactNode } from "react";

interface ChartHoverCardProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

const ChartHoverCard = ({ content, children, className = "" }: ChartHoverCardProps) => (
  <div className={`group/hover relative ${className}`}>
    {children}
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden w-max max-w-60 -translate-x-1/2 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm group-focus-within/hover:block group-hover/hover:block print:hidden"
    >
      {content}
    </div>
  </div>
);

export default ChartHoverCard;
