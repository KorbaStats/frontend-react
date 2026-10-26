import type { GeocodingStatus } from "@/data/types";

import { CardFooter } from "@/components/ui/card";

interface GeocodingStatusLineProps {
  status: GeocodingStatus | undefined;
  isRunning: boolean;
  error: string | null;
}

export const GeocodingStatusLine = ({ status, isRunning, error }: GeocodingStatusLineProps) => {
  if (!error && !isRunning && !status?.lastRun) return null;

  return (
    <div className="mt-1 flex flex-col gap-0.5">
      {error && <span className="text-destructive">{error}</span>}

      {status && (isRunning || status.lastRun) && (
        <span className="font-medium text-foreground">
          {isRunning
            ? `Geokodowanie w toku: ${status.succeeded + status.failed} / ${status.total}`
            : `Ostatnie geokodowanie: znaleziono ${status.succeeded} z ${status.total}`}
        </span>
      )}
    </div>
  );
};

interface GeocodingFailuresProps {
  status: GeocodingStatus | undefined;
  isRunning: boolean;
}

export const GeocodingFailures = ({ status, isRunning }: GeocodingFailuresProps) => {
  if (isRunning || !status || status.failedStadiums.length === 0) return null;

  return (
    <CardFooter className="flex flex-col items-start gap-2 border-t pt-4 text-sm">
      <p className="font-medium text-foreground">Nie znaleziono współrzędnych:</p>
      <ul className="flex flex-col gap-1 text-muted-foreground">
        {status.failedStadiums.map((stadium) => (
          <li key={stadium.id}>
            <span className="text-foreground">{stadium.name}</span> — {stadium.reason}
          </li>
        ))}
      </ul>
    </CardFooter>
  );
};
