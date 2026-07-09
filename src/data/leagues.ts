// Mocked data - change later for backend endpoints

export type League = {
  id: string
  name: string
  flag: string
}

export const leagues: League[] = [
  { id: "ekstraklasa", name: "Ekstraklasa", flag: "🇵🇱" },
  { id: "laliga", name: "LaLiga", flag: "🇪🇸" },
  { id: "premier-league", name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "bundesliga", name: "Bundesliga", flag: "🇩🇪" },
]
