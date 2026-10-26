import { useState } from "react";

import type { Permission, Role, RoleInput } from "@/data/types";
import { getPermissionLabel } from "@/lib/permissionLabels";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import FormDialog from "@/components/admin/FormDialog";
import { TextField } from "@/components/admin/FormField";

interface RoleDialogProps {
  role: Role | null;
  permissions: Permission[];
  error: string | null;
  isSaving: boolean;
  onSubmit: (input: RoleInput) => void;
  onClose: () => void;
}

const RoleDialog = ({
  role,
  permissions,
  error,
  isSaving,
  onSubmit,
  onClose,
}: RoleDialogProps) => {
  const [name, setName] = useState(role?.name ?? "");
  const [permissionIds, setPermissionIds] = useState<number[]>(
    role?.permissions.map((permission) => permission.id) ?? [],
  );
  const [nameError, setNameError] = useState<string>();

  const togglePermission = (id: number, checked: boolean) =>
    setPermissionIds((ids) => (checked ? [...ids, id] : ids.filter((other) => other !== id)));

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError("Podaj nazwę roli");
      return;
    }
    setNameError(undefined);

    onSubmit({ name: name.trim(), permission_ids: permissionIds });
  };

  return (
    <FormDialog
      title={role === null ? "Dodaj rolę" : "Edytuj rolę"}
      description="Uprawnienia decydują, które części panelu widzi użytkownik z tą rolą"
      error={error}
      isSaving={isSaving}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <TextField id="role-name" label="Nazwa" value={name} onChange={setName} error={nameError} />

      <FieldSet>
        <FieldLegend variant="label">Uprawnienia</FieldLegend>
        <div className="grid grid-cols-2 gap-3">
          {permissions.map((permission) => (
            <Field key={permission.id} orientation="horizontal">
              <Checkbox
                id={`permission-${permission.id}`}
                checked={permissionIds.includes(permission.id)}
                onCheckedChange={(checked) => togglePermission(permission.id, checked === true)}
              />
              <FieldLabel htmlFor={`permission-${permission.id}`} className="font-normal">
                {getPermissionLabel(permission.name)}
              </FieldLabel>
            </Field>
          ))}
        </div>
      </FieldSet>
    </FormDialog>
  );
};

export default RoleDialog;
