import type { MatchWithWeather } from "@/services/matchesService";
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
}: MatchWeatherInsightsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 print:grid-cols-1">
        <TeamsWeatherScoreSection
          match={match}
          homeMatches={homeMatches}
          awayMatches={awayMatches}
          isPending={isTeamMatchesPending}
          isError={isTeamMatchesError}
        />
        <WeatherPercentiles
          match={match}
          percentiles={percentiles}
          isPending={isPercentilesPending}
          isError={isPercentilesError}
        />
      </div>
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
