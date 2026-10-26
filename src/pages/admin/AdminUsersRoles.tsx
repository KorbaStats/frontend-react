import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router";

import type { Permission, Role, UserAccount } from "@/data/types";
import { useAuth } from "@/hooks/useAuth";
import { permissionsOptions, rolesOptions, usersOptions } from "@/hooks/queries";
import {
  useDeleteRole,
  useDeleteUser,
  useSaveRole,
  useSaveUser,
} from "@/hooks/useAdminMutations";
import { getAdminHome, hasPermission } from "@/lib/adminAccess";

import RolesCard from "@/components/admin/RolesCard";
import UsersCard from "@/components/admin/UsersCard";

const EMPTY_USERS: UserAccount[] = [];
const EMPTY_ROLES: Role[] = [];
const EMPTY_PERMISSIONS: Permission[] = [];

const AdminUsersRoles = () => {
  const { user } = useAuth();
  const canManageUsers = hasPermission(user, "users");
  const canManageRoles = hasPermission(user, "roles");

  const usersQuery = useQuery({ ...usersOptions, enabled: canManageUsers });
  const rolesQuery = useQuery(rolesOptions);
  const permissionsQuery = useQuery({ ...permissionsOptions, enabled: canManageRoles });

  const saveUser = useSaveUser();
  const deleteUser = useDeleteUser();
  const saveRole = useSaveRole();
  const deleteRole = useDeleteRole();

  if (!user) return null;
  if (!canManageUsers && !canManageRoles) return <Navigate to={getAdminHome(user)} replace />;

  const roles = rolesQuery.data ?? EMPTY_ROLES;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      {canManageUsers && (
        <UsersCard
          className={canManageRoles ? "lg:col-span-2" : "lg:col-span-3"}
          users={usersQuery.data ?? EMPTY_USERS}
          roles={roles}
          currentUserId={user.id}
          isPending={usersQuery.isPending || rolesQuery.isPending}
          isError={usersQuery.isError || rolesQuery.isError}
          saveUser={saveUser}
          deleteUser={deleteUser}
        />
      )}

      {canManageRoles && (
        <RolesCard
          className={canManageUsers ? undefined : "lg:col-span-3"}
          roles={roles}
          permissions={permissionsQuery.data ?? EMPTY_PERMISSIONS}
          currentRoleName={user.role}
          isPending={rolesQuery.isPending || permissionsQuery.isPending}
          isError={rolesQuery.isError || permissionsQuery.isError}
          saveRole={saveRole}
          deleteRole={deleteRole}
        />
      )}
    </div>
  );
};

export default AdminUsersRoles;
