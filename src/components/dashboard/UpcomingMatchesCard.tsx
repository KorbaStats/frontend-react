import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Calendar, Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ShowMoreFooter from "@/components/shared/ShowMoreFooter";

import { useFavouriteTeams } from "@/hooks/useFavouriteTeams";
import { useVisibleItems } from "@/hooks/useVisibleItems";

import type { ScheduledMatch, Team } from "@/data/types";

import { getUpcomingMatchesForTeams } from "@/services/scheduledMatchesService";
import { getDayMonth, getLocalTime, getShortWeekday } from "@/lib/date";

const PAGE_SIZE = 5;

interface TeamNameProps {
  team: Team;
  favourite: boolean;
  side: "home" | "away";
}

const TeamName = ({ team, favourite, side }: TeamNameProps) => (
  <div
    className={`flex min-w-0 items-center gap-1.5 ${side === "home" ? "@lg:justify-end" : "@lg:flex-row-reverse @lg:justify-end"}`}
  >
    {favourite && (
      <Star className="h-3.5 w-3.5 shrink-0 text-primary" fill="currentColor" />
    )}
    <Link
      to={`/team/${team.id}`}
      className={`truncate text-sm text-foreground hover:text-primary ${favourite ? "font-bold" : "font-medium"}`}
    >
      {team.name}
    </Link>
  </div>
);

const UpcomingMatchesCard = () => {
  const { favouriteTeamsIds, isLoadingFavourites, isFavourite } =
    useFavouriteTeams();
  const [matches, setMatches] = useState<ScheduledMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { visibleItems, hiddenCount, showMore } = useVisibleItems(
    matches,
    PAGE_SIZE,
  );

  useEffect(() => {
    if (isLoadingFavourites) return;

    getUpcomingMatchesForTeams(favouriteTeamsIds)
      .then(setMatches)
      .catch((err) => {
        setError("Nie udało się pobrać nadchodzących meczów.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [favouriteTeamsIds, isLoadingFavourites]);

  const message =
    isLoadingFavourites || isLoading
      ? "Ładowanie..."
      : (error ??
        (favouriteTeamsIds.length === 0
          ? "Nie masz jeszcze ulubionych drużyn. Dodaj je gwiazdką przy nazwie drużyny."
          : matches.length === 0
            ? "Brak zaplanowanych meczów."
            : null));

  return (
    <Card className="@container gap-0">
      <CardHeader className="border-b pb-6">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-primary" />
          Nadchodzące mecze
        </CardTitle>
        <CardDescription>Mecze Twoich ulubionych drużyn</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-0">
        {message ? (
          <p className="px-6 py-6 text-center text-muted-foreground">
            {message}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visibleItems.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-6 py-2">
                <div className="flex w-20 shrink-0 flex-col items-center rounded-md bg-muted py-1 leading-tight">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    <span className="mr-1 text-xs font-normal uppercase text-muted-foreground">
                      {getShortWeekday(m.datetime)}
                    </span>
                    {getDayMonth(m.datetime)}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {getLocalTime(m.datetime)}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5 @lg:grid @lg:grid-cols-[1fr_auto_1fr] @lg:items-center @lg:gap-3">
                  <TeamName
                    team={m.homeTeam}
                    favourite={isFavourite(m.home_team_id)}
                    side="home"
                  />
                  <span className="hidden text-xs font-medium uppercase text-muted-foreground @lg:inline">
                    vs
                  </span>
                  <TeamName
                    team={m.awayTeam}
                    favourite={isFavourite(m.away_team_id)}
                    side="away"
                  />
                </div>

                <div className="hidden w-48 shrink-0 flex-col text-right leading-tight @2xl:flex">
                  <span className="truncate text-sm font-medium text-foreground">
                    {m.stadium?.name ?? "Brak stadionu"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {m.stadium?.city ?? "Brak miasta"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {!message && (
        <ShowMoreFooter hiddenCount={hiddenCount} onClick={showMore} />
      )}
    </Card>
  );
};

export default UpcomingMatchesCard;
