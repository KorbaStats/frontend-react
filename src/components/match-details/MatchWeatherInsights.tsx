import type { MatchWithWeather } from "@/services/matchesService";

import MatchVsWeatherAverage from "./weather-insights/MatchVsWeatherAverage";
import GoalsByWeatherRadial from "./weather-insights/GoalsByWeatherRadial";
import RecentWeatherMatches from "./weather-insights/RecentWeatherMatches";

interface MatchWeatherInsightsProps {
  match: MatchWithWeather;
}

const MatchWeatherInsights = ({ match }: MatchWeatherInsightsProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 min-[1120px]:grid-cols-[3fr_2fr]">
        <MatchVsWeatherAverage match={match} />
        <GoalsByWeatherRadial match={match} />
      </div>
      <RecentWeatherMatches match={match} />
    </div>
  );
};

export default MatchWeatherInsights;
