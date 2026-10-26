import { CloudSun } from "lucide-react";

import type { WeatherCoverageRow } from "@/lib/weatherCoverage";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminTableCard from "@/components/admin/AdminTableCard";

interface WeatherCoverageCardProps {
  rows: WeatherCoverageRow[];
  isPending: boolean;
  isError: boolean;
  className?: string;
}

const WeatherCoverageCard = ({ rows, isPending, isError, className }: WeatherCoverageCardProps) => (
  <AdminTableCard
    className={className}
    icon={CloudSun}
    title="Pokrycie danymi pogodowymi"
    description="Ile meczów w każdej lidze i sezonie ma już pobraną pogodę"
    isPending={isPending}
    isError={isError}
    errorText="Nie udało się pobrać meczów"
  >
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-4">Liga</TableHead>
          <TableHead>Sezon</TableHead>
          <TableHead className="text-right">Mecze</TableHead>
          <TableHead className="text-right">Z pogodą</TableHead>
          <TableHead className="text-right">Braki</TableHead>
          <TableHead className="pr-4 text-right">Pokrycie</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
              Brak meczów w bazie.
            </TableCell>
          </TableRow>
        )}

        {rows.map((row) => {
          const missing = row.matches - row.withWeather;

          return (
            <TableRow key={row.key}>
              <TableCell className="pl-4 font-medium text-foreground">{row.league}</TableCell>
              <TableCell>{row.season}</TableCell>
              <TableCell className="text-right tabular-nums">{row.matches}</TableCell>
              <TableCell className="text-right tabular-nums">{row.withWeather}</TableCell>
              <TableCell
                className={`text-right tabular-nums ${missing > 0 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {missing}
              </TableCell>
              <TableCell className="pr-4 text-right font-medium tabular-nums">
                {Math.floor((row.withWeather / row.matches) * 100)}%
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </AdminTableCard>
);

export default WeatherCoverageCard;
