import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Star } from "lucide-react";

import { teamsOptions } from "@/hooks/queries";
import { useFavouriteTeams } from "@/hooks/useFavouriteTeams";
import { getTeamShortName } from "@/lib/teamLabel";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FavouriteStar from "@/components/shared/FavouriteStar";

const FavouriteTeamsCard = () => {
  const { favouriteTeamsIds, isLoadingFavourites } = useFavouriteTeams();
  const teamsQuery = useQuery(teamsOptions);

  // kolejność jak z API - od ostatnio dodanej
  const teams = useMemo(() => {
    const byId = new Map((teamsQuery.data ?? []).map((team) => [team.id, team]));
    return favouriteTeamsIds.flatMap((id) => byId.get(id) ?? []);
  }, [teamsQuery.data, favouriteTeamsIds]);

  const isPending = isLoadingFavourites || teamsQuery.isPending;

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4 text-primary" />
          Ulubione drużyny
        </CardTitle>
        <CardDescription>
          Drużyny oznaczone gwiazdką. Ich nadchodzące mecze odfiltrujesz na
          stronie Predykcje.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {isPending ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Ładowanie...
          </p>
        ) : teamsQuery.isError ? (
          <p className="py-6 text-center text-sm text-destructive">
            Nie udało się pobrać drużyn.
          </p>
        ) : teams.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nie masz jeszcze ulubionych drużyn. Dodasz je gwiazdką na stronie
            drużyny.
          </p>
        ) : (
          <ul className="divide-y">
            {teams.map((team) => (
              <li key={team.id} className="flex items-center gap-3 px-4 py-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-secondary/20 text-[10px] font-extrabold">
                  {getTeamShortName(team)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <Link
                    to={`/team/${team.id}`}
                    className="truncate font-medium hover:text-primary"
                  >
                    {team.name}
                  </Link>
                  {team.league && (
                    <span className="truncate text-xs text-muted-foreground">
                      {team.league.name}
                    </span>
                  )}
                </div>
                <FavouriteStar teamId={team.id} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default FavouriteTeamsCard;
