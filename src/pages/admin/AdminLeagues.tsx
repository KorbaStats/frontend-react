import { useQuery } from "@tanstack/react-query";

import type { League, Team } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import { leaguesOptions, matchesOptions, teamsOptions } from "@/hooks/queries";
import { useDeleteLeague, useSaveLeague } from "@/hooks/useAdminMutations";

import LeaguesCard from "@/components/admin/data/LeaguesCard";

const EMPTY_LEAGUES: League[] = [];
const EMPTY_TEAMS: Team[] = [];
const EMPTY_MATCHES: MatchWithWeather[] = [];

const AdminLeagues = () => {
  const leaguesQuery = useQuery(leaguesOptions);
  const teamsQuery = useQuery(teamsOptions);
  const matchesQuery = useQuery(matchesOptions);

  const saveLeague = useSaveLeague();
  const deleteLeague = useDeleteLeague();

  const queries = [leaguesQuery, teamsQuery, matchesQuery];

  return (
    <LeaguesCard
      leagues={leaguesQuery.data ?? EMPTY_LEAGUES}
      teams={teamsQuery.data ?? EMPTY_TEAMS}
      matches={matchesQuery.data ?? EMPTY_MATCHES}
      isPending={queries.some((query) => query.isPending)}
      isError={queries.some((query) => query.isError)}
      saveLeague={saveLeague}
      deleteLeague={deleteLeague}
    />
  );
};

export default AdminLeagues;
