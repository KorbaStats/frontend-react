import { useMemo, useState } from "react";
import { Landmark, MapPin, Plus } from "lucide-react";

import type { GeocodingStatus, Stadium, Team } from "@/data/types";
import type { MatchWithWeather } from "@/services/matchesService";
import type { useDeleteStadium, useSaveStadium } from "@/hooks/useAdminMutations";
import { useCrudDialogs } from "@/hooks/useCrudDialogs";
import { countStadiumUsage, describeUsage, filterStadiums, sortByName } from "@/lib/adminData";
import { toUserMessage } from "@/services/http";

import { Badge } from "@/components/ui/badge";
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
import RowActions from "@/components/admin/RowActions";
import { GeocodingFailures, GeocodingStatusLine } from "@/components/admin/data/GeocodingPanel";
import StadiumDialog from "@/components/admin/data/StadiumDialog";

interface StadiumsCardProps {
  stadiums: Stadium[];
  teams: Team[];
  matches: MatchWithWeather[];
  isPending: boolean;
  isError: boolean;
  saveStadium: ReturnType<typeof useSaveStadium>;
  deleteStadium: ReturnType<typeof useDeleteStadium>;
  geocodingStatus: GeocodingStatus | undefined;
  isGeocoding: boolean;
  geocodingError: string | null;
  onRunGeocoding: () => void;
}

const StadiumsCard = ({
  stadiums,
  teams,
  matches,
  isPending,
  isError,
  saveStadium,
  deleteStadium,
  geocodingStatus,
  isGeocoding,
  geocodingError,
  onRunGeocoding,
}: StadiumsCardProps) => {
  const [search, setSearch] = useState("");
  const dialogs = useCrudDialogs<Stadium>(saveStadium, deleteStadium);

  const filteredStadiums = useMemo(
    () => sortByName(filterStadiums(stadiums, search)),
    [stadiums, search],
  );
  const missingCoordinates = stadiums.filter(
    (stadium) => stadium.latitude === null || stadium.longitude === null,
  ).length;

  return (
    <AdminTableCard
      icon={Landmark}
      title="Stadiony"
      description={
        <>
          Pokazano {filteredStadiums.length} z {stadiums.length} stadionów, bez współrzędnych:{" "}
          {missingCoordinates}
          <GeocodingStatusLine
            status={geocodingStatus}
            isRunning={isGeocoding}
            error={geocodingError}
          />
        </>
      }
      actions={
        <>
          <Input
            placeholder="Szukaj po nazwie lub mieście"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-8 w-56"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={onRunGeocoding}
            disabled={isPending || isError || isGeocoding || missingCoordinates === 0}
          >
            <MapPin />
            {isGeocoding ? "Geokodowanie..." : `Geokoduj brakujące (${missingCoordinates})`}
          </Button>
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
      errorText="Nie udało się pobrać stadionów"
      footer={<GeocodingFailures status={geocodingStatus} isRunning={isGeocoding} />}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Nazwa</TableHead>
            <TableHead>Miasto</TableHead>
            <TableHead>Adres</TableHead>
            <TableHead className="text-right">Pojemność</TableHead>
            <TableHead>Współrzędne</TableHead>
            <TableHead className="text-right">Drużyny</TableHead>
            <TableHead className="text-right">Mecze</TableHead>
            <TableHead className="pr-4 text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStadiums.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                Brak stadionów spełniających kryteria.
              </TableCell>
            </TableRow>
          )}

          {filteredStadiums.map((stadium) => {
            const usage = countStadiumUsage(stadium.id, teams, matches);

            return (
              <TableRow key={stadium.id}>
                <TableCell className="pl-4 font-medium text-foreground">{stadium.name}</TableCell>
                <TableCell>{stadium.city ?? "—"}</TableCell>
                <TableCell
                  className="max-w-48 truncate text-muted-foreground"
                  title={stadium.address ?? undefined}
                >
                  {stadium.address ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {stadium.capacity?.toLocaleString("pl-PL") ?? "—"}
                </TableCell>
                <TableCell>
                  {stadium.latitude !== null && stadium.longitude !== null ? (
                    <span className="text-muted-foreground tabular-nums">
                      {stadium.latitude.toFixed(4)}, {stadium.longitude.toFixed(4)}
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-destructive">
                      brak
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{usage.teams}</TableCell>
                <TableCell className="text-right tabular-nums">{usage.matches}</TableCell>
                <TableCell className="pr-4">
                  <RowActions
                    onEdit={() => dialogs.openEditor(stadium)}
                    onDelete={() => dialogs.openDelete(stadium)}
                    deleteBlockedReason={describeUsage(usage)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {dialogs.isEditorOpen && (
        <StadiumDialog
          stadium={dialogs.edited}
          error={saveStadium.error ? toUserMessage(saveStadium.error) : null}
          isSaving={saveStadium.isPending}
          onSubmit={(input) =>
            saveStadium.mutate(
              { id: dialogs.edited?.id ?? null, input },
              { onSuccess: dialogs.closeEditor },
            )
          }
          onClose={dialogs.closeEditor}
        />
      )}

      {dialogs.deleting && (
        <ConfirmDeleteDialog
          title="Usunąć stadion?"
          description={`Stadion ${dialogs.deleting.name} zostanie trwale usunięty.`}
          error={deleteStadium.error ? toUserMessage(deleteStadium.error) : null}
          isDeleting={deleteStadium.isPending}
          onConfirm={() =>
            deleteStadium.mutate(dialogs.deleting!.id, { onSuccess: dialogs.closeDelete })
          }
          onClose={dialogs.closeDelete}
        />
      )}
    </AdminTableCard>
  );
};

export default StadiumsCard;
