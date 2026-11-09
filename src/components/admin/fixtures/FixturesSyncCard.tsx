import { CalendarSync } from "lucide-react";

import type { FixtureSyncStatus } from "@/data/types";
import { formatDateTime } from "@/lib/date";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FixturesSyncCardProps {
  status: FixtureSyncStatus | undefined;
  isPending: boolean;
  isError: boolean;
  isStarting: boolean;
  startError: string | null;
  onStart: () => void;
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-2 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium tabular-nums">{value}</span>
  </div>
);

const FixturesSyncCard = ({
  status,
  isPending,
  isError,
  isStarting,
  startError,
  onStart,
}: FixturesSyncCardProps) => {
  const running = status?.running ?? false;
  const lastSuccess = status?.runs.find((run) => run.success);
  const scheduler = status?.scheduler;

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarSync className="h-4 w-4 text-primary" />
          Synchronizacja terminarza
        </CardTitle>
        <CardDescription>
          Pobiera z TheSportsDB 3 najbliższe kolejki lig z ustawionym id TheSportsDB.
          Nadchodzące mecze zasilają stronę Predykcje.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {isPending && <p className="py-10 text-center text-muted-foreground">Ładowanie...</p>}

        {isError && (
          <p className="py-10 text-center text-muted-foreground">
            Nie udało się pobrać stanu synchronizacji
          </p>
        )}

        {status && scheduler && (
          <>
            <div>
              <p className="text-sm text-muted-foreground">Ostatnia udana synchronizacja</p>
              <p className="text-lg font-semibold tabular-nums">
                {lastSuccess?.finished_at
                  ? formatDateTime(lastSuccess.finished_at)
                  : "Jeszcze nie było"}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 border-t pt-4">
              <Row
                label="Automatyczna synchronizacja"
                value={
                  scheduler.enabled
                    ? `co ${scheduler.sync_interval_hours} h`
                    : (scheduler.disabledReason ?? "wyłączona")
                }
              />
              {scheduler.enabled && (
                <>
                  <Row
                    label="Ostatnie sprawdzenie"
                    value={scheduler.lastCheck ? formatDateTime(scheduler.lastCheck) : "—"}
                  />
                  <Row
                    label="Następne sprawdzenie"
                    value={scheduler.nextCheck ? formatDateTime(scheduler.nextCheck) : "—"}
                  />
                  <Row
                    label="Ponowienie po błędzie"
                    value={`po ${scheduler.retry_after_hours} h`}
                  />
                </>
              )}
            </div>

            {startError && <p className="text-sm text-destructive">{startError}</p>}

            <Button onClick={onStart} disabled={running || isStarting}>
              {running || isStarting ? "Synchronizacja w toku..." : "Synchronizuj teraz"}
            </Button>
            {running && (
              <p className="text-xs text-muted-foreground">
                Przy limicie zapytań TheSportsDB może to potrwać kilka minut - stan
                odświeża się sam.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FixturesSyncCard;
