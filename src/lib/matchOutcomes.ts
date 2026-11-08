import type { MatchWithWeather } from "@/services/matchesService"

export type OutcomeSplit = {
  homeWins: number,
  draws: number,
  awayWins: number,
  matches: number
}

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

export type MatchOdds = { home: number; draw: number; away: number };

export function matchOdds(match: MatchWithWeather): MatchOdds | null {
  const { home_win_odds: home, draw_odds: draw, away_win_odds: away } = match;
  if (!home || !draw || !away) return null;
  return { home, draw, away };
}

export function impliedShares({ home, draw, away }: MatchOdds): MatchOdds {
  const total = 1 / home + 1 / draw + 1 / away;
  return {
    home: (1 / home / total) * 100,
    draw: (1 / draw / total) * 100,
    away: (1 / away / total) * 100,
  };
}

export function hasExpectedGoals(match: MatchWithWeather): boolean {
  return (
    match.home_expected_goals_xg !== null &&
    match.away_expected_goals_xg !== null
  );
}
