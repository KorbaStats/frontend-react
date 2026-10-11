import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  getMatchById,
  getTeamMatches,
  type MatchWithWeather,
} from "@/services/matchesService";
import {
  getWeatherPercentiles,
  type WeatherPercentile,
} from "@/services/weatherStatsService";

import MatchHeaderCard from "@/components/match-details/MatchHeaderCard";
import MatchStats from "@/components/match-details/MatchStats";
import MatchWeatherInsights from "@/components/match-details/MatchWeatherInsights";
import ExportReportButton from "@/components/shared/ExportReportButton";

const EMPTY_MATCHES: MatchWithWeather[] = [];
const EMPTY_PERCENTILES: WeatherPercentile[] = [];

const MatchDetails = () => {
  const { id } = useParams();
  const matchId = Number(id);

  const [activeTab, setActiveTab] = useState<"stats" | "weather">("weather");

  const matchQuery = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => getMatchById(matchId),
  });

  const match = matchQuery.data;
  const homeTeamId = match?.home_team_id;
  const awayTeamId = match?.away_team_id;
  const leagueId = match?.league_id ?? null;

  const homeMatchesQuery = useQuery({
    queryKey: ["matches", "team", homeTeamId],
    queryFn: () => getTeamMatches(homeTeamId!),
    enabled: !!match,
  });

  const awayMatchesQuery = useQuery({
    queryKey: ["matches", "team", awayTeamId],
    queryFn: () => getTeamMatches(awayTeamId!),
    enabled: !!match,
  });

  const percentilesQuery = useQuery({
    queryKey: ["weather-stats", "percentiles", matchId, leagueId],
    queryFn: () => getWeatherPercentiles(matchId, leagueId ?? undefined),
    enabled: !!match,
  });

  if (matchQuery.isPending) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Ładowanie...
        </CardContent>
      </Card>
    );
  }

  if (matchQuery.isError || !match) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Nie znaleziono meczu o podanym ID
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <MatchHeaderCard match={match} />
      <div className="flex gap-2 print:hidden">
        <Button
          aria-pressed={activeTab === "stats"}
          variant={activeTab === "stats" ? "secondary" : "outline"}
          onClick={() => setActiveTab("stats")}
        >
          Statystyki
        </Button>
        <Button
          aria-pressed={activeTab === "weather"}
          variant={activeTab === "weather" ? "secondary" : "outline"}
          onClick={() => setActiveTab("weather")}
        >
          Wpływ pogody
        </Button>
      </div>

      {activeTab === "stats" ? (
        <MatchStats match={match} />
      ) : (
        <MatchWeatherInsights
          match={match}
          percentiles={percentilesQuery.data ?? EMPTY_PERCENTILES}
          isPercentilesPending={percentilesQuery.isPending}
          isPercentilesError={percentilesQuery.isError}
          homeMatches={homeMatchesQuery.data ?? EMPTY_MATCHES}
          awayMatches={awayMatchesQuery.data ?? EMPTY_MATCHES}
          isTeamMatchesPending={
            homeMatchesQuery.isPending || awayMatchesQuery.isPending
          }
          isTeamMatchesError={
            homeMatchesQuery.isError || awayMatchesQuery.isError
          }
        />
      )}
      <ExportReportButton
        fileName={`Raport - ${match.homeTeam.name} vs ${match.awayTeam.name} - ${new Date(match.datetime).toLocaleDateString("pl-PL")}`}
      />
    </>
  );
};

export default MatchDetails;
