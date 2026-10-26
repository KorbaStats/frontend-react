import { Plus, Trophy } from "lucide-react";

import type { League, Team } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import type { useDeleteLeague, useSaveLeague } from "@/hooks/useAdminMutations";
import { useCrudDialogs } from "@/hooks/useCrudDialogs";
import { countLeagueUsage, describeUsage, sortByName } from "@/lib/adminData";
import { toUserMessage } from "@/services/http";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import RowActions from "@/components/admin/RowActions";
import LeagueDialog from "@/components/admin/data/LeagueDialog";

interface LeaguesCardProps {
  leagues: League[];
  teams: Team[];
  matches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
  saveLeague: ReturnType<typeof useSaveLeague>;
  deleteLeague: ReturnType<typeof useDeleteLeague>;
}

const LeaguesCard = ({
  leagues,
  teams,
  matches,
  isPending,
  isError,
  saveLeague,
  deleteLeague,
}: LeaguesCardProps) => {
  const dialogs = useCrudDialogs<League>(saveLeague, deleteLeague);

  return (
    <AdminTableCard
      icon={Trophy}
      title="Ligi"
      description={`${leagues.length} w bazie`}
      actions={
        <Button size="sm" onClick={() => dialogs.openEditor("new")} disabled={isPending || isError}>
          <Plus />
          Dodaj
        </Button>
      }
      isPending={isPending}
      isError={isError}
      errorText="Nie udało się pobrać lig"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Nazwa</TableHead>
            <TableHead>Kraj</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Drużyny</TableHead>
            <TableHead className="text-right">Mecze</TableHead>
            <TableHead className="pr-4 text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortByName(leagues).map((league) => {
            const usage = countLeagueUsage(league.id, teams, matches);

            return (
              <TableRow key={league.id}>
                <TableCell className="pl-4 font-medium text-foreground">{league.name}</TableCell>
                <TableCell>{league.country ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{league.slug ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={league.active ? "secondary" : "outline"}>
                    {league.active ? "aktywna" : "nieaktywna"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{usage.teams}</TableCell>
                <TableCell className="text-right tabular-nums">{usage.matches}</TableCell>
                <TableCell className="pr-4">
                  <RowActions
                    onEdit={() => dialogs.openEditor(league)}
                    onDelete={() => dialogs.openDelete(league)}
                    deleteBlockedReason={describeUsage(usage)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {dialogs.isEditorOpen && (
        <LeagueDialog
          league={dialogs.edited}
          error={saveLeague.error ? toUserMessage(saveLeague.error) : null}
          isSaving={saveLeague.isPending}
          onSubmit={(input) =>
            saveLeague.mutate(
              { id: dialogs.edited?.id ?? null, input },
              { onSuccess: dialogs.closeEditor },
            )
          }
          onClose={dialogs.closeEditor}
        />
      )}

      {dialogs.deleting && (
        <ConfirmDeleteDialog
          title="Usunąć ligę?"
          description={`Liga ${dialogs.deleting.name} zostanie trwale usunięta.`}
          error={deleteLeague.error ? toUserMessage(deleteLeague.error) : null}
          isDeleting={deleteLeague.isPending}
          onConfirm={() =>
            deleteLeague.mutate(dialogs.deleting!.id, { onSuccess: dialogs.closeDelete })
          }
          onClose={dialogs.closeDelete}
        />
      )}
    </AdminTableCard>
  );
};

export default LeaguesCard;
