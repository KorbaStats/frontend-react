import type { MatchWithWeather } from "@/services/matchesService";
import WeatherScoreCard from "@/components/shared/WeatherScoreCard";

interface TeamsWeatherScoreSectionProps {
  match: MatchWithWeather,
}

const TeamsWeatherScoreSection = ({match}: TeamsWeatherScoreSectionProps) => {
  const homeTeamId = match.home_team_id;
  const awayTeamId = match.away_team_id;

  return (
    <div className="">
      <h1>Weather score obydwu drużyn</h1>
      <div className="flex justify-evenly">
        <WeatherScoreCard teamId={homeTeamId} />
        <WeatherScoreCard teamId={awayTeamId} />
      </div>
    </div>
  )
}

export default TeamsWeatherScoreSection
