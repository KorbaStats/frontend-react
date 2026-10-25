import { Link, useNavigate } from "react-router";

import { getFormatedDate } from "@/lib/date";
import { type MatchWithWeather } from "@/services/matchesService";
import {
  weatherDisplay,
  weatherDisplayFor,
} from "@/lib/weatherStylesConfig";
import { formatWeatherValue } from "@/lib/weatherFormat";
import { getMatchFromTeamPerspective } from "@/lib/teamStats";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import ResultBadge from "@/components/shared/ResultBadge";

const TeamMatchesCard = ({
  teamId,
  teamName,
  matches,
  maxMatchesLength,
  isPending,
  isError,
}: {
  teamId: number;
  teamName: string;
  matches: MatchWithWeather[];
  maxMatchesLength: number;
  isPending: boolean;
  isError: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <Card className="break-inside-avoid">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base">{teamName}</CardTitle>
        <CardDescription>
          Ostatnie {maxMatchesLength} meczów przed tym spotkaniem
        </CardDescription>
      </CardHeader>

      <div className="overflow-x-auto print:overflow-visible">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Wynik</TableHead>
              <TableHead>Z kim</TableHead>
              <TableHead>Gdzie</TableHead>
              <TableHead>Pogoda</TableHead>
              <TableHead className="pr-4">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  Ładowanie...
                </TableCell>
              </TableRow>
            )}

            {!isPending && isError && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  Nie udało się pobrać wcześniejszych meczów.
                </TableCell>
              </TableRow>
            )}

            {!isPending && !isError && matches.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  Brak wcześniejszych meczów.
                </TableCell>
              </TableRow>
            )}

            {!isPending &&
              !isError &&
              matches.map((m) => {
                const perspective = getMatchFromTeamPerspective(m, teamId);
                const isHome = m.home_team_id === teamId;
                const opponent = isHome ? m.awayTeam : m.homeTeam;

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
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <ResultBadge
                          goalsFor={perspective.goalsFor}
                          goalsAgainst={perspective.goalsAgainst}
                          size="sm"
                        />
                        <span className="font-semibold tabular-nums text-foreground">
                          {perspective.goalsFor}:{perspective.goalsAgainst}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-medium text-foreground hover:text-primary">
                      <Link
                        to={`/team/${opponent.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {opponent.name}
                      </Link>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {isHome ? "Dom" : "Wyjazd"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full ${config.bg} ${config.text}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatWeatherValue(
                            "temperature_c",
                            m.weather?.temperature_c,
                          )}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="pr-4 text-muted-foreground">
                      {getFormatedDate(m.datetime)}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default TeamMatchesCard;
