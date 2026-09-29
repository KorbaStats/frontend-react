import type { MatchWithWeather } from "@/services/matchesService"

export type OutcomeSplit = {
  homeWins: number,
  draws: number,
  awayWins: number,
  matches: number
}

// do wykresu procentowo home wins / away wins i draws z podzialem na difficult/normal weather
export function computeOutcomeSplit(matches: MatchWithWeather[]): OutcomeSplit {
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  matches.forEach(m => {
    if (m.home_goals > m.away_goals) {
      homeWins++;
    } else if (m.home_goals < m.away_goals) {
      awayWins++;
    } else {
      draws++;
    }
  })

  return {
    homeWins,
    draws,
    awayWins,
    matches: matches.length
  }
}