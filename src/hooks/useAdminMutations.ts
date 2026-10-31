import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  LeagueInput,
  MatchInput,
  RoleInput,
  StadiumInput,
  TeamInput,
  UserAccountInput,
} from "@/data/types";
import { SESSION_KEY } from "@/hooks/useAuth";
import { createUser, deleteUser, updateUser } from "@/services/usersService";
import { createRole, deleteRole, updateRole } from "@/services/rolesService";
import { createLeague, deleteLeague, updateLeague } from "@/services/leaguesService";
import { createTeam, deleteTeam, updateTeam } from "@/services/teamsService";
import {
  createStadium,
  deleteStadium,
  runGeocoding,
  updateStadium,
} from "@/services/stadiumsService";
import { deleteMatch, updateMatch } from "@/services/matchesService";
import { runWeatherFetching } from "@/services/matchWeatherService";
import { recalculateWeatherScores } from "@/services/weatherScoresService";

type QueryKey = readonly string[];

type SaveVariables<T> = { id: number | null; input: T };

const SESSION_KEYS: QueryKey[] = [["users"], SESSION_KEY];
const MATCH_KEYS: QueryKey[] = [["matches"], ["match"], ["match-stats"]];

function useInvalidate(keys: QueryKey[]) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

function useSaveMutation<T>(
  create: ((input: T) => Promise<unknown>) | null,
  update: (id: number, input: T) => Promise<unknown>,
  keys: QueryKey[],
) {
  const onSuccess = useInvalidate(keys);
  return useMutation({
    mutationFn: ({ id, input }: SaveVariables<T>) => {
      if (id !== null) return update(id, input);
      if (!create) throw new Error("Dodawanie nie jest obsługiwane");
      return create(input);
    },
    onSuccess,
  });
}

function useDeleteMutation(remove: (id: number) => Promise<void>, keys: QueryKey[]) {
  const onSuccess = useInvalidate(keys);
  return useMutation({ mutationFn: remove, onSuccess });
}

export const useSaveUser = () =>
  useSaveMutation<UserAccountInput>(createUser, updateUser, SESSION_KEYS);
export const useDeleteUser = () => useDeleteMutation(deleteUser, SESSION_KEYS);

export const useSaveRole = () =>
  useSaveMutation<RoleInput>(createRole, updateRole, [["roles"], ...SESSION_KEYS]);
export const useDeleteRole = () => useDeleteMutation(deleteRole, [["roles"], ...SESSION_KEYS]);

export const useSaveLeague = () =>
  useSaveMutation<LeagueInput>(createLeague, updateLeague, [["leagues"], ["teams"], ...MATCH_KEYS]);
export const useDeleteLeague = () => useDeleteMutation(deleteLeague, [["leagues"]]);

export const useSaveTeam = () =>
  useSaveMutation<TeamInput>(createTeam, updateTeam, [["teams"], ...MATCH_KEYS]);
export const useDeleteTeam = () => useDeleteMutation(deleteTeam, [["teams"]]);

export const useSaveStadium = () =>
  useSaveMutation<StadiumInput>(createStadium, updateStadium, [
    ["stadiums"],
    ["teams"],
    ...MATCH_KEYS,
  ]);
export const useDeleteStadium = () => useDeleteMutation(deleteStadium, [["stadiums"]]);

export const useSaveMatch = () => useSaveMutation<MatchInput>(null, updateMatch, MATCH_KEYS);
export const useDeleteMatch = () => useDeleteMutation(deleteMatch, MATCH_KEYS);

export function useRunGeocoding() {
  const onSettled = useInvalidate([["stadiums"], ["teams"], ...MATCH_KEYS]);
  return useMutation({ mutationFn: runGeocoding, onSettled });
}

export const WEATHER_STATUS_KEY = ["match-weather", "status"] as const;

export function useRunWeatherFetching() {
  const onSuccess = useInvalidate([WEATHER_STATUS_KEY]);
  return useMutation({ mutationFn: runWeatherFetching, onSuccess });
}

export function useRecalculateWeatherScores() {
  const onSuccess = useInvalidate([["weather-scores"]]);
  return useMutation({ mutationFn: recalculateWeatherScores, onSuccess });
}

export const useInvalidateMatches = () => useInvalidate(MATCH_KEYS);
