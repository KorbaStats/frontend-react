import { useEffect, useMemo, useState } from "react";
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

const Leagues = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [matches, setMatches] = useState<MatchWithWeather[]>([]);
  const [season, setSeason] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getLeagues(), getMatches(), getAvailableSeasons()])
      .then(([leaguesRes, matchesRes, seasons]) => {
        setLeagues(leaguesRes.data);
        setMatches(matchesRes.data);
        setSeason(seasons[0] ?? null);
      })
      .catch((err) => {
        setError("Nie udało się pobrać lig.");
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, []);

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

      {isLoading && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Ładowanie...
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-10 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
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
