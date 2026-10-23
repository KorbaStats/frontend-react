import { queryOptions } from "@tanstack/react-query";

import { getAvailableSeasons, getMatches } from "@/services/matchesService";
import { getTeams } from "@/services/teamsService";
import { getLeagues } from "@/services/leaguesService";

export const matchesOptions = queryOptions({
  queryKey: ["matches"],
  queryFn: async () => (await getMatches()).data,
});

export const teamsOptions = queryOptions({
  queryKey: ["teams"],
  queryFn: async () => (await getTeams()).data,
  staleTime: Infinity,
});

export const leaguesOptions = queryOptions({
  queryKey: ["leagues"],
  queryFn: async () => (await getLeagues()).data,
  staleTime: Infinity,
});

export const seasonsOptions = queryOptions({
  queryKey: ["seasons"],
  queryFn: getAvailableSeasons,
  staleTime: Infinity,
});
