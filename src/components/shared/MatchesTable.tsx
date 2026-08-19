import { Link, useNavigate } from "react-router";

import type { MatchWithWeather } from "@/services/matchesService";
import { getFormatedDate, getLocalTime } from "@/lib/date";
import { weatherConfig } from "@/lib/weatherConfig";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MatchesTableProps {
  matches: MatchWithWeather[];
}

const MatchesTable = ({ matches }: MatchesTableProps) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Gospodarze</TableHead>
          <TableHead>Wynik</TableHead>
          <TableHead>Goście</TableHead>
          <TableHead>Pogoda</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Stadion</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={6}
              className="py-10 text-center text-muted-foreground"
            >
              Brak meczów spełniających wybrane kryteria.
            </TableCell>
          </TableRow>
        )}

        {matches.map((m) => {
          // For icons and descriptions of weather
          const condition = m.weather?.condition || "clear";
          const config = weatherConfig[condition];
          const Icon = config.icon;

          return (
            <TableRow
              key={m.id}
              onClick={() => navigate(`/match/${m.id}`)}
              className="cursor-pointer"
            >
              {/* teams and result */}
              <TableCell className="pl-6 font-medium text-foreground hover:text-primary">
                {/* stopPropagation: klik w drużynę idzie do drużyny, nie do meczu */}
                <Link
                  to={`/team/${m.home_team_id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {m.homeTeam.name}
                </Link>
              </TableCell>
              <TableCell className="text-center">
                <span className="inline-flex min-w-12 justify-center rounded-md bg-muted px-2 py-0.5 font-semibold tabular-nums text-foreground">
                  {m.home_goals} - {m.away_goals}
                </span>
              </TableCell>
              <TableCell className="font-medium text-foreground hover:text-primary">
                <Link
                  to={`/team/${m.away_team_id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {m.awayTeam.name}
                </Link>
              </TableCell>

              {/* weather condition */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${config.bg} ${config.text}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium text-foreground">
                      {m.weather?.temperature_c}°C
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {config.label}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* date and time */}
              <TableCell>
                <div className="flex flex-col leading-tight">
                  <span className="font-medium text-foreground">
                    {getFormatedDate(m.datetime)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getLocalTime(m.datetime)}
                  </span>
                </div>
              </TableCell>

              {/* stadium */}
              <TableCell className="pr-6">
                <div className="flex flex-col leading-tight">
                  <span className="font-medium text-foreground">
                    {m.stadium?.name ?? "Brak stadionu"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {m.stadium?.city ?? "Brak miasta"}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default MatchesTable;
