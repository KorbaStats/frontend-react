import { useState } from "react";

import type { Role, UserAccount, UserAccountInput } from "@/data/types";
import { hasFieldErrors, validateUserForm } from "@/lib/authValidation";
import type { AuthFieldErrors } from "@/lib/authValidation";
import { fromIdValue, toIdOptions, toIdValue } from "@/lib/adminData";

import FormDialog from "@/components/admin/FormDialog";
import { FormField, TextField } from "@/components/admin/FormField";
import OptionSelect from "@/components/admin/OptionSelect";

interface UserDialogProps {
  user: UserAccount | null;
  roles: Role[];
  isOwnAccount: boolean;
  error: string | null;
  isSaving: boolean;
  onSubmit: (input: UserAccountInput) => void;
  onClose: () => void;
}

const UserDialog = ({
  user,
  roles,
  isOwnAccount,
  error,
  isSaving,
  onSubmit,
  onClose,
}: UserDialogProps) => {
  const isNew = user === null;

  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(toIdValue(user?.role_id));
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});

  const handleSubmit = () => {
    const errors = validateUserForm({ email, password, isNew });
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    onSubmit({
      email: email.trim(),
      ...(password && { password }),
      ...(!isOwnAccount && { role_id: fromIdValue(roleId) }),
    });
  };

  return (
    <FormDialog
      title={isNew ? "Dodaj użytkownika" : "Edytuj użytkownika"}
      description={isNew ? "Nowe konto z wybraną rolą" : user.email}
      error={error}
      isSaving={isSaving}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <TextField
        id="user-email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        error={fieldErrors.email}
      />
      <TextField
        id="user-password"
        label="Hasło"
        type="password"
        value={password}
        onChange={setPassword}
        error={fieldErrors.password}
        description={isNew ? "Minimum 8 znaków" : "Zostaw puste, żeby nie zmieniać"}
      />
      <FormField
        id="user-role"
        label="Rola"
        description={
          isOwnAccount
            ? "Nie możesz zmienić własnej roli, żeby nie stracić dostępu do panelu"
            : undefined
        }
      >
        <OptionSelect
          id="user-role"
          value={roleId}
          onChange={setRoleId}
          options={toIdOptions(roles, "Brak roli")}
          disabled={isOwnAccount}
        />
      </FormField>
    </FormDialog>
  );
};

export default UserDialog;
