import { useState } from "react";

type Resettable = { reset: () => void };

export function useCrudDialogs<T>(save: Resettable, remove: Resettable) {
  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);

  return {
    isEditorOpen: editing !== null,
    edited: editing === "new" ? null : editing,
    openEditor: (item: T | "new") => {
      save.reset();
      setEditing(item);
    },
    closeEditor: () => setEditing(null),
    deleting,
    openDelete: (item: T) => {
      remove.reset();
      setDeleting(item);
    },
    closeDelete: () => setDeleting(null),
  };
}
