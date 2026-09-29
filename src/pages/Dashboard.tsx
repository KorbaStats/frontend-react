import { useEffect, useState } from "react";
import {
  type MatchWithWeather,
  getMatches,
  getAvailableSeasons,
} from "@/services/matchesService";

import RecentMatches from "@/components/dashboard/RecentMatchesCard";
import SummaryCards from "@/components/dashboard/SummaryCards";
import WinsByWeatherChart from "@/components/dashboard/WinsByWeatherChart";
import WeatherScoreRankingCard from "@/components/shared/weather-score/WeatherScoreRankingCard";
import {
  computeTopWeatherScores,
  computeBottomWeatherScores,
} from "@/lib/leagueWeather";
import { TrendingDown, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [matches, setMatches] = useState<MatchWithWeather[]>([]);
  const [season, setSeason] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMatches(), getAvailableSeasons()])
      .then(([res, seasons]) => {
        const newest = seasons[0] ?? null; //tylko dame z najnowszego sezonu
        setSeason(newest);
        setMatches(res.data.filter((m) => m.season === newest));
      })
      .catch((err) => console.error(err));
  }, []);

  const seasonLabel = `Wszystkie ligi${season ? `, sezon ${season}` : ""}`;

  return (
    <>
      <SummaryCards />
      <div className="grid grid-cols-3 gap-4">
        <WinsByWeatherChart matches={matches} season={season} />
        <WeatherScoreRankingCard
          Icon={TrendingUp}
          scores={computeTopWeatherScores(matches)}
          title="Najlepsze Weather Score's"
          description={seasonLabel}
        />
        <WeatherScoreRankingCard
          Icon={TrendingDown}
          iconColor="text-destructive"
          scores={computeBottomWeatherScores(matches)}
          title="Najsłabsze Weather Score's"
          description={seasonLabel}
        />
      </div>
      <RecentMatches />
    </>
  );
};

export default Dashboard;
