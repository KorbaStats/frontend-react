import { Plus, ShieldCheck } from "lucide-react";

import type { Permission, Role } from "@/data/types";
import type { useDeleteRole, useSaveRole } from "@/hooks/useAdminMutations";
import { getPermissionLabel } from "@/lib/permissionLabels";
import { useCrudDialogs } from "@/hooks/useCrudDialogs";
import { toUserMessage } from "@/services/http";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import RowActions from "@/components/admin/RowActions";
import RoleDialog from "@/components/admin/RoleDialog";

interface RolesCardProps {
  roles: Role[];
  permissions: Permission[];
  currentRoleName: string | null;
  isPending: boolean;
  isError: boolean;
  saveRole: ReturnType<typeof useSaveRole>;
  deleteRole: ReturnType<typeof useDeleteRole>;
  className?: string;
}

const RolesCard = ({
  roles,
  permissions,
  currentRoleName,
  isPending,
  isError,
  saveRole,
  deleteRole,
  className,
}: RolesCardProps) => {
  const dialogs = useCrudDialogs<Role>(saveRole, deleteRole);

  return (
    <Card className={className}>
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Role
        </CardTitle>
        <CardDescription>Zestawy uprawnień nadawane użytkownikom</CardDescription>
        <CardAction>
          <Button size="sm" onClick={() => dialogs.openEditor("new")} disabled={isPending || isError}>
            <Plus />
            Dodaj
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {isPending && <p className="py-10 text-center text-muted-foreground">Ładowanie...</p>}

        {isError && (
          <p className="py-10 text-center text-muted-foreground">Nie udało się pobrać ról</p>
        )}

        {!isPending && !isError && (
          <ul className="flex flex-col divide-y">
            {roles.length === 0 && (
              <li className="py-10 text-center text-muted-foreground">Brak ról.</li>
            )}

            {roles.map((role) => {
              const isOwnRole = role.name === currentRoleName;

              return (
                <li key={role.id} className="flex items-start justify-between gap-2 py-3">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="font-medium text-foreground">
                      {role.name}
                      {isOwnRole && (
                        <span className="ml-2 text-xs text-muted-foreground">(Twoja)</span>
                      )}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.length === 0 && (
                        <span className="text-xs text-muted-foreground">brak uprawnień</span>
                      )}
                      {role.permissions.map((permission) => (
                        <Badge key={permission.id} variant="outline">
                          {getPermissionLabel(permission.name)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <RowActions
                    onEdit={() => dialogs.openEditor(role)}
                    onDelete={() => dialogs.openDelete(role)}
                    deleteBlockedReason={isOwnRole ? "To Twoja rola" : null}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      {dialogs.isEditorOpen && (
        <RoleDialog
          role={dialogs.edited}
          permissions={permissions}
          error={saveRole.error ? toUserMessage(saveRole.error) : null}
          isSaving={saveRole.isPending}
          onSubmit={(input) =>
            saveRole.mutate(
              { id: dialogs.edited?.id ?? null, input },
              { onSuccess: dialogs.closeEditor },
            )
          }
          onClose={dialogs.closeEditor}
        />
      )}

      {dialogs.deleting && (
        <ConfirmDeleteDialog
          title="Usunąć rolę?"
          description={`Rola ${dialogs.deleting.name} zostanie usunięta, a użytkownicy z tą rolą zostaną bez roli.`}
          error={deleteRole.error ? toUserMessage(deleteRole.error) : null}
          isDeleting={deleteRole.isPending}
          onConfirm={() =>
            deleteRole.mutate(dialogs.deleting!.id, { onSuccess: dialogs.closeDelete })
          }
          onClose={dialogs.closeDelete}
        />
      )}
    </Card>
  );
};

export default RolesCard;
