import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { CalendarClock, CloudSun, Star } from "lucide-react";

import type {
  Fixture,
  FixtureWeatherScore,
  FixtureWeatherScoreEntry,
  League,
} from "@/data/types";
import { leaguesOptions, weatherScoreCategoriesOptions } from "@/hooks/queries";
import { useFavouriteTeams } from "@/hooks/useFavouriteTeams";
import {
  getUpcomingFixtures,
  getUpcomingFixtureWeatherScores,
} from "@/services/fixturesService";
import { toUserMessage } from "@/services/http";
import { formatDateTime } from "@/lib/date";
import { isDifficultConditions } from "@/lib/weatherProfile";
import { polishPlural } from "@/lib/polishPlural";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PredictionCard from "@/components/predictions/PredictionCard";

const EMPTY_FIXTURES: Fixture[] = [];
const EMPTY_ENTRIES: FixtureWeatherScoreEntry[] = [];
const EMPTY_LEAGUES: League[] = [];

const selectClass =
  "h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const isPrediction = (entry: FixtureWeatherScoreEntry): entry is FixtureWeatherScore =>
  !("error" in entry);

const dayKey = (datetime: string) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Warsaw" }).format(new Date(datetime));

const dayLabel = (datetime: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Warsaw",
  }).format(new Date(datetime));

const teamsLabel = (fixture: Fixture) =>
  `${fixture.homeTeam?.name ?? "?"} – ${fixture.awayTeam?.name ?? "?"}`;

const Predictions = () => {
  const [leagueId, setLeagueId] = useState<number | "all">("all");
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  const { canUseFavourites, favouriteTeamsIds } = useFavouriteTeams();

  const leaguesQuery = useQuery(leaguesOptions);
  const categoriesQuery = useQuery(weatherScoreCategoriesOptions);
  const fixturesQuery = useQuery({
    queryKey: ["fixtures", "upcoming"],
    queryFn: () => getUpcomingFixtures(),
  });
  const predictionsQuery = useQuery({
    queryKey: ["fixtures", "weather-scores"],
    queryFn: () => getUpcomingFixtureWeatherScores(),
    // prognozy na backendzie i tak odświeżają się co 3 h
    staleTime: 30 * 60 * 1000,
  });

  const leagues = leaguesQuery.data ?? EMPTY_LEAGUES;
  const favouritesFilter = canUseFavourites && onlyFavourites;

  const fixtures = useMemo(
    () =>
      (fixturesQuery.data ?? EMPTY_FIXTURES).filter((fixture) => {
        if (leagueId !== "all" && fixture.league_id !== leagueId) return false;
        if (!favouritesFilter) return true;
        return [fixture.home_team_id, fixture.away_team_id].some(
          (id) => id !== null && favouriteTeamsIds.includes(id),
        );
      }),
    [fixturesQuery.data, leagueId, favouritesFilter, favouriteTeamsIds],
  );

  const entriesById = useMemo(
    () =>
      new Map(
        (predictionsQuery.data ?? EMPTY_ENTRIES).map((entry) => [entry.fixture_id, entry]),
      ),
    [predictionsQuery.data],
  );

  // mecze w zasięgu prognozy pogrupowane po dniu, dalsze osobno
  const { days, later, withForecast, difficultCount } = useMemo(() => {
    const byDay = new Map<string, { label: string; items: { fixture: Fixture; entry: FixtureWeatherScoreEntry }[] }>();
    const beyond: Fixture[] = [];
    let forecasts = 0;
    let difficult = 0;

    for (const fixture of fixtures) {
      const entry = entriesById.get(fixture.id);
      if (!entry) {
        beyond.push(fixture);
        continue;
      }
      if (isPrediction(entry)) {
        forecasts++;
        if (isDifficultConditions(entry.conditions)) difficult++;
      }
      const key = dayKey(fixture.datetime);
      const day = byDay.get(key) ?? { label: dayLabel(fixture.datetime), items: [] };
      day.items.push({ fixture, entry });
      byDay.set(key, day);
    }

    return {
      days: [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, day]) => day),
      later: beyond,
      withForecast: forecasts,
      difficultCount: difficult,
    };
  }, [fixtures, entriesById]);

  const isPending = fixturesQuery.isPending || predictionsQuery.isPending;
  const error = fixturesQuery.error ?? predictionsQuery.error;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 border-b pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CloudSun className="h-4 w-4 text-primary" />
              Predykcje
            </CardTitle>
            <CardDescription>
              Jak prognozowana pogoda wpłynie na nadchodzące mecze. Weather Score
              (0–100) mówi, jak drużyna gra w prognozowanych warunkach na tle swojej
              zwykłej gry - 50 to bez różnicy. Liczby przy warunkach to score drużyn
              dla danego czynnika, duża liczba to ich średnia.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className={selectClass}
              aria-label="Liga"
              value={leagueId}
              onChange={(e) =>
                setLeagueId(e.target.value === "all" ? "all" : Number(e.target.value))
              }
            >
              <option value="all">Wszystkie ligi</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>

            {canUseFavourites ? (
              <Button
                variant={onlyFavourites ? "secondary" : "outline"}
                size="sm"
                className="rounded-full"
                aria-pressed={onlyFavourites}
                onClick={() => setOnlyFavourites(!onlyFavourites)}
              >
                <Star fill={onlyFavourites ? "currentColor" : "none"} />
                Tylko ulubione drużyny
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Zaloguj się
                </Link>
                , aby filtrować po ulubionych drużynach.
              </span>
            )}

            {!isPending && !error && (
              <span className="ml-auto rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
                {withForecast} {polishPlural(withForecast, "mecz", "mecze", "meczów")} z
                prognozą · {difficultCount} w trudnej pogodzie
              </span>
            )}
          </div>
        </CardHeader>
      </Card>

      {isPending ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Pobieranie terminarza i prognoz pogody...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center text-destructive">
            Nie udało się pobrać predykcji. {toUserMessage(error)}
          </CardContent>
        </Card>
      ) : fixtures.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {favouritesFilter
              ? "Brak nadchodzących meczów ulubionych drużyn."
              : "Brak nadchodzących meczów w terminarzu."}
          </CardContent>
        </Card>
      ) : (
        <>
          {days.map((day) => (
            <section key={day.label} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-muted-foreground first-letter:uppercase">
                {day.label}
              </h2>
              <div className="grid gap-4 2xl:grid-cols-2">
                {day.items.map(({ fixture, entry }) =>
                  isPrediction(entry) ? (
                    <PredictionCard
                      key={fixture.id}
                      fixture={fixture}
                      prediction={entry}
                      categories={categoriesQuery.data}
                    />
                  ) : (
                    <Card key={fixture.id}>
                      <CardContent className="flex flex-col gap-1 text-sm">
                        <span className="font-semibold">{teamsLabel(fixture)}</span>
                        <span className="text-muted-foreground">
                          Brak prognozy: {entry.error}
                        </span>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </section>
          ))}

          {later.length > 0 && (
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Dalsze mecze
                </CardTitle>
                <CardDescription>
                  Poza zasięgiem prognozy pogody (ok. 2 tygodnie) - predykcja pojawi
                  się bliżej terminu meczu.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <ul className="divide-y">
                  {later.map((fixture) => (
                    <li
                      key={fixture.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm"
                    >
                      <span className="font-medium">{teamsLabel(fixture)}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {fixture.league?.name} · {formatDateTime(fixture.datetime)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
};

export default Predictions;
