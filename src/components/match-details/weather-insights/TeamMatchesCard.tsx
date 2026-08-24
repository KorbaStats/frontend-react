import { Link, useNavigate } from "react-router";

import { getFormatedDate } from "@/lib/date";
import { type MatchWithWeather } from "@/services/matchesService";
import { weatherConfig } from "@/lib/weatherConfig";
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
  isLoading,
  error,
}: {
  teamId: number;
  teamName: string;
  matches: MatchWithWeather[];
  maxMatchesLength: number;
  isLoading: boolean;
  error: string | null;
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="border-b pb-6">
        <CardTitle className="text-base">{teamName}</CardTitle>
        <CardDescription>
          Ostatnie {maxMatchesLength} mecze przed tym spotkaniem
        </CardDescription>
      </CardHeader>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Wynik</TableHead>
              <TableHead>Z kim</TableHead>
              <TableHead>Gdzie</TableHead>
              <TableHead>Pogoda</TableHead>
              <TableHead className="pr-6">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  Ładowanie...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && error && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  {error}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !error && matches.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-muted-foreground"
                >
                  Brak wcześniejszych meczów w takich warunkach.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !error &&
              matches.map((m) => {
                const perspective = getMatchFromTeamPerspective(m, teamId);
                const isHome = m.home_team_id === teamId;
                const opponent = isHome ? m.awayTeam : m.homeTeam;

                const condition = m.weather?.condition ?? "clear";
                const config = weatherConfig[condition];
                const Icon = config.icon;

                return (
                  <TableRow
                    key={m.id}
                    onClick={() => navigate(`/match/${m.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="pl-6">
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
                      {/* stopPropagation: klik w drużynę idzie do drużyny, nie do meczu */}
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
                          {m.weather?.temperature_c}°C
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="pr-6 text-muted-foreground">
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
