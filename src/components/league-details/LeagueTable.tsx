import { Link } from "react-router";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableRow,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import type { Match } from "@/data/types";
import { computeStandings } from "@/lib/standings";

import ResultBadge from "@/components/shared/ResultBadge";

interface LeagueTableProps {
  matches: Match[] | null;
}

const LeagueTable = ({ matches }: LeagueTableProps) => {
  const standingRows = computeStandings(matches ?? []);

  return (
    <Card className="col-span-2">
      <CardHeader className="border-b pb-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          Tabela ligowa
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table containerClassName="max-h-[calc(11*2.5rem)] overflow-y-auto">
          <TableHeader className="sticky top-0 z-10 bg-card [&_th]:shadow-[inset_0_-1px_0_var(--border)] [&_tr]:border-0">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-6 text-center">#</TableHead>
              <TableHead>Drużyna</TableHead>
              <TableHead className="text-center">M</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">R</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">RB</TableHead>
              <TableHead className="text-center">Pkt</TableHead>
              <TableHead className="pr-6">Forma</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {standingRows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={9}
                  className="py-10 text-center text-muted-foreground"
                >
                  Brak meczów w tym sezonie.
                </TableCell>
              </TableRow>
            )}

            {standingRows.map((row, idx) => (
              <TableRow key={row.team.id}>
                <TableCell className="pl-6 text-center tabular-nums text-muted-foreground">
                  {idx + 1}
                </TableCell>
                <TableCell>
                  <Link
                    to={`/team/${row.team.id}`}
                    className="flex items-center gap-3 font-medium text-foreground hover:text-primary"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-secondary/20 text-[10px] font-extrabold">
                      {row.team.short_name}
                    </span>
                    {row.team.name}
                  </Link>
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {row.played}
                </TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">
                  {row.won}
                </TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">
                  {row.drawn}
                </TableCell>
                <TableCell className="text-center tabular-nums text-muted-foreground">
                  {row.lost}
                </TableCell>
                <TableCell
                  className={`text-center tabular-nums ${
                    row.goalDiff > 0
                      ? "text-green-600 dark:text-green-500/90"
                      : row.goalDiff < 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                </TableCell>
                <TableCell className="text-center font-bold tabular-nums text-foreground">
                  {row.points}
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex gap-1">
                    {row.form.map((result, i) => (
                      <ResultBadge key={i} result={result} size="sm" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LeagueTable;
