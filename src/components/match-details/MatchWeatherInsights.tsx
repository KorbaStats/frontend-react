import type { MatchWithWeather } from "@/services/matchesService";

import WeatherPercentiles from "./weather-insights/WeatherPercentiles";
import RecentWeatherMatches from "./weather-insights/RecentWeatherMatches";
import TeamsWeatherScoreSection from "./weather-insights/TeamsWeatherScoreSection";

interface MatchWeatherInsightsProps {
  match: MatchWithWeather;
}

const MatchWeatherInsights = ({ match }: MatchWeatherInsightsProps) => {
  return (
    <div className="flex flex-col gap-6">
      <TeamsWeatherScoreSection match={match} />
      <WeatherPercentiles match={match} />
      <RecentWeatherMatches match={match} />
    </div>
  );
};

export default MatchWeatherInsights;
