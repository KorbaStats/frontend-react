import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router";

import type { MatchWithWeather } from "@/services/matchesService";
import { getWeatherFetchingStatus } from "@/services/matchWeatherService";
import { toUserMessage } from "@/services/http";
import { useAuth } from "@/hooks/useAuth";
import { matchesOptions, weatherScoresOptions } from "@/hooks/queries";
import {
  useInvalidateMatches,
  useRecalculateWeatherScores,
  useRunWeatherFetching,
  WEATHER_STATUS_KEY,
} from "@/hooks/useAdminMutations";
import { getAdminHome, hasPermission } from "@/lib/adminAccess";
import { computeWeatherCoverage, isAwaitingWeather } from "@/lib/weatherCoverage";

import WeatherCoverageCard from "@/components/admin/weather/WeatherCoverageCard";
import WeatherFailuresCard from "@/components/admin/weather/WeatherFailuresCard";
import WeatherFetchingCard from "@/components/admin/weather/WeatherFetchingCard";
import WeatherScoresCard from "@/components/admin/weather/WeatherScoresCard";

const EMPTY_MATCHES: MatchWithWeather[] = [];
const NOT_LOADED = Symbol();

const AdminWeather = () => {
  const { user } = useAuth();
  const canFetchWeather = hasPermission(user, "weather");

  const [now] = useState(() => Date.now());
  const matchesQuery = useQuery(matchesOptions);
  const statusQuery = useQuery({
    queryKey: WEATHER_STATUS_KEY,
    queryFn: getWeatherFetchingStatus,
    enabled: canFetchWeather,
    refetchInterval: (query) => (query.state.data?.running ? 1000 : false),
  });
  const computedAtQuery = useQuery({
    ...weatherScoresOptions,
    select: (scores) => scores[0]?.computed_at,
    enabled: canFetchWeather,
  });
  const fetching = useRunWeatherFetching();
  const recalculation = useRecalculateWeatherScores();
  const invalidateMatches = useInvalidateMatches();

  const matches = matchesQuery.data ?? EMPTY_MATCHES;
  const awaitingCount = useMemo(
    () => matches.filter((match) => isAwaitingWeather(match, now)).length,
    [matches, now],
  );
  const coverage = useMemo(() => computeWeatherCoverage(matches), [matches]);

  const finishedAt = statusQuery.data?.finishedAt;
  const seenFinishedAt = useRef<string | null | typeof NOT_LOADED>(NOT_LOADED);
  useEffect(() => {
    if (finishedAt === undefined) return;
    if (seenFinishedAt.current !== NOT_LOADED && seenFinishedAt.current !== finishedAt) {
      invalidateMatches();
    }
    seenFinishedAt.current = finishedAt;
  }, [finishedAt, invalidateMatches]);

  if (!canFetchWeather) return <Navigate to={getAdminHome(user)} replace />;

  const failures = statusQuery.data?.running ? [] : (statusQuery.data?.failedMatches ?? []);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      <WeatherFetchingCard
        awaitingCount={awaitingCount}
        status={statusQuery.data}
        isPending={statusQuery.isPending || matchesQuery.isPending}
        isError={statusQuery.isError || matchesQuery.isError}
        isStarting={fetching.isPending}
        startError={fetching.error ? toUserMessage(fetching.error) : null}
        canFixStadiums={hasPermission(user, "stadiums")}
        onStart={(limit) => fetching.mutate(limit)}
      />

      <WeatherCoverageCard
        className="lg:col-span-2"
        rows={coverage}
        isPending={matchesQuery.isPending}
        isError={matchesQuery.isError}
      />

      <WeatherScoresCard
        computedAt={computedAtQuery.data}
        isPending={computedAtQuery.isPending}
        isError={computedAtQuery.isError}
        isRecalculating={recalculation.isPending}
        result={recalculation.data}
        recalculateError={recalculation.error ? toUserMessage(recalculation.error) : null}
        onRecalculate={() => recalculation.mutate()}
      />

      {failures.length > 0 && (
        <WeatherFailuresCard className="lg:col-span-3" failures={failures} matches={matches} />
      )}
    </div>
  );
};

export default AdminWeather;
