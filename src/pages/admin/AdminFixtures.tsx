import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router";

import type { FixtureSyncRun } from "@/data/types";
import { getFixturesSyncStatus } from "@/services/fixturesService";
import { toUserMessage } from "@/services/http";
import { useAuth } from "@/hooks/useAuth";
import {
  FIXTURES_SYNC_STATUS_KEY,
  useStartFixturesSync,
} from "@/hooks/useAdminMutations";
import { getAdminHome, hasPermission } from "@/lib/adminAccess";

import FixturesSyncCard from "@/components/admin/fixtures/FixturesSyncCard";
import FixtureSyncRunsCard from "@/components/admin/fixtures/FixtureSyncRunsCard";

const EMPTY_RUNS: FixtureSyncRun[] = [];
const RUNNING_POLL_MS = 2000;

const AdminFixtures = () => {
  const { user } = useAuth();
  const canSync = hasPermission(user, "fixtures");
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: FIXTURES_SYNC_STATUS_KEY,
    queryFn: getFixturesSyncStatus,
    enabled: canSync,
    // w trakcie synchronizacji odświeżamy stan, potem tylko na żądanie
    refetchInterval: (query) => (query.state.data?.running ? RUNNING_POLL_MS : false),
  });
  const sync = useStartFixturesSync();

  // po zakończeniu synchronizacji odświeżamy terminarz i predykcje
  const running = statusQuery.data?.running;
  const wasRunning = useRef(false);
  useEffect(() => {
    if (running === undefined) return;
    if (wasRunning.current && !running) {
      queryClient.invalidateQueries({ queryKey: ["fixtures", "upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["fixtures", "weather-scores"] });
    }
    wasRunning.current = running;
  }, [running, queryClient]);

  if (!canSync) return <Navigate to={getAdminHome(user)} replace />;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      <FixturesSyncCard
        status={statusQuery.data}
        isPending={statusQuery.isPending}
        isError={statusQuery.isError}
        isStarting={sync.isPending}
        startError={sync.error ? toUserMessage(sync.error) : null}
        onStart={() => sync.mutate()}
      />

      <FixtureSyncRunsCard
        className="lg:col-span-2"
        runs={statusQuery.data?.runs ?? EMPTY_RUNS}
        running={running ?? false}
      />
    </div>
  );
};

export default AdminFixtures;
