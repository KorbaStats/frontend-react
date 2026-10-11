import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Trophy } from "lucide-react";

import type { League } from "@/data/types";
import { getLeagues } from "@/services/leaguesService";
import {
  getAvailableSeasons,
  getMatches,
  type MatchWithWeather,
} from "@/services/matchesService";

import { computeLeagueSummaries } from "@/lib/leagueSummaries";

import { Card, CardContent } from "@/components/ui/card";
import LeagueCard from "@/components/leagues/LeagueCard";

const EMPTY_LEAGUES: League[] = [];
const EMPTY_MATCHES: MatchWithWeather[] = [];

const Leagues = () => {
  const leaguesQuery = useQuery({
    queryKey: ["leagues"],
    queryFn: async () => (await getLeagues()).data,
    staleTime: Infinity, //wartosc lig się nie zmienia
  })

  const matchesQuery = useQuery({
    queryKey: ["matches"],
    queryFn: async () => (await getMatches()).data,
  })

  const seasonsQuery = useQuery({
    queryKey: ["seasons"],
    queryFn: getAvailableSeasons,
    staleTime: Infinity,
  });

  const leagues = leaguesQuery.data ?? EMPTY_LEAGUES;
  const matches = matchesQuery.data ?? EMPTY_MATCHES;
  const season = seasonsQuery.data?.[0] ?? null;

  const isPending =
    leaguesQuery.isPending || matchesQuery.isPending || seasonsQuery.isPending;
  const isError =
    leaguesQuery.isError || matchesQuery.isError || seasonsQuery.isError;

  // Podsumowania 
  const summaries = useMemo(
    () =>
      computeLeagueSummaries(
        leagues,
        season ? matches.filter((m) => m.season === season) : matches,
      ),
    [leagues, matches, season],
  );

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          <Trophy className="h-5 w-5 text-primary" />
          Ligi
        </h1>
        <p className="text-sm text-muted-foreground">
          {season
            ? `Podsumowanie sezonu ${season} — wybierz ligę, żeby zobaczyć tabelę i weather score.`
            : "Wybierz ligę, żeby zobaczyć tabelę i weather score."}
        </p>
      </div>

      {isPending && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Ładowanie...
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="py-10 text-center text-destructive">
            Nie udało się wczytać danych.
          </CardContent>
        </Card>
      )}

      {!isPending && !isError && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaries.map((summary) => (
            <LeagueCard key={summary.league.id} {...summary} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Leagues;
