import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

import type { League, Stadium } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import type { useDeleteMatch, useSaveMatch } from "@/hooks/useAdminMutations";
import { useCrudDialogs } from "@/hooks/useCrudDialogs";
import { useVisibleItems } from "@/hooks/useVisibleItems";
import { ALL_VALUES, filterAdminMatches, fromIdValue, toIdOptions } from "@/lib/adminData";
import { getFormatedDate, getLocalTime, getLongDate, getShortWeekday } from "@/lib/date";
import { toUserMessage } from "@/services/http";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ShowMoreFooter from "@/components/shared/ShowMoreFooter";
import AdminTableCard from "@/components/admin/AdminTableCard";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import OptionSelect from "@/components/admin/OptionSelect";
import RowActions from "@/components/admin/RowActions";
import MatchDialog from "@/components/admin/data/MatchDialog";

interface MatchesAdminCardProps {
  matches: MatchWithWeather[];
  leagues: League[];
  stadiums: Stadium[];
  seasons: string[];
  canPickStadium: boolean;
  isPending: boolean;
  isError: boolean;
  saveMatch: ReturnType<typeof useSaveMatch>;
  deleteMatch: ReturnType<typeof useDeleteMatch>;
}

const MatchesAdminCard = ({
  matches,
  leagues,
  stadiums,
  seasons,
  canPickStadium,
  isPending,
  isError,
  saveMatch,
  deleteMatch,
}: MatchesAdminCardProps) => {
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState(ALL_VALUES);
  const [seasonFilter, setSeasonFilter] = useState(ALL_VALUES);
  const dialogs = useCrudDialogs<MatchWithWeather>(saveMatch, deleteMatch);

  const filteredMatches = useMemo(
    () =>
      filterAdminMatches(matches, {
        query: search,
        leagueId: fromIdValue(leagueFilter) ?? "all",
        season: seasonFilter,
      }),
    [matches, search, leagueFilter, seasonFilter],
  );

  const { visibleItems, hiddenCount, showMore, reset } = useVisibleItems(filteredMatches);
  useEffect(() => reset(), [search, leagueFilter, seasonFilter, reset]);

  return (
    <AdminTableCard
      icon={CalendarDays}
      title="Mecze"
      description={`Pokazano ${filteredMatches.length} z ${matches.length} meczów`}
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
          <OptionSelect
            value={seasonFilter}
            onChange={setSeasonFilter}
            options={[
              { value: ALL_VALUES, label: "Wszystkie sezony" },
              ...seasons.map((season) => ({ value: season, label: season })),
            ]}
            className="h-8 w-40"
          />
        </>
      }
      isPending={isPending}
      isError={isError}
      errorText="Nie udało się pobrać meczów"
      footer={<ShowMoreFooter hiddenCount={hiddenCount} onClick={showMore} />}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Data</TableHead>
            <TableHead>Gospodarze</TableHead>
            <TableHead className="text-center">Wynik</TableHead>
            <TableHead>Goście</TableHead>
            <TableHead>Stadion</TableHead>
            <TableHead className="pr-4 text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMatches.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                Brak meczów spełniających kryteria.
              </TableCell>
            </TableRow>
          )}

          {visibleItems.map((match) => (
            <TableRow key={match.id}>
              <TableCell className="pl-4">
                <div className="flex flex-col leading-tight">
                  <span className="font-medium text-foreground">
                    {getLongDate(match.datetime)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getShortWeekday(match.datetime)} · {getLocalTime(match.datetime)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-medium text-foreground">{match.homeTeam.name}</TableCell>
              <TableCell className="text-center">
                <span className="inline-flex min-w-12 justify-center rounded-md bg-muted px-2 py-0.5 font-semibold tabular-nums text-foreground">
                  {match.home_goals} - {match.away_goals}
                </span>
              </TableCell>
              <TableCell className="font-medium text-foreground">{match.awayTeam.name}</TableCell>
              <TableCell className="text-muted-foreground">{match.stadium?.name ?? "—"}</TableCell>
              <TableCell className="pr-4">
                <RowActions
                  onEdit={() => dialogs.openEditor(match)}
                  onDelete={() => dialogs.openDelete(match)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {dialogs.edited && (
        <MatchDialog
          match={dialogs.edited}
          stadiums={stadiums}
          seasons={seasons}
          canPickStadium={canPickStadium}
          error={saveMatch.error ? toUserMessage(saveMatch.error) : null}
          isSaving={saveMatch.isPending}
          onSubmit={(input) =>
            saveMatch.mutate(
              { id: dialogs.edited!.id, input },
              { onSuccess: dialogs.closeEditor },
            )
          }
          onClose={dialogs.closeEditor}
        />
      )}

      {dialogs.deleting && (
        <ConfirmDeleteDialog
          title="Usunąć mecz?"
          description={`Mecz ${dialogs.deleting.homeTeam.name} – ${dialogs.deleting.awayTeam.name} (${getFormatedDate(dialogs.deleting.datetime)}) zostanie trwale usunięty razem z jego pogodą.`}
          error={deleteMatch.error ? toUserMessage(deleteMatch.error) : null}
          isDeleting={deleteMatch.isPending}
          onConfirm={() =>
            deleteMatch.mutate(dialogs.deleting!.id, { onSuccess: dialogs.closeDelete })
          }
          onClose={dialogs.closeDelete}
        />
      )}
    </AdminTableCard>
  );
};

export default MatchesAdminCard;
