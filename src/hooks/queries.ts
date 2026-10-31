import { queryOptions } from "@tanstack/react-query";

import { getAvailableSeasons, getMatches } from "@/services/matchesService";
import { getTeams } from "@/services/teamsService";
import { getLeagues } from "@/services/leaguesService";
import { getUsers } from "@/services/usersService";
import { getRoles } from "@/services/rolesService";
import { getPermissions } from "@/services/permissionsService";
import { getStadiums } from "@/services/stadiumsService";
import {
  getWeatherScoreCategories,
  getWeatherScores,
} from "@/services/weatherScoresService";

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

export const usersOptions = queryOptions({
  queryKey: ["users"],
  queryFn: async () => (await getUsers()).data,
});

export const rolesOptions = queryOptions({
  queryKey: ["roles"],
  queryFn: getRoles,
});

export const permissionsOptions = queryOptions({
  queryKey: ["permissions"],
  queryFn: getPermissions,
  staleTime: Infinity,
});

export const stadiumsOptions = queryOptions({
  queryKey: ["stadiums"],
  queryFn: async () => (await getStadiums()).data,
});

export const weatherScoresOptions = queryOptions({
  queryKey: ["weather-scores"],
  queryFn: () => getWeatherScores(),
});

export const leagueWeatherScoresOptions = (leagueId: number) =>
  queryOptions({
    queryKey: ["weather-scores", "league", leagueId],
    queryFn: () => getWeatherScores(leagueId),
  });

export const weatherScoreCategoriesOptions = queryOptions({
  queryKey: ["weather-scores", "categories"],
  queryFn: getWeatherScoreCategories,
  staleTime: Infinity,
});
