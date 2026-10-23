import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Team } from "@/data/types";
import { searchTeams } from "@/lib/search";
import { teamsOptions } from "@/hooks/queries";

const EMPTY_TEAMS: Team[] = [];

export function useTeamSearch() {
  const [query, setQuery] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);

  const teamsQuery = useQuery({ ...teamsOptions, enabled: isEnabled });

  const loadTeams = useCallback(() => setIsEnabled(true), []);

  const teams = teamsQuery.data ?? EMPTY_TEAMS;
  const results = useMemo(() => searchTeams(teams, query), [teams, query]);

  return {
    query,
    setQuery,
    results,
    loading: isEnabled && teamsQuery.isPending,
    error: teamsQuery.isError ? "Nie udało się pobrać drużyn" : null,
    loadTeams,
  };
}
