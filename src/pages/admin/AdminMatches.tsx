import { useQuery } from "@tanstack/react-query";

import type { League, Stadium } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import { useAuth } from "@/hooks/useAuth";
import { leaguesOptions, matchesOptions, seasonsOptions, stadiumsOptions } from "@/hooks/queries";
import { useDeleteMatch, useSaveMatch } from "@/hooks/useAdminMutations";
import { hasPermission } from "@/lib/adminAccess";

import MatchesAdminCard from "@/components/admin/data/MatchesAdminCard";

const EMPTY_MATCHES: MatchWithWeather[] = [];
const EMPTY_LEAGUES: League[] = [];
const EMPTY_STADIUMS: Stadium[] = [];
const EMPTY_SEASONS: string[] = [];

const AdminMatches = () => {
  const { user } = useAuth();
  const canPickStadium = hasPermission(user, "stadiums");

  const matchesQuery = useQuery(matchesOptions);
  const leaguesQuery = useQuery(leaguesOptions);
  const seasonsQuery = useQuery(seasonsOptions);
  const stadiumsQuery = useQuery({ ...stadiumsOptions, enabled: canPickStadium });

  const saveMatch = useSaveMatch();
  const deleteMatch = useDeleteMatch();

  const queries = [matchesQuery, leaguesQuery, seasonsQuery];

  return (
    <MatchesAdminCard
      matches={matchesQuery.data ?? EMPTY_MATCHES}
      leagues={leaguesQuery.data ?? EMPTY_LEAGUES}
      stadiums={stadiumsQuery.data ?? EMPTY_STADIUMS}
      seasons={seasonsQuery.data ?? EMPTY_SEASONS}
      canPickStadium={canPickStadium && stadiumsQuery.isSuccess}
      isPending={queries.some((query) => query.isPending)}
      isError={queries.some((query) => query.isError)}
      saveMatch={saveMatch}
      deleteMatch={deleteMatch}
    />
  );
};

export default AdminMatches;
