import { useEffect, useState } from "react";
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
import TopWeatherScores from "@/components/league-details/TopWeatherScores";
import LeagueRecentMatches from "@/components/league-details/LeagueRecentMatches";
import ExportReportButton from "@/components/shared/ExportReportButton";

const LeagueDetails = () => {
  const { id } = useParams();
  const leagueId = Number(id);

  const [league, setLeague] = useState<League | null>(null);
  const [leagueMatches, setLeagueMatches] = useState<MatchWithWeather[] | []>(
    [],
  );
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const teamsCount = new Set(
    leagueMatches?.flatMap((m) => [m.home_team_id, m.away_team_id]),
  ).size;

  const weatherSummary = computeLeagueWeatherSummary(leagueMatches ?? []);

  useEffect(() => {
    Promise.all([getLeagueById(leagueId), getAvailableSeasons()])
      .then(([league, seasons]) => {
        setLeague(league);
        setSeasons(seasons);
        setSelectedSeason(seasons[0]); //najnowszy sezon
      })
      .catch((err) => {
        setError("Nie udało się pobrać danych ligi.");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [leagueId]);

  useEffect(() => {
    if (!selectedSeason) return;
    getLeagueMatches(leagueId, selectedSeason)
      .then(setLeagueMatches)
      .catch((err) => {
        setError("Nie udało się pobrać meczów sezonu.");
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [leagueId, selectedSeason]);

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

      <div className="grid gap-4 grid-cols-3 print:grid-cols-1">
        <LeagueTable matches={leagueMatches} />
        <TopWeatherScores matches={leagueMatches} season={selectedSeason} />
      </div>

      {/* key: zmiana sezonu resetuje "Pokaż więcej" */}
      <LeagueRecentMatches
        key={selectedSeason}
        matches={leagueMatches}
        leagueName={league?.name ?? null}
        season={selectedSeason}
      />
      <ExportReportButton
        fileName={`Raport - ${league?.name ?? "liga"} ${selectedSeason ?? ""}`}
      />
    </>
  );
};

export default LeagueDetails;
