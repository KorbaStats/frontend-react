import type { MatchWithWeather } from "@/services/matchesService";

import RecentWeatherMatches from "./RecentWeatherMatches";

interface MatchWeatherInsightsProps {
  match: MatchWithWeather;
}

// Zawartość zakładki "Wpływ pogody" — sam układ sekcji, bez własnej logiki.
// Kolejne sekcje pogodowe dokładamy tutaj jako osobne komponenty.
const MatchWeatherInsights = ({ match }: MatchWeatherInsightsProps) => {
  return (
    <div className="flex flex-col gap-6">
      <RecentWeatherMatches match={match} />
    </div>
  );
};

export default MatchWeatherInsights;
