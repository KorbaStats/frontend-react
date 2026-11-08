import { Link, useNavigate } from "react-router";
import { History } from "lucide-react";

import type { MatchWithWeather } from "@/services/matchesService";
import { getDayMonth } from "@/lib/date";
import { weatherDisplay, weatherDisplayFor } from "@/lib/weatherStylesConfig";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

interface RecentMatchesCardProps {
  matches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
}

const TeamName = ({
  teamId,
  name,
  isWinner,
}: {
  teamId: number;
  name: string;
  isWinner: boolean;
}) => (
  <Link
    to={`/team/${teamId}`}
    onClick={(e) => e.stopPropagation()}
    title={name}
    className={`inline-block max-w-full truncate align-bottom hover:text-primary ${
      isWinner ? "font-semibold" : "text-muted-foreground"
    }`}
  >
    {name}
  </Link>
);

const RecentMatchesCard = ({
  matches,
  isPending,
  isError,
}: RecentMatchesCardProps) => {
  const navigate = useNavigate();

  const placeholder = isPending
    ? "Ładowanie..."
    : isError
      ? "Nie udało się pobrać meczy."
      : matches.length === 0
        ? "Brak meczów."
        : null;

  return (
    <Card className="break-inside-avoid col-span-2">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          Ostatnie mecze
        </CardTitle>
        <CardDescription>Wynik, pogoda i data meczu</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 px-0">
        {placeholder ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {placeholder}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Gospodarz</TableHead>
                <TableHead className="text-center">Wynik</TableHead>
                <TableHead className="w-full">Gość</TableHead>
                <TableHead className="pr-4 text-right">Pogoda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((m) => {
                const config = m.weather
                  ? weatherDisplay[weatherDisplayFor(m.weather)]
                  : weatherDisplay.clear;
                const Icon = config.icon;

                return (
                  <TableRow
                    key={m.id}
                    onClick={() => navigate(`/match/${m.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="py-1.5 pl-4">
                      <TeamName
                        teamId={m.home_team_id}
                        name={m.homeTeam.name}
                        isWinner={m.home_goals > m.away_goals}
                      />
                    </TableCell>
                    <TableCell className="py-1.5 text-center font-bold tabular-nums">
                      {m.home_goals}:{m.away_goals}
                    </TableCell>
                    <TableCell className="w-full max-w-0 py-1.5">
                      <TeamName
                        teamId={m.away_team_id}
                        name={m.awayTeam.name}
                        isWinner={m.away_goals > m.home_goals}
                      />
                    </TableCell>
                    <TableCell className="py-1.5 pr-4">
                      <div className="flex flex-col items-end leading-snug">
                        <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
                          <span
                            title={config.label}
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${config.bg} ${config.text}`}
                          >
                            <Icon className="h-3 w-3" />
                          </span>
                          {m.weather
                            ? `${Math.round(m.weather.temperature_c)}°`
                            : "—"}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {getDayMonth(m.datetime)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <Link
          to="/matches"
          className="text-center text-md text-primary hover:text-secondary-foreground"
        >
          Wszystkie mecze...
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecentMatchesCard;
