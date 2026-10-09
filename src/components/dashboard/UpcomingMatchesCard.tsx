import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { useEffect, useState } from "react";
import { useFavouriteTeams } from "@/hooks/useFavouriteTeams";

import type { ScheduledMatch } from "@/data/types";

import { getUpcomingMatchesForTeams } from "@/services/scheduledMatchesService";
import { getFormatedDate, getLocalTime } from "@/lib/date";
import { Calendar, Star } from "lucide-react";

const MAX_MATCHES = 8;

const UpcomingMatchesCard = () => {
  const { favouriteTeamsIds, isLoadingFavourites, isFavourite } =
    useFavouriteTeams();
  const [matches, setMatches] = useState<ScheduledMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoadingFavourites) return;

    getUpcomingMatchesForTeams(favouriteTeamsIds, MAX_MATCHES)
      .then(setMatches)
      .catch((err) => {
        setError("Nie udało się pobrać nadchodzących meczów.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [favouriteTeamsIds, isLoadingFavourites]);

  const showLoading = isLoadingFavourites || isLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-primary" /> Nadchodzące mecze Twoich
          drużyn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gospodarze</TableHead>
                <TableHead>Goście</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Stadion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showLoading && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Ładowanie...
                  </TableCell>
                </TableRow>
              )}

              {!showLoading && error && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {!showLoading && !error && favouriteTeamsIds.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Nie masz jeszcze ulubionych drużyn. Dodaj je gwiazdką przy
                    nazwie drużyny.
                  </TableCell>
                </TableRow>
              )}

              {!showLoading &&
                !error &&
                favouriteTeamsIds.length > 0 &&
                matches.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={4}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Brak zaplanowanych meczów.
                    </TableCell>
                  </TableRow>
                )}

              {!showLoading &&
                !error &&
                matches.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell
                      className={isFavourite(m.home_team_id) ? "font-bold" : ""}
                    >
                      <div className="flex items-center gap-2">
                        {isFavourite(m.home_team_id) && (
                          <Star className="h-4 w-4 text-primary" />
                        )}
                        {m.homeTeam.name}
                      </div>
                    </TableCell>
                    <TableCell
                      className={isFavourite(m.away_team_id) ? "font-bold" : ""}
                    >
                      <div className="flex items-center gap-2">
                        {isFavourite(m.away_team_id) && (
                          <Star className="h-4 w-4 text-primary" />
                        )}
                        {m.awayTeam.name}
                      </div>
                    </TableCell>
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
                    <TableCell>
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
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingMatchesCard;
