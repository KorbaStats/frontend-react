import { History } from "lucide-react";

import type { FixtureSyncRun } from "@/data/types";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FixtureSyncRunsCardProps {
  runs: FixtureSyncRun[];
  running: boolean;
  className?: string;
}

function runState(run: FixtureSyncRun, running: boolean, isLatest: boolean) {
  if (run.finished_at === null) {
    // wiersz bez końca, a serwer nic nie synchronizuje = przerwana (np. restart serwera)
    return running && isLatest
      ? { label: "W toku", className: "text-primary" }
      : { label: "Przerwana", className: "text-muted-foreground" };
  }
  return run.success
    ? { label: "Sukces", className: "text-green-600 dark:text-green-500/90" }
    : { label: "Błąd", className: "text-destructive" };
}

function runDetails(run: FixtureSyncRun): string[] {
  if (run.error) return [run.error];
  if (!run.result) return [];

  const { leagues = [], created_teams = [], created_stadiums = [] } = run.result;
  const lines = leagues.map((league) =>
    league.rounds.length === 0
      ? `${league.league_name}: brak nadchodzących kolejek`
      : `${league.league_name}: ${league.fixtures} meczów, nadchodzące ${league.upcoming}, kolejki ${league.rounds.join(", ")}`,
  );
  if (leagues.length === 0) lines.push("Żadna liga nie ma ustawionego id TheSportsDB");
  if (created_teams.length) {
    lines.push(`Nowe drużyny: ${created_teams.map((t) => t.name).join(", ")}`);
  }
  if (created_stadiums.length) {
    lines.push(`Nowe stadiony: ${created_stadiums.map((s) => s.name).join(", ")}`);
  }
  return lines;
}

const FixtureSyncRunsCard = ({ runs, running, className }: FixtureSyncRunsCardProps) => (
  <Card className={className}>
    <CardHeader className="border-b pb-4">
      <CardTitle className="flex items-center gap-2 text-base">
        <History className="h-4 w-4 text-primary" />
        Historia synchronizacji
      </CardTitle>
      <CardDescription>Ostatnie {runs.length} uruchomień, od najnowszego.</CardDescription>
    </CardHeader>

    <CardContent className="px-0">
      {runs.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Synchronizacja jeszcze się nie odbyła. Uruchom ją przyciskiem obok.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Start</TableHead>
                <TableHead>Uruchomienie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4">Szczegóły</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run, index) => {
                const state = runState(run, running, index === 0);
                return (
                  <TableRow key={run.id}>
                    <TableCell className="pl-4 align-top tabular-nums">
                      {formatDateTime(run.started_at)}
                    </TableCell>
                    <TableCell className="align-top">
                      {run.trigger === "auto" ? "automatyczne" : "ręczne"}
                    </TableCell>
                    <TableCell className={cn("align-top font-medium", state.className)}>
                      {state.label}
                    </TableCell>
                    <TableCell className="pr-4 align-top whitespace-normal text-muted-foreground">
                      {runDetails(run).map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  </Card>
);

export default FixtureSyncRunsCard;
