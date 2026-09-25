import { useCallback, useMemo, useRef, useState } from "react";

import type { Team } from "@/data/types";
import { searchTeams } from "@/lib/search";
import { getTeams } from "@/services/teamsService";

export function useTeamSearch() {
  const [query, setQuery] = useState(""); 
  const [teams, setTeams] = useState<Team[]>([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requested = useRef(false); 

  const loadTeams = useCallback(async () => {
    if (requested.current) return;
    requested.current = true;
    setLoading(true);
    setError(null);

    try {
      const { data } = await getTeams();
      setTeams(data);
    } catch {
      setError("Nie udało się pobrać drużyn");
      requested.current = false;
    } finally {
      setLoading(false);
    }
  }, []);

  const results = useMemo(() => searchTeams(teams, query), [teams, query]);

  return { query, setQuery, results, loading, error, loadTeams };
}
