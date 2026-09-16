import type { MatchWithWeather } from '@/services/matchesService'
import { computeWeatherScore } from '@/lib/weatherScore'


interface WeatherScoreBadgeProps {
  matches: MatchWithWeather[],
  teamId: number,
}

const WeatherScoreBadge = ({matches, teamId}: WeatherScoreBadgeProps) => {
  const weatherScore = computeWeatherScore(matches, teamId);

  if (weatherScore === null) return (<div>Za mało meczów do policzenia weather score</div>)

  return (
    <div>
      <h1>Weather Score: {weatherScore?.score}/100</h1>
      różnica: {weatherScore?.difference > 0 ? '+' : ''}{weatherScore?.difference.toFixed(2)} 
    </div>
  )
}

export default WeatherScoreBadge
