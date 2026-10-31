import type { MatchWithWeather } from "@/services/matchesService";
import type { MatchWeatherScores, WeatherFactorDefinitions } from "@/data/types";
import type { WeatherPercentile } from "@/lib/weatherStats";

import WeatherPercentiles from "./weather-insights/WeatherPercentiles";
import TeamsRecentMatches from "./weather-insights/TeamsRecentMatches";
import TeamsWeatherScoreSection from "./weather-insights/TeamsWeatherScoreSection";

interface MatchWeatherInsightsProps {
  match: MatchWithWeather;
  percentiles: WeatherPercentile[];
  isPercentilesPending: boolean;
  isPercentilesError: boolean;
  homeMatches: MatchWithWeather[];
  awayMatches: MatchWithWeather[];
  isTeamMatchesPending: boolean;
  isTeamMatchesError: boolean;
  weatherScores: MatchWeatherScores | undefined;
  weatherScoreCategories: WeatherFactorDefinitions | undefined;
  isWeatherScoresPending: boolean;
  weatherScoresError: string | null;
}

const MatchWeatherInsights = ({
  match,
  percentiles,
  isPercentilesPending,
  isPercentilesError,
  homeMatches,
  awayMatches,
  isTeamMatchesPending,
  isTeamMatchesError,
  weatherScores,
  weatherScoreCategories,
  isWeatherScoresPending,
  weatherScoresError,
}: MatchWeatherInsightsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <TeamsWeatherScoreSection
          match={match}
          weatherScores={weatherScores}
          categories={weatherScoreCategories}
          isPending={isWeatherScoresPending}
          errorMessage={weatherScoresError}
        />
      <WeatherPercentiles
        match={match}
        percentiles={percentiles}
        isPending={isPercentilesPending}
        isError={isPercentilesError}
      />
      <TeamsRecentMatches
        match={match}
        homeMatches={homeMatches}
        awayMatches={awayMatches}
        isPending={isTeamMatchesPending}
        isError={isTeamMatchesError}
      />
    </div>
  );
};

export default MatchWeatherInsights;
