import { useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";

import type { Role, UserAccount } from "@/data/types";
import type { useDeleteUser, useSaveUser } from "@/hooks/useAdminMutations";
import { useCrudDialogs } from "@/hooks/useCrudDialogs";
import { getFormatedDate } from "@/lib/date";
import { filterUsersByEmail } from "@/lib/search";
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
import UserDialog from "@/components/admin/UserDialog";

interface UsersCardProps {
  users: UserAccount[];
  roles: Role[];
  currentUserId: number;
  isPending: boolean;
  isError: boolean;
  saveUser: ReturnType<typeof useSaveUser>;
  deleteUser: ReturnType<typeof useDeleteUser>;
  className?: string;
}

const UsersCard = ({
  users,
  roles,
  currentUserId,
  isPending,
  isError,
  saveUser,
  deleteUser,
  className,
}: UsersCardProps) => {
  const [search, setSearch] = useState("");
  const dialogs = useCrudDialogs<UserAccount>(saveUser, deleteUser);

  const filteredUsers = useMemo(() => filterUsersByEmail(users, search), [users, search]);

  return (
    <AdminTableCard
      className={className}
      icon={Users}
      title="Użytkownicy"
      description={`Pokazano ${filteredUsers.length} z ${users.length} kont`}
      actions={
        <>
          <Input
            placeholder="Szukaj po emailu"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-8 w-56"
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
      errorText="Nie udało się pobrać użytkowników"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Email</TableHead>
            <TableHead>Rola</TableHead>
            <TableHead>Utworzono</TableHead>
            <TableHead className="pr-4 text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                Brak użytkowników spełniających kryteria.
              </TableCell>
            </TableRow>
          )}

          {filteredUsers.map((user) => {
            const isOwnAccount = user.id === currentUserId;

            return (
              <TableRow key={user.id}>
                <TableCell className="pl-4 font-medium text-foreground">
                  {user.email}
                  {isOwnAccount && (
                    <span className="ml-2 text-xs text-muted-foreground">(Ty)</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.role ? (
                    <Badge variant="secondary">{user.role.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">brak roli</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getFormatedDate(user.created_at)}
                </TableCell>
                <TableCell className="pr-4">
                  <RowActions
                    onEdit={() => dialogs.openEditor(user)}
                    onDelete={() => dialogs.openDelete(user)}
                    deleteBlockedReason={isOwnAccount ? "To Twoje konto" : null}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {dialogs.isEditorOpen && (
        <UserDialog
          user={dialogs.edited}
          roles={roles}
          isOwnAccount={dialogs.edited?.id === currentUserId}
          error={saveUser.error ? toUserMessage(saveUser.error) : null}
          isSaving={saveUser.isPending}
          onSubmit={(input) =>
            saveUser.mutate(
              { id: dialogs.edited?.id ?? null, input },
              { onSuccess: dialogs.closeEditor },
            )
          }
          onClose={dialogs.closeEditor}
        />
      )}

      {dialogs.deleting && (
        <ConfirmDeleteDialog
          title="Usunąć użytkownika?"
          description={`Konto ${dialogs.deleting.email} zostanie trwale usunięte.`}
          error={deleteUser.error ? toUserMessage(deleteUser.error) : null}
          isDeleting={deleteUser.isPending}
          onConfirm={() =>
            deleteUser.mutate(dialogs.deleting!.id, { onSuccess: dialogs.closeDelete })
          }
          onClose={dialogs.closeDelete}
        />
      )}
    </AdminTableCard>
  );
};

export default UsersCard;
