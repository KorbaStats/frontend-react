import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import { Card, CardContent } from "@/components/ui/card";

import { type League } from "@/data/types";
import { getLeagueById } from "@/services/leaguesService";
import {
  getAvailableSeasons,
  getLeagueMatches,
  type MatchWithWeather,
} from "@/services/matchesService";

import { computeLeagueWeatherSummary } from "@/lib/leagueWeather";

import LeagueHeader from "@/components/league-details/LeagueHeader";
import LeagueTable from "@/components/league-details/LeagueTable";

const LeagueDetails = () => {
  const { id } = useParams();
  const leagueId = Number(id);

  const [league, setLeague] = useState<League | null>(null);
  const [leagueMatches, setLeagueMatches] = useState<MatchWithWeather[] | null>(null);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const teamsCount = useMemo(
    () => new Set(leagueMatches?.flatMap((m) => [m.home_team_id, m.away_team_id])).size,
    [leagueMatches],
  );

  const weatherSummary = useMemo(
    () => computeLeagueWeatherSummary(leagueMatches ?? []),
    [leagueMatches],
  );

  useEffect(() => {
    Promise.all([
      getLeagueById(leagueId),
      getAvailableSeasons(),
    ])
      .then(([league, seasons]) => {
        setLeague(league);
        setSeasons(seasons);
        setSelectedSeason(seasons[0]); //najnowszy sezon
      })
      .catch((err) => {
        setError("Failed to load data");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [leagueId]);

  useEffect(() => {
    if (!selectedSeason) return;
    getLeagueMatches(leagueId, selectedSeason)
      .then(setLeagueMatches)
      .catch((err) => {
        setError("Failed to load sesons");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [leagueId, selectedSeason])

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <CardContent className="py-10 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <LeagueHeader
        league={league}
        seasons={seasons}
        selectedSeason={selectedSeason}
        onSeasonChange={setSelectedSeason}
        teamsCount={teamsCount}
        matchesCount={leagueMatches?.length ?? 0}
        weatherSummary={weatherSummary}
      />
      <div className="grid items-start gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <LeagueTable matches={leagueMatches} />
        </div>
        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* TODO: top 5 weather score, pogoda w lidze */}
        </div>
      </div>
    </>
  );
};

export default LeagueDetails;
