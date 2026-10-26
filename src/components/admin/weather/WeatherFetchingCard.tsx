import { useState } from "react";
import { Link } from "react-router";
import { CloudDownload } from "lucide-react";

import type { WeatherFetchingStatus } from "@/data/types";
import { getFormatedDate, getLocalTime } from "@/lib/date";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextField } from "@/components/admin/FormField";

function formatDateTime(rawDate: string): string {
  return `${getFormatedDate(rawDate)} ${getLocalTime(rawDate)}`;
}

interface WeatherFetchingCardProps {
  awaitingCount: number;
  status: WeatherFetchingStatus | undefined;
  isPending: boolean;
  isError: boolean;
  isStarting: boolean;
  startError: string | null;
  canFixStadiums: boolean;
  onStart: (limit?: number) => void;
}

const WeatherFetchingCard = ({
  awaitingCount,
  status,
  isPending,
  isError,
  isStarting,
  startError,
  canFixStadiums,
  onStart,
}: WeatherFetchingCardProps) => {
  const [limit, setLimit] = useState("");
  const [limitError, setLimitError] = useState<string>();

  const isRunning = status?.running ?? false;
  const progress = status && status.total > 0 ? (status.processed / status.total) * 100 : 0;

  const handleStart = () => {
    if (!limit.trim()) {
      setLimitError(undefined);
      onStart();
      return;
    }

    const value = Number(limit);
    if (!Number.isInteger(value) || value < 1) {
      setLimitError("Limit musi być dodatnią liczbą całkowitą");
      return;
    }
    setLimitError(undefined);
    onStart(value);
  };

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CloudDownload className="h-4 w-4 text-primary" />
          Pobieranie pogody
        </CardTitle>
        <CardDescription>
          Open-Meteo, dla meczów zakończonych ponad 2 h temu, które nie mają jeszcze pogody
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {isPending && <p className="py-10 text-center text-muted-foreground">Ładowanie...</p>}

        {isError && (
          <p className="py-10 text-center text-muted-foreground">
            Nie udało się pobrać statusu pobierania
          </p>
        )}

        {!isPending && !isError && status && (
          <>
            <div>
              <p className="text-sm text-muted-foreground">Mecze bez pogody</p>
              <p className="text-2xl font-semibold tabular-nums">{awaitingCount}</p>
            </div>

            <TextField
              id="weather-limit"
              label="Limit meczów"
              value={limit}
              onChange={setLimit}
              error={limitError}
              description="Puste pole pobiera wszystkie brakujące"
              disabled={isRunning}
            />

            {startError && <p className="text-sm text-destructive">{startError}</p>}

            <Button onClick={handleStart} disabled={isRunning || isStarting}>
              {isRunning ? "Pobieranie w toku..." : `Pobierz brakującą pogodę (${awaitingCount})`}
            </Button>

            {(isRunning || status.lastRun) && (
              <div className="flex flex-col gap-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">
                    {isRunning ? "W toku" : "Ostatnie pobieranie"}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {status.processed} / {status.total}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex gap-4 tabular-nums text-muted-foreground">
                  <span>Udane: {status.succeeded}</span>
                  <span>Nieudane: {status.failed}</span>
                  <span>Pominięte: {status.skipped}</span>
                </div>

                {status.skipped > 0 && (
                  <p className="text-muted-foreground">
                    Pominięte mecze nie mają współrzędnych stadionu.{" "}
                    {canFixStadiums && (
                      <Link
                        to="/admin/data/stadiums"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Uzupełnij współrzędne
                      </Link>
                    )}
                  </p>
                )}

                {status.error && <p className="text-destructive">{status.error}</p>}

                {status.lastRun && (
                  <p className="text-muted-foreground">
                    Start: {formatDateTime(status.lastRun)}
                    {status.finishedAt && `, koniec: ${formatDateTime(status.finishedAt)}`}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherFetchingCard;
