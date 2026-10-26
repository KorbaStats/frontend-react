import { useMemo, useState } from "react";
import { Plus, Shirt } from "lucide-react";

import type { League, Stadium, Team } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import type { useDeleteTeam, useSaveTeam } from "@/hooks/useAdminMutations";
import { useCrudDialogs } from "@/hooks/useCrudDialogs";
import {
  ALL_VALUES,
  countTeamUsage,
  describeUsage,
  filterTeams,
  fromIdValue,
  sortByName,
  toIdOptions,
} from "@/lib/adminData";
import { toUserMessage } from "@/services/http";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminTableCard from "@/components/admin/AdminTableCard";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import OptionSelect from "@/components/admin/OptionSelect";
import RowActions from "@/components/admin/RowActions";
import TeamDialog from "@/components/admin/data/TeamDialog";

interface TeamsCardProps {
  teams: Team[];
  leagues: League[];
  stadiums: Stadium[];
  matches: MatchWithWeather[];
  canPickStadium: boolean;
  isPending: boolean;
  isError: boolean;
  saveTeam: ReturnType<typeof useSaveTeam>;
  deleteTeam: ReturnType<typeof useDeleteTeam>;
}

const TeamsCard = ({
  teams,
  leagues,
  stadiums,
  matches,
  canPickStadium,
  isPending,
  isError,
  saveTeam,
  deleteTeam,
}: TeamsCardProps) => {
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState(ALL_VALUES);
  const dialogs = useCrudDialogs<Team>(saveTeam, deleteTeam);

  const filteredTeams = useMemo(
    () => sortByName(filterTeams(teams, search, fromIdValue(leagueFilter) ?? "all")),
    [teams, search, leagueFilter],
  );

  return (
    <AdminTableCard
      icon={Shirt}
      title="Drużyny"
      description={`Pokazano ${filteredTeams.length} z ${teams.length} drużyn`}
      actions={
        <>
          <Input
            placeholder="Szukaj drużyny"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-8 w-48"
          />
          <OptionSelect
            value={leagueFilter}
            onChange={setLeagueFilter}
            options={toIdOptions(leagues, "Wszystkie ligi", ALL_VALUES)}
            className="h-8 w-40"
          />
          <Button
            size="sm"
            onClick={() => dialogs.openEditor("new")}
            disabled={isPending || isError}
          >
            <Plus />
            Dodaj
          </Button>
        </>
      }
      isPending={isPending}
      isError={isError}
      errorText="Nie udało się pobrać drużyn"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Nazwa</TableHead>
            <TableHead>Skrót</TableHead>
            <TableHead>Miasto</TableHead>
            <TableHead>Kraj</TableHead>
            <TableHead>Liga</TableHead>
            <TableHead>Stadion domowy</TableHead>
            <TableHead className="text-right">Mecze</TableHead>
            <TableHead className="pr-4 text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTeams.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                Brak drużyn spełniających kryteria.
              </TableCell>
            </TableRow>
          )}

          {filteredTeams.map((team) => {
            const usage = countTeamUsage(team.id, matches);

            return (
              <TableRow key={team.id}>
                <TableCell className="pl-4 font-medium text-foreground">{team.name}</TableCell>
                <TableCell>{team.short_name ?? "—"}</TableCell>
                <TableCell>{team.city ?? "—"}</TableCell>
                <TableCell>{team.country ?? "—"}</TableCell>
                <TableCell>{team.league?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {team.homeStadium?.name ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">{usage.matches}</TableCell>
                <TableCell className="pr-4">
                  <RowActions
                    onEdit={() => dialogs.openEditor(team)}
                    onDelete={() => dialogs.openDelete(team)}
                    deleteBlockedReason={describeUsage(usage)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {dialogs.isEditorOpen && (
        <TeamDialog
          team={dialogs.edited}
          leagues={leagues}
          stadiums={stadiums}
          canPickStadium={canPickStadium}
          error={saveTeam.error ? toUserMessage(saveTeam.error) : null}
          isSaving={saveTeam.isPending}
          onSubmit={(input) =>
            saveTeam.mutate(
              { id: dialogs.edited?.id ?? null, input },
              { onSuccess: dialogs.closeEditor },
            )
          }
          onClose={dialogs.closeEditor}
        />
      )}

      {dialogs.deleting && (
        <ConfirmDeleteDialog
          title="Usunąć drużynę?"
          description={`Drużyna ${dialogs.deleting.name} zostanie trwale usunięta.`}
          error={deleteTeam.error ? toUserMessage(deleteTeam.error) : null}
          isDeleting={deleteTeam.isPending}
          onConfirm={() =>
            deleteTeam.mutate(dialogs.deleting!.id, { onSuccess: dialogs.closeDelete })
          }
          onClose={dialogs.closeDelete}
        />
      )}
    </AdminTableCard>
  );
};

export default TeamsCard;
